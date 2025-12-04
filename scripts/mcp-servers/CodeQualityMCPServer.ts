/**
 * Code Quality MCP Server
 * Analisa código para qualidade de design e sugere melhorias
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

export interface HardcodedValue {
  file: string;
  line: number;
  type: 'color' | 'spacing' | 'typography' | 'dimension';
  value: string;
  context: string;
  suggestion: string;
}

export interface DesignAnalysis {
  file: string;
  score: number; // 0-100
  issues: {
    hardcodedColors: number;
    hardcodedSpacing: number;
    hardcodedTypography: number;
    missingDarkMode: number;
    accessibilityIssues: number;
  };
  suggestions: string[];
}

export interface RefactorSuggestion {
  file: string;
  line: number;
  before: string;
  after: string;
  explanation: string;
  priority: 'high' | 'medium' | 'low';
}

const HARDCODED_COLOR_PATTERNS = [
  /#[0-9A-Fa-f]{3,8}/g,
  /rgba?\([^)]+\)/g,
  /\b(white|black|red|blue|green|yellow|orange|pink|purple|gray|grey)\b/gi,
];

const HARDCODED_SPACING_PATTERNS = [
  /(padding|margin|gap|space):\s*(\d+)/gi,
  /(padding|margin|gap|space)(Top|Bottom|Left|Right|Horizontal|Vertical):\s*(\d+)/gi,
];

const HARDCODED_TYPOGRAPHY_PATTERNS = [
  /fontSize:\s*(\d+)/gi,
  /lineHeight:\s*(\d+)/gi,
  /letterSpacing:\s*([-\d.]+)/gi,
  /fontWeight:\s*['"](\d+|bold|normal|light)['"]/gi,
];

const DIMENSION_PATTERNS = [
  /width:\s*(\d+)/gi,
  /height:\s*(\d+)/gi,
  /minWidth:\s*(\d+)/gi,
  /minHeight:\s*(\d+)/gi,
  /maxWidth:\s*(\d+)/gi,
  /maxHeight:\s*(\d+)/gi,
];

export class CodeQualityMCPServer implements MCPServer {
  name = 'code-quality-mcp';
  version = '1.0.0';
  private initialized = false;

  async initialize(): Promise<void> {
    try {
      this.initialized = true;
      logger.info('[CodeQualityMCP] Initialized successfully');
    } catch (error) {
      logger.error('[CodeQualityMCP] Initialization failed', error);
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
        case 'code':
          return (await this.handleCode(request.id, action, request.params)) as MCPResponse<T>;
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

  private async handleCode(
    id: string,
    action: string,
    params: Record<string, unknown>
  ): Promise<MCPResponse<JsonValue>> {
    switch (action) {
      case 'analyze.design':
        return await this.analyzeDesign(id, params);
      case 'find.hardcoded':
        return await this.findHardcoded(id, params);
      case 'refactor.suggest':
        return await this.suggestRefactor(id, params);
      default:
        return createMCPResponse(id, null, {
          code: 'UNKNOWN_ACTION',
          message: `Unknown code action: ${action}`,
        });
    }
  }

  private async analyzeDesign(
    id: string,
    params: Record<string, unknown>
  ): Promise<MCPResponse<JsonValue>> {
    const filePath = params.filePath as string;
    if (!filePath) {
      return createMCPResponse(id, null, {
        code: 'MISSING_PARAM',
        message: 'filePath parameter is required',
      });
    }

    const fullPath = path.isAbsolute(filePath) ? filePath : path.join(process.cwd(), filePath);

    if (!fs.existsSync(fullPath)) {
      return createMCPResponse(id, null, {
        code: 'FILE_NOT_FOUND',
        message: `File not found: ${fullPath}`,
      });
    }

    const content = fs.readFileSync(fullPath, 'utf-8');
    const lines = content.split('\n');

    let hardcodedColors = 0;
    let hardcodedSpacing = 0;
    let hardcodedTypography = 0;
    let missingDarkMode = 0;
    let accessibilityIssues = 0;
    const suggestions: string[] = [];

    lines.forEach((line, index) => {
      // Contar cores hardcoded
      HARDCODED_COLOR_PATTERNS.forEach((pattern) => {
        if (pattern.test(line) && !line.trim().startsWith('//')) {
          hardcodedColors++;
        }
      });

      // Contar spacing hardcoded
      HARDCODED_SPACING_PATTERNS.forEach((pattern) => {
        if (pattern.test(line) && !line.trim().startsWith('//')) {
          hardcodedSpacing++;
        }
      });

      // Contar typography hardcoded
      HARDCODED_TYPOGRAPHY_PATTERNS.forEach((pattern) => {
        if (pattern.test(line) && !line.trim().startsWith('//')) {
          hardcodedTypography++;
        }
      });

      // Verificar dark mode
      if (line.includes('isDark ?') && line.includes('#')) {
        missingDarkMode++;
        suggestions.push(`Linha ${index + 1}: Use design tokens em vez de ternários isDark`);
      }

      // Verificar acessibilidade básica
      if (line.includes('TouchableOpacity') || line.includes('Pressable')) {
        if (!line.includes('accessibilityLabel') && !line.includes('accessibilityRole')) {
          accessibilityIssues++;
        }
      }
    });

    // Calcular score (0-100)
    const totalIssues =
      hardcodedColors +
      hardcodedSpacing +
      hardcodedTypography +
      missingDarkMode +
      accessibilityIssues;
    const score = Math.max(0, 100 - totalIssues * 2); // Cada issue reduz 2 pontos

    if (hardcodedColors > 0) {
      suggestions.push(`Encontradas ${hardcodedColors} cores hardcoded. Use design tokens.`);
    }
    if (hardcodedSpacing > 0) {
      suggestions.push(
        `Encontrado ${hardcodedSpacing} espaçamento hardcoded. Use Tokens.spacing.*`
      );
    }
    if (hardcodedTypography > 0) {
      suggestions.push(
        `Encontrada ${hardcodedTypography} tipografia hardcoded. Use Tokens.typography.*`
      );
    }
    if (accessibilityIssues > 0) {
      suggestions.push(
        `Encontrados ${accessibilityIssues} problemas de acessibilidade. Adicione accessibilityLabel.`
      );
    }

    const analysis: DesignAnalysis = {
      file: fullPath,
      score,
      issues: {
        hardcodedColors,
        hardcodedSpacing,
        hardcodedTypography,
        missingDarkMode,
        accessibilityIssues,
      },
      suggestions,
    };

    return createMCPResponse(id, analysis as unknown as JsonValue);
  }

  private async findHardcoded(
    id: string,
    params: Record<string, unknown>
  ): Promise<MCPResponse<JsonValue>> {
    const pattern = params.pattern as 'colors' | 'spacing' | 'typography' | 'dimension';
    const filePath = params.filePath as string | undefined;

    if (!pattern) {
      return createMCPResponse(id, null, {
        code: 'MISSING_PARAM',
        message: 'pattern parameter is required (colors | spacing | typography | dimension)',
      });
    }

    const filesToCheck: string[] = [];

    if (filePath) {
      const fullPath = path.isAbsolute(filePath) ? filePath : path.join(process.cwd(), filePath);
      if (fs.existsSync(fullPath)) {
        filesToCheck.push(fullPath);
      }
    } else {
      // Buscar todos arquivos .tsx em src/screens
      const screensDir = path.join(process.cwd(), 'src', 'screens');
      if (fs.existsSync(screensDir)) {
        this.getAllFiles(screensDir, filesToCheck);
      }
    }

    const hardcodedValues: HardcodedValue[] = [];

    filesToCheck.forEach((file) => {
      try {
        const content = fs.readFileSync(file, 'utf-8');
        const lines = content.split('\n');

        lines.forEach((line, index) => {
          if (line.trim().startsWith('//') || line.includes('import ') || line.includes('from ')) {
            return;
          }

          const matches: RegExpMatchArray[] = [];

          switch (pattern) {
            case 'colors':
              HARDCODED_COLOR_PATTERNS.forEach((p) => {
                const m = line.match(p);
                if (m) matches.push(m);
              });
              break;
            case 'spacing':
              HARDCODED_SPACING_PATTERNS.forEach((p) => {
                const m = line.match(p);
                if (m) matches.push(m);
              });
              break;
            case 'typography':
              HARDCODED_TYPOGRAPHY_PATTERNS.forEach((p) => {
                const m = line.match(p);
                if (m) matches.push(m);
              });
              break;
            case 'dimension':
              DIMENSION_PATTERNS.forEach((p) => {
                const m = line.match(p);
                if (m) matches.push(m);
              });
              break;
          }

          matches.forEach((match) => {
            hardcodedValues.push({
              file,
              line: index + 1,
              type: pattern === 'colors' ? 'color' : pattern,
              value: match[0],
              context: line.trim().substring(0, 80),
              suggestion: this.getSuggestion(pattern, match[0]),
            });
          });
        });
      } catch (error) {
        logger.error(`[CodeQualityMCP] Error reading file ${file}`, error);
      }
    });

    return createMCPResponse(id, hardcodedValues as unknown as JsonValue);
  }

  private async suggestRefactor(
    id: string,
    params: Record<string, unknown>
  ): Promise<MCPResponse<JsonValue>> {
    const filePath = params.filePath as string;
    const violations =
      (params.violations as Array<{ type: string; line: number; content: string }>) || [];

    if (!filePath) {
      return createMCPResponse(id, null, {
        code: 'MISSING_PARAM',
        message: 'filePath parameter is required',
      });
    }

    const fullPath = path.isAbsolute(filePath) ? filePath : path.join(process.cwd(), filePath);

    if (!fs.existsSync(fullPath)) {
      return createMCPResponse(id, null, {
        code: 'FILE_NOT_FOUND',
        message: `File not found: ${fullPath}`,
      });
    }

    const content = fs.readFileSync(fullPath, 'utf-8');
    const lines = content.split('\n');
    const suggestions: RefactorSuggestion[] = [];

    violations.forEach((violation) => {
      const lineIndex = violation.line - 1;
      if (lineIndex >= 0 && lineIndex < lines.length) {
        const line = lines[lineIndex];
        const before = line;
        let after = line;
        let explanation = '';
        let priority: 'high' | 'medium' | 'low' = 'medium';

        if (violation.type === 'hex' || violation.type === 'rgba' || violation.type === 'rgb') {
          priority = 'high';
          // Substituir cores por tokens
          if (line.includes('backgroundColor:')) {
            after = line.replace(/#[0-9A-Fa-f]{3,8}/g, 'colors.background.canvas');
            explanation = 'Substitua cor hardcoded por design token';
          } else if (line.includes('color:')) {
            after = line.replace(/#[0-9A-Fa-f]{3,8}/g, 'colors.text.primary');
            explanation = 'Substitua cor hardcoded por design token';
          }
        } else if (violation.type === 'spacing') {
          priority = 'medium';
          const spacingMatch = line.match(/(padding|margin|gap|space):\s*(\d+)/i);
          if (spacingMatch) {
            const value = parseInt(spacingMatch[2], 10);
            const tokenMap: Record<number, string> = {
              4: '1',
              8: '2',
              12: '3',
              16: '4',
              24: '6',
              32: '8',
              48: '12',
            };
            const tokenValue = tokenMap[value];
            if (tokenValue) {
              after = line.replace(
                spacingMatch[0],
                `${spacingMatch[1]}: Tokens.spacing["${tokenValue}"]`
              );
              explanation = `Substitua valor hardcoded por Tokens.spacing["${tokenValue}"]`;
            }
          }
        } else if (violation.type === 'typography') {
          priority = 'medium';
          const fontSizeMatch = line.match(/fontSize:\s*(\d+)/i);
          if (fontSizeMatch) {
            const value = parseInt(fontSizeMatch[1], 10);
            const sizeMap: Record<number, string> = {
              10: '3xs',
              12: 'xs',
              14: 'sm',
              16: 'base',
              18: 'lg',
              20: 'xl',
              24: '2xl',
              28: '3xl',
              32: '4xl',
            };
            const tokenValue = sizeMap[value];
            if (tokenValue) {
              after = line.replace(
                fontSizeMatch[0],
                `fontSize: Tokens.typography.sizes.${tokenValue}`
              );
              explanation = `Substitua fontSize hardcoded por Tokens.typography.sizes.${tokenValue}`;
            }
          }
        }

        if (after !== before) {
          suggestions.push({
            file: fullPath,
            line: violation.line,
            before: before.trim(),
            after: after.trim(),
            explanation,
            priority,
          });
        }
      }
    });

    return createMCPResponse(id, suggestions as unknown as JsonValue);
  }

  private getAllFiles(dir: string, fileList: string[]): void {
    try {
      const files = fs.readdirSync(dir);
      files.forEach((file) => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
          this.getAllFiles(filePath, fileList);
        } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
          fileList.push(filePath);
        }
      });
    } catch (error) {
      logger.error(`[CodeQualityMCP] Error reading directory ${dir}`, error);
    }
  }

  private getSuggestion(pattern: string, value: string): string {
    switch (pattern) {
      case 'colors':
        return 'Use design tokens (colors.primary.main, colors.text.primary, etc.)';
      case 'spacing':
        return 'Use Tokens.spacing.* (ex: Tokens.spacing["4"])';
      case 'typography':
        return 'Use Tokens.typography.* (ex: Tokens.typography.sizes.sm)';
      case 'dimension':
        return 'Considere usar valores responsivos ou design tokens';
      default:
        return 'Use design tokens do sistema';
    }
  }

  async shutdown(): Promise<void> {
    this.initialized = false;
    logger.info('[CodeQualityMCP] Shutdown complete');
  }
}

// Singleton instance
export const codeQualityMCP = new CodeQualityMCPServer();
