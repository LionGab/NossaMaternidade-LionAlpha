/**
 * ProgressBar - Barra de progresso linear (Flo-style)
 *
 * Usado em onboarding, formulários multi-etapa, etc.
 * Inspirado no Flo app
 *
 * @example
 * ```tsx
 * import { ProgressBar } from '@/components/primitives/ProgressBar';
 *
 * <ProgressBar
 *   current={3}
 *   total={5}
 *   color={colors.primary.main}
 * />
 * ```
 *
 * @version 1.0
 * @date 2025-11-27
 */

import React from 'react';
import { View, ViewStyle, Animated } from 'react-native';

import { useThemeColors } from '@/hooks/useTheme';
import { Tokens } from '@/theme/tokens';

export interface ProgressBarProps {
  /** Etapa atual (1-indexed) */
  current: number;
  /** Total de etapas */
  total: number;
  /** Cor da barra de progresso (opcional, usa primary.main por padrão) */
  color?: string;
  /** Cor de fundo da barra (opcional, usa border.light por padrão) */
  backgroundColor?: string;
  /** Altura da barra (padrão: 4) */
  height?: number;
  /** Animar transições (padrão: true) */
  animated?: boolean;
  /** Style customizado */
  style?: ViewStyle;
  /** Label de acessibilidade */
  accessibilityLabel?: string;
}

/**
 * ProgressBar - Barra de progresso linear
 */
export function ProgressBar({
  current,
  total,
  color,
  backgroundColor,
  height = 4,
  animated = true,
  style,
  accessibilityLabel,
}: ProgressBarProps) {
  const colors = useThemeColors();

  // Normalizar current entre 0 e total
  const normalizedCurrent = Math.max(0, Math.min(total, current));
  const progress = (normalizedCurrent / total) * 100;

  // Cores finais
  const finalColor = color || colors.primary.main;
  const finalBgColor = backgroundColor || colors.border.light;

  // Animated value (se animado)
  const animatedValue = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (animated) {
      Animated.timing(animatedValue, {
        toValue: progress,
        duration: Tokens.animations.duration.normal, // 250ms
        useNativeDriver: false, // width não suporta native driver
      }).start();
    } else {
      animatedValue.setValue(progress);
    }
  }, [progress, animated, animatedValue]);

  return (
    <View
      style={[
        {
          width: '100%',
          height,
          backgroundColor: finalBgColor,
          borderRadius: height / 2,
          overflow: 'hidden',
        },
        style,
      ]}
      accessibilityLabel={accessibilityLabel || `Progresso: etapa ${normalizedCurrent} de ${total}`}
      accessibilityRole="progressbar"
      accessibilityValue={{
        min: 0,
        max: total,
        now: normalizedCurrent,
      }}
    >
      <Animated.View
        style={{
          height: '100%',
          width: animated
            ? animatedValue.interpolate({
                inputRange: [0, 100],
                outputRange: ['0%', '100%'],
              })
            : `${progress}%`,
          backgroundColor: finalColor,
          borderRadius: height / 2,
        }}
      />
    </View>
  );
}

export default ProgressBar;
