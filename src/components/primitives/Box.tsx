/**
 * Box Component - Layout primitive
 * Componente genérico de layout com props theme-aware
 */

import React, { useMemo } from 'react';
import { View, ViewProps, ViewStyle } from 'react-native';

import { useThemeColors } from '@/theme';
import { getPlatformShadow } from '@/theme/platform';
import { Spacing, Radius, Shadows } from '@/theme/tokens';

export interface BoxProps extends Omit<ViewProps, 'style'> {
  children?: React.ReactNode;

  // Background
  bg?: 'canvas' | 'card' | 'elevated' | 'transparent';

  // Padding
  p?: keyof typeof Spacing;
  px?: keyof typeof Spacing;
  py?: keyof typeof Spacing;
  pt?: keyof typeof Spacing;
  pb?: keyof typeof Spacing;
  pl?: keyof typeof Spacing;
  pr?: keyof typeof Spacing;

  // Margin
  m?: keyof typeof Spacing;
  mx?: keyof typeof Spacing;
  my?: keyof typeof Spacing;
  mt?: keyof typeof Spacing;
  mb?: keyof typeof Spacing;
  ml?: keyof typeof Spacing;
  mr?: keyof typeof Spacing;

  // Border
  borderWidth?: number;
  borderColor?: 'light' | 'medium' | 'dark' | 'focus';
  rounded?: keyof typeof Radius;

  // Shadow
  shadow?: keyof typeof Shadows;

  // Flex
  flex?: number;
  direction?: 'row' | 'column';
  align?: 'flex-start' | 'center' | 'flex-end' | 'stretch';
  justify?:
    | 'flex-start'
    | 'center'
    | 'flex-end'
    | 'space-between'
    | 'space-around'
    | 'space-evenly';
  gap?: keyof typeof Spacing;

  // Width/Height
  width?: number | string;
  height?: number | string;

  style?: ViewStyle;
}

export const Box = React.memo(function Box({
  children,
  bg,
  p,
  px,
  py,
  pt,
  pb,
  pl,
  pr,
  m,
  mx,
  my,
  mt,
  mb,
  ml,
  mr,
  borderWidth,
  borderColor,
  rounded,
  shadow,
  flex,
  direction,
  align,
  justify,
  gap,
  width,
  height,
  style,
  ...props
}: BoxProps) {
  const colors = useThemeColors();

  const computedStyle = useMemo(() => {
    const bgMap = {
      canvas: colors.background.canvas,
      card: colors.background.card,
      elevated: colors.background.elevated,
      transparent: 'transparent',
    };

    const borderColorMap = {
      light: colors.border.light,
      medium: colors.border.medium,
      dark: colors.border.dark,
      focus: colors.border.focus,
    };
    const shadowStyle = shadow ? getPlatformShadow(shadow) : {};

    return {
      ...(bg && { backgroundColor: bgMap[bg] }),

      // Padding
      ...(p !== undefined && { padding: Spacing[p] }),
      ...(px !== undefined && { paddingHorizontal: Spacing[px] }),
      ...(py !== undefined && { paddingVertical: Spacing[py] }),
      ...(pt !== undefined && { paddingTop: Spacing[pt] }),
      ...(pb !== undefined && { paddingBottom: Spacing[pb] }),
      ...(pl !== undefined && { paddingLeft: Spacing[pl] }),
      ...(pr !== undefined && { paddingRight: Spacing[pr] }),

      // Margin
      ...(m !== undefined && { margin: Spacing[m] }),
      ...(mx !== undefined && { marginHorizontal: Spacing[mx] }),
      ...(my !== undefined && { marginVertical: Spacing[my] }),
      ...(mt !== undefined && { marginTop: Spacing[mt] }),
      ...(mb !== undefined && { marginBottom: Spacing[mb] }),
      ...(ml !== undefined && { marginLeft: Spacing[ml] }),
      ...(mr !== undefined && { marginRight: Spacing[mr] }),

      // Border
      ...(borderWidth !== undefined && { borderWidth }),
      ...(borderColor && { borderColor: borderColorMap[borderColor] }),
      ...(rounded && { borderRadius: Radius[rounded] }),

      // Shadow (platform-adaptive)
      ...shadowStyle,

      // Flex
      ...(flex !== undefined && { flex }),
      ...(direction && { flexDirection: direction }),
      ...(align && { alignItems: align }),
      ...(justify && { justifyContent: justify }),
      ...(gap !== undefined && { gap: Spacing[gap] }),

      // Size
      ...(width !== undefined && { width }),
      ...(height !== undefined && { height }),

      ...style,
    };
  }, [
    bg,
    p,
    px,
    py,
    pt,
    pb,
    pl,
    pr,
    m,
    mx,
    my,
    mt,
    mb,
    ml,
    mr,
    borderWidth,
    borderColor,
    rounded,
    shadow,
    flex,
    direction,
    align,
    justify,
    gap,
    width,
    height,
    style,
    colors,
  ]);

  return (
    <View style={computedStyle as ViewStyle} {...props}>
      {children}
    </View>
  );
});
