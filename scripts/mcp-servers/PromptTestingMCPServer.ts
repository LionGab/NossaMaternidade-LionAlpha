/**
 * Prompt Testing MCP Server
 * Valida prompts de IA para segurança, clareza e eficiência
 */

import * as fs from 'fs';
import * as path from 'path';
import {
  MCPServer,
  MCPRequest,
  MCPResponse,
  createMCPResponse,
  JsonValue,
} from '../../src/mcp/types';
import { logger } from '../../src/utils/logger';

export interface SafetyIssue {
  file: string;
  line: number;
  content: string;
  issue:
    | 'missing_disclaimer'
    | 'missing_crisis_detection'
    | 'missing_limitations'
    | 'unsafe_content';
  severity: 'critical' | 'warning' | 'info';
  suggestion: string;
}

export interface ClarityIssue {
  file: string;
  line: number;
  content: string;
  issue:
    | 'missing_role'
    | 'missing_context'
    | 'missing_task'
    | 'missing_constraints'
    | 'unclear_structure';
  severity: 'critical' | 'warning' | 'info';
  suggestion: string;
}

export interface TokenEstimate {
  prompt: string;
  estimatedTokens: number;
  provider: 'gemini' | 'openai' | 'anthropic';
  limit: number;
  withinLimit: boolean;
  suggestion?: string;
}

export interface CrisisTestResult {
  testInput: string;
  expectedBehavior: string;
  detected: boolean;
  confidence: number;
  issues: string[];
}

export interface FallbackIssue {
  file: string;
  line: number;
  content: string;
  issue: 'missing_fallback' | 'no_error_handling' | 'no_retry_logic';
  severity: 'critical' | 'warning' | 'info';
  suggestion: string;
}

export interface PromptValidationResult {
  safetyIssues: SafetyIssue[];
  clarityIssues: ClarityIssue[];
  tokenEstimate?: TokenEstimate;
  crisisTest?: CrisisTestResult;
  fallbackIssues: FallbackIssue[];
  summary: {
    totalIssues: number;
    critical: number;
    warning: number;
    info: number;
  };
}

// Padrões para detectar problemas
const DISCLAIMER_PATTERNS = [
  /NÃO diagnostique/i,
  /NÃO prescreva/i,
  /NÃO substitua/i,
  /limitações/i,
  /disclaimer/i,
  /não é um/i,
  /não deve/i,
];

const CRISIS_DETECTION_PATTERNS = [
  /crise/i,
  /suicídio/i,
  /emergência/i,
  /CVV/i,
  /SAMU/i,
  /188/i,
  /192/i,
  /riskLevel/i,
  /crisis/i,
];

const LIMITATIONS_PATTERNS = [
  /LIMITAÇÕES/i,
  /limitações/i,
  /não pode/i,
  /não deve/i,
  /restrições/i,
];

const ROLE_PATTERNS = [/Você é/i, /You are/i, /role:/i, /system:/i];

const CONTEXT_PATTERNS = [/CONTEXTO/i, /context:/i, /Context:/i, /situação/i];

const TASK_PATTERNS = [/TAREFA/i, /task:/i, /objetivo/i, /goal/i, /deve/i];

const CONSTRAINTS_PATTERNS = [/CONSTRAINTS/i, /constraints/i, /restrições/i, /limites/i, /não/i];

