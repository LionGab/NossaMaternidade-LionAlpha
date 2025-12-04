import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect, useCallback } from 'react';

import { logger } from '../utils/logger';

/**
 * Hook para gerenciar AsyncStorage de forma reativa
 * Similar ao useState, mas persiste no AsyncStorage
 */
export function useAsyncStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => Promise<void>, boolean] {
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [loading, setLoading] = useState(true);

  // Carregar valor inicial
  useEffect(() => {
    const loadStoredValue = async () => {
      try {
        const item = await AsyncStorage.getItem(key);
        if (item !== null) {
          setStoredValue(JSON.parse(item));
        }
      } catch (error) {
        logger.error(`Erro ao carregar ${key}`, error);
      } finally {
        setLoading(false);
      }
    };

    loadStoredValue();
  }, [key]);

  // Função para atualizar valor
  const setValue = useCallback(
    async (value: T | ((val: T) => T)) => {
      try {
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        await AsyncStorage.setItem(key, JSON.stringify(valueToStore));
      } catch (error) {
        logger.error(`Erro ao salvar ${key}`, error);
      }
    },
    [key, storedValue]
  );

  return [storedValue, setValue, loading];
}

export default useAsyncStorage;
