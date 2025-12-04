/**
 * Accessibility MCP Server
 * Valida acessibilidade (WCAG AAA) e detecta problemas
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

export interface ContrastRatio {
  foreground: string;
  background: string;
  ratio: number;
  level: 'AAA' | 'AA' | 'AA-Large' | 'Fail';
  passes: boolean;
}

export interface TouchTargetIssue {
  file: string;
  line: number;
  component: string;
  currentSize: number;
  requiredSize: number;
  suggestion: string;
}

export interface MissingLabel {
  file: string;
  line: number;
  component: string;
  suggestion: string;
}

export interface A11yAuditResult {
  file: string;
  score: number; // 0-100
  issues: {
    contrast: number;
    touchTargets: number;
    missingLabels: number;
    missingRoles: number;
    keyboardNavigation: number;
  };
  details: {
    contrastIssues: ContrastRatio[];
    touchTargetIssues: TouchTargetIssue[];
    missingLabels: MissingLabel[];
  };
  suggestions: string[];
}

// Função para converter hex para RGB
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

// Função para calcular luminância relativa
function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((val) => {
    val = val / 255;
    return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

// Função para calcular contraste
function calculateContrast(foreground: string, background: string): number {
  const fgRgb = hexToRgb(foreground);
  const bgRgb = hexToRgb(background);

  if (!fgRgb || !bgRgb) {
    return 0;
  }

  const fgLum = getLuminance(fgRgb.r, fgRgb.g, fgRgb.b);
  const bgLum = getLuminance(bgRgb.r, bgRgb.g, bgRgb.b);

  const lighter = Math.max(fgLum, bgLum);
  const darker = Math.min(fgLum, bgLum);

  return (lighter + 0.05) / (darker + 0.05);
}

// Função para determinar nível de contraste
function getContrastLevel(ratio: number): 'AAA' | 'AA' | 'AA-Large' | 'Fail' {
  if (ratio >= 7) return 'AAA';
  if (ratio >= 4.5) return 'AA';
  if (ratio >= 3) return 'AA-Large';
  return 'Fail';
}

export class AccessibilityMCPServer implements MCPServer {
  name = 'accessibility-mcp';
  version = '1.0.0';
  private initialized = false;

  async initialize(): Promise<void> {
    try {
      this.initialized = true;
      logger.info('[AccessibilityMCP] Initialized successfully');
    } catch (error) {
      logger.error('[AccessibilityMCP] Initialization failed', error);
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
        case 'a11y':
          return (await this.handleA11y(request.id, action, request.params)) as MCPResponse<T>;
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

  private async handleA11y(
    id: string,
    action: string,
    params: Record<string, unknown>
  ): Promise<MCPResponse<JsonValue>> {
    switch (action) {
      case 'check.contrast':
        return (await this.checkContrast(id, params)) as MCPResponse<JsonValue>;
      case 'check.touchTargets':
        return (await this.checkTouchTargets(id, params)) as MCPResponse<JsonValue>;
      case 'check.labels':
        return (await this.checkLabels(id, params)) as MCPResponse<JsonValue>;
      case 'audit.screen':
        return (await this.auditScreen(id, params)) as MCPResponse<JsonValue>;
      default:
        return createMCPResponse(id, null, {
          code: 'UNKNOWN_ACTION',
          message: `Unknown a11y action: ${action}`,
        });
    }
  }

  private async checkContrast(
    id: string,
    params: Record<string, unknown>
  ): Promise<MCPResponse<JsonValue>> {
    const foreground = params.foreground as string;
    const background = params.background as string;

    if (!foreground || !background) {
      return createMCPResponse(id, null, {
        code: 'MISSING_PARAM',
        message: 'foreground and background parameters are required',
      });
    }

    // Normalizar cores (remover # se presente)
    const fg = foreground.startsWith('#') ? foreground : `#${foreground}`;
    const bg = background.startsWith('#') ? background : `#${background}`;

    const ratio = calculateContrast(fg, bg);
    const level = getContrastLevel(ratio);
    const passes = ratio >= 4.5; // WCAG AA mínimo

    const result: ContrastRatio = {
      foreground: fg,
      background: bg,
      ratio: Math.round(ratio * 100) / 100,
      level,
      passes,
    };

    return createMCPResponse(id, result as unknown as JsonValue);
  }

  private async checkTouchTargets(
    id: string,
    params: Record<string, unknown>
  ): Promise<MCPResponse<JsonValue>> {
    const componentPath = params.componentPath as string;
    if (!componentPath) {
      return createMCPResponse(id, null, {
        code: 'MISSING_PARAM',
        message: 'componentPath parameter is required',
      });
    }

    const fullPath = path.isAbsolute(componentPath)
      ? componentPath
      : path.join(process.cwd(), componentPath);

    if (!fs.existsSync(fullPath)) {
      return createMCPResponse(id, null, {
        code: 'FILE_NOT_FOUND',
        message: `File not found: ${fullPath}`,
      });
    }

    const content = fs.readFileSync(fullPath, 'utf-8');
    const lines = content.split('\n');
    const issues: TouchTargetIssue[] = [];

    // WCAG AAA requer 44x44pt (ou ~44px) para touch targets
    const MIN_TOUCH_TARGET = 44;

    lines.forEach((line, index) => {
      // Detectar componentes interativos
      if (
        line.includes('TouchableOpacity') ||
        line.includes('Pressable') ||
        line.includes('Button') ||
        line.includes('TouchableHighlight')
      ) {
        // Procurar por width/height hardcoded
        const widthMatch = line.match(/width:\s*(\d+)/i);
        const heightMatch = line.match(/height:\s*(\d+)/i);

        if (widthMatch) {
          const width = parseInt(widthMatch[1], 10);
          if (width < MIN_TOUCH_TARGET) {
            issues.push({
              file: fullPath,
              line: index + 1,
              component: 'TouchableOpacity/Pressable',
              currentSize: width,
              requiredSize: MIN_TOUCH_TARGET,
              suggestion: `Aumente width para pelo menos ${MIN_TOUCH_TARGET}pt (WCAG AAA)`,
            });
          }
        }

        if (heightMatch) {
          const height = parseInt(heightMatch[1], 10);
          if (height < MIN_TOUCH_TARGET) {
            issues.push({
              file: fullPath,
              line: index + 1,
              component: 'TouchableOpacity/Pressable',
              currentSize: height,
              requiredSize: MIN_TOUCH_TARGET,
              suggestion: `Aumente height para pelo menos ${MIN_TOUCH_TARGET}pt (WCAG AAA)`,
            });
          }
        }

        // Verificar se não tem width/height definido (pode ser OK se usar padding)
        if (!widthMatch && !heightMatch && !line.includes('padding')) {
          // Não é necessariamente um problema, mas pode ser
        }
      }
    });

    return createMCPResponse(id, issues as unknown as JsonValue);
  }

  private async checkLabels(
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

    const content = fs.readFileSync(fullPath, 'utf-8');
    const lines = content.split('\n');
    const missingLabels: MissingLabel[] = [];

    lines.forEach((line, index) => {
      // Detectar componentes interativos sem accessibilityLabel
      if (
        (line.includes('TouchableOpacity') ||
          line.includes('Pressable') ||
          line.includes('Button') ||
          line.includes('TouchableHighlight')) &&
        !line.includes('accessibilityLabel') &&
        !line.includes('accessibilityRole')
      ) {
        // Verificar se tem label nas próximas linhas (dentro do mesmo componente)
        let hasLabel = false;
        for (let i = index; i < Math.min(index + 10, lines.length); i++) {
          if (lines[i].includes('accessibilityLabel') || lines[i].includes('accessibilityRole')) {
            hasLabel = true;
            break;
          }
          if (
            lines[i].includes('</') &&
            (lines[i].includes('TouchableOpacity') || lines[i].includes('Pressable'))
          ) {
            break;
          }
        }

        if (!hasLabel) {
          missingLabels.push({
            file: fullPath,
            line: index + 1,
            component:
              line.match(/<(TouchableOpacity|Pressable|Button|TouchableHighlight)/)?.[1] ||
              'Interactive',
            suggestion:
              'Adicione accessibilityLabel e accessibilityRole para melhorar acessibilidade',
          });
        }
      }
    });

    return createMCPResponse(id, missingLabels as unknown as JsonValue);
  }

  private async auditScreen(
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

    // Executar todas as verificações
    const touchTargetsResult = await this.checkTouchTargets(id, { componentPath: fullPath });
    const labelsResult = await this.checkLabels(id, { screenPath: fullPath });

    const touchTargetIssues = (touchTargetsResult.data as unknown as TouchTargetIssue[]) || [];
    const missingLabels = (labelsResult.data as unknown as MissingLabel[]) || [];

    // Contar problemas de contraste (seria necessário analisar cores no código)
    const contrastIssues: ContrastRatio[] = [];
    // Nota: Análise completa de contraste requereria parsing mais sofisticado

    // Contar problemas de roles
    const content = fs.readFileSync(fullPath, 'utf-8');
    const interactiveComponents = content.match(/<(TouchableOpacity|Pressable|Button)/g) || [];
    const hasRoles = content.match(/accessibilityRole/g) || [];
    const missingRoles = Math.max(0, interactiveComponents.length - hasRoles.length);

    // Contar problemas de navegação por teclado (básico)
    let keyboardNavigation = 0;
    if (content.includes('TouchableOpacity') && !content.includes('accessible={true}')) {
      keyboardNavigation++;
    }

    const totalIssues =
      contrastIssues.length +
      touchTargetIssues.length +
      missingLabels.length +
      missingRoles +
      keyboardNavigation;
    const score = Math.max(0, 100 - totalIssues * 5); // Cada issue reduz 5 pontos

    const suggestions: string[] = [];
    if (touchTargetIssues.length > 0) {
      suggestions.push(
        `Corrija ${touchTargetIssues.length} problemas de touch target (mínimo 44pt)`
      );
    }
    if (missingLabels.length > 0) {
      suggestions.push(`Adicione ${missingLabels.length} accessibilityLabel faltantes`);
    }
    if (missingRoles > 0) {
      suggestions.push(`Adicione ${missingRoles} accessibilityRole faltantes`);
    }
    if (keyboardNavigation > 0) {
      suggestions.push('Melhore navegação por teclado adicionando accessible={true}');
    }

    const result: A11yAuditResult = {
      file: fullPath,
      score,
      issues: {
        contrast: contrastIssues.length,
        touchTargets: touchTargetIssues.length,
        missingLabels: missingLabels.length,
        missingRoles,
        keyboardNavigation,
      },
      details: {
        contrastIssues,
        touchTargetIssues,
        missingLabels,
      },
      suggestions,
    };

    return createMCPResponse(id, result as unknown as JsonValue);
  }

  async shutdown(): Promise<void> {
    this.initialized = false;
    logger.info('[AccessibilityMCP] Shutdown complete');
  }
}

// Singleton instance
export const accessibilityMCP = new AccessibilityMCPServer();
