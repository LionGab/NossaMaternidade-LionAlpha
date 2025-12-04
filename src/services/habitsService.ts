import { logger } from '@/utils/logger';

import { supabase } from './supabase';

export interface Habit {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  category?: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  created_at: string;
}

export interface UserHabit {
  id: string;
  user_id: string;
  habit_id: string;
  custom_name?: string;
  custom_target: number;
  is_active: boolean;
  created_at: string;
  habit?: Habit;
  today_completed?: boolean;
  current_streak?: number;
}

export interface HabitLog {
  id: string;
  user_habit_id: string;
  completed_at: string;
  notes?: string;
  created_at: string;
}

export interface HabitStats {
  total_completions: number;
  current_streak: number;
  longest_streak: number;
  completion_rate: number;
  last_7_days: boolean[];
}

class HabitsService {
  private async getCurrentUserId(): Promise<string | null> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user?.id || null;
  }

  /**
   * Buscar todos os hábitos disponíveis
   */
  async getAllHabits(): Promise<Habit[]> {
    try {
      const { data, error } = await supabase.from('habits').select('*').order('name');

      if (error) {
        logger.error('Erro ao buscar hábitos disponíveis', error, {
          service: 'HabitsService',
          action: 'getAllHabits',
        });
        return [];
      }

      return (data || []) as Habit[];
    } catch (error) {
      logger.error('Erro inesperado ao buscar hábitos', error, {
        service: 'HabitsService',
        action: 'getAllHabits',
      });
      return [];
    }
  }

  /**
   * Buscar hábitos do usuário
   */
  async getUserHabits(): Promise<UserHabit[]> {
    try {
      const userId = await this.getCurrentUserId();
      if (!userId) return [];

      const { data, error } = await supabase
        .from('user_habits')
        .select(
          `
          *,
          habit:habits(*)
        `
        )
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('created_at');

      if (error) {
        logger.error('Erro ao buscar hábitos do usuário', error, {
          service: 'HabitsService',
          action: 'getUserHabits',
          userId,
        });
        return [];
      }

      // Adicionar informação se foi completado hoje
      const habitsWithStatus = await Promise.all(
        (data || []).map(async (userHabit) => {
          const completedToday = await this.isCompletedToday(userHabit.id);
          const streak = await this.getCurrentStreak(userHabit.id);
          return {
            ...userHabit,
            today_completed: completedToday,
            current_streak: streak,
          };
        })
      );

      return habitsWithStatus as UserHabit[];
    } catch (error) {
      logger.error('Erro inesperado ao buscar hábitos do usuário', error, {
        service: 'HabitsService',
        action: 'getUserHabits',
      });
      return [];
    }
  }

  /**
   * Adicionar hábito ao usuário
   */
  async addHabitToUser(habitId: string, customTarget = 1): Promise<UserHabit | null> {
    try {
      const userId = await this.getCurrentUserId();
      if (!userId) return null;

      const { data, error } = await supabase
        .from('user_habits')
        .insert({
          user_id: userId,
          habit_id: habitId,
          custom_target: customTarget,
          is_active: true,
        })
        .select(
          `
          *,
          habit:habits(*)
        `
        )
        .single();

      if (error) {
        logger.error('Erro ao adicionar hábito ao usuário', error, {
          service: 'HabitsService',
          action: 'addHabitToUser',
          habitId,
          userId,
        });
        return null;
      }

      return data as UserHabit;
    } catch (error) {
      logger.error('Erro inesperado ao adicionar hábito', error, {
        service: 'HabitsService',
        action: 'addHabitToUser',
        habitId,
      });
      return null;
    }
  }

  /**
   * Remover hábito do usuário (desativar)
   */
  async removeHabitFromUser(userHabitId: string): Promise<boolean> {
    try {
      const userId = await this.getCurrentUserId();
      if (!userId) return false;

      const { error } = await supabase
        .from('user_habits')
        .update({ is_active: false })
        .eq('id', userHabitId)
        .eq('user_id', userId);

      if (error) {
        logger.error('Erro ao remover hábito do usuário', error, {
          service: 'HabitsService',
          action: 'removeHabitFromUser',
          userHabitId,
          userId,
        });
        return false;
      }

      return true;
    } catch (error) {
      logger.error('Erro inesperado ao remover hábito', error, {
        service: 'HabitsService',
        action: 'removeHabitFromUser',
        userHabitId,
      });
      return false;
    }
  }

  /**
   * Marcar hábito como completado hoje
   */
  async completeHabit(userHabitId: string, notes?: string): Promise<boolean> {
    try {
      const userId = await this.getCurrentUserId();
      if (!userId) return false;

      const today = new Date().toISOString().split('T')[0];

      // Verificar se já foi completado hoje
      const alreadyCompleted = await this.isCompletedToday(userHabitId);
      if (alreadyCompleted) {
        logger.info('Hábito já completado hoje', {
          service: 'HabitsService',
          action: 'completeHabit',
          userHabitId,
        });
        return true;
      }

      const { error } = await supabase.from('habit_logs').insert({
        user_habit_id: userHabitId,
        completed_at: today,
        notes,
      });

      if (error) {
        logger.error('Erro ao completar hábito', error, {
          service: 'HabitsService',
          action: 'completeHabit',
          userHabitId,
        });
        return false;
      }

      return true;
    } catch (error) {
      logger.error('Erro inesperado ao completar hábito', error, {
        service: 'HabitsService',
        action: 'completeHabit',
        userHabitId,
      });
      return false;
    }
  }

  /**
   * Desmarcar hábito de hoje
   */
  async uncompleteHabit(userHabitId: string): Promise<boolean> {
    try {
      const userId = await this.getCurrentUserId();
      if (!userId) return false;

      const today = new Date().toISOString().split('T')[0];

      const { error } = await supabase
        .from('habit_logs')
        .delete()
        .eq('user_habit_id', userHabitId)
        .eq('completed_at', today);

      if (error) {
        logger.error('Erro ao desmarcar hábito', error, {
          service: 'HabitsService',
          action: 'uncompleteHabit',
          userHabitId,
        });
        return false;
      }

      return true;
    } catch (error) {
      logger.error('Erro inesperado ao desmarcar hábito', error, {
        service: 'HabitsService',
        action: 'uncompleteHabit',
        userHabitId,
      });
      return false;
    }
  }

  /**
   * Toggle hábito (completar se não completado, desmarcar se já completado)
   */
  async toggleHabitCompletion(userHabitId: string): Promise<boolean> {
    try {
      const isCompleted = await this.isCompletedToday(userHabitId);

      if (isCompleted) {
        return await this.uncompleteHabit(userHabitId);
      } else {
        return await this.completeHabit(userHabitId);
      }
    } catch (error) {
      logger.error('Erro inesperado ao fazer toggle de hábito', error, {
        service: 'HabitsService',
        action: 'toggleHabitCompletion',
        userHabitId,
      });
      return false;
    }
  }

  /**
   * Verificar se hábito foi completado hoje
   */
  async isCompletedToday(userHabitId: string): Promise<boolean> {
    try {
      const today = new Date().toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('habit_logs')
        .select('id')
        .eq('user_habit_id', userHabitId)
        .eq('completed_at', today)
        .single();

      return !error && data != null;
    } catch (error) {
      return false;
    }
  }

  /**
   * Obter estatísticas de um hábito
   */
  async getHabitStats(userHabitId: string): Promise<HabitStats> {
    try {
      const { data, error } = await supabase
        .from('habit_logs')
        .select('completed_at')
        .eq('user_habit_id', userHabitId)
        .order('completed_at', { ascending: false });

      if (error || !data) {
        return {
          total_completions: 0,
          current_streak: 0,
          longest_streak: 0,
          completion_rate: 0,
          last_7_days: Array(7).fill(false),
        };
      }

      const completions = data.map((log) => log.completed_at);
      const totalCompletions = completions.length;

      // Calcular streak atual
      const currentStreak = this.calculateCurrentStreak(completions);

      // Calcular maior streak
      const longestStreak = this.calculateLongestStreak(completions);

      // Calcular taxa de conclusão (últimos 30 dias)
      const completionRate = this.calculateCompletionRate(completions, 30);

      // Últimos 7 dias
      const last7Days = this.getLast7DaysStatus(completions);

      return {
        total_completions: totalCompletions,
        current_streak: currentStreak,
        longest_streak: longestStreak,
        completion_rate: completionRate,
        last_7_days: last7Days,
      };
    } catch (error) {
      logger.error('Erro ao calcular estatísticas do hábito', error, {
        service: 'HabitsService',
        action: 'getHabitStats',
        userHabitId,
      });
      return {
        total_completions: 0,
        current_streak: 0,
        longest_streak: 0,
        completion_rate: 0,
        last_7_days: Array(7).fill(false),
      };
    }
  }

  /**
   * Calcular streak atual
   */
  private async getCurrentStreak(userHabitId: string): Promise<number> {
    const { data } = await supabase
      .from('habit_logs')
      .select('completed_at')
      .eq('user_habit_id', userHabitId)
      .order('completed_at', { ascending: false });

    if (!data) return 0;

    const completions = data.map((log) => log.completed_at);
    return this.calculateCurrentStreak(completions);
  }

  private calculateCurrentStreak(completions: string[]): number {
    if (completions.length === 0) return 0;

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Começar de hoje ou ontem (caso não tenha completado hoje ainda)
    const checkDate = new Date(today);
    const lastCompletion = new Date(completions[0]);
    lastCompletion.setHours(0, 0, 0, 0);

    // Se a última conclusão não foi hoje nem ontem, streak é 0
    const daysDiff = Math.floor(
      (today.getTime() - lastCompletion.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysDiff > 1) return 0;

    // Contar dias consecutivos
    for (const completion of completions) {
      const compDate = new Date(completion);
      compDate.setHours(0, 0, 0, 0);

      if (compDate.getTime() === checkDate.getTime()) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else if (compDate.getTime() < checkDate.getTime()) {
        break;
      }
    }

    return streak;
  }

  private calculateLongestStreak(completions: string[]): number {
    if (completions.length === 0) return 0;

    let longestStreak = 0;
    let currentStreak = 1;

    for (let i = 1; i < completions.length; i++) {
      const prevDate = new Date(completions[i - 1]);
      const currDate = new Date(completions[i]);

      const diffDays = Math.floor(
        (prevDate.getTime() - currDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (diffDays === 1) {
        currentStreak++;
      } else {
        longestStreak = Math.max(longestStreak, currentStreak);
        currentStreak = 1;
      }
    }

    return Math.max(longestStreak, currentStreak);
  }

  private calculateCompletionRate(completions: string[], days: number): number {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const recentCompletions = completions.filter((completion) => {
      const compDate = new Date(completion);
      return compDate >= cutoffDate;
    });

    return Math.round((recentCompletions.length / days) * 100);
  }

  private getLast7DaysStatus(completions: string[]): boolean[] {
    const result: boolean[] = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() - i);
      const dateStr = checkDate.toISOString().split('T')[0];

      const completed = completions.includes(dateStr);
      result.push(completed);
    }

    return result;
  }

  /**
   * Buscar logs de um hábito
   */
  async getHabitLogs(userHabitId: string, limit = 30): Promise<HabitLog[]> {
    try {
      const { data, error } = await supabase
        .from('habit_logs')
        .select('*')
        .eq('user_habit_id', userHabitId)
        .order('completed_at', { ascending: false })
        .limit(limit);

      if (error) {
        logger.error('Erro ao buscar logs do hábito', error, {
          service: 'HabitsService',
          action: 'getHabitLogs',
          userHabitId,
          limit,
        });
        return [];
      }

      return (data || []) as HabitLog[];
    } catch (error) {
      logger.error('Erro inesperado ao buscar logs do hábito', error, {
        service: 'HabitsService',
        action: 'getHabitLogs',
        userHabitId,
        limit,
      });
      return [];
    }
  }
}

export const habitsService = new HabitsService();
export default habitsService;
