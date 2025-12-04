/**
 * Environment Variables - Type-safe access
 *
 * Tipagem para variáveis de ambiente do Expo
 */

// Variáveis de ambiente públicas (EXPO_PUBLIC_*)
interface PublicEnv {
  // Supabase
  EXPO_PUBLIC_SUPABASE_URL: string;
  EXPO_PUBLIC_SUPABASE_ANON_KEY: string;
  EXPO_PUBLIC_SUPABASE_FUNCTIONS_URL: string;

  // AI APIs
  // EXPO_PUBLIC_GEMINI_API_KEY: REMOVIDA por segurança - chave fica no Supabase Edge Function
  EXPO_PUBLIC_CLAUDE_API_KEY: string;
  EXPO_PUBLIC_OPENAI_API_KEY: string;
  EXPO_PUBLIC_PERPLEXITY_API_KEY?: string;

  // Sentry
  EXPO_PUBLIC_SENTRY_DSN?: string;

  // ElevenLabs (Text-to-Speech)
  EXPO_PUBLIC_ELEVENLABS_API_KEY?: string;

  // OneSignal
  EXPO_PUBLIC_ONESIGNAL_APP_ID?: string;

  // Feature Flags
  EXPO_PUBLIC_ENABLE_AI_FEATURES?: string;
  EXPO_PUBLIC_ENABLE_GAMIFICATION?: string;
  EXPO_PUBLIC_ENABLE_ANALYTICS?: string;

  // Backend
  EXPO_PUBLIC_BACKEND_URL?: string;
}

/**
 * Acessa variável de ambiente com tipo seguro
 */
export function getEnv<K extends keyof PublicEnv>(key: K): PublicEnv[K] | undefined {
  return process.env[key] as PublicEnv[K] | undefined;
}

/**
 * Acessa variável de ambiente obrigatória
 * Lança erro se não estiver definida
 */
export function getRequiredEnv<K extends keyof PublicEnv>(key: K): PublicEnv[K] {
  const value = process.env[key];

  if (!value) {
    throw new Error(`Variável de ambiente obrigatória não definida: ${key}`);
  }

  return value as PublicEnv[K];
}

/**
 * Verifica se variável de ambiente está definida
 */
export function hasEnv(key: keyof PublicEnv): boolean {
  return !!process.env[key];
}

/**
 * Retorna feature flag como boolean
 */
export function isFeatureEnabled(
  key:
    | 'EXPO_PUBLIC_ENABLE_AI_FEATURES'
    | 'EXPO_PUBLIC_ENABLE_GAMIFICATION'
    | 'EXPO_PUBLIC_ENABLE_ANALYTICS'
): boolean {
  return process.env[key] === 'true';
}

/**
 * Configuração de ambiente atual
 */
export const ENV_CONFIG = {
  // Supabase
  supabaseUrl: getEnv('EXPO_PUBLIC_SUPABASE_URL'),
  supabaseAnonKey: getEnv('EXPO_PUBLIC_SUPABASE_ANON_KEY'),
  supabaseFunctionsUrl: getEnv('EXPO_PUBLIC_SUPABASE_FUNCTIONS_URL'),

  // AI APIs
  // geminiApiKey: REMOVIDA - API key está segura no Supabase Edge Function (chat-gemini)
  claudeApiKey: getEnv('EXPO_PUBLIC_CLAUDE_API_KEY'),
  openaiApiKey: getEnv('EXPO_PUBLIC_OPENAI_API_KEY'),
  perplexityApiKey: getEnv('EXPO_PUBLIC_PERPLEXITY_API_KEY'),

  // Sentry
  sentryDsn: getEnv('EXPO_PUBLIC_SENTRY_DSN'),

  // ElevenLabs
  elevenlabsApiKey: getEnv('EXPO_PUBLIC_ELEVENLABS_API_KEY'),

  // OneSignal
  onesignalAppId: getEnv('EXPO_PUBLIC_ONESIGNAL_APP_ID'),

  // Backend
  backendUrl: getEnv('EXPO_PUBLIC_BACKEND_URL') || 'http://localhost:8080',

  // Feature Flags
  features: {
    ai: isFeatureEnabled('EXPO_PUBLIC_ENABLE_AI_FEATURES'),
    gamification: isFeatureEnabled('EXPO_PUBLIC_ENABLE_GAMIFICATION'),
    analytics: isFeatureEnabled('EXPO_PUBLIC_ENABLE_ANALYTICS'),
  },

  // Environment info
  isDev: __DEV__,
  isProd: !__DEV__,
} as const;

export type EnvConfig = typeof ENV_CONFIG;
