/**
 * Session Validator Middleware
 * Valida e gerencia sessões de autenticação com auto-refresh e retry logic
 */

import { Session, AuthError } from '@supabase/supabase-js';

import { supabase, isSupabaseReady } from '../services/supabase';
import { logger } from '../utils/logger';

export interface ValidationResult {
  isValid: boolean;
  session: Session | null;
  error?: AuthError | null;
}

interface RetryOptions {
  maxRetries?: number;
  initialDelay?: number;
  maxDelay?: number;
}

/**
 * Calcula delay exponencial para retry
 */
function calculateBackoffDelay(attempt: number, initialDelay: number, maxDelay: number): number {
  const delay = initialDelay * Math.pow(2, attempt);
  return Math.min(delay, maxDelay);
}

/**
 * Valida se uma sessão está válida e não expirada
 */
export async function validateAuthSession(session: Session | null): Promise<ValidationResult> {
  if (!isSupabaseReady()) {
    return {
      isValid: false,
      session: null,
      error: {
        message: 'Supabase não configurado',
        status: 500,
      } as AuthError,
    };
  }

  if (!session) {
    return {
      isValid: false,
      session: null,
      error: null,
    };
  }

  // Verificar se o token expirou
  const expiresAt = session.expires_at;
  if (expiresAt) {
    const now = Math.floor(Date.now() / 1000);
    const expiresIn = expiresAt - now;

    // Se expira em menos de 60 segundos, considerar como expirado
    // Buffer de 60s para evitar race conditions
    if (expiresIn < 60) {
      logger.debug('[SessionValidator] Token expirado ou próximo de expirar', {
        expiresIn,
        expiresAt,
        now,
      });
      return {
        isValid: false,
        session: null,
        error: {
          message: 'Token expirado',
          status: 401,
        } as AuthError,
      };
    }
  } else {
    // Se não há expires_at, considerar válido mas logar warning
    logger.warn('[SessionValidator] Sessão sem expires_at, assumindo válida', {
      userId: session.user?.id,
    });
  }

  return {
    isValid: true,
    session,
    error: null,
  };
}

/**
 * Garante que a sessão está válida, tentando refresh se necessário
 */
export async function ensureValidSession(
  session: Session | null,
  options: RetryOptions = {}
): Promise<ValidationResult> {
  const { maxRetries = 3, initialDelay = 1000, maxDelay = 10000 } = options;

  // Validar sessão atual
  const validation = await validateAuthSession(session);
  if (validation.isValid) {
    return validation;
  }

  // Se não há sessão, não há o que fazer
  if (!session) {
    return validation;
  }

  // Tentar refresh do token
  let lastError: AuthError | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      logger.debug(`Tentando refresh de token (tentativa ${attempt + 1}/${maxRetries})`);

      const { data, error } = await supabase.auth.refreshSession(session);

      if (error) {
        lastError = error;
        logger.warn(`Erro ao fazer refresh: ${error.message}`);

        // Se não é erro de rede, não tentar novamente
        if (
          error.status !== 0 &&
          error.status !== 408 &&
          error.status !== 500 &&
          error.status !== 503
        ) {
          break;
        }

        // Aguardar antes de tentar novamente (exponential backoff)
        if (attempt < maxRetries - 1) {
          const delay = calculateBackoffDelay(attempt, initialDelay, maxDelay);
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
        continue;
      }

      if (data.session) {
        logger.info('Token refresh bem-sucedido');
        return {
          isValid: true,
          session: data.session,
          error: null,
        };
      }
    } catch (error) {
      lastError = {
        message: error instanceof Error ? error.message : 'Erro desconhecido ao fazer refresh',
        status: 500,
      } as AuthError;

      // Aguardar antes de tentar novamente
      if (attempt < maxRetries - 1) {
        const delay = calculateBackoffDelay(attempt, initialDelay, maxDelay);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  // Todas as tentativas falharam
  logger.error('Falha ao fazer refresh após todas as tentativas', lastError);
  return {
    isValid: false,
    session: null,
    error:
      lastError ||
      ({
        message: 'Falha ao renovar sessão',
        status: 401,
      } as AuthError),
  };
}

/**
 * Obtém e valida a sessão atual
 */
export async function getValidSession(): Promise<ValidationResult> {
  if (!isSupabaseReady()) {
    return {
      isValid: false,
      session: null,
      error: {
        message: 'Supabase não configurado',
        status: 500,
      } as AuthError,
    };
  }

  try {
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      return {
        isValid: false,
        session: null,
        error,
      };
    }

    return await ensureValidSession(data.session);
  } catch (error) {
    return {
      isValid: false,
      session: null,
      error: {
        message: error instanceof Error ? error.message : 'Erro desconhecido',
        status: 500,
      } as AuthError,
    };
  }
}

/**
 * Verifica se uma operação requer sessão válida e valida antes de executar
 */
export async function withValidSession<T>(
  operation: (session: Session) => Promise<T>,
  fallback?: () => Promise<T>
): Promise<T> {
  const validation = await getValidSession();

  if (!validation.isValid || !validation.session) {
    if (fallback) {
      return await fallback();
    }
    throw new Error(validation.error?.message || 'Sessão inválida');
  }

  try {
    return await operation(validation.session);
  } catch (error) {
    // Se erro de autenticação, tentar refresh e retry uma vez
    if (error instanceof Error && error.message.includes('JWT')) {
      const retryValidation = await ensureValidSession(validation.session);
      if (retryValidation.isValid && retryValidation.session) {
        return await operation(retryValidation.session);
      }
    }
    throw error;
  }
}
