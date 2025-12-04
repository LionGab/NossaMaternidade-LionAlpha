/**
 * WeeklySummaryCard - Mini-gráfico semanal de bem-estar
 *
 * Fecha o loop dos check-ins mostrando:
 * - Dias com check-in (verde/cinza)
 * - Resumo da semana em texto simples
 * - Sugestão baseada no padrão
 *
 * Design minimalista: evita dashboards complexos
 *
 * @version 1.0
 * @date 2025-12-04
 */

import * as Haptics from 'expo-haptics';
import { TrendingUp, Moon, Heart, Sparkles, ChevronRight } from 'lucide-react-native';
import React, { useMemo } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';

import { Box } from '@/components/primitives/Box';
import { Text } from '@/components/primitives/Text';
import { useTheme } from '@/theme';
import { Tokens, ColorTokens } from '@/theme/tokens';

// ======================
// TYPES
// ======================

export interface DayData {
  date: string; // ISO date
  mood?: 'great' | 'good' | 'neutral' | 'bad' | 'terrible';
  sleepHours?: number;
  hadCheckIn: boolean;
}

export interface WeeklySummaryCardProps {
  /** Dados dos últimos 7 dias */
  weekData: DayData[];
  /** Callback ao tocar para ver detalhes */
  onPress?: () => void;
  /** Callback ao tocar na sugestão */
  onSuggestionPress?: (suggestion: string) => void;
  /** Mostrar versão compacta */
  compact?: boolean;
}

// ======================
// HELPERS
// ======================

const WEEKDAYS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

const MOOD_COLORS: Record<string, string> = {
  great: ColorTokens.success[500],
  good: ColorTokens.success[400],
  neutral: ColorTokens.warning[400],
  bad: ColorTokens.error[400],
  terrible: ColorTokens.error[600],
};

const MOOD_LABELS: Record<string, string> = {
  great: 'ótimo',
  good: 'bem',
  neutral: 'neutro',
  bad: 'difícil',
  terrible: 'muito difícil',
};

function analyzWeekPattern(weekData: DayData[]): {
  checkInCount: number;
  dominantMood: string | null;
  avgSleep: number | null;
  suggestion: string;
  suggestionType: 'content' | 'chat' | 'exercise';
} {
  const checkInDays = weekData.filter((d) => d.hadCheckIn);
  const checkInCount = checkInDays.length;

  // Contar moods
  const moodCounts: Record<string, number> = {};
  checkInDays.forEach((d) => {
    if (d.mood) {
      moodCounts[d.mood] = (moodCounts[d.mood] || 0) + 1;
    }
  });

  // Mood dominante
  let dominantMood: string | null = null;
  let maxCount = 0;
  Object.entries(moodCounts).forEach(([mood, count]) => {
    if (count > maxCount) {
      maxCount = count;
      dominantMood = mood;
    }
  });

  // Média de sono
  const sleepDays = checkInDays.filter((d) => d.sleepHours !== undefined);
  const avgSleep =
    sleepDays.length > 0
      ? sleepDays.reduce((sum, d) => sum + (d.sleepHours || 0), 0) / sleepDays.length
      : null;

  // Gerar sugestão baseada no padrão
  let suggestion = '';
  let suggestionType: 'content' | 'chat' | 'exercise' = 'content';

  if (checkInCount === 0) {
    suggestion = 'Que tal começar a registrar como você se sente?';
    suggestionType = 'exercise';
  } else if (dominantMood === 'bad' || dominantMood === 'terrible') {
    suggestion = 'Você teve dias difíceis. Quer conversar sobre isso?';
    suggestionType = 'chat';
  } else if (avgSleep !== null && avgSleep < 5) {
    suggestion = 'Seu sono está curto. Veja dicas para descansar melhor.';
    suggestionType = 'content';
  } else if (dominantMood === 'neutral') {
    suggestion = 'Quer um exercício rápido de autocuidado?';
    suggestionType = 'exercise';
  } else if (checkInCount >= 5) {
    suggestion = 'Parabéns! Você cuidou de si mesma esta semana.';
    suggestionType = 'content';
  } else {
    suggestion = 'Continue registrando para conhecer seus padrões.';
    suggestionType = 'content';
  }

  return { checkInCount, dominantMood, avgSleep, suggestion, suggestionType };
}

// ======================
// COMPONENT
// ======================

