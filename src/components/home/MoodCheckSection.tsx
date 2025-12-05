/**
 * MoodCheckSection - Seção "Como você está hoje?"
 *
 * Permite a usuária selecionar seu humor atual com emojis animados.
 * Baseado no design web com cores rosa-azul alternadas.
 *
 * @version 1.0.0 - Migrado do app-redesign-studio
 */

import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState, useCallback } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
} from 'react-native-reanimated';

import { Box } from '@/components/primitives/Box';
import { Text } from '@/components/primitives/Text';
import { useTheme } from '@/theme';
import { Tokens, ColorTokens } from '@/theme/tokens';
import { WebColors } from '@/theme/webColors';
import { logger } from '@/utils/logger';

// Tipos de humor disponíveis
export type MoodType = 'cansada' | 'bem' | 'ansiosa' | 'grata';

interface MoodOption {
  emoji: string;
  label: string;
  type: MoodType;
  color: 'rosa' | 'azul';
}

const MOOD_OPTIONS: MoodOption[] = [
  { emoji: '😴', label: 'Cansada', type: 'cansada', color: 'azul' },
  { emoji: '😊', label: 'Bem', type: 'bem', color: 'rosa' },
  { emoji: '😰', label: 'Ansiosa', type: 'ansiosa', color: 'rosa' },
  { emoji: '🥰', label: 'Grata', type: 'grata', color: 'azul' },
];

interface MoodCheckSectionProps {
  /** Callback quando um humor é selecionado */
  onMoodSelect?: (mood: MoodOption) => void;
  /** Se está carregando */
  loading?: boolean;
  /** Título customizado */
  title?: string;
  /** Subtítulo customizado */
  subtitle?: string;
}

/**
 * Botão individual de humor
 */
