/**
 * AI Client - Cliente unificado para chamadas de IA
 * Integra com Gemini, OpenAI e Claude através de Edge Functions
 */

import { resolveModel, type LlmProfile } from '@/ai/llmConfig';
import type { AIModel, AIContext, ChatAIResponse } from '@/types/ai';
import { logger } from '@/utils/logger';

import { supabase } from './supabase';

/**
 * Cliente unificado para chamadas de IA
 */
class AIClient {
  /**
   * Chama modelo de IA via Edge Function
   */
  async call(
    model: AIModel,
    message: string,
    context: AIContext,
    history: Array<{ role: 'user' | 'assistant'; text: string }> = [],
    tools?: unknown[]
  ): Promise<ChatAIResponse> {
    const startTime = Date.now();
    const profile = this.modelToProfile(model);
    const config = resolveModel(profile);

    try {
      logger.info('[AIClient] Chamando IA', {
        model,
        profile,
        provider: config.provider,
        messageLength: message.length,
        hasHistory: history.length > 0,
        hasTools: tools && tools.length > 0,
      });

      // Mapear para Edge Function apropriada
      const edgeFunction = this.getEdgeFunction(config.provider);

      // Preparar payload
      const payload = {
        message,
        history: history.map((h) => ({
          role: h.role === 'user' ? 'user' : 'model',
          parts: [{ text: h.text }],
        })),
        model: config.modelName,
        temperature: config.temperature,
        maxTokens: config.maxTokens,
        context: {
          user_id: context.user_id,
          name: context.name,
          phase: context.phase,
          pregnancy_week: context.pregnancy_week,
        },
        tools: tools || undefined,
      };

      // Chamar Edge Function
      const { data, error } = await supabase.functions.invoke(edgeFunction, {
        body: payload,
      });

      if (error) {
        throw new Error(`Edge function error: ${error.message}`);
      }

      if (!data) {
        throw new Error('Resposta vazia da Edge Function');
      }

      // Verificar se há tool call
      if (data.tool_call) {
        return {
          success: true,
          message: '',
          tool_call: data.tool_call,
          model_used: model,
          response_time_ms: Date.now() - startTime,
        };
      }

      // Resposta normal
      const response: ChatAIResponse = {
        success: true,
        message: data.text || data.message || '',
        model_used: model,
        tokens_used: data.tokens_used || this.estimateTokens(message, data.text || ''),
        response_time_ms: Date.now() - startTime,
        contains_crisis: data.contains_crisis || false,
      };

      return response;
    } catch (error) {
      logger.error('[AIClient] Erro ao chamar IA', error, {
        model,
        provider: config.provider,
      });

      throw error;
    }
  }

  /**
   * Mapeia AIModel para LlmProfile
   */
  private modelToProfile(model: AIModel): LlmProfile {
    const map: Record<AIModel, LlmProfile> = {
      'gemini-1.5-flash': 'CHAT_DEFAULT',
      'gemini-1.5-pro': 'ANALYSIS_DEEP',
      'gpt-4o': 'CRISIS_SAFE',
      'gpt-4-turbo': 'CRISIS_SAFE',
      'claude-opus': 'AGENT_MAX',
      'claude-sonnet': 'AGENT_MAX',
    };

    return map[model] || 'CHAT_DEFAULT';
  }

  /**
   * Obtém nome da Edge Function baseado no provider
   */
  private getEdgeFunction(provider: 'gemini' | 'openai' | 'anthropic'): string {
    const map = {
      gemini: 'chat-ai',
      openai: 'chat-ai-openai',
      anthropic: 'chat-ai-claude',
    };

    return map[provider] || 'chat-ai';
  }

  /**
   * Estima número de tokens (aproximação simples)
   */
  private estimateTokens(text: string, response?: string): number {
    // Aproximação: 1 token ≈ 4 caracteres (português)
    const inputTokens = Math.ceil(text.length / 4);
    const outputTokens = response ? Math.ceil(response.length / 4) : 0;
    return inputTokens + outputTokens;
  }
}

export const aiClient = new AIClient();
