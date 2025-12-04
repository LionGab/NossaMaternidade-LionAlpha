import { logger } from '@/utils/logger';

import { supabase } from './supabase';

export type EmotionValue = 'bem' | 'triste' | 'ansiosa' | 'cansada' | 'calma';

export interface CheckInLog {
  id: string;
  user_id: string;
  emotion: EmotionValue;
  notes?: string;
  created_at: string;
}

class CheckInService {
  private async getCurrentUserId(): Promise<string | null> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user?.id || null;
  }

  /**
   * Registrar emoção do dia
   */
  async logEmotion(emotion: EmotionValue, notes?: string): Promise<boolean> {
    try {
      const userId = await this.getCurrentUserId();
      if (!userId) {
        logger.error('User not authenticated', null, { service: 'checkInService' });
        return false;
      }

      const today = new Date().toISOString().split('T')[0];

      // Verificar se já existe check-in hoje
      const { data: existing } = await supabase
        .from('check_in_logs')
        .select('id')
        .eq('user_id', userId)
        .gte('created_at', today)
        .single();

      if (existing) {
        // Atualizar registro existente
        const { error } = await supabase
          .from('check_in_logs')
          .update({ emotion, notes, created_at: new Date().toISOString() })
          .eq('id', existing.id);

        if (error) {
          logger.error('Failed to update check-in', error, { service: 'checkInService' });
          return false;
        }
      } else {
        // Criar novo registro
        const { error } = await supabase.from('check_in_logs').insert({
          user_id: userId,
          emotion,
          notes,
          created_at: new Date().toISOString(),
        });

        if (error) {
          logger.error('Failed to create check-in', error, { service: 'checkInService' });
          return false;
        }
      }

      logger.info('Check-in logged successfully', { service: 'checkInService', emotion });
      return true;
    } catch (error) {
      logger.error('Unexpected error logging check-in', error, { service: 'checkInService' });
      return false;
    }
  }

  /**
   * Buscar emoção de hoje
   */
  async getTodayEmotion(): Promise<EmotionValue | null> {
    try {
      const userId = await this.getCurrentUserId();
      if (!userId) return null;

      const today = new Date().toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('check_in_logs')
        .select('emotion')
        .eq('user_id', userId)
        .gte('created_at', today)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error || !data) return null;

      return data.emotion as EmotionValue;
    } catch (error) {
      return null;
    }
  }

  /**
   * Buscar histórico de check-ins
   */
  async getCheckInHistory(limit = 30): Promise<CheckInLog[]> {
    try {
      const userId = await this.getCurrentUserId();
      if (!userId) return [];

      const { data, error } = await supabase
        .from('check_in_logs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        logger.error('Failed to fetch check-in history', error, { service: 'checkInService' });
        return [];
      }

      return (data || []) as CheckInLog[];
    } catch (error) {
      logger.error('Unexpected error fetching check-in history', error, {
        service: 'checkInService',
      });
      return [];
    }
  }

  /**
   * Obter estatísticas de emoções (últimos 7 dias)
   */
  async getEmotionStats(): Promise<Record<EmotionValue, number>> {
    try {
      const userId = await this.getCurrentUserId();
      if (!userId) {
        return { bem: 0, triste: 0, ansiosa: 0, cansada: 0, calma: 0 };
      }

      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data, error } = await supabase
        .from('check_in_logs')
        .select('emotion')
        .eq('user_id', userId)
        .gte('created_at', sevenDaysAgo.toISOString())
        .order('created_at', { ascending: false });

      if (error || !data) {
        return { bem: 0, triste: 0, ansiosa: 0, cansada: 0, calma: 0 };
      }

      const stats: Record<EmotionValue, number> = {
        bem: 0,
        triste: 0,
        ansiosa: 0,
        cansada: 0,
        calma: 0,
      };

      data.forEach((log) => {
        if (log.emotion in stats) {
          stats[log.emotion as EmotionValue]++;
        }
      });

      return stats;
    } catch (error) {
      logger.error('Unexpected error calculating emotion stats', error, {
        service: 'checkInService',
      });
      return { bem: 0, triste: 0, ansiosa: 0, cansada: 0, calma: 0 };
    }
  }
}

export const checkInService = new CheckInService();
export default checkInService;
