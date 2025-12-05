/**
 * Text Component - Typography primitive (Hybrid: Props + className)
 * Suporta props semânticas (legado) e className (NativeWind v4)
 *
 * @version 2.0 - Hybrid mode
 */

import React, { useMemo } from 'react';
import { Text as RNText, TextProps as RNTextProps, TextStyle } from 'react-native';

import { useThemeColors } from '@/theme';
import { getFontFamily, getScaledFontSize } from '@/theme/platform';
import { Typography } from '@/theme/tokens';

export type TextVariant = 'body' | 'caption' | 'label' | 'overline' | 'small';
export type TextSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
export type TextColor =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'disabled'
  | 'inverse'
  | 'link'
  | 'success'
  | 'warning'
  | 'error';

export interface CustomTextProps extends Omit<RNTextProps, 'style'> {
  /**
   * ⭐ NOVO: Suporte a className (NativeWind v4)
   * Quando fornecido, className tem PRIORIDADE sobre props semânticas
   * @example
   * <Text className="text-lg font-semibold text-primary" />
   */
  className?: string;

  variant?: TextVariant;
  size?: TextSize;
  color?: TextColor;
  align?: 'left' | 'center' | 'right' | 'justify';
  weight?: 'light' | 'regular' | 'medium' | 'semibold' | 'bold';
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  children: React.ReactNode;
  style?: TextStyle;
}

const variantStyles: Record<TextVariant, TextStyle> = {
  body: {
    fontSize: Typography.sizes.md,
    lineHeight: Typography.lineHeights.md,
    fontWeight: Typography.weights.regular,
    letterSpacing: Typography.letterSpacing.normal,
  },
  caption: {
    fontSize: Typography.sizes.sm,
    lineHeight: Typography.lineHeights.sm,
    fontWeight: Typography.weights.regular,
    letterSpacing: Typography.letterSpacing.wide,
  },
  label: {
    fontSize: Typography.sizes.sm,
    lineHeight: Typography.lineHeights.sm,
    fontWeight: Typography.weights.medium,
    letterSpacing: Typography.letterSpacing.wide,
  },
  overline: {
    fontSize: Typography.sizes.xs,
    lineHeight: Typography.lineHeights.xs,
    fontWeight: Typography.weights.semibold,
    letterSpacing: Typography.letterSpacing.wider,
    textTransform: 'uppercase',
  },
  small: {
    fontSize: Typography.sizes.xs,
    lineHeight: Typography.lineHeights.xs,
    fontWeight: Typography.weights.regular,
    letterSpacing: Typography.letterSpacing.normal,
  },
};

const sizeMap: Record<TextSize, number> = {
  xs: Typography.sizes.xs,
  sm: Typography.sizes.sm,
  md: Typography.sizes.md,
  lg: Typography.sizes.lg,
  xl: Typography.sizes.xl,
  '2xl': Typography.sizes['2xl'] || 24, // 24px
  '3xl': Typography.sizes['3xl'] || 28, // 28px
};

export const Text = React.memo(function Text({
  className, // ⭐ NOVO: suporte a className
  variant = 'body',
  size,
  color = 'primary',
  align = 'left',
  weight,
  italic = false,
  underline = false,
  strikethrough = false,
  children,
  style,
  allowFontScaling = true,
  ...props
}: CustomTextProps & { allowFontScaling?: boolean }) {
  // ⭐ Chamar todos os hooks INCONDICIONALMENTE (React Rules of Hooks)
  const colors = useThemeColors();

  const colorMap: Record<TextColor, string> = useMemo(
    () => ({
      primary: colors.text.primary,
      secondary: colors.text.secondary,
      tertiary: colors.text.tertiary,
      disabled: colors.text.disabled,
      inverse: colors.text.inverse,
      link: colors.text.link,
      success: colors.text.success,
      warning: colors.text.warning,
      error: colors.text.error,
    }),
    [colors]
  );

  const computedStyle: TextStyle = useMemo(() => {
    const baseSize = size ? sizeMap[size] : variantStyles[variant].fontSize || Typography.sizes.md;
    const fontSize = allowFontScaling ? getScaledFontSize(baseSize) : baseSize;

    const fontFamily = weight
      ? getFontFamily(weight)
      : getFontFamily(
          (variantStyles[variant].fontWeight as keyof typeof Typography.weights) || 'regular'
        );

    return {
      ...variantStyles[variant],
      fontSize,
      fontFamily,
      color: colorMap[color],
      textAlign: align,
      ...(weight && { fontWeight: Typography.weights[weight] }),
      ...(italic && { fontStyle: 'italic' }),
      ...(underline && { textDecorationLine: 'underline' }),
      ...(strikethrough && { textDecorationLine: 'line-through' }),
      allowFontScaling,
      ...style,
    };
  }, [
    variant,
    size,
    color,
    align,
    weight,
    italic,
    underline,
    strikethrough,
    allowFontScaling,
    style,
    colorMap,
  ]);

  // ⭐ MODO 1: className fornecido → usar NativeWind (prioridade)
  if (className) {
    return (
      <RNText
        className={className}
        style={style}
        allowFontScaling={allowFontScaling}
        accessible={true}
        accessibilityRole="text"
        {...props}
      >
        {children}
      </RNText>
    );
  }

  // ⭐ MODO 2: Props semânticas → usar lógica existente (backwards compatible)
  return (
    <RNText
      style={computedStyle}
      allowFontScaling={allowFontScaling}
      accessible={true}
      accessibilityRole="text"
      {...props}
    >
      {children}
    </RNText>
  );
});

// Convenience exports
export const Body = (props: Omit<CustomTextProps, 'variant'>) => <Text variant="body" {...props} />;
export const Caption = (props: Omit<CustomTextProps, 'variant'>) => (
  <Text variant="caption" {...props} />
);
export const Label = (props: Omit<CustomTextProps, 'variant'>) => (
  <Text variant="label" {...props} />
);
export const Overline = (props: Omit<CustomTextProps, 'variant'>) => (
  <Text variant="overline" {...props} />
);
export const Small = (props: Omit<CustomTextProps, 'variant'>) => (
  <Text variant="small" {...props} />
);
