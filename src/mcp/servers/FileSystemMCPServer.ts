/**
 * FileSystem MCP Server
 * Fornece acesso ao sistema de arquivos do dispositivo via Expo FileSystem
 *
 * Features:
 * - Leitura/escrita de arquivos
 * - Gerenciamento de diretórios
 * - Cache de documentos
 * - Download de arquivos
 */

import * as FileSystem from 'expo-file-system/legacy';

import { logger } from '../../utils/logger';
import { MCPServer, MCPRequest, MCPResponse, createMCPResponse, JsonValue } from '../types';

// ============================================================================
// TYPES
// ============================================================================

export interface FileInfo {
  uri: string;
  name: string;
  size: number;
  modificationTime: number;
  isDirectory: boolean;
  exists: boolean;
}

export interface DirectoryInfo {
  uri: string;
  files: string[];
  totalSize: number;
}

export interface DownloadProgress {
  totalBytesWritten: number;
  totalBytesExpectedToWrite: number;
  percentage: number;
}

// ============================================================================
// FILESYSTEM MCP SERVER
// ============================================================================

export class FileSystemMCPServer implements MCPServer {
  name = 'filesystem-mcp';
  version = '1.0.0';

  private initialized = false;
  private documentDir: string = '';
  private cacheDir: string = '';

