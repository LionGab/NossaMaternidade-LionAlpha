/**
 * BreathingGuide - Guia de Respiração Animado
 *
 * Componente visual para exercícios de respiração com:
 * - Círculo pulsante animado
 * - 3 fases: inhale/hold/exhale
 * - Texto guia sincronizado
 * - Haptic feedback opcional
 *
 * @version 1.0.0 - Migrado do app-redesign-studio
 */

import * as Haptics from 'expo-haptics';
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withRepeat,
  Easing,
  cancelAnimation,
  runOnJS,
  interpolate,
  interpolateColor,
} from 'react-native-reanimated';

import { Text } from '@/components/primitives/Text';
import { WebColors } from '@/theme/webColors';
import { Tokens } from '@/theme/tokens';

// Fases da respiração
export type BreathingPhase = 'inhale' | 'hold' | 'exhale' | 'idle';

// Configurações de tempo (em segundos)
export interface BreathingConfig {
  inhaleDuration: number;
  holdDuration: number;
  exhaleDuration: number;
  cycles: number; // -1 para infinito
}

// Configurações padrão (técnica 4-7-8)
const DEFAULT_CONFIG: BreathingConfig = {
  inhaleDuration: 4,
  holdDuration: 7,
  exhaleDuration: 8,
  cycles: 3,
};

// Configuração rápida (4-4-4)
export const QUICK_BREATHING: BreathingConfig = {
  inhaleDuration: 4,
  holdDuration: 4,
  exhaleDuration: 4,
  cycles: 3,
};

// Configuração calmante (4-7-8)
export const CALMING_BREATHING: BreathingConfig = {
  inhaleDuration: 4,
  holdDuration: 7,
  exhaleDuration: 8,
  cycles: 3,
};

// Configuração energizante (4-0-4)
export const ENERGIZING_BREATHING: BreathingConfig = {
  inhaleDuration: 4,
  holdDuration: 0,
  exhaleDuration: 4,
  cycles: 5,
};

interface BreathingGuideProps {
  /** Configuração de tempos */
  config?: BreathingConfig;
  /** Tamanho do círculo */
  size?: number;
  /** Cor primária (expandido) */
  primaryColor?: string;
  /** Cor secundária (contraído) */
  secondaryColor?: string;
  /** Se deve iniciar automaticamente */
  autoStart?: boolean;
  /** Habilitar haptic feedback */
  enableHaptics?: boolean;
  /** Callback quando completa todos os ciclos */
  onComplete?: () => void;
  /** Callback em cada mudança de fase */
  onPhaseChange?: (phase: BreathingPhase, cycleNumber: number) => void;
  /** Callback quando inicia/para */
  onActiveChange?: (isActive: boolean) => void;
}

/**
 * Textos para cada fase
 */
const PHASE_TEXTS: Record<BreathingPhase, string> = {
  inhale: 'Inspire...',
  hold: 'Segure...',
  exhale: 'Expire...',
  idle: 'Toque para iniciar',
};

/**
 * BreathingGuide Component
 */
