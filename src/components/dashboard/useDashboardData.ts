/**
 * useDashboardData - Hook para dados do dashboard de crises
 *
 * Gerencia:
 * - Fetch inicial de todas as metricas
 * - Polling automatico (configuravel)
 * - Subscriptions realtime
 * - Estado de loading/error
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';

import {
  dashboardService,
  CrisisDailyStats,
  CrisisTypeDistribution,
  CVVClickStats,
  ModerationQueueStats,
  FunnelStage,
  DashboardSummary,
} from '@/services/dashboardService';
import { logger } from '@/utils/logger';

interface Alert {
  type: 'cvv_increase' | 'moderation_queue' | 'critical_crisis';
  severity: 'warning' | 'critical';
  message: string;
  value: number;
  threshold: number;
}

interface DashboardData {
  // Dados
  summary: DashboardSummary | null;
  dailyStats: CrisisDailyStats[];
  typeDistribution: CrisisTypeDistribution[];
  cvvStats: CVVClickStats | null;
  moderationStats: ModerationQueueStats | null;
  funnelStats: FunnelStage[];
  alerts: Alert[];

  // Estado
  isLoading: boolean;
  isRefreshing: boolean;
  error: Error | null;
  lastUpdated: Date | null;

  // Acoes
  refresh: () => Promise<void>;
  refreshSection: (
    section: 'daily' | 'types' | 'cvv' | 'moderation' | 'funnel' | 'alerts'
  ) => Promise<void>;
}

interface UseDashboardDataOptions {
  /** Intervalo de polling em ms (default: 60000 = 1 min) */
  pollingInterval?: number;
  /** Habilitar subscriptions realtime (default: true) */
  enableRealtime?: boolean;
  /** Atualizar quando app volta ao foreground (default: true) */
  refreshOnForeground?: boolean;
  /** Dias para o grafico diario (default: 30) */
  dailyStatsDays?: number;
}

