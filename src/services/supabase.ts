import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

import { logger } from '@/utils/logger';

import {
  supabaseSecureStorage,
  migrateSupabaseSessionToSecureStore,
} from '../utils/supabaseSecureStorage';

// Get Supabase URL and anon key from Expo config or environment
const supabaseUrl =
  Constants.expoConfig?.extra?.supabaseUrl || process.env.EXPO_PUBLIC_SUPABASE_URL || '';

const supabaseAnonKey =
  Constants.expoConfig?.extra?.supabaseAnonKey || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

// Validação das chaves
const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

if (!isSupabaseConfigured) {
  logger.warn(
    '⚠️ Supabase não configurado. Adicione supabaseUrl e supabaseAnonKey em app.json.extra ou variáveis de ambiente.'
  );
}

// Migrar sessões existentes do AsyncStorage para SecureStore (executa uma vez)
// Isso é seguro executar múltiplas vezes, pois verifica antes de migrar
let migrationInitiated = false;
export const initSecureStorageMigration = async () => {
  if (!migrationInitiated && isSupabaseConfigured) {
    migrationInitiated = true;
    try {
      await migrateSupabaseSessionToSecureStore();
    } catch (error) {
      logger.error('[Supabase] Erro na migração para SecureStore', error);
      // Não lançar erro - migração não deve bloquear o app
    }
  }
};

// Create Supabase client with SecureStore for session persistence (seguro)
// Usa valores vazios se não configurado para evitar erros
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      storage: supabaseSecureStorage, // ✅ Usando SecureStore em vez de AsyncStorage
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);

// Helper para verificar se Supabase está configurado
export const isSupabaseReady = () => isSupabaseConfigured;

export default supabase;
