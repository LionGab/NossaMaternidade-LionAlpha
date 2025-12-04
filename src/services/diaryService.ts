/**
 * DiaryService - Gerenciamento de entradas do diário
 * Salva desabafos no "Refúgio" do usuário
 *
 * @version 1.0.0
 */

import { logger } from '@/utils/logger';

import { supabase } from './supabase';

export interface DiaryEntry {
  id: string;
  user_id: string;
  content: string;
  ai_response: string | null;
  emotion_detected: string | null;
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
}

export interface DiaryEntryInsert {
  content: string;
  ai_response?: string | null;
  emotion_detected?: string | null;
  is_favorite?: boolean;
}

export interface DiaryServiceResponse<T> {
  data: T | null;
  error: Error | null;
}

class DiaryService {
  private async getCurrentUserId(): Promise<string | null> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user?.id || null;
  }

  /**
   * Salvar entrada no Refúgio (diary_entries)
   * @param entry - Conteúdo do diário e resposta da IA
   * @returns DiaryEntry salva ou erro
   */
  async saveToRefuge(entry: DiaryEntryInsert): Promise<DiaryServiceResponse<DiaryEntry>> {
    try {
      const userId = await this.getCurrentUserId();
      if (!userId) {
        logger.error('User not authenticated', null, { service: 'diaryService' });
        return { data: null, error: new Error('Usuário não autenticado') };
      }

      const now = new Date().toISOString();

      const { data, error } = await supabase
        .from('diary_entries')
        .insert({
          user_id: userId,
          content: entry.content,
          ai_response: entry.ai_response || null,
          emotion_detected: entry.emotion_detected || null,
          is_favorite: entry.is_favorite ?? true, // Salvar no Refúgio = favorito
          created_at: now,
          updated_at: now,
        })
        .select()
        .single();

      if (error) {
        logger.error('Failed to save diary entry', error, { service: 'diaryService' });
        return { data: null, error: new Error(error.message) };
      }

      logger.info('Diary entry saved to refuge', { service: 'diaryService', entryId: data.id });
      return { data: data as DiaryEntry, error: null };
    } catch (error) {
      const normalizedError = error instanceof Error ? error : new Error(String(error));
      logger.error('Unexpected error saving diary entry', normalizedError, {
        service: 'diaryService',
      });
      return { data: null, error: normalizedError };
    }
  }

  /**
   * Buscar entradas do Refúgio (favoritas)
   * @param limit - Quantidade máxima de entradas
   * @returns Lista de entradas favoritas
   */
  async getRefugeEntries(limit = 20): Promise<DiaryServiceResponse<DiaryEntry[]>> {
    try {
      const userId = await this.getCurrentUserId();
      if (!userId) {
        return { data: [], error: null };
      }

      const { data, error } = await supabase
        .from('diary_entries')
        .select('*')
        .eq('user_id', userId)
        .eq('is_favorite', true)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        logger.error('Failed to fetch refuge entries', error, { service: 'diaryService' });
        return { data: null, error: new Error(error.message) };
      }

      return { data: (data || []) as DiaryEntry[], error: null };
    } catch (error) {
      const normalizedError = error instanceof Error ? error : new Error(String(error));
      logger.error('Unexpected error fetching refuge entries', normalizedError, {
        service: 'diaryService',
      });
      return { data: null, error: normalizedError };
    }
  }

  /**
   * Buscar histórico completo do diário
   * @param limit - Quantidade máxima de entradas
   * @returns Lista de todas as entradas
   */
  async getHistory(limit = 50): Promise<DiaryServiceResponse<DiaryEntry[]>> {
    try {
      const userId = await this.getCurrentUserId();
      if (!userId) {
        return { data: [], error: null };
      }

      const { data, error } = await supabase
        .from('diary_entries')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        logger.error('Failed to fetch diary history', error, { service: 'diaryService' });
        return { data: null, error: new Error(error.message) };
      }

      return { data: (data || []) as DiaryEntry[], error: null };
    } catch (error) {
      const normalizedError = error instanceof Error ? error : new Error(String(error));
      logger.error('Unexpected error fetching diary history', normalizedError, {
        service: 'diaryService',
      });
      return { data: null, error: normalizedError };
    }
  }

  /**
   * Alternar status de favorito de uma entrada
   * @param entryId - ID da entrada
   * @returns Sucesso ou erro
   */
  async toggleFavorite(entryId: string): Promise<DiaryServiceResponse<boolean>> {
    try {
      const userId = await this.getCurrentUserId();
      if (!userId) {
        return { data: false, error: new Error('Usuário não autenticado') };
      }

      // Buscar estado atual
      const { data: current, error: fetchError } = await supabase
        .from('diary_entries')
        .select('is_favorite')
        .eq('id', entryId)
        .eq('user_id', userId)
        .single();

      if (fetchError || !current) {
        return { data: false, error: new Error('Entrada não encontrada') };
      }

      // Inverter estado
      const { error } = await supabase
        .from('diary_entries')
        .update({
          is_favorite: !current.is_favorite,
          updated_at: new Date().toISOString(),
        })
        .eq('id', entryId)
        .eq('user_id', userId);

      if (error) {
        logger.error('Failed to toggle favorite', error, { service: 'diaryService' });
        return { data: false, error: new Error(error.message) };
      }

      logger.info('Favorite toggled', {
        service: 'diaryService',
        entryId,
        newState: !current.is_favorite,
      });
      return { data: true, error: null };
    } catch (error) {
      const normalizedError = error instanceof Error ? error : new Error(String(error));
      logger.error('Unexpected error toggling favorite', normalizedError, {
        service: 'diaryService',
      });
      return { data: false, error: normalizedError };
    }
  }

  /**
   * Deletar entrada do diário
   * @param entryId - ID da entrada
   * @returns Sucesso ou erro
   */
  async deleteEntry(entryId: string): Promise<DiaryServiceResponse<boolean>> {
    try {
      const userId = await this.getCurrentUserId();
      if (!userId) {
        return { data: false, error: new Error('Usuário não autenticado') };
      }

      const { error } = await supabase
        .from('diary_entries')
        .delete()
        .eq('id', entryId)
        .eq('user_id', userId);

      if (error) {
        logger.error('Failed to delete diary entry', error, { service: 'diaryService' });
        return { data: false, error: new Error(error.message) };
      }

      logger.info('Diary entry deleted', { service: 'diaryService', entryId });
      return { data: true, error: null };
    } catch (error) {
      const normalizedError = error instanceof Error ? error : new Error(String(error));
      logger.error('Unexpected error deleting diary entry', normalizedError, {
        service: 'diaryService',
      });
      return { data: false, error: normalizedError };
    }
  }
}

export const diaryService = new DiaryService();
export default diaryService;
