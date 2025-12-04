/**
 * Sleep Analysis Agent
 * Agente especializado em análise de sono maternal
 * Detecta padrões, privação, qualidade e recomenda ajustes
 */

import { createMCPRequest } from '../../mcp/servers';
import { MCPResponse } from '../../mcp/types';
import { logger } from '../../utils/logger';
import { orchestrator } from '../core/AgentOrchestrator';
import { BaseAgent } from '../core/BaseAgent';

export interface SleepEntry {
  date: string;
  hoursSlept: number;
  quality: 'excellent' | 'good' | 'fair' | 'poor' | 'terrible';
  interruptions: number;
  timeToFallAsleep?: number; // minutos
  wakeUpTime?: string;
  bedTime?: string;
  notes?: string;
}

export interface SleepPattern {
  averageHours: number;
  averageQuality: number; // 0-100
  averageInterruptions: number;
  trend: 'improving' | 'declining' | 'stable';
  deprivationLevel: 'none' | 'mild' | 'moderate' | 'severe';
  consistency: number; // 0-100
  insights: string[];
}

export interface SleepAnalysisResult {
  currentState: {
    lastNightHours: number;
    lastNightQuality: string;
    status: 'well-rested' | 'tired' | 'exhausted' | 'critical';
  };
  patterns: SleepPattern;
  recommendations: string[];
  alerts: Array<{
    type: 'warning' | 'danger' | 'info';
    message: string;
  }>;
}

export class SleepAnalysisAgent extends BaseAgent {
  constructor() {
    super({
      name: 'sleep-analysis',
      description: 'Analisa padrões de sono e detecta privação',
      capabilities: [
        'sleep-tracking',
        'pattern-detection',
        'deprivation-assessment',
        'recommendations',
      ],
      version: '1.0.0',
    });
  }

  async initialize(): Promise<void> {
    logger.info('[SleepAnalysisAgent] Inicializando...');
    this.initialized = true;
  }

  async process(
    input: { entries: SleepEntry[] },
    _options?: Record<string, unknown>
  ): Promise<SleepAnalysisResult> {
    const { entries } = input;

    if (!entries || entries.length === 0) {
      return this.getDefaultResult();
    }

    // Análise do estado atual
    const currentState = this.analyzeCurrentState(entries);

    // Detectar padrões
    const patterns = this.detectPatterns(entries);

    // Gerar recomendações
    const recommendations = await this.generateRecommendations(currentState, patterns);

    // Criar alertas
    const alerts = this.createAlerts(patterns, currentState);

    return {
      currentState,
      patterns,
      recommendations,
      alerts,
    };
  }

  private analyzeCurrentState(entries: SleepEntry[]) {
    const lastNight = entries[entries.length - 1];

    let status: 'well-rested' | 'tired' | 'exhausted' | 'critical';

    if (lastNight.hoursSlept >= 7) {
      status = 'well-rested';
    } else if (lastNight.hoursSlept >= 5) {
      status = 'tired';
    } else if (lastNight.hoursSlept >= 3) {
      status = 'exhausted';
    } else {
      status = 'critical';
    }

    return {
      lastNightHours: lastNight.hoursSlept,
      lastNightQuality: lastNight.quality,
      status,
    };
  }

  private detectPatterns(entries: SleepEntry[]): SleepPattern {
    // Média de horas
    const averageHours = entries.reduce((sum, e) => sum + e.hoursSlept, 0) / entries.length;

    // Média de qualidade (0-100)
    const qualityMap: Record<string, number> = {
      excellent: 100,
      good: 80,
      fair: 60,
      poor: 40,
      terrible: 20,
    };
    const averageQuality =
      entries.reduce((sum, e) => sum + qualityMap[e.quality], 0) / entries.length;

    // Média de interrupções
    const averageInterruptions =
      entries.reduce((sum, e) => sum + e.interruptions, 0) / entries.length;

    // Detectar tendência
    const trend = this.calculateTrend(entries);

    // Avaliar privação
    const deprivationLevel = this.assessDeprivation(averageHours, averageQuality);

    // Calcular consistência
    const consistency = this.calculateConsistency(entries);

    // Gerar insights
    const insights = this.generateInsights(
      averageHours,
      averageQuality,
      averageInterruptions,
      trend,
      deprivationLevel
    );

    return {
      averageHours,
      averageQuality,
      averageInterruptions,
      trend,
      deprivationLevel,
      consistency,
      insights,
    };
  }

