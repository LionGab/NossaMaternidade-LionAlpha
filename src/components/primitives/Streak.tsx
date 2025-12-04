/**
 * Streak
 *
 * Contador visual de streak (sequência de dias).
 * Usado para gamificação de hábitos.
 * Inspirado no design do Flo app.
 *
 * @module components/primitives/Streak
 */

import { Flame, Trophy, Target } from 'lucide-react-native';
import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';

import { useTheme } from '@/theme';
import { Tokens, ColorTokens } from '@/theme/tokens';

import { Text } from './Text';

// ======================
// 🎯 TYPES
// ======================

export interface StreakProps {
  /** Streak atual */
  current: number;
  /** Melhor streak já alcançado */
  best?: number;
  /** Meta de streak */
  goal?: number;
  /** Tamanho do componente */
  size?: 'sm' | 'md' | 'lg';
  /** Mostrar label "dias" */
  showLabel?: boolean;
  /** Mostrar best streak */
  showBest?: boolean;
  /** Cor customizada */
  color?: string;
  /** Orientação do layout */
  layout?: 'horizontal' | 'vertical';
  /** Se está ativo (streak não quebrado) */
  isActive?: boolean;
}

// ======================
// 🎨 SIZE CONFIGS
// ======================

const SIZE_CONFIG = {
  sm: {
    iconSize: 14,
    fontSize: Tokens.typography.sizes.sm, // 14
    labelSize: Tokens.typography.sizes.xs, // 12
    gap: Tokens.spacing['1'], // 4
    padding: Tokens.spacing['2'], // 8
  },
  md: {
    iconSize: 18,
    fontSize: Tokens.typography.sizes.lg, // 18
    labelSize: Tokens.typography.sizes.sm, // 14
    gap: Tokens.spacing['1.5'], // 6
    padding: Tokens.spacing['3'], // 12
  },
  lg: {
    iconSize: 24,
    fontSize: Tokens.typography.sizes['2xl'], // 24
    labelSize: Tokens.typography.sizes.md, // 16
    gap: Tokens.spacing['2'], // 8
    padding: Tokens.spacing['4'], // 16
  },
};

// ======================
// 🧩 COMPONENT
// ======================

export const Streak: React.FC<StreakProps> = ({
  current,
  best,
  goal,
  size = 'md',
  showLabel = true,
  showBest = false,
  color,
  layout = 'horizontal',
  isActive = true,
}) => {
  const { colors } = useTheme();
  const sizeConfig = SIZE_CONFIG[size];

  // Determine streak color
  const streakColor = useMemo(() => {
    if (color) return color;
    if (!isActive) return colors.text.tertiary;
    if (current >= (goal || 30)) return ColorTokens.success[500]; // Goal reached - green
    if (current >= 7) return ColorTokens.warning[500]; // Week streak - orange
    return colors.primary.main; // Default - primary
  }, [color, isActive, current, goal, colors]);

  // Check if this is a new record
  const isNewRecord = best !== undefined && current > 0 && current === best;

  // Calculate progress towards goal
  const progress = goal ? Math.min(1, current / goal) : undefined;

  const containerStyle = useMemo(
    () => ({
      flexDirection: layout === 'horizontal' ? ('row' as const) : ('column' as const),
      alignItems: 'center' as const,
      gap: sizeConfig.gap,
    }),
    [layout, sizeConfig]
  );

  return (
    <View style={containerStyle}>
      {/* Current Streak */}
      <View style={[styles.streakRow, { gap: sizeConfig.gap }]}>
        <Flame
          size={sizeConfig.iconSize}
          color={streakColor}
          fill={isActive ? streakColor : 'transparent'}
        />
        <Text
          weight="bold"
          style={{
            fontSize: sizeConfig.fontSize,
            color: streakColor,
          }}
        >
          {current}
        </Text>
        {showLabel && (
          <Text color="secondary" style={{ fontSize: sizeConfig.labelSize }}>
            {current === 1 ? 'dia' : 'dias'}
          </Text>
        )}
      </View>

      {/* Best Streak */}
      {showBest && best !== undefined && best > 0 && (
        <View style={[styles.streakRow, { gap: sizeConfig.gap / 2 }]}>
          <Trophy
            size={sizeConfig.iconSize * 0.7}
            color={isNewRecord ? ColorTokens.warning[500] : colors.text.tertiary}
          />
          <Text
            size="xs"
            color={isNewRecord ? 'primary' : 'tertiary'}
            weight={isNewRecord ? 'semibold' : 'regular'}
          >
            {isNewRecord ? 'Novo recorde!' : `Recorde: ${best}`}
          </Text>
        </View>
      )}

      {/* Goal Progress */}
      {goal !== undefined && progress !== undefined && (
        <View style={styles.goalContainer}>
          <View style={[styles.progressBar, { backgroundColor: colors.border.light }]}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${progress * 100}%`,
                  backgroundColor: streakColor,
                },
              ]}
            />
          </View>
          <View style={[styles.streakRow, { gap: sizeConfig.gap / 2 }]}>
            <Target size={sizeConfig.iconSize * 0.6} color={colors.text.tertiary} />
            <Text size="xs" color="tertiary">
              Meta: {goal} dias
            </Text>
          </View>
        </View>
      )}
    </View>
  );
};

// ======================
// 💄 STYLES
// ======================

const styles = StyleSheet.create({
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  goalContainer: {
    width: '100%',
    gap: Tokens.spacing['1'],
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
    width: '100%',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
});

export default Streak;
