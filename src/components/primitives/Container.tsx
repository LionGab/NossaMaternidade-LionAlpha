/**
 * Container Component - Layout primitive
 * Componente para containers responsivos com max-width e padding
 */

import React from 'react';
import { View, ViewProps, ViewStyle } from 'react-native';

import { Spacing, Breakpoints } from '@/theme/tokens';

export interface ContainerProps extends Omit<ViewProps, 'style'> {
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  padding?: keyof typeof Spacing;
  paddingX?: keyof typeof Spacing;
  paddingY?: keyof typeof Spacing;
  center?: boolean;
  style?: ViewStyle;
}

const maxWidthMap = {
  sm: Breakpoints.sm,
  md: Breakpoints.md,
  lg: Breakpoints.lg,
  xl: Breakpoints.xl,
  full: '100%',
};

export function Container({
  children,
  maxWidth = 'lg',
  padding = '4',
  paddingX,
  paddingY,
  center = false,
  style,
  ...props
}: ContainerProps) {
  const computedStyle = {
    width: '100%' as const,
    maxWidth: maxWidthMap[maxWidth],
    paddingHorizontal: paddingX ? Spacing[paddingX] : Spacing[padding],
    paddingVertical: paddingY ? Spacing[paddingY] : Spacing[padding],
    ...(center && {
      marginLeft: 'auto',
      marginRight: 'auto',
      alignItems: 'center',
    }),
    ...style,
  };

  return (
    <View style={computedStyle as ViewStyle} {...props}>
      {children}
    </View>
  );
}
