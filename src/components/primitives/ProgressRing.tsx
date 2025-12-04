/**
 * ProgressRing - Anel de progresso circular (Flo-style)
 *
 * Usado para visualizar ciclo menstrual, progresso de hábitos, metas, etc.
 * Inspirado no Flo app (period tracker com 350M+ usuários)
 *
 * @example
 * ```tsx
 * import { ProgressRing } from '@/components/primitives/ProgressRing';
 *
 * <ProgressRing
 *   progress={65}
 *   size={120}
 *   strokeWidth={8}
 *   color={colors.primary.main}
 *   backgroundColor={colors.primary.light}
 *   showPercentage
 * />
 * ```
 *
 * @version 1.0
 * @date 2025-11-27
 */

import React from 'react';
import { View, Text, ViewStyle } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { useThemeColors } from '@/hooks/useTheme';
import { TextStyles } from '@/theme/tokens';

export interface ProgressRingProps {
  /** Progresso de 0-100 */
  progress: number;
  /** Tamanho do anel em pixels (diâmetro) */
  size?: number;
  /** Espessura da linha do anel */
  strokeWidth?: number;
  /** Cor da linha de progresso (opcional, usa primary.main por padrão) */
  color?: string;
  /** Cor de fundo do anel (opcional, usa primary.light por padrão) */
  backgroundColor?: string;
  /** Mostrar porcentagem no centro */
  showPercentage?: boolean;
  /** Label customizado no centro (substitui porcentagem) */
  centerLabel?: string;
  /** Style customizado para o container */
  style?: ViewStyle;
  /** Label de acessibilidade */
  accessibilityLabel?: string;
}

/**
 * ProgressRing - Componente de progresso circular
 */
export function ProgressRing({
  progress,
  size = 120,
  strokeWidth = 8,
  color,
  backgroundColor,
  showPercentage = false,
  centerLabel,
  style,
  accessibilityLabel,
}: ProgressRingProps) {
  const colors = useThemeColors();

  // Normalizar progress entre 0-100
  const normalizedProgress = Math.max(0, Math.min(100, progress));

  // Cores finais (usar tokens se não fornecidas)
  const finalColor = color || colors.primary.main;
  const finalBgColor = backgroundColor || colors.primary.light;

  // Cálculos do círculo
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (normalizedProgress / 100) * circumference;

  return (
    <View
      style={[
        {
          width: size,
          height: size,
          position: 'relative',
          justifyContent: 'center',
          alignItems: 'center',
        },
        style,
      ]}
      accessibilityLabel={accessibilityLabel || `Progresso: ${Math.round(normalizedProgress)}%`}
      accessibilityRole="progressbar"
      accessibilityValue={{
        min: 0,
        max: 100,
        now: normalizedProgress,
      }}
    >
      {/* SVG Circle */}
      <Svg
        width={size}
        height={size}
        style={{
          position: 'absolute',
          transform: [{ rotate: '-90deg' }],
        }}
      >
        {/* Background circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={finalBgColor}
          strokeWidth={strokeWidth}
          fill="transparent"
        />

        {/* Progress circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={finalColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          fill="transparent"
          strokeLinecap="round"
        />
      </Svg>

      {/* Center label */}
      {(showPercentage || centerLabel) && (
        <View
          style={{
            position: 'absolute',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Text
            style={{
              ...TextStyles.displaySmall,
              color: colors.text.primary,
              textAlign: 'center',
            }}
          >
            {centerLabel || `${Math.round(normalizedProgress)}%`}
          </Text>
        </View>
      )}
    </View>
  );
}

export default ProgressRing;
