/**
 * EmpatheticMoodChips V2 - Chips de humor redesenhados
 *
 * Melhorias:
 * - Layout em flex wrap (não scroll horizontal)
 * - Novos estados emocionais
 * - Emojis mais expressivos
 * - Animação de seleção suave
 * - Cores mais distintas por estado
 * - WCAG AAA compliant (48pt touch targets)
 */

import * as Haptics from 'expo-haptics';
import React, { memo, useRef } from 'react';
import { View, TouchableOpacity, StyleSheet, Animated, Text as RNText } from 'react-native';

import { Text } from '@/components/atoms/Text';
import { useTheme } from '@/theme';
import { Tokens, ColorTokens } from '@/theme/tokens';

export type EmpatheticMoodTypeV2 =
  | 'cansada'
  | 'precisando-colo'
  | 'ansiosa'
  | 'em-paz'
  | 'esperancosa'
  | 'grata'
  | 'outra';

export interface EmpatheticMoodOptionV2 {
  id: EmpatheticMoodTypeV2;
  label: string;
  emoji: string;
  colorLight: string;
  colorDark: string;
  borderLight: string;
  borderDark: string;
}

export interface EmpatheticMoodChipsV2Props {
  /** Mood selecionado */
  selectedMood?: EmpatheticMoodTypeV2 | null;
  /** Callback ao selecionar mood */
  onSelect: (mood: EmpatheticMoodTypeV2) => void;
  /** Variante visual */
  variant?: 'default' | 'minimal' | 'warm' | 'functional';
  /** Mostrar título */
  showTitle?: boolean;
}

// ⭐ MIGRADO: Usa tokens centralizados de ColorTokens.moodChip
// Opções de mood redesenhadas
const MOOD_OPTIONS: EmpatheticMoodOptionV2[] = [
  {
    id: 'cansada',
    label: 'Cansada',
    emoji: '😮‍💨',
    colorLight: ColorTokens.moodChip['cansada'].bg.light,
    colorDark: ColorTokens.moodChip['cansada'].bg.dark,
    borderLight: ColorTokens.moodChip['cansada'].border.light,
    borderDark: ColorTokens.moodChip['cansada'].border.dark,
  },
  {
    id: 'precisando-colo',
    label: 'Precisando de colo',
    emoji: '💙',
    colorLight: ColorTokens.moodChip['precisando-colo'].bg.light,
    colorDark: ColorTokens.moodChip['precisando-colo'].bg.dark,
    borderLight: ColorTokens.moodChip['precisando-colo'].border.light,
    borderDark: ColorTokens.moodChip['precisando-colo'].border.dark,
  },
  {
    id: 'ansiosa',
    label: 'Ansiosa',
    emoji: '😰',
    colorLight: ColorTokens.moodChip['ansiosa'].bg.light,
    colorDark: ColorTokens.moodChip['ansiosa'].bg.dark,
    borderLight: ColorTokens.moodChip['ansiosa'].border.light,
    borderDark: ColorTokens.moodChip['ansiosa'].border.dark,
  },
  {
    id: 'em-paz',
    label: 'Em paz',
    emoji: '😌',
    colorLight: ColorTokens.moodChip['em-paz'].bg.light,
    colorDark: ColorTokens.moodChip['em-paz'].bg.dark,
    borderLight: ColorTokens.moodChip['em-paz'].border.light,
    borderDark: ColorTokens.moodChip['em-paz'].border.dark,
  },
  {
    id: 'esperancosa',
    label: 'Esperançosa',
    emoji: '🌟',
    colorLight: ColorTokens.moodChip['esperancosa'].bg.light,
    colorDark: ColorTokens.moodChip['esperancosa'].bg.dark,
    borderLight: ColorTokens.moodChip['esperancosa'].border.light,
    borderDark: ColorTokens.moodChip['esperancosa'].border.dark,
  },
  {
    id: 'grata',
    label: 'Grata',
    emoji: '🙏',
    colorLight: ColorTokens.moodChip['grata'].bg.light,
    colorDark: ColorTokens.moodChip['grata'].bg.dark,
    borderLight: ColorTokens.moodChip['grata'].border.light,
    borderDark: ColorTokens.moodChip['grata'].border.dark,
  },
  {
    id: 'outra',
    label: 'Outra coisa',
    emoji: '💭',
    colorLight: ColorTokens.moodChip['outra'].bg.light,
    colorDark: ColorTokens.moodChip['outra'].bg.dark,
    borderLight: ColorTokens.moodChip['outra'].border.light,
    borderDark: ColorTokens.moodChip['outra'].border.dark,
  },
];

// Componente de chip individual
interface MoodChipProps {
  mood: EmpatheticMoodOptionV2;
  isSelected: boolean;
  onPress: () => void;
  isDark: boolean;
  variant: 'default' | 'minimal' | 'warm' | 'functional';
}

