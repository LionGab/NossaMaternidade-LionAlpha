/**
 * Cost Tracker
 * Rastreamento de custos de uso de IA para observabilidade
 *
 * Permite:
 * - Logging de uso de tokens por modelo
 * - Estimativa de custos em USD
 * - Agregação por perfil, provider, usuário
 * - Alertas de limite de custo
 */

import { supabase } from '../../services/supabase';
import { logger } from '../../utils/logger';
import { LlmProfile, LlmProvider, estimateCost } from '../llmConfig';

/**
 * Registro de uso de IA
 */
export interface AIUsageRecord {
  id?: string;
  user_id: string;
  profile: LlmProfile;
  provider: LlmProvider;
  model_name: string;
  input_tokens: number;
  output_tokens: number;
  total_tokens: number;
  estimated_cost_usd: number;
  latency_ms?: number;
  success: boolean;
  error_message?: string;
  metadata?: Record<string, unknown>;
  created_at?: string;
}

/**
 * Estatísticas de uso agregadas
 */
export interface UsageStats {
  totalCalls: number;
  totalTokens: number;
  totalCostUSD: number;
  byProvider: Record<LlmProvider, { calls: number; cost: number }>;
  byProfile: Record<LlmProfile, { calls: number; cost: number }>;
  avgLatencyMs: number;
  successRate: number;
}

/**
 * Configuração de limites de custo
 */
interface CostLimits {
  dailyLimitUSD: number;
  monthlyLimitUSD: number;
  alertThreshold: number; // 0-1 (ex: 0.8 = alerta em 80%)
}

/**
 * Serviço de rastreamento de custos
 */
export class CostTracker {
  private static costLimits: CostLimits = {
    dailyLimitUSD: 10.0, // $10/dia default
    monthlyLimitUSD: 200.0, // $200/mês default
    alertThreshold: 0.8,
  };

  /**
   * Configura limites de custo
   */
  static setCostLimits(limits: Partial<CostLimits>): void {
    this.costLimits = { ...this.costLimits, ...limits };
  }

  /**
   * Registra uso de IA
   * @param record - Registro de uso
   */
  static async trackUsage(record: Omit<AIUsageRecord, 'id' | 'created_at'>): Promise<void> {
    try {
      // Log local
      if (process.env.EXPO_PUBLIC_LOG_AI_COSTS === 'true') {
        logger.info('[CostTracker] AI Usage', {
          profile: record.profile,
          provider: record.provider,
          tokens: record.total_tokens,
          cost: `$${record.estimated_cost_usd.toFixed(4)}`,
          success: record.success,
        });
      }

      // Salvar no Supabase (tabela ai_usage_logs)
      const { error } = await supabase.from('ai_usage_logs').insert({
        user_id: record.user_id,
        profile: record.profile,
        provider: record.provider,
        model_name: record.model_name,
        input_tokens: record.input_tokens,
        output_tokens: record.output_tokens,
        total_tokens: record.total_tokens,
        estimated_cost_usd: record.estimated_cost_usd,
        latency_ms: record.latency_ms,
        success: record.success,
        error_message: record.error_message,
        metadata: record.metadata || {},
      });

      if (error) {
        logger.error('[CostTracker] Failed to save usage to Supabase', error);
      }

      // Verificar limites de custo
      await this.checkCostLimits(record.user_id);
    } catch (error) {
      logger.error('[CostTracker] Failed to track usage', error);
    }
  }

  /**
   * Rastreia uso com medição de latência
   */
  static async trackCall<T>(
    userId: string,
    profile: LlmProfile,
    provider: LlmProvider,
    modelName: string,
    call: () => Promise<T>
  ): Promise<T> {
    const startTime = Date.now();
    let success = true;
    let errorMessage: string | undefined = undefined;
    let inputTokens = 0;
    let outputTokens = 0;

    try {
      const result = await call();

      // Tentar extrair tokens do resultado (se disponível)
      if (result && typeof result === 'object' && 'usage' in result && result.usage) {
        const usage = result.usage as { inputTokens?: number; outputTokens?: number };
        inputTokens = usage.inputTokens || 0;
        outputTokens = usage.outputTokens || 0;
      }

      return result;
    } catch (error) {
      success = false;
      errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw error;
    } finally {
      const latencyMs = Date.now() - startTime;
      const totalTokens = inputTokens + outputTokens;
      const estimatedCostUsd = estimateCost(profile, inputTokens, outputTokens);

      // Registrar uso (sem await para não bloquear)
      this.trackUsage({
        user_id: userId,
        profile,
        provider,
        model_name: modelName,
        input_tokens: inputTokens,
        output_tokens: outputTokens,
        total_tokens: totalTokens,
        estimated_cost_usd: estimatedCostUsd,
        latency_ms: latencyMs,
        success,
        error_message: errorMessage,
      }).catch((err) => {
        logger.error('[CostTracker] Failed to track usage in finally', err);
      });
    }
  }

