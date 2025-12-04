/**
 * Crisis Detection Service
 * Detecta crises emocionais usando análise de IA
 *
 * Combina:
 * 1. Pattern matching (keywords de crise)
 * 2. Análise de emoção via IA (GPT-4o mini ou Gemini)
 * 3. Scoring de severidade
 */

import { MedicalModerationService } from './MedicalModerationService';
import { orchestrator } from '../../agents/core/AgentOrchestrator';
import { logger } from '../../utils/logger';

/**
 * Níveis de crise detectados
 */
export type CrisisLevel = 'none' | 'mild' | 'moderate' | 'severe' | 'critical';

/**
 * Tipos de crise
 */
export type CrisisType =
  | 'anxiety' // Ansiedade intensa
  | 'depression' // Depressão / tristeza profunda
  | 'suicidal_ideation' // Ideação suicida
  | 'self_harm' // Auto-dano
  | 'panic' // Ataque de pânico
  | 'overwhelm' // Sobrecarga emocional extrema
  | 'violence' // Violência / agressividade
  | 'postpartum'; // Depressão pós-parto específica

/**
 * Resultado da detecção de crise
 */
export interface CrisisDetectionResult {
  level: CrisisLevel;
  types: CrisisType[];
  confidence: number; // 0-1
  shouldUseCrisisSafeModel: boolean;
  urgentResources: string[];
  reasoning: string;
  interventionId?: string; // ID para follow-up tracking
}

/**
 * Registro de intervenção de crise (para follow-up)
 */
export interface CrisisIntervention {
  id: string;
  userId: string;
  timestamp: string;
  level: CrisisLevel;
  types: CrisisType[];
  userMessage: string;
  resourcesShown: string[];
  outcome?: 'contacted_cvv' | 'contacted_samu' | 'continued_chat' | 'left_app' | 'unknown';
  followUpNeeded: boolean;
  followUpAt?: string;
  notes?: string;
}

/**
 * Frases limítrofes que indicam crise mas não têm keywords óbvias
 * CRÍTICO: Detectam exaustão severa que pode evoluir para crise
 */
const CONTEXTUAL_CRISIS_PHRASES = [
  // Exaustão extrema
  { pattern: /n[aã]o\s+aguento\s+mais/i, level: 'severe', type: 'overwhelm' },
  { pattern: /n[aã]o\s+tenho\s+mais\s+for[cç]as/i, level: 'severe', type: 'overwhelm' },
  { pattern: /chegu?ei\s+(ao|no)\s+limite/i, level: 'severe', type: 'overwhelm' },
  { pattern: /t[oô]\s+no\s+limite/i, level: 'severe', type: 'overwhelm' },
  { pattern: /n[aã]o\s+consigo\s+mais/i, level: 'moderate', type: 'overwhelm' },

  // Ideação passiva (mais sutil)
  { pattern: /quero\s+sumir/i, level: 'severe', type: 'suicidal_ideation' },
  { pattern: /queria\s+desaparecer/i, level: 'severe', type: 'suicidal_ideation' },
  { pattern: /seria\s+melhor\s+sem\s+mim/i, level: 'critical', type: 'suicidal_ideation' },
  { pattern: /meu\s+beb[eê]\s+estaria\s+melhor/i, level: 'critical', type: 'suicidal_ideation' },
  {
    pattern: /n[aã]o\s+quero\s+mais\s+estar\s+aqui/i,
    level: 'critical',
    type: 'suicidal_ideation',
  },
  { pattern: /n[aã]o\s+vejo\s+sa[ií]da/i, level: 'severe', type: 'suicidal_ideation' },
  { pattern: /sem\s+sa[ií]da/i, level: 'moderate', type: 'depression' },

  // Depressão pós-parto
  { pattern: /me\s+sinto\s+uma\s+m[aã]e\s+horrível/i, level: 'moderate', type: 'postpartum' },
  {
    pattern: /n[aã]o\s+consigo\s+amar\s+(meu\s+beb[eê]|meu\s+filho)/i,
    level: 'severe',
    type: 'postpartum',
  },
  { pattern: /n[aã]o\s+sinto\s+nada\s+pelo/i, level: 'severe', type: 'postpartum' },
  { pattern: /me\s+arrependo\s+de\s+ter\s+sido\s+m[aã]e/i, level: 'moderate', type: 'postpartum' },

  // Pânico/Ansiedade severa
  { pattern: /n[aã]o\s+consigo\s+respirar/i, level: 'severe', type: 'panic' },
  { pattern: /cora[cç][aã]o\s+disparado/i, level: 'moderate', type: 'panic' },
  { pattern: /vou\s+enlouquecer/i, level: 'moderate', type: 'panic' },
  { pattern: /perdendo\s+a\s+(cabe[cç]a|raz[aã]o)/i, level: 'moderate', type: 'anxiety' },
] as const;

