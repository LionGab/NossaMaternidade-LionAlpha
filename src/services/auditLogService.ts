/**
 * Serviço de Auditoria LGPD
 * IMPORTANTE: Este serviço só deve ser usado via Edge Functions ou backend
 * com service_role key. NÃO expor ao client.
 *
 * Para registrar eventos do client, use Edge Functions que chamam este serviço.
 */

import type { AuditEventCategory } from '@/types/consent';
import { logger } from '@/utils/logger';

/**
 * Dados para criar log de auditoria
 */
export interface AuditLogData {
  event_id: string;
  category: AuditEventCategory;
  user_id?: string;
  action: string;
  resource_type?: string;
  resource_id?: string;
  details?: Record<string, unknown>;
  previous_state?: Record<string, unknown>;
  new_state?: Record<string, unknown>;
  ip_address?: string;
  user_agent?: string;
  device_id?: string;
  session_id?: string;
  app_version?: string;
}

/**
 * Resultado de inserção de log
 */
export interface AuditLogResult {
  success: boolean;
  log_id?: string;
  error?: string;
}

/**
 * Serviço de Auditoria
 *
 * NOTA: Este serviço requer service_role key do Supabase.
 * No client, use Edge Functions para registrar eventos.
 *
 * Exemplo de uso em Edge Function:
 * ```typescript
 * import { createClient } from '@supabase/supabase-js';
 * const supabaseAdmin = createClient(
 *   Deno.env.get('SUPABASE_URL')!,
 *   Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
 * );
 *
 * const { data, error } = await supabaseAdmin.rpc('insert_audit_log', {
 *   p_event_id: 'consent.granted',
 *   p_category: 'consent',
 *   p_user_id: userId,
 *   // ... outros campos
 * });
 * ```
 */
class AuditLogService {
  /**
   * Registrar evento de auditoria
   *
   * IMPORTANTE: Esta função requer service_role key.
   * No client React Native, NÃO use diretamente.
   * Use Edge Functions para registrar eventos.
   *
   * @param data Dados do evento de auditoria
   * @returns Resultado da inserção
   */
  async logEvent(data: AuditLogData): Promise<AuditLogResult> {
    try {
      // Esta função deve ser chamada apenas via Edge Functions
      // com service_role key. No client, não temos acesso direto.

      logger.warn(
        'AuditLogService.logEvent chamado diretamente do client. Use Edge Functions.',
        undefined,
        {
          service: 'AuditLogService',
          action: 'logEvent',
          event_id: data.event_id,
        }
      );

      return {
        success: false,
        error: 'Audit logs devem ser registrados via Edge Functions com service_role',
      };
    } catch (error) {
      logger.error('Erro ao registrar log de auditoria', error, {
        service: 'AuditLogService',
        action: 'logEvent',
        data,
      });
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro inesperado',
      };
    }
  }

  /**
   * Registrar evento de consentimento concedido
   * Helper para facilitar uso em Edge Functions
   */
  static createConsentGrantedLog(
    userId: string,
    consentType: string,
    consentId: string,
    context?: {
      ip_address?: string;
      user_agent?: string;
      device_id?: string;
      session_id?: string;
    }
  ): AuditLogData {
    return {
      event_id: 'consent.granted',
      category: 'consent',
      user_id: userId,
      action: 'grant',
      resource_type: 'consent',
      resource_id: consentId,
      details: {
        consent_type: consentType,
      },
      new_state: {
        status: 'granted',
      },
      ip_address: context?.ip_address,
      user_agent: context?.user_agent,
      device_id: context?.device_id,
      session_id: context?.session_id,
    };
  }

  /**
   * Registrar evento de consentimento revogado
   */
  static createConsentRevokedLog(
    userId: string,
    consentType: string,
    consentId: string,
    revocationReason?: string,
    context?: {
      ip_address?: string;
      user_agent?: string;
      device_id?: string;
      session_id?: string;
    }
  ): AuditLogData {
    return {
      event_id: 'consent.revoked',
      category: 'consent',
      user_id: userId,
      action: 'revoke',
      resource_type: 'consent',
      resource_id: consentId,
      details: {
        consent_type: consentType,
        revocation_reason: revocationReason,
      },
      previous_state: {
        status: 'granted',
      },
      new_state: {
        status: 'revoked',
      },
      ip_address: context?.ip_address,
      user_agent: context?.user_agent,
      device_id: context?.device_id,
      session_id: context?.session_id,
    };
  }

  /**
   * Registrar evento de interação com IA
   */
  static createAIInteractionLog(
    userId: string,
    action: 'chat.request' | 'chat.response' | 'chat.error',
    conversationId?: string,
    context?: {
      ip_address?: string;
      user_agent?: string;
      device_id?: string;
      session_id?: string;
      message_length?: number;
      tokens_used?: number;
    }
  ): AuditLogData {
    return {
      event_id: `ai.${action}`,
      category: 'ai_interaction',
      user_id: userId,
      action: action.includes('request') ? 'create' : 'read',
      resource_type: 'chat_message',
      resource_id: conversationId,
      details: {
        message_length: context?.message_length,
        tokens_used: context?.tokens_used,
      },
      ip_address: context?.ip_address,
      user_agent: context?.user_agent,
      device_id: context?.device_id,
      session_id: context?.session_id,
    };
  }
}

export const auditLogService = new AuditLogService();
