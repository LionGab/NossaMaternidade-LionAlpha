/**
 * Code Mode Executor
 *
 * Executa código JavaScript gerado por agentes em sandbox Docker.
 * Implementa o conceito de "Code Mode" do Docker MCP.
 *
 * Features:
 * - Execução segura em containers Docker
 * - Criação de tools customizadas sob demanda
 * - Chaining de MCP tools dentro do código
 * - Isolamento completo do sistema host
 */

import { logger } from '../../utils/logger';
import { JsonValue } from '../types';

export interface CodeModeTool {
  /** Nome da tool customizada */
  name: string;
  /** Descrição da tool */
  description: string;
  /** Código JavaScript a ser executado */
  code: string;
  /** Parâmetros de entrada */
  inputSchema: Record<string, unknown>;
  /** Servidor MCP que criou esta tool */
  createdBy: string;
}

export interface CodeExecutionResult {
  success: boolean;
  output?: JsonValue;
  error?: string;
  executionTime: number;
  logs?: string[];
}

export interface SandboxConfig {
  /** Imagem Docker a usar */
  image?: string;
  /** Memória limite (MB) */
  memoryLimit?: number;
  /** CPU limite */
  cpuLimit?: number;
  /** Timeout em segundos */
  timeout?: number;
  /** Variáveis de ambiente */
  env?: Record<string, string>;
  /** Volumes a montar */
  volumes?: Array<{ host: string; container: string; readonly?: boolean }>;
}

/**
 * Code Mode Executor
 *
 * Executa código JavaScript em sandbox Docker
 */
export class CodeModeExecutor {
  private static instance: CodeModeExecutor;
  private sandboxConfig: SandboxConfig;
  private customTools: Map<string, CodeModeTool> = new Map();
  private executionHistory: Array<{
    toolName: string;
    timestamp: number;
    success: boolean;
  }> = [];

  private constructor() {
    // Configuração padrão do sandbox
    this.sandboxConfig = {
      image: 'node:20-alpine', // Imagem leve com Node.js
      memoryLimit: 512, // 512MB
      cpuLimit: 1, // 1 CPU core
      timeout: 30, // 30 segundos
      env: {
        NODE_ENV: 'production',
      },
    };
  }

  static getInstance(): CodeModeExecutor {
    if (!CodeModeExecutor.instance) {
      CodeModeExecutor.instance = new CodeModeExecutor();
    }
    return CodeModeExecutor.instance;
  }

  /**
   * Configura o sandbox
   */
  configureSandbox(config: Partial<SandboxConfig>): void {
    this.sandboxConfig = {
      ...this.sandboxConfig,
      ...config,
    };
    logger.info('[CodeModeExecutor] Sandbox configured', { config: this.sandboxConfig });
  }

  /**
   * Cria uma tool customizada usando Code Mode
   */
  createTool(tool: CodeModeTool): boolean {
    try {
      // Validar código antes de salvar
      if (!this.validateCode(tool.code)) {
        logger.error('[CodeModeExecutor] Invalid code', { toolName: tool.name });
        return false;
      }

      this.customTools.set(tool.name, tool);
      logger.info('[CodeModeExecutor] Tool created', {
        name: tool.name,
        description: tool.description,
      });

      return true;
    } catch (error) {
      logger.error('[CodeModeExecutor] Failed to create tool', {
        toolName: tool.name,
        error,
      });
      return false;
    }
  }

