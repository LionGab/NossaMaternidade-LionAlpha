/**
 * BadgeUnlocker - Componente de Desbloqueio de Badges
 *
 * Exibe as badges desbloqueadas e o progresso da semana. Última fase do
 * fluxo "Desculpa Hoje", mostrando conquistas e motivação para continuar.
 *
 * Referência: app-redesign-studio-ab40635e/src/components/guilt/BadgeUnlocker.tsx
 * Adaptado para React Native com design system atual.
 */

import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { View, ScrollView } from 'react-native';

import { Box } from '@/components/atoms/Box';
import { Text } from '@/components/atoms/Text';
import { useTheme } from '@/theme';
import { Tokens, ColorTokens } from '@/theme/tokens';
import type { Badge } from '@/types/guilt';

export interface BadgeUnlockerProps {
  badges: Badge[];
  totalThisWeek: number;
}

export function BadgeUnlocker({ badges, totalThisWeek }: BadgeUnlockerProps) {
  const { isDark } = useTheme();

  if (badges.length === 0) {
    return null;
  }

  return (
    <Box gap="4">
      {/* Header */}
      <Box align="center" mb="2">
        <Text
          size="lg"
          weight="bold"
          style={{
            color: isDark ? ColorTokens.neutral[100] : ColorTokens.neutral[900],
            marginBottom: Tokens.spacing['2'],
          }}
        >
          Suas Conquistas
        </Text>
        <Text size="sm" color="tertiary" align="center">
          {totalThisWeek} desculpas registradas esta semana
        </Text>
      </Box>

      {/* Lista de badges */}
      <Box gap="3">
        {badges.map((badge) => (
          <View
            key={badge.id}
            style={{
              borderRadius: Tokens.radius['2xl'],
              borderWidth: 2,
              borderColor: ColorTokens.info[200],
              overflow: 'hidden',
              ...Tokens.shadows.md,
            }}
          >
            <LinearGradient
              colors={
                isDark
                  ? [ColorTokens.info[900], ColorTokens.info[800]]
                  : [ColorTokens.info[50], ColorTokens.accent.oceanLight]
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                padding: Tokens.spacing['4'],
                flexDirection: 'row',
                alignItems: 'center',
                gap: Tokens.spacing['4'],
              }}
            >
              {/* Ícone da badge */}
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: Tokens.radius.xl,
                  backgroundColor: isDark
                    ? `${ColorTokens.info[500]}33`
                    : `${ColorTokens.info[500]}E6`,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text size="2xl">{badge.icon}</Text>
              </View>

              {/* Informações da badge */}
              <Box flex={1}>
                <Text
                  size="md"
                  weight="bold"
                  style={{
                    color: isDark ? ColorTokens.neutral[100] : ColorTokens.neutral[900],
                    marginBottom: Tokens.spacing['1'],
                  }}
                >
                  {badge.name}
                </Text>
                <Text
                  size="xs"
                  color="tertiary"
                  style={{
                    lineHeight: Tokens.typography.lineHeights.normal,
                  }}
                >
                  {badge.description}
                </Text>
              </Box>

              {/* Indicador de desbloqueio */}
              {badge.unlockedAt && (
                <View
                  style={{
                    paddingHorizontal: Tokens.spacing['2'],
                    paddingVertical: Tokens.spacing['1'],
                    borderRadius: Tokens.radius.full,
                    backgroundColor: isDark
                      ? ColorTokens.success[800]
                      : ColorTokens.success[100],
                    borderWidth: 1,
                    borderColor: isDark
                      ? ColorTokens.success[600]
                      : ColorTokens.success[300],
                  }}
                >
                  <Text
                    size="xs"
                    weight="bold"
                    style={{
                      color: isDark
                        ? ColorTokens.success[200]
                        : ColorTokens.success[700],
                    }}
                  >
                    Desbloqueado!
                  </Text>
                </View>
              )}
            </LinearGradient>
          </View>
        ))}
      </Box>
    </Box>
  );
}

