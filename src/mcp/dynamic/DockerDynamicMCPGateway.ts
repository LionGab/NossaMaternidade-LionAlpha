/**
 * Docker Dynamic MCP Gateway
 *
 * Integração com Docker MCP Gateway para dynamic discovery e tool selection.
 * Baseado no conceito apresentado no vídeo: "Docker Just Fixed 90% of AI Coding"
 *
 * Features:
 * - Dynamic discovery de servidores MCP do catálogo Docker
 * - Dynamic tool selection (carrega apenas tools necessárias)
 * - Integração com Docker MCP Catalog
 * - MCP find, add, remove tools
 */

import { logger } from '../../utils/logger';
import { MCPResponse, JsonValue } from '../types';

export interface MCPServerInfo {
  name: string;
  description: string;
  tools: string[];
  verified: boolean;
  tags?: string[];
}

export interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  server: string;
}

export interface CatalogSearchResult {
  servers: MCPServerInfo[];
  total: number;
}

/**
 * Docker Dynamic MCP Gateway Client
 *
 * Comunica com Docker MCP Gateway via stdio
 */
export class DockerDynamicMCPGateway {
  private static instance: DockerDynamicMCPGateway;
  private initialized = false;
  private availableServers: Map<string, MCPServerInfo> = new Map();
  private connectedServers: Set<string> = new Set();
  private availableTools: Map<string, ToolDefinition> = new Map();

  private constructor() {
    // Singleton
  }

  static getInstance(): DockerDynamicMCPGateway {
    if (!DockerDynamicMCPGateway.instance) {
      DockerDynamicMCPGateway.instance = new DockerDynamicMCPGateway();
    }
    return DockerDynamicMCPGateway.instance;
  }

  /**
   * Inicializa o gateway e descobre servidores disponíveis
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    try {
      logger.info('[DockerDynamicMCPGateway] Initializing...');

      // Descobrir servidores disponíveis no catálogo
      await this.discoverServers();

      this.initialized = true;
      logger.info('[DockerDynamicMCPGateway] Initialized successfully', {
        serversFound: this.availableServers.size,
        toolsFound: this.availableTools.size,
      });
    } catch (error) {
      logger.error('[DockerDynamicMCPGateway] Initialization failed', error);
      throw error;
    }
  }

  /**
   * Descobre servidores MCP disponíveis no catálogo Docker
   */
  async discoverServers(): Promise<void> {
    try {
      // Em uma implementação real, isso chamaria o Docker MCP Gateway
      // Por enquanto, simulamos com servidores conhecidos do catálogo

      const catalogServers: MCPServerInfo[] = [
        {
          name: 'github',
          description: 'GitHub API integration',
          tools: [
            'search_repositories',
            'get_repository',
            'create_issue',
            'create_pull_request',
            'get_file_contents',
            'search_code',
            // ... outros 20+ tools
          ],
          verified: true,
          tags: ['git', 'version-control', 'collaboration'],
        },
        {
          name: 'postgres',
          description: 'PostgreSQL database access',
          tools: [
            'query',
            'schema_inspect',
            'table_list',
            // ... outros tools
          ],
          verified: true,
          tags: ['database', 'sql'],
        },
        {
          name: 'playwright',
          description: 'Browser automation',
          tools: [
            'browser_navigate',
            'browser_click',
            'browser_snapshot',
            'browser_take_screenshot',
            // ... outros 20+ tools
          ],
          verified: true,
          tags: ['browser', 'automation', 'testing'],
        },
        {
          name: 'memory',
          description: 'Persistent memory storage',
          tools: [
            'create_entities',
            'read_graph',
            'search_nodes',
            'create_relations',
            // ... outros tools
          ],
          verified: true,
          tags: ['memory', 'storage', 'knowledge-graph'],
        },
        {
          name: 'context7',
          description: 'Library documentation',
          tools: ['resolve-library-id', 'get-library-docs'],
          verified: true,
          tags: ['documentation', 'libraries'],
        },
        {
          name: 'fetch',
          description: 'HTTP fetch utility',
          tools: ['fetch'],
          verified: true,
          tags: ['http', 'network'],
        },
        {
          name: 'sequentialthinking',
          description: 'Sequential thinking tool',
          tools: ['sequentialthinking'],
          verified: true,
          tags: ['reasoning', 'thinking'],
        },
      ];

      // Indexar servidores e tools
      for (const server of catalogServers) {
        this.availableServers.set(server.name, server);

        for (const toolName of server.tools) {
          this.availableTools.set(toolName, {
            name: toolName,
            description: `${toolName} from ${server.name}`,
            inputSchema: {}, // Schema seria obtido do gateway real
            server: server.name,
          });
        }
      }

      logger.info('[DockerDynamicMCPGateway] Discovered servers', {
        count: this.availableServers.size,
        servers: Array.from(this.availableServers.keys()),
      });
    } catch (error) {
      logger.error('[DockerDynamicMCPGateway] Failed to discover servers', error);
      throw error;
    }
  }

  /**
   * Busca servidores MCP no catálogo por nome ou descrição
   */
  async findServers(query: string): Promise<CatalogSearchResult> {
    const lowerQuery = query.toLowerCase();
    const matching: MCPServerInfo[] = [];

    for (const server of this.availableServers.values()) {
      const matchesName = server.name.toLowerCase().includes(lowerQuery);
      const matchesDescription = server.description.toLowerCase().includes(lowerQuery);
      const matchesTags = server.tags?.some((tag) => tag.toLowerCase().includes(lowerQuery));

      if (matchesName || matchesDescription || matchesTags) {
        matching.push(server);
      }
    }

    return {
      servers: matching,
      total: matching.length,
    };
  }

