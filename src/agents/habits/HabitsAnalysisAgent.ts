/**
 * Habits Analysis Agent
 * Agente especializado em análise de hábitos e bem-estar maternal
 */

import { MCPResponse } from '../../mcp/types';
import { logger } from '../../utils/logger';
import { orchestrator } from '../core/AgentOrchestrator';
import { BaseAgent, AgentConfig, AgentContext as _AgentContext } from '../core/BaseAgent';

export interface HabitEntry {
  id: string;
  habitId: string;
  habitName: string;
  date: string; // ISO date
  completed: boolean;
  value?: number; // Para hábitos quantificáveis
  notes?: string;
  mood?: 'great' | 'good' | 'okay' | 'bad' | 'terrible';
  timestamp: number;
}

export interface HabitPattern {
  habitId: string;
  habitName: string;
  completionRate: number; // 0-1
  streak: number; // Dias consecutivos
  bestStreak: number;
  averageValue?: number;
  trend: 'improving' | 'declining' | 'stable';
  insights: string[];
}

export interface WellbeingAnalysis {
  overallScore: number; // 0-100
  sleepQuality: number; // 0-100
  moodScore: number; // 0-100
  habitConsistency: number; // 0-100
  patterns: HabitPattern[];
  recommendations: string[];
  alerts: string[];
  timestamp: number;
}

export class HabitsAnalysisAgent extends BaseAgent {
  constructor() {
    const config: AgentConfig = {
      name: 'habits-analysis-agent',
      version: '1.0.0',
      description: 'Agente de análise de hábitos e bem-estar com insights baseados em IA',
      capabilities: [
        'habit-tracking',
        'pattern-detection',
        'trend-analysis',
        'personalized-insights',
        'wellbeing-scoring',
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
      logger.warn('[HabitsAnalysisAgent] Analytics tracking failed (non-blocking)', {
        eventName,
        error: error instanceof Error ? error.message : String(error),
      });
    });
  }

  /**
   * Analisa hábitos e gera insights
   */
  async process(
    input: {
      userId: string;
      entries: HabitEntry[];
      timeRange?: { start: string; end: string };
    },
    _options?: Record<string, unknown>
  ): Promise<WellbeingAnalysis> {
    const { userId, entries, timeRange } = input;

    try {
      // Track analysis request (não bloqueante)
      this.trackEventSafely('habits_analysis_requested', {
        userId,
        entriesCount: entries.length,
        timeRange,
      });

      // Filtrar entries por timeRange se fornecido
      const filteredEntries = timeRange ? this.filterByTimeRange(entries, timeRange) : entries;

      // Analisar padrões de hábitos
      const patterns = await this.analyzeHabitPatterns(filteredEntries);

      // Calcular scores
      const sleepQuality = this.calculateSleepQuality(filteredEntries);
      const moodScore = this.calculateMoodScore(filteredEntries);
      const habitConsistency = this.calculateHabitConsistency(patterns);

      // Score geral (média ponderada)
      const overallScore = sleepQuality * 0.4 + moodScore * 0.3 + habitConsistency * 0.3;

      // Gerar recomendações usando AI
      const recommendations = await this.generateRecommendations(patterns, overallScore);

      // Detectar alertas (padrões preocupantes)
      const alerts = this.detectAlerts(patterns, filteredEntries);

      const analysis: WellbeingAnalysis = {
        overallScore: Math.round(overallScore),
        sleepQuality: Math.round(sleepQuality),
        moodScore: Math.round(moodScore),
        habitConsistency: Math.round(habitConsistency),
        patterns,
        recommendations,
        alerts,
        timestamp: Date.now(),
      };

      // Track analysis completed (não bloqueante)
      this.trackEventSafely('habits_analysis_completed', {
        userId,
        overallScore: analysis.overallScore,
        patternsCount: patterns.length,
        alertsCount: alerts.length,
      });

      return analysis;
    } catch (error: unknown) {
      logger.error('[HabitsAnalysisAgent] Error analyzing habits', error);

      // Retornar análise padrão em vez de travar a tela
      return {
        overallScore: 50,
        sleepQuality: 50,
        moodScore: 50,
        habitConsistency: 0,
        patterns: [],
        recommendations: ['Não foi possível analisar seus hábitos. Tente novamente mais tarde.'],
        alerts: [],
        timestamp: Date.now(),
      };
    }
  }

  /**
   * Filtra entries por período de tempo
   */
  private filterByTimeRange(
    entries: HabitEntry[],
    timeRange: { start: string; end: string }
  ): HabitEntry[] {
    const start = new Date(timeRange.start).getTime();
    const end = new Date(timeRange.end).getTime();

    return entries.filter((entry) => {
      const entryDate = new Date(entry.date).getTime();
      return entryDate >= start && entryDate <= end;
    });
  }

