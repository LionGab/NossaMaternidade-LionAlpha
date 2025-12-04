/**
 * Tipos para sistema de consentimento LGPD
 * Baseado no schema Supabase
 */

/**
 * Tipos de consentimento (granular, LGPD Art. 8§4)
 */
export type ConsentType =
  | 'essential' // Funcionamento básico (não pode recusar)
  | 'ai_processing' // Processamento IA (NathIA) - LGPD Art. 7 I
  | 'analytics' // Analytics e métricas de uso
  | 'marketing' // Comunicações de marketing
  | 'data_sharing' // Compartilhamento com terceiros
  | 'health_data'; // Dados sensíveis de saúde (LGPD Art. 11)

/**
 * Status do consentimento
 */
export type ConsentStatus =
  | 'granted' // Consentimento ativo
  | 'revoked' // Revogado pelo usuário
  | 'expired' // Expirado (nova versão de termos)
  | 'pending'; // Aguardando decisão

/**
 * Categorias de eventos de auditoria
 */
export type AuditEventCategory =
  | 'consent' // Eventos de consentimento
  | 'auth' // Autenticação
  | 'data_access' // Acesso a dados pessoais
  | 'data_export' // Portabilidade (LGPD Art. 18 V)
  | 'data_deletion' // Exclusão (LGPD Art. 18 VI)
  | 'ai_interaction' // Interações com NathIA
  | 'security'; // Eventos de segurança

/**
 * Versão dos termos de consentimento
 */
export interface ConsentTermsVersion {
  id: string;
  version: string;
  consent_type: ConsentType;
  title: string;
  summary: string;
  full_text: string;
  is_current: boolean;
  is_breaking: boolean;
  effective_from: string;
  created_at: string;
  created_by?: string | null;
  content_hash: string;
}

/**
 * Consentimento do usuário
 */
export interface UserConsent {
  id: string;
  user_id: string;
  terms_version_id: string;
  consent_type: ConsentType;
  status: ConsentStatus;
  granted_at: string;
  revoked_at?: string | null;
  ip_address?: string | null;
  user_agent?: string | null;
  device_id?: string | null;
  collection_method: string;
  metadata: Record<string, unknown>;
  previous_consent_id?: string | null;
  created_at: string;
}

/**
 * Consentimento ativo com informações da versão dos termos
 */
export interface ActiveConsent {
  consent_type: ConsentType;
  status: ConsentStatus;
  granted_at: string;
  terms_version: string;
  is_current_terms: boolean;
}

/**
 * Dados para conceder consentimento
 */
export interface GrantConsentData {
  consent_type: ConsentType;
  terms_version_id: string;
  ip_address?: string;
  user_agent?: string;
  device_id?: string;
  collection_method: 'onboarding' | 'settings' | 'prompt';
}

/**
 * Dados para revogar consentimento
 */
export interface RevokeConsentData {
  consent_type: ConsentType;
  revocation_reason?: string;
  ip_address?: string;
  user_agent?: string;
  device_id?: string;
}

/**
 * Resultado de operação de consentimento
 */
export interface ConsentResult {
  success: boolean;
  consent_id?: string;
  error?: string;
}

/**
 * Estado de consentimentos da usuária
 */
export interface UserConsentsState {
  consents: Record<ConsentType, ActiveConsent | null>;
  isLoading: boolean;
  error: string | null;
}
