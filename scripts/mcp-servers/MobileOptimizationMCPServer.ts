/**
 * Mobile Optimization MCP Server
 * Valida otimizações React Native e detecta problemas de performance
 */

import * as fs from 'fs';
import * as path from 'path';
import {
  MCPServer,
  MCPRequest,
  MCPResponse,
  createMCPResponse,
  JsonValue,
} from '../../src/mcp/types';
import { logger } from '../../src/utils/logger';

export interface FlatListIssue {
  file: string;
  line: number;
  content: string;
  issue:
    | 'missing_keyExtractor'
    | 'missing_getItemLayout'
    | 'missing_windowSize'
    | 'missing_removeClippedSubviews';
  severity: 'critical' | 'warning' | 'info';
  suggestion: string;
}

export interface MemoIssue {
  file: string;
  line: number;
  component: string;
  issue: 'missing_memo' | 'missing_useMemo' | 'missing_useCallback';
  severity: 'critical' | 'warning' | 'info';
  suggestion: string;
}

export interface ImageIssue {
  file: string;
  line: number;
  content: string;
  issue: 'not_using_fastimage' | 'missing_resize' | 'large_image_url';
  severity: 'critical' | 'warning' | 'info';
  suggestion: string;
}

export interface BundleIssue {
  file: string;
  line: number;
  import: string;
  issue: 'heavy_library' | 'full_import' | 'unused_import';
  severity: 'critical' | 'warning' | 'info';
  suggestion: string;
}

export interface QueryIssue {
  file: string;
  line: number;
  content: string;
  issue: 'n_plus_one' | 'missing_index' | 'inefficient_query';
  severity: 'critical' | 'warning' | 'info';
  suggestion: string;
}

export interface MobileOptimizationResult {
  flatListIssues: FlatListIssue[];
  memoIssues: MemoIssue[];
  imageIssues: ImageIssue[];
  bundleIssues: BundleIssue[];
  queryIssues: QueryIssue[];
  summary: {
    totalIssues: number;
    critical: number;
    warning: number;
    info: number;
  };
}

// Bibliotecas pesadas que devem ser evitadas ou importadas seletivamente
const HEAVY_LIBRARIES = [
  'lodash',
  'moment',
  'date-fns',
  'ramda',
  'rxjs',
  'immutable',
  'axios',
  'jquery',
];

// Padrões para detectar problemas
const FLATLIST_PATTERN = /<FlatList|FlashList/g;
const KEY_EXTRACTOR_PATTERN = /keyExtractor\s*=/;
const GET_ITEM_LAYOUT_PATTERN = /getItemLayout\s*=/;
const WINDOW_SIZE_PATTERN = /windowSize\s*=/;
const REMOVE_CLIPPED_SUBVIEWS_PATTERN = /removeClippedSubviews\s*=/;

