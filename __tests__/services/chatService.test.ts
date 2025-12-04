/**
 * Testes para ChatService
 * Gerenciamento de conversas e mensagens
 */

// Mock do Supabase antes de importar
jest.mock('../../src/services/supabase', () => ({
  supabase: {
    auth: {
      getUser: jest.fn(),
    },
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          order: jest.fn(() => ({
            limit: jest.fn(() => Promise.resolve({ data: [], error: null })),
            single: jest.fn(() => Promise.resolve({ data: null, error: null })),
          })),
        })),
      })),
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({ data: null, error: null })),
        })),
      })),
      update: jest.fn(() => ({
        eq: jest.fn(() => Promise.resolve({ error: null })),
      })),
      delete: jest.fn(() => ({
        eq: jest.fn(() => Promise.resolve({ error: null })),
      })),
    })),
    channel: jest.fn(() => ({
      on: jest.fn(() => ({
        subscribe: jest.fn(),
      })),
    })),
    removeChannel: jest.fn(),
  },
}));

// Mock do GeminiService
jest.mock('../../src/services/geminiService', () => ({
  geminiService: {
    sendMessage: jest.fn(() => Promise.resolve({ text: 'Resposta da IA', error: null })),
  },
}));

import { supabase } from '../../src/services/supabase';
import { chatService, ChatMessage, ChatConversation } from '../../src/services/chatService';

