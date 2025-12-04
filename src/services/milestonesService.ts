import { logger } from '@/utils/logger';

import { supabase } from './supabase';

export type MilestoneCategory = 'motor' | 'cognitivo' | 'linguagem' | 'social' | 'sensorial';

export interface BabyMilestone {
  id: string;
  title: string;
  description?: string;
  category: MilestoneCategory;
  age_months: number;
  tips?: string[];
  created_at: string;
}

export interface UserBabyMilestone {
  id: string;
  user_id: string;
  milestone_id: string;
  is_completed: boolean;
  completed_at?: string;
  notes?: string;
  created_at: string;
  updated_at: string;

  // Dados do milestone
  milestone?: BabyMilestone;
}

export interface MilestoneProgress {
  total_milestones: number;
  completed_milestones: number;
  progress_percentage: number;
  by_category: {
    [key in MilestoneCategory]: {
      total: number;
      completed: number;
    };
  };
}

class MilestonesService {
  private async getCurrentUserId(): Promise<string | null> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user?.id || null;
  }

  /**
   * Buscar todos os marcos disponíveis
   */
  async getAllMilestones(): Promise<BabyMilestone[]> {
    try {
      const { data, error } = await supabase
        .from('baby_milestones')
        .select('*')
        .order('age_months')
        .order('category');

      if (error) {
        logger.error('Erro ao buscar marcos', error, {
          service: 'MilestonesService',
          action: 'getAllMilestones',
        });
        return [];
      }

      return (data || []) as BabyMilestone[];
    } catch (error) {
      logger.error('Erro inesperado ao buscar marcos', error, {
        service: 'MilestonesService',
        action: 'getAllMilestones',
      });
      return [];
    }
  }

  /**
   * Buscar marcos por faixa etária
   */
  async getMilestonesByAge(startMonths: number, endMonths: number): Promise<BabyMilestone[]> {
    try {
      const { data, error } = await supabase
        .from('baby_milestones')
        .select('*')
        .gte('age_months', startMonths)
        .lte('age_months', endMonths)
        .order('age_months')
        .order('category');

      if (error) {
        logger.error('Erro ao buscar marcos por idade', error, {
          service: 'MilestonesService',
          action: 'getMilestonesByAge',
          startMonths,
          endMonths,
        });
        return [];
      }

      return (data || []) as BabyMilestone[];
    } catch (error) {
      logger.error('Erro inesperado ao buscar marcos por idade', error, {
        service: 'MilestonesService',
        action: 'getMilestonesByAge',
        startMonths,
        endMonths,
      });
      return [];
    }
  }

  /**
   * Buscar marcos por categoria
   */
  async getMilestonesByCategory(category: MilestoneCategory): Promise<BabyMilestone[]> {
    try {
      const { data, error } = await supabase
        .from('baby_milestones')
        .select('*')
        .eq('category', category)
        .order('age_months');

      if (error) {
        logger.error('Erro ao buscar marcos por categoria', error, {
          service: 'MilestonesService',
          action: 'getMilestonesByCategory',
          category,
        });
        return [];
      }

      return (data || []) as BabyMilestone[];
    } catch (error) {
      logger.error('Erro inesperado ao buscar marcos por categoria', error, {
        service: 'MilestonesService',
        action: 'getMilestonesByCategory',
        category,
      });
      return [];
    }
  }

  /**
   * Buscar progresso do usuário em todos os marcos
   */
  async getUserMilestones(): Promise<UserBabyMilestone[]> {
    try {
      const userId = await this.getCurrentUserId();
      if (!userId) return [];

      const { data, error } = await supabase
        .from('user_baby_milestones')
        .select(
          `
          *,
          milestone:baby_milestones(*)
        `
        )
        .eq('user_id', userId)
        .order('milestone(age_months)');

      if (error) {
        logger.error('Erro ao buscar progresso do usuário', error, {
          service: 'MilestonesService',
          action: 'getUserMilestones',
          userId,
        });
        return [];
      }

      return (data || []) as UserBabyMilestone[];
    } catch (error) {
      logger.error('Erro inesperado ao buscar progresso', error, {
        service: 'MilestonesService',
        action: 'getUserMilestones',
      });
      return [];
    }
  }

  /**
   * Buscar marcos recomendados baseados na idade do bebê
   */
  async getRecommendedMilestones(babyAgeMonths: number): Promise<BabyMilestone[]> {
    try {
      // Buscar marcos da idade atual ± 2 meses
      const minAge = Math.max(0, babyAgeMonths - 2);
      const maxAge = babyAgeMonths + 2;

      return await this.getMilestonesByAge(minAge, maxAge);
    } catch (error) {
      logger.error('Erro ao buscar marcos recomendados', error, {
        service: 'MilestonesService',
        action: 'getRecommendedMilestones',
        babyAgeMonths,
      });
      return [];
    }
  }

  /**
   * Marcar marco como completado
   */
  async completeMilestone(milestoneId: string, notes?: string): Promise<boolean> {
    try {
      const userId = await this.getCurrentUserId();
      if (!userId) return false;

      // Verificar se já existe registro
      const existing = await this.getUserMilestoneByMilestoneId(milestoneId);

      if (existing) {
        // Atualizar existente
        const { error } = await supabase
          .from('user_baby_milestones')
          .update({
            is_completed: true,
            completed_at: new Date().toISOString().split('T')[0],
            notes,
          })
          .eq('id', existing.id);

        if (error) {
          logger.error('Erro ao completar marco (update)', error, {
            service: 'MilestonesService',
            action: 'completeMilestone',
            milestoneId,
            userMilestoneId: existing.id,
          });
          return false;
        }
      } else {
        // Criar novo
        const { error } = await supabase.from('user_baby_milestones').insert({
          user_id: userId,
          milestone_id: milestoneId,
          is_completed: true,
          completed_at: new Date().toISOString().split('T')[0],
          notes,
        });

        if (error) {
          logger.error('Erro ao criar marco completado', error, {
            service: 'MilestonesService',
            action: 'completeMilestone',
            milestoneId,
            userId,
          });
          return false;
        }
      }

      return true;
    } catch (error) {
      logger.error('Erro inesperado ao completar marco', error, {
        service: 'MilestonesService',
        action: 'completeMilestone',
        milestoneId,
      });
      return false;
    }
  }

  /**
   * Desmarcar marco como completado
   */
  async uncompleteMilestone(milestoneId: string): Promise<boolean> {
    try {
      const userId = await this.getCurrentUserId();
      if (!userId) return false;

      const existing = await this.getUserMilestoneByMilestoneId(milestoneId);

      if (existing) {
        const { error } = await supabase
          .from('user_baby_milestones')
          .update({
            is_completed: false,
            completed_at: null,
          })
          .eq('id', existing.id);

        if (error) {
          logger.error('Erro ao desmarcar marco', error, {
            service: 'MilestonesService',
            action: 'uncompleteMilestone',
            milestoneId,
            userMilestoneId: existing.id,
          });
          return false;
        }

        return true;
      }

      return false;
    } catch (error) {
      logger.error('Erro inesperado ao desmarcar marco', error, {
        service: 'MilestonesService',
        action: 'uncompleteMilestone',
        milestoneId,
      });
      return false;
    }
  }

  /**
   * Adicionar nota a um marco
   */
  async addMilestoneNote(milestoneId: string, notes: string): Promise<boolean> {
    try {
      const userId = await this.getCurrentUserId();
      if (!userId) return false;

      const existing = await this.getUserMilestoneByMilestoneId(milestoneId);

      if (existing) {
        const { error } = await supabase
          .from('user_baby_milestones')
          .update({ notes })
          .eq('id', existing.id);

        return !error;
      } else {
        const { error } = await supabase.from('user_baby_milestones').insert({
          user_id: userId,
          milestone_id: milestoneId,
          is_completed: false,
          notes,
        });

        return !error;
      }
    } catch (error) {
      logger.error('Erro ao adicionar nota ao marco', error, {
        service: 'MilestonesService',
        action: 'addMilestoneNote',
        milestoneId,
      });
      return false;
    }
  }

  /**
   * Obter progresso geral
   */
  async getMilestoneProgress(): Promise<MilestoneProgress> {
    try {
      const userId = await this.getCurrentUserId();
      if (!userId) {
        return this.getEmptyProgress();
      }

      // Buscar todos os marcos
      const allMilestones = await this.getAllMilestones();

      // Buscar progresso do usuário
      const userMilestones = await this.getUserMilestones();

      // Calcular estatísticas gerais
      const totalMilestones = allMilestones.length;
      const completedMilestones = userMilestones.filter((um) => um.is_completed).length;
      const progressPercentage =
        totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;

      // Calcular por categoria
      const byCategory = this.calculateProgressByCategory(allMilestones, userMilestones);

      return {
        total_milestones: totalMilestones,
        completed_milestones: completedMilestones,
        progress_percentage: progressPercentage,
        by_category: byCategory,
      };
    } catch (error) {
      logger.error('Erro ao calcular progresso geral', error, {
        service: 'MilestonesService',
        action: 'getMilestoneProgress',
      });
      return this.getEmptyProgress();
    }
  }

  /**
   * Obter progresso por faixa etária
   */
  async getMilestoneProgressByAge(babyAgeMonths: number): Promise<MilestoneProgress> {
    try {
      const userId = await this.getCurrentUserId();
      if (!userId) {
        return this.getEmptyProgress();
      }

      // Buscar marcos da idade
      const milestones = await this.getRecommendedMilestones(babyAgeMonths);

      // Buscar progresso
      const userMilestones = await this.getUserMilestones();

      // Filtrar apenas os da idade atual
      const relevantProgress = userMilestones.filter((um) =>
        milestones.some((m) => m.id === um.milestone_id)
      );

      const totalMilestones = milestones.length;
      const completedMilestones = relevantProgress.filter((um) => um.is_completed).length;
      const progressPercentage =
        totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;

      const byCategory = this.calculateProgressByCategory(milestones, relevantProgress);

      return {
        total_milestones: totalMilestones,
        completed_milestones: completedMilestones,
        progress_percentage: progressPercentage,
        by_category: byCategory,
      };
    } catch (error) {
      logger.error('Erro ao calcular progresso por idade', error, {
        service: 'MilestonesService',
        action: 'getMilestoneProgressByAge',
        babyAgeMonths,
      });
      return this.getEmptyProgress();
    }
  }

  /**
   * Verificar se marco foi completado
   */
  async isMilestoneCompleted(milestoneId: string): Promise<boolean> {
    const userMilestone = await this.getUserMilestoneByMilestoneId(milestoneId);
    return userMilestone?.is_completed ?? false;
  }

  /**
   * Buscar marco do usuário por milestone_id
   */
  private async getUserMilestoneByMilestoneId(
    milestoneId: string
  ): Promise<UserBabyMilestone | null> {
    try {
      const userId = await this.getCurrentUserId();
      if (!userId) return null;

      const { data, error } = await supabase
        .from('user_baby_milestones')
        .select('*')
        .eq('user_id', userId)
        .eq('milestone_id', milestoneId)
        .single();

      if (error) return null;
      return data as UserBabyMilestone;
    } catch (error) {
      return null;
    }
  }

  /**
   * Calcular progresso por categoria
   */
  private calculateProgressByCategory(
    allMilestones: BabyMilestone[],
    userMilestones: UserBabyMilestone[]
  ): MilestoneProgress['by_category'] {
    const categories: MilestoneCategory[] = [
      'motor',
      'cognitivo',
      'linguagem',
      'social',
      'sensorial',
    ];

    const result: MilestoneProgress['by_category'] = {
      motor: { total: 0, completed: 0 },
      cognitivo: { total: 0, completed: 0 },
      linguagem: { total: 0, completed: 0 },
      social: { total: 0, completed: 0 },
      sensorial: { total: 0, completed: 0 },
    };

    categories.forEach((category) => {
      const categoryMilestones = allMilestones.filter((m) => m.category === category);
      const categoryCompleted = userMilestones.filter(
        (um) => um.is_completed && categoryMilestones.some((m) => m.id === um.milestone_id)
      );

      result[category] = {
        total: categoryMilestones.length,
        completed: categoryCompleted.length,
      };
    });

    return result;
  }

  /**
   * Retornar progresso vazio
   */
  private getEmptyProgress(): MilestoneProgress {
    return {
      total_milestones: 0,
      completed_milestones: 0,
      progress_percentage: 0,
      by_category: {
        motor: { total: 0, completed: 0 },
        cognitivo: { total: 0, completed: 0 },
        linguagem: { total: 0, completed: 0 },
        social: { total: 0, completed: 0 },
        sensorial: { total: 0, completed: 0 },
      },
    };
  }

  /**
   * Buscar marcos completados recentemente
   */
  async getRecentlyCompleted(limit = 5): Promise<UserBabyMilestone[]> {
    try {
      const userId = await this.getCurrentUserId();
      if (!userId) return [];

      const { data, error } = await supabase
        .from('user_baby_milestones')
        .select(
          `
          *,
          milestone:baby_milestones(*)
        `
        )
        .eq('user_id', userId)
        .eq('is_completed', true)
        .not('completed_at', 'is', null)
        .order('completed_at', { ascending: false })
        .limit(limit);

      if (error) {
        logger.error('Erro ao buscar marcos completados recentemente', error, {
          service: 'MilestonesService',
          action: 'getRecentlyCompleted',
          limit,
        });
        return [];
      }

      return (data || []) as UserBabyMilestone[];
    } catch (error) {
      logger.error('Erro inesperado ao buscar completados recentemente', error, {
        service: 'MilestonesService',
        action: 'getRecentlyCompleted',
        limit,
      });
      return [];
    }
  }
}

export const milestonesService = new MilestonesService();
export default milestonesService;
