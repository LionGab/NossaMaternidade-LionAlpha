/**
 * useRitual - Hook para gerenciamento de Rituais de Reconexão
 * Integra com ritualService e gerencia estado local
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ritualService } from '@/services/ritualService';
import { logger } from '@/utils/logger';
import { useSession } from './useSession';
import type {
  RitualSession,
  RitualStats,
  EmotionState,
  RitualStepType,
  RitualPhase,
  AmbientSoundType,
} from '@/types/ritual';

// ============================================
// TYPES
// ============================================

interface UseRitualOptions {
  autoFetchStats?: boolean;
}

interface UseRitualReturn {
  // Session State
  currentSession: RitualSession | null;
  currentPhase: RitualPhase;
  emotionBefore: EmotionState | null;
  emotionAfter: EmotionState | null;
  elapsedTime: number;
  
  // Stats
  stats: RitualStats | null;
  isLoadingStats: boolean;
  
  // Actions
  startRitual: (emotion: EmotionState, sound?: AmbientSoundType) => Promise<void>;
  completeStep: (step: RitualStepType) => Promise<void>;
  completeRitual: (emotion: EmotionState) => Promise<void>;
  cancelRitual: () => void;
  setPhase: (phase: RitualPhase) => void;
  
  // History
  history: RitualSession[];
  isLoadingHistory: boolean;
  
  // Error handling
  error: Error | null;
}

// ============================================
// HOOK
// ============================================

export function useRitual(options: UseRitualOptions = {}): UseRitualReturn {
  const { autoFetchStats = true } = options;
  const queryClient = useQueryClient();
  const { user } = useSession();
  
  // Local state
  const [currentSession, setCurrentSession] = useState<RitualSession | null>(null);
  const [currentPhase, setCurrentPhase] = useState<RitualPhase>('idle');
  const [emotionBefore, setEmotionBefore] = useState<EmotionState | null>(null);
  const [emotionAfter, setEmotionAfter] = useState<EmotionState | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [error, setError] = useState<Error | null>(null);
  
  // Timer ref
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  
  // ============================================
  // QUERIES
  // ============================================
  
  // Stats query
  const {
    data: stats,
    isLoading: isLoadingStats,
  } = useQuery({
    queryKey: ['ritual', 'stats', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await ritualService.getStats(user.id);
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id && autoFetchStats,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
  
  // History query
  const {
    data: history,
    isLoading: isLoadingHistory,
  } = useQuery({
    queryKey: ['ritual', 'history', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await ritualService.getHistory(user.id);
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5,
  });
  
  // ============================================
  // MUTATIONS
  // ============================================
  
  const startMutation = useMutation({
    mutationFn: async ({
      emotion,
      sound,
    }: {
      emotion: EmotionState;
      sound?: AmbientSoundType;
    }) => {
      if (!user?.id) throw new Error('User not authenticated');
      const { data, error } = await ritualService.startSession(
        user.id,
        emotion,
        sound
      );
      if (error) throw error;
      return data;
    },
    onSuccess: (session) => {
      if (session) {
        setCurrentSession(session);
        setCurrentPhase('running');
        setEmotionBefore(session.emotionBefore);
        startTimer();
        logger.info('Ritual started', { sessionId: session.id });
      }
    },
    onError: (error) => {
      logger.error('Failed to start ritual', error);
      setError(error as Error);
    },
  });
  
  const stepMutation = useMutation({
    mutationFn: async (step: RitualStepType) => {
      if (!currentSession?.id) throw new Error('No active session');
      const { data, error } = await ritualService.completeStep(
        currentSession.id,
        step
      );
      if (error) throw error;
      return data;
    },
    onSuccess: (session) => {
      if (session) {
        setCurrentSession(session);
      }
    },
    onError: (error) => {
      logger.error('Failed to complete step', error);
      setError(error as Error);
    },
  });
  
  const completeMutation = useMutation({
    mutationFn: async (emotion: EmotionState) => {
      if (!currentSession?.id) throw new Error('No active session');
      const { data, error } = await ritualService.completeSession(
        currentSession.id,
        emotion,
        elapsedTime
      );
      if (error) throw error;
      return data;
    },
    onSuccess: (session) => {
      if (session) {
        setEmotionAfter(session.emotionAfter || null);
        setCurrentPhase('completed');
        stopTimer();
        
        // Invalidate queries
        queryClient.invalidateQueries({ queryKey: ['ritual', 'stats'] });
        queryClient.invalidateQueries({ queryKey: ['ritual', 'history'] });
        
        logger.info('Ritual completed', {
          sessionId: session.id,
          duration: elapsedTime,
        });
      }
    },
    onError: (error) => {
      logger.error('Failed to complete ritual', error);
      setError(error as Error);
    },
  });
  
  // ============================================
  // TIMER FUNCTIONS
  // ============================================
  
  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);
  }, []);
  
  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);
  
  // ============================================
  // ACTIONS
  // ============================================
  
  const startRitual = useCallback(
    async (emotion: EmotionState, sound?: AmbientSoundType) => {
      setError(null);
      setElapsedTime(0);
      await startMutation.mutateAsync({ emotion, sound });
    },
    [startMutation]
  );
  
  const completeStep = useCallback(
    async (step: RitualStepType) => {
      await stepMutation.mutateAsync(step);
    },
    [stepMutation]
  );
  
  const completeRitual = useCallback(
    async (emotion: EmotionState) => {
      await completeMutation.mutateAsync(emotion);
    },
    [completeMutation]
  );
  
  const cancelRitual = useCallback(() => {
    stopTimer();
    setCurrentSession(null);
    setCurrentPhase('idle');
    setEmotionBefore(null);
    setEmotionAfter(null);
    setElapsedTime(0);
    setError(null);
    logger.info('Ritual cancelled');
  }, [stopTimer]);
  
  const setPhase = useCallback((phase: RitualPhase) => {
    setCurrentPhase(phase);
  }, []);
  
  // ============================================
  // RETURN
  // ============================================
  
  return {
    // Session State
    currentSession,
    currentPhase,
    emotionBefore,
    emotionAfter,
    elapsedTime,
    
    // Stats
    stats: stats || null,
    isLoadingStats,
    
    // Actions
    startRitual,
    completeStep,
    completeRitual,
    cancelRitual,
    setPhase,
    
    // History
    history: history || [],
    isLoadingHistory,
    
    // Error
    error,
  };
}

export default useRitual;

