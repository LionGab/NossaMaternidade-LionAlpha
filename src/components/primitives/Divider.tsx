/**
 * Divider Primitive Component
 * Separador visual com suporte a orientação horizontal/vertical
 * Theme-aware e responsivo
 */

import React from 'react';
import { View, ViewStyle } from 'react-native';

import { useThemeColors } from '@/theme';
import { Tokens } from '@/theme/tokens';

export type DividerOrientation = 'horizontal' | 'vertical';
export type DividerVariant = 'light' | 'medium' | 'dark';

export interface DividerProps {
  /** Orientação do divider */
  orientation?: DividerOrientation;

  /** Variante da cor (opacidade) */
  variant?: DividerVariant;

  /** Margem vertical (para horizontal) ou horizontal (para vertical) */
  spacing?: keyof typeof Tokens.spacing;

  /** Espessura da linha */
  thickness?: number;

  /** Estilo adicional */
  style?: ViewStyle;

  /** Classe CSS (para compatibilidade com NativeWind) */
  className?: string;
}

export const Divider: React.FC<DividerProps> = ({
  orientation = 'horizontal',
  variant = 'light',
  spacing = '0',
  thickness = 1,
  style,
  className = '',
}) => {
  const colors = useThemeColors();

  const variantColors = {
    light: colors.border.light,
    medium: colors.border.medium,
    dark: colors.border.dark,
  };

  const baseStyle: ViewStyle = {
    backgroundColor: variantColors[variant],
  };

  const orientationStyle: ViewStyle =
    orientation === 'horizontal'
      ? {
          width: '100%',
          height: thickness,
          marginVertical: Tokens.spacing[spacing],
        }
      : {
          width: thickness,
          height: '100%',
          marginHorizontal: Tokens.spacing[spacing],
        };

  return <View className={className} style={[baseStyle, orientationStyle, style]} />;
};

export default Divider;
