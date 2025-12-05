/**
 * useGuilt - Hook para gerenciamento de "Desculpa Hoje"
 * Integra com guiltService e gerencia gamificação
 */

import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { guiltService } from '@/services/guiltService';
import { logger } from '@/utils/logger';
import { useSession } from './useSession';
import type {
  GuiltLog,
  GuiltValidation,
  GuiltStats,
  GuiltType,
  Badge,
} from '@/types/guilt';

// ============================================
// TYPES
// ============================================

interface UseGuiltOptions {
  autoFetchStats?: boolean;
  autoCheckBadges?: boolean;
}

interface UseGuiltReturn {
  // Current State
  currentLog: GuiltLog | null;
  selectedGuilt: GuiltType | null;
  intensity: number;
  validation: GuiltValidation | null;
  
  // Stats & Gamification
  stats: GuiltStats | null;
  badges: Badge[];
  newBadges: Badge[];
  isLoadingStats: boolean;
  
  // Actions
  selectGuilt: (guiltType: GuiltType) => Promise<void>;
  logGuilt: (guiltType: GuiltType, intensity: number, customText?: string) => Promise<void>;
  acceptAction: () => Promise<void>;
  shareResult: () => Promise<void>;
  dismissNewBadges: () => void;
  reset: () => void;
  setIntensity: (value: number) => void;
  
  // State flags
  isLoggingGuilt: boolean;
  isValidating: boolean;
  hasAcceptedAction: boolean;
  
  // Similarity stats
  similarityPercentage: number | null;
  similarityCount: number | null;
  
  // Error
  error: Error | null;
}

// ============================================
// HOOK
// ============================================