/**
 * Análise de emoção retornada pela IA
 */
interface EmotionAnalysis {
  emotions?: string[];
  intensity?: 'low' | 'medium' | 'high';
  needs?: string[];
  crisis_indicators?: string[];
  [key: string]: unknown;
}

/**
 * Serviço de detecção de crise
 */
export class CrisisDetectionService {
  /**
   * Detecta crise em uma mensagem da usuária
   * @param userMessage - Mensagem a analisar
   * @param useAI - Se true, usa análise de IA (mais preciso mas mais lento)
   * @param userId - ID da usuária (opcional, para follow-up tracking)
   * @returns Resultado da detecção
   */
  static async detectCrisis(
    userMessage: string,
    useAI: boolean = true,
    userId?: string
  ): Promise<CrisisDetectionResult> {
    // 1. Pattern matching rápido (keywords explícitas)
    const patternResult = MedicalModerationService.detectCrisisInUserMessage(userMessage);

    // 2. Detecção contextual (frases sutis que pattern matching perde)
    const contextualResult = this.detectContextualCrisis(userMessage);

    // Se pattern matching já detectou crise crítica, retornar imediatamente
    if (patternResult.isCrisis && patternResult.categories.length > 0) {
      const criticalTypes = this.mapCategoriesToCrisisTypes(patternResult.categories);

      const result: CrisisDetectionResult = {
        level: 'critical',
        types: criticalTypes,
        confidence: 0.95, // Alta confiança em pattern matching
        shouldUseCrisisSafeModel: true,
        urgentResources: ['CVV: 188', 'SAMU: 192', 'CAPS'],
        reasoning: 'Detectada crise por pattern matching de keywords críticas',
      };

      // Registrar para follow-up se tiver userId
      if (userId) {
        result.interventionId = await this.registerCrisisIntervention(userId, result, userMessage);
      }

      return result;
    }

    // 3. Se detecção contextual encontrou algo sério
    if (
      contextualResult.detected &&
      (contextualResult.level === 'critical' || contextualResult.level === 'severe')
    ) {
      const result: CrisisDetectionResult = {
        level: contextualResult.level,
        types: contextualResult.types,
        confidence: 0.85,
        shouldUseCrisisSafeModel: true,
        urgentResources:
          contextualResult.level === 'critical' ? ['CVV: 188', 'SAMU: 192'] : ['CVV: 188'],
        reasoning: `Detectada crise por análise contextual: ${contextualResult.matchedPhrases.length} frases identificadas`,
      };

      if (userId) {
        result.interventionId = await this.registerCrisisIntervention(userId, result, userMessage);
      }

      return result;
    }

    // 2. Se useAI = true, fazer análise de emoção mais sofisticada
    if (useAI) {
      try {
        const emotionAnalysis = await this.analyzeEmotionWithAI(userMessage);
        return this.interpretEmotionAnalysis(emotionAnalysis, userMessage);
      } catch (error) {
        logger.error('[CrisisDetection] AI analysis failed', error);
        // Fallback para resultado do pattern matching
        return this.createFallbackResult(patternResult.isCrisis);
      }
    }

    // 3. Sem IA, usar apenas pattern matching
    return this.createFallbackResult(patternResult.isCrisis);
  }

