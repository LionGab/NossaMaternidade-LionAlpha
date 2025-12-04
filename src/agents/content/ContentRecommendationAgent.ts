/**
 * Content Recommendation Agent
 * Agente especializado em recomendar conteúdo personalizado baseado no perfil e comportamento do usuário
 */

import { MCPResponse } from '../../mcp/types';
import { logger } from '../../utils/logger';
import { orchestrator } from '../core/AgentOrchestrator';
import { BaseAgent, AgentConfig, AgentContext as _AgentContext } from '../core/BaseAgent';

export interface ContentItem {
  id: string;
  type: 'video' | 'audio' | 'reel' | 'text' | 'article';
  title: string;
  description?: string;
  category: string;
  tags: string[];
  relevanceScore?: number;
  thumbnailUrl?: string;
  duration?: number;
  url?: string;
}

export interface RecommendationRequest {
  userId: string;
  userProfile: {
    lifeStage: string;
    timeline?: string;
    challenges?: string[];
    interests?: string[];
    viewHistory?: string[];
  };
  contentPool: ContentItem[];
  maxResults?: number;
  filters?: {
    types?: string[];
    categories?: string[];
    tags?: string[];
  };
}

export interface RecommendationResult {
  recommendations: ContentItem[];
  reasoning: string;
  confidence: number;
  timestamp: number;
}

export class ContentRecommendationAgent extends BaseAgent {
  constructor() {
    const config: AgentConfig = {
      name: 'content-recommendation-agent',
      version: '1.0.0',
      description: 'Agente de recomendação de conteúdo personalizado baseado em IA',
      capabilities: [
        'content-scoring',
        'personalization',
        'filtering',
        'trending-analysis',
        'diversity-optimization',
      ],
    };
    super(config);
  }

  /**
   * Helper para tracking de eventos de analytics de forma não bloqueante
   * Fire-and-forget: não espera a promise, não bloqueia o fluxo
   */
  private trackEventSafely(eventName: string, properties: Record<string, unknown>): void {
    this.callMCP('analytics', 'event.track', {
      name: eventName,
      properties,
    }).catch((error) => {
      logger.warn('[ContentRecommendationAgent] Analytics tracking failed (non-blocking)', {
        eventName,
        error: error instanceof Error ? error.message : String(error),
      });
    });
  }

  /**
   * Processa recomendações de conteúdo
   */
  async process(
    input: RecommendationRequest,
    _options?: Record<string, unknown>
  ): Promise<RecommendationResult> {
    const { userId, userProfile, contentPool, maxResults = 10, filters } = input;

    try {
      // Track recommendation request (não bloqueante)
      this.trackEventSafely('content_recommendation_requested', {
        userId,
        contentPoolSize: contentPool.length,
        maxResults,
        lifeStage: userProfile.lifeStage,
      });

      // Filtrar conteúdo baseado em filtros fornecidos
      const filteredContent = this.applyFilters(contentPool, filters);

      // Calcular scores de relevância para cada item
      const scoredContent = await this.scoreContent(filteredContent, userProfile);

      // Otimizar diversidade (evitar recomendar apenas um tipo de conteúdo)
      const diversifiedContent = this.optimizeDiversity(scoredContent);

      // Selecionar top N recomendações
      const recommendations = diversifiedContent.slice(0, maxResults);

      // Gerar explicação usando AI
      const reasoning = await this.generateReasoning(recommendations, userProfile);

      const result: RecommendationResult = {
        recommendations,
        reasoning,
        confidence: this.calculateConfidence(recommendations, userProfile),
        timestamp: Date.now(),
      };

      // Track recommendations delivered (não bloqueante)
      this.trackEventSafely('content_recommendations_delivered', {
        userId,
        recommendationCount: recommendations.length,
        confidence: result.confidence,
        topContentTypes: this.getContentTypeDistribution(recommendations),
      });

      return result;
    } catch (error: unknown) {
      logger.error('[ContentRecommendationAgent] Error processing recommendations', error);

      // Retornar resultado padrão em vez de travar a tela
      return {
        recommendations: [],
        reasoning: 'Não foi possível carregar recomendações. Tente novamente.',
        confidence: 0,
        timestamp: Date.now(),
      };
    }
  }

