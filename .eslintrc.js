module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
    project: './tsconfig.json',
  },
  env: {
    'react-native/react-native': true,
    es2022: true,
    node: true,
  },
  plugins: [
    '@typescript-eslint',
    'react',
    'react-hooks',
    'react-native',
    'react-native-a11y',
    'import',
  ],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:react-native/all',
    'plugin:react-native-a11y/all',
    'plugin:import/recommended',
    'plugin:import/typescript',
    'plugin:prettier/recommended', // Must be last - integrates Prettier with ESLint
  ],
  settings: {
    react: {
      version: 'detect',
    },
    'import/resolver': {
      typescript: {
        project: './tsconfig.json',
      },
    },
  },
  rules: {
    // TypeScript - STRICT MODE (Refactoring Quality Phase)
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
      },
    ],
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-require-imports': 'off',
    '@typescript-eslint/no-var-requires': 'off', // Legacy code uses require()
    '@typescript-eslint/ban-ts-comment': 'warn', // Will fix gradually
    '@typescript-eslint/no-namespace': 'warn', // Legacy pattern
    '@typescript-eslint/ban-types': 'warn', // Will fix gradually

    // React
    'react/react-in-jsx-scope': 'off', // React 17+ doesn't need import
    'react/prop-types': 'off', // Using TypeScript
    'react/display-name': 'off',
    'react/no-unescaped-entities': 'warn', // PT-BR text often has quotes

    // React Hooks
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',

    // React Native
    // no-unused-styles desabilitado: falsos positivos com createStyles(colors)
    'react-native/no-unused-styles': 'off',
    'react-native/split-platform-components': 'off',
    'react-native/no-inline-styles': 'off', // Using inline styles with theme tokens
    'react-native/no-color-literals': 'off', // Using theme tokens
    'react-native/no-raw-text': 'off', // Text inside Text components is fine
    'react-native/sort-styles': 'off', // Not critical for MVP
    'react-native/no-single-element-style-arrays': 'warn', // Not critical

    // Design System Rules (Custom)
    'no-restricted-syntax': [
      'warn',
      {
        // Bloquear cores hex hardcoded (exceto em arquivos de tokens)
        selector: 'Literal[value=/^#[0-9A-Fa-f]{3,8}$/]',
        message: 'Use design tokens em vez de cores hex hardcoded. Ex: colors.text.primary',
      },
      {
        // Bloquear rgba/rgb hardcoded
        selector: 'Literal[value=/^rgba?\\(/]',
        message: 'Use design tokens em vez de rgba/rgb hardcoded. Ex: colors.border.light',
      },
    ],

    // Accessibility (a11y) - Will be fixed in FASE 2
    // Using 'warn' now, will upgrade to 'error' after FASE 2 completion
    'react-native-a11y/has-accessibility-hint': 'warn',
    'react-native-a11y/has-accessibility-props': 'warn',
    'react-native-a11y/has-valid-accessibility-actions': 'warn',
    'react-native-a11y/has-valid-accessibility-role': 'warn',
    'react-native-a11y/has-valid-accessibility-state': 'warn',
    'react-native-a11y/has-valid-accessibility-states': 'warn',
    'react-native-a11y/has-valid-accessibility-component-type': 'warn',
    'react-native-a11y/has-valid-accessibility-traits': 'warn',
    'react-native-a11y/has-valid-accessibility-value': 'warn',
    'react-native-a11y/no-nested-touchables': 'warn',
    'react-native-a11y/has-valid-accessibility-ignores-invert-colors': 'warn',
    'react-native-a11y/has-valid-accessibility-live-region': 'warn',
    'react-native-a11y/has-valid-important-for-accessibility': 'warn',
    'react-native-a11y/has-valid-accessibility-descriptors': 'warn',

    // General - STRICT MODE (Refactoring Quality Phase)
    'no-console': 'error', // Use logger instead
    'no-debugger': 'error',
    'prefer-const': 'error',
    'no-var': 'error',
    'no-case-declarations': 'warn', // Will fix gradually

    // Import organization - mais flexível para reduzir warnings
    'import/order': [
      'warn',
      {
        groups: ['builtin', 'external', 'internal', ['parent', 'sibling'], 'index'],
        'newlines-between': 'always',
        alphabetize: { order: 'asc', caseInsensitive: true },
        pathGroups: [
          {
            pattern: '@/**',
            group: 'internal',
            position: 'before',
          },
        ],
        pathGroupsExcludedImportTypes: ['builtin'],
      },
    ],
    'import/no-unused-modules': 'warn',
    'import/no-duplicates': 'error',
  },
  overrides: [
    {
      // Test files
      files: ['**/__tests__/**/*', '**/*.test.ts', '**/*.test.tsx'],
      env: {
        jest: true,
      },
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
      },
    },
    {
      // Config files - usar parser padrão do ESLint (não TypeScript)
      files: ['*.config.js', 'babel.config.js', 'metro.config.js', '.eslintrc.js'],
      parser: 'espree', // Parser padrão do ESLint para JavaScript
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
      },
      rules: {
        '@typescript-eslint/no-require-imports': 'off',
        '@typescript-eslint/no-var-requires': 'off',
      },
    },
    {
      // Design tokens files - permitir cores hardcoded
      files: ['**/tokens.ts', '**/colors.ts', '**/ThemeContext.tsx'],
      rules: {
        'no-restricted-syntax': 'off',
      },
    },
    {
      // Scripts - regras mais relaxadas
      files: ['scripts/**/*.js', 'scripts/**/*.ts'],
      rules: {
        'no-restricted-syntax': 'off',
        'import/order': 'off',
        '@typescript-eslint/no-require-imports': 'off',
        '@typescript-eslint/no-var-requires': 'off',
        'no-console': 'warn', // Scripts podem usar console
      },
    },
  ],
  ignorePatterns: [
    'node_modules/',
    '.expo/',
    'dist/',
    'build/',
    'android/',
    'ios/',
    'web-build/',
    '*.config.js',
    'babel.config.js',
    'metro.config.js',
    'tailwind.config.js',
    'nativewind-env.d.ts',
    'expo-env.d.ts',
  ],
};
