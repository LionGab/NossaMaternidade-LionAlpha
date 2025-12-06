#!/usr/bin/env ts-node
/**
 * Design Refactor Script
 * Sistema automatizado de refatoração de design usando MCPs
 *
 * Uso:
 *   npm run design:refactor -- --file src/screens/HomeScreen.tsx
 *   npm run design:refactor -- --all
 *   npm run design:refactor -- --validate
 */

import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';

// ======================
// 🎨 DESIGN REFACTOR ENGINE
// ======================

interface DesignViolation {
  file: string;
  line: number;
  type: 'hardcoded-color' | 'hardcoded-spacing' | 'hardcoded-typography' | 'missing-token';
  value: string;
  suggestion: string;
  severity: 'error' | 'warning' | 'info';
}

interface RefactorResult {
  file: string;
  violations: DesignViolation[];
  fixed: boolean;
  changes: number;
}

class DesignRefactorEngine {
  private violations: DesignViolation[] = [];
  private results: RefactorResult[] = [];

  /**
   * Analisa arquivo e encontra violações de design
   */
  analyzeFile(filePath: string): DesignViolation[] {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    const violations: DesignViolation[] = [];

    lines.forEach((line, index) => {
      const lineNum = index + 1;

      // Detectar cores hardcoded (hex, rgb, rgba, named colors)
      const hexColorRegex = /#[0-9A-Fa-f]{3,6}/g;
      const rgbColorRegex = /rgba?\([^)]+\)/g;
      const namedColorRegex =
        /\b(white|black|red|blue|green|yellow|orange|pink|purple|gray|grey)\b/gi;

      // Hex colors
      const hexMatches = line.match(hexColorRegex);
      if (hexMatches) {
        hexMatches.forEach((match) => {
          // Ignorar comentários e strings de exemplo
          if (!line.trim().startsWith('//') && !line.includes('example')) {
            violations.push({
              file: filePath,
              line: lineNum,
              type: 'hardcoded-color',
              value: match,
              suggestion: this.suggestTokenForColor(match),
              severity: 'error',
            });
          }
        });
      }

      // RGB/RGBA colors
      const rgbMatches = line.match(rgbColorRegex);
      if (rgbMatches) {
        rgbMatches.forEach((match) => {
          if (!line.trim().startsWith('//') && !line.includes('example')) {
            violations.push({
              file: filePath,
              line: lineNum,
              type: 'hardcoded-color',
              value: match,
              suggestion: this.suggestTokenForRgba(match),
              severity: 'error',
            });
          }
        });
      }

      // Named colors (apenas alguns casos críticos)
      const namedMatches = line.match(namedColorRegex);
      if (namedMatches && line.includes('color:')) {
        namedMatches.forEach((match) => {
          violations.push({
            file: filePath,
            line: lineNum,
            type: 'hardcoded-color',
            value: match,
            suggestion: this.suggestTokenForNamedColor(match),
            severity: 'warning',
          });
        });
      }

      // Detectar spacing hardcoded (números mágicos)
      const spacingRegex =
        /(?:padding|margin|gap|top|bottom|left|right|width|height):\s*(\d+)(?!px|pt|dp|rem|em)/g;
      const spacingMatches = Array.from(line.matchAll(spacingRegex));
      if (spacingMatches.length > 0) {
        spacingMatches.forEach((match) => {
          const value = parseInt(match[1], 10);
          if (value > 0 && value <= 200) {
            // Provavelmente é spacing
            violations.push({
              file: filePath,
              line: lineNum,
              type: 'hardcoded-spacing',
              value: match[0],
              suggestion: this.suggestTokenForSpacing(value),
              severity: 'warning',
            });
          }
        });
      }

      // Detectar typography hardcoded
      const fontSizeRegex = /fontSize:\s*(\d+)/g;
      const fontSizeMatches = Array.from(line.matchAll(fontSizeRegex));
      if (fontSizeMatches.length > 0) {
        fontSizeMatches.forEach((match) => {
          const value = parseInt(match[1], 10);
          violations.push({
            file: filePath,
            line: lineNum,
            type: 'hardcoded-typography',
            value: match[0],
            suggestion: this.suggestTokenForFontSize(value),
            severity: 'warning',
          });
        });
      }
    });

