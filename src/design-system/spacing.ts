/**
 * Sistema de Espaçamento - Nossa Maternidade
 *
 * Base 8px (Flo standard)
 * Escalável para componentes de qualquer tamanho
 *
 * @version 1.0
 * @date 2025-11-27
 */

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ESCALA 8-POINT GRID
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const SPACING = {
  0: 0,
  1: 4, // 0.25rem
  2: 8, // 0.5rem (base)
  3: 12, // 0.75rem
  4: 16, // 1rem
  5: 20, // 1.25rem
  6: 24, // 1.5rem
  7: 28, // 1.75rem
  8: 32, // 2rem
  9: 36, // 2.25rem
  10: 40, // 2.5rem
  11: 44, // 2.75rem (altura mínima touch)
  12: 48, // 3rem
  14: 56, // 3.5rem
  16: 64, // 4rem
  20: 80, // 5rem
  24: 96, // 6rem
  28: 112, // 7rem
  32: 128, // 8rem
} as const;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ALIASES (Semantic)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const PADDING = {
  xs: SPACING[2], // 8px (small elements)
  sm: SPACING[3], // 12px
  md: SPACING[4], // 16px (padrão)
  lg: SPACING[6], // 24px (cards, sections)
  xl: SPACING[8], // 32px (large sections)
  '2xl': SPACING[12], // 48px (hero sections)
} as const;

export const MARGIN = {
  xs: SPACING[2],
  sm: SPACING[3],
  md: SPACING[4],
  lg: SPACING[6],
  xl: SPACING[8],
  '2xl': SPACING[12],
  '3xl': SPACING[16],
  '4xl': SPACING[24],
} as const;

export const GAP = {
  xs: SPACING[2], // 8px (tight groups)
  sm: SPACING[3], // 12px
  md: SPACING[4], // 16px (padrão lists)
  lg: SPACING[6], // 24px (section groups)
  xl: SPACING[8], // 32px (large groups)
} as const;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TAMANHOS DE COMPONENTES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const SIZES = {
  // Touch targets (mínimo 44x44px)
  touchMin: SPACING[11], // 44px

  // Botões
  button: {
    small: SPACING[8], // 32px altura
    medium: SPACING[11], // 44px altura
    large: SPACING[12], // 48px altura
  },

  // Ícones
  icon: {
    xs: SPACING[4], // 16px
    sm: SPACING[5], // 20px
    md: SPACING[6], // 24px
    lg: SPACING[8], // 32px
    xl: SPACING[10], // 40px
  },

  // Avatares
  avatar: {
    xs: SPACING[8], // 32px
    sm: SPACING[10], // 40px
    md: SPACING[12], // 48px
    lg: SPACING[16], // 64px
  },

  // Container
  container: {
    max: 1280,
    mobile: '100%',
  },

  // Breakpoints (mobile-first)
  breakpoint: {
    xs: 320,
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
  },
} as const;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// LAYOUTINGS COMUNS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const LAYOUTS = {
  // Header
  headerHeight: SPACING[14], // 56px
  headerPadding: SPACING[4], // 16px horizontal

  // Bottom sheet (modals)
  bottomSheetMax: 600, // max height

  // Card spacing
  cardPadding: SPACING[4], // 16px
  cardGap: SPACING[3], // 12px between cards

  // Section spacing
  sectionSpacingVertical: SPACING[8], // 32px between sections
  sectionSpacingHorizontal: SPACING[4], // 16px horizontal padding

  // Form spacing
  formFieldGap: SPACING[4], // 16px entre campos
  formSectionGap: SPACING[6], // 24px entre grupos

  // List spacing
  listItemGap: SPACING[2], // 8px entre itens compactos
  listItemPadding: SPACING[3], // 12px padding itens
} as const;
