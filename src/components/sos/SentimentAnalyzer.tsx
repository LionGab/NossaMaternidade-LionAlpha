/**
 * SentimentAnalyzer - Analisador de sentimento para SOS Mãe
 *
 * Permite que a usuária selecione ou escreva livremente como está se sentindo,
 * com análise básica de sentimento baseada em palavras-chave.
 * Referência: app-redesign-studio-ab40635e/src/components/sos/SentimentAnalyzer.tsx
 * Adaptado para React Native com design system atual.
 */

import * as Haptics from 'expo-haptics';
import { Heart, Loader2 } from 'lucide-react-native';
import React, { useState } from 'react';
import { View, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import Animated, { FadeIn, SlideInUp } from 'react-native-reanimated';
import { LinearGradient as _LinearGradient } from 'expo-linear-gradient';

import { Box } from '@/components/atoms/Box';
import { Button } from '@/components/atoms/Button';
import { Text } from '@/components/atoms/Text';
import { useTheme } from '@/theme';
import { Tokens, ColorTokens } from '@/theme/tokens';
import type { SentimentType } from '@/types/sos';
import { SENTIMENT_OPTIONS } from '@/types/sos';

interface SentimentAnalyzerProps {
  onSentimentSelected: (sentiment: SentimentType, text?: string) => void;
}

export function SentimentAnalyzer({ onSentimentSelected }: SentimentAnalyzerProps) {
  const { colors: _colors, isDark } = useTheme();
  const [selectedSentiment, setSelectedSentiment] = useState<SentimentType | null>(null);
  const [customText, setCustomText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showCustomInput, setShowCustomInput] = useState(false);

  const handleSentimentClick = (sentiment: SentimentType) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedSentiment(sentiment);
    onSentimentSelected(sentiment);
  };

  const handleCustomSubmit = async () => {
    if (!customText.trim()) return;

    setIsAnalyzing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Simular análise (será substituído por IA real)
    // TODO: Integrar com serviço de análise de sentimento (IA)
    setTimeout(() => {
      // Por enquanto, usar sentimento padrão baseado em palavras-chave
      const textLower = customText.toLowerCase();
      let detectedSentiment: SentimentType = 'sobrecarregada';

      if (textLower.includes('exausta') || textLower.includes('cansada')) {
        detectedSentiment = 'cansada';
      } else if (textLower.includes('culpada') || textLower.includes('culpa')) {
        detectedSentiment = 'culpada';
      } else if (textLower.includes('ansiosa') || textLower.includes('ansiedade')) {
        detectedSentiment = 'ansiosa';
      } else if (textLower.includes('triste')) {
        detectedSentiment = 'triste';
      } else if (textLower.includes('sobrecarregada') || textLower.includes('sobrecarga')) {
        detectedSentiment = 'sobrecarregada';
      } else if (textLower.includes('irritada') || textLower.includes('raiva')) {
        detectedSentiment = 'irritada';
      } else if (textLower.includes('sozinha') || textLower.includes('solidão')) {
        detectedSentiment = 'sozinha';
      } else if (textLower.includes('desesperada') || textLower.includes('desespero')) {
        detectedSentiment = 'desesperada';
      }

      setIsAnalyzing(false);
      onSentimentSelected(detectedSentiment, customText);
    }, 1000);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <Box p="6" gap="6">
        {/* Header */}
        <Box align="center" gap="3">
          <View
            style={{
              width: 64,
              height: 64,
              borderRadius: 32,
              overflow: 'hidden',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: isDark ? ColorTokens.secondary[800] : ColorTokens.secondary[100],
            }}
          >
            <Heart size={32} color={isDark ? ColorTokens.secondary[300] : ColorTokens.secondary[600]} />
          </View>
          <Text
            size="2xl"
            weight="bold"
            align="center"
            style={{
              color: isDark ? ColorTokens.secondary[300] : ColorTokens.secondary[600],
            }}
          >
            O que você está sentindo agora?
          </Text>
          <Text size="sm" align="center" color="secondary">
            Escolha uma opção ou escreva livremente
          </Text>
        </Box>

        {/* Opções rápidas */}
        <Box
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: Tokens.spacing['3'],
            justifyContent: 'center',
          }}
        >
          {SENTIMENT_OPTIONS.map((option, index) => {
            const isSelected = selectedSentiment === option.type;
            return (
              <Animated.View
                key={option.type}
                entering={FadeIn.delay(100 * index).duration(300)}
                style={{ width: '48%' }}
              >
                <Button
                  title={option.label}
                  onPress={() => handleSentimentClick(option.type)}
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
                      {option.emoji}
                    </Text>
                  }
                />
              </Animated.View>
            );
          })}
        </Box>

        {/* Input customizado */}
        <Box gap="3">
          <Button
            title="✍️ Ou escrever livremente"
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setShowCustomInput(!showCustomInput);
            }}
            variant="outline"
            size="lg"
            style={{
              borderRadius: Tokens.radius['2xl'],
              height: 48,
            }}
          />

          {showCustomInput && (
            <Animated.View entering={SlideInUp.duration(200)}>
              <Box gap="3">
                <TextInput
                  value={customText}
                  onChangeText={setCustomText}
                  placeholder="Descreva como você está se sentindo..."
                  placeholderTextColor={isDark ? ColorTokens.neutral[500] : ColorTokens.neutral[400]}
                  multiline
                  maxLength={200}
                  style={{
                    minHeight: 100,
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
                  accessibilityLabel="Campo de texto para descrever sentimento"
                  accessibilityHint="Descreva como está se sentindo em até 200 caracteres"
                />
                <Button
                  title={isAnalyzing ? 'Analisando...' : 'Continuar'}
                  onPress={handleCustomSubmit}
                  disabled={!customText.trim() || isAnalyzing}
                  loading={isAnalyzing}
                  variant="primary"
                  size="lg"
                  leftIcon={
                    isAnalyzing ? (
                      <Loader2 size={20} color={ColorTokens.neutral[0]} className="animate-spin" />
                    ) : undefined
                  }
                  fullWidth
                  style={{
                    borderRadius: Tokens.radius['2xl'],
                    backgroundColor: isDark ? ColorTokens.secondary[600] : ColorTokens.secondary[500],
                    ...Tokens.shadows.lg,
                  }}
                />
              </Box>
            </Animated.View>
          )}
        </Box>
      </Box>
    </KeyboardAvoidingView>
  );
}

