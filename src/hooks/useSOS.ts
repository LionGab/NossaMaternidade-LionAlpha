/**
 * useSOS - Hook para gerenciamento de SOS Mãe
 * Integra com sosService e gerencia estado local
 */

import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sosService } from '@/services/sosService';
import { logger } from '@/utils/logger';
import { useSession } from './useSession';
import type {
  SOSInteraction,
  SOSStats,
  SentimentType,
  CommunityTestimonial,
  SentimentAnalysis,
  OutcomeType,
} from '@/types/sos';

// ============================================
// TYPES
// ============================================

interface UseSOSOptions {
  autoFetchStats?: boolean;
}

interface UseSOSReturn {
  // Current Interaction
  currentInteraction: SOSInteraction | null;
  selectedSentiment: SentimentType | null;
  intensity: number;
  analysis: SentimentAnalysis | null;
  testimonial: CommunityTestimonial | null;
  
  // Stats
  stats: SOSStats | null;
  isLoadingStats: boolean;
  
  // Actions
  startInteraction: (sentiment: SentimentType, intensity: number, text?: string) => Promise<void>;
  analyzeText: (text: string) => Promise<SentimentAnalysis | null>;
  fetchTestimonial: (sentiment: SentimentType) => Promise<void>;
  markHelpful: (testimonialId: string) => Promise<void>;
  completeInteraction: (outcome: OutcomeType) => Promise<void>;
  resetInteraction: () => void;
  setIntensity: (value: number) => void;
  setSentiment: (sentiment: SentimentType) => void;
  
  // State
  isAnalyzing: boolean;
  isLoadingTestimonial: boolean;
  
  // Error
  error: Error | null;
}

// ============================================
// HOOK
// ============================================

export function useSOS(options: UseSOSOptions = {}): UseSOSReturn {
  const { autoFetchStats = true } = options;
  const queryClient = useQueryClient();
  const { user } = useSession();
  
  // Local state
  const [currentInteraction, setCurrentInteraction] = useState<SOSInteraction | null>(null);
  const [selectedSentiment, setSelectedSentiment] = useState<SentimentType | null>(null);
  const [intensity, setIntensity] = useState(5);
  const [analysis, setAnalysis] = useState<SentimentAnalysis | null>(null);
  const [testimonial, setTestimonial] = useState<CommunityTestimonial | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isLoadingTestimonial, setIsLoadingTestimonial] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  // Start timestamp for duration tracking
  const [startTime, setStartTime] = useState<number | null>(null);
  
  // ============================================
  // QUERIES
  // ============================================
  
  const {
    data: stats,
    isLoading: isLoadingStats,
  } = useQuery({
    queryKey: ['sos', 'stats', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await sosService.getStats(user.id);
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id && autoFetchStats,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
  
  // ============================================
  // MUTATIONS
  // ============================================
  
  const createMutation = useMutation({
    mutationFn: async ({
      sentiment,
      intensity,
      text,
    }: {
      sentiment: SentimentType;
      intensity: number;
      text?: string;
    }) => {
      if (!user?.id) throw new Error('User not authenticated');
      const { data, error } = await sosService.createInteraction(
        user.id,
        sentiment,
        intensity,
        text
      );
      if (error) throw error;
      return data;
    },
    onSuccess: (interaction) => {
      if (interaction) {
        setCurrentInteraction(interaction);
        setStartTime(Date.now());
        logger.info('SOS interaction started', { interactionId: interaction.id });
      }
    },
    onError: (error) => {
      logger.error('Failed to create SOS interaction', error);
      setError(error as Error);
    },
  });
  
  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      outcome,
      testimonialId,
      shared,
    }: {
      id: string;
      outcome?: OutcomeType;
      testimonialId?: string;
      shared?: boolean;
    }) => {
      const durationSeconds = startTime
        ? Math.round((Date.now() - startTime) / 1000)
        : 0;
      
      const { data, error } = await sosService.updateInteraction(id, {
        durationSeconds,
        outcome,
        testimonialShown: testimonialId,
        shared,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sos', 'stats'] });
    },
    onError: (error) => {
      logger.error('Failed to update SOS interaction', error);
      setError(error as Error);
    },
  });
  
  // ============================================
  // ACTIONS
  // ============================================
  
  const startInteraction = useCallback(
    async (sentiment: SentimentType, intensity: number, text?: string) => {
      setError(null);
      setSelectedSentiment(sentiment);
      setIntensity(intensity);
      await createMutation.mutateAsync({ sentiment, intensity, text });
      await fetchTestimonialInternal(sentiment);
    },
    [createMutation]
  );
  
  const analyzeText = useCallback(async (text: string): Promise<SentimentAnalysis | null> => {
    setIsAnalyzing(true);
    setError(null);
    
    try {
      const { data, error } = await sosService.analyzeSentiment(text);
      if (error) throw error;
      
      if (data) {
        setAnalysis(data);
        setSelectedSentiment(data.sentiment);
        setIntensity(data.intensity);
        
        // Check for urgent help
        if (data.needsUrgentHelp) {
          logger.warn('Urgent help needed', { keywords: data.keywords });
        }
      }
      
      return data;
    } catch (err) {
      logger.error('Failed to analyze sentiment', err);
      setError(err as Error);
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  }, []);
  
  const fetchTestimonialInternal = async (sentiment: SentimentType) => {
    setIsLoadingTestimonial(true);
    try {
      const { data, error } = await sosService.getTestimonial(sentiment);
      if (error) throw error;
      setTestimonial(data);
    } catch (err) {
      logger.error('Failed to fetch testimonial', err);
    } finally {
      setIsLoadingTestimonial(false);
    }
  };
  
  const fetchTestimonial = useCallback(
    async (sentiment: SentimentType) => {
      await fetchTestimonialInternal(sentiment);
    },
    []
  );
  
  const markHelpful = useCallback(
    async (testimonialId: string) => {
      try {
        await sosService.markHelpful(testimonialId);
        logger.info('Testimonial marked as helpful', { testimonialId });
      } catch (err) {
        logger.error('Failed to mark testimonial helpful', err);
      }
    },
    []
  );
  
  const completeInteraction = useCallback(
    async (outcome: OutcomeType) => {
      if (currentInteraction?.id) {
        await updateMutation.mutateAsync({
          id: currentInteraction.id,
          outcome,
          testimonialId: testimonial?.id,
        });
        logger.info('SOS interaction completed', {
          interactionId: currentInteraction.id,
          outcome,
        });
      }
    },
    [currentInteraction, testimonial, updateMutation]
  );
  
  const resetInteraction = useCallback(() => {
    setCurrentInteraction(null);
    setSelectedSentiment(null);
    setIntensity(5);
    setAnalysis(null);
    setTestimonial(null);
    setStartTime(null);
    setError(null);
  }, []);
  
  const setSentiment = useCallback((sentiment: SentimentType) => {
    setSelectedSentiment(sentiment);
  }, []);
  
  // ============================================
  // RETURN
  // ============================================
  
  return {
    // Current Interaction
    currentInteraction,
    selectedSentiment,
    intensity,
    analysis,
    testimonial,
    
    // Stats
    stats: stats || null,
    isLoadingStats,
    
    // Actions
    startInteraction,
    analyzeText,
    fetchTestimonial,
    markHelpful,
    completeInteraction,
    resetInteraction,
    setIntensity,
    setSentiment,
    
    // State
    isAnalyzing,
    isLoadingTestimonial,
    
    // Error
    error,
  };
}

export default useSOS;

