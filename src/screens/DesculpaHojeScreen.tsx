/**
 * DesculpaHojeScreen - Fluxo Completo de Reflexão sobre Arrependimentos
 *
 * Tela com 3 fases:
 * 1. Seleção de culpa (GuiltSelector)
 * 2. Validação empática (ValidationEngine)
 * 3. Conquistas e badges (BadgeUnlocker)
 *
 * Referência: app-redesign-studio-ab40635e/src/pages/DesculpaHoje.tsx
 * Adaptado para React Native com design system atual.
 *
 * @version 2.0.0
 */

import { useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { ArrowLeft, Share2, CheckCircle2, Heart as _Heart } from 'lucide-react-native';
import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Share,
} from 'react-native';

import { Box } from '@/components/atoms/Box';
import { Button } from '@/components/atoms/Button';
import { Text } from '@/components/atoms/Text';
import {
  GuiltSelector,
  ValidationEngine,
  BadgeUnlocker,
} from '@/components/guilt';
import { guiltService } from '@/services/guiltService';
import { useTheme } from '@/theme';
import { Tokens, ColorTokens } from '@/theme/tokens';
import type { GuiltType, GuiltValidation, GuiltStats, Badge } from '@/types/guilt';
import { logger } from '@/utils/logger';

type DesculpaPhase = 'selecting' | 'validating' | 'complete';

