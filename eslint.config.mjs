// @ts-check
import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
});

// Use FlatCompat to convert .eslintrc.js to flat config
const eslintConfig = [
  {
    ignores: [
      'node_modules/**',
      '.expo/**',
      'dist/**',
      'build/**',
      'android/**',
      'ios/**',
      'web-build/**',
      '*.config.js',
      '*.config.mjs',
      'babel.config.js',
      'metro.config.js',
      'tailwind.config.js',
      'nativewind-env.d.ts',
      'expo-env.d.ts',
      'eslint.config.mjs',
      '.eslintrc.js',
      'scripts/**',
      'backend/**',
      'jest.setup.js',
      'src/mcp/**',
      'supabase/**',
      'web-*.js',
    ],
  },
  ...compat.extends(
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
  ),
  {
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_|error', varsIgnorePattern: '^_|error', caughtErrorsIgnorePattern: '^_|error' },
      ],
      '@typescript-eslint/no-explicit-any': 'error',
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      'no-console': 'error',
    },
  },
  {
    files: ['**/__tests__/**/*.{ts,tsx}', '**/*.test.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
  {
    files: ['App.tsx', 'src/assets/images/index.ts', 'src/screens/DiaryScreen.tsx', 'src/screens/Onboarding/OnboardingFlowNew.tsx', 'src/components/onboarding/steps/WelcomeStep.tsx'],
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
  {
    files: [
      'src/screens/PrivacyPolicyScreen.tsx',
      'src/screens/TermsOfServiceScreen.tsx',
      'src/screens/OnboardingStep1.tsx',
      'src/screens/SplashScreen.tsx',
      'src/components/features/chat/VoiceMode.tsx',
    ],
    rules: {
      'react/no-unescaped-entities': 'off',
    },
  },
  {
    files: ['src/screens/PremiumOnboarding.tsx', 'src/navigation/types.ts'],
    rules: {
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/no-namespace': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
    },
  },
  {
    files: ['src/agents/core/__tests__/AgentOrchestrator.DynamicMCP.test.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
    },
  },
];

export default eslintConfig;
