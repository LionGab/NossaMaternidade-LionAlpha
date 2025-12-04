/**
 * Dynamic MCP Integration
 *
 * Integra Dynamic MCP com AgentOrchestrator.
 * Fornece métodos de alto nível para usar Dynamic MCP facilmente.
 */

import { logger } from '../../utils/logger';
import { JsonValue } from '../types';

// Importações diretas para evitar require cycle com index.ts
import { codeModeExecutor } from './CodeModeExecutor';
import { dockerDynamicMCPGateway, type ToolDefinition } from './DockerDynamicMCPGateway';
import { dynamicToolSelector, type ToolSelectionContext } from './DynamicToolSelector';
import { statePersistenceManager } from './StatePersistenceManager';

export interface DynamicMCPOptions {
  /** Usar dynamic tool selection */
  useDynamicSelection?: boolean;
  /** Usar code mode */
  enableCodeMode?: boolean;
  /** Usar state persistence */
  enableStatePersistence?: boolean;
  /** Máximo de tools a selecionar */
  maxTools?: number;
}

export interface DynamicMCPResult {
  /** Tools selecionadas */
  selectedTools: ToolDefinition[];
  /** Resultado da execução */
  result?: JsonValue;
  /** Economia de tokens */
  tokenSavings: number;
  /** Reasoning da seleção */
  reasoning: string;
}

/**
 * Dynamic MCP Integration
 *
 * Facilita uso do Dynamic MCP system
 */
export class DynamicMCPIntegration {
  private static instance: DynamicMCPIntegration;
  private initialized = false;
  private options: DynamicMCPOptions;
  private statePersistenceStatesCount = 0;

  private constructor() {
    this.options = {
      useDynamicSelection: true,
      enableCodeMode: true,
      enableStatePersistence: true,
      maxTools: 10,
    };
  }

  static getInstance(): DynamicMCPIntegration {
    if (!DynamicMCPIntegration.instance) {
      DynamicMCPIntegration.instance = new DynamicMCPIntegration();
    }
    return DynamicMCPIntegration.instance;
  }

  /**
   * Inicializa o Dynamic MCP system
   */
  async initialize(options?: Partial<DynamicMCPOptions>): Promise<void> {
    if (this.initialized) {
      return;
    }

    this.options = {
      ...this.options,
      ...options,
    };

    try {
      logger.info('[DynamicMCPIntegration] Initializing Dynamic MCP...');

      // 1. Inicializar Docker Gateway
      await dockerDynamicMCPGateway.initialize();

      // 2. Inicializar State Persistence
      if (this.options.enableStatePersistence) {
        await statePersistenceManager.initialize();
        // Atualizar contador de estados
        const states = await statePersistenceManager.listStates();
        this.statePersistenceStatesCount = states.length;
      }

      this.initialized = true;
      logger.info('[DynamicMCPIntegration] Initialized successfully', { options: this.options });
    } catch (error) {
      logger.error('[DynamicMCPIntegration] Initialization failed', error);
      throw error;
    }
  }

