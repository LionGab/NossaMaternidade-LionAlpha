/**
 * Core Security Module - LGPD Compliance
 *
 * Exporta módulos de segurança para compliance com LGPD
 */

export { secureStorage } from './SecureStorage';
export { consentManager } from './ConsentManager';
export { auditLogger } from './AuditLogger';

export type {
  HealthDataType,
  HealthDataRecord,
  AuditLogEntry as StorageAuditLogEntry,
} from './SecureStorage';

export type { ConsentType, ConsentRecord, ConsentState } from './ConsentManager';

export type { AuditAction, AuditLogEntry } from './AuditLogger';
