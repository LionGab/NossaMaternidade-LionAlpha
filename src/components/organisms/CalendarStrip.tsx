/**
 * CalendarStrip
 *
 * Calendário horizontal com dias do mês.
 * Inspirado no design do Lofee - Health Woman UI Kit.
 *
 * @see https://www.figma.com/design/fqH3Ro3Ll8sL2s3EJuW22H/Lofee---Woman-Health-UI-Mobile-Design-Kit
 */

import { Calendar } from 'lucide-react-native';
import React, { useRef, useCallback, useMemo } from 'react';
import { StyleSheet, ScrollView, ViewStyle } from 'react-native';

import { Box } from '@/components/atoms/Box';
import { HapticButton } from '@/components/atoms/HapticButton';
import { Text } from '@/components/atoms/Text';
import { useHaptics } from '@/hooks/useHaptics';
import { useTheme } from '@/theme';
import { Tokens, ColorTokens } from '@/theme/tokens';

// ======================
// 🎯 TYPES
// ======================

export type DayType = 'normal' | 'period' | 'fertile' | 'ovulation' | 'today';

export interface CalendarDay {
  date: Date;
  day: number;
  type: DayType;
  isCurrentMonth: boolean;
}

export interface CalendarStripProps {
  /** Data selecionada */
  selectedDate: Date;
  /** Dias para exibir */
  days?: CalendarDay[];
  /** Callback ao selecionar um dia */
  onSelectDate: (date: Date) => void;
  /** Callback ao abrir calendário completo */
  onOpenCalendar?: () => void;
  /** Mês/Ano para exibir no header */
  monthYear?: string;
}

// ======================
// 🎨 DAY TYPE CONFIGS
// ======================

const DAY_TYPE_CONFIG: Record<DayType, { bg: string; text: string; border?: string }> = {
  normal: { bg: 'transparent', text: 'secondary' },
  period: { bg: ColorTokens.cycle.period.main, text: 'inverse' },
  fertile: { bg: ColorTokens.cycle.fertile.main, text: 'inverse' },
  ovulation: { bg: ColorTokens.cycle.ovulation.main, text: 'inverse' },
  today: { bg: 'primary', text: 'inverse', border: 'primary' },
};

const WEEKDAYS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
const WEEKDAYS_FULL = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

// ======================
// 🧩 COMPONENT
// ======================

export const CalendarStrip: React.FC<CalendarStripProps> = ({
  selectedDate,
  days,
  onSelectDate,
  onOpenCalendar,
  monthYear,
}) => {
  const { colors } = useTheme();
  const haptics = useHaptics();
  const scrollRef = useRef<ScrollView>(null);

  // Generate days if not provided
  const calendarDays = useMemo(() => {
    if (days) return days;

    const result: CalendarDay[] = [];
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 3); // Start 3 days before today

    for (let i = 0; i < 14; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);

      const isToday = date.toDateString() === today.toDateString();

      result.push({
        date,
        day: date.getDate(),
        type: isToday ? 'today' : 'normal',
        isCurrentMonth: date.getMonth() === today.getMonth(),
      });
    }

    return result;
  }, [days]);

  const currentMonthYear = useMemo(() => {
    if (monthYear) return monthYear;
    const options: Intl.DateTimeFormatOptions = { month: 'long', year: 'numeric' };
    return selectedDate.toLocaleDateString('pt-BR', options);
  }, [monthYear, selectedDate]);

  const handleSelectDate = useCallback(
    (date: Date) => {
      haptics.light();
      onSelectDate(date);
    },
    [onSelectDate, haptics]
  );

  const getDayStyle = useCallback(
    (day: CalendarDay) => {
      const config = DAY_TYPE_CONFIG[day.type];
      const isSelected = day.date.toDateString() === selectedDate.toDateString();

      let backgroundColor = 'transparent';
      let textColor = colors.text.secondary;
      let borderColor = 'transparent';

      if (day.type === 'period') {
        backgroundColor = config.bg;
        textColor = colors.text.inverse;
      } else if (day.type === 'fertile') {
        backgroundColor = config.bg;
        textColor = colors.text.inverse;
      } else if (day.type === 'ovulation') {
        backgroundColor = config.bg;
        textColor = colors.text.inverse;
      } else if (day.type === 'today' || isSelected) {
        backgroundColor = colors.primary.main;
        textColor = colors.text.inverse;
        borderColor = colors.primary.main;
      }

      if (!day.isCurrentMonth) {
        textColor = colors.text.tertiary;
      }

      return { backgroundColor, textColor, borderColor };
    },
    [colors, selectedDate]
  );

  return (
    <Box>
      {/* Header */}
      <Box direction="row" justify="space-between" align="center" mb="3">
        <Box direction="row" align="center" style={{ gap: Tokens.spacing['2'] }}>
          <Calendar size={18} color={colors.primary.main} />
          <Text
            size="sm"
            weight="semibold"
            color="primary"
            style={{ textTransform: 'capitalize', marginLeft: Tokens.spacing['2'] }}
          >
            {currentMonthYear}
          </Text>
        </Box>

        {onOpenCalendar && (
          <HapticButton
            variant="ghost"
            size="sm"
            onPress={onOpenCalendar}
            accessibilityLabel="Abrir calendário completo"
          >
            <Text size="xs" color="link">
              Ver tudo
            </Text>
          </HapticButton>
        )}
      </Box>

      {/* Days Strip */}
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {calendarDays.map((day, index) => {
          const { backgroundColor, textColor, borderColor } = getDayStyle(day);
          const weekdayIndex = day.date.getDay();

          return (
            <HapticButton
              key={`${day.date.toISOString()}-${index}`}
              variant="ghost"
              onPress={() => handleSelectDate(day.date)}
              style={
                {
                  ...styles.dayButton,
                  backgroundColor,
                  borderColor: borderColor || colors.border.light,
                  borderWidth: borderColor !== 'transparent' ? 2 : 1,
                } as ViewStyle
              }
              accessibilityLabel={`${day.day} de ${currentMonthYear}, ${WEEKDAYS_FULL[weekdayIndex]}`}
            >
              <Text size="xs" color="tertiary" style={styles.weekday}>
                {WEEKDAYS[weekdayIndex]}
              </Text>
              <Text size="lg" weight="bold" style={{ color: textColor }}>
                {day.day}
              </Text>
            </HapticButton>
          );
        })}
      </ScrollView>

      {/* Weekday Labels */}
      <Box direction="row" justify="space-around" mt="2" px="2">
        {WEEKDAYS.map((day, index) => (
          <Text key={index} size="xs" color="tertiary" align="center" style={{ width: 40 }}>
            {day}
          </Text>
        ))}
      </Box>
    </Box>
  );
};

// ======================
// 💄 STYLES
// ======================

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: Tokens.spacing['2'],
    gap: Tokens.spacing['2'],
  },
  dayButton: {
    width: 48,
    height: 64,
    borderRadius: Tokens.radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Tokens.spacing['2'],
  },
  weekday: {
    marginBottom: Tokens.spacing['1'],
  },
});

export default CalendarStrip;
