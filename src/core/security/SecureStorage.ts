/**
 * SecureStorage - Armazenamento criptografado de dados de saúde (LGPD)
 *
 * Funcionalidades:
 * - Criptografia AES-256 para dados sensíveis (via SecureStore)
 * - Audit logging de todos os acessos
 * - Compliance com LGPD (Lei Geral de Proteção de Dados)
 */

import * as SecureStore from 'expo-secure-store';

import { logger } from '@/utils/logger';

// Tipos de dados de saúde suportados
export type HealthDataType =
  | 'medical_history'
  | 'symptoms'
  | 'medications'
  | 'appointments'
  | 'lab_results'
  | 'pregnancy_data'
  | 'personal_notes';

export interface HealthDataRecord {
  id: string;
  type: HealthDataType;
  data: unknown;
  encryptedAt: string;
  userId: string;
}

export interface AuditLogEntry {
  timestamp: string;
  userId: string;
  action: 'READ' | 'WRITE' | 'DELETE';
  dataType: HealthDataType;
  dataId: string;
  success: boolean;
  error?: string;
}

class SecureStorage {
  private initialized = false;
  private auditLogs: AuditLogEntry[] = [];

  /**
   * Inicializa o sistema de armazenamento seguro
   */
  async initialize(): Promise<{ success: boolean; error?: string }> {
    try {
      // Verificar se o SecureStore está disponível
      const available = await SecureStore.isAvailableAsync();
      if (!available) {
        const error = 'SecureStore não está disponível neste dispositivo';
        logger.error('[SecureStorage] Inicialização falhou', new Error(error));
        return { success: false, error };
      }

      this.initialized = true;
      logger.info('[SecureStorage] Inicializado com sucesso');
      return { success: true };
    } catch (error) {
      logger.error('[SecureStorage] Erro ao inicializar', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      };
    }
  }

  /**
   * Gera chave de armazenamento baseada no tipo e ID
   */
  private getStorageKey(userId: string, dataType: HealthDataType, dataId: string): string {
    return `health_${userId}_${dataType}_${dataId}`;
  }

  /**
   * Criptografa dados usando SecureStore (que já usa AES-256-GCM)
   */
  private async encryptData(data: unknown): Promise<string> {
    const jsonData = JSON.stringify(data);
    // SecureStore já faz criptografia AES-256-GCM automaticamente
    // Aqui apenas preparamos os dados para armazenamento
    return Buffer.from(jsonData).toString('base64');
  }

  /**
   * Descriptografa dados
   */
  private async decryptData(encryptedData: string): Promise<unknown> {
    const jsonData = Buffer.from(encryptedData, 'base64').toString('utf8');
    return JSON.parse(jsonData);
  }

  /**
   * Registra ação no audit log
   */
  private logAudit(entry: AuditLogEntry): void {
    this.auditLogs.push(entry);

    // Log para monitoramento
    logger.info('[SecureStorage] Audit Log', {
      action: entry.action,
      dataType: entry.dataType,
      userId: entry.userId,
      success: entry.success,
    });

    // Em produção, enviar para servidor/Supabase
    // TODO: Implementar envio para tabela audit_logs no Supabase
  }

