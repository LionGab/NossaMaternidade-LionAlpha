/**
 * Dashboard Service - Monitoramento de Crises em Tempo Real
 *
 * Fornece dados para:
 * 1. Crises por dia (grafico de linha)
 * 2. Tipos de crise (pie chart)
 * 3. Cliques no CVV (numero destacado + variacao)
 * 4. Fila de moderacao (barra de progresso)
 * 5. Funnel de conversao
 *
 * @version 1.0.0
 */

import { ColorTokens } from '@/theme/tokens';
import { logger } from '@/utils/logger';

import { supabase } from './supabase';

// =============================================================================
// TYPES
// =============================================================================

export interface CrisisDailyStats {
  date: string;
  totalCount: number;
  criticalCount: number;
  severeCount: number;
  moderateCount: number;
  mildCount: number;
  cvvClicks: number;
}

export interface CrisisTypeDistribution {
  crisisType: string;
  count: number;
  percentage: number;
  color: string; // Para o pie chart
}

export interface CVVClickStats {
  todayCount: number;
  yesterdayCount: number;
  variationPercent: number;
  alertThresholdExceeded: boolean;
}

export interface ModerationQueueStats {
  pendingCount: number;
  highPriorityCount: number;
  avgQueueLatencyMs: number;
  oldestPendingMinutes: number;
  progressPercent: number; // 0-100 (100 = fila vazia)
}

export interface FunnelStage {
  stage: string;
  label: string;
  count: number;
  percentage: number;
  dropoffPercent: number;
}

export interface DashboardSummary {
  crisesToday: number;
  criticalToday: number;
  crises7d: number;
  cvvClicksToday: number;
  pendingFollowups: number;
  refreshedAt: string;
}

export interface AlertConfig {
  cvvIncreaseThreshold: number; // % de aumento que dispara alerta (default: 20)
  moderationQueueMax: number; // Max items antes de alerta (default: 50)
  criticalCrisisNotify: boolean; // Notificar em crises criticas
}

// =============================================================================
// SERVICE
// =============================================================================

class DashboardService {
  private readonly DEFAULT_ALERT_CONFIG: AlertConfig = {
    cvvIncreaseThreshold: 20,
    moderationQueueMax: 50,
    criticalCrisisNotify: true,
  };

  // Cores para o pie chart de tipos de crise
  // Usando tokens do design system para consistência
  private readonly CRISIS_TYPE_COLORS: Record<string, string> = {
    anxiety: ColorTokens.warning[500], // #F59E0B
    depression: ColorTokens.accent.indigo, // #6366F1
    suicidal_ideation: ColorTokens.error[600], // #DC2626
    self_harm: ColorTokens.error[700], // #B91C1C (aproximado de #BE123C)
    panic: ColorTokens.warning[600], // #D97706 (aproximado de #F97316)
    overwhelm: ColorTokens.accent.purple, // #8B5CF6
    violence: ColorTokens.error[800], // #991B1B
    postpartum: ColorTokens.accent.pink, // #EC4899
  };

  // =========================================================================
  // METRICAS PRINCIPAIS
  // =========================================================================

  /**
   * 1. CRISES POR DIA - Grafico de linha (ultimos 30 dias)
   */
  async getCrisisDailyStats(days: number = 30): Promise<{
    data: CrisisDailyStats[];
    error: Error | null;
  }> {
    try {
      const { data, error } = await supabase.rpc('get_crisis_daily_stats', {
        p_days: days,
      });

      if (error) {
        logger.error('[Dashboard] Erro ao buscar crises diarias', { error: error.message });
        return { data: [], error: new Error(error.message) };
      }

      const stats: CrisisDailyStats[] = (data || []).map(
        (row: {
          date: string;
          total_count: number;
          critical_count: number;
          severe_count: number;
          moderate_count: number;
          mild_count: number;
          cvv_clicks: number;
        }) => ({
          date: row.date,
          totalCount: row.total_count,
          criticalCount: row.critical_count,
          severeCount: row.severe_count,
          moderateCount: row.moderate_count,
          mildCount: row.mild_count,
          cvvClicks: row.cvv_clicks,
        })
      );

      return { data: stats, error: null };
    } catch (err) {
      logger.error('[Dashboard] Erro inesperado em getCrisisDailyStats', err);
      return { data: [], error: err as Error };
    }
  }

