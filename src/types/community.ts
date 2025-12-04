/**
 * Tipos para a comunidade Mães Valentes
 * Fase 3
 */

export type PostStatus = 'pending' | 'published' | 'flagged' | 'removed';

export interface CommunityPost {
  id: string;
  user_id: string;
  author_name?: string; // pode ser anônimo
  is_anonymous: boolean;

  content: string;
  images?: string[];

  // Moderação
  status: PostStatus;
  moderation_score?: number; // 0-1 (calculado por IA)
  moderation_flags?: string[];

  // Engagement
  likes_count: number;
  comments_count: number;
  helpful_votes: number;

  // Timestamps
  created_at: string;
  updated_at?: string;
}

export interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  author_name?: string;
  is_anonymous: boolean;
  content: string;
  likes_count: number;
  created_at: string;
}
