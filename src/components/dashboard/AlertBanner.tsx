/**
 * AlertBanner - Banner de alertas do dashboard
 *
 * Mostra:
 * - Alertas ativos (CVV, moderacao, crises criticas)
 * - Severidade (warning, critical)
 * - Acoes rapidas para cada alerta
 */

import { Ionicons } from '@expo/vector-icons';
import React, { memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';

import { useThemeColors } from '@/hooks/useTheme';
import { Tokens } from '@/theme/tokens';

interface Alert {
  type: 'cvv_increase' | 'moderation_queue' | 'critical_crisis';
  severity: 'warning' | 'critical';
  message: string;
  value: number;
  threshold: number;
}

interface AlertBannerProps {
  alerts: Alert[];
  onDismiss?: (type: Alert['type']) => void;
  onAction?: (type: Alert['type']) => void;
}

const ALERT_CONFIG = {
  cvv_increase: {
    icon: 'call' as const,
    title: 'Aumento de CVV',
    action: 'Investigar',
  },
  moderation_queue: {
    icon: 'document-text' as const,
    title: 'Fila de Moderacao',
    action: 'Ver fila',
  },
  critical_crisis: {
    icon: 'warning' as const,
    title: 'Crise Critica',
    action: 'Ver detalhes',
  },
};

export const AlertBanner = memo(function AlertBanner({
  alerts,
  onDismiss,
  onAction,
}: AlertBannerProps) {
  const colors = useThemeColors();
  const textInverse = colors.text.inverse;

  if (alerts.length === 0) {
    return null;
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.scrollContainer}
      contentContainerStyle={styles.scrollContent}
    >
      {alerts.map((alert, index) => {
        const config = ALERT_CONFIG[alert.type];
        const isCritical = alert.severity === 'critical';
        const bgColor = isCritical ? colors.status.error : colors.status.warning;

        return (
          <View
            key={`${alert.type}-${index}`}
            style={[styles.alertCard, { backgroundColor: bgColor }]}
          >
            {/* Header */}
            <View style={styles.alertHeader}>
              <View style={styles.alertTitleRow}>
                <Ionicons name={config.icon} size={18} color={textInverse} />
                <Text style={[styles.alertTitle, { color: textInverse }]}>{config.title}</Text>
              </View>
              {onDismiss && (
                <TouchableOpacity
                  onPress={() => onDismiss(alert.type)}
                  style={styles.dismissButton}
                  accessibilityLabel="Fechar alerta"
                  accessibilityRole="button"
                >
                  <Ionicons name="close" size={18} color={textInverse} />
                </TouchableOpacity>
              )}
            </View>

            {/* Mensagem */}
            <Text style={[styles.alertMessage, { color: textInverse }]}>{alert.message}</Text>

            {/* Acao */}
            {onAction && (
              <TouchableOpacity
                onPress={() => onAction(alert.type)}
                style={styles.actionButton}
                accessibilityLabel={config.action}
                accessibilityRole="button"
              >
                <Text style={[styles.actionText, { color: textInverse }]}>{config.action}</Text>
                <Ionicons name="chevron-forward" size={14} color={textInverse} />
              </TouchableOpacity>
            )}
          </View>
        );
      })}
    </ScrollView>
  );
});

