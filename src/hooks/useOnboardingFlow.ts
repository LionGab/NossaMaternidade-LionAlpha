// hooks/useOnboardingFlow.ts
import { useReducer, useCallback, useMemo } from 'react';

import { UserProfile, UserStage } from '@/types/user';

import { useHaptics } from './useHaptics';

type OnboardingState = {
  step: number;
  formData: UserProfile;
  sliderValue: number;
  termsAccepted: boolean;
  privacyAccepted: boolean;
};

type OnboardingAction =
  | { type: 'NEXT_STEP' }
  | { type: 'PREV_STEP' }
  | { type: 'UPDATE_DATA'; key: keyof UserProfile; value: UserProfile[keyof UserProfile] }
  | { type: 'SET_SLIDER'; value: number }
  | { type: 'TOGGLE_TERMS' }
  | { type: 'TOGGLE_PRIVACY' }
  | { type: 'RESET' }
  | { type: 'SET_STEP'; step: number }
  | { type: 'LOAD_PROFILE'; profile: UserProfile };

const TOTAL_STEPS = 9;

const initialState: OnboardingState = {
  step: 1,
  formData: {},
  sliderValue: 20,
  termsAccepted: false,
  privacyAccepted: false,
};

function onboardingReducer(state: OnboardingState, action: OnboardingAction): OnboardingState {
  switch (action.type) {
    case 'NEXT_STEP': {
      const needsTimeline =
        state.formData.stage === UserStage.PREGNANT || state.formData.stage === UserStage.NEW_MOM;

      // Lógica de skip: se está no step 3 e não precisa de timeline, pula para 5
      const next = state.step === 3 && !needsTimeline ? 5 : state.step + 1;

      return {
        ...state,
        step: Math.min(next, TOTAL_STEPS),
      };
    }

    case 'PREV_STEP': {
      const needsTimeline =
        state.formData.stage === UserStage.PREGNANT || state.formData.stage === UserStage.NEW_MOM;

      // Lógica reversa: se está no step 5 e não precisa de timeline, volta para 3
      const prev = state.step === 5 && !needsTimeline ? 3 : state.step - 1;

      return {
        ...state,
        step: Math.max(1, prev),
      };
    }

    case 'UPDATE_DATA':
      return {
        ...state,
        formData: {
          ...state.formData,
          [action.key]: action.value,
        },
      };

    case 'SET_SLIDER':
      return {
        ...state,
        sliderValue: Math.max(0, Math.min(42, action.value)), // Validação: 0-42 semanas
      };

    case 'TOGGLE_TERMS':
      return {
        ...state,
        termsAccepted: !state.termsAccepted,
      };

    case 'TOGGLE_PRIVACY':
      return {
        ...state,
        privacyAccepted: !state.privacyAccepted,
      };

    case 'SET_STEP':
      return {
        ...state,
        step: Math.max(1, Math.min(TOTAL_STEPS, action.step)),
      };

    case 'LOAD_PROFILE':
      return {
        ...state,
        formData: action.profile,
      };

    case 'RESET':
      return initialState;

    default:
      return state;
  }
}

export const useOnboardingFlow = () => {
  const [state, dispatch] = useReducer(onboardingReducer, initialState);
  const haptics = useHaptics();

  const nextStep = useCallback(() => {
    haptics.medium();
    dispatch({ type: 'NEXT_STEP' });
  }, [haptics]);

  const prevStep = useCallback(() => {
    haptics.light();
    dispatch({ type: 'PREV_STEP' });
  }, [haptics]);

  const updateData = useCallback(
    <K extends keyof UserProfile>(key: K, value: UserProfile[K]) => {
      haptics.light();
      dispatch({ type: 'UPDATE_DATA', key, value });
    },
    [haptics]
  );

  const setSliderValue = useCallback((value: number) => {
    dispatch({ type: 'SET_SLIDER', value });
  }, []);

  const toggleTerms = useCallback(() => {
    haptics.light();
    dispatch({ type: 'TOGGLE_TERMS' });
  }, [haptics]);

  const togglePrivacy = useCallback(() => {
    haptics.light();
    dispatch({ type: 'TOGGLE_PRIVACY' });
  }, [haptics]);

  const setStep = useCallback((step: number) => {
    dispatch({ type: 'SET_STEP', step });
  }, []);

  const loadProfile = useCallback((profile: UserProfile) => {
    dispatch({ type: 'LOAD_PROFILE', profile });
  }, []);

  const reset = useCallback(() => {
    haptics.light();
    dispatch({ type: 'RESET' });
  }, [haptics]);

  const canProceed = useMemo(
    () => state.termsAccepted && state.privacyAccepted,
    [state.termsAccepted, state.privacyAccepted]
  );

  const progress = useMemo(() => ((state.step - 1) / (TOTAL_STEPS - 1)) * 100, [state.step]);

  const isStepValid = useCallback(
    (stepNumber: number): boolean => {
      switch (stepNumber) {
        case 1: // Welcome - sempre válido
          return true;
        case 2: // Name
          return !!state.formData.name;
        case 3: // Stage
          return !!state.formData.stage;
        case 4: // Timeline (pode ser pulado)
          return true;
        case 5: // Challenge
          return !!state.formData.biggestChallenge;
        case 6: // Support
          return !!state.formData.supportLevel;
        case 7: // Emotion
          return !!state.formData.currentFeeling;
        case 8: // Need
          return !!state.formData.primaryNeed;
        case 9: // Terms
          return state.termsAccepted && state.privacyAccepted;
        default:
          return false;
      }
    },
    [state.formData, state.termsAccepted, state.privacyAccepted]
  );

  return {
    // State
    step: state.step,
    formData: state.formData,
    sliderValue: state.sliderValue,
    termsAccepted: state.termsAccepted,
    privacyAccepted: state.privacyAccepted,

    // Constants
    TOTAL_STEPS,

    // Actions
    nextStep,
    prevStep,
    updateData,
    setSliderValue,
    toggleTerms,
    togglePrivacy,
    setStep,
    loadProfile,
    reset,

    // Computed
    canProceed,
    progress,
    isStepValid,
  };
};
