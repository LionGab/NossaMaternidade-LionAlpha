/**
 * Badge Component - Status badge with variants
 * Componente de badge para status e notificações
 */

import React from 'react';
import { Text, View, ViewStyle, TextStyle } from 'react-native';

import { useThemeColors } from '@/theme';
import { Spacing, Radius, Typography } from '@/theme/tokens';

export type BadgeVariant =
  | 'default'
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'error'
  | 'info';
export type BadgeSize = 'sm' | 'md' | 'lg';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
  outlined?: boolean;
  containerStyle?: ViewStyle;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  dot = false,
  outlined = false,
  containerStyle,
}) => {
  const colors = useThemeColors();

  const sizeConfig = {
    sm: {
      paddingHorizontal: Spacing['2'],
      paddingVertical: Spacing['0.5'],
      fontSize: Typography.sizes.xs,
      dotSize: 6,
    },
    md: {
      paddingHorizontal: Spacing['2.5'],
      paddingVertical: Spacing['1'],
      fontSize: Typography.sizes.sm,
      dotSize: 8,
    },
    lg: {
      paddingHorizontal: Spacing['3'],
      paddingVertical: Spacing['1.5'],
      fontSize: Typography.sizes.base,
      dotSize: 10,
    },
  };

  const variantColors = {
    default: {
      bg: colors.background.elevated,
      text: colors.text.primary,
      border: colors.border.medium,
    },
    primary: {
      bg: colors.primary.main,
      text: colors.text.inverse,
      border: colors.primary.main,
    },
    secondary: {
      bg: colors.secondary.main,
      text: colors.text.inverse,
      border: colors.secondary.main,
    },
    success: {
      bg: colors.status.success,
      text: colors.text.inverse,
      border: colors.status.success,
    },
    warning: {
      bg: colors.status.warning,
      text: colors.text.inverse,
      border: colors.status.warning,
    },
    error: {
      bg: colors.status.error,
      text: colors.text.inverse,
      border: colors.status.error,
    },
    info: {
      bg: colors.status.info,
      text: colors.text.inverse,
      border: colors.status.info,
    },
  };

  const { paddingHorizontal, paddingVertical, fontSize, dotSize } = sizeConfig[size];
  const colorConfig = variantColors[variant];

  const containerStyles: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal,
    paddingVertical,
    borderRadius: Radius.full,
    backgroundColor: outlined ? 'transparent' : colorConfig.bg,
    borderWidth: outlined ? 1 : 0,
    borderColor: colorConfig.border,
    ...containerStyle,
  };

  const textStyles: TextStyle = {
    fontSize,
    fontWeight: Typography.weights.medium,
    color: outlined ? colorConfig.border : colorConfig.text,
  };

  return (
    <View style={containerStyles}>
      {dot && (
        <View
          style={{
            width: dotSize,
            height: dotSize,
            borderRadius: dotSize / 2,
            backgroundColor: outlined ? colorConfig.border : colorConfig.text,
            marginRight: Spacing['1.5'],
          }}
        />
      )}
      <Text style={textStyles}>{children}</Text>
    </View>
  );
};

export default Badge;
