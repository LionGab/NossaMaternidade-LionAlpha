/**
 * GuiltSelector - Componente de Seleção de Culpa
 *
 * Permite que a mãe selecione seu maior arrependimento do dia através de
 * opções pré-definidas ou texto livre. Primeira fase do fluxo "Desculpa Hoje".
 *
 * Referência: app-redesign-studio-ab40635e/src/components/guilt/GuiltSelector.tsx
 * Adaptado para React Native com design system atual.
 */

import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import {
  View,
  TextInput,
  ScrollView,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

import { Box } from '@/components/atoms/Box';
import { Button } from '@/components/atoms/Button';
import { Text } from '@/components/atoms/Text';
import { useTheme } from '@/theme';
import { Tokens, ColorTokens } from '@/theme/tokens';
import { GUILT_PRESETS, type GuiltType } from '@/types/guilt';

export interface GuiltSelectorProps {
  onGuiltSelected: (guiltType: GuiltType, customText?: string) => void;
  mostCommonToday?: GuiltType;
}

export function GuiltSelector({ onGuiltSelected, mostCommonToday }: GuiltSelectorProps) {
  const { isDark } = useTheme();
  const [selectedGuilt, setSelectedGuilt] = useState<GuiltType | null>(null);
  const [customText, setCustomText] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleGuiltClick = (guiltType: GuiltType) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (guiltType === 'outro') {
      setShowCustomInput(true);
      setSelectedGuilt(null);
    } else {
      setSelectedGuilt(guiltType);
      onGuiltSelected(guiltType);
    }
  };

  const handleCustomSubmit = () => {
    if (!customText.trim()) return;

    setIsSubmitting(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Simular pequeno delay para feedback visual
    setTimeout(() => {
      onGuiltSelected('outro', customText.trim());
      setIsSubmitting(false);
    }, 500);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          padding: Tokens.spacing['6'],
          paddingBottom: Tokens.spacing['12'],
        }}
      >
        {/* Header */}
        <Box align="center" mb="6">
          <View style={{ marginBottom: Tokens.spacing['2'] }}>
            <LinearGradient
              colors={
                isDark
                  ? [ColorTokens.primary[400], ColorTokens.secondary[400]]
                  : [ColorTokens.primary[600], ColorTokens.secondary[600]]
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{
                borderRadius: Tokens.radius.md,
                paddingHorizontal: Tokens.spacing['2'],
                paddingVertical: Tokens.spacing['1'],
              }}
            >
              <Text
                size="2xl"
                weight="bold"
                style={{
                  textAlign: 'center',
                  color: ColorTokens.neutral[0],
                }}
              >
                Qual foi seu maior arrependimento?
              </Text>
            </LinearGradient>
          </View>
          <Text size="sm" color="tertiary" align="center">
            Escolha uma opção ou escreva livremente
          </Text>
        </Box>

        {/* Opções preset */}
        <Box gap="2" mb="4">
          {GUILT_PRESETS.map((preset, _index) => {
            const isSelected = selectedGuilt === preset.type;
            const isMostCommon = mostCommonToday === preset.type;

            return (
              <Pressable
                key={preset.type}
                onPress={() => handleGuiltClick(preset.type)}
                accessibilityRole="button"
                accessibilityLabel={preset.label}
                accessibilityHint="Toque para selecionar esta opção"
                style={{
                  marginBottom: Tokens.spacing['2'],
                }}
              >
                {({ pressed }) => (
                  <View
                    style={{
                      borderRadius: Tokens.radius['2xl'],
                      borderWidth: 2,
                      borderColor: isSelected
                        ? 'transparent'
                        : isDark
                          ? ColorTokens.neutral[700]
                          : ColorTokens.neutral[200],
                      overflow: 'hidden',
                      opacity: pressed ? 0.8 : 1,
                      ...Tokens.shadows.md,
                    }}
                  >
                    {isSelected ? (
                      <LinearGradient
                        colors={
                          isDark
                            ? [ColorTokens.primary[600], ColorTokens.secondary[600]]
                            : [ColorTokens.primary[500], ColorTokens.secondary[500]]
                        }
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={{
                          padding: Tokens.spacing['4'],
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'flex-start',
                        }}
                      >
                        <Text size="2xl" style={{ marginRight: Tokens.spacing['3'] }}>
                          {preset.emoji}
                        </Text>
                        <Text
                          size="md"
                          weight="semibold"
                          style={{
                            flex: 1,
                            color: ColorTokens.neutral[0],
                          }}
                        >
                          {preset.label}
                        </Text>
                        {isMostCommon && (
                          <View
                            style={{
                              paddingHorizontal: Tokens.spacing['2'],
                              paddingVertical: Tokens.spacing['0.5'],
                              borderRadius: Tokens.radius.full,
                              backgroundColor: `${ColorTokens.neutral[0]}33`,
                            }}
                          >
                            <Text
                              size="xs"
                              weight="bold"
                              style={{ color: ColorTokens.neutral[0] }}
                            >
                              🔥 Mais escolhido hoje
                            </Text>
                          </View>
                        )}
                      </LinearGradient>
                    ) : (
                      <View
                        style={{
                          padding: Tokens.spacing['4'],
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'flex-start',
                          backgroundColor: isDark
                            ? ColorTokens.neutral[800]
                            : ColorTokens.neutral[0],
                        }}
                      >
                        <Text size="2xl" style={{ marginRight: Tokens.spacing['3'] }}>
                          {preset.emoji}
                        </Text>
                        <Text
                          size="md"
                          weight="semibold"
                          style={{
                            flex: 1,
                            color: isDark ? ColorTokens.neutral[100] : ColorTokens.neutral[900],
                          }}
                        >
                          {preset.label}
                        </Text>
                        {isMostCommon && (
                          <View
                            style={{
                              paddingHorizontal: Tokens.spacing['2'],
                              paddingVertical: Tokens.spacing['0.5'],
                              borderRadius: Tokens.radius.full,
                              backgroundColor: isDark
                                ? ColorTokens.primary[900]
                                : ColorTokens.primary[100],
                            }}
                          >
                            <Text
                              size="xs"
                              weight="bold"
                              style={{
                                color: isDark
                                  ? ColorTokens.primary[200]
                                  : ColorTokens.primary[700],
                              }}
                            >
                              🔥 Mais escolhido hoje
                            </Text>
                          </View>
                        )}
                      </View>
                    )}
                  </View>
                )}
              </Pressable>
            );
          })}
        </Box>

        {/* Input customizado */}
        {showCustomInput && (
          <Box
            style={{
              marginTop: Tokens.spacing['4'],
            }}
          >
            <TextInput
              value={customText}
              onChangeText={setCustomText}
              placeholder="Descreva o que você sente culpa..."
              placeholderTextColor={
                isDark ? ColorTokens.neutral[500] : ColorTokens.neutral[400]
              }
              multiline
              maxLength={200}
              style={{
                minHeight: 100,
                padding: Tokens.spacing['4'],
                borderRadius: Tokens.radius.xl,
                backgroundColor: isDark
                  ? ColorTokens.neutral[800]
                  : ColorTokens.neutral[50],
                borderWidth: 2,
                borderColor: isDark
                  ? ColorTokens.neutral[700]
                  : ColorTokens.neutral[200],
                color: isDark ? ColorTokens.neutral[100] : ColorTokens.neutral[900],
                fontSize: Tokens.typography.sizes.md,
                fontFamily: Tokens.typography.fonts.body,
                textAlignVertical: 'top',
              }}
              accessibilityLabel="Campo de texto para descrever sua culpa"
              accessibilityHint="Digite livremente sobre seu maior arrependimento de hoje"
            />

            <Text
              size="xs"
              color="tertiary"
              align="right"
              style={{ marginTop: Tokens.spacing['1'] }}
            >
              {customText.length}/200
            </Text>

            <Button
              title={isSubmitting ? 'Processando...' : 'Continuar'}
              onPress={handleCustomSubmit}
              disabled={!customText.trim() || isSubmitting}
              loading={isSubmitting}
              variant="primary"
              size="lg"
              fullWidth
              style={{
                marginTop: Tokens.spacing['4'],
                borderRadius: Tokens.radius['2xl'],
              }}
              accessibilityLabel="Continuar com texto customizado"
              accessibilityHint="Envia sua descrição personalizada de culpa"
            />
          </Box>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

