import { logger } from '@/utils/logger';

import {
  contentRecommendationService,
  type PersonalizedContent,
} from './contentRecommendationService';
import { supabase } from './supabase';

export type ContentType = 'video' | 'audio' | 'article' | 'reels';

export interface ContentItem {
  id: string;
  title: string;
  description?: string;
  type: ContentType;
  category: string;
  thumbnail_url?: string;
  video_url?: string;
  audio_url?: string;
  duration?: number;
  author_name?: string;
  author_avatar_url?: string;
  tags?: string[];
  is_premium: boolean;
  is_exclusive: boolean;
  views_count: number;
  likes_count: number;
  is_published: boolean;
  published_at?: string;
  created_at: string;
  updated_at: string;

  // Dados da interação do usuário
  user_interaction?: UserContentInteraction;
}

export interface UserContentInteraction {
  is_liked: boolean;
  is_saved: boolean;
  is_completed: boolean;
  progress_seconds: number;
  last_viewed_at?: string;
}

export interface FeedFilters {
  type?: ContentType;
  category?: string;
  tags?: string[];
  isPremium?: boolean;
  search?: string;
}

class FeedService {
  private async getCurrentUserId(): Promise<string | null> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user?.id || null;
  }

  /**
   * Buscar conteúdos do feed com filtros e paginação
   */
  async getContent(filters: FeedFilters = {}, page = 0, limit = 20): Promise<ContentItem[]> {
    try {
      const userId = await this.getCurrentUserId();

      let query = supabase.from('content_items').select('*').eq('is_published', true);

      // Aplicar filtros
      if (filters.type) {
        query = query.eq('type', filters.type);
      }
      if (filters.category) {
        query = query.eq('category', filters.category);
      }
      if (filters.isPremium !== undefined) {
        query = query.eq('is_premium', filters.isPremium);
      }
      if (filters.tags && filters.tags.length > 0) {
        query = query.contains('tags', filters.tags);
      }
      if (filters.search) {
        // Busca por título ou descrição (case-insensitive)
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      // Ordenar por data de publicação
      query = query
        .order('published_at', { ascending: false })
        .range(page * limit, (page + 1) * limit - 1);

      const { data, error } = await query;

      if (error) {
        logger.error('Erro ao buscar conteúdos do feed', error, {
          service: 'FeedService',
          action: 'getContent',
          filters,
          page,
          limit,
        });
        return [];
      }

      // Buscar interações do usuário se autenticado
      if (userId && data) {
        const contentWithInteractions = await Promise.all(
          data.map(async (item) => {
            const interaction = await this.getUserInteraction(item.id);
            return { ...item, user_interaction: interaction };
          })
        );
        return contentWithInteractions as ContentItem[];
      }

      return (data || []) as ContentItem[];
    } catch (error) {
      logger.error('Erro inesperado ao buscar conteúdos', error, {
        service: 'FeedService',
        action: 'getContent',
        filters,
      });
      return [];
    }
  }

  /**
   * Buscar conteúdo por ID
   */
  async getContentById(contentId: string): Promise<ContentItem | null> {
    try {
      const userId = await this.getCurrentUserId();

      const { data, error } = await supabase
        .from('content_items')
        .select('*')
        .eq('id', contentId)
        .single();

      if (error) {
        logger.error('Erro ao buscar conteúdo por ID', error, {
          service: 'FeedService',
          action: 'getContentById',
          contentId,
        });
        return null;
      }

      // Buscar interação do usuário
      if (userId) {
        const interaction = await this.getUserInteraction(contentId);
        return { ...data, user_interaction: interaction } as ContentItem;
      }

      return data as ContentItem;
    } catch (error) {
      logger.error('Erro inesperado ao buscar conteúdo', error, {
        service: 'FeedService',
        action: 'getContentById',
        contentId,
      });
      return null;
    }
  }

  /**
   * Buscar conteúdos recomendados (Release C: Usa ContentRecommendationAgent)
   */
  async getRecommendedContent(limit = 10): Promise<ContentItem[]> {
    try {
      const personalized = await this.getPersonalizedRecommendations(limit);
      return personalized.forYou.map((item) => this.mapLocalToFeedItem(item));
    } catch (error) {
      logger.error('Erro inesperado ao buscar recomendações', error, {
        service: 'FeedService',
        action: 'getRecommendedContent',
        limit,
      });
      return [];
    }
  }

  /**
   * Buscar conteúdos personalizados com contexto completo
   * Release C: Retorna PersonalizedContent com reasoning e confidence
   */
  async getPersonalizedRecommendations(
    limit = 6,
    options?: { forceRefresh?: boolean }
  ): Promise<PersonalizedContent> {
    try {
      return await contentRecommendationService.getPersonalizedContent({
        maxResults: limit,
        forceRefresh: options?.forceRefresh,
      });
    } catch (error) {
      logger.error('Erro ao buscar recomendações personalizadas', error, {
        service: 'FeedService',
        action: 'getPersonalizedRecommendations',
      });

      // Fallback: buscar do Supabase por views
      const { data } = await supabase
        .from('content_items')
        .select('*')
        .eq('is_published', true)
        .order('views_count', { ascending: false })
        .limit(limit);

      return {
        forYou: (data || []).map((item) => ({
          id: item.id,
          title: item.title,
          description: item.description || '',
          type: item.type,
          category: item.category,
          thumbnailUrl: item.thumbnail_url,
          views: item.views_count,
          likes: item.likes_count,
        })),
        reasoning: 'Conteúdos mais populares da comunidade.',
        confidence: 0.3,
        source: 'supabase',
        timestamp: Date.now(),
      };
    }
  }

  /**
   * Mapeia item local para formato do feed
   */
  private mapLocalToFeedItem(item: {
    id: string;
    title: string;
    description?: string;
    type: string;
    category: string;
    thumbnailUrl?: string;
    imageUrl?: string;
    views?: number;
    likes?: number;
    isPremium?: boolean;
    isExclusive?: boolean;
    tags?: string[];
  }): ContentItem {
    return {
      id: item.id,
      title: item.title,
      description: item.description,
      type: item.type as ContentType,
      category: item.category,
      thumbnail_url: item.thumbnailUrl || item.imageUrl,
      is_premium: item.isPremium || false,
      is_exclusive: item.isExclusive || false,
      views_count: item.views || 0,
      likes_count: item.likes || 0,
      is_published: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      tags: item.tags,
    };
  }

  /**
   * Buscar categorias disponíveis
   */
  async getCategories(): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('content_items')
        .select('category')
        .eq('is_published', true);

      if (error) {
        logger.error('Erro ao buscar categorias', error, {
          service: 'FeedService',
          action: 'getCategories',
        });
        return [];
      }

      // Extrair categorias únicas
      const categories = [...new Set(data?.map((item) => item.category) || [])];
      return categories;
    } catch (error) {
      logger.error('Erro inesperado ao buscar categorias', error, {
        service: 'FeedService',
        action: 'getCategories',
      });
      return [];
    }
  }

  /**
   * Obter interação do usuário com conteúdo
   */
  async getUserInteraction(contentId: string): Promise<UserContentInteraction | null> {
    try {
      const userId = await this.getCurrentUserId();
      if (!userId) return null;

      const { data, error } = await supabase
        .from('user_content_interactions')
        .select('*')
        .eq('user_id', userId)
        .eq('content_id', contentId)
        .single();

      if (error) return null;
      return data as UserContentInteraction;
    } catch (error) {
      return null;
    }
  }

  /**
   * Curtir/descurtir conteúdo
   */
  async toggleLike(contentId: string): Promise<boolean> {
    try {
      const userId = await this.getCurrentUserId();
      if (!userId) return false;

      const interaction = await this.getUserInteraction(contentId);

      if (interaction) {
        // Toggle like
        const newLikeState = !interaction.is_liked;

        const { error } = await supabase
          .from('user_content_interactions')
          .update({ is_liked: newLikeState })
          .eq('user_id', userId)
          .eq('content_id', contentId);

        if (error) {
          logger.error('Erro ao atualizar like', error, {
            service: 'FeedService',
            action: 'toggleLike',
            contentId,
            userId,
            newLikeState,
          });
          return false;
        }

        // Atualizar contador de likes
        await this.updateLikesCount(contentId, newLikeState ? 1 : -1);

        return newLikeState;
      } else {
        // Criar nova interação com like
        const { error } = await supabase.from('user_content_interactions').insert({
          user_id: userId,
          content_id: contentId,
          is_liked: true,
        });

        if (error) {
          logger.error('Erro ao criar like', error, {
            service: 'FeedService',
            action: 'toggleLike',
            contentId,
            userId,
          });
          return false;
        }

        await this.updateLikesCount(contentId, 1);
        return true;
      }
    } catch (error) {
      logger.error('Erro inesperado ao dar like', error, {
        service: 'FeedService',
        action: 'toggleLike',
        contentId,
      });
      return false;
    }
  }

  /**
   * Salvar/dessalvar conteúdo
   */
  async toggleSave(contentId: string): Promise<boolean> {
    try {
      const userId = await this.getCurrentUserId();
      if (!userId) return false;

      const interaction = await this.getUserInteraction(contentId);

      if (interaction) {
        const newSaveState = !interaction.is_saved;

        const { error } = await supabase
          .from('user_content_interactions')
          .update({ is_saved: newSaveState })
          .eq('user_id', userId)
          .eq('content_id', contentId);

        if (error) {
          logger.error('Erro ao atualizar save', error, {
            service: 'FeedService',
            action: 'toggleSave',
            contentId,
            userId,
            newSaveState,
          });
          return false;
        }

        return newSaveState;
      } else {
        const { error } = await supabase.from('user_content_interactions').insert({
          user_id: userId,
          content_id: contentId,
          is_saved: true,
        });

        if (error) {
          logger.error('Erro ao criar save', error, {
            service: 'FeedService',
            action: 'toggleSave',
            contentId,
            userId,
          });
          return false;
        }

        return true;
      }
    } catch (error) {
      logger.error('Erro inesperado ao salvar conteúdo', error, {
        service: 'FeedService',
        action: 'toggleSave',
        contentId,
      });
      return false;
    }
  }

  /**
   * Marcar conteúdo como completado
   */
  async markAsCompleted(contentId: string): Promise<boolean> {
    try {
      const userId = await this.getCurrentUserId();
      if (!userId) return false;

      const interaction = await this.getUserInteraction(contentId);

      if (interaction) {
        const { error } = await supabase
          .from('user_content_interactions')
          .update({ is_completed: true })
          .eq('user_id', userId)
          .eq('content_id', contentId);

        return !error;
      } else {
        const { error } = await supabase.from('user_content_interactions').insert({
          user_id: userId,
          content_id: contentId,
          is_completed: true,
        });

        return !error;
      }
    } catch (error) {
      logger.error('Erro inesperado ao marcar como completado', error, {
        service: 'FeedService',
        action: 'markAsCompleted',
        contentId,
      });
      return false;
    }
  }

  /**
   * Atualizar progresso de visualização
   */
  async updateProgress(contentId: string, progressSeconds: number): Promise<boolean> {
    try {
      const userId = await this.getCurrentUserId();
      if (!userId) return false;

      const interaction = await this.getUserInteraction(contentId);

      if (interaction) {
        const { error } = await supabase
          .from('user_content_interactions')
          .update({
            progress_seconds: progressSeconds,
            last_viewed_at: new Date().toISOString(),
          })
          .eq('user_id', userId)
          .eq('content_id', contentId);

        return !error;
      } else {
        const { error } = await supabase.from('user_content_interactions').insert({
          user_id: userId,
          content_id: contentId,
          progress_seconds: progressSeconds,
          last_viewed_at: new Date().toISOString(),
        });

        return !error;
      }
    } catch (error) {
      logger.error('Erro inesperado ao atualizar progresso', error, {
        service: 'FeedService',
        action: 'updateProgress',
        contentId,
        progressSeconds,
      });
      return false;
    }
  }

  /**
   * Incrementar visualizações
   */
  async incrementViews(contentId: string): Promise<boolean> {
    try {
      const { error } = await supabase.rpc('increment', {
        row_id: contentId,
        table_name: 'content_items',
        column_name: 'views_count',
      });

      if (error) {
        // Fallback: fazer manualmente
        const content = await this.getContentById(contentId);
        if (content) {
          await supabase
            .from('content_items')
            .update({ views_count: content.views_count + 1 })
            .eq('id', contentId);
        }
      }

      return true;
    } catch (error) {
      logger.error('Erro ao incrementar visualizações', error, {
        service: 'FeedService',
        action: 'incrementViews',
        contentId,
      });
      return false;
    }
  }

  /**
   * Atualizar contador de likes
   */
  private async updateLikesCount(contentId: string, delta: number): Promise<void> {
    const content = await this.getContentById(contentId);
    if (content) {
      await supabase
        .from('content_items')
        .update({ likes_count: Math.max(0, content.likes_count + delta) })
        .eq('id', contentId);
    }
  }

  /**
   * Buscar conteúdos salvos
   */
  async getSavedContent(): Promise<ContentItem[]> {
    try {
      const userId = await this.getCurrentUserId();
      if (!userId) return [];

      const { data, error } = await supabase
        .from('user_content_interactions')
        .select('content_id')
        .eq('user_id', userId)
        .eq('is_saved', true);

      if (error || !data) return [];

      const contentIds = data.map((item) => item.content_id);
      if (contentIds.length === 0) return [];

      const { data: content, error: contentError } = await supabase
        .from('content_items')
        .select('*')
        .in('id', contentIds);

      if (contentError) return [];
      return (content || []) as ContentItem[];
    } catch (error) {
      logger.error('Erro ao buscar conteúdos salvos', error, {
        service: 'FeedService',
        action: 'getSavedContent',
      });
      return [];
    }
  }

  /**
   * Buscar histórico de visualizações
   */
  async getViewHistory(limit = 20): Promise<ContentItem[]> {
    try {
      const userId = await this.getCurrentUserId();
      if (!userId) return [];

      const { data, error } = await supabase
        .from('user_content_interactions')
        .select('content_id, last_viewed_at')
        .eq('user_id', userId)
        .not('last_viewed_at', 'is', null)
        .order('last_viewed_at', { ascending: false })
        .limit(limit);

      if (error || !data) return [];

      const contentIds = data.map((item) => item.content_id);
      if (contentIds.length === 0) return [];

      const { data: content, error: contentError } = await supabase
        .from('content_items')
        .select('*')
        .in('id', contentIds);

      if (contentError) return [];
      return (content || []) as ContentItem[];
    } catch (error) {
      logger.error('Erro ao buscar histórico de visualizações', error, {
        service: 'FeedService',
        action: 'getViewHistory',
        limit,
      });
      return [];
    }
  }
}

export const feedService = new FeedService();
export default feedService;
