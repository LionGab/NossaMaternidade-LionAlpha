/**
 * Query Provider - TanStack Query (React Query)
 * Provider para gerenciamento de estado assíncrono e cache
 * Otimizado para performance e offline-first
 * @see https://tanstack.com/query/latest
 */

import { QueryClient, QueryClientProvider, focusManager } from '@tanstack/react-query';
import React from 'react';
import { AppState, Platform } from 'react-native';

import { logger } from '@/utils/logger';

// Configuração otimizada do QueryClient
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Retry inteligente: não retry em erros 4xx (client errors)
      retry: (failureCount, error) => {
        // Não retry em erros de cliente (4xx)
        if (error instanceof Error && 'status' in error) {
          const status = (error as Error & { status: number }).status;
          if (status >= 400 && status < 500) {
            logger.warn(`[Query] Client error ${status}, skipping retry`);
            return false;
          }
        }
        // Retry até 3 vezes para erros de rede/server
        return failureCount < 3;
      },
      // Retry delay exponencial com backoff
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      // Cache por 5 minutos padrão (pode ser sobrescrito por query específica)
      staleTime: 5 * 60 * 1000,
      // Manter dados em cache por 24 horas (garbage collection)
      gcTime: 24 * 60 * 60 * 1000,
      // Mobile não tem "window focus", então false
      refetchOnWindowFocus: false,
      // Refetch quando reconecta à internet
      refetchOnReconnect: true,
      // Refetch quando componente monta (se dados estão stale)
      refetchOnMount: true,
      // Network mode: offline-first (mostra cache primeiro, atualiza em background)
      networkMode: 'offlineFirst',
    },
    mutations: {
      // Retry mutations apenas 1 vez
      retry: 1,
      networkMode: 'offlineFirst',
    },
  },
});

// Setup focus manager para React Native (detecta quando app volta ao foreground)
if (Platform.OS !== 'web') {
  AppState.addEventListener('change', (status) => {
    focusManager.setFocused(status === 'active');
  });
}

interface QueryProviderProps {
  children: React.ReactNode;
}

/**
 * QueryProvider - Wrapper do TanStack Query
 *
 * Uso:
 * ```tsx
 * <QueryProvider>
 *   <App />
 * </QueryProvider>
 * ```
 */
export function QueryProvider({ children }: QueryProviderProps) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

// Export QueryClient para uso em hooks/services
export { queryClient };
