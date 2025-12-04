/**
 * WellnessContext
 * Contexto global para gerenciamento de bem-estar maternal
 * Release A - Base de Wellness + Onboarding Expandido
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react';

import { onboardingService } from '@/services/onboardingService';
import { logger } from '@/utils/logger';

import type { MotherProfile, WellnessContextType, CheckInData, WeeklyInsight } from '../types';
import { createInitialMotherProfile } from '../types';

// ======================
// STORAGE KEYS
// ======================

const STORAGE_KEYS = {
  WELLNESS_PROFILE: 'nath_wellness_profile',
  WELLNESS_CONSENT: 'nath_wellness_consent',
  WELLNESS_CHECKINS: 'nath_wellness_checkins',
  ONBOARDING_INCOMPLETE: 'nath_onboarding_incomplete',
} as const;

// ======================
// HELPER: Safe JSON Parse
// ======================

/**
 * Parse JSON de forma segura, retornando valor padrão se falhar
 * Evita que JSON corrompido quebre o carregamento da app
 */
function safeJsonParse<T>(json: string | null, defaultValue: T): T {
  if (!json) return defaultValue;

  try {
    const parsed = JSON.parse(json);
    // Validação básica de tipo para arrays
    if (Array.isArray(defaultValue) && !Array.isArray(parsed)) {
      logger.warn('[WellnessContext] Expected array, got:', typeof parsed);
      return defaultValue;
    }
    return parsed as T;
  } catch (error) {
    logger.error('[WellnessContext] JSON parse error, using default:', error);
    return defaultValue;
  }
}

// ======================
// CONTEXT
// ======================

const WellnessContext = createContext<WellnessContextType | undefined>(undefined);

// ======================
// PROVIDER
// ======================

interface WellnessProviderProps {
  children: ReactNode;
}

