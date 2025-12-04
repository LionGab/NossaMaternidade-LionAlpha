/**
 * File Review System Types
 * Sistema de revisão e aprovação de mudanças em arquivos
 */

export type FileReviewStatus = 'pending' | 'approved' | 'rejected' | 'skipped';

export interface FileChange {
  filePath: string;
  originalContent?: string;
  proposedContent: string;
  diff?: string;
  changeType: 'create' | 'modify' | 'delete';
  description?: string;
  agent?: string; // Nome do agente que propôs a mudança
  timestamp: number;
}

export interface FileReview {
  id: string;
  filePath: string;
  status: FileReviewStatus;
  change: FileChange;
  reviewedAt?: number;
  reviewedBy?: string;
}

export interface ReviewSession {
  id: string;
  title: string;
  description?: string;
  files: FileReview[];
  createdAt: number;
  completedAt?: number;
  allowAllEnabled: boolean; // Flag para "Allow all"
}

export interface ReviewPermissions {
  allowAll: boolean; // Permissão para aprovar todos
  autoApprove: boolean; // Auto-aprovar mudanças de confiança alta
  requireReview: boolean; // Sempre requer revisão manual
  allowedAgents: string[]; // Agentes que podem propor mudanças
}
