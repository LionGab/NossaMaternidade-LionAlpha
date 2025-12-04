/**
 * Theme System - Nossa Maternidade
 * Exportações centralizadas do Design System
 */

// Tokens
export {
  // Color tokens
  ColorTokens,
  LightTheme,
  DarkTheme,

  // Typography
  Typography,

  // Spacing & Layout
  Spacing,
  Radius,
  Shadows,

  // Animations
  Animations,

  // Sizes
  TouchTargets,
  IconSizes,

  // Layout
  ZIndex,
  Breakpoints,
  SafeArea,

  // Responsive helpers
  isSmallDevice,
  isMediumDevice,
  isLargeDevice,
  isTablet,

  // Default export
  Tokens,
  default as Theme,
} from './tokens';

// Context & Hooks
export {
  ThemeProvider,
  useTheme,
  useThemeColors,
  useIsDark,
  useThemedStyles,
  type ThemeMode,
  type ActiveTheme,
  type ThemeColors,
  type ThemeContextValue,
} from './ThemeContext';

// Re-export legacy Colors aliases from tokens for backwards compatibility
// TODO: Remove after full migration to useTheme() hook
import { ColorTokens, LightTheme, DarkTheme } from './tokens';

/**
 * Legacy Colors export for backwards compatibility
 * @deprecated Use useTheme() hook and colors from ThemeContext instead
 */
export const Colors = {
  brand: {
    primary: ColorTokens.brand.primary, // #E91E63 (Rosa Magenta)
    secondary: ColorTokens.brand.secondary, // #9C27B0 (Roxo)
    bg: ColorTokens.brand.bg, // #FAFAFA (Off-white)
    text: ColorTokens.brand.text, // #212121 (Texto escuro)
    pink: ColorTokens.brand.pink, // #E91E63 (Rosa Magenta)
    purple: ColorTokens.brand.purple, // #9C27B0 (Roxo)
    warm: ColorTokens.neutral[50], // Substituído #F8F9FA
    dark: ColorTokens.neutral[700], // Substituído #5D4E4B
  },
  background: {
    canvas: DarkTheme.background.canvas,
    card: DarkTheme.background.card,
    sleep: ColorTokens.neutral[900], // Substituído #111827
    pause: DarkTheme.background.elevated,
    light: LightTheme.background.canvas,
    dark: DarkTheme.background.canvas,
    tab: DarkTheme.background.canvas,
  },
  text: {
    primary: DarkTheme.text.primary,
    secondary: DarkTheme.text.secondary,
    tertiary: DarkTheme.text.tertiary,
    muted: DarkTheme.text.tertiary,
    dark: LightTheme.text.primary,
  },
  primary: {
    main: ColorTokens.primary[500],
    light: ColorTokens.primary[100],
    dark: ColorTokens.primary[700],
    hero: ColorTokens.primary[500],
  },
  accent: {
    green: ColorTokens.success[500],
    orange: ColorTokens.warning[500],
    pink: ColorTokens.secondary[400],
    blue: ColorTokens.primary[500],
  },
  border: {
    light: LightTheme.border.light,
    medium: LightTheme.border.medium,
    dark: DarkTheme.border.light,
    subtle: ColorTokens.overlay.card, // Substituído rgba
  },
  status: {
    success: ColorTokens.success[500],
    warning: ColorTokens.warning[500],
    error: ColorTokens.error[500],
    info: ColorTokens.info[500],
  },
  progress: {
    active: ColorTokens.primary[500],
    inactive: ColorTokens.overlay.light, // Substituído rgba
  },
} as const;

/**
 * @deprecated Use useTheme() with isDark check instead
 */
export const LightColors = {
  background: LightTheme.background,
  text: LightTheme.text,
  primary: LightTheme.primary,
  border: LightTheme.border,
} as const;

/**
 * @deprecated Use useTheme() with isDark check instead
 */
export const DarkColors = {
  background: DarkTheme.background,
  text: DarkTheme.text,
  primary: DarkTheme.primary,
  border: DarkTheme.border,
} as const;

// Platform Helpers
export {
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
  isSmallDevice as isSmallDevicePlatform,
  isTabletDevice,

  // Default export
  default as PlatformHelpers,
} from './platform';

// Platform Adapters
export {
  iOSAdapter,
  iOSColors,
  iOSTypography,
  iOSShadows,
  iOSSpacing,
  iOSRadius,
  iOSTouchTargets,
  createiOSButtonStyle,
  createiOSCardStyle,
  default as iOS,
} from './adapters/ios';

export {
  AndroidAdapter,
  AndroidColors,
  AndroidTypography,
  AndroidElevation,
  AndroidSpacing,
  AndroidRadius,
  AndroidTouchTargets,
  createAndroidButtonStyle,
  createAndroidCardStyle,
  default as Android,
} from './adapters/android';