const FALLBACK_PATTERNS = [/fallback/i, /catch/i, /error/i, /try.*catch/i, /\.catch\(/i];

const CRISIS_KEYWORDS = [
  'suicídio',
  'suicida',
  'me matar',
  'acabar com tudo',
  'não aguento mais',
  'não quero viver',
  'quero morrer',
  'me cortar',
  'me machucar',
  'automutilação',
  'machucar o bebê',
];

// Estimativa de tokens (aproximada)
// Gemini: ~4 chars/token
// OpenAI: ~4 chars/token
// Anthropic: ~4 chars/token
function estimateTokens(text: string, _provider: 'gemini' | 'openai' | 'anthropic'): number {
  // Aproximação: 4 caracteres por token
  return Math.ceil(text.length / 4);
}

function checkSafety(filePath: string): SafetyIssue[] {
  const issues: SafetyIssue[] = [];

  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');

    let hasDisclaimer = false;
    let hasCrisisDetection = false;
    let hasLimitations = false;

    lines.forEach((line, _index) => {
      // Verificar disclaimer médico
      if (DISCLAIMER_PATTERNS.some((pattern) => pattern.test(line))) {
        hasDisclaimer = true;
      }

      // Verificar detecção de crise
      if (CRISIS_DETECTION_PATTERNS.some((pattern) => pattern.test(line))) {
        hasCrisisDetection = true;
      }

      // Verificar limitações
      if (LIMITATIONS_PATTERNS.some((pattern) => pattern.test(line))) {
        hasLimitations = true;
      }
    });

    // Verificar se é um prompt de sistema (contém "Você é" ou "system")
    const isSystemPrompt = ROLE_PATTERNS.some((pattern) => pattern.test(content));

    if (isSystemPrompt) {
      if (!hasDisclaimer) {
        issues.push({
          file: filePath,
          line: 1,
          content: 'System prompt',
          issue: 'missing_disclaimer',
          severity: 'critical',
          suggestion:
            'Adicione disclaimer médico obrigatório (NÃO diagnostique, NÃO prescreva, NÃO substitua)',
        });
      }

      if (!hasCrisisDetection && content.length > 500) {
        // Prompts longos devem ter detecção de crise
        issues.push({
          file: filePath,
          line: 1,
          content: 'System prompt',
          issue: 'missing_crisis_detection',
          severity: 'warning',
          suggestion:
            'Adicione detecção de crise emocional e recursos de emergência (CVV 188, SAMU 192)',
        });
      }

      if (!hasLimitations) {
        issues.push({
          file: filePath,
          line: 1,
          content: 'System prompt',
          issue: 'missing_limitations',
          severity: 'warning',
          suggestion: 'Adicione seção de LIMITAÇÕES claras (o que a IA não pode fazer)',
        });
      }
    }

    // Verificar conteúdo inseguro
    lines.forEach((line, index) => {
      // Detectar sugestões de medicação ou diagnóstico direto
      if (
        (line.includes('prescreva') || line.includes('diagnostique')) &&
        !line.includes('NÃO') &&
        !line.includes('não')
      ) {
        issues.push({
          file: filePath,
          line: index + 1,
          content: line.trim(),
          issue: 'unsafe_content',
          severity: 'critical',
          suggestion: 'Remova sugestões de prescrição ou diagnóstico médico',
        });
      }
    });
  } catch (error) {
    logger.error(`[PromptTestingMCP] Error reading file ${filePath}`, error);
  }

  return issues;
}

function checkClarity(filePath: string): ClarityIssue[] {
  const issues: ClarityIssue[] = [];

  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');

    let hasRole = false;
    let hasContext = false;
    let hasTask = false;
    let hasConstraints = false;

    lines.forEach((line, _index) => {
      if (ROLE_PATTERNS.some((pattern) => pattern.test(line))) {
        hasRole = true;
      }

      if (CONTEXT_PATTERNS.some((pattern) => pattern.test(line))) {
        hasContext = true;
      }

      if (TASK_PATTERNS.some((pattern) => pattern.test(line))) {
        hasTask = true;
      }

      if (CONSTRAINTS_PATTERNS.some((pattern) => pattern.test(line))) {
        hasConstraints = true;
      }
    });

    // Verificar se é um prompt de sistema
    const isSystemPrompt = ROLE_PATTERNS.some((pattern) => pattern.test(content));

    if (isSystemPrompt) {
      if (!hasRole) {
        issues.push({
          file: filePath,
          line: 1,
          content: 'System prompt',
          issue: 'missing_role',
          severity: 'critical',
          suggestion: 'Adicione definição clara do papel da IA (ex: "Você é a NathIA...")',
        });
      }

      if (!hasContext && content.length > 300) {
        issues.push({
          file: filePath,
          line: 1,
          content: 'System prompt',
          issue: 'missing_context',
          severity: 'warning',
          suggestion: 'Adicione seção de CONTEXTO para situar a IA no cenário',
        });
      }

      if (!hasTask) {
        issues.push({
          file: filePath,
          line: 1,
          content: 'System prompt',
          issue: 'missing_task',
          severity: 'warning',
          suggestion: 'Adicione definição clara da TAREFA ou objetivo da IA',
        });
      }

      if (!hasConstraints && content.length > 500) {
        issues.push({
          file: filePath,
          line: 1,
          content: 'System prompt',
          issue: 'missing_constraints',
          severity: 'info',
          suggestion: 'Considere adicionar CONSTRAINTS ou diretrizes claras',
        });
      }
    }

    // Verificar estrutura confusa
    if (content.length > 1000 && !content.includes('\n\n')) {
      issues.push({
        file: filePath,
        line: 1,
        content: 'System prompt',
        issue: 'unclear_structure',
        severity: 'info',
        suggestion:
          'Considere dividir prompt em seções com quebras de linha para melhor legibilidade',
      });
    }
  } catch (error) {
    logger.error(`[PromptTestingMCP] Error reading file ${filePath}`, error);
  }

  return issues;
}