const MoodButton: React.FC<{
  option: MoodOption;
  onPress: () => void;
  disabled?: boolean;
}> = ({ option, onPress, disabled }) => {
  const { isDark } = useTheme();
  const scale = useSharedValue(1);
  const [isPressed, setIsPressed] = useState(false);

  const handlePressIn = () => {
    setIsPressed(true);
    scale.value = withSpring(0.95, { damping: 15 });
  };

  const handlePressOut = () => {
    setIsPressed(false);
    scale.value = withSpring(1, { damping: 15 });
  };

  const handlePress = () => {
    // Bounce animation
    scale.value = withSequence(
      withSpring(1.1, { damping: 10 }),
      withSpring(1, { damping: 15 })
    );
    onPress();
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  // Cores baseadas no tipo (rosa ou azul)
  const getColors = () => {
    if (option.color === 'azul') {
      return {
        border: isDark ? WebColors.azul.main : WebColors.azul.light,
        borderHover: WebColors.azul.main,
        bg: isDark ? `${WebColors.azul.main}20` : WebColors.azul.subtle,
        text: isDark ? WebColors.azul.light : WebColors.azul.text,
      };
    }
    return {
      border: isDark ? WebColors.rosa.main : WebColors.rosa.light,
      borderHover: WebColors.rosa.main,
      bg: isDark ? `${WebColors.rosa.main}20` : WebColors.rosa.subtle,
      text: isDark ? WebColors.rosa.light : WebColors.rosa.main,
    };
  };

  const colors = getColors();

  return (
    <Pressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={`Estou me sentindo ${option.label}`}
      accessibilityHint={`Seleciona o humor ${option.label}`}
      style={{ flex: 1 }}
    >
      <Animated.View
        style={[
          styles.moodButton,
          {
            borderColor: isPressed ? colors.borderHover : colors.border,
            backgroundColor: isPressed ? colors.bg : 'transparent',
            opacity: disabled ? 0.5 : 1,
          },
          animatedStyle,
        ]}
      >
        <Text style={styles.moodEmoji}>{option.emoji}</Text>
        <Text
          style={[
            styles.moodLabel,
            {
              color: isPressed ? colors.text : isDark ? '#FFFFFF' : '#4A4A4A',
            },
          ]}
        >
          {option.label}
        </Text>
      </Animated.View>
    </Pressable>
  );
};

/**
 * MoodCheckSection Component
 */
export const MoodCheckSection: React.FC<MoodCheckSectionProps> = ({
  onMoodSelect,
  loading = false,
  title = 'Como você está hoje?',
  subtitle = 'Toque na opção que mais combina',
}) => {
  const { colors, isDark } = useTheme();

  const handleMoodPress = useCallback(
    (option: MoodOption) => {
      logger.info('Mood selected', { mood: option.type });
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onMoodSelect?.(option);
    },
    [onMoodSelect]
  );

  return (
    <Box
      bg="card"
      rounded="3xl"
      p="5"
      shadow="xl"
      borderWidth={2}
      style={{
        borderColor: isDark
          ? `${WebColors.rosa.main}30`
          : `${WebColors.rosa.main}20`,
      }}
    >
      {/* Efeitos de brilho */}
      <View style={styles.glowEffects}>
        <View
          style={[
            styles.glowOrb,
            styles.glowOrbRight,
            { backgroundColor: `${WebColors.azul.main}15` },
          ]}
        />
        <View
          style={[
            styles.glowOrb,
            styles.glowOrbLeft,
            { backgroundColor: `${WebColors.rosa.main}15` },
          ]}
        />
      </View>

      {/* Header */}
      <Box direction="row" align="center" gap="3" mb="4">
        <View
          style={[
            styles.iconContainer,
            {
              backgroundColor: isDark
                ? 'rgba(255, 107, 157, 0.2)'
                : 'rgba(255, 107, 157, 0.1)',
            },
          ]}
        >
          <Text style={styles.heartEmoji}>💗</Text>
        </View>
        <Box flex={1}>
          <Text
            variant="body"
            size="xl"
            weight="bold"
            style={{
              color: isDark ? '#FFFFFF' : WebColors.rosa.main,
            }}
          >
            {title}
          </Text>
          <Text variant="caption" size="xs" color="tertiary">
            {subtitle}
          </Text>
        </Box>
      </Box>

      {/* Grid de moods - 2x2 */}
      <View style={styles.moodGrid}>
        <View style={styles.moodRow}>
          {MOOD_OPTIONS.slice(0, 2).map((option) => (
            <MoodButton
              key={option.type}
              option={option}
              onPress={() => handleMoodPress(option)}
              disabled={loading}
            />
          ))}
        </View>
        <View style={styles.moodRow}>
          {MOOD_OPTIONS.slice(2, 4).map((option) => (
            <MoodButton
              key={option.type}
              option={option}
              onPress={() => handleMoodPress(option)}
              disabled={loading}
            />
          ))}
        </View>
      </View>
    </Box>
  );
};

const styles = StyleSheet.create({
  glowEffects: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
    borderRadius: Tokens.radius['3xl'],
  },
  glowOrb: {
    position: 'absolute',
    width: 128,
    height: 128,
    borderRadius: 64,
  },
  glowOrbRight: {
    top: -64,
    right: -64,
  },
  glowOrbLeft: {
    bottom: -48,
    left: -48,
  },
  iconContainer: {
    padding: Tokens.spacing['2.5'],
    borderRadius: Tokens.radius.xl,
  },
  heartEmoji: {
    fontSize: 28,
  },
  moodGrid: {
    gap: Tokens.spacing['3'],
  },
  moodRow: {
    flexDirection: 'row',
    gap: Tokens.spacing['3'],
  },
  moodButton: {
    flex: 1,
    paddingVertical: Tokens.spacing['4'],
    paddingHorizontal: Tokens.spacing['2'],
    borderRadius: Tokens.radius['2xl'],
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Tokens.spacing['2'],
    minHeight: Tokens.touchTargets.comfortable,
  },
  moodEmoji: {
    fontSize: 32,
  },
  moodLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default MoodCheckSection;
