/**
 * SecureStorage Adapter for Supabase
 * Adaptador SecureStore compatível com a interface esperada pelo Supabase
 *
 * O Supabase espera uma interface de storage com métodos:
 * - getItem(key: string): Promise<string | null>
 * - setItem(key: string, value: string): Promise<void>
 * - removeItem(key: string): Promise<void>
 *
 * Este adaptador usa expo-secure-store para armazenar dados sensíveis de forma criptografada
 * em plataformas nativas, e AsyncStorage no web (pois expo-secure-store não funciona no web).
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

import { logger } from '../utils/logger';

export const secureStorage = {
  /**
   * Obtém um item do SecureStore
   */
  async getItem(key: string): Promise<string | null> {
    try {
      if (Platform.OS === 'web') {
        return await AsyncStorage.getItem(key);
      }
      return await SecureStore.getItemAsync(key);
    } catch (error) {
      logger.error(`[SecureStorage] Erro ao ler do SecureStore (${key})`, error);
      return null;
    }
  },

  /**
   * Salva um item no SecureStore
   */
  async setItem(key: string, value: string): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        await AsyncStorage.setItem(key, value);
      } else {
        await SecureStore.setItemAsync(key, value);
      }
    } catch (error) {
      logger.error(`[SecureStorage] Erro ao salvar no SecureStore (${key})`, error);
      throw error;
    }
  },

  /**
   * Remove um item do SecureStore
   */
  async removeItem(key: string): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        await AsyncStorage.removeItem(key);
      } else {
        await SecureStore.deleteItemAsync(key);
      }
    } catch (error) {
      logger.error(`[SecureStorage] Erro ao remover do SecureStore (${key})`, error);
      // Não lançar erro, apenas logar (pode não existir)
    }
  },
};

/**
 * Migra tokens existentes do AsyncStorage para SecureStore
 * Deve ser chamado uma vez na inicialização do app
 * No web, isso é um no-op já que usamos AsyncStorage de qualquer forma
 */
export async function migrateTokensToSecureStore(): Promise<void> {
  // Pular migração no web já que usamos AsyncStorage tanto para armazenamento antigo quanto novo
  if (Platform.OS === 'web') {
    logger.debug('[SecureStorage] Web platform detectada - pulando migração SecureStore');
    return;
  }

  try {
    // Chaves que o Supabase usa para armazenar tokens
    const supabaseKeys = ['sb-auth-token', 'supabase.auth.token'];

    for (const key of supabaseKeys) {
      const value = await AsyncStorage.getItem(key);
      if (value) {
        // Migrar para SecureStore
        await secureStorage.setItem(key, value);
        // Remover do AsyncStorage após migração bem-sucedida
        await AsyncStorage.removeItem(key);
        logger.debug(`[SecureStorage] Token migrado para SecureStore: ${key}`);
      }
    }

    // Também verificar chaves genéricas do Supabase
    const allKeys = await AsyncStorage.getAllKeys();
    const supabaseAuthKeys = allKeys.filter(
      (k) => k.includes('supabase') || k.includes('auth-token')
    );

    for (const key of supabaseAuthKeys) {
      const value = await AsyncStorage.getItem(key);
      if (value) {
        await secureStorage.setItem(key, value);
        await AsyncStorage.removeItem(key);
        logger.debug(`[SecureStorage] Token migrado para SecureStore: ${key}`);
      }
    }
  } catch (error) {
    logger.error('[SecureStorage] Erro ao migrar tokens para SecureStore', error);
    // Não lançar erro - a migração não é crítica
  }
}
