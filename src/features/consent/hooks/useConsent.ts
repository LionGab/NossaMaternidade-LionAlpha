/**
 * useConsent Hook - Gerenciamento de Consentimentos LGPD
 *
 * Hook React para verificar e gerenciar consentimentos do usuário
 */

import { useState, useEffect, useCallback } from 'react';

import { consentManager, type ConsentType, type ConsentState } from '@/core/security';
import { logger } from '@/utils/logger';

interface UseConsentResult {
  consents: ConsentState | null;
  loading: boolean;
  error: string | null;
  hasRequiredConsents: boolean;
  checkConsents: (userId: string) => Promise<void>;
  updateConsent: (userId: string, type: ConsentType, granted: boolean) => Promise<boolean>;
  revokeConsent: (userId: string, type: ConsentType) => Promise<boolean>;
  revokeAll: () => Promise<boolean>;
}

export function useConsent(userId?: string): UseConsentResult {
  const [consents, setConsents] = useState<ConsentState | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasRequiredConsents, setHasRequiredConsents] = useState(false);

  /**
   * Verifica consentimentos do usuário
   */
  const checkConsents = useCallback(async (uid: string) => {
    setLoading(true);
    setError(null);

    try {
      const result = await consentManager.getConsents(uid);

      if (result.error || !result.consents) {
        setError(result.error || 'Erro ao carregar consentimentos');
        return;
      }

      setConsents(result.consents);

      // Verificar se tem consentimentos obrigatórios
      const { hasAll } = await consentManager.hasRequiredConsents(uid);
      setHasRequiredConsents(hasAll);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(message);
      logger.error('[useConsent] Erro ao verificar consents', err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Atualiza consentimento individual
   */
  const updateConsent = useCallback(
    async (uid: string, type: ConsentType, granted: boolean): Promise<boolean> => {
      setLoading(true);
      setError(null);

      try {
        const result = await consentManager.saveConsent(uid, type, granted);

        if (!result.success) {
          setError(result.error || 'Erro ao salvar consentimento');
          return false;
        }

        // Recarregar consents
        await checkConsents(uid);
        return true;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Erro desconhecido';
        setError(message);
        logger.error('[useConsent] Erro ao atualizar consent', err);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [checkConsents]
  );

  /**
   * Revoga consentimento
   */
  const revokeConsent = useCallback(
    async (uid: string, type: ConsentType): Promise<boolean> => {
      setLoading(true);
      setError(null);

      try {
        const result = await consentManager.revokeConsent(uid, type);

        if (!result.success) {
          setError(result.error || 'Erro ao revogar consentimento');
          return false;
        }

        // Recarregar consents
        await checkConsents(uid);
        return true;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Erro desconhecido';
        setError(message);
        logger.error('[useConsent] Erro ao revogar consent', err);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [checkConsents]
  );

  /**
   * Revoga todos os consentimentos
   */
  const revokeAll = useCallback(async (): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const result = await consentManager.clearAllConsents();

      if (!result.success) {
        setError(result.error || 'Erro ao limpar consentimentos');
        return false;
      }

      setConsents(null);
      setHasRequiredConsents(false);
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(message);
      logger.error('[useConsent] Erro ao limpar consents', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Carrega consents automaticamente se userId for fornecido
   */
  useEffect(() => {
    if (userId) {
      checkConsents(userId);
    }
  }, [userId, checkConsents]);

  return {
    consents,
    loading,
    error,
    hasRequiredConsents,
    checkConsents,
    updateConsent,
    revokeConsent,
    revokeAll,
  };
}
