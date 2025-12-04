// components/onboarding/steps/NeedStep.tsx
import { Brain, Baby, Heart, Users } from 'lucide-react-native';
import React, { memo, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '@/theme/ThemeContext';
import { UserNeed } from '@/types/user';
import { getShadowFromToken } from '@/utils/shadowHelper';

import { OnboardingHeader } from '../OnboardingHeader';
import { StepTitle } from '../StepTitle';

interface NeedStepProps {
  primaryNeed: string | undefined;
  onSelectNeed: (need: string) => void;
  onNext: () => void;
  onBack: () => void;
  step: number;
  totalSteps: number;
  progress: number;
  isSmallScreen: boolean;
}

export const NeedStep = memo<NeedStepProps>(
  ({ primaryNeed, onSelectNeed, onNext, onBack, step, totalSteps, progress, isSmallScreen }) => {
    const { isDark, toggleTheme, colors } = useTheme();

    const needs = [
      {
        val: UserNeed.CHAT,
        icon: <Brain size={20} color={colors.text.inverse} />,
        title: 'Desabafar',
        sub: 'Conversar com alguém que entenda',
      },
      {
        val: UserNeed.LEARN,
        icon: <Baby size={20} color={colors.text.inverse} />,
        title: 'Aprender',
        sub: 'Dicas práticas sobre o bebê',
      },
      {
        val: UserNeed.CALM,
        icon: <Heart size={20} color={colors.text.inverse} />,
        title: 'Acalmar',
        sub: 'Respirar e diminuir ansiedade',
      },
      {
        val: UserNeed.CONNECT,
        icon: <Users size={20} color={colors.text.inverse} />,
        title: 'Conectar',
        sub: 'Ver relatos de outras mães',
      },
    ];

    const handleSelect = useCallback(
      (need: string) => {
        onSelectNeed(need);
        setTimeout(() => onNext(), 200);
      },
      [onSelectNeed, onNext]
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
            title="O que você mais precisa AGORA?"
            subtitle="Vou configurar sua tela inicial baseada nisso."
          />

          <ScrollView
            className="flex-1"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
            accessible={true}
            accessibilityRole="list"
            accessibilityLabel="Lista de necessidades"
          >
            {needs.map((n) => (
              <TouchableOpacity
                key={n.val}
                onPress={() => handleSelect(n.val)}
                className="p-4 sm:p-5 rounded-2xl mb-3 flex-row items-center gap-4"
                style={[
                  {
                    borderWidth: 1,
                    borderColor: primaryNeed === n.val ? colors.primary.main : colors.border.light,
                    backgroundColor:
                      primaryNeed === n.val ? colors.primary.main : colors.background.card,
                    minHeight: isSmallScreen ? 64 : 72,
                  },
                  primaryNeed === n.val ? getShadowFromToken('lg', colors.primary.main) : {},
                ]}
                activeOpacity={0.9}
                accessibilityRole="button"
                accessibilityLabel={`${n.title}: ${n.sub}`}
                accessibilityHint="Seleciona esta necessidade"
                accessibilityState={{ selected: primaryNeed === n.val }}
              >
                <View
                  className="w-12 h-12 rounded-full items-center justify-center"
                  style={{
                    backgroundColor:
                      primaryNeed === n.val ? `${colors.text.inverse}33` : colors.primary.light,
                  }}
                  accessible={false}
                >
                  {React.cloneElement(n.icon, {
                    color: primaryNeed === n.val ? colors.text.inverse : colors.primary.main,
                  })}
                </View>
                <View className="flex-1">
                  <Text
                    className="font-bold text-base sm:text-lg"
                    style={{
                      color: primaryNeed === n.val ? colors.text.inverse : colors.text.primary,
                    }}
                    accessibilityHint={`${n.title}: ${n.sub}`}
                  >
                    {n.title}
                  </Text>
                  <Text
                    className="text-xs sm:text-sm"
                    style={{
                      color:
                        primaryNeed === n.val ? `${colors.text.inverse}B3` : colors.text.secondary,
                    }}
                  >
                    {n.sub}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </SafeAreaView>
    );
  }
);

NeedStep.displayName = 'NeedStep';