const MEMO_PATTERN = /React\.memo|memo\(/;
const USE_CALLBACK_PATTERN = /useCallback\(/;

const IMAGE_PATTERN = /<Image|Image\./;
const FAST_IMAGE_PATTERN = /FastImage|from ['"]react-native-fast-image['"]/;
const IMAGE_RESIZE_PATTERN = /resizeMode|resize/;

const SUPABASE_QUERY_PATTERN = /\.from\(|\.select\(|\.insert\(|\.update\(|\.delete\(/;

function getAllFiles(dir: string, fileList: string[] = []): string[] {
  try {
    const files = fs.readdirSync(dir);

    files.forEach((file) => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        const dirName = path.basename(filePath);
        // Ignorar pastas específicas
        if (
          ![
            'node_modules',
            '.expo',
            'dist',
            'build',
            'android',
            'ios',
            'web-build',
            '__tests__',
          ].includes(dirName)
        ) {
          getAllFiles(filePath, fileList);
        }
      } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
        fileList.push(filePath);
      }
    });
  } catch (error) {
    logger.error(`[MobileOptimizationMCP] Error reading directory ${dir}`, error);
  }

  return fileList;
}

function checkFlatListOptimization(filePath: string): FlatListIssue[] {
  const issues: FlatListIssue[] = [];

  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');

    let inFlatList = false;
    let flatListStartLine = 0;
    let hasKeyExtractor = false;
    let hasGetItemLayout = false;
    let hasWindowSize = false;
    let hasRemoveClippedSubviews = false;

    lines.forEach((line, index) => {
      const lineNumber = index + 1;

      // Detectar início de FlatList
      if (FLATLIST_PATTERN.test(line)) {
        inFlatList = true;
        flatListStartLine = lineNumber;
        hasKeyExtractor = false;
        hasGetItemLayout = false;
        hasWindowSize = false;
        hasRemoveClippedSubviews = false;
      }

      if (inFlatList) {
        // Verificar propriedades
        if (KEY_EXTRACTOR_PATTERN.test(line)) {
          hasKeyExtractor = true;
        }
        if (GET_ITEM_LAYOUT_PATTERN.test(line)) {
          hasGetItemLayout = true;
        }
        if (WINDOW_SIZE_PATTERN.test(line)) {
          hasWindowSize = true;
        }
        if (REMOVE_CLIPPED_SUBVIEWS_PATTERN.test(line)) {
          hasRemoveClippedSubviews = true;
        }

        // Detectar fim de FlatList (fechamento de tag ou componente)
        if (line.includes('/>') || line.includes('</FlatList') || line.includes('</FlashList')) {
          // Validar antes de fechar
          if (!hasKeyExtractor) {
            issues.push({
              file: filePath,
              line: flatListStartLine,
              content: lines[flatListStartLine - 1]?.trim() || '',
              issue: 'missing_keyExtractor',
              severity: 'critical',
              suggestion: 'Adicione keyExtractor para otimizar re-renders',
            });
          }

          if (!hasGetItemLayout && content.includes('renderItem')) {
            issues.push({
              file: filePath,
              line: flatListStartLine,
              content: lines[flatListStartLine - 1]?.trim() || '',
              issue: 'missing_getItemLayout',
              severity: 'warning',
              suggestion:
                'Adicione getItemLayout para itens de altura fixa (melhora scroll performance)',
            });
          }

          if (!hasWindowSize) {
            issues.push({
              file: filePath,
              line: flatListStartLine,
              content: lines[flatListStartLine - 1]?.trim() || '',
              issue: 'missing_windowSize',
              severity: 'info',
              suggestion: 'Considere adicionar windowSize para otimizar renderização (padrão: 21)',
            });
          }

          if (!hasRemoveClippedSubviews) {
            issues.push({
              file: filePath,
              line: flatListStartLine,
              content: lines[flatListStartLine - 1]?.trim() || '',
              issue: 'missing_removeClippedSubviews',
              severity: 'info',
              suggestion:
                'Considere adicionar removeClippedSubviews={true} para melhorar performance',
            });
          }

          inFlatList = false;
        }
      }
    });
  } catch (error) {
    logger.error(`[MobileOptimizationMCP] Error reading file ${filePath}`, error);
  }

  return issues;
}

function checkMemoOptimization(filePath: string): MemoIssue[] {
  const issues: MemoIssue[] = [];

  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');

    // Verificar se arquivo tem renderItem ou componentes de lista
    const hasRenderItem = content.includes('renderItem') || content.includes('renderItem=');
    const hasListComponents = FLATLIST_PATTERN.test(content);

    if (!hasRenderItem && !hasListComponents) {
      return issues; // Não é um arquivo com listas
    }

    // Procurar por componentes que são renderizados em listas mas não têm memo
    lines.forEach((line, index) => {
      const lineNumber = index + 1;

      // Detectar função de componente que pode ser memoizada
      if (
        (line.includes('const ') || line.includes('function ')) &&
        (line.includes('Item') || line.includes('Card') || line.includes('Row')) &&
        !MEMO_PATTERN.test(line) &&
        !line.includes('export default') &&
        !line.trim().startsWith('//')
      ) {
        const componentMatch = line.match(/(?:const|function)\s+(\w+)/);
        if (componentMatch) {
          const componentName = componentMatch[1];
          // Verificar se componente é usado em renderItem
          if (
            content.includes(componentName) &&
            (content.includes('renderItem') || content.includes('map('))
          ) {
            issues.push({
              file: filePath,
              line: lineNumber,
              component: componentName,
              issue: 'missing_memo',
              severity: 'warning',
              suggestion: `Envolva ${componentName} com React.memo() para evitar re-renders desnecessários`,
            });
          }
        }
      }

      // Verificar useCallback para funções passadas como props
      if (
        (line.includes('onPress') || line.includes('onPress=')) &&
        !USE_CALLBACK_PATTERN.test(content) &&
        hasListComponents
      ) {
        issues.push({
          file: filePath,
          line: lineNumber,
          component: 'callback',
          issue: 'missing_useCallback',
          severity: 'info',
          suggestion: 'Considere usar useCallback para funções passadas como props em listas',
        });
      }
    });
  } catch (error) {
    logger.error(`[MobileOptimizationMCP] Error reading file ${filePath}`, error);
  }

  return issues;
}

function checkImageOptimization(filePath: string): ImageIssue[] {
  const issues: ImageIssue[] = [];

  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');

    const hasImage = IMAGE_PATTERN.test(content);

    if (!hasImage) {
      return issues;
    }

    lines.forEach((line, index) => {
      const lineNumber = index + 1;

      // Verificar se está usando Image ao invés de FastImage
      if (
        IMAGE_PATTERN.test(line) &&
        !FAST_IMAGE_PATTERN.test(content) &&
        !line.includes('FastImage')
      ) {
        issues.push({
          file: filePath,
          line: lineNumber,
          content: line.trim(),
          issue: 'not_using_fastimage',
          severity: 'warning',
          suggestion: 'Use FastImage do react-native-fast-image para melhor performance de imagens',
        });
      }

      // Verificar se tem resizeMode configurado
      if (
        IMAGE_PATTERN.test(line) &&
        !IMAGE_RESIZE_PATTERN.test(line) &&
        !line.includes('source')
      ) {
        // Verificar próxima linha também
        const nextLine = lines[index + 1]?.trim() || '';
        if (!IMAGE_RESIZE_PATTERN.test(nextLine)) {
          issues.push({
            file: filePath,
            line: lineNumber,
            content: line.trim(),
            issue: 'missing_resize',
            severity: 'info',
            suggestion: 'Adicione resizeMode para otimizar carregamento de imagens',
          });
        }
      }

      // Verificar URLs de imagens muito grandes (hardcoded)
      if (
        line.includes('http') &&
        (line.includes('.jpg') || line.includes('.png') || line.includes('.jpeg'))
      ) {
        if (line.length > 200) {
          issues.push({
            file: filePath,
            line: lineNumber,
            content: line.trim().substring(0, 100) + '...',
            issue: 'large_image_url',
            severity: 'info',
            suggestion: 'Considere usar CDN ou otimizar URL de imagem',
          });
        }
      }
    });
  } catch (error) {
    logger.error(`[MobileOptimizationMCP] Error reading file ${filePath}`, error);
  }

  return issues;
}

function checkBundleSize(filePath: string): BundleIssue[] {
  const issues: BundleIssue[] = [];

  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');

    lines.forEach((line, index) => {
      const lineNumber = index + 1;

      // Verificar imports de bibliotecas pesadas
      HEAVY_LIBRARIES.forEach((lib) => {
        const importPattern = new RegExp(`from ['"]${lib}['"]|require\\(['"]${lib}['"]\\)`, 'g');
        if (importPattern.test(line)) {
          // Verificar se é import completo (não destructured)
          if (!line.includes('{') || line.includes('*')) {
            issues.push({
              file: filePath,
              line: lineNumber,
              import: lib,
              issue: 'full_import',
              severity: 'warning',
              suggestion: `Importe apenas o que precisa de ${lib} (ex: import { debounce } from '${lib}')`,
            });
          } else {
            issues.push({
              file: filePath,
              line: lineNumber,
              import: lib,
              issue: 'heavy_library',
              severity: 'info',
              suggestion: `Considere alternativas mais leves para ${lib} ou use tree-shaking`,
            });
          }
        }
      });

      // Verificar imports não utilizados (heurística simples)
      if (line.includes('import ') && line.includes('from')) {
        const importMatch = line.match(/import\s+(?:\{([^}]+)\}|(\w+)|.*)\s+from/);
        if (importMatch) {
          const importedItems = importMatch[1] || importMatch[2] || '';
          if (importedItems) {
            const items = importedItems.split(',').map((i) => i.trim().split(' as ')[0].trim());
            items.forEach((item) => {
              // Verificar se item é usado no arquivo (exceto na linha de import)
              const usagePattern = new RegExp(`\\b${item}\\b`, 'g');
              const matches = content.match(usagePattern) || [];
              if (matches.length <= 1) {
                // Apenas aparece no import
                issues.push({
                  file: filePath,
                  line: lineNumber,
                  import: item,
                  issue: 'unused_import',
                  severity: 'info',
                  suggestion: `Remova import não utilizado: ${item}`,
                });
              }
            });
          }
        }
      }
    });
  } catch (error) {
    logger.error(`[MobileOptimizationMCP] Error reading file ${filePath}`, error);
  }

  return issues;
}

