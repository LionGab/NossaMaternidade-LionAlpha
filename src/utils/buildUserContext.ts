/**
 * buildUserContext - Utilitário para construir contexto expandido do usuário
 * Release B - NathIA Contextual
 *
 * Centraliza a construção do contexto do usuário para uso em:
 * - MaternalChatAgent (prompts de IA)
 * - ChatScreen (chips dinâmicos)
 * - Recomendações de conteúdo
 */

import type { MotherProfile } from '@/features/wellness/types';
import {
  PhysicalChallenge,
  PhysicalChallengeLabels,
  SleepChallenge,
  SleepChallengeLabels,
  EmotionalState,
  EmotionalStateLabels,
  WellnessGoal,
  WellnessGoalLabels,
  PartnerRelationship,
  PartnerRelationshipLabels,
} from '@/features/wellness/types';

// ======================
// TIPOS
// ======================

export interface ExpandedUserContext {
  // Dados básicos
  name?: string;
  lifeStage?: 'pregnant' | 'new-mother' | 'experienced-mother' | 'trying' | string;
  pregnancyWeek?: number;
  babyAgeMonths?: number;

  // Wellness expandido
  physicalChallenges?: string[];
  sleepChallenges?: string[];
  emotionalState?: string;
  wellnessGoals?: string[];
  partnerRelationship?: string;

  // Contexto derivado
  primaryConcern?: string;
  suggestedTopics?: string[];
  tone?: 'hopeful' | 'supportive' | 'practical' | 'empathetic';
}

export interface DynamicChip {
  text: string;
  emoji: string;
  priority: number; // 1 = alta, 3 = baixa
  category: 'emotional' | 'physical' | 'sleep' | 'practical' | 'general';
}

// ======================
// TRADUTORES DE FASE
// ======================

const STAGE_TRANSLATIONS: Record<string, string> = {
  Tentante: 'trying',
  Gestante: 'pregnant',
  'Puérpera (Recém-nascido)': 'new-mother',
  'Mãe Experiente': 'experienced-mother',
  trying: 'trying',
  pregnant: 'pregnant',
  'new-mother': 'new-mother',
  'experienced-mother': 'experienced-mother',
};

const STAGE_NAMES_PT: Record<string, string> = {
  trying: 'tentante',
  pregnant: 'gestante',
  'new-mother': 'mãe de recém-nascido',
  'experienced-mother': 'mãe experiente',
};

// ======================
// BUILDER PRINCIPAL
// ======================

/**
 * Constrói contexto expandido a partir do perfil
 */
export function buildUserContext(profile: Partial<MotherProfile>): ExpandedUserContext {
  const context: ExpandedUserContext = {};

  // Nome
  if (profile.name) {
    context.name = profile.name.split(' ')[0]; // Primeiro nome apenas
  }

  // Fase da vida
  const stage = profile.stage || profile.phase || profile.motherhood_stage;
  if (stage) {
    context.lifeStage = STAGE_TRANSLATIONS[stage] || stage;
  }

  // Semana de gestação ou idade do bebê
  if (profile.pregnancy_week) {
    context.pregnancyWeek = profile.pregnancy_week;
  }
  if (profile.baby_birth_date) {
    const birthDate = new Date(profile.baby_birth_date);
    const now = new Date();
    const monthsDiff =
      (now.getFullYear() - birthDate.getFullYear()) * 12 + (now.getMonth() - birthDate.getMonth());
    context.babyAgeMonths = Math.max(0, monthsDiff);
  }

  // Desafios físicos (traduzidos)
  if (profile.physical_challenges?.length) {
    context.physicalChallenges = profile.physical_challenges
      .filter((c) => c !== PhysicalChallenge.NONE)
      .map((c) => PhysicalChallengeLabels[c as PhysicalChallenge] || c);
  }

  // Desafios de sono (traduzidos)
  if (profile.sleep_challenges?.length) {
    context.sleepChallenges = profile.sleep_challenges
      .filter((c) => c !== SleepChallenge.NONE)
      .map((c) => SleepChallengeLabels[c as SleepChallenge] || c);
  }

  // Estado emocional
  if (profile.emotional_state) {
    context.emotionalState =
      EmotionalStateLabels[profile.emotional_state as EmotionalState] || profile.emotional_state;
  }

  // Objetivos de bem-estar
  if (profile.wellness_goals?.length) {
    context.wellnessGoals = profile.wellness_goals.map(
      (g) => WellnessGoalLabels[g as WellnessGoal] || g
    );
  }

  // Relação com parceiro
  if (profile.partner_relationship) {
    context.partnerRelationship =
      PartnerRelationshipLabels[profile.partner_relationship as PartnerRelationship] ||
      profile.partner_relationship;
  }

  // Derivar preocupação principal
  context.primaryConcern = derivePrimaryConcern(context);

  // Derivar tópicos sugeridos
  context.suggestedTopics = deriveSuggestedTopics(context);

  // Determinar tom
  context.tone = determineTone(context);

  return context;
}