  /**
   * Inicializa o servidor e valida diretórios
   */
  async initialize(): Promise<void> {
    try {
      // Validar disponibilidade do FileSystem
      if (!FileSystem.documentDirectory || !FileSystem.cacheDirectory) {
        throw new Error('FileSystem directories not available');
      }

      this.documentDir = FileSystem.documentDirectory;
      this.cacheDir = FileSystem.cacheDirectory;

      // Criar diretório de dados do app se não existir
      const appDataDir = `${this.documentDir}app_data/`;
      const dirInfo = await FileSystem.getInfoAsync(appDataDir);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(appDataDir, { intermediates: true });
      }

      this.initialized = true;
      logger.info('[FileSystemMCP] Initialized successfully', {
        documentDir: this.documentDir,
        cacheDir: this.cacheDir,
      });
    } catch (error) {
      logger.error('[FileSystemMCP] Initialization failed', error);
      throw error;
    }
  }

  /**
   * Processa requests MCP
   */
  async handleRequest<T = JsonValue>(request: MCPRequest): Promise<MCPResponse<T>> {
    if (!this.initialized) {
      return createMCPResponse(request.id, null as T, {
        code: 'NOT_INITIALIZED',
        message: 'FileSystem MCP Server not initialized',
      }) as MCPResponse<T>;
    }

    try {
      const [category, action] = request.method.split('.');

      switch (category) {
        case 'file':
          return (await this.handleFile(request.id, action, request.params)) as MCPResponse<T>;
        case 'dir':
          return (await this.handleDirectory(request.id, action, request.params)) as MCPResponse<T>;
        case 'download':
          return (await this.handleDownload(request.id, action, request.params)) as MCPResponse<T>;
        case 'cache':
          return (await this.handleCache(request.id, action, request.params)) as MCPResponse<T>;
        default:
          return createMCPResponse(request.id, null as T, {
            code: 'UNKNOWN_METHOD',
            message: `Unknown method category: ${category}`,
          }) as MCPResponse<T>;
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Internal server error';
      return createMCPResponse(request.id, null as T, {
        code: 'INTERNAL_ERROR',
        message: errorMessage,
        details:
          error instanceof Error
            ? { message: error.message, stack: error.stack ?? '' }
            : { error: String(error) },
      }) as MCPResponse<T>;
    }
  }

  // ============================================================================
  // FILE OPERATIONS
  // ============================================================================

  private async handleFile(
    id: string,
    action: string,
    params: Record<string, unknown>
  ): Promise<MCPResponse> {
    switch (action) {
      case 'read': {
        const { path, encoding } = params as { path: string; encoding?: 'utf8' | 'base64' };
        const fullPath = this.resolvePath(path);

        const info = await FileSystem.getInfoAsync(fullPath);
        if (!info.exists) {
          return createMCPResponse(id, null, {
            code: 'FILE_NOT_FOUND',
            message: `File not found: ${path}`,
          });
        }

        const content = await FileSystem.readAsStringAsync(fullPath, {
          encoding:
            encoding === 'base64' ? FileSystem.EncodingType.Base64 : FileSystem.EncodingType.UTF8,
        });

        return createMCPResponse(id, {
          path,
          content,
          size: info.size ?? 0,
          modificationTime: info.modificationTime ?? 0,
        });
      }

      case 'write': {
        const { path, content, encoding } = params as {
          path: string;
          content: string;
          encoding?: 'utf8' | 'base64';
        };
        const fullPath = this.resolvePath(path);

        // Criar diretório pai se não existir
        const parentDir = fullPath.substring(0, fullPath.lastIndexOf('/'));
        const parentInfo = await FileSystem.getInfoAsync(parentDir);
        if (!parentInfo.exists) {
          await FileSystem.makeDirectoryAsync(parentDir, { intermediates: true });
        }

        await FileSystem.writeAsStringAsync(fullPath, content, {
          encoding:
            encoding === 'base64' ? FileSystem.EncodingType.Base64 : FileSystem.EncodingType.UTF8,
        });

        const info = await FileSystem.getInfoAsync(fullPath);

        return createMCPResponse(id, {
          success: true,
          path,
          size: info.exists && 'size' in info ? (info.size ?? 0) : 0,
        });
      }

      case 'delete': {
        const { path } = params as { path: string };
        const fullPath = this.resolvePath(path);

        const info = await FileSystem.getInfoAsync(fullPath);
        if (!info.exists) {
          return createMCPResponse(id, null, {
            code: 'FILE_NOT_FOUND',
            message: `File not found: ${path}`,
          });
        }

        await FileSystem.deleteAsync(fullPath, { idempotent: true });

        return createMCPResponse(id, { success: true, path });
      }

      case 'copy': {
        const { from, to } = params as { from: string; to: string };
        const fromPath = this.resolvePath(from);
        const toPath = this.resolvePath(to);

        const info = await FileSystem.getInfoAsync(fromPath);
        if (!info.exists) {
          return createMCPResponse(id, null, {
            code: 'FILE_NOT_FOUND',
            message: `Source file not found: ${from}`,
          });
        }

        await FileSystem.copyAsync({ from: fromPath, to: toPath });

        return createMCPResponse(id, { success: true, from, to });
      }

      case 'move': {
        const { from, to } = params as { from: string; to: string };
        const fromPath = this.resolvePath(from);
        const toPath = this.resolvePath(to);

        const info = await FileSystem.getInfoAsync(fromPath);
        if (!info.exists) {
          return createMCPResponse(id, null, {
            code: 'FILE_NOT_FOUND',
            message: `Source file not found: ${from}`,
          });
        }

        await FileSystem.moveAsync({ from: fromPath, to: toPath });

        return createMCPResponse(id, { success: true, from, to });
      }

      case 'info': {
        const { path } = params as { path: string };
        const fullPath = this.resolvePath(path);

        const info = await FileSystem.getInfoAsync(fullPath);

        const fileInfo: FileInfo = {
          uri: fullPath,
          name: path.split('/').pop() || '',
          size: info.exists && 'size' in info ? (info.size ?? 0) : 0,
          modificationTime:
            info.exists && 'modificationTime' in info ? (info.modificationTime ?? 0) : 0,
          isDirectory: info.exists && 'isDirectory' in info ? (info.isDirectory ?? false) : false,
          exists: info.exists,
        };

        return createMCPResponse(id, fileInfo as unknown as JsonValue);
      }

      case 'exists': {
        const { path } = params as { path: string };
        const fullPath = this.resolvePath(path);

        const info = await FileSystem.getInfoAsync(fullPath);

        return createMCPResponse(id, { exists: info.exists, path });
      }

      default:
        return createMCPResponse(id, null, {
          code: 'UNKNOWN_ACTION',
          message: `Unknown file action: ${action}`,
        });
    }
  }

  // ============================================================================
  // DIRECTORY OPERATIONS
  // ============================================================================

  private async handleDirectory(
    id: string,
    action: string,
    params: Record<string, unknown>
  ): Promise<MCPResponse> {
    switch (action) {
      case 'list': {
        const { path } = params as { path?: string };
        const fullPath = path ? this.resolvePath(path) : this.documentDir;

        const info = await FileSystem.getInfoAsync(fullPath);
        if (!info.exists) {
          return createMCPResponse(id, null, {
            code: 'DIR_NOT_FOUND',
            message: `Directory not found: ${path || 'root'}`,
          });
        }

        const files = await FileSystem.readDirectoryAsync(fullPath);

        return createMCPResponse(id, {
          path: path || 'root',
          files,
          count: files.length,
        });
      }

      case 'create': {
        const { path } = params as { path: string };
        const fullPath = this.resolvePath(path);

        await FileSystem.makeDirectoryAsync(fullPath, { intermediates: true });

        return createMCPResponse(id, { success: true, path });
      }

      case 'delete': {
        const { path } = params as { path: string };
        const fullPath = this.resolvePath(path);

        const info = await FileSystem.getInfoAsync(fullPath);
        if (!info.exists) {
          return createMCPResponse(id, null, {
            code: 'DIR_NOT_FOUND',
            message: `Directory not found: ${path}`,
          });
        }

        await FileSystem.deleteAsync(fullPath, { idempotent: true });

        return createMCPResponse(id, { success: true, path });
      }

      case 'size': {
        const { path } = params as { path?: string };
        const fullPath = path ? this.resolvePath(path) : this.documentDir;

        const totalSize = await this.calculateDirectorySize(fullPath);

        return createMCPResponse(id, {
          path: path || 'root',
          totalSize,
          formattedSize: this.formatBytes(totalSize),
        });
      }

      default:
        return createMCPResponse(id, null, {
          code: 'UNKNOWN_ACTION',
          message: `Unknown directory action: ${action}`,
        });
    }
  }

  // ============================================================================
  // DOWNLOAD OPERATIONS
  // ============================================================================

  private async handleDownload(
    id: string,
    action: string,
    params: Record<string, unknown>
  ): Promise<MCPResponse> {
    switch (action) {
      case 'file': {
        const { url, path, headers } = params as {
          url: string;
          path: string;
          headers?: Record<string, string>;
        };
        const fullPath = this.resolvePath(path);

        const downloadResumable = FileSystem.createDownloadResumable(url, fullPath, { headers });

        const result = await downloadResumable.downloadAsync();

        if (!result) {
          return createMCPResponse(id, null, {
            code: 'DOWNLOAD_FAILED',
            message: 'Download failed or was cancelled',
          });
        }

        return createMCPResponse(id, {
          success: true,
          uri: result.uri,
          status: result.status,
          headers: result.headers,
        });
      }

      case 'resume': {
        const { url, path, savableData } = params as {
          url: string;
          path: string;
          savableData: string;
        };
        const fullPath = this.resolvePath(path);

        const downloadResumable = FileSystem.createDownloadResumable(
          url,
          fullPath,
          {},
          undefined,
          savableData
        );

        const result = await downloadResumable.resumeAsync();

        if (!result) {
          return createMCPResponse(id, null, {
            code: 'RESUME_FAILED',
            message: 'Resume download failed',
          });
        }

        return createMCPResponse(id, {
          success: true,
          uri: result.uri,
          status: result.status,
        });
      }

      default:
        return createMCPResponse(id, null, {
          code: 'UNKNOWN_ACTION',
          message: `Unknown download action: ${action}`,
        });
    }
  }

  // ============================================================================
  // CACHE OPERATIONS
  // ============================================================================

  private async handleCache(
    id: string,
    action: string,
    params: Record<string, unknown>
  ): Promise<MCPResponse> {
    switch (action) {
      case 'get': {
        const { key } = params as { key: string };
        const cachePath = `${this.cacheDir}${key}`;

        const info = await FileSystem.getInfoAsync(cachePath);
        if (!info.exists) {
          return createMCPResponse(id, { exists: false, key });
        }

        const content = await FileSystem.readAsStringAsync(cachePath);

        return createMCPResponse(id, {
          exists: true,
          key,
          content,
          size: info.size ?? 0,
        });
      }

      case 'set': {
        const { key, value, ttl } = params as {
          key: string;
          value: string;
          ttl?: number; // TTL em segundos
        };
        const cachePath = `${this.cacheDir}${key}`;

        const cacheData = {
          value,
          createdAt: Date.now(),
          expiresAt: ttl ? Date.now() + ttl * 1000 : null,
        };

        await FileSystem.writeAsStringAsync(cachePath, JSON.stringify(cacheData));

        return createMCPResponse(id, { success: true, key });
      }

      case 'delete': {
        const { key } = params as { key: string };
        const cachePath = `${this.cacheDir}${key}`;

        await FileSystem.deleteAsync(cachePath, { idempotent: true });

        return createMCPResponse(id, { success: true, key });
      }

      case 'clear': {
        const files = await FileSystem.readDirectoryAsync(this.cacheDir);

        await Promise.all(
          files.map((file) =>
            FileSystem.deleteAsync(`${this.cacheDir}${file}`, { idempotent: true })
          )
        );

        return createMCPResponse(id, {
          success: true,
          clearedFiles: files.length,
        });
      }

      case 'size': {
        const totalSize = await this.calculateDirectorySize(this.cacheDir);

        return createMCPResponse(id, {
          totalSize,
          formattedSize: this.formatBytes(totalSize),
        });
      }

      default:
        return createMCPResponse(id, null, {
          code: 'UNKNOWN_ACTION',
          message: `Unknown cache action: ${action}`,
        });
    }
  }

  // ============================================================================
  // HELPERS
  // ============================================================================

  /**
   * Resolve um path relativo para path absoluto
   */
  private resolvePath(path: string): string {
    // Se já é absoluto (começa com file://), retorna como está
    if (path.startsWith('file://') || path.startsWith(this.documentDir)) {
      return path;
    }

    // Remove leading slash se existir
    const cleanPath = path.startsWith('/') ? path.substring(1) : path;

    // Normalize and prevent path traversal
    const normalized = cleanPath
      .split('/')
      .filter((segment) => segment !== '..' && segment !== '.')
      .join('/');

    return `${this.documentDir}${normalized}`;
  }

  /**
   * Calcula tamanho total de um diretório recursivamente
   */
  private async calculateDirectorySize(dirPath: string): Promise<number> {
    let totalSize = 0;

    try {
      const files = await FileSystem.readDirectoryAsync(dirPath);

      for (const file of files) {
        const filePath = `${dirPath}${file}`;
        const info = await FileSystem.getInfoAsync(filePath);

        if (info.exists && 'isDirectory' in info && info.isDirectory) {
          totalSize += await this.calculateDirectorySize(`${filePath}/`);
        } else if (info.exists && 'size' in info) {
          totalSize += info.size ?? 0;
        }
      }
    } catch (error) {
      logger.warn('[FileSystemMCP] Error calculating directory size', error);
    }

    return totalSize;
  }

  /**
   * Formata bytes para string legível
   */
  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  }

  /**
   * Shutdown do servidor
   */
  async shutdown(): Promise<void> {
    this.initialized = false;
    logger.info('[FileSystemMCP] Shutdown complete');
  }
}

// Singleton instance
export const fileSystemMCP = new FileSystemMCPServer();
