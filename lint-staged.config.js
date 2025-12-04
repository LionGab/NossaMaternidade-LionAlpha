/**
 * Configuração do lint-staged
 * Executa validações apenas nos arquivos staged
 *
 * @see https://github.com/okonet/lint-staged
 */
module.exports = {
  // ===========================================
  // TypeScript/TSX files - ESLint fix
  // ===========================================
  'src/**/*.{ts,tsx}': ['npx eslint --fix'],

  // ===========================================
  // Theme - Apenas ESLint check
  // ===========================================
  'src/theme/**/*.{ts,tsx}': ['npx eslint --fix'],
};
