/**
 * Content Recommendation Service
 * Release C: Conecta ContentRecommendationAgent ao feedService e WellnessContext
 *
 * Fluxo:
 * 1. Carrega perfil do WellnessContext
 * 2. Busca pool de conteúdo (Supabase ou local)
 * 3. Chama ContentRecommendationAgent para scoring
 * 4. Retorna recomendações personalizadas
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  ContentRecommendationAgent,
  RecommendationResult,
} from '@/agents/content/ContentRecommendationAgent';
import { ALL_CONTENT, SERIE_ORIGINAL } from '@/data/content';
import type { MotherProfile } from '@/features/wellness/types';
import type { ContentItem as DataContentItem } from '@/types/content';
import { buildUserContext, type ExpandedUserContext } from '@/utils/buildUserContext';
import { logger } from '@/utils/logger';

import { supabase } from './supabase';

// ======================
// TIPOS
// ======================

export interface PersonalizedContent {
  /** Conteúdos recomendados para o usuário */
  forYou: DataContentItem[];
  /** Explicação gerada por IA */
  reasoning: string;
  /** Confiança da recomendação (0-1) */
  confidence: number;
  /** Fonte dos dados: 'supabase' | 'local' | 'hybrid' */
  source: 'supabase' | 'local' | 'hybrid';
  /** Timestamp da geração */
  timestamp: number;
}

export interface RecommendationOptions {
  /** Quantidade máxima de recomendações */
  maxResults?: number;
  /** Incluir conteúdo premium? */
  includePremium?: boolean;
  /** Tipos de conteúdo permitidos */
  types?: DataContentItem['type'][];
  /** Forçar refresh (ignorar cache) */
  forceRefresh?: boolean;
}

// ======================
// CACHE
// ======================

const CACHE_KEY = 'nath_content_recommendations_cache';
const CACHE_TTL = 1000 * 60 * 30; // 30 minutos

interface CacheEntry {
  data: PersonalizedContent;
  profileHash: string;
  expiresAt: number;
}

// ======================
// SERVICE
// ======================

class ContentRecommendationService {
  private agent: ContentRecommendationAgent;
  private cache: CacheEntry | null = null;

  constructor() {
    this.agent = new ContentRecommendationAgent();
  }

  /**
   * Obtém recomendações personalizadas para o usuário
   */
  async getPersonalizedContent(options: RecommendationOptions = {}): Promise<PersonalizedContent> {
    const { maxResults = 6, includePremium = true, types, forceRefresh = false } = options;

    try {
      // 1. Carregar perfil do usuário
      const profile = await this.getUserProfile();
      const userContext = profile ? buildUserContext(profile) : null;
      const profileHash = this.hashProfile(userContext);

      // 2. Verificar cache
      if (!forceRefresh) {
        const cached = await this.getFromCache(profileHash);
        if (cached) {
          logger.info('[ContentRecommendation] Returning cached recommendations');
          return cached;
        }
      }

      // 3. Buscar pool de conteúdo
      const { contentPool, source } = await this.getContentPool(includePremium);

      // 4. Filtrar por tipo se especificado
      const filteredPool = types
        ? contentPool.filter((item) => types.includes(item.type))
        : contentPool;

      // 5. Se não há perfil, retornar conteúdo "em alta"
      if (!userContext) {
        const trending = this.getTrendingContent(filteredPool, maxResults);
        const result: PersonalizedContent = {
          forYou: trending,
          reasoning: 'Conteúdos mais populares para você conhecer nossa comunidade.',
          confidence: 0.3,
          source,
          timestamp: Date.now(),
        };
        await this.saveToCache(result, profileHash);
        return result;
      }

      // 6. Chamar agente de recomendação
      const agentResult = await this.callRecommendationAgent(filteredPool, userContext, maxResults);

      // 7. Formatar resultado
      const result: PersonalizedContent = {
        forYou: agentResult.recommendations.map((r) => this.mapAgentContentToLocal(r)),
        reasoning: agentResult.reasoning,
        confidence: agentResult.confidence,
        source,
        timestamp: agentResult.timestamp,
      };

      // 8. Salvar no cache
      await this.saveToCache(result, profileHash);

      logger.info('[ContentRecommendation] Generated new recommendations', {
        count: result.forYou.length,
        confidence: result.confidence,
        source,
      });

      return result;
    } catch (error) {
      logger.error('[ContentRecommendation] Error getting recommendations', error);

      // Fallback: retornar conteúdo local em alta
      return {
        forYou: this.getTrendingContent(ALL_CONTENT, maxResults),
        reasoning: 'Selecionamos os conteúdos mais populares para você.',
        confidence: 0.2,
        source: 'local',
        timestamp: Date.now(),
      };
    }
  }

