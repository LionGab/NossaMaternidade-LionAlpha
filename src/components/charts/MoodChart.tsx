/**
 * MoodChart - Gráfico de humor semanal (Flo-style)
 *
 * Visualiza o humor da mãe ao longo da semana usando LineChart
 * Inspirado no Flo app e Apple Health
 *
 * @example
 * ```tsx
 * import { MoodChart } from '@/components/charts/MoodChart';
 *
 * <MoodChart
 *   data={[4, 3, 5, 2, 4, 5, 4]} // 1-5 scale
 *   labels={['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab', 'Dom']}
 * />
 * ```
 *
 * @version 1.0
 * @date 2025-11-27
 */

import React from 'react';
import { View, Dimensions, ViewStyle } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

import { useThemeColors } from '@/hooks/useTheme';
import { Tokens } from '@/theme/tokens';

const screenWidth = Dimensions.get('window').width;

export interface MoodChartProps {
  /** Dados de humor (1-5 scale: 1=triste, 5=muito bem) */
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
 * MoodChart - Gráfico de linha para visualizar humor
 */
export function MoodChart({
  data,
  labels = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab', 'Dom'],
  width = screenWidth - 32,
  height = 220,
  style,
}: MoodChartProps) {
  const colors = useThemeColors();

  // Dados formatados para react-native-chart-kit
  const chartData = {
    labels,
    datasets: [
      {
        data,
        color: (_opacity = 1) => colors.primary.main, // Rosa maternal
        strokeWidth: 3,
      },
    ],
  };

  // Configuração do gráfico (Flo-style)
  const chartConfig = {
    backgroundColor: colors.background.card,
    backgroundGradientFrom: colors.background.card,
    backgroundGradientTo: colors.background.card,
    decimalPlaces: 0, // Sem casas decimais
    color: (opacity = 1) =>
      `${colors.primary.main}${Math.round(opacity * 255)
        .toString(16)
        .padStart(2, '0')}`,
    labelColor: (_opacity = 1) => colors.text.secondary,
    style: {
      borderRadius: Tokens.radius.lg,
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: colors.primary.main,
      fill: colors.background.card,
    },
    propsForBackgroundLines: {
      strokeDasharray: '', // Linhas sólidas
      stroke: colors.border.light,
      strokeWidth: 1,
    },
  };

  return (
    <View style={[{ alignItems: 'center' }, style]}>
      <LineChart
        data={chartData}
        width={width}
        height={height}
        chartConfig={chartConfig}
        bezier // Curva suave (Flo-style)
        style={{
          marginVertical: Tokens.spacing['2'],
          borderRadius: Tokens.radius.lg,
        }}
        withInnerLines
        withOuterLines
        withVerticalLines={false}
        withHorizontalLines
        withVerticalLabels
        withHorizontalLabels
        yAxisSuffix=""
        yAxisInterval={1}
        fromZero
        segments={4} // 5 linhas horizontais (0, 1, 2, 3, 4, 5)
      />
    </View>
  );
}

export default MoodChart;
