/**
 * Design Tokens Validation MCP Server
 * Valida design tokens e detecta violações de design system
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

export interface DesignViolation {
  file: string;
  line: number;
  content: string;
  type: 'hex' | 'rgb' | 'rgba' | 'named' | 'spacing' | 'typography';
  suggestion?: string;
  severity: 'critical' | 'warning' | 'info';
}

export interface ValidationResult {
  violations: DesignViolation[];
  totalFiles: number;
  filesWithViolations: string[];
  summary: {
    hex: number;
    rgb: number;
    rgba: number;
    named: number;
    spacing: number;
    typography: number;
  };
}

export interface DarkModeIssue {
  file: string;
  line: number;
  content: string;
  issue: 'hardcoded_light' | 'hardcoded_dark' | 'missing_dark_mode';
  suggestion: string;
}

export interface FixSuggestion {
  violation: DesignViolation;
  before: string;
  after: string;
  explanation: string;
}

// Tokens disponíveis para sugestões
const TOKEN_SUGGESTIONS: Record<string, string> = {
  '#FFFFFF': 'colors.background.card ou colors.text.inverse',
  '#000000': 'colors.text.primary (dark mode)',
  '#F8F9FA': 'colors.background.canvas',
  '#020617': 'colors.background.canvas (dark mode)',
  '#0B1220': 'colors.background.card (dark mode)',
  '#0F172A': 'colors.text.primary',
  '#334155': 'colors.text.secondary',
  '#64748B': 'colors.text.tertiary',
  '#94A3B8': 'colors.text.disabled',
  '#004E9A': 'colors.primary.main',
  '#D93025': 'colors.status.error',
  '#236B62': 'colors.status.success',
  '#F59E0B': 'colors.status.warning',
  '#FBBF24': 'colors.status.warning',
  '#60A5FA': 'colors.primary.main',
  '#3B82F6': 'colors.primary.main',
  '#10B981': 'colors.status.success',
  '#EF4444': 'colors.status.error',
  '#CBD5E1': 'colors.border.medium',
  '#FFF8F3': 'colors.background.canvas',
};

// Padrões para detectar violações
const HEX_PATTERN = /#[0-9A-Fa-f]{3,8}/g;
const RGB_PATTERN = /rgba?\([^)]+\)/g;
const NAMED_COLOR_PATTERN =
  /\b(white|black|red|blue|green|yellow|orange|pink|purple|gray|grey)\b/gi;
const SPACING_PATTERN = /(padding|margin|gap|space):\s*(\d+)/gi;
const TYPOGRAPHY_PATTERN = /(fontSize|lineHeight|letterSpacing):\s*(\d+)/gi;

// Arquivos permitidos para ter cores (definições de tokens)
const ALLOWED_FILES = ['tokens.ts', 'colors.ts', 'ThemeContext.tsx'];

function isAllowedFile(filePath: string): boolean {
  const fileName = path.basename(filePath);
  return ALLOWED_FILES.some((allowed) => fileName.includes(allowed));
}

function findViolations(filePath: string): DesignViolation[] {
  const violations: DesignViolation[] = [];

  if (isAllowedFile(filePath)) {
    return violations;
  }

  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');

    lines.forEach((line, index) => {
      const lineNumber = index + 1;

      // Ignorar comentários e imports
      if (
        line.trim().startsWith('//') ||
        line.includes('import ') ||
        line.includes('from ') ||
        line.trim().startsWith('*')
      ) {
        return;
      }

      // Detectar hex colors
      const hexMatches = line.match(HEX_PATTERN);
      if (hexMatches) {
        hexMatches.forEach((match) => {
          const suggestion =
            TOKEN_SUGGESTIONS[match.toUpperCase()] ||
            TOKEN_SUGGESTIONS[match] ||
            'Use tokens do design system';
          violations.push({
            file: filePath,
            line: lineNumber,
            content: line.trim(),
            type: 'hex',
            suggestion,
            severity: 'critical',
          });
        });
      }

      // Detectar rgb/rgba
      const rgbMatches = line.match(RGB_PATTERN);
      if (rgbMatches) {
        rgbMatches.forEach((match) => {
          violations.push({
            file: filePath,
            line: lineNumber,
            content: line.trim(),
            type: match.startsWith('rgba') ? 'rgba' : 'rgb',
            suggestion: 'Use tokens do design system (ex: colors.border.light)',
            severity: 'critical',
          });
        });
      }

      // Detectar named colors
      if (
        line.includes('color:') ||
        line.includes('backgroundColor:') ||
        line.includes('borderColor:')
      ) {
        const namedMatches = line.match(NAMED_COLOR_PATTERN);
        if (namedMatches) {
          namedMatches.forEach(() => {
            violations.push({
              file: filePath,
              line: lineNumber,
              content: line.trim(),
              type: 'named',
              suggestion: 'Use tokens do design system',
              severity: 'warning',
            });
          });
        }
      }

      // Detectar spacing hardcoded
      const spacingMatches = line.match(SPACING_PATTERN);
      if (spacingMatches) {
        spacingMatches.forEach(() => {
          violations.push({
            file: filePath,
            line: lineNumber,
            content: line.trim(),
            type: 'spacing',
            suggestion: 'Use Tokens.spacing.* (ex: Tokens.spacing["4"])',
            severity: 'warning',
          });
        });
      }

      // Detectar typography hardcoded
      const typographyMatches = line.match(TYPOGRAPHY_PATTERN);
      if (typographyMatches) {
        typographyMatches.forEach(() => {
          violations.push({
            file: filePath,
            line: lineNumber,
            content: line.trim(),
            type: 'typography',
            suggestion: 'Use Tokens.typography.* (ex: Tokens.typography.sizes.sm)',
            severity: 'warning',
          });
        });
      }
    });
  } catch (error) {
    logger.error(`[DesignTokensValidationMCP] Error reading file ${filePath}`, error);
  }

  return violations;
}

function getAllFiles(dir: string, fileList: string[] = []): string[] {
  try {
    const files = fs.readdirSync(dir);

    files.forEach((file) => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        const dirName = path.basename(filePath);
        // Ignorar pastas específicas
        if (
          ![
            'node_modules',
            '.expo',
            'dist',
            'build',
            'android',
            'ios',
            'web-build',
            '__tests__',
          ].includes(dirName)
        ) {
          getAllFiles(filePath, fileList);
        }
      } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
        fileList.push(filePath);
      }
    });
  } catch (error) {
    logger.error(`[DesignTokensValidationMCP] Error reading directory ${dir}`, error);
  }

  return fileList;
}

export class DesignTokensValidationMCPServer implements MCPServer {
  name = 'design-tokens-validation-mcp';
  version = '1.0.0';
  private initialized = false;

  async initialize(): Promise<void> {
    try {
      this.initialized = true;
      logger.info('[DesignTokensValidationMCP] Initialized successfully');
    } catch (error) {
      logger.error('[DesignTokensValidationMCP] Initialization failed', error);
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
      const [category, action] = request.method.split('.');

      switch (category) {
        case 'design':
          return await this.handleDesign(request.id, action, request.params);
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

  private async handleDesign(
    id: string,
    action: string,
    params: Record<string, unknown>
  ): Promise<MCPResponse<JsonValue>> {
    switch (action) {
      case 'validate':
        return await this.validateTokens(id, params);
      case 'validate.screen':
        return await this.validateScreen(id, params);
      case 'suggest.fix':
        return await this.suggestFix(id, params);
      case 'check.darkmode':
        return await this.checkDarkMode(id, params);
      default:
        return createMCPResponse(id, null, {
          code: 'UNKNOWN_ACTION',
          message: `Unknown design action: ${action}`,
        });
    }
  }

  private async validateTokens(
    id: string,
    params: Record<string, unknown>
  ): Promise<MCPResponse<JsonValue>> {
    const filePath = params.filePath as string | undefined;

    if (filePath) {
      // Validar arquivo específico
      const violations = findViolations(filePath);
      const result: ValidationResult = {
        violations,
        totalFiles: 1,
        filesWithViolations: violations.length > 0 ? [filePath] : [],
        summary: {
          hex: violations.filter((v) => v.type === 'hex').length,
          rgb: violations.filter((v) => v.type === 'rgb').length,
          rgba: violations.filter((v) => v.type === 'rgba').length,
          named: violations.filter((v) => v.type === 'named').length,
          spacing: violations.filter((v) => v.type === 'spacing').length,
          typography: violations.filter((v) => v.type === 'typography').length,
        },
      };
      return createMCPResponse(id, result as JsonValue);
    }

    // Validar todo o projeto
    const srcDir = path.join(process.cwd(), 'src');
    if (!fs.existsSync(srcDir)) {
      return createMCPResponse(id, null, {
        code: 'DIRECTORY_NOT_FOUND',
        message: 'src/ directory not found',
      }) as MCPResponse<ValidationResult>;
    }

    const allFiles = getAllFiles(srcDir);
    const srcFiles = allFiles.filter((file) => {
      const relativePath = path.relative(process.cwd(), file);
      return (
        !relativePath.includes('__tests__') &&
        !relativePath.includes('.test.') &&
        !relativePath.includes('.spec.')
      );
    });

    const violations: DesignViolation[] = [];
    const filesWithViolations = new Set<string>();

    srcFiles.forEach((file) => {
      const fileViolations = findViolations(file);
      if (fileViolations.length > 0) {
        violations.push(...fileViolations);
        filesWithViolations.add(file);
      }
    });

    const result: ValidationResult = {
      violations,
      totalFiles: srcFiles.length,
      filesWithViolations: Array.from(filesWithViolations),
      summary: {
        hex: violations.filter((v) => v.type === 'hex').length,
        rgb: violations.filter((v) => v.type === 'rgb').length,
        rgba: violations.filter((v) => v.type === 'rgba').length,
        named: violations.filter((v) => v.type === 'named').length,
        spacing: violations.filter((v) => v.type === 'spacing').length,
        typography: violations.filter((v) => v.type === 'typography').length,
      },
    };

    return createMCPResponse(id, result as JsonValue);
  }

  private async validateScreen(
    id: string,
    params: Record<string, unknown>
  ): Promise<MCPResponse<JsonValue>> {
    const screenPath = params.screenPath as string;
    if (!screenPath) {
      return createMCPResponse(id, null, {
        code: 'MISSING_PARAM',
        message: 'screenPath parameter is required',
      });
    }

    const fullPath = path.isAbsolute(screenPath)
      ? screenPath
      : path.join(process.cwd(), screenPath);

    if (!fs.existsSync(fullPath)) {
      return createMCPResponse(id, null, {
        code: 'FILE_NOT_FOUND',
        message: `File not found: ${fullPath}`,
      });
    }

    const violations = findViolations(fullPath);
    const result: ValidationResult = {
      violations,
      totalFiles: 1,
      filesWithViolations: violations.length > 0 ? [fullPath] : [],
      summary: {
        hex: violations.filter((v) => v.type === 'hex').length,
        rgb: violations.filter((v) => v.type === 'rgb').length,
        rgba: violations.filter((v) => v.type === 'rgba').length,
        named: violations.filter((v) => v.type === 'named').length,
        spacing: violations.filter((v) => v.type === 'spacing').length,
        typography: violations.filter((v) => v.type === 'typography').length,
      },
    };

    return createMCPResponse(id, result as JsonValue);
  }

  private async suggestFix(
    id: string,
    params: Record<string, unknown>
  ): Promise<MCPResponse<JsonValue>> {
    const violation = params.violation as DesignViolation;
    if (!violation) {
      return createMCPResponse(id, null, {
        code: 'MISSING_PARAM',
        message: 'violation parameter is required',
      });
    }

    const before = violation.content;
    let after = violation.content;
    let explanation = '';

    if (violation.type === 'hex') {
      const hexMatch = violation.content.match(/#[0-9A-Fa-f]{3,8}/);
      if (hexMatch) {
        const hex = hexMatch[0];
        const suggestion = TOKEN_SUGGESTIONS[hex.toUpperCase()] || TOKEN_SUGGESTIONS[hex];
        if (suggestion) {
          // Tentar substituir no contexto
          if (violation.content.includes('backgroundColor:')) {
            after = violation.content.replace(
              hex,
              `colors.background.${suggestion.includes('background') ? 'canvas' : 'card'}`
            );
            explanation = `Substitua ${hex} por ${suggestion}`;
          } else if (violation.content.includes('color:')) {
            after = violation.content.replace(hex, suggestion);
            explanation = `Substitua ${hex} por ${suggestion}`;
          } else {
            after = violation.content.replace(hex, suggestion);
            explanation = `Substitua ${hex} por ${suggestion}`;
          }
        }
      }
    } else if (violation.type === 'rgba' || violation.type === 'rgb') {
      const rgbaMatch = violation.content.match(/rgba?\([^)]+\)/);
      if (rgbaMatch) {
        after = violation.content.replace(rgbaMatch[0], 'colors.border.light');
        explanation = 'Substitua rgba/rgb por tokens do design system';
      }
    } else if (violation.type === 'spacing') {
      const spacingMatch = violation.content.match(/(padding|margin|gap|space):\s*(\d+)/i);
      if (spacingMatch) {
        const value = parseInt(spacingMatch[2], 10);
        const tokenKey = Object.keys({
          4: '1',
          8: '2',
          12: '3',
          16: '4',
          24: '6',
          32: '8',
          48: '12',
        }).find((k) => parseInt(k, 10) === value);
        if (tokenKey) {
          const tokenValue = { 4: '1', 8: '2', 12: '3', 16: '4', 24: '6', 32: '8', 48: '12' }[
            tokenKey
          ];
          after = violation.content.replace(
            spacingMatch[0],
            `${spacingMatch[1]}: Tokens.spacing["${tokenValue}"]`
          );
          explanation = `Substitua valor hardcoded por Tokens.spacing["${tokenValue}"]`;
        }
      }
    }

    const suggestion: FixSuggestion = {
      violation,
      before,
      after,
      explanation: explanation || violation.suggestion || 'Use tokens do design system',
    };

    return createMCPResponse(id, suggestion as unknown as JsonValue) as MCPResponse<FixSuggestion>;
  }

  private async checkDarkMode(
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
      }) as MCPResponse<DarkModeIssue[]>;
    }

    const content = fs.readFileSync(fullPath, 'utf-8');
    const lines = content.split('\n');
    const issues: DarkModeIssue[] = [];

    lines.forEach((line, index) => {
      const lineNumber = index + 1;

      // Detectar cores hardcoded que quebram dark mode
      if (
        line.includes('#FFFFFF') ||
        line.includes('#FFF') ||
        line.includes("'white'") ||
        line.includes('"white"')
      ) {
        issues.push({
          file: fullPath,
          line: lineNumber,
          content: line.trim(),
          issue: 'hardcoded_light',
          suggestion: 'Use colors.text.inverse ou colors.background.card (suporta dark mode)',
        });
      }

      if (
        line.includes('#000000') ||
        line.includes('#000') ||
        line.includes("'black'") ||
        line.includes('"black"')
      ) {
        issues.push({
          file: fullPath,
          line: lineNumber,
          content: line.trim(),
          issue: 'hardcoded_dark',
          suggestion: 'Use colors.text.primary (suporta dark mode)',
        });
      }

      // Detectar ternários isDark que podem ser simplificados
      if (line.includes('isDark ?') && (line.includes('#020617') || line.includes('#0B1220'))) {
        issues.push({
          file: fullPath,
          line: lineNumber,
          content: line.trim(),
          issue: 'missing_dark_mode',
          suggestion: 'Use colors.background.canvas (auto-ajusta dark mode)',
        });
      }
    });

    return createMCPResponse(id, issues as unknown as JsonValue) as MCPResponse<DarkModeIssue[]>;
  }

  async shutdown(): Promise<void> {
    this.initialized = false;
    logger.info('[DesignTokensValidationMCP] Shutdown complete');
  }
}

// Singleton instance
export const designTokensValidationMCP = new DesignTokensValidationMCPServer();
