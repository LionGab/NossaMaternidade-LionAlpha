/**
 * Tipos gerados automaticamente do schema do Supabase
 * Nossa Maternidade
 *
 * IMPORTANTE: Este arquivo foi gerado manualmente baseado no schema consolidado.
 * Para regenerar com dados reais do Supabase, execute:
 *
 * npx supabase gen types typescript --project-id $SUPABASE_PROJECT_ID > src/types/supabase.generated.ts
 *
 * @generated 2024-12-04
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

// =============================================================================
// ENUMS
// =============================================================================

export type CrisisLevel = 'low' | 'moderate' | 'severe' | 'critical';

export type CrisisType =
  | 'suicidal_ideation'
  | 'self_harm'
  | 'postpartum_depression'
  | 'anxiety_attack'
  | 'overwhelm'
  | 'domestic_violence'
  | 'baby_safety'
  | 'other';

export type InterventionStatus =
  | 'detected'
  | 'resources_shown'
  | 'user_acknowledged'
  | 'contacted_cvv'
  | 'contacted_samu'
  | 'contacted_caps'
  | 'continued_chat'
  | 'left_app'
  | 'resolved'
  | 'escalated'
  | 'follow_up_pending'
  | 'follow_up_completed';

export type ModerationStatus =
  | 'pending'
  | 'assigned'
  | 'in_review'
  | 'approved'
  | 'rejected'
  | 'escalated'
  | 'appealed'
  | 'appeal_approved'
  | 'appeal_rejected';

export type ContentType =
  | 'post'
  | 'comment'
  | 'reply'
  | 'profile_bio'
  | 'profile_photo'
  | 'message';

export type ModerationSource = 'auto_filter' | 'ai_review' | 'user_report' | 'manual' | 'appeal';

export type RejectionReason =
  | 'spam'
  | 'hate_speech'
  | 'harassment'
  | 'nsfw'
  | 'violence'
  | 'self_harm'
  | 'medical_misinformation'
  | 'personal_info'
  | 'advertising'
  | 'off_topic'
  | 'duplicate'
  | 'other';

export type FunnelStage =
  | 'app_opened'
  | 'onboarding_started'
  | 'onboarding_profile'
  | 'onboarding_baby'
  | 'onboarding_complete'
  | 'aha_moment_nathia'
  | 'aha_moment_tracker'
  | 'aha_moment_community'
  | 'first_week_active'
  | 'subscription_viewed'
  | 'subscription_started'
  | 'churned'
  | 'reactivated';

export type ConsentType = 'terms' | 'privacy' | 'marketing' | 'data_processing' | 'analytics';

export type AIProvider = 'gemini' | 'openai' | 'anthropic';

// =============================================================================
// DATABASE TYPES
// =============================================================================

export interface Database {
  public: {
    Tables: {
      // -----------------------------------------------------------------------
      // DOM�NIO: AUTH/PERFIL
      // -----------------------------------------------------------------------

      profiles: {
        Row: {
          id: string;
          email: string | null;
          full_name: string | null;
          avatar_url: string | null;
          phone: string | null;
          birth_date: string | null;
          baby_name: string | null;
          baby_birth_date: string | null;
          baby_gender: 'male' | 'female' | 'unknown' | 'prefer_not_say' | null;
          gestational_week: number | null;
          motherhood_stage:
            | 'trying_to_conceive'
            | 'pregnant'
            | 'postpartum'
            | 'experienced_mother'
            | null;
          pregnancy_week: number | null;
          emotions: Json | null;
          needs: Json | null;
          interests: Json | null;
          theme: 'light' | 'dark' | 'auto';
          language: string;
          notifications_enabled: boolean;
          onboarding_completed: boolean;
          onboarding_step: string;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id: string;
          email?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          phone?: string | null;
          birth_date?: string | null;
          baby_name?: string | null;
          baby_birth_date?: string | null;
          baby_gender?: 'male' | 'female' | 'unknown' | 'prefer_not_say' | null;
          gestational_week?: number | null;
          motherhood_stage?:
            | 'trying_to_conceive'
            | 'pregnant'
            | 'postpartum'
            | 'experienced_mother'
            | null;
          pregnancy_week?: number | null;
          emotions?: Json | null;
          needs?: Json | null;
          interests?: Json | null;
          theme?: 'light' | 'dark' | 'auto';
          language?: string;
          notifications_enabled?: boolean;
          onboarding_completed?: boolean;
          onboarding_step?: string;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          email?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          phone?: string | null;
          birth_date?: string | null;
          baby_name?: string | null;
          baby_birth_date?: string | null;
          baby_gender?: 'male' | 'female' | 'unknown' | 'prefer_not_say' | null;
          gestational_week?: number | null;
          motherhood_stage?:
            | 'trying_to_conceive'
            | 'pregnant'
            | 'postpartum'
            | 'experienced_mother'
            | null;
          pregnancy_week?: number | null;
          emotions?: Json | null;
          needs?: Json | null;
          interests?: Json | null;
          theme?: 'light' | 'dark' | 'auto';
          language?: string;
          notifications_enabled?: boolean;
          onboarding_completed?: boolean;
          onboarding_step?: string;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
      };

      user_consents: {
        Row: {
          id: string;
          user_id: string;
          consent_type: ConsentType;
          version: string;
          accepted: boolean;
          accepted_at: string | null;
          ip_address: string | null;
          user_agent: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          consent_type: ConsentType;
          version: string;
          accepted?: boolean;
          accepted_at?: string | null;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          consent_type?: ConsentType;
          version?: string;
          accepted?: boolean;
          accepted_at?: string | null;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
      };

      consent_terms_versions: {
        Row: {
          id: string;
          consent_type: ConsentType;
          version: string;
          title: string;
          content: string;
          summary: string | null;
          is_active: boolean;
          effective_date: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          consent_type: ConsentType;
          version: string;
          title: string;
          content: string;
          summary?: string | null;
          is_active?: boolean;
          effective_date: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          consent_type?: ConsentType;
          version?: string;
          title?: string;
          content?: string;
          summary?: string | null;
          is_active?: boolean;
          effective_date?: string;
          created_at?: string;
        };
      };

      user_sessions: {
        Row: {
          id: string;
          user_id: string;
          session_start: string;
          session_end: string | null;
          duration_seconds: number | null;
          platform: string | null;
          app_version: string | null;
          device_info: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          session_start?: string;
          session_end?: string | null;
          duration_seconds?: number | null;
          platform?: string | null;
          app_version?: string | null;
          device_info?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          session_start?: string;
          session_end?: string | null;
          duration_seconds?: number | null;
          platform?: string | null;
          app_version?: string | null;
          device_info?: Json | null;
          created_at?: string;
        };
      };

      legal_acceptances: {
        Row: {
          id: string;
          user_id: string;
          document_type: 'terms_of_service' | 'privacy_policy' | 'data_processing_agreement';
          document_version: string;
          accepted_at: string;
          ip_address: string | null;
          user_agent: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          document_type: 'terms_of_service' | 'privacy_policy' | 'data_processing_agreement';
          document_version: string;
          accepted_at?: string;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          document_type?: 'terms_of_service' | 'privacy_policy' | 'data_processing_agreement';
          document_version?: string;
          accepted_at?: string;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
      };

      // -----------------------------------------------------------------------
      // DOM�NIO: CHAT/IA
      // -----------------------------------------------------------------------

      chat_conversations: {
        Row: {
          id: string;
          user_id: string;
          title: string | null;
          model: string;
          summary: string | null;
          emotion_detected: string | null;
          topics: string[] | null;
          message_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title?: string | null;
          model?: string;
          summary?: string | null;
          emotion_detected?: string | null;
          topics?: string[] | null;
          message_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string | null;
          model?: string;
          summary?: string | null;
          emotion_detected?: string | null;
          topics?: string[] | null;
          message_count?: number;
          created_at?: string;
          updated_at?: string;
        };
      };

      chat_messages: {
        Row: {
          id: string;
          conversation_id: string;
          role: 'user' | 'assistant' | 'system';
          content: string;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          conversation_id: string;
          role: 'user' | 'assistant' | 'system';
          content: string;
          metadata?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          conversation_id?: string;
          role?: 'user' | 'assistant' | 'system';
          content?: string;
          metadata?: Json;
          created_at?: string;
        };
      };

      crisis_interventions: {
        Row: {
          id: string;
          user_id: string;
          level: CrisisLevel;
          types: CrisisType[];
          status: InterventionStatus;
          trigger_message: string | null;
          matched_patterns: string[] | null;
          context_summary: string | null;
          resources_shown: string[];
          user_actions: Json;
          follow_up_needed: boolean;
          follow_up_scheduled_at: string | null;
          follow_up_completed_at: string | null;
          follow_up_notes: string | null;
          outcome_notes: string | null;
          resolution_type: string | null;
          session_id: string | null;
          app_version: string | null;
          device_info: Json | null;
          priority: number;
          detected_at: string;
          acknowledged_at: string | null;
          resolved_at: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
          anonymized_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          level: CrisisLevel;
          types?: CrisisType[];
          status?: InterventionStatus;
          trigger_message?: string | null;
          matched_patterns?: string[] | null;
          context_summary?: string | null;
          resources_shown?: string[];
          user_actions?: Json;
          follow_up_needed?: boolean;
          follow_up_scheduled_at?: string | null;
          follow_up_completed_at?: string | null;
          follow_up_notes?: string | null;
          outcome_notes?: string | null;
          resolution_type?: string | null;
          session_id?: string | null;
          app_version?: string | null;
          device_info?: Json | null;
          priority?: number;
          detected_at?: string;
          acknowledged_at?: string | null;
          resolved_at?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
          anonymized_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          level?: CrisisLevel;
          types?: CrisisType[];
          status?: InterventionStatus;
          trigger_message?: string | null;
          matched_patterns?: string[] | null;
          context_summary?: string | null;
          resources_shown?: string[];
          user_actions?: Json;
          follow_up_needed?: boolean;
          follow_up_scheduled_at?: string | null;
          follow_up_completed_at?: string | null;
          follow_up_notes?: string | null;
          outcome_notes?: string | null;
          resolution_type?: string | null;
          session_id?: string | null;
          app_version?: string | null;
          device_info?: Json | null;
          priority?: number;
          detected_at?: string;
          acknowledged_at?: string | null;
          resolved_at?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
          anonymized_at?: string | null;
        };
      };

      // -----------------------------------------------------------------------
      // DOM�NIO: EMOCIONAL/H�BITOS
      // -----------------------------------------------------------------------

      check_in_logs: {
        Row: {
          id: string;
          user_id: string;
          emotion: 'bem' | 'triste' | 'ansiosa' | 'cansada' | 'calma';
          intensity: number | null;
          notes: string | null;
          factors: string[] | null;
          logged_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          emotion: 'bem' | 'triste' | 'ansiosa' | 'cansada' | 'calma';
          intensity?: number | null;
          notes?: string | null;
          factors?: string[] | null;
          logged_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          emotion?: 'bem' | 'triste' | 'ansiosa' | 'cansada' | 'calma';
          intensity?: number | null;
          notes?: string | null;
          factors?: string[] | null;
          logged_at?: string;
          created_at?: string;
          updated_at?: string;
        };
      };

      habits: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          icon: string | null;
          color: string | null;
          category: string | null;
          frequency: 'daily' | 'weekly' | 'monthly';
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          icon?: string | null;
          color?: string | null;
          category?: string | null;
          frequency?: 'daily' | 'weekly' | 'monthly';
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          icon?: string | null;
          color?: string | null;
          category?: string | null;
          frequency?: 'daily' | 'weekly' | 'monthly';
          created_at?: string;
        };
      };

      user_habits: {
        Row: {
          id: string;
          user_id: string;
          habit_id: string | null;
          custom_name: string | null;
          custom_target: number;
          reminder_time: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          habit_id?: string | null;
          custom_name?: string | null;
          custom_target?: number;
          reminder_time?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          habit_id?: string | null;
          custom_name?: string | null;
          custom_target?: number;
          reminder_time?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };

      habit_logs: {
        Row: {
          id: string;
          user_habit_id: string;
          completed_at: string;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_habit_id: string;
          completed_at: string;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_habit_id?: string;
          completed_at?: string;
          notes?: string | null;
          created_at?: string;
        };
      };

      sleep_logs: {
        Row: {
          id: string;
          user_id: string;
          sleep_start: string;
          sleep_end: string | null;
          duration_minutes: number | null;
          quality: number | null;
          notes: string | null;
          baby_wakeups: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          sleep_start: string;
          sleep_end?: string | null;
          duration_minutes?: number | null;
          quality?: number | null;
          notes?: string | null;
          baby_wakeups?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          sleep_start?: string;
          sleep_end?: string | null;
          duration_minutes?: number | null;
          quality?: number | null;
          notes?: string | null;
          baby_wakeups?: number;
          created_at?: string;
        };
      };

      // -----------------------------------------------------------------------
      // DOM�NIO: CONTE�DO
      // -----------------------------------------------------------------------

      content_items: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          type: 'video' | 'audio' | 'article' | 'reels';
          category: string;
          thumbnail_url: string | null;
          video_url: string | null;
          audio_url: string | null;
          duration: number | null;
          author_name: string | null;
          author_avatar_url: string | null;
          tags: Json;
          is_premium: boolean;
          is_exclusive: boolean;
          views_count: number;
          likes_count: number;
          is_published: boolean;
          published_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          type: 'video' | 'audio' | 'article' | 'reels';
          category: string;
          thumbnail_url?: string | null;
          video_url?: string | null;
          audio_url?: string | null;
          duration?: number | null;
          author_name?: string | null;
          author_avatar_url?: string | null;
          tags?: Json;
          is_premium?: boolean;
          is_exclusive?: boolean;
          views_count?: number;
          likes_count?: number;
          is_published?: boolean;
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          type?: 'video' | 'audio' | 'article' | 'reels';
          category?: string;
          thumbnail_url?: string | null;
          video_url?: string | null;
          audio_url?: string | null;
          duration?: number | null;
          author_name?: string | null;
          author_avatar_url?: string | null;
          tags?: Json;
          is_premium?: boolean;
          is_exclusive?: boolean;
          views_count?: number;
          likes_count?: number;
          is_published?: boolean;
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };

      user_content_interactions: {
        Row: {
          id: string;
          user_id: string;
          content_id: string;
          is_liked: boolean;
          is_saved: boolean;
          is_completed: boolean;
          progress_seconds: number;
          last_viewed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          content_id: string;
          is_liked?: boolean;
          is_saved?: boolean;
          is_completed?: boolean;
          progress_seconds?: number;
          last_viewed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          content_id?: string;
          is_liked?: boolean;
          is_saved?: boolean;
          is_completed?: boolean;
          progress_seconds?: number;
          last_viewed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };

      // -----------------------------------------------------------------------
      // DOM�NIO: COMUNIDADE
      // -----------------------------------------------------------------------

      community_posts: {
        Row: {
          id: string;
          user_id: string;
          content: string;
          image_url: string | null;
          tags: Json;
          likes_count: number;
          comments_count: number;
          views_count: number;
          is_reported: boolean;
          is_approved: boolean;
          moderation_score: number | null;
          moderation_flags: string[] | null;
          published_at: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          content: string;
          image_url?: string | null;
          tags?: Json;
          likes_count?: number;
          comments_count?: number;
          views_count?: number;
          is_reported?: boolean;
          is_approved?: boolean;
          moderation_score?: number | null;
          moderation_flags?: string[] | null;
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          content?: string;
          image_url?: string | null;
          tags?: Json;
          likes_count?: number;
          comments_count?: number;
          views_count?: number;
          is_reported?: boolean;
          is_approved?: boolean;
          moderation_score?: number | null;
          moderation_flags?: string[] | null;
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
      };

      community_comments: {
        Row: {
          id: string;
          post_id: string;
          user_id: string;
          parent_id: string | null;
          content: string;
          likes_count: number;
          is_reported: boolean;
          is_approved: boolean;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          post_id: string;
          user_id: string;
          parent_id?: string | null;
          content: string;
          likes_count?: number;
          is_reported?: boolean;
          is_approved?: boolean;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          post_id?: string;
          user_id?: string;
          parent_id?: string | null;
          content?: string;
          likes_count?: number;
          is_reported?: boolean;
          is_approved?: boolean;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
      };

      community_likes: {
        Row: {
          id: string;
          user_id: string;
          post_id: string | null;
          comment_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          post_id?: string | null;
          comment_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          post_id?: string | null;
          comment_id?: string | null;
          created_at?: string;
        };
      };

      // -----------------------------------------------------------------------
      // DOM�NIO: BEB�
      // -----------------------------------------------------------------------

      baby_milestones: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          category: 'motor' | 'cognitivo' | 'linguagem' | 'social' | 'sensorial';
          age_months: number;
          tips: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          category: 'motor' | 'cognitivo' | 'linguagem' | 'social' | 'sensorial';
          age_months: number;
          tips?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          category?: 'motor' | 'cognitivo' | 'linguagem' | 'social' | 'sensorial';
          age_months?: number;
          tips?: Json;
          created_at?: string;
        };
      };

      user_baby_milestones: {
        Row: {
          id: string;
          user_id: string;
          milestone_id: string;
          is_completed: boolean;
          completed_at: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          milestone_id: string;
          is_completed?: boolean;
          completed_at?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          milestone_id?: string;
          is_completed?: boolean;
          completed_at?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };

      // -----------------------------------------------------------------------
      // DOM�NIO: DI�RIO
      // -----------------------------------------------------------------------

      diary_entries: {
        Row: {
          id: string;
          user_id: string;
          title: string | null;
          content: string;
          mood: string | null;
          tags: Json;
          is_private: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title?: string | null;
          content: string;
          mood?: string | null;
          tags?: Json;
          is_private?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string | null;
          content?: string;
          mood?: string | null;
          tags?: Json;
          is_private?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };

      // -----------------------------------------------------------------------
      // DOM�NIO: ANALYTICS
      // -----------------------------------------------------------------------

      funnel_events: {
        Row: {
          id: string;
          user_id: string | null;
          stage: FunnelStage;
          previous_stage: FunnelStage | null;
          metadata: Json;
          session_id: string | null;
          device_fingerprint: string | null;
          created_at: string;
          deleted_at: string | null;
          anonymized_at: string | null;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          stage: FunnelStage;
          previous_stage?: FunnelStage | null;
          metadata?: Json;
          session_id?: string | null;
          device_fingerprint?: string | null;
          created_at?: string;
          deleted_at?: string | null;
          anonymized_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          stage?: FunnelStage;
          previous_stage?: FunnelStage | null;
          metadata?: Json;
          session_id?: string | null;
          device_fingerprint?: string | null;
          created_at?: string;
          deleted_at?: string | null;
          anonymized_at?: string | null;
        };
      };

      breastfeeding_sessions: {
        Row: {
          id: string;
          user_id: string;
          started_at: string;
          ended_at: string | null;
          duration_minutes: number | null;
          side: 'left' | 'right' | 'both' | null;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          started_at: string;
          ended_at?: string | null;
          duration_minutes?: number | null;
          side?: 'left' | 'right' | 'both' | null;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          started_at?: string;
          ended_at?: string | null;
          duration_minutes?: number | null;
          side?: 'left' | 'right' | 'both' | null;
          notes?: string | null;
          created_at?: string;
        };
      };

      // -----------------------------------------------------------------------
      // DOM�NIO: MODERA��O
      // -----------------------------------------------------------------------

      moderation_queue: {
        Row: {
          id: string;
          content_id: string;
          content_type: ContentType;
          content_text: string;
          content_metadata: Json;
          author_id: string;
          author_trust_score: number;
          source: ModerationSource;
          status: ModerationStatus;
          priority: number;
          auto_filter_flags: string[];
          ai_safety_score: number | null;
          ai_analysis: Json | null;
          assigned_to: string | null;
          assigned_at: string | null;
          decision: ModerationStatus | null;
          decision_reason: RejectionReason | null;
          decision_notes: string | null;
          decided_at: string | null;
          decided_by: string | null;
          appeal_text: string | null;
          appealed_at: string | null;
          appeal_decision: ModerationStatus | null;
          appeal_decided_at: string | null;
          appeal_decided_by: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          content_id: string;
          content_type: ContentType;
          content_text: string;
          content_metadata?: Json;
          author_id: string;
          author_trust_score?: number;
          source: ModerationSource;
          status?: ModerationStatus;
          priority?: number;
          auto_filter_flags?: string[];
          ai_safety_score?: number | null;
          ai_analysis?: Json | null;
          assigned_to?: string | null;
          assigned_at?: string | null;
          decision?: ModerationStatus | null;
          decision_reason?: RejectionReason | null;
          decision_notes?: string | null;
          decided_at?: string | null;
          decided_by?: string | null;
          appeal_text?: string | null;
          appealed_at?: string | null;
          appeal_decision?: ModerationStatus | null;
          appeal_decided_at?: string | null;
          appeal_decided_by?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          content_id?: string;
          content_type?: ContentType;
          content_text?: string;
          content_metadata?: Json;
          author_id?: string;
          author_trust_score?: number;
          source?: ModerationSource;
          status?: ModerationStatus;
          priority?: number;
          auto_filter_flags?: string[];
          ai_safety_score?: number | null;
          ai_analysis?: Json | null;
          assigned_to?: string | null;
          assigned_at?: string | null;
          decision?: ModerationStatus | null;
          decision_reason?: RejectionReason | null;
          decision_notes?: string | null;
          decided_at?: string | null;
          decided_by?: string | null;
          appeal_text?: string | null;
          appealed_at?: string | null;
          appeal_decision?: ModerationStatus | null;
          appeal_decided_at?: string | null;
          appeal_decided_by?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
      };

      moderators: {
        Row: {
          id: string;
          user_id: string;
          tier: 'base' | 'senior' | 'lead' | 'founder';
          active: boolean;
          compensation_brl: number;
          payment_info: Json | null;
          hours_per_week: number;
          available_hours: Json | null;
          timezone: string;
          stats: Json;
          training_completed_at: string | null;
          started_at: string;
          last_active_at: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          tier?: 'base' | 'senior' | 'lead' | 'founder';
          active?: boolean;
          compensation_brl?: number;
          payment_info?: Json | null;
          hours_per_week?: number;
          available_hours?: Json | null;
          timezone?: string;
          stats?: Json;
          training_completed_at?: string | null;
          started_at?: string;
          last_active_at?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          tier?: 'base' | 'senior' | 'lead' | 'founder';
          active?: boolean;
          compensation_brl?: number;
          payment_info?: Json | null;
          hours_per_week?: number;
          available_hours?: Json | null;
          timezone?: string;
          stats?: Json;
          training_completed_at?: string | null;
          started_at?: string;
          last_active_at?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
      };

      moderation_metrics: {
        Row: {
          id: string;
          date: string;
          total_posts: number;
          total_queued: number;
          auto_approved: number;
          auto_blocked: number;
          ai_approved: number;
          ai_blocked: number;
          human_approved: number;
          human_rejected: number;
          escalated: number;
          avg_queue_latency_ms: number | null;
          active_moderators: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          date?: string;
          total_posts?: number;
          total_queued?: number;
          auto_approved?: number;
          auto_blocked?: number;
          ai_approved?: number;
          ai_blocked?: number;
          human_approved?: number;
          human_rejected?: number;
          escalated?: number;
          avg_queue_latency_ms?: number | null;
          active_moderators?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          date?: string;
          total_posts?: number;
          total_queued?: number;
          auto_approved?: number;
          auto_blocked?: number;
          ai_approved?: number;
          ai_blocked?: number;
          human_approved?: number;
          human_rejected?: number;
          escalated?: number;
          avg_queue_latency_ms?: number | null;
          active_moderators?: number;
          created_at?: string;
          updated_at?: string;
        };
      };

      // -----------------------------------------------------------------------
      // DOM�NIO: IA/CUSTOS (NOVA TABELA)
      // -----------------------------------------------------------------------

      ai_usage_logs: {
        Row: {
          id: string;
          user_id: string | null;
          profile: string;
          provider: AIProvider;
          model_name: string;
          input_tokens: number;
          output_tokens: number;
          total_tokens: number;
          estimated_cost_usd: number;
          latency_ms: number | null;
          success: boolean;
          error_message: string | null;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          profile: string;
          provider: AIProvider;
          model_name: string;
          input_tokens?: number;
          output_tokens?: number;
          total_tokens?: number;
          estimated_cost_usd?: number;
          latency_ms?: number | null;
          success?: boolean;
          error_message?: string | null;
          metadata?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          profile?: string;
          provider?: AIProvider;
          model_name?: string;
          input_tokens?: number;
          output_tokens?: number;
          total_tokens?: number;
          estimated_cost_usd?: number;
          latency_ms?: number | null;
          success?: boolean;
          error_message?: string | null;
          metadata?: Json;
          created_at?: string;
        };
      };
    };

    Views: {
      mv_dashboard_crisis_summary: {
        Row: {
          date: string;
          total_count: number;
          critical_count: number;
          severe_count: number;
          moderate_count: number;
          mild_count: number;
          cvv_clicks: number;
        };
      };
    };

    Functions: {
      increment: {
        Args: {
          row_id: string;
          table_name: string;
          column_name: string;
        };
        Returns: undefined;
      };
      decrement: {
        Args: {
          row_id: string;
          table_name: string;
          column_name: string;
        };
        Returns: undefined;
      };
      grant_consent: {
        Args: {
          p_user_id: string;
          p_consent_type: ConsentType;
          p_terms_version_id: string;
          p_ip_address?: string;
          p_user_agent?: string;
          p_device_id?: string;
          p_collection_method?: string;
        };
        Returns: string;
      };
      revoke_consent: {
        Args: {
          p_user_id: string;
          p_consent_type: ConsentType;
          p_ip_address?: string;
          p_user_agent?: string;
          p_device_id?: string;
          p_revocation_reason?: string;
        };
        Returns: boolean;
      };
      get_user_consents: {
        Args: {
          p_user_id: string;
        };
        Returns: {
          consent_type: ConsentType;
          status: string;
          granted_at: string;
          terms_version: string;
          is_current_terms: boolean;
        }[];
      };
      get_crisis_daily_stats: {
        Args: {
          p_days?: number;
        };
        Returns: {
          date: string;
          total_count: number;
          critical_count: number;
          severe_count: number;
          moderate_count: number;
          mild_count: number;
          cvv_clicks: number;
        }[];
      };
      get_crisis_type_distribution: {
        Args: {
          p_start_date?: string;
          p_end_date?: string;
        };
        Returns: {
          crisis_type: CrisisType;
          count: number;
          percentage: number;
        }[];
      };
      get_cvv_click_stats: {
        Args: Record<string, never>;
        Returns: {
          today_count: number;
          yesterday_count: number;
          variation_percent: number;
          alert_threshold_exceeded: boolean;
        };
      };
      get_moderation_queue_stats: {
        Args: Record<string, never>;
        Returns: {
          pending_count: number;
          high_priority_count: number;
          avg_queue_latency_ms: number;
          oldest_pending_minutes: number;
        };
      };
      calculate_funnel_metrics: {
        Args: {
          p_start_date?: string;
          p_end_date?: string;
        };
        Returns: Json;
      };
      refresh_dashboard_cache: {
        Args: Record<string, never>;
        Returns: undefined;
      };
      get_ai_usage_stats: {
        Args: {
          p_user_id?: string;
          p_start_date?: string;
          p_end_date?: string;
        };
        Returns: {
          total_calls: number;
          total_tokens: number;
          total_cost_usd: number;
          by_provider: Json;
          avg_latency_ms: number;
          success_rate: number;
        };
      };
    };

    Enums: {
      crisis_level: CrisisLevel;
      crisis_type: CrisisType;
      intervention_status: InterventionStatus;
      moderation_status: ModerationStatus;
      content_type: ContentType;
      moderation_source: ModerationSource;
      rejection_reason: RejectionReason;
      funnel_stage: FunnelStage;
    };

    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

// =============================================================================
// HELPER TYPES
// =============================================================================

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];

export type InsertTables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert'];

export type UpdateTables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update'];

export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T];

export type Functions<T extends keyof Database['public']['Functions']> =
  Database['public']['Functions'][T];

// =============================================================================
// CONVENIENCE TYPE ALIASES
// =============================================================================

export type Profile = Tables<'profiles'>;
export type ChatConversation = Tables<'chat_conversations'>;
export type ChatMessage = Tables<'chat_messages'>;
export type CrisisIntervention = Tables<'crisis_interventions'>;
export type CheckInLog = Tables<'check_in_logs'>;
export type Habit = Tables<'habits'>;
export type UserHabit = Tables<'user_habits'>;
export type HabitLog = Tables<'habit_logs'>;
export type SleepLog = Tables<'sleep_logs'>;
export type ContentItem = Tables<'content_items'>;
export type UserContentInteraction = Tables<'user_content_interactions'>;
export type CommunityPost = Tables<'community_posts'>;
export type CommunityComment = Tables<'community_comments'>;
export type CommunityLike = Tables<'community_likes'>;
export type BabyMilestone = Tables<'baby_milestones'>;
export type UserBabyMilestone = Tables<'user_baby_milestones'>;
export type DiaryEntry = Tables<'diary_entries'>;
export type FunnelEvent = Tables<'funnel_events'>;
export type BreastfeedingSession = Tables<'breastfeeding_sessions'>;
export type ModerationQueueItem = Tables<'moderation_queue'>;
export type Moderator = Tables<'moderators'>;
export type ModerationMetric = Tables<'moderation_metrics'>;
export type AIUsageLog = Tables<'ai_usage_logs'>;
export type UserConsent = Tables<'user_consents'>;
export type ConsentTermsVersion = Tables<'consent_terms_versions'>;
export type UserSession = Tables<'user_sessions'>;
export type LegalAcceptance = Tables<'legal_acceptances'>;
