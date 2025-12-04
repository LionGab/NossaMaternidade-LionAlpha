/**
 * Typography Component - Semantic text component with theme support
 * Componente de tipografia semântico com suporte completo a temas e acessibilidade
 *
 * @example
 * <Typography variant="h1">Título Principal</Typography>
 * <Typography variant="body" weight="medium">Texto do corpo</Typography>
 * <Typography variant="caption" color="secondary">Legenda</Typography>
 */

import React from 'react';
import { Text, TextProps, TextStyle } from 'react-native';

import { useThemeColors } from '../theme/ThemeContext';
import { Typography as TypographyTokens } from '../theme/tokens';

export type TypographyVariant =
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'body'
  | 'bodySmall'
  | 'caption'
  | 'label'
  | 'button';

export type TypographyWeight = 'light' | 'regular' | 'medium' | 'semibold' | 'bold';
export type TypographyAlign = 'left' | 'center' | 'right' | 'justify';
export type TypographyColor =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'inverse'
  | 'link'
  | 'success'
  | 'warning'
  | 'error';

export interface TypographyProps extends Omit<TextProps, 'accessibilityRole'> {
  variant?: TypographyVariant;
  weight?: TypographyWeight;
  align?: TypographyAlign;
  color?: TypographyColor | string;
  numberOfLines?: number;
  children: React.ReactNode;
  style?: TextStyle;
  accessibilityRole?: 'header' | 'text' | 'link' | 'button';
}

const variantStyles: Record<TypographyVariant, TextStyle> = {
  h1: {
    fontSize: TypographyTokens.sizes['4xl'], // 32px
    lineHeight: TypographyTokens.lineHeights['4xl'], // 40px
    fontWeight: TypographyTokens.weights.bold,
  },
  h2: {
    fontSize: TypographyTokens.sizes['3xl'], // 28px
    lineHeight: TypographyTokens.lineHeights['3xl'], // 36px
    fontWeight: TypographyTokens.weights.bold,
  },
  h3: {
    fontSize: TypographyTokens.sizes['2xl'], // 24px
    lineHeight: TypographyTokens.lineHeights['2xl'], // 32px
    fontWeight: TypographyTokens.weights.semibold,
  },
  h4: {
    fontSize: TypographyTokens.sizes.xl, // 20px
    lineHeight: TypographyTokens.lineHeights.xl, // 28px
    fontWeight: TypographyTokens.weights.semibold,
  },
  body: {
    fontSize: TypographyTokens.sizes.base, // 16px
    lineHeight: TypographyTokens.lineHeights.md, // 24px
    fontWeight: TypographyTokens.weights.regular,
  },
  bodySmall: {
    fontSize: TypographyTokens.sizes.sm, // 14px
    lineHeight: TypographyTokens.lineHeights.sm, // 20px
    fontWeight: TypographyTokens.weights.regular,
  },
  caption: {
    fontSize: TypographyTokens.sizes.xs, // 12px
    lineHeight: TypographyTokens.lineHeights.xs, // 18px
    fontWeight: TypographyTokens.weights.regular,
  },
  label: {
    fontSize: TypographyTokens.sizes.sm, // 14px
    lineHeight: TypographyTokens.lineHeights.sm, // 20px
    fontWeight: TypographyTokens.weights.medium,
  },
  button: {
    fontSize: TypographyTokens.sizes.base, // 16px
    lineHeight: TypographyTokens.lineHeights.md, // 24px
    fontWeight: TypographyTokens.weights.semibold,
  },
};

const weightStyles: Record<TypographyWeight, TextStyle> = {
  light: { fontWeight: TypographyTokens.weights.light },
  regular: { fontWeight: TypographyTokens.weights.regular },
  medium: { fontWeight: TypographyTokens.weights.medium },
  semibold: { fontWeight: TypographyTokens.weights.semibold },
  bold: { fontWeight: TypographyTokens.weights.bold },
};

export const Typography: React.FC<TypographyProps> = ({
  variant = 'body',
  weight,
  align = 'left',
  color = 'primary',
  numberOfLines,
  children,
  style,
  accessibilityRole,
  ...props
}) => {
  const colors = useThemeColors();

  const getColor = (): string => {
    // Se for uma cor customizada (ex: #FFFFFF)
    if (color.startsWith('#') || color.startsWith('rgb')) {
      return color;
    }

    // Se for uma cor semântica do theme
    const colorMap: Record<string, string> = {
      primary: colors.text.primary,
      secondary: colors.text.secondary,
      tertiary: colors.text.tertiary,
      inverse: colors.text.inverse,
      link: colors.text.link,
      success: colors.text.success,
      warning: colors.text.warning,
      error: colors.text.error,
    };

    return colorMap[color] || colors.text.primary;
  };

  const getAccessibilityRole = (): 'header' | 'text' | 'link' | 'button' | undefined => {
    if (accessibilityRole) return accessibilityRole;

    // Auto-detect based on variant
    if (variant.startsWith('h')) return 'header';
    if (variant === 'label') return 'text'; // 'label' não é suportado, usar 'text'
    if (variant === 'button') return 'button';
    return 'text';
  };

  const textStyle: TextStyle = {
    ...variantStyles[variant],
    ...(weight ? weightStyles[weight] : {}),
    textAlign: align,
    color: getColor(),
    ...style,
  };

  return (
    <Text
      style={textStyle}
      numberOfLines={numberOfLines}
      accessibilityRole={getAccessibilityRole()}
      {...props}
    >
      {children}
    </Text>
  );
};

export default Typography;
