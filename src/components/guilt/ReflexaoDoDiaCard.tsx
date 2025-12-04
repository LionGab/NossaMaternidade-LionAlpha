/**
 * ReflexaoDoDiaCard - Card de reflexão diária (sem culpa)
 *
 * Substitui o antigo "DesculpaHojeCard" com linguagem empática:
 * - Pergunta sobre momento difícil (não "arrependimento")
 * - Sempre pareia com algo positivo
 * - Foco em auto-compaixão, não culpa
 *
 * @version 2.0
 * @date 2025-12-04
 */

import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { Heart, Sparkles, Sun } from 'lucide-react-native';
import React, { useState, useCallback } from 'react';
import { TouchableOpacity, View, TextInput, StyleSheet } from 'react-native';

import { Box } from '@/components/primitives/Box';
import { HapticButton } from '@/components/primitives/HapticButton';
import { Text } from '@/components/primitives/Text';
import { useTheme } from '@/theme';
import { Tokens, ColorTokens } from '@/theme/tokens';
import { logger } from '@/utils/logger';

export interface ReflexaoDoDiaCardProps {
  /** Dias consecutivos de reflexão */
  streakDays?: number | null;
  /** Callback quando reflexão é salva */
  onSave?: (reflection: { difficult: string; positive: string }) => void;
  /** Variante compacta (só mostra botão) */
  compact?: boolean;
}

