import AsyncStorage from '@react-native-async-storage/async-storage';

import { logger } from './logger';
import { ChatMessage } from '../types/chat';

const CHAT_HISTORY_KEY = '@nossa_maternidade:chat_history';
const API_KEY_STORAGE = '@nossa_maternidade:gemini_api_key';

export const storageService = {
  // Chat history operations
  async saveMessages(messages: ChatMessage[]): Promise<void> {
    try {
      const jsonValue = JSON.stringify(messages);
      await AsyncStorage.setItem(CHAT_HISTORY_KEY, jsonValue);
    } catch (error) {
      logger.error('Error saving messages', error, {
        service: 'UtilsStorageService',
        action: 'saveMessages',
      });
      throw error;
    }
  },

  async loadMessages(): Promise<ChatMessage[]> {
    try {
      const jsonValue = await AsyncStorage.getItem(CHAT_HISTORY_KEY);
      return jsonValue != null ? JSON.parse(jsonValue) : [];
    } catch (error) {
      logger.error('Error loading messages', error, {
        service: 'UtilsStorageService',
        action: 'loadMessages',
      });
      return [];
    }
  },

  async clearMessages(): Promise<void> {
    try {
      await AsyncStorage.removeItem(CHAT_HISTORY_KEY);
    } catch (error) {
      logger.error('Error clearing messages', error, {
        service: 'UtilsStorageService',
        action: 'clearMessages',
      });
      throw error;
    }
  },

  // API Key operations
  async saveApiKey(apiKey: string): Promise<void> {
    try {
      await AsyncStorage.setItem(API_KEY_STORAGE, apiKey);
    } catch (error) {
      logger.error('Error saving API key', error, {
        service: 'UtilsStorageService',
        action: 'saveApiKey',
      });
      throw error;
    }
  },

  async loadApiKey(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(API_KEY_STORAGE);
    } catch (error) {
      logger.error('Error loading API key', error, {
        service: 'UtilsStorageService',
        action: 'loadApiKey',
      });
      return null;
    }
  },
};

export default storageService;
