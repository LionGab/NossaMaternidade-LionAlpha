/**
 * Sistema Tipográfico - Nossa Maternidade
 *
 * Inspirado em Flo (Manrope/Inter) mas com ajustes para:
 * - Melhor legibilidade em mobile
 * - Hierarquia clara
 * - Personalidade Nathália (amigável, directa)
 *
 * Font: Usar Poppins (open source) ou Inter/Plus Jakarta Sans
 *
 * @version 1.0
 * @date 2025-11-27
 */

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ESCALAS TIPOGRÁFICAS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const FONT_SIZES = {
  xs: 12, // Captions, badges
  sm: 14, // Small text, helper text
  base: 16, // Body (padrão)
  md: 16, // Body regular
  lg: 18, // Body large, descriptions
  xl: 20, // Subheading
  '2xl': 24, // Card titles
  '3xl': 28, // Section headers
  '4xl': 32, // Page titles
  '5xl': 40, // Hero text
} as const;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PESOS DE FONTE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const FONT_WEIGHTS = {
  light: '300',
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
} as const;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ALTURA DE LINHA
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const LINE_HEIGHTS = {
  tight: 1.2, // Títulos (compacto)
  snug: 1.35,
  normal: 1.5, // Body (legível)
  relaxed: 1.625,
  loose: 2, // Muito espaçado
} as const;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ESCALAS PRECOMPOSTAS (Semantic tokens)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const TYPOGRAPHY = {
  // Títulos
  h1: {
    fontSize: FONT_SIZES['5xl'], // 40px
    fontWeight: FONT_WEIGHTS.extrabold, // 800
    lineHeight: LINE_HEIGHTS.tight, // 1.2
    letterSpacing: -1,
  },

  h2: {
    fontSize: FONT_SIZES['4xl'], // 32px
    fontWeight: FONT_WEIGHTS.bold, // 700
    lineHeight: LINE_HEIGHTS.tight, // 1.2
    letterSpacing: -0.5,
  },

  h3: {
    fontSize: FONT_SIZES['3xl'], // 28px
    fontWeight: FONT_WEIGHTS.bold, // 700
    lineHeight: LINE_HEIGHTS.snug, // 1.35
    letterSpacing: 0,
  },

  h4: {
    fontSize: FONT_SIZES['2xl'], // 24px
    fontWeight: FONT_WEIGHTS.semibold, // 600
    lineHeight: LINE_HEIGHTS.snug, // 1.35
  },

  h5: {
    fontSize: FONT_SIZES.lg, // 18px
    fontWeight: FONT_WEIGHTS.semibold, // 600
    lineHeight: LINE_HEIGHTS.normal, // 1.5
  },

  h6: {
    fontSize: FONT_SIZES.base, // 16px
    fontWeight: FONT_WEIGHTS.semibold, // 600
    lineHeight: LINE_HEIGHTS.normal, // 1.5
  },

  // Corpo de texto
  bodyXL: {
    fontSize: FONT_SIZES.lg, // 18px
    fontWeight: FONT_WEIGHTS.normal, // 400
    lineHeight: LINE_HEIGHTS.normal, // 1.5
  },

  body: {
    fontSize: FONT_SIZES.base, // 16px
    fontWeight: FONT_WEIGHTS.normal, // 400
    lineHeight: LINE_HEIGHTS.normal, // 1.5
  },

  bodySm: {
    fontSize: FONT_SIZES.sm, // 14px
    fontWeight: FONT_WEIGHTS.normal, // 400
    lineHeight: LINE_HEIGHTS.normal, // 1.5
  },

  // Labels e pequenos textos
  label: {
    fontSize: FONT_SIZES.sm, // 14px
    fontWeight: FONT_WEIGHTS.medium, // 500
    lineHeight: LINE_HEIGHTS.normal, // 1.5
  },

  caption: {
    fontSize: FONT_SIZES.xs, // 12px
    fontWeight: FONT_WEIGHTS.medium, // 500
    lineHeight: LINE_HEIGHTS.snug, // 1.35
  },

  // Botões
  button: {
    fontSize: FONT_SIZES.base, // 16px
    fontWeight: FONT_WEIGHTS.semibold, // 600
    lineHeight: LINE_HEIGHTS.normal, // 1.5
  },

  buttonSm: {
    fontSize: FONT_SIZES.sm, // 14px
    fontWeight: FONT_WEIGHTS.semibold, // 600
    lineHeight: LINE_HEIGHTS.normal, // 1.5
  },

  // Inputs
  input: {
    fontSize: FONT_SIZES.base, // 16px
    fontWeight: FONT_WEIGHTS.normal, // 400
    lineHeight: LINE_HEIGHTS.normal, // 1.5
  },

  // Código
  mono: {
    fontSize: FONT_SIZES.sm, // 14px
    fontWeight: FONT_WEIGHTS.normal, // 400
    lineHeight: LINE_HEIGHTS.normal, // 1.5
    fontFamily: '"SF Mono", "Monaco", monospace',
  },
} as const;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// FAMÍLIA DE FONTES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const FONTS = {
  primary: {
    ios: '-apple-system, BlinkMacSystemFont, "Segoe UI"',
    android: '"Roboto"',
    fallback: '"Poppins", "Inter", sans-serif',
  },
  mono: '"SF Mono", "Monaco", "Courier New", monospace',
} as const;

export type TypographyKey = keyof typeof TYPOGRAPHY;
