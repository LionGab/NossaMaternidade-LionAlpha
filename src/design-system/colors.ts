/**
 * Sistema de Cores - Nossa Maternidade
 *
 * Baseado em Flo.health mas com personalidade Nathália:
 * - Rosa mais quente (menos coral, mais magenta)
 * - Adicionado ouro/bronze (lifestyle)
 * - Tons terra (humanidade, acolhimento)
 *
 * @version 1.0
 * @date 2025-11-27
 */

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ROSA PRIMÁRIA (Brand)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const PRIMARY = {
  50: '#FFF5F8', // Mais claro (backgrounds)
  100: '#FFE5F0',
  200: '#FFCCDE',
  300: '#FF99BC',
  400: '#FF6E8F', // Flo Pink (padrão)
  500: '#0055B3', // Um pouco mais quente
  600: '#D94560', // Tom Nathália (mais magenta)
  700: '#C2334C',
  800: '#A01C39',
  900: '#7A0E2A', // Mais escuro para dark mode
} as const;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ROXO SECUNDÁRIO
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const PURPLE = {
  50: '#F8F3FF',
  100: '#EFE5FF',
  200: '#DCC8FF',
  300: '#C9B0FF',
  400: '#B599FF',
  500: '#A17FFF', // Roxo vibrante
  600: '#9370DB', // Tom espiritual
  700: '#7B5FB0',
  800: '#654A8A',
  900: '#3D2A52',
} as const;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// OURO/BRONZE (Lifestyle Nathália)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const GOLD = {
  50: '#FFFBF0',
  100: '#FFF6E0',
  200: '#FFECC0',
  300: '#FFD999',
  400: '#FFC166',
  500: '#FFA500', // Ouro principal
  600: '#E89400',
  700: '#C27D00',
  800: '#9B6500',
  900: '#654300',
} as const;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TERRA/BRONZE (Caloroso, acolhedor)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const EARTH = {
  50: '#F9F5F0',
  100: '#F3E8DC',
  200: '#DDCAB8',
  300: '#C7AD95',
  400: '#B08F73',
  500: '#9B7659', // Terra principal (maternidade)
  600: '#865D48',
  700: '#6B4637',
  800: '#5A3A2D',
  900: '#3E2820',
} as const;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// NEUTROS (Sistema base)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const NEUTRAL = {
  0: '#FFFFFF',
  50: '#FAFAFA',
  100: '#F5F5F5',
  150: '#EFEFEF',
  200: '#E8E8E8',
  300: '#D5D5D5',
  400: '#A0A0A0',
  500: '#757575',
  600: '#575757',
  700: '#404040',
  800: '#2A2A2A',
  900: '#0A0D14', // Quase preto (Flo original)
} as const;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CICLO MENSTRUAL (Educação + Identificação)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const CYCLE = {
  menstruation: '#DC2626', // Vermelho (sangue)
  follicular: '#FCD34D', // Amarelo (energia crescente)
  ovulation: '#EC4899', // Rosa quente (pico)
  luteal: '#8B5CF6', // Roxo (introspectivo)
} as const;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SEMÂNTICAS (Feedback colors)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const SEMANTIC = {
  success: '#10B981', // Verde (bem-estar)
  warning: '#F59E0B', // Âmbar (atenção)
  danger: '#EF4444', // Vermelho (perigo)
  info: '#3B82F6', // Azul (informação)
} as const;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SOMBRAS (Elevations)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const SHADOWS = {
  elevation0: 'transparent',
  elevation1: 'rgba(0, 0, 0, 0.04)',
  elevation2: 'rgba(0, 0, 0, 0.08)',
  elevation3: 'rgba(0, 0, 0, 0.12)',
  elevation4: 'rgba(0, 0, 0, 0.16)',
} as const;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// GRADIENTES (Marca Nathália)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const GRADIENTS = {
  // Hero inspiracional
  inspiration: {
    start: GOLD[400],
    end: PRIMARY[500],
  },
  // Bem-estar
  wellness: {
    start: PURPLE[500],
    end: PRIMARY[500],
  },
  // Terra/natureza
  nature: {
    start: EARTH[500],
    end: GOLD[500],
  },
  // Lunar/espiritual
  lunar: {
    start: PURPLE[600],
    end: PRIMARY[700],
  },
} as const;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TEMA COMPLETO
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const COLORS = {
  primary: PRIMARY,
  purple: PURPLE,
  gold: GOLD,
  earth: EARTH,
  neutral: NEUTRAL,
  cycle: CYCLE,
  semantic: SEMANTIC,
  shadows: SHADOWS,
  gradients: GRADIENTS,

  // Aliases para uso comum
  bg: {
    primary: NEUTRAL[0], // Branco (backgrounds claros)
    secondary: NEUTRAL[50], // Cinza muito claro
    tertiary: NEUTRAL[100], // Cinza claro
    accent: PRIMARY[50], // Rosa muito claro
  },

  text: {
    primary: NEUTRAL[900], // Quase preto (títulos)
    secondary: NEUTRAL[600], // Cinza (body text)
    tertiary: NEUTRAL[400], // Cinza claro (labels)
    inverse: NEUTRAL[0], // Branco (sobre dark)
  },

  border: {
    light: NEUTRAL[200],
    base: NEUTRAL[300],
    dark: NEUTRAL[500],
  },

  // Dark mode
  dark: {
    bg: NEUTRAL[900],
    bgSecondary: NEUTRAL[800],
    text: NEUTRAL[50],
    textSecondary: NEUTRAL[300],
  },
} as const;

export type ColorKey = keyof typeof COLORS;
