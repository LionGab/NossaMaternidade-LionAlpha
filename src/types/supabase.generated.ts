/**
 * Supabase Database Types
 * Gerado automaticamente - NÃO EDITAR MANUALMENTE
 * 
 * Para regenerar, execute:
 * npx supabase gen types typescript --project-id <PROJECT_ID> > src/types/supabase.generated.ts
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      // =====================
      // 👤 User Profiles
      // =====================
      user_profiles: {
        Row: {
          id: string;
          user_id: string;
          name: string | null;
          avatar_url: string | null;
          life_stage: string | null;
          baby_birth_date: string | null;
          onboarding_completed: boolean;
          preferences: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name?: string | null;
          avatar_url?: string | null;
          life_stage?: string | null;
          baby_birth_date?: string | null;
          onboarding_completed?: boolean;
          preferences?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string | null;
          avatar_url?: string | null;
          life_stage?: string | null;
          baby_birth_date?: string | null;
          onboarding_completed?: boolean;
          preferences?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
      };

      // =====================
      // 💬 Chat Messages
      // =====================
      chat_messages: {
        Row: {
          id: string;
          user_id: string;
          session_id: string | null;
          content: string;
          role: 'user' | 'assistant';
          emotion: string | null;
          metadata: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          session_id?: string | null;
          content: string;
          role: 'user' | 'assistant';
          emotion?: string | null;
          metadata?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          session_id?: string | null;
          content?: string;
          role?: 'user' | 'assistant';
          emotion?: string | null;
          metadata?: Json | null;
          created_at?: string;
        };
      };

      // =====================
      // 😊 Emotion Logs
      // =====================
      emotion_logs: {
        Row: {
          id: string;
          user_id: string;
          emotion: string;
          intensity: number;
          note: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          emotion: string;
          intensity: number;
          note?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          emotion?: string;
          intensity?: number;
          note?: string | null;
          created_at?: string;
        };
      };

      // =====================
      // ✅ Habits
      // =====================
      habits: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string | null;
          frequency: string | null;
          icon: string | null;
          color: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          description?: string | null;
          frequency?: string | null;
          icon?: string | null;
          color?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          description?: string | null;
          frequency?: string | null;
          icon?: string | null;
          color?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };

      // =====================
      // 📅 Habit Completions
      // =====================
      habit_completions: {
        Row: {
          id: string;
          habit_id: string;
          user_id: string;
          completed_at: string;
          note: string | null;
        };
        Insert: {
          id?: string;
          habit_id: string;
          user_id: string;
          completed_at?: string;
          note?: string | null;
        };
        Update: {
          id?: string;
          habit_id?: string;
          user_id?: string;
          completed_at?: string;
          note?: string | null;
        };
      };

      // =====================
      // 🧘 Ritual Sessions
      // =====================
      ritual_sessions: {
        Row: {
          id: string;
          userId: string;
          startTime: string;
          endTime: string | null;
          emotionBefore: Json;
          emotionAfter: Json | null;
          stepsCompleted: string[];
          totalDuration: number;
          ambientSound: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          userId: string;
          startTime: string;
          endTime?: string | null;
          emotionBefore: Json;
          emotionAfter?: Json | null;
          stepsCompleted?: string[];
          totalDuration?: number;
          ambientSound?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          userId?: string;
          startTime?: string;
          endTime?: string | null;
          emotionBefore?: Json;
          emotionAfter?: Json | null;
          stepsCompleted?: string[];
          totalDuration?: number;
          ambientSound?: string | null;
          created_at?: string;
        };
      };

      // =====================
      // 🆘 SOS Interactions
      // =====================
      sos_interactions: {
        Row: {
          id: string;
          userId: string;
          sentiment: string;
          intensity: number;
          emotionCode: string;
          inputText: string | null;
          timestamp: string;
          durationSeconds: number;
          outcome: string | null;
          testimonialShown: string | null;
          shared: boolean;
        };
        Insert: {
          id?: string;
          userId: string;
          sentiment: string;
          intensity: number;
          emotionCode: string;
          inputText?: string | null;
          timestamp?: string;
          durationSeconds?: number;
          outcome?: string | null;
          testimonialShown?: string | null;
          shared?: boolean;
        };
        Update: {
          id?: string;
          userId?: string;
          sentiment?: string;
          intensity?: number;
          emotionCode?: string;
          inputText?: string | null;
          timestamp?: string;
          durationSeconds?: number;
          outcome?: string | null;
          testimonialShown?: string | null;
          shared?: boolean;
        };
      };

      // =====================
      // 💬 Community Testimonials
      // =====================
      community_testimonials: {
        Row: {
          id: string;
          authorName: string;
          authorInitials: string;
          sentiment: string;
          message: string;
          helpedCount: number;
          createdAt: string;
          isAnonymous: boolean;
          approved: boolean;
        };
        Insert: {
          id?: string;
          authorName?: string;
          authorInitials?: string;
          sentiment: string;
          message: string;
          helpedCount?: number;
          createdAt?: string;
          isAnonymous?: boolean;
          approved?: boolean;
        };
        Update: {
          id?: string;
          authorName?: string;
          authorInitials?: string;
          sentiment?: string;
          message?: string;
          helpedCount?: number;
          createdAt?: string;
          isAnonymous?: boolean;
          approved?: boolean;
        };
      };

      // =====================
      // 💔 Guilt Logs
      // =====================
      guilt_logs: {
        Row: {
          id: string;
          userId: string;
          guiltType: string;
          intensity: number;
          customText: string | null;
          timestamp: string;
          actionAccepted: boolean;
          badgeUnlocked: string | null;
          shared: boolean;
        };
        Insert: {
          id?: string;
          userId: string;
          guiltType: string;
          intensity: number;
          customText?: string | null;
          timestamp?: string;
          actionAccepted?: boolean;
          badgeUnlocked?: string | null;
          shared?: boolean;
        };
        Update: {
          id?: string;
          userId?: string;
          guiltType?: string;
          intensity?: number;
          customText?: string | null;
          timestamp?: string;
          actionAccepted?: boolean;
          badgeUnlocked?: string | null;
          shared?: boolean;
        };
      };

      // =====================
      // 🏆 User Badges
      // =====================
      user_badges: {
        Row: {
          id: string;
          userId: string;
          badgeId: string;
          unlockedAt: string;
        };
        Insert: {
          id?: string;
          userId: string;
          badgeId: string;
          unlockedAt?: string;
        };
        Update: {
          id?: string;
          userId?: string;
          badgeId?: string;
          unlockedAt?: string;
        };
      };

      // =====================
      // 💬 Community Posts
      // =====================
      community_posts: {
        Row: {
          id: string;
          user_id: string;
          content: string;
          category: string | null;
          is_anonymous: boolean;
          likes_count: number;
          comments_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          content: string;
          category?: string | null;
          is_anonymous?: boolean;
          likes_count?: number;
          comments_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          content?: string;
          category?: string | null;
          is_anonymous?: boolean;
          likes_count?: number;
          comments_count?: number;
          created_at?: string;
          updated_at?: string;
        };
      };

      // =====================
      // ❤️ Post Likes
      // =====================
      post_likes: {
        Row: {
          id: string;
          post_id: string;
          user_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          post_id: string;
          user_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          post_id?: string;
          user_id?: string;
          created_at?: string;
        };
      };

      // =====================
      // 📚 Content Items
      // =====================
      content_items: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          content_type: 'article' | 'video' | 'audio' | 'tip';
          category: string | null;
          thumbnail_url: string | null;
          content_url: string | null;
          duration_minutes: number | null;
          tags: string[];
          is_premium: boolean;
          views_count: number;
          likes_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          content_type: 'article' | 'video' | 'audio' | 'tip';
          category?: string | null;
          thumbnail_url?: string | null;
          content_url?: string | null;
          duration_minutes?: number | null;
          tags?: string[];
          is_premium?: boolean;
          views_count?: number;
          likes_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          content_type?: 'article' | 'video' | 'audio' | 'tip';
          category?: string | null;
          thumbnail_url?: string | null;
          content_url?: string | null;
          duration_minutes?: number | null;
          tags?: string[];
          is_premium?: boolean;
          views_count?: number;
          likes_count?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      increment_testimonial_helped_count: {
        Args: { testimonial_id: string };
        Returns: void;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

// Helper types
export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];

export type InsertTables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert'];

export type UpdateTables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update'];
