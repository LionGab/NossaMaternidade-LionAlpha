/**
 * Exemplos de uso dos Advanced Tool Use Patterns
 *
 * Este arquivo demonstra como usar os novos patterns implementados:
 * - Parallel execution
 * - Result aggregation
 * - Retry logic
 * - Lazy loading
 *
 * Baseado em: https://www.anthropic.com/engineering/advanced-tool-use
 */

import { JsonValue } from '../../mcp/types';
import { logger } from '../../utils/logger';
import { orchestrator } from '../core/AgentOrchestrator';
import { ToolCall } from '../core/ToolExecutor';

// ============================================================================
// EXEMPLO 1: Buscar dados em paralelo
// ============================================================================

/**
 * Busca perfil do usuário + hábitos + histórico em paralelo
 * Economia: ~37% de tokens vs sequencial
 */
export async function fetchUserDataParallel(userId: string) {
  const calls: ToolCall[] = [
    {
      server: 'supabase',
      method: 'db.query',
      params: {
        table: 'profiles',
        query: { filter: { id: userId } },
      },
    },
    {
      server: 'supabase',
      method: 'db.query',
      params: {
        table: 'habits',
        query: { filter: { user_id: userId } },
      },
    },
    {
      server: 'supabase',
      method: 'db.query',
      params: {
        table: 'chat_sessions',
        query: {
          filter: { user_id: userId },
          order: { column: 'created_at', ascending: false },
          limit: 10,
        },
      },
    },
  ];

  const result = await orchestrator.callMCPParallel(calls, {
    timeout: 10000,
    retry: {
      maxAttempts: 2,
      initialDelay: 500,
    },
  });

  if (result.allSucceeded) {
    const [profile, habits, sessions] = result.data;
    return { profile, habits, sessions };
  } else {
    logger.error(
      '[AdvancedToolUseExamples] Erros ao buscar dados do usuário em paralelo',
      undefined,
      { errors: result.errors }
    );
    // Retorna apenas os dados que funcionaram
    return {
      profile: result.data[0] || null,
      habits: result.data[1] || null,
      sessions: result.data[2] || null,
    };
  }
}

// ============================================================================
// EXEMPLO 2: Análise de emoção em múltiplas mensagens
// ============================================================================

/**
 * Analisa emoção de múltiplas mensagens em paralelo
 * Útil para processar histórico de chat
 */
export async function analyzeEmotionBatch(messages: string[]) {
  const calls: ToolCall[] = messages.map((text, index) => ({
    server: 'googleai',
    method: 'analyze.emotion',
    params: { text },
    id: `emotion_${index}`,
  }));

  return await orchestrator.callMCPParallel(calls, {
    timeout: 5000,
    failFast: false, // Continua mesmo se algumas falharem
  });
}

// ============================================================================
// EXEMPLO 3: Agregação de dados (Pattern do artigo)
// ============================================================================

interface HabitEntry {
  user_id: string;
  habit_type: string;
  completed: boolean;
  date: string;
}

interface HabitSummary {
  totalHabits: number;
  completedCount: number;
  completionRate: number;
  byType: Record<string, { total: number; completed: number }>;
}

/**
 * Busca hábitos de múltiplos dias e agrega resultados
 * Pattern: Process large datasets → aggregate → send to Claude
 * Economia: 95% do context window livre para reasoning
 */
export async function getHabitSummary(
  userId: string,
  dates: string[]
): Promise<HabitSummary | null> {
  // 1. Buscar dados em paralelo
  const calls: ToolCall[] = dates.map((date) => ({
    server: 'supabase',
    method: 'db.query',
    params: {
      table: 'habits',
      query: {
        filter: { user_id: userId, date },
      },
    },
  }));

  // 2. Agregar resultados
  const aggregator = (results: JsonValue[]): HabitSummary => {
    const allHabits: HabitEntry[] = results.flat() as unknown as HabitEntry[];

    const byType: Record<string, { total: number; completed: number }> = {};

    allHabits.forEach((habit) => {
      if (!byType[habit.habit_type]) {
        byType[habit.habit_type] = { total: 0, completed: 0 };
      }
      byType[habit.habit_type].total++;
      if (habit.completed) {
        byType[habit.habit_type].completed++;
      }
    });

    const totalHabits = allHabits.length;
    const completedCount = allHabits.filter((h) => h.completed).length;

    return {
      totalHabits,
      completedCount,
      completionRate: totalHabits > 0 ? completedCount / totalHabits : 0,
      byType,
    };
  };

  // 3. Executar com agregação
  return await orchestrator.callMCPWithAggregation<HabitEntry[], HabitSummary>(calls, aggregator, {
    timeout: 10000,
  });
}

// ============================================================================
// EXEMPLO 4: Conditional Logic (Pattern do artigo)
// ============================================================================

