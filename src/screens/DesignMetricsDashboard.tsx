/**
 * DesignMetricsDashboard
 *
 * Dashboard para visualização de métricas de qualidade do design system.
 * Exibe cobertura de tokens, acessibilidade, dark mode e platform compliance.
 *
 * @module screens/DesignMetricsDashboard
 */

import {
  Activity,
  CheckCircle,
  AlertCircle,
  Eye,
  Moon,
  Smartphone,
  TrendingUp,
  TrendingDown,
  Minus,
  RefreshCw,
} from 'lucide-react-native';
import React, { useState, useEffect, useCallback } from 'react';
import { View, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Box } from '@/components/primitives/Box';
import { Button } from '@/components/primitives/Button';
import { Heading } from '@/components/primitives/Heading';
import { Text } from '@/components/primitives/Text';
import { useTheme } from '@/theme';
import { Tokens } from '@/theme/tokens';
import { logger } from '@/utils/logger';

// ======================
// 🎯 TYPES
// ======================

interface DesignMetric {
  id: string;
  label: string;
  value: number;
  target: number;
  trend: 'up' | 'down' | 'stable';
  icon: React.ComponentType<{ size: number; color: string }>;
  color: 'success' | 'warning' | 'error';
}

interface ValidationResult {
  passed: number;
  failed: number;
  warnings: number;
  timestamp: string;
}

// ======================
// 🎨 COMPONENTS
// ======================

const MetricCard: React.FC<{
  metric: DesignMetric;
  colors: ReturnType<typeof useTheme>['colors'];
}> = ({ metric, colors }) => {
  const Icon = metric.icon;
  const TrendIcon =
    metric.trend === 'up' ? TrendingUp : metric.trend === 'down' ? TrendingDown : Minus;

  const statusColor =
    metric.color === 'success'
      ? colors.status.success
      : metric.color === 'warning'
        ? colors.status.warning
        : colors.status.error;

  const progress = Math.min(100, (metric.value / metric.target) * 100);

  return (
    <Box
      p="4"
      rounded="lg"
      bg="card"
      style={{
        shadowColor: colors.text.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
      }}
    >
      {/* Header */}
      <Box direction="row" justify="space-between" align="center" mb="3">
        <Box direction="row" align="center" gap="2">
          <Box p="2" rounded="md" style={{ backgroundColor: `${statusColor}20` }}>
            <Icon size={20} color={statusColor} />
          </Box>
          <Text size="sm" weight="medium" color="secondary">
            {metric.label}
          </Text>
        </Box>
        <TrendIcon
          size={16}
          color={
            metric.trend === 'up'
              ? colors.status.success
              : metric.trend === 'down'
                ? colors.status.error
                : colors.text.tertiary
          }
        />
      </Box>

      {/* Value */}
      <Box mb="2">
        <Text size="2xl" weight="bold" color="primary">
          {metric.value}%
        </Text>
        <Text size="xs" color="tertiary">
          Meta: {metric.target}%
        </Text>
      </Box>

      {/* Progress Bar */}
      <Box
        rounded="full"
        style={{
          height: 6,
          backgroundColor: colors.border.light,
          overflow: 'hidden',
        }}
      >
        <View
          style={{
            width: `${progress}%`,
            height: '100%',
            backgroundColor: statusColor,
            borderRadius: Tokens.radius.full,
          }}
        />
      </Box>
    </Box>
  );
};

const ValidationCard: React.FC<{
  result: ValidationResult;
  colors: ReturnType<typeof useTheme>['colors'];
}> = ({ result, colors }) => {
  return (
    <Box
      p="4"
      rounded="lg"
      bg="card"
      style={{
        shadowColor: colors.text.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
      }}
    >
      <Box direction="row" justify="space-between" align="center" mb="4">
        <Heading level="h4">Última Validação</Heading>
        <Text size="xs" color="tertiary">
          {new Date(result.timestamp).toLocaleString('pt-BR')}
        </Text>
      </Box>

      <Box direction="row" gap="4">
        {/* Passed */}
        <Box
          flex={1}
          align="center"
          p="3"
          rounded="md"
          style={{ backgroundColor: `${colors.status.success}15` }}
        >
          <CheckCircle size={24} color={colors.status.success} />
          <Text size="xl" weight="bold" style={{ color: colors.status.success }}>
            {result.passed}
          </Text>
          <Text size="xs" color="tertiary">
            Passou
          </Text>
        </Box>

        {/* Warnings */}
        <Box
          flex={1}
          align="center"
          p="3"
          rounded="md"
          style={{ backgroundColor: `${colors.status.warning}15` }}
        >
          <AlertCircle size={24} color={colors.status.warning} />
          <Text size="xl" weight="bold" style={{ color: colors.status.warning }}>
            {result.warnings}
          </Text>
          <Text size="xs" color="tertiary">
            Avisos
          </Text>
        </Box>

        {/* Failed */}
        <Box
          flex={1}
          align="center"
          p="3"
          rounded="md"
          style={{ backgroundColor: `${colors.status.error}15` }}
        >
          <AlertCircle size={24} color={colors.status.error} />
          <Text size="xl" weight="bold" style={{ color: colors.status.error }}>
            {result.failed}
          </Text>
          <Text size="xs" color="tertiary">
            Falhou
          </Text>
        </Box>
      </Box>

      {/* Summary */}
      <Box mt="4" p="3" rounded="md" style={{ backgroundColor: colors.background.canvas }}>
        <Text size="sm" color="secondary" align="center">
          {result.failed === 0
            ? '✅ Todas as validações críticas passaram!'
            : `⚠️ ${result.failed} validações precisam de atenção`}
        </Text>
      </Box>
    </Box>
  );
};