function checkSupabaseQueries(filePath: string): QueryIssue[] {
  const issues: QueryIssue[] = [];

  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');

    // Verificar se arquivo usa Supabase
    if (!SUPABASE_QUERY_PATTERN.test(content)) {
      return issues;
    }

    let queryCount = 0;
    let inLoop = false;
    let loopStartLine = 0;

    lines.forEach((line, index) => {
      const lineNumber = index + 1;

      // Detectar loops
      if (line.includes('for (') || line.includes('.map(') || line.includes('.forEach(')) {
        inLoop = true;
        loopStartLine = lineNumber;
        queryCount = 0;
      }

      // Detectar queries Supabase dentro de loops
      if (inLoop && SUPABASE_QUERY_PATTERN.test(line)) {
        queryCount++;
        if (queryCount > 1) {
          issues.push({
            file: filePath,
            line: lineNumber,
            content: line.trim(),
            issue: 'n_plus_one',
            severity: 'critical',
            suggestion:
              'Múltiplas queries dentro de loop detectadas (N+1 problem). Use batch queries ou joins',
          });
        }
      }

      // Detectar fim de loop
      if (inLoop && (line.includes('}') || line.includes(')'))) {
        if (queryCount > 0) {
          issues.push({
            file: filePath,
            line: loopStartLine,
            content: lines[loopStartLine - 1]?.trim() || '',
            issue: 'n_plus_one',
            severity: 'critical',
            suggestion: 'Query dentro de loop detectada. Mova para fora do loop ou use batch query',
          });
        }
        inLoop = false;
      }
    });
  } catch (error) {
    logger.error(`[MobileOptimizationMCP] Error reading file ${filePath}`, error);
  }

  return issues;
}