/**
 * Fluxo condicional: analisa emoção → busca conteúdo apropriado
 * Pattern: Use code for conditional logic, not natural language
 */
export async function getEmotionBasedContent(userMessage: string) {
  // 1. Analisar emoção
  const emotionResult = await orchestrator.callMCP('googleai', 'analyze.emotion', {
    text: userMessage,
  });

  if (!emotionResult.success || !emotionResult.data) {
    return null;
  }

  const emotion = (emotionResult.data as Record<string, unknown>).emotion as string;

  // 2. Conditional: buscar conteúdo baseado na emoção
  let contentType: string;

  if (emotion === 'anxious' || emotion === 'stressed') {
    contentType = 'relaxation';
  } else if (emotion === 'sad' || emotion === 'depressed') {
    contentType = 'motivation';
  } else if (emotion === 'happy' || emotion === 'excited') {
    contentType = 'celebration';
  } else {
    contentType = 'general';
  }

  // 3. Buscar conteúdo apropriado
  const contentResult = await orchestrator.callMCP('supabase', 'db.query', {
    table: 'content',
    query: {
      filter: { type: contentType },
      limit: 5,
    },
  });

  return {
    emotion,
    contentType,
    content: contentResult.data,
  };
}

// ============================================================================
// EXEMPLO 5: Lazy Loading de servidores
// ============================================================================

/**
 * Busca servidores de AI por tag
 * Pattern: Tool Search Tool para descoberta dinâmica
 */
export function findAIServers() {
  // Busca todos os servidores com tag 'ai'
  const aiServers = orchestrator.searchMCPServers('ai');

  logger.debug('[AdvancedToolUseExamples] Servidores de AI disponíveis', { aiServers });
  // Output: ['googleai', 'openai', 'anthropic']

  return aiServers;
}

/**
 * Estatísticas de economia de tokens
 */
export function getTokenSavings() {
  const stats = orchestrator.getMCPStats();

  // eslint-disable-next-line no-console -- arquivo de exemplos, console.log permitido
  console.log('[AdvancedToolUseExamples] MCP Loader Stats', {
    legacy: stats.legacy,
    dynamic: stats.dynamic,
    usingDynamicMCP: stats.usingDynamicMCP,
  });

  return stats;
}

// ============================================================================
// EXEMPLO 6: Error Recovery com Retry
// ============================================================================

/**
 * Busca com retry automático
 * Pattern: Exponential backoff para network errors
 */
export async function fetchWithRetry(userId: string) {
  const result = await orchestrator.callMCPParallel(
    [
      {
        server: 'supabase',
        method: 'db.query',
        params: {
          table: 'profiles',
          query: { filter: { id: userId } },
        },
      },
    ],
    {
      retry: {
        maxAttempts: 3,
        initialDelay: 1000,
        backoffMultiplier: 2,
        maxDelay: 10000,
        // Retry apenas em erros de rede
        retryOn: (error: unknown) => {
          if (error instanceof Error) {
            return error.message.includes('network') || error.message.includes('timeout');
          }
          return false;
        },
      },
    }
  );

  return result.allSucceeded ? result.data[0] : null;
}

// ============================================================================
// EXEMPLO 7: Uso real em um agente
// ============================================================================

/**
 * Exemplo de como um agente usaria esses patterns
 */
export class ExampleAgent {
  async processUserRequest(userId: string, message: string) {
    // 1. Buscar dados do usuário em paralelo
    const userData = await fetchUserDataParallel(userId);

    // 2. Analisar emoção da mensagem
    const emotionData = await getEmotionBasedContent(message);

    // 3. Buscar resumo de hábitos dos últimos 7 dias
    const dates = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    });
    const habitSummary = await getHabitSummary(userId, dates);

    // 4. Combinar tudo para gerar resposta contextualizada
    return {
      user: userData,
      emotion: emotionData,
      habits: habitSummary,
    };
  }
}

// ============================================================================
// COMPARAÇÃO: Antes vs Depois
// ============================================================================

/**
 * ANTES (Sequencial):
 *
 * const profile = await orchestrator.callMCP('supabase', 'db.query', {...});
 * const habits = await orchestrator.callMCP('supabase', 'db.query', {...});
 * const sessions = await orchestrator.callMCP('supabase', 'db.query', {...});
 *
 * - 3 round-trips ao modelo
 * - ~15,000 tokens consumidos
 * - ~3 segundos de latência
 */

/**
 * DEPOIS (Parallel):
 *
 * const result = await orchestrator.callMCPParallel([...]);
 * const [profile, habits, sessions] = result.data;
 *
 * - 1 round-trip ao modelo
 * - ~9,450 tokens consumidos (37% redução)
 * - ~1 segundo de latência
 */