  /**
   * Analisa emoção usando IA (GPT-4o-mini ou Gemini)
   */
  private static async analyzeEmotionWithAI(userMessage: string): Promise<EmotionAnalysis> {
    // Tentar primeiro com Gemini (mais barato e disponível)
    try {
      const response = await orchestrator.callMCP('googleai', 'analyze.emotion', {
        text: userMessage,
      });

      if (response.success && response.data) {
        return response.data as EmotionAnalysis;
      }
    } catch (error: unknown) {
      const errorContext =
        error instanceof Error ? { message: error.message } : { error: String(error) };
      logger.debug('[CrisisDetection] Gemini emotion analysis failed, trying OpenAI', errorContext);
    }

    // Fallback para OpenAI se Gemini falhar
    try {
      const response = await orchestrator.callMCP('openai', 'analyze.emotion', {
        text: userMessage,
      });

      if (response.success && response.data) {
        return response.data as EmotionAnalysis;
      }
    } catch (error: unknown) {
      const errorContext =
        error instanceof Error ? { message: error.message } : { error: String(error) };
      logger.error('[CrisisDetection] OpenAI emotion analysis failed', errorContext);
    }

    // Retornar análise vazia se tudo falhar
    return {};
  }

  /**
   * Interpreta análise de emoção e determina nível de crise
   */
  private static interpretEmotionAnalysis(
    analysis: EmotionAnalysis,
    userMessage: string
  ): CrisisDetectionResult {
    const detectedTypes: CrisisType[] = [];
    let crisisLevel: CrisisLevel = 'none';
    const urgentResources: string[] = [];

    // Mapear emoções para tipos de crise
    const emotions = analysis.emotions || [];
    const intensity = analysis.intensity || 'low';
    const crisisIndicators = analysis.crisis_indicators || [];

    // Detectar ansiedade
    if (
      emotions.some((e) => ['ansiedade', 'anxiety', 'pânico', 'panic'].includes(e.toLowerCase()))
    ) {
      detectedTypes.push('anxiety');
      if (intensity === 'high') {
        detectedTypes.push('panic');
      }
    }

    // Detectar depressão
    if (
      emotions.some((e) =>
        ['tristeza', 'sadness', 'depressão', 'depression', 'desesperança', 'hopelessness'].includes(
          e.toLowerCase()
        )
      )
    ) {
      detectedTypes.push('depression');
    }

    // Detectar sobrecarga
    if (
      emotions.some((e) =>
        ['exaustão', 'exhaustion', 'cansaço', 'overwhelm'].includes(e.toLowerCase())
      ) ||
      userMessage.toLowerCase().includes('não aguento')
    ) {
      detectedTypes.push('overwhelm');
    }

    // Detectar indicadores críticos
    if (crisisIndicators.length > 0) {
      const criticalKeywords = ['suicid', 'auto-lesão', 'machucar'];
      const hasCritical = crisisIndicators.some((indicator) =>
        criticalKeywords.some((keyword) => indicator.toLowerCase().includes(keyword))
      );

      if (hasCritical) {
        detectedTypes.push('suicidal_ideation');
        urgentResources.push('CVV: 188', 'SAMU: 192');
      }
    }

    // Determinar nível de crise baseado em intensidade e tipos
    if (detectedTypes.includes('suicidal_ideation') || detectedTypes.includes('self_harm')) {
      crisisLevel = 'critical';
    } else if (intensity === 'high' && detectedTypes.length >= 2) {
      crisisLevel = 'severe';
    } else if (intensity === 'high' || detectedTypes.length >= 2) {
      crisisLevel = 'moderate';
    } else if (detectedTypes.length > 0) {
      crisisLevel = 'mild';
    }

    // Determinar se deve usar modelo CRISIS_SAFE
    const shouldUseCrisisSafeModel = crisisLevel === 'severe' || crisisLevel === 'critical';

    // Gerar reasoning
    const reasoning = `Análise de IA: ${emotions.join(', ')} (intensidade: ${intensity}). Tipos detectados: ${detectedTypes.join(', ')}.`;

    return {
      level: crisisLevel,
      types: detectedTypes,
      confidence: this.calculateConfidence(analysis, detectedTypes),
      shouldUseCrisisSafeModel,
      urgentResources,
      reasoning,
    };
  }

