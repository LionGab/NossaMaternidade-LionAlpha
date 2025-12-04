/**
 * Testes para Advanced Tool Use Patterns
 */

import { ToolExecutor, ToolCall } from '../../src/agents/core/ToolExecutor';
import { MCPLoader } from '../../src/agents/core/MCPLoader';
import { MCPRequest, MCPResponse, createMCPResponse, JsonValue } from '../../src/mcp/types';

// Type assertion para permitir métodos de teste
type TestToolCall = {
  server: string;
  method: string;
  params: Record<string, unknown>;
  id?: string;
  metadata?: Record<string, JsonValue>;
};

describe('ToolExecutor', () => {
  let executor: ToolExecutor;

  beforeEach(() => {
    executor = new ToolExecutor();
  });

  describe('Parallel Execution', () => {
    it('deve executar múltiplas ferramentas em paralelo', async () => {
      const calls: TestToolCall[] = [
        { server: 'test', method: 'test.method1', params: { value: 1 } },
        { server: 'test', method: 'test.method2', params: { value: 2 } },
        { server: 'test', method: 'test.method3', params: { value: 3 } },
      ];

      const mockExecutor = async (request: MCPRequest): Promise<MCPResponse> => {
        const value = (request.params as Record<string, unknown>).value;
        return createMCPResponse(request.id, { result: value as JsonValue });
      };

      const result = await executor.executeParallel(calls as ToolCall[], mockExecutor);

      expect(result.allSucceeded).toBe(true);
      expect(result.data).toHaveLength(3);
      expect(result.errors).toHaveLength(0);
    });

    it('deve agregar erros sem falhar completamente', async () => {
      const calls: TestToolCall[] = [
        { server: 'test', method: 'test.success', params: {} },
        { server: 'test', method: 'test.fail', params: {} },
      ];

      const mockExecutor = async (request: MCPRequest): Promise<MCPResponse> => {
        if (request.method === 'test.fail') {
          throw new Error('Simulated failure');
        }
        return createMCPResponse(request.id, { success: true });
      };

      const result = await executor.executeParallel(calls as ToolCall[], mockExecutor);

      expect(result.allSucceeded).toBe(false);
      expect(result.data).toHaveLength(1); // Apenas o sucesso
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].error).toContain('Simulated failure');
    });

    it('deve ser mais rápido que execução sequencial', async () => {
      const calls: TestToolCall[] = Array.from({ length: 3 }, (_, i) => ({
        server: 'test',
        method: 'test.slow',
        params: { index: i },
      }));

      const mockExecutor = async (request: MCPRequest): Promise<MCPResponse> => {
        // Simula delay de 100ms
        await new Promise((resolve) => setTimeout(resolve, 100));
        return createMCPResponse(request.id, { done: true });
      };

      const startParallel = Date.now();
      await executor.executeParallel(calls as ToolCall[], mockExecutor);
      const parallelTime = Date.now() - startParallel;

      const startSequential = Date.now();
      await executor.executeSequential(calls as ToolCall[], mockExecutor);
      const sequentialTime = Date.now() - startSequential;

      // Paralelo deve ser ~3x mais rápido (3 * 100ms vs 100ms)
      expect(parallelTime).toBeLessThan(sequentialTime * 0.5);
    });
  });

  describe('Retry Logic', () => {
    it('deve fazer retry em caso de erro recuperável', async () => {
      const calls: TestToolCall[] = [{ server: 'test', method: 'test.flaky', params: {} }];

      let attempts = 0;
      const mockExecutor = async (request: MCPRequest): Promise<MCPResponse> => {
        attempts++;
        if (attempts < 3) {
          throw new Error('Network timeout');
        }
        return createMCPResponse(request.id, { success: true });
      };

      const result = await executor.executeParallel(calls as ToolCall[], mockExecutor, {
        retry: {
          maxAttempts: 3,
          initialDelay: 10,
          backoffMultiplier: 2,
          maxDelay: 1000,
        },
      });

      expect(result.allSucceeded).toBe(true);
      expect(attempts).toBe(3);
    });

    it('deve respeitar maxAttempts', async () => {
      const calls: TestToolCall[] = [{ server: 'test', method: 'test.alwaysFails', params: {} }];

      let attempts = 0;
      const mockExecutor = async (): Promise<MCPResponse> => {
        attempts++;
        throw new Error('Network timeout');
      };

      const result = await executor.executeParallel(calls as ToolCall[], mockExecutor, {
        retry: {
          maxAttempts: 2,
          initialDelay: 10,
          backoffMultiplier: 2,
          maxDelay: 1000,
        },
      });

      expect(result.allSucceeded).toBe(false);
      expect(attempts).toBe(2);
    });

    it('não deve fazer retry em erros não recuperáveis', async () => {
      const calls: TestToolCall[] = [{ server: 'test', method: 'test.invalidParams', params: {} }];

      let attempts = 0;
      const mockExecutor = async (): Promise<MCPResponse> => {
        attempts++;
        throw new Error('Invalid parameters'); // Não é erro de rede
      };

      await executor.executeParallel(calls as ToolCall[], mockExecutor, {
        retry: {
          maxAttempts: 3,
          initialDelay: 10,
          backoffMultiplier: 2,
          maxDelay: 1000,
          retryOn: (error) => {
            return error instanceof Error && error.message.includes('network');
          },
        },
      });

      expect(attempts).toBe(1); // Não fez retry
    });
  });

  describe('Result Aggregation', () => {
    it('deve agregar resultados corretamente', async () => {
      const calls: TestToolCall[] = Array.from({ length: 5 }, (_, i) => ({
        server: 'test',
        method: 'test.number',
        params: { value: i + 1 },
      }));

      const mockExecutor = async (request: MCPRequest): Promise<MCPResponse> => {
        const value = (request.params as Record<string, unknown>).value;
        return createMCPResponse(request.id, value as JsonValue);
      };

      const aggregator = (results: unknown[]) => {
        const numbers = results as number[];
        return {
          sum: numbers.reduce((a, b) => a + b, 0),
          average: numbers.reduce((a, b) => a + b, 0) / numbers.length,
          count: numbers.length,
        };
      };

      const result = await executor.executeWithAggregation(
        calls as ToolCall[],
        mockExecutor,
        aggregator
      );

      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        sum: 15, // 1+2+3+4+5
        average: 3, // 15/5
        count: 5,
      });
    });
  });

  describe('Timeout', () => {
    it('deve respeitar timeout configurado', async () => {
      const calls: TestToolCall[] = [{ server: 'test', method: 'test.slow', params: {} }];

      const mockExecutor = async (): Promise<MCPResponse> => {
        // Simula operação lenta (200ms)
        await new Promise((resolve) => setTimeout(resolve, 200));
        return createMCPResponse('test', { done: true });
      };

      const result = await executor.executeParallel(calls as ToolCall[], mockExecutor, {
        timeout: 50, // Timeout de 50ms
        retry: {
          maxAttempts: 1, // Sem retry para simplificar
          initialDelay: 10,
          backoffMultiplier: 1,
          maxDelay: 10,
        },
      });

      expect(result.allSucceeded).toBe(false);
      expect(result.errors[0].error).toContain('Timeout');
    });
  });
});

