/**
 * Desculpa Hoje Screen
 * Tela para validação de culpa materna
 * Migrado de app-redesign-studio
 */

import * as Haptics from 'expo-haptics';
import { ArrowLeft, Share2, CheckCircle2 } from 'lucide-react-native';
import React, { useState, useCallback } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Share,
  Platform,
} from 'react-native';
import Animated, {
  FadeIn,
  SlideInRight,
  SlideOutLeft,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Box } from '@/components/primitives/Box';
import { Button } from '@/components/primitives/Button';
import { Text } from '@/components/primitives/Text';
import { useTheme } from '@/theme';
import { Tokens } from '@/theme/tokens';
import { logger } from '@/utils/logger';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/navigation/types';
import {
  GuiltType,
  GuiltValidation,
  GuiltStats,
  Badge,
  GUILT_PRESETS,
  BADGES,
} from '@/types/guilt';

type DesculpaPhase = 'selecting' | 'validating' | 'complete';
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

// ============================================
// GUILT SELECTOR COMPONENT
// ============================================
interface GuiltSelectorProps {
  onGuiltSelected: (guiltType: GuiltType, customText?: string) => void;
  mostCommonToday?: GuiltType;
}

const GuiltSelector: React.FC<GuiltSelectorProps> = ({
  onGuiltSelected,
  mostCommonToday,
}) => {
  const { colors } = useTheme();
  const [selectedGuilt, setSelectedGuilt] = useState<GuiltType | null>(null);
  const [customText, setCustomText] = useState('');

  const handleSelect = useCallback(
    (guiltType: GuiltType) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setSelectedGuilt(guiltType);

      if (guiltType !== 'outro') {
        onGuiltSelected(guiltType);
      }
    },
    [onGuiltSelected]
  );

  const handleSubmitCustom = useCallback(() => {
    if (customText.trim()) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onGuiltSelected('outro', customText);
    }
  }, [customText, onGuiltSelected]);

  return (
    <Animated.View entering={FadeIn.duration(300)}>
      <Box p="4" gap="4">
        {/* Header */}
        <Box gap="2" align="center">
          <Text
            variant="body"
            size="xl"
            weight="bold"
            align="center"
            style={{ color: colors.text.primary }}
          >
            Qual &quot;desculpa&quot; você sentiu hoje?
          </Text>
          <Text
            variant="body"
            size="sm"
            align="center"
            style={{ color: colors.text.secondary }}
          >
            Escolha uma opção ou escreva a sua. Sem julgamentos.
          </Text>
        </Box>

        {/* Guilt Options */}
        <Box gap="3">
          {GUILT_PRESETS.map((preset) => {
            const isSelected = selectedGuilt === preset.type;
            const isPopular = mostCommonToday === preset.type;

            return (
              <TouchableOpacity
                key={preset.type}
                onPress={() => handleSelect(preset.type)}
                accessibilityRole="button"
                accessibilityLabel={preset.label}
                accessibilityState={{ selected: isSelected }}
                style={{
                  backgroundColor: isSelected
                    ? colors.primary.main
                    : colors.background.card,
                  borderRadius: Tokens.radius['2xl'],
                  padding: Tokens.spacing['4'],
                  borderWidth: 2,
                  borderColor: isSelected
                    ? colors.primary.main
                    : colors.border.light,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: Tokens.spacing['3'],
                }}
              >
                <Text style={{ fontSize: 28 }}>{preset.emoji}</Text>
                <Box flex={1}>
                  <Text
                    variant="body"
                    size="md"
                    weight="semibold"
                    style={{
                      color: isSelected ? '#FFFFFF' : colors.text.primary,
                    }}
                  >
                    {preset.label}
                  </Text>
                  {isPopular && (
                    <Text
                      variant="caption"
                      size="xs"
                      style={{
                        color: isSelected
                          ? 'rgba(255,255,255,0.8)'
                          : colors.text.tertiary,
                      }}
                    >
                      🔥 Mais comum hoje
                    </Text>
                  )}
                </Box>
              </TouchableOpacity>
            );
          })}
        </Box>

        {/* Custom Input (when "outro" selected) */}
        {selectedGuilt === 'outro' && (
          <Animated.View entering={FadeIn.duration(200)}>
            <Box gap="3">
              <TextInput
                placeholder="Descreva o que você está sentindo..."
                placeholderTextColor={colors.text.placeholder}
                value={customText}
                onChangeText={setCustomText}
                multiline
                numberOfLines={3}
                style={{
                  backgroundColor: colors.background.input,
                  borderRadius: Tokens.radius.xl,
                  padding: Tokens.spacing['4'],
                  color: colors.text.primary,
                  fontSize: Tokens.typography.sizes.md,
                  minHeight: 100,
                  textAlignVertical: 'top',
                }}
              />
              <Button
                title="Continuar"
                onPress={handleSubmitCustom}
                disabled={!customText.trim()}
              />
            </Box>
          </Animated.View>
        )}
      </Box>
    </Animated.View>
  );
};

