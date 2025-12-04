/**
 * CrisisTypePieChart - Grafico de pizza para tipos de crise
 *
 * Mostra:
 * - Distribuicao de tipos de crise (anxiety, depression, etc.)
 * - Porcentagem de cada tipo
 * - Qual tipo precisa de mais suporte
 */

import React, { memo, useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { PieChart } from 'react-native-chart-kit';

import { useThemeColors } from '@/hooks/useTheme';
import type { CrisisTypeDistribution } from '@/services/dashboardService';
import { Tokens } from '@/theme/tokens';

interface CrisisTypePieChartProps {
  data: CrisisTypeDistribution[];
  title?: string;
}

const screenWidth = Dimensions.get('window').width;

// Labels em portugues para os tipos de crise
const TYPE_LABELS: Record<string, string> = {
  anxiety: 'Ansiedade',
  depression: 'Depressao',
  suicidal_ideation: 'Ideacao Suicida',
  self_harm: 'Auto-lesao',
  panic: 'Panico',
  overwhelm: 'Sobrecarga',
  violence: 'Violencia',
  postpartum: 'Pos-parto',
};

export const CrisisTypePieChart = memo(function CrisisTypePieChart({
  data,
  title = 'Tipos de Crise',
}: CrisisTypePieChartProps) {
  const colors = useThemeColors();

  // Preparar dados para o pie chart
  const chartData = useMemo(() => {
    return data.map((item) => ({
      name: TYPE_LABELS[item.crisisType] || item.crisisType,
      count: item.count,
      color: item.color,
      legendFontColor: colors.text.secondary,
      legendFontSize: 12,
    }));
  }, [data, colors]);

  // Identificar tipo que mais precisa de suporte
  const topCrisisType = useMemo(() => {
    if (data.length === 0) return null;
    const sorted = [...data].sort((a, b) => b.count - a.count);
    return sorted[0];
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

      {/* Destaque do tipo mais comum */}
      {topCrisisType && (
        <View style={[styles.highlightBox, { borderColor: topCrisisType.color }]}>
          <Text style={[styles.highlightLabel, { color: colors.text.secondary }]}>
            Tipo mais comum
          </Text>
          <Text style={[styles.highlightValue, { color: topCrisisType.color }]}>
            {TYPE_LABELS[topCrisisType.crisisType] || topCrisisType.crisisType}
          </Text>
          <Text style={[styles.highlightPercent, { color: colors.text.primary }]}>
            {topCrisisType.percentage}% dos casos
          </Text>
        </View>
      )}

      {/* Grafico de pizza */}
      <PieChart
        data={chartData}
        width={screenWidth - Tokens.spacing['8']}
        height={200}
        chartConfig={{
          color: () => colors.text.primary,
        }}
        accessor="count"
        backgroundColor="transparent"
        paddingLeft="15"
        absolute
        hasLegend={true}
        center={[0, 0]}
      />

      {/* Lista detalhada */}
      <View style={styles.detailList}>
        {data.map((item) => (
          <View key={item.crisisType} style={styles.detailItem}>
            <View style={styles.detailLeft}>
              <View style={[styles.colorDot, { backgroundColor: item.color }]} />
              <Text style={[styles.detailLabel, { color: colors.text.primary }]}>
                {TYPE_LABELS[item.crisisType] || item.crisisType}
              </Text>
            </View>
            <View style={styles.detailRight}>
              <Text style={[styles.detailCount, { color: colors.text.primary }]}>{item.count}</Text>
              <Text style={[styles.detailPercent, { color: colors.text.secondary }]}>
                ({item.percentage}%)
              </Text>
            </View>
          </View>
        ))}
      </View>

      {/* Recomendacao de acao */}
      {topCrisisType && (
        <View
          style={[
            styles.actionBox,
            { backgroundColor: colors.background.beige || colors.background.elevated },
          ]}
        >
          <Text style={[styles.actionTitle, { color: colors.text.primary }]}>Acao Recomendada</Text>
          <Text style={[styles.actionText, { color: colors.text.secondary }]}>
            {getActionRecommendation(topCrisisType.crisisType)}
          </Text>
        </View>
      )}
    </View>
  );
});

// Recomendacoes de acao por tipo de crise
function getActionRecommendation(crisisType: string): string {
  const recommendations: Record<string, string> = {
    anxiety: 'Reforcar exercicios de respiracao e grounding na NathIA',
    depression: 'Aumentar mensagens de validacao emocional e sugerir CVV proativamente',
    suicidal_ideation: 'URGENTE: Revisar protocolos de crise e follow-up imediato',
    self_harm: 'URGENTE: Garantir que recursos de emergencia estao visiveis',
    panic: 'Adicionar mais tecnicas de ancoragem sensorial',
    overwhelm: 'Sugerir pausas e micro-descansos para maes sobrecarregadas',
    violence: 'Direcionar para canais de apoio especializados',
    postpartum: 'Reforcar normalizacao e encaminhamento para profissionais',
  };

  return recommendations[crisisType] || 'Analisar dados para definir proximos passos';
}

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
  highlightBox: {
    borderWidth: 2,
    borderRadius: Tokens.radius.md,
    padding: Tokens.spacing['3'],
    alignItems: 'center',
    marginBottom: Tokens.spacing['3'],
  },
  highlightLabel: {
    fontSize: Tokens.typography.sizes.sm,
  },
  highlightValue: {
    fontSize: Tokens.typography.sizes.xl,
    fontWeight: '700',
  },
  highlightPercent: {
    fontSize: Tokens.typography.sizes.md,
  },
  detailList: {
    marginTop: Tokens.spacing['3'],
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Tokens.spacing['2'],
  },
  detailLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: Tokens.spacing['2'],
  },
  detailLabel: {
    fontSize: Tokens.typography.sizes.md,
  },
  detailRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Tokens.spacing['1'],
  },
  detailCount: {
    fontSize: Tokens.typography.sizes.md,
    fontWeight: '600',
  },
  detailPercent: {
    fontSize: Tokens.typography.sizes.sm,
  },
  actionBox: {
    marginTop: Tokens.spacing['4'],
    padding: Tokens.spacing['3'],
    borderRadius: Tokens.radius.md,
  },
  actionTitle: {
    fontSize: Tokens.typography.sizes.sm,
    fontWeight: '600',
    marginBottom: Tokens.spacing['1'],
  },
  actionText: {
    fontSize: Tokens.typography.sizes.md,
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
