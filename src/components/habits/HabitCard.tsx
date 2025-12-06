/**
 * HabitCard - Card de hábito individual
 *
 * Exibe um hábito com informações de status, streak, progresso e botão para marcar como completo.
 * Referência: app-redesign-studio-ab40635e/src/pages/Habits.tsx (renderização de hábitos)
 * Adaptado para React Native com design system atual.
 */

import { CheckCircle2, Circle, Trophy, TrendingUp } from 'lucide-react-native';
import React from 'react';
import { TouchableOpacity, View, ActivityIndicator } from 'react-native';
import * as Haptics from 'expo-haptics';

import { Badge } from '@/components/Badge';
import { Box } from '@/components/atoms/Box';
import { Text } from '@/components/atoms/Text';
import { useTheme } from '@/theme';
import { Tokens, ColorTokens } from '@/theme/tokens';
import { logger } from '@/utils/logger';
import type { UserHabit } from '@/services/habitsService';

interface HabitCardProps {
  /** Dados do hábito do usuário */
  habit: UserHabit;
  /** Se o hábito está sendo completado (loading state) */
  isCompleting?: boolean;
  /** Callback quando o hábito é marcado como completo */
  onToggleComplete?: (userHabitId: string) => void;
  /** Callback quando o card é pressionado (para ver detalhes) */
  onPress?: (habit: UserHabit) => void;
}

/**
 * Obtém configuração visual do hábito baseado no nome
 */
function getHabitConfig(habit: UserHabit) {
  const name = (habit.custom_name || habit.habit?.name || '').toLowerCase();

  // Mapeamento por nome
  if (name.includes('água') || name.includes('hidrata')) {
    return {
      iconColor: ColorTokens.info[500],
      bgColor: `${ColorTokens.info[500]}20`,
      borderColor: ColorTokens.info[500],
      category: 'Saúde',
    };
  }
  if (name.includes('sono') || name.includes('dormir') || name.includes('descanso')) {
    return {
      iconColor: ColorTokens.accent.purple,
      bgColor: `${ColorTokens.accent.purple}20`,
      borderColor: ColorTokens.accent.purple,
      category: 'Bem-estar',
    };
  }
  if (name.includes('autocuidado') || name.includes('cuidado') || name.includes('momento')) {
    return {
      iconColor: ColorTokens.secondary[500],
      bgColor: `${ColorTokens.secondary[500]}20`,
      borderColor: ColorTokens.secondary[500],
      category: 'Bem-estar',
    };
  }
  if (name.includes('respir') || name.includes('paz') || name.includes('medita')) {
    return {
      iconColor: ColorTokens.warning[500],
      bgColor: `${ColorTokens.warning[500]}20`,
      borderColor: ColorTokens.warning[500],
      category: 'Mental',
    };
  }
  if (name.includes('ler') || name.includes('leitura') || name.includes('livro')) {
    return {
      iconColor: ColorTokens.success[500],
      bgColor: `${ColorTokens.success[500]}20`,
      borderColor: ColorTokens.success[500],
      category: 'Crescimento',
    };
  }

  // Default
  return {
    iconColor: ColorTokens.secondary[500],
    bgColor: `${ColorTokens.secondary[500]}20`,
    borderColor: ColorTokens.secondary[500],
    category: 'Bem-estar',
  };
}

export function HabitCard({
  habit,
  isCompleting = false,
  onToggleComplete,
  onPress,
}: HabitCardProps) {
  const { colors } = useTheme();
  const config = getHabitConfig(habit);
  const completed = habit.today_completed || false;
  const displayName = habit.custom_name || habit.habit?.name || 'Hábito';
  const displayDescription = habit.habit?.description || '';

  const handleToggle = () => {
    if (isCompleting || !onToggleComplete) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onToggleComplete(habit.id);
    logger.info('[HabitCard] Toggle completion', { habitId: habit.id });
  };

  const handlePress = () => {
    if (onPress) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress(habit);
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.7}
      style={{
        backgroundColor: colors.background.card,
        borderRadius: Tokens.radius['3xl'],
        padding: Tokens.spacing['5'],
        borderWidth: 1,
        borderColor: completed ? config.borderColor : colors.border.light,
        ...Tokens.shadows.card,
      }}
      accessibilityRole="button"
      accessibilityLabel={`Hábito: ${displayName}. ${completed ? 'Completo hoje' : 'Não completo hoje'}`}
      accessibilityHint="Toque para ver detalhes do hábito"
    >
      <Box direction="row" gap="4" align="flex-start">
        {/* Checkbox grande */}
        <TouchableOpacity
          onPress={handleToggle}
          disabled={isCompleting}
          activeOpacity={0.7}
          style={{
            width: 48,
            height: 48,
            borderRadius: Tokens.radius.xl,
            borderWidth: 2,
            borderColor: completed
              ? config.borderColor
              : colors.border.medium,
            backgroundColor: completed
              ? config.bgColor
              : 'transparent',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
          accessibilityRole="button"
          accessibilityLabel={completed ? 'Desmarcar hábito' : 'Marcar hábito como completo'}
          accessibilityState={{ disabled: isCompleting }}
        >
          {isCompleting ? (
            <ActivityIndicator size="small" color={config.iconColor} />
          ) : completed ? (
            <CheckCircle2 size={24} color={config.iconColor} fill={config.iconColor} />
          ) : (
            <Circle size={24} color={colors.text.tertiary} />
          )}
        </TouchableOpacity>

        {/* Conteúdo */}
        <Box flex={1} gap="2">
          <Box direction="row" align="center" justify="space-between" gap="2">
            <Box flex={1}>
              <Text
                size="md"
                weight="semibold"
                style={{
                  color: completed ? colors.text.tertiary : colors.text.primary,
                  textDecorationLine: completed ? 'line-through' : 'none',
                  marginBottom: Tokens.spacing['1'],
                }}
              >
                {displayName}
              </Text>
              {displayDescription && (
                <Text size="sm" color="secondary" numberOfLines={1}>
                  {displayDescription}
                </Text>
              )}
            </Box>
            <Badge
              variant="primary"
              outlined={true}
              containerStyle={{
                backgroundColor: config.bgColor,
                borderColor: config.borderColor,
              }}
            >
              <Text size="xs" style={{ color: config.iconColor }}>
                {config.category}
              </Text>
            </Badge>
          </Box>

          {/* Estatísticas */}
          <Box direction="row" align="center" gap="4">
            {habit.current_streak !== undefined && habit.current_streak > 0 && (
              <Box direction="row" align="center" gap="1">
                <TrendingUp size={14} color={config.iconColor} />
                <Text size="xs" weight="medium" style={{ color: config.iconColor }}>
                  {habit.current_streak} dias
                </Text>
              </Box>
            )}
            {habit.habit?.frequency && (
              <Box direction="row" align="center" gap="1">
                <Trophy size={14} color={colors.text.tertiary} />
                <Text size="xs" color="tertiary">
                  {habit.habit.frequency === 'daily'
                    ? 'Diário'
                    : habit.habit.frequency === 'weekly'
                      ? 'Semanal'
                      : 'Mensal'}
                </Text>
              </Box>
            )}
            <Box
              direction="row"
              align="center"
              gap="1"
              style={{
                marginLeft: 'auto',
              }}
            >
              <View
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: completed
                    ? ColorTokens.success[500]
                    : ColorTokens.warning[500],
                }}
              />
              <Text size="xs" weight="medium" style={{ color: colors.text.tertiary }}>
                {completed ? 'Hoje' : 'Pendente'}
              </Text>
            </Box>
          </Box>
        </Box>
      </Box>
    </TouchableOpacity>
  );
}

