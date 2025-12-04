/**
 * OnboardingStep2 - Nome da usuária
 * Design System: Ocean Blue + Coral (Web Reference)
 * Mobile-first: iOS/Android optimized
 */

import { LinearGradient } from 'expo-linear-gradient';
import { User, ArrowRight } from 'lucide-react-native';
import React, { useState } from 'react';
import { View, StyleSheet, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Box } from '@/components/primitives/Box';
import { HapticButton } from '@/components/primitives/HapticButton';
import { Heading } from '@/components/primitives/Heading';
import { Text } from '@/components/primitives/Text';
import { useTheme } from '@/theme';
import { Tokens } from '@/theme/tokens';

interface OnboardingStep2Props {
  onNext: (name: string) => void;
}

export default function OnboardingStep2({ onNext }: OnboardingStep2Props) {
  const [name, setName] = useState('');
  const { colors, isDark } = useTheme();

  const handleNext = () => {
    if (name.trim()) {
      onNext(name.trim());
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background.canvas }]}
      edges={['top', 'bottom']}
    >
      {/* Background Gradient */}
      <LinearGradient
        colors={
          isDark
            ? ([colors.background.canvas, colors.background.card, colors.background.elevated] as [
                string,
                string,
                ...string[],
              ])
            : ([colors.raw.primary[50], colors.raw.neutral[100], colors.raw.neutral[0]] as [
                string,
                string,
                ...string[],
              ])
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
                  backgroundColor: step <= 2 ? colors.primary.main : colors.border.light,
                  width: step === 2 ? 24 : 8,
                },
              ]}
            />
          ))}
        </View>
        <Text
          size="xs"
          color="tertiary"
          style={{ textAlign: 'center', marginTop: Tokens.spacing['2'] }}
        >
          Pergunta 1 de 8
        </Text>
      </Box>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        {/* Content */}
        <Box style={styles.content}>
          {/* Icon - Reduzido */}
          <View
            style={[
              styles.iconCircle,
              {
                backgroundColor: isDark ? colors.raw.primary[900] + '20' : colors.raw.primary[50],
                borderColor: colors.primary.main,
              },
            ]}
          >
            <User size={36} color={colors.primary.main} strokeWidth={2} />
          </View>

          {/* Title - Tamanho reduzido */}
          <Heading
            level="h3"
            style={{
              fontSize: Tokens.typography.sizes['3xl'], // 28pt (was 32pt)
              marginBottom: Tokens.spacing['2'],
              textAlign: 'center',
            }}
          >
            Como você gosta de ser chamada?
          </Heading>

          {/* Subtitle */}
          <Text
            size="sm"
            color="secondary"
            style={{
              marginBottom: Tokens.spacing['6'],
              textAlign: 'center',
              lineHeight: Tokens.typography.lineHeights.md,
            }}
          >
            Quero que nossa conversa seja íntima,{'\n'}
            como amigas. 💛
          </Text>

          {/* Input Field - Premium (Web Reference) */}
          <View
            style={[
              styles.inputContainer,
              {
                backgroundColor: colors.background.input,
                borderColor: name.trim() ? colors.primary.main : colors.border.medium,
              },
            ]}
          >
            <TextInput
              accessibilityLabel="Text input field"
              value={name}
              onChangeText={setName}
              placeholder="Seu nome ou apelido"
              placeholderTextColor={colors.text.tertiary}
              style={[
                styles.input,
                {
                  color: colors.text.primary,
                  fontSize: Tokens.typography.sizes.lg, // 18pt
                },
              ]}
              autoFocus
              autoCapitalize="words"
              autoCorrect={false}
              returnKeyType="next"
              onSubmitEditing={handleNext}
            />
          </View>

          {/* Example names */}
          <View style={styles.examplesContainer}>
            <Text size="xs" color="tertiary" style={{ marginBottom: Tokens.spacing['2'] }}>
              Exemplos:
            </Text>
            <View style={styles.chipContainer}>
              {['Ana', 'Mari', 'Lu', 'Babi'].map((example) => (
                <HapticButton
                  key={example}
                  variant="ghost"
                  size="sm"
                  onPress={() => setName(example)}
                  style={StyleSheet.flatten([
                    styles.chip,
                    {
                      backgroundColor: isDark ? colors.background.elevated : colors.raw.primary[50],
                      borderColor: colors.border.light,
                    },
                  ])}
                >
                  <Text size="sm" style={{ color: colors.primary.main }}>
                    {example}
                  </Text>
                </HapticButton>
              ))}
            </View>
          </View>
        </Box>

        {/* Bottom CTA - Premium Button (Web Reference) */}
        <Box px="6" pb="6" style={{ paddingBottom: Tokens.spacing['8'] }}>
          <HapticButton
            variant="primary"
            size="lg"
            onPress={handleNext}
            disabled={!name.trim()}
            style={{
              borderRadius: Tokens.radius.input, // 12px rounded
              paddingVertical: Tokens.spacing['4'],
              opacity: name.trim() ? 1 : 0.5,
              ...Tokens.shadows.card,
            }}
          >
            <View style={styles.buttonContent}>
              <Text
                size="lg"
                weight="bold"
                style={{ color: colors.text.inverse, marginRight: Tokens.spacing['2'] }}
              >
                Continuar
              </Text>
              <ArrowRight size={20} color={colors.text.inverse} />
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
            Você pode mudar depois nas configurações
          </Text>
        </Box>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoid: {
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
  iconCircle: {
    width: 96, // Reduzido de 120
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Tokens.spacing['4'], // Reduzido de 6
    borderWidth: 2,
  },
  inputContainer: {
    width: '100%',
    borderWidth: 2,
    borderRadius: Tokens.radius.input, // 12px
    paddingHorizontal: Tokens.spacing['4'],
    marginBottom: Tokens.spacing['4'],
    ...Tokens.shadows.soft,
  },
  input: {
    height: 56, // WCAG touch target
    fontWeight: '600',
  },
  examplesContainer: {
    width: '100%',
    marginTop: Tokens.spacing['2'],
  },
  chipContainer: {
    flexDirection: 'row',
    gap: Tokens.spacing['2'],
    flexWrap: 'wrap',
  },
  chip: {
    borderRadius: Tokens.radius.pill, // 9999px
    borderWidth: 1,
    paddingHorizontal: Tokens.spacing['3'],
    paddingVertical: Tokens.spacing['1.5'],
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