    return violations;
  }

  /**
   * Sugere token para cor hex
   */
  private suggestTokenForColor(hex: string): string {
    const colorMap: Record<string, string> = {
      '#FFFFFF': 'colors.background.card ou colors.text.inverse',
      '#000000': 'colors.text.primary',
      '#004E9A': 'colors.primary.main',
      '#002244': 'colors.primary.dark',
      '#E6F0FA': 'colors.primary.light',
      '#D93025': 'colors.secondary.main',
      '#236B62': 'colors.status.success',
      '#F59E0B': 'colors.status.warning',
      '#60A5FA': 'colors.primary.main (dark mode)',
      '#F1F5F9': 'colors.background.canvas',
      '#FEE2E2': 'colors.secondary.light',
      '#FFE2EC': 'colors.accent.pink (se necessário)',
      '#FFC4D9': 'colors.accent.pink (se necessário)',
    };

    const normalizedHex = hex.toUpperCase();
    return colorMap[normalizedHex] || `Verificar tokens.ts para equivalente de ${hex}`;
  }

  /**
   * Sugere token para rgba
   */
  private suggestTokenForRgba(rgba: string): string {
    if (rgba.includes('rgba(0, 0, 0, 0.') || rgba.includes('rgba(0,0,0,0.')) {
      const opacity = rgba.match(/0\.\d+/)?.[0];
      if (opacity === '0.5') return 'colors.background.overlay';
      if (opacity === '0.3') return 'rgba com colors.border.light';
      if (opacity === '0.08') return 'colors.border.light';
      return `colors.border.light ou colors.background.overlay (opacity ${opacity})`;
    }
    if (rgba.includes('rgba(255, 255, 255')) {
      return 'colors.text.inverse ou colors.background.card';
    }
    return `Verificar tokens.ts para equivalente de ${rgba}`;
  }

  /**
   * Sugere token para cor nomeada
   */
  private suggestTokenForNamedColor(color: string): string {
    const colorMap: Record<string, string> = {
      white: 'colors.background.card ou colors.text.inverse',
      black: 'colors.text.primary',
      red: 'colors.status.error',
      blue: 'colors.primary.main',
      green: 'colors.status.success',
      yellow: 'colors.status.warning',
      orange: 'colors.accent.orange',
      pink: 'colors.accent.pink',
      purple: 'colors.accent.purple',
      gray: 'colors.text.tertiary',
      grey: 'colors.text.tertiary',
    };
    return colorMap[color.toLowerCase()] || `Verificar tokens.ts para ${color}`;
  }

  /**
   * Sugere token para spacing
   */
  private suggestTokenForSpacing(value: number): string {
    const spacingMap: Record<number, string> = {
      4: "Spacing['1']",
      8: "Spacing['2']",
      12: "Spacing['3']",
      16: "Spacing['4']",
      20: "Spacing['5']",
      24: "Spacing['6']",
      32: "Spacing['8']",
      40: "Spacing['10']",
      48: "Spacing['12']",
    };

    // Encontrar o mais próximo
    const keys = Object.keys(spacingMap)
      .map(Number)
      .sort((a, b) => a - b);
    const closest = keys.reduce((prev, curr) =>
      Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev
    );

    if (Math.abs(closest - value) <= 2) {
      return spacingMap[closest];
    }

    return `Spacing['${Math.round(value / 4)}'] ou verificar tokens.ts`;
  }

  /**
   * Sugere token para fontSize
   */
  private suggestTokenForFontSize(value: number): string {
    const fontSizeMap: Record<number, string> = {
      10: "Typography.sizes['3xs']",
      11: "Typography.sizes['2xs']",
      12: 'Typography.sizes.xs',
      14: 'Typography.sizes.sm',
      16: 'Typography.sizes.md',
      18: 'Typography.sizes.lg',
      20: 'Typography.sizes.xl',
      24: "Typography.sizes['2xl']",
      28: "Typography.sizes['3xl']",
      32: "Typography.sizes['4xl']",
    };

    const keys = Object.keys(fontSizeMap)
      .map(Number)
      .sort((a, b) => a - b);
    const closest = keys.reduce((prev, curr) =>
      Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev
    );

    if (Math.abs(closest - value) <= 1) {
      return fontSizeMap[closest];
    }

    return `Typography.sizes['${value}'] ou verificar tokens.ts`;
  }

  /**
   * Refatora arquivo automaticamente
   */
  async refactorFile(filePath: string, dryRun = false): Promise<RefactorResult> {
    const violations = this.analyzeFile(filePath);
    const content = fs.readFileSync(filePath, 'utf-8');
    const changes = 0;

    if (violations.length === 0) {
      return {
        file: filePath,
        violations: [],
        fixed: true,
        changes: 0,
      };
    }

    // Aplicar correções (simplificado - em produção usar AST)
    violations.forEach((violation) => {
      // Esta é uma versão simplificada - em produção usar AST parser
      // Por enquanto, apenas reportar
    });

    if (!dryRun && changes > 0) {
      fs.writeFileSync(filePath, content, 'utf-8');
    }

    return {
      file: filePath,
      violations,
      fixed: changes > 0,
      changes,
    };
  }

  /**
   * Analisa todos os arquivos do projeto
   */
  async analyzeProject(pattern = 'src/**/*.{ts,tsx}'): Promise<RefactorResult[]> {
    const files = await glob(pattern, { ignore: ['**/node_modules/**', '**/dist/**'] });
    const results: RefactorResult[] = [];

    for (const file of files) {
      const violations = this.analyzeFile(file);
      results.push({
        file,
        violations,
        fixed: false,
        changes: 0,
      });
    }

    return results;
  }

  /**
   * Gera relatório
   */
  generateReport(results: RefactorResult[]): string {
    const totalViolations = results.reduce((sum, r) => sum + r.violations.length, 0);
    const filesWithViolations = results.filter((r) => r.violations.length > 0).length;
    const errors = results.reduce(
      (sum, r) => sum + r.violations.filter((v) => v.severity === 'error').length,
      0
    );
    const warnings = results.reduce(
      (sum, r) => sum + r.violations.filter((v) => v.severity === 'warning').length,
      0
    );

    let report = `
# 📊 Relatório de Refatoração de Design

## Resumo
- **Total de arquivos analisados:** ${results.length}
- **Arquivos com violações:** ${filesWithViolations}
- **Total de violações:** ${totalViolations}
  - ❌ Erros: ${errors}
  - ⚠️  Avisos: ${warnings}

## Arquivos com Violações

`;

    results
      .filter((r) => r.violations.length > 0)
      .forEach((result) => {
        report += `### ${result.file}\n\n`;
        result.violations.forEach((violation) => {
          const icon = violation.severity === 'error' ? '❌' : '⚠️';
          report += `${icon} **Linha ${violation.line}** - ${violation.type}\n`;
          report += `   Valor: \`${violation.value}\`\n`;
          report += `   Sugestão: \`${violation.suggestion}\`\n\n`;
        });
      });

    return report;
  }
}

