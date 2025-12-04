/**
 * LLM Configuration
 * Configuração centralizada de modelos de IA multi-provider
 * Suporta: Gemini (Google), GPT (OpenAI), Claude (Anthropic)
 */

/**
 * Provedores de LLM suportados
 */
export type LlmProvider = 'gemini' | 'openai' | 'anthropic';

/**
 * Perfis de modelo para diferentes casos de uso
 *
 * - CHAT_DEFAULT: Chat geral com NathIA (Gemini 2.5 Flash)
 * - CHAT_CHEAP: Mensagens curtas e leves (Gemini 2.5 Flash-Lite ou Flash)
 * - CRISIS_SAFE: Fluxos de crise emocional (GPT-4o para maior segurança)
 * - ANALYSIS_DEEP: Análises profundas de diário/hábitos (Gemini 2.5 Flash com mais tokens)
 * - AGENT_MAX: Contexto extremamente complexo (Claude Opus 4)
 */
export type LlmProfile =
  | 'CHAT_DEFAULT'
  | 'CHAT_CHEAP'
  | 'CRISIS_SAFE'
  | 'ANALYSIS_DEEP'
  | 'AGENT_MAX';

/**
 * Configuração de um modelo LLM
 */
export interface LlmModelConfig {
  provider: LlmProvider;
  modelName: string;
  maxTokens: number;
  temperature: number;
  topP?: number;
  topK?: number;
  description: string;
  costPer1kTokens?: {
    input: number; // USD por 1k tokens de input
    output: number; // USD por 1k tokens de output
  };
}

/**
 * Mapeamento de perfis para configurações de modelo
 *
 * NOTA: Modelos mais recentes como "Gemini 3 Pro", "GPT-5.1", "Claude Opus 4.5"
 * ainda não existem (novembro/2025), então usamos as versões disponíveis:
 * - Gemini 2.5 Flash (substitui "Gemini 3 Pro")
 * - GPT-4o (substitui "GPT-5.1")
 * - Claude Opus 4 (substitui "Claude Opus 4.5")
 */
const LLM_PROFILES: Record<LlmProfile, LlmModelConfig> = {
  /**
   * Chat geral com NathIA
   * Modelo: Gemini 2.5 Flash (ou gemini-2.0-flash-exp se preferir experimentação)
   * Uso: Conversas gerais, perguntas, suporte emocional leve
   */
  CHAT_DEFAULT: {
    provider: 'gemini',
    modelName: 'gemini-2.5-flash',
    temperature: 0.9,
    topP: 0.95,
    topK: 40,
    maxTokens: 2048,
    description: 'Chat geral com NathIA - modelo rápido e empático',
    costPer1kTokens: {
      input: 0.0001, // Aproximado para Gemini Flash
      output: 0.0002,
    },
  },

  /**
   * Mensagens curtas e leves
   * Modelo: Gemini 2.5 Flash-Lite (se não existir, usa Flash)
   * Uso: Respostas rápidas, confirmações, mensagens curtas
   */
  CHAT_CHEAP: {
    provider: 'gemini',
    modelName: 'gemini-2.5-flash-lite', // Ou gemini-2.5-flash se lite não disponível
    temperature: 0.8,
    topP: 0.9,
    topK: 30,
    maxTokens: 1024,
    description: 'Mensagens curtas e rápidas - mais econômico',
    costPer1kTokens: {
      input: 0.00005, // Metade do custo do Flash
      output: 0.0001,
    },
  },

  /**
   * Fluxos de crise emocional
   * Modelo: GPT-4o (ou gpt-4o-mini para custo menor)
   * Uso: Ansiedade, depressão pós-parto, ideação suicida, crise
   * IMPORTANTE: Temperatura mais baixa para respostas mais seguras e consistentes
   */
  CRISIS_SAFE: {
    provider: 'openai',
    modelName: 'gpt-4o', // Ou 'gpt-4o-mini' para custo menor
    temperature: 0.7, // Menos criativo = mais seguro
    maxTokens: 2048,
    description: 'Crise emocional e temas sensíveis - GPT-4o para segurança',
    costPer1kTokens: {
      input: 0.005, // GPT-4o é mais caro
      output: 0.015,
    },
  },

  /**
   * Análises profundas
   * Modelo: Gemini 2.5 Flash (com mais tokens)
   * Uso: Análise de diário, resumo de hábitos, insights profundos
   */
  ANALYSIS_DEEP: {
    provider: 'gemini',
    modelName: 'gemini-2.5-flash',
    temperature: 0.8,
    topP: 0.95,
    topK: 40,
    maxTokens: 4096, // Dobro de tokens para análises longas
    description: 'Análises profundas de diário e padrões de comportamento',
    costPer1kTokens: {
      input: 0.0001,
      output: 0.0002,
    },
  },

  /**
   * Contexto extremamente complexo
   * Modelo: Claude Opus 4 (ou Opus 3.5 se não disponível)
   * Uso: Casos raros de contexto muito longo ou raciocínio complexo
   * NOTA: Usar com parcimônia devido ao custo elevado
   */
  AGENT_MAX: {
    provider: 'anthropic',
    modelName: 'claude-opus-4-20250514', // Trocar para versão correta quando disponível
    temperature: 0.9,
    maxTokens: 4096,
    description: 'Raciocínio complexo e contexto extenso - Claude Opus',
    costPer1kTokens: {
      input: 0.015, // Claude Opus é o mais caro
      output: 0.075,
    },
  },
};

