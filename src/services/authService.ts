import type { Session, User, AuthError } from '@supabase/supabase-js';

import { logger } from '@/utils/logger';

import { supabase } from './supabase';

export interface SignUpData {
  email: string;
  password: string;
  fullName: string;
}

export interface SignInData {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User | null;
  session: Session | null;
  error: AuthError | null;
}

/**
 * Serviço de Autenticação
 * Gerencia login, registro, logout e sessão de usuárias
 */
class AuthService {
  /**
   * Registrar nova usuária
   */
  async signUp({ email, password, fullName }: SignUpData): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) {
        logger.error('Erro ao registrar usuária', error, {
          service: 'AuthService',
          action: 'signUp',
          email,
        });
        return { user: null, session: null, error };
      }

      return {
        user: data.user,
        session: data.session,
        error: null,
      };
    } catch (error) {
      logger.error('Erro inesperado ao registrar usuária', error, {
        service: 'AuthService',
        action: 'signUp',
      });
      return {
        user: null,
        session: null,
        error: error as AuthError,
      };
    }
  }

  /**
   * Login com email e senha
   */
  async signIn({ email, password }: SignInData): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        logger.error('Erro ao fazer login', error, {
          service: 'AuthService',
          action: 'signIn',
          email,
        });
        return { user: null, session: null, error };
      }

      return {
        user: data.user,
        session: data.session,
        error: null,
      };
    } catch (error) {
      logger.error('Erro inesperado ao fazer login', error, {
        service: 'AuthService',
        action: 'signIn',
      });
      return {
        user: null,
        session: null,
        error: error as AuthError,
      };
    }
  }

  /**
   * Login com Google
   */
  async signInWithGoogle() {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: 'nossamaternidade://auth/callback',
        },
      });

      if (error) {
        logger.error('Erro ao fazer login com Google', error, {
          service: 'AuthService',
          action: 'signInWithGoogle',
        });
        return { error };
      }

      return { data, error: null };
    } catch (error) {
      logger.error('Erro inesperado ao fazer login com Google', error, {
        service: 'AuthService',
        action: 'signInWithGoogle',
      });
      return { error: error as AuthError };
    }
  }

  /**
   * Login com Apple
   */
  async signInWithApple() {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'apple',
        options: {
          redirectTo: 'nossamaternidade://auth/callback',
        },
      });

      if (error) {
        logger.error('Erro ao fazer login com Apple', error, {
          service: 'AuthService',
          action: 'signInWithApple',
        });
        return { error };
      }

      return { data, error: null };
    } catch (error) {
      logger.error('Erro inesperado ao fazer login com Apple', error, {
        service: 'AuthService',
        action: 'signInWithApple',
      });
      return { error: error as AuthError };
    }
  }

  /**
   * Enviar magic link para email
   */
  async signInWithMagicLink(email: string) {
    try {
      const { data, error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: 'nossamaternidade://auth/callback',
        },
      });

      if (error) {
        logger.error('Erro ao enviar magic link', error, {
          service: 'AuthService',
          action: 'signInWithMagicLink',
          email,
        });
        return { error };
      }

      return { data, error: null };
    } catch (error) {
      logger.error('Erro inesperado ao enviar magic link', error, {
        service: 'AuthService',
        action: 'signInWithMagicLink',
        email,
      });
      return { error: error as AuthError };
    }
  }

  /**
   * Logout
   */
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        logger.error('Erro ao fazer logout', error, {
          service: 'AuthService',
          action: 'signOut',
        });
        return { error };
      }

      return { error: null };
    } catch (error) {
      logger.error('Erro inesperado ao fazer logout', error, {
        service: 'AuthService',
        action: 'signOut',
      });
      return { error: error as AuthError };
    }
  }

  /**
   * Obter sessão atual
   */
  async getSession(): Promise<Session | null> {
    try {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        logger.error('Erro ao obter sessão atual', error, {
          service: 'AuthService',
          action: 'getSession',
        });
        return null;
      }

      return data.session;
    } catch (error) {
      logger.error('Erro inesperado ao obter sessão', error, {
        service: 'AuthService',
        action: 'getSession',
      });
      return null;
    }
  }

  /**
   * Obter usuária atual
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      const { data, error } = await supabase.auth.getUser();

      if (error) {
        logger.error('Erro ao obter usuária atual', error, {
          service: 'AuthService',
          action: 'getCurrentUser',
        });
        return null;
      }

      return data.user;
    } catch (error) {
      logger.error('Erro inesperado ao obter usuária', error, {
        service: 'AuthService',
        action: 'getCurrentUser',
      });
      return null;
    }
  }

  /**
   * Resetar senha
   */
  async resetPassword(email: string) {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'nossamaternidade://auth/reset-password',
      });

      if (error) {
        logger.error('Erro ao resetar senha', error, {
          service: 'AuthService',
          action: 'resetPassword',
          email,
        });
        return { error };
      }

      return { data, error: null };
    } catch (error) {
      logger.error('Erro inesperado ao resetar senha', error, {
        service: 'AuthService',
        action: 'resetPassword',
        email,
      });
      return { error: error as AuthError };
    }
  }

  /**
   * Atualizar senha
   */
  async updatePassword(newPassword: string) {
    try {
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        logger.error('Erro ao atualizar senha', error, {
          service: 'AuthService',
          action: 'updatePassword',
        });
        return { error };
      }

      return { data, error: null };
    } catch (error) {
      logger.error('Erro inesperado ao atualizar senha', error, {
        service: 'AuthService',
        action: 'updatePassword',
      });
      return { error: error as AuthError };
    }
  }

  /**
   * Atualizar email
   */
  async updateEmail(newEmail: string) {
    try {
      const { data, error } = await supabase.auth.updateUser({
        email: newEmail,
      });

      if (error) {
        logger.error('Erro ao atualizar email', error, {
          service: 'AuthService',
          action: 'updateEmail',
          newEmail,
        });
        return { error };
      }

      return { data, error: null };
    } catch (error) {
      logger.error('Erro inesperado ao atualizar email', error, {
        service: 'AuthService',
        action: 'updateEmail',
      });
      return { error: error as AuthError };
    }
  }

  /**
   * Ouvir mudanças de autenticação
   */
  onAuthStateChange(callback: (event: string, session: Session | null) => void) {
    return supabase.auth.onAuthStateChange((event, session) => {
      logger.debug('Auth state changed', { event, hasSession: !!session });
      callback(event, session);
    });
  }

  /**
   * Verificar se o email está confirmado
   */
  async isEmailConfirmed(): Promise<boolean> {
    const user = await this.getCurrentUser();
    return user?.email_confirmed_at != null;
  }

  /**
   * Reenviar email de confirmação
   */
  async resendConfirmationEmail(email: string) {
    try {
      const { data, error } = await supabase.auth.resend({
        type: 'signup',
        email,
      });

      if (error) {
        logger.error('Erro ao reenviar email de confirmação', error, {
          service: 'AuthService',
          action: 'resendConfirmationEmail',
          email,
        });
        return { error };
      }

      return { data, error: null };
    } catch (error) {
      logger.error('Erro inesperado ao reenviar confirmação', error, {
        service: 'AuthService',
        action: 'resendConfirmationEmail',
        email,
      });
      return { error: error as AuthError };
    }
  }
}

export const authService = new AuthService();
export default authService;
