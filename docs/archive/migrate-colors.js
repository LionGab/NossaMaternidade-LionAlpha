#!/usr/bin/env node

/**
 * Script de Migração de Cores - Rosa → Azul
 *
 * Este script ajuda a migrar referências de cores rosa para azul
 * durante o redesign estilo Airbnb.
 *
 * Uso:
 *   node scripts/migrate-colors.js --dry-run  # Preview das mudanças
 *   node scripts/migrate-colors.js --apply     # Aplicar mudanças
 *
 * @example
 *   // Antes
 *   color: ColorTokens.primary[400]  // #FF7A96 (rosa)
 *
 *   // Depois
 *   color: ColorTokens.primary[500]  // #007AFF (azul)
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Mapeamento de cores rosa → azul
const COLOR_MAPPINGS = {
  // Primary colors
  'primary[400]': 'primary[500]', // #FF7A96 → #007AFF
  'primary.main': 'primary.main', // Já atualizado nos tokens
  'primary.light': 'primary.light',
  'primary.dark': 'primary.dark',

  // Hex colors
  '#FF7A96': '#007AFF', // Rosa principal → Azul iOS
  '#FF6583': '#0066D6', // Rosa médio → Azul médio
  '#EC5975': '#0055B3', // Rosa escuro → Azul escuro

  // Gradients
  "['#FF7A96', '#FF6583', '#EC5975']": "['#007AFF', '#0066D6', '#0055B3']",
};

// Extensões de arquivos para processar
const FILE_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx'];

// Diretórios para ignorar
const IGNORE_DIRS = ['node_modules', '.git', 'dist', 'build', '.expo', 'coverage'];

/**
 * Verifica se o arquivo deve ser processado
 */
function shouldProcessFile(filePath) {
  const ext = path.extname(filePath);
  if (!FILE_EXTENSIONS.includes(ext)) return false;

  const relativePath = path.relative(process.cwd(), filePath);
  return !IGNORE_DIRS.some((dir) => relativePath.includes(dir));
}

/**
 * Encontra todos os arquivos relevantes
 */
function findFiles(dir = 'src', fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      if (!IGNORE_DIRS.includes(file)) {
        findFiles(filePath, fileList);
      }
    } else if (shouldProcessFile(filePath)) {
      fileList.push(filePath);
    }
  });

  return fileList;
}

/**
 * Processa um arquivo e retorna mudanças
 */
function processFile(filePath, dryRun = true) {
  const content = fs.readFileSync(filePath, 'utf8');
  let newContent = content;
  const changes = [];

  // Aplicar mapeamentos
  Object.entries(COLOR_MAPPINGS).forEach(([oldColor, newColor]) => {
    const regex = new RegExp(oldColor.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    const matches = content.match(regex);

    if (matches) {
      changes.push({
        old: oldColor,
        new: newColor,
        count: matches.length,
      });
      newContent = newContent.replace(regex, newColor);
    }
  });

  if (changes.length > 0 && !dryRun) {
    fs.writeFileSync(filePath, newContent, 'utf8');
  }

  return { changes, modified: changes.length > 0 };
}

/**
 * Main function
 */
function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run') || !args.includes('--apply');

  console.log('🔍 Buscando arquivos...\n');

  const files = findFiles();
  console.log(`📁 Encontrados ${files.length} arquivos\n`);

  const results = [];
  let totalChanges = 0;

  files.forEach((file) => {
    const { changes, modified } = processFile(file, dryRun);
    if (modified) {
      results.push({ file, changes });
      totalChanges += changes.reduce((sum, c) => sum + c.count, 0);
    }
  });

  // Relatório
  console.log('📊 RELATÓRIO DE MIGRAÇÃO\n');
  console.log(`Modo: ${dryRun ? '🔍 DRY RUN (preview)' : '✅ APLICAR MUDANÇAS'}\n`);

  if (results.length === 0) {
    console.log('✅ Nenhuma mudança necessária!\n');
    return;
  }

  console.log(`📝 ${results.length} arquivo(s) com mudanças:`);
  console.log(`🔄 ${totalChanges} substituição(ões) total(is)\n`);

  results.forEach(({ file, changes }) => {
    console.log(`\n📄 ${file}`);
    changes.forEach(({ old, new: newColor, count }) => {
      console.log(`   ${old} → ${newColor} (${count}x)`);
    });
  });

  if (dryRun) {
    console.log('\n💡 Para aplicar as mudanças, execute:');
    console.log('   node scripts/migrate-colors.js --apply\n');
  } else {
    console.log('\n✅ Mudanças aplicadas com sucesso!\n');
    console.log('⚠️  IMPORTANTE: Revise as mudanças antes de commitar!\n');
  }
}

// Executar
if (require.main === module) {
  main();
}

module.exports = { processFile, findFiles, COLOR_MAPPINGS };
