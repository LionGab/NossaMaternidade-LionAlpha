#!/usr/bin/env node
/**
 * Design Tokens Auto-Fixer Skill
 *
 * Automatically fixes hardcoded colors, spacing, and typography violations
 * by replacing them with proper design tokens in React Native components.
 *
 * Based on SKILL.md documentation
 * @version 1.0.0
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

// ======================
// CONFIGURAÇÃO
// ======================

const TOKENS_IMPORT =
  "import { Tokens, useThemeColors } from '@/theme';\nimport { Spacing, Radius, Typography } from '@/theme/tokens';";
const BACKUP_DIR = path.join(process.cwd(), '.backup');

// Mapeamento de cores para tokens
const COLOR_MAPPINGS = {
  // Text colors
  '#FFFFFF': 'colors.text.inverse',
  '#FFF': 'colors.text.inverse',
  white: 'colors.text.inverse',
  '#000000': 'colors.text.primary',
  '#000': 'colors.text.primary',
  black: 'colors.text.primary',
  '#666666': 'colors.text.secondary',
  '#666': 'colors.text.secondary',
  '#999999': 'colors.text.tertiary',
  '#999': 'colors.text.tertiary',

  // Background colors
  '#F5F5F5': 'colors.background.secondary',
  '#E8E8E8': 'colors.background.tertiary',
  '#E5E5E5': 'colors.background.tertiary',
  '#333333': 'colors.background.inverse',
  '#333': 'colors.background.inverse',

  // Brand colors (aproximações)
  '#FF6B9D': 'colors.brand.primary',
  '#FFA8CC': 'colors.brand.light',
  '#FF1744': 'colors.error.main',
  '#4CAF50': 'colors.success.main',
  '#2196F3': 'colors.info.main',

  // Primary colors (Ocean Blue)
  '#004E9A': 'colors.primary.main',
  '#60A5FA': 'colors.primary.light',
  '#1E40AF': 'colors.primary.dark',

  // Secondary colors (Coral)
  '#D93025': 'colors.secondary.main',
  '#F87171': 'colors.secondary.light',
  '#DC2626': 'colors.secondary.dark',
};

// Mapeamento de espaçamentos
const SPACING_MAPPINGS = {
  0: 'Spacing["0"]',
  1: 'Spacing["px"]',
  2: 'Spacing["0.5"]',
  4: 'Spacing["1"]',
  6: 'Spacing["1.5"]',
  8: 'Spacing["2"]',
  10: 'Spacing["2.5"]',
  12: 'Spacing["3"]',
  14: 'Spacing["3.5"]',
  16: 'Spacing["4"]',
  20: 'Spacing["5"]',
  24: 'Spacing["6"]',
  28: 'Spacing["7"]',
  32: 'Spacing["8"]',
  36: 'Spacing["9"]',
  40: 'Spacing["10"]',
  44: 'Spacing["11"]',
  48: 'Spacing["12"]',
};

// Mapeamento de font sizes
const FONT_SIZE_MAPPINGS = {
  10: 'Typography.sizes["3xs"]',
  11: 'Typography.sizes["2xs"]',
  12: 'Typography.sizes.xs',
  14: 'Typography.sizes.sm',
  16: 'Typography.sizes.md',
  18: 'Typography.sizes.lg',
  20: 'Typography.sizes.xl',
  24: 'Typography.sizes["2xl"]',
  28: 'Typography.sizes["3xl"]',
  32: 'Typography.sizes["4xl"]',
  36: 'Typography.sizes["5xl"]',
  42: 'Typography.sizes["6xl"]',
  48: 'Typography.sizes["7xl"]',
};

// Mapeamento de font weights
const FONT_WEIGHT_MAPPINGS = {
  400: 'Typography.weights.regular',
  500: 'Typography.weights.medium',
  600: 'Typography.weights.semibold',
  700: 'Typography.weights.bold',
  normal: 'Typography.weights.regular',
  bold: 'Typography.weights.bold',
};

// Mapeamento de border radius
const RADIUS_MAPPINGS = {
  4: 'Radius.sm',
  8: 'Radius.md',
  12: 'Radius.lg',
  16: 'Radius.xl',
  20: 'Radius["2xl"]',
  22: 'Radius["2.5xl"]',
  24: 'Radius["3xl"]',
  999: 'Radius.full',
  9999: 'Radius.full',
};

// ======================
// FUNÇÕES AUXILIARES
// ======================

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    file: null,
    mode: 'single', // 'single' | 'batch'
    confidence: 'high', // 'high' | 'medium' | 'low'
    dryRun: false,
    verbose: false,
  };

  args.forEach((arg) => {
    if (arg.startsWith('--file=')) {
      options.file = arg.split('=')[1];
    } else if (arg.startsWith('--mode=')) {
      options.mode = arg.split('=')[1];
    } else if (arg.startsWith('--confidence=')) {
      options.confidence = arg.split('=')[1];
    } else if (arg === '--dry-run') {
      options.dryRun = true;
    } else if (arg === '--verbose' || arg === '-v') {
      options.verbose = true;
    }
  });

  return options;
}

function log(message, level = 'info') {
  if (level === 'error') {
    console.error(`❌ ${message}`);
  } else if (level === 'warn') {
    console.error(`⚠️  ${message}`);
  } else if (level === 'success') {
    console.error(`✅ ${message}`);
  } else {
    console.error(message);
  }
}

function ensureBackupDir() {
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  }
}

function createBackup(filePath) {
  ensureBackupDir();
  const fileName = path.basename(filePath);
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = path.join(BACKUP_DIR, `${fileName}.${timestamp}.backup`);
  fs.copyFileSync(filePath, backupPath);
  return backupPath;
}

// ======================
// DETECÇÃO DE VIOLAÇÕES
// ======================

function detectColorViolations(content) {
  const violations = [];

  // Padrões para cores hardcoded
  const colorPatterns = [
    // Hex colors: #FFFFFF, #FFF
    /(['"])(#[0-9A-Fa-f]{3,6})\1/g,
    // Named colors: white, black
    /\b(color|backgroundColor|borderColor|shadowColor)\s*:\s*['"](white|black)['"]/g,
    // RGB/RGBA
    /\b(color|backgroundColor|borderColor|shadowColor)\s*:\s*['"]?rgba?\([^)]+\)['"]?/g,
  ];

  const lines = content.split('\n');
  lines.forEach((line, index) => {
    // Verificar hex colors
    const hexMatches = line.matchAll(/(['"])(#[0-9A-Fa-f]{3,6})\1/g);
    for (const match of hexMatches) {
      const color = match[2];
      if (COLOR_MAPPINGS[color] || COLOR_MAPPINGS[color.toUpperCase()]) {
        violations.push({
          line: index + 1,
          type: 'color',
          original: match[0],
          value: color,
          replacement: COLOR_MAPPINGS[color] || COLOR_MAPPINGS[color.toUpperCase()],
        });
      }
    }

    // Verificar named colors
    const namedMatch = line.match(
      /\b(color|backgroundColor|borderColor|shadowColor)\s*:\s*['"](white|black)['"]/
    );
    if (namedMatch) {
      const colorName = namedMatch[2];
      if (COLOR_MAPPINGS[colorName]) {
        violations.push({
          line: index + 1,
          type: 'color',
          original: namedMatch[0],
          value: colorName,
          replacement: COLOR_MAPPINGS[colorName],
        });
      }
    }
  });

  return violations;
}

function detectSpacingViolations(content) {
  const violations = [];

  const spacingPattern =
    /\b(padding|margin|gap|top|bottom|left|right|width|height|minWidth|minHeight|maxWidth|maxHeight)\s*:\s*(\d+)/g;
  const lines = content.split('\n');

  lines.forEach((line, index) => {
    // Ignorar comentários e strings
    if (line.trim().startsWith('//') || line.includes('/*')) return;

    const matches = line.matchAll(spacingPattern);
    for (const match of matches) {
      const prop = match[1];
      const value = parseInt(match[2], 10);

      // Apenas valores que têm mapeamento
      if (SPACING_MAPPINGS[value] && (prop === 'padding' || prop === 'margin' || prop === 'gap')) {
        violations.push({
          line: index + 1,
          type: 'spacing',
          original: match[0],
          property: prop,
          value: value,
          replacement: `${prop}: ${SPACING_MAPPINGS[value]}`,
        });
      }
    }
  });

  return violations;
}

function detectTypographyViolations(content) {
  const violations = [];

  const lines = content.split('\n');

  lines.forEach((line, index) => {
    // Font size
    const fontSizeMatch = line.match(/fontSize\s*:\s*(\d+)/);
    if (fontSizeMatch) {
      const size = parseInt(fontSizeMatch[1], 10);
      if (FONT_SIZE_MAPPINGS[size]) {
        violations.push({
          line: index + 1,
          type: 'fontSize',
          original: fontSizeMatch[0],
          value: size,
          replacement: `fontSize: ${FONT_SIZE_MAPPINGS[size]}`,
        });
      }
    }

    // Font weight
    const fontWeightMatch = line.match(/fontWeight\s*:\s*['"]?(\d+|normal|bold)['"]?/);
    if (fontWeightMatch) {
      const weight = fontWeightMatch[1];
      if (FONT_WEIGHT_MAPPINGS[weight]) {
        violations.push({
          line: index + 1,
          type: 'fontWeight',
          original: fontWeightMatch[0],
          value: weight,
          replacement: `fontWeight: ${FONT_WEIGHT_MAPPINGS[weight]}`,
        });
      }
    }

    // Line height
    const lineHeightMatch = line.match(/lineHeight\s*:\s*(\d+(?:\.\d+)?)/);
    if (lineHeightMatch) {
      const height = parseFloat(lineHeightMatch[1]);
      // Mapear valores comuns
      if (height === 1.5) {
        violations.push({
          line: index + 1,
          type: 'lineHeight',
          original: lineHeightMatch[0],
          value: height,
          replacement: 'lineHeight: Typography.lineHeights.normal',
        });
      } else if (height === 1.25) {
        violations.push({
          line: index + 1,
          type: 'lineHeight',
          original: lineHeightMatch[0],
          value: height,
          replacement: 'lineHeight: Typography.lineHeights.tight',
        });
      }
    }
  });

  return violations;
}

function detectRadiusViolations(content) {
  const violations = [];

  const radiusPattern = /borderRadius\s*:\s*(\d+)/g;
  const lines = content.split('\n');

  lines.forEach((line, index) => {
    const matches = line.matchAll(radiusPattern);
    for (const match of matches) {
      const value = parseInt(match[1], 10);
      if (RADIUS_MAPPINGS[value]) {
        violations.push({
          line: index + 1,
          type: 'borderRadius',
          original: match[0],
          value: value,
          replacement: `borderRadius: ${RADIUS_MAPPINGS[value]}`,
        });
      }
    }
  });

  return violations;
}

// ======================
// APLICAÇÃO DE CORREÇÕES
// ======================

function applyFixes(content, violations, options) {
  let fixedContent = content;
  const lines = fixedContent.split('\n');
  const appliedFixes = [];

  // Ordenar violações por linha (decrescente) para não quebrar índices
  violations.sort((a, b) => b.line - a.line);

  violations.forEach((violation) => {
    const lineIndex = violation.line - 1;
    const originalLine = lines[lineIndex];

    if (!originalLine) return;

    let newLine = originalLine;

    if (violation.type === 'color') {
      // Substituir cor hardcoded
      const colorPattern = new RegExp(violation.value.replace('#', '\\#'), 'gi');
      newLine = newLine.replace(colorPattern, (match) => {
        // Verificar se está dentro de uma string
        if (match === violation.value || match === violation.value.toUpperCase()) {
          // Substituir por token, mas precisamos do contexto
          // Se for em uma prop de style, usar colors
          if (originalLine.includes('color:') || originalLine.includes('backgroundColor:')) {
            return `{${violation.replacement}}`; // Será ajustado depois
          }
          return violation.replacement;
        }
        return match;
      });

      // Ajustar para formato correto
      if (newLine.includes(`{${violation.replacement}}`)) {
        newLine = newLine.replace(`{${violation.replacement}}`, violation.replacement);
      }

      // Se a linha tem color: ou backgroundColor:, substituir o valor
      newLine = newLine.replace(
        new RegExp(`(['"])${violation.value}\\1`, 'gi'),
        violation.replacement
      );
    } else {
      // Substituir diretamente
      newLine = newLine.replace(violation.original, violation.replacement);
    }

    if (newLine !== originalLine) {
      lines[lineIndex] = newLine;
      appliedFixes.push({
        line: violation.line,
        type: violation.type,
        original: violation.original.trim(),
        fixed: violation.replacement,
      });
    }
  });

  fixedContent = lines.join('\n');

  // Adicionar imports se necessário
  if (
    appliedFixes.length > 0 &&
    !fixedContent.includes("from '@/theme'") &&
    !fixedContent.includes("from '@/theme/tokens'")
  ) {
    // Encontrar última linha de import
    const importLines = fixedContent.split('\n');
    let lastImportIndex = -1;

    for (let i = 0; i < importLines.length; i++) {
      if (importLines[i].trim().startsWith('import ')) {
        lastImportIndex = i;
      } else if (lastImportIndex >= 0 && importLines[i].trim() === '') {
        break;
      }
    }

    // Adicionar imports após último import
    const importsToAdd =
      "import { useThemeColors } from '@/theme';\nimport { Spacing, Radius, Typography } from '@/theme/tokens';";

    if (lastImportIndex >= 0) {
      importLines.splice(lastImportIndex + 1, 0, importsToAdd);
    } else {
      importLines.unshift(importsToAdd);
    }

    fixedContent = importLines.join('\n');
  }

  return { fixedContent, appliedFixes };
}

// ======================
// CHAMADA AO MCP
// ======================

async function detectIssuesViaMCP(filePath) {
  return new Promise((resolve, reject) => {
    const runnerPath = path.join(__dirname, '../../src/mcp/runners/design-tokens-runner.js');

    if (!fs.existsSync(runnerPath)) {
      reject(new Error('MCP runner não encontrado'));
      return;
    }

    const child = spawn('node', [runnerPath], {
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    const request = {
      jsonrpc: '2.0',
      id: `detect-${Date.now()}`,
      method: 'design.validate',
      params: { filePath },
    };

    let output = '';
    let errorOutput = '';

    const timeout = setTimeout(() => {
      child.kill();
      reject(new Error('Timeout ao chamar MCP'));
    }, 10000);

    child.stdout.on('data', (data) => {
      output += data.toString();
      try {
        const lines = output.split('\n').filter((l) => l.trim());
        for (const line of lines) {
          const response = JSON.parse(line);
          if (response.id === request.id) {
            clearTimeout(timeout);
            child.kill();
            if (response.error) {
              reject(new Error(response.error.message));
            } else {
              resolve(response.result);
            }
            return;
          }
        }
      } catch (e) {
        // Continuar acumulando
      }
    });

    child.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    child.on('error', (error) => {
      clearTimeout(timeout);
      reject(error);
    });

    child.stdin.write(JSON.stringify(request) + '\n');
  });
}

// ======================
// MAIN
// ======================

async function fixFile(filePath, options) {
  const fullPath = path.isAbsolute(filePath) ? filePath : path.join(process.cwd(), filePath);

  if (!fs.existsSync(fullPath)) {
    log(`Arquivo não encontrado: ${fullPath}`, 'error');
    return { success: false, error: 'File not found' };
  }

  if (!fullPath.endsWith('.tsx') && !fullPath.endsWith('.ts')) {
    log(`Arquivo não é TypeScript: ${fullPath}`, 'warn');
    return { success: false, error: 'Not a TypeScript file' };
  }

  log(`\n🔍 Analisando: ${fullPath}`, 'info');

  // Ler arquivo
  const content = fs.readFileSync(fullPath, 'utf-8');

  // Detectar violações
  const colorViolations = detectColorViolations(content);
  const spacingViolations = detectSpacingViolations(content);
  const typographyViolations = detectTypographyViolations(content);
  const radiusViolations = detectRadiusViolations(content);

  const allViolations = [
    ...colorViolations,
    ...spacingViolations,
    ...typographyViolations,
    ...radiusViolations,
  ];

  if (allViolations.length === 0) {
    log(`✅ Nenhuma violação encontrada em ${fullPath}`, 'success');
    return { success: true, fixes: 0 };
  }

  log(`📊 Encontradas ${allViolations.length} violações:`, 'info');
  log(`   - Cores: ${colorViolations.length}`, 'info');
  log(`   - Espaçamentos: ${spacingViolations.length}`, 'info');
  log(`   - Tipografia: ${typographyViolations.length}`, 'info');
  log(`   - Border Radius: ${radiusViolations.length}`, 'info');

  // Aplicar correções
  const { fixedContent, appliedFixes } = applyFixes(content, allViolations, options);

  if (appliedFixes.length === 0) {
    log(`⚠️  Nenhuma correção aplicada (possível conflito)`, 'warn');
    return { success: false, fixes: 0 };
  }

  log(`\n🔧 Aplicando ${appliedFixes.length} correções...`, 'info');

  if (options.verbose) {
    appliedFixes.forEach((fix) => {
      log(`   Linha ${fix.line}: ${fix.type}`, 'info');
      log(`      ${fix.original} → ${fix.fixed}`, 'info');
    });
  }

  if (options.dryRun) {
    log(`\n🔍 DRY RUN - Nenhuma mudança foi aplicada`, 'warn');
    log(`\n📝 Preview das mudanças:`, 'info');
    log('─'.repeat(60), 'info');
    console.log(fixedContent);
    log('─'.repeat(60), 'info');
    return { success: true, fixes: appliedFixes.length, dryRun: true };
  }

  // Criar backup
  const backupPath = createBackup(fullPath);
  log(`💾 Backup criado: ${backupPath}`, 'info');

  // Salvar arquivo corrigido
  fs.writeFileSync(fullPath, fixedContent, 'utf-8');
  log(`✅ Arquivo corrigido: ${fullPath}`, 'success');
  log(`   ${appliedFixes.length} correções aplicadas`, 'success');

  return {
    success: true,
    fixes: appliedFixes.length,
    backupPath,
    appliedFixes,
  };
}

async function main() {
  const options = parseArgs();

  if (!options.file && options.mode !== 'batch') {
    log('Uso: node design-tokens-fixer.js --file=<path> [--dry-run] [--verbose]', 'error');
    log('     node design-tokens-fixer.js --mode=batch [--confidence=high] [--dry-run]', 'error');
    process.exit(1);
  }

  if (options.mode === 'batch') {
    // Modo batch: processar todos os arquivos .tsx e .ts em src/
    log('🔄 Modo batch: processando todos os arquivos...', 'info');

    const srcDir = path.join(process.cwd(), 'src');
    if (!fs.existsSync(srcDir)) {
      log(`Diretório src/ não encontrado`, 'error');
      process.exit(1);
    }

    function getAllFiles(dir, fileList = []) {
      const files = fs.readdirSync(dir);
      files.forEach((file) => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
          const dirName = path.basename(filePath);
          if (!['node_modules', '.expo', 'dist', 'build', '__tests__'].includes(dirName)) {
            getAllFiles(filePath, fileList);
          }
        } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
          fileList.push(filePath);
        }
      });
      return fileList;
    }

    const allFiles = getAllFiles(srcDir);
    log(`📁 Encontrados ${allFiles.length} arquivos TypeScript`, 'info');

    let totalFixes = 0;
    let successCount = 0;

    for (const file of allFiles) {
      const relativePath = path.relative(process.cwd(), file);
      try {
        const result = await fixFile(relativePath, options);
        if (result.success) {
          successCount++;
          totalFixes += result.fixes || 0;
        }
      } catch (error) {
        log(`Erro ao processar ${relativePath}: ${error.message}`, 'error');
      }
    }

    log(`\n📊 Resumo:`, 'info');
    log(`   ✅ ${successCount}/${allFiles.length} arquivos processados`, 'success');
    log(`   🔧 ${totalFixes} correções aplicadas no total`, 'success');
  } else {
    // Modo single file
    const result = await fixFile(options.file, options);
    if (!result.success) {
      process.exit(1);
    }
  }
}

main().catch((error) => {
  log(`Erro fatal: ${error.message}`, 'error');
  if (error.stack) {
    console.error(error.stack);
  }
  process.exit(1);
});