  /**
   * Armazena dados de saúde de forma segura
   */
  async storeHealthData(
    userId: string,
    dataType: HealthDataType,
    dataId: string,
    data: unknown
  ): Promise<{ success: boolean; error?: string }> {
    if (!this.initialized) {
      const initResult = await this.initialize();
      if (!initResult.success) {
        return initResult;
      }
    }

    const auditEntry: AuditLogEntry = {
      timestamp: new Date().toISOString(),
      userId,
      action: 'WRITE',
      dataType,
      dataId,
      success: false,
    };

    try {
      // Criptografar dados
      const encryptedData = await this.encryptData(data);

      // Criar registro
      const record: HealthDataRecord = {
        id: dataId,
        type: dataType,
        data: encryptedData,
        encryptedAt: new Date().toISOString(),
        userId,
      };

      // Armazenar no SecureStore
      const storageKey = this.getStorageKey(userId, dataType, dataId);
      await SecureStore.setItemAsync(storageKey, JSON.stringify(record));

      auditEntry.success = true;
      this.logAudit(auditEntry);

      logger.info('[SecureStorage] Dados armazenados', { userId, dataType, dataId });
      return { success: true };
    } catch (error) {
      auditEntry.success = false;
      auditEntry.error = error instanceof Error ? error.message : 'Erro desconhecido';
      this.logAudit(auditEntry);

      logger.error('[SecureStorage] Erro ao armazenar dados', error, {
        userId,
        dataType,
        dataId,
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao armazenar dados',
      };
    }
  }

  /**
   * Recupera dados de saúde
   */
  async getHealthData(
    userId: string,
    dataType: HealthDataType,
    dataId: string
  ): Promise<{ data?: unknown; error?: string }> {
    if (!this.initialized) {
      const initResult = await this.initialize();
      if (!initResult.success) {
        return { error: initResult.error };
      }
    }

    const auditEntry: AuditLogEntry = {
      timestamp: new Date().toISOString(),
      userId,
      action: 'READ',
      dataType,
      dataId,
      success: false,
    };

    try {
      const storageKey = this.getStorageKey(userId, dataType, dataId);
      const recordJson = await SecureStore.getItemAsync(storageKey);

      if (!recordJson) {
        auditEntry.success = false;
        auditEntry.error = 'Dados não encontrados';
        this.logAudit(auditEntry);
        return { error: 'Dados não encontrados' };
      }

      const record = JSON.parse(recordJson) as HealthDataRecord;

      // Descriptografar dados
      const decryptedData = await this.decryptData(record.data as string);

      auditEntry.success = true;
      this.logAudit(auditEntry);

      logger.info('[SecureStorage] Dados recuperados', { userId, dataType, dataId });
      return { data: decryptedData };
    } catch (error) {
      auditEntry.success = false;
      auditEntry.error = error instanceof Error ? error.message : 'Erro desconhecido';
      this.logAudit(auditEntry);

      logger.error('[SecureStorage] Erro ao recuperar dados', error, {
        userId,
        dataType,
        dataId,
      });

      return {
        error: error instanceof Error ? error.message : 'Erro ao recuperar dados',
      };
    }
  }

  /**
   * Remove dados de saúde (direito ao esquecimento - LGPD)
   */
  async deleteHealthData(
    userId: string,
    dataType: HealthDataType,
    dataId: string
  ): Promise<{ success: boolean; error?: string }> {
    if (!this.initialized) {
      const initResult = await this.initialize();
      if (!initResult.success) {
        return initResult;
      }
    }

    const auditEntry: AuditLogEntry = {
      timestamp: new Date().toISOString(),
      userId,
      action: 'DELETE',
      dataType,
      dataId,
      success: false,
    };

    try {
      const storageKey = this.getStorageKey(userId, dataType, dataId);
      await SecureStore.deleteItemAsync(storageKey);

      auditEntry.success = true;
      this.logAudit(auditEntry);

      logger.info('[SecureStorage] Dados deletados', { userId, dataType, dataId });
      return { success: true };
    } catch (error) {
      auditEntry.success = false;
      auditEntry.error = error instanceof Error ? error.message : 'Erro desconhecido';
      this.logAudit(auditEntry);

      logger.error('[SecureStorage] Erro ao deletar dados', error, {
        userId,
        dataType,
        dataId,
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao deletar dados',
      };
    }
  }

  /**
   * Retorna audit logs (para compliance)
   */
  getAuditLogs(): AuditLogEntry[] {
    return [...this.auditLogs];
  }

  /**
   * Limpa audit logs da memória (logs devem ser persistidos no servidor)
   */
  clearAuditLogs(): void {
    this.auditLogs = [];
  }
}

// Export singleton
export const secureStorage = new SecureStorage();
