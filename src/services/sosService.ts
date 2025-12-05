/**
 * SOS Service - Gerenciamento de interações SOS Mãe
 * Integração com Supabase para persistência e analytics
 */

import { supabase } from './supabase';
import { logger } from '@/utils/logger';
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

interface ServiceResult<T> {
  data: T | null;
  error: Error | null;
}

// ============================================
// SOS INTERACTION MANAGEMENT
// ============================================

/**
 * Registra uma nova interação SOS
 */
export const createSOSInteraction = async (
  userId: string,
  sentiment: SentimentType,
  intensity: number,
  inputText?: string
): Promise<ServiceResult<SOSInteraction>> => {
  try {
    const interaction: Omit<SOSInteraction, 'id'> = {
      userId,
      sentiment,
      intensity,
      emotionCode: `${sentiment}_${intensity}`,
      inputText,
      timestamp: new Date().toISOString(),
      durationSeconds: 0,
    };

    const { data, error } = await supabase
      .from('sos_interactions')
      .insert(interaction)
      .select()
      .single();

    if (error) {
      logger.error('Error creating SOS interaction', error);
      return { data: null, error };
    }

    logger.info('SOS interaction created', {
      interactionId: data.id,
      sentiment,
      intensity,
    });

    return { data, error: null };
  } catch (error) {
    logger.error('Exception creating SOS interaction', error);
    return { data: null, error: error as Error };
  }
};

/**
 * Atualiza uma interação SOS (ao finalizar)
 */
export const updateSOSInteraction = async (
  interactionId: string,
  updates: {
    durationSeconds?: number;
    outcome?: OutcomeType;
    testimonialShown?: string;
    shared?: boolean;
  }
): Promise<ServiceResult<SOSInteraction>> => {
  try {
    const { data, error } = await supabase
      .from('sos_interactions')
      .update(updates)
      .eq('id', interactionId)
      .select()
      .single();

    if (error) {
      logger.error('Error updating SOS interaction', error);
      return { data: null, error };
    }

    logger.info('SOS interaction updated', { interactionId, ...updates });
    return { data, error: null };
  } catch (error) {
    logger.error('Exception updating SOS interaction', error);
    return { data: null, error: error as Error };
  }
};

// ============================================
// TESTIMONIALS
// ============================================

/**
 * Busca testemunho de comunidade por sentimento
 */
export const getTestimonialBySentiment = async (
  sentiment: SentimentType
): Promise<ServiceResult<CommunityTestimonial>> => {
  try {
    const { data, error } = await supabase
      .from('community_testimonials')
      .select('*')
      .eq('sentiment', sentiment)
      .eq('approved', true)
      .order('helpedCount', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      // Se não encontrou, usa fallback local
      logger.warn('No testimonial found, using fallback', { sentiment });
      return {
        data: getFallbackTestimonial(sentiment),
        error: null,
      };
    }

    return { data, error: null };
  } catch (error) {
    logger.error('Exception fetching testimonial', error);
    return {
      data: getFallbackTestimonial(sentiment),
      error: null,
    };
  }
};

/**
 * Incrementa contador de "ajudou" em testemunho
 */
export const markTestimonialHelpful = async (
  testimonialId: string
): Promise<ServiceResult<boolean>> => {
  try {
    const { error } = await supabase.rpc('increment_testimonial_helped_count', {
      testimonial_id: testimonialId,
    });

    if (error) {
      logger.error('Error marking testimonial helpful', error);
      return { data: false, error };
    }

    return { data: true, error: null };
  } catch (error) {
    logger.error('Exception marking testimonial helpful', error);
    return { data: false, error: error as Error };
  }
};

// ============================================
// SENTIMENT ANALYSIS
// ============================================

/**
 * Analisa texto para detectar sentimento e intensidade
 */