export function useDashboardData(options: UseDashboardDataOptions = {}): DashboardData {
  const {
    pollingInterval = 60000,
    enableRealtime = true,
    refreshOnForeground = true,
    dailyStatsDays = 30,
  } = options;

  // Estado
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [dailyStats, setDailyStats] = useState<CrisisDailyStats[]>([]);
  const [typeDistribution, setTypeDistribution] = useState<CrisisTypeDistribution[]>([]);
  const [cvvStats, setCvvStats] = useState<CVVClickStats | null>(null);
  const [moderationStats, setModerationStats] = useState<ModerationQueueStats | null>(null);
  const [funnelStats, setFunnelStats] = useState<FunnelStage[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Refs para cleanup
  const unsubscribeCrisisRef = useRef<(() => void) | null>(null);
  const unsubscribeModerationRef = useRef<(() => void) | null>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // =========================================================================
  // FETCH FUNCTIONS
  // =========================================================================

  const fetchAll = useCallback(async () => {
    try {
      const [
        summaryResult,
        dailyResult,
        typesResult,
        cvvResult,
        moderationResult,
        funnelResult,
        alertsResult,
      ] = await Promise.all([
        dashboardService.getDashboardSummary(),
        dashboardService.getCrisisDailyStats(dailyStatsDays),
        dashboardService.getCrisisTypeDistribution(),
        dashboardService.getCVVClickStats(),
        dashboardService.getModerationQueueStats(),
        dashboardService.getFunnelStats(),
        dashboardService.checkAlerts(),
      ]);

      // Atualizar estados
      if (summaryResult.data) setSummary(summaryResult.data);
      if (dailyResult.data) setDailyStats(dailyResult.data);
      if (typesResult.data) setTypeDistribution(typesResult.data);
      if (cvvResult.data) setCvvStats(cvvResult.data);
      if (moderationResult.data) setModerationStats(moderationResult.data);
      if (funnelResult.data) setFunnelStats(funnelResult.data);
      if (alertsResult.alerts) setAlerts(alertsResult.alerts);

      // Verificar erros
      const errors = [
        summaryResult.error,
        dailyResult.error,
        typesResult.error,
        cvvResult.error,
        moderationResult.error,
        funnelResult.error,
        alertsResult.error,
      ].filter(Boolean);

      if (errors.length > 0) {
        setError(errors[0] || null);
        logger.warn('[useDashboardData] Alguns dados falharam ao carregar', {
          errorCount: errors.length,
        });
      } else {
        setError(null);
      }

      setLastUpdated(new Date());
    } catch (err) {
      logger.error('[useDashboardData] Erro ao buscar dados', err);
      setError(err as Error);
    }
  }, [dailyStatsDays]);

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    await fetchAll();
    setIsRefreshing(false);
  }, [fetchAll]);

  const refreshSection = useCallback(
    async (section: 'daily' | 'types' | 'cvv' | 'moderation' | 'funnel' | 'alerts') => {
      try {
        switch (section) {
          case 'daily': {
            const result = await dashboardService.getCrisisDailyStats(dailyStatsDays);
            if (result.data) setDailyStats(result.data);
            break;
          }
          case 'types': {
            const result = await dashboardService.getCrisisTypeDistribution();
            if (result.data) setTypeDistribution(result.data);
            break;
          }
          case 'cvv': {
            const result = await dashboardService.getCVVClickStats();
            if (result.data) setCvvStats(result.data);
            break;
          }
          case 'moderation': {
            const result = await dashboardService.getModerationQueueStats();
            if (result.data) setModerationStats(result.data);
            break;
          }
          case 'funnel': {
            const result = await dashboardService.getFunnelStats();
            if (result.data) setFunnelStats(result.data);
            break;
          }
          case 'alerts': {
            const result = await dashboardService.checkAlerts();
            if (result.alerts) setAlerts(result.alerts);
            break;
          }
        }
      } catch (err) {
        logger.error(`[useDashboardData] Erro ao atualizar ${section}`, err);
      }
    },
    [dailyStatsDays]
  );

  // =========================================================================
  // EFFECTS
  // =========================================================================

  // Initial fetch
  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      await fetchAll();
      setIsLoading(false);
    };
    init();
  }, [fetchAll]);

  // Polling
  useEffect(() => {
    if (pollingInterval > 0) {
      pollingRef.current = setInterval(refresh, pollingInterval);
    }

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, [pollingInterval, refresh]);

  // Realtime subscriptions
  useEffect(() => {
    if (!enableRealtime) return;

    // Subscribe para novas crises
    unsubscribeCrisisRef.current = dashboardService.subscribeToCrisisUpdates((payload) => {
      logger.info('[useDashboardData] Nova crise detectada', { level: payload.level });

      // Atualizar summary e alerts
      refreshSection('alerts');

      // Se for crise critica, atualizar tudo
      if (payload.level === 'critical' || payload.level === 'severe') {
        refresh();
      }
    });

    // Subscribe para fila de moderacao
    unsubscribeModerationRef.current = dashboardService.subscribeToModerationQueue(
      (pendingCount) => {
        setModerationStats((prev) =>
          prev
            ? {
                ...prev,
                pendingCount,
                progressPercent: Math.max(0, Math.min(100, ((50 - pendingCount) / 50) * 100)),
              }
            : null
        );
      }
    );

    return () => {
      if (unsubscribeCrisisRef.current) {
        unsubscribeCrisisRef.current();
      }
      if (unsubscribeModerationRef.current) {
        unsubscribeModerationRef.current();
      }
    };
  }, [enableRealtime, refresh, refreshSection]);

  // Refresh on foreground
  useEffect(() => {
    if (!refreshOnForeground) return;

    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        refresh();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, [refreshOnForeground, refresh]);

  return {
    summary,
    dailyStats,
    typeDistribution,
    cvvStats,
    moderationStats,
    funnelStats,
    alerts,
    isLoading,
    isRefreshing,
    error,
    lastUpdated,
    refresh,
    refreshSection,
  };
}
