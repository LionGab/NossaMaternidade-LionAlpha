// components/onboarding/steps/StageStep.tsx
import { Check } from 'lucide-react-native';
import React, { memo, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useHaptics } from '@/hooks/useHaptics';
import { useTheme } from '@/theme/ThemeContext';
import { UserStage } from '@/types/user';
import { getShadowFromToken } from '@/utils/shadowHelper';

import { OnboardingHeader } from '../OnboardingHeader';
import { StepTitle } from '../StepTitle';

interface StageStepProps {
  stage: string | undefined;
  onSelectStage: (stage: string) => void;
  onNext: () => void;
  onBack: () => void;
  step: number;
  totalSteps: number;
  progress: number;
  name: string | undefined;
  isSmallScreen: boolean;
}

export const StageStep = memo<StageStepProps>(
  ({ stage, onSelectStage, onNext, onBack, step, totalSteps, progress, name, isSmallScreen }) => {
    const { isDark, toggleTheme, colors } = useTheme();
    const haptics = useHaptics();
    const stages = Object.values(UserStage);

    const handleSelect = useCallback(
      (selectedStage: string) => {
        onSelectStage(selectedStage);
        haptics.medium();
        setTimeout(() => onNext(), 200);
      },
      [onSelectStage, onNext, haptics]
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
            title={`Prazer, ${name}! Em que fase você está?`}
            subtitle="Vou adaptar meus conselhos para o seu momento."
          />

          <ScrollView
            className="flex-1"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
            accessible={true}
            accessibilityRole="list"
            accessibilityLabel="Lista de fases da maternidade"
          >
            <View className="space-y-3">
              {stages.map((stageOption) => (
                <TouchableOpacity
                  key={stageOption}
                  onPress={() => handleSelect(stageOption)}
                  className="w-full p-4 sm:p-5 rounded-2xl flex-row items-center justify-between"
                  style={{
                    borderWidth: 2,
                    borderColor: stage === stageOption ? colors.primary.main : colors.border.light,
                    backgroundColor:
                      stage === stageOption
                        ? isDark
                          ? `${colors.primary.main}20`
                          : `${colors.primary.light}40`
                        : colors.background.card,
                    minHeight: isSmallScreen ? 56 : 64,
                    ...getShadowFromToken(stage === stageOption ? 'md' : 'sm', colors.text.primary),
                  }}
                  activeOpacity={0.8}
                  accessibilityRole="button"
                  accessibilityLabel={stageOption}
                  accessibilityHint="Seleciona esta fase da maternidade"
                  accessibilityState={{ selected: stage === stageOption }}
                >
                  <Text
                    className="font-semibold text-base sm:text-lg"
                    style={{
                      color: stage === stageOption ? colors.primary.main : colors.text.primary,
                      flex: 1,
                    }}
                  >
                    {stageOption}
                  </Text>
                  <View
                    className="w-6 h-6 rounded-full items-center justify-center"
                    style={{
                      borderWidth: 2,
                      borderColor:
                        stage === stageOption ? colors.primary.main : colors.border.light,
                      backgroundColor: stage === stageOption ? colors.primary.main : 'transparent',
                    }}
                    accessible={false}
                  >
                    {stage === stageOption && (
                      <Check size={14} color={colors.text.inverse} strokeWidth={3} />
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      </SafeAreaView>
    );
  }
);

StageStep.displayName = 'StageStep';