  /**
   * Calcula confiança da detecção
   */
  private static calculateConfidence(
    analysis: EmotionAnalysis,
    detectedTypes: CrisisType[]
  ): number {
    let confidence = 0.5; // Base

    // Aumentar confiança se houver emoções detectadas
    if (analysis.emotions && analysis.emotions.length > 0) {
      confidence += 0.2;
    }

    // Aumentar confiança se intensidade for alta
    if (analysis.intensity === 'high') {
      confidence += 0.2;
    }

    // Aumentar confiança se múltiplos tipos foram detectados
    if (detectedTypes.length >= 2) {
      confidence += 0.1;
    }

    return Math.min(confidence, 1.0);
  }

  /**
   * Cria resultado fallback quando IA não está disponível
   */
  private static createFallbackResult(isCrisis: boolean): CrisisDetectionResult {
    if (isCrisis) {
      return {
        level: 'moderate',
        types: ['anxiety', 'overwhelm'],
        confidence: 0.6,
        shouldUseCrisisSafeModel: true,
        urgentResources: ['CVV: 188'],
        reasoning: 'Detecção por pattern matching (IA indisponível)',
      };
    }

    return {
      level: 'none',
      types: [],
      confidence: 0.8,
      shouldUseCrisisSafeModel: false,
      urgentResources: [],
      reasoning: 'Nenhuma crise detectada',
    };
  }

  /**
   * Mapeia categorias de moderação para tipos de crise
   */
  private static mapCategoriesToCrisisTypes(categories: string[]): CrisisType[] {
    const mapping: Record<string, CrisisType> = {
      crisis_mental_health: 'depression',
      self_harm: 'self_harm',
      violence: 'violence',
      emergency: 'panic',
    };

    return categories.map((cat) => mapping[cat]).filter(Boolean) as CrisisType[];
  }

  /**
   * Detecta crise de forma síncrona (apenas pattern matching)
   * Útil quando velocidade é mais importante que precisão
   */
  static detectCrisisSync(userMessage: string): {
    isCrisis: boolean;
    shouldUseCrisisSafeModel: boolean;
  } {
    const result = MedicalModerationService.detectCrisisInUserMessage(userMessage);

    // Também checar frases contextuais
    const contextualResult = this.detectContextualCrisis(userMessage);

    return {
      isCrisis: result.isCrisis || contextualResult.detected,
      shouldUseCrisisSafeModel:
        result.isCrisis ||
        contextualResult.level === 'critical' ||
        contextualResult.level === 'severe',
    };
  }

  /**
   * Detecta crise usando frases contextuais (não keywords óbvias)
   * CRÍTICO: Captura casos que pattern matching simples perde
   */
  static detectContextualCrisis(userMessage: string): {
    detected: boolean;
    level: CrisisLevel;
    types: CrisisType[];
    matchedPhrases: string[];
  } {
    const detectedTypes: CrisisType[] = [];
    const matchedPhrases: string[] = [];
    let highestLevel: CrisisLevel = 'none';

    const levelPriority: Record<CrisisLevel, number> = {
      none: 0,
      mild: 1,
      moderate: 2,
      severe: 3,
      critical: 4,
    };

    for (const phrase of CONTEXTUAL_CRISIS_PHRASES) {
      if (phrase.pattern.test(userMessage)) {
        matchedPhrases.push(phrase.pattern.source);

        if (!detectedTypes.includes(phrase.type as CrisisType)) {
          detectedTypes.push(phrase.type as CrisisType);
        }

        if (levelPriority[phrase.level as CrisisLevel] > levelPriority[highestLevel]) {
          highestLevel = phrase.level as CrisisLevel;
        }
      }
    }

    // Log se detectou algo
    if (detectedTypes.length > 0) {
      logger.warn('[CrisisDetection] Frases contextuais detectadas', {
        level: highestLevel,
        types: detectedTypes,
        matchCount: matchedPhrases.length,
      });
    }

    return {
      detected: detectedTypes.length > 0,
      level: highestLevel,
      types: detectedTypes,
      matchedPhrases,
    };
  }

  // ======================
  // FOLLOW-UP TRACKING
  // ======================

