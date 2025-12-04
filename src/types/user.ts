/**
 * Tipos de usuário e perfil
 * Seguindo o schema do Supabase
 */

import { EmotionType } from './emotion';

export type MaternityPhase =
  | 'tentante'
  | 'gestacao'
  | 'pos_parto'
  | 'primeira_infancia'
  | 'maternidade';

export type PregnancyTrimester = '1' | '2' | '3';

export interface UserProfile {
  // Campos básicos (obrigatórios)
  id?: string;
  email?: string;
  name?: string;

  // Campos opcionais de perfil
  avatar_url?: string;
  phone?: string;

  // Dados da maternidade
  phase?: MaternityPhase;
  pregnancy_week?: number; // semanas de gestação (1-42)
  pregnancy_trimester?: PregnancyTrimester;
  due_date?: string; // ISO date string
  baby_birth_date?: string; // ISO date string
  baby_name?: string;
  baby_age_months?: number;

  // Estado emocional atual (cache)
  current_emotion?: EmotionType | null;
  last_emotion_update?: string; // ISO timestamp

  // Preferências
  notification_enabled?: boolean;
  daily_reminder_time?: string; // HH:mm format
  theme_preference?: 'light' | 'dark' | 'auto';

  // Campos de onboarding
  onboarding_completed?: boolean;
  onboarding_step?: number;

  // Campos do perfil completo (Fase 2)
  bio?: string;
  city?: string;
  state?: string;
  preferred_topics?: string[]; // ex: ['amamentacao', 'sono', 'desenvolvimento']
  support_network?: 'family' | 'friends' | 'alone' | 'partner';

  // Subscription
  subscription_tier?: 'free' | 'premium';
  subscription_expires_at?: string;

  // Timestamps
  created_at?: string;
  updated_at?: string;
  last_seen_at?: string;

  // Campos de Wellness (Release A)
  physical_challenges?: string[]; // PhysicalChallenge[]
  sleep_challenges?: string[]; // SleepChallenge[]
  emotional_state?: string; // EmotionalState
  partner_relationship?: string; // PartnerRelationship
  professional_support?: string[]; // ProfessionalSupport[]
  wellness_goals?: string[]; // WellnessGoal[]
  wellness_consent?: boolean;
  wellness_consent_date?: string; // ISO timestamp
  onboarding_incomplete?: boolean; // true se pulou steps opcionais
  preferred_reminder_hour?: string; // HH:mm format
  reminder_days?: number[]; // 0-6 (domingo-sábado)

  // Legacy fields (mantidos para compatibilidade)
  full_name?: string;
  display_name?: string; // Nome/apelido do onboarding rápido
  stage?: UserStage;
  timelineInfo?: string;
  biggestChallenge?: UserChallenge;
  supportLevel?: UserSupport;
  currentFeeling?: UserEmotion;
  primaryNeed?: string;
  notificationsEnabled?: boolean;
  motherhood_stage?: 'trying_to_conceive' | 'pregnant' | 'postpartum' | 'experienced_mother';
  baby_gender?: 'male' | 'female' | 'unknown' | 'prefer_not_say';
  life_stage_generic?: 'pregnant' | 'has_children' | 'trying' | 'caregiver' | 'self_care';
  main_goals?: string[];
  baseline_emotion?: 'bem' | 'triste' | 'ansiosa' | 'cansada' | 'calma';
  first_focus?: 'emotional_care' | 'organization' | 'reduce_fatigue' | 'community' | 'content';
  preferred_language_tone?: 'friendly' | 'direct' | 'mentor';
  notification_opt_in?: boolean;
  emotions?: string[];
  needs?: string[];
  interests?: string[];
  theme?: 'light' | 'dark' | 'auto';
  language?: string;
  notifications_enabled?: boolean;
}

export interface UserStats {
  total_messages: number;
  total_check_ins: number;
  streak_days: number;
  habits_completed: number;
  posts_created: number;
  helpful_votes_received: number;
}

export interface OnboardingData {
  name: string;
  phase: MaternityPhase;
  pregnancy_week?: number;
  due_date?: string;
  baby_birth_date?: string;
  notification_enabled: boolean;
}

// Onboarding enums - valores usados pelos screens
export enum UserStage {
  TRYING = 'Tentante',
  PREGNANT = 'Gestante',
  NEW_MOM = 'Puérpera (Recém-nascido)',
  MOM = 'Mãe experiente',
}

export enum UserEmotion {
  ANXIOUS = 'Ansiosa',
  TIRED = 'Cansada',
  GUILTY = 'Culpada',
  HAPPY = 'Feliz',
  CONFUSED = 'Confusa',
}

export enum UserChallenge {
  BREASTFEEDING = 'Amamentação',
  SLEEP = 'Sono do bebê',
  ANXIETY = 'Ansiedade e culpa',
  LONELINESS = 'Solidão',
  ROUTINE = 'Organização da rotina',
  PARTNER = 'Relação com parceiro',
}

export enum UserSupport {
  HIGH = 'Tenho, graças a Deus',
  MEDIUM = 'Às vezes/Pouca',
  LOW = 'Me sinto muito sozinha',
}

export enum UserNeed {
  CHAT = 'Desabafar',
  LEARN = 'Aprender',
  CALM = 'Acalmar',
  CONNECT = 'Conectar',
}
