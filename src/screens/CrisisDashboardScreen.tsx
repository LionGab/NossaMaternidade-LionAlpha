/**
 * CrisisDashboardScreen - Dashboard de Monitoramento de Crises
 *
 * Tela principal para equipe de moderacao/suporte visualizar:
 * - Resumo do dia (crises, CVV, follow-ups)
 * - Graficos de tendencia
 * - Alertas ativos
 * - Fila de moderacao
 * - Funil de conversao
 */

import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useCallback, useMemo } from 'react';
import {
  View,
  ScrollView,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  DashboardSummaryCard,
  AlertBanner,
  CrisisLineChart,
  CrisisTypePieChart,
  CVVClickCard,
  ModerationQueueCard,
  FunnelChart,
  useDashboardData,
} from '@/components/dashboard';
import { useThemeColors } from '@/hooks/useTheme';
import { Tokens } from '@/theme/tokens';
import { logger } from '@/utils/logger';

// Dashboard components

export default function CrisisDashboardScreen() {
  const colors = useThemeColors();
  const navigation = useNavigation();

  // Dados do dashboard com realtime e polling
  const {
    summary,
    dailyStats,
    typeDistribution,
    cvvStats,
    moderationStats,
    funnelStats,
    alerts,
    isLoading,
    isRefreshing,
    error,
    lastUpdated,
    refresh,
  } = useDashboardData({
    pollingInterval: 60000, // 1 minuto
    enableRealtime: true,
    refreshOnForeground: true,
    dailyStatsDays: 30,
  });

  // Handler para voltar
  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  // Handler para dismiss de alerta
  const handleDismissAlert = useCallback((type: string) => {
    logger.info('[CrisisDashboard] Alerta fechado', { type });
    // TODO: Salvar estado de dismiss localmente
  }, []);

  // Handler para acao de alerta
  const handleAlertAction = useCallback((type: string) => {
    logger.info('[CrisisDashboard] Acao de alerta', { type });

    switch (type) {
      case 'moderation_queue':
        // TODO: Navegar para tela de moderacao
        break;
      case 'critical_crisis':
        // TODO: Navegar para lista de crises
        break;
      case 'cvv_increase':
        // Scroll para card de CVV
        break;
    }
  }, []);

  // Formatar ultima atualizacao
  const formattedLastUpdated = useMemo(() => {
    if (!lastUpdated) return null;
    return lastUpdated.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }, [lastUpdated]);

  // Loading state
  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background.canvas }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary.main} />
          <Text style={[styles.loadingText, { color: colors.text.secondary }]}>
            Carregando dashboard...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  if (error && !summary) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background.canvas }]}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color={colors.status.error} />
          <Text style={[styles.errorTitle, { color: colors.text.primary }]}>
            Erro ao carregar dashboard
          </Text>
          <Text style={[styles.errorMessage, { color: colors.text.secondary }]}>
            {error.message}
          </Text>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: colors.primary.main }]}
            onPress={refresh}
            accessibilityLabel="Tentar novamente"
            accessibilityRole="button"
          >
            <Text style={[styles.retryButtonText, { color: colors.text.inverse }]}>
              Tentar novamente
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background.canvas }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border.light }]}>
        <TouchableOpacity
          onPress={handleBack}
          style={styles.backButton}
          accessibilityLabel="Voltar"
          accessibilityRole="button"
        >
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, { color: colors.text.primary }]}>
            Dashboard de Crises
          </Text>
          {formattedLastUpdated && (
            <Text style={[styles.headerSubtitle, { color: colors.text.tertiary }]}>
              Atualizado as {formattedLastUpdated}
            </Text>
          )}
        </View>
        <TouchableOpacity
          onPress={refresh}
          style={styles.refreshButton}
          accessibilityLabel="Atualizar dashboard"
          accessibilityRole="button"
          disabled={isRefreshing}
        >
          {isRefreshing ? (
            <ActivityIndicator size="small" color={colors.primary.main} />
          ) : (
            <Ionicons name="refresh" size={22} color={colors.primary.main} />
          )}
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refresh}
            tintColor={colors.primary.main}
            colors={[colors.primary.main]}
          />
        }
      >
        {/* Alertas */}
        {alerts.length > 0 && (
          <AlertBanner
            alerts={alerts}
            onDismiss={handleDismissAlert}
            onAction={handleAlertAction}
          />
        )}

        {/* Resumo do dia */}
        <DashboardSummaryCard data={summary} isLoading={isLoading} />

        {/* Grafico de linha - Crises por dia */}
        <CrisisLineChart data={dailyStats} title="Crises por Dia" />

        {/* Row: CVV + Pie Chart */}
        <View style={styles.row}>
          <View style={styles.halfColumn}>
            <CVVClickCard data={cvvStats} />
          </View>
          <View style={styles.halfColumn}>
            <CrisisTypePieChart data={typeDistribution} title="Tipos" />
          </View>
        </View>

        {/* Fila de moderacao */}
        <ModerationQueueCard data={moderationStats} maxThreshold={50} />

        {/* Funil de conversao */}
        <FunnelChart data={funnelStats} title="Funil de Conversao" />

        {/* Spacer */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Tokens.spacing['4'],
    paddingVertical: Tokens.spacing['3'],
    borderBottomWidth: 1,
  },
  backButton: {
    padding: Tokens.spacing['2'],
    marginLeft: -Tokens.spacing['2'],
  },
  headerCenter: {
    flex: 1,
    marginHorizontal: Tokens.spacing['3'],
  },
  headerTitle: {
    fontSize: Tokens.typography.sizes.lg,
    fontWeight: '600',
  },
  headerSubtitle: {
    fontSize: Tokens.typography.sizes.xs,
    marginTop: 2,
  },
  refreshButton: {
    padding: Tokens.spacing['2'],
    marginRight: -Tokens.spacing['2'],
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Tokens.spacing['4'],
  },
  row: {
    flexDirection: 'row',
    marginHorizontal: -Tokens.spacing['2'],
  },
  halfColumn: {
    flex: 1,
    paddingHorizontal: Tokens.spacing['2'],
  },
  bottomSpacer: {
    height: Tokens.spacing['8'],
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: Tokens.spacing['4'],
    fontSize: Tokens.typography.sizes.md,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Tokens.spacing['6'],
  },
  errorTitle: {
    fontSize: Tokens.typography.sizes.lg,
    fontWeight: '600',
    marginTop: Tokens.spacing['4'],
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: Tokens.typography.sizes.md,
    marginTop: Tokens.spacing['2'],
    textAlign: 'center',
  },
  retryButton: {
    marginTop: Tokens.spacing['6'],
    paddingHorizontal: Tokens.spacing['6'],
    paddingVertical: Tokens.spacing['3'],
    borderRadius: Tokens.radius.md,
  },
  retryButtonText: {
    fontSize: Tokens.typography.sizes.md,
    fontWeight: '600',
  },
});