// Componente para alerta unico (full width)
export const AlertBannerSingle = memo(function AlertBannerSingle({
  alert,
  onDismiss,
  onAction,
}: {
  alert: Alert;
  onDismiss?: () => void;
  onAction?: () => void;
}) {
  const colors = useThemeColors();
  const textInverse = colors.text.inverse;
  const config = ALERT_CONFIG[alert.type];
  const isCritical = alert.severity === 'critical';
  const bgColor = isCritical ? colors.status.error : colors.status.warning;

  return (
    <View style={[styles.singleAlertCard, { backgroundColor: bgColor }]}>
      <View style={styles.singleAlertContent}>
        <View style={styles.singleAlertIcon}>
          <Ionicons name={config.icon} size={24} color={textInverse} />
        </View>
        <View style={styles.singleAlertText}>
          <Text style={[styles.singleAlertTitle, { color: textInverse }]}>{config.title}</Text>
          <Text style={[styles.singleAlertMessage, { color: textInverse }]}>{alert.message}</Text>
        </View>
      </View>

      <View style={styles.singleAlertActions}>
        {onAction && (
          <TouchableOpacity
            onPress={onAction}
            style={[styles.singleActionButton, { backgroundColor: colors.background.overlay }]}
            accessibilityLabel={config.action}
            accessibilityRole="button"
          >
            <Text style={[styles.singleActionText, { color: textInverse }]}>{config.action}</Text>
          </TouchableOpacity>
        )}
        {onDismiss && (
          <TouchableOpacity
            onPress={onDismiss}
            style={styles.singleDismissButton}
            accessibilityLabel="Fechar"
            accessibilityRole="button"
          >
            <Text style={[styles.singleDismissText, { color: textInverse }]}>Fechar</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
});

// Componente para mostrar contador de alertas
export const AlertCounter = memo(function AlertCounter({
  count,
  hasCritical,
  onPress,
}: {
  count: number;
  hasCritical: boolean;
  onPress?: () => void;
}) {
  const colors = useThemeColors();
  const textInverse = colors.text.inverse;

  if (count === 0) {
    return null;
  }

  const bgColor = hasCritical ? colors.status.error : colors.status.warning;

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.counterBadge, { backgroundColor: bgColor }]}
      accessibilityLabel={`${count} alertas ativos`}
      accessibilityRole="button"
    >
      <Ionicons name="notifications" size={16} color={textInverse} />
      <Text style={[styles.counterText, { color: textInverse }]}>{count}</Text>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  scrollContainer: {
    marginBottom: Tokens.spacing['4'],
  },
  scrollContent: {
    paddingHorizontal: Tokens.spacing['4'],
    gap: Tokens.spacing['3'],
  },
  alertCard: {
    width: 280,
    padding: Tokens.spacing['3'],
    borderRadius: Tokens.radius.lg,
  },
  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Tokens.spacing['2'],
  },
  alertTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Tokens.spacing['2'],
  },
  alertTitle: {
    fontSize: Tokens.typography.sizes.md,
    fontWeight: '600',
  },
  dismissButton: {
    padding: Tokens.spacing['1'],
  },
  alertMessage: {
    fontSize: Tokens.typography.sizes.sm,
    opacity: 0.9,
    marginBottom: Tokens.spacing['2'],
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
    paddingVertical: Tokens.spacing['1'],
  },
  actionText: {
    fontSize: Tokens.typography.sizes.sm,
    fontWeight: '600',
  },

  // Single alert styles
  singleAlertCard: {
    marginHorizontal: Tokens.spacing['4'],
    marginBottom: Tokens.spacing['4'],
    padding: Tokens.spacing['4'],
    borderRadius: Tokens.radius.lg,
  },
  singleAlertContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Tokens.spacing['3'],
  },
  singleAlertIcon: {
    marginRight: Tokens.spacing['3'],
  },
  singleAlertText: {
    flex: 1,
  },
  singleAlertTitle: {
    fontSize: Tokens.typography.sizes.lg,
    fontWeight: '600',
    marginBottom: 4,
  },
  singleAlertMessage: {
    fontSize: Tokens.typography.sizes.md,
    opacity: 0.9,
  },
  singleAlertActions: {
    flexDirection: 'row',
    gap: Tokens.spacing['2'],
  },
  singleActionButton: {
    flex: 1,
    paddingVertical: Tokens.spacing['2'],
    borderRadius: Tokens.radius.md,
    alignItems: 'center',
  },
  singleActionText: {
    fontSize: Tokens.typography.sizes.md,
    fontWeight: '600',
  },
  singleDismissButton: {
    paddingVertical: Tokens.spacing['2'],
    paddingHorizontal: Tokens.spacing['3'],
    alignItems: 'center',
  },
  singleDismissText: {
    fontSize: Tokens.typography.sizes.md,
    opacity: 0.8,
  },

  // Counter badge styles
  counterBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Tokens.spacing['2'],
    paddingVertical: Tokens.spacing['1'],
    borderRadius: Tokens.radius.full,
    gap: 4,
  },
  counterText: {
    fontSize: Tokens.typography.sizes.sm,
    fontWeight: '600',
  },
});
