/**
 * RitualProgress - Indicador visual de progresso do Ritual
 *
 * Exibe barra de progresso linear e indicadores de passos completados/atuais.
 * Referência: app-redesign-studio-ab40635e/src/components/ritual/RitualProgress.tsx
 * Adaptado para React Native com react-native-reanimated.
 */

import { CheckCircle2 } from 'lucide-react-native';
import React from 'react';
import { View } from 'react-native';
import Animated, { useAnimatedStyle, withTiming as _withTiming } from 'react-native-reanimated';

import { Box } from '@/components/atoms/Box';
import { Text } from '@/components/atoms/Text';
import { useTheme } from '@/theme';
import { Tokens as _Tokens, ColorTokens } from '@/theme/tokens';
import type { RitualStep } from '@/types/ritual';

interface RitualProgressProps {
  steps: RitualStep[];
  currentStepIndex: number;
  progress: number; // 0-100
  timeRemaining?: number; // segundos restantes do passo atual
}

export function RitualProgress({
  steps,
  currentStepIndex,
  progress,
  timeRemaining: _timeRemaining,
}: RitualProgressProps) {
  const { colors, isDark } = useTheme();

  // const _stepProgress = (index: number) => {
  //   if (index < currentStepIndex) return 100; // Completo
  //   if (index === currentStepIndex) {
  //     const step = steps[index];
  //     if (!step) return 0;
  //     // Calcular progresso baseado no tempo restante
  //     if (timeRemaining !== undefined) {
  //       const elapsed = step.duration - timeRemaining;
  //       return Math.max(0, Math.min(100, (elapsed / step.duration) * 100));
  //     }
  //     // Fallback: usar progresso geral
  //     return (progress / steps.length) * 100;
  //   }
  //   return 0; // Não iniciado
  // };

  const progressAnimatedStyle = useAnimatedStyle(() => ({
    width: `${progress}%`,
  }));

  return (
    <Box gap="4">
      {/* Barra de progresso linear */}
      <Box gap="2">
        <Box direction="row" justify="space-between">
          <Text size="xs" color="tertiary">
            Progresso do Ritual
          </Text>
          <Text size="xs" color="tertiary">
            {Math.round(progress)}%
          </Text>
        </Box>
        <View
          style={{
            height: 12,
            backgroundColor: isDark ? ColorTokens.neutral[700] : ColorTokens.neutral[200],
            borderRadius: 6,
            overflow: 'hidden',
          }}
        >
          <Animated.View
            style={[
              {
                height: '100%',
                backgroundColor: isDark ? ColorTokens.primary[500] : ColorTokens.primary[500],
              },
              progressAnimatedStyle,
            ]}
          />
        </View>
      </Box>

      {/* Indicadores de passos */}
      <Box direction="row" align="center" justify="space-between" gap="2">
        {steps.map((step, index) => {
          const isCompleted = index < currentStepIndex;
          const isCurrent = index === currentStepIndex;
          // const _stepProg = stepProgress(index);

          return (
            <Box key={step.id} flex={1} align="center" gap="2">
              {/* Círculo do passo */}
              <View style={{ position: 'relative', width: 48, height: 48 }}>
                {/* Círculo de fundo */}
                <View
                  style={{
                    position: 'absolute',
                    inset: 0,
                    borderRadius: 24,
                    borderWidth: 2,
                    borderColor: isCompleted
                      ? ColorTokens.success[500]
                      : isCurrent
                      ? colors.primary.main
                      : isDark
                      ? ColorTokens.neutral[700]
                      : ColorTokens.neutral[300],
                    backgroundColor: isCompleted
                      ? `${ColorTokens.success[500]}20`
                      : isCurrent
                      ? `${colors.primary.main}20`
                      : isDark
                      ? `${ColorTokens.neutral[800]}80`
                      : `${ColorTokens.neutral[100]}80`,
                  }}
                />

                {/* Progresso do passo atual */}
                {isCurrent && (
                  <Animated.View
                    style={[
                      {
                        position: 'absolute',
                        inset: 0,
                        borderRadius: 24,
                        borderWidth: 2,
                        borderColor: colors.primary.main,
                      },
                    ]}
                  />
                )}

                {/* Conteúdo do círculo */}
                <View
                  style={{
                    position: 'absolute',
                    inset: 0,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {isCompleted ? (
                    <CheckCircle2
                      size={24}
                      color={ColorTokens.success[500]}
                      fill={ColorTokens.success[500]}
                    />
                  ) : (
                    <Text
                      size="sm"
                      weight="bold"
                      style={{
                        color: isCurrent ? colors.primary.main : colors.text.tertiary,
                      }}
                    >
                      {index + 1}
                    </Text>
                  )}
                </View>

                {/* Pulso para passo atual */}
                {isCurrent && (
                  <Animated.View
                    style={{
                      position: 'absolute',
                      inset: -4,
                      borderRadius: 26,
                      borderWidth: 2,
                      borderColor: colors.primary.main,
                      opacity: 0.5,
                    }}
                  />
                )}
              </View>

              {/* Label do passo (apenas primeira palavra) */}
              <Text
                size="xs"
                align="center"
                weight="medium"
                numberOfLines={1}
                style={{
                  color: isCurrent ? colors.primary.main : colors.text.tertiary,
                }}
              >
                {step.title.split(' ')[0]}
              </Text>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}

