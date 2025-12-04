/**
 * Retention Service - Tracking de KPIs de Retenção
 *
 * Framework Perplexity Pro:
 * - D1 Retention: ≥35% (baseline)
 * - D3 Retention: ≥18% (onboarding funciona?)
 * - D7 Retention: ≥12% (engagement loop ok?)
 * - D30 Retention: ≥8% (produto retém?)
 * - Churn Mensal: <12%
 *
 * @version 1.0.0
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState, AppStateStatus } from 'react-native';

import { logger } from '@/utils/logger';

import { supabase } from '../supabase';

/**
 * Converte data para início do dia no timezone do usuário
 */
function getStartOfDayLocal(date: Date): Date {
  const local = new Date(date);
  local.setHours(0, 0, 0, 0);
  return local;
}

export interface RetentionMetrics {
  d1: number; // D1 Retention (%)
  d3: number; // D3 Retention (%)
  d7: number; // D7 Retention (%)
  d30: number; // D30 Retention (%)
  monthlyChurn: number; // Churn Mensal (%)
  totalUsers: number;
  activeUsers: number;
}

export interface UserSession {
  user_id: string;
  first_seen: string; // ISO date
  last_seen: string; // ISO date
  session_count: number;
  days_active: number;
}

/**
 * Estágios do funnel de conversão
 * Ordem: download → onboarding → aha_moment → engagement → retention
 */
export type FunnelStage =
  | 'app_opened' // Abriu o app pela primeira vez
  | 'onboarding_started' // Começou onboarding
  | 'onboarding_profile' // Preencheu perfil
  | 'onboarding_baby' // Adicionou info do bebê
  | 'onboarding_complete' // Completou onboarding
  | 'aha_moment_nathia' // Primeira conversa com NathIA
  | 'aha_moment_tracker' // Usou rastreador de amamentação
  | 'aha_moment_community' // Primeira interação na comunidade
  | 'first_week_active' // Ativo na primeira semana
  | 'subscription_viewed' // Viu tela de assinatura
  | 'subscription_started' // Iniciou assinatura
  | 'churned' // Abandonou (30 dias sem atividade)
  | 'reactivated'; // Reativou após churn

export interface FunnelEvent {
  user_id: string;
  stage: FunnelStage;
  timestamp: string;
  metadata?: Record<string, unknown>;
  dropoff_reason?: string; // Se abandonou, por quê?
}

export interface FunnelMetrics {
  totalUsers: number;
  stageConversions: Record<FunnelStage, { count: number; percentage: number }>;
  dropoffPoints: { stage: FunnelStage; count: number; topReasons: string[] }[];
  conversionRate: number; // % que chegou ao aha_moment
  activationRate: number; // % que completou onboarding E teve aha_moment
}

/**
 * Serviço de tracking de retenção
 */
class RetentionService {
  private readonly STORAGE_KEY = '@retention:last_calculation';
  private readonly CALCULATION_INTERVAL = 24 * 60 * 60 * 1000; // 24 horas
  private appStateSubscription: { remove: () => void } | null = null;
  private currentUserId: string | null = null;

  /**
   * Inicializa o serviço com tracking automático de AppState
   */
  initialize(userId: string): void {
    this.currentUserId = userId;

    // Track sessão inicial
    this.trackSession(userId);

    // Observar mudanças de AppState
    this.appStateSubscription = AppState.addEventListener('change', this.handleAppStateChange);

    logger.info('[RetentionService] Inicializado', { userId });
  }

  /**
   * Limpa listeners ao deslogar
   */
  cleanup(): void {
    if (this.appStateSubscription) {
      this.appStateSubscription.remove();
      this.appStateSubscription = null;
    }
    this.currentUserId = null;
    logger.info('[RetentionService] Cleanup realizado');
  }

  private handleAppStateChange = (nextAppState: AppStateStatus): void => {
    // Quando app volta para foreground, registrar sessão
    if (nextAppState === 'active' && this.currentUserId) {
      this.trackSession(this.currentUserId);
    }
  };

