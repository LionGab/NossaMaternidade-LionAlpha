/**
 * useLoadingWithTimeout - Hook para gerenciar loading com timeout
 * Útil para evitar loading infinito em telas
 */

import { useState, useEffect, useCallback, useRef } from 'react';

import { logger } from '@/utils/logger';

export interface UseLoadingWithTimeoutOptions {
  /** Timeout em milissegundos (padrão: 15 segundos) */
  timeout?: number;
  /** Mensagem de erro quando timeout */
  timeoutMessage?: string;
  /** Callback quando timeout ocorre */
  onTimeout?: () => void;
}

export interface UseLoadingWithTimeoutReturn {
  /** Estado de loading */
  loading: boolean;
  /** Estado de erro */
  error: Error | null;
  /** Estado de timeout */
  timedOut: boolean;
  /** Iniciar loading */
  startLoading: () => void;
  /** Parar loading */
  stopLoading: () => void;
  /** Definir erro */
  setError: (error: Error | null) => void;
  /** Resetar todos os estados */
  reset: () => void;
}

/**
 * Hook para gerenciar loading com timeout automático
 */
export function useLoadingWithTimeout(
  options: UseLoadingWithTimeoutOptions = {}
): UseLoadingWithTimeoutReturn {
  const {
    timeout = 15000, // 15 segundos padrão
    timeoutMessage = 'Carregamento está demorando mais que o esperado',
    onTimeout,
  } = options;

  const [loading, setLoading] = useState(false);
  const [error, setErrorState] = useState<Error | null>(null);
  const [timedOut, setTimedOut] = useState(false);

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const startLoading = useCallback(() => {
    setLoading(true);
    setErrorState(null);
    setTimedOut(false);

    // Limpar timeout anterior se existir
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Criar novo timeout
    timeoutRef.current = setTimeout(() => {
      if (isMountedRef.current) {
        setTimedOut(true);
        setLoading(false);
        const timeoutError = new Error(timeoutMessage);
        setErrorState(timeoutError);
        logger.warn('[useLoadingWithTimeout] Timeout atingido', { timeout });
        onTimeout?.();
      }
    }, timeout);
  }, [timeout, timeoutMessage, onTimeout]);

  const stopLoading = useCallback(() => {
    setLoading(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const setError = useCallback((err: Error | null) => {
    setErrorState(err);
    setLoading(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const reset = useCallback(() => {
    setLoading(false);
    setErrorState(null);
    setTimedOut(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  return {
    loading,
    error,
    timedOut,
    startLoading,
    stopLoading,
    setError,
    reset,
  };
}