export const analyzeSentiment = async (
  text: string
): Promise<ServiceResult<SentimentAnalysis>> => {
  try {
    // Keywords para cada sentimento
    const sentimentKeywords: Record<SentimentType, string[]> = {
      sobrecarregada: ['cansada', 'exausta', 'esgotada', 'muito', 'demais', 'não aguento'],
      ansiosa: ['ansiedade', 'ansiosa', 'nervosa', 'preocupada', 'medo', 'pânico'],
      triste: ['triste', 'chorar', 'chorando', 'deprimida', 'desanimada', 'infeliz'],
      irritada: ['raiva', 'irritada', 'brava', 'estressada', 'nervos', 'explodir'],
      sozinha: ['sozinha', 'solidão', 'ninguém', 'abandona', 'isolada'],
      desesperada: ['desespero', 'desesperada', 'não sei mais', 'fim', 'suicídio', 'morrer'],
      culpada: ['culpa', 'culpada', 'errei', 'fracasso', 'má mãe', 'falha'],
      cansada: ['cansada', 'exausta', 'sono', 'dormir', 'noite', 'acordar'],
    };

    const urgentKeywords = ['suicídio', 'morrer', 'me matar', 'desistir', 'não aguento mais'];

    const textLower = text.toLowerCase();
    const detectedKeywords: string[] = [];
    let detectedSentiment: SentimentType = 'cansada';
    let maxMatches = 0;

    // Detecta sentimento predominante
    for (const [sentiment, keywords] of Object.entries(sentimentKeywords)) {
      const matches = keywords.filter((k) => textLower.includes(k));
      if (matches.length > maxMatches) {
        maxMatches = matches.length;
        detectedSentiment = sentiment as SentimentType;
        detectedKeywords.push(...matches);
      }
    }

    // Calcula intensidade (1-10)
    const intensity = Math.min(10, Math.max(1, 3 + maxMatches * 2));

    // Verifica se precisa de ajuda urgente
    const needsUrgentHelp = urgentKeywords.some((k) => textLower.includes(k));

    const analysis: SentimentAnalysis = {
      sentiment: detectedSentiment,
      intensity,
      keywords: detectedKeywords,
      needsUrgentHelp,
      suggestedResources: needsUrgentHelp
        ? ['CVV - 188', 'SAMU - 192']
        : undefined,
    };

    logger.info('Sentiment analyzed', {
      sentiment: detectedSentiment,
      intensity,
      needsUrgentHelp,
    });

    return { data: analysis, error: null };
  } catch (error) {
    logger.error('Exception analyzing sentiment', error);
    return { data: null, error: error as Error };
  }
};

// ============================================
// STATS
// ============================================

/**
 * Obtém estatísticas de uso do SOS
 */
export const getSOSStats = async (
  userId: string
): Promise<ServiceResult<SOSStats>> => {
  try {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString();
    const startOfWeek = new Date(
      today.setDate(today.getDate() - today.getDay())
    ).toISOString();

    // Busca interações do usuário
    const { data: interactions, error } = await supabase
      .from('sos_interactions')
      .select('*')
      .eq('userId', userId)
      .gte('timestamp', startOfWeek);

    if (error) {
      logger.error('Error fetching SOS stats', error);
      return { data: null, error };
    }

    const todayInteractions = interactions?.filter(
      (i) => i.timestamp >= startOfDay
    );

    // Encontra sentimento mais comum
    const sentimentCounts: Record<string, number> = {};
    interactions?.forEach((i) => {
      sentimentCounts[i.sentiment] = (sentimentCounts[i.sentiment] || 0) + 1;
    });

    const mostCommonSentiment = Object.entries(sentimentCounts).sort(
      (a, b) => b[1] - a[1]
    )[0]?.[0] as SentimentType;

    // Calcula média de intensidade
    const avgIntensity =
      interactions && interactions.length > 0
        ? Math.round(
            interactions.reduce((sum, i) => sum + i.intensity, 0) /
              interactions.length
          )
        : 0;

    // Conta outcomes positivos
    const positiveOutcomes =
      interactions?.filter(
        (i) =>
          i.outcome === 'calmed' ||
          i.outcome === 'talked_to_someone' ||
          i.outcome === 'sought_help'
      ).length || 0;

    const stats: SOSStats = {
      usesToday: todayInteractions?.length || 0,
      usesThisWeek: interactions?.length || 0,
      mostCommonSentiment: mostCommonSentiment || 'cansada',
      averageIntensity: avgIntensity,
      positiveOutcomes,
    };

    return { data: stats, error: null };
  } catch (error) {
    logger.error('Exception fetching SOS stats', error);
    return { data: null, error: error as Error };
  }
};

