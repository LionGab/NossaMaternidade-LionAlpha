/**
 * BabyTrackerCard - Card de Acompanhamento do Bebe/Gestacao
 *
 * Adaptado do GeminiApp para React Native
 * Mostra progresso da gestacao ou idade do bebe
 *
 * @version 1.0.0
 */

import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { Heart, Syringe, ChevronRight, Baby } from 'lucide-react-native';
import React, { useMemo } from 'react';
import { View, StyleSheet, Pressable, Text as RNText } from 'react-native';
import Animated, { useAnimatedStyle, withSpring, useSharedValue } from 'react-native-reanimated';

import { useTheme } from '../theme/ThemeContext';
import { Spacing, Radius, Shadows, ColorTokens, Typography } from '../theme/tokens';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export interface BabyTrackerCardProps {
  /** Nome do bebe (ou "Bebe" como placeholder) */
  babyName?: string;
  /** Semana de gestacao (1-42) ou null se ja nasceu */
  pregnancyWeek?: number | null;
  /** Data prevista do parto */
  dueDate?: Date | null;
  /** Data de nascimento (se ja nasceu) */
  birthDate?: Date | null;
  /** Callback ao pressionar o card */
  onPress?: () => void;
  /** Callback ao pressionar "Saude" */
  onHealthPress?: () => void;
  /** Callback ao pressionar "Vacinas" */
  onVaccinesPress?: () => void;
  /** Estilo customizado */
  style?: object;
}