export default function DesculpaHojeScreen() {
  const navigation = useNavigation();
  const { colors, isDark } = useTheme();
  const [phase, setPhase] = useState<DesculpaPhase>('selecting');
  const [selectedGuilt, setSelectedGuilt] = useState<GuiltType | null>(null);
  const [customText, setCustomText] = useState<string>('');
  const [validation, setValidation] = useState<GuiltValidation | null>(null);
  const [stats, setStats] = useState<GuiltStats | null>(null);
  const [unlockedBadges, setUnlockedBadges] = useState<Badge[]>([]);
  const [actionAccepted, setActionAccepted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const loadedStats = await guiltService.getStats();
      setStats(loadedStats);
    } catch (error) {
      logger.error('[DesculpaHojeScreen] Error loading stats', error);
    }
  };

  const handleGuiltSelected = async (guiltType: GuiltType, text?: string) => {
    setSelectedGuilt(guiltType);
    setCustomText(text || '');
    setIsLoading(true);

    try {
      // Buscar validação empática
      const validationData = await guiltService.getValidation(guiltType);
      if (validationData) {
        setValidation(validationData);
      }

      // Verificar badges
      const badges = await guiltService.checkAndUnlockBadges();
      setUnlockedBadges(badges);

      setPhase('validating');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      logger.error('[DesculpaHojeScreen] Error in handleGuiltSelected', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleComplete = async () => {
    if (!selectedGuilt || !validation) return;

    setIsLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      // Salvar registro no Supabase
      await guiltService.saveGuiltLog({
        guiltType: selectedGuilt,
        customText: customText || undefined,
        intensity: 7, // Default, pode ser melhorado no futuro
        timestamp: new Date().toISOString(),
        actionAccepted,
        badgeUnlocked:
          unlockedBadges.length > 0 ? unlockedBadges[0].id : undefined,
        shared: false,
      });

      // Recarregar stats
      await loadStats();

      setPhase('complete');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      logger.error('[DesculpaHojeScreen] Error completing guilt log', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = async () => {
    try {
      const badgeText =
        unlockedBadges.length > 0
          ? ` Conquistei a badge ${unlockedBadges[0].name}! ${unlockedBadges[0].icon}`
          : '';

      const shareMessage = `Registrei minha "desculpa" de hoje. Estou em boa companhia - ${
        validation?.normalizePercentage || 75
      }% das mães sentem o mesmo.${badgeText} #NossaMaternidade #DesculpaHoje #MãeReal`;

      const result = await Share.share({
        message: shareMessage,
        title: '💙 Desculpa Hoje',
      });

      if (result.action === Share.sharedAction) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        logger.info('[DesculpaHojeScreen] Content shared successfully');
      }
    } catch (error) {
      logger.error('[DesculpaHojeScreen] Error sharing', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  // Fase 3: Conclusão
  if (phase === 'complete') {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: colors.background.canvas,
        }}
      >
        {/* Header */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: Tokens.spacing['4'],
            paddingVertical: Tokens.spacing['4'],
            borderBottomWidth: 1,
            borderBottomColor: colors.border.light,
          }}
        >
          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              navigation.goBack();
            }}
            style={{
              width: 40,
              height: 40,
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: Tokens.radius.full,
              backgroundColor: colors.background.card,
            }}
            accessibilityRole="button"
            accessibilityLabel="Voltar"
            accessibilityHint="Fecha esta tela"
          >
            <ArrowLeft size={24} color={colors.text.primary} />
          </TouchableOpacity>

          <Text
            style={{
              flex: 1,
              fontSize: 18,
              fontWeight: '600',
              color: colors.text.primary,
              marginLeft: Tokens.spacing['4'],
            }}
          >
            Desculpa Registrada! 💙
          </Text>
        </View>

        {/* Content */}
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            paddingHorizontal: Tokens.spacing['4'],
            paddingVertical: Tokens.spacing['6'],
            paddingBottom: Tokens.spacing['12'],
          }}
          showsVerticalScrollIndicator={false}
        >
          {/* Ícone de sucesso */}
          <Box align="center" mb="6">
            <View
              style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                backgroundColor: ColorTokens.success[100],
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: Tokens.spacing['4'],
              }}
            >
              <CheckCircle2
                size={40}
                color={ColorTokens.success[500]}
                fill={ColorTokens.success[500]}
              />
            </View>

            <Text
              size="2xl"
              weight="bold"
              style={{
                textAlign: 'center',
                marginBottom: Tokens.spacing['2'],
                color: colors.text.primary,
              }}
            >
              Você está fazendo o melhor que pode
            </Text>
            <Text
              size="md"
              color="secondary"
              align="center"
              style={{
                lineHeight: Tokens.typography.lineHeights.lg,
              }}
            >
              Isso é o que importa.
            </Text>
          </Box>

          {/* Badges */}
          {stats && (
            <BadgeUnlocker
              badges={unlockedBadges}
              totalThisWeek={stats.totalThisWeek}
            />
          )}

          {/* Botões de ação */}
          <Box direction="row" gap="3" mt="6">
            <Button
              title="Compartilhar"
              onPress={handleShare}
              variant="outline"
              size="lg"
              leftIcon={<Share2 size={18} color={colors.text.primary} />}
              style={{ flex: 1 }}
              accessibilityLabel="Compartilhar conquista"
              accessibilityHint="Compartilha sua jornada nas redes sociais"
            />
            <Button
              title="Voltar para Home"
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                navigation.goBack();
              }}
              variant="primary"
              size="lg"
              style={{ flex: 1 }}
              accessibilityLabel="Voltar para tela inicial"
              accessibilityHint="Retorna para a tela principal"
            />
          </Box>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Fases 1 e 2: Seleção e Validação
  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: colors.background.canvas,
      }}
    >
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: Tokens.spacing['4'],
          paddingVertical: Tokens.spacing['4'],
          borderBottomWidth: 1,
          borderBottomColor: colors.border.light,
        }}
      >
        <TouchableOpacity
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            navigation.goBack();
          }}
          style={{
            width: 40,
            height: 40,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: Tokens.radius.full,
            backgroundColor: colors.background.card,
          }}
          accessibilityRole="button"
          accessibilityLabel="Voltar"
          accessibilityHint="Fecha esta tela"
        >
          <ArrowLeft size={24} color={colors.text.primary} />
        </TouchableOpacity>

        <Box flex={1} ml="4">
          <Text
            size="lg"
            weight="bold"
            style={{
              color: isDark ? ColorTokens.info[300] : ColorTokens.info[600],
            }}
          >
            💙 Desculpa Hoje
          </Text>
          <Text size="xs" color="tertiary">
            Normalizando o imperfeito
          </Text>
        </Box>
      </View>

      {/* Content */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: Tokens.spacing['4'],
          paddingVertical: Tokens.spacing['6'],
          paddingBottom: Tokens.spacing['12'],
        }}
        showsVerticalScrollIndicator={false}
      >
        {phase === 'selecting' && (
          <GuiltSelector
            onGuiltSelected={handleGuiltSelected}
            mostCommonToday={stats?.mostCommonGuilt}
          />
        )}

        {phase === 'validating' && validation && (
          <Box gap="4">
            <ValidationEngine
              validation={validation}
              badge={unlockedBadges.length > 0 ? unlockedBadges[0] : undefined}
              onActionAccepted={() => {
                setActionAccepted(true);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
            />

            {/* Botões de ação */}
            <Box direction="row" gap="3" mt="4">
              <Button
                title="Compartilhar"
                onPress={handleShare}
                variant="outline"
                size="lg"
                leftIcon={<Share2 size={18} color={colors.text.primary} />}
                style={{ flex: 1 }}
                accessibilityLabel="Compartilhar"
                accessibilityHint="Compartilha sua jornada"
              />
              <Button
                title={isLoading ? 'Registrando...' : 'Registrar Desculpa'}
                onPress={handleComplete}
                disabled={isLoading}
                loading={isLoading}
                variant="primary"
                size="lg"
                style={{ flex: 1 }}
                accessibilityLabel="Registrar desculpa"
                accessibilityHint="Salva seu registro e finaliza o fluxo"
              />
            </Box>
          </Box>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
