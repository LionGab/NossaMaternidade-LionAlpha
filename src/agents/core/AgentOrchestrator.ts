/**
 * Agent Orchestrator
 * Gerencia e coordena múltiplos agentes IA
 *
 * ENHANCED com Advanced Tool Use Patterns:
 * - Parallel tool execution (Promise.all)
 * - Lazy loading de MCP servers
 * - Retry logic com exponential backoff
 * - Tool result aggregation
 *
 * Baseado em: https://www.anthropic.com/engineering/advanced-tool-use
 */

import { BaseAgent, AgentContext } from './BaseAgent';
import { mcpLoader, MCPServerConfig } from './MCPLoader';
import { toolExecutor, ToolCall, ExecutionOptions, ParallelExecutionResult } from './ToolExecutor';
import {
  dynamicMCPIntegration,
  dockerDynamicMCPGateway,
  codeModeExecutor,
  type DynamicMCPOptions,
} from '../../mcp/dynamic';
import {
  supabaseMCP,
  googleAIMCP,
  openAIMCP,
  anthropicMCP,
  analyticsMCP,
  createMCPRequest,
  MCPServer,
} from '../../mcp/servers';
// Servidores MCP que usam Node.js (fs, path) não são importados no mobile
// designTokensValidationMCP, codeQualityMCP, accessibilityMCP devem ser usados apenas em scripts/Edge Functions
import { MCPMethod, MCPMethodParams, MCPResponse, MCPRequest, JsonValue } from '../../mcp/types';
import { logger } from '../../utils/logger';

/**
 * Options for task execution
 */
export interface TaskExecutionOptions {
  timeout?: number;
  retries?: number;
  metadata?: Record<string, JsonValue>;
  [key: string]: unknown;
}

/**
 * Input for agent processing
 */
export interface AgentInput {
  query?: string;
  data?: Record<string, JsonValue>;
  context?: Partial<AgentContext>;
}

/**
 * Result from agent task execution
 */
export interface AgentTaskResult<T = JsonValue> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: number;
}

export class AgentOrchestrator {
  private static instance: AgentOrchestrator;
  private agents: Map<string, BaseAgent> = new Map();
  private mcpServers: Map<string, MCPServer> = new Map();
  private initialized = false;
  private useAdvancedTooling = true; // Flag para ativar/desativar features avançadas
  private useDynamicMCP = true; // Flag para usar Dynamic MCP (Docker Gateway)
  private dynamicMCPOptions: Partial<DynamicMCPOptions> = {
    useDynamicSelection: true,
    enableCodeMode: true,
    enableStatePersistence: true,
    maxTools: 10,
  };

  private constructor() {
    this.setupMCPLoader();
  }

  static getInstance(): AgentOrchestrator {
    if (!AgentOrchestrator.instance) {
      AgentOrchestrator.instance = new AgentOrchestrator();
    }
    return AgentOrchestrator.instance;
  }

  /**
   * Configura o MCPLoader com lazy loading
   * Pattern: Dynamic Discovery Over Static Loading (85% token savings)
   */
  private setupMCPLoader(): void {
    // Servidores ESSENCIAIS (carregados imediatamente)
    // Apenas os 3-5 mais usados conforme artigo
    const essentialConfigs: MCPServerConfig[] = [
      {
        name: 'supabase',
        factory: () => supabaseMCP,
        deferLoading: false,
        priority: 100,
        tags: ['database', 'auth', 'storage', 'essential'],
        description: 'Supabase backend para database, auth e storage',
      },
      // ⚠️ DESABILITADO: googleAIMCP agora está na Edge Function (chat-gemini)
      // {
      //   name: 'googleai',
      //   factory: () => googleAIMCP,
      //   deferLoading: false,
      //   priority: 90,
      //   tags: ['ai', 'chat', 'gemini', 'essential'],
      //   description: 'Google AI (Gemini) para chat e análise - DEPRECATED: use Edge Function',
      // },
      {
        name: 'analytics',
        factory: () => analyticsMCP,
        deferLoading: false,
        priority: 80,
        tags: ['analytics', 'tracking', 'essential'],
        description: 'Analytics para tracking de eventos',
      },
    ];

    // Servidores OPCIONAIS (lazy loading)
    // Carregados on-demand quando necessário
    const optionalConfigs: MCPServerConfig[] = [
      {
        name: 'openai',
        factory: () => openAIMCP,
        deferLoading: true,
        priority: 50,
        tags: ['ai', 'chat', 'openai', 'fallback'],
        description: 'OpenAI como fallback para chat',
      },
      {
        name: 'anthropic',
        factory: () => anthropicMCP,
        deferLoading: true,
        priority: 40,
        tags: ['ai', 'chat', 'claude', 'fallback'],
        description: 'Anthropic Claude como fallback para chat',
      },
    ];

    [...essentialConfigs, ...optionalConfigs].forEach((config) => {
      mcpLoader.register(config);
    });

    logger.debug('[AgentOrchestrator] MCPLoader configured', {
      essential: essentialConfigs.length,
      optional: optionalConfigs.length,
    });
  }