  /**
   * Executa uma tarefa usando Dynamic MCP
   */
  async executeTask(
    query: string,
    context?: Partial<ToolSelectionContext>
  ): Promise<DynamicMCPResult> {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      // 1. Buscar servidores relevantes
      const searchResult = await dockerDynamicMCPGateway.findServers(query);

      // 2. Conectar servidores encontrados
      for (const server of searchResult.servers.slice(0, 3)) {
        // Conectar apenas os 3 mais relevantes
        await dockerDynamicMCPGateway.addServer(server.name);
      }

      // 3. Obter tools disponíveis
      const availableTools = dockerDynamicMCPGateway.getAvailableTools();

      // 4. Selecionar tools dinamicamente
      let selectedTools: ToolDefinition[] = availableTools;
      let tokenSavings = 0;
      let reasoning = '';

      if (this.options.useDynamicSelection && availableTools.length > this.options.maxTools!) {
        const selectionContext: ToolSelectionContext = {
          query,
          ...context,
          maxTools: this.options.maxTools,
        };

        const selectionResult = dynamicToolSelector.selectTools(availableTools, selectionContext);

        selectedTools = selectionResult.selectedTools;
        tokenSavings = selectionResult.tokenSavings;
        reasoning = selectionResult.reasoning;
      } else {
        // Se não houve seleção dinâmica, gerar reasoning básico
        reasoning = `Using all ${availableTools.length} available tools. Dynamic selection not needed (tools count <= maxTools).`;
      }

      logger.info('[DynamicMCPIntegration] Task execution prepared', {
        query: query.substring(0, 50),
        selectedTools: selectedTools.length,
        tokenSavings: `${tokenSavings}%`,
      });

      return {
        selectedTools,
        tokenSavings,
        reasoning,
      };
    } catch (error) {
      logger.error('[DynamicMCPIntegration] Task execution failed', error);
      throw error;
    }
  }

  /**
   * Cria uma tool customizada usando Code Mode
   */
  async createCustomTool(
    name: string,
    description: string,
    code: string,
    _mcpToolsToUse: string[]
  ): Promise<boolean> {
    if (!this.options.enableCodeMode) {
      logger.warn('[DynamicMCPIntegration] Code Mode is disabled');
      return false;
    }

    try {
      const tool = {
        name,
        description,
        code,
        inputSchema: {},
        createdBy: 'dynamic-mcp',
      };

      return codeModeExecutor.createTool(tool);
    } catch (error) {
      logger.error('[DynamicMCPIntegration] Failed to create custom tool', error);
      return false;
    }
  }

  /**
   * Salva dados grandes usando State Persistence
   */
  async saveLargeData(
    key: string,
    data: JsonValue,
    returnSummary = true
  ): Promise<{ saved: boolean; reference?: string; summary?: JsonValue }> {
    if (!this.options.enableStatePersistence) {
      logger.warn('[DynamicMCPIntegration] State Persistence is disabled');
      return { saved: false };
    }

    return statePersistenceManager.saveLargeData(key, data, returnSummary);
  }

  /**
   * Obtém estatísticas do Dynamic MCP
   */
  getStats(): {
    gateway: {
      serversAvailable: number;
      serversConnected: number;
      toolsAvailable: number;
    };
    toolSelector: {
      usageStats: Map<string, number>;
    };
    codeMode: {
      customTools: number;
      executionHistory: number;
    };
    statePersistence: {
      volumes: number;
      states: number;
    };
  } {
    return {
      gateway: {
        serversAvailable: dockerDynamicMCPGateway.getConnectedServers().length,
        serversConnected: dockerDynamicMCPGateway.getConnectedServers().length,
        toolsAvailable: dockerDynamicMCPGateway.getAvailableTools().length,
      },
      toolSelector: {
        usageStats: dynamicToolSelector.getUsageStats(),
      },
      codeMode: {
        customTools: codeModeExecutor.listCustomTools().length,
        executionHistory: codeModeExecutor.getExecutionHistory().length,
      },
      statePersistence: {
        volumes: statePersistenceManager.listVolumes().length,
        states: this.statePersistenceStatesCount,
      },
    };
  }

  /**
   * Configura opções
   */
  configure(options: Partial<DynamicMCPOptions>): void {
    this.options = {
      ...this.options,
      ...options,
    };
    logger.info('[DynamicMCPIntegration] Configuration updated', { options: this.options });
  }

  /**
   * Shutdown
   */
  async shutdown(): Promise<void> {
    logger.info('[DynamicMCPIntegration] Shutting down...');
    await dockerDynamicMCPGateway.shutdown();
    this.initialized = false;
  }
}

// Singleton export
export const dynamicMCPIntegration = DynamicMCPIntegration.getInstance();
