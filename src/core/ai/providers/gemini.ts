/**
 * Gemini Provider - Google AI Integration
 *
 * ⚠️ DEPRECATED: Este provider não deve mais usar EXPO_PUBLIC_GEMINI_API_KEY
 * A API key do Gemini agora está segura na Edge Function (supabase/functions/chat-gemini)
 * Use supabase.functions.invoke('chat-gemini') em vez deste provider
 */

import { logger } from '@/utils/logger';

import type { AIMessage, AIResponse, AIConfig, AIError } from '../types';

/**
 * Chama API do Gemini
 * ⚠️ DEPRECATED: Use Edge Function chat-gemini em vez deste provider
 */
export async function callGemini(_messages: AIMessage[], _config: AIConfig): Promise<AIResponse> {
  // ⚠️ DEPRECATED: Este provider não deve mais usar EXPO_PUBLIC_GEMINI_API_KEY
  // A API key do Gemini agora está segura na Edge Function (supabase/functions/chat-gemini)
  // Use supabase.functions.invoke('chat-gemini') em vez deste provider

  logger.warn(
    '[Gemini] callGemini está deprecated. Use Edge Function chat-gemini via supabase.functions.invoke()'
  );

  const aiError: AIError = {
    provider: 'gemini',
    message:
      'callGemini está deprecated. Use Edge Function chat-gemini via supabase.functions.invoke() em vez de API key direta.',
    originalError: new Error('Provider deprecated'),
  };

  throw aiError;

  // Código antigo (removido para segurança):
  // - Usava process.env.EXPO_PUBLIC_GEMINI_API_KEY (exposição de chave no bundle)
  // - Usava GoogleGenerativeAI diretamente do cliente
  // - Migrar para: supabase.functions.invoke('chat-gemini', { body: { messages, systemPrompt } })
}
