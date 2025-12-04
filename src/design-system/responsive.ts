/**
 * Responsive Design System - Nossa Maternidade
 *
 * Adaptações específicas para iOS e Android
 * Baseado em Apple HIG + Material Design 3
 *
 * @version 1.0
 * @date 2025-11-27
 */

import { Platform } from 'react-native';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CONFIGURAÇÕES POR PLATAFORMA
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const RESPONSIVE = {
  ios: {
    safeArea: true,
    navigation: 'tab-bar' as const, // iOS padrão
    gestures: ['swipe-back', 'long-press'] as const,
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", sans-serif',
  },
  android: {
    safeArea: true,
    navigation: 'bottom-sheet' as const,
    gestures: ['system-back', 'long-press'] as const,
    fontFamily: '"Roboto", "Noto Sans", sans-serif',
  },
  web: {
    safeArea: false,
    navigation: 'web-nav' as const,
    gestures: ['hover', 'click'] as const,
    fontFamily: '"Poppins", "Inter", system-ui, sans-serif',
  },
} as const;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// HELPERS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Retorna configuração da plataforma atual
 */
export function getPlatformConfig() {
  if (Platform.OS === 'ios') {
    return RESPONSIVE.ios;
  }
  if (Platform.OS === 'android') {
    return RESPONSIVE.android;
  }
  return RESPONSIVE.web;
}

/**
 * Retorna se deve usar safe area
 */
export function useSafeArea(): boolean {
  return getPlatformConfig().safeArea;
}

/**
 * Retorna font family da plataforma
 */
export function getPlatformFont(): string {
  return getPlatformConfig().fontFamily;
}
