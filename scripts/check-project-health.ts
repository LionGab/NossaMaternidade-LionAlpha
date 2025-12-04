#!/usr/bin/env ts-node
/**
 * CLI Script para Project Health Check
 * Executa análise de saúde do projeto e exibe relatório
 */

import { ProjectHealthAgent } from '../src/agents/health/ProjectHealthAgent';
import * as path from 'path';

// Cores para output no terminal
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

/**
 * Formata o score com cor baseado no valor
 */
function formatScore(score: number): string {
  let color = colors.red;
  if (score >= 90) color = colors.green;
  else if (score >= 70) color = colors.yellow;

  return `${color}${colors.bright}${score}/100${colors.reset}`;
}

/**
 * Exibe o relatório formatado
 */
function displayReport(report: ReturnType<ProjectHealthAgent['analyze']> extends Promise<infer T> ? T : never): void {
  console.log('\n');
  console.log(`${colors.cyan}${colors.bright}════════════════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.cyan}${colors.bright}           NOSSA MATERNIDADE - PROJECT HEALTH CHECK          ${colors.reset}`);
  console.log(`${colors.cyan}${colors.bright}════════════════════════════════════════════════════════════${colors.reset}`);
  console.log('\n');

  // Score Geral
  console.log(`${colors.bright}📊 OVERALL SCORE:${colors.reset} ${formatScore(report.overallScore)}`);
  console.log(
    `${colors.bright}🚀 READY FOR DEPLOY:${colors.reset} ${report.readyForDeploy ? `${colors.green}✅ YES${colors.reset}` : `${colors.red}❌ NO${colors.reset}`}`
  );
  console.log('\n');

  // Bugs
  console.log(`${colors.bright}🐛 BUGS STATUS:${colors.reset}`);
  console.log(`   Total: ${report.bugs.total}`);
  console.log(
    `   Fixed: ${colors.green}${report.bugs.fixed}${colors.reset} / ${report.bugs.total}`
  );
  console.log(
    `   Pending: ${report.bugs.pending.length > 0 ? `${colors.red}${report.bugs.pending.length}${colors.reset}` : `${colors.green}0${colors.reset}`}`
  );

  if (report.bugs.pending.length > 0) {
    console.log(`\n   ${colors.yellow}Pending bugs:${colors.reset}`);
    report.bugs.pending.forEach((bug) => {
      console.log(`   • ${bug.bug} (${bug.file})`);
      console.log(`     ${colors.yellow}⚠️  ${bug.details}${colors.reset}`);
    });
  }
  console.log('\n');

  // Configuração
  console.log(`${colors.bright}⚙️  CONFIGURATION:${colors.reset}`);
  console.log(
    `   Polyfills: ${report.config.polyfills ? `${colors.green}✓${colors.reset}` : `${colors.red}✗${colors.reset}`}`
  );
  console.log(
    `   SafeAreaProvider: ${report.config.safeArea ? `${colors.green}✓${colors.reset}` : `${colors.red}✗${colors.reset}`}`
  );
  console.log(
    `   Edge Function: ${report.config.edgeFunction ? `${colors.green}✓${colors.reset}` : `${colors.red}✗${colors.reset}`}`
  );
  console.log(
    `   Privacy Manifest: ${report.config.privacyManifest ? `${colors.green}✓${colors.reset}` : `${colors.red}✗${colors.reset}`}`
  );
  console.log(
    `   Edge-to-Edge: ${report.config.edgeToEdge ? `${colors.green}✓${colors.reset}` : `${colors.red}✗${colors.reset}`}`
  );
  console.log(
    `   Target SDK: ${report.config.targetSdk >= 35 ? `${colors.green}${report.config.targetSdk}${colors.reset}` : `${colors.red}${report.config.targetSdk}${colors.reset}`} ${report.config.targetSdk >= 35 ? '✓' : '(required: ≥35)'}`
  );
  console.log('\n');

  // Qualidade
  console.log(`${colors.bright}🔍 CODE QUALITY:${colors.reset}`);
  console.log(
    `   TypeScript Errors: ${report.quality.tsErrors === 0 ? `${colors.green}0${colors.reset}` : `${colors.red}${report.quality.tsErrors}${colors.reset}`}`
  );
  console.log(
    `   ESLint Errors: ${report.quality.eslintErrors === 0 ? `${colors.green}0${colors.reset}` : `${colors.red}${report.quality.eslintErrors}${colors.reset}`}`
  );
  console.log(
    `   ESLint Warnings: ${report.quality.eslintWarnings < 10 ? `${colors.green}${report.quality.eslintWarnings}${colors.reset}` : `${colors.yellow}${report.quality.eslintWarnings}${colors.reset}`}`
  );
  console.log('\n');

  // Recomendações
  if (report.recommendations.length > 0) {
    console.log(`${colors.bright}💡 RECOMMENDATIONS:${colors.reset}`);
    report.recommendations.forEach((rec) => {
      console.log(`   ${rec}`);
    });
    console.log('\n');
  }

  console.log(`${colors.cyan}${colors.bright}════════════════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.bright}Timestamp:${colors.reset} ${new Date(report.timestamp).toLocaleString()}`);
  console.log(`${colors.cyan}${colors.bright}════════════════════════════════════════════════════════════${colors.reset}`);
  console.log('\n');
}

/**
 * Main function
 */
async function main(): Promise<void> {
  try {
    console.log(`${colors.blue}🏥 Iniciando análise de saúde do projeto...${colors.reset}\n`);

    // Detectar root do projeto
    const projectRoot = path.resolve(__dirname, '..');

    // Criar agente
    const agent = new ProjectHealthAgent(projectRoot);

    // Executar análise
    const report = await agent.analyze();

    // Exibir relatório
    displayReport(report);

    // Exit code baseado no status
    if (report.readyForDeploy) {
      console.log(`${colors.green}✅ Projeto pronto para deploy!${colors.reset}\n`);
      process.exit(0);
    } else {
      console.log(
        `${colors.yellow}⚠️  Projeto não está pronto para deploy. Veja as recomendações acima.${colors.reset}\n`
      );
      process.exit(1);
    }
  } catch (error) {
    console.error(`${colors.red}❌ Erro ao executar análise:${colors.reset}`, error);
    process.exit(1);
  }
}

// Executar
main();
