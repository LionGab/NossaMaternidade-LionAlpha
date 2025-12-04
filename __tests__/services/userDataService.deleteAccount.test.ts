/**
 * Testes para userDataService.deleteAccount()
 * Fluxo de deleção de conta LGPD-ready
 */

// Mock do Supabase antes de importar
const mockInvoke = jest.fn();
const mockSignOut = jest.fn();
const mockGetUser = jest.fn();
const mockGetSession = jest.fn();

jest.mock('../../src/services/supabase', () => ({
  supabase: {
    auth: {
      getUser: mockGetUser,
      getSession: mockGetSession,
      signOut: mockSignOut,
    },
    functions: {
      invoke: mockInvoke,
    },
  },
}));

// Mock do sessionManager
const mockClearAllSessions = jest.fn();
jest.mock('../../src/services/sessionManager', () => ({
  sessionManager: {
    clearAllSessions: mockClearAllSessions,
  },
}));

// Mock do consentManager
const mockClearAllConsents = jest.fn();
jest.mock('../../src/core/security/ConsentManager', () => ({
  consentManager: {
    clearAllConsents: mockClearAllConsents,
  },
}));

// Mock do clearAllLocalData
const mockClearAllLocalData = jest.fn();
jest.mock('../../src/utils/localStorageCleanup', () => ({
  clearAllLocalData: mockClearAllLocalData,
}));

// Mock do logger
jest.mock('../../src/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  },
}));

import { userDataService } from '../../src/services/userDataService';

describe('userDataService.deleteAccount', () => {
  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
  };

  const mockSession = {
    access_token: 'valid-token-123',
    refresh_token: 'refresh-token',
    user: mockUser,
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup padrão: usuário autenticado com sessão válida
    mockGetUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });

    mockGetSession.mockResolvedValue({
      data: { session: mockSession },
      error: null,
    });
  });

  describe('Caminho feliz', () => {
    it('deve deletar conta quando Edge Function retorna sucesso', async () => {
      // Mock Edge Function sucesso
      mockInvoke.mockResolvedValue({
        data: { success: true, message: 'Conta deletada permanentemente' },
        error: null,
      });

      const result = await userDataService.deleteAccount();

      // Verificar resultado
      expect(result.success).toBe(true);
      expect(result.error).toBeNull();

      // Verificar que Edge Function foi chamada corretamente
      expect(mockInvoke).toHaveBeenCalledWith('delete-account', {
        body: { userId: mockUser.id },
        headers: { Authorization: `Bearer ${mockSession.access_token}` },
      });

      // Verificar limpeza local foi executada
      expect(mockSignOut).toHaveBeenCalled();
      expect(mockClearAllSessions).toHaveBeenCalled();
      expect(mockClearAllConsents).toHaveBeenCalled();
      expect(mockClearAllLocalData).toHaveBeenCalled();
    });

    it('deve chamar as funções de limpeza na ordem correta', async () => {
      const callOrder: string[] = [];

      mockInvoke.mockResolvedValue({ data: { success: true }, error: null });
      mockSignOut.mockImplementation(() => {
        callOrder.push('signOut');
        return Promise.resolve();
      });
      mockClearAllSessions.mockImplementation(() => {
        callOrder.push('clearAllSessions');
        return Promise.resolve();
      });
      mockClearAllConsents.mockImplementation(() => {
        callOrder.push('clearAllConsents');
        return Promise.resolve();
      });
      mockClearAllLocalData.mockImplementation(() => {
        callOrder.push('clearAllLocalData');
        return Promise.resolve();
      });

      await userDataService.deleteAccount();

      // Ordem esperada: signOut → clearAllSessions → clearAllConsents → clearAllLocalData
      expect(callOrder).toEqual([
        'signOut',
        'clearAllSessions',
        'clearAllConsents',
        'clearAllLocalData',
      ]);
    });
  });

  describe('Caminho de erro - Edge Function falha', () => {
    it('NÃO deve limpar dados locais quando Edge Function retorna erro', async () => {
      // Mock Edge Function erro
      mockInvoke.mockResolvedValue({
        data: null,
        error: { message: 'Network error' },
      });

      const result = await userDataService.deleteAccount();

      // Verificar resultado de erro
      expect(result.success).toBe(false);
      expect(result.error).toContain('Não conseguimos completar');

      // Verificar que limpeza local NÃO foi executada
      expect(mockSignOut).not.toHaveBeenCalled();
      expect(mockClearAllSessions).not.toHaveBeenCalled();
      expect(mockClearAllConsents).not.toHaveBeenCalled();
      expect(mockClearAllLocalData).not.toHaveBeenCalled();
    });

    it('NÃO deve limpar dados locais quando Edge Function retorna success: false', async () => {
      // Mock Edge Function retorna success: false
      mockInvoke.mockResolvedValue({
        data: { success: false, error: 'Erro interno' },
        error: null,
      });

      const result = await userDataService.deleteAccount();

      expect(result.success).toBe(false);
      expect(mockClearAllLocalData).not.toHaveBeenCalled();
    });
  });

  describe('Validação de autenticação', () => {
    it('deve retornar erro amigável quando usuário não autenticado', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const result = await userDataService.deleteAccount();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Usuária não autenticada');
      expect(mockInvoke).not.toHaveBeenCalled();
    });

    it('deve retornar erro quando sessão expirada', async () => {
      mockGetSession.mockResolvedValue({
        data: { session: null },
        error: null,
      });

      const result = await userDataService.deleteAccount();

      expect(result.success).toBe(false);
      expect(result.error).toContain('Sessão inválida');
      expect(mockInvoke).not.toHaveBeenCalled();
    });

    it('deve retornar erro quando access_token ausente', async () => {
      mockGetSession.mockResolvedValue({
        data: { session: { ...mockSession, access_token: undefined } },
        error: null,
      });

      const result = await userDataService.deleteAccount();

      expect(result.success).toBe(false);
      expect(result.error).toContain('Sessão inválida');
    });
  });

  describe('Tratamento de exceções', () => {
    it('deve capturar e retornar erro amigável em exceções inesperadas', async () => {
      mockInvoke.mockRejectedValue(new Error('Unexpected error'));

      const result = await userDataService.deleteAccount();

      expect(result.success).toBe(false);
      expect(result.error).toContain('erro inesperado');
    });

    it('deve continuar mesmo se limpeza local falhar parcialmente', async () => {
      mockInvoke.mockResolvedValue({ data: { success: true }, error: null });
      mockClearAllSessions.mockRejectedValue(new Error('Session clear failed'));

      // Não deve lançar exceção - o método trata internamente
      await expect(userDataService.deleteAccount()).resolves.toBeDefined();
    });
  });
});
