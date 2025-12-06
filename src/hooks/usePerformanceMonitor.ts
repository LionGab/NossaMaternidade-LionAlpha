/**
 * usePerformanceMonitor - Hook para monitorar performance de telas
 *
 * Features:
 * - Mede Time to Interactive (TTI)
 * - Conta re-renders
 * - Calcula tempo médio de render
 * - Logs para debugging
 *
 * @example
 * ```tsx
 * const { measureRender } = usePerformanceMonitor('FeedScreen');
 *
 * useEffect(() => {
 *   measureRender(() => {
 *     // código que quer medir
 *   });
 * }, []);
 * ```
 */

import { useEffect, useRef } from 'react';
import { InteractionManager } from 'react-native';

import { logger } from '@/utils/logger';

interface PerformanceMetrics {
  screenName: string;
  timeToInteractive: number | null;
  renderCount: number;
  avgRenderTime: number;
  totalRenderTime: number;
}

interface UsePerformanceMonitorOptions {
  /** Log métricas automaticamente quando componente desmonta */
  autoLog?: boolean;
  /** Enviar métricas para analytics (opcional) */
  sendToAnalytics?: (metrics: PerformanceMetrics) => void;
}

/**
 * Hook para monitorar performance de telas
 */
export const usePerformanceMonitor = (
  screenName: string,
  options: UsePerformanceMonitorOptions = {}
) => {
  const { autoLog = true, sendToAnalytics } = options;

  const startTime = useRef<number>(Date.now());
  const renderCount = useRef<number>(0);
  const renderTimes = useRef<number[]>([]);
  const ttiMeasured = useRef<boolean>(false);

  // Medir Time to Interactive (TTI)
  useEffect(() => {
    InteractionManager.runAfterInteractions(() => {
      if (!ttiMeasured.current) {
        const tti = Date.now() - startTime.current;
        ttiMeasured.current = true;

        logger.info(`[Performance] ${screenName} - TTI: ${tti}ms`);

        // Enviar para analytics se fornecido
        if (sendToAnalytics) {
          sendToAnalytics({
            screenName,
            timeToInteractive: tti,
            renderCount: renderCount.current,
            avgRenderTime:
              renderTimes.current.length > 0
                ? renderTimes.current.reduce((a, b) => a + b, 0) / renderTimes.current.length
                : 0,
            totalRenderTime: renderTimes.current.reduce((a, b) => a + b, 0),
          });
        }
      }
    });
  }, [screenName, sendToAnalytics]);

  // Log métricas quando componente desmonta
  useEffect(() => {
    // Capturar valores dos refs para uso no cleanup
    const renderTimesSnapshot = renderTimes.current;
    const renderCountSnapshot = renderCount.current;

    return () => {
      if (autoLog) {
        const avgRenderTime =
          renderTimesSnapshot.length > 0
            ? renderTimesSnapshot.reduce((a, b) => a + b, 0) / renderTimesSnapshot.length
            : 0;

        const totalRenderTime = renderTimesSnapshot.reduce((a, b) => a + b, 0);

        logger.info(
          `[Performance] ${screenName} - Renders: ${renderCountSnapshot}, ` +
            `Avg: ${avgRenderTime.toFixed(2)}ms, Total: ${totalRenderTime.toFixed(2)}ms`
        );
      }
    };
  }, [screenName, autoLog]);

  /**
   * Mede o tempo de execução de uma função
   */
  const measureRender = <T>(fn: () => T): T => {
    const renderStart = performance.now();
    const result = fn();
    const renderTime = performance.now() - renderStart;

    renderCount.current++;
    renderTimes.current.push(renderTime);

    // Log se render demorar muito (>16ms = abaixo de 60fps)
    if (renderTime > 16) {
      logger.warn(
        `[Performance] ${screenName} - Slow render: ${renderTime.toFixed(2)}ms ` +
          `(target: <16ms for 60fps)`
      );
    }

    return result;
  };

  /**
   * Mede o tempo de execução de uma função assíncrona
   */
  const measureAsync = async <T>(fn: () => Promise<T>): Promise<T> => {
    const start = performance.now();
    try {
      const result = await fn();
      const duration = performance.now() - start;
      logger.info(`[Performance] ${screenName} - Async operation: ${duration.toFixed(2)}ms`);
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      logger.error(
        `[Performance] ${screenName} - Async operation failed after ${duration.toFixed(2)}ms`,
        error
      );
      throw error;
    }
  };

  /**
   * Retorna métricas atuais
   */
  const getMetrics = (): PerformanceMetrics => {
    const avgRenderTime =
      renderTimes.current.length > 0
        ? renderTimes.current.reduce((a, b) => a + b, 0) / renderTimes.current.length
        : 0;

    return {
      screenName,
      timeToInteractive: ttiMeasured.current ? Date.now() - startTime.current : null,
      renderCount: renderCount.current,
      avgRenderTime,
      totalRenderTime: renderTimes.current.reduce((a, b) => a + b, 0),
    };
  };

  return {
    measureRender,
    measureAsync,
    getMetrics,
    renderCount: renderCount.current,
  };
};
