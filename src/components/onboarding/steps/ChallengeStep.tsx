// components/onboarding/steps/ChallengeStep.tsx
import React, { memo, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '@/theme/ThemeContext';
import { UserChallenge } from '@/types/user';

import { OnboardingHeader } from '../OnboardingHeader';
import { StepTitle } from '../StepTitle';

interface ChallengeStepProps {
  biggestChallenge: string | undefined;
  onSelectChallenge: (challenge: string) => void;
  onNext: () => void;
  onBack: () => void;
  step: number;
  totalSteps: number;
  progress: number;
  isSmallScreen: boolean;
}

export const ChallengeStep = memo<ChallengeStepProps>(
  ({
    biggestChallenge,
    onSelectChallenge,
    onNext,
    onBack,
    step,
    totalSteps,
    progress,
    isSmallScreen,
  }) => {
    const { isDark, toggleTheme, colors } = useTheme();
    const challenges = Object.values(UserChallenge);

    const handleSelect = useCallback(
      (challenge: string) => {
        onSelectChallenge(challenge);
        setTimeout(() => onNext(), 200);
      },
      [onSelectChallenge, onNext]
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
            title="O que mais pesa no seu coração agora?"
            subtitle="Vou priorizar conteúdos para te ajudar nisso."
          />

          <ScrollView
            className="flex-1"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
            accessible={true}
            accessibilityRole="list"
            accessibilityLabel="Lista de desafios"
          >
            <View className="space-y-3">
              {challenges.map((challenge) => (
                <TouchableOpacity
                  key={challenge}
                  onPress={() => handleSelect(challenge)}
                  className="w-full p-4 sm:p-5 rounded-xl"
                  style={{
                    backgroundColor:
                      biggestChallenge === challenge ? colors.text.primary : colors.background.card,
                    borderWidth: 1,
                    borderColor:
                      biggestChallenge === challenge ? colors.text.primary : 'transparent',
                    minHeight: isSmallScreen ? 52 : 56,
                  }}
                  activeOpacity={0.9}
                  accessibilityRole="button"
                  accessibilityLabel={challenge}
                  accessibilityHint="Seleciona este desafio"
                  accessibilityState={{ selected: biggestChallenge === challenge }}
                >
                  <Text
                    className="text-base sm:text-lg"
                    style={{
                      color:
                        biggestChallenge === challenge
                          ? isDark
                            ? '#FFFFFF'
                            : '#FFFFFF'
                          : colors.text.primary,
                    }}
                  >
                    {challenge}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      </SafeAreaView>
    );
  }
);

ChallengeStep.displayName = 'ChallengeStep';
