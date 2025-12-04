/**
 * Theme Compatibility Layer
 * Arquivo de compatibilidade para migração gradual do sistema de tema
 * Mapeia exports antigos para o novo sistema de tokens
 */

import {
  ColorTokens,
  LightTheme,
  Typography,
  Spacing,
  Radius,
  Shadows,
  Animations,
  TouchTargets,
} from '../theme/tokens';

// Mapear COLORS do formato antigo para o novo
export const COLORS = {
  // Primary colors
  primary: {
    50: ColorTokens.primary[50],
    100: ColorTokens.primary[100],
    200: ColorTokens.primary[200],
    300: ColorTokens.primary[300],
    400: ColorTokens.primary[500],
    500: ColorTokens.primary[500],
    600: ColorTokens.primary[600],
    700: ColorTokens.primary[700],
    800: ColorTokens.primary[800],
    900: ColorTokens.primary[900],
    gradient: LightTheme.primary.gradient,
    main: LightTheme.primary.main,
    light: LightTheme.primary.light,
    dark: LightTheme.primary.dark,
  },
  // Secondary colors
  secondary: {
    50: ColorTokens.secondary[50],
    100: ColorTokens.secondary[100],
    200: ColorTokens.secondary[200],
    300: ColorTokens.secondary[300],
    400: ColorTokens.secondary[400],
    500: ColorTokens.secondary[500],
    600: ColorTokens.secondary[600],
    700: ColorTokens.secondary[700],
    800: ColorTokens.secondary[800],
    900: ColorTokens.secondary[900],
    gradient: LightTheme.secondary.gradient,
    main: LightTheme.secondary.main,
    light: LightTheme.secondary.light,
    dark: LightTheme.secondary.dark,
  },
  // Neutral colors
  neutral: {
    0: ColorTokens.neutral[0],
    50: ColorTokens.neutral[50],
    100: ColorTokens.neutral[100],
    200: ColorTokens.neutral[200],
    300: ColorTokens.neutral[300],
    400: ColorTokens.neutral[400],
    500: ColorTokens.neutral[500],
    600: ColorTokens.neutral[600],
    700: ColorTokens.neutral[700],
    800: ColorTokens.neutral[800],
    900: ColorTokens.neutral[900],
    950: ColorTokens.neutral[950],
  },
  // Text colors
  text: {
    primary: LightTheme.text.primary,
    secondary: LightTheme.text.secondary,
    tertiary: LightTheme.text.tertiary,
    disabled: LightTheme.text.disabled,
    placeholder: LightTheme.text.placeholder,
    inverse: LightTheme.text.inverse,
    link: LightTheme.text.link,
    success: LightTheme.text.success,
    warning: LightTheme.text.warning,
    error: LightTheme.text.error,
    info: LightTheme.text.info,
  },
  // Background colors
  background: {
    canvas: LightTheme.background.canvas,
    card: LightTheme.background.card,
    elevated: LightTheme.background.elevated,
    input: LightTheme.background.input,
    overlay: LightTheme.background.overlay,
    primary: LightTheme.background.canvas, // Alias para compatibilidade
    gradient: {
      ...LightTheme.background.gradient,
      premium: LightTheme.primary.gradient, // Gradient premium
    },
  },
  // Border colors
  border: {
    light: LightTheme.border.light,
    medium: LightTheme.border.medium,
    dark: LightTheme.border.dark,
    focus: LightTheme.border.focus,
    error: LightTheme.border.error,
    success: LightTheme.border.success,
  },
  // Status colors (com propriedade main e gradient para compatibilidade)
  success: {
    ...ColorTokens.success,
    main: LightTheme.status.success,
    gradient: LightTheme.gradients.success,
  },
  warning: {
    ...ColorTokens.warning,
    main: LightTheme.status.warning,
    gradient: LightTheme.gradients.warning,
  },
  error: {
    ...ColorTokens.error,
    main: LightTheme.status.error,
    gradient: LightTheme.gradients.error,
  },
  info: {
    ...ColorTokens.info,
    main: LightTheme.status.info,
    gradient: LightTheme.gradients.info,
  },
  // Overlay colors
  overlay: {
    ...ColorTokens.overlay,
    glass: 'rgba(255, 255, 255, 0.95)', // Glass effect overlay
  },
};

// Typography - mapear formato antigo
export const TYPOGRAPHY = {
  fonts: Typography.fonts,
  sizes: Typography.sizes,
  lineHeights: Typography.lineHeights,
  letterSpacing: Typography.letterSpacing,
  weights: Typography.weights,
};

// Spacing - mapear formato antigo (com índices numéricos)
export const SPACING = {
  ...Spacing,
  // Adicionar índices numéricos para compatibilidade
  0: Spacing['0'],
  1: Spacing['1'],
  2: Spacing['2'],
  3: Spacing['3'],
  4: Spacing['4'],
  5: Spacing['5'],
  6: Spacing['6'],
  7: Spacing['7'],
  8: Spacing['8'],
  9: Spacing['9'],
  10: Spacing['10'],
  11: Spacing['11'],
  12: Spacing['12'],
  14: Spacing['14'],
  16: Spacing['16'],
  20: Spacing['20'],
  24: Spacing['24'],
  28: Spacing['28'],
  32: Spacing['32'],
} as typeof Spacing & Record<number, number>;

// Radius
export const RADIUS = Radius;

// Shadows
export const SHADOWS = Shadows;

// Animations
export const ANIMATIONS = Animations;

// Touch Targets
export const TOUCH_TARGETS = TouchTargets;

// Default export para compatibilidade
export default {
  COLORS,
  TYPOGRAPHY,
  SPACING,
  RADIUS,
  SHADOWS,
  ANIMATIONS,
  TOUCH_TARGETS,
};