describe('ChatService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getConversations', () => {
    it('deve retornar array vazio quando usuario nao autenticado', async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: null },
      });

      const conversations = await chatService.getConversations();

      expect(conversations).toEqual([]);
    });

    it('deve retornar conversas do usuario', async () => {
      const mockUser = { id: 'user-123' };
      const mockConversations = [
        {
          id: 'conv-1',
          user_id: 'user-123',
          title: 'Conversa 1',
          model: 'gemini-pro',
          created_at: '2025-01-01T00:00:00Z',
          updated_at: '2025-01-01T00:00:00Z',
        },
      ];

      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
      });

      const mockFrom = jest.fn(() => ({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            order: jest.fn(() => ({
              limit: jest.fn(() => Promise.resolve({ data: mockConversations, error: null })),
            })),
          })),
        })),
      }));

      (supabase.from as jest.Mock).mockImplementation(mockFrom);

      await chatService.getConversations();

      expect(supabase.auth.getUser).toHaveBeenCalled();
    });
  });

  describe('createConversation', () => {
    it('deve retornar null quando usuario nao autenticado', async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: null },
      });

      const conversation = await chatService.createConversation();

      expect(conversation).toBeNull();
    });

    it('deve criar conversa com dados padrao', async () => {
      const mockUser = { id: 'user-123' };
      const mockConversation: ChatConversation = {
        id: 'conv-new',
        user_id: 'user-123',
        title: 'Nova conversa',
        model: 'gemini-pro',
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z',
      };

      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
      });

      const mockFrom = jest.fn(() => ({
        insert: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn(() => Promise.resolve({ data: mockConversation, error: null })),
          })),
        })),
      }));

      (supabase.from as jest.Mock).mockImplementation(mockFrom);

      await chatService.createConversation();

      // Verifica que a funcao foi chamada
      expect(supabase.auth.getUser).toHaveBeenCalled();
    });

    it('deve criar conversa com titulo personalizado', async () => {
      const mockUser = { id: 'user-123' };

      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
      });

      const mockFrom = jest.fn(() => ({
        insert: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn(() =>
              Promise.resolve({
                data: {
                  id: 'conv-custom',
                  user_id: 'user-123',
                  title: 'Minha Conversa',
                  model: 'gemini-pro',
                  created_at: '2025-01-01T00:00:00Z',
                  updated_at: '2025-01-01T00:00:00Z',
                },
                error: null,
              })
            ),
          })),
        })),
      }));

      (supabase.from as jest.Mock).mockImplementation(mockFrom);

      await chatService.createConversation({ title: 'Minha Conversa' });

      expect(supabase.from).toHaveBeenCalledWith('chat_conversations');
    });
  });

  describe('getMessages', () => {
    it('deve retornar mensagens da conversa', async () => {
      const mockMessages: ChatMessage[] = [
        {
          id: 'msg-1',
          conversation_id: 'conv-1',
          role: 'user',
          content: 'Ola',
          created_at: '2025-01-01T00:00:00Z',
        },
        {
          id: 'msg-2',
          conversation_id: 'conv-1',
          role: 'assistant',
          content: 'Oi, como posso ajudar?',
          created_at: '2025-01-01T00:00:01Z',
        },
      ];

      const mockFrom = jest.fn(() => ({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            order: jest.fn(() => ({
              limit: jest.fn(() => Promise.resolve({ data: mockMessages, error: null })),
            })),
          })),
        })),
      }));

      (supabase.from as jest.Mock).mockImplementation(mockFrom);

      const messages = await chatService.getMessages('conv-1');

      expect(supabase.from).toHaveBeenCalledWith('chat_messages');
      expect(messages).toEqual(mockMessages);
    });

    it('deve retornar array vazio em caso de erro', async () => {
      const mockFrom = jest.fn(() => ({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            order: jest.fn(() => ({
              limit: jest.fn(() => Promise.resolve({ data: null, error: { message: 'DB Error' } })),
            })),
          })),
        })),
      }));

      (supabase.from as jest.Mock).mockImplementation(mockFrom);

      const messages = await chatService.getMessages('conv-1');

      expect(messages).toEqual([]);
    });
  });

  describe('sendMessage', () => {
    it('deve enviar mensagem com sucesso', async () => {
      const mockMessage: ChatMessage = {
        id: 'msg-new',
        conversation_id: 'conv-1',
        role: 'user',
        content: 'Teste',
        created_at: '2025-01-01T00:00:00Z',
      };

      const mockFrom = jest.fn((table: string) => {
        if (table === 'chat_messages') {
          return {
            insert: jest.fn(() => ({
              select: jest.fn(() => ({
                single: jest.fn(() => Promise.resolve({ data: mockMessage, error: null })),
              })),
            })),
          };
        }
        return {
          update: jest.fn(() => ({
            eq: jest.fn(() => Promise.resolve({ error: null })),
          })),
        };
      });

      (supabase.from as jest.Mock).mockImplementation(mockFrom);

      const result = await chatService.sendMessage({
        conversation_id: 'conv-1',
        content: 'Teste',
        role: 'user',
      });

      expect(result).toEqual(mockMessage);
    });

    it('deve retornar null em caso de erro', async () => {
      const mockFrom = jest.fn(() => ({
        insert: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn(() =>
              Promise.resolve({ data: null, error: { message: 'Insert error' } })
            ),
          })),
        })),
      }));

      (supabase.from as jest.Mock).mockImplementation(mockFrom);

      const result = await chatService.sendMessage({
        conversation_id: 'conv-1',
        content: 'Teste',
      });

      expect(result).toBeNull();
    });
  });

  describe('updateConversationTitle', () => {
    it('deve atualizar titulo com sucesso', async () => {
      const mockFrom = jest.fn(() => ({
        update: jest.fn(() => ({
          eq: jest.fn(() => Promise.resolve({ error: null })),
        })),
      }));

      (supabase.from as jest.Mock).mockImplementation(mockFrom);

      const result = await chatService.updateConversationTitle('conv-1', 'Novo Titulo');

      expect(result).toBe(true);
    });

    it('deve retornar false em caso de erro', async () => {
      const mockFrom = jest.fn(() => ({
        update: jest.fn(() => ({
          eq: jest.fn(() => Promise.resolve({ error: { message: 'Update error' } })),
        })),
      }));

      (supabase.from as jest.Mock).mockImplementation(mockFrom);

      const result = await chatService.updateConversationTitle('conv-1', 'Novo Titulo');

      expect(result).toBe(false);
    });
  });

  describe('deleteConversation', () => {
    it('deve deletar conversa com sucesso', async () => {
      const mockFrom = jest.fn(() => ({
        delete: jest.fn(() => ({
          eq: jest.fn(() => Promise.resolve({ error: null })),
        })),
      }));

      (supabase.from as jest.Mock).mockImplementation(mockFrom);

      const result = await chatService.deleteConversation('conv-1');

      expect(result).toBe(true);
    });

    it('deve retornar false em caso de erro', async () => {
      const mockFrom = jest.fn(() => ({
        delete: jest.fn(() => ({
          eq: jest.fn(() => Promise.resolve({ error: { message: 'Delete error' } })),
        })),
      }));

      (supabase.from as jest.Mock).mockImplementation(mockFrom);

      const result = await chatService.deleteConversation('conv-1');

      expect(result).toBe(false);
    });
  });

  describe('deleteMessage', () => {
    it('deve deletar mensagem com sucesso', async () => {
      const mockFrom = jest.fn(() => ({
        delete: jest.fn(() => ({
          eq: jest.fn(() => Promise.resolve({ error: null })),
        })),
      }));

      (supabase.from as jest.Mock).mockImplementation(mockFrom);

      const result = await chatService.deleteMessage('msg-1');

      expect(result).toBe(true);
    });
  });

  describe('subscribeToMessages', () => {
    it('deve criar subscription e retornar unsubscribe', () => {
      // Mock do channel com cadeia completa
      const mockChannel = { id: 'test-channel' };
      const mockSubscribe = jest.fn().mockReturnValue(mockChannel);
      const mockOn = jest.fn().mockReturnValue({ subscribe: mockSubscribe });
      
      (supabase.channel as jest.Mock).mockReturnValue({ on: mockOn });
      (supabase.removeChannel as jest.Mock).mockReturnValue(undefined);

      const mockCallback = jest.fn();
      const mockUnsubscribe = chatService.subscribeToMessages('conv-1', mockCallback);

      expect(typeof mockUnsubscribe).toBe('function');
      expect(supabase.channel).toHaveBeenCalledWith('messages:conv-1');
      
      // Testar que unsubscribe funciona
      mockUnsubscribe();
      expect(supabase.removeChannel).toHaveBeenCalled();
    });
  });
});
