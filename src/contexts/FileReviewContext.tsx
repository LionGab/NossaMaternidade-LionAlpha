/**
 * File Review Context
 * Context global para gerenciar revisão de arquivos
 */

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

import { fileReviewService } from '../services/fileReviewService';
import type { FileReview, ReviewSession, ReviewPermissions, FileChange } from '../types/fileReview';
import { logger } from '../utils/logger';

interface FileReviewContextValue {
  // Estado
  currentSession: ReviewSession | null;
  currentFile: FileReview | null;
  permissions: ReviewPermissions;
  loading: boolean;

  // Ações
  createSession: (title: string, changes: FileChange[], description?: string) => Promise<void>;
  approveFile: (fileId: string) => Promise<void>;
  rejectFile: (fileId: string) => Promise<void>;
  approveAll: () => Promise<void>;
  keepFile: (fileId: string) => Promise<void>;
  reviewNextFile: () => Promise<void>;
  setAllowAll: (enabled: boolean) => Promise<void>;
  completeSession: () => Promise<void>;
  getStats: () => {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    progress: number;
  };
}

const FileReviewContext = createContext<FileReviewContextValue | undefined>(undefined);

interface FileReviewProviderProps {
  children: ReactNode;
}

export function FileReviewProvider({ children }: FileReviewProviderProps) {
  const [currentSession, setCurrentSession] = useState<ReviewSession | null>(null);
  const [currentFile, setCurrentFile] = useState<FileReview | null>(null);
  const [permissions, setPermissions] = useState<ReviewPermissions>({
    allowAll: true, // Keep All ativado por padrão
    autoApprove: false,
    requireReview: true,
    allowedAgents: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function initialize() {
      try {
        const loadedPermissions = await fileReviewService.loadPermissions();
        setPermissions(loadedPermissions);

        // Tentar restaurar sessão atual
        const session = fileReviewService.getCurrentSession();
        if (session) {
          setCurrentSession(session);
          setCurrentFile(fileReviewService.getNextPendingFile());
        }

        setLoading(false);
        logger.info('[FileReviewContext] Initialized');
      } catch (error) {
        logger.error('[FileReviewContext] Initialization failed', error);
        setLoading(false);
      }
    }

    initialize();
  }, []);

  const createSession = async (
    title: string,
    changes: FileChange[],
    description?: string
  ): Promise<void> => {
    try {
      const session = await fileReviewService.createReviewSession(title, changes, description);
      setCurrentSession(session);
      setCurrentFile(fileReviewService.getNextPendingFile());
    } catch (error) {
      logger.error('[FileReviewContext] Failed to create session', error);
      throw error;
    }
  };

  const approveFile = async (fileId: string): Promise<void> => {
    try {
      await fileReviewService.approveFile(fileId);
      const nextFile = fileReviewService.getNextPendingFile();
      setCurrentFile(nextFile);
      // Atualizar sessão
      if (currentSession) {
        const updated = currentSession.files.map((f) =>
          f.id === fileId ? { ...f, status: 'approved' as const, reviewedAt: Date.now() } : f
        );
        setCurrentSession({ ...currentSession, files: updated });
      }
    } catch (error) {
      logger.error('[FileReviewContext] Failed to approve file', error);
      throw error;
    }
  };

  const rejectFile = async (fileId: string): Promise<void> => {
    try {
      await fileReviewService.rejectFile(fileId);
      const nextFile = fileReviewService.getNextPendingFile();
      setCurrentFile(nextFile);
      // Atualizar sessão
      if (currentSession) {
        const updated = currentSession.files.map((f) =>
          f.id === fileId ? { ...f, status: 'rejected' as const, reviewedAt: Date.now() } : f
        );
        setCurrentSession({ ...currentSession, files: updated });
      }
    } catch (error) {
      logger.error('[FileReviewContext] Failed to reject file', error);
      throw error;
    }
  };

  const approveAll = async (): Promise<void> => {
    try {
      await fileReviewService.approveAll();
      setCurrentFile(null); // Não há mais arquivos pendentes
      // Atualizar sessão
      if (currentSession) {
        const updated = currentSession.files.map((f) =>
          f.status === 'pending' ? { ...f, status: 'approved' as const, reviewedAt: Date.now() } : f
        );
        setCurrentSession({ ...currentSession, files: updated });
      }
    } catch (error) {
      logger.error('[FileReviewContext] Failed to approve all', error);
      throw error;
    }
  };

  const keepFile = async (fileId: string): Promise<void> => {
    await approveFile(fileId);
  };

  const reviewNextFile = async (): Promise<void> => {
    try {
      const nextFile = await fileReviewService.reviewNextFile();
      setCurrentFile(nextFile);
    } catch (error) {
      logger.error('[FileReviewContext] Failed to review next file', error);
      throw error;
    }
  };

  const setAllowAll = async (enabled: boolean): Promise<void> => {
    try {
      await fileReviewService.setAllowAll(enabled);
      setPermissions((prev) => ({ ...prev, allowAll: enabled }));
    } catch (error) {
      logger.error('[FileReviewContext] Failed to set allow all', error);
      throw error;
    }
  };

  const completeSession = async (): Promise<void> => {
    try {
      await fileReviewService.completeSession();
      setCurrentSession(null);
      setCurrentFile(null);
    } catch (error) {
      logger.error('[FileReviewContext] Failed to complete session', error);
      throw error;
    }
  };

  const getStats = () => {
    return fileReviewService.getSessionStats();
  };

  const value: FileReviewContextValue = {
    currentSession,
    currentFile,
    permissions,
    loading,
    createSession,
    approveFile,
    rejectFile,
    approveAll,
    keepFile,
    reviewNextFile,
    setAllowAll,
    completeSession,
    getStats,
  };

  return <FileReviewContext.Provider value={value}>{children}</FileReviewContext.Provider>;
}

export function useFileReview() {
  const context = useContext(FileReviewContext);
  if (context === undefined) {
    throw new Error('useFileReview must be used within FileReviewProvider');
  }
  return context;
}
