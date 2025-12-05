/**
 * Heading Component - Typography primitive
 * Componente para títulos (H1-H6) com variants e theme-aware
 */

import React from 'react';
import { Text as RNText, TextProps as RNTextProps, TextStyle } from 'react-native';

import { useThemeColors } from '@/theme';
import { Typography } from '@/theme/tokens';

export type HeadingLevel = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

export interface HeadingProps extends Omit<RNTextProps, 'style'> {
  level?: HeadingLevel;
  children: React.ReactNode;
  color?: 'primary' | 'secondary' | 'tertiary' | 'inverse';
  align?: 'left' | 'center' | 'right';
  weight?: 'regular' | 'medium' | 'semibold' | 'bold';
  style?: TextStyle;
}

const headingStyles: Record<HeadingLevel, TextStyle> = {
  h1: {
    fontSize: Typography.sizes['5xl'],
    lineHeight: Typography.lineHeights['5xl'],
    fontWeight: Typography.weights.bold,
    letterSpacing: Typography.letterSpacing.tight,
  },
  h2: {
    fontSize: Typography.sizes['4xl'],
    lineHeight: Typography.lineHeights['4xl'],
    fontWeight: Typography.weights.bold,
    letterSpacing: Typography.letterSpacing.tight,
  },
  h3: {
    fontSize: Typography.sizes['3xl'],
    lineHeight: Typography.lineHeights['3xl'],
    fontWeight: Typography.weights.semibold,
    letterSpacing: Typography.letterSpacing.normal,
  },
  h4: {
    fontSize: Typography.sizes['2xl'],
    lineHeight: Typography.lineHeights['2xl'],
    fontWeight: Typography.weights.semibold,
    letterSpacing: Typography.letterSpacing.normal,
  },
  h5: {
    fontSize: Typography.sizes.xl,
    lineHeight: Typography.lineHeights.xl,
    fontWeight: Typography.weights.medium,
    letterSpacing: Typography.letterSpacing.normal,
  },
  h6: {
    fontSize: Typography.sizes.lg,
    lineHeight: Typography.lineHeights.lg,
    fontWeight: Typography.weights.medium,
    letterSpacing: Typography.letterSpacing.wide,
  },
};

export function Heading({
  level = 'h1',
  children,
  color = 'primary',
  align = 'left',
  weight,
  style,
  ...props
}: HeadingProps) {
  const colors = useThemeColors();

  const colorMap = {
    primary: colors.text.primary,
    secondary: colors.text.secondary,
    tertiary: colors.text.tertiary,
    inverse: colors.text.inverse,
  };

  const computedStyle: TextStyle = {
    ...headingStyles[level],
    color: colorMap[color],
    textAlign: align,
    ...(weight && { fontWeight: Typography.weights[weight] }),
    ...style,
  };

  return (
    <RNText style={computedStyle} {...props}>
      {children}
    </RNText>
  );
}

// Convenience exports
export const H1 = (props: Omit<HeadingProps, 'level'>) => <Heading level="h1" {...props} />;
export const H2 = (props: Omit<HeadingProps, 'level'>) => <Heading level="h2" {...props} />;
export const H3 = (props: Omit<HeadingProps, 'level'>) => <Heading level="h3" {...props} />;
export const H4 = (props: Omit<HeadingProps, 'level'>) => <Heading level="h4" {...props} />;
export const H5 = (props: Omit<HeadingProps, 'level'>) => <Heading level="h5" {...props} />;
export const H6 = (props: Omit<HeadingProps, 'level'>) => <Heading level="h6" {...props} />;
