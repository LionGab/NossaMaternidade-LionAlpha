/**
 * Breastfeeding Insights Service
 *
 * Transforma dados de amamentação em INSIGHTS ACIONÁVEIS.
 * Sem isso, o rastreador é só um formulário sem valor.
 *
 * @version 1.0.0
 */

import { logger } from '@/utils/logger';

export interface FeedingSession {
  id: string;
  timestamp: string;
  side: 'left' | 'right' | 'both';
  duration: number; // minutos
  notes?: string;
}

export type BabyAgeGroup = 'newborn' | '1-3m' | '3-6m' | '6-12m' | '12m+';

export interface FeedingExpectation {
  minSessions: number;
  maxSessions: number;
  label: string;
  avgDurationMin: number;
  maxIntervalHours: number;
}

/**
 * Expectativas por faixa etária do bebê (baseado em guidelines AAP/OMS)
 */
export const FEEDING_EXPECTATIONS: Record<BabyAgeGroup, FeedingExpectation> = {
  newborn: {
    minSessions: 8,
    maxSessions: 12,
    label: '8-12x por dia',
    avgDurationMin: 20,
    maxIntervalHours: 3, // RN não deve ficar mais de 3h sem mamar
  },
  '1-3m': {
    minSessions: 8,
    maxSessions: 12,
    label: '8-12x por dia',
    avgDurationMin: 15,
    maxIntervalHours: 4,
  },
  '3-6m': {
    minSessions: 6,
    maxSessions: 10,
    label: '6-10x por dia',
    avgDurationMin: 10,
    maxIntervalHours: 5,
  },
  '6-12m': {
    minSessions: 4,
    maxSessions: 8,
    label: '4-8x por dia',
    avgDurationMin: 10,
    maxIntervalHours: 6,
  },
  '12m+': {
    minSessions: 2,
    maxSessions: 6,
    label: '2-6x por dia',
    avgDurationMin: 10,
    maxIntervalHours: 8,
  },
};

export type InsightStatus = 'success' | 'warning' | 'info' | 'neutral';

export interface BreastfeedingInsight {
  status: InsightStatus;
  emoji: string;
  title: string;
  message: string;
  recommendation?: string;
  actionLabel?: string;
  actionType?: 'call_pediatra' | 'offer_breast' | 'rest' | 'continue';
}

export interface DailyInsights {
  summary: BreastfeedingInsight;
  frequency: BreastfeedingInsight;
  duration: BreastfeedingInsight;
  pattern: BreastfeedingInsight;
  nextSession: {
    suggestedIn: string; // "em 1h30"
    lastSessionAgo: string; // "há 47 min"
    isOverdue: boolean;
  };
}

/**
 * Serviço de insights de amamentação
 */
class BreastfeedingInsightsService {
  /**
   * Calcula idade do bebê em meses a partir da data de nascimento
   */
  getBabyAgeGroup(birthDate: Date): BabyAgeGroup {
    const now = new Date();
    const ageMonths =
      (now.getFullYear() - birthDate.getFullYear()) * 12 + (now.getMonth() - birthDate.getMonth());

    if (ageMonths < 1) return 'newborn';
    if (ageMonths < 3) return '1-3m';
    if (ageMonths < 6) return '3-6m';
    if (ageMonths < 12) return '6-12m';
    return '12m+';
  }

