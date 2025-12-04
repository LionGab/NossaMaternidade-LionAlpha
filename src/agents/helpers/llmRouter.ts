/**
 * LLM Router Helpers
 * Lógica de roteamento inteligente para escolher o melhor modelo/provider
 */

import { LlmProfile } from '../../ai/llmConfig';
import { CrisisDetectionService } from '../../ai/moderation';
import { logger } from '../../utils/logger';

/**
 * Seleciona o perfil de LLM adequado baseado na mensagem e contexto
 * @param message - Mensagem da usuária
 * @param context - Contexto adicional
 * @returns Perfil de LLM recomendado
 */
export function selectLlmProfile(
  message: string,
  context?: {
    emotion?: string;
    lifeStage?: string;
    messageLength?: number;
    conversationDepth?: number; // Número de mensagens na conversa
  }
): LlmProfile {
  const messageLength = message.length;
  const lowerMessage = message.toLowerCase();

  // 1. PRIORIDADE MÁXIMA: Detectar crise emocional (sync, rápido)
  const crisisCheck = CrisisDetectionService.detectCrisisSync(message);
  if (crisisCheck.isCrisis) {
    logger.info('[LLMRouter] Crise detectada → CRISIS_SAFE (GPT-4o)');
    return 'CRISIS_SAFE';
  }

  // Palavras-chave de ansiedade/depressão
  const anxietyKeywords = [
    'ansiosa',
    'ansiedade',
    'pânico',
    'desespero',
    'desesperada',
    'não aguento',
    'exausta',
    'deprimida',
    'depressão',
    'triste demais',
  ];
  const hasAnxiety = anxietyKeywords.some((kw) => lowerMessage.includes(kw));

  if (hasAnxiety && context?.emotion && ['anxious', 'depressed'].includes(context.emotion)) {
    logger.info('[LLMRouter] Ansiedade intensa detectada → CRISIS_SAFE (GPT-4o)');
    return 'CRISIS_SAFE';
  }

  // 2. CONTEXTO COMPLEXO: Conversas longas ou situações complexas
  const complexityIndicators = [
    'não sei o que fazer',
    'muito confusa',
    'tantas coisas',
    'é complicado',
    'difícil explicar',
    'vários problemas',
  ];
  const hasComplexity = complexityIndicators.some((kw) => lowerMessage.includes(kw));

  if (
    hasComplexity ||
    (context?.conversationDepth && context.conversationDepth > 15) ||
    messageLength > 500
  ) {
    logger.info('[LLMRouter] Contexto complexo detectado → ANALYSIS_DEEP (Gemini Flash)');
    return 'ANALYSIS_DEEP';
  }

  // 3. MENSAGENS CURTAS E SIMPLES: Usar modelo econômico
  if (messageLength < 100 && !hasAnxiety) {
    logger.info('[LLMRouter] Mensagem curta → CHAT_CHEAP (Gemini Flash-Lite)');
    return 'CHAT_CHEAP';
  }

  // 4. PADRÃO: Chat geral
  logger.info('[LLMRouter] Mensagem padrão → CHAT_DEFAULT (Gemini Flash)');
  return 'CHAT_DEFAULT';
}

/**
 * Mapeia perfil de LLM para servidor MCP correspondente
 */
export function profileToMcpServer(profile: LlmProfile): 'googleai' | 'openai' | 'anthropic' {
  switch (profile) {
    case 'CRISIS_SAFE':
      return 'openai';
    case 'AGENT_MAX':
      return 'anthropic';
    case 'CHAT_DEFAULT':
    case 'CHAT_CHEAP':
    case 'ANALYSIS_DEEP':
    default:
      return 'googleai';
  }
}

/**
 * Retorna ordem de fallback de MCPs
 * @param primaryProfile - Perfil primário escolhido
 * @returns Array ordenado de servidores MCP para tentar
 */
export function getFallbackOrder(
  primaryProfile: LlmProfile
): Array<'googleai' | 'openai' | 'anthropic'> {
  const primary = profileToMcpServer(primaryProfile);

  // Definir fallbacks por prioridade
  const fallbackMap: Record<string, Array<'googleai' | 'openai' | 'anthropic'>> = {
    googleai: ['googleai', 'openai', 'anthropic'],
    openai: ['openai', 'googleai', 'anthropic'],
    anthropic: ['anthropic', 'googleai', 'openai'],
  };

  return fallbackMap[primary] || ['googleai', 'openai', 'anthropic'];
}

/**
 * Verifica se um servidor MCP está disponível
 * (Nota: Esta função deve ser chamada com o orquestrador para verificar se o MCP foi inicializado)
 */
export function isMcpServerAvailable(
  serverName: string,
  mcpServers: Map<string, unknown>
): boolean {
  return mcpServers.has(serverName);
}
