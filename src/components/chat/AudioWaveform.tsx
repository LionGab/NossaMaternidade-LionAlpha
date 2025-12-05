/**
 * AudioWaveform - Animação visual de áudio
 *
 * Componente visual que exibe uma waveform animada durante:
 * - Gravação de áudio (vermelho pulsante)
 * - Reprodução de áudio (rosa animado)
 * - Idle (cinza estático)
 *
 * @version 1.0.0 - Migrado do app-redesign-studio
 */

import React, { useEffect, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  withDelay,
  Easing,
  cancelAnimation,
  interpolate,
} from 'react-native-reanimated';

import { WebColors } from '@/theme/webColors';
import { Tokens } from '@/theme/tokens';

// Número de barras na waveform
const BAR_COUNT = 12;

// Estados possíveis da waveform
export type WaveformState = 'idle' | 'recording' | 'playing';

interface AudioWaveformProps {
  /** Estado atual da waveform */
  state?: WaveformState;
  /** Altura total do componente */
  height?: number;
  /** Largura total do componente */
  width?: number;
  /** Cor customizada (sobrescreve cor do estado) */
  color?: string;
  /** Callback quando animação completa um ciclo */
  onCycleComplete?: () => void;
}

/**
 * Retorna a cor baseada no estado
 */
const getStateColor = (state: WaveformState, customColor?: string): string => {
  if (customColor) return customColor;

  switch (state) {
    case 'recording':
      return '#EF4444'; // Vermelho para gravação
    case 'playing':
      return WebColors.rosa.main; // Rosa maternal para reprodução
    case 'idle':
    default:
      return '#9CA3AF'; // Cinza para idle
  }
};

/**
 * Componente de barra individual animada
 */
const AnimatedBar: React.FC<{
  index: number;
  state: WaveformState;
  color: string;
  maxHeight: number;
  barWidth: number;
}> = ({ index, state, color, maxHeight, barWidth }) => {
  const heightValue = useSharedValue(0.3);

  useEffect(() => {
    // Cancela animações anteriores
    cancelAnimation(heightValue);

    if (state === 'idle') {
      // Idle: altura baixa e estática
      heightValue.value = withTiming(0.2 + Math.random() * 0.1, {
        duration: 300,
        easing: Easing.out(Easing.ease),
      });
    } else {
      // Recording/Playing: animação contínua
      const minHeight = state === 'recording' ? 0.3 : 0.2;
      const maxHeightFactor = state === 'recording' ? 1 : 0.9;

      // Delay baseado no índice para criar efeito de onda
      const delay = index * (state === 'recording' ? 50 : 80);

      // Duração variável para parecer mais natural
      const baseDuration = state === 'recording' ? 200 : 300;
      const duration = baseDuration + Math.random() * 100;

      heightValue.value = withDelay(
        delay,
        withRepeat(
          withSequence(
            withTiming(maxHeightFactor, {
              duration,
              easing: Easing.inOut(Easing.ease),
            }),
            withTiming(minHeight, {
              duration,
              easing: Easing.inOut(Easing.ease),
            })
          ),
          -1, // Repetir infinitamente
          true // Reverter
        )
      );
    }

    return () => {
      cancelAnimation(heightValue);
    };
  }, [state, index, heightValue]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      height: interpolate(heightValue.value, [0, 1], [4, maxHeight]),
      backgroundColor: color,
    };
  });

  return (
    <Animated.View
      style={[
        styles.bar,
        {
          width: barWidth,
          borderRadius: barWidth / 2,
        },
        animatedStyle,
      ]}
    />
  );
};

/**
 * AudioWaveform Component
 */
export const AudioWaveform: React.FC<AudioWaveformProps> = ({
  state = 'idle',
  height = 40,
  width = 120,
  color,
  onCycleComplete,
}) => {
  // Calcular dimensões das barras
  const gap = 3;
  const totalGaps = (BAR_COUNT - 1) * gap;
  const barWidth = Math.max(2, (width - totalGaps) / BAR_COUNT);

  const activeColor = getStateColor(state, color);

  // Efeito de pulse no container durante gravação
  const containerScale = useSharedValue(1);

  useEffect(() => {
    if (state === 'recording') {
      containerScale.value = withRepeat(
        withSequence(
          withTiming(1.02, { duration: 500, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 500, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
    } else {
      containerScale.value = withTiming(1, { duration: 200 });
    }

    return () => {
      cancelAnimation(containerScale);
    };
  }, [state, containerScale]);

  const containerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: containerScale.value }],
  }));

  return (
    <Animated.View
      style={[
        styles.container,
        {
          height,
          width,
          gap,
        },
        containerAnimatedStyle,
      ]}
    >
      {Array.from({ length: BAR_COUNT }).map((_, index) => (
        <AnimatedBar
          key={index}
          index={index}
          state={state}
          color={activeColor}
          maxHeight={height}
          barWidth={barWidth}
        />
      ))}
    </Animated.View>
  );
};

/**
 * Componente compacto para uso em botões
 */
export const AudioWaveformMini: React.FC<{
  state?: WaveformState;
  color?: string;
}> = ({ state = 'idle', color }) => (
  <AudioWaveform state={state} height={20} width={60} color={color} />
);

/**
 * Componente expandido para tela de gravação
 */
export const AudioWaveformLarge: React.FC<{
  state?: WaveformState;
  color?: string;
}> = ({ state = 'idle', color }) => (
  <AudioWaveform state={state} height={60} width={200} color={color} />
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bar: {
    minHeight: 4,
  },
});

export default AudioWaveform;