  /**
   * Gera insights completos para o dia
   */
  generateDailyInsights(
    sessions: FeedingSession[],
    babyAgeGroup: BabyAgeGroup = '1-3m'
  ): DailyInsights {
    const expectations = FEEDING_EXPECTATIONS[babyAgeGroup];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Filtrar sessões de hoje
    const todaySessions = sessions.filter((s) => {
      const sessionDate = new Date(s.timestamp);
      sessionDate.setHours(0, 0, 0, 0);
      return sessionDate.getTime() === today.getTime();
    });

    const sessionCount = todaySessions.length;
    const totalDuration = todaySessions.reduce((sum, s) => sum + s.duration, 0);
    const avgDuration = sessionCount > 0 ? Math.round(totalDuration / sessionCount) : 0;

    // Calcular tempo desde última sessão
    const lastSession = sessions[0]; // Assumindo ordenação decrescente
    const lastSessionTime = lastSession ? new Date(lastSession.timestamp) : null;
    const hoursSinceLastSession = lastSessionTime
      ? (Date.now() - lastSessionTime.getTime()) / (1000 * 60 * 60)
      : 24;

    // Gerar insights individuais
    const summaryInsight = this.generateSummaryInsight(sessionCount, totalDuration, expectations);
    const frequencyInsight = this.generateFrequencyInsight(sessionCount, expectations);
    const durationInsight = this.generateDurationInsight(avgDuration, expectations);
    const patternInsight = this.generatePatternInsight(todaySessions, expectations);

    // Próxima sessão sugerida
    const suggestedIntervalHours = expectations.maxIntervalHours;
    const hoursUntilNext = Math.max(0, suggestedIntervalHours - hoursSinceLastSession);
    const isOverdue = hoursSinceLastSession > expectations.maxIntervalHours;

    const nextSession = {
      suggestedIn: this.formatTimeRemaining(hoursUntilNext),
      lastSessionAgo: this.formatTimeAgo(hoursSinceLastSession),
      isOverdue,
    };

    logger.info('[BreastfeedingInsights] Insights gerados', {
      sessionCount,
      totalDuration,
      avgDuration,
      hoursSinceLastSession: Math.round(hoursSinceLastSession * 10) / 10,
      babyAgeGroup,
    });

    return {
      summary: summaryInsight,
      frequency: frequencyInsight,
      duration: durationInsight,
      pattern: patternInsight,
      nextSession,
    };
  }

  /**
   * Insight de resumo do dia
   */
  private generateSummaryInsight(
    count: number,
    totalMinutes: number,
    expectations: FeedingExpectation
  ): BreastfeedingInsight {
    const isOnTrack = count >= expectations.minSessions;
    const isExceeding = count > expectations.maxSessions;

    if (isOnTrack && !isExceeding) {
      return {
        status: 'success',
        emoji: '✅',
        title: 'Dia excelente!',
        message: `${count} sessões, ${totalMinutes} min no total. Você está no caminho certo!`,
        recommendation: 'Continue assim 💚',
      };
    }

    if (isExceeding) {
      return {
        status: 'info',
        emoji: '📊',
        title: 'Muitas sessões hoje',
        message: `${count} sessões é mais que o esperado (${expectations.label}). O bebê pode estar em fase de crescimento.`,
        recommendation:
          'Fases de crescimento são normais. Se persistir por 3+ dias, consulte o pediatra.',
      };
    }

    // Abaixo do esperado
    const deficit = expectations.minSessions - count;
    return {
      status: 'warning',
      emoji: '⚠️',
      title: 'Atenção às mamadas',
      message: `${count} sessões hoje. O ideal para esta fase é ${expectations.label}.`,
      recommendation: `Tente oferecer o peito mais ${deficit} vez${deficit > 1 ? 'es' : ''} hoje.`,
      actionLabel: 'Oferecer agora',
      actionType: 'offer_breast',
    };
  }

  /**
   * Insight de frequência
   */
  private generateFrequencyInsight(
    count: number,
    expectations: FeedingExpectation
  ): BreastfeedingInsight {
    const percentOfMin = Math.round((count / expectations.minSessions) * 100);

    if (percentOfMin >= 100) {
      return {
        status: 'success',
        emoji: '🎯',
        title: 'Frequência ideal',
        message: `${count}x hoje - dentro do esperado (${expectations.label})`,
      };
    }

    if (percentOfMin >= 75) {
      return {
        status: 'info',
        emoji: '📈',
        title: 'Quase lá!',
        message: `${count}x hoje - ${100 - percentOfMin}% abaixo do ideal`,
      };
    }

    return {
      status: 'warning',
      emoji: '📉',
      title: 'Frequência baixa',
      message: `${count}x hoje - o bebê precisa mamar mais`,
      recommendation: 'Bebês nesta fase precisam mamar frequentemente para ganhar peso.',
      actionLabel: 'Ligar para pediatra',
      actionType: 'call_pediatra',
    };
  }

