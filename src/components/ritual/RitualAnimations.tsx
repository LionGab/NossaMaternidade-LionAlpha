/**
 * RitualAnimations - Animações de fundo para Ritual
 *
 * Componente que renderiza animações de fundo baseadas no tipo de passo do ritual.
 * Referência: app-redesign-studio-ab40635e/src/components/ritual/RitualAnimations.tsx
 * Adaptado para React Native com react-native-reanimated e LinearGradient.
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

import { useTheme } from '@/theme';
import { ColorTokens } from '@/theme/tokens';
import type { RitualStepType, AnimationType } from '@/types/ritual';

interface RitualAnimationsProps {
  animationType?: AnimationType | 'none';
  stepType?: RitualStepType;
  progress?: number; // 0-100
}

export function RitualAnimations({
  animationType = 'gradient',
  stepType,
  progress = 0,
}: RitualAnimationsProps) {
  const { isDark } = useTheme();

  if (animationType === 'none') return null;

  // Determinar animação baseada no tipo de passo se não especificado
  const getAnimationType = (): AnimationType => {
    if (animationType !== 'gradient') return animationType as AnimationType;

    switch (stepType) {
      case 'breathing':
        return 'pulse';
      case 'gratitude':
        return 'particles';
      case 'visualization':
        return 'waves';
      default:
        return 'gradient';
    }
  };

  const finalAnimationType = getAnimationType();

  // Partículas flutuantes
  const Particles = () => {
    const particles = Array.from({ length: 20 });
    return (
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        {particles.map((_, i) => {
          const translateY = useSharedValue(0);
          const opacity = useSharedValue(0);

          React.useEffect(() => {
            translateY.value = withRepeat(
              withTiming(-100, {
                duration: (Math.random() * 3000 + 2000),
                easing: Easing.linear,
              }),
              -1
            );
            opacity.value = withRepeat(
              withTiming(1, {
                duration: 1000,
                easing: Easing.inOut(Easing.ease),
              }),
              -1,
              true
            );
          }, []);

          const animatedStyle = useAnimatedStyle(() => ({
            transform: [
              {
                translateY: translateY.value,
              },
            ],
            opacity: opacity.value,
          }));

          return (
            <Animated.View
              key={i}
              style={[
                {
                  position: 'absolute',
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: isDark
                    ? `${ColorTokens.secondary[400]}30`
                    : `${ColorTokens.secondary[400]}30`,
                  left: `${Math.random() * 100}%`,
                  top: '100%',
                },
                animatedStyle,
              ]}
            />
          );
        })}
      </View>
    );
  };

  // Ondas de energia
  const Waves = () => {
    const scale1 = useSharedValue(0);
    const scale2 = useSharedValue(0);
    const scale3 = useSharedValue(0);
    const opacity1 = useSharedValue(0.8);
    const opacity2 = useSharedValue(0.8);
    const opacity3 = useSharedValue(0.8);

    React.useEffect(() => {
      scale1.value = withRepeat(
        withTiming(2.5, {
          duration: 3000,
          easing: Easing.out(Easing.ease),
        }),
        -1
      );
      opacity1.value = withRepeat(
        withTiming(0, {
          duration: 3000,
          easing: Easing.out(Easing.ease),
        }),
        -1
      );

      setTimeout(() => {
        scale2.value = withRepeat(
          withTiming(2.5, {
            duration: 3000,
            easing: Easing.out(Easing.ease),
          }),
          -1
        );
        opacity2.value = withRepeat(
          withTiming(0, {
            duration: 3000,
            easing: Easing.out(Easing.ease),
          }),
          -1
        );
      }, 1000);

      setTimeout(() => {
        scale3.value = withRepeat(
          withTiming(2.5, {
            duration: 3000,
            easing: Easing.out(Easing.ease),
          }),
          -1
        );
        opacity3.value = withRepeat(
          withTiming(0, {
            duration: 3000,
            easing: Easing.out(Easing.ease),
          }),
          -1
        );
      }, 2000);
    }, []);

    const animatedStyle1 = useAnimatedStyle(() => ({
      transform: [{ scale: scale1.value }],
      opacity: opacity1.value,
    }));

    const animatedStyle2 = useAnimatedStyle(() => ({
      transform: [{ scale: scale2.value }],
      opacity: opacity2.value,
    }));

    const animatedStyle3 = useAnimatedStyle(() => ({
      transform: [{ scale: scale3.value }],
      opacity: opacity3.value,
    }));

    return (
      <View
        style={[
          StyleSheet.absoluteFill,
          {
            alignItems: 'center',
            justifyContent: 'center',
          },
        ]}
        pointerEvents="none"
      >
        <Animated.View
          style={[
            {
              width: 256,
              height: 256,
              borderRadius: 128,
              borderWidth: 2,
              borderColor: isDark
                ? `${ColorTokens.secondary[400]}20`
                : `${ColorTokens.secondary[400]}20`,
            },
            animatedStyle1,
          ]}
        />
        <Animated.View
          style={[
            {
              width: 256,
              height: 256,
              borderRadius: 128,
              borderWidth: 2,
              borderColor: isDark
                ? `${ColorTokens.secondary[400]}20`
                : `${ColorTokens.secondary[400]}20`,
            },
            animatedStyle2,
          ]}
        />
        <Animated.View
          style={[
            {
              width: 256,
              height: 256,
              borderRadius: 128,
              borderWidth: 2,
              borderColor: isDark
                ? `${ColorTokens.secondary[400]}20`
                : `${ColorTokens.secondary[400]}20`,
            },
            animatedStyle3,
          ]}
        />
      </View>
    );
  };

  // Gradiente animado
  const Gradient = () => {
    const hue = useSharedValue((progress * 3.6 + 340) % 360);

    React.useEffect(() => {
      hue.value = withRepeat(
        withTiming((progress * 3.6 + 340 + 40) % 360, {
          duration: 10000,
          easing: Easing.linear,
        }),
        -1
      );
    }, [progress]);

    const animatedStyle = useAnimatedStyle(() => {
      const currentHue = hue.value;
      return {
        opacity: 0.3,
      };
    });

    return (
      <Animated.View style={[StyleSheet.absoluteFill, animatedStyle]} pointerEvents="none">
        <LinearGradient
          colors={
            isDark
              ? [
                  `hsl(${(progress * 3.6 + 340) % 360}, 75%, 35%)`,
                  `hsl(${((progress * 3.6 + 340 + 40) % 360)}, 60%, 45%)`,
                ]
              : [
                  `hsl(${(progress * 3.6 + 340) % 360}, 75%, 65%)`,
                  `hsl(${((progress * 3.6 + 340 + 40) % 360)}, 60%, 75%)`,
                ]
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    );
  };

  // Pulso
  const Pulse = () => {
    const scale = useSharedValue(1);
    const opacity = useSharedValue(0.3);

    React.useEffect(() => {
      scale.value = withRepeat(
        withTiming(1.2, {
          duration: 3000,
          easing: Easing.inOut(Easing.ease),
        }),
        -1,
        true
      );
      opacity.value = withRepeat(
        withTiming(0.6, {
          duration: 3000,
          easing: Easing.inOut(Easing.ease),
        }),
        -1,
        true
      );
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    }));

    return (
      <View
        style={[
          StyleSheet.absoluteFill,
          {
            alignItems: 'center',
            justifyContent: 'center',
          },
        ]}
        pointerEvents="none"
      >
        <Animated.View
          style={[
            {
              width: 128,
              height: 128,
              borderRadius: 64,
            },
            animatedStyle,
          ]}
        >
          <LinearGradient
            colors={
              isDark
                ? [`${ColorTokens.secondary[400]}20`, `${ColorTokens.primary[400]}20`]
                : [`${ColorTokens.secondary[400]}20`, `${ColorTokens.primary[400]}20`]
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
      </View>
    );
  };

  return (
    <View style={[StyleSheet.absoluteFill, { zIndex: -1 }]} pointerEvents="none">
      {finalAnimationType === 'particles' && <Particles />}
      {finalAnimationType === 'waves' && <Waves />}
      {finalAnimationType === 'gradient' && <Gradient />}
      {finalAnimationType === 'pulse' && <Pulse />}
    </View>
  );
}