  private calculateTrend(entries: SleepEntry[]): 'improving' | 'declining' | 'stable' {
    if (entries.length < 7) return 'stable';

    const mid = Math.floor(entries.length / 2);
    const firstHalf = entries.slice(0, mid);
    const secondHalf = entries.slice(mid);

    const avgFirst = firstHalf.reduce((sum, e) => sum + e.hoursSlept, 0) / firstHalf.length;
    const avgSecond = secondHalf.reduce((sum, e) => sum + e.hoursSlept, 0) / secondHalf.length;

    const diff = avgSecond - avgFirst;

    if (diff > 0.5) return 'improving';
    if (diff < -0.5) return 'declining';
    return 'stable';
  }

  private assessDeprivation(
    avgHours: number,
    avgQuality: number
  ): 'none' | 'mild' | 'moderate' | 'severe' {
    if (avgHours >= 7 && avgQuality >= 70) return 'none';
    if (avgHours >= 6 && avgQuality >= 60) return 'mild';
    if (avgHours >= 5) return 'moderate';
    return 'severe';
  }

  private calculateConsistency(entries: SleepEntry[]): number {
    if (entries.length < 2) return 100;

    // Calcular desvio padrão das horas de sono
    const avgHours = entries.reduce((sum, e) => sum + e.hoursSlept, 0) / entries.length;
    const variance =
      entries.reduce((sum, e) => sum + Math.pow(e.hoursSlept - avgHours, 2), 0) / entries.length;
    const stdDev = Math.sqrt(variance);

    // Converter para score 0-100 (menos desvio = mais consistência)
    const consistency = Math.max(0, 100 - stdDev * 20);
    return Math.round(consistency);
  }

  private generateInsights(
    avgHours: number,
    avgQuality: number,
    avgInterruptions: number,
    trend: string,
    _deprivation: string
  ): string[] {
    const insights: string[] = [];

    // Insight sobre horas de sono
    if (avgHours < 5) {
      insights.push('Você está dormindo muito pouco. Privação de sono é séria.');
    } else if (avgHours < 6) {
      insights.push('Suas horas de sono estão abaixo do ideal.');
    } else if (avgHours >= 7) {
      insights.push('Você está conseguindo dormir um bom número de horas!');
    }

    // Insight sobre qualidade
    if (avgQuality < 50) {
      insights.push('A qualidade do seu sono está baixa. Vamos trabalhar nisso.');
    } else if (avgQuality >= 70) {
      insights.push('A qualidade do seu sono está boa!');
    }

    // Insight sobre interrupções
    if (avgInterruptions > 5) {
      insights.push(
        `Você acorda em média ${Math.round(avgInterruptions)} vezes por noite. Isso é muito.`
      );
    } else if (avgInterruptions > 3) {
      insights.push('As interrupções durante a noite estão prejudicando seu descanso.');
    }

    // Insight sobre tendência
    if (trend === 'improving') {
      insights.push('Seu sono está melhorando! Continue assim.');
    } else if (trend === 'declining') {
      insights.push('Seu sono tem piorado. Vamos identificar o que mudou.');
    }

    return insights;
  }

