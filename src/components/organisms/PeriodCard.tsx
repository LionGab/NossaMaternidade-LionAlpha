/**
 * PeriodCard
 *
 * Card em formato de coração para exibir informações do ciclo menstrual.
 * Inspirado no design do Lofee - Health Woman UI Kit.
 *
 * @see https://www.figma.com/design/fqH3Ro3Ll8sL2s3EJuW22H/Lofee---Woman-Health-UI-Mobile-Design-Kit
 */

import { LinearGradient } from 'expo-linear-gradient';
import { Heart, Edit3 } from 'lucide-react-native';
import React, { useMemo } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';

import { Box } from '@/components/atoms/Box';
import { HapticButton } from '@/components/atoms/HapticButton';
import { Text } from '@/components/atoms/Text';
import { useTheme } from '@/theme';
import { Tokens, ColorTokens, Typography } from '@/theme/tokens';

// ======================
// 🎯 TYPES
// ======================

export interface PeriodCardProps {
  /** Dia atual do ciclo */
  cycleDay: number;
  /** Fase atual (period, fertile, ovulation, luteal) */
  phase: 'period' | 'fertile' | 'ovulation' | 'luteal';
  /** Probabilidade de gravidez (0-100) */
  pregnancyChance?: number;
  /** Dias até próxima menstruação */
  daysUntilPeriod?: number;
  /** Callback ao clicar no card */
  onPress?: () => void;
  /** Callback ao editar */
  onEdit?: () => void;
}

// ======================
// 🎨 PHASE CONFIGS
// ======================

const PHASE_CONFIG = {
  period: {
    title: 'Período',
    subtitle: 'Menstruação',
    gradientColors: ColorTokens.cycle.period.gradient,
    iconColor: ColorTokens.neutral[0],
  },
  fertile: {
    title: 'Janela Fértil',
    subtitle: 'Alta fertilidade',
    gradientColors: ColorTokens.cycle.fertile.gradient,
    iconColor: ColorTokens.neutral[0],
  },
  ovulation: {
    title: 'Ovulação',
    subtitle: 'Pico de fertilidade',
    gradientColors: ColorTokens.cycle.ovulation.gradient,
    iconColor: ColorTokens.neutral[0],
  },
  luteal: {
    title: 'Fase Lútea',
    subtitle: 'Pós-ovulação',
    gradientColors: ColorTokens.cycle.luteal.gradient,
    iconColor: ColorTokens.neutral[0],
  },
};

// ======================
// 🧩 COMPONENT
// ======================

export const PeriodCard: React.FC<PeriodCardProps> = ({
  cycleDay,
  phase,
  pregnancyChance,
  daysUntilPeriod,
  onPress,
  onEdit,
}) => {
  const { colors, isDark } = useTheme();
  const config = PHASE_CONFIG[phase];

  const containerStyle = useMemo(
    () => ({
      backgroundColor: isDark ? colors.background.card : colors.background.canvas,
      borderRadius: Tokens.radius.xl,
      padding: Tokens.spacing['4'],
      shadowColor: colors.text.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: isDark ? 0.3 : 0.1,
      shadowRadius: 12,
      elevation: 6,
    }),
    [colors, isDark]
  );

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={containerStyle}
      accessibilityLabel={`${config.title}, Dia ${cycleDay} do ciclo`}
      accessibilityHint="Toque para ver detalhes do ciclo"
    >
      {/* Edit Button */}
      {onEdit && (
        <HapticButton
          variant="ghost"
          size="sm"
          onPress={onEdit}
          style={styles.editButton}
          accessibilityLabel="Editar ciclo"
        >
          <View style={[styles.editIconBg, { backgroundColor: colors.primary.main }]}>
            <Edit3 size={14} color={colors.text.inverse} />
          </View>
        </HapticButton>
      )}

      {/* Heart Shape with Gradient */}
      <View style={styles.heartContainer}>
        <LinearGradient
          colors={config.gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heartGradient}
        >
          {/* Heart SVG Path approximation using View */}
          <View style={styles.heartContent}>
            <Text size="xs" weight="medium" style={{ color: config.iconColor, opacity: 0.9 }}>
              {config.title}:
            </Text>

            <Text
              size="xl"
              weight="bold"
              style={{ color: config.iconColor, fontSize: Typography.sizes['2xl'] }}
            >
              Dia {cycleDay}
            </Text>

            {pregnancyChance !== undefined && (
              <Box mt="1">
                <Text size="xs" style={{ color: config.iconColor, opacity: 0.8 }}>
                  Chance de gravidez:
                </Text>
                <Text size="lg" weight="bold" style={{ color: config.iconColor }}>
                  {pregnancyChance.toFixed(1)}%
                </Text>
              </Box>
            )}
          </View>
        </LinearGradient>

        {/* Floating Hearts Decoration */}
        <View style={[styles.floatingHeart, styles.floatingHeart1]}>
          <Heart size={12} color={config.gradientColors[0]} fill={config.gradientColors[0]} />
        </View>
        <View style={[styles.floatingHeart, styles.floatingHeart2]}>
          <Heart size={8} color={config.gradientColors[1]} fill={config.gradientColors[1]} />
        </View>
        <View style={[styles.floatingHeart, styles.floatingHeart3]}>
          <Heart size={10} color={config.gradientColors[0]} fill={config.gradientColors[0]} />
        </View>
      </View>

      {/* Bottom Info */}
      {daysUntilPeriod !== undefined && (
        <Box mt="4" align="center">
          <Text size="sm" color="secondary">
            {daysUntilPeriod === 0
              ? 'Período deve começar hoje'
              : daysUntilPeriod === 1
                ? 'Período em 1 dia'
                : `Período em ${daysUntilPeriod} dias`}
          </Text>
        </Box>
      )}
    </TouchableOpacity>
  );
};

// ======================
// 💄 STYLES
// ======================

const styles = StyleSheet.create({
  editButton: {
    position: 'absolute',
    top: Tokens.spacing['3'],
    right: Tokens.spacing['3'],
    zIndex: 10,
  },
  editIconBg: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Tokens.spacing['4'],
    position: 'relative',
  },
  heartGradient: {
    width: 180,
    height: 160,
    borderRadius: 90,
    borderTopLeftRadius: 90,
    borderTopRightRadius: 90,
    transform: [{ rotate: '-45deg' }],
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  heartContent: {
    transform: [{ rotate: '45deg' }],
    alignItems: 'center',
    justifyContent: 'center',
    padding: Tokens.spacing['4'],
  },
  floatingHeart: {
    position: 'absolute',
  },
  floatingHeart1: {
    top: 10,
    right: 40,
  },
  floatingHeart2: {
    bottom: 30,
    left: 30,
  },
  floatingHeart3: {
    top: 50,
    left: 20,
  },
});

export default PeriodCard;