// ======================
// 📱 MAIN SCREEN
// ======================

export default function DesignMetricsDashboard() {
  const { colors } = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [metrics, setMetrics] = useState<DesignMetric[]>([]);
  const [validation, setValidation] = useState<ValidationResult | null>(null);

  // Load initial metrics
  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = useCallback(async () => {
    try {
      // Em produção, carregar de API ou executar validações
      // Por agora, usar dados simulados baseados em validações reais

      setMetrics([
        {
          id: 'token-coverage',
          label: 'Cobertura de Tokens',
          value: 95,
          target: 95,
          trend: 'up',
          icon: Activity,
          color: 'success',
        },
        {
          id: 'accessibility',
          label: 'Acessibilidade',
          value: 87,
          target: 95,
          trend: 'up',
          icon: Eye,
          color: 'warning',
        },
        {
          id: 'dark-mode',
          label: 'Dark Mode',
          value: 100,
          target: 100,
          trend: 'stable',
          icon: Moon,
          color: 'success',
        },
        {
          id: 'platform',
          label: 'iOS/Android',
          value: 92,
          target: 95,
          trend: 'up',
          icon: Smartphone,
          color: 'warning',
        },
      ]);

      setValidation({
        passed: 7,
        failed: 0,
        warnings: 1,
        timestamp: new Date().toISOString(),
      });

      logger.info('[DesignMetricsDashboard] Métricas carregadas');
    } catch (error) {
      logger.error('[DesignMetricsDashboard] Erro ao carregar métricas', error);
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadMetrics();
    setRefreshing(false);
  }, [loadMetrics]);

  const runValidation = useCallback(async () => {
    setRefreshing(true);
    try {
      // Executar validações via scripts
      // npm run validate:pre-deploy
      await loadMetrics();
    } catch (error) {
      logger.error('[DesignMetricsDashboard] Erro na validação', error);
    }
    setRefreshing(false);
  }, [loadMetrics]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.canvas }} edges={['top']}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: Tokens.spacing['4'] }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary.main}
          />
        }
      >
        {/* Header */}
        <Box mb="6">
          <Box mb="1">
            <Heading level="h2">📊 Design System</Heading>
          </Box>
          <Text color="secondary">Métricas de qualidade e conformidade</Text>
        </Box>

        {/* Validation Result */}
        {validation && (
          <Box mb="6">
            <ValidationCard result={validation} colors={colors} />
          </Box>
        )}

        {/* Metrics Grid */}
        <Box mb="6">
          <Box mb="4">
            <Heading level="h4">Métricas de Qualidade</Heading>
          </Box>
          <Box gap="4">
            <Box direction="row" gap="4">
              {metrics.slice(0, 2).map((metric) => (
                <Box key={metric.id} flex={1}>
                  <MetricCard metric={metric} colors={colors} />
                </Box>
              ))}
            </Box>
            <Box direction="row" gap="4">
              {metrics.slice(2, 4).map((metric) => (
                <Box key={metric.id} flex={1}>
                  <MetricCard metric={metric} colors={colors} />
                </Box>
              ))}
            </Box>
          </Box>
        </Box>

        {/* Quick Actions */}
        <Box mb="6">
          <Box mb="4">
            <Heading level="h4">Ações Rápidas</Heading>
          </Box>
          <Box gap="3">
            <Button
              title="Executar Validação Completa"
              onPress={runValidation}
              variant="primary"
              loading={refreshing}
              leftIcon={<RefreshCw size={18} color={colors.text.inverse} />}
            />
            <Button
              title="Ver Relatório Detalhado"
              onPress={() => {
                // Navegar para relatório detalhado
                logger.info('[DesignMetricsDashboard] Abrindo relatório');
              }}
              variant="outline"
            />
          </Box>
        </Box>

        {/* Info Section */}
        <Box p="4" rounded="lg" style={{ backgroundColor: `${colors.primary.main}10` }}>
          <Box mb="2">
            <Heading level="h5">ℹ️ Como interpretar</Heading>
          </Box>
          <Text size="sm" color="secondary">
            • <Text weight="semibold">Cobertura de Tokens:</Text> % de estilos usando design tokens
            {'\n'}• <Text weight="semibold">Acessibilidade:</Text> Score WCAG AAA (contraste, touch
            targets){'\n'}• <Text weight="semibold">Dark Mode:</Text> % de componentes com suporte a
            tema escuro{'\n'}• <Text weight="semibold">iOS/Android:</Text> Conformidade com
            guidelines de cada plataforma
          </Text>
        </Box>
      </ScrollView>
    </SafeAreaView>
  );
}
