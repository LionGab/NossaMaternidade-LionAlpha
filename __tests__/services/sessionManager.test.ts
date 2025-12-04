/**
 * Testes para SessionManager
 * Gerenciamento centralizado de sessões (auth, chat, analytics)
 */

// Mock das dependências antes de importar
jest.mock('../../src/services/supabase', () => ({
  supabase: {
    auth: {
      getUser: jest.fn(),
      getSession: jest.fn(),
      signOut: jest.fn(),
      onAuthStateChange: jest.fn(() => ({
        data: { subscription: { unsubscribe: jest.fn() } },
      })),
    },
  },
  isSupabaseReady: jest.fn(() => true),
  initSecureStorageMigration: jest.fn(() => Promise.resolve()),
}));

jest.mock('../../src/middleware/sessionValidator', () => ({
  ensureValidSession: jest.fn(),
  getValidSession: jest.fn(),
}));

jest.mock('../../src/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
    setSessionId: jest.fn(),
  },
}));

import { supabase } from '../../src/services/supabase';

// Importamos um novo SessionManager para cada teste
// porque é uma instância singleton
const createFreshSessionManager = () => {
  // Resetar o módulo para obter uma instância fresca
  jest.resetModules();
  const { sessionManager } = require('../../src/services/sessionManager');
  return sessionManager;
};

describe('SessionManager', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getState', () => {
    it('deve retornar estado inicial corretamente', () => {
      const sessionManager = createFreshSessionManager();
      const state = sessionManager.getState();

      expect(state).toHaveProperty('auth');
      expect(state).toHaveProperty('chat');
      expect(state).toHaveProperty('analytics');
      expect(state.auth.isLoading).toBe(true);
      expect(state.auth.session).toBeNull();
      expect(state.auth.user).toBeNull();
    });
  });

  describe('initialize', () => {
    // Testes de initialize são complexos devido às dependências
    // Serão expandidos em fase posterior quando tivermos mais mocks completos
    it.skip('deve inicializar com sessao valida', async () => {
      // TODO: Implementar com mocks completos
    });

    it.skip('deve inicializar sem sessao quando nao autenticado', async () => {
      // TODO: Implementar com mocks completos
    });

    it.skip('deve lidar com Supabase nao configurado', async () => {
      // TODO: Implementar com mocks completos
    });
  });

  describe('addListener', () => {
    it('deve adicionar e remover listener', () => {
      const sessionManager = createFreshSessionManager();
      const listener = jest.fn();

      const unsubscribe = sessionManager.addListener(listener);
      expect(typeof unsubscribe).toBe('function');

      // Chamar unsubscribe deve remover o listener
      unsubscribe();
    });
  });

  describe('getAuthSession', () => {
    it('deve retornar null quando nao inicializado', () => {
      const sessionManager = createFreshSessionManager();
      expect(sessionManager.getAuthSession()).toBeNull();
    });
  });

  describe('getCurrentUser', () => {
    it('deve retornar null quando nao inicializado', () => {
      const sessionManager = createFreshSessionManager();
      expect(sessionManager.getCurrentUser()).toBeNull();
    });
  });

  describe('setChatSessionId', () => {
    it('deve atualizar chat session ID', () => {
      const sessionManager = createFreshSessionManager();

      sessionManager.setChatSessionId('chat-session-123');
      expect(sessionManager.getChatSessionId()).toBe('chat-session-123');

      sessionManager.setChatSessionId(null);
      expect(sessionManager.getChatSessionId()).toBeNull();
    });
  });

  describe('setAnalyticsSessionId', () => {
    it('deve atualizar analytics session ID', () => {
      const sessionManager = createFreshSessionManager();

      sessionManager.setAnalyticsSessionId('analytics-123');
      expect(sessionManager.getAnalyticsSessionId()).toBe('analytics-123');

      sessionManager.setAnalyticsSessionId(null);
      expect(sessionManager.getAnalyticsSessionId()).toBeNull();
    });
  });

  describe('clearAllSessions', () => {
    it('deve limpar todas as sessoes', async () => {
      (supabase.auth.signOut as jest.Mock).mockResolvedValue({ error: null });

      const sessionManager = createFreshSessionManager();
      sessionManager.setChatSessionId('chat-123');
      sessionManager.setAnalyticsSessionId('analytics-123');

      await sessionManager.clearAllSessions();

      const state = sessionManager.getState();
      expect(state.auth.session).toBeNull();
      expect(state.auth.user).toBeNull();
      expect(state.chat.currentSessionId).toBeNull();
      expect(state.analytics.sessionId).toBeNull();
    });
  });

  describe('validateAuthSession', () => {
    // Testes de validateAuthSession dependem de ensureValidSession mock completo
    it.skip('deve validar sessao existente', async () => {
      // TODO: Implementar com mocks completos
    });

    it.skip('deve retornar false quando sessao invalida', async () => {
      // TODO: Implementar com mocks completos
    });
  });

  describe('destroy', () => {
    it('deve poder chamar destroy sem erros', () => {
      const sessionManager = createFreshSessionManager();
      // Destroy sem initialize deve funcionar sem erro
      expect(() => sessionManager.destroy()).not.toThrow();
    });
  });
});
