/**
 * FunnelChart - Grafico de funil de conversao
 *
 * Mostra:
 * - Jornada do usuario (signup -> engagement -> conversion)
 * - Porcentagem de conversao em cada etapa
 * - Onde mais usuarios desistem (dropoff)
 */

import { Ionicons } from '@expo/vector-icons';
import React, { memo, useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { useThemeColors } from '@/hooks/useTheme';
import type { FunnelStage } from '@/services/dashboardService';
import { Tokens } from '@/theme/tokens';

interface FunnelChartProps {
  data: FunnelStage[];
  title?: string;
}

export const FunnelChart = memo(function FunnelChart({
  data,
  title = 'Funil de Conversao',
}: FunnelChartProps) {
  const colors = useThemeColors();

  // Encontrar maior dropoff
  const maxDropoff = useMemo(() => {
    if (data.length === 0) return null;
    const sorted = [...data].sort((a, b) => b.dropoffPercent - a.dropoffPercent);
    return sorted[0];
  }, [data]);

  // Calcular largura proporcional para cada stage
  const getBarWidth = (percentage: number): string => {
    const minWidth = 30;
    const maxWidth = 100;
    const width = minWidth + ((maxWidth - minWidth) * percentage) / 100;
    return `${width}%`;
  };

  // Cor baseada no dropoff
  const getDropoffColor = (dropoff: number): string => {
    if (dropoff > 50) return colors.status.error;
    if (dropoff > 30) return colors.status.warning;
    return colors.text.secondary;
  };

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

      {/* Maior dropoff em destaque */}
      {maxDropoff && maxDropoff.dropoffPercent > 20 && (
        <View style={[styles.dropoffAlert, { backgroundColor: colors.status.warning + '15' }]}>
          <Ionicons name="trending-down" size={18} color={colors.status.warning} />
          <Text style={[styles.dropoffAlertText, { color: colors.text.primary }]}>
            Maior dropoff: <Text style={{ fontWeight: '700' }}>{maxDropoff.label}</Text> (
            {maxDropoff.dropoffPercent}%)
          </Text>
        </View>
      )}

      {/* Funil visual */}
      <View style={styles.funnelContainer}>
        {data.map((stage, index) => (
          <View key={stage.stage} style={styles.stageRow}>
            {/* Barra do funil */}
            <View style={styles.barContainer}>
              <View
                style={[
                  styles.bar,
                  {
                    backgroundColor: colors.primary.main,
                    width: getBarWidth(stage.percentage) as `${number}%`,
                    opacity: 0.3 + (stage.percentage / 100) * 0.7,
                  },
                ]}
              />
              <View style={styles.barContent}>
                <Text style={[styles.stageLabel, { color: colors.text.primary }]}>
                  {stage.label}
                </Text>
                <Text style={[styles.stageCount, { color: colors.text.primary }]}>
                  {stage.count.toLocaleString()}
                </Text>
              </View>
            </View>

            {/* Indicador de dropoff (entre stages) */}
            {index < data.length - 1 && stage.dropoffPercent > 0 && (
              <View style={styles.dropoffIndicator}>
                <View style={[styles.dropoffLine, { backgroundColor: colors.border.light }]} />
                <View style={styles.dropoffBadge}>
                  <Ionicons
                    name="arrow-down"
                    size={12}
                    color={getDropoffColor(stage.dropoffPercent)}
                  />
                  <Text
                    style={[styles.dropoffText, { color: getDropoffColor(stage.dropoffPercent) }]}
                  >
                    -{stage.dropoffPercent}%
                  </Text>
                </View>
              </View>
            )}
          </View>
        ))}
      </View>

      {/* Legenda */}
      <View style={[styles.legend, { borderTopColor: colors.border.light }]}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.primary.main }]} />
          <Text style={[styles.legendText, { color: colors.text.secondary }]}>
            Taxa de conversao desde o inicio
          </Text>
        </View>
      </View>

      {/* Recomendacao */}
      {maxDropoff && maxDropoff.dropoffPercent > 30 && (
        <View
          style={[
            styles.recommendation,
            { backgroundColor: colors.background.beige || colors.background.elevated },
          ]}
        >
          <Text style={[styles.recommendationTitle, { color: colors.text.primary }]}>
            Acao Recomendada
          </Text>
          <Text style={[styles.recommendationText, { color: colors.text.secondary }]}>
            {getStageRecommendation(maxDropoff.stage)}
          </Text>
        </View>
      )}
    </View>
  );
});

// Recomendacoes por stage
function getStageRecommendation(stage: string): string {
  const recommendations: Record<string, string> = {
    onboarding_started: 'Simplificar tela inicial ou adicionar skip option',
    onboarding_profile: 'Reduzir campos obrigatorios ou dividir em etapas',
    onboarding_baby: 'Permitir adicionar bebe depois ou simplificar formulario',
    onboarding_complete: 'Revisar ultima etapa do onboarding',
    aha_moment_nathia: 'Melhorar descoberta da NathIA ou prompt inicial',
    aha_moment_tracker: 'Tornar tracker mais visivel ou simplificar uso',
    aha_moment_community: 'Melhorar onboarding da comunidade ou conteudo inicial',
    first_week_active: 'Implementar notificacoes de engajamento na primeira semana',
    subscription_viewed: 'Revisar timing e proposta de valor da oferta',
    subscription_started: 'Simplificar checkout ou oferecer trial',
  };

  return recommendations[stage] || 'Analisar dados qualitativos para entender o dropoff';
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
  dropoffAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Tokens.spacing['3'],
    borderRadius: Tokens.radius.md,
    gap: Tokens.spacing['2'],
    marginBottom: Tokens.spacing['3'],
  },
  dropoffAlertText: {
    flex: 1,
    fontSize: Tokens.typography.sizes.sm,
  },
  funnelContainer: {
    marginVertical: Tokens.spacing['2'],
  },
  stageRow: {
    marginBottom: Tokens.spacing['1'],
  },
  barContainer: {
    position: 'relative',
    height: 44,
    justifyContent: 'center',
  },
  bar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    borderRadius: Tokens.radius.md,
  },
  barContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Tokens.spacing['3'],
    zIndex: 1,
  },
  stageLabel: {
    fontSize: Tokens.typography.sizes.sm,
    fontWeight: '500',
  },
  stageCount: {
    fontSize: Tokens.typography.sizes.sm,
    fontWeight: '600',
  },
  dropoffIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: Tokens.spacing['4'],
    marginVertical: 2,
  },
  dropoffLine: {
    width: 1,
    height: 12,
    marginRight: Tokens.spacing['2'],
  },
  dropoffBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  dropoffText: {
    fontSize: Tokens.typography.sizes.xs,
    fontWeight: '600',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: Tokens.spacing['3'],
    paddingTop: Tokens.spacing['3'],
    borderTopWidth: 1,
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
  recommendation: {
    marginTop: Tokens.spacing['4'],
    padding: Tokens.spacing['3'],
    borderRadius: Tokens.radius.md,
  },
  recommendationTitle: {
    fontSize: Tokens.typography.sizes.sm,
    fontWeight: '600',
    marginBottom: Tokens.spacing['1'],
  },
  recommendationText: {
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
