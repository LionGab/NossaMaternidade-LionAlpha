/**
 * DashboardSummaryCard - Card de resumo do dashboard
 *
 * Mostra metricas principais em um card compacto:
 * - Crises hoje
 * - Crises criticas
 * - CVV clicks
 * - Follow-ups pendentes
 */

import { Ionicons } from '@expo/vector-icons';
import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { useThemeColors } from '@/hooks/useTheme';
import type { DashboardSummary } from '@/services/dashboardService';
import { Tokens } from '@/theme/tokens';

interface DashboardSummaryCardProps {
  data: DashboardSummary | null;
  isLoading?: boolean;
}

export const DashboardSummaryCard = memo(function DashboardSummaryCard({
  data,
  isLoading = false,
}: DashboardSummaryCardProps) {
  const colors = useThemeColors();

  if (isLoading || !data) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background.card }]}>
        <View style={styles.loadingState}>
          <Text style={[styles.loadingText, { color: colors.text.secondary }]}>
            Carregando resumo...
          </Text>
        </View>
      </View>
    );
  }

  const metrics = [
    {
      icon: 'heart-outline' as const,
      label: 'Crises Hoje',
      value: data.crisesToday,
      color: colors.primary.main,
    },
    {
      icon: 'alert-circle' as const,
      label: 'Criticas',
      value: data.criticalToday,
      color: colors.status.error,
    },
    {
      icon: 'call' as const,
      label: 'CVV Clicks',
      value: data.cvvClicksToday,
      color: colors.status.warning,
    },
    {
      icon: 'time' as const,
      label: 'Follow-ups',
      value: data.pendingFollowups,
      color: colors.status.info,
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background.card }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text.primary }]}>Resumo do Dia</Text>
        <Text style={[styles.timestamp, { color: colors.text.tertiary }]}>
          Atualizado {formatTime(data.refreshedAt)}
        </Text>
      </View>

      <View style={styles.metricsGrid}>
        {metrics.map((metric) => (
          <View key={metric.label} style={styles.metricItem}>
            <Ionicons name={metric.icon} size={20} color={metric.color} />
            <Text style={[styles.metricValue, { color: colors.text.primary }]}>{metric.value}</Text>
            <Text style={[styles.metricLabel, { color: colors.text.secondary }]}>
              {metric.label}
            </Text>
          </View>
        ))}
      </View>

      {/* Indicador de 7 dias */}
      <View style={[styles.weekSummary, { borderTopColor: colors.border.light }]}>
        <Text style={[styles.weekLabel, { color: colors.text.secondary }]}>Ultimos 7 dias:</Text>
        <Text style={[styles.weekValue, { color: colors.text.primary }]}>
          {data.crises7d} crises
        </Text>
      </View>
    </View>
  );
});

function formatTime(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return 'agora';
  if (diffMins < 60) return `ha ${diffMins}min`;
  return `ha ${Math.floor(diffMins / 60)}h`;
}

const styles = StyleSheet.create({
  container: {
    padding: Tokens.spacing['4'],
    borderRadius: Tokens.radius.lg,
    marginBottom: Tokens.spacing['4'],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Tokens.spacing['4'],
  },
  title: {
    fontSize: Tokens.typography.sizes.lg,
    fontWeight: '600',
  },
  timestamp: {
    fontSize: Tokens.typography.sizes.xs,
  },
  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metricItem: {
    alignItems: 'center',
    flex: 1,
  },
  metricValue: {
    fontSize: Tokens.typography.sizes['2xl'],
    fontWeight: '700',
    marginTop: Tokens.spacing['1'],
  },
  metricLabel: {
    fontSize: Tokens.typography.sizes.xs,
    textAlign: 'center',
  },
  weekSummary: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Tokens.spacing['4'],
    paddingTop: Tokens.spacing['3'],
    borderTopWidth: 1,
    gap: Tokens.spacing['2'],
  },
  weekLabel: {
    fontSize: Tokens.typography.sizes.sm,
  },
  weekValue: {
    fontSize: Tokens.typography.sizes.sm,
    fontWeight: '600',
  },
  loadingState: {
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: Tokens.typography.sizes.md,
  },
});
