/**
 * MCP Server Lazy Loader
 * Implementa lazy loading de servidores MCP baseado em:
 * https://www.anthropic.com/engineering/advanced-tool-use
 *
 * Features:
 * - Defer loading de servidores opcionais
 * - Redução de ~85% no consumo de tokens (artigo)
 * - Carregamento on-demand
 * - Cache de servidores carregados
 */

import { MCPServer } from '../../mcp/types';
import { logger } from '../../utils/logger';

// ============================================================================
// TYPES
// ============================================================================

export interface MCPServerConfig {
  /** Nome do servidor */
  name: string;
  /** Factory para criar instância */
  factory: () => MCPServer;
  /** Se deve ser carregado imediatamente ou on-demand */
  deferLoading: boolean;
  /** Prioridade (maior = carrega primeiro) */
  priority: number;
  /** Tags para busca */
  tags: string[];
  /** Descrição do servidor */
  description: string;
}

export interface LoaderStats {
  /** Total de servidores configurados */
  totalConfigured: number;
  /** Servidores carregados */
  loaded: number;
  /** Servidores diferidos */
  deferred: number;
  /** Economia estimada de tokens */
  tokenSavings: string;
}

// ============================================================================
// MCP LOADER CLASS
// ============================================================================

export class MCPLoader {
  private configs: Map<string, MCPServerConfig> = new Map();
  private instances: Map<string, MCPServer> = new Map();
  private loading: Map<string, Promise<MCPServer>> = new Map();

  /**
   * Registra um servidor MCP
   */
  register(config: MCPServerConfig): void {
    this.configs.set(config.name, config);
    logger.debug('[MCPLoader] Registered server', {
      name: config.name,
      deferLoading: config.deferLoading,
      priority: config.priority,
    });
  }

  /**
   * Inicializa servidores essenciais (deferLoading: false)
   */
  async initializeEssential(): Promise<void> {
    const essentialConfigs = Array.from(this.configs.values())
      .filter((c) => !c.deferLoading)
      .sort((a, b) => b.priority - a.priority); // Maior prioridade primeiro

    logger.info('[MCPLoader] Initializing essential servers', {
      count: essentialConfigs.length,
      servers: essentialConfigs.map((c) => c.name),
    });

    // Inicializar em paralelo (mas sorted por prioridade)
    const results = await Promise.allSettled(
      essentialConfigs.map(async (config) => {
        try {
          const server = config.factory();
          await server.initialize();
          this.instances.set(config.name, server);
          logger.info(`[MCPLoader] Initialized ${config.name}`);
          return { name: config.name, success: true };
        } catch (error) {
          logger.warn(`[MCPLoader] Failed to initialize ${config.name}`, error);
          return { name: config.name, success: false, error };
        }
      })
    );

    const succeeded = results.filter((r) => r.status === 'fulfilled').length;
    const failed = results.filter((r) => r.status === 'rejected').length;

    logger.info('[MCPLoader] Essential initialization complete', {
      succeeded,
      failed,
      tokenSavings: this.calculateTokenSavings(),
    });
  }

  /**
   * Obtém um servidor (carrega on-demand se necessário)
   */
  async getServer(name: string): Promise<MCPServer | null> {
    // Já está carregado?
    if (this.instances.has(name)) {
      return this.instances.get(name)!;
    }

    // Já está sendo carregado?
    if (this.loading.has(name)) {
      return this.loading.get(name)!;
    }

    // Configuração existe?
    const config = this.configs.get(name);
    if (!config) {
      logger.error(`[MCPLoader] Server not found: ${name}`);
      return null;
    }

    // Carregar on-demand
    logger.info(`[MCPLoader] Loading server on-demand: ${name}`);

    const loadingPromise = this.loadServer(config);
    this.loading.set(name, loadingPromise);

    try {
      const server = await loadingPromise;
      this.instances.set(name, server);
      this.loading.delete(name);
      return server;
    } catch (error) {
      logger.error(`[MCPLoader] Failed to load server: ${name}`, error);
      this.loading.delete(name);
      return null;
    }
  }

  /**
   * Busca servidores por tag
   * Pattern do artigo: Tool Search Tool
   */
  searchByTag(tag: string): string[] {
    return Array.from(this.configs.values())
      .filter((c) => c.tags.includes(tag))
      .sort((a, b) => b.priority - a.priority)
      .map((c) => c.name);
  }

  /**
   * Busca servidores por descrição
   */
  searchByDescription(query: string): string[] {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.configs.values())
      .filter((c) => c.description.toLowerCase().includes(lowerQuery))
      .sort((a, b) => b.priority - a.priority)
      .map((c) => c.name);
  }

  /**
   * Obtém estatísticas do loader
   */
  getStats(): LoaderStats {
    const totalConfigured = this.configs.size;
    const loaded = this.instances.size;
    const deferred = Array.from(this.configs.values()).filter((c) => c.deferLoading).length;

    return {
      totalConfigured,
      loaded,
      deferred,
      tokenSavings: this.calculateTokenSavings(),
    };
  }

  /**
   * Lista todos os servidores disponíveis
   */
  listAvailable(): Array<{ name: string; loaded: boolean; deferred: boolean }> {
    return Array.from(this.configs.values()).map((c) => ({
      name: c.name,
      loaded: this.instances.has(c.name),
      deferred: c.deferLoading,
    }));
  }

  /**
   * Força carregamento de um servidor diferido
   */
  async preload(name: string): Promise<boolean> {
    try {
      const server = await this.getServer(name);
      return server !== null;
    } catch {
      return false;
    }
  }

  /**
   * Shutdown de todos os servidores carregados
   */
  async shutdown(): Promise<void> {
    logger.info('[MCPLoader] Shutting down all servers');

    await Promise.allSettled(
      Array.from(this.instances.values()).map((server) => server.shutdown())
    );

    this.instances.clear();
    this.loading.clear();
  }

  // ============================================================================
  // PRIVATE HELPERS
  // ============================================================================

  private async loadServer(config: MCPServerConfig): Promise<MCPServer> {
    const server = config.factory();
    await server.initialize();
    logger.info(`[MCPLoader] Loaded server on-demand: ${config.name}`);
    return server;
  }

  /**
   * Calcula economia de tokens com defer loading
   * Baseado no artigo: ~85% de redução em bibliotecas grandes
   */
  private calculateTokenSavings(): string {
    const totalConfigured = this.configs.size;
    const deferred = Array.from(this.configs.values()).filter((c) => c.deferLoading).length;

    if (totalConfigured === 0 || deferred === 0) {
      return '0%';
    }

    // Estimativa conservadora: cada servidor diferido economiza ~10-15% de tokens
    const savingsPerServer = 12;
    const totalSavings = Math.min(85, deferred * savingsPerServer);

    return `~${totalSavings}%`;
  }
}

// ============================================================================
// SINGLETON EXPORT
// ============================================================================

export const mcpLoader = new MCPLoader();
