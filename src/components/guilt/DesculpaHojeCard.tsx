/**
 * DesculpaHojeCard - Card de culpa materna
 * Baseado no design web, adaptado para React Native
 *
 * Features:
 * - Gradiente azul/cyan (design web)
 * - Badge de streak (dias consecutivos)
 * - Navegação para tela de desculpa
 * - Design tokens mobile
 */

import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { Heart, Sparkles } from 'lucide-react-native';
import React from 'react';
import { TouchableOpacity, View } from 'react-native';

import { Box } from '@/components/primitives/Box';
import { Button } from '@/components/primitives/Button';
import { Text } from '@/components/primitives/Text';
import { useTheme } from '@/theme';
import { Tokens, ColorTokens } from '@/theme/tokens';
import { logger } from '@/utils/logger';

export interface DesculpaHojeCardProps {
  streakDays?: number | null;
}

export function DesculpaHojeCard({ streakDays }: DesculpaHojeCardProps) {
  const { isDark } = useTheme();

  const handlePress = () => {
    logger.info('DesculpaHojeCard pressed', { streakDays });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // TODO: Navegar para tela de desculpa quando implementada
    // navigation.navigate('DesculpaHoje');
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.9}
      accessibilityRole="button"
      accessibilityLabel="Desculpa Hoje"
      accessibilityHint="Toque para responder sobre seu maior arrependimento de hoje"
      style={{
        marginBottom: Tokens.spacing['6'],
      }}
    >
      <View
        style={{
          borderRadius: Tokens.radius['3xl'],
          overflow: 'hidden',
          borderWidth: 2,
          borderColor: ColorTokens.info[200],
          ...Tokens.shadows.xl,
        }}
      >
        <LinearGradient
          colors={
            isDark
              ? [ColorTokens.info[900], ColorTokens.info[800], ColorTokens.accent.indigo]
              : [ColorTokens.info[50], ColorTokens.accent.oceanLight, ColorTokens.info[100]]
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            padding: Tokens.spacing['6'],
          }}
        >
          <Box direction="row" align="flex-start" gap="4">
            {/* Ícone Heart */}
            <View
              style={{
                padding: Tokens.spacing['3'],
                borderRadius: Tokens.radius['2xl'],
                backgroundColor: isDark
                  ? `${ColorTokens.info[500]}33`
                  : `${ColorTokens.info[500]}E6`,
                ...Tokens.shadows.lg,
              }}
            >
              <Heart size={24} color={ColorTokens.neutral[0]} fill={ColorTokens.neutral[0]} />
            </View>

            {/* Conteúdo */}
            <Box flex={1}>
              <Box direction="row" align="center" gap="2" mb="2">
                <Text
                  size="lg"
                  weight="bold"
                  style={{
                    color: isDark ? ColorTokens.info[300] : ColorTokens.info[600],
                  }}
                >
                  💙 Desculpa Hoje
                </Text>
                {streakDays !== undefined && streakDays !== null && streakDays > 0 && (
                  <View
                    style={{
                      paddingHorizontal: Tokens.spacing['2'],
                      paddingVertical: Tokens.spacing['0.5'],
                      borderRadius: Tokens.radius.full,
                      backgroundColor: isDark
                        ? `${ColorTokens.info[500]}33`
                        : ColorTokens.info[100],
                      borderWidth: 1,
                      borderColor: isDark ? ColorTokens.info[400] : ColorTokens.info[300],
                    }}
                  >
                    <Text
                      size="xs"
                      weight="bold"
                      style={{
                        color: isDark ? ColorTokens.info[300] : ColorTokens.info[700],
                      }}
                    >
                      🔥 {streakDays} dias
                    </Text>
                  </View>
                )}
              </Box>

              <Text
                size="sm"
                color={isDark ? 'secondary' : 'tertiary'}
                style={{ marginBottom: Tokens.spacing['3'] }}
              >
                Qual foi seu maior arrependimento hoje?
              </Text>

              <Button
                title="Responder"
                onPress={handlePress}
                variant="primary"
                size="md"
                fullWidth
                leftIcon={<Sparkles size={16} color={ColorTokens.neutral[0]} />}
                style={{
                  backgroundColor: isDark ? ColorTokens.info[500] : ColorTokens.info[500],
                  borderRadius: Tokens.radius.xl,
                }}
                accessibilityLabel="Responder sobre desculpa de hoje"
                accessibilityHint="Abre a tela para registrar seu maior arrependimento de hoje"
              />
            </Box>
          </Box>
        </LinearGradient>
      </View>
    </TouchableOpacity>
  );
}
