/**
 * Android Platform Adapter - Nossa Maternidade
 * Adaptação automática de tokens para Android nativo (Material Design 3)
 * @version 1.0.0
 */

import { TextStyle, ViewStyle } from 'react-native';

import {
  getAndroidElevation,
  getFontFamily,
  getScaledFontSize,
  PlatformFonts,
  getMinTouchTarget,
} from '../platform';
import { Tokens } from '../tokens';

// ======================
// 🎨 COLOR ADAPTERS
// ======================

/**
 * Adapter para cores Android
 * Android Material Design 3 usa cores mais vibrantes
 */
export const AndroidColors = {
  ...Tokens.colors,
  // Android-specific color adjustments podem ser adicionados aqui
};

// ======================
// ✍️ TYPOGRAPHY ADAPTERS
// ======================

/**
 * Adapter para tipografia Android
 * Usa Roboto com Text Scaling
 */
export const AndroidTypography = {
  ...Tokens.typography,
  fonts: PlatformFonts,

  /**
   * Cria estilo de texto Android com Text Scaling
   */
  createTextStyle: (
    size: keyof typeof Tokens.typography.sizes,
    weight: keyof typeof Tokens.typography.weights = 'regular',
    allowFontScaling: boolean = true
  ): TextStyle => {
    const baseSize = Tokens.typography.sizes[size];
    const fontSize = allowFontScaling ? getScaledFontSize(baseSize) : baseSize;

    return {
      fontSize,
      fontFamily: getFontFamily(weight),
      fontWeight: Tokens.typography.weights[weight],
      lineHeight: Tokens.typography.lineHeights[size],
      letterSpacing: Tokens.typography.letterSpacing.normal,
    };
  },

  /**
   * Cria estilo de texto usando TextStyles semânticos
   */
  createSemanticStyle: (
    styleKey: keyof typeof Tokens.textStyles,
    allowFontScaling: boolean = true
  ): TextStyle => {
    const baseStyle = Tokens.textStyles[styleKey];
    const fontSize =
      allowFontScaling && baseStyle.fontSize
        ? getScaledFontSize(baseStyle.fontSize)
        : baseStyle.fontSize;

    return {
      ...baseStyle,
      fontSize,
      fontFamily: PlatformFonts.regular,
    };
  },
};

// ======================
// 🌑 ELEVATION ADAPTERS
// ======================

/**
 * Adapter para elevation Android
 * Android usa elevation (0-24) em vez de shadows
 */
export const AndroidElevation = {
  ...Tokens.shadows,

  /**
   * Cria estilo de elevation Android
   * Material Design 3 elevation system
   */
  createElevation: (shadowKey: keyof typeof Tokens.shadows): ViewStyle => {
    return getAndroidElevation(shadowKey);
  },

  /**
   * Mapeamento de shadow keys para elevation Material Design
   */
  elevationMap: {
    none: 0,
    sm: 1, // Cards em repouso
    md: 2, // Cards hover
    lg: 4, // Cards ativos
    xl: 8, // Modals
    '2xl': 12, // Dialogs
    inner: 0, // Inner shadows não existem em Android
    premium: 12, // Premium cards
    card: 2, // Cards padrão
    cardHover: 4, // Cards hover
    soft: 1, // Soft elevation
  } as const,
};

// ======================
// 📐 SPACING ADAPTERS
// ======================

/**
 * Adapter para spacing Android
 * Android usa density-independent pixels (dp)
 */
export const AndroidSpacing = {
  ...Tokens.spacing,

  /**
   * Converte spacing token para valor numérico
   */
  get: (key: keyof typeof Tokens.spacing): number => {
    return Tokens.spacing[key];
  },
};

// ======================
// 🔲 BORDER RADIUS ADAPTERS
// ======================

/**
 * Adapter para border radius Android
 * Android Material Design 3 usa valores em dp
 */
export const AndroidRadius = {
  ...Tokens.radius,

  /**
   * Converte radius token para valor numérico
   */
  get: (key: keyof typeof Tokens.radius): number => {
    return Tokens.radius[key];
  },
};

// ======================
// 👆 TOUCH TARGET ADAPTERS
// ======================

/**
 * Adapter para touch targets Android
 * Android mínimo: 48dp (Material Design)
 */
export const AndroidTouchTargets = {
  ...Tokens.touchTargets,
  min: getMinTouchTarget(), // 48dp para Android
};

// ======================
// 🎯 COMPONENT STYLE HELPERS
// ======================

/**
 * Cria estilo completo de botão Android (Material Design 3)
 */
export const createAndroidButtonStyle = (
  _variant: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' = 'primary',
  size: 'sm' | 'md' | 'lg' = 'md'
): ViewStyle => {
  const baseStyle: ViewStyle = {
    borderRadius: AndroidRadius.lg,
    minHeight: AndroidTouchTargets.min,
    ...AndroidElevation.createElevation('md'),
  };

  // Adicionar padding baseado no tamanho
  switch (size) {
    case 'sm':
      return {
        ...baseStyle,
        paddingHorizontal: AndroidSpacing.get('4'),
        paddingVertical: AndroidSpacing.get('2'),
      };
    case 'lg':
      return {
        ...baseStyle,
        paddingHorizontal: AndroidSpacing.get('8'),
        paddingVertical: AndroidSpacing.get('4'),
      };
    default: // md
      return {
        ...baseStyle,
        paddingHorizontal: AndroidSpacing.get('6'),
        paddingVertical: AndroidSpacing.get('3'),
      };
  }
};

/**
 * Cria estilo completo de card Android (Material Design 3)
 */
export const createAndroidCardStyle = (): ViewStyle => {
  return {
    borderRadius: AndroidRadius.card,
    ...AndroidElevation.createElevation('card'),
    backgroundColor: 'transparent', // Será preenchido pelo theme
  };
};

// ======================
// 📦 DEFAULT EXPORT
// ======================

export const AndroidAdapter = {
  colors: AndroidColors,
  typography: AndroidTypography,
  elevation: AndroidElevation,
  spacing: AndroidSpacing,
  radius: AndroidRadius,
  touchTargets: AndroidTouchTargets,
  createButtonStyle: createAndroidButtonStyle,
  createCardStyle: createAndroidCardStyle,
};

export default AndroidAdapter;