// ======================
// 🚀 CLI
// ======================

async function main() {
  const args = process.argv.slice(2);
  const engine = new DesignRefactorEngine();

  if (args.includes('--validate') || args.includes('-v')) {
    console.log('🔍 Validando design tokens...\n');
    const results = await engine.analyzeProject();
    const report = engine.generateReport(results);
    console.log(report);

    const hasErrors = results.some((r) => r.violations.some((v) => v.severity === 'error'));

    if (hasErrors) {
      process.exit(1);
    }
  } else if (args.includes('--all') || args.includes('-a')) {
    console.log('🔄 Refatorando todos os arquivos...\n');
    const results = await engine.analyzeProject();
    const report = engine.generateReport(results);
    console.log(report);

    // Salvar relatório
    fs.writeFileSync('design-refactor-report.md', report, 'utf-8');
    console.log('\n✅ Relatório salvo em design-refactor-report.md');
  } else {
    const fileArg = args.find((arg) => arg.startsWith('--file='))?.split('=')[1];
    if (fileArg) {
      console.log(`🔍 Analisando ${fileArg}...\n`);
      const result = await engine.refactorFile(fileArg, true);
      console.log(engine.generateReport([result]));
    } else {
      console.log(`
Uso:
  npm run design:refactor -- --validate          # Valida todo o projeto
  npm run design:refactor -- --all                # Analisa todo o projeto
  npm run design:refactor -- --file=path/to/file  # Analisa arquivo específico
      `);
    }
  }
}

if (require.main === module) {
  main().catch(console.error);
}

export { DesignRefactorEngine };