  /**
   * Obtém série original com episódios
   */
  async getOriginalSeries(): Promise<typeof SERIE_ORIGINAL> {
    return SERIE_ORIGINAL;
  }

  /**
   * Invalida o cache de recomendações
   */
  async invalidateCache(): Promise<void> {
    this.cache = null;
    await AsyncStorage.removeItem(CACHE_KEY);
    logger.info('[ContentRecommendation] Cache invalidated');
  }

  // ======================
  // MÉTODOS PRIVADOS
  // ======================

  private async getUserProfile(): Promise<Partial<MotherProfile> | null> {
    try {
      // Tentar perfil de wellness primeiro
      const wellnessProfile = await AsyncStorage.getItem('nath_wellness_profile');
      if (wellnessProfile) {
        return JSON.parse(wellnessProfile) as Partial<MotherProfile>;
      }

      // Fallback para perfil legado
      const savedUser = await AsyncStorage.getItem('nath_user');
      if (savedUser) {
        return JSON.parse(savedUser) as Partial<MotherProfile>;
      }

      return null;
    } catch {
      return null;
    }
  }

  private async getContentPool(
    includePremium: boolean
  ): Promise<{ contentPool: DataContentItem[]; source: 'supabase' | 'local' | 'hybrid' }> {
    try {
      // Tentar buscar do Supabase primeiro
      const { data: supabaseContent, error } = await supabase
        .from('content_items')
        .select('*')
        .eq('is_published', true)
        .order('published_at', { ascending: false })
        .limit(50);

      if (!error && supabaseContent && supabaseContent.length > 0) {
        const content = supabaseContent.map((item) => this.mapSupabaseToLocal(item));

        // Se temos poucos itens do Supabase, combinar com local
        if (content.length < 10) {
          const combined = [...content, ...ALL_CONTENT];
          const unique = this.deduplicateContent(combined);
          return { contentPool: unique, source: 'hybrid' };
        }

        return { contentPool: content, source: 'supabase' };
      }
    } catch (error) {
      logger.warn('[ContentRecommendation] Supabase fetch failed, using local', error);
    }

    // Fallback: usar conteúdo local
    const localContent = includePremium
      ? ALL_CONTENT
      : ALL_CONTENT.filter((item) => !item.isPremium);

    return { contentPool: localContent, source: 'local' };
  }

  private async callRecommendationAgent(
    contentPool: DataContentItem[],
    userContext: ExpandedUserContext,
    maxResults: number
  ): Promise<RecommendationResult> {
    // Mapear para formato do agente
    const agentContentPool = contentPool.map((item) => ({
      id: item.id,
      type: item.type as 'video' | 'audio' | 'reel' | 'text' | 'article',
      title: item.title,
      description: item.description,
      category: item.category,
      tags: item.tags || [],
      thumbnailUrl: item.thumbnailUrl || item.imageUrl,
      duration: this.parseDuration(item.duration),
      url: item.videoUrl || item.audioUrl,
    }));

    // Construir request para o agente
    const request = {
      userId: 'local-user', // Identificador local
      userProfile: {
        lifeStage: userContext.lifeStage || 'new-mother',
        challenges: [
          ...(userContext.physicalChallenges || []),
          ...(userContext.sleepChallenges || []),
        ],
        interests: userContext.wellnessGoals || [],
        viewHistory: [], // TODO: implementar histórico de visualização
      },
      contentPool: agentContentPool,
      maxResults,
    };

    try {
      const result = await this.agent.process(request);
      return result;
    } catch (error) {
      logger.error('[ContentRecommendation] Agent processing failed', error);

      // Fallback: retornar conteúdo ordenado por views
      return {
        recommendations: agentContentPool.sort(() => Math.random() - 0.5).slice(0, maxResults),
        reasoning: 'Selecionamos esses conteúdos pensando em você.',
        confidence: 0.4,
        timestamp: Date.now(),
      };
    }
  }