/**
 * Resolve a configuração de um perfil de modelo
 * @param profile - Perfil do modelo
 * @returns Configuração do modelo
 */
export function resolveModel(profile: LlmProfile): LlmModelConfig {
  return LLM_PROFILES[profile];
}

/**
 * Obtém o perfil adequado baseado em flags de risco
 * @param baseProfile - Perfil base/padrão
 * @param riskFlags - Flags de risco detectadas
 * @returns Perfil ajustado para o contexto
 */
export function selectProfileByRisk(
  baseProfile: LlmProfile,
  riskFlags?: {
    crisis?: boolean;
    selfHarm?: boolean;
    violence?: boolean;
  }
): LlmProfile {
  // Se há flags de crise, sempre usar CRISIS_SAFE
  if (riskFlags?.crisis || riskFlags?.selfHarm || riskFlags?.violence) {
    return 'CRISIS_SAFE';
  }

  return baseProfile;
}

/**
 * Estima o custo de uma chamada de IA
 * @param profile - Perfil do modelo usado
 * @param inputTokens - Número de tokens de input
 * @param outputTokens - Número de tokens de output
 * @returns Custo estimado em USD
 */
export function estimateCost(
  profile: LlmProfile,
  inputTokens: number,
  outputTokens: number
): number {
  const config = resolveModel(profile);
  if (!config.costPer1kTokens) return 0;

  const inputCost = (inputTokens / 1000) * config.costPer1kTokens.input;
  const outputCost = (outputTokens / 1000) * config.costPer1kTokens.output;

  return inputCost + outputCost;
}

/**
 * Lista todos os perfis disponíveis
 */
export function listProfiles(): LlmProfile[] {
  return Object.keys(LLM_PROFILES) as LlmProfile[];
}

/**
 * Obtém informações de todos os perfis
 */
export function getProfilesInfo(): Record<LlmProfile, Omit<LlmModelConfig, 'costPer1kTokens'>> {
  const result: Partial<Record<LlmProfile, Omit<LlmModelConfig, 'costPer1kTokens'>>> = {};

  for (const profile of listProfiles()) {
    const config = resolveModel(profile);
    const { costPer1kTokens: _costPer1kTokens, ...rest } = config;
    result[profile] = rest;
  }

  return result as Record<LlmProfile, Omit<LlmModelConfig, 'costPer1kTokens'>>;
}

/**
 * Valida se um provider está disponível (tem API key configurada)
 * @param provider - Provider a validar
 * @returns true se o provider está configurado
 */
export function isProviderAvailable(provider: LlmProvider): boolean {
  switch (provider) {
    case 'gemini':
      // Gemini agora usa Edge Function (chat-gemini) - sempre disponível se Supabase configurado
      // A API key está segura no servidor, não precisa verificar EXPO_PUBLIC_GEMINI_API_KEY
      return !!process.env.EXPO_PUBLIC_SUPABASE_URL;
    case 'openai':
      return !!process.env.EXPO_PUBLIC_OPENAI_API_KEY;
    case 'anthropic':
      return !!process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY;
    default:
      return false;
  }
}

/**
 * Obtém providers disponíveis (com API keys configuradas)
 */
export function getAvailableProviders(): LlmProvider[] {
  const providers: LlmProvider[] = ['gemini', 'openai', 'anthropic'];
  return providers.filter(isProviderAvailable);
}

/**
 * Valida se um perfil pode ser usado (provider disponível)
 * @param profile - Perfil a validar
 * @returns true se o perfil pode ser usado
 */
export function isProfileAvailable(profile: LlmProfile): boolean {
  const config = resolveModel(profile);
  return isProviderAvailable(config.provider);
}
