/**
 * Pressable Primitive Component
 * Wrapper do React Native Pressable com ripple effect (Android)
 * e feedback visual consistente cross-platform
 */

import * as Haptics from 'expo-haptics';
import React from 'react';
import {
  Pressable as RNPressable,
  PressableProps as RNPressableProps,
  Platform,
  ViewStyle,
  PressableStateCallbackType,
} from 'react-native';

import { useThemeColors } from '@/theme';

export interface PressableProps extends Omit<RNPressableProps, 'style'> {
  /** Filhos do componente */
  children: React.ReactNode | ((state: PressableStateCallbackType) => React.ReactNode);

  /** Callback ao pressionar */
  onPress?: () => void;

  /** Estilo do container */
  style?: ViewStyle | ((state: PressableStateCallbackType) => ViewStyle);

  /** Desabilitado */
  disabled?: boolean;

  /** Haptic feedback ao pressionar (iOS apenas) */
  hapticFeedback?: boolean;

  /** Cor do ripple effect (Android) */
  rippleColor?: string;

  /** Raio do ripple (Android) - se undefined, não cria ripple */
  rippleRadius?: number;

  /** Opacidade ao pressionar (fallback para iOS e ripple desabilitado) */
  pressedOpacity?: number;

  /** Escala ao pressionar */
  pressedScale?: number;

  /** Hit slop para área de toque expandida */
  hitSlop?: number;
}

/**
 * Pressable component com ripple effect no Android e feedback visual no iOS
 *
 * @example
 * ```tsx
 * <Pressable
 *   onPress={() => logger.debug('Pressed')}
 *   rippleColor="rgba(0, 0, 0, 0.1)"
 *   rippleRadius={200}
 *   hapticFeedback
 * >
 *   <Text>Press me</Text>
 * </Pressable>
 * ```
 */
export const Pressable: React.FC<PressableProps> = ({
  children,
  onPress,
  style,
  disabled = false,
  hapticFeedback = false,
  rippleColor,
  rippleRadius,
  pressedOpacity = 0.7,
  pressedScale,
  hitSlop = 0,
  ...rest
}) => {
  const colors = useThemeColors();

  const handlePress = () => {
    if (disabled) return;

    // Haptic feedback no iOS
    if (hapticFeedback && Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    onPress?.();
  };

  // Estilo base com feedback visual
  const getStyle = (state: PressableStateCallbackType): ViewStyle => {
    const baseStyle = typeof style === 'function' ? style(state) : style || {};

    if (state.pressed && !disabled) {
      return {
        ...baseStyle,
        opacity: pressedOpacity,
        ...(pressedScale && {
          transform: [{ scale: pressedScale }],
        }),
      };
    }

    return baseStyle;
  };

  // Configuração do ripple para Android
  const androidRipple =
    Platform.OS === 'android' && rippleRadius !== undefined
      ? {
          color: rippleColor || `${colors.primary.main}20`,
          radius: rippleRadius,
          borderless: false,
        }
      : undefined;

  return (
    <RNPressable
      onPress={handlePress}
      disabled={disabled}
      hitSlop={hitSlop}
      style={getStyle}
      android_ripple={androidRipple}
      accessibilityState={{ disabled }}
      {...rest}
    >
      {children}
    </RNPressable>
  );
};

export default Pressable;