  /**
   * Insight de duração média
   */
  private generateDurationInsight(
    avgMinutes: number,
    expectations: FeedingExpectation
  ): BreastfeedingInsight {
    if (avgMinutes === 0) {
      return {
        status: 'neutral',
        emoji: '📋',
        title: 'Sem dados de duração',
        message: 'Registre a duração das mamadas para receber insights.',
      };
    }

    if (avgMinutes >= expectations.avgDurationMin) {
      return {
        status: 'success',
        emoji: '⏱️',
        title: 'Duração adequada',
        message: `Média de ${avgMinutes} min por sessão - ótimo!`,
      };
    }

    if (avgMinutes >= expectations.avgDurationMin * 0.5) {
      return {
        status: 'info',
        emoji: '⏱️',
        title: 'Mamadas curtas',
        message: `Média de ${avgMinutes} min. O ideal é ~${expectations.avgDurationMin} min.`,
        recommendation: 'Mamadas curtas podem indicar que o bebê não está esvaziando o peito.',
      };
    }

    return {
      status: 'warning',
      emoji: '⏱️',
      title: 'Mamadas muito curtas',
      message: `Média de apenas ${avgMinutes} min por sessão.`,
      recommendation:
        'Tente manter o bebê acordado durante a mamada. Converse com o pediatra se persistir.',
      actionLabel: 'Ver dicas',
      actionType: 'offer_breast',
    };
  }

  /**
   * Insight de padrão (distribuição ao longo do dia)
   */
  private generatePatternInsight(
    todaySessions: FeedingSession[],
    expectations: FeedingExpectation
  ): BreastfeedingInsight {
    if (todaySessions.length < 2) {
      return {
        status: 'neutral',
        emoji: '📊',
        title: 'Padrão em formação',
        message: 'Continue registrando para identificar padrões.',
      };
    }

    // Calcular intervalos entre sessões
    const intervals: number[] = [];
    for (let i = 1; i < todaySessions.length; i++) {
      const current = new Date(todaySessions[i].timestamp).getTime();
      const previous = new Date(todaySessions[i - 1].timestamp).getTime();
      intervals.push((previous - current) / (1000 * 60 * 60)); // horas
    }

    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const maxInterval = Math.max(...intervals);

    if (
      avgInterval <= expectations.maxIntervalHours &&
      maxInterval <= expectations.maxIntervalHours * 1.5
    ) {
      return {
        status: 'success',
        emoji: '📊',
        title: 'Padrão regular',
        message: `Intervalos de ~${Math.round(avgInterval * 10) / 10}h entre mamadas. Excelente ritmo!`,
      };
    }

    if (maxInterval > expectations.maxIntervalHours * 1.5) {
      return {
        status: 'warning',
        emoji: '⏰',
        title: 'Intervalo longo detectado',
        message: `Houve um intervalo de ${Math.round(maxInterval * 10) / 10}h entre mamadas.`,
        recommendation: `Para bebês desta fase, evite intervalos maiores que ${expectations.maxIntervalHours}h.`,
      };
    }

    return {
      status: 'info',
      emoji: '📊',
      title: 'Padrão variável',
      message: 'Os intervalos entre mamadas estão variando. Isso é normal em algumas fases.',
    };
  }

  /**
   * Formata tempo restante (ex: "em 1h30")
   */
  private formatTimeRemaining(hours: number): string {
    if (hours <= 0) return 'agora';
    if (hours < 1) return `em ${Math.round(hours * 60)} min`;

    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);

    if (m === 0) return `em ${h}h`;
    return `em ${h}h${m.toString().padStart(2, '0')}`;
  }

  /**
   * Formata tempo atrás (ex: "há 47 min")
   */
  private formatTimeAgo(hours: number): string {
    if (hours < 1 / 60) return 'agora mesmo';
    if (hours < 1) return `há ${Math.round(hours * 60)} min`;

    const h = Math.floor(hours);
    if (h < 24) return `há ${h}h`;

    const days = Math.floor(h / 24);
    return `há ${days} dia${days > 1 ? 's' : ''}`;
  }
}

export const breastfeedingInsightsService = new BreastfeedingInsightsService();
