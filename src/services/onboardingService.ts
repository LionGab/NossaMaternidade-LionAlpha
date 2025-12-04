/**
 * onboardingService
 * Gerencia o fluxo de onboarding e salva dados do perfil
 * Suporta modo guest (sem autenticação) usando AsyncStorage
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

import { logger } from '@/utils/logger';

import { supabase, isSupabaseReady } from './supabase';

// ======================
// 🎯 TYPES
// ======================

export interface OnboardingData {
  display_name: string;
  life_stage_generic: string;
  main_goals: string[];
  baseline_emotion: string;
  first_focus: string;
  preferred_language_tone?: string | null;
  notification_opt_in: boolean;

  // Campos de Wellness (Release A)
  physical_challenges?: string[];
  sleep_challenges?: string[];
  emotional_state?: string;
  partner_relationship?: string;
  professional_support?: string[];
  wellness_goals?: string[];
  wellness_consent?: boolean;
  onboarding_incomplete?: boolean;
}

// Storage keys
const STORAGE_KEYS = {
  ONBOARDING_DATA: 'nath_onboarding_data',
  ONBOARDING_COMPLETED: 'nath_onboarding_completed',
  ONBOARDING_STEP: 'nath_onboarding_step',
};

// ======================
// 🔧 ONBOARDING SERVICE
// ======================

class OnboardingService {
  /**
   * Completa o onboarding e salva todos os dados do perfil
   * Funciona com ou sem autenticação (modo guest)
   */
  async completeOnboarding(data: OnboardingData): Promise<boolean> {
    try {
      // Sempre salvar localmente primeiro (funciona offline e modo guest)
      await this.saveToLocalStorage(data);

      // Tentar salvar no Supabase se estiver disponível e autenticado
      if (isSupabaseReady()) {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          // Usuário autenticado - salvar no Supabase também
          const { error } = await supabase
            .from('profiles')
            .update({
              display_name: data.display_name,
              life_stage_generic: data.life_stage_generic,
              main_goals: data.main_goals,
              baseline_emotion: data.baseline_emotion,
              first_focus: data.first_focus,
              preferred_language_tone: data.preferred_language_tone,
              notification_opt_in: data.notification_opt_in,
              // Campos de Wellness (Release A)
              physical_challenges: data.physical_challenges,
              sleep_challenges: data.sleep_challenges,
              emotional_state: data.emotional_state,
              partner_relationship: data.partner_relationship,
              professional_support: data.professional_support,
              wellness_goals: data.wellness_goals,
              wellness_consent: data.wellness_consent,
              onboarding_incomplete: data.onboarding_incomplete,
              onboarding_completed: true,
              onboarding_step: 12,
              updated_at: new Date().toISOString(),
            })
            .eq('id', user.id);

          if (error) {
            logger.warn('Failed to save onboarding to Supabase (data saved locally)', error);
            // Não retorna false pois salvou localmente
          } else {
            logger.info('Onboarding completed (Supabase + local)', {
              userId: user.id,
              displayName: data.display_name,
            });
          }
        } else {
          logger.info('Onboarding completed (guest mode - local only)', {
            displayName: data.display_name,
          });
        }
      } else {
        logger.info('Onboarding completed (offline mode - local only)', {
          displayName: data.display_name,
        });
      }

      return true;
    } catch (error) {
      logger.error('Error completing onboarding', error);
      return false;
    }
  }

  /**
   * Salva dados localmente no AsyncStorage
   */
  private async saveToLocalStorage(data: OnboardingData): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING_DATA, JSON.stringify(data));
    await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETED, 'true');
    await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING_STEP, '12');
  }

  /**
   * Salva progresso parcial do onboarding (útil para multi-step)
   * Funciona com ou sem autenticação (modo guest)
   */
  async saveOnboardingStep(step: number, partialData: Partial<OnboardingData>): Promise<boolean> {
    try {
      // Sempre salvar localmente
      await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING_STEP, String(step));

      // Mesclar com dados existentes
      const existingDataStr = await AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING_DATA);
      const existingData = existingDataStr ? JSON.parse(existingDataStr) : {};
      const mergedData = { ...existingData, ...partialData };
      await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING_DATA, JSON.stringify(mergedData));

      // Tentar salvar no Supabase se disponível e autenticado
      if (isSupabaseReady()) {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          const { error } = await supabase
            .from('profiles')
            .update({
              ...partialData,
              onboarding_step: step,
              updated_at: new Date().toISOString(),
            })
            .eq('id', user.id);

          if (error) {
            logger.warn('Failed to save onboarding step to Supabase', error, { step });
          }
        }
      }

      return true;
    } catch (error) {
      logger.error('Error saving onboarding step', error);
      return false;
    }
  }

  /**
   * Verifica se o usuário já completou o onboarding
   * Funciona com ou sem autenticação (modo guest)
   */
  async isOnboardingCompleted(): Promise<boolean> {
    try {
      // Primeiro verificar localmente (funciona em todos os modos)
      const localCompleted = await AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETED);
      if (localCompleted === 'true') {
        return true;
      }

      // Se não completou localmente, verificar Supabase (se disponível e autenticado)
      if (isSupabaseReady()) {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          const { data, error } = await supabase
            .from('profiles')
            .select('onboarding_completed')
            .eq('id', user.id)
            .single();

          if (error) {
            logger.warn('Failed to check onboarding in Supabase', error);
            return false;
          }

          const completed = data?.onboarding_completed ?? false;

          // Sincronizar com local storage
          if (completed) {
            await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETED, 'true');
          }

          return completed;
        }
      }

      return false;
    } catch (error) {
      logger.error('Error checking onboarding status', error);
      return false;
    }
  }

  /**
   * Retorna o passo atual do onboarding (útil para retomar)
   * Funciona com ou sem autenticação (modo guest)
   */
  async getCurrentStep(): Promise<number> {
    try {
      // Primeiro verificar localmente
      const localStep = await AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING_STEP);
      if (localStep) {
        return parseInt(localStep, 10);
      }

      // Se não há local, verificar Supabase
      if (isSupabaseReady()) {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          const { data, error } = await supabase
            .from('profiles')
            .select('onboarding_step')
            .eq('id', user.id)
            .single();

          if (error) {
            logger.warn('Failed to get onboarding step from Supabase', error);
            return 0;
          }

          const step = data?.onboarding_step ?? 0;

          // Sincronizar com local
          if (step > 0) {
            await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING_STEP, String(step));
          }

          return step;
        }
      }

      return 0;
    } catch (error) {
      logger.error('Error getting onboarding step', error);
      return 0;
    }
  }

  /**
   * Pula o onboarding (útil para testes ou casos especiais)
   * Funciona com ou sem autenticação (modo guest)
   */
  async skipOnboarding(): Promise<boolean> {
    try {
      // Sempre salvar localmente
      await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETED, 'true');
      await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING_STEP, '12');

      // Tentar salvar no Supabase se disponível
      if (isSupabaseReady()) {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          const { error } = await supabase
            .from('profiles')
            .update({
              onboarding_completed: true,
              onboarding_step: 12,
              onboarding_incomplete: true, // Marcado como pulado
              updated_at: new Date().toISOString(),
            })
            .eq('id', user.id);

          if (error) {
            logger.warn('Failed to skip onboarding in Supabase', error);
          } else {
            logger.info('Onboarding skipped (Supabase + local)', { userId: user.id });
          }
        } else {
          logger.info('Onboarding skipped (guest mode - local only)');
        }
      } else {
        logger.info('Onboarding skipped (offline mode - local only)');
      }

      return true;
    } catch (error) {
      logger.error('Error skipping onboarding', error);
      return false;
    }
  }

  /**
   * Obtém os dados do onboarding salvos localmente
   */
  async getLocalOnboardingData(): Promise<OnboardingData | null> {
    try {
      const dataStr = await AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING_DATA);
      if (dataStr) {
        return JSON.parse(dataStr);
      }
      return null;
    } catch (error) {
      logger.error('Error getting local onboarding data', error);
      return null;
    }
  }

  /**
   * Limpa todos os dados de onboarding (útil para reset)
   */
  async clearOnboarding(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.ONBOARDING_DATA,
        STORAGE_KEYS.ONBOARDING_COMPLETED,
        STORAGE_KEYS.ONBOARDING_STEP,
      ]);
      logger.info('Onboarding data cleared');
    } catch (error) {
      logger.error('Error clearing onboarding data', error);
    }
  }
}

export const onboardingService = new OnboardingService();