  /**
   * Aplica filtros ao pool de conteúdo
   */
  private applyFilters(
    content: ContentItem[],
    filters?: RecommendationRequest['filters']
  ): ContentItem[] {
    if (!filters) return content;

    return content.filter((item) => {
      // Filtro de tipos - só aplica se array não estiver vazio
      if (filters.types && filters.types.length > 0 && !filters.types.includes(item.type)) {
        return false;
      }

      // Filtro de categorias - só aplica se array não estiver vazio
      if (
        filters.categories &&
        filters.categories.length > 0 &&
        !filters.categories.includes(item.category)
      ) {
        return false;
      }

      // Filtro de tags (pelo menos uma tag deve corresponder) - só aplica se array não estiver vazio
      if (filters.tags && filters.tags.length > 0) {
        const hasMatchingTag = item.tags.some((tag) => filters.tags?.includes(tag));
        if (!hasMatchingTag) return false;
      }

      return true;
    });
  }

  /**
   * Calcula score de relevância para cada item de conteúdo
   */
  private async scoreContent(
    content: ContentItem[],
    userProfile: RecommendationRequest['userProfile']
  ): Promise<ContentItem[]> {
    const { lifeStage, timeline: _timeline, challenges = [], viewHistory = [] } = userProfile;

    return content
      .map((item) => {
        let score = 0;

        // Base score por categoria/life stage match
        if (this.matchesLifeStage(item, lifeStage)) {
          score += 50;
        }

        // Score por desafios do usuário
        challenges.forEach((challenge) => {
          if (this.itemAddressesChallenge(item, challenge)) {
            score += 30;
          }
        });

        // Penalizar conteúdo já visto (mas não eliminar completamente)
        if (viewHistory.includes(item.id)) {
          score -= 40;
        }

        // Boost para conteúdo recente (simulado)
        // Em produção, usar timestamp real do conteúdo
        score += Math.random() * 10; // Fator de novidade

        // Normalizar score entre 0-100
        item.relevanceScore = Math.max(0, Math.min(100, score));

        return item;
      })
      .sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0));
  }

  /**
   * Verifica se o conteúdo corresponde à fase da vida
   */
  private matchesLifeStage(item: ContentItem, lifeStage: string): boolean {
    const stageKeywords: Record<string, string[]> = {
      pregnant: ['gestação', 'gravidez', 'pregnant', 'prenatal'],
      'new-mother': ['recém-nascido', 'newborn', 'pós-parto', 'postpartum'],
      'experienced-mother': ['desenvolvimento', 'criança', 'toddler', 'child'],
      trying: ['fertilidade', 'fertility', 'tentante', 'conception'],
    };

    const keywords = stageKeywords[lifeStage] || [];
    const searchText = `${item.title} ${item.description} ${item.tags.join(' ')}`.toLowerCase();

    return keywords.some((keyword) => searchText.includes(keyword));
  }

  /**
   * Verifica se o conteúdo aborda um desafio específico
   */
  private itemAddressesChallenge(item: ContentItem, challenge: string): boolean {
    const challengeKeywords: Record<string, string[]> = {
      sleep: ['sono', 'sleep', 'dormir'],
      breastfeeding: ['amamentação', 'breastfeeding', 'aleitamento'],
      anxiety: ['ansiedade', 'anxiety', 'preocupação'],
      relationships: ['relacionamento', 'relationship', 'parceiro'],
      work: ['trabalho', 'work', 'carreira'],
      loneliness: ['solidão', 'loneliness', 'isolamento'],
    };

    const keywords = challengeKeywords[challenge] || [challenge];
    const searchText = `${item.title} ${item.description} ${item.tags.join(' ')}`.toLowerCase();

    return keywords.some((keyword) => searchText.includes(keyword));
  }

  /**
   * Otimiza diversidade do conteúdo recomendado
   */
  private optimizeDiversity(content: ContentItem[]): ContentItem[] {
    const diversified: ContentItem[] = [];
    const typeCount: Record<string, number> = {};
    const categoryCount: Record<string, number> = {};

    for (const item of content) {
      // Limitar repetição de tipos e categorias
      const currentTypeCount = typeCount[item.type] || 0;
      const currentCategoryCount = categoryCount[item.category] || 0;

      // Permitir no máximo 4 itens do mesmo tipo e 3 da mesma categoria
      if (currentTypeCount < 4 && currentCategoryCount < 3) {
        diversified.push(item);
        typeCount[item.type] = currentTypeCount + 1;
        categoryCount[item.category] = currentCategoryCount + 1;
      }

      // Parar quando tivermos items suficientes
      if (diversified.length >= content.length * 0.8) break;
    }

    return diversified;
  }

  /**
   * Gera explicação das recomendações usando AI
   */
  private async generateReasoning(
    recommendations: ContentItem[],
    userProfile: RecommendationRequest['userProfile']
  ): Promise<string> {
    try {
      const prompt = `
Você é um assistente que explica recomendações de conteúdo.

PERFIL DO USUÁRIO:
- Fase: ${userProfile.lifeStage}
- Desafios: ${userProfile.challenges?.join(', ') || 'Não especificados'}

CONTEÚDOS RECOMENDADOS:
${recommendations.map((item, i) => `${i + 1}. ${item.title} (${item.type})`).join('\n')}

Escreva uma explicação curta (2-3 frases) de POR QUE esses conteúdos foram recomendados para esta mãe.
Use um tom acolhedor e personalizado.
`;

      const response = await this.callMCP('googleai', 'generate.content', {
        prompt,
      });

      if (response.success && response.data) {
        const data = response.data as { content?: string };
        if (data.content) {
          return data.content;
        }
      }

      return 'Selecionamos esses conteúdos especialmente para você, considerando sua fase e necessidades.';
    } catch (error) {
      logger.error('[ContentRecommendationAgent] Failed to generate reasoning', error);
      return 'Conteúdos personalizados para você.';
    }
  }

  /**
   * Calcula confiança das recomendações
   */
  private calculateConfidence(
    recommendations: ContentItem[],
    userProfile: RecommendationRequest['userProfile']
  ): number {
    if (recommendations.length === 0) return 0;

    // Calcular média dos scores de relevância
    const avgScore =
      recommendations.reduce((sum, item) => sum + (item.relevanceScore || 0), 0) /
      recommendations.length;

    // Ajustar baseado em completude do perfil
    let profileCompleteness = 0.5;
    if (userProfile.lifeStage) profileCompleteness += 0.2;
    if (userProfile.challenges && userProfile.challenges.length > 0) profileCompleteness += 0.2;
    if (userProfile.viewHistory && userProfile.viewHistory.length > 3) profileCompleteness += 0.1;

    // Confiança final (0-1)
    return Math.min(1, (avgScore / 100) * profileCompleteness);
  }

  /**
   * Obtém distribuição de tipos de conteúdo
   */
  private getContentTypeDistribution(recommendations: ContentItem[]): Record<string, number> {
    const distribution: Record<string, number> = {};

    recommendations.forEach((item) => {
      distribution[item.type] = (distribution[item.type] || 0) + 1;
    });

    return distribution;
  }

  /**
   * Implementação do callMCP
   */
  protected async callMCP(
    server: string,
    method: string,
    params: Record<string, unknown>
  ): Promise<MCPResponse> {
    // Cast method to proper type based on the server
    if (server === 'googleai') {
      return await orchestrator.callMCP(
        server,
        method as keyof import('../../mcp/types').GoogleAIMCPMethods,
        params
      );
    } else if (server === 'analytics') {
      return await orchestrator.callMCP(
        server,
        method as keyof import('../../mcp/types').AnalyticsMCPMethods,
        params
      );
    }
    return await orchestrator.callMCP(
      server,
      method as keyof import('../../mcp/types').AllMCPMethods,
      params
    );
  }
}
