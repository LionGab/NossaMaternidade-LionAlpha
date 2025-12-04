/**
 * Sleep Service
 * Gerencia logs de sono das usuárias
 */

import { logger } from '@/utils/logger';

import { supabase } from './supabase';

export interface SleepLog {
  id: string;
  user_id: string;
  duration_hours: number;
  logged_at: string;
  notes?: string;
  created_at: string;
  updated_at?: string;
}

class SleepService {
  private async getCurrentUserId(): Promise<string | null> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user?.id || null;
  }

  /**
   * Registrar horas de sono
   */
  async logSleep(hours: number, notes?: string): Promise<boolean> {
    try {
      const userId = await this.getCurrentUserId();
      if (!userId) {
        logger.error('User not authenticated', null, { service: 'sleepService' });
        return false;
      }

      const { error } = await supabase.from('sleep_logs').insert({
        user_id: userId,
        duration_hours: hours,
        notes,
        logged_at: new Date().toISOString(),
      });

      if (error) {
        logger.error('Failed to log sleep', error, { service: 'sleepService' });
        return false;
      }

      logger.info('Sleep logged successfully', { service: 'sleepService', hours });
      return true;
    } catch (error) {
      logger.error('Unexpected error logging sleep', error, { service: 'sleepService' });
      return false;
    }
  }

  /**
   * Buscar sono de hoje
   */
  async getTodaySleep(): Promise<SleepLog | null> {
    try {
      const userId = await this.getCurrentUserId();
      if (!userId) return null;

      const today = new Date().toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('sleep_logs')
        .select('*')
        .eq('user_id', userId)
        .gte('logged_at', `${today}T00:00:00`)
        .lt('logged_at', `${today}T23:59:59`)
        .order('logged_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        // PGRST116 = no rows returned (normal se não registrou hoje)
        if (error.code !== 'PGRST116') {
          logger.error('Failed to fetch today sleep', error, { service: 'sleepService' });
        }
        return null;
      }

      return (data || null) as SleepLog | null;
    } catch (error) {
      logger.error('Unexpected error fetching today sleep', error, { service: 'sleepService' });
      return null;
    }
  }

  /**
   * Buscar histórico de sono (últimos N dias)
   */
  async getSleepHistory(limit = 30): Promise<SleepLog[]> {
    try {
      const userId = await this.getCurrentUserId();
      if (!userId) return [];

      const { data, error } = await supabase
        .from('sleep_logs')
        .select('*')
        .eq('user_id', userId)
        .order('logged_at', { ascending: false })
        .limit(limit);

      if (error) {
        logger.error('Failed to fetch sleep history', error, { service: 'sleepService' });
        return [];
      }

      return (data || []) as SleepLog[];
    } catch (error) {
      logger.error('Unexpected error fetching sleep history', error, { service: 'sleepService' });
      return [];
    }
  }
}

export const sleepService = new SleepService();
export default sleepService;
