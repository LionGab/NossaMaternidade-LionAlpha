// components/onboarding/OnboardingHeader.tsx
import { ArrowLeft, Sun } from 'lucide-react-native';
import React, { memo } from 'react';
import { View, TouchableOpacity } from 'react-native';

import { useTheme } from '@/theme/ThemeContext';
import { getShadowFromToken } from '@/utils/shadowHelper';

import { OnboardingProgress } from './OnboardingProgress';

interface OnboardingHeaderProps {
  step: number;
  totalSteps: number;
  progress: number;
  onBack: () => void;
  onToggleTheme: () => void;
  isDark: boolean;
}

export const OnboardingHeader = memo<OnboardingHeaderProps>(
  ({ step, totalSteps, progress, onBack, onToggleTheme, isDark }) => {
    const { colors } = useTheme();

    return (
      <View className="flex-row justify-between items-center mb-6">
        {step > 1 ? (
          <TouchableOpacity
            onPress={onBack}
            className="p-2 -ml-2 rounded-full"
            style={{
              backgroundColor: colors.background.card,
              ...getShadowFromToken('sm', colors.text.primary),
            }}
            accessibilityRole="button"
            accessibilityLabel="Voltar para etapa anterior"
            accessibilityHint="Retorna para a pergunta anterior do onboarding"
          >
            <ArrowLeft size={22} color={colors.text.primary} />
          </TouchableOpacity>
        ) : (
          <View className="w-10" />
        )}

        {step < totalSteps && (
          <OnboardingProgress step={step} totalSteps={totalSteps} progress={progress} />
        )}

        <TouchableOpacity
          onPress={onToggleTheme}
          className="w-10 h-10 rounded-full items-center justify-center"
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
          <Sun size={18} color={colors.text.primary} />
        </TouchableOpacity>
      </View>
    );
  }
);

OnboardingHeader.displayName = 'OnboardingHeader';
