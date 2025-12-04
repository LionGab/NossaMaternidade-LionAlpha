/**
 * Wellness Feature Module
 * Release A - Base de Wellness + Onboarding Expandido
 *
 * Exports públicos do módulo de bem-estar
 */

// Types
export * from './types';

// Context & Hooks
export {
  WellnessProvider,
  useWellness,
  useMotherProfile,
  useOnboardingStatus,
  useCheckIns,
  useWellnessConsent,
} from './context/WellnessContext';
