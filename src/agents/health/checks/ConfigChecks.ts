/**
 * Config Checks
 * Verificações de configuração do projeto
 */

import * as fs from 'fs';
import * as path from 'path';

import { logger } from '../../../utils/logger';
import type { ConfigStatus } from '../types';

export class ConfigChecks {
  private projectRoot: string;

  constructor(projectRoot: string) {
    this.projectRoot = projectRoot;
  }

  /**
   * Verifica todas as configurações do projeto
   */
  async checkAllConfig(): Promise<ConfigStatus> {
    const [polyfills, safeArea, edgeFunction, privacyManifest, edgeToEdge, targetSdk] =
      await Promise.all([
        this.checkPolyfills(),
        this.checkSafeAreaProvider(),
        this.checkEdgeFunction(),
        this.checkPrivacyManifest(),
        this.checkEdgeToEdge(),
        this.checkTargetSdk(),
      ]);

    return {
      polyfills,
      safeArea,
      edgeFunction,
      privacyManifest,
      edgeToEdge,
      targetSdk,
    };
  }

  /**
   * Verifica se polyfills existem e são importados
   */
  private async checkPolyfills(): Promise<boolean> {
    try {
      const polyfillsPath = path.join(this.projectRoot, 'src/polyfills.ts');
      const indexPath = path.join(this.projectRoot, 'index.ts');

      // Verificar se arquivo de polyfills existe
      if (!fs.existsSync(polyfillsPath)) {
        logger.warn('[ConfigChecks] Polyfills file not found');
        return false;
      }

      // Verificar se é importado no index.ts
      if (!fs.existsSync(indexPath)) {
        logger.warn('[ConfigChecks] index.ts not found');
        return false;
      }

      const indexContent = fs.readFileSync(indexPath, 'utf-8');
      const isImportedFirst =
        indexContent.includes("import './src/polyfills'") ||
        indexContent.includes('import "./src/polyfills"') ||
        indexContent.indexOf('polyfills') < indexContent.indexOf('expo');

      return isImportedFirst;
    } catch (error) {
      logger.error('[ConfigChecks] Erro ao verificar polyfills', error);
      return false;
    }
  }

  /**
   * Verifica SafeAreaProvider no App.tsx
   */
  private async checkSafeAreaProvider(): Promise<boolean> {
    try {
      const appPath = path.join(this.projectRoot, 'App.tsx');

      if (!fs.existsSync(appPath)) {
        logger.warn('[ConfigChecks] App.tsx not found');
        return false;
      }

      const content = fs.readFileSync(appPath, 'utf-8');
      const hasSafeAreaImport = content.includes('react-native-safe-area-context');
      const hasSafeAreaProvider = content.includes('<SafeAreaProvider');

      return hasSafeAreaImport && hasSafeAreaProvider;
    } catch (error) {
      logger.error('[ConfigChecks] Erro ao verificar SafeAreaProvider', error);
      return false;
    }
  }

  /**
   * Verifica Edge Function Gemini
   */
  private async checkEdgeFunction(): Promise<boolean> {
    try {
      const edgeFunctionPath = path.join(
        this.projectRoot,
        'supabase/functions/chat-gemini/index.ts'
      );

      if (!fs.existsSync(edgeFunctionPath)) {
        logger.warn('[ConfigChecks] Edge function not found');
        return false;
      }

      const content = fs.readFileSync(edgeFunctionPath, 'utf-8');
      // Verificar se contém código do Gemini
      const hasGeminiCode =
        content.includes('gemini') || content.includes('google') || content.includes('@google');

      return hasGeminiCode;
    } catch (error) {
      logger.error('[ConfigChecks] Erro ao verificar edge function', error);
      return false;
    }
  }

  /**
   * Verifica Privacy Manifest
   */
  private async checkPrivacyManifest(): Promise<boolean> {
    try {
      const appConfigPath = path.join(this.projectRoot, 'app.config.js');

      if (!fs.existsSync(appConfigPath)) {
        logger.warn('[ConfigChecks] app.config.js not found');
        return false;
      }

      const content = fs.readFileSync(appConfigPath, 'utf-8');
      // Verificar se há configuração de privacy manifest para iOS
      const hasPrivacyConfig =
        content.includes('privacyManifests') ||
        content.includes('NSPrivacyAccessedAPI') ||
        content.includes('PrivacyInfo');

      return hasPrivacyConfig;
    } catch (error) {
      logger.error('[ConfigChecks] Erro ao verificar privacy manifest', error);
      return false;
    }
  }

  /**
   * Verifica Edge-to-Edge habilitado
   */
  private async checkEdgeToEdge(): Promise<boolean> {
    try {
      const appConfigPath = path.join(this.projectRoot, 'app.config.js');

      if (!fs.existsSync(appConfigPath)) {
        logger.warn('[ConfigChecks] app.config.js not found');
        return false;
      }

      const content = fs.readFileSync(appConfigPath, 'utf-8');
      // Verificar configuração edge-to-edge para Android
      const hasEdgeToEdge =
        content.includes('edgeToEdge') ||
        content.includes('windowLayoutInDisplayCutoutMode') ||
        content.includes('LAYOUT_IN_DISPLAY_CUTOUT_MODE_SHORT_EDGES');

      return hasEdgeToEdge;
    } catch (error) {
      logger.error('[ConfigChecks] Erro ao verificar edge-to-edge', error);
      return false;
    }
  }

  /**
   * Verifica Target SDK >= 35
   */
  private async checkTargetSdk(): Promise<number> {
    try {
      const appConfigPath = path.join(this.projectRoot, 'app.config.js');

      if (!fs.existsSync(appConfigPath)) {
        logger.warn('[ConfigChecks] app.config.js not found');
        return 0;
      }

      const content = fs.readFileSync(appConfigPath, 'utf-8');

      // Procurar por targetSdkVersion
      const targetSdkMatch = content.match(/targetSdkVersion[:\s]*(\d+)/);
      if (targetSdkMatch && targetSdkMatch[1]) {
        return parseInt(targetSdkMatch[1], 10);
      }

      // Verificar build.gradle se app.config não tiver
      const buildGradlePath = path.join(this.projectRoot, 'android/app/build.gradle');
      if (fs.existsSync(buildGradlePath)) {
        const gradleContent = fs.readFileSync(buildGradlePath, 'utf-8');
        const gradleMatch = gradleContent.match(/targetSdkVersion\s+(\d+)/);
        if (gradleMatch && gradleMatch[1]) {
          return parseInt(gradleMatch[1], 10);
        }
      }

      return 0;
    } catch (error) {
      logger.error('[ConfigChecks] Erro ao verificar target SDK', error);
      return 0;
    }
  }
}
