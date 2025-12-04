/**
 * Feature Flags - Nossa Maternidade
 * Controle de features experimentais e migrações
 */

/**
 * Feature Flag: Tema Azul (Airbnb Redesign)
 *
 * Quando ativado, usa cores azuis (ColorTokens.primary[500]) em vez de rosa (ColorTokens.primaryPink[400])
 *
 * @default true - Tema azul ativado (HomeScreen redesenhada)
 * @example
 * if (USE_BLUE_THEME) {
 *   return ColorTokens.primary[500]; // iOS System Blue
 * } else {
 *   return ColorTokens.primaryPink[400]; // Rosa Maternal
 * }
 */
export const USE_BLUE_THEME = true; // ✅ Ativado - HomeScreen redesenhada

/**
 * Feature Flag: Background Bege (Airbnb Style)
 *
 * Quando ativado, usa background bege claro (colors.background.beige) no light mode
 *
 * @default true - Background bege ativado (HomeScreen redesenhada)
 */
export const USE_BEIGE_BACKGROUND = true; // ✅ Ativado - HomeScreen redesenhada

/**
 * Feature Flag: Componentes Airbnb
 *
 * Quando ativado, usa novos componentes (SearchBarPill, ListingCard, etc.)
 *
 * @default true - Componentes Airbnb ativados (HomeScreen redesenhada)
 */
export const USE_AIRBNB_COMPONENTS = true; // ✅ Ativado - HomeScreen redesenhada

/**
 * Helper para verificar se feature está ativa
 */
export function isFeatureEnabled(flag: boolean): boolean {
  return flag === true;
}
