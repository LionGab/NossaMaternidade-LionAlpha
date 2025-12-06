/**
 * Mock centralizado do Supabase para testes
 * Reutilizável em todos os testes de services
 *
 * Conforme Plano de Correção de Qualidade - Fase 3.1
 */

/**
 * Mock factory para criar instâncias mockadas do Supabase
 * Permite customizar comportamentos por teste
 */
export function createSupabaseMock(overrides?: Partial<SupabaseMock>) {
  const defaultMock: SupabaseMock = {
    auth: {
      signUp: jest.fn(),
      signInWithPassword: jest.fn(),
      signInWithOtp: jest.fn(),
      signOut: jest.fn(),
      getUser: jest.fn(),
      getSession: jest.fn(),
      get user() {
        return {
          id: 'test-user-id',
          email: 'test@example.com',
        };
      },
      onAuthStateChange: jest.fn(() => ({
        data: {
          subscription: {
            unsubscribe: jest.fn(),
          },
        },
      })),
      updateUser: jest.fn(),
      resetPasswordForEmail: jest.fn(),
    },
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          order: jest.fn(() => ({
            limit: jest.fn(() => Promise.resolve({ data: [], error: null })),
            single: jest.fn(() => Promise.resolve({ data: null, error: null })),
          })),
          single: jest.fn(() => Promise.resolve({ data: null, error: null })),
        })),
        limit: jest.fn(() => Promise.resolve({ data: [], error: null })),
        single: jest.fn(() => Promise.resolve({ data: null, error: null })),
      })),
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({ data: null, error: null })),
        })),
      })),
      update: jest.fn(() => ({
        eq: jest.fn(() => Promise.resolve({ data: null, error: null })),
      })),
      delete: jest.fn(() => ({
        eq: jest.fn(() => Promise.resolve({ data: null, error: null })),
      })),
      upsert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({ data: null, error: null })),
        })),
      })),
    })),
    channel: jest.fn(() => ({
      on: jest.fn(() => ({
        subscribe: jest.fn(),
      })),
    })),
    removeChannel: jest.fn(),
    functions: {
      invoke: jest.fn(() => Promise.resolve({ data: null, error: null })),
    },
    storage: {
      from: jest.fn(() => ({
        upload: jest.fn(() => Promise.resolve({ data: null, error: null })),
        download: jest.fn(() => Promise.resolve({ data: null, error: null })),
        remove: jest.fn(() => Promise.resolve({ data: null, error: null })),
        getPublicUrl: jest.fn(() => ({
          data: {
            publicUrl: 'https://example.com/file.jpg',
          },
        })),
      })),
    },
  };

  return { ...defaultMock, ...overrides };
}

/**
 * Interface para o mock do Supabase
 */
export interface SupabaseMock {
  auth: {
    signUp: jest.Mock;
    signInWithPassword: jest.Mock;
    signInWithOtp: jest.Mock;
    signOut: jest.Mock;
    getUser: jest.Mock;
    getSession: jest.Mock;
    user: { id: string; email: string } | null;
    onAuthStateChange: jest.Mock;
    updateUser: jest.Mock;
    resetPasswordForEmail: jest.Mock;
  };
  from: jest.Mock;
  channel: jest.Mock;
  removeChannel: jest.Mock;
  functions: {
    invoke: jest.Mock;
  };
  storage: {
    from: jest.Mock;
  };
}

/**
 * Mock padrão exportado para uso direto
 */
export const supabaseMock = createSupabaseMock();

/**
 * Helper para mockar respostas de queries
 */
export function mockSupabaseQuery<T>(data: T, error: Error | null = null) {
  return Promise.resolve({ data, error });
}

/**
 * Helper para mockar respostas de mutations (insert/update/delete)
 */
export function mockSupabaseMutation<T>(data: T | null = null, error: Error | null = null) {
  return Promise.resolve({ data, error });
}

/**
 * Helper para mockar usuário autenticado
 */
export function mockAuthenticatedUser(userId = 'test-user-id', email = 'test@example.com') {
  return {
    id: userId,
    email,
    user_metadata: {},
    app_metadata: {},
  };
}

/**
 * Helper para mockar sessão
 */
export function mockSession(
  accessToken = 'mock-access-token',
  refreshToken = 'mock-refresh-token'
) {
  return {
    access_token: accessToken,
    refresh_token: refreshToken,
    expires_in: 3600,
    expires_at: Date.now() / 1000 + 3600,
    token_type: 'bearer',
    user: mockAuthenticatedUser(),
  };
}
