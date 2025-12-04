// components/onboarding/steps/SupportStep.tsx
import { Users, Heart } from 'lucide-react-native';
import React, { memo, useCallback } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '@/theme/ThemeContext';
import { UserSupport } from '@/types/user';

import { OnboardingHeader } from '../OnboardingHeader';
import { StepTitle } from '../StepTitle';

interface SupportStepProps {
  supportLevel: string | undefined;
  onSelectSupport: (support: string) => void;
  onNext: () => void;
  onBack: () => void;
  step: number;
  totalSteps: number;
  progress: number;
  isSmallScreen: boolean;
}

export const SupportStep = memo<SupportStepProps>(
  ({
    supportLevel,
    onSelectSupport,
    onNext,
    onBack,
    step,
    totalSteps,
    progress,
    isSmallScreen,
  }) => {
    const { isDark, toggleTheme, colors } = useTheme();

    const options = [
      {
        val: UserSupport.HIGH,
        icon: <Users size={24} color={colors.text.primary} />,
        text: 'Tenho, graças a Deus',
      },
      {
        val: UserSupport.MEDIUM,
        icon: <Users size={24} color={colors.text.primary} />,
        text: 'Às vezes/Pouca',
      },
      {
        val: UserSupport.LOW,
        icon: (
          <Heart
            size={24}
            color={colors.secondary.main}
            strokeWidth={2.5}
            fill={isDark ? `${colors.secondary.main}40` : `${colors.secondary.main}20`}
          />
        ),
        text: 'Me sinto muito sozinha',
      },
    ];

    const handleSelect = useCallback(
      (support: string) => {
        onSelectSupport(support);
        setTimeout(() => onNext(), 200);
      },
      [onSelectSupport, onNext]
    );

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
          <OnboardingHeader
            step={step}
            totalSteps={totalSteps}
            progress={progress}
            onBack={onBack}
            onToggleTheme={toggleTheme}
            isDark={isDark}
          />

          <StepTitle
            title="Você tem rede de apoio?"
            subtitle="Para eu saber o quanto posso te exigir ou te acolher."
          />

          <View className="flex-1">
            {options.map((opt) => (
              <TouchableOpacity
                key={opt.val}
                onPress={() => handleSelect(opt.val)}
                className="p-5 sm:p-6 rounded-2xl mb-4 flex-row items-center gap-4"
                style={{
                  borderWidth: 2,
                  borderColor: supportLevel === opt.val ? colors.primary.main : colors.border.light,
                  backgroundColor:
                    supportLevel === opt.val
                      ? isDark
                        ? `${colors.primary.main}20`
                        : `${colors.primary.light}40`
                      : colors.background.card,
                  minHeight: isSmallScreen ? 64 : 72,
                }}
                activeOpacity={0.9}
                accessibilityRole="button"
                accessibilityLabel={opt.text}
                accessibilityHint="Seleciona este nível de apoio"
                accessibilityState={{ selected: supportLevel === opt.val }}
              >
                <View
                  className="p-3 rounded-full"
                  style={{
                    backgroundColor:
                      supportLevel === opt.val
                        ? isDark
                          ? `${colors.primary.main}20`
                          : `${colors.primary.light}40`
                        : isDark
                          ? colors.background.elevated
                          : colors.background.card,
                  }}
                  accessible={false}
                >
                  {React.cloneElement(opt.icon, {
                    color:
                      supportLevel === opt.val
                        ? isDark
                          ? colors.primary.main
                          : colors.primary.dark
                        : opt.val === UserSupport.LOW
                          ? colors.secondary.main
                          : colors.text.primary,
                    strokeWidth: opt.val === UserSupport.LOW ? 2.5 : 2,
                  })}
                </View>
                <Text
                  className="font-bold text-base sm:text-lg flex-1"
                  style={{
                    color: supportLevel === opt.val ? colors.primary.main : colors.text.primary,
                  }}
                >
                  {opt.text}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </SafeAreaView>
    );
  }
);

SupportStep.displayName = 'SupportStep';
