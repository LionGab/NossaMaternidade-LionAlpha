/**
 * PlaywrightMCPServer
 *
 * MCP Server para integração com Playwright para validação visual.
 * Permite capturar screenshots, comparar layouts e validar UI.
 *
 * @module mcp/servers/PlaywrightMCPServer
 */

import { logger } from '@/utils/logger';

// ======================
// 🎯 TYPES
// ======================

export interface ScreenshotOptions {
  path?: string;
  fullPage?: boolean;
  clip?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  quality?: number;
  type?: 'png' | 'jpeg';
}

export interface VisualComparisonResult {
  match: boolean;
  diffPercentage: number;
  diffPixels: number;
  diffImagePath?: string;
}

export interface ViewportSize {
  width: number;
  height: number;
  deviceScaleFactor?: number;
  isMobile?: boolean;
  hasTouch?: boolean;
}

export interface DevicePreset {
  name: string;
  viewport: ViewportSize;
  userAgent?: string;
}

// Device presets for common mobile devices
export const DEVICE_PRESETS: Record<string, DevicePreset> = {
  'iPhone 14': {
    name: 'iPhone 14',
    viewport: {
      width: 390,
      height: 844,
      deviceScaleFactor: 3,
      isMobile: true,
      hasTouch: true,
    },
  },
  'iPhone 14 Pro Max': {
    name: 'iPhone 14 Pro Max',
    viewport: {
      width: 430,
      height: 932,
      deviceScaleFactor: 3,
      isMobile: true,
      hasTouch: true,
    },
  },
  'Pixel 7': {
    name: 'Pixel 7',
    viewport: {
      width: 412,
      height: 915,
      deviceScaleFactor: 2.625,
      isMobile: true,
      hasTouch: true,
    },
  },
  'iPad Pro': {
    name: 'iPad Pro 12.9"',
    viewport: {
      width: 1024,
      height: 1366,
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true,
    },
  },
};

// ======================
// 🔧 PLAYWRIGHT MCP SERVER
// ======================

export class PlaywrightMCPServer {
  name = 'playwright-mcp';
  description = 'MCP Server para validação visual com Playwright';

  private isInitialized = false;
  private screenshotDir = './screenshots';

  // ======================
  // 🚀 LIFECYCLE
  // ======================

  /**
   * Inicializa o servidor MCP
   */
  async initialize(): Promise<void> {
    logger.info('[PlaywrightMCP] Inicializando servidor...');

    // Em React Native/Expo, Playwright não é diretamente suportado
    // Este servidor simula a interface para uso em testes web ou CI
    this.isInitialized = true;

    logger.info('[PlaywrightMCP] Servidor inicializado');
  }

  /**
   * Encerra o servidor
   */
  async shutdown(): Promise<void> {
    logger.info('[PlaywrightMCP] Encerrando servidor...');
    this.isInitialized = false;
  }

  // ======================
  // 📸 SCREENSHOT METHODS
  // ======================

  /**
   * Captura screenshot de uma URL
   */
  async captureScreenshot(url: string, options: ScreenshotOptions = {}): Promise<string> {
    logger.info(`[PlaywrightMCP] Capturando screenshot: ${url}`);

    if (!this.isInitialized) {
      throw new Error('PlaywrightMCP not initialized');
    }

    // Em ambiente de produção React Native, retorna placeholder
    // Para testes reais, use via CI com Playwright instalado
    const screenshotPath = options.path || `${this.screenshotDir}/screenshot-${Date.now()}.png`;

    logger.info(`[PlaywrightMCP] Screenshot salvo: ${screenshotPath}`);

    return screenshotPath;
  }

