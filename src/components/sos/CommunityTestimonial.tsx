/**
 * CommunityTestimonial - Depoimento da comunidade para SOS Mãe
 *
 * Exibe depoimentos de outras mães que passaram por sentimentos similares,
 * criando sensação de acolhimento e comunidade.
 * Referência: app-redesign-studio-ab40635e/src/components/sos/CommunityTestimonial.tsx
 * Adaptado para React Native com design system atual.
 */

import { Users, Heart } from 'lucide-react-native';
import React from 'react';
import { View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

import { Box } from '@/components/atoms/Box';
import { Text } from '@/components/atoms/Text';
import { useTheme } from '@/theme';
import { Tokens, ColorTokens } from '@/theme/tokens';
import type { CommunityTestimonial as TestimonialType, SOSStats } from '@/types/sos';
import { SENTIMENT_OPTIONS } from '@/types/sos';

interface CommunityTestimonialProps {
  testimonial: TestimonialType;
  stats?: SOSStats;
  sentiment: string;
}

export function CommunityTestimonial({
  testimonial,
  stats,
  sentiment,
}: CommunityTestimonialProps) {
  const { colors, isDark } = useTheme();
  const sentimentOption = SENTIMENT_OPTIONS.find((s) => s.type === sentiment);
  // TODO: Integrar com stats reais quando disponível
  const similarCount = 0; // Placeholder até integração com stats

  return (
    <Animated.View entering={FadeIn.delay(300).duration(400)}>
      <Box
        p="6"
        gap="4"
        style={{
          borderRadius: Tokens.radius['3xl'],
          borderWidth: 2,
          borderColor: isDark ? ColorTokens.secondary[700] : ColorTokens.secondary[200],
          overflow: 'hidden',
          ...Tokens.shadows.xl,
        }}
      >
        <LinearGradient
          colors={
            isDark
              ? [ColorTokens.secondary[900], ColorTokens.secondary[800]]
              : [ColorTokens.secondary[50], ColorTokens.secondary[100]]
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            position: 'absolute',
            inset: 0,
          }}
        />

        {/* Header */}
        <Box direction="row" align="center" gap="2">
          <Box
            p="2"
            style={{
              borderRadius: Tokens.radius.xl,
              backgroundColor: isDark ? `${ColorTokens.secondary[600]}40` : `${ColorTokens.secondary[500]}20`,
            }}
          >
            <Heart
              size={20}
              color={isDark ? ColorTokens.secondary[300] : ColorTokens.secondary[600]}
              fill={isDark ? ColorTokens.secondary[300] : ColorTokens.secondary[600]}
            />
          </Box>
          <Text size="lg" weight="bold" style={{ color: colors.text.primary }}>
            Você não está sozinha
          </Text>
        </Box>

        {/* Estatística */}
        {similarCount > 0 && (
          <Box
            p="4"
            style={{
              backgroundColor: isDark ? `${ColorTokens.neutral[0]}15` : `${ColorTokens.neutral[0]}60`,
              borderRadius: Tokens.radius.xl,
            }}
          >
            <Box direction="row" align="center" gap="2" mb="2">
              <Users
                size={16}
                color={isDark ? ColorTokens.secondary[300] : ColorTokens.secondary[600]}
              />
              <Text size="sm" weight="semibold" style={{ color: colors.text.primary }}>
                {similarCount.toLocaleString()} mães
              </Text>
            </Box>
            <Text size="xs" color="secondary" style={{ color: colors.text.secondary }}>
              registraram {sentimentOption?.label.toLowerCase()} hoje. Você está em boa companhia.
            </Text>
          </Box>
        )}

        {/* Depoimento */}
        <Box
          p="4"
          style={{
            backgroundColor: isDark ? `${ColorTokens.neutral[0]}20` : `${ColorTokens.neutral[0]}80`,
            borderRadius: Tokens.radius.xl,
            borderWidth: 1,
            borderColor: isDark ? ColorTokens.secondary[600] : ColorTokens.secondary[100],
          }}
        >
          <Text
            size="sm"
            style={{
              fontStyle: 'italic',
              lineHeight: Tokens.typography.lineHeights.relaxed,
              color: colors.text.primary,
              marginBottom: Tokens.spacing['3'],
            }}
          >
            &quot;{testimonial.message}&quot;
          </Text>
          {testimonial.authorName && (
            <Text size="xs" align="right" color="secondary" style={{ color: colors.text.secondary }}>
              — {testimonial.authorName}
            </Text>
          )}
        </Box>

        {/* Mensagem de apoio */}
        <Box align="center">
          <Text size="sm" weight="semibold" style={{ color: colors.text.primary }}>
            ✨ Você está fazendo o melhor que pode
          </Text>
        </Box>
      </Box>
    </Animated.View>
  );
}