export function ReflexaoDoDiaCard({ streakDays, onSave, compact = false }: ReflexaoDoDiaCardProps) {
  const { colors, isDark } = useTheme();
  const [isExpanded, setIsExpanded] = useState(false);
  const [difficultMoment, setDifficultMoment] = useState('');
  const [positiveMoment, setPositiveMoment] = useState('');
  const [step, setStep] = useState<'difficult' | 'positive' | 'done'>('difficult');

  const handlePress = useCallback(() => {
    logger.info('[ReflexaoDoDiaCard] Card pressed', { streakDays });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsExpanded(true);
  }, [streakDays]);

  const handleNextStep = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (step === 'difficult' && difficultMoment.trim()) {
      setStep('positive');
    } else if (step === 'positive' && positiveMoment.trim()) {
      setStep('done');
      onSave?.({ difficult: difficultMoment, positive: positiveMoment });
      logger.info('[ReflexaoDoDiaCard] Reflection saved', {
        hasDifficult: !!difficultMoment,
        hasPositive: !!positiveMoment,
      });
    }
  }, [step, difficultMoment, positiveMoment, onSave]);

  const handleClose = useCallback(() => {
    setIsExpanded(false);
    setStep('difficult');
    setDifficultMoment('');
    setPositiveMoment('');
  }, []);

  // Modo compacto - só mostra botão
  if (compact && !isExpanded) {
    return (
      <HapticButton
        onPress={handlePress}
        style={[
          styles.compactButton,
          {
            backgroundColor: isDark ? ColorTokens.primary[800] : ColorTokens.primary[50],
            borderColor: isDark ? ColorTokens.primary[600] : ColorTokens.primary[200],
          },
        ]}
        accessibilityLabel="Reflexão do dia"
        accessibilityHint="Toque para refletir sobre seu dia"
      >
        <Heart size={18} color={colors.primary.main} />
        <Text size="sm" weight="medium" style={{ color: colors.primary.main, marginLeft: 8 }}>
          Como foi seu dia?
        </Text>
      </HapticButton>
    );
  }

  // Modo expandido - formulário de reflexão
  if (isExpanded) {
    return (
      <View
        style={[
          styles.expandedContainer,
          {
            backgroundColor: colors.background.card,
            borderColor: colors.border.light,
          },
        ]}
      >
        {/* Header */}
        <Box direction="row" align="center" justify="space-between" mb="4">
          <Box direction="row" align="center" gap="2">
            <Heart size={20} color={colors.primary.main} />
            <Text size="md" weight="semibold" color="primary">
              Reflexão do Dia
            </Text>
          </Box>
          <TouchableOpacity accessibilityRole="button" onPress={handleClose}>
            <Text size="sm" color="tertiary">
              Fechar
            </Text>
          </TouchableOpacity>
        </Box>

        {/* Step 1: Momento difícil */}
        {step === 'difficult' && (
          <Box>
            <Text size="sm" color="secondary" style={{ marginBottom: Tokens.spacing['3'] }}>
              Qual foi a parte mais difícil do seu dia?
            </Text>
            <Text
              size="xs"
              color="tertiary"
              style={{ fontStyle: 'italic', marginBottom: Tokens.spacing['3'] }}
            >
              Está tudo bem sentir dificuldade. Você está fazendo o melhor que pode.
            </Text>
            <TextInput
              value={difficultMoment}
              onChangeText={setDifficultMoment}
              placeholder="Escreva aqui... (opcional)"
              placeholderTextColor={colors.text.tertiary}
              multiline
              numberOfLines={3}
              style={[
                styles.textInput,
                {
                  backgroundColor: colors.background.elevated,
                  color: colors.text.primary,
                  borderColor: colors.border.medium,
                },
              ]}
              accessibilityLabel="Campo para descrever momento difícil"
            />
            <Box direction="row" gap="2" mt="3">
              <HapticButton
                onPress={() => {
                  setStep('positive');
                }}
                style={[styles.secondaryButton, { borderColor: colors.border.medium }]}
              >
                <Text size="sm" color="secondary">
                  Pular
                </Text>
              </HapticButton>
              <HapticButton
                onPress={handleNextStep}
                style={[
                  styles.primaryButton,
                  {
                    backgroundColor: colors.primary.main,
                    opacity: difficultMoment.trim() ? 1 : 0.5,
                  },
                ]}
                disabled={!difficultMoment.trim()}
              >
                <Text size="sm" weight="semibold" color="inverse">
                  Continuar
                </Text>
              </HapticButton>
            </Box>
          </Box>
        )}

        {/* Step 2: Momento positivo (pareamento) */}
        {step === 'positive' && (
          <Box>
            <Box direction="row" align="center" gap="2" mb="3">
              <Sun size={18} color={ColorTokens.warning[500]} />
              <Text size="sm" color="secondary">
                E qual foi um momento bom de hoje?
              </Text>
            </Box>
            <Text
              size="xs"
              color="tertiary"
              style={{ fontStyle: 'italic', marginBottom: Tokens.spacing['3'] }}
            >
              Mesmo pequeno. Um sorriso, um café, um respiro.
            </Text>
            <TextInput
              value={positiveMoment}
              onChangeText={setPositiveMoment}
              placeholder="Um momento que te fez bem..."
              placeholderTextColor={colors.text.tertiary}
              multiline
              numberOfLines={3}
              style={[
                styles.textInput,
                {
                  backgroundColor: colors.background.elevated,
                  color: colors.text.primary,
                  borderColor: colors.border.medium,
                },
              ]}
              accessibilityLabel="Campo para descrever momento positivo"
            />
            <HapticButton
              onPress={handleNextStep}
              style={[
                styles.primaryButton,
                {
                  backgroundColor: colors.primary.main,
                  marginTop: Tokens.spacing['3'],
                },
              ]}
            >
              <Sparkles size={16} color={ColorTokens.neutral[0]} />
              <Text size="sm" weight="semibold" color="inverse" style={{ marginLeft: 8 }}>
                Salvar reflexão
              </Text>
            </HapticButton>
          </Box>
        )}

        {/* Step 3: Conclusão */}
        {step === 'done' && (
          <Box align="center" py="4">
            <Box
              p="4"
              rounded="full"
              style={{ backgroundColor: `${ColorTokens.success[500]}20` }}
              mb="3"
            >
              <Heart size={32} color={ColorTokens.success[500]} fill={ColorTokens.success[500]} />
            </Box>
            <Text
              size="md"
              weight="semibold"
              color="primary"
              align="center"
              style={{ marginBottom: Tokens.spacing['2'] }}
            >
              Obrigada por compartilhar
            </Text>
            <Text
              size="sm"
              color="secondary"
              align="center"
              style={{ marginBottom: Tokens.spacing['4'] }}
            >
              Refletir sobre o dia é um ato de autocuidado. Você merece esse momento.
            </Text>
            {streakDays !== undefined && streakDays !== null && streakDays > 0 && (
              <Box
                direction="row"
                align="center"
                gap="2"
                p="3"
                rounded="xl"
                style={{ backgroundColor: `${ColorTokens.warning[500]}20` }}
              >
                <Text size="lg">🔥</Text>
                <Text size="sm" weight="semibold" style={{ color: ColorTokens.warning[600] }}>
                  {streakDays + 1} dias de reflexão!
                </Text>
              </Box>
            )}
            <HapticButton
              onPress={handleClose}
              style={[styles.secondaryButton, { borderColor: colors.border.medium, marginTop: 16 }]}
            >
              <Text size="sm" color="secondary">
                Fechar
              </Text>
            </HapticButton>
          </Box>
        )}
      </View>
    );
  }

  // Modo normal - card fechado
  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.9}
      accessibilityRole="button"
      accessibilityLabel="Reflexão do Dia"
      accessibilityHint="Toque para refletir sobre os momentos do seu dia"
      style={styles.cardContainer}
    >
      <View style={styles.cardWrapper}>
        <LinearGradient
          colors={
            isDark
              ? [ColorTokens.primary[900], ColorTokens.primary[800]]
              : [ColorTokens.primary[50], ColorTokens.primary[100]]
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          <Box direction="row" align="flex-start" gap="4">
            {/* Ícone */}
            <View
              style={[
                styles.iconContainer,
                {
                  backgroundColor: isDark
                    ? `${ColorTokens.primary[500]}33`
                    : `${ColorTokens.primary[500]}E6`,
                },
              ]}
            >
              <Heart size={24} color={ColorTokens.neutral[0]} fill={ColorTokens.neutral[0]} />
            </View>

            {/* Conteúdo */}
            <Box flex={1}>
              <Box direction="row" align="center" gap="2" mb="2">
                <Text
                  size="lg"
                  weight="bold"
                  style={{
                    color: isDark ? ColorTokens.primary[300] : ColorTokens.primary[700],
                  }}
                >
                  Reflexão do Dia
                </Text>
                {streakDays !== undefined && streakDays !== null && streakDays > 0 && (
                  <View
                    style={[
                      styles.streakBadge,
                      {
                        backgroundColor: isDark
                          ? `${ColorTokens.primary[500]}33`
                          : ColorTokens.primary[100],
                        borderColor: isDark ? ColorTokens.primary[400] : ColorTokens.primary[300],
                      },
                    ]}
                  >
                    <Text
                      size="xs"
                      weight="bold"
                      style={{
                        color: isDark ? ColorTokens.primary[300] : ColorTokens.primary[700],
                      }}
                    >
                      🔥 {streakDays} dias
                    </Text>
                  </View>
                )}
              </Box>

              <Text
                size="sm"
                style={{
                  color: isDark ? ColorTokens.neutral[400] : ColorTokens.neutral[600],
                  marginBottom: Tokens.spacing['3'],
                }}
              >
                Como foi seu dia? Reflita sobre os momentos difíceis e bons.
              </Text>

              <HapticButton
                onPress={handlePress}
                style={[
                  styles.primaryButton,
                  {
                    backgroundColor: isDark ? ColorTokens.primary[600] : ColorTokens.primary[500],
                  },
                ]}
                accessibilityLabel="Começar reflexão do dia"
              >
                <Sparkles size={16} color={ColorTokens.neutral[0]} />
                <Text size="sm" weight="semibold" color="inverse" style={{ marginLeft: 8 }}>
                  Refletir agora
                </Text>
              </HapticButton>
            </Box>
          </Box>
        </LinearGradient>
      </View>
    </TouchableOpacity>
  );
}