describe('MCPLoader', () => {
  let loader: MCPLoader;

  beforeEach(() => {
    loader = new MCPLoader();
  });

  describe('Lazy Loading', () => {
    it('deve carregar apenas servidores essenciais', async () => {
      // Registrar servidores
      loader.register({
        name: 'essential1',
        factory: () => createMockServer('essential1'),
        deferLoading: false,
        priority: 100,
        tags: ['essential'],
        description: 'Essential server 1',
      });

      loader.register({
        name: 'optional1',
        factory: () => createMockServer('optional1'),
        deferLoading: true,
        priority: 50,
        tags: ['optional'],
        description: 'Optional server 1',
      });

      // Inicializar apenas essenciais
      await loader.initializeEssential();

      const stats = loader.getStats();
      expect(stats.loaded).toBe(1); // Apenas essential1
      expect(stats.deferred).toBe(1); // optional1
    });

    it('deve carregar servidor on-demand', async () => {
      loader.register({
        name: 'ondemand',
        factory: () => createMockServer('ondemand'),
        deferLoading: true,
        priority: 50,
        tags: ['lazy'],
        description: 'On-demand server',
      });

      await loader.initializeEssential();

      let stats = loader.getStats();
      expect(stats.loaded).toBe(0);

      // Buscar servidor (deve carregar on-demand)
      const server = await loader.getServer('ondemand');
      expect(server).toBeTruthy();

      stats = loader.getStats();
      expect(stats.loaded).toBe(1);
    });
  });

  describe('Tool Search', () => {
    beforeEach(() => {
      loader.register({
        name: 'server1',
        factory: () => createMockServer('server1'),
        deferLoading: false,
        priority: 100,
        tags: ['ai', 'chat'],
        description: 'AI chat server',
      });

      loader.register({
        name: 'server2',
        factory: () => createMockServer('server2'),
        deferLoading: false,
        priority: 90,
        tags: ['database', 'storage'],
        description: 'Database and storage',
      });
    });

    it('deve buscar servidores por tag', () => {
      const aiServers = loader.searchByTag('ai');
      expect(aiServers).toContain('server1');
      expect(aiServers).not.toContain('server2');

      const dbServers = loader.searchByTag('database');
      expect(dbServers).toContain('server2');
      expect(dbServers).not.toContain('server1');
    });

    it('deve buscar servidores por descrição', () => {
      const chatServers = loader.searchByDescription('chat');
      expect(chatServers).toContain('server1');

      const storageServers = loader.searchByDescription('storage');
      expect(storageServers).toContain('server2');
    });

    it('deve ordenar por prioridade', () => {
      loader.register({
        name: 'highPriority',
        factory: () => createMockServer('high'),
        deferLoading: false,
        priority: 200,
        tags: ['test'],
        description: 'High priority',
      });

      loader.register({
        name: 'lowPriority',
        factory: () => createMockServer('low'),
        deferLoading: false,
        priority: 10,
        tags: ['test'],
        description: 'Low priority',
      });

      const servers = loader.searchByTag('test');
      expect(servers[0]).toBe('highPriority');
      expect(servers[1]).toBe('lowPriority');
    });
  });
});

// ============================================================================
// HELPERS
// ============================================================================

function createMockServer(name: string) {
  return {
    name,
    version: '1.0.0',
    initialize: jest.fn().mockResolvedValue(undefined),
    handleRequest: jest.fn().mockResolvedValue(createMCPResponse('test', { server: name })),
    shutdown: jest.fn().mockResolvedValue(undefined),
  };
}
