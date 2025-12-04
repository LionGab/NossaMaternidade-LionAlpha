/**
 * Supabase MCP Server
 * Fornece acesso ao Supabase para autenticação, banco de dados e storage
 * Usa a mesma instância do Supabase client para evitar múltiplas instâncias GoTrueClient
 */

import { SupabaseClient } from '@supabase/supabase-js';

import { supabase } from '../../services/supabase';
import { logger } from '../../utils/logger';
import {
  MCPServer,
  MCPRequest,
  MCPResponse,
  createMCPResponse,
  MCPError as _MCPError,
  JsonValue,
} from '../types';
// Importar a instância singleton do Supabase client

export class SupabaseMCPServer implements MCPServer {
  name = 'supabase-mcp';
  version = '1.0.0';

  private client: SupabaseClient | null = null;
  private initialized = false;

  async initialize(): Promise<void> {
    try {
      // Usar a mesma instância do Supabase client para evitar múltiplas instâncias GoTrueClient
      this.client = supabase;
      this.initialized = true;

      logger.info('[SupabaseMCP] Initialized successfully (using shared Supabase instance)');
    } catch (error) {
      logger.error('[SupabaseMCP] Initialization failed', error);
      throw error;
    }
  }

  async handleRequest<T = JsonValue>(request: MCPRequest): Promise<MCPResponse<T>> {
    if (!this.initialized || !this.client) {
      return createMCPResponse(request.id, null, {
        code: 'NOT_INITIALIZED',
        message: 'MCP Server not initialized',
      }) as MCPResponse<T>;
    }

    try {
      const [category, action] = request.method.split('.');

      switch (category) {
        case 'auth':
          return (await this.handleAuth(request.id, action, request.params)) as MCPResponse<T>;
        case 'db':
          return (await this.handleDatabase(request.id, action, request.params)) as MCPResponse<T>;
        case 'storage':
          return (await this.handleStorage(request.id, action, request.params)) as MCPResponse<T>;
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

  private async handleAuth(
    id: string,
    action: string,
    params: Record<string, unknown>
  ): Promise<MCPResponse> {
    if (!this.client) throw new Error('Client not initialized');

    switch (action) {
      case 'signIn': {
        const { email, password } = params as { email: string; password: string };
        const { data, error } = await this.client.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          return createMCPResponse(id, null, {
            code: 'AUTH_ERROR',
            message: error.message,
          });
        }

        return createMCPResponse(id, JSON.parse(JSON.stringify(data)) as JsonValue);
      }

      case 'signUp': {
        const { email, password, metadata } = params as {
          email: string;
          password: string;
          metadata?: Record<string, unknown>;
        };
        const { data, error } = await this.client.auth.signUp({
          email,
          password,
          options: { data: metadata },
        });

        if (error) {
          return createMCPResponse(id, null, {
            code: 'AUTH_ERROR',
            message: error.message,
          });
        }

        return createMCPResponse(id, JSON.parse(JSON.stringify(data)) as JsonValue);
      }

      case 'signOut': {
        const { error } = await this.client.auth.signOut();

        if (error) {
          return createMCPResponse(id, null, {
            code: 'AUTH_ERROR',
            message: error.message,
          });
        }

        return createMCPResponse(id, { success: true });
      }

      default:
        return createMCPResponse(id, null, {
          code: 'UNKNOWN_ACTION',
          message: `Unknown auth action: ${action}`,
        });
    }
  }

  private async handleDatabase(
    id: string,
    action: string,
    params: Record<string, unknown>
  ): Promise<MCPResponse> {
    if (!this.client) throw new Error('Client not initialized');

    const { table } = params as { table: string };

    switch (action) {
      case 'query': {
        const { query } = params as { query: { select?: string; match?: Record<string, unknown> } };
        const { data, error } = await this.client
          .from(table)
          .select(query.select || '*')
          .match(query.match || {});

        if (error) {
          return createMCPResponse(id, null, {
            code: 'DB_ERROR',
            message: error.message,
          });
        }

        return createMCPResponse(id, data as JsonValue);
      }

      case 'insert': {
        const { data: insertData } = params as { data: Record<string, unknown> };
        const { data, error } = await this.client.from(table).insert(insertData).select();

        if (error) {
          return createMCPResponse(id, null, {
            code: 'DB_ERROR',
            message: error.message,
          });
        }

        return createMCPResponse(id, data as JsonValue);
      }

      case 'update': {
        const { id: recordId, data: updateData } = params as {
          id: string;
          data: Record<string, unknown>;
        };
        const { data, error } = await this.client
          .from(table)
          .update(updateData)
          .eq('id', recordId)
          .select();

        if (error) {
          return createMCPResponse(id, null, {
            code: 'DB_ERROR',
            message: error.message,
          });
        }

        return createMCPResponse(id, data as JsonValue);
      }

      case 'delete': {
        const { id: recordId } = params as { id: string };
        const { error } = await this.client.from(table).delete().eq('id', recordId);

        if (error) {
          return createMCPResponse(id, null, {
            code: 'DB_ERROR',
            message: error.message,
          });
        }

        return createMCPResponse(id, { success: true });
      }

      default:
        return createMCPResponse(id, null, {
          code: 'UNKNOWN_ACTION',
          message: `Unknown database action: ${action}`,
        });
    }
  }

  private async handleStorage(
    id: string,
    action: string,
    params: Record<string, unknown>
  ): Promise<MCPResponse> {
    if (!this.client) throw new Error('Client not initialized');

    const { bucket, path } = params as { bucket: string; path: string };

    switch (action) {
      case 'upload': {
        const { file } = params as { file: Blob | File };
        const { data, error } = await this.client.storage.from(bucket).upload(path, file);

        if (error) {
          return createMCPResponse(id, null, {
            code: 'STORAGE_ERROR',
            message: error.message,
          });
        }

        return createMCPResponse(id, data as JsonValue);
      }

      case 'download': {
        const { data, error } = await this.client.storage.from(bucket).download(path);

        if (error) {
          return createMCPResponse(id, null, {
            code: 'STORAGE_ERROR',
            message: error.message,
          });
        }

        // Return URL or metadata instead of Blob to match JsonValue type
        return createMCPResponse(id, {
          size: data.size,
          type: data.type,
          // Note: Blob can't be serialized, so we return metadata
          // Actual file download should be handled differently in production
        });
      }

      case 'delete': {
        const { error } = await this.client.storage.from(bucket).remove([path]);

        if (error) {
          return createMCPResponse(id, null, {
            code: 'STORAGE_ERROR',
            message: error.message,
          });
        }

        return createMCPResponse(id, { success: true });
      }

      default:
        return createMCPResponse(id, null, {
          code: 'UNKNOWN_ACTION',
          message: `Unknown storage action: ${action}`,
        });
    }
  }

  async shutdown(): Promise<void> {
    this.client = null;
    this.initialized = false;
    logger.info('[SupabaseMCP] Shutdown complete');
  }
}

// Singleton instance
export const supabaseMCP = new SupabaseMCPServer();
