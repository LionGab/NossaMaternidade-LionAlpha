/**
 * Tipos para o feed MundoNath e conteúdo
 */

export type ContentType =
  | 'article'
  | 'video'
  | 'tip'
  | 'guide'
  | 'exercise'
  | 'recipe'
  | 'audio'
  | 'text'
  | 'reels';

export type ContentCategory =
  | 'gestacao'
  | 'pos_parto'
  | 'amamentacao'
  | 'sono'
  | 'desenvolvimento'
  | 'nutricao'
  | 'saude_mental'
  | 'autocuidado'
  | 'relacionamento';

export interface Content {
  id: string;
  type: ContentType;
  category: ContentCategory;
  title: string;
  description: string;
  content_text?: string;
  media_url?: string;
  thumbnail_url?: string;

  // Metadados
  author?: string;
  read_time_minutes?: number;
  tags?: string[];

  // Personalização
  relevance_score?: number; // calculado por IA
  is_premium?: boolean;

  // Engagement
  views_count: number;
  likes_count: number;
  saves_count: number;

  // Timestamps
  published_at: string;
  updated_at?: string;
}

export interface ContentRecommendation {
  content_id: string;
  user_id: string;
  reason: string; // "Baseado no seu perfil..." gerado por IA
  score: number; // 0-1
  created_at: string;
}

// Legacy types (mantidos para compatibilidade)
export interface ContentAuthor {
  name: string;
  avatar: number | { uri: string } | string; // ImageSourcePropType
}

export interface ContentStats {
  likes: number;
  comments: number;
}

export interface ContentItem {
  id: string;
  title: string;
  description: string;
  type: ContentType;
  category: string;
  thumbnail?: number | { uri: string } | string; // ImageSourcePropType
  thumbnailUrl?: string;
  imageUrl?: string;
  videoUrl?: string;
  content?: string;
  audioUrl?: string;
  duration?: string;
  date?: string;
  views?: number;
  likes?: number;
  isPremium?: boolean;
  isOriginal?: boolean;
  isExclusive?: boolean;
  tags?: string[];
  author?: ContentAuthor;
  stats?: ContentStats;
}

export interface Post {
  id: string;
  title: string;
  type: ContentType;
  thumbnailUrl: string;
  isNew: boolean;
}
