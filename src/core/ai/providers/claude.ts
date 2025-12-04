/**
 * Claude Provider - Anthropic Integration
 *
 * Provider para Anthropic Claude API
 */

import Anthropic from '@anthropic-ai/sdk';

import { logger } from '@/utils/logger';

import type { AIMessage, AIResponse, AIConfig, AIError } from '../types';

// Modelo default
const DEFAULT_MODEL = 'claude-3-5-sonnet-20241022';

/**
 * Converte mensagens para formato do Claude
 * Filtra mensagens que não são suportadas
 */
function convertMessages(messages: AIMessage[]): Anthropic.MessageParam[] {
  return messages
    .filter((m) => m.role !== 'system') // System prompts são tratados separadamente
    .filter((m) => m.content && m.content.trim().length > 0) // Filtrar mensagens vazias
    .map((msg) => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
    }));
}

/**
 * Chama API do Claude
 */
export async function callClaude(messages: AIMessage[], config: AIConfig): Promise<AIResponse> {
  const startTime = Date.now();

  try {
    // Obter API key
    const apiKey = process.env.EXPO_PUBLIC_CLAUDE_API_KEY;

    if (!apiKey) {
      throw new Error('EXPO_PUBLIC_CLAUDE_API_KEY não configurada');
    }

    // Inicializar cliente
    const anthropic = new Anthropic({
      apiKey,
    });

    // Extrair system prompt
    const systemPrompt = messages.find((m) => m.role === 'system')?.content || config.systemPrompt;

    // Converter mensagens
    const claudeMessages = convertMessages(messages);

    // Fazer request
    const response = await anthropic.messages.create({
      model: config.model || DEFAULT_MODEL,
      max_tokens: config.maxTokens ?? 4096,
      temperature: config.temperature ?? 0.7,
      system: systemPrompt,
      messages: claudeMessages,
    });

    const latency = Date.now() - startTime;

    // Extrair conteúdo
    const content = response.content
      .filter((block) => block.type === 'text')
      .map((block) => (block as Anthropic.TextBlock).text)
      .join('\n');

    // Tokens
    const tokens = {
      prompt: response.usage.input_tokens,
      completion: response.usage.output_tokens,
      total: response.usage.input_tokens + response.usage.output_tokens,
    };

    logger.info('[Claude] Resposta recebida', {
      model: config.model || DEFAULT_MODEL,
      latency,
      tokens: tokens.total,
    });

    return {
      content,
      provider: 'claude',
      model: config.model || DEFAULT_MODEL,
      tokens,
      latency,
      finishReason: response.stop_reason ?? undefined,
    };
  } catch (error) {
    const latency = Date.now() - startTime;

    logger.error('[Claude] Erro ao chamar API', error, {
      model: config.model || DEFAULT_MODEL,
      latency,
    });

    const aiError: AIError = {
      provider: 'claude',
      message: error instanceof Error ? error.message : 'Erro desconhecido',
      statusCode: error instanceof Anthropic.APIError ? error.status : undefined,
      originalError: error,
    };

    throw aiError;
  }
}
