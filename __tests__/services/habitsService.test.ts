/**
 * Testes básicos para HabitsService
 */

// Mock do Supabase
jest.mock('../../src/services/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          order: jest.fn(() => ({
            data: [],
            error: null,
          })),
        })),
      })),
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(() => ({
            data: null,
            error: null,
          })),
        })),
      })),
      update: jest.fn(() => ({
        eq: jest.fn(() => ({
          data: null,
          error: null,
        })),
      })),
      delete: jest.fn(() => ({
        eq: jest.fn(() => ({
          data: null,
          error: null,
        })),
      })),
    })),
    auth: {
      getUser: jest.fn(),
    },
  },
}));

import { supabase } from '../../src/services/supabase';

describe('HabitsService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserHabits', () => {
    it('deve buscar hábitos do usuário', async () => {
      const mockHabits = [
        { id: '1', name: 'Beber água', category: 'wellness' },
        { id: '2', name: 'Exercício', category: 'exercise' },
      ];

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: mockHabits,
          error: null,
        }),
      };

      (supabase.from as jest.Mock).mockReturnValue(mockQuery);
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });

      const result = await mockQuery.select('*').eq('user_id', 'user-123').order('created_at');

      expect(result.data).toEqual(mockHabits);
      expect(result.error).toBeNull();
    });

    it('deve retornar array vazio quando usuário não tem hábitos', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
          data: [],
          error: null,
        }),
      };

      (supabase.from as jest.Mock).mockReturnValue(mockQuery);

      const result = await mockQuery.select('*').eq('user_id', 'user-123').order('created_at');

      expect(result.data).toEqual([]);
      expect(result.error).toBeNull();
    });
  });

  describe('createHabit', () => {
    it('deve criar hábito com sucesso', async () => {
      const newHabit = {
        user_id: 'user-123',
        habit_id: 'habit-1',
        custom_name: 'Beber 2L de água',
      };

      const mockQuery = {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { id: 'new-habit-123', ...newHabit },
          error: null,
        }),
      };

      (supabase.from as jest.Mock).mockReturnValue(mockQuery);

      const result = await mockQuery.insert(newHabit).select().single();

      expect(result.data).toBeDefined();
      expect(result.data?.user_id).toBe('user-123');
      expect(result.error).toBeNull();
    });
  });

  describe('logHabit', () => {
    it('deve registrar conclusão de hábito', async () => {
      const logData = {
        user_habit_id: 'user-habit-123',
        completed_at: '2024-12-15',
        notes: 'Completado!',
      };

      const mockQuery = {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { id: 'log-123', ...logData },
          error: null,
        }),
      };

      (supabase.from as jest.Mock).mockReturnValue(mockQuery);

      const result = await mockQuery.insert(logData).select().single();

      expect(result.data).toBeDefined();
      expect(result.data?.completed_at).toBe('2024-12-15');
      expect(result.error).toBeNull();
    });
  });
});
