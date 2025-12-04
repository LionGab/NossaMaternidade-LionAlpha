// components/onboarding/steps/TimelineStep.tsx
import { LinearGradient } from 'expo-linear-gradient';
import { Minus, Plus, ArrowRight } from 'lucide-react-native';
import React, { memo, useCallback } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useHaptics } from '@/hooks/useHaptics';
import { useTheme } from '@/theme/ThemeContext';
import { UserStage } from '@/types/user';
import { getShadowFromToken } from '@/utils/shadowHelper';

import { OnboardingHeader } from '../OnboardingHeader';
import { StepTitle } from '../StepTitle';

interface TimelineStepProps {
  stage: string | undefined;
  sliderValue: number;
  onChangeSlider: (value: number) => void;
  onNext: (value: string) => void;
  onBack: () => void;
  step: number;
  totalSteps: number;
  progress: number;
  isSmallScreen: boolean;
}

export const TimelineStep = memo<TimelineStepProps>(
  ({
    stage,
    sliderValue,
    onChangeSlider,
    onNext,
    onBack,
    step,
    totalSteps,
    progress,
    isSmallScreen,
  }) => {
    const { isDark, toggleTheme, colors } = useTheme();
    const haptics = useHaptics();

    const isPregnant = stage === UserStage.PREGNANT;
    const maxVal = isPregnant ? 42 : 24; // 42 weeks or 24 months

    const handleDecrease = useCallback(() => {
      haptics.light();
      onChangeSlider(Math.max(1, sliderValue - 1));
    }, [sliderValue, onChangeSlider, haptics]);

    const handleIncrease = useCallback(() => {
      haptics.light();
      onChangeSlider(Math.min(maxVal, sliderValue + 1));
    }, [sliderValue, maxVal, onChangeSlider, haptics]);

    const handleNext = useCallback(() => {
      const value = `${sliderValue} ${isPregnant ? 'semanas' : 'meses'}`;
      onNext(value);
    }, [sliderValue, isPregnant, onNext]);

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
            title="Conta um pouquinho mais..."
            subtitle={
              isPregnant
                ? 'Assim te aviso sobre sintomas comuns dessa semana.'
                : 'Para acompanhar os saltos de desenvolvimento.'
            }
          />

          <View className="flex-1 justify-center items-center">
            <Text
              className="text-5xl sm:text-6xl font-bold mb-2"
              style={{ color: colors.primary.main }}
              accessibilityRole="text"
              accessibilityLabel={`${sliderValue} ${isPregnant ? 'semanas' : 'meses'}`}
            >
              {sliderValue}
            </Text>
            <Text
              className="font-medium mb-8 sm:mb-12 uppercase tracking-widest text-sm"
              style={{ color: colors.text.secondary }}
            >
              {isPregnant ? 'Semanas' : 'Meses'}
            </Text>

            <View className="w-full">
              <Text
                className="text-center text-sm mb-4"
                style={{ color: colors.text.secondary }}
                accessibilityRole="text"
              >
                Use os botões + e - para ajustar
              </Text>
              <View className="flex-row items-center justify-center gap-4">
                <TouchableOpacity
                  onPress={handleDecrease}
                  disabled={sliderValue <= 1}
                  className="w-12 h-12 rounded-full items-center justify-center"
                  style={{
                    backgroundColor: colors.primary.main,
                    opacity: sliderValue <= 1 ? 0.5 : 1,
                  }}
                  accessibilityRole="button"
                  accessibilityLabel="Diminuir valor"
                  accessibilityState={{ disabled: sliderValue <= 1 }}
                >
                  <Minus size={20} color={colors.text.inverse} />
                </TouchableOpacity>

                <View
                  className="flex-1 h-2 rounded-full"
                  style={{ backgroundColor: colors.border.light }}
                >
                  <View
                    className="h-full rounded-full"
                    style={{
                      width: `${(sliderValue / maxVal) * 100}%`,
                      backgroundColor: colors.primary.main,
                    }}
                  />
                </View>

                <TouchableOpacity
                  onPress={handleIncrease}
                  disabled={sliderValue >= maxVal}
                  className="w-12 h-12 rounded-full items-center justify-center"
                  style={{
                    backgroundColor: colors.primary.main,
                    opacity: sliderValue >= maxVal ? 0.5 : 1,
                  }}
                  accessibilityRole="button"
                  accessibilityLabel="Aumentar valor"
                  accessibilityState={{ disabled: sliderValue >= maxVal }}
                >
                  <Plus size={20} color={colors.text.inverse} />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <TouchableOpacity
            onPress={handleNext}
            className="w-full py-4 rounded-2xl flex-row items-center justify-center gap-2"
            style={{
              minHeight: 56,
              ...getShadowFromToken('md', colors.primary.main),
            }}
            activeOpacity={0.9}
            accessibilityRole="button"
            accessibilityLabel="Continuar"
          >
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
            <Text className="text-white font-bold text-base">Continuar</Text>
            <ArrowRight size={18} color={colors.text.inverse} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }
);

TimelineStep.displayName = 'TimelineStep';
