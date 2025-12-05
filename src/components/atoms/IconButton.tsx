/**
 * IconButton Primitive Component
 * Botão de ícone acessível com touch target mínimo (44pt)
 * Implementa WCAG AAA e Material Design 3 guidelines
 */

import * as Haptics from 'expo-haptics';
import React from 'react';
import { Pressable, ViewStyle, AccessibilityRole } from 'react-native';

import { useThemeColors } from '@/theme';
import { Tokens } from '@/theme/tokens';

export type IconButtonVariant = 'default' | 'primary' | 'secondary' | 'ghost' | 'danger';
export type IconButtonSize = 'sm' | 'md' | 'lg' | 'xl';

export interface IconButtonProps {
  /** Ícone a ser renderizado (componente Lucide React Native) */
  icon: React.ReactNode;

  /** Callback ao pressionar */
  onPress: () => void;

  /** Label de acessibilidade (obrigatório para screen readers) */
  accessibilityLabel: string;

  /** Variante visual */
  variant?: IconButtonVariant;

  /** Tamanho do botão */
  size?: IconButtonSize;

  /** Desabilitado */
  disabled?: boolean;

  /** Haptic feedback ao pressionar */
  hapticFeedback?: boolean;

  /** Estilo adicional do container */
  style?: ViewStyle;

  /** Hit slop para área de toque expandida */
  hitSlop?: number;

  /** Accessibility role (default: 'button') */
  accessibilityRole?: AccessibilityRole;
}

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  onPress,
  accessibilityLabel,
  variant = 'default',
  size = 'md',
  disabled = false,
  hapticFeedback = true,
  style,
  hitSlop = 8,
  accessibilityRole = 'button',
}) => {
  const colors = useThemeColors();

  const sizeConfig = {
    sm: {
      width: Tokens.touchTargets.small,
      height: Tokens.touchTargets.small,
      borderRadius: Tokens.radius.md,
    },
    md: {
      width: Tokens.touchTargets.min,
      height: Tokens.touchTargets.min,
      borderRadius: Tokens.radius.lg,
    },
    lg: {
      width: Tokens.touchTargets.large,
      height: Tokens.touchTargets.large,
      borderRadius: Tokens.radius.xl,
    },
    xl: {
      width: Tokens.touchTargets.xl,
      height: Tokens.touchTargets.xl,
      borderRadius: Tokens.radius['2xl'],
    },
  };

  const variantStyles: Record<IconButtonVariant, ViewStyle> = {
    default: {
      backgroundColor: colors.background.elevated,
    },
    primary: {
      backgroundColor: colors.primary.main,
    },
    secondary: {
      backgroundColor: colors.secondary.main,
    },
    ghost: {
      backgroundColor: 'transparent',
    },
    danger: {
      backgroundColor: colors.status.error,
    },
  };

  const handlePress = () => {
    if (disabled) return;

    if (hapticFeedback) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    onPress();
  };

  const { width, height, borderRadius } = sizeConfig[size];

  const baseStyle: ViewStyle = {
    width,
    height,
    minWidth: width,
    minHeight: height,
    borderRadius,
    alignItems: 'center',
    justifyContent: 'center',
    ...variantStyles[variant],
    ...(disabled && { opacity: 0.4 }),
  };

  const getStateStyle = (pressed: boolean): ViewStyle => {
    if (pressed && !disabled) {
      return {
        opacity: 0.7,
        transform: [{ scale: 0.95 }],
      };
    }
    return {};
  };

  return (
    <Pressable
      accessibilityRole={accessibilityRole}
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
      onPress={handlePress}
      disabled={disabled}
      hitSlop={hitSlop}
      style={({ pressed }) => [baseStyle, getStateStyle(pressed), style]}
    >
      {icon}
    </Pressable>
  );
};

export default IconButton;