  /**
   * Verifica se limites de custo foram atingidos
   */
  private static async checkCostLimits(userId: string): Promise<void> {
    try {
      // Obter custo do dia
      const today = new Date().toISOString().split('T')[0];
      const { data: dailyData, error: dailyError } = await supabase
        .from('ai_usage_logs')
        .select('estimated_cost_usd')
        .eq('user_id', userId)
        .gte('created_at', today);

      if (dailyError) throw dailyError;

      const dailyCost = (dailyData || []).reduce(
        (sum, record) => sum + (record.estimated_cost_usd || 0),
        0
      );

      // Verificar limite diário
      if (dailyCost >= this.costLimits.dailyLimitUSD * this.costLimits.alertThreshold) {
        logger.warn('[CostTracker] Daily cost limit threshold reached', {
          userId,
          dailyCost: `$${dailyCost.toFixed(2)}`,
          limit: `$${this.costLimits.dailyLimitUSD}`,
        });
      }

      // Obter custo do mês
      const monthStart = new Date();
      monthStart.setDate(1);
      monthStart.setHours(0, 0, 0, 0);

      const { data: monthlyData, error: monthlyError } = await supabase
        .from('ai_usage_logs')
        .select('estimated_cost_usd')
        .eq('user_id', userId)
        .gte('created_at', monthStart.toISOString());

      if (monthlyError) throw monthlyError;

      const monthlyCost = (monthlyData || []).reduce(
        (sum, record) => sum + (record.estimated_cost_usd || 0),
        0
      );

      // Verificar limite mensal
      if (monthlyCost >= this.costLimits.monthlyLimitUSD * this.costLimits.alertThreshold) {
        logger.warn('[CostTracker] Monthly cost limit threshold reached', {
          userId,
          monthlyCost: `$${monthlyCost.toFixed(2)}`,
          limit: `$${this.costLimits.monthlyLimitUSD}`,
        });
      }
    } catch (error) {
      logger.error('[CostTracker] Failed to check cost limits', error);
    }
  }

  /**
   * Obtém estatísticas de uso para um usuário
   */
  static async getUserStats(userId: string, startDate?: Date, endDate?: Date): Promise<UsageStats> {
    try {
      let query = supabase.from('ai_usage_logs').select('*').eq('user_id', userId);

      if (startDate) {
        query = query.gte('created_at', startDate.toISOString());
      }

      if (endDate) {
        query = query.lte('created_at', endDate.toISOString());
      }

      const { data, error } = await query;

      if (error) throw error;

      const records = (data || []) as AIUsageRecord[];

      return this.aggregateStats(records);
    } catch (error) {
      logger.error('[CostTracker] Failed to get user stats', error);
      return this.emptyStats();
    }
  }

  /**
   * Obtém estatísticas globais (todos os usuários)
   */
  static async getGlobalStats(startDate?: Date, endDate?: Date): Promise<UsageStats> {
    try {
      let query = supabase.from('ai_usage_logs').select('*');

      if (startDate) {
        query = query.gte('created_at', startDate.toISOString());
      }

      if (endDate) {
        query = query.lte('created_at', endDate.toISOString());
      }

      const { data, error } = await query;

      if (error) throw error;

      const records = (data || []) as AIUsageRecord[];

      return this.aggregateStats(records);
    } catch (error) {
      logger.error('[CostTracker] Failed to get global stats', error);
      return this.emptyStats();
    }
  }

  /**
   * Agrega estatísticas de registros de uso
   */
  private static aggregateStats(records: AIUsageRecord[]): UsageStats {
    const totalCalls = records.length;
    const totalTokens = records.reduce((sum, r) => sum + (r.total_tokens || 0), 0);
    const totalCostUSD = records.reduce((sum, r) => sum + (r.estimated_cost_usd || 0), 0);

    const byProvider: Record<LlmProvider, { calls: number; cost: number }> = {
      gemini: { calls: 0, cost: 0 },
      openai: { calls: 0, cost: 0 },
      anthropic: { calls: 0, cost: 0 },
    };

    const byProfile: Partial<Record<LlmProfile, { calls: number; cost: number }>> = {};

    let totalLatencyMs = 0;
    let latencyCount = 0;
    let successCount = 0;

    for (const record of records) {
      // Por provider
      if (record.provider in byProvider) {
        byProvider[record.provider].calls += 1;
        byProvider[record.provider].cost += record.estimated_cost_usd || 0;
      }

      // Por profile
      if (!byProfile[record.profile]) {
        byProfile[record.profile] = { calls: 0, cost: 0 };
      }
      byProfile[record.profile]!.calls += 1;
      byProfile[record.profile]!.cost += record.estimated_cost_usd || 0;

      // Latência
      if (record.latency_ms) {
        totalLatencyMs += record.latency_ms;
        latencyCount += 1;
      }

      // Sucesso
      if (record.success) {
        successCount += 1;
      }
    }

    const avgLatencyMs = latencyCount > 0 ? totalLatencyMs / latencyCount : 0;
    const successRate = totalCalls > 0 ? successCount / totalCalls : 0;

    return {
      totalCalls,
      totalTokens,
      totalCostUSD,
      byProvider,
      byProfile: byProfile as Record<LlmProfile, { calls: number; cost: number }>,
      avgLatencyMs,
      successRate,
    };
  }

  /**
   * Retorna estatísticas vazias
   */
  private static emptyStats(): UsageStats {
    return {
      totalCalls: 0,
      totalTokens: 0,
      totalCostUSD: 0,
      byProvider: {
        gemini: { calls: 0, cost: 0 },
        openai: { calls: 0, cost: 0 },
        anthropic: { calls: 0, cost: 0 },
      },
      byProfile: {} as Record<LlmProfile, { calls: number; cost: number }>,
      avgLatencyMs: 0,
      successRate: 0,
    };
  }
}
