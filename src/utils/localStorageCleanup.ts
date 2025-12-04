/**
 * Utilitário de limpeza de dados locais (LGPD Compliant)
 *
 * Usado APENAS após confirmação de deleção bem-sucedida no servidor.
 * Garante que dados locais também são removidos conforme LGPD Art. 18.
 *
 * Optamos por limpar inclusive tema e analytics por privacidade (LGPD).
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

import { logger } from './logger';

/**
 * Chaves de AsyncStorage que armazenam dados do usuário
 * Mapeadas de acordo com o uso no projeto
 */
export const LOCAL_STORAGE_KEYS = {
  // ===== Usuário e perfil =====
  USER: 'nath_user',
  USER_PROFILE: 'nath_user_profile',

  // ===== Wellness =====
  WELLNESS_PROFILE: 'nath_wellness_profile',
  WELLNESS_CONSENT: 'nath_wellness_consent',
  WELLNESS_CHECKINS: 'nath_wellness_checkins',
  ONBOARDING_INCOMPLETE: 'nath_onboarding_incomplete',

  // ===== Onboarding =====
  ONBOARDING_DATA: 'nath_onboarding_data',
  ONBOARDING_COMPLETED: 'nath_onboarding_completed',
  ONBOARDING_STEP: 'nath_onboarding_step',
  TERMS_PRIVACY: 'nath_terms_privacy',

  // ===== Chat e conteúdo =====
  CHAT_HISTORY: '@nossa_maternidade:chat_history',
  CONTENT_RECOMMENDATIONS: 'nath_content_recommendations_cache',

  // ===== Tema (limpar por privacidade LGPD) =====
  THEME_MODE: '@nossa_maternidade:theme_mode',

  // ===== Analytics (limpar por privacidade LGPD) =====
  ANALYTICS_SESSION: '@analytics_session_id',
  ANALYTICS_EVENTS: '@analytics_events',
  ANALYTICS_USER_ID: '@user_id',
  RETENTION_METRICS: '@retention:metrics',
  RETENTION_LAST_CALC: '@retention:last_calculation',

  // ===== LGPD =====
  LGPD_CONSENTS: 'lgpd_consents',

  // ===== Legado (pode não existir) =====
  GEMINI_API_KEY: '@nossa_maternidade:gemini_api_key',
} as const;

/**
 * Chaves do SecureStore (apenas mobile)
 * Contêm dados sensíveis criptografados
 */
const SECURE_STORE_KEYS = [
  'nath_user_profile',
  // Tokens do Supabase são gerenciados pelo supabaseSecureStorage
] as const;

/**
 * Limpa TODOS os dados locais do dispositivo
 *
 * IMPORTANTE: Esta função deve ser chamada SOMENTE após
 * confirmação de deleção bem-sucedida no servidor.
 *
 * @returns Promise<void> - Não propaga erros (best-effort)
 */
export async function clearAllLocalData(): Promise<void> {
  try {
    // 1. Limpar AsyncStorage
    const asyncKeys = Object.values(LOCAL_STORAGE_KEYS);
    await AsyncStorage.multiRemove(asyncKeys);
    logger.info('[LocalCleanup] AsyncStorage limpo', { keysCount: asyncKeys.length });

    // 2. Limpar SecureStore (apenas mobile - web não suporta)
    if (Platform.OS !== 'web') {
      for (const key of SECURE_STORE_KEYS) {
        try {
          await SecureStore.deleteItemAsync(key);
        } catch {
          // Ignorar se chave não existe - não é erro
        }
      }
      logger.info('[LocalCleanup] SecureStore limpo');
    }

    logger.info('[LocalCleanup] Limpeza completa concluída');
  } catch (error) {
    // Não propagar erro - limpeza local é best-effort
    // O servidor já confirmou a deleção, então o mais importante já foi feito
    logger.error('[LocalCleanup] Erro ao limpar dados locais', error);
  }
}

/**
 * Retorna lista de todas as chaves de armazenamento local
 * Útil para debug e auditoria
 */
export function getLocalStorageKeys(): string[] {
  return Object.values(LOCAL_STORAGE_KEYS);
}
