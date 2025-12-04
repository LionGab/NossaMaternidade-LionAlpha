/**
 * Testes básicos para UserDataService (LGPD features)
 */

import { userDataService } from '../src/services/userDataService';

// Mock do Supabase
jest.mock('../src/services/supabase', () => ({
  supabase: {
    auth: {
      getUser: jest.fn(),
      getSession: jest.fn(),
      signOut: jest.fn(),
    },
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(),
        })),
      })),
      delete: jest.fn(() => ({
        eq: jest.fn(),
      })),
    })),
    functions: {
      invoke: jest.fn(),
    },
  },
}));

// Mock de services
jest.mock('../src/services/sessionManager', () => ({
  sessionManager: {
    clearAllSessions: jest.fn(),
  },
}));

jest.mock('../src/services/chatService', () => ({
  chatService: {
    getConversations: jest.fn(() => Promise.resolve([])),
    getMessages: jest.fn(() => Promise.resolve([])),
  },
}));

jest.mock('../src/services/profileService', () => ({
  profileService: {
    getCurrentProfile: jest.fn(() => Promise.resolve(null)),
  },
}));

describe('UserDataService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('exportUserData', () => {
    it('deve retornar erro se usuário não estiver autenticado', async () => {
      const { supabase } = require('../src/services/supabase');
      supabase.auth.getUser.mockResolvedValue({ data: { user: null }, error: null });

      const result = await userDataService.exportUserData();

      expect(result.data).toBeNull();
      expect(result.error).toBeTruthy();
    });

    it('deve exportar dados quando usuário estiver autenticado', async () => {
      const mockUser = { id: 'user-123' };
      const { supabase } = require('../src/services/supabase');
      const { profileService } = require('../src/services/profileService');
      const { chatService } = require('../src/services/chatService');

      // Mock auth
      supabase.auth.getUser.mockResolvedValue({ data: { user: mockUser }, error: null });
      
      // Mock profile service
      profileService.getCurrentProfile.mockResolvedValue({ id: 'user-123', name: 'Test User' });
      
      // Mock chat service
      chatService.getConversations.mockResolvedValue([]);
      chatService.getMessages.mockResolvedValue([]);
      
      // Mock supabase queries - retorna dados vazios mas válidos
      const mockQueryResult = { data: [], error: null };
      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue(mockQueryResult),
            }),
            // Para queries sem order/limit
            ...mockQueryResult,
          }),
          // Para queries diretas após select
          ...mockQueryResult,
        }),
      });

      const result = await userDataService.exportUserData();

      expect(result.data).toBeTruthy();
      expect(result.data?.profile).toBeDefined();
      expect(result.data?.chatConversations).toBeDefined();
      expect(result.data?.exportedAt).toBeDefined();
    });
  });

  describe('deleteAccount', () => {
    it('deve retornar erro se usuário não estiver autenticado', async () => {
      const { supabase } = require('../src/services/supabase');
      supabase.auth.getUser.mockResolvedValue({ data: { user: null }, error: null });

      const result = await userDataService.deleteAccount();

      expect(result.success).toBe(false);
      expect(result.error).toBeTruthy();
    });
  });

  describe('requestAccountDeletion', () => {
    it('deve solicitar deleção quando usuário estiver autenticado', async () => {
      const mockUser = { id: 'user-123' };
      const { supabase } = require('../src/services/supabase');

      supabase.auth.getUser.mockResolvedValue({ data: { user: mockUser }, error: null });
      supabase.from.mockReturnValue({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ error: null }),
        }),
      });
      supabase.auth.signOut.mockResolvedValue({ error: null });

      const result = await userDataService.requestAccountDeletion();

      expect(result.success).toBe(true);
      expect(supabase.auth.signOut).toHaveBeenCalled();
    });
  });
});
