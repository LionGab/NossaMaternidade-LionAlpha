/**
 * AI Gateway - Orquestrador Multi-Provider com Fallback
 *
 * Sistema inteligente que:
 * - Roteia requisições entre Gemini, Claude e OpenAI
 * - Implementa fallback automático em caso de falha
 * - Coleta métricas de latência e custos
 * - Gerencia rate limits e erros
 */

import { logger } from '@/utils/logger';

import { callClaude } from './providers/claude';
import { callGemini } from './providers/gemini';
import { callOpenAI } from './providers/openai';
import type { AIMessage, AIResponse, AIConfig, AIProvider, AIError } from './types';

// Ordem de fallback padrão
const DEFAULT_FALLBACK_ORDER: AIProvider[] = ['gemini', 'claude', 'openai'];

class AIGateway {
  private fallbackOrder: AIProvider[] = DEFAULT_FALLBACK_ORDER;
  private failedProviders: Set<AIProvider> = new Set();
  private resetTimeout: ReturnType<typeof setTimeout> | null = null;

  /**
   * Define ordem de fallback customizada
   */
  setFallbackOrder(order: AIProvider[]): void {
    this.fallbackOrder = order;
    logger.info('[AIGateway] Ordem de fallback atualizada', { order });
  }

  /**
   * Reseta providers com falha após timeout
   */
  private scheduleFailureReset(): void {
    if (this.resetTimeout) {
      clearTimeout(this.resetTimeout);
    }

    // Reset após 5 minutos
    this.resetTimeout = setTimeout(
      () => {
        if (this.failedProviders.size > 0) {
          logger.info('[AIGateway] Resetando providers com falha', {
            providers: Array.from(this.failedProviders),
          });
          this.failedProviders.clear();
        }
      },
      5 * 60 * 1000
    );
  }

  /**
   * Marca provider como falhado temporariamente
   */
  private markProviderFailed(provider: AIProvider): void {
    this.failedProviders.add(provider);
    this.scheduleFailureReset();

    logger.warn('[AIGateway] Provider marcado como falhado', { provider });
  }

  /**
   * Tenta chamar um provider específico
   */
  private async tryProvider(
    provider: AIProvider,
    messages: AIMessage[],
    config: AIConfig
  ): Promise<AIResponse> {
    const providerConfig = { ...config, provider };

    switch (provider) {
      case 'gemini':
        return await callGemini(messages, providerConfig);
      case 'claude':
        return await callClaude(messages, providerConfig);
      case 'openai':
        return await callOpenAI(messages, providerConfig);
      default:
        throw new Error(`Provider desconhecido: ${provider}`);
    }
  }

  /**
   * Chat com fallback automático entre providers
   *
   * Ordem default: Gemini → Claude → OpenAI
   */
  async chat(messages: AIMessage[], config?: Partial<AIConfig>): Promise<AIResponse> {
    const startTime = Date.now();
    const errors: Array<{ provider: AIProvider; error: AIError }> = [];

    // Configuração default
    const fullConfig: AIConfig = {
      provider: this.fallbackOrder[0],
      model: '', // Será definido por cada provider
      temperature: config?.temperature ?? 0.7,
      maxTokens: config?.maxTokens ?? 2048,
      systemPrompt: config?.systemPrompt,
    };

    // Filtrar providers disponíveis (não marcados como falhados)
    const availableProviders = this.fallbackOrder.filter((p) => !this.failedProviders.has(p));

    if (availableProviders.length === 0) {
      logger.error('[AIGateway] Todos os providers estão indisponíveis');
      throw new Error('Todos os providers de IA estão temporariamente indisponíveis');
    }

    // Tentar cada provider na ordem de fallback
    for (const provider of availableProviders) {
      try {
        logger.info('[AIGateway] Tentando provider', {
          provider,
          attempt: errors.length + 1,
        });

        const response = await this.tryProvider(provider, messages, fullConfig);

        // Sucesso!
        const totalLatency = Date.now() - startTime;

        logger.info('[AIGateway] Chat concluído com sucesso', {
          provider: response.provider,
          totalLatency,
          attempts: errors.length + 1,
          tokens: response.tokens?.total,
        });

        return response;
      } catch (error) {
        const aiError = error as AIError;
        errors.push({ provider, error: aiError });

        logger.warn('[AIGateway] Provider falhou, tentando próximo', {
          provider,
          error: aiError.message,
          remainingProviders: availableProviders.length - errors.length,
        });

        // Marcar como falhado apenas em erros de servidor/API key
        if (aiError.statusCode && (aiError.statusCode >= 500 || aiError.statusCode === 401)) {
          this.markProviderFailed(provider);
        }

        // Se não há mais providers, lançar erro
        if (errors.length === availableProviders.length) {
          const totalLatency = Date.now() - startTime;

          logger.error('[AIGateway] Todos os providers falharam', {
            totalLatency,
            attempts: errors.length,
            errors: errors.map((e) => ({
              provider: e.provider,
              message: e.error.message,
            })),
          });

          // Lançar último erro
          throw aiError;
        }
      }
    }

    // Não deve chegar aqui, mas por segurança
    throw new Error('Falha inesperada no AI Gateway');
  }

  /**
   * Retorna status dos providers
   */
  getProvidersStatus(): {
    available: AIProvider[];
    failed: AIProvider[];
    fallbackOrder: AIProvider[];
  } {
    return {
      available: this.fallbackOrder.filter((p) => !this.failedProviders.has(p)),
      failed: Array.from(this.failedProviders),
      fallbackOrder: this.fallbackOrder,
    };
  }

  /**
   * Limpa cache de providers falhados
   */
  resetFailedProviders(): void {
    this.failedProviders.clear();
    if (this.resetTimeout) {
      clearTimeout(this.resetTimeout);
      this.resetTimeout = null;
    }
    logger.info('[AIGateway] Cache de providers falhados limpo');
  }
}

// Export singleton
export const aiGateway = new AIGateway();