  /**
   * Analisa padrões de hábitos individuais
   */
  private async analyzeHabitPatterns(entries: HabitEntry[]): Promise<HabitPattern[]> {
    // Agrupar entries por hábito
    const habitGroups = this.groupByHabit(entries);
    const patterns: HabitPattern[] = [];

    for (const [habitId, habitEntries] of Object.entries(habitGroups)) {
      const habitName = habitEntries[0].habitName;

      // Calcular taxa de conclusão
      const completedCount = habitEntries.filter((e) => e.completed).length;
      const completionRate = completedCount / habitEntries.length;

      // Calcular streak (dias consecutivos)
      const { currentStreak, bestStreak } = this.calculateStreaks(habitEntries);

      // Calcular valor médio (se aplicável)
      const values = habitEntries.filter((e) => e.value !== undefined).map((e) => e.value!);
      const averageValue =
        values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : undefined;

      // Detectar tendência
      const trend = this.detectTrend(habitEntries);

      // Gerar insights
      const insights = this.generateHabitInsights(habitName, completionRate, currentStreak, trend);

      patterns.push({
        habitId,
        habitName,
        completionRate,
        streak: currentStreak,
        bestStreak,
        averageValue,
        trend,
        insights,
      });
    }

    return patterns.sort((a, b) => b.completionRate - a.completionRate);
  }

  /**
   * Agrupa entries por hábito
   */
  private groupByHabit(entries: HabitEntry[]): Record<string, HabitEntry[]> {
    const groups: Record<string, HabitEntry[]> = {};

    entries.forEach((entry) => {
      if (!groups[entry.habitId]) {
        groups[entry.habitId] = [];
      }
      groups[entry.habitId].push(entry);
    });

    // Ordenar por data
    Object.keys(groups).forEach((habitId) => {
      groups[habitId].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    });

    return groups;
  }

  /**
   * Calcula streaks (sequências)
   */
  private calculateStreaks(entries: HabitEntry[]): {
    currentStreak: number;
    bestStreak: number;
  } {
    let currentStreak = 0;
    let bestStreak = 0;
    let tempStreak = 0;

    // Ordenar por data decrescente para pegar streak atual
    const sorted = [...entries].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    // Calcular current streak (a partir do dia mais recente)
    for (let i = 0; i < sorted.length; i++) {
      if (sorted[i].completed) {
        currentStreak++;
      } else {
        break;
      }
    }

    // Calcular best streak
    for (const entry of entries) {
      if (entry.completed) {
        tempStreak++;
        bestStreak = Math.max(bestStreak, tempStreak);
      } else {
        tempStreak = 0;
      }
    }

    return { currentStreak, bestStreak };
  }

  /**
   * Detecta tendência do hábito
   */
  private detectTrend(entries: HabitEntry[]): 'improving' | 'declining' | 'stable' {
    if (entries.length < 4) return 'stable';

    // Dividir em duas metades
    const midpoint = Math.floor(entries.length / 2);
    const firstHalf = entries.slice(0, midpoint);
    const secondHalf = entries.slice(midpoint);

    const firstHalfRate = firstHalf.filter((e) => e.completed).length / firstHalf.length;
    const secondHalfRate = secondHalf.filter((e) => e.completed).length / secondHalf.length;

    const diff = secondHalfRate - firstHalfRate;

    if (diff > 0.15) return 'improving';
    if (diff < -0.15) return 'declining';
    return 'stable';
  }

  /**
   * Gera insights para um hábito específico
   */
  private generateHabitInsights(
    habitName: string,
    completionRate: number,
    streak: number,
    trend: 'improving' | 'declining' | 'stable'
  ): string[] {
    const insights: string[] = [];

    // Insight sobre taxa de conclusão
    if (completionRate >= 0.8) {
      insights.push(`Você está indo muito bem com "${habitName}"! Continue assim.`);
    } else if (completionRate >= 0.5) {
      insights.push(
        `"${habitName}" está no caminho certo. Pequenos ajustes podem melhorar ainda mais.`
      );
    } else {
      insights.push(`"${habitName}" precisa de atenção. Que tal começar com metas menores?`);
    }

    // Insight sobre streak
    if (streak >= 7) {
      insights.push(`Parabéns pela sequência de ${streak} dias! 🎉`);
    } else if (streak >= 3) {
      insights.push(`Você está em ${streak} dias consecutivos! Continue!`);
    }

    // Insight sobre tendência
    if (trend === 'improving') {
      insights.push('Sua consistência está melhorando com o tempo. Excelente progresso!');
    } else if (trend === 'declining') {
      insights.push('Parece que a consistência diminuiu. O que podemos ajustar?');
    }

    return insights;
  }

