/**
 * ConsentManager - Gerenciamento de Consentimentos LGPD
 *
 * Gerencia consentimentos granulares conforme LGPD:
 * - Armazenamento de dados de saúde
 * - Processamento por IA
 * - Analytics
 * - Notificações
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

import { logger } from '@/utils/logger';

// Tipos de consentimento
export type ConsentType =
  | 'health_data' // Dados de saúde (obrigatório)
  | 'ai_processing' // Processamento por IA (obrigatório)
  | 'analytics' // Analytics e melhorias
  | 'notifications'; // Notificações push

export interface ConsentRecord {
  type: ConsentType;
  granted: boolean;
  timestamp: string;
  version: string; // Versão da política de privacidade
  required: boolean;
}

export interface ConsentState {
  userId: string;
  consents: Record<ConsentType, ConsentRecord>;
  lastUpdated: string;
}

class ConsentManager {
  private static readonly STORAGE_KEY = 'lgpd_consents';
  private static readonly POLICY_VERSION = '1.0.0'; // Atualizar ao mudar política
  private currentState: ConsentState | null = null;

  /**
   * Tipos de consentimento obrigatórios
   */
  private readonly requiredConsents: ConsentType[] = ['health_data', 'ai_processing'];

  /**
   * Carrega consentimentos do usuário
   */
  async getConsents(userId: string): Promise<{ consents?: ConsentState; error?: string }> {
    try {
      const stored = await AsyncStorage.getItem(ConsentManager.STORAGE_KEY);

      if (!stored) {
        // Criar estado inicial vazio
        const initialState: ConsentState = {
          userId,
          consents: this.createEmptyConsents(),
          lastUpdated: new Date().toISOString(),
        };
        this.currentState = initialState;
        return { consents: initialState };
      }

      const state = JSON.parse(stored) as ConsentState;

      // Verificar se é do usuário correto
      if (state.userId !== userId) {
        logger.warn('[ConsentManager] userId mismatch, limpando consents', {
          storedUser: state.userId,
          requestedUser: userId,
        });

        const newState: ConsentState = {
          userId,
          consents: this.createEmptyConsents(),
          lastUpdated: new Date().toISOString(),
        };
        this.currentState = newState;
        return { consents: newState };
      }

      this.currentState = state;
      logger.info('[ConsentManager] Consents carregados', { userId });
      return { consents: state };
    } catch (error) {
      logger.error('[ConsentManager] Erro ao carregar consents', error);
      return {
        error: error instanceof Error ? error.message : 'Erro ao carregar consentimentos',
      };
    }
  }

  /**
   * Cria registro de consents vazio
   */
  private createEmptyConsents(): Record<ConsentType, ConsentRecord> {
    const now = new Date().toISOString();
    return {
      health_data: {
        type: 'health_data',
        granted: false,
        timestamp: now,
        version: ConsentManager.POLICY_VERSION,
        required: true,
      },
      ai_processing: {
        type: 'ai_processing',
        granted: false,
        timestamp: now,
        version: ConsentManager.POLICY_VERSION,
        required: true,
      },
      analytics: {
        type: 'analytics',
        granted: false,
        timestamp: now,
        version: ConsentManager.POLICY_VERSION,
        required: false,
      },
      notifications: {
        type: 'notifications',
        granted: false,
        timestamp: now,
        version: ConsentManager.POLICY_VERSION,
        required: false,
      },
    };
  }

  /**
   * Salva consentimento individual
   */
  async saveConsent(
    userId: string,
    consentType: ConsentType,
    granted: boolean
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Carregar estado atual se não estiver em memória
      if (!this.currentState || this.currentState.userId !== userId) {
        const result = await this.getConsents(userId);
        if (result.error || !result.consents) {
          return { success: false, error: result.error };
        }
      }

      if (!this.currentState) {
        return { success: false, error: 'Estado não inicializado' };
      }

      // Atualizar consentimento
      const now = new Date().toISOString();
      this.currentState.consents[consentType] = {
        type: consentType,
        granted,
        timestamp: now,
        version: ConsentManager.POLICY_VERSION,
        required: this.requiredConsents.includes(consentType),
      };
      this.currentState.lastUpdated = now;

      // Persistir
      await AsyncStorage.setItem(ConsentManager.STORAGE_KEY, JSON.stringify(this.currentState));

      logger.info('[ConsentManager] Consent salvo', {
        userId,
        consentType,
        granted,
      });

      // TODO: CRÍTICO - Enviar para Supabase para backup e auditoria (LGPD compliance)
      // Implementar quando Supabase estiver configurado:
      // await supabase.from('user_consents').upsert({
      //   user_id: userId,
      //   consent_type: consentType,
      //   granted,
      //   timestamp: now,
      //   policy_version: ConsentManager.POLICY_VERSION,
      // });

      return { success: true };
    } catch (error) {
      logger.error('[ConsentManager] Erro ao salvar consent', error, {
        userId,
        consentType,
        granted,
      });
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao salvar consentimento',
      };
    }
  }

  /**
   * Revoga consentimento (direito de retirada - LGPD)
   */
  async revokeConsent(
    userId: string,
    consentType: ConsentType
  ): Promise<{ success: boolean; error?: string }> {
    if (this.requiredConsents.includes(consentType)) {
      logger.warn('[ConsentManager] Tentativa de revogar consent obrigatório', {
        userId,
        consentType,
      });
      return {
        success: false,
        error: 'Este consentimento é obrigatório para uso do app',
      };
    }

    return this.saveConsent(userId, consentType, false);
  }

  /**
   * Verifica se todos os consentimentos obrigatórios foram concedidos
   */
  async hasRequiredConsents(userId: string): Promise<{ hasAll: boolean; missing?: ConsentType[] }> {
    const result = await this.getConsents(userId);

    if (result.error || !result.consents) {
      return { hasAll: false };
    }

    const missing: ConsentType[] = [];

    for (const requiredType of this.requiredConsents) {
      const consent = result.consents.consents[requiredType];
      if (!consent || !consent.granted) {
        missing.push(requiredType);
      }
    }

    return {
      hasAll: missing.length === 0,
      missing: missing.length > 0 ? missing : undefined,
    };
  }

  /**
   * Verifica se um consentimento específico foi concedido
   */
  async hasConsent(userId: string, consentType: ConsentType): Promise<boolean> {
    const result = await this.getConsents(userId);

    if (result.error || !result.consents) {
      return false;
    }

    const consent = result.consents.consents[consentType];
    return consent?.granted ?? false;
  }

  /**
   * Limpa todos os consentimentos (para quando usuário deletar conta)
   */
  async clearAllConsents(): Promise<{ success: boolean; error?: string }> {
    try {
      await AsyncStorage.removeItem(ConsentManager.STORAGE_KEY);
      this.currentState = null;

      logger.info('[ConsentManager] Todos os consents limpos');
      return { success: true };
    } catch (error) {
      logger.error('[ConsentManager] Erro ao limpar consents', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao limpar consentimentos',
      };
    }
  }

  /**
   * Exporta consentimentos (direito de portabilidade - LGPD)
   */
  async exportConsents(userId: string): Promise<{ data?: ConsentState; error?: string }> {
    const result = await this.getConsents(userId);

    if (result.error || !result.consents) {
      return { error: result.error || 'Consentimentos não encontrados' };
    }

    return { data: result.consents };
  }
}

// Export singleton
export const consentManager = new ConsentManager();
