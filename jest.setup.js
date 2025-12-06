// Testing Library matchers are now built-in to @testing-library/react-native v12.4+
// No need to extend-expect anymore (deprecated package)

// Mock Sentry
jest.mock('@sentry/react-native', () => ({
  addBreadcrumb: jest.fn(),
  captureMessage: jest.fn(),
  captureException: jest.fn(),
  init: jest.fn(),
  setContext: jest.fn(),
  setExtra: jest.fn(),
  setTag: jest.fn(),
  setUser: jest.fn(),
  withScope: jest.fn(),
  Scope: jest.fn(),
}));

// Mock AsyncStorage - implementação persistente
// Usa Map() para armazenar dados entre chamadas (não é afetado por resetMocks)
// IMPORTANTE: Nome deve começar com "mock" para Jest permitir uso em jest.mock()
const mockAsyncStorageMap = new Map();

jest.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    setItem: jest.fn((key, value) => {
      mockAsyncStorageMap.set(key, value);
      return Promise.resolve();
    }),
    getItem: jest.fn((key) => {
      return Promise.resolve(mockAsyncStorageMap.get(key) || null);
    }),
    removeItem: jest.fn((key) => {
      mockAsyncStorageMap.delete(key);
      return Promise.resolve();
    }),
    clear: jest.fn(() => {
      mockAsyncStorageMap.clear();
      return Promise.resolve();
    }),
    getAllKeys: jest.fn(() => {
      return Promise.resolve(Array.from(mockAsyncStorageMap.keys()));
    }),
    multiGet: jest.fn((keys) => {
      return Promise.resolve(
        keys.map((key) => [key, mockAsyncStorageMap.get(key) || null])
      );
    }),
    multiSet: jest.fn((pairs) => {
      pairs.forEach(([key, value]) => mockAsyncStorageMap.set(key, value));
      return Promise.resolve();
    }),
    multiRemove: jest.fn((keys) => {
      keys.forEach((key) => mockAsyncStorageMap.delete(key));
      return Promise.resolve();
    }),
  },
}));

// Mock expo-secure-store
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(() => Promise.resolve(null)),
  setItemAsync: jest.fn(() => Promise.resolve()),
  deleteItemAsync: jest.fn(() => Promise.resolve()),
}));

// Mock expo-haptics
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  selectionAsync: jest.fn(),
  ImpactFeedbackStyle: {
    Light: 'light',
    Medium: 'medium',
    Heavy: 'heavy',
  },
  NotificationFeedbackType: {
    Success: 'success',
    Warning: 'warning',
    Error: 'error',
  },
}));

// Mock expo-constants
jest.mock('expo-constants', () => ({
  default: {
    expoConfig: {
      extra: {
        supabaseUrl: 'https://test.supabase.co',
        supabaseAnonKey: 'test-key',
      },
    },
  },
}));

// Mock expo-file-system
jest.mock('expo-file-system', () => ({
  documentDirectory: '/mock/document/',
  cacheDirectory: '/mock/cache/',
  bundleDirectory: '/mock/bundle/',
  readAsStringAsync: jest.fn(() => Promise.resolve('')),
  writeAsStringAsync: jest.fn(() => Promise.resolve()),
  deleteAsync: jest.fn(() => Promise.resolve()),
  makeDirectoryAsync: jest.fn(() => Promise.resolve()),
  getInfoAsync: jest.fn(() => Promise.resolve({ exists: false })),
  downloadAsync: jest.fn(() => Promise.resolve({ uri: '', status: 200 })),
  uploadAsync: jest.fn(() => Promise.resolve({ body: {}, status: 200 })),
}));

// Polyfills para TextEncoder/TextDecoder (necessários para Supabase em testes)
// Node.js já tem TextEncoder/TextDecoder nativamente via 'util', mas garantimos que estão no global
const { TextEncoder, TextDecoder } = require('util');

if (typeof global.TextEncoder === 'undefined') {
  global.TextEncoder = TextEncoder;
}

if (typeof global.TextDecoder === 'undefined') {
  global.TextDecoder = TextDecoder;
}

// Mock crypto.getRandomValues para testes (necessário para Supabase Auth)
if (typeof global.crypto === 'undefined') {
  global.crypto = {
    getRandomValues: (arr) => {
      // Mock simples: preenche com valores pseudo-aleatórios
      // Em produção, isso vem de react-native-get-random-values
      for (let i = 0; i < arr.length; i++) {
        arr[i] = Math.floor(Math.random() * 256);
      }
      return arr;
    },
  };
}

// Mock console methods para não poluir os logs durante os testes
global.console = {
  ...console,
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Mock __DEV__
global.__DEV__ = true;

// Polyfill para setImmediate (necessário para alguns testes)
if (typeof global.setImmediate === 'undefined') {
  global.setImmediate = (callback, ...args) => {
    return setTimeout(() => {
      callback(...args);
    }, 0);
  };
  
  global.clearImmediate = (id) => {
    clearTimeout(id);
  };
}