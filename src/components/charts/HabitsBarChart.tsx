/**
 * HabitsBarChart - Gráfico de barras para hábitos (Flo-style)
 *
 * Visualiza a conclusão de hábitos ao longo da semana
 * Inspirado no Flo app e Habitica
 *
 * @example
 * ```tsx
 * import { HabitsBarChart } from '@/components/charts/HabitsBarChart';
 *
 * <HabitsBarChart
 *   data={[3, 2, 4, 3, 5, 4, 3]} // Número de hábitos completados por dia
 *   labels={['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab', 'Dom']}
 * />
 * ```
 *
 * @version 1.0
 * @date 2025-11-27
 */

import React from 'react';
import { View, Dimensions, ViewStyle } from 'react-native';
import { BarChart } from 'react-native-chart-kit';

import { useThemeColors } from '@/hooks/useTheme';
import { Tokens } from '@/theme/tokens';

const screenWidth = Dimensions.get('window').width;

export interface HabitsBarChartProps {
  /** Dados de hábitos completados por dia */
  data: number[];
  /** Labels do eixo X (ex: dias da semana) */
  labels?: string[];
  /** Largura customizada (padrão: screenWidth - 32) */
  width?: number;
  /** Altura customizada (padrão: 220) */
  height?: number;
  /** Style customizado */
  style?: ViewStyle;
}

/**
 * HabitsBarChart - Gráfico de barras para hábitos
 */
export function HabitsBarChart({
  data,
  labels = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab', 'Dom'],
  width = screenWidth - 32,
  height = 220,
  style,
}: HabitsBarChartProps) {
  const colors = useThemeColors();

  // Dados formatados para react-native-chart-kit
  const chartData = {
    labels,
    datasets: [
      {
        data,
      },
    ],
  };

  // Configuração do gráfico (Flo-style)
  const chartConfig = {
    backgroundColor: colors.background.card,
    backgroundGradientFrom: colors.background.card,
    backgroundGradientTo: colors.background.card,
    decimalPlaces: 0, // Sem casas decimais
    color: (opacity = 1) => {
      // Gradiente roxo espiritual (secondary)
      const hex = colors.secondary.main.replace('#', '');
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    },
    labelColor: (_opacity = 1) => colors.text.secondary,
    style: {
      borderRadius: Tokens.radius.lg,
    },
    barPercentage: 0.7, // Largura das barras
    propsForBackgroundLines: {
      strokeDasharray: '', // Linhas sólidas
      stroke: colors.border.light,
      strokeWidth: 1,
    },
  };

  return (
    <View style={[{ alignItems: 'center' }, style]}>
      <BarChart
        data={chartData}
        width={width}
        height={height}
        chartConfig={chartConfig}
        style={{
          marginVertical: Tokens.spacing['2'],
          borderRadius: Tokens.radius.lg,
        }}
        withInnerLines
        withVerticalLabels
        withHorizontalLabels
        yAxisLabel=""
        yAxisSuffix=""
        yAxisInterval={1}
        fromZero
        showValuesOnTopOfBars
        flatColor // Cor sólida (não gradiente)
      />
    </View>
  );
}

export default HabitsBarChart;
