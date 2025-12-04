import { Session, User, AuthError } from '@supabase/supabase-js';
import React, { createContext, useContext, useEffect, useState } from 'react';

import { Loading } from '../components';
import { ensureValidSession } from '../middleware/sessionValidator';
import { sessionManager } from '../services/sessionManager';
import { supabase, isSupabaseReady } from '../services/supabase';
import { logger } from '../utils/logger';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signUp: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
  refreshSession: () => Promise<{ session: Session | null; error: AuthError | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Inicializar session manager
    sessionManager.initialize().catch((error) => {
      logger.error('[AuthContext] Erro ao inicializar session manager', error);
    });

    // Escutar mudanças do session manager
    const unsubscribe = sessionManager.addListener((state) => {
      setSession(state.auth.session);
      setUser(state.auth.user);
      setLoading(state.auth.isLoading);
    });

    // Obter estado inicial
    const initialState = sessionManager.getState();
    setSession(initialState.auth.session);
    setUser(initialState.auth.user);
    setLoading(initialState.auth.isLoading);

    return () => {
      unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    if (!isSupabaseReady()) {
      return {
        error: {
          message: 'Supabase não configurado',
          status: 500,
        } as AuthError,
      };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      // Validar e garantir sessão válida após login
      if (!error && data.session) {
        const validation = await ensureValidSession(data.session);
        if (validation.isValid && validation.session) {
          // Session manager já atualiza automaticamente via onAuthStateChange
        }
      }

      return { error };
    } catch (error) {
      return {
        error: {
          message: error instanceof Error ? error.message : 'Erro desconhecido',
          status: 500,
        } as AuthError,
      };
    }
  };

  const signUp = async (email: string, password: string) => {
    if (!isSupabaseReady()) {
      return {
        error: {
          message: 'Supabase não configurado',
          status: 500,
        } as AuthError,
      };
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });
      return { error };
    } catch (error) {
      return {
        error: {
          message: error instanceof Error ? error.message : 'Erro desconhecido',
          status: 500,
        } as AuthError,
      };
    }
  };

  const signOut = async () => {
    if (!isSupabaseReady()) {
      return;
    }

    try {
      await sessionManager.clearAllSessions();
    } catch (error) {
      logger.warn('[AuthContext] Erro ao fazer logout', error);
    }
  };

  /**
   * Força a renovação da sessão atual
   */
  const refreshSession = async () => {
    if (!isSupabaseReady()) {
      return {
        session: null,
        error: {
          message: 'Supabase não configurado',
          status: 500,
        } as AuthError,
      };
    }

    try {
      const isValid = await sessionManager.refreshAuth();
      const currentSession = sessionManager.getAuthSession();

      return {
        session: currentSession,
        error: isValid
          ? null
          : ({
              message: 'Falha ao renovar sessão',
              status: 401,
            } as AuthError),
      };
    } catch (error) {
      const authError: AuthError = {
        message: error instanceof Error ? error.message : 'Erro ao renovar sessão',
        status: 500,
      } as AuthError;
      return { session: null, error: authError };
    }
  };

  const resetPassword = async (email: string) => {
    if (!isSupabaseReady()) {
      return {
        error: {
          message: 'Supabase não configurado',
          status: 500,
        } as AuthError,
      };
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'nossamaternidade://auth/reset-password',
      });
      return { error };
    } catch (error) {
      return {
        error: {
          message: error instanceof Error ? error.message : 'Erro desconhecido',
          status: 500,
        } as AuthError,
      };
    }
  };

  if (loading) {
    return <Loading fullScreen message="Carregando..." />;
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        signIn,
        signUp,
        signOut,
        resetPassword,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
