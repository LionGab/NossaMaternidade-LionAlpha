#!/usr/bin/env ts-node
/**
 * Script de Preparação de Assets iOS/Android
 * Valida e prepara assets para deploy
 *
 * Uso: npm run prepare:assets
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

interface AssetCheck {
  name: string;
  path: string;
  required: boolean;
  status: 'pass' | 'fail' | 'warning';
  message: string;
}

const checks: AssetCheck[] = [];

// ======================
// ASSET VALIDATION
// ======================

/**
 * Valida se um arquivo existe e tem tamanho correto
 */
function validateAsset(assetPath: string, required: boolean, minSize?: number): AssetCheck {
  const exists = fs.existsSync(assetPath);
  const name = path.basename(assetPath);

  if (!exists) {
    return {
      name,
      path: assetPath,
      required,
      status: required ? 'fail' : 'warning',
      message: required
        ? `Asset obrigatório não encontrado: ${assetPath}`
        : `Asset opcional não encontrado: ${assetPath}`,
    };
  }

  if (minSize) {
    const stats = fs.statSync(assetPath);
    if (stats.size < minSize) {
      return {
        name,
        path: assetPath,
        required,
        status: 'warning',
        message: `Asset muito pequeno: ${stats.size} bytes (mínimo esperado: ${minSize} bytes)`,
      };
    }
  }

  return {
    name,
    path: assetPath,
    required,
    status: 'pass',
    message: `Asset encontrado: ${assetPath}`,
  };
}

/**
 * Valida assets iOS
 */
function validateIOSAssets(): void {
  const assetsDir = path.join(process.cwd(), 'assets');

  checks.push(
    validateAsset(
      path.join(assetsDir, 'icon.png'),
      true,
      10000 // Mínimo 10KB
    )
  );

  checks.push(validateAsset(path.join(assetsDir, 'splash.png'), true, 10000));

  checks.push(
    validateAsset(
      path.join(assetsDir, 'adaptive-icon.png'),
      false, // Opcional para iOS
      10000
    )
  );
}

/**
 * Valida assets Android
 */
function validateAndroidAssets(): void {
  const assetsDir = path.join(process.cwd(), 'assets');

  checks.push(validateAsset(path.join(assetsDir, 'icon.png'), true, 10000));

  checks.push(
    validateAsset(
      path.join(assetsDir, 'adaptive-icon.png'),
      true, // Obrigatório para Android
      10000
    )
  );

  checks.push(validateAsset(path.join(assetsDir, 'splash.png'), true, 10000));
}

/**
 * Valida configuração de assets no app.config.js
 */
function validateAssetConfig(): void {
  const configPath = path.join(process.cwd(), 'app.config.js');

  if (!fs.existsSync(configPath)) {
    checks.push({
      name: 'app.config.js',
      path: configPath,
      required: true,
      status: 'fail',
      message: 'app.config.js não encontrado',
    });
    return;
  }

  const config = require(configPath);

  // Verificar iOS
  if (!config.expo?.icon) {
    checks.push({
      name: 'iOS Icon Config',
      path: configPath,
      required: true,
      status: 'fail',
      message: 'iOS icon não configurado em app.config.js',
    });
  }

  // Verificar Android
  if (!config.expo?.android?.icon) {
    checks.push({
      name: 'Android Icon Config',
      path: configPath,
      required: true,
      status: 'fail',
      message: 'Android icon não configurado em app.config.js',
    });
  }

  if (config.expo?.icon && config.expo?.android?.icon) {
    checks.push({
      name: 'Asset Config',
      path: configPath,
      required: true,
      status: 'pass',
      message: 'Assets configurados corretamente em app.config.js',
    });
  }
}

// ======================
// MAIN
// ======================

function runAllChecks(): void {
  console.log('\n🔍 Validando assets iOS/Android...\n');

  validateIOSAssets();
  validateAndroidAssets();
  validateAssetConfig();
}

function generateReport(): void {
  const passed = checks.filter((c) => c.status === 'pass').length;
  const failed = checks.filter((c) => c.status === 'fail').length;
  const warnings = checks.filter((c) => c.status === 'warning').length;

  console.log('═'.repeat(80));
  console.log('📊 RELATÓRIO DE VALIDAÇÃO DE ASSETS');
  console.log('═'.repeat(80));
  console.log(`\n✅ Passou: ${passed}`);
  console.log(`❌ Falhou: ${failed}`);
  console.log(`⚠️  Avisos: ${warnings}\n`);

  checks.forEach((check) => {
    const icon = check.status === 'pass' ? '✅' : check.status === 'fail' ? '❌' : '⚠️';
    console.log(`${icon} ${check.name}: ${check.message}`);
  });

  console.log('\n' + '═'.repeat(80));

  if (failed === 0) {
    console.log('\n✅ Todos os assets obrigatórios estão presentes!\n');
    process.exit(0);
  } else {
    console.log(
      `\n❌ ${failed} asset(s) obrigatório(s) faltando. Corrija antes de fazer deploy.\n`
    );
    process.exit(1);
  }
}

// ======================
// EXECUTE
// ======================

runAllChecks();
generateReport();
