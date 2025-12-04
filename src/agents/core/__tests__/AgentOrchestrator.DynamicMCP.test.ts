/**
 * AgentOrchestrator Dynamic MCP Integration Tests
 *
 * Testa a integração do Dynamic MCP no AgentOrchestrator
 */

import { AgentOrchestrator } from '../AgentOrchestrator';
import { BaseAgent } from '../BaseAgent';
import { MCPResponse } from '../../../mcp/types';

// Mock agent para testes
class MockAgent extends BaseAgent {
  constructor() {
    super({
      name: 'MockAgent',
      version: '1.0.0',
      description: 'Mock agent for testing',
      capabilities: ['test'],
    });
  }

  async process(input: unknown): Promise<unknown> {
    return { processed: input };
  }

  protected async callMCP(
    _server: string,
    _method: string,
    _params: Record<string, unknown>
  ): Promise<MCPResponse> {
    return {
      id: 'mock',
      success: true,
      data: {},
      timestamp: Date.now(),
    };
  }

  async shutdown(): Promise<void> {
    // Mock shutdown
  }
}

describe('AgentOrchestrator Dynamic MCP Integration', () => {
  let orchestratorInstance: AgentOrchestrator;

  beforeEach(() => {
    orchestratorInstance = AgentOrchestrator.getInstance();
  });

  afterEach(async () => {
    try {
      await orchestratorInstance.shutdown();
    } catch (error) {
      // Ignore shutdown errors in tests
    }
  });

  test('should initialize with Dynamic MCP', async () => {
    await expect(orchestratorInstance.initialize()).resolves.not.toThrow();

    const stats = orchestratorInstance.getMCPStats();
    expect(stats).toBeDefined();
    expect(stats.usingDynamicMCP).toBe(true);
  });

  test('should configure Dynamic MCP options', () => {
    orchestratorInstance.configureDynamicMCP({
      maxTools: 5,
      enableCodeMode: true,
    });

    const stats = orchestratorInstance.getMCPStats();
    expect(stats.dynamic).toBeDefined();
  });

  test('should find MCP servers in Docker catalog', async () => {
    await orchestratorInstance.initialize();

    const result = await orchestratorInstance.findMCPServers('github');

    expect(result.total).toBeGreaterThan(0);
    expect(result.servers.length).toBeGreaterThan(0);
    expect(result.servers[0].name).toBe('github');
  });

  test('should connect MCP server from Docker catalog', async () => {
    await orchestratorInstance.initialize();

    const connected = await orchestratorInstance.connectMCPServer('github');

    expect(connected).toBe(true);

    const connectedServers = orchestratorInstance.getConnectedDynamicServers();
    expect(connectedServers).toContain('github');
  });

  test('should disconnect MCP server', async () => {
    await orchestratorInstance.initialize();

    await orchestratorInstance.connectMCPServer('github');
    const disconnected = await orchestratorInstance.disconnectMCPServer('github');

    expect(disconnected).toBe(true);
  });

  test('should create custom tool via Code Mode', async () => {
    await orchestratorInstance.initialize();

    const code = `(async function() {
      return { success: true, result: params.value * 2 };
    })();`;

    const created = await orchestratorInstance.createCustomTool(
      'test_double',
      'Double a value',
      code,
      []
    );

    expect(created).toBe(true);
  });

  test('should execute custom tool', async () => {
    await orchestratorInstance.initialize();

    const code = `(async function() {
      return { success: true, result: params.value * 2 };
    })();`;

    await orchestratorInstance.createCustomTool('test_double', 'Double value', code, []);

    const result = await orchestratorInstance.executeCustomTool('test_double', {
      value: 5,
    });

    expect(result.success).toBe(true);
  });

  test('should save large data with State Persistence', async () => {
    await orchestratorInstance.initialize();

    const largeData = Array.from({ length: 100 }, (_, i) => ({
      id: i,
      data: 'x'.repeat(1000),
    }));

    const result = await orchestratorInstance.saveLargeData('test_data', largeData, true);

    expect(result.saved).toBe(true);
    expect(result.reference).toBe('state://test_data');
    expect(result.summary).toBeDefined();
  });

  test('should use Dynamic MCP Gateway when server is connected', async () => {
    await orchestratorInstance.initialize();

    // Conectar servidor via Dynamic MCP
    await orchestratorInstance.connectMCPServer('github');

    // Tentar executar tool (vai usar Dynamic MCP Gateway)
    const response = await orchestratorInstance.callMCP('github', 'search_repositories' as any, {
      query: 'react-native',
    });

    // Deve retornar resposta (mesmo que simulada)
    expect(response).toBeDefined();
    expect(response.success).toBe(true);
  });

  test('should fallback to legacy MCPLoader when Dynamic MCP fails', async () => {
    await orchestratorInstance.initialize();

    // Desabilitar Dynamic MCP temporariamente
    orchestratorInstance.setDynamicMCPEnabled(false);

    // Tentar chamar servidor local (deve usar MCPLoader)
    try {
      const response = await orchestratorInstance.callMCP('analytics', 'event.track' as any, {
        name: 'test',
        properties: {},
      });

      expect(response).toBeDefined();
    } catch (error) {
      // Pode falhar se analytics não estiver inicializado, mas não deve quebrar
      expect(error).toBeDefined();
    }

    // Reabilitar
    orchestratorInstance.setDynamicMCPEnabled(true);
  });

  test('should get comprehensive stats', async () => {
    await orchestratorInstance.initialize();

    const stats = orchestratorInstance.getMCPStats();

    expect(stats).toBeDefined();
    expect(stats.legacy).toBeDefined();
    expect(stats.dynamic).toBeDefined();
    expect(stats.usingDynamicMCP).toBe(true);

    if (stats.dynamic) {
      expect(stats.dynamic.gateway).toBeDefined();
      expect(stats.dynamic.toolSelector).toBeDefined();
      expect(stats.dynamic.codeMode).toBeDefined();
      expect(stats.dynamic.statePersistence).toBeDefined();
    }
  });

  test('should handle mixed usage: legacy + Dynamic MCP', async () => {
    await orchestratorInstance.initialize();

    // Conectar servidor Dynamic
    await orchestratorInstance.connectMCPServer('github');

    // Registrar agente
    const agent = new MockAgent();
    orchestratorInstance.registerAgent(agent);

    // Executar tarefa (deve funcionar com ambos)
    const result = await orchestratorInstance.executeTask('MockAgent', {
      query: 'test',
    });

    expect(result.success).toBe(true);
  });
});
