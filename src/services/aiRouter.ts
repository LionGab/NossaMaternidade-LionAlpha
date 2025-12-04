/**
 * AI Router Robusto - Focado em Gemini 2.5 Flash
 *
 * Estratégia de custo-benefício:
 * - 90%+ dos casos: Gemini 2.5 Flash (econômico e rápido)
 * - Crise detectada: GPT-4o (segurança primeiro)
 * - Fallback automático: Flash → GPT-4o → Claude Opus
 * - Circuit breaker: Evita custos desnecessários
 * - Retry inteligente: Apenas em falhas temporárias
 */

import { estimateCost, type LlmProfile } from '@/ai/llmConfig';
import { CrisisDetectionService } from '@/ai/moderation/CrisisDetectionService';
import type { AIModel, AIContext, ChatAIResponse } from '@/types/ai';
import { logger } from '@/utils/logger';

/**
 * Configuração do router
 */
interface RouterConfig {
  // Modelo padrão (90%+ dos casos)
  defaultModel: AIModel;

  // Modelo para crise (segurança)
  crisisModel: AIModel;

  // Fallback chain
  fallbackChain: AIModel[];

  // Circuit breaker: após N falhas, pausar tentativas
  circuitBreakerThreshold: number;

  // Retry: número máximo de tentativas
  maxRetries: number;

  // Timeout por tentativa (ms)
  timeoutMs: number;
}

/**
 * Estado do circuit breaker por modelo
 */
interface CircuitBreakerState {
  failures: number;
  lastFailureTime: number;
  isOpen: boolean; // true = circuit aberto (não tentar)
}

/**
 * Router de IA robusto e econômico
 */
class AIRouter {
  private config: RouterConfig = {
    defaultModel: 'gemini-1.5-flash',
    crisisModel: 'gpt-4o',
    fallbackChain: ['gemini-1.5-flash', 'gpt-4o', 'claude-opus'],
    circuitBreakerThreshold: 5, // Após 5 falhas, pausar por 5min
    maxRetries: 2,
    timeoutMs: 30000, // 30s timeout
  };

  private circuitBreakers: Map<AIModel, CircuitBreakerState> = new Map();
  private costTracker: Map<AIModel, number> = new Map(); // Custo acumulado por modelo

  /**
   * Roteia mensagem para o modelo adequado com fallback automático
   */
  async route(
    message: string,
    context: AIContext,
    callAI: (model: AIModel, msg: string, ctx: AIContext) => Promise<ChatAIResponse>
  ): Promise<ChatAIResponse> {
    const startTime = Date.now();

    // 1. Detectar crise (rápido, sync)
    const crisisCheck = CrisisDetectionService.detectCrisisSync(message);
    const isCrisis = crisisCheck.isCrisis || crisisCheck.shouldUseCrisisSafeModel;

    // 2. Escolher modelo inicial
    const primaryModel = isCrisis ? this.config.crisisModel : this.config.defaultModel;

    logger.info('[AIRouter] Roteamento iniciado', {
      messageLength: message.length,
      isCrisis,
      primaryModel,
      userId: context.user_id,
    });

    // 3. Tentar com fallback automático
    const modelsToTry = this.buildFallbackChain(primaryModel, isCrisis);

    for (const model of modelsToTry) {
      // Verificar circuit breaker
      if (this.isCircuitOpen(model)) {
        logger.warn('[AIRouter] Circuit breaker aberto para modelo', { model });
        continue;
      }

      try {
        // Tentar chamar IA com timeout
        const response = (await Promise.race([
          callAI(model, message, context),
          this.createTimeout(this.config.timeoutMs),
        ])) as ChatAIResponse;

        // Sucesso!
        const duration = Date.now() - startTime;
        this.recordSuccess(model);
        this.trackCost(model, response.tokens_used || 0);

        logger.info('[AIRouter] Resposta obtida com sucesso', {
          model,
          duration,
          tokens: response.tokens_used,
          cost: this.estimateCostForResponse(model, response.tokens_used || 0),
        });

        return {
          ...response,
          model_used: model,
          response_time_ms: duration,
        };
      } catch (error) {
        // Falha - tentar próximo modelo
        this.recordFailure(model);
        logger.warn('[AIRouter] Modelo falhou, tentando próximo', {
          model,
          error: error instanceof Error ? error.message : String(error),
          nextModel: modelsToTry[modelsToTry.indexOf(model) + 1],
        });
        continue;
      }
    }

    // Todos os modelos falharam
    const duration = Date.now() - startTime;
    logger.error('[AIRouter] Todos os modelos falharam', {
      duration,
      modelsTried: modelsToTry.length,
    });

    return {
      success: false,
      message:
        'Desculpe, estou com dificuldades técnicas no momento. Pode tentar novamente em instantes?',
      error: 'Todos os modelos de IA falharam',
      response_time_ms: duration,
    };
  }

