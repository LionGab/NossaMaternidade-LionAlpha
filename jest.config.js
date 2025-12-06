module.exports = {
  preset: 'react-native',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testMatch: ['**/__tests__/**/*.test.(ts|tsx|js)'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: {
          jsx: 'react',
          esModuleInterop: true,
          allowSyntheticDefaultImports: true,
          skipLibCheck: true,
        },
      },
    ],
  },
  transformIgnorePatterns: [
    '/node_modules/(?!(@supabase|expo|@expo|@react-native|react-native|@react-navigation|expo-file-system|expo-constants|expo-secure-store|expo-haptics|expo-modules-core|@react-native-async-storage)/)',
  ],
  collectCoverageFrom: [
    'src/services/**/*.{ts,tsx}',
    'src/hooks/**/*.{ts,tsx}',
    'src/utils/**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
  ],
  // Threshold adaptativo: baixo para dev, alto para CI
  // CI/CD: exige 40% (meta MVP Fase 1 conforme CONTEXTO.md)
  // Desenvolvimento local: permite progresso incremental (5%)
  coverageThreshold: process.env.CI
    ? {
        global: {
          branches: 40,
          functions: 40,
          lines: 40,
          statements: 40,
        },
      }
    : {
        global: {
          branches: 5,
          functions: 5,
          lines: 5,
          statements: 5,
        },
      },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  // Configurações de memória para evitar "Fatal process out of memory"
  // Ver: docs/ANALISE_QUALIDADE.md seção 1.4
  maxWorkers: '50%', // Limita a 50% dos CPUs disponíveis
  workerIdleMemoryLimit: '512MB', // Limita memória por worker
  testTimeout: 30000, // 30 segundos de timeout por teste
  // Limpa mocks entre testes para evitar memory leaks
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
  // Força garbage collection entre arquivos de teste
  logHeapUsage: true,
};
