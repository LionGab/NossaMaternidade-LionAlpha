/**
 * Base Agent
 * Classe base para todos os agentes IA do sistema
 */

import { MCPResponse } from '../../mcp/types';
import { logger } from '../../utils/logger';

export interface AgentConfig {
  name: string;
  version: string;
  description: string;
  capabilities: string[];
}

export interface UserProfile {
  id: string;
  name?: string;
  email?: string;
  preferences?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface AgentContext {
  userId?: string;
  sessionId?: string;
  userProfile?: UserProfile;
  metadata?: Record<string, unknown>;
}

export interface AgentProcessOptions {
  timeout?: number;
  priority?: 'low' | 'normal' | 'high';
  metadata?: Record<string, unknown>;
  [key: string]: unknown;
}

export abstract class BaseAgent<
  TInput = unknown,
  TOutput = unknown,
  TOptions extends AgentProcessOptions = AgentProcessOptions,
> {
  protected config: AgentConfig;
  protected context: AgentContext;
  protected initialized = false;

  constructor(config: AgentConfig) {
    this.config = config;
    this.context = {};
  }

  /**
   * Inicializa o agente
   */
  async initialize(context?: AgentContext): Promise<void> {
    if (context) {
      this.context = { ...this.context, ...context };
    }
    this.initialized = true;
    logger.debug(`[${this.config.name}] Initialized`);
  }

  /**
   * Atualiza o contexto do agente
   */
  updateContext(context: Partial<AgentContext>): void {
    this.context = { ...this.context, ...context };
  }

  /**
   * Verifica se o agente possui uma capacidade específica
   */
  hasCapability(capability: string): boolean {
    return this.config.capabilities.includes(capability);
  }

  /**
   * Obtém informações sobre o agente
   */
  getInfo(): AgentConfig {
    return { ...this.config };
  }

  /**
   * Método abstrato para processar requisições
   */
  abstract process(input: TInput, options?: TOptions): Promise<TOutput>;

  /**
   * Método abstrato para fazer chamadas MCP
   */
  protected abstract callMCP(
    server: string,
    method: string,
    params: Record<string, unknown>
  ): Promise<MCPResponse>;

  /**
   * Cleanup e shutdown
   */
  async shutdown(): Promise<void> {
    this.initialized = false;
    logger.debug(`[${this.config.name}] Shutdown complete`);
  }
}
