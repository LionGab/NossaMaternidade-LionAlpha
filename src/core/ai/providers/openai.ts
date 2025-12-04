/**
 * OpenAI Provider - OpenAI Integration
 *
 * Provider para OpenAI API (GPT-4, GPT-3.5, etc)
 */

import OpenAI from 'openai';

import { logger } from '@/utils/logger';

import type { AIMessage, AIResponse, AIConfig, AIError } from '../types';

// Modelo default
const DEFAULT_MODEL = 'gpt-4o-mini';

/**
 * Converte mensagens para formato do OpenAI
 */
function convertMessages(messages: AIMessage[]): OpenAI.ChatCompletionMessageParam[] {
  return messages.map((msg) => ({
    role: msg.role,
    content: msg.content,
  }));
}

/**
 * Chama API do OpenAI
 */
export async function callOpenAI(messages: AIMessage[], config: AIConfig): Promise<AIResponse> {
  const startTime = Date.now();

  try {
    // Obter API key
    const apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY;

    if (!apiKey) {
      throw new Error('EXPO_PUBLIC_OPENAI_API_KEY não configurada');
    }

    // Inicializar cliente
    const openai = new OpenAI({
      apiKey,
    });

    // Converter mensagens
    const openaiMessages = convertMessages(messages);

    // Fazer request
    const response = await openai.chat.completions.create({
      model: config.model || DEFAULT_MODEL,
      messages: openaiMessages,
      temperature: config.temperature ?? 0.7,
      max_tokens: config.maxTokens ?? 2048,
    });

    const latency = Date.now() - startTime;

    // Extrair conteúdo
    const choice = response.choices[0];
    const content = choice.message.content ?? '';

    // Tokens
    const tokens = response.usage
      ? {
          prompt: response.usage.prompt_tokens,
          completion: response.usage.completion_tokens,
          total: response.usage.total_tokens,
        }
      : undefined;

    logger.info('[OpenAI] Resposta recebida', {
      model: config.model || DEFAULT_MODEL,
      latency,
      tokens: tokens?.total,
    });

    return {
      content,
      provider: 'openai',
      model: config.model || DEFAULT_MODEL,
      tokens,
      latency,
      finishReason: choice.finish_reason,
    };
  } catch (error) {
    const latency = Date.now() - startTime;

    logger.error('[OpenAI] Erro ao chamar API', error, {
      model: config.model || DEFAULT_MODEL,
      latency,
    });

    const aiError: AIError = {
      provider: 'openai',
      message: error instanceof Error ? error.message : 'Erro desconhecido',
      statusCode: error instanceof OpenAI.APIError ? error.status : undefined,
      code: error instanceof OpenAI.APIError ? (error.code ?? undefined) : undefined,
      originalError: error,
    };

    throw aiError;
  }
}
