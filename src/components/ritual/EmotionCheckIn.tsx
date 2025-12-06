/**
 * EmotionCheckIn - Componente de check-in emocional para Ritual
 *
 * Permite que a usuária selecione como está se sentindo antes/depois do ritual.
 * Referência: app-redesign-studio-ab40635e/src/components/ritual/EmotionCheckIn.tsx
 * Adaptado para React Native com design system atual.
 */

import * as Haptics from 'expo-haptics';
import { Heart, Sparkles } from 'lucide-react-native';
import React, { useState } from 'react';
import { View, TextInput, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

import { Box } from '@/components/atoms/Box';
import { Button } from '@/components/atoms/Button';
import { Text } from '@/components/atoms/Text';
import { useTheme } from '@/theme';
import { Tokens, ColorTokens } from '@/theme/tokens';
import type { EmotionState, EmotionValue } from '@/types/ritual';
import { EMOTION_OPTIONS } from '@/types/ritual';

interface EmotionCheckInProps {
  onComplete: (emotion: EmotionState) => void;
  context?: 'before' | 'after';
  title?: string;
  description?: string;
}

// Unused but kept for future use
// const _EMOTION_COLORS: Record<EmotionValue, readonly [string, string]> = {
  // '😴': [ColorTokens.secondary[400], ColorTokens.secondary[600]] as const,
  // '😢': [ColorTokens.secondary[400], ColorTokens.primary[500]] as const,
  // '😰': [ColorTokens.warning[400], ColorTokens.warning[500]] as const,
  // '😊': [ColorTokens.secondary[400], ColorTokens.secondary[500]] as const,
  // '🥰': [ColorTokens.secondary[400], ColorTokens.secondary[500]] as const,
// };

export function EmotionCheckIn({
  onComplete,
  context = 'before',
  title,
  description,
}: EmotionCheckInProps) {
  const { colors, isDark } = useTheme();
  const [selectedEmotion, setSelectedEmotion] = useState<EmotionValue | null>(null);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!selectedEmotion) return;

    setIsSubmitting(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const emotionState: EmotionState = {
      emotion: selectedEmotion,
      intensity: 7, // Default
      note: notes.trim() || undefined,
    };

    // Pequeno delay para feedback visual
    setTimeout(() => {
      onComplete(emotionState);
      setIsSubmitting(false);
    }, 300);
  };

  const defaultTitle =
    context === 'before'
      ? 'Como você está se sentindo agora?'
      : 'Como você está se sentindo agora?';
  const defaultDescription =
    context === 'before'
      ? 'Vamos começar reconhecendo como você está neste momento.'
      : 'Vamos ver como você se sente após este momento de reconexão.';

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ScrollView
        contentContainerStyle={{
          padding: Tokens.spacing['6'],
          paddingBottom: Tokens.spacing['12'],
        }}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeIn.duration(400)}>
          <Box align="center" gap="6">
            {/* Header */}
            <Box align="center" gap="4">
              <View
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 40,
                  overflow: 'hidden',
                  ...Tokens.shadows.lg,
                }}
              >
                <LinearGradient
                  colors={
                    isDark
                      ? [ColorTokens.primary[600], ColorTokens.secondary[600]]
                      : [ColorTokens.primary[500], ColorTokens.secondary[500]]
                  }
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{
                    width: '100%',
                    height: '100%',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {context === 'before' ? (
                    <Heart size={40} color={ColorTokens.neutral[0]} fill={ColorTokens.neutral[0]} />
                  ) : (
                    <Sparkles size={40} color={ColorTokens.neutral[0]} />
                  )}
                </LinearGradient>
              </View>

              <Text
                size="2xl"
                weight="bold"
                align="center"
                style={{
                  color: isDark ? ColorTokens.primary[300] : ColorTokens.primary[600],
                }}
              >
                {title || defaultTitle}
              </Text>
              <Text
                size="sm"
                align="center"
                color="secondary"
                style={{
                  lineHeight: Tokens.typography.lineHeights.lg,
                  maxWidth: 300,
                }}
              >
                {description || defaultDescription}
                {context === 'before' && (
                  <Text size="sm" weight="medium" style={{ color: colors.primary.main }}>
                    {'\n'}Esta pausa será personalizada para você.
                  </Text>
                )}
              </Text>
            </Box>

            {/* Emoções - Grid */}
            <Box
              style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                gap: Tokens.spacing['3'],
                justifyContent: 'center',
                width: '100%',
              }}
            >
              {EMOTION_OPTIONS.map((option, index) => {
                const isSelected = selectedEmotion === option.value;
                const isLastOdd = index === EMOTION_OPTIONS.length - 1 && EMOTION_OPTIONS.length % 2 !== 0;

                return (
                  <Animated.View
                    key={option.value}
                    entering={FadeIn.delay(100 * index).duration(300)}
                    style={{
                      width: isLastOdd ? '100%' : '48%',
                      maxWidth: isLastOdd ? 200 : undefined,
                    }}
                  >
                    <Button
                      title={option.label}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setSelectedEmotion(option.value);
                      }}
                      variant={isSelected ? 'primary' : 'outline'}
                      size="lg"
                      style={{
                        height: 100,
                        flexDirection: 'column',
                        gap: Tokens.spacing['2'],
                        backgroundColor: isSelected
                          ? undefined
                          : isDark
                          ? ColorTokens.neutral[800]
                          : ColorTokens.neutral[50],
                        borderWidth: isSelected ? 0 : 2,
                        borderColor: isDark ? ColorTokens.neutral[700] : ColorTokens.neutral[200],
                        ...(isSelected && {
                          overflow: 'hidden',
                        }),
                      }}
                      leftIcon={
                        <Text size="3xl" style={{ marginBottom: Tokens.spacing['1'] }}>
                          {option.value}
                        </Text>
                      }
                    />
                  </Animated.View>
                );
              })}
            </Box>

            {/* Campo de notas (opcional) */}
            {selectedEmotion && (
              <Animated.View
                entering={FadeIn.duration(300)}
                style={{
                  width: '100%',
                  gap: Tokens.spacing['2'],
                }}
              >
                <Text size="sm" weight="medium" color="secondary">
                  Quer compartilhar algo mais? (opcional)
                </Text>
                <TextInput
                  value={notes}
                  onChangeText={setNotes}
                  placeholder="Como você está se sentindo?"
                  placeholderTextColor={isDark ? ColorTokens.neutral[500] : ColorTokens.neutral[400]}
                  multiline
                  maxLength={200}
                  style={{
                    minHeight: 80,
                    borderRadius: Tokens.radius.xl,
                    padding: Tokens.spacing['4'],
                    backgroundColor: isDark ? ColorTokens.neutral[800] : ColorTokens.neutral[100],
                    borderColor: isDark ? ColorTokens.neutral[700] : ColorTokens.neutral[300],
                    borderWidth: 1,
                    color: isDark ? ColorTokens.neutral[100] : ColorTokens.neutral[800],
                    fontFamily: Tokens.typography.fonts.body,
                    fontSize: Tokens.typography.sizes.md,
                    textAlignVertical: 'top',
                  }}
                  accessibilityLabel="Campo de texto para notas opcionais"
                  accessibilityHint="Digite suas notas sobre como está se sentindo"
                />
              </Animated.View>
            )}

            {/* Botão de continuar */}
            {selectedEmotion && (
              <Animated.View entering={FadeIn.delay(200).duration(300)} style={{ width: '100%' }}>
                <Button
                  title={
                    isSubmitting
                      ? 'Processando...'
                      : context === 'before'
                      ? 'Começar Ritual'
                      : 'Finalizar'
                  }
                  onPress={handleSubmit}
                  disabled={isSubmitting}
                  loading={isSubmitting}
                  variant="primary"
                  size="lg"
                  leftIcon={
                    !isSubmitting ? (
                      <Sparkles size={20} color={ColorTokens.neutral[0]} />
                    ) : undefined
                  }
                  fullWidth
                  style={{
                    borderRadius: Tokens.radius['2xl'],
                    backgroundColor: isDark ? ColorTokens.primary[600] : ColorTokens.primary[500],
                    ...Tokens.shadows.xl,
                  }}
                />
              </Animated.View>
            )}
          </Box>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

