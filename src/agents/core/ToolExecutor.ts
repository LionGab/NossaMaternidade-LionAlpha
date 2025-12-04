/**
 * Advanced Tool Executor
 * Implementa patterns avançados de uso de ferramentas baseado em:
 * https://www.anthropic.com/engineering/advanced-tool-use
 *
 * Features:
 * - Parallel tool execution (Promise.all)
 * - Retry logic com exponential backoff
 * - Result validation e aggregation
 * - Error isolation
 * - Conditional orchestration
 */

import { MCPRequest, MCPResponse, MCPMethod, MCPMethodParams, JsonValue } from '../../mcp/types';
import { logger } from '../../utils/logger';

// ============================================================================
// TYPES
// ============================================================================

export interface ToolCall<T extends MCPMethod = MCPMethod> {
  server: string;
  method: T;
  params: MCPMethodParams<T>;
  /** Identificador único para tracking */
  id?: string;
  /** Metadados opcionais */
  metadata?: Record<string, JsonValue>;
}

export interface ToolResult<T = JsonValue> {
  success: boolean;
  data?: T;
  error?: string;
  /** Servidor que respondeu */
  server: string;
  /** Método chamado */
  method: string;
  /** ID da chamada original */
  callId?: string;
  /** Tempo de execução em ms */
  executionTime: number;
  /** Número de tentativas até sucesso */
  attempts: number;
}

export interface ParallelExecutionResult<T = JsonValue> {
  /** Todas as chamadas foram bem-sucedidas */
  allSucceeded: boolean;
  /** Resultados individuais */
  results: ToolResult<T>[];
  /** Resultados agregados (apenas sucessos) */
  data: T[];
  /** Erros agregados */
  errors: Array<{ server: string; method: string; error: string }>;
  /** Tempo total de execução */
  totalTime: number;
}

export interface RetryConfig {
  /** Número máximo de tentativas */
  maxAttempts: number;
  /** Delay inicial em ms */
  initialDelay: number;
  /** Multiplicador do delay (exponential backoff) */
  backoffMultiplier: number;
  /** Delay máximo em ms */
  maxDelay: number;
  /** Se deve fazer retry em caso de erro */
  retryOn?: (error: unknown) => boolean;
}

export interface ExecutionOptions {
  /** Timeout em ms para cada chamada */
  timeout?: number;
  /** Configuração de retry */
  retry?: Partial<RetryConfig>;
  /** Se deve validar resultados */
  validate?: boolean;
  /** Função customizada de validação */
  validator?: (result: JsonValue) => boolean;
  /** Se deve agregar erros ou falhar imediatamente */
  failFast?: boolean;
}

// ============================================================================
// DEFAULT CONFIGS
// ============================================================================

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 3,
  initialDelay: 1000,
  backoffMultiplier: 2,
  maxDelay: 10000,
  retryOn: (error: unknown) => {
    // Retry em erros de rede, timeout, rate limit
    if (error instanceof Error) {
      const message = error.message.toLowerCase();
      return (
        message.includes('network') ||
        message.includes('timeout') ||
        message.includes('rate limit') ||
        message.includes('503') ||
        message.includes('429')
      );
    }
    return false;
  },
};

const DEFAULT_EXECUTION_OPTIONS: ExecutionOptions = {
  timeout: 30000,
  validate: true,
  failFast: false,
};

// ============================================================================
// TOOL EXECUTOR CLASS
// ============================================================================

export class ToolExecutor {
  private callCounter = 0;

