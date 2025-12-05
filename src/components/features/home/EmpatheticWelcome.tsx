/**
 * EmpatheticWelcome - Nova saudação empática e acolhedora
 * "🌙 Oi mãe, respire um pouquinho… Estamos aqui por você."
 */

import { Moon } from 'lucide-react-native';
import React from 'react';
import { View } from 'react-native';

import { Box } from '@/components/atoms/Box';
import { Text } from '@/components/atoms/Text';
import { useTheme } from '@/theme';
import { Tokens, ColorTokens } from '@/theme/tokens';

export interface EmpatheticWelcomeProps {
  /** Nome do usuário (opcional) */
  userName?: string;
  /** Saudação customizada (opcional) */
  greeting?: string;
}

export function EmpatheticWelcome({ userName, greeting }: EmpatheticWelcomeProps) {
  const { colors, isDark } = useTheme();

  // Saudação baseada no horário
  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Bom dia';
    if (hour >= 12 && hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  const timeGreeting = greeting || getTimeBasedGreeting();
  const displayName = userName ? `, ${userName.split(' ')[0]}` : '';

  return (
    <Box px="5" pt="4" pb="3">
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'flex-start',
          gap: Tokens.spacing['3'],
        }}
      >
        {/* Ícone de lua */}
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: Tokens.radius.full,
            backgroundColor: isDark
              ? `${ColorTokens.primary[500]}20`
              : `${ColorTokens.primary[500]}15`,
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: 2,
          }}
        >
          <Moon
            size={20}
            color={colors.primary.main}
            fill={colors.primary.main}
            fillOpacity={0.3}
          />
        </View>

        {/* Texto de boas-vindas */}
        <Box flex={1}>
          <Text
            size="lg"
            weight="semibold"
            color="primary"
            style={{
              lineHeight: 24,
              marginBottom: Tokens.spacing['1'],
            }}
          >
            {timeGreeting}
            {displayName}
          </Text>
          <Text
            size="md"
            color="secondary"
            style={{
              lineHeight: 22,
              fontStyle: 'italic',
            }}
          >
            Oi mãe, respire um pouquinho…
          </Text>
          <Text
            size="sm"
            color="tertiary"
            style={{
              lineHeight: 20,
              marginTop: Tokens.spacing['1'],
            }}
          >
            Estamos aqui por você.
          </Text>
        </Box>
      </View>
    </Box>
  );
}