export function WellnessProvider({ children }: WellnessProviderProps) {
  // State
  const [profile, setProfile] = useState<MotherProfile | null>(null);
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(false);
  const [onboardingIncomplete, setOnboardingIncomplete] = useState(false);
  const [currentOnboardingStep, setCurrentOnboardingStep] = useState(0);
  const [checkIns, setCheckIns] = useState<CheckInData[]>([]);
  const [hasConsent, setHasConsent] = useState(false);

  // ======================
  // LOAD DATA ON MOUNT
  // ======================

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setIsProfileLoading(true);

      // Carregar dados em paralelo
      const [
        profileData,
        consentData,
        checkInsData,
        incompleteData,
        onboardingCompleted,
        currentStep,
      ] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.WELLNESS_PROFILE),
        AsyncStorage.getItem(STORAGE_KEYS.WELLNESS_CONSENT),
        AsyncStorage.getItem(STORAGE_KEYS.WELLNESS_CHECKINS),
        AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING_INCOMPLETE),
        onboardingService.isOnboardingCompleted(),
        onboardingService.getCurrentStep(),
      ]);

      // Profile - com parse seguro
      if (profileData) {
        const parsed = safeJsonParse<MotherProfile | null>(profileData, null);
        if (parsed) {
          setProfile(parsed);
        }
      }

      // Consent
      setHasConsent(consentData === 'true');

      // Check-ins - com parse seguro
      if (checkInsData) {
        const parsed = safeJsonParse<CheckInData[]>(checkInsData, []);
        setCheckIns(parsed);
      }

      // Onboarding status
      setOnboardingIncomplete(incompleteData === 'true');
      setIsOnboardingComplete(onboardingCompleted);
      setCurrentOnboardingStep(currentStep);

      // Safe log - usar safeJsonParse para evitar crash no log também
      const checkInsCount = checkInsData ? safeJsonParse<CheckInData[]>(checkInsData, []).length : 0;
      logger.info('[WellnessContext] Dados carregados', {
        hasProfile: !!profileData,
        hasConsent: consentData === 'true',
        checkInsCount,
        onboardingComplete: onboardingCompleted,
      });
    } catch (error) {
      logger.error('[WellnessContext] Erro ao carregar dados', error);
    } finally {
      setIsProfileLoading(false);
    }
  };

  // ======================
  // PROFILE ACTIONS
  // ======================

  const loadProfile = useCallback(async () => {
    try {
      setIsProfileLoading(true);
      const profileData = await AsyncStorage.getItem(STORAGE_KEYS.WELLNESS_PROFILE);
      if (profileData) {
        const parsed = safeJsonParse<MotherProfile | null>(profileData, null);
        if (parsed) {
          setProfile(parsed);
        }
      }
    } catch (error) {
      logger.error('[WellnessContext] Erro ao carregar perfil', error);
    } finally {
      setIsProfileLoading(false);
    }
  }, []);

  const updateProfile = useCallback(
    async (data: Partial<MotherProfile>): Promise<boolean> => {
      try {
        const updatedProfile: MotherProfile = {
          ...createInitialMotherProfile(),
          ...profile,
          ...data,
          updated_at: new Date().toISOString(),
        };

        await AsyncStorage.setItem(STORAGE_KEYS.WELLNESS_PROFILE, JSON.stringify(updatedProfile));

        setProfile(updatedProfile);

        logger.info('[WellnessContext] Perfil atualizado', {
          fields: Object.keys(data),
        });

        return true;
      } catch (error) {
        logger.error('[WellnessContext] Erro ao atualizar perfil', error);
        return false;
      }
    },
    [profile]
  );

  // ======================
  // ONBOARDING ACTIONS
  // ======================

  const completeOnboarding = useCallback(
    async (data: Partial<MotherProfile>): Promise<boolean> => {
      try {
        // Atualizar perfil
        const success = await updateProfile({
          ...data,
          onboarding_completed: true,
          onboarding_step: 12,
        });

        if (!success) return false;

        // Marcar onboarding como completo no serviço existente
        const onboardingData = {
          display_name: data.name || data.display_name || '',
          life_stage_generic: data.phase || data.life_stage_generic || '',
          main_goals: data.wellness_goals || data.main_goals || [],
          baseline_emotion: data.emotional_state || data.baseline_emotion || '',
          first_focus: data.first_focus || 'emotional_care',
          notification_opt_in: data.notification_enabled ?? data.notification_opt_in ?? true,
        };

        await onboardingService.completeOnboarding(onboardingData);

        setIsOnboardingComplete(true);
        setCurrentOnboardingStep(12);

        logger.info('[WellnessContext] Onboarding completo', {
          name: data.name,
          phase: data.phase,
        });

        return true;
      } catch (error) {
        logger.error('[WellnessContext] Erro ao completar onboarding', error);
        return false;
      }
    },
    [updateProfile]
  );

  const skipOptionalSteps = useCallback(() => {
    setOnboardingIncomplete(true);
    AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING_INCOMPLETE, 'true').catch((error) => {
      logger.error('[WellnessContext] Erro ao salvar flag de skip', error);
    });
  }, []);

  const setOnboardingStep = useCallback((step: number) => {
    setCurrentOnboardingStep(step);
    onboardingService.saveOnboardingStep(step, {}).catch((error) => {
      logger.error('[WellnessContext] Erro ao salvar step', error);
    });
  }, []);

  // ======================
  // CONSENT ACTIONS
  // ======================

  const giveConsent = useCallback(async (): Promise<boolean> => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.WELLNESS_CONSENT, 'true');
      await updateProfile({
        wellness_consent: true,
        wellness_consent_date: new Date().toISOString(),
      });
      setHasConsent(true);
      logger.info('[WellnessContext] Consentimento concedido');
      return true;
    } catch (error) {
      logger.error('[WellnessContext] Erro ao salvar consentimento', error);
      return false;
    }
  }, [updateProfile]);

  const revokeConsent = useCallback(async (): Promise<boolean> => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.WELLNESS_CONSENT, 'false');
      await updateProfile({
        wellness_consent: false,
      });
      setHasConsent(false);
      logger.info('[WellnessContext] Consentimento revogado');
      return true;
    } catch (error) {
      logger.error('[WellnessContext] Erro ao revogar consentimento', error);
      return false;
    }
  }, [updateProfile]);

  // ======================
  // CHECK-IN ACTIONS (Placeholder para Release B)
  // ======================

  const saveCheckIn = useCallback(
    async (data: Omit<CheckInData, 'id' | 'created_at'>): Promise<boolean> => {
      try {
        const newCheckIn: CheckInData = {
          ...data,
          id: `checkin_${Date.now()}`,
          created_at: new Date().toISOString(),
        };

        const updatedCheckIns = [...checkIns, newCheckIn];
        await AsyncStorage.setItem(STORAGE_KEYS.WELLNESS_CHECKINS, JSON.stringify(updatedCheckIns));

        setCheckIns(updatedCheckIns);

        logger.info('[WellnessContext] Check-in salvo', {
          date: data.date,
          mood: data.mood,
        });

        return true;
      } catch (error) {
        logger.error('[WellnessContext] Erro ao salvar check-in', error);
        return false;
      }
    },
    [checkIns]
  );

  // ======================
  // DATA MANAGEMENT
  // ======================

  const exportData = useCallback((): string => {
    const exportPayload = {
      profile,
      checkIns,
      exportedAt: new Date().toISOString(),
      version: '1.0.0',
    };
    return JSON.stringify(exportPayload, null, 2);
  }, [profile, checkIns]);

  const clearAllData = useCallback(async (): Promise<void> => {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.WELLNESS_PROFILE,
        STORAGE_KEYS.WELLNESS_CONSENT,
        STORAGE_KEYS.WELLNESS_CHECKINS,
        STORAGE_KEYS.ONBOARDING_INCOMPLETE,
      ]);

      setProfile(null);
      setHasConsent(false);
      setCheckIns([]);
      setOnboardingIncomplete(false);
      setIsOnboardingComplete(false);
      setCurrentOnboardingStep(0);

      logger.info('[WellnessContext] Todos os dados foram limpos');
    } catch (error) {
      logger.error('[WellnessContext] Erro ao limpar dados', error);
    }
  }, []);

  // ======================
  // COMPUTED VALUES
  // ======================

  const todayCheckIn = useMemo((): CheckInData | null => {
    const today = new Date().toISOString().split('T')[0];
    return checkIns.find((c) => c.date === today) || null;
  }, [checkIns]);

  const currentStreak = useMemo((): number => {
    if (checkIns.length === 0) return 0;

    // Extrair datas ÚNICAS primeiro (evita contar duplicados)
    const uniqueDates = [
      ...new Set(
        checkIns.map((c) => {
          const d = new Date(c.date);
          // Normalizar para formato YYYY-MM-DD
          return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        })
      ),
    ].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let lastDate = today;

    for (const dateStr of uniqueDates) {
      const checkDate = new Date(dateStr);
      checkDate.setHours(0, 0, 0, 0);

      const diffDays = Math.floor(
        (lastDate.getTime() - checkDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (diffDays <= 1) {
        streak++;
        lastDate = checkDate;
      } else {
        break;
      }
    }
    return streak;
  }, [checkIns]);

  // Placeholder para Release B
  const weeklyInsight: WeeklyInsight | null = null;

  // ======================
  // CONTEXT VALUE
  // ======================

  const contextValue = useMemo<WellnessContextType>(
    () => ({
      // State
      profile,
      isProfileLoading,
      isOnboardingComplete,
      onboardingIncomplete,
      currentOnboardingStep,
      todayCheckIn,
      checkIns,
      currentStreak,
      weeklyInsight,
      hasConsent,

      // Actions
      updateProfile,
      loadProfile,
      completeOnboarding,
      skipOptionalSteps,
      setOnboardingStep,
      giveConsent,
      revokeConsent,
      saveCheckIn,
      exportData,
      clearAllData,
    }),
    [
      profile,
      isProfileLoading,
      isOnboardingComplete,
      onboardingIncomplete,
      currentOnboardingStep,
      todayCheckIn,
      checkIns,
      currentStreak,
      weeklyInsight,
      hasConsent,
      updateProfile,
      loadProfile,
      completeOnboarding,
      skipOptionalSteps,
      setOnboardingStep,
      giveConsent,
      revokeConsent,
      saveCheckIn,
      exportData,
      clearAllData,
    ]
  );

  return <WellnessContext.Provider value={contextValue}>{children}</WellnessContext.Provider>;
}

// ======================
// HOOKS
// ======================

/**
 * Hook principal para acessar o contexto de wellness
 */
export function useWellness(): WellnessContextType {
  const context = useContext(WellnessContext);
  if (context === undefined) {
    throw new Error('useWellness must be used within a WellnessProvider');
  }
  return context;
}

/**
 * Hook para acessar apenas o perfil materno
 * Otimizado para componentes que só precisam do perfil
 */
export function useMotherProfile() {
  const { profile, isProfileLoading, updateProfile, loadProfile } = useWellness();

  return {
    profile,
    isLoading: isProfileLoading,
    updateProfile,
    loadProfile,
  };
}

/**
 * Hook para acessar status do onboarding
 */
export function useOnboardingStatus() {
  const {
    isOnboardingComplete,
    onboardingIncomplete,
    currentOnboardingStep,
    setOnboardingStep,
    completeOnboarding,
    skipOptionalSteps,
  } = useWellness();

  return {
    isComplete: isOnboardingComplete,
    isIncomplete: onboardingIncomplete,
    currentStep: currentOnboardingStep,
    setStep: setOnboardingStep,
    complete: completeOnboarding,
    skipOptional: skipOptionalSteps,
  };
}

/**
 * Hook para acessar check-ins
 * Placeholder otimizado para Release B
 */
export function useCheckIns() {
  const { todayCheckIn, checkIns, currentStreak, saveCheckIn } = useWellness();

  return {
    today: todayCheckIn,
    all: checkIns,
    streak: currentStreak,
    save: saveCheckIn,
  };
}

/**
 * Hook para acessar consentimento
 */
export function useWellnessConsent() {
  const { hasConsent, giveConsent, revokeConsent } = useWellness();

  return {
    hasConsent,
    give: giveConsent,
    revoke: revokeConsent,
  };
}

export default WellnessProvider;
