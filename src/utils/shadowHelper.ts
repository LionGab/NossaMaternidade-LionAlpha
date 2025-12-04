/**
 * Shadow Helper - Universal Shadow System
 * Garante compatibilidade Web e Native sem warnings
 */

import { Platform, ViewStyle } from 'react-native';

import { ColorTokens } from '@/theme/tokens';

// Cor padrão de shadow usando tokens
const DEFAULT_SHADOW_COLOR = ColorTokens.neutral[900]; // #171717

export interface ShadowConfig {
  offset: { width: number; height: number };
  opacity: number;
  radius: number;
  elevation: number;
  color?: string;
}

/**
 * Cria estilo de shadow compatível com Web e Native
 * No web: usa boxShadow
 * No native: usa shadow* props
 */
export function createShadowStyle(config: ShadowConfig): ViewStyle {
  const { offset, opacity, radius, elevation, color = DEFAULT_SHADOW_COLOR } = config;

  if (Platform.OS === 'web') {
    const { width: x, height: y } = offset;
    const shadowColor =
      typeof color === 'string'
        ? color.replace('rgb', 'rgba').replace(')', `, ${opacity})`)
        : `rgba(23, 23, 23, ${opacity})`; // #171717 em RGB

    return {
      boxShadow: `${x}px ${y}px ${radius}px 0px ${shadowColor}`,
    };
  }

  // React Native
  return {
    shadowColor: color,
    shadowOffset: offset,
    shadowOpacity: opacity,
    shadowRadius: radius,
    elevation,
  };
}

/**
 * Helper para criar shadow a partir de tokens
 */
export function getShadowFromToken(
  token: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'premium' | 'card' | 'cardHover' | 'soft',
  color?: string
): ViewStyle {
  const shadows: Record<string, ShadowConfig> = {
    sm: { offset: { width: 0, height: 1 }, opacity: 0.05, radius: 2, elevation: 1 },
    md: { offset: { width: 0, height: 2 }, opacity: 0.08, radius: 4, elevation: 2 },
    lg: { offset: { width: 0, height: 4 }, opacity: 0.1, radius: 8, elevation: 4 },
    xl: { offset: { width: 0, height: 8 }, opacity: 0.12, radius: 16, elevation: 8 },
    '2xl': { offset: { width: 0, height: 12 }, opacity: 0.15, radius: 24, elevation: 12 },
    premium: {
      offset: { width: 0, height: 10 },
      opacity: 0.4,
      radius: 20,
      elevation: 12,
      color: ColorTokens.accent.ocean,
    },
    card: { offset: { width: 0, height: 4 }, opacity: 0.1, radius: 6, elevation: 4 },
    cardHover: { offset: { width: 0, height: 10 }, opacity: 0.15, radius: 15, elevation: 8 },
    soft: { offset: { width: 0, height: 2 }, opacity: 0.05, radius: 8, elevation: 2 },
  };

  const config = shadows[token];
  if (!config) {
    return {};
  }

  return createShadowStyle({
    ...config,
    color: color || config.color,
  });
}
