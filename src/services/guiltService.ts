/**
 * Guilt Service - Gerenciamento de "Desculpa Hoje"
 * Integração com Supabase para persistência e gamificação
 */

import { supabase } from './supabase';
import { logger } from '@/utils/logger';
import type {
  GuiltLog,
  GuiltValidation,
  GuiltStats,
  GuiltType,
  Badge,
} from '@/types/guilt';
import { BADGES } from '@/types/guilt';

// ============================================
// TYPES
// ============================================

interface ServiceResult<T> {
  data: T | null;
  error: Error | null;
}

// ============================================
// GUILT LOG MANAGEMENT
// ============================================

/**
 * Registra uma nova "desculpa" de culpa materna
 */
export const createGuiltLog = async (
  userId: string,
  guiltType: GuiltType,
  intensity: number,
  customText?: string
): Promise<ServiceResult<GuiltLog>> => {
  try {
    const log: Omit<GuiltLog, 'id'> = {
      userId,
      guiltType,
      intensity,
      customText,
      timestamp: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('guilt_logs')
      .insert(log)
      .select()
      .single();

    if (error) {
      logger.error('Error creating guilt log', error);
      return { data: null, error };
    }

    logger.info('Guilt log created', {
      logId: data.id,
      guiltType,
      intensity,
    });

    return { data, error: null };
  } catch (error) {
    logger.error('Exception creating guilt log', error);
    return { data: null, error: error as Error };
  }
};

/**
 * Atualiza um log de culpa (ex: ação aceita)
 */
export const updateGuiltLog = async (
  logId: string,
  updates: {
    actionAccepted?: boolean;
    badgeUnlocked?: string;
    shared?: boolean;
  }
): Promise<ServiceResult<GuiltLog>> => {
  try {
    const { data, error } = await supabase
      .from('guilt_logs')
      .update(updates)
      .eq('id', logId)
      .select()
      .single();

    if (error) {
      logger.error('Error updating guilt log', error);
      return { data: null, error };
    }

    logger.info('Guilt log updated', { logId, ...updates });
    return { data, error: null };
  } catch (error) {
    logger.error('Exception updating guilt log', error);
    return { data: null, error: error as Error };
  }
};

// ============================================
// VALIDATION
// ============================================

/**
 * Obtém validação/mensagem empática para um tipo de culpa
 */
export const getGuiltValidation = async (
  guiltType: GuiltType
): Promise<ServiceResult<GuiltValidation>> => {
  try {
    // Primeiro tenta buscar do Supabase (para mensagens personalizadas por IA)
    const { data: customValidation, error } = await supabase
      .from('guilt_validations')
      .select('*')
      .eq('guiltType', guiltType)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (customValidation && !error) {
      return { data: customValidation, error: null };
    }

    // Fallback para validação local
    const validation = getLocalValidation(guiltType);
    return { data: validation, error: null };
  } catch (error) {
    logger.warn('Using local validation fallback', error);
    return { data: getLocalValidation(guiltType), error: null };
  }
};

/**
 * Busca estatísticas de similaridade (quantas mães sentiram o mesmo)
 */
export const getSimilarityStats = async (
  guiltType: GuiltType
): Promise<ServiceResult<{ percentage: number; count: number }>> => {
  try {
    const { count, error } = await supabase
      .from('guilt_logs')
      .select('*', { count: 'exact', head: true })
      .eq('guiltType', guiltType);

    if (error) {
      logger.error('Error fetching similarity stats', error);
      return { data: null, error };
    }

    // Simula porcentagem (em produção, seria baseado em dados reais)
    const percentage = Math.min(95, 70 + Math.floor(Math.random() * 20));

    return {
      data: {
        percentage,
        count: count || 0,
      },
      error: null,
    };
  } catch (error) {
    logger.error('Exception fetching similarity stats', error);
    return { data: null, error: error as Error };
  }
};

// ============================================
// BADGES & GAMIFICATION
// ============================================

/**
 * Verifica e desbloqueia badges elegíveis
 */
export const checkAndUnlockBadges = async (
  userId: string
): Promise<ServiceResult<Badge[]>> => {
  try {
    // Busca logs do usuário na última semana
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    const { data: logs, error: logsError } = await supabase
      .from('guilt_logs')
      .select('*')
      .eq('userId', userId)
      .gte('timestamp', weekAgo);

    if (logsError) {
      logger.error('Error fetching logs for badges', logsError);
      return { data: [], error: logsError };
    }

    // Busca badges já desbloqueados
    const { data: unlockedBadges, error: badgesError } = await supabase
      .from('user_badges')
      .select('badgeId')
      .eq('userId', userId);

    if (badgesError) {
      logger.error('Error fetching unlocked badges', badgesError);
      return { data: [], error: badgesError };
    }

    const unlockedIds = unlockedBadges?.map((b) => b.badgeId) || [];
    const newBadges: Badge[] = [];

    // Verifica cada badge
    for (const badge of BADGES) {
      if (unlockedIds.includes(badge.id)) continue;

      let eligible = false;

      if (badge.requirement.type === 'guilt_count') {
        eligible = (logs?.length || 0) >= badge.requirement.value;
      } else if (badge.requirement.type === 'streak') {
        const streak = calculateStreak(logs || []);
        eligible = streak >= badge.requirement.value;
      }

      if (eligible) {
        // Desbloqueia badge
        const { error: unlockError } = await supabase
          .from('user_badges')
          .insert({
            userId,
            badgeId: badge.id,
            unlockedAt: new Date().toISOString(),
          });

        if (!unlockError) {
          newBadges.push({
            ...badge,
            unlockedAt: new Date().toISOString(),
          });
          logger.info('Badge unlocked', { userId, badgeId: badge.id });
        }
      }
    }

    return { data: newBadges, error: null };
  } catch (error) {
    logger.error('Exception checking badges', error);
    return { data: [], error: error as Error };
  }
};

/**
 * Obtém todos os badges do usuário
 */
export const getUserBadges = async (
  userId: string
): Promise<ServiceResult<Badge[]>> => {
  try {
    const { data, error } = await supabase
      .from('user_badges')
      .select('badgeId, unlockedAt')
      .eq('userId', userId);

    if (error) {
      logger.error('Error fetching user badges', error);
      return { data: [], error };
    }

    const badges = (data || []).map((ub) => {
      const badge = BADGES.find((b) => b.id === ub.badgeId);
      return badge
        ? { ...badge, unlockedAt: ub.unlockedAt }
        : null;
    }).filter(Boolean) as Badge[];

    return { data: badges, error: null };
  } catch (error) {
    logger.error('Exception fetching user badges', error);
    return { data: [], error: error as Error };
  }
};

// ============================================
// STATS
// ============================================

/**
 * Obtém estatísticas de culpa do usuário
 */
export const getGuiltStats = async (
  userId: string
): Promise<ServiceResult<GuiltStats>> => {
  try {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    const { data: logs, error } = await supabase
      .from('guilt_logs')
      .select('*')
      .eq('userId', userId)
      .gte('timestamp', weekAgo)
      .order('timestamp', { ascending: false });

    if (error) {
      logger.error('Error fetching guilt stats', error);
      return { data: null, error };
    }

    // Calcula estatísticas
    const totalThisWeek = logs?.length || 0;
    const streakDays = calculateStreak(logs || []);

    // Encontra culpa mais comum
    const guiltCounts: Record<string, number> = {};
    logs?.forEach((l) => {
      guiltCounts[l.guiltType] = (guiltCounts[l.guiltType] || 0) + 1;
    });

    const mostCommonGuilt = Object.entries(guiltCounts).sort(
      (a, b) => b[1] - a[1]
    )[0]?.[0] as GuiltType;

    // Busca badges desbloqueados
    const { data: badges } = await getUserBadges(userId);

    // Determina tendência
    const previousWeek = new Date(
      Date.now() - 14 * 24 * 60 * 60 * 1000
    ).toISOString();

    const { data: previousLogs } = await supabase
      .from('guilt_logs')
      .select('*')
      .eq('userId', userId)
      .gte('timestamp', previousWeek)
      .lt('timestamp', weekAgo);

    let trend: 'improving' | 'stable' | 'worsening' = 'stable';
    if (previousLogs) {
      if (totalThisWeek < previousLogs.length) trend = 'improving';
      else if (totalThisWeek > previousLogs.length) trend = 'worsening';
    }

    const stats: GuiltStats = {
      totalThisWeek,
      mostCommonGuilt: mostCommonGuilt || 'outro',
      streakDays,
      badgesUnlocked: badges?.map((b) => b.id) || [],
      trend,
    };

    return { data: stats, error: null };
  } catch (error) {
    logger.error('Exception fetching guilt stats', error);
    return { data: null, error: error as Error };
  }
};

// ============================================
// HELPER FUNCTIONS
// ============================================

const calculateStreak = (logs: GuiltLog[]): number => {
  if (logs.length === 0) return 0;

  const dates = logs
    .map((l) => new Date(l.timestamp).toDateString())
    .filter((v, i, a) => a.indexOf(v) === i)
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  let streak = 1;
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();

  if (dates[0] !== today && dates[0] !== yesterday) {
    return 0;
  }

  for (let i = 1; i < dates.length; i++) {
    const current = new Date(dates[i - 1]);
    const prev = new Date(dates[i]);
    const diffDays = Math.round(
      (current.getTime() - prev.getTime()) / 86400000
    );

    if (diffDays === 1) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
};

const getLocalValidation = (guiltType: GuiltType): GuiltValidation => {
  const messages: Record<GuiltType, string> = {
    gritei_com_filho:
      'Gritar não te define. Você é humana, e humanos têm limites. O importante é o que você faz depois.',
    nao_brinquei_suficiente:
      'Presença não é medida em minutos. O amor que você dá está em cada olhar, cada abraço.',
    deixei_na_tv:
      'A TV não é inimiga. Às vezes você precisa de um momento, e isso é completamente válido.',
    perdi_paciencia:
      'Paciência não é infinita. Reconhecer quando ela acaba já é um ato de consciência.',
    nao_refeicao_saudavel:
      'Alimentação perfeita não existe. Seu filho está sendo nutrido de amor.',
    nao_brinquei_fora:
      'Nem todo dia é dia de parque. Estar presente de outras formas também conta.',
    usei_celular_demais:
      'O celular às vezes é uma válvula de escape necessária. Não se culpe por precisar respirar.',
    nao_li_historia:
      'Histórias podem ser contadas de mil formas. Conversar também é contar histórias.',
    outro:
      'Qualquer que seja sua "culpa", ela não te define. Você está fazendo o melhor que pode.',
  };

  const actions: Record<GuiltType, string> = {
    gritei_com_filho: 'Respire fundo, abrace seu filho e diga "eu te amo".',
    nao_brinquei_suficiente: 'Que tal 5 minutos de qualidade agora? Um abraço vale muito.',
    deixei_na_tv: 'Sente ao lado dele por 2 minutos. Só isso já é presença.',
    perdi_paciencia: 'Peça desculpas. Crianças entendem mais do que imaginamos.',
    nao_refeicao_saudavel: 'Na próxima refeição, adicione uma fruta. Pequenos passos.',
    nao_brinquei_fora: 'Abra a janela juntos, olhem o céu. Conexão com a natureza.',
    usei_celular_demais: 'Deixe o celular de lado por 10 minutos. Olhe nos olhos dele.',
    nao_li_historia: 'Invente uma história agora. Não precisa ser perfeita.',
    outro: 'Respire fundo. Você está fazendo o seu melhor.',
  };

  return {
    guiltType,
    normalizePercentage: Math.floor(Math.random() * 20) + 70,
    similarCount: Math.floor(Math.random() * 50000) + 10000,
    message: messages[guiltType],
    suggestedAction: actions[guiltType],
    badgeEligible: Math.random() > 0.5,
  };
};

// ============================================
// EXPORT
// ============================================

export const guiltService = {
  createLog: createGuiltLog,
  updateLog: updateGuiltLog,
  getValidation: getGuiltValidation,
  getSimilarityStats,
  checkBadges: checkAndUnlockBadges,
  getUserBadges,
  getStats: getGuiltStats,
};

export default guiltService;

