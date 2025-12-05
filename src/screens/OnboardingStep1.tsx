/**
 * OnboardingStep1 - Boas-vindas Premium
 * Design System: Ocean Blue + Coral (Web Reference)
 * Mobile-first: iOS/Android optimized
 */

import { LinearGradient } from 'expo-linear-gradient';
import { Heart } from 'lucide-react-native';
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Box } from '@/components/atoms/Box';
import { HapticButton } from '@/components/atoms/HapticButton';
import { Heading } from '@/components/atoms/Heading';
import { Text } from '@/components/atoms/Text';
import { useTheme } from '@/theme';
import { Tokens } from '@/theme/tokens';

interface OnboardingStep1Props {
  onNext: () => void;
}

export default function OnboardingStep1({ onNext }: OnboardingStep1Props) {
  const { colors, isDark } = useTheme();

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background.canvas }]}
      edges={['top', 'bottom']}
    >
      {/* Background Gradient */}
      <LinearGradient
        colors={
          isDark
            ? (colors.background.gradient.primary as [string, string, ...string[]])
            : ([
                colors.background.gradient.primary[0],
                colors.background.gradient.primary[1],
                colors.background.card,
              ] as [string, string, ...string[]])
        }
        style={StyleSheet.absoluteFill}
      />

      {/* Progress Indicator */}
      <Box px="6" pt="4">
        <View style={styles.progressContainer}>
          {[1, 2, 3, 4, 5, 6, 7, 8].map((step) => (
            <View
              key={step}
              style={[
                styles.progressDot,
                {
                  backgroundColor: step === 1 ? colors.primary.main : colors.border.light,
                  width: step === 1 ? 24 : 8,
                },
              ]}
            />
          ))}
        </View>
      </Box>

      {/* Content */}
      <Box style={styles.content}>
        {/* Illustration Circle - Reduzido */}
        <View
          style={[
            styles.illustrationCircle,
            {
              backgroundColor: isDark
                ? `${colors.primary.main}1A` // 0.1 opacity
                : `${colors.primary.main}0D`, // 0.05 opacity
              borderColor: colors.primary.main,
            },
          ]}
        >
          <Text style={styles.emoji}>🤱</Text>
        </View>

        {/* Title - Tamanho reduzido */}
        <Heading
          level="h2"
          style={{
            fontSize: Tokens.typography.sizes['3xl'], // 28pt (was 36pt)
            marginBottom: Tokens.spacing['3'],
            textAlign: 'center',
            letterSpacing: Tokens.typography.letterSpacing.tight,
          }}
        >
          Oi, que bom que você chegou 💙
        </Heading>

        {/* Quote - Ocean Blue */}
        <Text
          size="md"
          style={{
            color: colors.primary.main,
            fontStyle: 'italic',
            marginBottom: Tokens.spacing['3'],
            textAlign: 'center',
            fontWeight: '600',
          }}
        >
          "Aqui, você não precisa fingir que está tudo bem."
        </Text>

        {/* Description */}
        <Text
          size="sm"
          color="secondary"
          style={{
            marginBottom: Tokens.spacing['6'],
            textAlign: 'center',
            lineHeight: Tokens.typography.lineHeights.md,
            paddingHorizontal: Tokens.spacing['6'],
          }}
        >
          Eu sou a{' '}
          <Text weight="bold" style={{ color: colors.text.primary }}>
            NathIA
          </Text>
          .{'\n'}
          Quero criar um espaço seguro para você.{'\n'}
          Vamos conversar rapidinho?
        </Text>
      </Box>

      {/* Bottom CTA - Premium Button (Web Reference) */}
      <Box px="6" pb="6" style={{ paddingBottom: Tokens.spacing['8'] }}>
        <HapticButton
          variant="primary"
          size="lg"
          onPress={onNext}
          style={{
            borderRadius: Tokens.radius.input, // 12px rounded
            paddingVertical: Tokens.spacing['4'],
            ...Tokens.shadows.premium, // Ocean blue shadow
          }}
        >
          <View style={styles.buttonContent}>
            <Heart size={20} color={colors.text.inverse} fill={colors.text.inverse} />
            <Text
              size="lg"
              weight="bold"
              style={{ color: colors.text.inverse, marginLeft: Tokens.spacing['2'] }}
            >
              Começar agora
            </Text>
          </View>
        </HapticButton>

        {/* Subtext */}
        <Text
          size="xs"
          color="tertiary"
          style={{
            marginTop: Tokens.spacing['3'],
            textAlign: 'center',
          }}
        >
          São apenas 8 perguntas rápidas. Leva menos de 2 minutos.
        </Text>
      </Box>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 8,
  },
  progressDot: {
    height: 8,
    borderRadius: 4,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Tokens.spacing['6'],
  },
  illustrationCircle: {
    width: 140, // Reduzido de 200
    height: 140,
    borderRadius: 70,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Tokens.spacing['6'], // Reduzido de 8
    borderWidth: 2,
  },
  emoji: {
    fontSize: 56, // Reduzido de 80
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
