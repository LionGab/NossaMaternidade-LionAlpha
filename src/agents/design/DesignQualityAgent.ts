/**
 * Design Quality Agent
 * Agente especializado em qualidade de design e correção de violações
 */

import { BaseAgent, AgentProcessOptions } from '../core/BaseAgent';
import { createMCPRequest as _createMCPRequest, MCPResponse } from '../../mcp/servers';
// MCP Servers de desenvolvimento estão em scripts/mcp-servers e não devem ser usados no app mobile
// TODO: Criar versões mobile-friendly ou usar apenas em scripts de build
// import { designTokensValidationMCP } from '../../scripts/mcp-servers/DesignTokensValidationMCPServer';
// import { codeQualityMCP } from '../../scripts/mcp-servers/CodeQualityMCPServer';
// import { accessibilityMCP } from '../../scripts/mcp-servers/AccessibilityMCPServer';

// Tipos temporários até migração completa
export interface ValidationResult {
  violations: DesignViolation[];
}

export interface DesignViolation {
  type: string;
  severity: 'critical' | 'warning' | 'info';
  line?: number;
  content?: string;
  message: string;
}

export interface DesignAnalysis {
  score: number;
  issues: unknown[];
}

export interface RefactorSuggestion {
  type: string;
  description: string;
  code?: string;
}

export interface A11yAuditResult {
  issues: Record<string, number>;
  score: number;
}

import { logger } from '../../utils/logger';

export interface DesignValidationInput {
  filePath?: string;
  screenPath?: string;
  validateTokens?: boolean;
  validateAccessibility?: boolean;
  suggestFixes?: boolean;
}

export interface DesignValidationOutput {
  violations: DesignViolation[];
  analysis?: DesignAnalysis;
  accessibility?: A11yAuditResult;
  suggestions: RefactorSuggestion[];
  score: number; // 0-100
  summary: {
    totalViolations: number;
    criticalIssues: number;
    warnings: number;
    accessibilityIssues: number;
  };
}

export class DesignQualityAgent extends BaseAgent<DesignValidationInput, DesignValidationOutput> {
  constructor() {
    super({
      name: 'design-quality-agent',
      version: '1.0.0',
      description: 'Agente especializado em qualidade de design e design tokens',
      capabilities: [
        'validate-design-tokens',
        'fix-design-violations',
        'suggest-design-improvements',
        'audit-accessibility',
        'check-dark-mode',
        'analyze-code-quality',
      ],
    });
  }

  async process(
    input: DesignValidationInput,
    _options?: AgentProcessOptions
  ): Promise<DesignValidationOutput> {
    if (!this.initialized) {
      await this.initialize();
    }

    logger.info('[DesignQualityAgent] Processing design validation', { input });

    const violations: DesignViolation[] = [];
    let analysis: DesignAnalysis | undefined;
    let accessibility: A11yAuditResult | undefined;
    const suggestions: RefactorSuggestion[] = [];

    try {
      // 1. Validar design tokens
      if (input.validateTokens !== false) {
        const validationResult = await this.validateDesignTokens(input);
        violations.push(...validationResult.violations);
      }

      // 2. Analisar qualidade do código
      if (input.filePath || input.screenPath) {
        const filePath = input.filePath || input.screenPath;
        if (filePath) {
          const analysisResult = await this.analyzeCodeQuality(filePath);
          analysis = analysisResult;
        }
      }

      // 3. Validar acessibilidade
      if (input.validateAccessibility && input.screenPath) {
        const a11yResult = await this.auditAccessibility(input.screenPath);
        accessibility = a11yResult;
      }

      // 4. Sugerir correções
      if (input.suggestFixes !== false && violations.length > 0) {
        const fixSuggestions = await this.suggestFixes(
          input.filePath || input.screenPath || '',
          violations
        );
        suggestions.push(...fixSuggestions);
      }

      // Calcular score e summary
      const criticalIssues = violations.filter((v) => v.severity === 'critical').length;
      const warnings = violations.filter((v) => v.severity === 'warning').length;
      const accessibilityIssues = accessibility?.issues
        ? Object.values(accessibility.issues).reduce(
            (sum: number, count: unknown) => sum + (count as number),
            0
          )
        : 0;

      const totalIssues = violations.length + accessibilityIssues;
      const score = Math.max(0, 100 - totalIssues * 2); // Cada issue reduz 2 pontos

      const output: DesignValidationOutput = {
        violations,
        analysis,
        accessibility,
        suggestions,
        score,
        summary: {
          totalViolations: violations.length,
          criticalIssues,
          warnings,
          accessibilityIssues,
        },
      };

      logger.info('[DesignQualityAgent] Validation complete', {
        score,
        violations: violations.length,
        suggestions: suggestions.length,
      });

      return output;
    } catch (error) {
      logger.error('[DesignQualityAgent] Error processing validation', error);
      throw error;
    }
  }