const MoodChip = memo(function MoodChip({
  mood,
  isSelected,
  onPress,
  isDark,
  variant,
}: MoodChipProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  const backgroundColor = isSelected
    ? isDark
      ? mood.colorDark
      : mood.colorLight
    : isDark
      ? ColorTokens.neutral[800]
      : ColorTokens.neutral[0];

  const borderColor = isSelected
    ? isDark
      ? mood.borderDark
      : mood.borderLight
    : isDark
      ? ColorTokens.neutral[700]
      : ColorTokens.neutral[200];

  // Variante minimal: só emoji
  if (variant === 'minimal') {
    return (
      <TouchableOpacity
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.8}
        accessibilityRole="radio"
        accessibilityState={{ selected: isSelected }}
        accessibilityLabel={`Estou me sentindo ${mood.label}`}
      >
        <Animated.View
          style={[
            styles.minimalChip,
            {
              backgroundColor,
              borderColor,
              borderWidth: isSelected ? 2 : 1,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <RNText style={styles.minimalEmoji}>{mood.emoji}</RNText>
        </Animated.View>
      </TouchableOpacity>
    );
  }

  // Variante functional: texto curto
  if (variant === 'functional') {
    return (
      <TouchableOpacity
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.8}
        accessibilityRole="radio"
        accessibilityState={{ selected: isSelected }}
        accessibilityLabel={`Estou me sentindo ${mood.label}`}
      >
        <Animated.View
          style={[
            styles.functionalChip,
            {
              backgroundColor,
              borderColor,
              borderWidth: isSelected ? 2 : 1,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <Text
            size="xs"
            weight={isSelected ? 'semibold' : 'medium'}
            style={{
              color: isSelected
                ? isDark
                  ? mood.borderDark
                  : mood.borderLight
                : isDark
                  ? ColorTokens.neutral[300]
                  : ColorTokens.neutral[600],
            }}
          >
            {mood.label}
          </Text>
        </Animated.View>
      </TouchableOpacity>
    );
  }

  // Variantes default e warm
  return (
    <TouchableOpacity
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={0.8}
      accessibilityRole="radio"
      accessibilityState={{ selected: isSelected }}
      accessibilityLabel={`Estou me sentindo ${mood.label}`}
      accessibilityHint="Toque para selecionar este humor"
    >
      <Animated.View
        style={[
          styles.chip,
          {
            backgroundColor,
            borderColor,
            borderWidth: isSelected ? 2 : 1,
            transform: [{ scale: scaleAnim }],
          },
          isSelected && Tokens.shadows.sm,
        ]}
      >
        <View style={styles.emojiContainer}>
          <RNText style={styles.emoji}>{mood.emoji}</RNText>
        </View>
        <Text
          size="sm"
          weight={isSelected ? 'semibold' : 'medium'}
          style={{
            color: isSelected
              ? isDark
                ? mood.borderDark
                : mood.borderLight
              : isDark
                ? ColorTokens.neutral[300]
                : ColorTokens.neutral[600],
          }}
        >
          {mood.label}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
});

export const EmpatheticMoodChipsV2 = memo(function EmpatheticMoodChipsV2({
  selectedMood,
  onSelect,
  variant = 'default',
  showTitle = true,
}: EmpatheticMoodChipsV2Props) {
  const { colors, isDark } = useTheme();

  // Títulos por variante
  const titles = {
    default: {
      title: 'Como você está agora?',
      subtitle: 'Toque no que mais combina com você:',
    },
    minimal: {
      title: '',
      subtitle: 'Como você está?',
    },
    warm: {
      title: 'Como está seu coração?',
      subtitle: 'Escolha o que mais combina com você agora:',
    },
    functional: {
      title: 'Humor',
      subtitle: '',
    },
  };

  const { title, subtitle } = titles[variant];

  return (
    <View
      style={styles.container}
      accessible={true}
      accessibilityRole="radiogroup"
      accessibilityLabel="Selecione como você está se sentindo"
    >
      {/* Header */}
      {showTitle && (title || subtitle) && (
        <View style={styles.header}>
          {title && (
            <Text
              size="md"
              weight="semibold"
              style={{ color: colors.text.primary, marginBottom: Tokens.spacing['0.5'] }}
            >
              {title}
            </Text>
          )}
          {subtitle && (
            <Text size="sm" style={{ color: colors.text.secondary }}>
              {subtitle}
            </Text>
          )}
        </View>
      )}

      {/* Chips em wrap */}
      <View style={styles.chipsContainer}>
        {MOOD_OPTIONS.map((mood) => (
          <MoodChip
            key={mood.id}
            mood={mood}
            isSelected={selectedMood === mood.id}
            onPress={() => onSelect(mood.id)}
            isDark={isDark}
            variant={variant}
          />
        ))}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    // Container principal
  },
  header: {
    marginBottom: Tokens.spacing['3'],
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Tokens.spacing['2.5'],
  },

  // Chip padrão
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Tokens.spacing['2'],
    paddingVertical: Tokens.spacing['2.5'],
    paddingHorizontal: Tokens.spacing['3.5'],
    borderRadius: Tokens.radius.full,
    minHeight: 48, // WCAG AAA
  },
  emojiContainer: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 20,
    lineHeight: 24,
  },

  // Chip minimal
  minimalChip: {
    width: 48,
    height: 48,
    borderRadius: Tokens.radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  minimalEmoji: {
    fontSize: 24,
  },

  // Chip functional
  functionalChip: {
    paddingVertical: Tokens.spacing['2'],
    paddingHorizontal: Tokens.spacing['3'],
    borderRadius: Tokens.radius.full,
    minHeight: 36,
  },
});

export default EmpatheticMoodChipsV2;