  /**
   * Registra uma sessão do usuário
   */
  async trackSession(userId: string): Promise<void> {
    try {
      const now = new Date().toISOString();

      // Buscar ou criar registro de sessão
      const { data: existing } = await supabase
        .from('user_sessions')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (existing) {
        // Atualizar última sessão
        await supabase
          .from('user_sessions')
          .update({
            last_seen: now,
            session_count: existing.session_count + 1,
          })
          .eq('user_id', userId);
      } else {
        // Criar nova sessão
        await supabase.from('user_sessions').insert({
          user_id: userId,
          first_seen: now,
          last_seen: now,
          session_count: 1,
          days_active: 1,
        });
      }

      logger.info('[RetentionService] Sessão registrada', { userId });
    } catch (error) {
      logger.error('[RetentionService] Erro ao registrar sessão', error, { userId });
    }
  }

  /**
   * Calcula métricas de retenção
   */
  async calculateRetentionMetrics(): Promise<RetentionMetrics> {
    try {
      // Verificar se já calculou hoje
      const lastCalculation = await AsyncStorage.getItem(this.STORAGE_KEY);
      const now = Date.now();

      if (lastCalculation) {
        const lastTime = parseInt(lastCalculation, 10);
        if (now - lastTime < this.CALCULATION_INTERVAL) {
          // Retornar métricas em cache (se existir)
          const cached = await this.getCachedMetrics();
          if (cached) return cached;
        }
      }

      // Calcular métricas
      const metrics = await this.computeMetrics();

      // Salvar cache
      await AsyncStorage.setItem(this.STORAGE_KEY, now.toString());
      await this.cacheMetrics(metrics);

      return metrics;
    } catch (error) {
      logger.error('[RetentionService] Erro ao calcular métricas', error);
      return this.getDefaultMetrics();
    }
  }