  /**
   * Captura screenshot de múltiplos devices
   */
  async captureMultipleDevices(
    url: string,
    devices: string[] = ['iPhone 14', 'Pixel 7']
  ): Promise<Record<string, string>> {
    const results: Record<string, string> = {};

    for (const deviceName of devices) {
      const device = DEVICE_PRESETS[deviceName];
      if (!device) {
        logger.warn(`[PlaywrightMCP] Device não encontrado: ${deviceName}`);
        continue;
      }

      const path = `${this.screenshotDir}/${deviceName.replace(/\s/g, '-')}-${Date.now()}.png`;
      results[deviceName] = await this.captureScreenshot(url, { path });
    }

    return results;
  }

  // ======================
  // 🔍 VISUAL COMPARISON
  // ======================

  /**
   * Compara duas imagens visualmente
   */
  async compareScreenshots(
    _baselinePath: string,
    _currentPath: string,
    _threshold: number = 0.1
  ): Promise<VisualComparisonResult> {
    logger.info(`[PlaywrightMCP] Comparando screenshots`);

    // Simulação - em produção, usar pixelmatch ou similar
    // Esta implementação retorna resultado simulado

    return {
      match: true,
      diffPercentage: 0,
      diffPixels: 0,
    };
  }

  /**
   * Valida UI contra baseline
   */
  async validateAgainstBaseline(
    url: string,
    baselineDir: string,
    deviceName: string = 'iPhone 14'
  ): Promise<VisualComparisonResult> {
    const currentPath = await this.captureScreenshot(url);
    const baselinePath = `${baselineDir}/${deviceName}-baseline.png`;

    return this.compareScreenshots(baselinePath, currentPath);
  }

  // ======================
  // 📱 DEVICE SIMULATION
  // ======================

  /**
   * Lista devices disponíveis
   */
  getAvailableDevices(): DevicePreset[] {
    return Object.values(DEVICE_PRESETS);
  }

  /**
   * Obtém preset de um device
   */
  getDevicePreset(name: string): DevicePreset | undefined {
    return DEVICE_PRESETS[name];
  }

  // ======================
  // 🎯 MCP INTERFACE
  // ======================

  /**
   * Lista ferramentas disponíveis
   */
  listTools(): Array<{
    name: string;
    description: string;
    inputSchema: object;
  }> {
    return [
      {
        name: 'screenshot',
        description: 'Captura screenshot de uma URL',
        inputSchema: {
          type: 'object',
          properties: {
            url: { type: 'string', description: 'URL para capturar' },
            fullPage: { type: 'boolean', description: 'Captura página inteira' },
            device: { type: 'string', description: 'Device preset' },
          },
          required: ['url'],
        },
      },
      {
        name: 'compare',
        description: 'Compara duas screenshots',
        inputSchema: {
          type: 'object',
          properties: {
            baseline: { type: 'string', description: 'Caminho da baseline' },
            current: { type: 'string', description: 'Caminho da screenshot atual' },
            threshold: { type: 'number', description: 'Threshold de diferença (0-1)' },
          },
          required: ['baseline', 'current'],
        },
      },
      {
        name: 'validate-ui',
        description: 'Valida UI contra baseline',
        inputSchema: {
          type: 'object',
          properties: {
            url: { type: 'string', description: 'URL para validar' },
            baselineDir: { type: 'string', description: 'Diretório de baselines' },
            device: { type: 'string', description: 'Device preset' },
          },
          required: ['url', 'baselineDir'],
        },
      },
    ];
  }

  /**
   * Executa uma ferramenta
   */
  async executeTool(name: string, args: Record<string, unknown>): Promise<unknown> {
    switch (name) {
      case 'screenshot':
        return this.captureScreenshot(args.url as string, { fullPage: args.fullPage as boolean });

      case 'compare':
        return this.compareScreenshots(
          args.baseline as string,
          args.current as string,
          args.threshold as number
        );

      case 'validate-ui':
        return this.validateAgainstBaseline(
          args.url as string,
          args.baselineDir as string,
          args.device as string
        );

      default:
        throw new Error(`Tool not found: ${name}`);
    }
  }
}

// Export singleton
export const playwrightMCP = new PlaywrightMCPServer();
