// components/onboarding/steps/NameStep.tsx
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowRight } from 'lucide-react-native';
import React, { memo, useCallback } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '@/theme/ThemeContext';
import { getShadowFromToken } from '@/utils/shadowHelper';

import { OnboardingHeader } from '../OnboardingHeader';
import { StepTitle } from '../StepTitle';

interface NameStepProps {
  name: string | undefined;
  onChangeName: (name: string) => void;
  onNext: () => void;
  onBack: () => void;
  step: number;
  totalSteps: number;
  progress: number;
  isSmallScreen: boolean;
}

export const NameStep = memo<NameStepProps>(
  ({ name, onChangeName, onNext, onBack, step, totalSteps, progress, isSmallScreen }) => {
    const { isDark, toggleTheme, colors } = useTheme();

    const handleSubmit = useCallback(() => {
      if (name?.trim()) {
        onNext();
      }
    }, [name, onNext]);

    return (
      <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background.canvas }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1"
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
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
              title="Como você gosta de ser chamada?"
              subtitle="Quero que nossa conversa seja íntima, como amigas."
            />

            <View className="flex-1 justify-center">
              <View
                style={{
                  backgroundColor: colors.background.card,
                  borderWidth: 2,
                  borderColor: name?.trim() ? colors.primary.main : colors.border.light,
                  borderRadius: 16,
                  ...getShadowFromToken('sm', colors.text.primary),
                }}
              >
                <TextInput
                  autoFocus
                  placeholder="Seu nome ou apelido"
                  placeholderTextColor={colors.text.tertiary}
                  value={name || ''}
                  onChangeText={onChangeName}
                  className="w-full px-5 py-5 sm:py-6 text-base sm:text-lg"
                  style={{
                    color: colors.text.primary,
                    minHeight: isSmallScreen ? 52 : 56,
                  }}
                  accessibilityLabel="Campo de texto para seu nome ou apelido"
                  accessibilityHint="Digite como você gosta de ser chamada"
                  accessibilityRole="text"
                  returnKeyType="done"
                  onSubmitEditing={handleSubmit}
                />
              </View>
            </View>

            <TouchableOpacity
              onPress={handleSubmit}
              disabled={!name?.trim()}
              className="w-full py-4 rounded-2xl flex-row items-center justify-center gap-2"
              style={{
                opacity: name?.trim() ? 1 : 0.5,
                minHeight: 56,
                ...(name?.trim() ? getShadowFromToken('md', colors.primary.main) : {}),
              }}
              activeOpacity={0.9}
              accessibilityRole="button"
              accessibilityLabel="Continuar"
              accessibilityHint={
                name?.trim() ? 'Avança para a próxima etapa' : 'Preencha seu nome para continuar'
              }
              accessibilityState={{ disabled: !name?.trim() }}
            >
              {name?.trim() ? (
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
              <Text className="text-white font-bold text-base">Continuar</Text>
              {name?.trim() && <ArrowRight size={18} color={colors.text.inverse} />}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }
);

NameStep.displayName = 'NameStep';
