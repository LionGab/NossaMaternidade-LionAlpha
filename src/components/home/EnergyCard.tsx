/**
 * EnergyCard - Card de energia/equilíbrio com círculo de progresso
 * Design inspirado na screenshot - "Meu Equilíbrio"
 */

import { Zap } from 'lucide-react-native';
import React, { useEffect, useRef } from 'react';
import { View, Animated, Easing } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';

import { Box } from '@/components/primitives/Box';
import { Text } from '@/components/primitives/Text';
import { useResponsiveDimensions } from '@/hooks/useResponsiveDimensions';
import { useTheme } from '@/theme';
import { Tokens, ColorTokens } from '@/theme/tokens';

export interface EnergyCardProps {
  /** Porcentagem de energia (0-100) */
  percentage: number;
  /** Foco atual (ex: "Autocuidado") */
  focus?: string;
  /** Título do card */
  title?: string;
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export function EnergyCard({
  percentage,
  focus = 'Autocuidado',
  title = 'Sua Energia',
}: EnergyCardProps) {
  const { colors, isDark } = useTheme();
  const { circleSize } = useResponsiveDimensions();
  const animatedValue = useRef(new Animated.Value(0)).current;

  // Círculo de progresso (responsivo)
  const size = circleSize;
  const strokeWidth = Math.max(6, Math.floor(size * 0.1)); // 10% do tamanho, mínimo 6
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: percentage,
      duration: 1200,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [percentage, animatedValue]);

  const strokeDashoffset = animatedValue.interpolate({
    inputRange: [0, 100],
    outputRange: [circumference, 0],
  });

  // Cor do progresso baseada na porcentagem
  const getProgressColor = () => {
    if (percentage >= 70) return ColorTokens.success[400];
    if (percentage >= 40) return ColorTokens.warning[400];
    return ColorTokens.error[400];
  };

  return (
    <Box
      style={{
        backgroundColor: isDark ? ColorTokens.neutral[900] : colors.background.card,
        borderRadius: Tokens.radius['2xl'],
        padding: Tokens.spacing['5'],
        borderWidth: 1,
        borderColor: isDark ? ColorTokens.neutral[800] : colors.border.light,
        ...Tokens.shadows.lg,
      }}
      accessible={true}
      accessibilityLabel={`Sua energia está em ${percentage}%. Foco: ${focus}`}
      accessibilityHint="Card mostrando seu nível de energia atual"
    >
      {/* Badge "Meu Equilíbrio" */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: Tokens.spacing['2'],
          marginBottom: Tokens.spacing['4'],
        }}
      >
        <Zap size={14} color={ColorTokens.success[400]} fill={ColorTokens.success[400]} />
        <Text
          size="xs"
          weight="bold"
          style={{
            color: ColorTokens.success[400],
            textTransform: 'uppercase',
            letterSpacing: 1,
          }}
        >
          Meu Equilíbrio
        </Text>
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        {/* Círculo de Progresso */}
        <View style={{ marginRight: Tokens.spacing['5'] }}>
          <Svg width={size} height={size} style={{ transform: [{ rotate: '-90deg' }] }}>
            <Defs>
              <LinearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <Stop offset="0%" stopColor={ColorTokens.success[400]} />
                <Stop offset="100%" stopColor={ColorTokens.success[300]} />
              </LinearGradient>
            </Defs>
            {/* Background circle */}
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={isDark ? ColorTokens.neutral[700] : ColorTokens.neutral[200]}
              strokeWidth={strokeWidth}
              fill="transparent"
            />
            {/* Progress circle */}
            <AnimatedCircle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="url(#progressGradient)"
              strokeWidth={strokeWidth}
              fill="transparent"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
            />
          </Svg>
          {/* Percentage text in center */}
          <View
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Text
              weight="bold"
              style={{
                fontSize: 20,
                color: getProgressColor(),
              }}
            >
              {Math.round(percentage)}%
            </Text>
          </View>
        </View>

        {/* Texto */}
        <View style={{ flex: 1 }}>
          <Text
            size="xl"
            weight="bold"
            color="primary"
            style={{ marginBottom: Tokens.spacing['1'] }}
          >
            {title}
          </Text>
          <Text size="sm" color="secondary">
            Foco: {focus}
          </Text>
        </View>
      </View>
    </Box>
  );
}

export default EnergyCard;
