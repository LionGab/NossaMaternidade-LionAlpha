/**
 * EmotionalPrompt - Check-in emocional com 5 emojis
 * "Como você tá hoje?" → Bem, Triste, Ansiosa, Cansada, Calma
 */

import React from 'react';
import { TouchableOpacity } from 'react-native';

import { Box } from '@/components/atoms/Box';
import { Text } from '@/components/atoms/Text';
import { useHaptics } from '@/hooks/useHaptics';
import { useThemeColors } from '@/theme';
import { Tokens } from '@/theme/tokens';

export type EmotionValue = 'bem' | 'triste' | 'ansiosa' | 'cansada' | 'calma';

export interface EmotionalPromptProps {
  title?: string;
  selectedEmotion?: EmotionValue;
  onSelect: (emotion: EmotionValue) => void;
}

interface EmotionOption {
  emoji: string;
  label: string;
  value: EmotionValue;
}

const DEFAULT_EMOTIONS: EmotionOption[] = [
  { emoji: '😊', label: 'Bem', value: 'bem' },
  { emoji: '😢', label: 'Triste', value: 'triste' },
  { emoji: '😰', label: 'Ansiosa', value: 'ansiosa' },
  { emoji: '😴', label: 'Cansada', value: 'cansada' },
  { emoji: '😌', label: 'Calma', value: 'calma' },
];

export function EmotionalPrompt({
  title = 'Como você tá hoje?',
  selectedEmotion,
  onSelect,
}: EmotionalPromptProps) {
  const colors = useThemeColors();
  const haptics = useHaptics();

  const handleSelect = (emotion: EmotionValue) => {
    haptics.light();
    onSelect(emotion);
  };

  return (
    <Box>
      {/* Título */}
      {title && (
        <Text
          size="md"
          color="secondary"
          weight="medium"
          style={{ marginBottom: Tokens.spacing['3'] }}
        >
          {title}
        </Text>
      )}

      {/* Grid de emojis */}
      <Box
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: Tokens.spacing['2'],
        }}
      >
        {DEFAULT_EMOTIONS.map((emotion) => {
          const isSelected = selectedEmotion === emotion.value;

          return (
            <TouchableOpacity
              key={emotion.value}
              onPress={() => handleSelect(emotion.value)}
              accessibilityRole="button"
              accessibilityLabel={`Estou me sentindo ${emotion.label} hoje`}
              accessibilityState={{ selected: isSelected }}
              style={{
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: Tokens.touchTargets.min,
                minHeight: Tokens.touchTargets.min,
                paddingVertical: Tokens.spacing['2'],
                paddingHorizontal: Tokens.spacing['1'],
              }}
            >
              {/* Emoji com fundo oval ao selecionar - REDESIGN maternal */}
              <Box
                style={{
                  width: Tokens.touchTargets.large, // 56
                  height: Tokens.touchTargets.large, // 56
                  borderRadius: Tokens.radius.full, // circle
                  backgroundColor: isSelected
                    ? `${colors.primary.main}1F` // Rosa maternal com 12% opacity (1F hex = ~0.12)
                    : 'transparent',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Text
                  style={{
                    fontSize: Tokens.touchTargets.min, // 44pt (WCAG AAA compliant)
                    lineHeight: Tokens.touchTargets.min + 8, // 52
                    opacity: isSelected ? 1 : 0.75,
                  }}
                >
                  {emotion.emoji}
                </Text>
              </Box>

              {/* Label */}
              <Text
                size="xs"
                color={isSelected ? 'primary' : 'tertiary'}
                weight={isSelected ? 'semibold' : 'regular'}
                style={{ marginTop: Tokens.spacing['1'], textAlign: 'center' }}
              >
                {emotion.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </Box>
    </Box>
  );
}