export const BreathingGuide: React.FC<BreathingGuideProps> = ({
  config = DEFAULT_CONFIG,
  size = 200,
  primaryColor = WebColors.rosa.main,
  secondaryColor = WebColors.azul.light,
  autoStart = false,
  enableHaptics = true,
  onComplete,
  onPhaseChange,
  onActiveChange,
}) => {
  const [isActive, setIsActive] = useState(autoStart);
  const [currentPhase, setCurrentPhase] = useState<BreathingPhase>('idle');
  const [currentCycle, setCurrentCycle] = useState(0);

  // Animação principal
  const scale = useSharedValue(0.6);
  const opacity = useSharedValue(0.7);
  const progress = useSharedValue(0);

  // Referência para controle de ciclo
  const cycleRef = useRef(0);
  const isRunningRef = useRef(false);

  // Trigger haptic feedback
  const triggerHaptic = useCallback(
    (type: 'light' | 'medium' | 'heavy') => {
      if (!enableHaptics) return;

      switch (type) {
        case 'light':
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          break;
        case 'medium':
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          break;
        case 'heavy':
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          break;
      }
    },
    [enableHaptics]
  );

  // Atualizar fase
  const updatePhase = useCallback(
    (phase: BreathingPhase) => {
      setCurrentPhase(phase);
      onPhaseChange?.(phase, cycleRef.current);
    },
    [onPhaseChange]
  );

  // Executar ciclo de respiração
  const runBreathingCycle = useCallback(() => {
    if (!isRunningRef.current) return;

    const { inhaleDuration, holdDuration, exhaleDuration, cycles } = config;

    // Verificar se completou todos os ciclos
    if (cycles > 0 && cycleRef.current >= cycles) {
      isRunningRef.current = false;
      setIsActive(false);
      setCurrentPhase('idle');
      scale.value = withTiming(0.6, { duration: 500 });
      opacity.value = withTiming(0.7, { duration: 500 });
      onComplete?.();
      return;
    }

    cycleRef.current += 1;
    setCurrentCycle(cycleRef.current);

    // FASE 1: Inhale
    runOnJS(updatePhase)('inhale');
    runOnJS(triggerHaptic)('medium');

    scale.value = withTiming(1, {
      duration: inhaleDuration * 1000,
      easing: Easing.inOut(Easing.ease),
    });

    opacity.value = withTiming(1, {
      duration: inhaleDuration * 1000,
      easing: Easing.inOut(Easing.ease),
    });

    // FASE 2: Hold (após inhale)
    setTimeout(() => {
      if (!isRunningRef.current) return;
      runOnJS(updatePhase)('hold');
      runOnJS(triggerHaptic)('light');
    }, inhaleDuration * 1000);

    // FASE 3: Exhale (após hold)
    setTimeout(
      () => {
        if (!isRunningRef.current) return;
        runOnJS(updatePhase)('exhale');
        runOnJS(triggerHaptic)('medium');

        scale.value = withTiming(0.6, {
          duration: exhaleDuration * 1000,
          easing: Easing.inOut(Easing.ease),
        });

        opacity.value = withTiming(0.7, {
          duration: exhaleDuration * 1000,
          easing: Easing.inOut(Easing.ease),
        });
      },
      (inhaleDuration + holdDuration) * 1000
    );

    // Próximo ciclo
    const totalDuration = inhaleDuration + holdDuration + exhaleDuration;
    setTimeout(() => {
      if (isRunningRef.current) {
        runBreathingCycle();
      }
    }, totalDuration * 1000);
  }, [config, scale, opacity, onComplete, updatePhase, triggerHaptic]);

  // Iniciar/Parar exercício
  const toggleActive = useCallback(() => {
    if (isActive) {
      // Parar
      isRunningRef.current = false;
      cancelAnimation(scale);
      cancelAnimation(opacity);

      setIsActive(false);
      setCurrentPhase('idle');
      setCurrentCycle(0);
      cycleRef.current = 0;

      scale.value = withTiming(0.6, { duration: 300 });
      opacity.value = withTiming(0.7, { duration: 300 });

      onActiveChange?.(false);
    } else {
      // Iniciar
      isRunningRef.current = true;
      cycleRef.current = 0;
      setIsActive(true);

      onActiveChange?.(true);
      triggerHaptic('heavy');

      // Pequeno delay para feedback visual
      setTimeout(() => {
        runBreathingCycle();
      }, 300);
    }
  }, [isActive, scale, opacity, runBreathingCycle, onActiveChange, triggerHaptic]);

  // Auto-start
  useEffect(() => {
    if (autoStart && !isActive) {
      toggleActive();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cleanup
  useEffect(() => {
    return () => {
      isRunningRef.current = false;
      cancelAnimation(scale);
      cancelAnimation(opacity);
    };
  }, [scale, opacity]);

  // Estilo animado do círculo principal
  const circleAnimatedStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      scale.value,
      [0.6, 1],
      [secondaryColor, primaryColor]
    );

    return {
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
      backgroundColor,
    };
  });

  // Estilo do círculo de borda (pulse)
  const borderAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: interpolate(scale.value, [0.6, 1], [1, 1.1]) }],
      opacity: interpolate(scale.value, [0.6, 1], [0.3, 0.6]),
    };
  });

  return (
    <View style={styles.container}>
      {/* Círculo de borda (pulse effect) */}
      <Animated.View
        style={[
          styles.borderCircle,
          {
            width: size + 20,
            height: size + 20,
            borderRadius: (size + 20) / 2,
            borderColor: primaryColor,
          },
          borderAnimatedStyle,
        ]}
      />

      {/* Círculo principal */}
      <Pressable onPress={toggleActive} accessibilityRole="button">
        <Animated.View
          style={[
            styles.circle,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
            },
            circleAnimatedStyle,
          ]}
        >
          {/* Texto central */}
          <Text
            variant="body"
            size="lg"
            weight="bold"
            color="inverse"
            style={styles.phaseText}
          >
            {PHASE_TEXTS[currentPhase]}
          </Text>

          {/* Contador de ciclos */}
          {isActive && config.cycles > 0 && (
            <Text variant="caption" size="sm" color="inverse" style={styles.cycleText}>
              {currentCycle} / {config.cycles}
            </Text>
          )}
        </Animated.View>
      </Pressable>

      {/* Instrução */}
      <Text
        variant="body"
        size="sm"
        color="secondary"
        style={styles.instruction}
      >
        {isActive
          ? 'Toque para parar'
          : 'Toque no círculo para começar'}
      </Text>
    </View>
  );
};

/**
 * Versão compacta para inline
 */
export const BreathingGuideMini: React.FC<{
  size?: number;
  autoStart?: boolean;
  onComplete?: () => void;
}> = ({ size = 100, autoStart = true, onComplete }) => (
  <BreathingGuide
    size={size}
    config={QUICK_BREATHING}
    autoStart={autoStart}
    onComplete={onComplete}
  />
);

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Tokens.spacing['6'],
  },
  borderCircle: {
    position: 'absolute',
    borderWidth: 2,
    borderStyle: 'dashed',
  },
  circle: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  phaseText: {
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  cycleText: {
    marginTop: Tokens.spacing['2'],
    opacity: 0.8,
  },
  instruction: {
    marginTop: Tokens.spacing['4'],
    textAlign: 'center',
  },
});

export default BreathingGuide;