  /**
   * Registra intervenção de crise para follow-up
   */
  static async registerCrisisIntervention(
    userId: string,
    result: CrisisDetectionResult,
    userMessage: string
  ): Promise<string> {
    const interventionId = `crisis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const intervention: CrisisIntervention = {
      id: interventionId,
      userId,
      timestamp: new Date().toISOString(),
      level: result.level,
      types: result.types,
      userMessage: userMessage.substring(0, 500), // Limitar tamanho
      resourcesShown: result.urgentResources,
      followUpNeeded: result.level === 'critical' || result.level === 'severe',
      followUpAt: this.calculateFollowUpTime(result.level),
    };

    // Salvar no Supabase (se disponível)
    try {
      const { supabase } = await import('../../services/supabase');
      const { error } = await supabase.from('crisis_interventions').insert(intervention);

      if (error) {
        logger.warn('[CrisisDetection] Erro ao salvar intervenção (tabela existe?)', {
          error: error.message,
        });
      } else {
        logger.info('[CrisisDetection] Intervenção registrada', {
          interventionId,
          level: result.level,
          followUpNeeded: intervention.followUpNeeded,
        });
      }
    } catch (error) {
      logger.error('[CrisisDetection] Erro ao registrar intervenção', error);
    }

    return interventionId;
  }

  /**
   * Atualiza outcome de uma intervenção (quando usuária toma ação)
   */
  static async updateInterventionOutcome(
    interventionId: string,
    outcome: CrisisIntervention['outcome'],
    notes?: string
  ): Promise<void> {
    try {
      const { supabase } = await import('../../services/supabase');
      const { error } = await supabase
        .from('crisis_interventions')
        .update({
          outcome,
          notes,
          updated_at: new Date().toISOString(),
        })
        .eq('id', interventionId);

      if (error) {
        logger.warn('[CrisisDetection] Erro ao atualizar outcome', { error: error.message });
      } else {
        logger.info('[CrisisDetection] Outcome atualizado', { interventionId, outcome });
      }
    } catch (error) {
      logger.error('[CrisisDetection] Erro ao atualizar outcome', error);
    }
  }

  /**
   * Obtém intervenções que precisam de follow-up
   */
  static async getPendingFollowUps(): Promise<CrisisIntervention[]> {
    try {
      const { supabase } = await import('../../services/supabase');
      const now = new Date().toISOString();

      const { data, error } = await supabase
        .from('crisis_interventions')
        .select('*')
        .eq('followUpNeeded', true)
        .lte('followUpAt', now)
        .is('outcome', null)
        .order('timestamp', { ascending: false })
        .limit(50);

      if (error) {
        logger.warn('[CrisisDetection] Erro ao buscar follow-ups', { error: error.message });
        return [];
      }

      return (data || []) as CrisisIntervention[];
    } catch (error) {
      logger.error('[CrisisDetection] Erro ao buscar follow-ups pendentes', error);
      return [];
    }
  }

  /**
   * Calcula quando fazer follow-up baseado no nível de crise
   */
  private static calculateFollowUpTime(level: CrisisLevel): string {
    const now = Date.now();
    const hours: Record<CrisisLevel, number> = {
      none: 0,
      mild: 48, // 2 dias
      moderate: 24, // 1 dia
      severe: 12, // 12 horas
      critical: 6, // 6 horas
    };

    const followUpMs = now + hours[level] * 60 * 60 * 1000;
    return new Date(followUpMs).toISOString();
  }

  /**
   * Verifica se usuária tem intervenções recentes (para contexto)
   */
  static async hasRecentCrisis(userId: string, withinHours: number = 24): Promise<boolean> {
    try {
      const { supabase } = await import('../../services/supabase');
      const since = new Date(Date.now() - withinHours * 60 * 60 * 1000).toISOString();

      const { count, error } = await supabase
        .from('crisis_interventions')
        .select('*', { count: 'exact', head: true })
        .eq('userId', userId)
        .gte('timestamp', since)
        .in('level', ['severe', 'critical']);

      if (error) return false;
      return (count || 0) > 0;
    } catch (error) {
      return false;
    }
  }
}
