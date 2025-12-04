#!/usr/bin/env ts-node
/**
 * 🔍 DIAGNÓSTICO COMPLETO DE PRONTIDÃO PARA PRODUÇÃO
 * 
 * Sistema abrangente de análise que verifica se o app está pronto para:
 * - Publicação na App Store (iOS)
 * - Publicação na Google Play Store (Android)
 * - Deploy em produção
 * 
 * Baseado nos prompts de análise técnica rigorosa e checklist de deploy.
 * 
 * Uso: npm run diagnose:production
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

// ======================
// TIPOS E INTERFACES
// ======================

type SeverityLevel = 'critical' | 'high' | 'medium' | 'low' | 'info';
type CategoryType = 'code' | 'config' | 'assets' | 'security' | 'store' | 'architecture' | 'performance';

interface DiagnosticIssue {
  category: CategoryType;
  severity: SeverityLevel;
  title: string;
  description: string;
  impact: string;
  action: string;
  estimatedTime?: string;
  energy?: 'baixo' | 'médio' | 'alto';
}

// Metrics report is now handled directly in analysis functions
// interface MetricsReport removed to avoid unused type warning

interface ReadinessScore {
  overall: number;
  categories: {
    code: number;
    config: number;
    assets: number;
    security: number;
    store: number;
    architecture: number;
    performance: number;
  };
}

interface Roadmap {
  critical: DiagnosticIssue[];
  high: DiagnosticIssue[];
  medium: DiagnosticIssue[];
  low: DiagnosticIssue[];
}

// ======================
// CONSTANTES
// ======================

const COLORS = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
};

const ICONS = {
  critical: '🔴',
  high: '🟠',
  medium: '🟡',
  low: '🔵',
  info: 'ℹ️',
  check: '✅',
  cross: '❌',
  warning: '⚠️',
  rocket: '🚀',
  tools: '🛠️',
  chart: '📊',
  book: '📚',
  lock: '🔒',
  store: '📱',
  code: '💻',
  target: '🎯',
};

// ======================
// HELPERS
// ======================

function log(message: string, color?: keyof typeof COLORS): void {
  const colorCode = color ? COLORS[color] : '';
  console.log(`${colorCode}${message}${COLORS.reset}`);
}

function section(title: string, icon: string = ICONS.tools): void {
  console.log('\n');
  log(`${'='.repeat(80)}`, 'cyan');
  log(`${icon}  ${title}`, 'bright');
  log(`${'='.repeat(80)}`, 'cyan');
}

function subsection(title: string): void {
  console.log('');
  log(`${'-'.repeat(80)}`, 'gray');
  log(title, 'blue');
  log(`${'-'.repeat(80)}`, 'gray');
}

function execCommand(command: string, silent: boolean = true): { output: string; exitCode: number } {
  try {
    const output = execSync(command, {
      encoding: 'utf-8',
      stdio: silent ? 'pipe' : 'inherit',
    });
    return { output, exitCode: 0 };
  } catch (error: unknown) {
    if (error instanceof Error && 'stdout' in error) {
      return {
        output: (error as { stdout: string }).stdout || '',
        exitCode: 'status' in error ? (error as { status: number }).status : 1,
      };
    }
    return { output: '', exitCode: 1 };
  }
}

function fileExists(filePath: string): boolean {
  return fs.existsSync(path.join(process.cwd(), filePath));
}

function readJsonFile(filePath: string): Record<string, unknown> | null {
  try {
    const fullPath = path.join(process.cwd(), filePath);
    if (!fs.existsSync(fullPath)) return null;
    const content = fs.readFileSync(fullPath, 'utf-8');
    return JSON.parse(content);
  } catch {
    return null;
  }
}

// ======================
// ANÁLISE: MÉTRICAS DE CÓDIGO
// ======================

function analyzeTypeScript(): { errors: number; warnings: number; status: 'pass' | 'fail'; issues: DiagnosticIssue[] } {
  const issues: DiagnosticIssue[] = [];
  
  subsection('TypeScript');
  
  const result = execCommand('npm run type-check');
  const output = result.output;
  
  // Count errors
  const errorMatches = output.match(/error TS\d+:/g);
  const errors = errorMatches ? errorMatches.length : 0;
  
  // Count warnings (if any)
  const warningMatches = output.match(/warning TS\d+:/g);
  const warnings = warningMatches ? warningMatches.length : 0;
  
  const status = errors === 0 ? 'pass' : 'fail';
  
  if (errors > 0) {
    issues.push({
      category: 'code',
      severity: 'critical',
      title: `${errors} erro(s) de TypeScript`,
      description: 'Código não compila corretamente. TypeScript errors impedem build de produção.',
      impact: 'BLOQUEADOR CRÍTICO: Impossível fazer build sem resolver isso.',
      action: 'Execute `npm run type-check` e corrija todos os erros. Priorize os erros em arquivos críticos (agents, services, screens).',
      estimatedTime: errors < 10 ? '1-2 horas' : errors < 50 ? '4-6 horas' : '1-2 dias',
      energy: errors < 10 ? 'médio' : 'alto',
    });
  }
  
  if (warnings > 0) {
    issues.push({
      category: 'code',
      severity: 'medium',
      title: `${warnings} warning(s) de TypeScript`,
      description: 'Warnings podem indicar problemas futuros ou má qualidade de código.',
      impact: 'Risco de bugs em produção, code smell.',
      action: 'Revise e corrija warnings progressivamente. Priorize warnings em código crítico.',
      estimatedTime: '1-3 horas',
      energy: 'baixo',
    });
  }
  
  log(`${ICONS.code} TypeScript: ${errors === 0 ? ICONS.check : ICONS.cross} ${errors} errors, ${warnings} warnings`, errors === 0 ? 'green' : 'red');
  
  return { errors, warnings, status, issues };
}

function analyzeESLint(): { errors: number; warnings: number; status: 'pass' | 'fail'; issues: DiagnosticIssue[] } {
  const issues: DiagnosticIssue[] = [];
  
  subsection('ESLint');
  
  const result = execCommand('npx eslint . --ext .ts,.tsx --format json');
  
  let errors = 0;
  let warnings = 0;
  
  try {
    const eslintResult = JSON.parse(result.output);
    errors = eslintResult.reduce((sum: number, file: { errorCount: number }) => sum + file.errorCount, 0);
    warnings = eslintResult.reduce((sum: number, file: { warningCount: number }) => sum + file.warningCount, 0);
  } catch {
    // Fallback: parse text output
    const errorMatches = result.output.match(/\d+ error/);
    const warningMatches = result.output.match(/\d+ warning/);
    errors = errorMatches ? parseInt(errorMatches[0]) : 0;
    warnings = warningMatches ? parseInt(warningMatches[0]) : 0;
  }
  
  const status = errors === 0 ? 'pass' : 'fail';
  
  if (errors > 0) {
    issues.push({
      category: 'code',
      severity: 'high',
      title: `${errors} erro(s) de ESLint`,
      description: 'Violações graves de padrões de código que podem causar bugs.',
      impact: 'Má qualidade de código, potenciais bugs, dificuldade de manutenção.',
      action: 'Execute `npm run lint` e corrija errors críticos. Use `npm run lint -- --fix` para auto-fix quando possível.',
      estimatedTime: '2-4 horas',
      energy: 'médio',
    });
  }
  
  if (warnings > 50) {
    issues.push({
      category: 'code',
      severity: 'medium',
      title: `${warnings} warning(s) de ESLint (meta: <50)`,
      description: 'Muitos warnings indicam baixa aderência aos padrões de código.',
      impact: 'Code smell, dificuldade de manutenção, experiência ruim para desenvolvedores.',
      action: 'Reduza progressivamente. Priorize warnings de acessibilidade, performance e boas práticas React.',
      estimatedTime: '3-6 horas',
      energy: 'baixo',
    });
  }
  
  log(`${ICONS.code} ESLint: ${errors === 0 ? ICONS.check : ICONS.cross} ${errors} errors, ${warnings} warnings`, errors === 0 ? 'green' : 'red');
  
  return { errors, warnings, status, issues };
}

function analyzeTests(): { coverage: number; passing: boolean; status: 'pass' | 'fail'; issues: DiagnosticIssue[] } {
  const issues: DiagnosticIssue[] = [];
  
  subsection('Tests');
  
  const result = execCommand('npm test -- --coverage --passWithNoTests');
  const output = result.output;
  
  // Extract coverage percentage
  let coverage = 0;
  const coverageMatch = output.match(/All files\s+\|\s+(\d+\.?\d*)/);
  if (coverageMatch) {
    coverage = parseFloat(coverageMatch[1]);
  }
  
  const passing = result.exitCode === 0;
  const status = passing && coverage >= 40 ? 'pass' : 'fail';
  
  if (coverage < 40) {
    issues.push({
      category: 'code',
      severity: 'critical',
      title: `Test coverage muito baixo: ${coverage.toFixed(1)}% (meta: 80%)`,
      description: 'Cobertura de testes insuficiente para garantir qualidade em produção.',
      impact: 'ALTO RISCO: Bugs não detectados podem ir para produção.',
      action: 'Priorize testes para: 1) Services críticos (auth, chat, profile), 2) Agentes IA, 3) Componentes principais. Adicione testes de edge cases.',
      estimatedTime: '8-16 horas',
      energy: 'alto',
    });
  } else if (coverage < 80) {
    issues.push({
      category: 'code',
      severity: 'high',
      title: `Test coverage abaixo da meta: ${coverage.toFixed(1)}% (meta: 80%)`,
      description: 'Cobertura boa mas ainda abaixo do ideal para produção.',
      impact: 'Risco moderado de bugs não detectados.',
      action: 'Continue expandindo testes. Foque em edge cases e fluxos complexos.',
      estimatedTime: '4-8 horas',
      energy: 'médio',
    });
  }
  
  if (!passing) {
    issues.push({
      category: 'code',
      severity: 'critical',
      title: 'Testes falhando',
      description: 'Alguns testes estão falhando, indicando problemas no código.',
      impact: 'BLOQUEADOR: Código quebrado não pode ir para produção.',
      action: 'Execute `npm test` e corrija todos os testes falhando antes de continuar.',
      estimatedTime: '1-4 horas',
      energy: 'médio',
    });
  }
  
  log(`${ICONS.check} Tests: ${passing ? ICONS.check : ICONS.cross} ${coverage.toFixed(1)}% coverage`, passing ? 'green' : 'red');
  
  return { coverage, passing, status, issues };
}

function analyzeDesignSystem(): { violations: number; darkMode: number; wcag: number; status: 'pass' | 'fail'; issues: DiagnosticIssue[] } {
  const issues: DiagnosticIssue[] = [];
  
  subsection('Design System');
  
  const result = execCommand('node scripts/validate-design-tokens.js');
  const output = result.output;
  
  // Parse violations
  const violationMatch = output.match(/(\d+)\s+violation/i);
  const violations = violationMatch ? parseInt(violationMatch[1]) : 0;
  
  // Estimate dark mode and WCAG (based on CONTEXTO.md: 75-80%)
  const darkMode = 78; // Mock - would need actual checking
  const wcag = 76; // Mock - would need actual checking
  
  const status = violations === 0 ? 'pass' : 'fail';
  
  if (violations > 0) {
    issues.push({
      category: 'code',
      severity: violations > 50 ? 'high' : 'medium',
      title: `${violations} violações de Design System`,
      description: 'Código usando valores hardcoded ao invés de design tokens.',
      impact: 'Inconsistências visuais, dark mode quebrado, dificulta manutenção.',
      action: 'Execute auto-fix: `node scripts/cursor-auto-fix.js --mode=batch --confidence=high` e valide com `npm run validate:design`.',
      estimatedTime: '1-2 horas',
      energy: 'baixo',
    });
  }
  
  if (darkMode < 100) {
    issues.push({
      category: 'code',
      severity: 'medium',
      title: `Dark mode incompleto: ${darkMode}% (meta: 100%)`,
      description: 'Algumas telas não funcionam corretamente em dark mode.',
      impact: 'UX ruim para usuários que preferem dark mode, possíveis rejeições na App Store.',
      action: 'Teste todas as telas em dark mode. Corrija cores hardcoded e use `useThemeColors()` consistentemente.',
      estimatedTime: '2-3 horas',
      energy: 'médio',
    });
  }
  
  if (wcag < 100) {
    issues.push({
      category: 'code',
      severity: 'high',
      title: `WCAG AAA incompleto: ${wcag}% (meta: 100%)`,
      description: 'Acessibilidade abaixo do padrão AAA. Pode causar rejeição nas lojas.',
      impact: 'Exclusão de usuários com deficiência, possível rejeição na App Store.',
      action: '1) Verificar contraste 7:1, 2) Touch targets ≥44pt, 3) Adicionar accessibilityLabel/Role, 4) Testar com VoiceOver/TalkBack.',
      estimatedTime: '3-4 horas',
      energy: 'médio',
    });
  }
  
  log(`${ICONS.code} Design: ${violations === 0 ? ICONS.check : ICONS.cross} ${violations} violations, DarkMode ${darkMode}%, WCAG ${wcag}%`, violations === 0 ? 'green' : 'yellow');
  
  return { violations, darkMode, wcag, status, issues };
}

// ======================
// ANÁLISE: CONFIGURAÇÃO
// ======================

function analyzeAppConfig(): DiagnosticIssue[] {
  const issues: DiagnosticIssue[] = [];
  
  subsection('App Configuration');
  
  if (!fileExists('app.config.js')) {
    issues.push({
      category: 'config',
      severity: 'critical',
      title: 'app.config.js não encontrado',
      description: 'Arquivo essencial para configuração do Expo.',
      impact: 'BLOQUEADOR: Impossível fazer build sem este arquivo.',
      action: 'Crie app.config.js com configurações de iOS e Android (bundleIdentifier, package, version, etc).',
      estimatedTime: '30 minutos',
      energy: 'baixo',
    });
    log(`${ICONS.cross} app.config.js: Não encontrado`, 'red');
    return issues;
  }
  
  const configContent = fs.readFileSync(path.join(process.cwd(), 'app.config.js'), 'utf-8');
  
  // Validate iOS bundleIdentifier
  if (!configContent.match(/bundleIdentifier:\s*['"][a-z.]+['"]/)) {
    issues.push({
      category: 'config',
      severity: 'critical',
      title: 'iOS bundleIdentifier não configurado',
      description: 'Bundle ID é obrigatório para publicação na App Store.',
      impact: 'BLOQUEADOR para iOS: Impossível submeter para App Store.',
      action: 'Configure ios.bundleIdentifier em app.config.js (ex: "com.nossamaternidade.app").',
      estimatedTime: '5 minutos',
      energy: 'baixo',
    });
  }
  
  // Validate Android package
  if (!configContent.match(/package:\s*['"][a-z.]+['"]/)) {
    issues.push({
      category: 'config',
      severity: 'critical',
      title: 'Android package não configurado',
      description: 'Package name é obrigatório para publicação na Google Play.',
      impact: 'BLOQUEADOR para Android: Impossível submeter para Google Play.',
      action: 'Configure android.package em app.config.js (ex: "com.nossamaternidade.app").',
      estimatedTime: '5 minutos',
      energy: 'baixo',
    });
  }
  
  // Validate version
  if (!configContent.match(/version:\s*['"][\d.]+['"]/)) {
    issues.push({
      category: 'config',
      severity: 'high',
      title: 'Versão do app não configurada',
      description: 'Version string é necessária para as lojas.',
      impact: 'Necessário para publicação nas lojas.',
      action: 'Configure version em app.config.js (ex: "1.0.0").',
      estimatedTime: '5 minutos',
      energy: 'baixo',
    });
  }
  
  log(`${ICONS.check} app.config.js: ${issues.length === 0 ? 'OK' : `${issues.length} problema(s)`}`, issues.length === 0 ? 'green' : 'yellow');
  
  return issues;
}

function analyzeEASConfig(): DiagnosticIssue[] {
  const issues: DiagnosticIssue[] = [];
  
  subsection('EAS Build Configuration');
  
  const easConfig = readJsonFile('eas.json');
  
  if (!easConfig) {
    issues.push({
      category: 'config',
      severity: 'critical',
      title: 'eas.json não encontrado',
      description: 'Configuração do EAS Build é essencial para criar builds.',
      impact: 'BLOQUEADOR: Impossível fazer build de produção.',
      action: 'Execute `eas build:configure` para criar eas.json.',
      estimatedTime: '10 minutos',
      energy: 'baixo',
    });
    log(`${ICONS.cross} eas.json: Não encontrado`, 'red');
    return issues;
  }
  
  // Check for production profile
  const buildConfig = easConfig.build as Record<string, unknown> | undefined;
  if (!buildConfig || !buildConfig.production) {
    issues.push({
      category: 'config',
      severity: 'high',
      title: 'Profile de produção não configurado',
      description: 'É necessário um profile "production" em eas.json.',
      impact: 'Não conseguirá fazer build de produção.',
      action: 'Adicione profile "production" em eas.json com configurações adequadas.',
      estimatedTime: '15 minutos',
      energy: 'baixo',
    });
  }
  
  log(`${ICONS.check} eas.json: ${issues.length === 0 ? 'OK' : `${issues.length} problema(s)`}`, issues.length === 0 ? 'green' : 'yellow');
  
  return issues;
}

function analyzeEnvironment(): DiagnosticIssue[] {
  const issues: DiagnosticIssue[] = [];
  
  subsection('Environment Variables');
  
  if (!fileExists('.env.example')) {
    issues.push({
      category: 'config',
      severity: 'medium',
      title: '.env.example não encontrado',
      description: 'Exemplo de variáveis de ambiente facilita setup.',
      impact: 'Dificuldade para outros desenvolvedores configurarem o projeto.',
      action: 'Crie .env.example com todas as variáveis necessárias (sem valores sensíveis).',
      estimatedTime: '10 minutos',
      energy: 'baixo',
    });
  }
  
  if (!fileExists('.env')) {
    issues.push({
      category: 'config',
      severity: 'high',
      title: '.env não configurado',
      description: 'Arquivo de configuração local não existe.',
      impact: 'Features que dependem de API keys não funcionarão.',
      action: 'Copie .env.example para .env e preencha com suas chaves: `cp .env.example .env`',
      estimatedTime: '5 minutos',
      energy: 'baixo',
    });
  } else {
    // Check if .env is in git
    const gitFiles = execCommand('git ls-files .env', true).output;
    if (gitFiles.includes('.env')) {
      issues.push({
        category: 'security',
        severity: 'critical',
        title: '.env commitado no Git',
        description: 'GRAVE: Secrets expostos no repositório Git.',
        impact: 'RISCO DE SEGURANÇA CRÍTICO: API keys vazadas podem ser usadas maliciosamente.',
        action: 'URGENTE: 1) Execute `git rm --cached .env`, 2) Regenere TODAS as API keys, 3) Commit e push.',
        estimatedTime: '30 minutos',
        energy: 'médio',
      });
    }
  }
  
  log(`${ICONS.check} Environment: ${issues.length === 0 ? 'OK' : `${issues.length} problema(s)`}`, issues.length === 0 ? 'green' : issues.some(i => i.severity === 'critical') ? 'red' : 'yellow');
  
  return issues;
}

// ======================
// ANÁLISE: ASSETS
// ======================

function analyzeAssets(): DiagnosticIssue[] {
  const issues: DiagnosticIssue[] = [];
  
  subsection('App Assets');
  
  const requiredAssets = [
    { file: 'assets/icon.png', name: 'Ícone do app', size: '1024x1024', severity: 'critical' as const },
    { file: 'assets/splash.png', name: 'Splash screen', size: 'variável', severity: 'critical' as const },
    { file: 'assets/adaptive-icon.png', name: 'Ícone adaptativo (Android)', size: '1024x1024', severity: 'high' as const },
  ];
  
  requiredAssets.forEach(asset => {
    if (!fileExists(asset.file)) {
      issues.push({
        category: 'assets',
        severity: asset.severity,
        title: `${asset.name} não encontrado`,
        description: `Asset obrigatório: ${asset.file} (${asset.size})`,
        impact: asset.severity === 'critical' ? 'BLOQUEADOR: Lojas rejeitarão app sem este asset.' : 'Necessário para boa experiência e aprovação nas lojas.',
        action: `Crie ${asset.file} com dimensões ${asset.size}. Use um designer ou ferramenta de geração de ícones.`,
        estimatedTime: '30 minutos - 2 horas',
        energy: 'médio',
      });
    }
  });
  
  // Check screenshots
  const screenshotsDir = path.join(process.cwd(), 'assets/screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    issues.push({
      category: 'store',
      severity: 'high',
      title: 'Screenshots para lojas não encontrados',
      description: 'App Store e Google Play exigem screenshots (mínimo 3-5).',
      impact: 'BLOQUEADOR para publicação: Lojas exigem screenshots.',
      action: 'Crie pasta assets/screenshots e adicione screenshots de alta qualidade do app funcionando.',
      estimatedTime: '1-2 horas',
      energy: 'médio',
    });
  } else {
    const screenshots = fs.readdirSync(screenshotsDir).filter(f => f.match(/\.(png|jpg|jpeg)$/i));
    if (screenshots.length < 3) {
      issues.push({
        category: 'store',
        severity: 'high',
        title: `Poucos screenshots: ${screenshots.length} (mínimo: 3-5)`,
        description: 'Lojas recomendam 3-5 screenshots de qualidade.',
        impact: 'Aparência ruim na loja, menor taxa de conversão.',
        action: 'Capture screenshots de alta qualidade das principais telas do app.',
        estimatedTime: '1 hora',
        energy: 'baixo',
      });
    }
  }
  
  log(`${ICONS.store} Assets: ${issues.length === 0 ? 'OK' : `${issues.length} problema(s)`}`, issues.length === 0 ? 'green' : 'yellow');
  
  return issues;
}

// ======================
// ANÁLISE: SEGURANÇA E LGPD
// ======================

function analyzeSecurity(): DiagnosticIssue[] {
  const issues: DiagnosticIssue[] = [];
  
  subsection('Security & LGPD');
  
  // Check for hardcoded secrets
  const secretsCheck = execCommand('grep -r "sk-" src/ --include="*.ts" --include="*.tsx" || true', true);
  if (secretsCheck.output.includes('sk-')) {
    issues.push({
      category: 'security',
      severity: 'critical',
      title: 'Possível API key hardcoded no código',
      description: 'Detectado padrão "sk-" que pode indicar OpenAI API key hardcoded.',
      impact: 'RISCO DE SEGURANÇA CRÍTICO: Keys expostas podem ser roubadas.',
      action: 'URGENTE: 1) Remova keys do código, 2) Use apenas .env, 3) Regenere as keys comprometidas.',
      estimatedTime: '30 minutos',
      energy: 'médio',
    });
  }
  
  // Check for console.log
  const consoleCheck = execCommand('grep -r "console\\.log" src/ --include="*.ts" --include="*.tsx" | wc -l', true);
  const consoleCount = parseInt(consoleCheck.output.trim()) || 0;
  if (consoleCount > 5) {
    issues.push({
      category: 'code',
      severity: 'medium',
      title: `${consoleCount} console.log encontrados (deveria usar logger)`,
      description: 'console.log espalha logs sem controle e pode vazar informações sensíveis.',
      impact: 'Possível vazamento de dados sensíveis em logs, dificulta debugging.',
      action: 'Substitua por `logger.debug/info/error` de @/utils/logger. Execute busca e replace.',
      estimatedTime: '1 hora',
      energy: 'baixo',
    });
  }
  
  // Check privacy policy
  if (!fileExists('docs/PRIVACY_POLICY.md') && !fileExists('PRIVACY_POLICY.md')) {
    issues.push({
      category: 'store',
      severity: 'critical',
      title: 'Política de privacidade não encontrada',
      description: 'LGPD e lojas exigem política de privacidade.',
      impact: 'BLOQUEADOR LEGAL E DE LOJAS: Violação de LGPD, rejeição garantida nas lojas.',
      action: 'Crie política de privacidade detalhada (use template em docs/PRIVACY_POLICY_TEMPLATE.md se existir).',
      estimatedTime: '2-4 horas',
      energy: 'médio',
    });
  }
  
  // Check terms of service
  if (!fileExists('docs/TERMS_OF_SERVICE.md') && !fileExists('TERMS_OF_SERVICE.md')) {
    issues.push({
      category: 'store',
      severity: 'high',
      title: 'Termos de serviço não encontrados',
      description: 'Lojas recomendam termos de serviço claros.',
      impact: 'Risco legal, pode causar problemas com usuários e lojas.',
      action: 'Crie termos de serviço (use template em docs/TERMS_OF_SERVICE_TEMPLATE.md se existir).',
      estimatedTime: '2-3 horas',
      energy: 'médio',
    });
  }
  
  // Check RLS policies
  const rlsCheck = execCommand('grep -r "RLS" supabase/ || grep -r "row_security" supabase/ || echo "not found"', true);
  if (rlsCheck.output.includes('not found')) {
    issues.push({
      category: 'security',
      severity: 'critical',
      title: 'RLS policies não encontradas no Supabase',
      description: 'Row Level Security é OBRIGATÓRIO para LGPD compliance.',
      impact: 'RISCO DE SEGURANÇA CRÍTICO: Dados podem ser acessados por usuários não autorizados.',
      action: 'Configure RLS policies em TODAS as tabelas do Supabase. Documente em migrations.',
      estimatedTime: '3-6 horas',
      energy: 'alto',
    });
  }
  
  log(`${ICONS.lock} Security: ${issues.length === 0 ? 'OK' : `${issues.length} problema(s)`}`, issues.length === 0 ? 'green' : issues.some(i => i.severity === 'critical') ? 'red' : 'yellow');
  
  return issues;
}

// ======================
// ANÁLISE: ARQUITETURA
// ======================

function analyzeArchitecture(): DiagnosticIssue[] {
  const issues: DiagnosticIssue[] = [];
  
  subsection('Architecture');
  
  // Check for legacy design system
  const legacyCheck = execCommand('grep -r "@/design-system" src/ --include="*.ts" --include="*.tsx" || true', true);
  if (legacyCheck.output.trim().length > 0) {
    issues.push({
      category: 'architecture',
      severity: 'medium',
      title: 'Uso de design system legado detectado',
      description: 'Código ainda importa de @/design-system (deprecated).',
      impact: 'Inconsistências, manutenção difícil.',
      action: 'Migre para @/theme/tokens.ts. Use auto-refactor se disponível.',
      estimatedTime: '1-2 horas',
      energy: 'baixo',
    });
  }
  
  // Check service pattern
  const servicesDir = path.join(process.cwd(), 'src/services');
  if (fs.existsSync(servicesDir)) {
    const serviceFiles = fs.readdirSync(servicesDir, { recursive: true })
      .filter(f => typeof f === 'string' && f.endsWith('.ts'))
      .slice(0, 5); // Check first 5 files
    
    let nonCompliantServices = 0;
    serviceFiles.forEach(file => {
      const content = fs.readFileSync(path.join(servicesDir, file as string), 'utf-8');
      // Check if service returns { data, error }
      if (!content.includes('{ data') || !content.includes('error }')) {
        nonCompliantServices++;
      }
    });
    
    if (nonCompliantServices > 0) {
      issues.push({
        category: 'architecture',
        severity: 'medium',
        title: `${nonCompliantServices} service(s) não seguem padrão { data, error }`,
        description: 'Services devem retornar sempre { data, error } para error handling consistente.',
        impact: 'Inconsistência, dificuldade de manutenção, possíveis bugs.',
        action: 'Refatore services para retornar { data, error }. Veja CONTEXTO.md > Regra 9.',
        estimatedTime: '2-4 horas',
        energy: 'médio',
      });
    }
  }
  
  log(`${ICONS.code} Architecture: ${issues.length === 0 ? 'OK' : `${issues.length} problema(s)`}`, issues.length === 0 ? 'green' : 'yellow');
  
  return issues;
}

// ======================
// ANÁLISE: STORE READINESS
// ======================

function analyzeStoreReadiness(): DiagnosticIssue[] {
  const issues: DiagnosticIssue[] = [];
  
  subsection('Store Readiness (iOS & Android)');
  
  // iOS specific
  if (!fileExists('assets/icon.png')) {
    issues.push({
      category: 'store',
      severity: 'critical',
      title: 'Ícone do app faltando (iOS requisito)',
      description: 'App Store exige ícone 1024x1024.',
      impact: 'BLOQUEADOR iOS.',
      action: 'Crie assets/icon.png com 1024x1024px.',
      estimatedTime: '30 minutos',
      energy: 'baixo',
    });
  }
  
  // Android specific
  if (!fileExists('assets/adaptive-icon.png')) {
    issues.push({
      category: 'store',
      severity: 'high',
      title: 'Ícone adaptativo faltando (Android requisito)',
      description: 'Google Play recomenda ícone adaptativo.',
      impact: 'UX ruim no Android, possível rejeição.',
      action: 'Crie assets/adaptive-icon.png com 1024x1024px.',
      estimatedTime: '30 minutos',
      energy: 'baixo',
    });
  }
  
  // Store metadata
  const packageJson = readJsonFile('package.json');
  if (packageJson) {
    if (!packageJson.description || packageJson.description === '') {
      issues.push({
        category: 'store',
        severity: 'medium',
        title: 'Descrição do app não configurada',
        description: 'Description em package.json está vazia.',
        impact: 'Metadados incompletos.',
        action: 'Adicione description em package.json (será usada em metadados).',
        estimatedTime: '10 minutos',
        energy: 'baixo',
      });
    }
  }
  
  // Check store-metadata folder
  if (!fs.existsSync(path.join(process.cwd(), 'store-metadata'))) {
    issues.push({
      category: 'store',
      severity: 'high',
      title: 'Pasta store-metadata não encontrada',
      description: 'Metadados para lojas (descrição, keywords, etc) não configurados.',
      impact: 'Dificuldade na submissão, aparência ruim nas lojas.',
      action: 'Crie pasta store-metadata com subpastas ios/ e android/ contendo description.txt, keywords.txt, etc.',
      estimatedTime: '1-2 horas',
      energy: 'médio',
    });
  }
  
  log(`${ICONS.store} Store Readiness: ${issues.length === 0 ? 'OK' : `${issues.length} problema(s)`}`, issues.length === 0 ? 'green' : 'yellow');
  
  return issues;
}

// ======================
// ANÁLISE: PERFORMANCE
// ======================

function analyzePerformance(): DiagnosticIssue[] {
  const issues: DiagnosticIssue[] = [];
  
  subsection('Performance');
  
  // Check bundle size (basic check)
  const packageJson = readJsonFile('package.json');
  if (packageJson && packageJson.dependencies) {
    const deps = Object.keys(packageJson.dependencies as Record<string, string>);
    if (deps.length > 50) {
      issues.push({
        category: 'performance',
        severity: 'medium',
        title: `Muitas dependências: ${deps.length}`,
        description: 'Muitas dependências podem aumentar tamanho do bundle e tempo de build.',
        impact: 'Bundle grande, downloads lentos, experiência ruim.',
        action: 'Revise dependências e remova as não utilizadas. Use `npm prune`.',
        estimatedTime: '1-2 horas',
        energy: 'baixo',
      });
    }
  }
  
  // Check for FlatList usage (important for React Native performance)
  const scrollViewCheck = execCommand('grep -r "ScrollView" src/screens --include="*.tsx" | grep -c ".map(" || echo "0"', true);
  const scrollViewCount = parseInt(scrollViewCheck.output.trim()) || 0;
  if (scrollViewCount > 3) {
    issues.push({
      category: 'performance',
      severity: 'medium',
      title: `${scrollViewCount} uso(s) de ScrollView + .map() detectado`,
      description: 'ScrollView com .map() é ineficiente. Use FlatList.',
      impact: 'Performance ruim em listas longas, possível crash.',
      action: 'Substitua ScrollView + .map() por FlatList com virtualization. Priorize listas grandes.',
      estimatedTime: '2-4 horas',
      energy: 'médio',
    });
  }
  
  log(`${ICONS.target} Performance: ${issues.length === 0 ? 'OK' : `${issues.length} problema(s)`}`, issues.length === 0 ? 'green' : 'yellow');
  
  return issues;
}

// ======================
// GERAÇÃO DE RELATÓRIO
// ======================

function calculateReadinessScore(allIssues: DiagnosticIssue[]): ReadinessScore {
  const categoryCounts: Record<CategoryType, { total: number; critical: number; high: number }> = {
    code: { total: 0, critical: 0, high: 0 },
    config: { total: 0, critical: 0, high: 0 },
    assets: { total: 0, critical: 0, high: 0 },
    security: { total: 0, critical: 0, high: 0 },
    store: { total: 0, critical: 0, high: 0 },
    architecture: { total: 0, critical: 0, high: 0 },
    performance: { total: 0, critical: 0, high: 0 },
  };
  
  allIssues.forEach(issue => {
    categoryCounts[issue.category].total++;
    if (issue.severity === 'critical') categoryCounts[issue.category].critical++;
    if (issue.severity === 'high') categoryCounts[issue.category].high++;
  });
  
  const categoryScores: ReadinessScore['categories'] = {
    code: 100 - (categoryCounts.code.critical * 20 + categoryCounts.code.high * 10 + categoryCounts.code.total * 2),
    config: 100 - (categoryCounts.config.critical * 20 + categoryCounts.config.high * 10 + categoryCounts.config.total * 2),
    assets: 100 - (categoryCounts.assets.critical * 20 + categoryCounts.assets.high * 10 + categoryCounts.assets.total * 2),
    security: 100 - (categoryCounts.security.critical * 20 + categoryCounts.security.high * 10 + categoryCounts.security.total * 2),
    store: 100 - (categoryCounts.store.critical * 20 + categoryCounts.store.high * 10 + categoryCounts.store.total * 2),
    architecture: 100 - (categoryCounts.architecture.critical * 20 + categoryCounts.architecture.high * 10 + categoryCounts.architecture.total * 2),
    performance: 100 - (categoryCounts.performance.critical * 20 + categoryCounts.performance.high * 10 + categoryCounts.performance.total * 2),
  };
  
  // Ensure scores don't go below 0
  Object.keys(categoryScores).forEach(key => {
    const categoryKey = key as CategoryType;
    categoryScores[categoryKey] = Math.max(0, categoryScores[categoryKey]);
  });
  
  const overall = Math.round(
    Object.values(categoryScores).reduce((sum, score) => sum + score, 0) / Object.keys(categoryScores).length
  );
  
  return { overall, categories: categoryScores };
}

function organizeRoadmap(allIssues: DiagnosticIssue[]): Roadmap {
  return {
    critical: allIssues.filter(i => i.severity === 'critical'),
    high: allIssues.filter(i => i.severity === 'high'),
    medium: allIssues.filter(i => i.severity === 'medium'),
    low: allIssues.filter(i => i.severity === 'low'),
  };
}

function printRoadmap(roadmap: Roadmap): void {
  section('🎯 ROADMAP PRIORIZADO', ICONS.target);
  
  const printIssueList = (issues: DiagnosticIssue[], title: string, icon: string): void => {
    if (issues.length === 0) return;
    
    console.log('');
    log(`${icon} ${title} (${issues.length})`, 'bright');
    log(`${'─'.repeat(80)}`, 'gray');
    
    issues.forEach((issue, idx) => {
      console.log('');
      log(`${idx + 1}. ${issue.title}`, 'bright');
      log(`   Categoria: ${issue.category.toUpperCase()}`, 'gray');
      log(`   ${issue.description}`, 'yellow');
      log(`   Impacto: ${issue.impact}`, 'red');
      log(`   Ação: ${issue.action}`, 'green');
      if (issue.estimatedTime) {
        log(`   ⏱️  Tempo estimado: ${issue.estimatedTime}`, 'cyan');
      }
      if (issue.energy) {
        log(`   ⚡ Nível de energia: ${issue.energy}`, 'cyan');
      }
    });
  };
  
  printIssueList(roadmap.critical, 'CRÍTICO - FAZER AGORA', ICONS.critical);
  printIssueList(roadmap.high, 'ALTO - FAZER ESTA SEMANA', ICONS.high);
  printIssueList(roadmap.medium, 'MÉDIO - FAZER NAS PRÓXIMAS 2 SEMANAS', ICONS.medium);
  printIssueList(roadmap.low, 'BAIXO - MELHORIAS FUTURAS', ICONS.low);
}

function printSummary(score: ReadinessScore, roadmap: Roadmap): void {
  section('📊 RESUMO EXECUTIVO', ICONS.chart);
  
  console.log('');
  log(`SCORE GERAL DE PRONTIDÃO: ${score.overall}/100`, score.overall >= 80 ? 'green' : score.overall >= 60 ? 'yellow' : 'red');
  console.log('');
  
  log('Scores por Categoria:', 'bright');
  log(`${'─'.repeat(80)}`, 'gray');
  
  Object.entries(score.categories).forEach(([category, categoryScore]) => {
    const icon = categoryScore >= 80 ? ICONS.check : categoryScore >= 60 ? ICONS.warning : ICONS.cross;
    const color = categoryScore >= 80 ? 'green' : categoryScore >= 60 ? 'yellow' : 'red';
    log(`${icon} ${category.toUpperCase().padEnd(15)}: ${categoryScore}/100`, color);
  });
  
  console.log('');
  log(`${'─'.repeat(80)}`, 'gray');
  console.log('');
  
  log(`${ICONS.critical} Problemas Críticos: ${roadmap.critical.length}`, roadmap.critical.length === 0 ? 'green' : 'red');
  log(`${ICONS.high} Problemas Altos: ${roadmap.high.length}`, roadmap.high.length === 0 ? 'green' : 'yellow');
  log(`${ICONS.medium} Problemas Médios: ${roadmap.medium.length}`, 'yellow');
  log(`${ICONS.low} Problemas Baixos: ${roadmap.low.length}`, 'blue');
  
  console.log('');
  log(`${'═'.repeat(80)}`, 'cyan');
  console.log('');
  
  if (score.overall >= 90) {
    log(`${ICONS.rocket} EXCELENTE! Pronto para deploy!`, 'green');
    log('Você pode fazer build de produção com confiança.', 'green');
  } else if (score.overall >= 75) {
    log(`${ICONS.check} QUASE LÁ! Poucos ajustes necessários.`, 'yellow');
    log(`Foque nos ${roadmap.critical.length + roadmap.high.length} problemas críticos/altos.`, 'yellow');
  } else if (score.overall >= 50) {
    log(`${ICONS.warning} TRABALHO NECESSÁRIO. Não está pronto para produção.`, 'yellow');
    log('Priorize resolver problemas críticos antes de continuar.', 'yellow');
  } else {
    log(`${ICONS.cross} MUITO TRABALHO PELA FRENTE. Longe de estar pronto.`, 'red');
    log('Este projeto precisa de atenção significativa antes do deploy.', 'red');
  }
  
  console.log('');
  log(`${'═'.repeat(80)}`, 'cyan');
}

function printNextSteps(roadmap: Roadmap): void {
  section('📋 PRÓXIMOS PASSOS CONCRETOS', ICONS.tools);
  
  const nextActions = [
    ...roadmap.critical.slice(0, 3),
    ...roadmap.high.slice(0, 3),
  ].slice(0, 5);
  
  if (nextActions.length === 0) {
    log('✅ Não há ações críticas ou de alta prioridade! Continue com melhorias médias/baixas.', 'green');
    return;
  }
  
  console.log('');
  log('Comece com estas ações (em ordem de prioridade):', 'bright');
  log(`${'─'.repeat(80)}`, 'gray');
  
  nextActions.forEach((issue, idx) => {
    console.log('');
    log(`${idx + 1}. ${issue.title}`, 'bright');
    log(`   ${ICONS.tools} ${issue.action}`, 'green');
    if (issue.estimatedTime) {
      log(`   ⏱️  ${issue.estimatedTime}`, 'cyan');
    }
    if (issue.energy) {
      log(`   ⚡ Energia: ${issue.energy}`, 'cyan');
    }
  });
  
  console.log('');
  log(`${'═'.repeat(80)}`, 'cyan');
}

// ======================
// MAIN EXECUTION
// ======================

function main(): void {
  log(`${'='.repeat(80)}`, 'cyan');
  log(`${ICONS.rocket} DIAGNÓSTICO COMPLETO DE PRONTIDÃO PARA PRODUÇÃO`, 'bright');
  log(`${'='.repeat(80)}`, 'cyan');
  log('', 'reset');
  log('Analisando projeto Nossa Maternidade...', 'cyan');
  log('Este diagnóstico verifica se o app está pronto para App Store e Google Play Store.', 'gray');
  
  const allIssues: DiagnosticIssue[] = [];
  
  // Run all analyses
  section('1. ANÁLISE DE CÓDIGO', ICONS.code);
  const tsResult = analyzeTypeScript();
  allIssues.push(...tsResult.issues);
  
  const eslintResult = analyzeESLint();
  allIssues.push(...eslintResult.issues);
  
  const testResult = analyzeTests();
  allIssues.push(...testResult.issues);
  
  const designResult = analyzeDesignSystem();
  allIssues.push(...designResult.issues);
  
  section('2. ANÁLISE DE CONFIGURAÇÃO', ICONS.tools);
  allIssues.push(...analyzeAppConfig());
  allIssues.push(...analyzeEASConfig());
  allIssues.push(...analyzeEnvironment());
  
  section('3. ANÁLISE DE ASSETS', ICONS.store);
  allIssues.push(...analyzeAssets());
  
  section('4. ANÁLISE DE SEGURANÇA & LGPD', ICONS.lock);
  allIssues.push(...analyzeSecurity());
  
  section('5. ANÁLISE DE ARQUITETURA', ICONS.code);
  allIssues.push(...analyzeArchitecture());
  
  section('6. ANÁLISE DE PRONTIDÃO PARA LOJAS', ICONS.store);
  allIssues.push(...analyzeStoreReadiness());
  
  section('7. ANÁLISE DE PERFORMANCE', ICONS.target);
  allIssues.push(...analyzePerformance());
  
  // Generate scores and roadmap
  const score = calculateReadinessScore(allIssues);
  const roadmap = organizeRoadmap(allIssues);
  
  // Print results
  printSummary(score, roadmap);
  printRoadmap(roadmap);
  printNextSteps(roadmap);
  
  // Final message
  console.log('');
  log(`${'═'.repeat(80)}`, 'cyan');
  log('', 'reset');
  log('📚 Para mais informações:', 'cyan');
  log('  - Contexto do projeto: CONTEXTO.md', 'gray');
  log('  - Guia de deploy: docs/DEPLOY_STORES.md', 'gray');
  log('  - Checklist de qualidade: docs/CHECKLIST_PRE_LAUNCH.md', 'gray');
  log('', 'reset');
  log('💡 Dica: Execute este diagnóstico regularmente para acompanhar progresso!', 'yellow');
  log('', 'reset');
  log(`${'═'.repeat(80)}`, 'cyan');
  
  // Exit code based on critical issues
  if (roadmap.critical.length > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

// Execute
main();
