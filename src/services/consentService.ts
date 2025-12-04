/**
 * Serviço de Consentimento LGPD
 * Gerencia consentimentos das usuárias (grant, revoke, get)
 */

import type {
  ConsentType,
  ConsentTermsVersion,
  UserConsent,
  ActiveConsent,
  GrantConsentData,
  RevokeConsentData,
  ConsentResult,
} from '@/types/consent';
import { logger } from '@/utils/logger';

import { supabase } from './supabase';

export interface ServiceResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

class ConsentService {
  /**
   * Obter ID do usuário atual
   */
  private async getCurrentUserId(): Promise<string | null> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      return user?.id || null;
    } catch (error) {
      logger.error('Erro ao obter usuário atual', error, {
        service: 'ConsentService',
        action: 'getCurrentUserId',
      });
      return null;
    }
  }

  /**
   * Obter versões atuais dos termos por tipo
   */
  async getCurrentTerms(consentType: ConsentType): Promise<ConsentTermsVersion | null> {
    try {
      const { data, error } = await supabase
        .from('consent_terms_versions')
        .select('*')
        .eq('consent_type', consentType)
        .eq('is_current', true)
        .single();

      if (error) {
        logger.error('Erro ao buscar termos atuais', error, {
          service: 'ConsentService',
          action: 'getCurrentTerms',
          consentType,
        });
        return null;
      }

      return data as ConsentTermsVersion;
    } catch (error) {
      logger.error('Erro inesperado ao buscar termos', error, {
        service: 'ConsentService',
        action: 'getCurrentTerms',
        consentType,
      });
      return null;
    }
  }

  /**
   * Obter todas as versões atuais dos termos
   */
  async getAllCurrentTerms(): Promise<ConsentTermsVersion[]> {
    try {
      const { data, error } = await supabase
        .from('consent_terms_versions')
        .select('*')
        .eq('is_current', true)
        .order('consent_type');

      if (error) {
        logger.error('Erro ao buscar todos os termos', error, {
          service: 'ConsentService',
          action: 'getAllCurrentTerms',
        });
        return [];
      }

      return (data || []) as ConsentTermsVersion[];
    } catch (error) {
      logger.error('Erro inesperado ao buscar todos os termos', error, {
        service: 'ConsentService',
        action: 'getAllCurrentTerms',
      });
      return [];
    }
  }

  /**
   * Conceder consentimento
   * Usa a função RPC grant_consent que faz auditoria automática
   */
  async grantConsent(data: GrantConsentData): Promise<ConsentResult> {
    try {
      const userId = await this.getCurrentUserId();
      if (!userId) {
        return {
          success: false,
          error: 'Usuária não autenticada',
        };
      }

      // Chamar função RPC que faz grant + auditoria
      const { data: consentId, error } = await supabase.rpc('grant_consent', {
        p_user_id: userId,
        p_consent_type: data.consent_type,
        p_terms_version_id: data.terms_version_id,
        p_ip_address: data.ip_address || null,
        p_user_agent: data.user_agent || null,
        p_device_id: data.device_id || null,
        p_collection_method: data.collection_method,
      });

      if (error) {
        logger.error('Erro ao conceder consentimento', error, {
          service: 'ConsentService',
          action: 'grantConsent',
          userId,
          consentType: data.consent_type,
        });
        return {
          success: false,
          error: error.message || 'Erro ao conceder consentimento',
        };
      }

      logger.info('Consentimento concedido com sucesso', {
        service: 'ConsentService',
        action: 'grantConsent',
        userId,
        consentType: data.consent_type,
        consentId,
      });

      return {
        success: true,
        consent_id: consentId as string,
      };
    } catch (error) {
      logger.error('Erro inesperado ao conceder consentimento', error, {
        service: 'ConsentService',
        action: 'grantConsent',
        data,
      });
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro inesperado',
      };
    }
  }

  /**
   * Revogar consentimento
   * Usa a função RPC revoke_consent que faz auditoria automática
   */
  async revokeConsent(data: RevokeConsentData): Promise<ConsentResult> {
    try {
      const userId = await this.getCurrentUserId();
      if (!userId) {
        return {
          success: false,
          error: 'Usuária não autenticada',
        };
      }

      // Chamar função RPC que faz revoke + auditoria
      const { data: revoked, error } = await supabase.rpc('revoke_consent', {
        p_user_id: userId,
        p_consent_type: data.consent_type,
        p_ip_address: data.ip_address || null,
        p_user_agent: data.user_agent || null,
        p_device_id: data.device_id || null,
        p_revocation_reason: data.revocation_reason || null,
      });

      if (error) {
        logger.error('Erro ao revogar consentimento', error, {
          service: 'ConsentService',
          action: 'revokeConsent',
          userId,
          consentType: data.consent_type,
        });
        return {
          success: false,
          error: error.message || 'Erro ao revogar consentimento',
        };
      }

      if (!revoked) {
        return {
          success: false,
          error: 'Consentimento não encontrado ou já revogado',
        };
      }

      logger.info('Consentimento revogado com sucesso', {
        service: 'ConsentService',
        action: 'revokeConsent',
        userId,
        consentType: data.consent_type,
      });

      return {
        success: true,
      };
    } catch (error) {
      logger.error('Erro inesperado ao revogar consentimento', error, {
        service: 'ConsentService',
        action: 'revokeConsent',
        data,
      });
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro inesperado',
      };
    }
  }

  /**
   * Obter consentimentos ativos da usuária atual
   */
  async getActiveConsents(): Promise<ActiveConsent[]> {
    try {
      const userId = await this.getCurrentUserId();
      if (!userId) {
        return [];
      }

      // Usar função RPC que retorna consentimentos ativos
      const { data, error } = await supabase.rpc('get_user_consents', {
        p_user_id: userId,
      });

      if (error) {
        logger.error('Erro ao buscar consentimentos ativos', error, {
          service: 'ConsentService',
          action: 'getActiveConsents',
          userId,
        });
        return [];
      }

      return (data || []) as ActiveConsent[];
    } catch (error) {
      logger.error('Erro inesperado ao buscar consentimentos', error, {
        service: 'ConsentService',
        action: 'getActiveConsents',
      });
      return [];
    }
  }

  /**
   * Verificar se usuária tem consentimento ativo para um tipo específico
   */
  async hasConsent(consentType: ConsentType): Promise<boolean> {
    try {
      const consents = await this.getActiveConsents();
      return consents.some((c) => c.consent_type === consentType && c.status === 'granted');
    } catch (error) {
      logger.error('Erro ao verificar consentimento', error, {
        service: 'ConsentService',
        action: 'hasConsent',
        consentType,
      });
      return false;
    }
  }

  /**
   * Obter histórico completo de consentimentos (incluindo revogados/expirados)
   */
  async getConsentHistory(consentType?: ConsentType): Promise<UserConsent[]> {
    try {
      const userId = await this.getCurrentUserId();
      if (!userId) {
        return [];
      }

      let query = supabase
        .from('user_consents')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (consentType) {
        query = query.eq('consent_type', consentType);
      }

      const { data, error } = await query;

      if (error) {
        logger.error('Erro ao buscar histórico de consentimentos', error, {
          service: 'ConsentService',
          action: 'getConsentHistory',
          userId,
          consentType,
        });
        return [];
      }

      return (data || []) as UserConsent[];
    } catch (error) {
      logger.error('Erro inesperado ao buscar histórico', error, {
        service: 'ConsentService',
        action: 'getConsentHistory',
        consentType,
      });
      return [];
    }
  }

  /**
   * Obter consentimento específico por ID
   */
  async getConsentById(consentId: string): Promise<UserConsent | null> {
    try {
      const userId = await this.getCurrentUserId();
      if (!userId) {
        return null;
      }

      const { data, error } = await supabase
        .from('user_consents')
        .select('*')
        .eq('id', consentId)
        .eq('user_id', userId)
        .single();

      if (error) {
        logger.error('Erro ao buscar consentimento por ID', error, {
          service: 'ConsentService',
          action: 'getConsentById',
          userId,
          consentId,
        });
        return null;
      }

      return data as UserConsent;
    } catch (error) {
      logger.error('Erro inesperado ao buscar consentimento', error, {
        service: 'ConsentService',
        action: 'getConsentById',
        consentId,
      });
      return null;
    }
  }
}

export const consentService = new ConsentService();
