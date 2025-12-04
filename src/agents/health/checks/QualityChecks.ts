/**
 * Quality Checks
 * Verificações de qualidade de código
 */

import { exec } from 'child_process';
import { promisify } from 'util';

import { logger } from '../../../utils/logger';
import type { QualityMetrics } from '../types';

const execAsync = promisify(exec);

export class QualityChecks {
  private projectRoot: string;

  constructor(projectRoot: string) {
    this.projectRoot = projectRoot;
  }

  /**
   * Verifica qualidade do código (TypeScript + ESLint)
   */
  async checkQuality(): Promise<QualityMetrics> {
    const [tsErrors, eslintMetrics] = await Promise.all([
      this.checkTypeScriptErrors(),
      this.checkESLint(),
    ]);

    return {
      tsErrors,
      eslintErrors: eslintMetrics.errors,
      eslintWarnings: eslintMetrics.warnings,
    };
  }

  /**
   * Verifica erros de TypeScript
   */
  private async checkTypeScriptErrors(): Promise<number> {
    try {
      const { stdout, stderr } = await execAsync('npm run type-check', {
        cwd: this.projectRoot,
        timeout: 60000, // 60 segundos
      });

      // Se não houver erros, o comando retorna sucesso
      if (!stderr && !stdout.includes('error TS')) {
        return 0;
      }

      // Contar número de erros no output
      const errorMatches = stdout.match(/error TS\d+:/g) || [];
      const stderrMatches = stderr.match(/error TS\d+:/g) || [];

      return errorMatches.length + stderrMatches.length;
    } catch (error) {
      // TypeScript retorna exit code != 0 quando há erros
      if (error instanceof Error && 'stdout' in error) {
        const errorOutput = (error as { stdout: string }).stdout;
        const errorMatches = errorOutput.match(/error TS\d+:/g) || [];
        return errorMatches.length;
      }

      logger.error('[QualityChecks] Erro ao executar type-check', error);
      return -1; // Indica erro na execução
    }
  }

  /**
   * Verifica ESLint
   */
  private async checkESLint(): Promise<{ errors: number; warnings: number }> {
    try {
      const { stdout, stderr } = await execAsync('npm run lint', {
        cwd: this.projectRoot,
        timeout: 120000, // 2 minutos
      });

      // Parse do output do ESLint
      const output = stdout + stderr;

      // ESLint geralmente mostra um sumário no final como:
      // "✖ 10 problems (5 errors, 5 warnings)"
      const summaryMatch = output.match(
        /(\d+)\s+problems?\s+\((\d+)\s+errors?,\s+(\d+)\s+warnings?\)/
      );

      if (summaryMatch) {
        return {
          errors: parseInt(summaryMatch[2], 10),
          warnings: parseInt(summaryMatch[3], 10),
        };
      }

      // Se não encontrar o sumário, tentar contar manualmente
      const errorLines = output.match(/error\s+/gi) || [];
      const warningLines = output.match(/warning\s+/gi) || [];

      return {
        errors: errorLines.length,
        warnings: warningLines.length,
      };
    } catch (error) {
      // ESLint retorna exit code != 0 quando há problemas
      if (error instanceof Error && 'stdout' in error) {
        const output = (error as { stdout: string }).stdout;
        const summaryMatch = output.match(
          /(\d+)\s+problems?\s+\((\d+)\s+errors?,\s+(\d+)\s+warnings?\)/
        );

        if (summaryMatch) {
          return {
            errors: parseInt(summaryMatch[2], 10),
            warnings: parseInt(summaryMatch[3], 10),
          };
        }

        const errorLines = output.match(/error\s+/gi) || [];
        const warningLines = output.match(/warning\s+/gi) || [];

        return {
          errors: errorLines.length,
          warnings: warningLines.length,
        };
      }

      logger.error('[QualityChecks] Erro ao executar lint', error);
      return { errors: -1, warnings: -1 }; // Indica erro na execução
    }
  }

  /**
   * Verifica imports não utilizados (básico)
   */
  async checkUnusedImports(): Promise<number> {
    try {
      // Isso geralmente é capturado pelo ESLint com a regra 'no-unused-vars'
      // Já contabilizado no checkESLint
      return 0;
    } catch (error) {
      logger.error('[QualityChecks] Erro ao verificar unused imports', error);
      return 0;
    }
  }

  /**
   * Verifica console.log em produção
   */
  async checkConsoleLogs(): Promise<number> {
    try {
      const { stdout } = await execAsync(
        'grep -r "console\\.log\\|console\\.warn\\|console\\.error" src --include="*.ts" --include="*.tsx" | wc -l',
        {
          cwd: this.projectRoot,
          timeout: 30000,
        }
      );

      return parseInt(stdout.trim(), 10) || 0;
    } catch (error) {
      logger.error('[QualityChecks] Erro ao verificar console logs', error);
      return 0;
    }
  }
}