export const WeeklySummaryCard: React.FC<WeeklySummaryCardProps> = React.memo(
  ({ weekData, onPress, onSuggestionPress, compact = false }) => {
    const { colors, isDark } = useTheme();

    const analysis = useMemo(() => analyzWeekPattern(weekData), [weekData]);

    const handlePress = () => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress?.();
    };

    const handleSuggestionPress = () => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onSuggestionPress?.(analysis.suggestion);
    };

    // Gerar array de 7 dias (garantir ordem correta)
    const today = new Date();
    const weekDays = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(today);
      date.setDate(date.getDate() - (6 - i));
      const dayData = weekData.find((d) => new Date(d.date).toDateString() === date.toDateString());
      return {
        date,
        dayOfWeek: date.getDay(),
        isToday: date.toDateString() === today.toDateString(),
        ...dayData,
      };
    });

    if (compact) {
      return (
        <TouchableOpacity
          onPress={handlePress}
          activeOpacity={0.8}
          style={[
            styles.compactContainer,
            {
              backgroundColor: colors.background.card,
              borderColor: colors.border.light,
            },
          ]}
          accessibilityLabel={`Resumo da semana: ${analysis.checkInCount} dias com check-in`}
        >
          <Box direction="row" align="center" gap="3">
            <TrendingUp size={18} color={colors.primary.main} />
            <Text size="sm" color="secondary">
              {analysis.checkInCount}/7 dias
            </Text>
            <Box direction="row" gap="1">
              {weekDays.map((day, i) => (
                <View
                  key={i}
                  style={[
                    styles.miniDot,
                    {
                      backgroundColor: day.hadCheckIn
                        ? day.mood
                          ? MOOD_COLORS[day.mood]
                          : ColorTokens.success[500]
                        : colors.border.medium,
                    },
                  ]}
                />
              ))}
            </Box>
          </Box>
        </TouchableOpacity>
      );
    }

    return (
      <Box
        bg="card"
        rounded="3xl"
        p="5"
        shadow="md"
        borderWidth={1}
        borderColor="light"
        style={styles.container}
      >
        {/* Header */}
        <TouchableOpacity
          onPress={handlePress}
          accessibilityLabel="Ver detalhes da semana"
          style={styles.header}
        >
          <Box direction="row" align="center" gap="2">
            <TrendingUp size={20} color={colors.primary.main} />
            <Text size="md" weight="semibold" color="primary">
              Sua Semana
            </Text>
          </Box>
          {onPress && <ChevronRight size={18} color={colors.text.tertiary} />}
        </TouchableOpacity>

        {/* Week dots */}
        <Box direction="row" justify="space-between" mt="4" mb="3">
          {weekDays.map((day, i) => (
            <Box key={i} align="center" style={{ flex: 1 }}>
              <Text size="xs" color="tertiary" style={{ marginBottom: Tokens.spacing['2'] }}>
                {WEEKDAYS[day.dayOfWeek]}
              </Text>
              <View
                style={[
                  styles.dayDot,
                  {
                    backgroundColor: day.hadCheckIn
                      ? day.mood
                        ? MOOD_COLORS[day.mood]
                        : ColorTokens.success[500]
                      : isDark
                        ? ColorTokens.neutral[700]
                        : ColorTokens.neutral[200],
                    borderWidth: day.isToday ? 2 : 0,
                    borderColor: colors.primary.main,
                  },
                ]}
                accessibilityLabel={
                  day.hadCheckIn
                    ? `${WEEKDAYS[day.dayOfWeek]}: ${day.mood ? MOOD_LABELS[day.mood] : 'check-in feito'}`
                    : `${WEEKDAYS[day.dayOfWeek]}: sem check-in`
                }
              />
            </Box>
          ))}
        </Box>

        {/* Stats row */}
        <Box
          direction="row"
          gap="4"
          p="3"
          rounded="xl"
          style={{
            backgroundColor: isDark ? ColorTokens.neutral[800] : ColorTokens.neutral[50],
          }}
        >
          {/* Check-ins */}
          <Box direction="row" align="center" gap="2" flex={1}>
            <Heart size={14} color={colors.text.tertiary} />
            <Text size="xs" color="secondary">
              {analysis.checkInCount} dias cuidando de você
            </Text>
          </Box>

          {/* Sono médio */}
          {analysis.avgSleep !== null && (
            <Box direction="row" align="center" gap="2">
              <Moon size={14} color={colors.text.tertiary} />
              <Text size="xs" color="secondary">
                ~{analysis.avgSleep.toFixed(1)}h sono
              </Text>
            </Box>
          )}
        </Box>

        {/* Insight/Sugestão */}
        {analysis.suggestion && (
          <TouchableOpacity
            onPress={handleSuggestionPress}
            activeOpacity={0.8}
            style={[
              styles.suggestionBox,
              {
                backgroundColor: isDark ? `${colors.primary.main}20` : `${colors.primary.main}10`,
                borderColor: isDark ? `${colors.primary.main}40` : `${colors.primary.main}30`,
              },
            ]}
            accessibilityLabel={analysis.suggestion}
            accessibilityHint="Toque para ver mais"
          >
            <Sparkles size={16} color={colors.primary.main} />
            <Text size="sm" style={{ color: colors.primary.main, flex: 1, marginLeft: 8 }}>
              {analysis.suggestion}
            </Text>
            <ChevronRight size={16} color={colors.primary.main} />
          </TouchableOpacity>
        )}
      </Box>
    );
  }
);

WeeklySummaryCard.displayName = 'WeeklySummaryCard';

// ======================
// STYLES
// ======================

const styles = StyleSheet.create({
  container: {
    marginBottom: Tokens.spacing['6'],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dayDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  miniDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  suggestionBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Tokens.spacing['3'],
    borderRadius: Tokens.radius.xl,
    marginTop: Tokens.spacing['3'],
    borderWidth: 1,
  },
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Tokens.spacing['3'],
    borderRadius: Tokens.radius.xl,
    borderWidth: 1,
    marginBottom: Tokens.spacing['3'],
  },
});

export default WeeklySummaryCard;
