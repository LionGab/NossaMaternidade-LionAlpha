import { logger } from '@/utils/logger';

import { geminiService } from './geminiService';
import { supabase } from './supabase';

export interface ChatConversation {
  id: string;
  user_id: string;
  title?: string;
  model: string;
  created_at: string;
  updated_at: string;
  last_message?: ChatMessage;
}

export interface ChatMessage {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  metadata?: Record<string, unknown>;
  created_at: string;
}

export interface CreateConversationData {
  title?: string;
  model?: string;
}

export interface SendMessageData {
  conversation_id: string;
  content: string;
  role?: 'user' | 'assistant' | 'system';
}

class ChatService {
  private async getCurrentUserId(): Promise<string | null> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user?.id || null;
  }

  /**
   * Listar conversas da usuária
   */
  async getConversations(limit = 50): Promise<ChatConversation[]> {
    try {
      const userId = await this.getCurrentUserId();
      if (!userId) return [];

      const { data, error } = await supabase
        .from('chat_conversations')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })
        .limit(limit);

      if (error) {
        logger.error('Erro ao buscar conversas', error, {
          service: 'ChatService',
          action: 'getConversations',
          userId,
          limit,
        });
        return [];
      }

      // Buscar última mensagem de cada conversa
      const conversationsWithMessages = await Promise.all(
        (data || []).map(async (conv) => {
          const lastMessage = await this.getLastMessage(conv.id);
          return { ...conv, last_message: lastMessage };
        })
      );

      return conversationsWithMessages as ChatConversation[];
    } catch (error) {
      logger.error('Erro inesperado ao buscar conversas', error, {
        service: 'ChatService',
        action: 'getConversations',
      });
      return [];
    }
  }

  /**
   * Criar nova conversa
   */
  async createConversation(data: CreateConversationData = {}): Promise<ChatConversation | null> {
    try {
      const userId = await this.getCurrentUserId();
      if (!userId) return null;

      const { data: conversation, error } = await supabase
        .from('chat_conversations')
        .insert({
          user_id: userId,
          title: data.title || 'Nova conversa',
          model: data.model || 'gemini-pro',
        })
        .select()
        .single();

      if (error) {
        logger.error('Erro ao criar conversa', error, {
          service: 'ChatService',
          action: 'createConversation',
          userId,
        });
        return null;
      }

      return conversation as ChatConversation;
    } catch (error) {
      logger.error('Erro inesperado ao criar conversa', error, {
        service: 'ChatService',
        action: 'createConversation',
      });
      return null;
    }
  }

  /**
   * Obter mensagens de uma conversa
   */
  async getMessages(conversationId: string, limit = 100): Promise<ChatMessage[]> {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })
        .limit(limit);

      if (error) {
        logger.error('Erro ao buscar mensagens', error, {
          service: 'ChatService',
          action: 'getMessages',
          conversationId,
          limit,
        });
        return [];
      }

      return (data || []) as ChatMessage[];
    } catch (error) {
      logger.error('Erro inesperado ao buscar mensagens', error, {
        service: 'ChatService',
        action: 'getMessages',
        conversationId,
      });
      return [];
    }
  }

  /**
   * Obter última mensagem de uma conversa
   */
  async getLastMessage(conversationId: string): Promise<ChatMessage | null> {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) return null;
      return data as ChatMessage;
    } catch (error) {
      return null;
    }
  }

  /**
   * Enviar mensagem
   */
  async sendMessage(messageData: SendMessageData): Promise<ChatMessage | null> {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .insert({
          conversation_id: messageData.conversation_id,
          role: messageData.role || 'user',
          content: messageData.content,
          metadata: {},
        })
        .select()
        .single();

      if (error) {
        logger.error('Erro ao enviar mensagem', error, {
          service: 'ChatService',
          action: 'sendMessage',
          conversationId: messageData.conversation_id,
        });
        return null;
      }

      // Atualizar updated_at da conversa
      await supabase
        .from('chat_conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', messageData.conversation_id);

      return data as ChatMessage;
    } catch (error) {
      logger.error('Erro inesperado ao enviar mensagem', error, {
        service: 'ChatService',
        action: 'sendMessage',
      });
      return null;
    }
  }

  /**
   * Enviar mensagem e obter resposta da IA
   */
  async sendMessageWithAI(
    conversationId: string,
    userMessage: string,
    onStream?: (chunk: string) => void
  ): Promise<{ userMsg: ChatMessage | null; aiMsg: ChatMessage | null }> {
    try {
      // Salvar mensagem do usuário
      const userMsg = await this.sendMessage({
        conversation_id: conversationId,
        content: userMessage,
        role: 'user',
      });

      if (!userMsg) {
        return { userMsg: null, aiMsg: null };
      }

      // Buscar histórico da conversa
      const messages = await this.getMessages(conversationId);

      // Chamar IA (integração com Gemini será feita depois)
      // Por enquanto, resposta placeholder
      const aiResponse = await this.getAIResponse(messages, userMessage);

      if (onStream) {
        // Simular streaming
        for (let i = 0; i < aiResponse.length; i += 10) {
          onStream(aiResponse.slice(0, i + 10));
          await new Promise((resolve) => setTimeout(resolve, 50));
        }
      }

      // Salvar resposta da IA
      const aiMsg = await this.sendMessage({
        conversation_id: conversationId,
        content: aiResponse,
        role: 'assistant',
      });

      return { userMsg, aiMsg };
    } catch (error) {
      logger.error('Erro ao enviar mensagem com IA:', error, {
        service: 'ChatService',
      });
      return { userMsg: null, aiMsg: null };
    }
  }

  /**
   * Obter resposta da IA usando geminiService diretamente
   * Simplificado para robustez - usa Edge Function do Supabase
   */
  private async getAIResponse(history: ChatMessage[], userMessage: string): Promise<string> {
    try {
      const userId = await this.getCurrentUserId();
      if (!userId) {
        return 'Desculpe, não consegui identificar você. Pode fazer login novamente?';
      }

      // Converter histórico para formato esperado pelo geminiService
      const aiHistory = history
        .filter((msg) => msg.role !== 'system')
        .slice(-20) // Últimas 20 mensagens para contexto
        .map((msg) => ({
          role: msg.role as 'user' | 'model' | 'assistant',
          text: msg.content,
        }));

      logger.info('[ChatService] Enviando mensagem para IA', {
        messageLength: userMessage.length,
        historyLength: aiHistory.length,
      });

      // Usar geminiService diretamente (mais robusto)
      const { text, error, toolCall } = await geminiService.sendMessage(
        userMessage,
        aiHistory,
        undefined, // context adicional opcional
        true // enableTools
      );

      // Se há um tool call, processar
      if (toolCall) {
        logger.info('[ChatService] Tool call recebido', { tool: toolCall.name });

        // Importar executor de tools
        try {
          const { aiToolExecutor } = await import('./aiTools');
          const toolResult = await aiToolExecutor.executeTool(toolCall, userId);

          // Obter resposta final com resultado da tool
          const { text: finalText, error: finalError } =
            await geminiService.sendMessageWithToolResult(userMessage, toolResult, aiHistory);

          if (finalError) {
            logger.warn('[ChatService] Erro no tool result', { error: finalError });
            return 'Tentei buscar essa informação, mas algo deu errado. Pode reformular sua pergunta?';
          }

          return finalText || 'Desculpe, não consegui processar completamente. Tente novamente?';
        } catch (toolError) {
          logger.warn('[ChatService] Erro ao executar tool', toolError);
          // Continuar sem a tool - pedir reformulação
          return 'Não consegui executar essa ação agora. Pode tentar de outra forma?';
        }
      }

      if (error) {
        logger.warn('[ChatService] Erro da IA:', { error });
        return error; // geminiService já retorna mensagem amigável
      }

      if (!text) {
        return 'Hmm, não consegui formular uma resposta. Pode repetir de outra forma?';
      }

      return text;
    } catch (error) {
      logger.error('[ChatService] Erro ao obter resposta da IA:', error, {
        service: 'ChatService',
      });
      return 'Ops, algo deu errado. Pode tentar novamente, querida?';
    }
  }

  /**
   * Atualizar título da conversa
   */
  async updateConversationTitle(conversationId: string, title: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('chat_conversations')
        .update({ title })
        .eq('id', conversationId);

      if (error) {
        logger.error('Erro ao atualizar título', error, {
          service: 'ChatService',
          action: 'updateConversationTitle',
          conversationId,
        });
        return false;
      }

      return true;
    } catch (error) {
      logger.error('Erro inesperado ao atualizar título', error, {
        service: 'ChatService',
        action: 'updateConversationTitle',
        conversationId,
      });
      return false;
    }
  }

  /**
   * Deletar conversa
   */
  async deleteConversation(conversationId: string): Promise<boolean> {
    try {
      const { error } = await supabase.from('chat_conversations').delete().eq('id', conversationId);

      if (error) {
        logger.error('Erro ao deletar conversa', error, {
          service: 'ChatService',
          action: 'deleteConversation',
          conversationId,
        });
        return false;
      }

      return true;
    } catch (error) {
      logger.error('Erro inesperado ao deletar conversa', error, {
        service: 'ChatService',
        action: 'deleteConversation',
        conversationId,
      });
      return false;
    }
  }

  /**
   * Deletar mensagem
   */
  async deleteMessage(messageId: string): Promise<boolean> {
    try {
      const { error } = await supabase.from('chat_messages').delete().eq('id', messageId);

      if (error) {
        logger.error('Erro ao deletar mensagem', error, {
          service: 'ChatService',
          action: 'deleteMessage',
          messageId,
        });
        return false;
      }

      return true;
    } catch (error) {
      logger.error('Erro inesperado ao deletar mensagem', error, {
        service: 'ChatService',
        action: 'deleteMessage',
        messageId,
      });
      return false;
    }
  }

  /**
   * Subscrever a mudanças em mensagens (realtime)
   */
  subscribeToMessages(conversationId: string, callback: (message: ChatMessage) => void) {
    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          callback(payload.new as ChatMessage);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }
}

export const chatService = new ChatService();
export default chatService;
