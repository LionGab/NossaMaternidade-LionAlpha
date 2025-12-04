/**
 * Animation Helper - Cross-Platform Animation Config
 * Garante que animações funcionem em Web e Native
 */

import { Platform } from 'react-native';

export interface AnimationConfig {
  useNativeDriver: boolean;
  duration?: number;
}

/**
 * Retorna configuração de animação compatível com a plataforma
 * No web: sempre useNativeDriver = false
 * No native: pode usar useNativeDriver = true
 */
export function getAnimationConfig(useNativeDriver?: boolean): AnimationConfig {
  if (Platform.OS === 'web') {
    return {
      useNativeDriver: false, // Web não suporta native driver
    };
  }

  // Mobile: usar native driver por padrão (melhor performance)
  return {
    useNativeDriver: useNativeDriver ?? true,
  };
}

/**
 * Helper para criar timing animation com config automático
 */
export function createTimingAnimation(
  _value: unknown,
  toValue: number,
  duration: number = 300,
  useNativeDriver?: boolean
) {
  const config = getAnimationConfig(useNativeDriver);

  return {
    ...config,
    toValue,
    duration,
  };
}

/**
 * Helper para criar spring animation com config automático
 */
export function createSpringAnimation(_value: unknown, toValue: number, useNativeDriver?: boolean) {
  const config = getAnimationConfig(useNativeDriver);

  return {
    ...config,
    toValue,
    tension: 50,
    friction: 7,
  };
}