// ============================================
// VALIDATION ENGINE COMPONENT
// ============================================
interface ValidationEngineProps {
  validation: GuiltValidation;
  badge?: Badge;
  onActionAccepted: () => void;
}

const ValidationEngine: React.FC<ValidationEngineProps> = ({
  validation,
  badge,
  onActionAccepted,
}) => {
  const { colors } = useTheme();
  const [actionAccepted, setActionAccepted] = useState(false);

  const handleAcceptAction = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setActionAccepted(true);
    onActionAccepted();
  }, [onActionAccepted]);

  return (
    <Animated.View
      entering={SlideInRight.duration(300)}
      exiting={SlideOutLeft.duration(200)}
    >
      <Box
        p="5"
        gap="4"
        style={{
          backgroundColor: colors.background.card,
          borderRadius: Tokens.radius['3xl'],
          borderWidth: 2,
          borderColor: colors.border.light,
        }}
      >
        {/* Normalize Message */}
        <Box align="center" gap="2">
          <Text style={{ fontSize: 48 }}>💙</Text>
          <Text
            variant="body"
            size="lg"
            weight="bold"
            align="center"
            style={{ color: colors.text.primary }}
          >
            Você não está sozinha
          </Text>
          <Text
            variant="body"
            size="md"
            align="center"
            style={{ color: colors.text.secondary }}
          >
            {validation.normalizePercentage}% das mães já sentiram o mesmo
          </Text>
        </Box>

        {/* Empathic Message */}
        <Box
          p="4"
          style={{
            backgroundColor: `${colors.primary.main}15`,
            borderRadius: Tokens.radius.xl,
          }}
        >
          <Text
            variant="body"
            size="md"
            align="center"
            style={{ color: colors.text.primary, fontStyle: 'italic' }}
          >
            &quot;{validation.message}&quot;
          </Text>
        </Box>

        {/* Suggested Action */}
        {validation.suggestedAction && !actionAccepted && (
          <Box gap="3">
            <Text
              variant="body"
              size="sm"
              weight="semibold"
              align="center"
              style={{ color: colors.text.tertiary }}
            >
              Ação sugerida:
            </Text>
            <Text
              variant="body"
              size="md"
              align="center"
              style={{ color: colors.text.primary }}
            >
              {validation.suggestedAction}
            </Text>
            <Button
              title="Vou tentar fazer isso 💪"
              onPress={handleAcceptAction}
              variant="secondary"
            />
          </Box>
        )}

        {actionAccepted && (
          <Box
            p="3"
            align="center"
            style={{
              backgroundColor: `${Tokens.colors.success[500]}20`,
              borderRadius: Tokens.radius.lg,
            }}
          >
            <Text style={{ color: Tokens.colors.success[600] }}>
              ✓ Ótimo! Você deu o primeiro passo.
            </Text>
          </Box>
        )}

        {/* Badge Preview */}
        {badge && (
          <Box
            p="4"
            align="center"
            gap="2"
            style={{
              backgroundColor: `${Tokens.colors.warning[500]}15`,
              borderRadius: Tokens.radius.xl,
              borderWidth: 1,
              borderColor: Tokens.colors.warning[400],
            }}
          >
            <Text style={{ fontSize: 32 }}>{badge.icon}</Text>
            <Text
              variant="body"
              size="sm"
              weight="bold"
              style={{ color: Tokens.colors.warning[600] }}
            >
              Badge desbloqueada: {badge.name}
            </Text>
            <Text
              variant="caption"
              size="xs"
              align="center"
              style={{ color: colors.text.tertiary }}
            >
              {badge.description}
            </Text>
          </Box>
        )}
      </Box>
    </Animated.View>
  );
};

