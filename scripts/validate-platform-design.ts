#!/usr/bin/env ts-node
/**
 * Script de Validação de Design por Plataforma
 * Valida iOS-specific e Android-specific design patterns
 *
 * Uso: npm run validate:platform
 */

import * as fs from 'fs';
import * as path from 'path';

interface ValidationResult {
  file: string;
  line: number;
  type: 'error' | 'warning';
  message: string;
  platform: 'ios' | 'android' | 'both';
}

const violations: ValidationResult[] = [];

// ======================
// iOS-SPECIFIC VALIDATIONS
// ======================

/**
 * Valida uso de SF Pro fonts (iOS)
 */
function validateIOSFonts(filePath: string, content: string): void {
  // Ignorar arquivos de tokens e adapters (eles definem as fontes)
  if (
    filePath.includes('tokens.ts') ||
    filePath.includes('adapters/') ||
    filePath.includes('platform.ts') ||
    filePath.includes('design-system/')
  ) {
    return;
  }

  content.split('\n').forEach((line, index) => {
    const lineNumber = index + 1;

    // Ignorar comentários e strings
    if (
      line.trim().startsWith('//') ||
      line.trim().startsWith('*') ||
      (line.includes('//') && line.split('//')[0].trim().length === 0)
    ) {
      return;
    }

    // Verificar se está usando fontFamily hardcoded que não seja System ou PlatformFonts
    if (
      line.includes('fontFamily') &&
      !line.includes('System') &&
      !line.includes('PlatformFonts') &&
      !line.includes('getFontFamily') &&
      !line.includes('// TODO') &&
      !line.includes('// DEPRECATED')
    ) {
      violations.push({
        file: filePath,
        line: lineNumber,
        type: 'warning',
        message: 'iOS: Use PlatformFonts ou getFontFamily() em vez de fontFamily hardcoded',
        platform: 'ios',
      });
    }
  });
}

/**
 * Valida safe areas em iOS
 */
function validateIOSSafeAreas(filePath: string, content: string): void {
  let hasSafeArea = false;

  // Verificar se usa SafeAreaView ou SafeAreaContainer
  if (
    content.includes('SafeAreaView') ||
    content.includes('SafeAreaContainer') ||
    content.includes('useSafeAreaInsets')
  ) {
    hasSafeArea = true;
  }

  // Se é uma tela (Screen.tsx) e não tem safe area, avisar
  if (filePath.includes('Screen.tsx') && !hasSafeArea && !filePath.includes('__tests__')) {
    violations.push({
      file: filePath,
      line: 1,
      type: 'warning',
      message: 'iOS: Tela deve usar SafeAreaView ou SafeAreaContainer para respeitar notch',
      platform: 'ios',
    });
  }
}

/**
 * Valida haptic feedback em iOS
 */
function validateIOSHaptics(filePath: string, content: string): void {
  // Ignorar arquivos que não são componentes interativos
  if (
    filePath.includes('.test.') ||
    filePath.includes('.spec.') ||
    filePath.includes('/agents/') ||
    filePath.includes('/services/') ||
    filePath.includes('/utils/') ||
    !filePath.endsWith('.tsx')
  ) {
    return;
  }

  // Verificar se botões interativos têm haptic feedback
  // Apenas em componentes primitivos ou que claramente são interativos
  if (
    filePath.includes('primitives') ||
    filePath.includes('Button') ||
    filePath.includes('Pressable')
  ) {
    if (
      content.includes('onPress') &&
      !content.includes('triggerPlatformHaptic') &&
      !content.includes('PlatformHaptics') &&
      !content.includes('HapticButton') &&
      !content.includes('Button') && // Se já usa Button component, está OK
      !content.includes('// TODO')
    ) {
      violations.push({
        file: filePath,
        line: 1,
        type: 'warning',
        message:
          'iOS: Componentes interativos devem usar triggerPlatformHaptic() para feedback tátil',
        platform: 'ios',
      });
    }
  }
}

// ======================
// ANDROID-SPECIFIC VALIDATIONS
// ======================

/**
 * Valida uso de Roboto fonts (Android)
 */
