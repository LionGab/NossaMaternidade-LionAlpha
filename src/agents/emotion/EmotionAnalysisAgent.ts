/**
 * Emotion Analysis Agent
 * Agente especializado em análise emocional profunda para detecção de padrões
 * e alertas de saúde mental (depressão pós-parto, ansiedade, etc.)
 */

import { createMCPRequest } from '../../mcp/servers';
import { MCPResponse } from '../../mcp/types';
import { logger } from '../../utils/logger';
import { orchestrator } from '../core/AgentOrchestrator';
import { BaseAgent, AgentContext as _AgentContext } from '../core/BaseAgent';

export interface EmotionAnalysisInput {
  snapshots: EmotionSnapshot[];
  currentSnapshot: EmotionSnapshot;
}

export interface ProcessOptions {
  includeHistory?: boolean;
  maxRecommendations?: number;
  [key: string]: unknown;
}

export interface CurrentEmotionState {
  emotion: string;
  intensity: number;
  description: string;
}

export interface EmotionSnapshot {
  timestamp: string;
  emotion: 'great' | 'good' | 'okay' | 'sad' | 'terrible' | 'anxious' | 'overwhelmed';
  intensity: number; // 0-10
  triggers?: string[];
  context?: string;
  physicalSymptoms?: string[];
}

export interface EmotionPattern {
  dominantEmotion: string;
  frequency: number;
  trend: 'improving' | 'declining' | 'stable';
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  insights: string[];
}

export interface EmotionAnalysisResult {
  currentState: {
    emotion: string;
    intensity: number;
    description: string;
  };
  patterns: EmotionPattern;
  recommendations: string[];
  alerts: Array<{
    type: 'warning' | 'danger' | 'info';
    message: string;
    actionRequired: boolean;
  }>;
  supportResources?: Array<{
    title: string;
    description: string;
    url?: string;
  }>;
}

export class EmotionAnalysisAgent extends BaseAgent {
  constructor() {
    super({
      name: 'emotion-analysis',
      description: 'Analisa padrões emocionais e detecta riscos de saúde mental',
      capabilities: [
        'emotion-detection',
        'pattern-analysis',
        'risk-assessment',
        'support-recommendation',
      ],
      version: '1.0.0',
    });
  }

  async initialize(): Promise<void> {
    logger.info('[EmotionAnalysisAgent] Inicializando...');
    this.initialized = true;
  }

  async process(
    input: EmotionAnalysisInput,
    _options?: ProcessOptions
  ): Promise<EmotionAnalysisResult> {
    const snapshots = input.snapshots as EmotionSnapshot[];
    const currentSnapshot = input.currentSnapshot as EmotionSnapshot;

    // 1. Analisar estado atual
    const currentState = this.analyzeCurrentState(currentSnapshot);

    // 2. Detectar padrões emocionais
    const patterns = this.detectPatterns(snapshots);

    // 3. Gerar recomendações usando IA
    const recommendations = await this.generateRecommendations(currentState, patterns);

    // 4. Criar alertas se necessário
    const alerts = this.createAlerts(patterns, currentState);

    // 5. Buscar recursos de suporte
    const supportResources = this.getSupportResources(patterns.riskLevel);

    // Track analytics
    await this.trackAnalysis(patterns.riskLevel);

    return {
      currentState,
      patterns,
      recommendations,
      alerts,
      supportResources,
    };
  }

  private analyzeCurrentState(snapshot: EmotionSnapshot) {
    const emotionDescriptions: Record<string, string> = {
      great: 'Você está se sentindo muito bem! Continue assim.',
      good: 'Você está bem. É ótimo ver você positiva.',
      okay: 'Você está ok, mas pode estar enfrentando alguns desafios.',
      sad: 'Você está triste. Está tudo bem sentir isso.',
      terrible: 'Você está passando por um momento muito difícil.',
      anxious: 'Você está ansiosa. Respire fundo, você não está sozinha.',
      overwhelmed: 'Você está sobrecarregada. É hora de pedir ajuda.',
    };

    return {
      emotion: snapshot.emotion,
      intensity: snapshot.intensity,
      description: emotionDescriptions[snapshot.emotion] || 'Sentimento identificado.',
    };
  }