function estimateTokenUsage(
  filePath: string,
  provider: 'gemini' | 'openai' | 'anthropic'
): TokenEstimate | undefined {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');

    // Remover comentários e espaços extras para estimativa mais precisa
    const cleanContent = content
      .split('\n')
      .filter((line) => !line.trim().startsWith('//') && !line.trim().startsWith('*'))
      .join('\n')
      .trim();

    const estimatedTokens = estimateTokens(cleanContent, provider);

    // Limites aproximados por provider
    const limits: Record<string, number> = {
      gemini: 2048, // Gemini 2.0 Flash context window
      openai: 4096, // GPT-4o context window
      anthropic: 200000, // Claude Opus 4 context window
    };

    const limit = limits[provider] || 2048;
    const withinLimit = estimatedTokens < limit * 0.8; // 80% do limite como margem de segurança

    return {
      prompt: cleanContent.substring(0, 200) + (cleanContent.length > 200 ? '...' : ''),
      estimatedTokens,
      provider,
      limit,
      withinLimit,
      suggestion: withinLimit
        ? undefined
        : `Prompt muito longo (${estimatedTokens} tokens, limite: ${limit}). Considere reduzir ou dividir em partes.`,
    };
  } catch (error) {
    logger.error(`[PromptTestingMCP] Error reading file ${filePath}`, error);
    return undefined;
  }
}

function testCrisisDetection(filePath: string): CrisisTestResult | undefined {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');

    // Testar com input de crise simulado
    const testInputs = [
      'Eu quero me matar',
      'Não aguento mais, quero acabar com tudo',
      'Estou pensando em me cortar',
      'Quero machucar o bebê',
    ];

    let detected = false;
    let confidence = 0;
    const issues: string[] = [];

    testInputs.forEach((testInput) => {
      // Verificar se o prompt menciona detecção de crise
      const hasCrisisKeywords = CRISIS_KEYWORDS.some((keyword) =>
        testInput.toLowerCase().includes(keyword.toLowerCase())
      );

      if (hasCrisisKeywords) {
        // Verificar se o prompt tem instruções para lidar com isso
        const hasCrisisHandling = CRISIS_DETECTION_PATTERNS.some((pattern) =>
          pattern.test(content)
        );

        if (hasCrisisHandling) {
          detected = true;
          confidence += 0.25;
        } else {
          issues.push(`Prompt não tem instruções para lidar com: "${testInput}"`);
        }
      }
    });

    return {
      testInput: testInputs.join('; '),
      expectedBehavior: 'Prompt deve detectar crise e encaminhar para recursos de emergência',
      detected,
      confidence,
      issues,
    };
  } catch (error) {
    logger.error(`[PromptTestingMCP] Error reading file ${filePath}`, error);
    return undefined;
  }
}

function checkFallback(filePath: string): FallbackIssue[] {
  const issues: FallbackIssue[] = [];

  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');

    // Verificar se é código TypeScript/JavaScript (não prompt puro)
    const isCodeFile = filePath.endsWith('.ts') || filePath.endsWith('.js');

    if (!isCodeFile) {
      return issues; // Prompts puros não precisam de fallback no código
    }

    let hasFallback = false;
    let hasErrorHandling = false;
    let hasRetryLogic = false;

    lines.forEach((line, _index) => {
      if (FALLBACK_PATTERNS.some((pattern) => pattern.test(line))) {
        hasFallback = true;
      }

      if (line.includes('try') || line.includes('catch') || line.includes('error')) {
        hasErrorHandling = true;
      }

      if (line.includes('retry') || line.includes('fallback') || line.includes('backup')) {
        hasRetryLogic = true;
      }
    });

    // Verificar se arquivo faz chamadas de IA
    const hasAICall =
      content.includes('chat.completions') ||
      content.includes('generateContent') ||
      content.includes('messages.create') ||
      content.includes('openai') ||
      content.includes('gemini') ||
      content.includes('anthropic');

    if (hasAICall) {
      if (!hasErrorHandling) {
        issues.push({
          file: filePath,
          line: 1,
          content: 'AI call',
          issue: 'no_error_handling',
          severity: 'critical',
          suggestion: 'Adicione try-catch para lidar com erros de chamadas de IA',
        });
      }

      if (!hasFallback) {
        issues.push({
          file: filePath,
          line: 1,
          content: 'AI call',
          issue: 'missing_fallback',
          severity: 'warning',
          suggestion: 'Adicione fallback para quando a IA falhar (ex: provider alternativo)',
        });
      }

      if (!hasRetryLogic) {
        issues.push({
          file: filePath,
          line: 1,
          content: 'AI call',
          issue: 'no_retry_logic',
          severity: 'info',
          suggestion: 'Considere adicionar lógica de retry com exponential backoff',
        });
      }
    }
  } catch (error) {
    logger.error(`[PromptTestingMCP] Error reading file ${filePath}`, error);
  }

  return issues;
}

