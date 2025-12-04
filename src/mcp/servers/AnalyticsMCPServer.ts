/**
 * Analytics MCP Server
 * Fornece tracking de eventos, telas e comportamento do usuário
 * Preparado para integração com Firebase Analytics, Amplitude, etc.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

import { sessionManager } from '../../services/sessionManager';
import { logger } from '../../utils/logger';
import { MCPServer, MCPRequest, MCPResponse, createMCPResponse, JsonValue } from '../types';

const ANALYTICS_SESSION_KEY = '@analytics_session_id';

interface AnalyticsEvent {
  id: string;
  name: string;
  properties?: Record<string, JsonValue>;
  timestamp: number;
  userId?: string;
  sessionId?: string;
}

// _UserIdentity não utilizado - removido

export class AnalyticsMCPServer implements MCPServer {
  name = 'analytics-mcp';
  version = '1.0.0';

  private initialized = false;
  private sessionId: string | null = null;
  private userId: string | null = null;
  private eventQueue: AnalyticsEvent[] = [];
  private readonly STORAGE_KEY = '@analytics_events';
  private readonly MAX_QUEUE_SIZE = 100;

  async initialize(): Promise<void> {
    try {
      // Tentar obter session ID do session manager primeiro
      let storedSessionId = sessionManager.getAnalyticsSessionId();

      if (storedSessionId) {
        this.sessionId = storedSessionId;
        logger.info('[AnalyticsMCP] Session ID obtido do session manager', {
          sessionId: this.sessionId,
        });
      } else {
        // Tentar restaurar do storage legado
        if (Platform.OS === 'web') {
          storedSessionId = await AsyncStorage.getItem(ANALYTICS_SESSION_KEY);
        } else {
          storedSessionId = await SecureStore.getItemAsync(ANALYTICS_SESSION_KEY);
        }

        if (storedSessionId) {
          this.sessionId = storedSessionId;
          // Atualizar session manager
          sessionManager.setAnalyticsSessionId(storedSessionId);
          logger.info('[AnalyticsMCP] Session ID restaurado do storage', {
            sessionId: this.sessionId,
          });
        } else {
          // Gerar novo session ID
          this.sessionId = `analytics_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

          // Persistir no session manager
          sessionManager.setAnalyticsSessionId(this.sessionId);

          // Também persistir no storage para backward compatibility
          if (Platform.OS === 'web') {
            await AsyncStorage.setItem(ANALYTICS_SESSION_KEY, this.sessionId);
          } else {
            await SecureStore.setItemAsync(ANALYTICS_SESSION_KEY, this.sessionId);
          }

          logger.info('[AnalyticsMCP] Novo session ID criado', { sessionId: this.sessionId });
        }
      }

      // Restaurar eventos pendentes do storage
      const stored = await AsyncStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        this.eventQueue = JSON.parse(stored);
      }

      // Restaurar userId se existir
      const storedUserId = await AsyncStorage.getItem('@user_id');
      if (storedUserId) {
        this.userId = storedUserId;
      }

      this.initialized = true;
      logger.info('[AnalyticsMCP] Initialized successfully');

      // Track session start
      await this.trackEvent('session_start', {
        sessionId: this.sessionId,
        timestamp: Date.now(),
      });
    } catch (error) {
      // GRACEFUL DEGRADATION: Não propagar erro
      // Analytics é opcional - app deve funcionar sem ele
      logger.warn('[AnalyticsMCP] Initialization failed (graceful degradation)', error);

      // Marcar como inicializado mesmo com erro parcial
      // Isso permite que handleRequest retorne erros ao invés de crashar
      this.initialized = true;

      // Gerar session ID fallback se não tiver
      if (!this.sessionId) {
        this.sessionId = `fallback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      }
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
      const [category, action] = request.method.split('.');

      switch (category) {
        case 'event':
          return (await this.handleEvent(request.id, action, request.params)) as MCPResponse<T>;
        case 'screen':
          return (await this.handleScreen(request.id, action, request.params)) as MCPResponse<T>;
        case 'user':
          return (await this.handleUser(request.id, action, request.params)) as MCPResponse<T>;
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

  private async handleEvent(
    id: string,
    action: string,
    params: Record<string, unknown>
  ): Promise<MCPResponse> {
    switch (action) {
      case 'track': {
        const { name, properties } = params as {
          name: string;
          properties?: Record<string, JsonValue>;
        };
        await this.trackEvent(name as string, properties);

        return createMCPResponse(id, {
          success: true,
          eventName: name,
          timestamp: Date.now(),
        });
      }

      default:
        return createMCPResponse(id, null, {
          code: 'UNKNOWN_ACTION',
          message: `Unknown event action: ${action}`,
        });
    }
  }

  private async handleScreen(
    id: string,
    action: string,
    params: Record<string, unknown>
  ): Promise<MCPResponse> {
    switch (action) {
      case 'view': {
        const { name, properties } = params as {
          name: string;
          properties?: Record<string, JsonValue>;
        };
        await this.trackEvent('screen_view', {
          screen_name: name,
          ...properties,
        });

        return createMCPResponse(id, {
          success: true,
          screenName: name,
          timestamp: Date.now(),
        });
      }

      default:
        return createMCPResponse(id, null, {
          code: 'UNKNOWN_ACTION',
          message: `Unknown screen action: ${action}`,
        });
    }
  }

  private async handleUser(
    id: string,
    action: string,
    params: Record<string, unknown>
  ): Promise<MCPResponse> {
    switch (action) {
      case 'identify': {
        const { userId, traits } = params as { userId: string; traits?: Record<string, JsonValue> };

        this.userId = userId;
        await AsyncStorage.setItem('@user_id', userId);

        await this.trackEvent('user_identify', {
          userId,
          ...(traits ? { traits } : {}),
        });

        return createMCPResponse(id, {
          success: true,
          userId,
          timestamp: Date.now(),
        });
      }

      case 'alias': {
        const { previousId, userId } = params as { previousId: string; userId: string };

        await this.trackEvent('user_alias', {
          previousId,
          userId,
        });

        return createMCPResponse(id, {
          success: true,
          previousId,
          userId,
          timestamp: Date.now(),
        });
      }

      default:
        return createMCPResponse(id, null, {
          code: 'UNKNOWN_ACTION',
          message: `Unknown user action: ${action}`,
        });
    }
  }

  private async trackEvent(name: string, properties?: Record<string, JsonValue>): Promise<void> {
    const event: AnalyticsEvent = {
      id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      properties,
      timestamp: Date.now(),
      userId: this.userId || undefined,
      sessionId: this.sessionId || undefined,
    };

    // Adicionar à fila
    this.eventQueue.push(event);

    // Limitar tamanho da fila
    if (this.eventQueue.length > this.MAX_QUEUE_SIZE) {
      this.eventQueue = this.eventQueue.slice(-this.MAX_QUEUE_SIZE);
    }

    // Persistir eventos
    try {
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.eventQueue));
    } catch (error) {
      logger.error('[AnalyticsMCP] Failed to persist events', error);
    }

    // Log para desenvolvimento
    logger.debug('[AnalyticsMCP] Event tracked', {
      name,
      properties,
      userId: this.userId ?? undefined,
      sessionId: this.sessionId ?? undefined,
    });

    // TODO: Enviar para backend analytics quando implementado
    // await this.sendToBackend(event);
  }

  /**
   * Obtém estatísticas da sessão atual
   */
  async getSessionStats(): Promise<{
    sessionId: string | null;
    userId: string | null;
    eventsCount: number;
    events: AnalyticsEvent[];
  }> {
    return {
      sessionId: this.sessionId,
      userId: this.userId,
      eventsCount: this.eventQueue.length,
      events: this.eventQueue,
    };
  }

  /**
   * Limpa a fila de eventos
   */
  async clearQueue(): Promise<void> {
    this.eventQueue = [];
    await AsyncStorage.removeItem(this.STORAGE_KEY);
  }

  async shutdown(): Promise<void> {
    // Track session end
    await this.trackEvent('session_end', {
      sessionId: this.sessionId,
      duration: Date.now(),
      eventsCount: this.eventQueue.length,
    });

    // Persistir eventos finais
    try {
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.eventQueue));
    } catch (error) {
      logger.error('[AnalyticsMCP] Failed to persist final events', error);
    }

    // Session ID é mantido para continuidade entre restarts
    // Não limpar this.sessionId aqui

    this.initialized = false;

    logger.info('[AnalyticsMCP] Shutdown complete');
  }
}

// Singleton instance
export const analyticsMCP = new AnalyticsMCPServer();
