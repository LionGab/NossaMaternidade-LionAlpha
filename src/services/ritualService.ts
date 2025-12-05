/**
 * Ritual Service - Gerenciamento de Rituais de Reconexão
 * Integração com Supabase para persistência de sessões
 */

import { supabase } from './supabase';
import { logger } from '@/utils/logger';
import type {
  RitualSession,
  RitualStats,
  EmotionState,
  RitualStepType,
  AmbientSoundType,
} from '@/types/ritual';

// ============================================
// TYPES
// ============================================

interface ServiceResult<T> {
  data: T | null;
  error: Error | null;
}

// ============================================
// RITUAL SESSION MANAGEMENT
// ============================================

/**
 * Inicia uma nova sessão de ritual
 */
export const startRitualSession = async (
  userId: string,
  emotionBefore: EmotionState,
  ambientSound?: AmbientSoundType
): Promise<ServiceResult<RitualSession>> => {
  try {
    const session: Omit<RitualSession, 'id'> = {
      userId,
      startTime: new Date().toISOString(),
      emotionBefore,
      stepsCompleted: [],
      totalDuration: 0,
      ambientSound,
    };

    const { data, error } = await supabase
      .from('ritual_sessions')
      .insert(session)
      .select()
      .single();

    if (error) {
      logger.error('Error starting ritual session', error);
      return { data: null, error };
    }

    logger.info('Ritual session started', { sessionId: data.id });
    return { data, error: null };
  } catch (error) {
    logger.error('Exception starting ritual session', error);
    return { data: null, error: error as Error };
  }
};

/**
 * Completa um passo do ritual
 */
export const completeRitualStep = async (
  sessionId: string,
  stepType: RitualStepType
): Promise<ServiceResult<RitualSession>> => {
  try {
    // Primeiro, busca a sessão atual
    const { data: currentSession, error: fetchError } = await supabase
      .from('ritual_sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (fetchError || !currentSession) {
      logger.error('Error fetching ritual session', fetchError);
      return { data: null, error: fetchError };
    }

    // Atualiza os passos completados
    const updatedSteps = [...(currentSession.stepsCompleted || []), stepType];

    const { data, error } = await supabase
      .from('ritual_sessions')
      .update({ stepsCompleted: updatedSteps })
      .eq('id', sessionId)
      .select()
      .single();

    if (error) {
      logger.error('Error completing ritual step', error);
      return { data: null, error };
    }

    logger.info('Ritual step completed', { sessionId, stepType });
    return { data, error: null };
  } catch (error) {
    logger.error('Exception completing ritual step', error);
    return { data: null, error: error as Error };
  }
};

/**
 * Finaliza uma sessão de ritual
 */
export const completeRitualSession = async (
  sessionId: string,
  emotionAfter: EmotionState,
  totalDuration: number
): Promise<ServiceResult<RitualSession>> => {
  try {
    const { data, error } = await supabase
      .from('ritual_sessions')
      .update({
        endTime: new Date().toISOString(),
        emotionAfter,
        totalDuration,
      })
      .eq('id', sessionId)
      .select()
      .single();

    if (error) {
      logger.error('Error completing ritual session', error);
      return { data: null, error };
    }

    logger.info('Ritual session completed', {
      sessionId,
      duration: totalDuration,
      emotionBefore: data.emotionBefore?.emotion,
      emotionAfter: emotionAfter.emotion,
    });

    return { data, error: null };
  } catch (error) {
    logger.error('Exception completing ritual session', error);
    return { data: null, error: error as Error };
  }
};

// ============================================
// RITUAL STATS
// ============================================

/**
 * Obtém estatísticas de rituais do usuário
 */
