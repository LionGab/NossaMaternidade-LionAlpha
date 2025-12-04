/**
 * CrisisLineChart - Grafico de linha de crises por dia
 *
 * Mostra:
 * - Total de crises por dia (ultimos 30 dias)
 * - Linha separada para crises criticas/severas
 * - Tooltip com detalhes ao tocar
 */

import React, { memo, useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

import { useThemeColors } from '@/hooks/useTheme';
import type { CrisisDailyStats } from '@/services/dashboardService';
import { Tokens } from '@/theme/tokens';

interface CrisisLineChartProps {
  data: CrisisDailyStats[];
  title?: string;
  showCriticalLine?: boolean;
}

const screenWidth = Dimensions.get('window').width;

export const CrisisLineChart = memo(function CrisisLineChart({
  data,
  title = 'Crises por Dia',
  showCriticalLine = true,
}: CrisisLineChartProps) {
  const colors = useThemeColors();

  // Preparar dados para o grafico (ultimos 14 dias para melhor visualizacao)
  const chartData = useMemo(() => {
    const sortedData = [...data].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    const last14Days = sortedData.slice(-14);

    return {
      labels: last14Days.map((d) => {
        const date = new Date(d.date);
        return `${date.getDate()}/${date.getMonth() + 1}`;
      }),
      datasets: [
        {
          data: last14Days.map((d) => d.totalCount),
          color: () => colors.primary.main,
          strokeWidth: 2,
        },
        ...(showCriticalLine
          ? [
              {
                data: last14Days.map((d) => d.criticalCount + d.severeCount),
                color: () => colors.status.error,
                strokeWidth: 2,
              },
            ]
          : []),
      ],
      legend: showCriticalLine ? ['Total', 'Criticas/Severas'] : ['Total'],
    };
  }, [data, showCriticalLine, colors]);

  // Calcular metricas de resumo
  const summary = useMemo(() => {
    const total = data.reduce((sum, d) => sum + d.totalCount, 0);
    const critical = data.reduce((sum, d) => sum + d.criticalCount + d.severeCount, 0);
    const avg = data.length > 0 ? Math.round(total / data.length) : 0;

    return { total, critical, avg };
  }, [data]);

  if (data.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background.card }]}>
        <Text style={[styles.title, { color: colors.text.primary }]}>{title}</Text>
        <View style={styles.emptyState}>
          <Text style={[styles.emptyText, { color: colors.text.secondary }]}>
            Nenhum dado disponivel
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background.card }]}>
      <Text style={[styles.title, { color: colors.text.primary }]}>{title}</Text>

      {/* Metricas de resumo */}
      <View style={styles.summaryRow}>
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryValue, { color: colors.text.primary }]}>{summary.total}</Text>
          <Text style={[styles.summaryLabel, { color: colors.text.secondary }]}>Total (30d)</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryValue, { color: colors.status.error }]}>
            {summary.critical}
          </Text>
          <Text style={[styles.summaryLabel, { color: colors.text.secondary }]}>Criticas</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryValue, { color: colors.text.primary }]}>{summary.avg}</Text>
          <Text style={[styles.summaryLabel, { color: colors.text.secondary }]}>Media/dia</Text>
        </View>
      </View>

      {/* Grafico */}
      <LineChart
        data={chartData}
        width={screenWidth - Tokens.spacing['8']}
        height={200}
        chartConfig={{
          backgroundColor: colors.background.card,
          backgroundGradientFrom: colors.background.card,
          backgroundGradientTo: colors.background.card,
          decimalPlaces: 0,
          color: (opacity = 1) => {
            // usamos opacity só pra satisfazer o TS, mesmo sem alterar a cor
            void opacity;
            return colors.primary.main;
          },
          labelColor: () => colors.text.secondary,
          style: {
            borderRadius: Tokens.radius.lg,
          },
          propsForDots: {
            r: '4',
            strokeWidth: '2',
            stroke: colors.primary.main,
          },
          propsForBackgroundLines: {
            strokeDasharray: '5, 5',
            stroke: colors.border.light,
          },
        }}
        bezier
        style={styles.chart}
        withInnerLines={true}
        withOuterLines={false}
        withVerticalLabels={true}
        withHorizontalLabels={true}
        fromZero={true}
      />

      {/* Legenda */}
      <View style={styles.legendRow}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.primary.main }]} />
          <Text style={[styles.legendText, { color: colors.text.secondary }]}>Total de crises</Text>
        </View>
        {showCriticalLine && (
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: colors.status.error }]} />
            <Text style={[styles.legendText, { color: colors.text.secondary }]}>
              Criticas + Severas
            </Text>
          </View>
        )}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    padding: Tokens.spacing['4'],
    borderRadius: Tokens.radius.lg,
    marginBottom: Tokens.spacing['4'],
  },
  title: {
    fontSize: Tokens.typography.sizes.lg,
    fontWeight: '600',
    marginBottom: Tokens.spacing['3'],
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: Tokens.spacing['4'],
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: Tokens.typography.sizes['2xl'],
    fontWeight: '700',
  },
  summaryLabel: {
    fontSize: Tokens.typography.sizes.sm,
  },
  chart: {
    marginVertical: Tokens.spacing['2'],
    borderRadius: Tokens.radius.lg,
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: Tokens.spacing['2'],
    gap: Tokens.spacing['4'],
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: Tokens.spacing['1'],
  },
  legendText: {
    fontSize: Tokens.typography.sizes.sm,
  },
  emptyState: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: Tokens.typography.sizes.md,
  },
});
