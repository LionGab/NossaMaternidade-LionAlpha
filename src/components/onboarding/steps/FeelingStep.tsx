// components/onboarding/steps/FeelingStep.tsx
import React, { memo, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '@/theme/ThemeContext';
import { Tokens } from '@/theme/tokens';
import { UserEmotion } from '@/types/user';

import { OnboardingHeader } from '../OnboardingHeader';
import { StepTitle } from '../StepTitle';

interface FeelingStepProps {
  currentFeeling: string | undefined;
  onSelectFeeling: (feeling: string) => void;
  onNext: () => void;
  onBack: () => void;
  step: number;
  totalSteps: number;
  progress: number;
  isSmallScreen: boolean;
}

export const FeelingStep = memo<FeelingStepProps>(
  ({
    currentFeeling,
    onSelectFeeling,
    onNext,
    onBack,
    step,
    totalSteps,
    progress,
    isSmallScreen,
  }) => {
    const { isDark, toggleTheme, colors } = useTheme();
    const feelings = Object.values(UserEmotion);

    const handleSelect = useCallback(
      (feeling: string) => {
        onSelectFeeling(feeling);
        setTimeout(() => onNext(), 200);
      },
      [onSelectFeeling, onNext]
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
            title="Como você está se sentindo hoje?"
            subtitle="Seja sincera. Aqui é um lugar livre de julgamentos."
          />

          <ScrollView
            className="flex-1"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              gap: Tokens.spacing['3'],
              paddingBottom: Tokens.spacing['5'],
            }}
            accessible={true}
            accessibilityRole="list"
            accessibilityLabel="Lista de sentimentos"
          >
            {feelings.map((feeling) => (
              <TouchableOpacity
                key={feeling}
                onPress={() => handleSelect(feeling)}
                className="px-5 sm:px-6 py-3 rounded-full"
                style={{
                  borderWidth: 1,
                  borderColor:
                    currentFeeling === feeling ? colors.secondary.main : colors.border.light,
                  backgroundColor:
                    currentFeeling === feeling ? colors.secondary.main : colors.background.card,
                  minHeight: isSmallScreen ? 40 : 44,
                }}
                activeOpacity={0.9}
                accessibilityRole="button"
                accessibilityLabel={feeling}
                accessibilityHint="Seleciona este sentimento"
                accessibilityState={{ selected: currentFeeling === feeling }}
              >
                <Text
                  className="text-sm sm:text-base"
                  style={{
                    color:
                      currentFeeling === feeling
                        ? isDark
                          ? '#FFFFFF'
                          : '#FFFFFF'
                        : colors.text.primary,
                  }}
                >
                  {feeling}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </SafeAreaView>
    );
  }
);

FeelingStep.displayName = 'FeelingStep';