  private async generateRecommendations(
    currentState: SleepAnalysisResult['currentState'],
    patterns: SleepPattern
  ): Promise<string[]> {
    try {
      const prompt = `
        Contexto de sono:
        - Última noite: ${currentState.lastNightHours}h (${currentState.lastNightQuality})
        - Média: ${patterns.averageHours.toFixed(1)}h por noite
        - Qualidade média: ${Math.round(patterns.averageQuality)}/100
        - Privação: ${patterns.deprivationLevel}
        - Interrupções: ${patterns.averageInterruptions.toFixed(1)} por noite

        Como especialista em sono maternal, sugira 3 recomendações PRÁTICAS e EMPÁTICAS.
        Considere que esta é uma MÃE (pode ter bebê acordando, rotina difícil).

        IMPORTANTE: NÃO dê conselhos médicos. Seja realista e compreensiva.

        Formato: 3 recomendações, uma por linha.
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
          const lines = data.text
            .split('\n')
            .filter((line: string) => line.trim().length > 0)
            .map((line: string) => line.replace(/^[-•*]\s*/, '').trim())
            .slice(0, 3);

          return lines.length > 0
            ? lines
            : this.getFallbackRecommendations(patterns.deprivationLevel);
        }
      }

      return this.getFallbackRecommendations(patterns.deprivationLevel);
    } catch (error) {
      logger.error('[SleepAnalysisAgent] Error generating recommendations', error);
      return this.getFallbackRecommendations(patterns.deprivationLevel);
    }
  }

  private getFallbackRecommendations(deprivation: string): string[] {
    const recommendations: Record<string, string[]> = {
      severe: [
        'Sua privação de sono é crítica. Converse com seu médico HOJE.',
        'Peça ajuda para cuidar do bebê enquanto você descansa.',
        'Tente cochilar quando o bebê dormir, mesmo que por 20 minutos.',
      ],
      moderate: [
        'Priorize sono sobre tarefas domésticas. Sério.',
        'Peça a alguém para ficar com o bebê por algumas horas.',
        'Tente ir para a cama 30 minutos mais cedo.',
      ],
      mild: [
        'Você está indo bem! Mantenha uma rotina de sono consistente.',
        'Evite telas 1h antes de dormir.',
        'Considere um ritual relaxante antes da cama.',
      ],
      none: [
        'Você está descansando bem! Continue assim.',
        'Mantenha sua rotina de sono.',
        'Celebre isso: sono bom é uma vitória!',
      ],
    };

    return recommendations[deprivation] || recommendations['moderate'];
  }

  private createAlerts(patterns: SleepPattern, _currentState: SleepAnalysisResult['currentState']) {
    const alerts: Array<{ type: 'warning' | 'danger' | 'info'; message: string }> = [];

    if (patterns.deprivationLevel === 'severe') {
      alerts.push({
        type: 'danger',
        message:
          'ALERTA: Privação severa de sono. Isso afeta sua saúde física e mental. Busque ajuda.',
      });
    } else if (patterns.deprivationLevel === 'moderate') {
      alerts.push({
        type: 'warning',
        message: 'Você está com privação moderada de sono. Priorize descanso esta semana.',
      });
    }

    if (patterns.trend === 'declining') {
      alerts.push({
        type: 'warning',
        message: 'Seu sono tem piorado. Vamos identificar o que mudou.',
      });
    }

    if (patterns.averageInterruptions > 6) {
      alerts.push({
        type: 'info',
        message:
          'Muitas interrupções durante a noite. Converse com seu pediatra sobre o sono do bebê.',
      });
    }

    return alerts;
  }

  private getDefaultResult(): SleepAnalysisResult {
    return {
      currentState: {
        lastNightHours: 0,
        lastNightQuality: 'unknown',
        status: 'tired',
      },
      patterns: {
        averageHours: 0,
        averageQuality: 0,
        averageInterruptions: 0,
        trend: 'stable',
        deprivationLevel: 'none',
        consistency: 0,
        insights: ['Comece a registrar seu sono para análise detalhada.'],
      },
      recommendations: [
        'Comece a rastrear seu sono diariamente.',
        'Anote quantas horas você dormiu e como se sentiu.',
        'Isso nos ajudará a identificar padrões.',
      ],
      alerts: [],
    };
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
    logger.info('[SleepAnalysisAgent] Shutdown');
  }
}
