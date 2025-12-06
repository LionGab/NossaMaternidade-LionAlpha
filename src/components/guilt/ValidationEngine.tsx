/**
 * ValidationEngine - Componente de Validação Empática
 *
 * Exibe mensagem empática de validação após a seleção de culpa, mostrando
 * estatísticas de normalização (quantas mães sentiram o mesmo) e sugestões
 * de ação. Segunda fase do fluxo "Desculpa Hoje".
 *
 * Referência: app-redesign-studio-ab40635e/src/components/guilt/ValidationEngine.tsx
 * Adaptado para React Native com design system atual.
 */

import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { CheckCircle2, Users, Sparkles } from 'lucide-react-native';
import React from 'react';
import { View } from 'react-native';

import { Box } from '@/components/atoms/Box';
import { Button } from '@/components/atoms/Button';
import { Text } from '@/components/atoms/Text';
import { useTheme } from '@/theme';
import { Tokens, ColorTokens } from '@/theme/tokens';
import type { GuiltValidation, Badge } from '@/types/guilt';

export interface ValidationEngineProps {
  validation: GuiltValidation;
  badge?: Badge;
  onActionAccepted?: () => void;
}

export function ValidationEngine({
  validation,
  badge,
  onActionAccepted,
}: ValidationEngineProps) {
  const { isDark } = useTheme();

  const handleActionPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onActionAccepted?.();
  };

  return (
    <Box gap="6">
      {/* Validação principal */}
      <View
        style={{
          borderRadius: Tokens.radius['3xl'],
          borderWidth: 2,
          borderColor: ColorTokens.info[200],
          overflow: 'hidden',
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
          {/* Header com ícone */}
          <Box align="center" mb="4">
            <View
              style={{
                width: 48,
                height: 48,
                borderRadius: Tokens.radius.full,
                backgroundColor: isDark
                  ? `${ColorTokens.info[500]}33`
                  : `${ColorTokens.info[500]}E6`,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: Tokens.spacing['2'],
              }}
            >
              <CheckCircle2 size={24} color={ColorTokens.neutral[0]} />
            </View>
            <Text
              size="xl"
              weight="bold"
              style={{
                textAlign: 'center',
                color: isDark ? ColorTokens.info[300] : ColorTokens.info[600],
              }}
            >
              Você está em boa companhia
            </Text>
          </Box>

          {/* Estatística */}
          <View
            style={{
              backgroundColor: isDark
                ? `${ColorTokens.neutral[0]}1A`
                : `${ColorTokens.neutral[0]}CC`,
              borderRadius: Tokens.radius.xl,
              padding: Tokens.spacing['4'],
              marginBottom: Tokens.spacing['4'],
              borderWidth: 1,
              borderColor: isDark ? ColorTokens.info[700] : ColorTokens.info[100],
            }}
          >
            <Box direction="row" align="center" justify="center" gap="2" mb="2">
              <Users
                size={20}
                color={isDark ? ColorTokens.info[300] : ColorTokens.info[600]}
              />
              <Text
                size="2xl"
                weight="bold"
                style={{
                  color: isDark ? ColorTokens.neutral[100] : ColorTokens.neutral[900],
                }}
              >
                {validation.similarCount.toLocaleString('pt-BR')}
              </Text>
            </Box>
            <Text
              size="sm"
              color={isDark ? 'secondary' : 'tertiary'}
              align="center"
              style={{ marginBottom: Tokens.spacing['1'] }}
            >
              mães registraram o mesmo hoje
            </Text>
            <Text
              size="xs"
              color="tertiary"
              align="center"
            >
              {validation.normalizePercentage}% das mães da sua semana reportaram algo
              similar
            </Text>
          </View>

          {/* Mensagem empática */}
          <View
            style={{
              backgroundColor: isDark
                ? `${ColorTokens.neutral[0]}1A`
                : `${ColorTokens.neutral[0]}99`,
              borderRadius: Tokens.radius.xl,
              padding: Tokens.spacing['4'],
              marginBottom: Tokens.spacing['4'],
            }}
          >
            <Text
              size="sm"
              style={{
                textAlign: 'center',
                lineHeight: Tokens.typography.lineHeights.relaxed,
                color: isDark ? ColorTokens.neutral[100] : ColorTokens.neutral[900],
              }}
            >
              {validation.message}
            </Text>
          </View>

          {/* Ação sugerida */}
          {validation.suggestedAction && (
            <View
              style={{
                borderRadius: Tokens.radius.xl,
                padding: Tokens.spacing['4'],
                borderWidth: 1,
                borderColor: isDark ? ColorTokens.info[700] : ColorTokens.info[200],
                backgroundColor: isDark
                  ? `${ColorTokens.info[500]}33`
                  : `${ColorTokens.info[100]}CC`,
              }}
            >
              <Box direction="row" align="flex-start" gap="2" mb="3">
                <Sparkles
                  size={20}
                  color={isDark ? ColorTokens.info[300] : ColorTokens.info[600]}
                  style={{ marginTop: 2 }}
                />
                <Box flex={1}>
                  <Text
                    size="xs"
                    weight="semibold"
                    style={{
                      color: isDark ? ColorTokens.info[300] : ColorTokens.info[700],
                      marginBottom: Tokens.spacing['1'],
                    }}
                  >
                    Ação sugerida
                  </Text>
                  <Text
                    size="sm"
                    style={{
                      color: isDark ? ColorTokens.neutral[100] : ColorTokens.neutral[900],
                    }}
                  >
                    {validation.suggestedAction}
                  </Text>
                </Box>
              </Box>
              {onActionAccepted && (
                <Button
                  title="Vou tentar isso"
                  onPress={handleActionPress}
                  variant="outline"
                  size="sm"
                  fullWidth
                  style={{
                    borderRadius: Tokens.radius.xl,
                    borderColor: isDark ? ColorTokens.info[400] : ColorTokens.info[300],
                  }}
                  accessibilityLabel="Aceitar ação sugerida"
                  accessibilityHint="Confirma que você vai tentar a ação sugerida"
                />
              )}
            </View>
          )}
        </LinearGradient>
      </View>

      {/* Badge */}
      {badge && (
        <View
          style={{
            borderRadius: Tokens.radius['3xl'],
            overflow: 'hidden',
            ...Tokens.shadows.xl,
          }}
        >
          <LinearGradient
            colors={
              isDark
                ? [ColorTokens.info[600], ColorTokens.accent.indigo]
                : [ColorTokens.info[500], ColorTokens.accent.ocean]
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              padding: Tokens.spacing['6'],
            }}
          >
            <Box align="center" gap="3">
              <Text size="5xl">{badge.icon}</Text>
              <Text
                size="xl"
                weight="bold"
                style={{ color: ColorTokens.neutral[0], textAlign: 'center' }}
              >
                {badge.name}
              </Text>
              <Text
                size="sm"
                style={{
                  color: `${ColorTokens.neutral[0]}E6`,
                  textAlign: 'center',
                }}
              >
                {badge.description}
              </Text>
            </Box>
          </LinearGradient>
        </View>
      )}
    </Box>
  );
}

