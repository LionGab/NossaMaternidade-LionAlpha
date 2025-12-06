import { decode } from 'base64-arraybuffer';
import * as FileSystem from 'expo-file-system';

import { logger } from '@/utils/logger';

import { supabase } from './supabase';

export interface CommunityPost {
  id: string;
  user_id: string;
  content: string;
  image_url?: string;
  tags?: string[];
  likes_count: number;
  comments_count: number;
  is_reported: boolean;
  is_approved: boolean;
  created_at: string;
  updated_at: string;

  // Dados do autor
  author?: {
    full_name?: string;
    avatar_url?: string;
  };

  // Interação do usuário
  is_liked_by_user?: boolean;
}

export interface CommunityComment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  likes_count: number;
  created_at: string;
  updated_at: string;

  // Dados do autor
  author?: {
    full_name?: string;
    avatar_url?: string;
  };

  // Interação do usuário
  is_liked_by_user?: boolean;
}

export interface CreatePostData {
  content: string;
  image_uri?: string;
  tags?: string[];
  title?: string; // TODO: Adicionar coluna title na tabela community_posts se não existir
  category?: string; // TODO: Adicionar coluna category na tabela community_posts se não existir
  is_anonymous?: boolean; // TODO: Adicionar coluna is_anonymous na tabela community_posts se não existir
}

export interface CreateCommentData {
  post_id: string;
  content: string;
}

