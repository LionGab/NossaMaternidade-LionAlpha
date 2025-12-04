/**
 * MoodChips - Chips de seleção de humor
 * Design inspirado nos screenshots de referência
 *
 * "Como você está agora?"
 * [Ansiosa] [Cansada] [Culpada] [Feliz]
 */

import * as Haptics from 'expo-haptics';
import React, { memo } from 'react';
import { View, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';

import { Text } from '@/components/primitives/Text';
import { useTheme } from '@/theme';
import { Tokens, ColorTokens } from '@/theme/tokens';

// ======================
// TIPOS
// ======================

export type MoodType =
  | 'ansiosa'
  | 'cansada'
  | 'culpada'
  | 'feliz'
  | 'triste'
  | 'irritada'
  | 'calma'
  | 'grata';

export interface MoodOption {
  id: MoodType;
  label: string;
  emoji?: string;
}

export interface MoodChipsProps {
  /** Título da seção */
  title?: string;
  /** Moods disponíveis */
  moods?: MoodOption[];
  /** Mood selecionado */
  selectedMood?: MoodType | null;
  /** Callback ao selecionar mood */
  onSelect: (mood: MoodType) => void;
  /** Permitir múltipla seleção */
  multiSelect?: boolean;
  /** Moods selecionados (para multiSelect) */
  selectedMoods?: MoodType[];
  /** Layout horizontal ou wrap */
  layout?: 'horizontal' | 'wrap';
}

// ======================
// DADOS PADRÃO
// ======================

const DEFAULT_MOODS: MoodOption[] = [
  { id: 'ansiosa', label: 'Ansiosa' },
  { id: 'cansada', label: 'Cansada' },
  { id: 'culpada', label: 'Culpada' },
  { id: 'feliz', label: 'Feliz' },
];

const EXTENDED_MOODS: MoodOption[] = [
  ...DEFAULT_MOODS,
  { id: 'triste', label: 'Triste' },
  { id: 'irritada', label: 'Irritada' },
  { id: 'calma', label: 'Calma' },
  { id: 'grata', label: 'Grata' },
];

// ======================
// CORES DOS MOODS
// ======================

const MOOD_COLORS: Record<
  MoodType,
  { bg: string; bgDark: string; text: string; textDark: string }
> = {
  ansiosa: {
    bg: '#FFE8EC',
    bgDark: '#3D1A24',
    text: '#C44569',
    textDark: '#FF8FA3',
  },
  cansada: {
    bg: '#E8F0FF',
    bgDark: '#1A2438',
    text: '#5A7BB5',
    textDark: '#93B5FF',
  },
  culpada: {
    bg: '#F0E8FF',
    bgDark: '#281A3D',
    text: '#7B5AB5',
    textDark: '#B593FF',
  },
  feliz: {
    bg: '#E8FFF0',
    bgDark: '#1A3D24',
    text: '#5AB57B',
    textDark: '#8AFFB5',
  },
  triste: {
    bg: '#E8ECFF',
    bgDark: '#1A1E38',
    text: '#5A6BB5',
    textDark: '#93A5FF',
  },
  irritada: {
    bg: '#FFE8E8',
    bgDark: '#3D1A1A',
    text: '#C44545',
    textDark: '#FF8F8F',
  },
  calma: {
    bg: '#E8FFF8',
    bgDark: '#1A3D35',
    text: '#45A88C',
    textDark: '#8AFFD4',
  },
  grata: {
    bg: '#FFF8E8',
    bgDark: '#3D351A',
    text: '#B5945A',
    textDark: '#FFD493',
  },
};

// ======================
// COMPONENTE
// ======================

export const MoodChips = memo(function MoodChips({
  title = 'Como você está agora?',
  moods = DEFAULT_MOODS,
  selectedMood,
  onSelect,
  multiSelect = false,
  selectedMoods = [],
  layout = 'horizontal',
}: MoodChipsProps) {
  const { colors, isDark } = useTheme();

  const handleSelect = (mood: MoodType) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSelect(mood);
  };

  const isSelected = (mood: MoodType) => {
    if (multiSelect) {
      return selectedMoods.includes(mood);
    }
    return selectedMood === mood;
  };

  const renderChip = (mood: MoodOption) => {
    const selected = isSelected(mood.id);
    const moodColor = MOOD_COLORS[mood.id];

    return (
      <TouchableOpacity
        key={mood.id}
        onPress={() => handleSelect(mood.id)}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityState={{ selected }}
        accessibilityLabel={`Humor: ${mood.label}`}
        accessibilityHint={`Toque para selecionar ${mood.label}`}
        style={[
          styles.chip,
          {
            backgroundColor: selected
              ? isDark
                ? moodColor.bgDark
                : moodColor.bg
              : isDark
                ? ColorTokens.neutral[800]
                : ColorTokens.neutral[0],
            borderColor: selected
              ? isDark
                ? moodColor.textDark
                : moodColor.text
              : isDark
                ? ColorTokens.neutral[700]
                : ColorTokens.neutral[200],
            borderWidth: selected ? 1.5 : 1,
          },
        ]}
      >
        {mood.emoji && (
          <Text size="sm" style={styles.emoji}>
            {mood.emoji}
          </Text>
        )}
        <Text
          size="sm"
          weight={selected ? 'semibold' : 'medium'}
          style={{
            color: selected
              ? isDark
                ? moodColor.textDark
                : moodColor.text
              : colors.text.secondary,
          }}
        >
          {mood.label}
        </Text>
      </TouchableOpacity>
    );
  };

  const content = (
    <View style={layout === 'wrap' ? styles.wrapContainer : styles.rowContainer}>
      {moods.map(renderChip)}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Título */}
      <Text
        size="md"
        weight="semibold"
        style={{ color: colors.text.primary, marginBottom: Tokens.spacing['3'] }}
      >
        {title}
      </Text>

      {/* Chips */}
      {layout === 'horizontal' ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {moods.map(renderChip)}
        </ScrollView>
      ) : (
        content
      )}
    </View>
  );
});

// ======================
// ESTILOS
// ======================

const styles = StyleSheet.create({
  container: {
    // Container principal
  },
  scrollContent: {
    gap: Tokens.spacing['2'],
    paddingRight: Tokens.spacing['4'],
  },
  rowContainer: {
    flexDirection: 'row',
    gap: Tokens.spacing['2'],
  },
  wrapContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Tokens.spacing['2'],
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Tokens.spacing['4'],
    paddingVertical: Tokens.spacing['2.5'],
    borderRadius: Tokens.radius.full,
    minHeight: Tokens.touchTargets.min,
    gap: Tokens.spacing['1'],
  },
  emoji: {
    marginRight: Tokens.spacing['1'],
  },
});

// ======================
// EXPORTS
// ======================

export { DEFAULT_MOODS, EXTENDED_MOODS, MOOD_COLORS };
export default MoodChips;