  /**
   * 2. TIPOS DE CRISE - Pie chart
   */
  async getCrisisTypeDistribution(
    startDate?: Date,
    endDate?: Date
  ): Promise<{
    data: CrisisTypeDistribution[];
    error: Error | null;
  }> {
    try {
      const { data, error } = await supabase.rpc('get_crisis_type_distribution', {
        p_start_date:
          startDate?.toISOString() || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        p_end_date: endDate?.toISOString() || new Date().toISOString(),
      });

      if (error) {
        logger.error('[Dashboard] Erro ao buscar tipos de crise', { error: error.message });
        return { data: [], error: new Error(error.message) };
      }

      const distribution: CrisisTypeDistribution[] = (data || []).map(
        (row: { crisis_type: string; count: number; percentage: number }) => ({
          crisisType: row.crisis_type,
          count: row.count,
          percentage: row.percentage,
          color: this.CRISIS_TYPE_COLORS[row.crisis_type] || '#94A3B8', // Slate default
        })
      );

      return { data: distribution, error: null };
    } catch (err) {
      logger.error('[Dashboard] Erro inesperado em getCrisisTypeDistribution', err);
      return { data: [], error: err as Error };
    }
  }

  /**
   * 3. CLIQUES NO CVV - Numero destacado com variacao
   */
  async getCVVClickStats(): Promise<{
    data: CVVClickStats | null;
    error: Error | null;
  }> {
    try {
      const { data, error } = await supabase.rpc('get_cvv_click_stats');

      if (error) {
        logger.error('[Dashboard] Erro ao buscar cliques CVV', { error: error.message });
        return { data: null, error: new Error(error.message) };
      }

      if (!data || data.length === 0) {
        return {
          data: {
            todayCount: 0,
            yesterdayCount: 0,
            variationPercent: 0,
            alertThresholdExceeded: false,
          },
          error: null,
        };
      }

      const row = data[0];
      const stats: CVVClickStats = {
        todayCount: row.today_count,
        yesterdayCount: row.yesterday_count,
        variationPercent: row.variation_percent,
        alertThresholdExceeded: row.alert_threshold_exceeded,
      };

      // Log alerta se threshold excedido
      if (stats.alertThresholdExceeded) {
        logger.warn('[Dashboard] ALERTA: Aumento significativo de cliques no CVV', {
          today: stats.todayCount,
          yesterday: stats.yesterdayCount,
          variation: `${stats.variationPercent}%`,
        });
      }

      return { data: stats, error: null };
    } catch (err) {
      logger.error('[Dashboard] Erro inesperado em getCVVClickStats', err);
      return { data: null, error: err as Error };
    }
  }

  /**
   * 4. FILA DE MODERACAO - Numero + barra de progresso
   */
  async getModerationQueueStats(): Promise<{
    data: ModerationQueueStats | null;
    error: Error | null;
  }> {
    try {
      const { data, error } = await supabase.rpc('get_moderation_queue_stats');

      if (error) {
        logger.error('[Dashboard] Erro ao buscar fila de moderacao', { error: error.message });
        return { data: null, error: new Error(error.message) };
      }

      if (!data || data.length === 0) {
        return {
          data: {
            pendingCount: 0,
            highPriorityCount: 0,
            avgQueueLatencyMs: 0,
            oldestPendingMinutes: 0,
            progressPercent: 100,
          },
          error: null,
        };
      }

      const row = data[0];
      const pendingCount = row.pending_count || 0;
      const maxQueue = this.DEFAULT_ALERT_CONFIG.moderationQueueMax;

      const stats: ModerationQueueStats = {
        pendingCount,
        highPriorityCount: row.high_priority_count || 0,
        avgQueueLatencyMs: row.avg_queue_latency_ms || 0,
        oldestPendingMinutes: row.oldest_pending_minutes || 0,
        progressPercent: Math.max(0, Math.min(100, ((maxQueue - pendingCount) / maxQueue) * 100)),
      };

      // Log alerta se fila muito grande
      if (pendingCount > maxQueue) {
        logger.warn('[Dashboard] ALERTA: Fila de moderacao excedeu limite', {
          pending: pendingCount,
          max: maxQueue,
          oldestMinutes: stats.oldestPendingMinutes,
        });
      }

      return { data: stats, error: null };
    } catch (err) {
      logger.error('[Dashboard] Erro inesperado em getModerationQueueStats', err);
      return { data: null, error: err as Error };
    }
  }