// ======================
// FORMATADOR PARA IA
// ======================

/**
 * Formata contexto para inclusão em prompts de IA
 * Limite de ~200 tokens (~800 caracteres)
 */
export function formatContextForAI(context: ExpandedUserContext): string {
  const parts: string[] = [];

  if (context.name) {
    parts.push(`Nome: ${context.name}`);
  }

  if (context.lifeStage) {
    const stageName = STAGE_NAMES_PT[context.lifeStage] || context.lifeStage;
    parts.push(`Fase: ${stageName}`);

    if (context.lifeStage === 'pregnant' && context.pregnancyWeek) {
      parts.push(`Semana de gestação: ${context.pregnancyWeek}`);
    }
    if (
      (context.lifeStage === 'new-mother' || context.lifeStage === 'experienced-mother') &&
      context.babyAgeMonths !== undefined
    ) {
      parts.push(`Idade do bebê: ${context.babyAgeMonths} meses`);
    }
  }

  if (context.emotionalState) {
    parts.push(`Estado emocional: ${context.emotionalState}`);
  }

  if (context.physicalChallenges?.length) {
    parts.push(`Desafios físicos: ${context.physicalChallenges.slice(0, 3).join(', ')}`);
  }

  if (context.sleepChallenges?.length) {
    parts.push(`Sono: ${context.sleepChallenges.slice(0, 2).join(', ')}`);
  }

  if (context.wellnessGoals?.length) {
    parts.push(`Objetivos: ${context.wellnessGoals.slice(0, 2).join(', ')}`);
  }

  if (context.partnerRelationship) {
    parts.push(`Parceiro: ${context.partnerRelationship}`);
  }

  // Limitar a 800 caracteres
  const result = parts.join('. ');
  return result.length > 800 ? result.slice(0, 797) + '...' : result;
}

// ======================
// GERADOR DE CHIPS DINÂMICOS
// ======================

/**
 * Gera chips de sugestão baseados no contexto do usuário
 * Retorna 4-6 chips ordenados por prioridade
 */
export function generateDynamicChips(context: ExpandedUserContext): DynamicChip[] {
  const chips: DynamicChip[] = [];

  // Chips baseados no estado emocional
  if (context.emotionalState) {
    const emotionalChips = getEmotionalChips(context.emotionalState);
    chips.push(...emotionalChips);
  }

  // Chips baseados na fase da vida
  if (context.lifeStage) {
    const stageChips = getStageChips(
      context.lifeStage,
      context.pregnancyWeek,
      context.babyAgeMonths
    );
    chips.push(...stageChips);
  }

  // Chips baseados nos desafios de sono
  if (context.sleepChallenges?.length) {
    chips.push({
      text: 'Meu bebê não dorme',
      emoji: '😴',
      priority: 1,
      category: 'sleep',
    });
  }

  // Chips baseados nos desafios físicos
  if (context.physicalChallenges?.length) {
    if (context.physicalChallenges.some((c) => c.toLowerCase().includes('fadiga'))) {
      chips.push({
        text: 'Estou muito cansada',
        emoji: '😔',
        priority: 1,
        category: 'physical',
      });
    }
    if (context.physicalChallenges.some((c) => c.toLowerCase().includes('enjoo'))) {
      chips.push({
        text: 'Como lidar com enjoos?',
        emoji: '🤢',
        priority: 2,
        category: 'physical',
      });
    }
  }

  // Chips baseados nos objetivos
  if (context.wellnessGoals?.length) {
    if (context.wellnessGoals.some((g) => g.toLowerCase().includes('autocuidado'))) {
      chips.push({
        text: 'Dicas de autocuidado',
        emoji: '💆‍♀️',
        priority: 2,
        category: 'practical',
      });
    }
  }

  // Chips genéricos para completar
  const genericChips: DynamicChip[] = [
    { text: 'Preciso desabafar', emoji: '💬', priority: 2, category: 'emotional' },
    { text: 'Dica de alimentação', emoji: '🍎', priority: 3, category: 'practical' },
    { text: 'Ideia de brincadeira', emoji: '🧸', priority: 3, category: 'practical' },
  ];

  // Adicionar genéricos se necessário
  for (const chip of genericChips) {
    if (chips.length >= 6) break;
    if (!chips.some((c) => c.text === chip.text)) {
      chips.push(chip);
    }
  }

  // Ordenar por prioridade e retornar 4-6 chips únicos
  const uniqueChips = chips.filter(
    (chip, index, self) => index === self.findIndex((c) => c.text === chip.text)
  );

  return uniqueChips.sort((a, b) => a.priority - b.priority).slice(0, 6);
}

/**
 * Formata chips para exibição (texto + emoji)
 */
export function formatChipText(chip: DynamicChip): string {
  return `${chip.text} ${chip.emoji}`;
}

// ======================
// HELPERS PRIVADOS
// ======================