function validateAndroidFonts(filePath: string, content: string): void {
  const lines = content.split('\n');

  lines.forEach((line, index) => {
    const lineNumber = index + 1;

    // Verificar se está usando fontFamily hardcoded que não seja Roboto ou System
    if (
      line.includes('fontFamily') &&
      !line.includes('Roboto') &&
      !line.includes('System') &&
      !line.includes('PlatformFonts')
    ) {
      violations.push({
        file: filePath,
        line: lineNumber,
        type: 'warning',
        message: 'Android: Use PlatformFonts ou getFontFamily() em vez de fontFamily hardcoded',
        platform: 'android',
      });
    }
  });
}

/**
 * Valida Material Design elevation (Android)
 */
function validateAndroidElevation(filePath: string, content: string): void {
  // Ignorar arquivos de tokens e helpers (eles definem os shadows)
  if (
    filePath.includes('tokens.ts') ||
    filePath.includes('platform.ts') ||
    filePath.includes('shadowHelper.ts') ||
    filePath.includes('adapters/')
  ) {
    return;
  }

  content.split('\n').forEach((line, index) => {
    const lineNumber = index + 1;

    // Ignorar comentários
    if (
      line.trim().startsWith('//') ||
      line.trim().startsWith('*') ||
      (line.includes('//') && line.split('//')[0].trim().length === 0)
    ) {
      return;
    }

    // Verificar se usa shadowColor/shadowOffset em vez de elevation
    // Mas apenas se for um estilo aplicado (não definição)
    if (
      (line.includes('shadowColor') || line.includes('shadowOffset')) &&
      !line.includes('getPlatformShadow') &&
      !line.includes('getIOSShadow') &&
      !line.includes('getAndroidElevation') &&
      !line.includes('// TODO') &&
      (line.includes(':') || line.includes('='))
    ) {
      // É uma atribuição/definição
      violations.push({
        file: filePath,
        line: lineNumber,
        type: 'warning',
        message:
          'Android: Use getPlatformShadow() ou getAndroidElevation() em vez de shadowColor/shadowOffset',
        platform: 'android',
      });
    }
  });
}

/**
 * Valida ripple effect em Android
 */
function validateAndroidRipple(filePath: string, content: string): void {
  // Ignorar arquivos que não são componentes interativos
  if (
    filePath.includes('.test.') ||
    filePath.includes('.spec.') ||
    filePath.includes('/agents/') ||
    filePath.includes('/services/') ||
    filePath.includes('/utils/') ||
    !filePath.endsWith('.tsx')
  ) {
    return;
  }

  // Verificar se Pressable tem android_ripple configurado
  // Apenas em componentes que claramente usam Pressable diretamente
  if (
    content.includes('<Pressable') &&
    !content.includes('android_ripple') &&
    !content.includes('Button') &&
    !content.includes('HapticButton') &&
    !content.includes('// TODO')
  ) {
    violations.push({
      file: filePath,
      line: 1,
      type: 'warning',
      message:
        'Android: Pressable deve ter android_ripple configurado para feedback Material Design',
      platform: 'android',
    });
  }
}

// ======================
// CROSS-PLATFORM VALIDATIONS
// ======================

/**
 * Valida touch targets (WCAG AAA)
 */
function validateTouchTargets(filePath: string, content: string): void {
  const lines = content.split('\n');

  lines.forEach((line, index) => {
    const lineNumber = index + 1;

    // Verificar se tem minHeight/minWidth menor que 44 (iOS) ou 48 (Android)
    const minHeightMatch = line.match(/minHeight:\s*(\d+)/);
    const minWidthMatch = line.match(/minWidth:\s*(\d+)/);

    if (minHeightMatch) {
      const value = parseInt(minHeightMatch[1], 10);
      if (value < 44) {
        violations.push({
          file: filePath,
          line: lineNumber,
          type: 'error',
          message: `Touch target muito pequeno: ${value}pt. Mínimo iOS: 44pt, Android: 48dp`,
          platform: 'both',
        });
      }
    }

    if (minWidthMatch) {
      const value = parseInt(minWidthMatch[1], 10);
      if (value < 44) {
        violations.push({
          file: filePath,
          line: lineNumber,
          type: 'error',
          message: `Touch target muito pequeno: ${value}pt. Mínimo iOS: 44pt, Android: 48dp`,
          platform: 'both',
        });
      }
    }
  });
}

/**
 * Valida Dynamic Type / Text Scaling
 */
