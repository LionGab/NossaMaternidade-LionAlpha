/**
 * DailyTipCard - Card azul claro com estrela amarela
 * Exibe dica do dia gerada por IA
 */

import { Star } from 'lucide-react-native';
import React from 'react';
import { ScrollView } from 'react-native';

import { Box } from '@/components/atoms/Box';
import { Heading } from '@/components/atoms/Heading';
import { Text } from '@/components/atoms/Text';
import type { DailyTip } from '@/hooks/useHomeScreenData';
import { useTheme } from '@/theme';
import { Tokens, ColorTokens } from '@/theme/tokens';

export interface DailyTipCardProps {
  tip: DailyTip;
}

export function DailyTipCard({ tip }: DailyTipCardProps) {
  const { colors, isDark } = useTheme();

  return (
    <Box
      style={{
        borderRadius: Tokens.radius['3xl'], // 24px
        overflow: 'hidden',
        minHeight: 140,
        ...Tokens.shadows.lg,
      }}
    >
      {/* Fundo azul claro - bg-blue-50 / dark:bg-blue-900 */}
      <Box
        style={{
          backgroundColor: isDark ? ColorTokens.info[900] : ColorTokens.info[50],
          padding: Tokens.spacing['6'],
        }}
      >
        {/* Header com estrela amarela */}
        <Box direction="row" align="center" style={{ marginBottom: Tokens.spacing['4'] }}>
          <Star
            size={24}
            color={ColorTokens.warning[500]} // Amarelo
            fill={ColorTokens.warning[500]}
            style={{ marginRight: Tokens.spacing['2'] }}
          />
          <Heading
            level="h4"
            weight="bold"
            style={{
              fontSize: Tokens.typography.sizes.lg,
              fontWeight: Tokens.typography.weights.extrabold,
              color: isDark ? colors.text.primary : ColorTokens.info[900], // Azul principal #1E3A8A
              textTransform: 'uppercase',
              letterSpacing: 0.5,
            }}
          >
            DICA DO DIA
          </Heading>
        </Box>

        {/* Texto da dica - scroll interno se necessário */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled
          style={{ maxHeight: 120 }}
        >
          <Text
            style={{
              fontSize: Tokens.typography.sizes.xl,
              lineHeight: Tokens.typography.lineHeights.xl * Tokens.typography.sizes.xl,
              color: isDark ? colors.text.primary : ColorTokens.info[900], // Azul principal
              fontWeight: Tokens.typography.weights.semibold,
            }}
          >
            {tip.text}{' '}
            <Text style={{ fontSize: Tokens.typography.sizes.xl * 0.9 }}>{tip.emoji}</Text>
          </Text>
        </ScrollView>
      </Box>
    </Box>
  );
}