export function useGuilt(options: UseGuiltOptions = {}): UseGuiltReturn {
  const { autoFetchStats = true, autoCheckBadges = true } = options;
  const queryClient = useQueryClient();
  const { user } = useSession();
  
  // Local state
  const [currentLog, setCurrentLog] = useState<GuiltLog | null>(null);
  const [selectedGuilt, setSelectedGuilt] = useState<GuiltType | null>(null);
  const [intensity, setIntensity] = useState(5);
  const [validation, setValidation] = useState<GuiltValidation | null>(null);
  const [newBadges, setNewBadges] = useState<Badge[]>([]);
  const [hasAcceptedAction, setHasAcceptedAction] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [similarityPercentage, setSimilarityPercentage] = useState<number | null>(null);
  const [similarityCount, setSimilarityCount] = useState<number | null>(null);
  const [error, setError] = useState<Error | null>(null);
  
  // ============================================
  // QUERIES
  // ============================================
  
  // Stats query
  const {
    data: stats,
    isLoading: isLoadingStats,
  } = useQuery({
    queryKey: ['guilt', 'stats', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await guiltService.getStats(user.id);
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id && autoFetchStats,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
  
  // Badges query
  const {
    data: badges,
  } = useQuery({
    queryKey: ['guilt', 'badges', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await guiltService.getUserBadges(user.id);
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
  
  // ============================================
  // MUTATIONS
  // ============================================
  
  const logMutation = useMutation({
    mutationFn: async ({
      guiltType,
      intensity,
      customText,
    }: {
      guiltType: GuiltType;
      intensity: number;
      customText?: string;
    }) => {
      if (!user?.id) throw new Error('User not authenticated');
      const { data, error } = await guiltService.createLog(
        user.id,
        guiltType,
        intensity,
        customText
      );
      if (error) throw error;
      return data;
    },
    onSuccess: (log) => {
      if (log) {
        setCurrentLog(log);
        logger.info('Guilt logged', { logId: log.id, guiltType: log.guiltType });
        
        // Check for new badges if enabled
        if (autoCheckBadges && user?.id) {
          checkForNewBadges();
        }
      }
    },
    onError: (error) => {
      logger.error('Failed to log guilt', error);
      setError(error as Error);
    },
  });
  
  const updateMutation = useMutation({
    mutationFn: async ({
      logId,
      updates,
    }: {
      logId: string;
      updates: {
        actionAccepted?: boolean;
        badgeUnlocked?: string;
        shared?: boolean;
      };
    }) => {
      const { data, error } = await guiltService.updateLog(logId, updates);
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guilt', 'stats'] });
    },
    onError: (error) => {
      logger.error('Failed to update guilt log', error);
      setError(error as Error);
    },
  });
  
  // ============================================
  // HELPER FUNCTIONS
  // ============================================
  
  const fetchValidation = async (guiltType: GuiltType) => {
    setIsValidating(true);
    try {
      const { data, error } = await guiltService.getValidation(guiltType);
      if (error) throw error;
      setValidation(data);
      
      // Fetch similarity stats
      const { data: similarity } = await guiltService.getSimilarityStats(guiltType);
      if (similarity) {
        setSimilarityPercentage(similarity.percentage);
        setSimilarityCount(similarity.count);
      }
    } catch (err) {
      logger.error('Failed to fetch validation', err);
    } finally {
      setIsValidating(false);
    }
  };
  
  const checkForNewBadges = async () => {
    if (!user?.id) return;
    
    try {
      const { data: unlocked } = await guiltService.checkBadges(user.id);
      if (unlocked && unlocked.length > 0) {
        setNewBadges(unlocked);
        queryClient.invalidateQueries({ queryKey: ['guilt', 'badges'] });
        logger.info('New badges unlocked', { count: unlocked.length });
      }
    } catch (err) {
      logger.error('Failed to check badges', err);
    }
  };
  
  // ============================================
  // ACTIONS
  // ============================================
  
  const selectGuilt = useCallback(
    async (guiltType: GuiltType) => {
      setError(null);
      setSelectedGuilt(guiltType);
      await fetchValidation(guiltType);
    },
    []
  );
  
  const logGuilt = useCallback(
    async (guiltType: GuiltType, intensity: number, customText?: string) => {
      setError(null);
      setSelectedGuilt(guiltType);
      setIntensity(intensity);
      await logMutation.mutateAsync({ guiltType, intensity, customText });
      await fetchValidation(guiltType);
    },
    [logMutation]
  );
  
  const acceptAction = useCallback(async () => {
    if (currentLog?.id) {
      await updateMutation.mutateAsync({
        logId: currentLog.id,
        updates: { actionAccepted: true },
      });
      setHasAcceptedAction(true);
      logger.info('Action accepted', { logId: currentLog.id });
    }
  }, [currentLog, updateMutation]);
  
  const shareResult = useCallback(async () => {
    if (currentLog?.id) {
      await updateMutation.mutateAsync({
        logId: currentLog.id,
        updates: { shared: true },
      });
      logger.info('Result shared', { logId: currentLog.id });
    }
  }, [currentLog, updateMutation]);
  
  const dismissNewBadges = useCallback(() => {
    setNewBadges([]);
  }, []);
  
  const reset = useCallback(() => {
    setCurrentLog(null);
    setSelectedGuilt(null);
    setIntensity(5);
    setValidation(null);
    setHasAcceptedAction(false);
    setSimilarityPercentage(null);
    setSimilarityCount(null);
    setError(null);
  }, []);
  
  // ============================================
  // RETURN
  // ============================================
  
  return {
    // Current State
    currentLog,
    selectedGuilt,
    intensity,
    validation,
    
    // Stats & Gamification
    stats: stats || null,
    badges: badges || [],
    newBadges,
    isLoadingStats,
    
    // Actions
    selectGuilt,
    logGuilt,
    acceptAction,
    shareResult,
    dismissNewBadges,
    reset,
    setIntensity,
    
    // State flags
    isLoggingGuilt: logMutation.isPending,
    isValidating,
    hasAcceptedAction,
    
    // Similarity stats
    similarityPercentage,
    similarityCount,
    
    // Error
    error,
  };
}

export default useGuilt;