function validateTextScaling(filePath: string, content: string): void {
  // Ignorar arquivos que não são componentes React
  if (
    filePath.includes('.test.') ||
    filePath.includes('.spec.') ||
    filePath.includes('/agents/') ||
    filePath.includes('/services/') ||
    filePath.includes('/utils/') ||
    filePath.includes('/constants/') ||
    filePath.includes('/data/') ||
    filePath.includes('/mcp/') ||
    filePath.includes('index.ts') ||
    filePath.includes('types.ts') ||
    !filePath.endsWith('.tsx')
  ) {
    return;
  }

  // Verificar se é um componente que usa Text do React Native
  if (
    content.includes("from 'react-native'") &&
    content.includes('Text') &&
    !content.includes('allowFontScaling') &&
    !content.includes('Text.tsx') &&
    !content.includes('Text as') &&
    !content.includes('Text,') &&
    !content.includes('Text;')
  ) {
    // Verificar se realmente renderiza Text
    if (content.includes('<Text') || content.includes('Text>')) {
      violations.push({
        file: filePath,
        line: 1,
        type: 'warning',
        message:
          'Text components devem ter allowFontScaling para suportar Dynamic Type (iOS) e Text Scaling (Android)',
        platform: 'both',
      });
    }
  }
}

// ======================
// MAIN VALIDATION
// ======================

function validateFiles(): void {
  // Buscar arquivos manualmente (mais confiável que glob)
  function getAllFiles(dir: string, fileList: string[] = []): string[] {
    const files = fs.readdirSync(dir);
    files.forEach((file) => {
      const filePath = path.join(dir, file);
      try {
        const stat = fs.statSync(filePath);
        if (
          stat.isDirectory() &&
          !['node_modules', '__tests__', '.expo', 'dist', 'build'].includes(file)
        ) {
          getAllFiles(filePath, fileList);
        } else if (
          (file.endsWith('.ts') || file.endsWith('.tsx')) &&
          !file.includes('.test.') &&
          !file.includes('.spec.')
        ) {
          fileList.push(filePath);
        }
      } catch {
        // Ignorar erros
      }
    });
    return fileList;
  }

  const srcFiles = getAllFiles(path.join(process.cwd(), 'src'));

  for (const filePath of srcFiles) {
    const content = fs.readFileSync(filePath, 'utf-8');

    // iOS validations
    validateIOSFonts(filePath, content);
    validateIOSSafeAreas(filePath, content);
    validateIOSHaptics(filePath, content);

    // Android validations
    validateAndroidFonts(filePath, content);
    validateAndroidElevation(filePath, content);
    validateAndroidRipple(filePath, content);

    // Cross-platform validations
    validateTouchTargets(filePath, content);
    validateTextScaling(filePath, content);
  }
}

// ======================
// REPORT GENERATION
// ======================

function generateReport(): void {
  const errors = violations.filter((v) => v.type === 'error');
  const warnings = violations.filter((v) => v.type === 'warning');

  console.log('\n📱 Platform Design Validation Report\n');
  console.log(`Total violations: ${violations.length}`);
  console.log(`  Errors: ${errors.length}`);
  console.log(`  Warnings: ${warnings.length}\n`);

  if (errors.length > 0) {
    console.log('❌ ERRORS:\n');
    errors.forEach((v) => {
      console.log(`  ${v.file}:${v.line} [${v.platform.toUpperCase()}]`);
      console.log(`    ${v.message}\n`);
    });
  }

  if (warnings.length > 0) {
    console.log('⚠️  WARNINGS:\n');
    warnings.forEach((v) => {
      console.log(`  ${v.file}:${v.line} [${v.platform.toUpperCase()}]`);
      console.log(`    ${v.message}\n`);
    });
  }

  // Group by platform
  const iosViolations = violations.filter((v) => v.platform === 'ios');
  const androidViolations = violations.filter((v) => v.platform === 'android');
  const bothViolations = violations.filter((v) => v.platform === 'both');

  console.log('\n📊 By Platform:');
  console.log(`  iOS: ${iosViolations.length}`);
  console.log(`  Android: ${androidViolations.length}`);
  console.log(`  Both: ${bothViolations.length}\n`);

  if (errors.length === 0 && warnings.length === 0) {
    console.log('✅ All platform design validations passed!\n');
    process.exit(0);
  } else {
    console.log('❌ Platform design validation failed. Please fix the issues above.\n');
    process.exit(errors.length > 0 ? 1 : 0);
  }
}

// ======================
// EXECUTE
// ======================

validateFiles();
generateReport();