// ======================
// STYLES
// ======================

const styles = StyleSheet.create({
  cardContainer: {
    marginBottom: Tokens.spacing['6'],
  },
  cardWrapper: {
    borderRadius: Tokens.radius['3xl'],
    overflow: 'hidden',
    ...Tokens.shadows.lg,
  },
  gradient: {
    padding: Tokens.spacing['6'],
  },
  iconContainer: {
    padding: Tokens.spacing['3'],
    borderRadius: Tokens.radius['2xl'],
    ...Tokens.shadows.md,
  },
  streakBadge: {
    paddingHorizontal: Tokens.spacing['2'],
    paddingVertical: Tokens.spacing['0.5'],
    borderRadius: Tokens.radius.full,
    borderWidth: 1,
  },
  expandedContainer: {
    borderRadius: Tokens.radius['3xl'],
    padding: Tokens.spacing['5'],
    marginBottom: Tokens.spacing['6'],
    borderWidth: 1,
    ...Tokens.shadows.lg,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: Tokens.radius.xl,
    padding: Tokens.spacing['4'],
    fontSize: Tokens.typography.sizes.sm,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  primaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Tokens.spacing['3'],
    paddingHorizontal: Tokens.spacing['4'],
    borderRadius: Tokens.radius.xl,
    minHeight: Tokens.touchTargets.min,
  },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Tokens.spacing['3'],
    paddingHorizontal: Tokens.spacing['4'],
    borderRadius: Tokens.radius.xl,
    borderWidth: 1,
    minHeight: Tokens.touchTargets.min,
  },
  compactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Tokens.spacing['3'],
    paddingHorizontal: Tokens.spacing['4'],
    borderRadius: Tokens.radius.full,
    borderWidth: 1,
    minHeight: Tokens.touchTargets.min,
  },
});

// Re-export com nome antigo para compatibilidade
export { ReflexaoDoDiaCard as DesculpaHojeCard };

export default ReflexaoDoDiaCard;
