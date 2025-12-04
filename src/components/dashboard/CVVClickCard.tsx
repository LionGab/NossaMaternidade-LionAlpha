/**
 * CVVClickCard - Card de cliques no CVV
 *
 * Mostra:
 * - Numero de cliques hoje (destaque grande)
 * - Variacao % em relacao a ontem
 * - Alerta se aumento > 20%
 */

import { Ionicons } from '@expo/vector-icons';
import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { useThemeColors } from '@/hooks/useTheme';
import type { CVVClickStats } from '@/services/dashboardService';
import { Tokens } from '@/theme/tokens';

interface CVVClickCardProps {
  data: CVVClickStats | null;
  title?: string;
}

export const CVVClickCard = memo(function CVVClickCard({
  data,
  title = 'Cliques no CVV',
}: CVVClickCardProps) {
  const colors = useThemeColors();

  if (!data) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background.card }]}>
        <Text style={[styles.title, { color: colors.text.primary }]}>{title}</Text>
        <View style={styles.loadingState}>
          <Text style={[styles.loadingText, { color: colors.text.secondary }]}>Carregando...</Text>
        </View>
      </View>
    );
  }

  const isPositiveChange = data.variationPercent > 0;
  const isNegativeChange = data.variationPercent < 0;
  const isAlert = data.alertThresholdExceeded;

  // Cores baseadas na variacao
  const variationColor = isAlert
    ? colors.status.error
    : isPositiveChange
      ? colors.status.warning
      : colors.status.success;

  const variationIcon = isPositiveChange ? 'arrow-up' : isNegativeChange ? 'arrow-down' : 'remove';

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.background.card },
        isAlert && styles.alertContainer,
        isAlert && { borderColor: colors.status.error },
      ]}
    >
      {/* Header com alerta */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text.primary }]}>{title}</Text>
        {isAlert && (
          <View style={[styles.alertBadge, { backgroundColor: colors.status.error }]}>
            <Ionicons name="warning" size={14} color={colors.text.inverse} />
            <Text style={[styles.alertBadgeText, { color: colors.text.inverse }]}>Alerta</Text>
          </View>
        )}
      </View>

      {/* Numero principal */}
      <View style={styles.mainNumber}>
        <Text
          style={[
            styles.todayCount,
            { color: isAlert ? colors.status.error : colors.text.primary },
          ]}
        >
          {data.todayCount}
        </Text>
        <Text style={[styles.todayLabel, { color: colors.text.secondary }]}>cliques hoje</Text>
      </View>

      {/* Variacao */}
      <View style={styles.variationRow}>
        <View style={[styles.variationBadge, { backgroundColor: variationColor + '20' }]}>
          <Ionicons name={variationIcon} size={16} color={variationColor} />
          <Text style={[styles.variationText, { color: variationColor }]}>
            {Math.abs(data.variationPercent).toFixed(1)}%
          </Text>
        </View>
        <Text style={[styles.comparisonText, { color: colors.text.secondary }]}>
          vs ontem ({data.yesterdayCount})
        </Text>
      </View>

      {/* Mensagem de contexto */}
      {isAlert && (
        <View style={[styles.alertMessage, { backgroundColor: colors.status.error + '10' }]}>
          <Ionicons name="information-circle" size={18} color={colors.status.error} />
          <Text style={[styles.alertMessageText, { color: colors.status.error }]}>
            Aumento significativo detectado. Investigar possiveis causas.
          </Text>
        </View>
      )}

      {/* Acoes rapidas */}
      <View style={[styles.quickActions, { borderTopColor: colors.border.light }]}>
        <Text style={[styles.quickActionLabel, { color: colors.text.secondary }]}>
          CVV: 188 (24h)
        </Text>
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
  alertContainer: {
    borderWidth: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Tokens.spacing['3'],
  },
  title: {
    fontSize: Tokens.typography.sizes.lg,
    fontWeight: '600',
  },
  alertBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Tokens.spacing['2'],
    paddingVertical: Tokens.spacing['1'],
    borderRadius: Tokens.radius.full,
    gap: 4,
  },
  alertBadgeText: {
    fontSize: Tokens.typography.sizes.xs,
    fontWeight: '600',
  },
  mainNumber: {
    alignItems: 'center',
    marginBottom: Tokens.spacing['3'],
  },
  todayCount: {
    fontSize: 56,
    fontWeight: '700',
    lineHeight: 64,
  },
  todayLabel: {
    fontSize: Tokens.typography.sizes.md,
  },
  variationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Tokens.spacing['2'],
    marginBottom: Tokens.spacing['3'],
  },
  variationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Tokens.spacing['2'],
    paddingVertical: Tokens.spacing['1'],
    borderRadius: Tokens.radius.md,
    gap: 4,
  },
  variationText: {
    fontSize: Tokens.typography.sizes.md,
    fontWeight: '600',
  },
  comparisonText: {
    fontSize: Tokens.typography.sizes.sm,
  },
  alertMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Tokens.spacing['3'],
    borderRadius: Tokens.radius.md,
    gap: Tokens.spacing['2'],
    marginBottom: Tokens.spacing['3'],
  },
  alertMessageText: {
    flex: 1,
    fontSize: Tokens.typography.sizes.sm,
  },
  quickActions: {
    alignItems: 'center',
    paddingTop: Tokens.spacing['2'],
    borderTopWidth: 1,
  },
  quickActionLabel: {
    fontSize: Tokens.typography.sizes.sm,
  },
  loadingState: {
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: Tokens.typography.sizes.md,
  },
});
