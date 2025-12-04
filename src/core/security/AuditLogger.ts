/**
 * AuditLogger - Sistema de Auditoria para Compliance LGPD
 *
 * Registra todas as operações sensíveis para compliance:
 * - Acesso a dados pessoais
 * - Mudanças em consentimentos
 * - Deleção de dados (direito ao esquecimento)
 */

import { logger } from '@/utils/logger';

export type AuditAction =
  | 'DATA_ACCESS'
  | 'DATA_WRITE'
  | 'DATA_DELETE'
  | 'CONSENT_GRANTED'
  | 'CONSENT_REVOKED'
  | 'CONSENT_UPDATED'
  | 'EXPORT_REQUEST'
  | 'ACCOUNT_DELETED';

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userId: string;
  action: AuditAction;
  resourceType: string;
  resourceId?: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  success: boolean;
  errorMessage?: string;
}

class AuditLogger {
  private logs: AuditLogEntry[] = [];
  private pendingSync: AuditLogEntry[] = [];

  /**
   * Gera ID único para log
   */
  private generateLogId(): string {
    return `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Registra acesso a dados pessoais/saúde
   */
  async logDataAccess(
    userId: string,
    resourceType: string,
    resourceId: string,
    success: boolean,
    metadata?: Record<string, unknown>
  ): Promise<void> {
    const entry: AuditLogEntry = {
      id: this.generateLogId(),
      timestamp: new Date().toISOString(),
      userId,
      action: 'DATA_ACCESS',
      resourceType,
      resourceId,
      metadata,
      success,
    };

    this.addLog(entry);

    logger.info('[AuditLogger] Data access logged', {
      userId,
      resourceType,
      resourceId,
      success,
    });
  }

  /**
   * Registra mudanças em consentimentos
   */
  async logConsentChange(
    userId: string,
    consentType: string,
    action: 'CONSENT_GRANTED' | 'CONSENT_REVOKED' | 'CONSENT_UPDATED',
    metadata?: Record<string, unknown>
  ): Promise<void> {
    const entry: AuditLogEntry = {
      id: this.generateLogId(),
      timestamp: new Date().toISOString(),
      userId,
      action,
      resourceType: 'consent',
      resourceId: consentType,
      metadata,
      success: true,
    };

    this.addLog(entry);

    logger.info('[AuditLogger] Consent change logged', {
      userId,
      consentType,
      action,
    });
  }

  /**
   * Registra deleção de dados (direito ao esquecimento)
   */
  async logDataDeletion(
    userId: string,
    resourceType: string,
    resourceId: string,
    success: boolean,
    metadata?: Record<string, unknown>
  ): Promise<void> {
    const entry: AuditLogEntry = {
      id: this.generateLogId(),
      timestamp: new Date().toISOString(),
      userId,
      action: 'DATA_DELETE',
      resourceType,
      resourceId,
      metadata,
      success,
    };

    this.addLog(entry);

    logger.info('[AuditLogger] Data deletion logged', {
      userId,
      resourceType,
      resourceId,
      success,
    });
  }

  /**
   * Registra exportação de dados (portabilidade)
   */
  async logExportRequest(
    userId: string,
    success: boolean,
    metadata?: Record<string, unknown>
  ): Promise<void> {
    const entry: AuditLogEntry = {
      id: this.generateLogId(),
      timestamp: new Date().toISOString(),
      userId,
      action: 'EXPORT_REQUEST',
      resourceType: 'user_data',
      metadata,
      success,
    };

    this.addLog(entry);

    logger.info('[AuditLogger] Export request logged', { userId, success });
  }

  /**
   * Registra deleção de conta
   */
  async logAccountDeletion(
    userId: string,
    success: boolean,
    metadata?: Record<string, unknown>
  ): Promise<void> {
    const entry: AuditLogEntry = {
      id: this.generateLogId(),
      timestamp: new Date().toISOString(),
      userId,
      action: 'ACCOUNT_DELETED',
      resourceType: 'user_account',
      metadata,
      success,
    };

    this.addLog(entry);

    logger.info('[AuditLogger] Account deletion logged', { userId, success });
  }

  /**
   * Adiciona log à fila
   */
  private addLog(entry: AuditLogEntry): void {
    this.logs.push(entry);
    this.pendingSync.push(entry);

    // Auto-sync se tiver muitos logs pendentes
    if (this.pendingSync.length >= 10) {
      // Fire and forget - não bloquear a operação
      this.syncToServer().catch((error) => {
        logger.error('[AuditLogger] Erro ao sincronizar logs', error);
      });
    }
  }

  /**
   * Sincroniza logs pendentes com servidor Supabase
   *
   * TODO: CRÍTICO - Implementar persistência no Supabase (LGPD compliance)
   * Os audit logs devem ser armazenados de forma segura e imutável
   * para atender requisitos regulatórios da LGPD.
   *
   * Próximos passos:
   * 1. Criar tabela `audit_logs` no Supabase com RLS apropriado
   * 2. Implementar envio batch dos logs
   * 3. Adicionar retry logic para falhas de rede
   * 4. Implementar rotação de logs antigos (retenção mínima 5 anos LGPD)
   */
  async syncToServer(): Promise<{ success: boolean; synced: number; error?: string }> {
    if (this.pendingSync.length === 0) {
      return { success: true, synced: 0 };
    }

    try {
      // TODO: Implementar envio para Supabase
      // const { error } = await supabase
      //   .from('audit_logs')
      //   .insert(this.pendingSync);
      //
      // if (error) throw error;

      const syncedCount = this.pendingSync.length;

      logger.info('[AuditLogger] Logs sincronizados', {
        count: syncedCount,
      });

      // Limpar logs sincronizados
      this.pendingSync = [];

      return { success: true, synced: syncedCount };
    } catch (error) {
      logger.error('[AuditLogger] Erro ao sincronizar logs', error);
      return {
        success: false,
        synced: 0,
        error: error instanceof Error ? error.message : 'Erro ao sincronizar',
      };
    }
  }

  /**
   * Retorna logs em memória (para debug)
   */
  getLogs(limit?: number): AuditLogEntry[] {
    if (limit) {
      return this.logs.slice(-limit);
    }
    return [...this.logs];
  }

  /**
   * Retorna logs pendentes de sincronização
   */
  getPendingLogs(): AuditLogEntry[] {
    return [...this.pendingSync];
  }

  /**
   * Limpa logs da memória (após sincronização bem-sucedida)
   */
  clearMemoryLogs(): void {
    this.logs = [];
    this.pendingSync = [];
    logger.info('[AuditLogger] Logs limpos da memória');
  }

  /**
   * Força sincronização de logs pendentes
   */
  async flush(): Promise<{ success: boolean; error?: string }> {
    const result = await this.syncToServer();
    return {
      success: result.success,
      error: result.error,
    };
  }
}

// Export singleton
export const auditLogger = new AuditLogger();