export const getRitualStats = async (
  userId: string
): Promise<ServiceResult<RitualStats>> => {
  try {
    const { data: sessions, error } = await supabase
      .from('ritual_sessions')
      .select('*')
      .eq('userId', userId)
      .not('endTime', 'is', null)
      .order('startTime', { ascending: false });

    if (error) {
      logger.error('Error fetching ritual stats', error);
      return { data: null, error };
    }

    if (!sessions || sessions.length === 0) {
      return {
        data: {
          totalSessions: 0,
          totalMinutes: 0,
          currentStreak: 0,
          longestStreak: 0,
          averageEmotionImprovement: 0,
        },
        error: null,
      };
    }

    // Calcula estatísticas
    const totalSessions = sessions.length;
    const totalMinutes = Math.round(
      sessions.reduce((sum, s) => sum + (s.totalDuration || 0), 0) / 60
    );

    // Calcula streak (dias consecutivos)
    const { currentStreak, longestStreak } = calculateStreak(sessions);

    // Calcula melhoria média de emoção
    const averageEmotionImprovement = calculateAverageEmotionImprovement(sessions);

    // Encontra passo favorito
    const favoriteStep = findFavoriteStep(sessions);

    const stats: RitualStats = {
      totalSessions,
      totalMinutes,
      currentStreak,
      longestStreak,
      averageEmotionImprovement,
      favoriteStep,
      lastSessionDate: sessions[0]?.startTime,
    };

    return { data: stats, error: null };
  } catch (error) {
    logger.error('Exception fetching ritual stats', error);
    return { data: null, error: error as Error };
  }
};

/**
 * Obtém histórico de sessões de ritual
 */
export const getRitualHistory = async (
  userId: string,
  limit = 10
): Promise<ServiceResult<RitualSession[]>> => {
  try {
    const { data, error } = await supabase
      .from('ritual_sessions')
      .select('*')
      .eq('userId', userId)
      .not('endTime', 'is', null)
      .order('startTime', { ascending: false })
      .limit(limit);

    if (error) {
      logger.error('Error fetching ritual history', error);
      return { data: null, error };
    }

    return { data: data || [], error: null };
  } catch (error) {
    logger.error('Exception fetching ritual history', error);
    return { data: null, error: error as Error };
  }
};

// ============================================
// HELPER FUNCTIONS
// ============================================

const calculateStreak = (
  sessions: RitualSession[]
): { currentStreak: number; longestStreak: number } => {
  if (sessions.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  const dates = sessions
    .map((s) => new Date(s.startTime).toDateString())
    .filter((v, i, a) => a.indexOf(v) === i); // Unique dates

  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 1;

  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();

  // Check if streak is current
  if (dates[0] === today || dates[0] === yesterday) {
    currentStreak = 1;
  }

  for (let i = 1; i < dates.length; i++) {
    const current = new Date(dates[i - 1]);
    const prev = new Date(dates[i]);
    const diffDays = Math.round(
      (current.getTime() - prev.getTime()) / 86400000
    );

    if (diffDays === 1) {
      tempStreak++;
      if (i === dates.length - 1 || currentStreak > 0) {
        currentStreak = Math.max(currentStreak, tempStreak);
      }
    } else {
      longestStreak = Math.max(longestStreak, tempStreak);
      tempStreak = 1;
    }
  }

  longestStreak = Math.max(longestStreak, tempStreak, currentStreak);

  return { currentStreak, longestStreak };
};

const EMOTION_VALUES: Record<string, number> = {
  '😴': 1,
  '😢': 2,
  '😰': 3,
  '😊': 4,
  '🥰': 5,
};

const calculateAverageEmotionImprovement = (
  sessions: RitualSession[]
): number => {
  const improvements = sessions
    .filter((s) => s.emotionBefore && s.emotionAfter)
    .map((s) => {
      const before = EMOTION_VALUES[s.emotionBefore.emotion] || 3;
      const after = EMOTION_VALUES[s.emotionAfter!.emotion] || 3;
      return after - before;
    });

  if (improvements.length === 0) return 0;

  return (
    Math.round(
      (improvements.reduce((sum, i) => sum + i, 0) / improvements.length) * 10
    ) / 10
  );
};

const findFavoriteStep = (
  sessions: RitualSession[]
): RitualStepType | undefined => {
  const stepCounts: Record<string, number> = {};

  sessions.forEach((s) => {
    (s.stepsCompleted || []).forEach((step) => {
      stepCounts[step] = (stepCounts[step] || 0) + 1;
    });
  });

  const sorted = Object.entries(stepCounts).sort((a, b) => b[1] - a[1]);
  return sorted[0]?.[0] as RitualStepType | undefined;
};

// ============================================
// EXPORT
// ============================================

export const ritualService = {
  startSession: startRitualSession,
  completeStep: completeRitualStep,
  completeSession: completeRitualSession,
  getStats: getRitualStats,
  getHistory: getRitualHistory,
};

export default ritualService;

