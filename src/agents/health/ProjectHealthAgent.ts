/**
 * Project Health Agent
 * Agente especializado em análise e verificação da saúde do projeto
 */

import * as path from 'path';

import { BugChecks } from './checks/BugChecks';
import { ConfigChecks } from './checks/ConfigChecks';
import { QualityChecks } from './checks/QualityChecks';
import type { ProjectHealthReport, HealthCheckOptions, BugStatus } from './types';
import { MCPResponse } from '../../mcp/types';
import { logger } from '../../utils/logger';
import { BaseAgent, AgentProcessOptions } from '../core/BaseAgent';

export class ProjectHealthAgent extends BaseAgent<
  HealthCheckOptions,
  ProjectHealthReport,
  AgentProcessOptions
> {
  private bugChecks: BugChecks;
  private configChecks: ConfigChecks;
  private qualityChecks: QualityChecks;
  private projectRoot: string;

  constructor(projectRoot?: string) {
    super({
      name: 'project-health-agent',
      version: '1.0.0',
      description: 'Agente especializado em análise e verificação da saúde do projeto',
      capabilities: [
        'check-bugs',
        'check-config',
        'check-quality',
        'generate-report',
        'recommend-fixes',
      ],
    });

    // Detectar raiz do projeto (assumindo que o agente está em src/agents/health)
    this.projectRoot = projectRoot || path.resolve(__dirname, '../../..');
    this.bugChecks = new BugChecks(this.projectRoot);
    this.configChecks = new ConfigChecks(this.projectRoot);
    this.qualityChecks = new QualityChecks(this.projectRoot);
  }

  /**
   * Processa análise de saúde do projeto
   */
  async process(
    input: HealthCheckOptions = {},
    _options?: AgentProcessOptions
  ): Promise<ProjectHealthReport> {
    if (!this.initialized) {
      await this.initialize();
    }

    logger.info('[ProjectHealthAgent] Iniciando análise de saúde do projeto', { input });

    const { checkBugs = true, checkConfig = true, checkQuality = true, verbose = false } = input;

    try {
      // Executar verificações em paralelo quando possível
      const [bugsResult, configResult, qualityResult] = await Promise.all([
        checkBugs ? this.bugChecks.checkAllBugs() : Promise.resolve([]),
        checkConfig
          ? this.configChecks.checkAllConfig()
          : Promise.resolve({
              polyfills: false,
              safeArea: false,
              edgeFunction: false,
              privacyManifest: false,
              edgeToEdge: false,
              targetSdk: 0,
            }),
        checkQuality
          ? this.qualityChecks.checkQuality()
          : Promise.resolve({
              tsErrors: 0,
              eslintErrors: 0,
              eslintWarnings: 0,
            }),
      ]);

      // Calcular métricas
      const totalBugs = bugsResult.length;
      const fixedBugs = bugsResult.filter((b) => b.fixed).length;
      const pendingBugs = bugsResult.filter((b) => !b.fixed);

      // Calcular score geral (0-100)
      const overallScore = this.calculateScore(bugsResult, configResult, qualityResult);

      // Determinar se está pronto para deploy
      const readyForDeploy = this.isReadyForDeploy(bugsResult, configResult, qualityResult);

      // Gerar recomendações
      const recommendations = this.generateRecommendations(bugsResult, configResult, qualityResult);

      const report: ProjectHealthReport = {
        timestamp: Date.now(),
        overallScore,
        readyForDeploy,
        bugs: {
          total: totalBugs,
          fixed: fixedBugs,
          pending: pendingBugs,
        },
        config: configResult,
        quality: qualityResult,
        recommendations,
      };

      if (verbose) {
        logger.info('[ProjectHealthAgent] Relatório completo', { report });
      } else {
        logger.info('[ProjectHealthAgent] Análise concluída', {
          score: overallScore,
          readyForDeploy,
          bugsFixed: `${fixedBugs}/${totalBugs}`,
        });
      }

      return report;
    } catch (error) {
      logger.error('[ProjectHealthAgent] Erro ao processar análise', error);
      throw error;
    }
  }

  /**
   * Calcula score geral do projeto (0-100)
   */
  private calculateScore(
    bugs: BugStatus[],
    config: {
      polyfills: boolean;
      safeArea: boolean;
      edgeFunction: boolean;
      privacyManifest: boolean;
      edgeToEdge: boolean;
      targetSdk: number;
    },
    quality: { tsErrors: number; eslintErrors: number; eslintWarnings: number }
  ): number {
    let score = 100;

    // Bugs (40 pontos)
    const totalBugs = bugs.length;
    const fixedBugs = bugs.filter((b) => b.fixed).length;
    const bugScore = totalBugs > 0 ? (fixedBugs / totalBugs) * 40 : 40;
    score = bugScore;

    // Configuração (30 pontos)
    let configScore = 0;
    if (config.polyfills) configScore += 5;
    if (config.safeArea) configScore += 5;
    if (config.edgeFunction) configScore += 5;
    if (config.privacyManifest) configScore += 5;
    if (config.edgeToEdge) configScore += 5;
    if (config.targetSdk >= 35) configScore += 5;
    score += configScore;

    // Qualidade (30 pontos)
    let qualityScore = 30;
    // Penalizar por erros TypeScript (até -15 pontos)
    if (quality.tsErrors > 0) {
      qualityScore -= Math.min(15, quality.tsErrors * 0.5);
    }
    // Penalizar por erros ESLint (até -10 pontos)
    if (quality.eslintErrors > 0) {
      qualityScore -= Math.min(10, quality.eslintErrors * 0.2);
    }
    // Penalizar por warnings ESLint (até -5 pontos)
    if (quality.eslintWarnings > 0) {
      qualityScore -= Math.min(5, quality.eslintWarnings * 0.1);
    }
    score += Math.max(0, qualityScore);

    return Math.round(Math.max(0, Math.min(100, score)));
  }

  /**
   * Determina se o projeto está pronto para deploy
   */
  private isReadyForDeploy(
    bugs: BugStatus[],
    config: {
      polyfills: boolean;
      safeArea: boolean;
      edgeFunction: boolean;
      privacyManifest: boolean;
      edgeToEdge: boolean;
      targetSdk: number;
    },
    quality: { tsErrors: number; eslintErrors: number; eslintWarnings: number }
  ): boolean {
    // Critérios para deploy:
    // 1. Todos os bugs críticos corrigidos
    const allBugsFixed = bugs.every((b) => b.fixed);

    // 2. Configurações essenciais OK
    const essentialConfigOk = config.polyfills && config.safeArea && config.targetSdk >= 35;

    // 3. Zero erros TypeScript
    const noTsErrors = quality.tsErrors === 0;

    // 4. Zero erros ESLint (warnings são OK)
    const noEslintErrors = quality.eslintErrors === 0;

    return allBugsFixed && essentialConfigOk && noTsErrors && noEslintErrors;
  }

  /**
   * Gera recomendações baseadas nos resultados
   */
  private generateRecommendations(
    bugs: BugStatus[],
    config: {
      polyfills: boolean;
      safeArea: boolean;
      edgeFunction: boolean;
      privacyManifest: boolean;
      edgeToEdge: boolean;
      targetSdk: number;
    },
    quality: { tsErrors: number; eslintErrors: number; eslintWarnings: number }
  ): string[] {
    const recommendations: string[] = [];

    // Recomendações de bugs
    const pendingBugs = bugs.filter((b) => !b.fixed);
    if (pendingBugs.length > 0) {
      recommendations.push(
        `🐛 Corrigir ${pendingBugs.length} bug(s) pendente(s): ${pendingBugs.map((b) => b.bug).join(', ')}`
      );
    }

    // Recomendações de configuração
    if (!config.polyfills) {
      recommendations.push('⚙️  Adicionar polyfills (src/polyfills.ts) e importar no index.ts');
    }
    if (!config.safeArea) {
      recommendations.push('⚙️  Adicionar SafeAreaProvider no App.tsx');
    }
    if (!config.edgeFunction) {
      recommendations.push('⚙️  Criar Edge Function Gemini (supabase/functions/chat-gemini/)');
    }
    if (!config.privacyManifest) {
      recommendations.push('⚙️  Adicionar Privacy Manifest no app.config.js');
    }
    if (!config.edgeToEdge) {
      recommendations.push('⚙️  Habilitar Edge-to-Edge no app.config.js');
    }
    if (config.targetSdk < 35) {
      recommendations.push(`⚙️  Atualizar Target SDK para 35+ (atual: ${config.targetSdk})`);
    }

    // Recomendações de qualidade
    if (quality.tsErrors > 0) {
      recommendations.push(
        `🔴 Corrigir ${quality.tsErrors} erro(s) de TypeScript (npm run type-check)`
      );
    }
    if (quality.eslintErrors > 0) {
      recommendations.push(`🔴 Corrigir ${quality.eslintErrors} erro(s) de ESLint (npm run lint)`);
    }
    if (quality.eslintWarnings > 10) {
      recommendations.push(`⚠️  Revisar ${quality.eslintWarnings} warning(s) de ESLint`);
    }

    // Mensagem de sucesso se tudo OK
    if (recommendations.length === 0) {
      recommendations.push('✅ Projeto em excelente estado! Pronto para deploy.');
    }

    return recommendations;
  }

  /**
   * Implementação MCP call (não usado por este agente)
   */
  protected async callMCP(
    _server: string,
    _method: string,
    _params: Record<string, unknown>
  ): Promise<MCPResponse> {
    logger.debug('[ProjectHealthAgent] MCP call not implemented for this agent');
    return {
      id: `mcp-${Date.now()}`,
      success: false,
      error: {
        code: 'NOT_IMPLEMENTED',
        message: 'ProjectHealthAgent does not use MCP calls',
      },
      data: null,
      timestamp: Date.now(),
    };
  }

  /**
   * Método auxiliar para análise rápida
   */
  async analyze(): Promise<ProjectHealthReport> {
    return this.process({
      checkBugs: true,
      checkConfig: true,
      checkQuality: true,
      verbose: false,
    });
  }

  /**
   * Método auxiliar para análise detalhada
   */
  async analyzeVerbose(): Promise<ProjectHealthReport> {
    return this.process({
      checkBugs: true,
      checkConfig: true,
      checkQuality: true,
      verbose: true,
    });
  }
}

// Singleton instance
export const projectHealthAgent = new ProjectHealthAgent();
