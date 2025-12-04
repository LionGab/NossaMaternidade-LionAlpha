/**
 * Wellness Types
 * Tipos para o sistema de bem-estar maternal
 * Release A - Base de Wellness + Onboarding Expandido
 */

import type { UserProfile } from '@/types/user';

// ======================
// ENUMS - Novos campos de wellness
// ======================

/**
 * Desafios de saúde física
 * Step 5 do onboarding expandido
 */
export enum PhysicalChallenge {
  BACK_PAIN = 'back_pain',
  FATIGUE = 'fatigue',
  NAUSEA = 'nausea',
  SWELLING = 'swelling',
  HEADACHES = 'headaches',
  MUSCLE_PAIN = 'muscle_pain',
  NONE = 'none',
}

export const PhysicalChallengeLabels: Record<PhysicalChallenge, string> = {
  [PhysicalChallenge.BACK_PAIN]: 'Dor nas costas',
  [PhysicalChallenge.FATIGUE]: 'Fadiga constante',
  [PhysicalChallenge.NAUSEA]: 'Enjoos',
  [PhysicalChallenge.SWELLING]: 'Inchaço',
  [PhysicalChallenge.HEADACHES]: 'Dores de cabeça',
  [PhysicalChallenge.MUSCLE_PAIN]: 'Dores musculares',
  [PhysicalChallenge.NONE]: 'Nenhum no momento',
};

/**
 * Desafios de sono
 * Step 6 do onboarding expandido
 */
export enum SleepChallenge {
  INSOMNIA = 'insomnia',
  BABY_WAKES = 'baby_wakes',
  ANXIETY_SLEEP = 'anxiety_sleep',
  DISCOMFORT = 'discomfort',
  SCHEDULE = 'schedule',
  NONE = 'none',
}

export const SleepChallengeLabels: Record<SleepChallenge, string> = {
  [SleepChallenge.INSOMNIA]: 'Insônia',
  [SleepChallenge.BABY_WAKES]: 'Bebê acorda muito',
  [SleepChallenge.ANXIETY_SLEEP]: 'Ansiedade antes de dormir',
  [SleepChallenge.DISCOMFORT]: 'Desconforto físico',
  [SleepChallenge.SCHEDULE]: 'Horários irregulares',
  [SleepChallenge.NONE]: 'Durmo bem',
};

/**
 * Estado emocional atual (com mais nuances)
 * Step 7 do onboarding expandido
 */
export enum EmotionalState {
  STABLE = 'stable',
  ANXIOUS = 'anxious',
  OVERWHELMED = 'overwhelmed',
  SAD = 'sad',
  IRRITABLE = 'irritable',
  HOPEFUL = 'hopeful',
  NEED_SUPPORT = 'need_support',
}

export const EmotionalStateLabels: Record<EmotionalState, string> = {
  [EmotionalState.STABLE]: 'Estável',
  [EmotionalState.ANXIOUS]: 'Ansiosa',
  [EmotionalState.OVERWHELMED]: 'Sobrecarregada',
  [EmotionalState.SAD]: 'Triste',
  [EmotionalState.IRRITABLE]: 'Irritada',
  [EmotionalState.HOPEFUL]: 'Esperançosa',
  [EmotionalState.NEED_SUPPORT]: 'Preciso de apoio',
};

/**
 * Relação com parceiro(a)
 * Step 10 do onboarding expandido (opcional)
 */
export enum PartnerRelationship {
  SUPPORTIVE = 'supportive',
  PRESENT = 'present',
  DISTANT = 'distant',
  CONFLICT = 'conflict',
  SINGLE = 'single',
  PREFER_NOT_SAY = 'prefer_not_say',
}

export const PartnerRelationshipLabels: Record<PartnerRelationship, string> = {
  [PartnerRelationship.SUPPORTIVE]: 'Muito presente e apoiador',
  [PartnerRelationship.PRESENT]: 'Presente, mas poderia ajudar mais',
  [PartnerRelationship.DISTANT]: 'Distante',
  [PartnerRelationship.CONFLICT]: 'Passando por conflitos',
  [PartnerRelationship.SINGLE]: 'Sou mãe solo',
  [PartnerRelationship.PREFER_NOT_SAY]: 'Prefiro não responder',
};

/**
 * Tipo de acompanhamento profissional
 * Step 10 do onboarding expandido
 */
export enum ProfessionalSupport {
  THERAPIST = 'therapist',
  PSYCHIATRIST = 'psychiatrist',
  OBGYN = 'obgyn',
  PEDIATRICIAN = 'pediatrician',
  DOULA = 'doula',
  NONE = 'none',
  LOOKING = 'looking',
}

export const ProfessionalSupportLabels: Record<ProfessionalSupport, string> = {
  [ProfessionalSupport.THERAPIST]: 'Psicóloga/Terapeuta',
  [ProfessionalSupport.PSYCHIATRIST]: 'Psiquiatra',
  [ProfessionalSupport.OBGYN]: 'Obstetra/Ginecologista',
  [ProfessionalSupport.PEDIATRICIAN]: 'Pediatra',
  [ProfessionalSupport.DOULA]: 'Doula',
  [ProfessionalSupport.NONE]: 'Nenhum no momento',
  [ProfessionalSupport.LOOKING]: 'Estou procurando',
};

/**
 * Objetivos principais (expandido)
 * Step 12 do onboarding expandido
 */
