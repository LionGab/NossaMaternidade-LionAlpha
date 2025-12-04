/**
 * Hook useConsent - Gerenciamento de consentimentos LGPD
 * Usa React Query para cache e sincronização automática
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { consentService } from '@/services/consentService';
import type {
  ConsentType,
  ActiveConsent,
  GrantConsentData,
  RevokeConsentData,
  ConsentResult,
} from '@/types/consent';
import { logger } from '@/utils/logger';

/**
 * Query keys para React Query
 */
const consentKeys = {
  all: ['consents'] as const,
  active: () => [...consentKeys.all, 'active'] as const,
  terms: (type?: ConsentType) => [...consentKeys.all, 'terms', type] as const,
  history: (type?: ConsentType) => [...consentKeys.all, 'history', type] as const,
};

/**
 * Hook para obter consentimentos ativos da usuária
 */
export function useActiveConsents() {
  return useQuery({
    queryKey: consentKeys.active(),
    queryFn: async () => {
      const consents = await consentService.getActiveConsents();
      // Converter array para objeto por tipo para facilitar acesso
      const consentsMap: Record<ConsentType, ActiveConsent | null> = {
        essential: null,
        ai_processing: null,
        analytics: null,
        marketing: null,
        data_sharing: null,
        health_data: null,
      };

      consents.forEach((consent) => {
        consentsMap[consent.consent_type] = consent;
      });

      return consentsMap;
    },
    staleTime: 2 * 60 * 1000, // 2 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  });
}

/**
 * Hook para verificar se usuária tem consentimento específico
 */
export function useHasConsent(consentType: ConsentType) {
  const { data: consents, isLoading } = useActiveConsents();

  return {
    hasConsent: consents ? consents[consentType]?.status === 'granted' : false,
    isLoading,
    consent: consents?.[consentType] || null,
  };
}

/**
 * Hook para obter termos atuais de um tipo específico
 */
export function useConsentTerms(consentType: ConsentType) {
  return useQuery({
    queryKey: consentKeys.terms(consentType),
    queryFn: () => consentService.getCurrentTerms(consentType),
    staleTime: 30 * 60 * 1000, // 30 minutos (termos mudam raramente)
    gcTime: 60 * 60 * 1000, // 1 hora
  });
}

/**
 * Hook para obter todas as versões atuais dos termos
 */
export function useAllConsentTerms() {
  return useQuery({
    queryKey: consentKeys.terms(),
    queryFn: () => consentService.getAllCurrentTerms(),
    staleTime: 30 * 60 * 1000, // 30 minutos
    gcTime: 60 * 60 * 1000, // 1 hora
  });
}

/**
 * Hook para conceder consentimento
 */
export function useGrantConsent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: GrantConsentData): Promise<ConsentResult> => {
      return await consentService.grantConsent(data);
    },
    onSuccess: (result: ConsentResult) => {
      if (result.success) {
        // Invalidar queries de consentimentos para refetch
        queryClient.invalidateQueries({ queryKey: consentKeys.active() });
        queryClient.invalidateQueries({ queryKey: consentKeys.history() });

        logger.info('Consentimento concedido via hook', {
          hook: 'useGrantConsent',
          consentId: result.consent_id,
        });
      }
    },
    onError: (error: Error) => {
      logger.error('Erro ao conceder consentimento via hook', error, {
        hook: 'useGrantConsent',
      });
    },
  });
}

/**
 * Hook para revogar consentimento
 */
export function useRevokeConsent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: RevokeConsentData): Promise<ConsentResult> => {
      return await consentService.revokeConsent(data);
    },
    onSuccess: (result: ConsentResult) => {
      if (result.success) {
        // Invalidar queries de consentimentos para refetch
        queryClient.invalidateQueries({ queryKey: consentKeys.active() });
        queryClient.invalidateQueries({ queryKey: consentKeys.history() });

        logger.info('Consentimento revogado via hook', {
          hook: 'useRevokeConsent',
        });
      }
    },
    onError: (error: Error) => {
      logger.error('Erro ao revogar consentimento via hook', error, {
        hook: 'useRevokeConsent',
      });
    },
  });
}

/**
 * Hook para obter histórico de consentimentos
 */
export function useConsentHistory(consentType?: ConsentType) {
  return useQuery({
    queryKey: consentKeys.history(consentType),
    queryFn: () => consentService.getConsentHistory(consentType),
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 30 * 60 * 1000, // 30 minutos
  });
}

/**
 * Hook completo para gerenciar consentimentos
 * Combina todas as funcionalidades em um único hook
 */
export function useConsent() {
  const activeConsents = useActiveConsents();
  const grantConsent = useGrantConsent();
  const revokeConsent = useRevokeConsent();

  return {
    // Dados
    consents: activeConsents.data,
    isLoading: activeConsents.isLoading,
    error: activeConsents.error,

    // Ações
    grantConsent: grantConsent.mutate,
    revokeConsent: revokeConsent.mutate,

    // Estados das mutations
    isGranting: grantConsent.isPending,
    isRevoking: revokeConsent.isPending,

    // Helpers
    hasConsent: (type: ConsentType) => {
      return activeConsents.data?.[type]?.status === 'granted' || false;
    },
    refresh: () => {
      activeConsents.refetch();
    },
  };
}
