/**
 * TouchableArea - Área de toque acessível e otimizada
 *
 * Garante touch targets WCAG AAA (44pt iOS / 48dp Android)
 * com todas as melhores práticas de acessibilidade.
 *
 * @version 1.0.0
 */

import * as Haptics from 'expo-haptics';
import React, { memo, useCallback } from 'react';
import {
  Pressable,
  PressableProps,
  ViewStyle,
  Platform,
  GestureResponderEvent,
} from 'react-native';

import { useThemeColors } from '@/hooks/useTheme';
import { Tokens } from '@/theme/tokens';

// ======================
// TIPOS
// ======================

export interface TouchableAreaProps extends Omit<PressableProps, 'style'> {
  /** Conteúdo interno */
  children: React.ReactNode;

  /** Callback ao pressionar */
  onPress?: (event: GestureResponderEvent) => void;

  /** Callback ao pressionar longamente */
  onLongPress?: (event: GestureResponderEvent) => void;

  /** Estilo customizado */
  style?: ViewStyle;

  /** Label de acessibilidade (obrigatório) */
  accessibilityLabel: string;

  /** Hint de acessibilidade */
  accessibilityHint?: string;

  /** Se está desabilitado */
  disabled?: boolean;

  /** Tamanho mínimo do touch target */
  minSize?: 'small' | 'medium' | 'large' | number;

  /** Se deve usar haptic feedback */
  hapticFeedback?: boolean;

  /** Tipo de haptic feedback */
  hapticType?: 'light' | 'medium' | 'heavy' | 'selection';

  /** Hit slop adicional */
  hitSlopSize?: 'small' | 'medium' | 'large';

  /** Se deve mostrar feedback visual ao pressionar */
  showPressedState?: boolean;

  /** Opacidade quando pressionado */
  pressedOpacity?: number;

  /** Se é um elemento de navegação */
  isNavigation?: boolean;

  /** Ação de acessibilidade customizada */
  accessibilityActions?: Array<{
    name: string;
    label: string;
  }>;

  /** Handler para ações de acessibilidade */
  onAccessibilityAction?: (event: { nativeEvent: { actionName: string } }) => void;
}

// ======================
// CONSTANTES
// ======================

const MIN_SIZES = {
  small: Tokens.touchTargets.small, // 44pt
  medium: Tokens.touchTargets.medium, // 48pt
  large: Tokens.touchTargets.large, // 56pt
};

const HIT_SLOP_SIZES = {
  small: Tokens.touchTargets.hitSlop.small,
  medium: Tokens.touchTargets.hitSlop.medium,
  large: Tokens.touchTargets.hitSlop.large,
};

const HAPTIC_TYPES = {
  light: Haptics.ImpactFeedbackStyle.Light,
  medium: Haptics.ImpactFeedbackStyle.Medium,
  heavy: Haptics.ImpactFeedbackStyle.Heavy,
  selection: 'selection' as const,
};

// ======================
// COMPONENTE
// ======================

export const TouchableArea = memo<TouchableAreaProps>(
  ({
    children,
    onPress,
    onLongPress,
    style,
    accessibilityLabel,
    accessibilityHint,
    disabled = false,
    minSize = 'medium',
    hapticFeedback = true,
    hapticType = 'light',
    hitSlopSize = 'medium',
    showPressedState = true,
    pressedOpacity = 0.7,
    isNavigation = false,
    accessibilityActions,
    onAccessibilityAction,
    ...pressableProps
  }) => {
    const colors = useThemeColors();

    // Calcular tamanho mínimo
    const minTouchSize = typeof minSize === 'number' ? minSize : MIN_SIZES[minSize];

    // Calcular hit slop
    const hitSlopValue = HIT_SLOP_SIZES[hitSlopSize];
    const hitSlop = {
      top: hitSlopValue,
      bottom: hitSlopValue,
      left: hitSlopValue,
      right: hitSlopValue,
    };

    // Handler com haptic feedback
    const handlePress = useCallback(
      (event: GestureResponderEvent) => {
        if (disabled || !onPress) return;

        // Haptic feedback
        if (hapticFeedback && Platform.OS !== 'web') {
          if (hapticType === 'selection') {
            Haptics.selectionAsync();
          } else {
            Haptics.impactAsync(HAPTIC_TYPES[hapticType]);
          }
        }

        onPress(event);
      },
      [disabled, onPress, hapticFeedback, hapticType]
    );

    // Handler para long press
    const handleLongPress = useCallback(
      (event: GestureResponderEvent) => {
        if (disabled || !onLongPress) return;

        // Haptic feedback mais forte para long press
        if (hapticFeedback && Platform.OS !== 'web') {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        }

        onLongPress(event);
      },
      [disabled, onLongPress, hapticFeedback]
    );

    // Estilos base
    const baseStyle: ViewStyle = {
      minWidth: minTouchSize,
      minHeight: minTouchSize,
      justifyContent: 'center',
      alignItems: 'center',
    };

    // Android ripple effect
    const androidRipple =
      Platform.OS === 'android' && !disabled
        ? {
            color: colors.primary.light,
            borderless: false,
          }
        : undefined;

    return (
      <Pressable
        {...pressableProps}
        onPress={handlePress}
        onLongPress={onLongPress ? handleLongPress : undefined}
        disabled={disabled}
        hitSlop={hitSlop}
        android_ripple={androidRipple}
        style={({ pressed }) => [
          baseStyle,
          style,
          showPressedState &&
            pressed &&
            !disabled && {
              opacity: Platform.OS === 'ios' ? pressedOpacity : 1,
            },
          disabled && { opacity: 0.4 },
        ]}
        // Acessibilidade completa
        accessible={true}
        accessibilityRole={isNavigation ? 'link' : 'button'}
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
        accessibilityState={{
          disabled,
        }}
        accessibilityActions={accessibilityActions}
        onAccessibilityAction={onAccessibilityAction}
      >
        {children}
      </Pressable>
    );
  }
);

TouchableArea.displayName = 'TouchableArea';

export default TouchableArea;
