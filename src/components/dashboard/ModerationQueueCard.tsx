/**
 * ModerationQueueCard - Card da fila de moderacao
 *
 * Mostra:
 * - Numero de items pendentes
 * - Barra de progresso (quanto mais vazia, melhor)
 * - Tempo medio de processamento
 * - Alerta se > 50 items
 */

import { Ionicons } from '@expo/vector-icons';
import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { useThemeColors } from '@/hooks/useTheme';
import type { ModerationQueueStats } from '@/services/dashboardService';
import { Tokens } from '@/theme/tokens';

interface ModerationQueueCardProps {
  data: ModerationQueueStats | null;
  title?: string;
  maxThreshold?: number;
}

export const ModerationQueueCard = memo(function ModerationQueueCard({
  data,
  title = 'Fila de Moderacao',
  maxThreshold = 50,
}: ModerationQueueCardProps) {
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

  const isAlert = data.pendingCount > maxThreshold;
  const isWarning = data.pendingCount > maxThreshold / 2;
  const isEmpty = data.pendingCount === 0;

  // Cor da barra de progresso
  const progressColor = isAlert
    ? colors.status.error
    : isWarning
      ? colors.status.warning
      : colors.status.success;

  // Status text
  const statusText = isEmpty
    ? 'Fila vazia'
    : isAlert
      ? 'Fila sobrecarregada'
      : isWarning
        ? 'Atencao necessaria'
        : 'Fila saudavel';

  const statusIcon = isEmpty ? 'checkmark-circle' : isAlert ? 'alert-circle' : 'time';

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.background.card },
        isAlert && styles.alertContainer,
        isAlert && { borderColor: colors.status.error },
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text.primary }]}>{title}</Text>
        <View style={[styles.statusBadge, { backgroundColor: progressColor + '20' }]}>
          <Ionicons name={statusIcon} size={14} color={progressColor} />
          <Text style={[styles.statusText, { color: progressColor }]}>{statusText}</Text>
        </View>
      </View>

      {/* Numero principal */}
      <View style={styles.mainRow}>
        <View style={styles.numberBox}>
          <Text
            style={[
              styles.pendingCount,
              { color: isAlert ? colors.status.error : colors.text.primary },
            ]}
          >
            {data.pendingCount}
          </Text>
          <Text style={[styles.pendingLabel, { color: colors.text.secondary }]}>pendentes</Text>
        </View>

        {data.highPriorityCount > 0 && (
          <View style={[styles.priorityBox, { borderColor: colors.status.warning }]}>
            <Text style={[styles.priorityCount, { color: colors.status.warning }]}>
              {data.highPriorityCount}
            </Text>
            <Text style={[styles.priorityLabel, { color: colors.text.secondary }]}>
              alta prioridade
            </Text>
          </View>
        )}
      </View>

      {/* Barra de progresso */}
      <View style={styles.progressSection}>
        <View style={styles.progressHeader}>
          <Text style={[styles.progressLabel, { color: colors.text.secondary }]}>
            Capacidade da fila
          </Text>
          <Text style={[styles.progressValue, { color: colors.text.secondary }]}>
            {data.pendingCount} / {maxThreshold}
          </Text>
        </View>
        <View style={[styles.progressBar, { backgroundColor: colors.border.light }]}>
          <View
            style={[
              styles.progressFill,
              {
                backgroundColor: progressColor,
                width: `${Math.min(100, (data.pendingCount / maxThreshold) * 100)}%`,
              },
            ]}
          />
        </View>
      </View>

      {/* Metricas adicionais */}
      <View style={[styles.metricsRow, { borderTopColor: colors.border.light }]}>
        <View style={styles.metricItem}>
          <Ionicons name="time-outline" size={16} color={colors.text.secondary} />
          <Text style={[styles.metricValue, { color: colors.text.primary }]}>
            {formatLatency(data.avgQueueLatencyMs)}
          </Text>
          <Text style={[styles.metricLabel, { color: colors.text.secondary }]}>tempo medio</Text>
        </View>

        {data.oldestPendingMinutes > 0 && (
          <View style={styles.metricItem}>
            <Ionicons name="hourglass-outline" size={16} color={colors.text.secondary} />
            <Text style={[styles.metricValue, { color: colors.text.primary }]}>
              {formatMinutes(data.oldestPendingMinutes)}
            </Text>
            <Text style={[styles.metricLabel, { color: colors.text.secondary }]}>mais antigo</Text>
          </View>
        )}
      </View>

      {/* Alerta */}
      {isAlert && (
        <View style={[styles.alertMessage, { backgroundColor: colors.status.error + '10' }]}>
          <Ionicons name="notifications" size={18} color={colors.status.error} />
          <Text style={[styles.alertMessageText, { color: colors.status.error }]}>
            Notificar moderadores: fila excedeu limite.
          </Text>
        </View>
      )}
    </View>
  );
});

// Formatar latencia em ms para texto legivel
function formatLatency(ms: number): string {
  if (ms < 1000) return `${Math.round(ms)}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  if (ms < 3600000) return `${Math.round(ms / 60000)}min`;
  return `${(ms / 3600000).toFixed(1)}h`;
}

// Formatar minutos para texto legivel
function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes}min`;
  if (minutes < 1440) return `${Math.round(minutes / 60)}h`;
  return `${Math.round(minutes / 1440)}d`;
}

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
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Tokens.spacing['2'],
    paddingVertical: Tokens.spacing['1'],
    borderRadius: Tokens.radius.full,
    gap: 4,
  },
  statusText: {
    fontSize: Tokens.typography.sizes.xs,
    fontWeight: '600',
  },
  mainRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: Tokens.spacing['4'],
  },
  numberBox: {
    alignItems: 'center',
  },
  pendingCount: {
    fontSize: 48,
    fontWeight: '700',
    lineHeight: 56,
  },
  pendingLabel: {
    fontSize: Tokens.typography.sizes.sm,
  },
  priorityBox: {
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: Tokens.radius.md,
    padding: Tokens.spacing['2'],
  },
  priorityCount: {
    fontSize: 32,
    fontWeight: '700',
  },
  priorityLabel: {
    fontSize: Tokens.typography.sizes.xs,
  },
  progressSection: {
    marginBottom: Tokens.spacing['3'],
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Tokens.spacing['1'],
  },
  progressLabel: {
    fontSize: Tokens.typography.sizes.sm,
  },
  progressValue: {
    fontSize: Tokens.typography.sizes.sm,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: Tokens.spacing['3'],
    borderTopWidth: 1,
  },
  metricItem: {
    alignItems: 'center',
    gap: 2,
  },
  metricValue: {
    fontSize: Tokens.typography.sizes.md,
    fontWeight: '600',
  },
  metricLabel: {
    fontSize: Tokens.typography.sizes.xs,
  },
  alertMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Tokens.spacing['3'],
    borderRadius: Tokens.radius.md,
    gap: Tokens.spacing['2'],
    marginTop: Tokens.spacing['3'],
  },
  alertMessageText: {
    flex: 1,
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