// ============================================
// FALLBACK DATA
// ============================================

const getFallbackTestimonial = (sentiment: SentimentType): CommunityTestimonial => {
  const testimonials: Record<SentimentType, CommunityTestimonial> = {
    sobrecarregada: {
      id: 'fallback_1',
      authorName: 'Maria',
      authorInitials: 'MA',
      sentiment: 'sobrecarregada',
      message:
        'Eu me sentia assim todos os dias. Achava que era só comigo. Descobrir que outras mães também se sentem assim foi libertador. Você não está falhando, você está vivendo a maternidade real.',
      helpedCount: 1234,
      createdAt: new Date().toISOString(),
      isAnonymous: false,
    },
    ansiosa: {
      id: 'fallback_2',
      authorName: 'Ana',
      authorInitials: 'AN',
      sentiment: 'ansiosa',
      message:
        'A ansiedade me consumia. Mas aprendi que ela não me define. Pequenos passos, como respirar fundo e pedir ajuda, fizeram toda diferença. Você também vai conseguir.',
      helpedCount: 987,
      createdAt: new Date().toISOString(),
      isAnonymous: false,
    },
    triste: {
      id: 'fallback_3',
      authorName: '',
      authorInitials: '',
      sentiment: 'triste',
      message:
        'A tristeza da maternidade é real e pouco falada. Não é frescura, não é falta de amor. É exaustão, é saudade de si mesma. Sinta, chore, e depois levante. Você é mais forte do que imagina.',
      helpedCount: 2156,
      createdAt: new Date().toISOString(),
      isAnonymous: true,
    },
    irritada: {
      id: 'fallback_4',
      authorName: 'Carla',
      authorInitials: 'CA',
      sentiment: 'irritada',
      message:
        'Perdi a conta de quantas vezes gritei e me arrependi. A raiva é um sinal de que você precisa de uma pausa. Não se culpe, se cuide.',
      helpedCount: 876,
      createdAt: new Date().toISOString(),
      isAnonymous: false,
    },
    sozinha: {
      id: 'fallback_5',
      authorName: '',
      authorInitials: '',
      sentiment: 'sozinha',
      message:
        'Rodeada de gente e ainda assim sozinha. Essa solidão da maternidade dói. Mas olha, você encontrou este app, e aqui tem milhares de mães que entendem. Estamos juntas.',
      helpedCount: 3421,
      createdAt: new Date().toISOString(),
      isAnonymous: true,
    },
    desesperada: {
      id: 'fallback_6',
      authorName: 'Julia',
      authorInitials: 'JU',
      sentiment: 'desesperada',
      message:
        'Eu estava no fundo do poço. Mas pedir ajuda foi o primeiro passo. Não tenha vergonha de ligar para os números de apoio. Esse momento vai passar.',
      helpedCount: 1567,
      createdAt: new Date().toISOString(),
      isAnonymous: false,
    },
    culpada: {
      id: 'fallback_7',
      authorName: 'Fernanda',
      authorInitials: 'FE',
      sentiment: 'culpada',
      message:
        'A culpa era minha companheira diária. Mas sabe o que aprendi? Mães perfeitas não existem. Mães que amam e tentam, sim. E você é uma delas.',
      helpedCount: 2890,
      createdAt: new Date().toISOString(),
      isAnonymous: false,
    },
    cansada: {
      id: 'fallback_8',
      authorName: '',
      authorInitials: '',
      sentiment: 'cansada',
      message:
        'O cansaço que nenhum café resolve. Esse cansaço de alma, de corpo, de mente. Você não é fraca por estar assim. Você é humana. Descanse sem culpa.',
      helpedCount: 4123,
      createdAt: new Date().toISOString(),
      isAnonymous: true,
    },
  };

  return testimonials[sentiment];
};

// ============================================
// EXPORT
// ============================================

export const sosService = {
  createInteraction: createSOSInteraction,
  updateInteraction: updateSOSInteraction,
  getTestimonial: getTestimonialBySentiment,
  markHelpful: markTestimonialHelpful,
  analyzeSentiment,
  getStats: getSOSStats,
};

export default sosService;