  /**
   * 5. FUNNEL DE CONVERSAO
   */
  async getFunnelStats(
    startDate?: Date,
    endDate?: Date
  ): Promise<{
    data: FunnelStage[];
    error: Error | null;
  }> {
    try {
      const { data, error } = await supabase.rpc('calculate_funnel_metrics', {
        p_start_date:
          startDate?.toISOString() || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        p_end_date: endDate?.toISOString() || new Date().toISOString(),
      });

      if (error) {
        logger.error('[Dashboard] Erro ao buscar funnel', { error: error.message });
        return { data: [], error: new Error(error.message) };
      }

      // Mapear labels amigaveis
      const stageLabels: Record<string, string> = {
        app_opened: 'App Aberto',
        onboarding_started: 'Onboarding Iniciado',
        onboarding_profile: 'Perfil Criado',
        onboarding_baby: 'Bebe Cadastrado',
        onboarding_complete: 'Onboarding Completo',
        aha_moment_nathia: 'Usou NathIA',
        aha_moment_tracker: 'Usou Tracker',
        aha_moment_community: 'Usou Comunidade',
        first_week_active: '1a Semana Ativa',
        subscription_viewed: 'Viu Assinatura',
        subscription_started: 'Assinou',
      };

      const stages: FunnelStage[] = (data || []).map(
        (
          row: { stage: string; total_users: number; conversion_rate: number },
          index: number,
          arr: { stage: string; total_users: number; conversion_rate: number }[]
        ) => {
          const prevCount = index > 0 ? arr[index - 1].total_users : row.total_users;
          const dropoff = prevCount > 0 ? ((prevCount - row.total_users) / prevCount) * 100 : 0;

          return {
            stage: row.stage,
            label: stageLabels[row.stage] || row.stage,
            count: row.total_users,
            percentage: row.conversion_rate,
            dropoffPercent: Math.round(dropoff * 10) / 10,
          };
        }
      );

      return { data: stages, error: null };
    } catch (err) {
      logger.error('[Dashboard] Erro inesperado em getFunnelStats', err);
      return { data: [], error: err as Error };
    }
  }

  // =========================================================================
  // RESUMO DO DASHBOARD (cached view)
  // =========================================================================

  /**
   * Busca resumo do dashboard (view materializada - mais rapido)
   */
  async getDashboardSummary(): Promise<{
    data: DashboardSummary | null;
    error: Error | null;
  }> {
    try {
      const { data, error } = await supabase
        .from('mv_dashboard_crisis_summary')
        .select('*')
        .single();

      if (error) {
        // Se view nao existe, calcular on-the-fly
        if (error.code === 'PGRST116' || error.message.includes('does not exist')) {
          return this.calculateDashboardSummary();
        }
        logger.error('[Dashboard] Erro ao buscar resumo', { error: error.message });
        return { data: null, error: new Error(error.message) };
      }

      const summary: DashboardSummary = {
        crisesToday: data.crises_today || 0,
        criticalToday: data.critical_today || 0,
        crises7d: data.crises_7d || 0,
        cvvClicksToday: data.cvv_clicks_today || 0,
        pendingFollowups: data.pending_followups || 0,
        refreshedAt: data.refreshed_at,
      };

      return { data: summary, error: null };
    } catch (err) {
      logger.error('[Dashboard] Erro inesperado em getDashboardSummary', err);
      return { data: null, error: err as Error };
    }
  }

  /**
   * Calcula resumo on-the-fly (fallback se view nao existe)
   */
  private async calculateDashboardSummary(): Promise<{
    data: DashboardSummary | null;
    error: Error | null;
  }> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayISO = today.toISOString();

      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const sevenDaysAgoISO = sevenDaysAgo.toISOString();

      // Buscar crises de hoje
      const { count: crisesToday } = await supabase
        .from('crisis_interventions')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', todayISO);

      // Buscar crises criticas de hoje
      const { count: criticalToday } = await supabase
        .from('crisis_interventions')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', todayISO)
        .in('level', ['critical', 'severe']);

      // Buscar crises dos ultimos 7 dias
      const { count: crises7d } = await supabase
        .from('crisis_interventions')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', sevenDaysAgoISO);

      // Buscar cliques CVV hoje
      const { count: cvvClicksToday } = await supabase
        .from('crisis_interventions')
        .select('*', { count: 'exact', head: true })
        .eq('intervention_type', 'cvv_click')
        .gte('created_at', todayISO);

      // Buscar follow-ups pendentes
      const { count: pendingFollowups } = await supabase
        .from('crisis_interventions')
        .select('*', { count: 'exact', head: true })
        .eq('follow_up_needed', true)
        .eq('follow_up_completed', false);

      const summary: DashboardSummary = {
        crisesToday: crisesToday || 0,
        criticalToday: criticalToday || 0,
        crises7d: crises7d || 0,
        cvvClicksToday: cvvClicksToday || 0,
        pendingFollowups: pendingFollowups || 0,
        refreshedAt: new Date().toISOString(),
      };

