// components/onboarding/steps/WelcomeStep.tsx
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowRight, Sun } from 'lucide-react-native';
import React, { memo } from 'react';
import { View, Text, TouchableOpacity, Platform, KeyboardAvoidingView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '@/theme/ThemeContext';
import { Tokens } from '@/theme/tokens';
import { getShadowFromToken } from '@/utils/shadowHelper';

interface WelcomeStepProps {
  onNext: () => void;
  isSmallScreen: boolean;
}

export const WelcomeStep = memo<WelcomeStepProps>(({ onNext, isSmallScreen }) => {
  const { isDark, toggleTheme, colors } = useTheme();

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.background.canvas,
        ...(Platform.OS === 'web' ? { width: '100%' } : {}),
      }}
    >
      <SafeAreaView
        className="flex-1"
        style={{ backgroundColor: colors.background.canvas }}
        edges={['top', 'bottom']}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1"
          style={{ width: '100%' }}
        >
          <View
            className="flex-1"
            style={{
              maxWidth: isSmallScreen ? '100%' : 560,
              alignSelf: 'center',
              paddingHorizontal: isSmallScreen ? 16 : 24,
            }}
          >
            {/* Theme Toggle */}
            <View className="absolute top-6 right-6 z-10">
              <TouchableOpacity
                onPress={toggleTheme}
                className="w-10 h-10 rounded-full items-center justify-center"
                style={{
                  backgroundColor: colors.background.card,
                  borderWidth: 1,
                  borderColor: colors.border.light,
                  ...getShadowFromToken('sm', colors.text.primary),
                }}
                accessibilityRole="button"
                accessibilityLabel={
                  isDark ? 'Alternar para modo claro' : 'Alternar para modo escuro'
                }
              >
                <Sun size={18} color={colors.text.primary} />
              </TouchableOpacity>
            </View>

            <View className="flex-1" style={{ width: '100%', position: 'relative' }}>
              {/* Title - Nossa Maternidade (Topo esquerdo) */}
              <View
                style={{
                  position: 'absolute',
                  top: isSmallScreen ? 60 : 80,
                  left: isSmallScreen ? 16 : 24,
                  right: isSmallScreen ? 16 : 24,
                  zIndex: 10,
                  flex: 1,
                }}
              >
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: Tokens.spacing['3'],
                    marginBottom: Tokens.spacing['3'],
                  }}
                >
                  <Image
                    source={require('../../../../assets/logo.png')}
                    style={{
                      width: isSmallScreen ? 40 : 48,
                      height: isSmallScreen ? 40 : 48,
                      borderRadius: 10,
                    }}
                    contentFit="cover"
                    transition={200}
                    accessibilityLabel="Logo Nossa Maternidade"
                  />
                  <Sun size={isSmallScreen ? 20 : 24} color={colors.text.primary} />
                </View>
                <Text
                  className="text-3xl sm:text-4xl font-bold"
                  style={{
                    color: colors.text.primary,
                    marginBottom: 4,
                    fontSize: isSmallScreen ? 28 : 32,
                  }}
                  accessibilityRole="header"
                  accessibilityLabel="Nossa Maternidade"
                >
                  Nossa
                </Text>
                <Text
                  className="text-3xl sm:text-4xl font-bold"
                  style={{
                    color: colors.text.primary,
                    fontSize: isSmallScreen ? 28 : 32,
                  }}
                >
                  Maternidade
                </Text>
              </View>

              {/* Conteúdo no canto inferior esquerdo */}
              <View
                style={{
                  position: 'absolute',
                  bottom: isSmallScreen ? 100 : 128,
                  left: isSmallScreen ? 16 : 24,
                  right: isSmallScreen ? 16 : 24,
                  width: 'auto',
                  maxWidth: '100%',
                  flex: 1,
                }}
              >
                {/* Quote */}
                <Text
                  className="text-xl sm:text-2xl font-medium mb-8"
                  style={{
                    color: colors.text.primary,
                    lineHeight: Tokens.typography.lineHeights['2xl'],
                    fontSize: isSmallScreen ? 18 : 22,
                  }}
                  accessibilityRole="text"
                  accessibilityLabel="Você é forte. Mesmo nos dias em que não parece."
                >
                  Você é forte.{'\n'}Mesmo nos dias em que não parece.
                </Text>

                <TouchableOpacity
                  onPress={onNext}
                  className="w-full py-4 rounded-2xl shadow-lg active:scale-95 flex-row items-center justify-center gap-3"
                  style={{
                    paddingHorizontal: 24,
                    minHeight: 56,
                    ...getShadowFromToken('lg', colors.primary.main),
                  }}
                  activeOpacity={0.9}
                  accessibilityRole="button"
                  accessibilityLabel="Começar com a Nath"
                  accessibilityHint="Inicia o processo de onboarding"
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
                  <ArrowRight size={20} color={colors.text.inverse} />
                  <Text className="text-white font-bold text-base sm:text-lg">
                    Começar com a Nath
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
});

WelcomeStep.displayName = 'WelcomeStep';
