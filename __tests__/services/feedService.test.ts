/**
 * Testes para FeedService
 * Conforme Plano de Deploy - Aumentar cobertura para 40%+
 */

// Mock do Supabase antes de importar
jest.mock('../../src/services/supabase', () => ({
  supabase: {
    auth: {
      getUser: jest.fn(),
    },
    from: jest.fn(() => ({
      select: jest.fn(),
    })),
  },
}));

// Mock do contentRecommendationService
jest.mock('../../src/services/contentRecommendationService', () => ({
  contentRecommendationService: {
    getPersonalizedContent: jest.fn(),
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
import { feedService } from '../../src/services/feedService';

describe('FeedService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getContent', () => {
    it('deve retornar conteúdos quando encontrados', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
      };

      const mockContent = [
        {
          id: 'content-1',
          title: 'Test Content',
          type: 'article',
          category: 'wellness',
          is_published: true,
          is_premium: false,
          views_count: 0,
          likes_count: 0,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
          user_interaction: null,
        },
      ];

      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
      });

      const queryChain = {
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        range: jest.fn().mockResolvedValue({
          data: mockContent,
          error: null,
        }),
      };

      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn(() => queryChain),
      });

      const result = await feedService.getContent({}, 0, 20);

      expect(result).toEqual(mockContent);
      expect(supabase.from).toHaveBeenCalledWith('content_items');
    });

    it('deve retornar array vazio quando há erro', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
      };

      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
      });

      const queryChain = {
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        range: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Query failed' },
        }),
      };

      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn(() => queryChain),
      });

      const result = await feedService.getContent({}, 0, 20);

      expect(result).toEqual([]);
    });

    it('deve aplicar filtros corretamente', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
      };

      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
      });

      const eqMock = jest.fn().mockReturnThis();
      const queryChain = {
        eq: eqMock,
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        range: jest.fn().mockResolvedValue({
          data: [],
          error: null,
        }),
      };

      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn(() => queryChain),
      });

      await feedService.getContent({ type: 'video', category: 'wellness' }, 0, 20);

      expect(eqMock).toHaveBeenCalledWith('is_published', true);
      expect(eqMock).toHaveBeenCalledWith('type', 'video');
      expect(eqMock).toHaveBeenCalledWith('category', 'wellness');
    });
  });

  describe('getContentById', () => {
    it('deve retornar conteúdo quando encontrado', async () => {
      const mockContent = {
        id: 'content-1',
        title: 'Test Content',
        type: 'article',
        is_published: true,
        is_premium: false,
        views_count: 0,
        likes_count: 0,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      // Mock getUser para retornar null (usuário não autenticado)
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: null },
      });

      // Mock da query chain: from().select().eq().single()
      const singleMock = jest.fn().mockResolvedValue({
        data: mockContent,
        error: null,
      });
      const eqMock = jest.fn().mockReturnValue({ single: singleMock });
      const selectMock = jest.fn().mockReturnValue({ eq: eqMock });

      (supabase.from as jest.Mock).mockReturnValue({
        select: selectMock,
      });

      const result = await feedService.getContentById('content-1');

      expect(result).toEqual(mockContent);
      expect(supabase.from).toHaveBeenCalledWith('content_items');
    });

    it('deve retornar null quando conteúdo não encontrado', async () => {
      // Mock getUser
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: null },
      });

      const singleMock = jest.fn().mockResolvedValue({
        data: null,
        error: { message: 'Not found' },
      });
      const eqMock = jest.fn().mockReturnValue({ single: singleMock });
      const selectMock = jest.fn().mockReturnValue({ eq: eqMock });

      (supabase.from as jest.Mock).mockReturnValue({
        select: selectMock,
      });

      const result = await feedService.getContentById('content-1');

      expect(result).toBeNull();
    });
  });
});