  /**
   * Executa uma única ferramenta com retry logic
   */
  async execute<T extends MCPMethod, R = JsonValue>(
    call: ToolCall<T>,
    executor: (request: MCPRequest) => Promise<MCPResponse>,
    options: ExecutionOptions = {}
  ): Promise<ToolResult<R>> {
    const opts = { ...DEFAULT_EXECUTION_OPTIONS, ...options };
    const retryConfig = { ...DEFAULT_RETRY_CONFIG, ...opts.retry };

    const callId = call.id || `call_${++this.callCounter}`;
    const startTime = Date.now();

    let lastError: Error | undefined;

    for (let attempt = 1; attempt <= retryConfig.maxAttempts; attempt++) {
      try {
        logger.debug('[ToolExecutor] Executing tool', {
          callId,
          server: call.server,
          method: call.method,
          attempt,
        });

        // Criar request MCP
        const request: MCPRequest = {
          id: callId,
          method: call.method,
          params: call.params as Record<string, JsonValue>,
          timestamp: Date.now(),
        };

        // Executar com timeout
        const response = await this.executeWithTimeout(
          () => executor(request),
          opts.timeout || 30000
        );

        // Validar resultado se necessário
        if (opts.validate && response.data) {
          const isValid = opts.validator
            ? opts.validator(response.data)
            : this.defaultValidator(response.data);

          if (!isValid) {
            throw new Error('Result validation failed');
          }
        }

        // Sucesso!
        const executionTime = Date.now() - startTime;

        logger.info('[ToolExecutor] Tool executed successfully', {
          callId,
          server: call.server,
          method: call.method,
          attempt,
          executionTime,
        });

        return {
          success: true,
          data: response.data as R,
          server: call.server,
          method: call.method,
          callId,
          executionTime,
          attempts: attempt,
        };
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        logger.warn('[ToolExecutor] Tool execution failed', {
          callId,
          server: call.server,
          method: call.method,
          attempt,
          error: lastError.message,
        });

        // Verificar se deve fazer retry
        const shouldRetry = attempt < retryConfig.maxAttempts && retryConfig.retryOn!(lastError);

        if (shouldRetry) {
          // Calcular delay com exponential backoff
          const delay = Math.min(
            retryConfig.initialDelay * Math.pow(retryConfig.backoffMultiplier, attempt - 1),
            retryConfig.maxDelay
          );

          logger.debug('[ToolExecutor] Retrying after delay', {
            callId,
            delay,
            attempt: attempt + 1,
          });

          await this.sleep(delay);
        } else {
          break;
        }
      }
    }

    // Todas as tentativas falharam
    const executionTime = Date.now() - startTime;

    return {
      success: false,
      error: lastError?.message || 'Unknown error',
      server: call.server,
      method: call.method,
      callId,
      executionTime,
      attempts: retryConfig.maxAttempts,
    };
  }

  /**
   * Executa múltiplas ferramentas em paralelo
   * Pattern inspirado no artigo: asyncio.gather() equivalente
   */
  async executeParallel<T = JsonValue>(
    calls: ToolCall[],
    executor: (request: MCPRequest) => Promise<MCPResponse>,
    options: ExecutionOptions = {}
  ): Promise<ParallelExecutionResult<T>> {
    const startTime = Date.now();

    logger.info('[ToolExecutor] Executing tools in parallel', {
      count: calls.length,
      calls: calls.map((c) => ({ server: c.server, method: c.method })),
    });

    // Executar todas em paralelo
    const promises = calls.map((call) => this.execute<MCPMethod, T>(call, executor, options));

    // Aguardar todas (não falha se alguma falhar)
    const results: ToolResult<T>[] = await Promise.all(promises);

    // Agregar resultados
    const successes = results.filter((r) => r.success);
    const failures = results.filter((r) => !r.success);

    const data = successes.map((r) => r.data as T);
    const errors = failures.map((r) => ({
      server: r.server,
      method: r.method,
      error: r.error || 'Unknown error',
    }));

    const totalTime = Date.now() - startTime;

    logger.info('[ToolExecutor] Parallel execution completed', {
      total: calls.length,
      succeeded: successes.length,
      failed: failures.length,
      totalTime,
      tokenSavings: this.calculateTokenSavings(calls.length),
    });

    return {
      allSucceeded: failures.length === 0,
      results,
      data,
      errors,
      totalTime,
    };
  }