  private getTrendingContent(content: DataContentItem[], limit: number): DataContentItem[] {
    return [...content].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, limit);
  }

  private mapSupabaseToLocal(item: Record<string, unknown>): DataContentItem {
    return {
      id: item.id as string,
      title: item.title as string,
      description: (item.description as string) || '',
      type: item.type as DataContentItem['type'],
      category: item.category as string,
      thumbnailUrl: item.thumbnail_url as string | undefined,
      imageUrl: item.thumbnail_url as string | undefined,
      videoUrl: item.video_url as string | undefined,
      audioUrl: item.audio_url as string | undefined,
      duration: item.duration ? String(item.duration) : undefined,
      views: item.views_count as number | undefined,
      likes: item.likes_count as number | undefined,
      isPremium: item.is_premium as boolean | undefined,
      isExclusive: item.is_exclusive as boolean | undefined,
      tags: item.tags as string[] | undefined,
    };
  }

  private mapAgentContentToLocal(item: {
    id: string;
    type: string;
    title: string;
    description?: string;
    category: string;
    tags: string[];
    thumbnailUrl?: string;
    duration?: number;
    url?: string;
    relevanceScore?: number;
  }): DataContentItem {
    // Tentar encontrar o item original no pool local
    const original = ALL_CONTENT.find((c) => c.id === item.id);
    if (original) {
      return { ...original, views: item.relevanceScore };
    }

    // Construir a partir dos dados do agente
    return {
      id: item.id,
      title: item.title,
      description: item.description || '',
      type: item.type as DataContentItem['type'],
      category: item.category,
      thumbnailUrl: item.thumbnailUrl,
      tags: item.tags,
      duration: item.duration ? `${item.duration} min` : undefined,
      videoUrl: item.url,
    };
  }

  private deduplicateContent(content: DataContentItem[]): DataContentItem[] {
    const seen = new Set<string>();
    return content.filter((item) => {
      if (seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    });
  }

  private parseDuration(duration?: string): number | undefined {
    if (!duration) return undefined;

    // Formatos: "5:20", "12:34", "5 min", "12 min"
    if (duration.includes(':')) {
      const [min, sec] = duration.split(':').map(Number);
      return min * 60 + (sec || 0);
    }

    const match = duration.match(/(\d+)/);
    return match ? Number(match[1]) * 60 : undefined;
  }

  private hashProfile(context: ExpandedUserContext | null): string {
    if (!context) return 'no-profile';

    const key = [
      context.lifeStage,
      context.pregnancyWeek,
      context.babyAgeMonths,
      (context.physicalChallenges || []).join(','),
      (context.sleepChallenges || []).join(','),
      context.emotionalState,
    ].join('|');

    // Simple hash
    let hash = 0;
    for (let i = 0; i < key.length; i++) {
      const char = key.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return hash.toString(16);
  }

  private async getFromCache(profileHash: string): Promise<PersonalizedContent | null> {
    // Verificar cache em memória primeiro
    if (this.cache && this.cache.profileHash === profileHash && this.cache.expiresAt > Date.now()) {
      return this.cache.data;
    }

    // Verificar AsyncStorage
    try {
      const stored = await AsyncStorage.getItem(CACHE_KEY);
      if (stored) {
        const cached = JSON.parse(stored) as CacheEntry;
        if (cached.profileHash === profileHash && cached.expiresAt > Date.now()) {
          this.cache = cached;
          return cached.data;
        }
      }
    } catch {
      // Ignorar erros de cache
    }

    return null;
  }

  private async saveToCache(data: PersonalizedContent, profileHash: string): Promise<void> {
    const entry: CacheEntry = {
      data,
      profileHash,
      expiresAt: Date.now() + CACHE_TTL,
    };

    this.cache = entry;

    try {
      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(entry));
    } catch {
      // Ignorar erros de cache
    }
  }
}

export const contentRecommendationService = new ContentRecommendationService();
export default contentRecommendationService;