  /**
   * Executa uma tool customizada
   */
  async executeTool(
    toolName: string,
    params: Record<string, JsonValue>
  ): Promise<CodeExecutionResult> {
    const tool = this.customTools.get(toolName);
    if (!tool) {
      return {
        success: false,
        error: `Tool ${toolName} not found`,
        executionTime: 0,
      };
    }

    const startTime = Date.now();

    try {
      logger.info('[CodeModeExecutor] Executing tool', {
        toolName,
        params: Object.keys(params),
      });

      // Em implementação real, isso executaria o código em um container Docker
      // Por enquanto, simulamos a execução
      const result = await this.executeInSandbox(tool.code, params);

      const executionTime = Date.now() - startTime;

      // Registrar execução
      this.executionHistory.push({
        toolName,
        timestamp: Date.now(),
        success: result.success,
      });

      return {
        ...result,
        executionTime,
      };
    } catch (error) {
      const executionTime = Date.now() - startTime;
      logger.error('[CodeModeExecutor] Tool execution failed', {
        toolName,
        error,
        executionTime,
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        executionTime,
      };
    }
  }

  /**
   * Executa código em sandbox Docker (simulado por enquanto)
   */
  private async executeInSandbox(
    code: string,
    params: Record<string, JsonValue>
  ): Promise<{ success: boolean; output?: JsonValue; logs?: string[] }> {
    // Em implementação real, isso:
    // 1. Criaria um container Docker temporário
    // 2. Montaria volumes se necessário
    // 3. Executaria o código com timeout
    // 4. Capturaria stdout/stderr
    // 5. Limparia o container

    // Por enquanto, simulamos
    logger.debug('[CodeModeExecutor] Executing in sandbox', {
      codeLength: code.length,
      paramCount: Object.keys(params).length,
    });

    // Simular execução
    await new Promise((resolve) => setTimeout(resolve, 100));

    return {
      success: true,
      output: { message: 'Code executed successfully (simulated)' },
      logs: ['Code execution simulated'],
    };
  }

  /**
   * Valida código JavaScript antes de executar
   */
  private validateCode(code: string): boolean {
    try {
      // Verificações básicas de segurança
      const dangerousPatterns = [
        /require\s*\(\s*['"]fs['"]/,
        /require\s*\(\s*['"]child_process['"]/,
        /require\s*\(\s*['"]os['"]/,
        /eval\s*\(/,
        /Function\s*\(/,
        /process\./,
        /__dirname/,
        /__filename/,
      ];

      for (const pattern of dangerousPatterns) {
        if (pattern.test(code)) {
          logger.warn('[CodeModeExecutor] Dangerous pattern detected', {
            pattern: pattern.toString(),
          });
          return false;
        }
      }

      // Tentar parsear o código (wrapped em função para capturar erros)
      try {
        // eslint-disable-next-line no-new-func
        new Function(code);
        return true;
      } catch (parseError) {
        logger.warn('[CodeModeExecutor] Code parse error', { error: parseError });
        return false;
      }
    } catch (error) {
      logger.error('[CodeModeExecutor] Code validation failed', error);
      return false;
    }
  }

  /**
   * Lista tools customizadas criadas
   */
  listCustomTools(): CodeModeTool[] {
    return Array.from(this.customTools.values());
  }

  /**
   * Obtém uma tool customizada
   */
  getTool(toolName: string): CodeModeTool | null {
    return this.customTools.get(toolName) || null;
  }

  /**
   * Remove uma tool customizada
   */
  removeTool(toolName: string): boolean {
    const removed = this.customTools.delete(toolName);
    if (removed) {
      logger.info('[CodeModeExecutor] Tool removed', { toolName });
    }
    return removed;
  }

  /**
   * Obtém histórico de execuções
   */
  getExecutionHistory(limit = 50): Array<{
    toolName: string;
    timestamp: number;
    success: boolean;
  }> {
    return this.executionHistory.slice(-limit);
  }

  /**
   * Limpa histórico
   */
  clearHistory(): void {
    this.executionHistory = [];
  }

  /**
   * Gera código template para uma tool customizada
   */
  generateToolTemplate(name: string, description: string, mcpToolsToUse: string[]): string {
    const toolCalls = mcpToolsToUse.map((tool) => `  // Call ${tool} MCP tool here`).join('\n');

    return `/**
 * ${description}
 * 
 * Custom tool created via Code Mode
 * Uses MCP tools: ${mcpToolsToUse.join(', ')}
 */
async function ${name}(params) {
  const { ${Object.keys({}).join(', ')} } = params;
  
${toolCalls}
  
  // Process results and return
  return {
    success: true,
    data: {}
  };
}

// Execute and return result
return await ${name}(params);
`;
  }
}

// Singleton export
export const codeModeExecutor = CodeModeExecutor.getInstance();