  /**
   * Constrói chain de fallback baseado no modelo primário
   */
  private buildFallbackChain(_primaryModel: AIModel, isCrisis: boolean): AIModel[] {
    // Se crise, começar com GPT-4o, depois Flash como fallback
    if (isCrisis) {
      return ['gpt-4o', 'gemini-1.5-flash', 'claude-opus'];
    }

    // Padrão: Flash primeiro, depois fallbacks
    const flashIndex = this.config.fallbackChain.indexOf('gemini-1.5-flash');
    if (flashIndex === -1) {
      return this.config.fallbackChain;
    }

    // Reordenar para Flash primeiro
    const chain = [...this.config.fallbackChain];
    const flash = chain.splice(flashIndex, 1)[0];
    return [flash, ...chain];
  }

  /**
   * Verifica se circuit breaker está aberto para um modelo
   */
  private isCircuitOpen(model: AIModel): boolean {
    const state = this.circuitBreakers.get(model);
    if (!state) return false;

    // Se circuit está aberto, verificar se já passou tempo suficiente (5min)
    if (state.isOpen) {
      const timeSinceLastFailure = Date.now() - state.lastFailureTime;
      const cooldownMs = 5 * 60 * 1000; // 5 minutos

      if (timeSinceLastFailure > cooldownMs) {
        // Reset circuit breaker
        this.circuitBreakers.set(model, {
          failures: 0,
          lastFailureTime: 0,
          isOpen: false,
        });
        logger.info('[AIRouter] Circuit breaker resetado', { model });
        return false;
      }

      return true;
    }

    return false;
  }

  /**
   * Registra sucesso (reset circuit breaker)
   */
  private recordSuccess(model: AIModel): void {
    this.circuitBreakers.set(model, {
      failures: 0,
      lastFailureTime: 0,
      isOpen: false,
    });
  }

  /**
   * Registra falha (incrementa circuit breaker)
   */
  private recordFailure(model: AIModel): void {
    const current = this.circuitBreakers.get(model) || {
      failures: 0,
      lastFailureTime: 0,
      isOpen: false,
    };

    const newState: CircuitBreakerState = {
      failures: current.failures + 1,
      lastFailureTime: Date.now(),
      isOpen: current.failures + 1 >= this.config.circuitBreakerThreshold,
    };

    this.circuitBreakers.set(model, newState);

    if (newState.isOpen) {
      logger.warn('[AIRouter] Circuit breaker aberto', {
        model,
        failures: newState.failures,
      });
    }
  }

  /**
   * Cria promise que rejeita após timeout
   */
  private createTimeout(ms: number): Promise<never> {
    return new Promise((_, reject) => {
      setTimeout(() => reject(new Error(`Timeout após ${ms}ms`)), ms);
    });
  }

  /**
   * Rastreia custo acumulado por modelo
   */
  private trackCost(model: AIModel, tokens: number): void {
    const current = this.costTracker.get(model) || 0;
    const cost = this.estimateCostForResponse(model, tokens);
    this.costTracker.set(model, current + cost);
  }

  /**
   * Estima custo de uma resposta
   */
  private estimateCostForResponse(model: AIModel, tokens: number): number {
    // Mapear AIModel para LlmProfile
    const profileMap: Record<AIModel, LlmProfile> = {
      'gemini-1.5-flash': 'CHAT_DEFAULT',
      'gemini-1.5-pro': 'ANALYSIS_DEEP',
      'gpt-4o': 'CRISIS_SAFE',
      'gpt-4-turbo': 'CRISIS_SAFE',
      'claude-opus': 'AGENT_MAX',
      'claude-sonnet': 'AGENT_MAX',
    };

    const profile = profileMap[model] || 'CHAT_DEFAULT';

    // Estimar: 70% input, 30% output (aproximação)
    const inputTokens = Math.floor(tokens * 0.7);
    const outputTokens = Math.floor(tokens * 0.3);

    return estimateCost(profile, inputTokens, outputTokens);
  }

  /**
   * Obtém estatísticas de uso e custo
   */
  getStats(): {
    costs: Record<AIModel, number>;
    circuitBreakers: Record<AIModel, CircuitBreakerState>;
  } {
    return {
      costs: Object.fromEntries(this.costTracker) as Record<AIModel, number>,
      circuitBreakers: Object.fromEntries(this.circuitBreakers) as Record<
        AIModel,
        CircuitBreakerState
      >,
    };
  }

  /**
   * Reseta estatísticas
   */
  resetStats(): void {
    this.costTracker.clear();
    this.circuitBreakers.clear();
    logger.info('[AIRouter] Estatísticas resetadas');
  }
}

export const aiRouter = new AIRouter();
