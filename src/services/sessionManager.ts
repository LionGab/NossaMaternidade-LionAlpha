/**
 * Session Manager Unificado
 * Centraliza gerenciamento de todas as sessões (auth, chat, analytics)
 */

import { Session, User } from '@supabase/supabase-js';

import { supabase, isSupabaseReady, initSecureStorageMigration } from './supabase';
import { ensureValidSession, getValidSession } from '../middleware/sessionValidator';
import { logger } from '../utils/logger';

export interface SessionState {
  auth: {
    session: Session | null;
    user: User | null;
    isLoading: boolean;
    lastValidated: number | null;
  };
  chat: {
    currentSessionId: string | null;
  };
  analytics: {
    sessionId: string | null;
  };
}

type StateListener = (state: SessionState) => void;

interface AuthSubscription {
  unsubscribe: () => void;
}

class SessionManager {
  private state: SessionState = {
    auth: {
      session: null,
      user: null,
      isLoading: true,
      lastValidated: null,
    },
    chat: {
      currentSessionId: null,
    },
    analytics: {
      sessionId: null,
    },
  };

  private listeners: Set<StateListener> = new Set();
  private authSubscription: AuthSubscription | null = null;
  private initialized = false;

  /**
   * Inicializa o session manager
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      logger.warn('[SessionManager] Já inicializado');
      return;
    }

    try {
      logger.info('[SessionManager] Inicializando...');

      // 1. Migrar sessões para SecureStore
      await initSecureStorageMigration();

      if (!isSupabaseReady()) {
        logger.warn('[SessionManager] Supabase não configurado');
        this.state.auth.isLoading = false;
        this.notifyListeners();
        this.initialized = true;
        return;
      }

      // 2. Obter e validar sessão inicial
      const validationResult = await getValidSession();

      this.state.auth.session = validationResult.session;
      this.state.auth.user = validationResult.session?.user ?? null;
      this.state.auth.lastValidated = validationResult.isValid ? Date.now() : null;
      this.state.auth.isLoading = false;

      // Configurar session ID no logger
      if (validationResult.session) {
        logger.setSessionId(validationResult.session.user.id);
      }

      // 3. Escutar mudanças de autenticação
      const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
        logger.info(`[SessionManager] Auth state changed: ${event}`, {
          sessionId: session?.user?.id,
        });

        if (session) {
          // Validar sessão quando houver mudança
          const validated = await ensureValidSession(session);
          this.state.auth.session = validated.session;
          this.state.auth.user = validated.session?.user ?? null;
          this.state.auth.lastValidated = validated.isValid ? Date.now() : null;

          if (validated.session) {
            logger.setSessionId(validated.session.user.id);
          }
        } else {
          this.state.auth.session = null;
          this.state.auth.user = null;
          this.state.auth.lastValidated = null;
          logger.setSessionId(null);

          // Limpar sessões relacionadas
          this.state.chat.currentSessionId = null;
        }

        this.notifyListeners();
      });

      this.authSubscription = {
        unsubscribe: authListener.subscription.unsubscribe,
      };

      this.initialized = true;
      this.notifyListeners();

      logger.info('[SessionManager] Inicializado com sucesso', {
        hasSession: !!this.state.auth.session,
        userId: this.state.auth.user?.id,
      });
    } catch (error) {
      logger.error('[SessionManager] Erro ao inicializar', error);
      this.state.auth.isLoading = false;
      this.notifyListeners();
      throw error;
    }
  }

  /**
   * Obtém o estado atual
   */
  getState(): SessionState {
    return { ...this.state };
  }

  /**
   * Adiciona listener para mudanças de estado
   */
  addListener(listener: StateListener): () => void {
    this.listeners.add(listener);

    // Retornar função de unsubscribe
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Notifica todos os listeners
   * Protegido contra erros em listeners individuais
   */
  private notifyListeners(): void {
    const state = this.getState();
    // Criar cópia do Set para evitar problemas se listeners forem removidos durante iteração
    const listenersCopy = Array.from(this.listeners);
    listenersCopy.forEach((listener) => {
      try {
        listener(state);
      } catch (error) {
        logger.error('[SessionManager] Erro ao notificar listener', error);
        // Não remover listener automaticamente - deixar o componente decidir
      }
    });
  }

  /**
   * Obtém sessão de autenticação atual
   */
  getAuthSession(): Session | null {
    return this.state.auth.session;
  }

  /**
   * Obtém usuário atual
   */
  getCurrentUser(): User | null {
    return this.state.auth.user;
  }

  /**
   * Verifica se há sessão válida
   */
  async validateAuthSession(): Promise<boolean> {
    const validation = await ensureValidSession(this.state.auth.session);

    if (validation.isValid && validation.session) {
      this.state.auth.session = validation.session;
      this.state.auth.user = validation.session.user;
      this.state.auth.lastValidated = Date.now();
      this.notifyListeners();
      return true;
    }

    // Sessão inválida
    if (!validation.isValid) {
      this.state.auth.session = null;
      this.state.auth.user = null;
      this.state.auth.lastValidated = null;
      this.notifyListeners();
    }

    return false;
  }

  /**
   * Força refresh da sessão de autenticação
   */
  async refreshAuth(): Promise<boolean> {
    return await this.validateAuthSession();
  }

  /**
   * Limpa todas as sessões
   */
  async clearAllSessions(): Promise<void> {
    try {
      if (isSupabaseReady()) {
        await supabase.auth.signOut();
      }

      this.state = {
        auth: {
          session: null,
          user: null,
          isLoading: false,
          lastValidated: null,
        },
        chat: {
          currentSessionId: null,
        },
        analytics: {
          sessionId: null,
        },
      };

      logger.setSessionId(null);
      this.notifyListeners();

      logger.info('[SessionManager] Todas as sessões limpas');
    } catch (error) {
      logger.error('[SessionManager] Erro ao limpar sessões', error);
      throw error;
    }
  }

  /**
   * Define session ID do chat
   */
  setChatSessionId(sessionId: string | null): void {
    this.state.chat.currentSessionId = sessionId;
    this.notifyListeners();
    logger.debug('[SessionManager] Chat session ID atualizado', {
      sessionId: sessionId ?? undefined,
    });
  }

  /**
   * Obtém session ID do chat atual
   */
  getChatSessionId(): string | null {
    return this.state.chat.currentSessionId;
  }

  /**
   * Define session ID de analytics
   */
  setAnalyticsSessionId(sessionId: string | null): void {
    this.state.analytics.sessionId = sessionId;
    this.notifyListeners();
    logger.debug('[SessionManager] Analytics session ID atualizado', {
      sessionId: sessionId ?? undefined,
    });
  }

  /**
   * Obtém session ID de analytics
   */
  getAnalyticsSessionId(): string | null {
    return this.state.analytics.sessionId;
  }

  /**
   * Cleanup
   */
  destroy(): void {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
      this.authSubscription = null;
    }
    this.listeners.clear();
    this.initialized = false;
    logger.info('[SessionManager] Destruído');
  }
}

export const sessionManager = new SessionManager();
export default sessionManager;
