/**
 * Testes para ConsentService
 * Conforme padrão do projeto (40%+ coverage MVP)
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
          single: jest.fn(),
          order: jest.fn(() => ({
            order: jest.fn(),
          })),
        })),
      })),
    })),
    rpc: jest.fn(),
  },
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

import { supabase } from '../../src/services/supabase';
import { consentService } from '../../src/services/consentService';

describe('ConsentService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getCurrentTerms', () => {
    it('deve retornar termos atuais quando encontrados', async () => {
      const mockTerms = {
        id: 'term-123',
        version: '1.0.0',
        consent_type: 'ai_processing',
        title: 'Processamento por IA',
        summary: 'Resumo',
        full_text: 'Texto completo',
        is_current: true,
        is_breaking: false,
        effective_from: '2025-01-01T00:00:00Z',
        content_hash: 'hash123',
      };

      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: { id: 'user-123' } },
      });

      const selectMock = jest.fn(() => ({
        eq: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn().mockResolvedValue({
              data: mockTerms,
              error: null,
            }),
          })),
        })),
      }));

      (supabase.from as jest.Mock).mockReturnValue({
        select: selectMock,
      });

      const result = await consentService.getCurrentTerms('ai_processing');

      expect(result).toEqual(mockTerms);
      expect(supabase.from).toHaveBeenCalledWith('consent_terms_versions');
    });

    it('deve retornar null quando termos não encontrados', async () => {
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            eq: jest.fn(() => ({
              single: jest.fn().mockResolvedValue({
                data: null,
                error: { message: 'Not found' },
              }),
            })),
          })),
        })),
      });

      const result = await consentService.getCurrentTerms('ai_processing');

      expect(result).toBeNull();
    });
  });

  describe('grantConsent', () => {
    it('deve conceder consentimento com sucesso', async () => {
      const mockUser = { id: 'user-123' };
      const mockConsentId = 'consent-123';

      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
      });

      (supabase.rpc as jest.Mock).mockResolvedValue({
        data: mockConsentId,
        error: null,
      });

      const result = await consentService.grantConsent({
        consent_type: 'ai_processing',
        terms_version_id: 'term-123',
        collection_method: 'onboarding',
      });

      expect(result.success).toBe(true);
      expect(result.consent_id).toBe(mockConsentId);
      expect(supabase.rpc).toHaveBeenCalledWith(
        'grant_consent',
        expect.objectContaining({
          p_user_id: mockUser.id,
          p_consent_type: 'ai_processing',
          p_terms_version_id: 'term-123',
        })
      );
    });

    it('deve retornar erro quando usuária não autenticada', async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: null },
      });

      const result = await consentService.grantConsent({
        consent_type: 'ai_processing',
        terms_version_id: 'term-123',
        collection_method: 'onboarding',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Usuária não autenticada');
    });

    it('deve retornar erro quando RPC falha', async () => {
      const mockUser = { id: 'user-123' };

      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
      });

      (supabase.rpc as jest.Mock).mockResolvedValue({
        data: null,
        error: { message: 'Database error' },
      });

      const result = await consentService.grantConsent({
        consent_type: 'ai_processing',
        terms_version_id: 'term-123',
        collection_method: 'onboarding',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Database error');
    });
  });

  describe('revokeConsent', () => {
    it('deve revogar consentimento com sucesso', async () => {
      const mockUser = { id: 'user-123' };

      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
      });

      (supabase.rpc as jest.Mock).mockResolvedValue({
        data: true,
        error: null,
      });

      const result = await consentService.revokeConsent({
        consent_type: 'ai_processing',
      });

      expect(result.success).toBe(true);
      expect(supabase.rpc).toHaveBeenCalledWith(
        'revoke_consent',
        expect.objectContaining({
          p_user_id: mockUser.id,
          p_consent_type: 'ai_processing',
        })
      );
    });

    it('deve retornar erro quando consentimento não encontrado', async () => {
      const mockUser = { id: 'user-123' };

      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
      });

      (supabase.rpc as jest.Mock).mockResolvedValue({
        data: false,
        error: null,
      });

      const result = await consentService.revokeConsent({
        consent_type: 'ai_processing',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Consentimento não encontrado ou já revogado');
    });
  });

  describe('getActiveConsents', () => {
    it('deve retornar consentimentos ativos', async () => {
      const mockUser = { id: 'user-123' };
      const mockConsents = [
        {
          consent_type: 'essential',
          status: 'granted',
          granted_at: '2025-01-01T00:00:00Z',
          terms_version: '1.0.0',
          is_current_terms: true,
        },
        {
          consent_type: 'ai_processing',
          status: 'granted',
          granted_at: '2025-01-01T00:00:00Z',
          terms_version: '1.0.0',
          is_current_terms: true,
        },
      ];

      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
      });

      (supabase.rpc as jest.Mock).mockResolvedValue({
        data: mockConsents,
        error: null,
      });

      const result = await consentService.getActiveConsents();

      expect(result).toHaveLength(2);
      expect(result[0].consent_type).toBe('essential');
      expect(supabase.rpc).toHaveBeenCalledWith('get_user_consents', {
        p_user_id: mockUser.id,
      });
    });

    it('deve retornar array vazio quando usuária não autenticada', async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: null },
      });

      const result = await consentService.getActiveConsents();

      expect(result).toEqual([]);
    });
  });

  describe('hasConsent', () => {
    it('deve retornar true quando consentimento existe', async () => {
      const mockUser = { id: 'user-123' };
      const mockConsents = [
        {
          consent_type: 'ai_processing',
          status: 'granted',
          granted_at: '2025-01-01T00:00:00Z',
          terms_version: '1.0.0',
          is_current_terms: true,
        },
      ];

      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
      });

      (supabase.rpc as jest.Mock).mockResolvedValue({
        data: mockConsents,
        error: null,
      });

      const result = await consentService.hasConsent('ai_processing');

      expect(result).toBe(true);
    });

    it('deve retornar false quando consentimento não existe', async () => {
      const mockUser = { id: 'user-123' };

      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
      });

      (supabase.rpc as jest.Mock).mockResolvedValue({
        data: [],
        error: null,
      });

      const result = await consentService.hasConsent('ai_processing');

      expect(result).toBe(false);
    });
  });
});
