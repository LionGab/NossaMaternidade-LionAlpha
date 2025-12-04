/**
 * EmpatheticMoodChips - Grid 2x2 igual ao design web
 * "🧡 Como você está hoje? Toque na opção que mais combina com seu momento:"
 */

import * as Haptics from 'expo-haptics';
import React, { memo } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';

import { Text } from '@/components/primitives/Text';
import { useTheme } from '@/theme';
import { Tokens, ColorTokens } from '@/theme/tokens';

export type EmpatheticMoodType =
  | 'sobrecarregada'
  | 'precisando-apoio'
  | 'tranquila'
  | 'com-esperanca';

export interface EmpatheticMoodChipsProps {
  /** Mood selecionado */
  selectedMood?: EmpatheticMoodType | null;
  /** Callback ao selecionar mood */
  onSelect: (mood: EmpatheticMoodType) => void;
}

// Moods igual ao web: 4 opções em grid 2x2
const WEB_MOODS: Array<{ emoji: string; label: string; id: EmpatheticMoodType }> = [
  { emoji: '😴', label: 'Cansada', id: 'sobrecarregada' },
  { emoji: '😊', label: 'Bem', id: 'tranquila' },
  { emoji: '😰', label: 'Ansiosa', id: 'precisando-apoio' },
  { emoji: '🥰', label: 'Grata', id: 'com-esperanca' },
];

export const EmpatheticMoodChips = memo(function EmpatheticMoodChips({
  selectedMood,
  onSelect,
}: EmpatheticMoodChipsProps) {
  const { colors, isDark } = useTheme();

  const handleSelect = (mood: EmpatheticMoodType) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSelect(mood);
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDark ? ColorTokens.neutral[800] : colors.background.card,
          borderColor: isDark ? ColorTokens.neutral[700] : colors.border.light,
        },
      ]}
    >
      {/* Título empático - igual ao web */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={{ fontSize: 24 }}>🧡</Text>
          <Text size="lg" weight="semibold" color="primary" style={styles.title}>
            Como você está hoje?
          </Text>
        </View>
        <Text size="sm" color="tertiary" style={styles.subtitle}>
          Toque na opção que mais combina com seu momento:
        </Text>
      </View>

      {/* Grid 2x2 igual ao web */}
      <View style={styles.grid}>
        {WEB_MOODS.map((mood) => {
          const isSelected = selectedMood === mood.id;

          return (
            <TouchableOpacity
              key={mood.id}
              onPress={() => handleSelect(mood.id)}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel={`Estou me sentindo ${mood.label}${isSelected ? '. Selecionado' : ''}`}
              accessibilityHint="Toque para registrar seu humor"
              style={[
                styles.gridChip,
                {
                  backgroundColor: isDark ? ColorTokens.neutral[800] : ColorTokens.neutral[0],
                  borderColor: isSelected
                    ? isDark
                      ? ColorTokens.primary[400]
                      : ColorTokens.primary[500]
                    : isDark
                      ? ColorTokens.neutral[700]
                      : ColorTokens.neutral[200],
                  borderWidth: isSelected ? 2 : 1,
                },
              ]}
            >
              <Text style={{ fontSize: 24, marginBottom: Tokens.spacing['2'] }}>{mood.emoji}</Text>
              <Text
                size="sm"
                weight={isSelected ? 'semibold' : 'medium'}
                style={{
                  color: isSelected
                    ? isDark
                      ? ColorTokens.primary[200]
                      : ColorTokens.primary[700]
                    : isDark
                      ? ColorTokens.neutral[300]
                      : ColorTokens.neutral[700],
                }}
              >
                {mood.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    borderRadius: Tokens.radius['2xl'],
    padding: Tokens.spacing['6'],
    borderWidth: 1,
    ...Tokens.shadows.sm,
  },
  header: {
    marginBottom: Tokens.spacing['4'],
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Tokens.spacing['2'],
    marginBottom: Tokens.spacing['1'],
  },
  title: {
    lineHeight: 22,
  },
  subtitle: {
    lineHeight: 20,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Tokens.spacing['2'],
  },
  gridChip: {
    flex: 1,
    minWidth: '47%', // 2 colunas com gap
    minHeight: 88, // ✅ WCAG AAA: emoji(24) + spacing(8) + text(20) + padding(36) = 88px
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Tokens.spacing['4'], // ✅ Aumentado de '3' para '4' (16px)
    borderRadius: Tokens.radius.lg,
    gap: Tokens.spacing['2'],
  },
});