export class MobileOptimizationMCPServer implements MCPServer {
  name = 'mobile-optimization-mcp';
  version = '1.0.0';
  private initialized = false;

  async initialize(): Promise<void> {
    try {
      this.initialized = true;
      logger.info('[MobileOptimizationMCP] Initialized successfully');
    } catch (error) {
      logger.error('[MobileOptimizationMCP] Initialization failed', error);
      throw error;
    }
  }

  async handleRequest<T = JsonValue>(request: MCPRequest): Promise<MCPResponse<T>> {
    if (!this.initialized) {
      return createMCPResponse(request.id, null, {
        code: 'NOT_INITIALIZED',
        message: 'MCP Server not initialized',
      }) as MCPResponse<T>;
    }

    try {
      const [category, ...rest] = request.method.split('.');
      const action = rest.join('.');

      switch (category) {
        case 'mobile':
          return (await this.handleMobile(request.id, action, request.params)) as MCPResponse<T>;
        default:
          return createMCPResponse(request.id, null, {
            code: 'UNKNOWN_METHOD',
            message: `Unknown method category: ${category}`,
          }) as MCPResponse<T>;
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Internal server error';
      return createMCPResponse(request.id, null, {
        code: 'INTERNAL_ERROR',
        message: errorMessage,
        details:
          error instanceof Error
            ? { message: error.message, stack: error.stack ?? '' }
            : { error: String(error) },
      }) as MCPResponse<T>;
    }
  }

  private async handleMobile(
    id: string,
    action: string,
    params: Record<string, unknown>
  ): Promise<MCPResponse<JsonValue>> {
    switch (action) {
      case 'check.flatlist':
        return await this.checkFlatList(id, params);
      case 'check.memo':
        return await this.checkMemo(id, params);
      case 'check.images':
        return await this.checkImages(id, params);
      case 'analyze.bundle':
        return await this.analyzeBundle(id, params);
      case 'check.queries':
        return await this.checkQueries(id, params);
      case 'analyze.all':
        return await this.analyzeAll(id, params);
      default:
        return createMCPResponse(id, null, {
          code: 'UNKNOWN_ACTION',
          message: `Unknown mobile action: ${action}`,
        });
    }
  }

  private async checkFlatList(
    id: string,
    params: Record<string, unknown>
  ): Promise<MCPResponse<JsonValue>> {
    const filePath = params.filePath as string | undefined;

    if (!filePath) {
      return createMCPResponse(id, null, {
        code: 'MISSING_PARAM',
        message: 'filePath parameter is required',
      });
    }

    const fullPath = path.isAbsolute(filePath) ? filePath : path.join(process.cwd(), filePath);

    if (!fs.existsSync(fullPath)) {
      return createMCPResponse(id, null, {
        code: 'FILE_NOT_FOUND',
        message: `File not found: ${fullPath}`,
      });
    }

    const issues = checkFlatListOptimization(fullPath);
    return createMCPResponse(id, { issues } as unknown as JsonValue);
  }

  private async checkMemo(
    id: string,
    params: Record<string, unknown>
  ): Promise<MCPResponse<JsonValue>> {
    const filePath = params.filePath as string | undefined;

    if (!filePath) {
      return createMCPResponse(id, null, {
        code: 'MISSING_PARAM',
        message: 'filePath parameter is required',
      });
    }

    const fullPath = path.isAbsolute(filePath) ? filePath : path.join(process.cwd(), filePath);

    if (!fs.existsSync(fullPath)) {
      return createMCPResponse(id, null, {
        code: 'FILE_NOT_FOUND',
        message: `File not found: ${fullPath}`,
      });
    }

    const issues = checkMemoOptimization(fullPath);
    return createMCPResponse(id, { issues } as unknown as JsonValue);
  }

  private async checkImages(
    id: string,
    params: Record<string, unknown>
  ): Promise<MCPResponse<JsonValue>> {
    const filePath = params.filePath as string | undefined;

    if (!filePath) {
      return createMCPResponse(id, null, {
        code: 'MISSING_PARAM',
        message: 'filePath parameter is required',
      });
    }

    const fullPath = path.isAbsolute(filePath) ? filePath : path.join(process.cwd(), filePath);

    if (!fs.existsSync(fullPath)) {
      return createMCPResponse(id, null, {
        code: 'FILE_NOT_FOUND',
        message: `File not found: ${fullPath}`,
      });
    }

    const issues = checkImageOptimization(fullPath);
    return createMCPResponse(id, { issues } as unknown as JsonValue);
  }

  private async analyzeBundle(
    id: string,
    params: Record<string, unknown>
  ): Promise<MCPResponse<JsonValue>> {
    const filePath = params.filePath as string | undefined;

    if (!filePath) {
      return createMCPResponse(id, null, {
        code: 'MISSING_PARAM',
        message: 'filePath parameter is required',
      });
    }

    const fullPath = path.isAbsolute(filePath) ? filePath : path.join(process.cwd(), filePath);

    if (!fs.existsSync(fullPath)) {
      return createMCPResponse(id, null, {
        code: 'FILE_NOT_FOUND',
        message: `File not found: ${fullPath}`,
      });
    }

    const issues = checkBundleSize(fullPath);
    return createMCPResponse(id, { issues } as unknown as JsonValue);
  }

  private async checkQueries(
    id: string,
    params: Record<string, unknown>
  ): Promise<MCPResponse<JsonValue>> {
    const filePath = params.filePath as string | undefined;

    if (!filePath) {
      return createMCPResponse(id, null, {
        code: 'MISSING_PARAM',
        message: 'filePath parameter is required',
      });
    }

    const fullPath = path.isAbsolute(filePath) ? filePath : path.join(process.cwd(), filePath);

    if (!fs.existsSync(fullPath)) {
      return createMCPResponse(id, null, {
        code: 'FILE_NOT_FOUND',
        message: `File not found: ${fullPath}`,
      });
    }

    const issues = checkSupabaseQueries(fullPath);
    return createMCPResponse(id, { issues } as unknown as JsonValue);
  }

  private async analyzeAll(
    id: string,
    params: Record<string, unknown>
  ): Promise<MCPResponse<JsonValue>> {
    const filePath = params.filePath as string | undefined;

    if (!filePath) {
      // Analisar todo o projeto
      const srcDir = path.join(process.cwd(), 'src');
      if (!fs.existsSync(srcDir)) {
        return createMCPResponse(id, null, {
          code: 'DIRECTORY_NOT_FOUND',
          message: 'src/ directory not found',
        });
      }

      const allFiles = getAllFiles(srcDir);
      const srcFiles = allFiles.filter((file) => {
        const relativePath = path.relative(process.cwd(), file);
        return (
          !relativePath.includes('__tests__') &&
          !relativePath.includes('.test.') &&
          !relativePath.includes('.spec.')
        );
      });

      const flatListIssues: FlatListIssue[] = [];
      const memoIssues: MemoIssue[] = [];
      const imageIssues: ImageIssue[] = [];
      const bundleIssues: BundleIssue[] = [];
      const queryIssues: QueryIssue[] = [];

      srcFiles.forEach((file) => {
        flatListIssues.push(...checkFlatListOptimization(file));
        memoIssues.push(...checkMemoOptimization(file));
        imageIssues.push(...checkImageOptimization(file));
        bundleIssues.push(...checkBundleSize(file));
        queryIssues.push(...checkSupabaseQueries(file));
      });

      const allIssues = [
        ...flatListIssues,
        ...memoIssues,
        ...imageIssues,
        ...bundleIssues,
        ...queryIssues,
      ];

      const result: MobileOptimizationResult = {
        flatListIssues,
        memoIssues,
        imageIssues,
        bundleIssues,
        queryIssues,
        summary: {
          totalIssues: allIssues.length,
          critical: allIssues.filter((i) => i.severity === 'critical').length,
          warning: allIssues.filter((i) => i.severity === 'warning').length,
          info: allIssues.filter((i) => i.severity === 'info').length,
        },
      };

      return createMCPResponse(id, result as unknown as JsonValue) as MCPResponse<JsonValue>;
    }

    // Analisar arquivo específico
    const fullPath = path.isAbsolute(filePath) ? filePath : path.join(process.cwd(), filePath);

    if (!fs.existsSync(fullPath)) {
      return createMCPResponse(id, null, {
        code: 'FILE_NOT_FOUND',
        message: `File not found: ${fullPath}`,
      });
    }

    const flatListIssues = checkFlatListOptimization(fullPath);
    const memoIssues = checkMemoOptimization(fullPath);
    const imageIssues = checkImageOptimization(fullPath);
    const bundleIssues = checkBundleSize(fullPath);
    const queryIssues = checkSupabaseQueries(fullPath);

    const allIssues = [
      ...flatListIssues,
      ...memoIssues,
      ...imageIssues,
      ...bundleIssues,
      ...queryIssues,
    ];

    const result: MobileOptimizationResult = {
      flatListIssues,
      memoIssues,
      imageIssues,
      bundleIssues,
      queryIssues,
      summary: {
        totalIssues: allIssues.length,
        critical: allIssues.filter((i) => i.severity === 'critical').length,
        warning: allIssues.filter((i) => i.severity === 'warning').length,
        info: allIssues.filter((i) => i.severity === 'info').length,
      },
    };

    return createMCPResponse(id, result as unknown as JsonValue);
  }

  async shutdown(): Promise<void> {
    this.initialized = false;
    logger.info('[MobileOptimizationMCP] Shutdown complete');
  }
}

// Singleton instance
export const mobileOptimizationMCP = new MobileOptimizationMCPServer();