// ============================================
// MAIN SCREEN COMPONENT
// ============================================
export default function DesculpaHojeScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();

  const [phase, setPhase] = useState<DesculpaPhase>('selecting');
  const [selectedGuilt, setSelectedGuilt] = useState<GuiltType | null>(null);
  const [_customText, setCustomText] = useState<string>('');
  const [validation, setValidation] = useState<GuiltValidation | null>(null);
  const [stats, _setStats] = useState<GuiltStats | null>(null);
  const [unlockedBadges, setUnlockedBadges] = useState<Badge[]>([]);
  const [actionAccepted, setActionAccepted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Mock validation data (replace with actual service call)
  const getValidation = useCallback(
    async (guiltType: GuiltType): Promise<GuiltValidation> => {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 800));

      const messages: Record<GuiltType, string> = {
        gritei_com_filho:
          'Gritar não te define. Você é humana, e humanos têm limites. O importante é o que você faz depois.',
        nao_brinquei_suficiente:
          'Presença não é medida em minutos. O amor que você dá está em cada olhar, cada abraço.',
        deixei_na_tv:
          'A TV não é inimiga. Às vezes você precisa de um momento, e isso é completamente válido.',
        perdi_paciencia:
          'Paciência não é infinita. Reconhecer quando ela acaba já é um ato de consciência.',
        nao_refeicao_saudavel:
          'Alimentação perfeita não existe. Seu filho está sendo nutrido de amor.',
        nao_brinquei_fora:
          'Nem todo dia é dia de parque. Estar presente de outras formas também conta.',
        usei_celular_demais:
          'O celular às vezes é uma válvula de escape necessária. Não se culpe por precisar respirar.',
        nao_li_historia:
          'Histórias podem ser contadas de mil formas. Conversar também é contar histórias.',
        outro:
          'Qualquer que seja sua "culpa", ela não te define. Você está fazendo o melhor que pode.',
      };

      return {
        guiltType,
        normalizePercentage: Math.floor(Math.random() * 20) + 70, // 70-90%
        similarCount: Math.floor(Math.random() * 50000) + 10000,
        message: messages[guiltType],
        suggestedAction: 'Respire fundo, abrace seu filho e diga "eu te amo".',
        badgeEligible: Math.random() > 0.5,
      };
    },
    []
  );

  const handleGuiltSelected = useCallback(
    async (guiltType: GuiltType, text?: string) => {
      setSelectedGuilt(guiltType);
      setCustomText(text || '');
      setIsLoading(true);

      try {
        const validationData = await getValidation(guiltType);
        setValidation(validationData);

        // Check for badge (mock)
        if (validationData.badgeEligible) {
          const randomBadge = BADGES[Math.floor(Math.random() * BADGES.length)];
          setUnlockedBadges([randomBadge]);
        }

        setPhase('validating');
      } catch (error) {
        logger.error('Error getting validation', error);
      } finally {
        setIsLoading(false);
      }
    },
    [getValidation]
  );

  const handleComplete = useCallback(async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setPhase('complete');
    logger.info('Desculpa registrada', { guiltType: selectedGuilt, actionAccepted });
  }, [selectedGuilt, actionAccepted]);

  const handleShare = useCallback(async () => {
    try {
      const message = `💙 Registrei minha "desculpa" de hoje. Estou em boa companhia - ${validation?.normalizePercentage || 75}% das mães sentem o mesmo. #NossaMaternidade #DesculpaHoje`;

      if (Platform.OS === 'web') {
        await navigator.clipboard.writeText(message);
      } else {
        await Share.share({ message });
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      logger.error('Error sharing', error);
    }
  }, [validation]);

  const handleGoBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  // ============================================
  // RENDER: COMPLETE PHASE
  // ============================================
  if (phase === 'complete') {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.background.canvas,
          paddingTop: insets.top,
        }}
      >
        {/* Header */}
        <Box
          direction="row"
          align="center"
          p="4"
          style={{ borderBottomWidth: 1, borderBottomColor: colors.border.light }}
        >
          <TouchableOpacity
            onPress={handleGoBack}
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              alignItems: 'center',
              justifyContent: 'center',
            }}
            accessibilityLabel="Voltar"
          >
            <ArrowLeft size={24} color={colors.text.primary} />
          </TouchableOpacity>
        </Box>

        <ScrollView
          contentContainerStyle={{
            padding: Tokens.spacing['4'],
            paddingBottom: insets.bottom + Tokens.spacing['8'],
          }}
        >
          <Animated.View entering={FadeIn.duration(500)}>
            <Box gap="6" align="center" py="8">
              {/* Success Icon */}
              <Box
                align="center"
                justify="center"
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 40,
                  backgroundColor: Tokens.colors.info[500],
                }}
              >
                <CheckCircle2 size={40} color="#FFFFFF" />
              </Box>

              {/* Success Message */}
              <Box gap="2" align="center">
                <Text
                  variant="body"
                  size="2xl"
                  weight="bold"
                  align="center"
                  style={{ color: Tokens.colors.info[600] }}
                >
                  Desculpa Registrada! 💙
                </Text>
                <Text
                  variant="body"
                  size="lg"
                  align="center"
                  style={{ color: colors.text.secondary }}
                >
                  Você está fazendo o melhor que pode. Isso é o que importa.
                </Text>
              </Box>

              {/* Badge */}
              {unlockedBadges.length > 0 && (
                <Box
                  p="4"
                  align="center"
                  gap="2"
                  style={{
                    backgroundColor: `${Tokens.colors.warning[500]}15`,
                    borderRadius: Tokens.radius['2xl'],
                    borderWidth: 2,
                    borderColor: Tokens.colors.warning[400],
                    width: '100%',
                  }}
                >
                  <Text style={{ fontSize: 48 }}>{unlockedBadges[0].icon}</Text>
                  <Text
                    variant="body"
                    size="md"
                    weight="bold"
                    style={{ color: Tokens.colors.warning[600] }}
                  >
                    {unlockedBadges[0].name}
                  </Text>
                  <Text
                    variant="body"
                    size="sm"
                    align="center"
                    style={{ color: colors.text.tertiary }}
                  >
                    {unlockedBadges[0].description}
                  </Text>
                </Box>
              )}

              {/* Actions */}
              <Box gap="3" style={{ width: '100%' }}>
                <Button
                  title="Compartilhar"
                  onPress={handleShare}
                  variant="outline"
                  leftIcon={<Share2 size={20} color={colors.text.primary} />}
                />
                <Button
                  title="Voltar para Home"
                  onPress={handleGoBack}
                  style={{
                    backgroundColor: Tokens.colors.info[500],
                  }}
                />
              </Box>
            </Box>
          </Animated.View>
        </ScrollView>
      </View>
    );
  }

  // ============================================
  // RENDER: MAIN FLOW
  // ============================================
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.background.canvas,
        paddingTop: insets.top,
      }}
    >
      {/* Header */}
      <Box
        direction="row"
        align="center"
        p="4"
        gap="3"
        style={{ borderBottomWidth: 1, borderBottomColor: colors.border.light }}
      >
        <TouchableOpacity
          onPress={handleGoBack}
          style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            alignItems: 'center',
            justifyContent: 'center',
          }}
          accessibilityLabel="Voltar"
        >
          <ArrowLeft size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Box flex={1}>
          <Text
            variant="body"
            size="lg"
            weight="bold"
            style={{ color: Tokens.colors.info[600] }}
          >
            💙 Desculpa Hoje
          </Text>
          <Text variant="caption" size="xs" style={{ color: colors.text.tertiary }}>
            Normalizando o imperfeito
          </Text>
        </Box>
      </Box>

      {/* Content */}
      <ScrollView
        contentContainerStyle={{
          paddingBottom: insets.bottom + Tokens.spacing['8'],
        }}
      >
        {isLoading ? (
          <Box flex={1} align="center" justify="center" py="16">
            <ActivityIndicator size="large" color={colors.primary.main} />
            <Text style={{ color: colors.text.secondary, marginTop: Tokens.spacing['4'] }}>
              Buscando validação...
            </Text>
          </Box>
        ) : (
          <>
            {phase === 'selecting' && (
              <GuiltSelector
                onGuiltSelected={handleGuiltSelected}
                mostCommonToday={stats?.mostCommonGuilt}
              />
            )}

            {phase === 'validating' && validation && (
              <Box p="4" gap="4">
                <ValidationEngine
                  validation={validation}
                  badge={unlockedBadges[0]}
                  onActionAccepted={() => setActionAccepted(true)}
                />

                {/* Action Buttons */}
                <Box direction="row" gap="3">
                  <Button
                    title="Compartilhar"
                    onPress={handleShare}
                    variant="outline"
                    style={{ flex: 1 }}
                    leftIcon={<Share2 size={18} color={colors.text.primary} />}
                  />
                  <Button
                    title="Registrar Desculpa"
                    onPress={handleComplete}
                    style={{
                      flex: 1,
                      backgroundColor: Tokens.colors.info[500],
                    }}
                  />
                </Box>
              </Box>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

