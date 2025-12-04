/**
 * Sistema de Border Radius e Borders - Nossa Maternidade
 *
 * Baseado em Flo: muito arredondado (humanidade)
 * Padrão: pill buttons, rounded cards
 *
 * @version 1.0
 * @date 2025-11-27
 */

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// BORDER RADIUS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const BORDER_RADIUS = {
  none: 0,
  sm: 4, // Minimal roundness
  base: 8, // Padrão (inputs, small cards)
  md: 12, // Medium (cards)
  lg: 16, // Large (modals, bigger cards)
  xl: 20, // XL (bottom sheets)
  '2xl': 24, // 2XL (hero cards)
  '3xl': 28, // 3XL (very large)
  full: 9999, // Pill (buttons, badges)
} as const;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// BORDER WIDTH
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const BORDER_WIDTH = {
  none: 0,
  thin: 0.5,
  base: 1,
  thick: 1.5,
  thick2: 2,
  thick3: 3,
} as const;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// COMPONENTES PRECOMPOSTOS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const BORDERS = {
  // Botões
  buttonRadius: BORDER_RADIUS.full, // Pill shape
  buttonBorder: BORDER_WIDTH.base,

  // Cards
  cardRadius: BORDER_RADIUS.lg, // 16px (Flo padrão)
  cardBorder: BORDER_WIDTH.base,

  // Inputs
  inputRadius: BORDER_RADIUS.full, // Pill shape
  inputBorder: BORDER_WIDTH.base,

  // Modals/Sheets
  modalRadius: BORDER_RADIUS.xl, // 20px top
  sheetRadius: BORDER_RADIUS.xl,

  // Badges/Tags
  badgeRadius: BORDER_RADIUS.full,

  // Avatares
  avatarRadius: BORDER_RADIUS.full, // Circular

  // Images em cards
  imageRadius: BORDER_RADIUS.lg, // Match card radius
} as const;
