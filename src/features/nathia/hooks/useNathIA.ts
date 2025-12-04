/**
 * useNathIA Hook - Chat com Assistente Virtual NathIA
 *
 * Hook para interagir com a NathIA usando o AI Gateway
 */

import { useState, useCallback, useRef } from 'react';

import { aiGateway, type AIMessage } from '@/core/ai';
import { logger } from '@/utils/logger';

import { NATHIA_SYSTEM_PROMPT, getNathIAContextPrompt } from '../constants/systemPrompt';

interface UseNathIAOptions {
  weekOfPregnancy?: number;
  trimester?: number;
  isHighRisk?: boolean;
}

interface UseNathIAResult {
  messages: AIMessage[];
  loading: boolean;
  error: string | null;
  sendMessage: (content: string) => Promise<void>;
  clearHistory: () => void;
  retryLastMessage: () => Promise<void>;
}

export function useNathIA(options: UseNathIAOptions = {}): UseNathIAResult {
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lastUserMessage = useRef<string | null>(null);

  /**
   * Cria system prompt com contexto
   */
  const getSystemPrompt = useCallback((): string => {
    let prompt = NATHIA_SYSTEM_PROMPT;

    const contextPrompt = getNathIAContextPrompt({
      weekOfPregnancy: options.weekOfPregnancy,
      trimester: options.trimester,
      isHighRisk: options.isHighRisk,
    });

    if (contextPrompt) {
      prompt += contextPrompt;
    }

    return prompt;
  }, [options.weekOfPregnancy, options.trimester, options.isHighRisk]);

  /**
   * Envia mensagem para NathIA
   */
  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim()) {
        return;
      }

      setLoading(true);
      setError(null);
      lastUserMessage.current = content;

      // Adicionar mensagem do usuário
      const userMessage: AIMessage = {
        role: 'user',
        content: content.trim(),
      };

      setMessages((prev) => [...prev, userMessage]);

      try {
        // Preparar mensagens com system prompt
        const systemMessage: AIMessage = {
          role: 'system',
          content: getSystemPrompt(),
        };

        const allMessages: AIMessage[] = [systemMessage, ...messages, userMessage];

        // Chamar AI Gateway
        const response = await aiGateway.chat(allMessages, {
          temperature: 0.8, // Mais criativa para conversação natural
          maxTokens: 1024, // Respostas concisas para mobile
        });

        // Adicionar resposta da NathIA
        const assistantMessage: AIMessage = {
          role: 'assistant',
          content: response.content,
        };

        setMessages((prev) => [...prev, assistantMessage]);

        logger.info('[useNathIA] Mensagem enviada com sucesso', {
          provider: response.provider,
          model: response.model,
          latency: response.latency,
          tokens: response.tokens?.total,
        });
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erro ao enviar mensagem';
        setError(errorMessage);

        logger.error('[useNathIA] Erro ao enviar mensagem', err);

        // Adicionar mensagem de erro amigável
        const errorAssistantMessage: AIMessage = {
          role: 'assistant',
          content: 'Desculpe, tive um problema ao processar sua mensagem 😔 Pode tentar novamente?',
        };

        setMessages((prev) => [...prev, errorAssistantMessage]);
      } finally {
        setLoading(false);
      }
    },
    [messages, getSystemPrompt]
  );

  /**
   * Tenta reenviar última mensagem
   */
  const retryLastMessage = useCallback(async () => {
    if (!lastUserMessage.current) {
      logger.warn('[useNathIA] Nenhuma mensagem para retry');
      return;
    }

    // Verificar se há pelo menos 2 mensagens para remover
    if (messages.length < 2) {
      logger.warn('[useNathIA] Histórico muito curto para retry');
      return;
    }

    // Remover últimas 2 mensagens (user + assistant com erro)
    setMessages((prev) => prev.slice(0, -2));
    await sendMessage(lastUserMessage.current);
  }, [messages.length, sendMessage]);

  /**
   * Limpa histórico de mensagens
   */
  const clearHistory = useCallback(() => {
    setMessages([]);
    setError(null);
    lastUserMessage.current = null;
    logger.info('[useNathIA] Histórico limpo');
  }, []);

  return {
    messages,
    loading,
    error,
    sendMessage,
    clearHistory,
    retryLastMessage,
  };
}