export const BabyTrackerCard: React.FC<BabyTrackerCardProps> = ({
  babyName = 'Bebe',
  pregnancyWeek,
  dueDate,
  birthDate,
  onPress,
  onHealthPress,
  onVaccinesPress,
  style,
}) => {
  const { colors, isDark } = useTheme();
  const scale = useSharedValue(1);

  // Calculate progress and display info
  const { progress, subtitle, daysText, badge } = useMemo(() => {
    if (pregnancyWeek && pregnancyWeek > 0) {
      // Gestacao em andamento
      const totalWeeks = 40;
      const progressPercent = Math.min((pregnancyWeek / totalWeeks) * 100, 100);
      const daysRemaining = dueDate
        ? Math.max(0, Math.ceil((dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
        : (totalWeeks - pregnancyWeek) * 7;

      return {
        progress: progressPercent,
        subtitle: `${pregnancyWeek}ª semana de gestacao`,
        daysText:
          daysRemaining > 0 ? `${daysRemaining} dias para o grande dia` : 'A qualquer momento!',
        badge: `${pregnancyWeek}ª sem`,
      };
    } else if (birthDate) {
      // Bebe ja nasceu
      const ageMs = Date.now() - birthDate.getTime();
      const ageDays = Math.floor(ageMs / (1000 * 60 * 60 * 24));
      const ageMonths = Math.floor(ageDays / 30);
      const ageYears = Math.floor(ageDays / 365);

      let ageText = '';
      if (ageYears > 0) {
        ageText = `${ageYears} ano${ageYears > 1 ? 's' : ''}`;
      } else if (ageMonths > 0) {
        ageText = `${ageMonths} mes${ageMonths > 1 ? 'es' : ''}`;
      } else {
        ageText = `${ageDays} dia${ageDays !== 1 ? 's' : ''}`;
      }

      // Progress based on first year milestones
      const progressPercent = Math.min((ageDays / 365) * 100, 100);

      return {
        progress: progressPercent,
        subtitle: ageText,
        daysText: 'Acompanhe o desenvolvimento',
        badge: ageMonths > 0 ? `${ageMonths}m` : `${ageDays}d`,
      };
    }

    // Default/placeholder
    return {
      progress: 0,
      subtitle: 'Adicione informacoes do seu bebe',
      daysText: 'Toque para configurar',
      badge: null,
    };
  }, [pregnancyWeek, dueDate, birthDate]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98, { damping: 15, stiffness: 400 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 400 });
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.();
  };

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[animatedStyle, style]}
      accessibilityRole="button"
      accessibilityLabel={`Acompanhamento de ${babyName}`}
      accessibilityHint="Abre detalhes completos do acompanhamento do bebê"
    >
      <View
        style={[
          styles.card,
          {
            backgroundColor: isDark ? colors.background.elevated : colors.background.card,
            borderColor: isDark ? colors.border.light : 'transparent',
          },
          Shadows.card,
        ]}
      >
        {/* Badge */}
        {badge && (
          <View style={[styles.badge, { backgroundColor: ColorTokens.accent.oceanLight }]}>
            <RNText style={{ ...styles.badgeText, color: ColorTokens.accent.ocean }}>
              {badge}
            </RNText>
          </View>
        )}

        {/* Baby icon and name */}
        <View style={styles.header}>
          <View style={[styles.iconCircle, { backgroundColor: ColorTokens.primary[100] }]}>
            <Baby size={24} color={ColorTokens.primary[500]} />
          </View>
          <View style={styles.headerText}>
            <RNText
              style={{
                ...styles.babyName,
                color: colors.text.primary,
              }}
            >
              {babyName}
            </RNText>
            <RNText style={{ ...styles.subtitle, color: colors.text.secondary }}>{subtitle}</RNText>
          </View>
          <ChevronRight size={20} color={colors.text.tertiary} />
        </View>

        {/* Progress bar */}
        <View style={styles.progressContainer}>
          <View
            style={[
              styles.progressBg,
              { backgroundColor: isDark ? ColorTokens.overlay.glass : ColorTokens.overlay.card },
            ]}
          >
            <LinearGradient
              colors={[ColorTokens.accent.ocean, ColorTokens.secondary[400]]}
              style={[styles.progressFill, { width: `${progress}%` }]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            />
          </View>
          <RNText style={{ ...styles.daysText, color: colors.text.tertiary }}>{daysText}</RNText>
        </View>

        {/* Quick actions */}
        <View style={styles.actions}>
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onHealthPress?.();
            }}
            style={({ pressed }) => [
              styles.actionButton,
              { backgroundColor: ColorTokens.accent.coralLight },
              pressed && { opacity: 0.8 },
            ]}
            accessibilityRole="button"
            accessibilityLabel="Saúde do bebê"
            accessibilityHint="Abre informações de saúde e consultas do bebê"
          >
            <Heart size={16} color={ColorTokens.accent.coral} />
            <RNText style={{ ...styles.actionText, color: ColorTokens.accent.coral }}>Saude</RNText>
          </Pressable>

          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onVaccinesPress?.();
            }}
            style={({ pressed }) => [
              styles.actionButton,
              { backgroundColor: ColorTokens.accent.mintLight },
              pressed && { opacity: 0.8 },
            ]}
            accessibilityRole="button"
            accessibilityLabel="Vacinas do bebê"
            accessibilityHint="Abre o calendário de vacinação do bebê"
          >
            <Syringe size={16} color={ColorTokens.accent.mint} />
            <RNText style={{ ...styles.actionText, color: ColorTokens.accent.mint }}>
              Vacinas
            </RNText>
          </Pressable>
        </View>
      </View>
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius['3xl'],
    padding: Spacing['5'],
    borderWidth: 1,
  },
  badge: {
    position: 'absolute',
    top: Spacing['4'],
    right: Spacing['4'],
    paddingHorizontal: Spacing['3'],
    paddingVertical: Spacing['1'],
    borderRadius: Radius.pill,
  },
  badgeText: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
    textTransform: 'uppercase',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing['4'],
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing['3'],
  },
  headerText: {
    flex: 1,
  },
  babyName: {
    fontSize: Typography.sizes['2xl'],
    marginBottom: Spacing['0.5'],
  },
  subtitle: {
    fontSize: Typography.sizes.sm,
  },
  progressContainer: {
    marginBottom: Spacing['4'],
  },
  progressBg: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: Spacing['2'],
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  daysText: {
    fontSize: Typography.sizes.xs,
    textAlign: 'right',
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing['3'],
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing['3'],
    borderRadius: Radius.xl,
    gap: Spacing['2'],
  },
  actionText: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semibold,
  },
});

export default BabyTrackerCard;
