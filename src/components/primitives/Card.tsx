/**
 * Card - Componente Primitivo Robusto
 *
 * Baseado em Material Design 3 + Flo
 * Usa tokens do design system
 *
 * @version 1.0
 * @date 2025-11-27
 */

import React from 'react';
import { ViewStyle, TouchableOpacity } from 'react-native';

import { useThemeColors } from '@/hooks/useTheme';
import { Tokens } from '@/theme/tokens';

import { SafeView } from './SafeView';

export type CardVariant = 'default' | 'elevated' | 'outlined' | 'flat' | 'gradient';
export type CardPadding = 'none' | 'sm' | 'md' | 'lg';

export interface CardProps {
  /** Conteúdo do card */
  children: React.ReactNode;
  /** Variante visual */
  variant?: CardVariant;
  /** Padding interno */
  padding?: CardPadding;
  /** Se é clicável */
  pressable?: boolean;
  /** Handler de clique */
  onPress?: () => void;
  /** Estilos customizados */
  style?: ViewStyle;
  /** Label de acessibilidade */
  accessibilityLabel?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = 'md',
  pressable = false,
  onPress,
  style,
  accessibilityLabel,
}) => {
  const colors = useThemeColors();

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ESTILOS POR VARIANTE
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  const getVariantStyles = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: Tokens.radius.lg,
      overflow: 'hidden',
    };

    switch (variant) {
      case 'elevated':
        return {
          ...baseStyle,
          backgroundColor: colors.background.elevated,
          ...Tokens.shadows.lg,
        };

      case 'outlined':
        return {
          ...baseStyle,
          backgroundColor: colors.background.card,
          borderWidth: 1,
          borderColor: colors.border.medium,
        };

      case 'flat':
        return {
          ...baseStyle,
          backgroundColor: colors.background.elevated,
        };

      case 'gradient':
        return {
          ...baseStyle,
          // Gradient será aplicado via LinearGradient wrapper
          backgroundColor: 'transparent',
        };

      default: // 'default'
        return {
          ...baseStyle,
          backgroundColor: colors.background.card,
          ...Tokens.shadows.md,
        };
    }
  };

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // PADDING
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  const getPaddingValue = (): number => {
    switch (padding) {
      case 'none':
        return 0;
      case 'sm':
        return Tokens.spacing['3']; // 12px
      case 'lg':
        return Tokens.spacing['6']; // 24px
      default: // 'md'
        return Tokens.spacing['4']; // 16px
    }
  };

  const containerStyle: ViewStyle = {
    ...getVariantStyles(),
    padding: getPaddingValue(),
    ...style,
  };

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // RENDER
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  const content = <SafeView style={containerStyle}>{children}</SafeView>;

  if (pressable || onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.8}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return content;
};

export default Card;
