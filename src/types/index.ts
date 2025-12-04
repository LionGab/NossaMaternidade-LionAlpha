/**
 * Barrel file - exporta todos os tipos
 * Import único: import { UserProfile, EmotionType, ChatMessage } from '@/types'
 */

// Database Types (Supabase)
export type {
  Database,
  ProfileRow,
  ProfileInsert,
  ProfileUpdate,
  CheckInLogRow,
  CheckInLogInsert,
  CheckInLogUpdate,
  Tables,
  InsertTables,
  UpdateTables,
  Enums,
  PhaseType,
  EmotionType as DBEmotionType,
  LifeStageType,
  LanguageToneType,
  FirstFocusType,
  ThemeType,
  SubscriptionType,
  SupportNetworkType,
  MotherhoodStageType,
  BabyGenderType,
  PregnancyTrimesterType,
} from './database';

// User & Profile
export type {
  UserProfile,
  UserStats,
  OnboardingData,
  MaternityPhase,
  PregnancyTrimester,
} from './user';

export { UserStage, UserEmotion, UserChallenge, UserSupport, UserNeed } from './user';

// Emotions
export type { EmotionType, EmotionLog, EmotionStats } from './emotion';

export { EMOTION_EMOJI_MAP, EMOTION_LABEL_MAP } from './emotion';

// Chat
export type {
  ChatMessage,
  Chat,
  ChatConfig,
  ChatAIResponse,
  MessageRole,
  AIModel,
  AIMode,
} from './chat';

// Habits
export type {
  Habit,
  HabitLog,
  HabitStats,
  HabitCategory,
  HabitFrequency,
  HabitCompletion, // Legacy
} from './habits';

// Content
export type {
  Content,
  ContentRecommendation,
  ContentType,
  ContentCategory,
  ContentItem, // Legacy
  ContentAuthor, // Legacy
  ContentStats, // Legacy
  Post, // Legacy
} from './content';

// Community (Fase 3)
export type { CommunityPost, Comment, PostStatus } from './community';

// AI & Tool Calling
export type { AITool, AIToolCall, AIToolResult, AIContext } from './ai';

// File Review
export type {
  FileReview,
  FileChange,
  ReviewSession,
  ReviewPermissions,
  FileReviewStatus,
} from './fileReview';

// Utility types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  per_page: number;
  total: number;
  has_more: boolean;
}