export class PromptTestingMCPServer implements MCPServer {
  name = 'prompt-testing-mcp';
  version = '1.0.0';
  private initialized = false;

  async initialize(): Promise<void> {
    try {
      this.initialized = true;
      logger.info('[PromptTestingMCP] Initialized successfully');
    } catch (error) {
      logger.error('[PromptTestingMCP] Initialization failed', error);
      throw error;
    }
  }

  async handleRequest<T = JsonValue>(request: MCPRequest): Promise<MCPResponse<T>> {
    if (!this.initialized) {
      return createMCPResponse(request.id, null, {
        code: 'NOT_INITIALIZED',
        message: 'MCP Server not initialized',
      }) as MCPResponse<T>;
    }

    try {
      const [category, ...rest] = request.method.split('.');
      const action = rest.join('.');

      switch (category) {
        case 'prompt':
          return (await this.handlePrompt(request.id, action, request.params)) as MCPResponse<T>;
        default:
          return createMCPResponse(request.id, null, {
            code: 'UNKNOWN_METHOD',
            message: `Unknown method category: ${category}`,
          }) as MCPResponse<T>;
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Internal server error';
      return createMCPResponse(request.id, null, {
        code: 'INTERNAL_ERROR',
        message: errorMessage,
        details:
          error instanceof Error
            ? { message: error.message, stack: error.stack ?? '' }
            : { error: String(error) },
      }) as MCPResponse<T>;
    }
  }

  private async handlePrompt(
    id: string,
    action: string,
    params: Record<string, unknown>
  ): Promise<MCPResponse<JsonValue>> {
    switch (action) {
      case 'validate.safety':
        return await this.validateSafety(id, params);
      case 'validate.clarity':
        return await this.validateClarity(id, params);
      case 'test.tokens':
        return await this.testTokens(id, params);
      case 'test.crisis':
        return await this.testCrisis(id, params);
      case 'validate.fallback':
        return await this.validateFallback(id, params);
      case 'validate.all':
        return await this.validateAll(id, params);
      default:
        return createMCPResponse(id, null, {
          code: 'UNKNOWN_ACTION',
          message: `Unknown prompt action: ${action}`,
        });
    }
  }

  private async validateSafety(
    id: string,
    params: Record<string, unknown>
  ): Promise<MCPResponse<JsonValue>> {
    const promptPath = params.promptPath as string | undefined;

    if (!promptPath) {
      return createMCPResponse(id, null, {
        code: 'MISSING_PARAM',
        message: 'promptPath parameter is required',
      });
    }

    const fullPath = path.isAbsolute(promptPath)
      ? promptPath
      : path.join(process.cwd(), promptPath);

    if (!fs.existsSync(fullPath)) {
      return createMCPResponse(id, null, {
        code: 'FILE_NOT_FOUND',
        message: `File not found: ${fullPath}`,
      });
    }

    const issues = checkSafety(fullPath);
    return createMCPResponse(id, { issues } as unknown as JsonValue);
  }

  private async validateClarity(
    id: string,
    params: Record<string, unknown>
  ): Promise<MCPResponse<JsonValue>> {
    const promptPath = params.promptPath as string | undefined;

    if (!promptPath) {
      return createMCPResponse(id, null, {
        code: 'MISSING_PARAM',
        message: 'promptPath parameter is required',
      });
    }

    const fullPath = path.isAbsolute(promptPath)
      ? promptPath
      : path.join(process.cwd(), promptPath);

    if (!fs.existsSync(fullPath)) {
      return createMCPResponse(id, null, {
        code: 'FILE_NOT_FOUND',
        message: `File not found: ${fullPath}`,
      });
    }

    const issues = checkClarity(fullPath);
    return createMCPResponse(id, { issues } as unknown as JsonValue);
  }

  private async testTokens(
    id: string,
    params: Record<string, unknown>
  ): Promise<MCPResponse<JsonValue>> {
    const promptPath = params.promptPath as string | undefined;
    const provider = (params.provider as 'gemini' | 'openai' | 'anthropic') || 'gemini';

    if (!promptPath) {
      return createMCPResponse(id, null, {
        code: 'MISSING_PARAM',
        message: 'promptPath parameter is required',
      });
    }

    const fullPath = path.isAbsolute(promptPath)
      ? promptPath
      : path.join(process.cwd(), promptPath);

    if (!fs.existsSync(fullPath)) {
      return createMCPResponse(id, null, {
        code: 'FILE_NOT_FOUND',
        message: `File not found: ${fullPath}`,
      });
    }

    const estimate = estimateTokenUsage(fullPath, provider);
    return createMCPResponse(id, estimate as unknown as JsonValue);
  }

  private async testCrisis(
    id: string,
    params: Record<string, unknown>
  ): Promise<MCPResponse<JsonValue>> {
    const promptPath = params.promptPath as string | undefined;

    if (!promptPath) {
      return createMCPResponse(id, null, {
        code: 'MISSING_PARAM',
        message: 'promptPath parameter is required',
      });
    }

    const fullPath = path.isAbsolute(promptPath)
      ? promptPath
      : path.join(process.cwd(), promptPath);

    if (!fs.existsSync(fullPath)) {
      return createMCPResponse(id, null, {
        code: 'FILE_NOT_FOUND',
        message: `File not found: ${fullPath}`,
      });
    }

    const result = testCrisisDetection(fullPath);
    return createMCPResponse(id, result as unknown as JsonValue);
  }

  private async validateFallback(
    id: string,
    params: Record<string, unknown>
  ): Promise<MCPResponse<JsonValue>> {
    const promptPath = params.promptPath as string | undefined;

    if (!promptPath) {
      return createMCPResponse(id, null, {
        code: 'MISSING_PARAM',
        message: 'promptPath parameter is required',
      });
    }

    const fullPath = path.isAbsolute(promptPath)
      ? promptPath
      : path.join(process.cwd(), promptPath);

    if (!fs.existsSync(fullPath)) {
      return createMCPResponse(id, null, {
        code: 'FILE_NOT_FOUND',
        message: `File not found: ${fullPath}`,
      });
    }

    const issues = checkFallback(fullPath);
    return createMCPResponse(id, { issues } as unknown as JsonValue);
  }

  private async validateAll(
    id: string,
    params: Record<string, unknown>
  ): Promise<MCPResponse<JsonValue>> {
    const promptPath = params.promptPath as string | undefined;
    const provider = (params.provider as 'gemini' | 'openai' | 'anthropic') || 'gemini';

    if (!promptPath) {
      return createMCPResponse(id, null, {
        code: 'MISSING_PARAM',
        message: 'promptPath parameter is required',
      });
    }

    const fullPath = path.isAbsolute(promptPath)
      ? promptPath
      : path.join(process.cwd(), promptPath);

    if (!fs.existsSync(fullPath)) {
      return createMCPResponse(id, null, {
        code: 'FILE_NOT_FOUND',
        message: `File not found: ${fullPath}`,
      });
    }

    const safetyIssues = checkSafety(fullPath);
    const clarityIssues = checkClarity(fullPath);
    const tokenEstimate = estimateTokenUsage(fullPath, provider);
    const crisisTest = testCrisisDetection(fullPath);
    const fallbackIssues = checkFallback(fullPath);

    const allIssues = [...safetyIssues, ...clarityIssues, ...fallbackIssues];

    const result: PromptValidationResult = {
      safetyIssues,
      clarityIssues,
      tokenEstimate,
      crisisTest,
      fallbackIssues,
      summary: {
        totalIssues: allIssues.length,
        critical: allIssues.filter((i) => i.severity === 'critical').length,
        warning: allIssues.filter((i) => i.severity === 'warning').length,
        info: allIssues.filter((i) => i.severity === 'info').length,
      },
    };

    return createMCPResponse(id, result as unknown as JsonValue);
  }

  async shutdown(): Promise<void> {
    this.initialized = false;
    logger.info('[PromptTestingMCP] Shutdown complete');
  }
}

// Singleton instance
export const promptTestingMCP = new PromptTestingMCPServer();