function getEmotionalChips(emotionalState: string): DynamicChip[] {
  const state = emotionalState.toLowerCase();

  if (state.includes('ansiosa') || state.includes('anxious')) {
    return [
      { text: 'Estou ansiosa', emoji: '😰', priority: 1, category: 'emotional' },
      { text: 'Técnicas de respiração', emoji: '🧘', priority: 2, category: 'emotional' },
    ];
  }

  if (state.includes('sobrecarregada') || state.includes('overwhelmed')) {
    return [
      { text: 'Estou sobrecarregada', emoji: '😩', priority: 1, category: 'emotional' },
      { text: 'Preciso de ajuda', emoji: '🆘', priority: 1, category: 'emotional' },
    ];
  }

  if (state.includes('triste') || state.includes('sad')) {
    return [{ text: 'Estou me sentindo triste', emoji: '😢', priority: 1, category: 'emotional' }];
  }

  if (state.includes('apoio') || state.includes('support')) {
    return [{ text: 'Preciso de apoio', emoji: '💙', priority: 1, category: 'emotional' }];
  }

  return [];
}

function getStageChips(
  lifeStage: string,
  pregnancyWeek?: number,
  babyAgeMonths?: number
): DynamicChip[] {
  const chips: DynamicChip[] = [];

  if (lifeStage === 'pregnant') {
    chips.push({ text: 'Sintomas da gravidez', emoji: '🤰', priority: 2, category: 'physical' });
    if (pregnancyWeek && pregnancyWeek >= 28) {
      chips.push({ text: 'Preparar o enxoval', emoji: '👶', priority: 2, category: 'practical' });
    }
    if (pregnancyWeek && pregnancyWeek >= 36) {
      chips.push({
        text: 'Sinais de trabalho de parto',
        emoji: '🏥',
        priority: 1,
        category: 'practical',
      });
    }
  }

  if (lifeStage === 'new-mother') {
    chips.push({ text: 'Amamentação', emoji: '🤱', priority: 1, category: 'practical' });
    if (babyAgeMonths !== undefined && babyAgeMonths <= 3) {
      chips.push({
        text: 'O que fazer com cólica?',
        emoji: '🍼',
        priority: 1,
        category: 'practical',
      });
    }
    chips.push({ text: 'Recuperação pós-parto', emoji: '🩺', priority: 2, category: 'physical' });
  }

  if (lifeStage === 'experienced-mother') {
    chips.push({
      text: 'Desenvolvimento do bebê',
      emoji: '📊',
      priority: 2,
      category: 'practical',
    });
    chips.push({
      text: 'Como voltar ao trabalho?',
      emoji: '💼',
      priority: 2,
      category: 'practical',
    });
  }

  if (lifeStage === 'trying') {
    chips.push({ text: 'Dicas para engravidar', emoji: '🌸', priority: 1, category: 'practical' });
    chips.push({ text: 'Fertilidade e saúde', emoji: '💪', priority: 2, category: 'physical' });
  }

  return chips;
}

function derivePrimaryConcern(context: ExpandedUserContext): string | undefined {
  // Priorizar estado emocional urgente
  if (context.emotionalState?.toLowerCase().includes('sobrecarregada')) {
    return 'sobrecarga_emocional';
  }
  if (context.emotionalState?.toLowerCase().includes('apoio')) {
    return 'necessidade_apoio';
  }

  // Depois desafios de sono
  if (context.sleepChallenges?.length) {
    return 'problemas_sono';
  }

  // Depois desafios físicos
  if (context.physicalChallenges?.length) {
    return 'desconforto_fisico';
  }

  return undefined;
}

function deriveSuggestedTopics(context: ExpandedUserContext): string[] {
  const topics: string[] = [];

  if (context.lifeStage === 'pregnant') {
    topics.push('preparação para o parto', 'desenvolvimento fetal', 'autocuidado na gravidez');
  }
  if (context.lifeStage === 'new-mother') {
    topics.push('amamentação', 'cuidados com recém-nascido', 'recuperação pós-parto');
  }
  if (context.sleepChallenges?.length) {
    topics.push('sono do bebê', 'rotina noturna');
  }
  if (context.wellnessGoals?.some((g) => g.toLowerCase().includes('emocional'))) {
    topics.push('saúde mental', 'mindfulness');
  }

  return topics.slice(0, 4);
}

function determineTone(
  context: ExpandedUserContext
): 'hopeful' | 'supportive' | 'practical' | 'empathetic' {
  // Empático para estados emocionais difíceis
  if (
    context.emotionalState?.toLowerCase().includes('triste') ||
    context.emotionalState?.toLowerCase().includes('sobrecarregada') ||
    context.emotionalState?.toLowerCase().includes('apoio')
  ) {
    return 'empathetic';
  }

  // Esperançoso para tentantes e início da gravidez
  if (
    context.lifeStage === 'trying' ||
    (context.lifeStage === 'pregnant' && (context.pregnancyWeek || 0) < 20)
  ) {
    return 'hopeful';
  }

  // Prático para mães experientes
  if (context.lifeStage === 'experienced-mother') {
    return 'practical';
  }

  // Suportivo como padrão
  return 'supportive';
}

export default buildUserContext;