export enum WellnessGoal {
  EMOTIONAL_BALANCE = 'emotional_balance',
  BETTER_SLEEP = 'better_sleep',
  SELF_CARE = 'self_care',
  CONNECT_MOMS = 'connect_moms',
  LEARN_PARENTING = 'learn_parenting',
  REDUCE_ANXIETY = 'reduce_anxiety',
  ORGANIZE_ROUTINE = 'organize_routine',
}

export const WellnessGoalLabels: Record<WellnessGoal, string> = {
  [WellnessGoal.EMOTIONAL_BALANCE]: 'Equilíbrio emocional',
  [WellnessGoal.BETTER_SLEEP]: 'Dormir melhor',
  [WellnessGoal.SELF_CARE]: 'Cuidar mais de mim',
  [WellnessGoal.CONNECT_MOMS]: 'Conectar com outras mães',
  [WellnessGoal.LEARN_PARENTING]: 'Aprender sobre maternidade',
  [WellnessGoal.REDUCE_ANXIETY]: 'Reduzir ansiedade',
  [WellnessGoal.ORGANIZE_ROUTINE]: 'Organizar minha rotina',
};

// ======================
// INTERFACES
// ======================

/**
 * Dados expandidos do perfil materno
 * Estende UserProfile com campos de wellness
 */
export interface MotherProfile extends UserProfile {
  // Campos de wellness (novos)
  physical_challenges?: PhysicalChallenge[];
  sleep_challenges?: SleepChallenge[];
  emotional_state?: EmotionalState;
  partner_relationship?: PartnerRelationship;
  professional_support?: ProfessionalSupport[];
  wellness_goals?: WellnessGoal[];

  // Consentimento e flags
  wellness_consent?: boolean;
  wellness_consent_date?: string; // ISO timestamp
  onboarding_incomplete?: boolean; // true se pulou steps 5-10

  // Preferências de lembretes
  preferred_reminder_hour?: string; // HH:mm format
  reminder_days?: number[]; // 0-6 (domingo-sábado)
}

/**
 * Dados de um check-in diário
 * Placeholder para Release B
 */
export interface CheckInData {
  id: string;
  date: string; // ISO date string (YYYY-MM-DD)
  mood: number; // 1-5
  energy: number; // 1-5
  sleep_hours?: number;
  sleep_quality?: number; // 1-5
  physical_symptoms?: PhysicalChallenge[];
  emotional_state?: EmotionalState;
  activities?: string[];
  notes?: string;
  created_at: string;
}

/**
 * Insight semanal
 * Placeholder para Release B
 */
export interface WeeklyInsight {
  week_start: string;
  week_end: string;
  average_mood: number;
  average_energy: number;
  average_sleep: number;
  mood_trend: 'improving' | 'stable' | 'declining';
  energy_trend: 'improving' | 'stable' | 'declining';
  top_activities: string[];
  top_symptoms: string[];
  recommendations: string[];
}

/**
 * Estado do contexto de Wellness
 */
export interface WellnessState {
  // Perfil
  profile: MotherProfile | null;
  isProfileLoading: boolean;

  // Onboarding
  isOnboardingComplete: boolean;
  onboardingIncomplete: boolean; // pulou steps opcionais
  currentOnboardingStep: number;

  // Check-ins (placeholder para Release B)
  todayCheckIn: CheckInData | null;
  checkIns: CheckInData[];
  currentStreak: number;

  // Insights (placeholder para Release B)
  weeklyInsight: WeeklyInsight | null;

  // Consentimento
  hasConsent: boolean;
}

/**
 * Ações disponíveis no WellnessContext
 */
export interface WellnessActions {
  // Profile
  updateProfile: (data: Partial<MotherProfile>) => Promise<boolean>;
  loadProfile: () => Promise<void>;

  // Onboarding
  completeOnboarding: (data: Partial<MotherProfile>) => Promise<boolean>;
  skipOptionalSteps: () => void;
  setOnboardingStep: (step: number) => void;

  // Consent
  giveConsent: () => Promise<boolean>;
  revokeConsent: () => Promise<boolean>;

  // Check-ins (placeholder para Release B)
  saveCheckIn: (data: Omit<CheckInData, 'id' | 'created_at'>) => Promise<boolean>;

  // Data management
  exportData: () => string;
  clearAllData: () => Promise<void>;
}

/**
 * Tipo completo do contexto
 */
export interface WellnessContextType extends WellnessState, WellnessActions {}

// ======================
// HELPERS
// ======================

/**
 * Cria um perfil inicial vazio
 */
export const createInitialMotherProfile = (): Partial<MotherProfile> => ({
  physical_challenges: [],
  sleep_challenges: [],
  professional_support: [],
  wellness_goals: [],
  wellness_consent: false,
  onboarding_incomplete: false,
  reminder_days: [1, 2, 3, 4, 5], // seg-sex por padrão
});

/**
 * Verifica se o perfil tem dados mínimos de wellness
 */
export const hasMinimumWellnessData = (profile: Partial<MotherProfile>): boolean => {
  return !!(profile.name && profile.phase && profile.wellness_consent);
};

/**
 * Calcula completude do perfil (0-100%)
 */
export const calculateProfileCompleteness = (profile: Partial<MotherProfile>): number => {
  const fields = [
    'name',
    'phase',
    'physical_challenges',
    'sleep_challenges',
    'emotional_state',
    'support_network',
    'wellness_goals',
    'wellness_consent',
  ];

  const filledFields = fields.filter((field) => {
    const value = profile[field as keyof MotherProfile];
    if (Array.isArray(value)) return value.length > 0;
    return value !== undefined && value !== null && value !== '';
  });

  return Math.round((filledFields.length / fields.length) * 100);
};
