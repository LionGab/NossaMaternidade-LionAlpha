// components/onboarding/steps/TermsStep.tsx
import { LinearGradient } from 'expo-linear-gradient';
import { Check, Sun } from 'lucide-react-native';
import React, { memo, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useHaptics } from '@/hooks/useHaptics';
import { useTheme } from '@/theme/ThemeContext';
import { getShadowFromToken } from '@/utils/shadowHelper';

interface TermsStepProps {
  name: string | undefined;
  biggestChallenge: string | undefined;
  termsAccepted: boolean;
  privacyAccepted: boolean;
  notificationsEnabled: boolean;
  onToggleTerms: () => void;
  onTogglePrivacy: () => void;
  onToggleNotifications: (value: boolean) => void;
  onFinish: () => void;
  canProceed: boolean;
  isSmallScreen: boolean;
  isLoading?: boolean;
}

export const TermsStep = memo<TermsStepProps>(
  ({
    name,
    biggestChallenge,
    termsAccepted,
    privacyAccepted,
    notificationsEnabled,
    onToggleTerms,
    onTogglePrivacy,
    onToggleNotifications,
    onFinish,
    canProceed,
    isSmallScreen,
    isLoading = false,
  }) => {
    const { isDark, toggleTheme, colors } = useTheme();
    const haptics = useHaptics();

    const handleFinish = useCallback(() => {
      if (canProceed && !isLoading) {
        haptics.success();
        onFinish();
      }
    }, [canProceed, isLoading, onFinish, haptics]);

    return (
      <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background.canvas }}>
        <View
          className="flex-1"
          style={{
            maxWidth: isSmallScreen ? '100%' : 560,
            alignSelf: 'center',
            paddingHorizontal: isSmallScreen ? 16 : 24,
          }}
        >
          <TouchableOpacity
            onPress={() => {
              haptics.light();
              toggleTheme();
            }}
            className="absolute top-6 right-4 sm:right-6 w-10 h-10 rounded-full items-center justify-center z-10"
            style={{
              backgroundColor: colors.background.card,
              borderWidth: 1,
              borderColor: colors.border.light,
              ...getShadowFromToken('sm', colors.text.primary),
            }}
            accessibilityRole="button"
            accessibilityLabel={isDark ? 'Alternar para modo claro' : 'Alternar para modo escuro'}
            accessibilityHint="Muda o tema entre claro e escuro"
          >
            <Sun size={20} color={colors.text.primary} />
          </TouchableOpacity>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ alignItems: 'center', paddingTop: 40, paddingBottom: 20 }}
          >
            <View
              className="w-24 h-24 rounded-full items-center justify-center mb-6"
              style={{
                backgroundColor: isDark
                  ? `${colors.status.success}20`
                  : `${colors.status.success}15`,
              }}
            >
              <Check size={48} color={colors.status.success} strokeWidth={3} />
            </View>

            <Text className="text-2xl font-bold mb-4" style={{ color: colors.text.primary }}>
              Tudo pronto, {name?.split(' ')[0]}!
            </Text>

            <Text
              className="text-center mb-8 max-w-[280px]"
              style={{ color: colors.text.secondary }}
            >
              Configurei o app para te ajudar com{' '}
              <Text className="font-bold">{biggestChallenge?.toLowerCase()}</Text>.{'\n'}
              Seu refúgio está preparado.
            </Text>

            {/* Terms & Privacy Acceptance */}
            <View
              className="w-full p-4 rounded-xl mb-4"
              style={{
                backgroundColor: colors.background.card,
                borderWidth: 1,
                borderColor: colors.border.light,
                ...getShadowFromToken('sm', colors.text.primary),
              }}
            >
              <Text className="text-sm font-bold mb-3" style={{ color: colors.text.primary }}>
                📋 Antes de começar
              </Text>

              <TouchableOpacity
                onPress={onToggleTerms}
                className="flex-row items-center justify-between mb-3"
                style={{ minHeight: 44 }}
                accessibilityRole="checkbox"
                accessibilityLabel="Aceitar termos de serviço"
                accessibilityHint="Toque para aceitar ou rejeitar os termos de serviço"
                accessibilityState={{ checked: termsAccepted }}
              >
                <Text className="text-sm flex-1" style={{ color: colors.text.secondary }}>
                  Li e aceito os{' '}
                  <Text className="font-semibold" style={{ color: colors.primary.main }}>
                    Termos de Serviço
                  </Text>
                </Text>
                <Switch
                  value={termsAccepted}
                  onValueChange={onToggleTerms}
                  trackColor={{ false: colors.border.light, true: colors.primary.main }}
                  thumbColor={colors.text.inverse}
                />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={onTogglePrivacy}
                className="flex-row items-center justify-between"
                style={{ minHeight: 44 }}
                accessibilityRole="checkbox"
                accessibilityLabel="Aceitar política de privacidade"
                accessibilityHint="Toque para aceitar ou rejeitar a política de privacidade"
                accessibilityState={{ checked: privacyAccepted }}
              >
                <Text className="text-sm flex-1" style={{ color: colors.text.secondary }}>
                  Li e aceito a{' '}
                  <Text className="font-semibold" style={{ color: colors.primary.main }}>
                    Política de Privacidade
                  </Text>
                </Text>
                <Switch
                  value={privacyAccepted}
                  onValueChange={onTogglePrivacy}
                  trackColor={{ false: colors.border.light, true: colors.primary.main }}
                  thumbColor={colors.text.inverse}
                />
              </TouchableOpacity>
            </View>

            {/* Notifications Toggle */}
            <View
              className="w-full p-4 rounded-xl mb-6"
              style={{
                backgroundColor: colors.background.card,
                borderWidth: 1,
                borderColor: colors.border.light,
                ...getShadowFromToken('sm', colors.text.primary),
              }}
            >
              <View className="flex-row items-center justify-between" style={{ minHeight: 44 }}>
                <View className="flex-1">
                  <Text
                    className="text-sm font-semibold mb-1"
                    style={{ color: colors.text.primary }}
                  >
                    🔔 Notificações
                  </Text>
                  <Text className="text-xs" style={{ color: colors.text.secondary }}>
                    Receba lembretes de autocuidado e dicas personalizadas
                  </Text>
                </View>
                <Switch
                  value={notificationsEnabled}
                  onValueChange={onToggleNotifications}
                  trackColor={{ false: colors.border.light, true: colors.primary.main }}
                  thumbColor={colors.text.inverse}
                />
              </View>
            </View>

            {/* Finish Button */}
            <TouchableOpacity
              onPress={handleFinish}
              disabled={!canProceed || isLoading}
              className="w-full py-4 rounded-2xl flex-row items-center justify-center gap-2"
              style={{
                opacity: canProceed && !isLoading ? 1 : 0.5,
                minHeight: 56,
                ...(canProceed && !isLoading ? getShadowFromToken('lg', colors.primary.main) : {}),
              }}
              activeOpacity={0.9}
              accessibilityRole="button"
              accessibilityLabel="Finalizar onboarding"
              accessibilityHint={
                canProceed
                  ? 'Completa o onboarding e entra no app'
                  : 'Aceite os termos e privacidade para continuar'
              }
              accessibilityState={{ disabled: !canProceed || isLoading }}
            >
              {canProceed && !isLoading ? (
                <LinearGradient
                  colors={
                    isDark
                      ? [colors.primary.main, colors.primary.dark]
                      : [colors.primary.main, colors.primary.light]
                  }
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    top: 0,
                    bottom: 0,
                    borderRadius: 16,
                  }}
                />
              ) : (
                <View
                  style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    top: 0,
                    bottom: 0,
                    borderRadius: 16,
                    backgroundColor: colors.border.light,
                  }}
                />
              )}
              <Text className="text-white font-bold text-base">
                {isLoading ? 'Salvando...' : 'Começar agora'}
              </Text>
              {canProceed && !isLoading && <Check size={18} color={colors.text.inverse} />}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </SafeAreaView>
    );
  }
);

TermsStep.displayName = 'TermsStep';