  /**
   * Inicializa o orchestrator e servidores MCP essenciais
   * Servidores opcionais são carregados on-demand
   *
   * ENHANCED: Agora suporta Dynamic MCP (Docker Gateway)
   */
  async initialize(_context?: AgentContext): Promise<void> {
    try {
      logger.debug('[AgentOrchestrator] Initializing...');

      // 1. Inicializar Dynamic MCP se habilitado
      if (this.useDynamicMCP) {
        try {
          await dynamicMCPIntegration.initialize(this.dynamicMCPOptions);
          logger.info('[AgentOrchestrator] Dynamic MCP initialized', {
            options: this.dynamicMCPOptions,
          });
        } catch (error) {
          logger.warn(
            '[AgentOrchestrator] Dynamic MCP initialization failed, continuing with legacy',
            error
          );
          this.useDynamicMCP = false; // Fallback para modo legacy
        }
      }

      if (this.useAdvancedTooling) {
        // NOVO: Inicializar apenas servidores essenciais via MCPLoader
        await mcpLoader.initializeEssential();

        // Popular mcpServers map com servidores carregados
        for (const { name, loaded } of mcpLoader.listAvailable()) {
          if (loaded) {
            const server = await mcpLoader.getServer(name);
            if (server) {
              this.mcpServers.set(name, server);
            }
          }
        }

        const stats = mcpLoader.getStats();
        logger.info('[AgentOrchestrator] Initialized with lazy loading', {
          loaded: stats.loaded,
          deferred: stats.deferred,
          tokenSavings: stats.tokenSavings,
          dynamicMCP: this.useDynamicMCP,
        });
      } else {
        // LEGACY: Inicializar todos os servidores
        await Promise.all([
          supabaseMCP.initialize(),
          // ⚠️ DESABILITADO: googleAIMCP está deprecated (API key exposta)
          // googleAIMCP.initialize(),
          openAIMCP
            .initialize()
            .catch((err) =>
              logger.warn('[AgentOrchestrator] OpenAI MCP init failed (optional)', err)
            ),
          anthropicMCP
            .initialize()
            .catch((err) =>
              logger.warn('[AgentOrchestrator] Anthropic MCP init failed (optional)', err)
            ),
          analyticsMCP.initialize(),
        ]);

        this.mcpServers.set('supabase', supabaseMCP);
        // ⚠️ DESABILITADO: googleAIMCP está deprecated - use Edge Function (chat-gemini)
        // this.mcpServers.set('googleai', googleAIMCP);
        this.mcpServers.set('openai', openAIMCP);
        this.mcpServers.set('anthropic', anthropicMCP);
        this.mcpServers.set('analytics', analyticsMCP);
      }

      this.initialized = true;
      logger.info('[AgentOrchestrator] Initialized successfully', {
        dynamicMCP: this.useDynamicMCP,
        advancedTooling: this.useAdvancedTooling,
      });

      // Track initialization
      const request = createMCPRequest('event.track', {
        name: 'orchestrator_initialized',
        properties: {
          timestamp: Date.now(),
          advancedTooling: this.useAdvancedTooling,
          dynamicMCP: this.useDynamicMCP,
        },
      });
      await analyticsMCP.handleRequest(request);
    } catch (error) {
      logger.error('[AgentOrchestrator] Initialization failed:', error);
      throw error;
    }
  }

  /**
   * Registra um agente
   */
  registerAgent(agent: BaseAgent): void {
    const info = agent.getInfo();
    this.agents.set(info.name, agent);
    logger.debug(`[AgentOrchestrator] Registered agent: ${info.name}`);
  }

  /**
   * Remove um agente
   */
  unregisterAgent(name: string): void {
    this.agents.delete(name);
    logger.debug(`[AgentOrchestrator] Unregistered agent: ${name}`);
  }

