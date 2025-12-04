// hooks/useOnboardingStorage.ts
import { useCallback } from 'react';

import { profileService } from '@/services/profileService';
import { supabase, isSupabaseReady } from '@/services/supabase';
import { UserProfile } from '@/types';
import { logger } from '@/utils/logger';
import { secureStorageService } from '@/utils/secureStorage';

import { useHaptics } from './useHaptics';

const STORAGE_KEYS = {
  TERMS_PRIVACY: 'nath_terms_privacy', // Timestamps de aceitação (local seguro)
} as const;

interface TermsPrivacyData {
  termsAcceptedDate: string;
  privacyAcceptedDate: string;
}

/**
 * Hook para gerenciar persistência do onboarding
 * - Usa Supabase quando autenticado
 * - Fallback para storage local seguro (modo guest/offline)
 * - Salva timestamps de aceitação de termos/privacy localmente (LGPD compliance)
 */
export const useOnboardingStorage = () => {
  const haptics = useHaptics();

  /**
   * Salva perfil do usuário no Supabase (se autenticado) ou localmente (guest)
   */
  const saveUserProfile = useCallback(
    async (profile: UserProfile): Promise<boolean> => {
      try {
        // Validação básica
        if (!profile.name) {
          logger.warn('Tentativa de salvar perfil sem nome', {
            service: 'useOnboardingStorage',
            action: 'saveUserProfile',
          });
          return false;
        }

        // Tentar salvar no Supabase primeiro (se autenticado)
        if (isSupabaseReady()) {
          const {
            data: { user },
          } = await supabase.auth.getUser();

          if (user) {
            // Mapear UserProfile para formato do Supabase
            const profileUpdate = {
              full_name: profile.name,
              motherhood_stage: mapStageToMotherhoodStage(profile.stage) as
                | 'trying_to_conceive'
                | 'pregnant'
                | 'postpartum'
                | 'experienced_mother'
                | undefined,
              pregnancy_week: profile.timelineInfo
                ? parseInt(profile.timelineInfo.split(' ')[0])
                : undefined,
              emotions: profile.currentFeeling ? [profile.currentFeeling] : undefined,
              needs: profile.primaryNeed ? [profile.primaryNeed] : undefined,
              notifications_enabled: profile.notificationsEnabled,
              onboarding_completed: true,
              onboarding_step: 9,
            };

            // Usar profileService existente
            const result = await profileService.updateProfile(profileUpdate);

            if (result.success) {
              logger.info('Perfil salvo no Supabase', {
                userId: user.id,
                name: profile.name,
                stage: profile.stage,
              });
              haptics.success();
              return true;
            } else {
              logger.warn('Falha ao salvar no Supabase, tentando fallback local', {
                error: result.error,
              });
              // Continuar para fallback local
            }
          }
        }

        // Fallback: Salvar localmente (modo guest ou offline)
        const profileJson = JSON.stringify(profile);
        await secureStorageService.saveItem('nath_user_profile', profileJson);

        logger.info('Perfil salvo localmente (modo guest/offline)', {
          hasName: !!profile.name,
          hasStage: !!profile.stage,
        });

        haptics.success();
        return true;
      } catch (error) {
        logger.error('Erro ao salvar perfil do usuário', error, {
          service: 'useOnboardingStorage',
          action: 'saveUserProfile',
        });
        haptics.error();
        return false;
      }
    },
    [haptics]
  );

  /**
   * Salva timestamps de aceitação de termos/privacy
   * Sempre salva localmente (LGPD compliance - audit trail)
   */
  const saveAcceptanceTimestamps = useCallback(async (): Promise<void> => {
    try {
      const now = new Date().toISOString();
      const data: TermsPrivacyData = {
        termsAcceptedDate: now,
        privacyAcceptedDate: now,
      };

      // Sempre salvar localmente (compliance LGPD)
      await secureStorageService.saveItem(STORAGE_KEYS.TERMS_PRIVACY, JSON.stringify(data));

      // Se autenticado, também salvar no Supabase (opcional - para analytics)
      if (isSupabaseReady()) {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          // Criar ou atualizar registro de aceitação
          const { error } = await supabase.from('legal_acceptances').upsert(
            {
              user_id: user.id,
              terms_accepted_at: now,
              privacy_accepted_at: now,
              updated_at: now,
            },
            {
              onConflict: 'user_id',
            }
          );

          if (error) {
            logger.warn('Falha ao salvar timestamps no Supabase (salvo localmente)', error);
            // Não lançar erro - já salvou localmente
          } else {
            logger.info('Timestamps de aceitação salvos (Supabase + local)', {
              userId: user.id,
            });
          }
        }
      }

      logger.info('Timestamps de aceitação salvos', {
        termsAcceptedDate: data.termsAcceptedDate,
        privacyAcceptedDate: data.privacyAcceptedDate,
      });
    } catch (error) {
      logger.error('Erro ao salvar aceitação de termos', error, {
        service: 'useOnboardingStorage',
        action: 'saveAcceptanceTimestamps',
      });
      throw error;
    }
  }, []);

  /**
   * Carrega perfil do usuário (Supabase primeiro, fallback local)
   */
  const getUserProfile = useCallback(async (): Promise<UserProfile | null> => {
    try {
      // Tentar carregar do Supabase primeiro
      if (isSupabaseReady()) {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          const profile = await profileService.getCurrentProfile();

          if (profile) {
            logger.debug('Perfil carregado do Supabase', {
              hasName: !!profile.name,
              hasStage: !!profile.stage,
            });
            return profile as UserProfile;
          }
        }
      }

      // Fallback: Carregar do storage local
      const profileJson = await secureStorageService.getItem('nath_user_profile');

      if (!profileJson) {
        return null;
      }

      const profile = JSON.parse(profileJson) as UserProfile;

      // Validação básica
      if (typeof profile !== 'object' || profile === null) {
        logger.warn('Perfil inválido encontrado no storage local');
        return null;
      }

      logger.debug('Perfil carregado do storage local', {
        hasName: !!profile.name,
        hasStage: !!profile.stage,
      });

      return profile;
    } catch (error) {
      logger.error('Erro ao carregar perfil', error, {
        service: 'useOnboardingStorage',
        action: 'getUserProfile',
      });
      return null;
    }
  }, []);

  /**
   * Carrega timestamps de aceitação (apenas local - LGPD)
   */
  const getAcceptanceTimestamps = useCallback(async (): Promise<TermsPrivacyData | null> => {
    try {
      const dataJson = await secureStorageService.getItem(STORAGE_KEYS.TERMS_PRIVACY);

      if (!dataJson) {
        return null;
      }

      return JSON.parse(dataJson) as TermsPrivacyData;
    } catch (error) {
      logger.error('Erro ao carregar timestamps de aceitação', error);
      return null;
    }
  }, []);

  /**
   * Limpa dados de onboarding (útil para reset/testes)
   */
  const clearOnboardingData = useCallback(async (): Promise<void> => {
    try {
      // Limpar storage local
      await Promise.all([
        secureStorageService.deleteItem('nath_user_profile'),
        secureStorageService.deleteItem(STORAGE_KEYS.TERMS_PRIVACY),
      ]);

      // Se autenticado, resetar onboarding no Supabase
      if (isSupabaseReady()) {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          await profileService.updateProfile({
            onboarding_completed: false,
            onboarding_step: 0,
          });
        }
      }

      logger.info('Dados de onboarding limpos');
    } catch (error) {
      logger.error('Erro ao limpar dados de onboarding', error);
      throw error;
    }
  }, []);

  /**
   * Verifica se onboarding foi completado
   */
  const isOnboardingCompleted = useCallback(async (): Promise<boolean> => {
    try {
      if (isSupabaseReady()) {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          const profile = await profileService.getCurrentProfile();
          return profile?.onboarding_completed ?? false;
        }
      }

      // Fallback: Verificar storage local
      const profileJson = await secureStorageService.getItem('nath_user_profile');
      if (profileJson) {
        const profile = JSON.parse(profileJson) as UserProfile;
        return profile.onboarding_completed ?? false;
      }

      return false;
    } catch (error) {
      logger.error('Erro ao verificar status de onboarding', error);
      return false;
    }
  }, []);

  return {
    saveUserProfile,
    saveAcceptanceTimestamps,
    getUserProfile,
    getAcceptanceTimestamps,
    clearOnboardingData,
    isOnboardingCompleted,
  };
};

/**
 * Helper: Mapeia UserStage para motherhood_stage do Supabase
 */
function mapStageToMotherhoodStage(stage?: string): string | undefined {
  const mapping: Record<string, string> = {
    Tentante: 'trying_to_conceive',
    Gestante: 'pregnant',
    'Puérpera (Recém-nascido)': 'postpartum',
    'Mãe experiente': 'experienced_mother',
  };

  return stage ? mapping[stage] : undefined;
}
