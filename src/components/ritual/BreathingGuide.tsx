/**
 * BreathingGuide - Guia visual de respiração consciente
 *
 * Componente interativo que guia a usuária através de ciclos de respiração
 * com animações visuais e feedback tátil.
 * Referência: app-redesign-studio-ab40635e/src/components/ritual/BreathingGuide.tsx
 * Adaptado para React Native com react-native-reanimated.
 */

import * as Haptics from 'expo-haptics';
import { Wind } from 'lucide-react-native';
import React, { useState, useEffect, useRef } from 'react';
import { View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  cancelAnimation,
} from 'react-native-reanimated';

import { Box } from '@/components/atoms/Box';
import { Button } from '@/components/atoms/Button';
import { Text } from '@/components/atoms/Text';
import { useTheme } from '@/theme';
import { Tokens, ColorTokens } from '@/theme/tokens';
import type { BreathingConfig } from '@/types/ritual';

interface BreathingGuideProps {
  config: BreathingConfig;
  onComplete?: () => void;
  autoStart?: boolean;
}

type BreathingPhase = 'inhale' | 'hold' | 'exhale' | 'pause';

export function BreathingGuide({
  config,
  onComplete,
  autoStart = true,
}: BreathingGuideProps) {
  const { colors, isDark } = useTheme();
  const [phase, setPhase] = useState<BreathingPhase>('inhale');
  const [cycle, setCycle] = useState(0);
  const [isActive, setIsActive] = useState(autoStart);
  const [timeRemaining, setTimeRemaining] = useState(config.inhaleDuration);
  const intervalRef = useRef<number | null>(null);

  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.6);

  const phaseLabels: Record<BreathingPhase, string> = {
    inhale: 'Inspire',
    hold: 'Segure',
    exhale: 'Expire',
    pause: 'Pausa',
  };

  const phaseInstructions: Record<BreathingPhase, string> = {
    inhale: 'Pelo nariz, profundamente',
    hold: 'Mantenha o ar',
    exhale: 'Pela boca, suavemente',
    pause: 'Prepare-se para o próximo ciclo',
  };

  // Inicializar quando ativar
  useEffect(() => {
    if (!isActive) {
      cancelAnimation(scale);
      cancelAnimation(opacity);
      return;
    }

    setPhase('inhale');
    setTimeRemaining(config.inhaleDuration);
  }, [isActive, config]);

  // Animações baseadas na fase
  useEffect(() => {
    if (!isActive) {
      cancelAnimation(scale);
      cancelAnimation(opacity);
      return;
    }

    if (phase === 'inhale') {
      scale.value = withTiming(1.3, {
        duration: config.inhaleDuration * 1000,
        easing: Easing.inOut(Easing.ease),
      });
      opacity.value = withTiming(1, { duration: config.inhaleDuration * 1000 });
    } else if (phase === 'hold') {
      // Manter escala durante hold
    } else if (phase === 'exhale') {
      scale.value = withTiming(1, {
        duration: config.exhaleDuration * 1000,
        easing: Easing.inOut(Easing.ease),
      });
      opacity.value = withTiming(0.6, { duration: config.exhaleDuration * 1000 });
    }
  }, [phase, isActive, config, scale, opacity]);

  // Timer para mudança de fase
  useEffect(() => {
    if (!isActive) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          // Mudar para próxima fase
          if (phase === 'inhale') {
            setPhase('hold');
            return config.holdDuration;
          } else if (phase === 'hold') {
            setPhase('exhale');
            return config.exhaleDuration;
          } else if (phase === 'exhale') {
            const newCycle = cycle + 1;
            setCycle(newCycle);

            if (newCycle >= config.cycles) {
              setIsActive(false);
              onComplete?.();
              return 0;
            } else {
              setPhase('pause');
              return 1;
            }
          } else {
            // pause -> inhale
            setPhase('inhale');
            return config.inhaleDuration;
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [phase, cycle, config, isActive, onComplete]);

  const handleToggle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (isActive) {
      setIsActive(false);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    } else {
      setIsActive(true);
      setCycle(0);
      setPhase('inhale');
      setTimeRemaining(config.inhaleDuration);
    }
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const progress = ((config.cycles - cycle) / config.cycles) * 100;

  return (
    <Box align="center" gap="6" py="8">
      {/* Instrução principal */}
      <Box align="center" gap="2">
        <Text
          size="3xl"
          weight="bold"
          style={{
            color: isDark ? ColorTokens.primary[300] : ColorTokens.primary[600],
          }}
        >
          {phaseLabels[phase]}
        </Text>
        <Text size="md" color="secondary">
          {phaseInstructions[phase]}
        </Text>
      </Box>

      {/* Círculo de respiração */}
      <View
        style={{
          width: 256,
          height: 256,
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        {/* Círculo externo animado */}
        <Animated.View
          style={[
            {
              position: 'absolute',
              width: 256,
              height: 256,
              borderRadius: 128,
              borderWidth: 4,
              borderColor: isDark ? ColorTokens.secondary[400] : ColorTokens.secondary[300],
            },
            animatedStyle,
          ]}
        />

        {/* Círculo médio */}
        <Animated.View
          style={[
            {
              position: 'absolute',
              width: 200,
              height: 200,
              borderRadius: 100,
              borderWidth: 4,
              borderColor: isDark ? ColorTokens.primary[400] : ColorTokens.primary[500],
            },
            animatedStyle,
          ]}
        />

        {/* Círculo interno */}
        <Animated.View
          style={[
            {
              position: 'absolute',
              width: 144,
              height: 144,
              borderRadius: 72,
              backgroundColor: isDark
                ? `${ColorTokens.secondary[400]}20`
                : `${ColorTokens.secondary[400]}20`,
            },
            animatedStyle,
          ]}
        />

        {/* Centro com ícone */}
        <View
          style={{
            position: 'relative',
            zIndex: 10,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Animated.View
            style={{
              transform: [{ rotate: '0deg' }],
            }}
          >
            <Wind
              size={64}
              color={isDark ? ColorTokens.primary[300] : ColorTokens.primary[500]}
            />
          </Animated.View>
          <Text
            size="3xl"
            weight="bold"
            style={{
              marginTop: Tokens.spacing['4'],
              color: colors.text.primary,
            }}
          >
            {timeRemaining}s
          </Text>
        </View>
      </View>

      {/* Progresso */}
      <Box style={{ width: '100%', maxWidth: 320 }} gap="2">
        <Box direction="row" justify="space-between">
          <Text size="xs" color="tertiary">
            Ciclo {cycle + 1} de {config.cycles}
          </Text>
          <Text size="xs" color="tertiary">
            {Math.round(progress)}%
          </Text>
        </Box>
        <View
          style={{
            height: 8,
            backgroundColor: isDark ? ColorTokens.neutral[700] : ColorTokens.neutral[200],
            borderRadius: 4,
            overflow: 'hidden',
          }}
        >
          <Animated.View
            style={{
              height: '100%',
              width: `${progress}%`,
              backgroundColor: isDark ? ColorTokens.primary[500] : ColorTokens.primary[500],
            }}
          />
        </View>
      </Box>

      {/* Controles */}
      <Button
        title={isActive ? 'Pausar' : 'Retomar'}
        onPress={handleToggle}
        variant="outline"
        size="md"
        style={{
          borderRadius: Tokens.radius.full,
          paddingHorizontal: Tokens.spacing['6'],
        }}
      />
    </Box>
  );
}

