/**
 * Tipos do Banco de Dados - Nossa Maternidade
 * Espelha a estrutura do Supabase PostgreSQL
 *
 * NOTA: Este arquivo pode ser regenerado automaticamente com:
 * npm run generate:types
 *
 * @version 1.0.0
 */

// ======================
// 📊 Database Schema
// ======================

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: ProfileRow;
        Insert: ProfileInsert;
        Update: ProfileUpdate;
      };
      check_in_logs: {
        Row: CheckInLogRow;
        Insert: CheckInLogInsert;
        Update: CheckInLogUpdate;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      phase_type: PhaseType;
      emotion_type: EmotionType;
      life_stage_type: LifeStageType;
      language_tone_type: LanguageToneType;
      first_focus_type: FirstFocusType;
      theme_type: ThemeType;
      subscription_type: SubscriptionType;
      support_network_type: SupportNetworkType;
      motherhood_stage_type: MotherhoodStageType;
      baby_gender_type: BabyGenderType;
      pregnancy_trimester_type: PregnancyTrimesterType;
    };
  };
}

// ======================
// 🎭 Enum Types
// ======================

export type PhaseType = 'tentante' | 'gestacao' | 'pos_parto' | 'primeira_infancia' | 'maternidade';

export type EmotionType = 'bem' | 'triste' | 'ansiosa' | 'cansada' | 'calma';

export type LifeStageType = 'pregnant' | 'has_children' | 'trying' | 'caregiver' | 'self_care';

export type LanguageToneType = 'friendly' | 'direct' | 'mentor';

export type FirstFocusType =
  | 'emotional_care'
  | 'organization'
  | 'reduce_fatigue'
  | 'community'
  | 'content';

export type ThemeType = 'light' | 'dark' | 'auto';

export type SubscriptionType = 'free' | 'premium';

export type SupportNetworkType = 'family' | 'friends' | 'alone' | 'partner';

export type MotherhoodStageType =
  | 'trying_to_conceive'
  | 'pregnant'
  | 'postpartum'
  | 'experienced_mother';

export type BabyGenderType = 'male' | 'female' | 'unknown' | 'prefer_not_say';

export type PregnancyTrimesterType = '1' | '2' | '3';

// ======================
// 👤 Profiles Table
// ======================

export interface ProfileRow {
  // Identificadores
  id: string; // UUID
  email: string | null;

  // Dados basicos
  name: string | null;
  full_name: string | null;
  display_name: string | null;
  avatar_url: string | null;
  phone: string | null;

  // Dados da maternidade
  phase: PhaseType | null;
  pregnancy_week: number | null;
  pregnancy_trimester: PregnancyTrimesterType | null;
  due_date: string | null; // DATE
  baby_birth_date: string | null; // DATE
  baby_name: string | null;
  baby_age_months: number | null;
  motherhood_stage: MotherhoodStageType | null;
  baby_gender: BabyGenderType | null;

  // Estado emocional (cache)
  current_emotion: EmotionType | null;
  last_emotion_update: string | null; // TIMESTAMPTZ

  // Preferencias
  notification_enabled: boolean;
  notifications_enabled: boolean;
  notification_opt_in: boolean;
  daily_reminder_time: string | null; // TIME
  theme_preference: ThemeType;
  theme: ThemeType;
  language: string;

  // Onboarding
  onboarding_completed: boolean;
  onboarding_step: number;

  // Onboarding rapido (campos adicionais)
  life_stage_generic: LifeStageType | null;
  main_goals: string[]; // JSONB array
  baseline_emotion: EmotionType | null;
  first_focus: FirstFocusType | null;
  preferred_language_tone: LanguageToneType | null;

  // Perfil completo
  bio: string | null;
  city: string | null;
  state: string | null;
  preferred_topics: string[]; // JSONB array
  support_network: SupportNetworkType | null;

  // Subscription
  subscription_tier: SubscriptionType;
  subscription_expires_at: string | null; // TIMESTAMPTZ

  // Timestamps
  created_at: string; // TIMESTAMPTZ
  updated_at: string; // TIMESTAMPTZ
  last_seen_at: string; // TIMESTAMPTZ
}