  /**
   * Calcula métricas de retenção (lógica principal)
   * Usa timezone local do device e filtra por intervalo no Supabase
   */
  private async computeMetrics(): Promise<RetentionMetrics> {
    const now = new Date();

    // Usar início do dia local (timezone do device)
    const todayStart = getStartOfDayLocal(now);
    const d1Start = getStartOfDayLocal(new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000));
    const d3Start = getStartOfDayLocal(new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000));
    const d7Start = getStartOfDayLocal(new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000));
    const d30Start = getStartOfDayLocal(new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000));

    // Buscar apenas sessões dos últimos 31 dias (filtro no Supabase, não no client)
    const { data: sessions, error } = await supabase
      .from('user_sessions')
      .select('user_id, first_seen, last_seen, session_count')
      .gte('first_seen', d30Start.toISOString());

    if (error) {
      logger.error('[RetentionService] Erro ao buscar sessões', error);
      return this.getDefaultMetrics();
    }

    if (!sessions || sessions.length === 0) {
      return this.getDefaultMetrics();
    }

    // Calcular D1 Retention (usuários que cadastraram há 1 dia e voltaram hoje)
    // Coorte: cadastrados entre d1Start e d1End (24h window)
    const d1End = new Date(d1Start.getTime() + 24 * 60 * 60 * 1000);
    const d1Cohort = sessions.filter((s) => {
      const firstSeen = new Date(s.first_seen);
      return firstSeen >= d1Start && firstSeen < d1End;
    });
    const d1Returned = d1Cohort.filter((s) => {
      const lastSeen = new Date(s.last_seen);
      return lastSeen >= todayStart;
    });
    const d1Retention = d1Cohort.length > 0 ? (d1Returned.length / d1Cohort.length) * 100 : 0;

    // Calcular D3 Retention
    const d3End = new Date(d3Start.getTime() + 24 * 60 * 60 * 1000);
    const d3Cohort = sessions.filter((s) => {
      const firstSeen = new Date(s.first_seen);
      return firstSeen >= d3Start && firstSeen < d3End;
    });
    const d3Returned = d3Cohort.filter((s) => {
      const lastSeen = new Date(s.last_seen);
      return lastSeen >= todayStart;
    });
    const d3Retention = d3Cohort.length > 0 ? (d3Returned.length / d3Cohort.length) * 100 : 0;

    // Calcular D7 Retention
    const d7End = new Date(d7Start.getTime() + 24 * 60 * 60 * 1000);
    const d7Cohort = sessions.filter((s) => {
      const firstSeen = new Date(s.first_seen);
      return firstSeen >= d7Start && firstSeen < d7End;
    });
    const d7Returned = d7Cohort.filter((s) => {
      const lastSeen = new Date(s.last_seen);
      return lastSeen >= todayStart;
    });
    const d7Retention = d7Cohort.length > 0 ? (d7Returned.length / d7Cohort.length) * 100 : 0;

    // Calcular D30 Retention
    const d30End = new Date(d30Start.getTime() + 24 * 60 * 60 * 1000);
    const d30Cohort = sessions.filter((s) => {
      const firstSeen = new Date(s.first_seen);
      return firstSeen >= d30Start && firstSeen < d30End;
    });
    const d30Returned = d30Cohort.filter((s) => {
      const lastSeen = new Date(s.last_seen);
      return lastSeen >= todayStart;
    });
    const d30Retention = d30Cohort.length > 0 ? (d30Returned.length / d30Cohort.length) * 100 : 0;

    // Calcular Churn Mensal (usuários que não voltaram nos últimos 30 dias)
    const churnedUsers = sessions.filter((s) => {
      const lastSeen = new Date(s.last_seen);
      return lastSeen < d30Start;
    });
    const monthlyChurn = sessions.length > 0 ? (churnedUsers.length / sessions.length) * 100 : 0;

    // Usuários ativos (últimos 7 dias)
    const activeUsers = sessions.filter((s) => {
      const lastSeen = new Date(s.last_seen);
      return lastSeen >= d7Start;
    }).length;

    return {
      d1: Math.round(d1Retention * 100) / 100,
      d3: Math.round(d3Retention * 100) / 100,
      d7: Math.round(d7Retention * 100) / 100,
      d30: Math.round(d30Retention * 100) / 100,
      monthlyChurn: Math.round(monthlyChurn * 100) / 100,
      totalUsers: sessions.length,
      activeUsers,
    };
  }

  /**
   * Retorna métricas padrão (fallback)
   */
  private getDefaultMetrics(): RetentionMetrics {
    return {
      d1: 0,
      d3: 0,
      d7: 0,
      d30: 0,
      monthlyChurn: 0,
      totalUsers: 0,
      activeUsers: 0,
    };
  }

  /**
   * Cache de métricas
   */
  private async cacheMetrics(metrics: RetentionMetrics): Promise<void> {
    try {
      await AsyncStorage.setItem('@retention:metrics', JSON.stringify(metrics));
    } catch (error) {
      logger.error('[RetentionService] Erro ao cachear métricas', error);
    }
  }

  /**
   * Busca métricas em cache
   */
  private async getCachedMetrics(): Promise<RetentionMetrics | null> {
    try {
      const cached = await AsyncStorage.getItem('@retention:metrics');
      if (cached) {
        return JSON.parse(cached) as RetentionMetrics;
      }
    } catch (error) {
      logger.error('[RetentionService] Erro ao buscar métricas em cache', error);
    }
    return null;
  }

  /**
   * Verifica se métricas estão dentro dos targets
   */
  checkTargets(metrics: RetentionMetrics): {
    d1: boolean;
    d3: boolean;
    d7: boolean;
    d30: boolean;
    churn: boolean;
    allOnTarget: boolean;
  } {
    const targets = {
      d1: metrics.d1 >= 35,
      d3: metrics.d3 >= 18,
      d7: metrics.d7 >= 12,
      d30: metrics.d30 >= 8,
      churn: metrics.monthlyChurn < 12,
    };

    return {
      ...targets,
      allOnTarget: Object.values(targets).every((v) => v),
    };
  }

  // ======================
  // FUNNEL ANALYTICS
  // ======================

  /**
   * Registra evento de funnel (CRÍTICO para entender abandono)
   */
  async trackFunnelEvent(
    userId: string,
    stage: FunnelStage,
    metadata?: Record<string, unknown>,
    dropoffReason?: string
  ): Promise<void> {
    try {
      const event: FunnelEvent = {
        user_id: userId,
        stage,
        timestamp: new Date().toISOString(),
        metadata,
        dropoff_reason: dropoffReason,
      };

      // Salvar no Supabase
      const { error } = await supabase.from('funnel_events').insert(event);

      if (error) {
        // Se tabela não existe, logar apenas (não quebrar app)
        logger.warn('[RetentionService] Erro ao salvar funnel event (tabela existe?)', {
          stage,
          error: error.message,
        });
        return;
      }

      logger.info('[RetentionService] Funnel event registrado', {
        userId,
        stage,
        metadata,
      });

      // Verificar se é um "aha moment" para tracking especial
      if (stage.startsWith('aha_moment_')) {
        await this.trackAhaMoment(userId, stage);
      }
    } catch (error) {
      logger.error('[RetentionService] Erro ao registrar funnel event', error);
    }
  }

  /**
   * Track "Aha Moment" - momento que usuária percebe valor
   * Crítico para retenção D3+
   */
  private async trackAhaMoment(userId: string, ahaMomentType: FunnelStage): Promise<void> {
    try {
      // Verificar se já teve aha moment antes
      const { data: existing } = await supabase
        .from('user_sessions')
        .select('metadata')
        .eq('user_id', userId)
        .single();

      const currentMetadata = (existing?.metadata as Record<string, unknown>) || {};
      const ahaMoments = (currentMetadata.aha_moments as string[]) || [];

      if (!ahaMoments.includes(ahaMomentType)) {
        ahaMoments.push(ahaMomentType);

        await supabase
          .from('user_sessions')
          .update({
            metadata: {
              ...currentMetadata,
              aha_moments: ahaMoments,
              first_aha_moment: currentMetadata.first_aha_moment || new Date().toISOString(),
            },
          })
          .eq('user_id', userId);

        logger.info('[RetentionService] Aha moment registrado!', { userId, ahaMomentType });
      }
    } catch (error) {
      logger.error('[RetentionService] Erro ao registrar aha moment', error);
    }
  }

  /**
   * Calcula métricas de funnel (onde usuárias estão abandonando)
   */
  async calculateFunnelMetrics(): Promise<FunnelMetrics | null> {
    try {
      // Buscar todos os eventos de funnel dos últimos 30 dias
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

      const { data: events, error } = await supabase
        .from('funnel_events')
        .select('*')
        .gte('timestamp', thirtyDaysAgo);

      if (error || !events) {
        logger.warn('[RetentionService] Sem dados de funnel ainda');
        return null;
      }

      // Agrupar por usuário e calcular estágio mais avançado
      const userStages = new Map<string, Set<FunnelStage>>();

      for (const event of events) {
        if (!userStages.has(event.user_id)) {
          userStages.set(event.user_id, new Set());
        }
        userStages.get(event.user_id)!.add(event.stage as FunnelStage);
      }

      const totalUsers = userStages.size;

      // Contar usuários em cada estágio
      const stageCounts: Record<FunnelStage, number> = {
        app_opened: 0,
        onboarding_started: 0,
        onboarding_profile: 0,
        onboarding_baby: 0,
        onboarding_complete: 0,
        aha_moment_nathia: 0,
        aha_moment_tracker: 0,
        aha_moment_community: 0,
        first_week_active: 0,
        subscription_viewed: 0,
        subscription_started: 0,
        churned: 0,
        reactivated: 0,
      };

      for (const stages of userStages.values()) {
        for (const stage of stages) {
          stageCounts[stage]++;
        }
      }

      // Calcular conversões
      const stageConversions: Record<FunnelStage, { count: number; percentage: number }> =
        {} as Record<FunnelStage, { count: number; percentage: number }>;

      for (const [stage, count] of Object.entries(stageCounts)) {
        stageConversions[stage as FunnelStage] = {
          count,
          percentage: totalUsers > 0 ? Math.round((count / totalUsers) * 100) : 0,
        };
      }

      // Identificar pontos de dropoff
      const funnelOrder: FunnelStage[] = [
        'app_opened',
        'onboarding_started',
        'onboarding_complete',
        'aha_moment_nathia',
        'first_week_active',
      ];

      const dropoffPoints: { stage: FunnelStage; count: number; topReasons: string[] }[] = [];

      for (let i = 0; i < funnelOrder.length - 1; i++) {
        const currentStage = funnelOrder[i];
        const nextStage = funnelOrder[i + 1];
        const dropoff = stageCounts[currentStage] - stageCounts[nextStage];

        if (dropoff > 0) {
          // Buscar razões de dropoff
          const reasonsEvents = events.filter((e) => e.stage === currentStage && e.dropoff_reason);
          const reasons = reasonsEvents.map((e) => e.dropoff_reason as string);
          const topReasons = [...new Set(reasons)].slice(0, 3);

          dropoffPoints.push({
            stage: currentStage,
            count: dropoff,
            topReasons,
          });
        }
      }

      // Taxa de conversão (chegou ao aha_moment)
      const ahaMomentUsers =
        stageCounts.aha_moment_nathia +
        stageCounts.aha_moment_tracker +
        stageCounts.aha_moment_community;
      const conversionRate = totalUsers > 0 ? Math.round((ahaMomentUsers / totalUsers) * 100) : 0;

      // Taxa de ativação (completou onboarding + aha_moment)
      const activatedUsers = [...userStages.entries()].filter(([, stages]) => {
        return (
          stages.has('onboarding_complete') &&
          (stages.has('aha_moment_nathia') ||
            stages.has('aha_moment_tracker') ||
            stages.has('aha_moment_community'))
        );
      }).length;
      const activationRate = totalUsers > 0 ? Math.round((activatedUsers / totalUsers) * 100) : 0;

      const metrics: FunnelMetrics = {
        totalUsers,
        stageConversions,
        dropoffPoints,
        conversionRate,
        activationRate,
      };

      logger.info('[RetentionService] Funnel metrics calculadas', {
        totalUsers,
        conversionRate,
        activationRate,
        topDropoff: dropoffPoints[0]?.stage,
      });

      return metrics;
    } catch (error) {
      logger.error('[RetentionService] Erro ao calcular funnel metrics', error);
      return null;
    }
  }

  /**
   * Helper: Track onboarding progress
   */
  async trackOnboardingStep(
    userId: string,
    step: 'started' | 'profile' | 'baby' | 'complete'
  ): Promise<void> {
    const stageMap: Record<string, FunnelStage> = {
      started: 'onboarding_started',
      profile: 'onboarding_profile',
      baby: 'onboarding_baby',
      complete: 'onboarding_complete',
    };

    await this.trackFunnelEvent(userId, stageMap[step]);
  }

  /**
   * Helper: Track primeiro uso de feature (aha moment)
   */
  async trackFirstUse(userId: string, feature: 'nathia' | 'tracker' | 'community'): Promise<void> {
    const stageMap: Record<string, FunnelStage> = {
      nathia: 'aha_moment_nathia',
      tracker: 'aha_moment_tracker',
      community: 'aha_moment_community',
    };

    await this.trackFunnelEvent(userId, stageMap[feature]);
  }
}

export const retentionService = new RetentionService();