  /**
   * Adiciona um servidor MCP ao gateway (conecta)
   */
  async addServer(serverName: string): Promise<boolean> {
    const server = this.availableServers.get(serverName);
    if (!server) {
      logger.warn('[DockerDynamicMCPGateway] Server not found in catalog', { serverName });
      return false;
    }

    if (this.connectedServers.has(serverName)) {
      logger.debug('[DockerDynamicMCPGateway] Server already connected', { serverName });
      return true;
    }

    try {
      // Em implementação real, isso chamaria: docker mcp gateway add <server>
      // Por enquanto, apenas marcamos como conectado
      this.connectedServers.add(serverName);

      logger.info('[DockerDynamicMCPGateway] Server added', {
        serverName,
        toolsAvailable: server.tools.length,
      });

      return true;
    } catch (error) {
      logger.error('[DockerDynamicMCPGateway] Failed to add server', { serverName, error });
      return false;
    }
  }

  /**
   * Remove um servidor MCP do gateway (desconecta)
   */
  async removeServer(serverName: string): Promise<boolean> {
    if (!this.connectedServers.has(serverName)) {
      logger.debug('[DockerDynamicMCPGateway] Server not connected', { serverName });
      return false;
    }

    try {
      // Em implementação real, isso chamaria: docker mcp gateway remove <server>
      this.connectedServers.delete(serverName);

      logger.info('[DockerDynamicMCPGateway] Server removed', { serverName });
      return true;
    } catch (error) {
      logger.error('[DockerDynamicMCPGateway] Failed to remove server', { serverName, error });
      return false;
    }
  }

  /**
   * Obtém tools disponíveis de servidores conectados
   */
  getAvailableTools(): ToolDefinition[] {
    const tools: ToolDefinition[] = [];

    for (const serverName of this.connectedServers) {
      const server = this.availableServers.get(serverName);
      if (!server) continue;

      for (const toolName of server.tools) {
        const tool = this.availableTools.get(toolName);
        if (tool) {
          tools.push(tool);
        }
      }
    }

    return tools;
  }

  /**
   * Busca tools por nome ou descrição
   */
  searchTools(query: string): ToolDefinition[] {
    const lowerQuery = query.toLowerCase();
    const matching: ToolDefinition[] = [];

    for (const tool of this.availableTools.values()) {
      if (this.connectedServers.has(tool.server)) {
        const matchesName = tool.name.toLowerCase().includes(lowerQuery);
        const matchesDescription = tool.description.toLowerCase().includes(lowerQuery);

        if (matchesName || matchesDescription) {
          matching.push(tool);
        }
      }
    }

    return matching;
  }

  /**
   * Obtém informações de um servidor específico
   */
  getServerInfo(serverName: string): MCPServerInfo | null {
    return this.availableServers.get(serverName) || null;
  }

  /**
   * Lista servidores conectados
   */
  getConnectedServers(): string[] {
    return Array.from(this.connectedServers);
  }

  /**
   * Verifica se um servidor está conectado
   */
  isConnected(serverName: string): boolean {
    return this.connectedServers.has(serverName);
  }

  /**
   * Executa uma chamada de tool via Docker MCP Gateway
   */
  async executeTool(toolName: string, params: Record<string, JsonValue>): Promise<MCPResponse> {
    const tool = this.availableTools.get(toolName);
    if (!tool) {
      return {
        id: `req_${Date.now()}`,
        success: false,
        error: {
          code: 'TOOL_NOT_FOUND',
          message: `Tool ${toolName} not found`,
        },
        timestamp: Date.now(),
      };
    }

    if (!this.connectedServers.has(tool.server)) {
      return {
        id: `req_${Date.now()}`,
        success: false,
        error: {
          code: 'SERVER_NOT_CONNECTED',
          message: `Server ${tool.server} is not connected`,
        },
        timestamp: Date.now(),
      };
    }

    try {
      // Em implementação real, isso chamaria o Docker MCP Gateway
      // que então chamaria o servidor MCP apropriado
      logger.info('[DockerDynamicMCPGateway] Executing tool', {
        toolName,
        server: tool.server,
        params: Object.keys(params),
      });

      // Placeholder - em implementação real, isso seria uma chamada real ao gateway
      return {
        id: `req_${Date.now()}`,
        success: true,
        data: { message: 'Tool execution would happen here' },
        timestamp: Date.now(),
      };
    } catch (error) {
      logger.error('[DockerDynamicMCPGateway] Tool execution failed', {
        toolName,
        error,
      });

      return {
        id: `req_${Date.now()}`,
        success: false,
        error: {
          code: 'EXECUTION_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
        timestamp: Date.now(),
      };
    }
  }

  /**
   * Shutdown do gateway
   */
  async shutdown(): Promise<void> {
    logger.info('[DockerDynamicMCPGateway] Shutting down...');
    this.connectedServers.clear();
    this.initialized = false;
  }
}

// Singleton export
export const dockerDynamicMCPGateway = DockerDynamicMCPGateway.getInstance();