  private detectPatterns(snapshots: EmotionSnapshot[]): EmotionPattern {
    if (!snapshots || snapshots.length === 0) {
      return {
        dominantEmotion: 'unknown',
        frequency: 0,
        trend: 'stable',
        riskLevel: 'low',
        insights: ['Dados insuficientes para análise de padrões.'],
      };
    }

    // Contar emoções
    const emotionCounts: Record<string, number> = {};
    snapshots.forEach((snap) => {
      emotionCounts[snap.emotion] = (emotionCounts[snap.emotion] || 0) + 1;
    });

    // Emoção dominante
    const dominantEmotion = Object.keys(emotionCounts).reduce((a, b) =>
      emotionCounts[a] > emotionCounts[b] ? a : b
    );

    // Detectar tendência (últimos 7 dias vs 7 dias anteriores)
    const trend = this.calculateTrend(snapshots);

    // Avaliar risco
    const riskLevel = this.assessRisk(snapshots, dominantEmotion, trend);

    // Gerar insights
    const insights = this.generateInsights(snapshots, dominantEmotion, trend, riskLevel);

    return {
      dominantEmotion,
      frequency: emotionCounts[dominantEmotion],
      trend,
      riskLevel,
      insights,
    };
  }

  private calculateTrend(snapshots: EmotionSnapshot[]): 'improving' | 'declining' | 'stable' {
    if (snapshots.length < 7) return 'stable';

    // Mapear emoções para scores (0-10)
    const emotionScores: Record<string, number> = {
      great: 10,
      good: 8,
      okay: 6,
      anxious: 4,
      sad: 3,
      overwhelmed: 2,
      terrible: 0,
    };

    // Dividir em duas metades
    const mid = Math.floor(snapshots.length / 2);
    const firstHalf = snapshots.slice(0, mid);
    const secondHalf = snapshots.slice(mid);

    const avgFirst =
      firstHalf.reduce((sum, s) => sum + (emotionScores[s.emotion] || 5), 0) / firstHalf.length;
    const avgSecond =
      secondHalf.reduce((sum, s) => sum + (emotionScores[s.emotion] || 5), 0) / secondHalf.length;

    const diff = avgSecond - avgFirst;

    if (diff > 1) return 'improving';
    if (diff < -1) return 'declining';
    return 'stable';
  }

  private assessRisk(
    snapshots: EmotionSnapshot[],
    _dominantEmotion: string,
    trend: 'improving' | 'declining' | 'stable'
  ): 'low' | 'medium' | 'high' | 'critical' {
    // Emoções de alto risco
    const highRiskEmotions = ['terrible', 'overwhelmed'];
    const mediumRiskEmotions = ['sad', 'anxious'];

    // Contar snapshots recentes (últimos 7)
    const recent = snapshots.slice(-7);
    const highRiskCount = recent.filter((s) => highRiskEmotions.includes(s.emotion)).length;
    const mediumRiskCount = recent.filter((s) => mediumRiskEmotions.includes(s.emotion)).length;

    // Avaliar risco
    if (highRiskCount >= 5 || (highRiskCount >= 3 && trend === 'declining')) {
      return 'critical';
    }

    if (highRiskCount >= 3 || (mediumRiskCount >= 5 && trend === 'declining')) {
      return 'high';
    }

    if (mediumRiskCount >= 3 || trend === 'declining') {
      return 'medium';
    }

    return 'low';
  }

  private generateInsights(
    snapshots: EmotionSnapshot[],
    dominantEmotion: string,
    trend: 'improving' | 'declining' | 'stable',
    _riskLevel: string
  ): string[] {
    const insights: string[] = [];

    // Insight sobre emoção dominante
    if (dominantEmotion === 'great' || dominantEmotion === 'good') {
      insights.push('Você está mantendo um estado emocional positivo. Continue cuidando de si!');
    } else if (dominantEmotion === 'sad' || dominantEmotion === 'anxious') {
      insights.push(
        'Você tem passado por momentos difíceis. Lembre-se: é normal e você não está sozinha.'
      );
    } else if (dominantEmotion === 'terrible' || dominantEmotion === 'overwhelmed') {
      insights.push(
        'Você está enfrentando desafios significativos. Procurar ajuda é um sinal de força.'
      );
    }

    // Insight sobre tendência
    if (trend === 'improving') {
      insights.push('Suas emoções estão melhorando. Você está no caminho certo!');
    } else if (trend === 'declining') {
      insights.push(
        'Você tem se sentido pior nos últimos dias. Vamos encontrar formas de te apoiar.'
      );
    }

    // Insight sobre padrões
    if (snapshots.length >= 7) {
      const triggers = snapshots
        .filter((s) => s.triggers && s.triggers.length > 0)
        .flatMap((s) => s.triggers || []);

      if (triggers.length > 0) {
        const uniqueTriggers = [...new Set(triggers)];
        insights.push(`Gatilhos identificados: ${uniqueTriggers.slice(0, 3).join(', ')}`);
      }
    }

    return insights;
  }

