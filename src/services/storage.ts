import AsyncStorage from '@react-native-async-storage/async-storage';

import { logger } from '@/utils/logger';

/**
 * Wrapper utilitário para AsyncStorage que substitui localStorage
 * Todas as operações são assíncronas
 */

export interface UserProfile {
  id?: string;
  name?: string;
  email?: string;
  [key: string]: unknown;
}

export interface ChatMessage {
  id?: string;
  content: string;
  timestamp: Date;
  role: 'user' | 'assistant';
  [key: string]: unknown;
}

const STORAGE_KEYS = {
  USER: 'nath_user',
  CHAT_HISTORY: 'nathia_history',
  THEME: 'theme',
  API_KEY: 'gemini_api_key',
} as const;

export const storage = {
  // User Profile
  async getUser(): Promise<UserProfile | null> {
    try {
      const user = await AsyncStorage.getItem(STORAGE_KEYS.USER);
      return user ? JSON.parse(user) : null;
    } catch (error) {
      logger.error('Error getting user', error, {
        service: 'StorageService',
        action: 'getUser',
      });
      return null;
    }
  },

  async saveUser(user: UserProfile): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    } catch (error) {
      logger.error('Error saving user', error, {
        service: 'StorageService',
        action: 'saveUser',
      });
      throw error;
    }
  },

  async removeUser(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.USER);
    } catch (error) {
      logger.error('Error removing user', error, {
        service: 'StorageService',
        action: 'removeUser',
      });
      throw error;
    }
  },

  // Chat History
  async getChatHistory(): Promise<ChatMessage[] | null> {
    try {
      const history = await AsyncStorage.getItem(STORAGE_KEYS.CHAT_HISTORY);
      if (!history) return null;
      const parsed = JSON.parse(history);
      return parsed.map((msg: Record<string, unknown>) => ({
        ...msg,
        timestamp: new Date(msg.timestamp as string),
      })) as ChatMessage[];
    } catch (error) {
      logger.error('Error getting chat history', error, {
        service: 'StorageService',
        action: 'getChatHistory',
      });
      return null;
    }
  },

  async saveChatHistory(messages: ChatMessage[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.CHAT_HISTORY, JSON.stringify(messages));
    } catch (error) {
      logger.error('Error saving chat history', error, {
        service: 'StorageService',
        action: 'saveChatHistory',
      });
      throw error;
    }
  },

  async clearChatHistory(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.CHAT_HISTORY);
    } catch (error) {
      logger.error('Error clearing chat history', error, {
        service: 'StorageService',
        action: 'clearChatHistory',
      });
      throw error;
    }
  },

  // Theme
  async getTheme(): Promise<'light' | 'dark' | null> {
    try {
      const theme = await AsyncStorage.getItem(STORAGE_KEYS.THEME);
      return theme as 'light' | 'dark' | null;
    } catch (error) {
      logger.error('Error getting theme', error, {
        service: 'StorageService',
        action: 'getTheme',
      });
      return null;
    }
  },

  async saveTheme(theme: 'light' | 'dark'): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.THEME, theme);
    } catch (error) {
      logger.error('Error saving theme', error, {
        service: 'StorageService',
        action: 'saveTheme',
      });
      throw error;
    }
  },

  // API Key
  async getApiKey(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.API_KEY);
    } catch (error) {
      logger.error('Error getting API key', error, {
        service: 'StorageService',
        action: 'getApiKey',
      });
      return null;
    }
  },

  async saveApiKey(apiKey: string): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.API_KEY, apiKey);
    } catch (error) {
      logger.error('Error saving API key', error, {
        service: 'StorageService',
        action: 'saveApiKey',
      });
      throw error;
    }
  },

  // Generic methods
  async getItem(key: string): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(key);
    } catch (error) {
      logger.error('Error getting item', error, {
        service: 'StorageService',
        action: 'getItem',
        key,
      });
      return null;
    }
  },

  async setItem(key: string, value: string): Promise<void> {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      logger.error('Error setting item', error, {
        service: 'StorageService',
        action: 'setItem',
        key,
      });
      throw error;
    }
  },

  async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      logger.error('Error removing item', error, {
        service: 'StorageService',
        action: 'removeItem',
        key,
      });
      throw error;
    }
  },

  async clear(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      logger.error('Error clearing storage', error, {
        service: 'StorageService',
        action: 'clear',
      });
      throw error;
    }
  },
};

export default storage;