  /**
   * Executa ferramentas com dependências (sequencial)
   * Cada call pode depender do resultado da anterior
   */
  async executeSequential<T = JsonValue>(
    calls: ToolCall[],
    executor: (request: MCPRequest) => Promise<MCPResponse>,
    options: ExecutionOptions = {}
  ): Promise<ParallelExecutionResult<T>> {
    const startTime = Date.now();
    const results: ToolResult[] = [];

    logger.info('[ToolExecutor] Executing tools sequentially', {
      count: calls.length,
    });

    for (const call of calls) {
      const result = await this.execute(call, executor, options);
      results.push(result);

      // Fail fast se configurado
      if (options.failFast && !result.success) {
        logger.warn('[ToolExecutor] Sequential execution stopped (fail fast)', {
          failedCall: { server: call.server, method: call.method },
        });
        break;
      }
    }

    const successes = results.filter((r) => r.success);
    const failures = results.filter((r) => !r.success);

    return {
      allSucceeded: failures.length === 0,
      results: results as ToolResult<T>[],
      data: successes.map((r) => r.data as T),
      errors: failures.map((r) => ({
        server: r.server,
        method: r.method,
        error: r.error || 'Unknown error',
      })),
      totalTime: Date.now() - startTime,
    };
  }

  /**
   * Executa ferramentas com agregação customizada
   * Permite processar resultados intermediários antes de continuar
   */
  async executeWithAggregation<TInput = JsonValue, TOutput = JsonValue>(
    calls: ToolCall[],
    executor: (request: MCPRequest) => Promise<MCPResponse>,
    aggregator: (results: JsonValue[]) => TOutput,
    options: ExecutionOptions = {}
  ): Promise<ToolResult<TOutput>> {
    const startTime = Date.now();

    // Executar todas as calls
    const parallelResult = await this.executeParallel<TInput>(calls, executor, options);

    if (!parallelResult.allSucceeded && options.failFast) {
      return {
        success: false,
        error: `Some tools failed: ${parallelResult.errors.map((e) => e.error).join(', ')}`,
        server: 'aggregator',
        method: 'aggregate',
        executionTime: Date.now() - startTime,
        attempts: 1,
      };
    }

    try {
      // Agregar resultados - cast explícito para evitar erro de tipo
      const aggregated = aggregator(parallelResult.data as JsonValue[]);

      return {
        success: true,
        data: aggregated,
        server: 'aggregator',
        method: 'aggregate',
        executionTime: Date.now() - startTime,
        attempts: 1,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Aggregation failed',
        server: 'aggregator',
        method: 'aggregate',
        executionTime: Date.now() - startTime,
        attempts: 1,
      };
    }
  }

  // ============================================================================
  // PRIVATE HELPERS
  // ============================================================================

  private async executeWithTimeout<T>(fn: () => Promise<T>, timeoutMs: number): Promise<T> {
    return Promise.race([
      fn(),
      new Promise<T>((_, reject) =>
        setTimeout(() => reject(new Error(`Timeout after ${timeoutMs}ms`)), timeoutMs)
      ),
    ]);
  }

  private async sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private defaultValidator(data: JsonValue): boolean {
    // Validação básica: dados não nulos e não undefined
    return data !== null && data !== undefined;
  }

  /**
   * Calcula economia de tokens com parallel execution vs sequential
   * Baseado no artigo: 37% de redução em workflows complexos
   */
  private calculateTokenSavings(callCount: number): string {
    if (callCount <= 1) return '0%';

    // Estimativa conservadora: cada round-trip economiza ~30% de tokens
    const savings = Math.min(37, (callCount - 1) * 12);
    return `~${savings}%`;
  }
}

// ============================================================================
// SINGLETON EXPORT
// ============================================================================

export const toolExecutor = new ToolExecutor();