  private async generateRecommendations(
    currentState: CurrentEmotionState,
    patterns: EmotionPattern
  ): Promise<string[]> {
    try {
      // Usar IA para gerar recomendações personalizadas
      const prompt = `
        Contexto emocional:
        - Emoção atual: ${currentState.emotion} (intensidade ${currentState.intensity}/10)
        - Emoção dominante: ${patterns.dominantEmotion}
        - Tendência: ${patterns.trend}
        - Nível de risco: ${patterns.riskLevel}

        Como especialista em saúde mental materna, sugira 3 recomendações PRÁTICAS e EMPÁTICAS
        para ajudar esta mãe. Seja breve (máximo 1 frase por recomendação).

        Formato: retorne apenas as 3 recomendações, uma por linha.
      `;

      const request = createMCPRequest('chat.send', {
        message: prompt,
        context: {
          temperature: 0.7,
          maxTokens: 200,
        },
      });

      const response = await orchestrator.callMCP('googleai', 'chat.send', request.params);

      if (response.success && response.data) {
        const data = response.data as { text?: string };
        if (data.text) {
          // Parse recommendations
          const lines = data.text
            .split('\n')
            .filter((line: string) => line.trim().length > 0)
            .map((line: string) => line.replace(/^[-•*]\s*/, '').trim())
            .slice(0, 3);

          return lines.length > 0 ? lines : this.getFallbackRecommendations(patterns.riskLevel);
        }
      }

      return this.getFallbackRecommendations(patterns.riskLevel);
    } catch (error) {
      logger.error('[EmotionAnalysisAgent] Error generating recommendations', error);
      return this.getFallbackRecommendations(patterns.riskLevel);
    }
  }

  private getFallbackRecommendations(riskLevel: string): string[] {
    const recommendations: Record<string, string[]> = {
      critical: [
        'Entre em contato com um profissional de saúde mental HOJE.',
        'Converse com alguém de confiança sobre como está se sentindo.',
        'Ligue para o CVV (188) se precisar de apoio imediato.',
      ],
      high: [
        'Considere agendar uma consulta com um psicólogo ou psiquiatra.',
        'Pratique técnicas de respiração profunda 3x ao dia.',
        'Reserve 15 minutos hoje só para você.',
      ],
      medium: [
        'Tente fazer uma caminhada curta ao ar livre hoje.',
        'Converse com alguém que te compreenda sobre seus sentimentos.',
        'Pratique um exercício de mindfulness por 5 minutos.',
      ],
      low: [
        'Continue cuidando de si! Você está indo bem.',
        'Mantenha uma rotina de autocuidado regular.',
        'Celebre suas pequenas vitórias diárias.',
      ],
    };

    return recommendations[riskLevel] || recommendations['medium'];
  }

  private createAlerts(patterns: EmotionPattern, _currentState: CurrentEmotionState) {
    const alerts: Array<{
      type: 'warning' | 'danger' | 'info';
      message: string;
      actionRequired: boolean;
    }> = [];

    if (patterns.riskLevel === 'critical') {
      alerts.push({
        type: 'danger',
        message:
          'Você está passando por um momento muito difícil. É IMPORTANTE buscar ajuda profissional agora.',
        actionRequired: true,
      });
    } else if (patterns.riskLevel === 'high') {
      alerts.push({
        type: 'warning',
        message: 'Suas emoções indicam que você pode precisar de suporte profissional.',
        actionRequired: true,
      });
    } else if (patterns.trend === 'declining') {
      alerts.push({
        type: 'warning',
        message: 'Notamos que você tem se sentido pior nos últimos dias. Vamos te apoiar.',
        actionRequired: false,
      });
    }

    return alerts;
  }

  private getSupportResources(riskLevel: string) {
    const resources = [
      {
        title: 'CVV - Centro de Valorização da Vida',
        description: 'Apoio emocional 24h. Ligue 188 (gratuito)',
        url: 'https://www.cvv.org.br' as string | undefined,
      },
      {
        title: 'CAPS - Centro de Atenção Psicossocial',
        description: 'Atendimento gratuito em saúde mental pelo SUS',
        url: 'https://www.gov.br/saude/pt-br/composicao/saes/caps' as string | undefined,
      },
    ];

    if (riskLevel === 'critical' || riskLevel === 'high') {
      resources.unshift({
        title: '🚨 SAMU 192',
        description: 'Emergência médica 24h',
        url: undefined as string | undefined,
      });
    }

    return resources;
  }

  private async trackAnalysis(riskLevel: string) {
    try {
      const request = createMCPRequest('event.track', {
        name: 'emotion_analysis_completed',
        properties: {
          riskLevel,
          timestamp: Date.now(),
        },
      });

      await orchestrator.callMCP('analytics', 'event.track', request.params);
    } catch (error) {
      logger.error('[EmotionAnalysisAgent] Analytics error', error);
    }
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

  async shutdown(): Promise<void> {
    logger.info('[EmotionAnalysisAgent] Shutdown complete');
  }
}
