/**
 * Platform-Specific Helpers - Nossa Maternidade
 * Helpers específicos para iOS e Android com adaptação automática
 * @version 1.0.0
 */

import * as Haptics from 'expo-haptics';
import { Platform, Dimensions, PixelRatio } from 'react-native';

import { Tokens } from './tokens';

const { width: SCREEN_WIDTH, height: _SCREEN_HEIGHT } = Dimensions.get('window');

// ======================
// 📐 TYPES
// ======================

export interface SafeAreaInsets {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

// ======================
// 🎯 PLATFORM DETECTION
// ======================

export const isIOS = Platform.OS === 'ios';
export const isAndroid = Platform.OS === 'android';
export const isWeb = Platform.OS === 'web';

// ======================
// 📱 SAFE AREA HELPERS
// ======================

/**
 * Safe area insets padrão por plataforma
 * iOS: notch + home indicator
 * Android: status bar apenas
 */
export const getDefaultSafeAreaInsets = (): SafeAreaInsets => {
  if (isIOS) {
    return {
      top: 44, // Notch height (iPhone X+)
      bottom: 34, // Home indicator height
      left: 0,
      right: 0,
    };
  }

  if (isAndroid) {
    return {
      top: 24, // Status bar height (Android 11+)
      bottom: 0, // No home indicator
      left: 0,
      right: 0,
    };
  }

  return { top: 0, bottom: 0, left: 0, right: 0 };
};

/**
 * Safe area padding horizontal padrão
 */
export const getSafeAreaHorizontal = (): number => {
  return Tokens.safeArea.horizontal; // 16px
};

/**
 * Safe area padding completo (top + bottom + horizontal)
 */
export const getSafeAreaPadding = (insets?: SafeAreaInsets) => {
  const defaultInsets = insets || getDefaultSafeAreaInsets();

  return {
    paddingTop: defaultInsets.top,
    paddingBottom: defaultInsets.bottom,
    paddingLeft: getSafeAreaHorizontal(),
    paddingRight: getSafeAreaHorizontal(),
  };
};

// ======================
// 🔤 TYPOGRAPHY HELPERS
// ======================

/**
 * Font families nativas por plataforma
 * iOS: SF Pro (System)
 * Android: Roboto
 */
export const PlatformFonts = {
  body: Platform.select({
    ios: 'System', // SF Pro
    android: 'Roboto',
    default: 'System',
  }),
  regular: Platform.select({
    ios: 'System',
    android: 'Roboto',
    default: 'System',
  }),
  medium: Platform.select({
    ios: 'System',
    android: 'Roboto-Medium',
    default: 'System',
  }),
  semibold: Platform.select({
    ios: 'System',
    android: 'Roboto-Medium', // Android não tem semibold, usa medium
    default: 'System',
  }),
  bold: Platform.select({
    ios: 'System',
    android: 'Roboto-Bold',
    default: 'System',
  }),
} as const;

/**
 * Helper para obter font family baseado no weight
 */
export const getFontFamily = (weight: keyof typeof Tokens.typography.weights): string => {
  switch (weight) {
    case 'light':
      return PlatformFonts.body;
    case 'regular':
      return PlatformFonts.regular;
    case 'medium':
      return PlatformFonts.medium;
    case 'semibold':
      return PlatformFonts.semibold;
    case 'bold':
      return PlatformFonts.bold;
    default:
      return PlatformFonts.regular;
  }
};

/**
 * Helper para Dynamic Type (iOS) e Text Scaling (Android)
 * Retorna fontSize ajustado baseado nas preferências do sistema
 */
export const getScaledFontSize = (baseSize: number, scaleFactor?: number): number => {
  if (isWeb) {
    return baseSize;
  }

  // iOS Dynamic Type e Android Text Scaling
  const systemFontScale = PixelRatio.getFontScale();
  const scale = scaleFactor || systemFontScale;

  // Limitar escala entre 0.8x e 1.3x para evitar textos muito pequenos/grandes
  const clampedScale = Math.max(0.8, Math.min(1.3, scale));

  return Math.round(baseSize * clampedScale);
};

// ======================
// 🌑 SHADOW/ELEVATION HELPERS
// ======================

/**
 * Converte shadow tokens para formato iOS (shadowColor, shadowOffset, etc)
 */
export const getIOSShadow = (
  shadowKey: keyof typeof Tokens.shadows
): {
  shadowColor: string;
  shadowOffset: { width: number; height: number };
  shadowOpacity: number;
  shadowRadius: number;
} => {
  const shadow = Tokens.shadows[shadowKey];

  if (isWeb) {
    // Web usa boxShadow, retornar valores para compatibilidade
    return {
      shadowColor: Tokens.colors.neutral[900], // Preto do design system
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    };
  }

  // iOS usa shadowColor, shadowOffset, shadowOpacity, shadowRadius
  if ('shadowColor' in shadow && 'shadowOffset' in shadow) {
    return {
      shadowColor: shadow.shadowColor || '#000000',
      shadowOffset: shadow.shadowOffset || { width: 0, height: 0 },
      shadowOpacity: shadow.shadowOpacity || 0.1,
      shadowRadius: shadow.shadowRadius || 0,
    };
  }

  // Fallback padrão (usando ColorTokens para evitar hardcoded)
  return {
    shadowColor: Tokens.colors.neutral[900], // Preto do design system
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  };
};

/**
 * Converte shadow tokens para formato Android (elevation)
 */
export const getAndroidElevation = (
  shadowKey: keyof typeof Tokens.shadows
): { elevation: number } => {
  const shadow = Tokens.shadows[shadowKey];

  if (isWeb) {
    return { elevation: 0 };
  }

  // Android usa elevation (0-24)
  if ('elevation' in shadow) {
    return { elevation: shadow.elevation || 0 };
  }

  // Mapear shadow keys para elevation padrão
  const elevationMap: Record<string, number> = {
    none: 0,
    sm: 1,
    md: 2,
    lg: 4,
    xl: 8,
    '2xl': 12,
    inner: -1,
    premium: 12,
    card: 4,
    cardHover: 8,
    soft: 2,
  };

  return { elevation: elevationMap[shadowKey] || 0 };
};

/**
 * Helper unificado que retorna shadow/elevation baseado na plataforma
 */
export const getPlatformShadow = (
  shadowKey: keyof typeof Tokens.shadows
): ReturnType<typeof getIOSShadow> | ReturnType<typeof getAndroidElevation> => {
  if (isIOS || isWeb) {
    return getIOSShadow(shadowKey);
  }

  return getAndroidElevation(shadowKey);
};

// ======================
// 📳 HAPTIC FEEDBACK HELPERS
// ======================

/**
 * Haptic feedback padrão por plataforma
 * iOS: Light (mais sutil)
 * Android: Medium (mais perceptível)
 */
export const PlatformHaptics = {
  /**
   * Feedback para botões padrão
   */
  buttonPress: () => {
    if (isIOS) {
      return Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    if (isAndroid) {
      return Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    return undefined;
  },

  /**
   * Feedback para seleções (tabs, chips, switches)
   */
  selection: () => {
    return Haptics.selectionAsync();
  },

  /**
   * Feedback para ações importantes (confirmações, salvamentos)
   */
  important: () => {
    if (isIOS) {
      return Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    if (isAndroid) {
      return Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }
    return undefined;
  },

  /**
   * Feedback para erros
   */
  error: () => {
    return Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  },

  /**
   * Feedback para sucesso
   */
  success: () => {
    return Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  },

  /**
   * Feedback para avisos
   */
  warning: () => {
    return Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  },
};

/**
 * Helper seguro para executar haptic (não quebra se não suportado)
 */
export const triggerPlatformHaptic = async (
  hapticType: keyof typeof PlatformHaptics
): Promise<void> => {
  try {
    await PlatformHaptics[hapticType]();
  } catch (_error) {
    // Silently fail se haptic não for suportado
  }
};

// ======================
// 👆 TOUCH TARGET HELPERS
// ======================

/**
 * Touch target mínimo por plataforma
 * iOS: 44pt (Apple HIG)
 * Android: 48dp (Material Design)
 */
export const getMinTouchTarget = (): number => {
  if (isIOS) {
    return 44; // pt
  }
  if (isAndroid) {
    return 48; // dp
  }
  return 44; // Web default
};

/**
 * Valida se um componente tem touch target suficiente
 */
export const hasValidTouchTarget = (width: number, height: number): boolean => {
  const minSize = getMinTouchTarget();
  return width >= minSize && height >= minSize;
};

// ======================
// 🎨 NAVIGATION PATTERNS
// ======================

/**
 * Padrões de navegação por plataforma
 */
export const PlatformNavigation = {
  /**
   * Altura da tab bar
   */
  tabBarHeight: Platform.select({
    ios: 49, // iOS tab bar padrão
    android: 56, // Material Design bottom navigation
    default: 49,
  }),

  /**
   * Altura da navigation bar (header)
   */
  headerHeight: Platform.select({
    ios: 44, // iOS navigation bar padrão
    android: 56, // Material Design app bar
    default: 44,
  }),

  /**
   * Padding horizontal padrão em telas
   */
  screenPadding: Platform.select({
    ios: 16,
    android: 16,
    default: 16,
  }),
} as const;

// ======================
// 📐 RESPONSIVE HELPERS
// ======================

/**
 * Breakpoints por plataforma
 */
export const PlatformBreakpoints = {
  small: Platform.select({
    ios: 375, // iPhone SE, iPhone 8
    android: 360, // Small Android phones
    default: 360,
  }),
  medium: Platform.select({
    ios: 390, // iPhone 12, 13
    android: 411, // Pixel 5
    default: 390,
  }),
  large: Platform.select({
    ios: 428, // iPhone 14 Pro Max
    android: 480, // Large Android phones
    default: 428,
  }),
  tablet: Platform.select({
    ios: 768, // iPad
    android: 600, // Android tablets
    default: 768,
  }),
} as const;

/**
 * Verifica se é um dispositivo pequeno
 */
export const isSmallDevice = (): boolean => {
  return SCREEN_WIDTH < PlatformBreakpoints.medium;
};

/**
 * Verifica se é um tablet
 */
export const isTabletDevice = (): boolean => {
  return SCREEN_WIDTH >= PlatformBreakpoints.tablet;
};

// ======================
// 🎯 EXPORTS
// ======================

export default {
  // Platform detection
  isIOS,
  isAndroid,
  isWeb,

  // Safe areas
  getDefaultSafeAreaInsets,
  getSafeAreaHorizontal,
  getSafeAreaPadding,

  // Typography
  PlatformFonts,
  getFontFamily,
  getScaledFontSize,

  // Shadows/Elevation
  getIOSShadow,
  getAndroidElevation,
  getPlatformShadow,

  // Haptics
  PlatformHaptics,
  triggerPlatformHaptic,

  // Touch targets
  getMinTouchTarget,
  hasValidTouchTarget,

  // Navigation
  PlatformNavigation,

  // Responsive
  PlatformBreakpoints,
  isSmallDevice,
  isTabletDevice,
};