      return { data: summary, error: null };
    } catch (err) {
      logger.error('[Dashboard] Erro ao calcular resumo on-the-fly', err);
      return { data: null, error: err as Error };
    }
  }

  // =========================================================================
  // REALTIME SUBSCRIPTIONS
  // =========================================================================

  /**
   * Subscribe para atualizacoes em tempo real de crises
   * @param callback Funcao chamada quando ha nova crise
   * @returns Unsubscribe function
   */
  subscribeToCrisisUpdates(
    callback: (payload: { level: string; types: string[] }) => void
  ): () => void {
    const channel = supabase
      .channel('crisis-updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'crisis_interventions',
        },
        (payload) => {
          const newCrisis = payload.new as { level: string; types: string[] };
          callback(newCrisis);

          // Log se for crise critica
          if (newCrisis.level === 'critical' || newCrisis.level === 'severe') {
            logger.warn('[Dashboard] Nova crise detectada em tempo real', {
              level: newCrisis.level,
              types: newCrisis.types,
            });
          }
        }
      )
      .subscribe();

    // Retornar funcao de unsubscribe
    return () => {
      supabase.removeChannel(channel);
    };
  }

  /**
   * Subscribe para atualizacoes da fila de moderacao
   */
  subscribeToModerationQueue(callback: (pendingCount: number) => void): () => void {
    const channel = supabase
      .channel('moderation-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'moderation_queue',
        },
        async () => {
          // Buscar contagem atualizada
          const { data } = await this.getModerationQueueStats();
          if (data) {
            callback(data.pendingCount);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }

  // =========================================================================
  // ALERTAS
  // =========================================================================

  /**
   * Verifica todos os alertas e retorna os ativos
   */
  async checkAlerts(config: Partial<AlertConfig> = {}): Promise<{
    alerts: Array<{
      type: 'cvv_increase' | 'moderation_queue' | 'critical_crisis';
      severity: 'warning' | 'critical';
      message: string;
      value: number;
      threshold: number;
    }>;
    error: Error | null;
  }> {
    const finalConfig = { ...this.DEFAULT_ALERT_CONFIG, ...config };
    const alerts: Array<{
      type: 'cvv_increase' | 'moderation_queue' | 'critical_crisis';
      severity: 'warning' | 'critical';
      message: string;
      value: number;
      threshold: number;
    }> = [];

    try {
      // 1. Verificar aumento de CVV
      const { data: cvvStats } = await this.getCVVClickStats();
      if (cvvStats && cvvStats.variationPercent > finalConfig.cvvIncreaseThreshold) {
        alerts.push({
          type: 'cvv_increase',
          severity: cvvStats.variationPercent > 50 ? 'critical' : 'warning',
          message: `Aumento de ${cvvStats.variationPercent}% nos cliques do CVV`,
          value: cvvStats.variationPercent,
          threshold: finalConfig.cvvIncreaseThreshold,
        });
      }

      // 2. Verificar fila de moderacao
      const { data: queueStats } = await this.getModerationQueueStats();
      if (queueStats && queueStats.pendingCount > finalConfig.moderationQueueMax) {
        alerts.push({
          type: 'moderation_queue',
          severity:
            queueStats.pendingCount > finalConfig.moderationQueueMax * 2 ? 'critical' : 'warning',
          message: `Fila de moderacao com ${queueStats.pendingCount} items pendentes`,
          value: queueStats.pendingCount,
          threshold: finalConfig.moderationQueueMax,
        });
      }

      // 3. Verificar crises criticas recentes (ultima hora)
      if (finalConfig.criticalCrisisNotify) {
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
        const { count } = await supabase
          .from('crisis_interventions')
          .select('*', { count: 'exact', head: true })
          .eq('level', 'critical')
          .gte('created_at', oneHourAgo);

        if ((count || 0) > 0) {
          alerts.push({
            type: 'critical_crisis',
            severity: 'critical',
            message: `${count} crise(s) critica(s) na ultima hora`,
            value: count || 0,
            threshold: 0,
          });
        }
      }

      return { alerts, error: null };
    } catch (err) {
      logger.error('[Dashboard] Erro ao verificar alertas', err);
      return { alerts: [], error: err as Error };
    }
  }

  // =========================================================================
  // REFRESH CACHE
  // =========================================================================

  /**
   * Forca refresh da view materializada
   */
  async refreshDashboardCache(): Promise<{ success: boolean; error: Error | null }> {
    try {
      const { error } = await supabase.rpc('refresh_dashboard_cache');

      if (error) {
        logger.error('[Dashboard] Erro ao refresh cache', { error: error.message });
        return { success: false, error: new Error(error.message) };
      }

      logger.info('[Dashboard] Cache atualizado com sucesso');
      return { success: true, error: null };
    } catch (err) {
      logger.error('[Dashboard] Erro inesperado em refreshDashboardCache', err);
      return { success: false, error: err as Error };
    }
  }
}

export const dashboardService = new DashboardService();