export interface ProfileInsert {
  // Obrigatorio
  id: string;

  // Opcionais (com defaults)
  email?: string | null;
  name?: string | null;
  full_name?: string | null;
  display_name?: string | null;
  avatar_url?: string | null;
  phone?: string | null;
  phase?: PhaseType | null;
  pregnancy_week?: number | null;
  pregnancy_trimester?: PregnancyTrimesterType | null;
  due_date?: string | null;
  baby_birth_date?: string | null;
  baby_name?: string | null;
  baby_age_months?: number | null;
  motherhood_stage?: MotherhoodStageType | null;
  baby_gender?: BabyGenderType | null;
  current_emotion?: EmotionType | null;
  last_emotion_update?: string | null;
  notification_enabled?: boolean;
  notifications_enabled?: boolean;
  notification_opt_in?: boolean;
  daily_reminder_time?: string | null;
  theme_preference?: ThemeType;
  theme?: ThemeType;
  language?: string;
  onboarding_completed?: boolean;
  onboarding_step?: number;
  life_stage_generic?: LifeStageType | null;
  main_goals?: string[];
  baseline_emotion?: EmotionType | null;
  first_focus?: FirstFocusType | null;
  preferred_language_tone?: LanguageToneType | null;
  bio?: string | null;
  city?: string | null;
  state?: string | null;
  preferred_topics?: string[];
  support_network?: SupportNetworkType | null;
  subscription_tier?: SubscriptionType;
  subscription_expires_at?: string | null;
  created_at?: string;
  updated_at?: string;
  last_seen_at?: string;
}

export interface ProfileUpdate {
  email?: string | null;
  name?: string | null;
  full_name?: string | null;
  display_name?: string | null;
  avatar_url?: string | null;
  phone?: string | null;
  phase?: PhaseType | null;
  pregnancy_week?: number | null;
  pregnancy_trimester?: PregnancyTrimesterType | null;
  due_date?: string | null;
  baby_birth_date?: string | null;
  baby_name?: string | null;
  baby_age_months?: number | null;
  motherhood_stage?: MotherhoodStageType | null;
  baby_gender?: BabyGenderType | null;
  current_emotion?: EmotionType | null;
  last_emotion_update?: string | null;
  notification_enabled?: boolean;
  notifications_enabled?: boolean;
  notification_opt_in?: boolean;
  daily_reminder_time?: string | null;
  theme_preference?: ThemeType;
  theme?: ThemeType;
  language?: string;
  onboarding_completed?: boolean;
  onboarding_step?: number;
  life_stage_generic?: LifeStageType | null;
  main_goals?: string[];
  baseline_emotion?: EmotionType | null;
  first_focus?: FirstFocusType | null;
  preferred_language_tone?: LanguageToneType | null;
  bio?: string | null;
  city?: string | null;
  state?: string | null;
  preferred_topics?: string[];
  support_network?: SupportNetworkType | null;
  subscription_tier?: SubscriptionType;
  subscription_expires_at?: string | null;
  updated_at?: string;
  last_seen_at?: string;
}

// ======================
// 📝 Check-in Logs Table
// ======================

export interface CheckInLogRow {
  id: string; // UUID
  user_id: string; // UUID references profiles.id
  emotion: EmotionType;
  notes: string | null;
  created_at: string; // TIMESTAMPTZ
  updated_at: string; // TIMESTAMPTZ
}

export interface CheckInLogInsert {
  id?: string;
  user_id: string;
  emotion: EmotionType;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface CheckInLogUpdate {
  emotion?: EmotionType;
  notes?: string | null;
  updated_at?: string;
}

// ======================
// 🔧 Helper Types
// ======================

/**
 * Tipo para queries tipadas com Supabase
 * @example
 * const { data } = await supabase
 *   .from('profiles')
 *   .select('*')
 *   .single();
 * // data: ProfileRow | null
 */
export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];

export type InsertTables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert'];

export type UpdateTables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update'];

/**
 * Tipo para enums do banco
 */
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T];
