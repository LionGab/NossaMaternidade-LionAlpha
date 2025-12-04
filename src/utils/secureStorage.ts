import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

import { logger } from './logger';

/**
 * Service for secure storage of sensitive data using expo-secure-store on native
 * and AsyncStorage on web (since expo-secure-store doesn't work on web)
 * Used for API keys, tokens, and other credentials
 */
export const secureStorageService = {
  /**
   * Save a value securely
   * @param key - Storage key
   * @param value - Value to store
   */
  async saveItem(key: string, value: string): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        await AsyncStorage.setItem(key, value);
      } else {
        await SecureStore.setItemAsync(key, value);
      }
    } catch (error) {
      logger.error('Error saving secure item', error, {
        service: 'SecureStorageService',
        action: 'saveItem',
        key,
      });
      throw new Error(`Failed to save secure item: ${error}`);
    }
  },

  /**
   * Retrieve a value from secure storage
   * @param key - Storage key
   * @returns The stored value or null if not found
   */
  async getItem(key: string): Promise<string | null> {
    try {
      if (Platform.OS === 'web') {
        return await AsyncStorage.getItem(key);
      }
      return await SecureStore.getItemAsync(key);
    } catch (error) {
      logger.error('Error retrieving secure item', error, {
        service: 'SecureStorageService',
        action: 'getItem',
        key,
      });
      return null;
    }
  },

  /**
   * Delete a value from secure storage
   * @param key - Storage key
   */
  async deleteItem(key: string): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        await AsyncStorage.removeItem(key);
      } else {
        await SecureStore.deleteItemAsync(key);
      }
    } catch (error) {
      logger.error('Error deleting secure item', error, {
        service: 'SecureStorageService',
        action: 'deleteItem',
        key,
      });
      throw new Error(`Failed to delete secure item: ${error}`);
    }
  },

  /**
   * Check if a key exists in secure storage
   * @param key - Storage key
   * @returns true if key exists, false otherwise
   */
  async hasItem(key: string): Promise<boolean> {
    try {
      const value =
        Platform.OS === 'web'
          ? await AsyncStorage.getItem(key)
          : await SecureStore.getItemAsync(key);
      return value !== null;
    } catch (error) {
      logger.error('Error checking secure item', error, {
        service: 'SecureStorageService',
        action: 'hasItem',
        key,
      });
      return false;
    }
  },
};

export default secureStorageService;
