/**
 * Dynamic MCP System Tests
 *
 * Testa todos os componentes do Dynamic MCP system
 */

import {
  dockerDynamicMCPGateway,
  dynamicToolSelector,
  codeModeExecutor,
  statePersistenceManager,
  dynamicMCPIntegration,
} from '../index';
import type { ToolDefinition } from '../DockerDynamicMCPGateway';

describe('Dynamic MCP System', () => {
  beforeEach(() => {
    // Reset state before each test
    jest.clearAllMocks();
  });

  describe('DockerDynamicMCPGateway', () => {
    test('should initialize successfully', async () => {
      await expect(dockerDynamicMCPGateway.initialize()).resolves.not.toThrow();
    });

    test('should discover servers', async () => {
      await dockerDynamicMCPGateway.initialize();
      const result = await dockerDynamicMCPGateway.findServers('github');

      expect(result.servers.length).toBeGreaterThan(0);
      expect(result.servers[0].name).toBe('github');
    });

    test('should add server', async () => {
      await dockerDynamicMCPGateway.initialize();
      const added = await dockerDynamicMCPGateway.addServer('github');

      expect(added).toBe(true);
      expect(dockerDynamicMCPGateway.isConnected('github')).toBe(true);
    });

    test('should get available tools from connected servers', async () => {
      await dockerDynamicMCPGateway.initialize();
      await dockerDynamicMCPGateway.addServer('github');

      const tools = dockerDynamicMCPGateway.getAvailableTools();
      expect(tools.length).toBeGreaterThan(0);
      expect(tools.some((t) => t.name.includes('search'))).toBe(true);
    });

    test('should execute tool', async () => {
      await dockerDynamicMCPGateway.initialize();
      await dockerDynamicMCPGateway.addServer('github');

      const response = await dockerDynamicMCPGateway.executeTool('search_repositories', {
        query: 'react-native',
      });

      expect(response.success).toBe(true);
    });
  });

  describe('DynamicToolSelector', () => {
    test('should select relevant tools', () => {
      const availableTools: ToolDefinition[] = [
        {
          name: 'search_repositories',
          description: 'Search GitHub repositories',
          inputSchema: {},
          server: 'github',
        },
        {
          name: 'get_repository',
          description: 'Get repository details',
          inputSchema: {},
          server: 'github',
        },
        {
          name: 'browser_navigate',
          description: 'Navigate browser',
          inputSchema: {},
          server: 'playwright',
        },
        {
          name: 'query',
          description: 'Query database',
          inputSchema: {},
          server: 'postgres',
        },
      ];

      const result = dynamicToolSelector.selectTools(availableTools, {
        query: 'buscar repositórios GitHub',
        maxTools: 2,
        relevantTags: ['git', 'search'],
      });

      expect(result.selectedTools.length).toBeLessThanOrEqual(2);
      expect(result.selectedTools.length).toBeGreaterThan(0);
      expect(result.tokenSavings).toBeGreaterThan(0);
      expect(result.reasoning).toBeTruthy();
    });

    test('should record tool usage', () => {
      dynamicToolSelector.recordToolUsage('search_repositories');
      dynamicToolSelector.recordToolUsage('search_repositories');

      const stats = dynamicToolSelector.getUsageStats();
      expect(stats.get('search_repositories')).toBe(2);
    });
  });

  describe('CodeModeExecutor', () => {
    test('should create custom tool', () => {
      const tool = {
        name: 'test_tool',
        description: 'Test tool',
        code: 'return { success: true, data: params };',
        inputSchema: {},
        createdBy: 'test',
      };

      const created = codeModeExecutor.createTool(tool);
      expect(created).toBe(true);
    });

    test('should reject dangerous code', () => {
      const dangerousTool = {
        name: 'dangerous_tool',
        description: 'Dangerous tool',
        code: "require('fs').readFileSync('/etc/passwd')",
        inputSchema: {},
        createdBy: 'test',
      };

      const created = codeModeExecutor.createTool(dangerousTool);
      expect(created).toBe(false);
    });

    test('should execute tool', async () => {
      const tool = {
        name: 'simple_tool',
        description: 'Simple test tool',
        code: 'return { success: true, result: params.value };',
        inputSchema: {},
        createdBy: 'test',
      };

      codeModeExecutor.createTool(tool);
      const result = await codeModeExecutor.executeTool('simple_tool', {
        value: 'test',
      });

      expect(result.success).toBe(true);
    });

    test('should list custom tools', () => {
      const tool = {
        name: 'list_test_tool',
        description: 'Tool for listing test',
        code: 'return {};',
        inputSchema: {},
        createdBy: 'test',
      };

      codeModeExecutor.createTool(tool);
      const tools = codeModeExecutor.listCustomTools();

      expect(tools.length).toBeGreaterThan(0);
      expect(tools.some((t) => t.name === 'list_test_tool')).toBe(true);
    });

    test('should generate tool template', () => {
      const template = codeModeExecutor.generateToolTemplate(
        'multiarch_repos',
        'Search multiple repos',
        ['github', 'search']
      );

      expect(template).toContain('multiarch_repos');
      expect(template).toContain('Search multiple repos');
      expect(template).toContain('github');
    });
  });

  describe('StatePersistenceManager', () => {
    test('should initialize', async () => {
      await expect(statePersistenceManager.initialize()).resolves.not.toThrow();
    });

    test('should save and load state', async () => {
      await statePersistenceManager.initialize();

      const testData = { key: 'value', array: [1, 2, 3] };
      const saved = await statePersistenceManager.saveState('test_key', testData);

      expect(saved).toBe(true);

      const loaded = await statePersistenceManager.loadState('test_key');
      expect(loaded).toEqual(testData);
    });

    test('should save large data with summary', async () => {
      await statePersistenceManager.initialize();

      const largeData = Array.from({ length: 100 }, (_, i) => ({
        id: i,
        name: `item-${i}`,
        data: 'x'.repeat(1000),
      }));

      const result = await statePersistenceManager.saveLargeData('large_data', largeData, true);

      expect(result.saved).toBe(true);
      expect(result.reference).toBe('state://large_data');
      expect(result.summary).toBeDefined();

      // Type guard para verificar se summary é um objeto
      if (result.summary && typeof result.summary === 'object' && !Array.isArray(result.summary)) {
        expect(result.summary.type).toBe('array');
      }
    });

    test('should delete state', async () => {
      await statePersistenceManager.initialize();

      await statePersistenceManager.saveState('delete_test', { data: 'test' });
      const deleted = await statePersistenceManager.deleteState('delete_test');

      expect(deleted).toBe(true);

      const loaded = await statePersistenceManager.loadState('delete_test');
      expect(loaded).toBeNull();
    });

    test('should list states', async () => {
      await statePersistenceManager.initialize();

      await statePersistenceManager.saveState('list_test_1', {});
      await statePersistenceManager.saveState('list_test_2', {});

      const states = await statePersistenceManager.listStates();
      expect(states.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('DynamicMCPIntegration', () => {
    test('should initialize', async () => {
      await expect(
        dynamicMCPIntegration.initialize({
          useDynamicSelection: true,
          enableCodeMode: true,
          enableStatePersistence: true,
        })
      ).resolves.not.toThrow();
    });

    test('should execute task with dynamic tool selection', async () => {
      await dynamicMCPIntegration.initialize();

      const result = await dynamicMCPIntegration.executeTask(
        'buscar repositórios sobre React Native',
        { taskType: 'search' }
      );

      expect(result.selectedTools.length).toBeGreaterThan(0);
      expect(result.tokenSavings).toBeGreaterThanOrEqual(0);
      expect(result.reasoning).toBeTruthy();
    });

    test('should create custom tool', async () => {
      await dynamicMCPIntegration.initialize({
        enableCodeMode: true,
      });

      const created = await dynamicMCPIntegration.createCustomTool(
        'integration_test_tool',
        'Test tool for integration',
        'return { success: true };',
        []
      );

      expect(created).toBe(true);
    });

    test('should get stats', async () => {
      await dynamicMCPIntegration.initialize();

      const stats = dynamicMCPIntegration.getStats();

      expect(stats).toBeDefined();
      expect(stats.gateway).toBeDefined();
      expect(stats.toolSelector).toBeDefined();
      expect(stats.codeMode).toBeDefined();
      expect(stats.statePersistence).toBeDefined();
    });

    test('should configure options', () => {
      dynamicMCPIntegration.configure({
        maxTools: 5,
      });

      const stats = dynamicMCPIntegration.getStats();
      expect(stats).toBeDefined();
    });
  });

  describe('Integration Tests', () => {
    test('should work end-to-end: discover -> select -> execute', async () => {
      // 1. Initialize
      await dynamicMCPIntegration.initialize();

      // 2. Find and connect servers
      const searchResult = await dockerDynamicMCPGateway.findServers('github');
      expect(searchResult.servers.length).toBeGreaterThan(0);

      await dockerDynamicMCPGateway.addServer('github');

      // 3. Get available tools
      const allTools = dockerDynamicMCPGateway.getAvailableTools();
      expect(allTools.length).toBeGreaterThan(0);

      // 4. Select relevant tools
      const selection = dynamicToolSelector.selectTools(allTools, {
        query: 'search repositories',
        maxTools: 3,
      });

      expect(selection.selectedTools.length).toBeLessThanOrEqual(3);
      expect(selection.tokenSavings).toBeGreaterThan(0);

      // 5. Execute tool
      const response = await dockerDynamicMCPGateway.executeTool('search_repositories', {
        query: 'react-native',
      });

      expect(response.success).toBe(true);
    });

    test('should create and execute custom tool', async () => {
      await dynamicMCPIntegration.initialize({
        enableCodeMode: true,
      });

      // Create custom tool
      const code = `(async function() {
        async function testTool(params) {
          const input = params.input || 0;
          return {
            success: true,
            result: input * 2
          };
        }
        return await testTool(params);
      })();`;

      const created = await dynamicMCPIntegration.createCustomTool(
        'double_value',
        'Double a value',
        code,
        []
      );

      expect(created).toBe(true);

      // Execute custom tool
      const result = await codeModeExecutor.executeTool('double_value', {
        input: 5,
      });

      expect(result.success).toBe(true);
    });

    test('should persist state and avoid context pollution', async () => {
      await dynamicMCPIntegration.initialize({
        enableStatePersistence: true,
      });

      // Create large dataset
      const largeData = {
        repositories: Array.from({ length: 50 }, (_, i) => ({
          id: i,
          name: `repo-${i}`,
          stars: Math.floor(Math.random() * 1000),
          description: 'x'.repeat(200),
        })),
      };

      // Save with summary
      const saveResult = await dynamicMCPIntegration.saveLargeData('repos_data', largeData, true);

      expect(saveResult.saved).toBe(true);
      expect(saveResult.reference).toBe('state://repos_data');
      expect(saveResult.summary).toBeDefined();

      // Model receives only reference + summary, not full data
      const summarySize = JSON.stringify(saveResult.summary).length;
      const fullDataSize = JSON.stringify(largeData).length;

      expect(summarySize).toBeLessThan(fullDataSize / 10); // Summary is < 10% of full data
    });
  });
});
