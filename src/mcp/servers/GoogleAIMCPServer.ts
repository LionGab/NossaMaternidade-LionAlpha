/**
 * Google AI MCP Server
 *
 * ⚠️ DEPRECATED: Este MCP Server não deve mais usar EXPO_PUBLIC_GEMINI_API_KEY
 * A API key do Gemini agora está segura na Edge Function (supabase/functions/chat-gemini)
 * Este servidor deve ser refatorado para usar Edge Functions ou ser desabilitado
 */

import { logger } from '../../utils/logger';
import { MCPServer, MCPRequest, MCPResponse, createMCPResponse, JsonValue } from '../types';

export class GoogleAIMCPServer implements MCPServer {
  name = 'google-ai-mcp';
  version = '1.0.0';

  async initialize(): Promise<void> {
    // ⚠️ DEPRECATED: Este MCP Server não deve mais usar EXPO_PUBLIC_GEMINI_API_KEY
    // A API key do Gemini agora está segura na Edge Function (supabase/functions/chat-gemini)
    logger.warn(
      '[GoogleAIMCP] Este servidor está deprecated. Use Edge Functions (chat-gemini) em vez de API key direta.'
    );

    // Por enquanto, desabilitamos a inicialização para forçar migração
    throw new Error(
      'GoogleAIMCPServer está deprecated. Use Edge Functions (chat-gemini) em vez de API key direta.'
    );
  }

  async handleRequest<T = JsonValue>(request: MCPRequest): Promise<MCPResponse<T>> {
    // Servidor deprecated - sempre retorna erro
    return createMCPResponse(request.id, null, {
      code: 'NOT_INITIALIZED',
      message:
        'GoogleAIMCPServer está deprecated. Use Edge Functions (chat-gemini) em vez de API key direta.',
    }) as MCPResponse<T>;
  }

  async shutdown(): Promise<void> {
    logger.info('[GoogleAIMCP] Shutdown complete');
  }
}

// Singleton instance
export const googleAIMCP = new GoogleAIMCPServer();
