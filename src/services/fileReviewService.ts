/**
 * File Review Service
 * Gerencia revisão e aprovação de mudanças em arquivos
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

import type { FileReview, FileChange, ReviewSession, ReviewPermissions } from '../types/fileReview';
import { logger } from '../utils/logger';

const STORAGE_KEYS = {
  REVIEW_SESSIONS: '@file_review:sessions',
  PERMISSIONS: '@file_review:permissions',
  REVIEW_HISTORY: '@file_review:history',
};

export class FileReviewService {
  private static instance: FileReviewService;
  private currentSession: ReviewSession | null = null;
  private permissions: ReviewPermissions = {
    allowAll: true, // Keep All ativado por padrão
    autoApprove: false,
    requireReview: true,
    allowedAgents: [],
  };

  static getInstance(): FileReviewService {
    if (!FileReviewService.instance) {
      FileReviewService.instance = new FileReviewService();
    }
    return FileReviewService.instance;
  }

  /**
   * Carrega permissões salvas
   * Se não houver permissões salvas, salva as padrão (Keep All ativado)
   */
  async loadPermissions(): Promise<ReviewPermissions> {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.PERMISSIONS);
      if (stored) {
        this.permissions = JSON.parse(stored);
      } else {
        // Se não há permissões salvas, salva as permissões padrão (com Keep All ativado)
        await this.savePermissions(this.permissions);
        logger.info('[FileReviewService] Default permissions saved (Keep All enabled)');
      }
      return this.permissions;
    } catch (error) {
      logger.error('[FileReviewService] Failed to load permissions', error);
      // Em caso de erro, tenta salvar as permissões padrão
      try {
        await this.savePermissions(this.permissions);
      } catch (saveError) {
        logger.error('[FileReviewService] Failed to save default permissions', saveError);
      }
      return this.permissions;
    }
  }

  /**
   * Salva permissões
   */
  async savePermissions(permissions: Partial<ReviewPermissions>): Promise<void> {
    try {
      this.permissions = { ...this.permissions, ...permissions };
      await AsyncStorage.setItem(STORAGE_KEYS.PERMISSIONS, JSON.stringify(this.permissions));
      logger.info('[FileReviewService] Permissions saved', { allowAll: this.permissions.allowAll });
    } catch (error) {
      logger.error('[FileReviewService] Failed to save permissions', error);
      throw error;
    }
  }

  /**
   * Ativa/desativa "Allow All"
   */
  async setAllowAll(enabled: boolean): Promise<void> {
    await this.savePermissions({ allowAll: enabled });
  }

  /**
   * Cria uma nova sessão de revisão
   */
  async createReviewSession(
    title: string,
    changes: FileChange[],
    description?: string
  ): Promise<ReviewSession> {
    const session: ReviewSession = {
      id: `review_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title,
      description,
      files: changes.map((change) => ({
        id: `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        filePath: change.filePath,
        status: 'pending',
        change,
      })),
      createdAt: Date.now(),
      allowAllEnabled: this.permissions.allowAll,
    };

    this.currentSession = session;
    await this.saveSession(session);
    logger.info('[FileReviewService] Review session created', {
      id: session.id,
      fileCount: session.files.length,
    });

    return session;
  }

  /**
   * Obtém o próximo arquivo pendente para revisão
   */
  getNextPendingFile(): FileReview | null {
    if (!this.currentSession) return null;
    return this.currentSession.files.find((f) => f.status === 'pending') || null;
  }

  /**
   * Aprova um arquivo específico
   */
  async approveFile(fileId: string): Promise<void> {
    if (!this.currentSession) {
      throw new Error('No active review session');
    }

    const file = this.currentSession.files.find((f) => f.id === fileId);
    if (!file) {
      throw new Error(`File review not found: ${fileId}`);
    }

    file.status = 'approved';
    file.reviewedAt = Date.now();
    await this.saveSession(this.currentSession);
    logger.info('[FileReviewService] File approved', { fileId, filePath: file.filePath });
  }

  /**
   * Rejeita um arquivo específico
   */
  async rejectFile(fileId: string): Promise<void> {
    if (!this.currentSession) {
      throw new Error('No active review session');
    }

    const file = this.currentSession.files.find((f) => f.id === fileId);
    if (!file) {
      throw new Error(`File review not found: ${fileId}`);
    }

    file.status = 'rejected';
    file.reviewedAt = Date.now();
    await this.saveSession(this.currentSession);
    logger.info('[FileReviewService] File rejected', { fileId, filePath: file.filePath });
  }

  /**
   * Aprova TODOS os arquivos pendentes (Keep All)
   */
  async approveAll(): Promise<void> {
    if (!this.currentSession) {
      throw new Error('No active review session');
    }

    const pendingFiles = this.currentSession.files.filter((f) => f.status === 'pending');
    const now = Date.now();

    for (const file of pendingFiles) {
      file.status = 'approved';
      file.reviewedAt = now;
    }

    await this.saveSession(this.currentSession);
    logger.info('[FileReviewService] All files approved', { count: pendingFiles.length });
  }

  /**
   * Mantém um arquivo (Keep file) - aprova e avança
   */
  async keepFile(fileId: string): Promise<void> {
    await this.approveFile(fileId);
  }

  /**
   * Revisa o próximo arquivo (Review Next File)
   */
  async reviewNextFile(): Promise<FileReview | null> {
    return this.getNextPendingFile();
  }

  /**
   * Obtém estatísticas da sessão atual
   */
  getSessionStats(): {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    progress: number;
  } {
    if (!this.currentSession) {
      return { total: 0, pending: 0, approved: 0, rejected: 0, progress: 0 };
    }

    const total = this.currentSession.files.length;
    const pending = this.currentSession.files.filter((f) => f.status === 'pending').length;
    const approved = this.currentSession.files.filter((f) => f.status === 'approved').length;
    const rejected = this.currentSession.files.filter((f) => f.status === 'rejected').length;
    const progress = total > 0 ? ((total - pending) / total) * 100 : 0;

    return { total, pending, approved, rejected, progress };
  }

  /**
   * Salva sessão no storage
   */
  private async saveSession(session: ReviewSession): Promise<void> {
    try {
      const sessions = await this.getStoredSessions();
      const index = sessions.findIndex((s) => s.id === session.id);
      if (index >= 0) {
        sessions[index] = session;
      } else {
        sessions.push(session);
      }
      await AsyncStorage.setItem(STORAGE_KEYS.REVIEW_SESSIONS, JSON.stringify(sessions));
    } catch (error) {
      logger.error('[FileReviewService] Failed to save session', error);
      throw error;
    }
  }

  /**
   * Obtém sessões salvas
   */
  private async getStoredSessions(): Promise<ReviewSession[]> {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.REVIEW_SESSIONS);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      logger.error('[FileReviewService] Failed to get stored sessions', error);
      return [];
    }
  }

  /**
   * Finaliza sessão atual
   */
  async completeSession(): Promise<ReviewSession | null> {
    if (!this.currentSession) return null;

    this.currentSession.completedAt = Date.now();
    await this.saveSession(this.currentSession);
    await this.addToHistory(this.currentSession);

    const completed = this.currentSession;
    this.currentSession = null;

    logger.info('[FileReviewService] Session completed', { id: completed.id });
    return completed;
  }

  /**
   * Adiciona à história
   */
  private async addToHistory(session: ReviewSession): Promise<void> {
    try {
      const history = await this.getHistory();
      history.unshift(session);
      // Manter apenas últimas 50 sessões
      const limited = history.slice(0, 50);
      await AsyncStorage.setItem(STORAGE_KEYS.REVIEW_HISTORY, JSON.stringify(limited));
    } catch (error) {
      logger.error('[FileReviewService] Failed to add to history', error);
    }
  }

  /**
   * Obtém histórico
   */
  async getHistory(): Promise<ReviewSession[]> {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.REVIEW_HISTORY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      logger.error('[FileReviewService] Failed to get history', error);
      return [];
    }
  }

  /**
   * Obtém sessão atual
   */
  getCurrentSession(): ReviewSession | null {
    return this.currentSession;
  }
}

export const fileReviewService = FileReviewService.getInstance();