class CommunityService {
  private async getCurrentUserId(): Promise<string | null> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user?.id || null;
  }

  /**
   * Buscar posts da comunidade com paginação
   */
  async getPosts(page = 0, limit = 20): Promise<CommunityPost[]> {
    try {
      const userId = await this.getCurrentUserId();

      const { data, error } = await supabase
        .from('community_posts')
        .select(
          `
          *,
          author:profiles!user_id(full_name, avatar_url)
        `
        )
        .eq('is_approved', true)
        .order('created_at', { ascending: false })
        .range(page * limit, (page + 1) * limit - 1);

      if (error) {
        logger.error('Erro ao buscar posts da comunidade', error, {
          service: 'CommunityService',
          action: 'getPosts',
          page,
          limit,
        });
        return [];
      }

      // Adicionar informação de like do usuário
      if (userId && data) {
        const postsWithLikes = await Promise.all(
          data.map(async (post) => {
            const isLiked = await this.isPostLikedByUser(post.id, userId);
            return { ...post, is_liked_by_user: isLiked };
          })
        );
        return postsWithLikes as CommunityPost[];
      }

      return (data || []) as CommunityPost[];
    } catch (error) {
      logger.error('Erro inesperado ao buscar posts', error, {
        service: 'CommunityService',
        action: 'getPosts',
      });
      return [];
    }
  }

  /**
   * Buscar post por ID
   */
  async getPostById(postId: string): Promise<CommunityPost | null> {
    try {
      const userId = await this.getCurrentUserId();

      const { data, error } = await supabase
        .from('community_posts')
        .select(
          `
          *,
          author:profiles!user_id(full_name, avatar_url)
        `
        )
        .eq('id', postId)
        .single();

      if (error) {
        logger.error('Erro ao buscar post por ID', error, {
          service: 'CommunityService',
          action: 'getPostById',
          postId,
        });
        return null;
      }

      // Verificar se usuário curtiu
      if (userId) {
        const isLiked = await this.isPostLikedByUser(postId, userId);
        return { ...data, is_liked_by_user: isLiked } as CommunityPost;
      }

      return data as CommunityPost;
    } catch (error) {
      logger.error('Erro inesperado ao buscar post', error, {
        service: 'CommunityService',
        action: 'getPostById',
        postId,
      });
      return null;
    }
  }

  /**
   * Criar novo post
   */
  async createPost(postData: CreatePostData): Promise<CommunityPost | null> {
    try {
      const userId = await this.getCurrentUserId();
      if (!userId) return null;

      let imageUrl: string | undefined;

      // Upload de imagem se fornecida
      if (postData.image_uri) {
        const uploadResult = await this.uploadPostImage(postData.image_uri);
        if (uploadResult.url) {
          imageUrl = uploadResult.url;
        }
      }

      const { data, error } = await supabase
        .from('community_posts')
        .insert({
          user_id: userId,
          content: postData.content,
          image_url: imageUrl,
          tags: postData.tags || (postData.category ? [postData.category] : []), // Usar tags como fallback para category
          // TODO: Adicionar quando colunas existirem no banco:
          // title: postData.title,
          // category: postData.category,
          // is_anonymous: postData.is_anonymous,
          is_approved: true, // Auto-aprovar por enquanto
        })
        .select(
          `
          *,
          author:profiles!user_id(full_name, avatar_url)
        `
        )
        .single();

      if (error) {
        logger.error('Erro ao criar post', error, {
          service: 'CommunityService',
          action: 'createPost',
          userId,
          hasTags: !!postData.tags,
          hasImage: !!postData.image_uri,
        });
        return null;
      }

      return data as CommunityPost;
    } catch (error) {
      logger.error('Erro inesperado ao criar post', error, {
        service: 'CommunityService',
        action: 'createPost',
      });
      return null;
    }
  }

  /**
   * Atualizar post
   */
  async updatePost(postId: string, content: string): Promise<boolean> {
    try {
      const userId = await this.getCurrentUserId();
      if (!userId) return false;

      const { error } = await supabase
        .from('community_posts')
        .update({ content })
        .eq('id', postId)
        .eq('user_id', userId);

      if (error) {
        logger.error('Erro ao atualizar post', error, {
          service: 'CommunityService',
          action: 'updatePost',
          postId,
          userId,
        });
        return false;
      }

      return true;
    } catch (error) {
      logger.error('Erro inesperado ao atualizar post', error, {
        service: 'CommunityService',
        action: 'updatePost',
        postId,
      });
      return false;
    }
  }

  /**
   * Deletar post
   */
  async deletePost(postId: string): Promise<boolean> {
    try {
      const userId = await this.getCurrentUserId();
      if (!userId) return false;

      const { error } = await supabase
        .from('community_posts')
        .delete()
        .eq('id', postId)
        .eq('user_id', userId);

      if (error) {
        logger.error('Erro ao deletar post', error, {
          service: 'CommunityService',
          action: 'deletePost',
          postId,
          userId,
        });
        return false;
      }

      return true;
    } catch (error) {
      logger.error('Erro inesperado ao deletar post', error, {
        service: 'CommunityService',
        action: 'deletePost',
        postId,
      });
      return false;
    }
  }

  /**
   * Curtir/descurtir post
   */
  async togglePostLike(postId: string): Promise<boolean> {
    try {
      const userId = await this.getCurrentUserId();
      if (!userId) return false;

      const isLiked = await this.isPostLikedByUser(postId, userId);

      if (isLiked) {
        // Remover like
        const { error } = await supabase
          .from('community_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', userId);

        if (error) {
          logger.error('Erro ao remover like do post', error, {
            service: 'CommunityService',
            action: 'togglePostLike',
            postId,
            userId,
            operation: 'unlike',
          });
          return false;
        }

        // Decrementar contador
        await this.updatePostLikesCount(postId, -1);
        return false;
      } else {
        // Adicionar like
        const { error } = await supabase.from('community_likes').insert({
          user_id: userId,
          post_id: postId,
        });

        if (error) {
          logger.error('Erro ao adicionar like ao post', error, {
            service: 'CommunityService',
            action: 'togglePostLike',
            postId,
            userId,
            operation: 'like',
          });
          return false;
        }

        // Incrementar contador
        await this.updatePostLikesCount(postId, 1);
        return true;
      }
    } catch (error) {
      logger.error('Erro inesperado ao dar like no post', error, {
        service: 'CommunityService',
        action: 'togglePostLike',
        postId,
      });
      return false;
    }
  }

  /**
   * Verificar se usuário curtiu o post
   */
  private async isPostLikedByUser(postId: string, userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('community_likes')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', userId)
        .single();

      return !error && data != null;
    } catch (error) {
      return false;
    }
  }

  /**
   * Atualizar contador de likes do post
   */
  private async updatePostLikesCount(postId: string, delta: number): Promise<void> {
    const post = await this.getPostById(postId);
    if (post) {
      await supabase
        .from('community_posts')
        .update({ likes_count: Math.max(0, post.likes_count + delta) })
        .eq('id', postId);
    }
  }

  /**
   * Buscar comentários de um post
   */
  async getComments(postId: string, limit = 50): Promise<CommunityComment[]> {
    try {
      const userId = await this.getCurrentUserId();

      const { data, error } = await supabase
        .from('community_comments')
        .select(
          `
          *,
          author:profiles!user_id(full_name, avatar_url)
        `
        )
        .eq('post_id', postId)
        .order('created_at', { ascending: true })
        .limit(limit);

      if (error) {
        logger.error('Erro ao buscar comentários do post', error, {
          service: 'CommunityService',
          action: 'getComments',
          postId,
          limit,
        });
        return [];
      }

      // Adicionar informação de like do usuário
      if (userId && data) {
        const commentsWithLikes = await Promise.all(
          data.map(async (comment) => {
            const isLiked = await this.isCommentLikedByUser(comment.id, userId);
            return { ...comment, is_liked_by_user: isLiked };
          })
        );
        return commentsWithLikes as CommunityComment[];
      }

      return (data || []) as CommunityComment[];
    } catch (error) {
      logger.error('Erro inesperado ao buscar comentários', error, {
        service: 'CommunityService',
        action: 'getComments',
        postId,
      });
      return [];
    }
  }

  /**
   * Criar comentário
   */
  async createComment(commentData: CreateCommentData): Promise<CommunityComment | null> {
    try {
      const userId = await this.getCurrentUserId();
      if (!userId) return null;

      const { data, error } = await supabase
        .from('community_comments')
        .insert({
          post_id: commentData.post_id,
          user_id: userId,
          content: commentData.content,
        })
        .select(
          `
          *,
          author:profiles!user_id(full_name, avatar_url)
        `
        )
        .single();

      if (error) {
        logger.error('Erro ao criar comentário', error, {
          service: 'CommunityService',
          action: 'createComment',
          postId: commentData.post_id,
          userId,
        });
        return null;
      }

      // Incrementar contador de comentários do post
      await this.updatePostCommentsCount(commentData.post_id, 1);

      return data as CommunityComment;
    } catch (error) {
      logger.error('Erro inesperado ao criar comentário', error, {
        service: 'CommunityService',
        action: 'createComment',
      });
      return null;
    }
  }

  /**
   * Deletar comentário
   */
  async deleteComment(commentId: string, postId: string): Promise<boolean> {
    try {
      const userId = await this.getCurrentUserId();
      if (!userId) return false;

      const { error } = await supabase
        .from('community_comments')
        .delete()
        .eq('id', commentId)
        .eq('user_id', userId);

      if (error) {
        logger.error('Erro ao deletar comentário', error, {
          service: 'CommunityService',
          action: 'deleteComment',
          commentId,
          postId,
          userId,
        });
        return false;
      }

      // Decrementar contador de comentários do post
      await this.updatePostCommentsCount(postId, -1);

      return true;
    } catch (error) {
      logger.error('Erro inesperado ao deletar comentário', error, {
        service: 'CommunityService',
        action: 'deleteComment',
        commentId,
        postId,
      });
      return false;
    }
  }

  /**
   * Curtir/descurtir comentário
   */
  async toggleCommentLike(commentId: string): Promise<boolean> {
    try {
      const userId = await this.getCurrentUserId();
      if (!userId) return false;

      const isLiked = await this.isCommentLikedByUser(commentId, userId);

      if (isLiked) {
        const { error } = await supabase
          .from('community_likes')
          .delete()
          .eq('comment_id', commentId)
          .eq('user_id', userId);

        if (error) return false;

        await this.updateCommentLikesCount(commentId, -1);
        return false;
      } else {
        const { error } = await supabase.from('community_likes').insert({
          user_id: userId,
          comment_id: commentId,
        });

        if (error) return false;

        await this.updateCommentLikesCount(commentId, 1);
        return true;
      }
    } catch (error) {
      logger.error('Erro inesperado ao dar like em comentário', error, {
        service: 'CommunityService',
        action: 'toggleCommentLike',
        commentId,
      });
      return false;
    }
  }

  /**
   * Verificar se usuário curtiu o comentário
   */
  private async isCommentLikedByUser(commentId: string, userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('community_likes')
        .select('id')
        .eq('comment_id', commentId)
        .eq('user_id', userId)
        .single();

      return !error && data != null;
    } catch (error) {
      return false;
    }
  }

  /**
   * Atualizar contador de comentários do post
   */
  private async updatePostCommentsCount(postId: string, delta: number): Promise<void> {
    const post = await this.getPostById(postId);
    if (post) {
      await supabase
        .from('community_posts')
        .update({ comments_count: Math.max(0, post.comments_count + delta) })
        .eq('id', postId);
    }
  }

  /**
   * Atualizar contador de likes do comentário
   */
  private async updateCommentLikesCount(commentId: string, delta: number): Promise<void> {
    const { data } = await supabase
      .from('community_comments')
      .select('likes_count')
      .eq('id', commentId)
      .single();

    if (data) {
      await supabase
        .from('community_comments')
        .update({ likes_count: Math.max(0, data.likes_count + delta) })
        .eq('id', commentId);
    }
  }

  /**
   * Upload de imagem do post
   */
  private async uploadPostImage(uri: string): Promise<{ url: string | null; error?: string }> {
    try {
      const userId = await this.getCurrentUserId();
      if (!userId) return { url: null, error: 'Usuária não autenticada' };

      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: 'base64',
      });

      const fileExt = uri.split('.').pop();
      const fileName = `${userId}-${Date.now()}.${fileExt}`;
      const filePath = `posts/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('community')
        .upload(filePath, decode(base64), {
          contentType: `image/${fileExt}`,
          upsert: false,
        });

      if (uploadError) {
        logger.error('Erro ao fazer upload de imagem do post', uploadError, {
          service: 'CommunityService',
          action: 'uploadPostImage',
          userId,
          fileExt,
        });
        return { url: null, error: uploadError.message };
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from('community').getPublicUrl(filePath);

      return { url: publicUrl };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload error';
      logger.error('Erro inesperado ao fazer upload de imagem', error, {
        service: 'CommunityService',
        action: 'uploadPostImage',
      });
      return { url: null, error: errorMessage };
    }
  }

  /**
   * Reportar post
   */
  async reportPost(postId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('community_posts')
        .update({ is_reported: true })
        .eq('id', postId);

      return !error;
    } catch (error) {
      logger.error('Erro ao reportar post', error, {
        service: 'CommunityService',
        action: 'reportPost',
        postId,
      });
      return false;
    }
  }

  /**
   * Buscar posts do usuário
   */
  async getMyPosts(limit = 20): Promise<CommunityPost[]> {
    try {
      const userId = await this.getCurrentUserId();
      if (!userId) return [];

      const { data, error } = await supabase
        .from('community_posts')
        .select(
          `
          *,
          author:profiles!user_id(full_name, avatar_url)
        `
        )
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        logger.error('Erro ao buscar posts do usuário', error, {
          service: 'CommunityService',
          action: 'getMyPosts',
          userId,
          limit,
        });
        return [];
      }

      return (data || []) as CommunityPost[];
    } catch (error) {
      logger.error('Erro inesperado ao buscar posts do usuário', error, {
        service: 'CommunityService',
        action: 'getMyPosts',
      });
      return [];
    }
  }

  /**
   * Subscrever a novos posts (realtime)
   */
  subscribeToNewPosts(callback: (post: CommunityPost) => void) {
    const channel = supabase
      .channel('new-posts')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'community_posts',
          filter: 'is_approved=eq.true',
        },
        async (payload) => {
          // Buscar dados do autor
          const { data: author } = await supabase
            .from('profiles')
            .select('full_name, avatar_url')
            .eq('id', payload.new.user_id)
            .single();

          callback({ ...payload.new, author } as CommunityPost);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }
}

export const communityService = new CommunityService();
export default communityService;