  /**
   * Calcula qualidade do sono baseado em entries
   */
  private calculateSleepQuality(entries: HabitEntry[]): number {
    const sleepEntries = entries.filter((e) => e.habitName.toLowerCase().includes('sono'));

    if (sleepEntries.length === 0) return 50; // Score neutro

    const completionRate = sleepEntries.filter((e) => e.completed).length / sleepEntries.length;
    const avgValue =
      sleepEntries
        .filter((e) => e.value !== undefined)
        .reduce((sum, e) => sum + (e.value || 0), 0) / sleepEntries.length;

    // Score baseado em completion + valor médio
    return completionRate * 50 + (avgValue || 50);
  }

  /**
   * Calcula score de humor
   */
  private calculateMoodScore(entries: HabitEntry[]): number {
    const moodValues = {
      great: 100,
      good: 75,
      okay: 50,
      bad: 25,
      terrible: 0,
    };

    const entriesWithMood = entries.filter((e) => e.mood);

    if (entriesWithMood.length === 0) return 50;

    const avgMood =
      entriesWithMood.reduce((sum, e) => sum + (moodValues[e.mood!] || 50), 0) /
      entriesWithMood.length;

    return avgMood;
  }

  /**
   * Calcula consistência geral dos hábitos
   */
  private calculateHabitConsistency(patterns: HabitPattern[]): number {
    if (patterns.length === 0) return 0;

    const avgCompletionRate =
      patterns.reduce((sum, p) => sum + p.completionRate, 0) / patterns.length;

    return avgCompletionRate * 100;
  }

  /**
   * Gera recomendações usando AI
   */
  private async generateRecommendations(
    patterns: HabitPattern[],
    overallScore: number
  ): Promise<string[]> {
    try {
      const prompt = `
Você é uma especialista em bem-estar maternal.

ANÁLISE DE HÁBITOS:
- Score geral: ${overallScore.toFixed(1)}/100
- Hábitos analisados: ${patterns.length}

PADRÕES:
${patterns
  .slice(0, 3)
  .map(
    (p) =>
      `- ${p.habitName}: ${(p.completionRate * 100).toFixed(0)}% conclusão, tendência ${p.trend}`
  )
  .join('\n')}

Forneça 3 recomendações práticas e acolhedoras para melhorar o bem-estar desta mãe.
Formato: cada recomendação em uma linha, começando com "-"
Seja específica e empática.
`;

      const response = await this.callMCP('googleai', 'generate.content', {
        prompt,
      });

      if (response.success && response.data) {
        const data = response.data as { content?: string };
        if (data.content) {
          // Extrair recomendações (linhas que começam com -)
          const lines = data.content.split('\n');
          return lines
            .filter((line: string) => line.trim().startsWith('-'))
            .map((line: string) => line.trim().substring(1).trim())
            .slice(0, 3);
        }
      }

      return this.getDefaultRecommendations(overallScore);
    } catch (error) {
      logger.error('[HabitsAnalysisAgent] Failed to generate recommendations', error);
      return this.getDefaultRecommendations(overallScore);
    }
  }

  /**
   * Recomendações padrão (fallback)
   */
  private getDefaultRecommendations(score: number): string[] {
    if (score >= 80) {
      return [
        'Continue com o ótimo trabalho! Você está cuidando muito bem de si mesma.',
        'Que tal compartilhar suas estratégias com outras mães?',
        'Mantenha o equilíbrio entre cuidar de você e do bebê.',
      ];
    } else if (score >= 60) {
      return [
        'Você está no caminho certo. Pequenos ajustes podem fazer grande diferença.',
        'Tente estabelecer uma rotina mais consistente de sono.',
        'Reserve alguns minutos por dia só para você.',
      ];
    } else {
      return [
        'Seja gentil consigo mesma. A maternidade é intensa.',
        'Comece com pequenas metas diárias e vá aumentando aos poucos.',
        'Considere pedir ajuda da sua rede de apoio.',
      ];
    }
  }

  /**
   * Detecta alertas (padrões preocupantes)
   */
  private detectAlerts(patterns: HabitPattern[], entries: HabitEntry[]): string[] {
    const alerts: string[] = [];

    // Alerta: múltiplos hábitos em declínio
    const decliningHabits = patterns.filter((p) => p.trend === 'declining');
    if (decliningHabits.length >= 2) {
      alerts.push('Notamos que vários hábitos estão em declínio. Tudo bem com você?');
    }

    // Alerta: humor consistentemente baixo
    const recentMoods = entries
      .slice(-7)
      .filter((e) => e.mood)
      .map((e) => e.mood);
    const badMoodsCount = recentMoods.filter((m) => ['bad', 'terrible'].includes(m!)).length;

    if (badMoodsCount >= 5) {
      alerts.push(
        'Seu humor tem estado baixo nos últimos dias. Considere conversar com alguém de confiança.'
      );
    }

    // Alerta: sono muito irregular
    const sleepPattern = patterns.find((p) => p.habitName.toLowerCase().includes('sono'));
    if (sleepPattern && sleepPattern.completionRate < 0.3) {
      alerts.push(
        'Seu padrão de sono está irregular. O descanso é fundamental para seu bem-estar.'
      );
    }

    return alerts;
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