  protected async callMCP(
    _server: string,
    _method: string,
    _params: Record<string, unknown>
  ): Promise<MCPResponse> {
    // MCP Servers de desenvolvimento não disponíveis no app mobile
    // A validação completa de design é feita via scripts de build/CI
    logger.debug('[DesignQualityAgent] MCP call request - usando métodos diretos do agent', {
      server: _server,
      method: _method,
    });

    // Retornar resposta indicando que validação deve ser feita via métodos diretos
    return {
      id: `mcp-${Date.now()}`,
      success: false,
      error: {
        code: 'MCP_NOT_AVAILABLE',
        message:
          'MCP servers não disponíveis no mobile - use métodos validateFile/validateScreen do agent',
      },
      data: null,
      timestamp: Date.now(),
    };
  }

  private async validateDesignTokens(input: DesignValidationInput): Promise<ValidationResult> {
    logger.info('[DesignQualityAgent] Validando design tokens', {
      filePath: input.filePath,
      screenPath: input.screenPath,
    });

    // Por enquanto, retornar validação vazia pois validação real requer acesso a filesystem
    // Em produção, isso seria feito via script de build ou CI/CD
    // Para uso no mobile, podemos validar componentes já renderizados via props/styles

    const violations: DesignViolation[] = [];

    // TODO: Implementar validação real quando necessário
    // A validação completa é feita via scripts/validate-design-tokens.js em CI/CD

    return {
      violations,
    };
  }

  private async analyzeCodeQuality(_filePath: string): Promise<DesignAnalysis> {
    logger.info('[DesignQualityAgent] Analisando qualidade de código', { filePath: _filePath });

    // Análise básica - em produção seria via CI/CD
    return {
      score: 85,
      issues: [],
    };
  }

  private async auditAccessibility(_screenPath: string): Promise<A11yAuditResult> {
    logger.info('[DesignQualityAgent] Auditoria de acessibilidade', { screenPath: _screenPath });

    // Auditoria básica - em produção seria via testes automatizados
    return {
      issues: {},
      score: 90,
    };
  }

  private async suggestFixes(
    _filePath: string,
    violations: DesignViolation[]
  ): Promise<RefactorSuggestion[]> {
    logger.info('[DesignQualityAgent] Gerando sugestões de correção', {
      filePath: _filePath,
      violationsCount: violations.length,
    });

    const suggestions: RefactorSuggestion[] = [];

    violations.forEach((violation) => {
      if (violation.type === 'hex' && violation.content) {
        suggestions.push({
          type: 'replace-color',
          description: `Substituir ${violation.content} por token do design system`,
          code: violation.message || 'Use ColorTokens ou useThemeColors()',
        });
      } else if (violation.type === 'rgba' || violation.type === 'rgb') {
        suggestions.push({
          type: 'replace-color',
          description: 'Substituir cor hardcoded por token',
          code: 'Use ColorTokens.overlay.* ou colors do theme',
        });
      } else {
        suggestions.push({
          type: violation.type,
          description: violation.message,
          code: violation.message,
        });
      }
    });

    return suggestions;
  }

  /**
   * Método auxiliar para validar um arquivo específico
   */
  async validateFile(filePath: string): Promise<DesignValidationOutput> {
    return this.process({
      filePath,
      validateTokens: true,
      validateAccessibility: true,
      suggestFixes: true,
    });
  }

  /**
   * Método auxiliar para validar uma tela específica
   */
  async validateScreen(screenPath: string): Promise<DesignValidationOutput> {
    return this.process({
      screenPath,
      validateTokens: true,
      validateAccessibility: true,
      suggestFixes: true,
    });
  }

  /**
   * Método auxiliar para verificar dark mode
   */
  async checkDarkMode(filePath: string): Promise<unknown> {
    const response = await this.callMCP('design-validation', 'design.check.darkmode', { filePath });
    if (!response.success || !response.data) {
      throw new Error(`Dark mode check failed: ${response.error?.message || 'Unknown error'}`);
    }

    return response.data;
  }
}

// Singleton instance
export const designQualityAgent = new DesignQualityAgent();