  /**
   * Obtém um agente pelo nome
   */
  getAgent(name: string): BaseAgent | undefined {
    return this.agents.get(name);
  }

  /**
   * Lista todos os agentes registrados
   */
  listAgents(): string[] {
    return Array.from(this.agents.keys());
  }

  /**
   * Executa uma tarefa usando um agente específico
   */
  async executeTask<T = JsonValue>(
    agentName: string,
    input: AgentInput,
    options?: TaskExecutionOptions
  ): Promise<AgentTaskResult<T>> {
    if (!this.initialized) {
      throw new Error('Orchestrator not initialized');
    }

    const agent = this.agents.get(agentName);
    if (!agent) {
      throw new Error(`Agent not found: ${agentName}`);
    }

    try {
      // Track task execution
      const trackRequest = createMCPRequest('event.track', {
        name: 'agent_task_started',
        properties: { agentName, timestamp: Date.now() },
      });
      await analyticsMCP.handleRequest(trackRequest);

      // Execute task
      const result = await agent.process(input, options);

      // Track task completion
      const completeRequest = createMCPRequest('event.track', {
        name: 'agent_task_completed',
        properties: { agentName, timestamp: Date.now() },
      });
      await analyticsMCP.handleRequest(completeRequest);

      return {
        success: true,
        data: result as T,
        timestamp: Date.now(),
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      // Track error
      const errorRequest = createMCPRequest('event.track', {
        name: 'agent_task_failed',
        properties: {
          agentName,
          error: errorMessage,
          timestamp: Date.now(),
        },
      });
      await analyticsMCP.handleRequest(errorRequest);

      return {
        success: false,
        error: errorMessage,
        timestamp: Date.now(),
      };
    }
  }

  /**
   * Permite que agentes façam chamadas MCP
   * ENHANCED: Suporta lazy loading de servidores + Dynamic MCP (Docker Gateway)
   */
  async callMCP<T extends MCPMethod>(
    server: string,
    method: T,
    params: MCPMethodParams<T> | Record<string, unknown>
  ): Promise<MCPResponse<JsonValue>> {
    // 1. Tentar Dynamic MCP Gateway primeiro (se habilitado e servidor está no catálogo)
    if (this.useDynamicMCP && dockerDynamicMCPGateway.isConnected(server)) {
      try {
        logger.debug('[AgentOrchestrator] Using Dynamic MCP Gateway', { server, method });
        return await dockerDynamicMCPGateway.executeTool(
          method as string,
          params as Record<string, JsonValue>
        );
      } catch (error) {
        logger.warn('[AgentOrchestrator] Dynamic MCP Gateway failed, falling back to legacy', {
          server,
          error,
        });
      }
    }

    // 2. Fallback para servidores locais (MCPLoader)
    let mcpServer = this.mcpServers.get(server);

    // Se não está carregado e useAdvancedTooling está ativo, tenta carregar on-demand
    if (!mcpServer && this.useAdvancedTooling) {
      logger.info(`[AgentOrchestrator] Loading MCP server on-demand: ${server}`);
      const loadedServer = await mcpLoader.getServer(server);
      if (loadedServer) {
        mcpServer = loadedServer;
        this.mcpServers.set(server, loadedServer);
      }
    }

    // 3. Tentar descobrir no Docker Gateway se ainda não encontrou
    if (!mcpServer && this.useDynamicMCP) {
      try {
        const searchResult = await dockerDynamicMCPGateway.findServers(server);
        if (searchResult.servers.length > 0) {
          const foundServer = searchResult.servers[0];
          await dockerDynamicMCPGateway.addServer(foundServer.name);
          logger.info('[AgentOrchestrator] Discovered server via Dynamic MCP', {
            server: foundServer.name,
          });
          return await dockerDynamicMCPGateway.executeTool(
            method as string,
            params as Record<string, JsonValue>
          );
        }
      } catch (error) {
        logger.debug('[AgentOrchestrator] Server not found in Docker Gateway', { server });
      }
    }

    if (!mcpServer) {
      throw new Error(`MCP Server not found: ${server}`);
    }

    const request = createMCPRequest(method, params as MCPMethodParams<T>);
    return await mcpServer.handleRequest<JsonValue>(
      request as MCPRequest<Record<string, JsonValue>>
    );
  }

  /**
   * NOVO: Executa múltiplas chamadas MCP em paralelo
   * Pattern: Parallel Tool Execution (37% token savings)
   *
   * Exemplo:
   * ```ts
   * const result = await orchestrator.callMCPParallel([
   *   { server: 'supabase', method: 'db.query', params: { table: 'profiles' } },
   *   { server: 'googleai', method: 'analyze.emotion', params: { text: 'message' } }
   * ]);
   * ```
   */
  async callMCPParallel<T = JsonValue>(
    calls: ToolCall[],
    options?: ExecutionOptions
  ): Promise<ParallelExecutionResult<T>> {
    if (!this.useAdvancedTooling) {
      // Fallback para execução sequencial
      logger.warn('[AgentOrchestrator] Advanced tooling disabled, falling back to sequential');
      return this.callMCPSequential<T>(calls, options);
    }

    // Executor para chamadas MCP
    const executor = async (request: MCPRequest): Promise<MCPResponse> => {
      // Extrair server do metadata (toolExecutor adiciona isso)
      const serverName = (request.params as Record<string, unknown>).server as string;
      const mcpServer = await this.getMCPServerWithLoading(serverName);
      return await mcpServer.handleRequest(request);
    };

    return await toolExecutor.executeParallel<T>(calls, executor, options);
  }

  /**
   * NOVO: Executa chamadas MCP em sequência com retry
   */
  async callMCPSequential<T = JsonValue>(
    calls: ToolCall[],
    options?: ExecutionOptions
  ): Promise<ParallelExecutionResult<T>> {
    const executor = async (request: MCPRequest): Promise<MCPResponse> => {
      const serverName = (request.params as Record<string, unknown>).server as string;
      const mcpServer = await this.getMCPServerWithLoading(serverName);
      return await mcpServer.handleRequest(request);
    };

    return await toolExecutor.executeSequential<T>(calls, executor, options);
  }

  /**
   * NOVO: Executa chamadas MCP com agregação customizada
   * Pattern: Result Aggregation antes de enviar ao modelo
   *
   * Reduz context window preservando 95% do espaço para reasoning
   */
  async callMCPWithAggregation<TInput = JsonValue, TOutput = JsonValue>(
    calls: ToolCall[],
    aggregator: (results: JsonValue[]) => TOutput,
    options?: ExecutionOptions
  ): Promise<TOutput | null> {
    const executor = async (request: MCPRequest): Promise<MCPResponse> => {
      const serverName = (request.params as Record<string, unknown>).server as string;
      const mcpServer = await this.getMCPServerWithLoading(serverName);
      return await mcpServer.handleRequest(request);
    };

    const result = await toolExecutor.executeWithAggregation<TInput, TOutput>(
      calls,
      executor,
      aggregator,
      options
    );

    return result.success ? result.data || null : null;
  }

  /**
   * NOVO: Busca servidores MCP por tag
   * Pattern: Tool Search Tool
   */
  searchMCPServers(tag: string): string[] {
    return mcpLoader.searchByTag(tag);
  }

  /**
   * Obtém estatísticas do loader
   */
  getMCPStats() {
    const legacyStats = mcpLoader.getStats();
    const dynamicStats = this.useDynamicMCP ? dynamicMCPIntegration.getStats() : null;

    return {
      legacy: legacyStats,
      dynamic: dynamicStats,
      usingDynamicMCP: this.useDynamicMCP,
    };
  }

  /**
   * NOVO: Configura Dynamic MCP options
   */
  configureDynamicMCP(options: Partial<DynamicMCPOptions>): void {
    this.dynamicMCPOptions = {
      ...this.dynamicMCPOptions,
      ...options,
    };
    if (this.initialized && this.useDynamicMCP) {
      dynamicMCPIntegration.configure(this.dynamicMCPOptions);
    }
    logger.info('[AgentOrchestrator] Dynamic MCP configured', { options: this.dynamicMCPOptions });
  }

  /**
   * NOVO: Habilita/desabilita Dynamic MCP
   */
  setDynamicMCPEnabled(enabled: boolean): void {
    this.useDynamicMCP = enabled;
    logger.info('[AgentOrchestrator] Dynamic MCP', { enabled });
  }

  /**
   * NOVO: Cria tool customizada usando Code Mode
   */
  async createCustomTool(
    name: string,
    description: string,
    code: string,
    mcpToolsToUse: string[] = []
  ): Promise<boolean> {
    if (!this.useDynamicMCP || !this.dynamicMCPOptions.enableCodeMode) {
      logger.warn('[AgentOrchestrator] Code Mode is disabled');
      return false;
    }

    return await dynamicMCPIntegration.createCustomTool(name, description, code, mcpToolsToUse);
  }

  /**
   * NOVO: Executa tool customizada
   */
  async executeCustomTool(
    toolName: string,
    params: Record<string, JsonValue>
  ): Promise<{ success: boolean; output?: JsonValue; error?: string; executionTime: number }> {
    if (!this.useDynamicMCP || !this.dynamicMCPOptions.enableCodeMode) {
      throw new Error('Code Mode is disabled');
    }

    return await codeModeExecutor.executeTool(toolName, params);
  }

  /**
   * NOVO: Salva dados grandes usando State Persistence
   */
  async saveLargeData(
    key: string,
    data: JsonValue,
    returnSummary = true
  ): Promise<{ saved: boolean; reference?: string; summary?: JsonValue }> {
    if (!this.useDynamicMCP || !this.dynamicMCPOptions.enableStatePersistence) {
      logger.warn('[AgentOrchestrator] State Persistence is disabled');
      return { saved: false };
    }

    return await dynamicMCPIntegration.saveLargeData(key, data, returnSummary);
  }

  /**
   * NOVO: Busca servidores no Docker MCP Catalog
   */
  async findMCPServers(query: string): Promise<{
    servers: Array<{ name: string; description: string; tools: string[] }>;
    total: number;
  }> {
    if (!this.useDynamicMCP) {
      return { servers: [], total: 0 };
    }

    const result = await dockerDynamicMCPGateway.findServers(query);
    return {
      servers: result.servers.map((s) => ({
        name: s.name,
        description: s.description,
        tools: s.tools,
      })),
      total: result.total,
    };
  }

  /**
   * NOVO: Conecta servidor do Docker MCP Catalog
   */
  async connectMCPServer(serverName: string): Promise<boolean> {
    if (!this.useDynamicMCP) {
      return false;
    }

    return await dockerDynamicMCPGateway.addServer(serverName);
  }

  /**
   * NOVO: Desconecta servidor do Docker MCP Catalog
   */
  async disconnectMCPServer(serverName: string): Promise<boolean> {
    if (!this.useDynamicMCP) {
      return false;
    }

    return await dockerDynamicMCPGateway.removeServer(serverName);
  }

  /**
   * NOVO: Lista servidores conectados via Dynamic MCP
   */
  getConnectedDynamicServers(): string[] {
    if (!this.useDynamicMCP) {
      return [];
    }

    return dockerDynamicMCPGateway.getConnectedServers();
  }

  /**
   * Helper para obter servidor com lazy loading
   */
  private async getMCPServerWithLoading(serverName: string): Promise<MCPServer> {
    let server = this.mcpServers.get(serverName);

    if (!server && this.useAdvancedTooling) {
      const loadedServer = await mcpLoader.getServer(serverName);
      if (loadedServer) {
        server = loadedServer;
        this.mcpServers.set(serverName, loadedServer);
      }
    }

    if (!server) {
      throw new Error(`MCP Server not found: ${serverName}`);
    }

    return server;
  }

  /**
   * Atualiza o contexto de todos os agentes
   */
  updateAllAgentsContext(context: Partial<AgentContext>): void {
    this.agents.forEach((agent) => {
      agent.updateContext(context);
    });
  }

  /**
   * Shutdown do orchestrator e todos os agentes
   */
  async shutdown(): Promise<void> {
    // Shutdown agents
    for (const agent of this.agents.values()) {
      await agent.shutdown();
    }

    // Shutdown Dynamic MCP se habilitado
    if (this.useDynamicMCP) {
      try {
        await dynamicMCPIntegration.shutdown();
      } catch (error) {
        logger.warn('[AgentOrchestrator] Dynamic MCP shutdown failed', error);
      }
    }

    if (this.useAdvancedTooling) {
      // NOVO: Shutdown via MCPLoader
      await mcpLoader.shutdown();
    } else {
      // LEGACY: Shutdown direto
      await Promise.all([
        supabaseMCP.shutdown(),
        // ⚠️ DESABILITADO: googleAIMCP está deprecated
        // googleAIMCP.shutdown(),
        openAIMCP.shutdown(),
        anthropicMCP.shutdown(),
        analyticsMCP.shutdown(),
      ]);
    }

    this.agents.clear();
    this.mcpServers.clear();
    this.initialized = false;

    logger.info('[AgentOrchestrator] Shutdown complete');
  }
}

// Export singleton instance
export const orchestrator = AgentOrchestrator.getInstance();
