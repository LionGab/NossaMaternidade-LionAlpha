/**
 * iOS Platform Adapter - Nossa Maternidade
 * Adaptação automática de tokens para iOS nativo
 * @version 1.0.0
 */

import { TextStyle, ViewStyle } from 'react-native';

import {
  getIOSShadow,
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
 * Adapter para cores iOS
 * iOS usa cores mais suaves e com mais contraste
 */
export const iOSColors = {
  ...Tokens.colors,
  // iOS-specific color adjustments podem ser adicionados aqui
};

// ======================
// ✍️ TYPOGRAPHY ADAPTERS
// ======================

/**
 * Adapter para tipografia iOS
 * Usa SF Pro (System font) com Dynamic Type
 */
export const iOSTypography = {
  ...Tokens.typography,
  fonts: PlatformFonts,

  /**
   * Cria estilo de texto iOS com Dynamic Type
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
// 🌑 SHADOW ADAPTERS
// ======================

/**
 * Adapter para shadows iOS
 * iOS usa shadowColor, shadowOffset, shadowOpacity, shadowRadius
 */
export const iOSShadows = {
  ...Tokens.shadows,

  /**
   * Cria estilo de shadow iOS
   */
  createShadow: (shadowKey: keyof typeof Tokens.shadows): ViewStyle => {
    return getIOSShadow(shadowKey);
  },
};

// ======================
// 📐 SPACING ADAPTERS
// ======================

/**
 * Adapter para spacing iOS
 * iOS usa pontos (pt) como unidade
 */
export const iOSSpacing = {
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
 * Adapter para border radius iOS
 * iOS usa valores em pontos (pt)
 */
export const iOSRadius = {
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
 * Adapter para touch targets iOS
 * iOS mínimo: 44pt (Apple HIG)
 */
export const iOSTouchTargets = {
  ...Tokens.touchTargets,
  min: getMinTouchTarget(), // 44pt para iOS
};

// ======================
// 🎯 COMPONENT STYLE HELPERS
// ======================

/**
 * Cria estilo completo de botão iOS
 */
export const createiOSButtonStyle = (
  _variant: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' = 'primary',
  size: 'sm' | 'md' | 'lg' = 'md'
): ViewStyle => {
  const baseStyle: ViewStyle = {
    borderRadius: iOSRadius.lg,
    minHeight: iOSTouchTargets.min,
    ...iOSShadows.createShadow('md'),
  };

  // Adicionar padding baseado no tamanho
  switch (size) {
    case 'sm':
      return {
        ...baseStyle,
        paddingHorizontal: iOSSpacing.get('4'),
        paddingVertical: iOSSpacing.get('2'),
      };
    case 'lg':
      return {
        ...baseStyle,
        paddingHorizontal: iOSSpacing.get('8'),
        paddingVertical: iOSSpacing.get('4'),
      };
    default: // md
      return {
        ...baseStyle,
        paddingHorizontal: iOSSpacing.get('6'),
        paddingVertical: iOSSpacing.get('3'),
      };
  }
};

/**
 * Cria estilo completo de card iOS
 */
export const createiOSCardStyle = (): ViewStyle => {
  return {
    borderRadius: iOSRadius.card,
    ...iOSShadows.createShadow('card'),
    backgroundColor: 'transparent', // Será preenchido pelo theme
  };
};

// ======================
// 📦 DEFAULT EXPORT
// ======================

export const iOSAdapter = {
  colors: iOSColors,
  typography: iOSTypography,
  shadows: iOSShadows,
  spacing: iOSSpacing,
  radius: iOSRadius,
  touchTargets: iOSTouchTargets,
  createButtonStyle: createiOSButtonStyle,
  createCardStyle: createiOSCardStyle,
};

export default iOSAdapter;
