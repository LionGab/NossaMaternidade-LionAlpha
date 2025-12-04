/**
 * useSession Hook
 * Hook React para acessar estado de sessão com auto-validação
 */

import { Session, User } from '@supabase/supabase-js';
import { useEffect, useState, useCallback } from 'react';

import { ensureValidSession } from '../middleware/sessionValidator';
import { sessionManager } from '../services/sessionManager';
import { logger } from '../utils/logger';

export interface SessionHookResult {
  session: Session | null;
  user: User | null;
  isValid: boolean;
  isLoading: boolean;
  refresh: () => Promise<boolean>;
  chatSessionId: string | null;
  analyticsSessionId: string | null;
}

/**
 * Hook para acessar estado de sessão
 * Auto-valida e atualiza quando necessário
 */
export function useSession(): SessionHookResult {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isValid, setIsValid] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [chatSessionId, setChatSessionId] = useState<string | null>(null);
  const [analyticsSessionId, setAnalyticsSessionId] = useState<string | null>(null);

  // Função para refresh manual
  const refresh = useCallback(async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      const result = await sessionManager.refreshAuth();
      setIsValid(result);

      if (result) {
        const state = sessionManager.getState();
        setSession(state.auth.session);
        setUser(state.auth.user);
      }

      return result;
    } catch (error) {
      logger.error('[useSession] Erro ao fazer refresh', error);
      setIsValid(false);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Obter estado inicial
    const state = sessionManager.getState();
    setSession(state.auth.session);
    setUser(state.auth.user);
    setIsLoading(state.auth.isLoading);
    setChatSessionId(state.chat.currentSessionId);
    setAnalyticsSessionId(state.analytics.sessionId);

    // Validar sessão inicial se existir
    if (state.auth.session) {
      ensureValidSession(state.auth.session)
        .then((validation) => {
          setIsValid(validation.isValid);
        })
        .catch((error) => {
          logger.error('[useSession] Erro ao validar sessão inicial', error);
          setIsValid(false);
        });
    } else {
      setIsValid(false);
    }

    // Escutar mudanças
    const unsubscribe = sessionManager.addListener((newState) => {
      setSession(newState.auth.session);
      setUser(newState.auth.user);
      setIsLoading(newState.auth.isLoading);
      setChatSessionId(newState.chat.currentSessionId);
      setAnalyticsSessionId(newState.analytics.sessionId);

      // Validar sessão quando mudar (apenas se houver sessão)
      if (newState.auth.session) {
        ensureValidSession(newState.auth.session)
          .then((validation) => {
            setIsValid(validation.isValid);
          })
          .catch((error) => {
            logger.error('[useSession] Erro ao validar sessão', error);
            setIsValid(false);
          });
      } else {
        setIsValid(false);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return {
    session,
    user,
    isValid,
    isLoading,
    refresh,
    chatSessionId,
    analyticsSessionId,
  };
}

export default useSession;
