/**
 * Web Design Colors - Cores exatas do app-redesign-studio
 * Usar estas cores para garantir consistência visual entre web e mobile
 *
 * @version 1.1.0
 * @source app-redesign-studio/src/index.css
 *
 * @example
 * ```tsx
 * import { WebColors, withOpacity, getThemeColor } from '@/theme/webColors';
 *
 * // Uso direto
 * <View style={{ backgroundColor: WebColors.rosa.main }} />
 *
 * // Com opacidade
 * <View style={{ backgroundColor: withOpacity(WebColors.rosa.main, 0.5) }} />
 *
 * // Gradientes
 * <LinearGradient colors={WebColors.gradients.nathIA} />
 *
 * // Dark mode aware
 * const bg = getThemeColor('rosa', 'main', isDark);
 * ```
 */

// ============================================
// TYPE DEFINITIONS
// ============================================

/** Cores do espectro rosa maternal */
export interface RosaColors {
  readonly main: string;
  readonly hover: string;
  readonly pale: string;
  readonly subtle: string;
  readonly light: string;
  readonly bg: string;
  readonly foreground: string;
}

/** Cores do espectro azul pastel */
export interface AzulColors {
  readonly main: string;
  readonly light: string;
  readonly subtle: string;
  readonly hover: string;
  readonly text: string;
}

/** Cores do espectro lilás premium */
export interface LilasColors {
  readonly main: string;
  readonly light: string;
  readonly subtle: string;
  readonly hover: string;
  readonly text: string;
}

/** Cores de estados semânticos */
export interface StatusColors {
  readonly success: string;
  readonly successBg: string;
  readonly successText: string;
  readonly warning: string;
  readonly warningBg: string;
  readonly warningText: string;
  readonly destructive: string;
  readonly errorBg: string;
  readonly errorText: string;
  readonly info: string;
  readonly infoBg: string;
  readonly infoText: string;
}

/** Gradientes disponíveis */
export interface GradientColors {
  readonly header: readonly [string, string, string];
  readonly headerRosaAzul: readonly [string, string, string];
  readonly primary: readonly [string, string];
  readonly nathIA: readonly [string, string, string];
  readonly calm: readonly [string, string];
  readonly card: readonly [string, string];
  readonly azul: readonly [string, string];
  readonly azulOverlay: readonly [string, string, string];
  readonly darkHeader: readonly [string, string, string];
  readonly darkNathIA: readonly [string, string, string];
}

/** Configuração de gradiente para LinearGradient */
export interface GradientConfig {
  readonly colors: readonly string[];
  readonly start: { readonly x: number; readonly y: number };
  readonly end: { readonly x: number; readonly y: number };
}

/** Tipo completo do WebColors */
export interface WebColorsType {
  readonly rosa: RosaColors;
  readonly azul: AzulColors;
  readonly lilas: LilasColors;
  readonly status: StatusColors;
  readonly gradients: GradientColors;
  readonly shadows: {
    readonly glow: string;
    readonly card: string;
    readonly elevated: string;
    readonly azulGlow: string;
  };
  readonly text: {
    readonly primary: string;
    readonly secondary: string;
    readonly tertiary: string;
    readonly inverse: string;
    readonly onRosa: string;
    readonly onAzul: string;
  };
  readonly border: {
    readonly default: string;
    readonly light: string;
    readonly medium: string;
    readonly azulLight: string;
  };
  readonly background: {
    readonly main: string;
    readonly card: string;
    readonly muted: string;
    readonly elevated: string;
  };
  readonly dark: {
    readonly background: string;
    readonly card: string;
    readonly elevated: string;
    readonly foreground: string;
    readonly rosa: string;
    readonly azul: string;
    readonly lilas: string;
    readonly border: string;
    readonly borderMedium: string;
  };
}

// ============================================
// COLOR DEFINITIONS
// ============================================

export const WebColors: WebColorsType = {
  // ==========================================
  // Rosa Maternal Principal (--primary no web)
  // Uso: 60% do design (headers, CTAs, destaques)
  // ==========================================
  rosa: {
    main: '#FF6B9D',       // HSL: 340 100% 71% - Rosa maternal principal
    hover: '#FF5A8F',      // Rosa hover (-5% lightness)
    pale: '#E8B8D1',       // Rosa disabled
    subtle: '#FFE8F0',     // Rosa muito sutil (--muted)
    light: '#FFB3D9',      // Rosa claro suave (--secondary)
    bg: '#FFF8FA',         // Background branco cálido maternal (--background)
    foreground: '#FFFFFF', // Texto sobre rosa
  },

  // ==========================================
  // Azul Pastel (--azul no web)
  // Uso: 20% do design (ícones info, badges, links secundários)
  // ==========================================
  azul: {
    main: '#5BA3D9',       // HSL: 210 70% 60% - Azul pastel vibrante
    light: '#B8D9F2',      // HSL: 210 80% 85% - Azul muito claro
    subtle: '#EDF5FB',     // HSL: 210 60% 95% - Background sutil
    hover: '#3D8CC7',      // HSL: 210 70% 50% - Hover state
    text: '#1A5A8A',       // HSL: 210 80% 35% - Texto sobre fundo claro
  },

  // ==========================================
  // Lilás Premium (--lilas no web)
  // Uso: Gradientes, destaques, elementos premium
  // ==========================================
  lilas: {
    main: '#BA68C8',       // HSL: 291 48% 60% - Lilás sofisticado
    light: '#D4A5E0',      // HSL: 291 55% 76% - Lilás claro
    subtle: '#E4D7F5',     // HSL: 267 65% 91% - Background sutil lilás
    hover: '#9F4DAD',      // HSL: 291 48% 49% - Hover state
    text: '#6B3F7A',       // HSL: 291 38% 36% - Texto sobre fundo claro
  },

  // ==========================================
  // Estados Semânticos
  // ==========================================
  status: {
    success: '#10B981',    // HSL: 160 84% 39%
    successBg: '#D1FAE5',  // HSL: 153 81% 95%
    successText: '#065F46',

    warning: '#F59E0B',    // HSL: 38 92% 50%
    warningBg: '#FFFAEB',  // HSL: 48 100% 96%
    warningText: '#78350F',

    destructive: '#DC2626', // HSL: 0 72% 51%
    errorBg: '#FEE2E2',    // HSL: 0 93% 94%
    errorText: '#7F1D1D',

    info: '#6366F1',       // HSL: 238 84% 67%
    infoBg: '#EEF2FF',     // HSL: 226 100% 97%
    infoText: '#312E81',
  },

  // ==========================================
  // Gradientes Web (convertidos para arrays RN)
  // ==========================================
  gradients: {
    // Header principal: from-pink-400 via-rose-400 to-azul-400
    header: ['#F472B6', '#FB7185', '#5BA3D9'] as const,

    // Header rosa-azul (60/40)
    headerRosaAzul: ['#FF6B9D', '#FB7185', '#5BA3D9'] as const,

    // Primary button
    primary: ['#FF6B9D', '#FF85B3'] as const,

    // NathIA card: from-rose-400 via-pink-400 to-purple-500
    nathIA: ['#FB7185', '#F472B6', '#A855F7'] as const,

    // Calm/subtle gradient
    calm: ['#FFF8FA', '#FFE8F0'] as const,

    // Card gradient
    card: ['#FFFFFF', '#FFF8FA'] as const,

    // Azul gradient (para sleep card)
    azul: ['#5BA3D9', '#3D8CC7'] as const,
    azulOverlay: ['transparent', 'rgba(91, 163, 217, 0.4)', 'rgba(91, 163, 217, 0.8)'] as const,

    // Dark mode gradients
    darkHeader: ['#4A3D5C', '#3D4A6B', '#2D3A5A'] as const,
    darkNathIA: ['#5A3D5C', '#4A3D6B', '#6B3D8A'] as const,
  },

  // ==========================================
  // Sombras Web (convertidas)
  // ==========================================
  shadows: {
    glow: 'rgba(255, 107, 157, 0.3)',      // shadow-glow rosa
    card: 'rgba(0, 0, 0, 0.08)',           // shadow-card
    elevated: 'rgba(255, 107, 157, 0.12)', // shadow-elevated
    azulGlow: 'rgba(91, 163, 217, 0.3)',   // shadow-glow azul
  },

  // ==========================================
  // Texto e Foreground
  // ==========================================
  text: {
    primary: '#4A4A4A',    // Cinza maternal (não preto puro)
    secondary: '#737373',  // Muted foreground
    tertiary: '#9CA3AF',   // Texto terciário
    inverse: '#FFFFFF',    // Texto em fundos escuros
    onRosa: '#FFFFFF',
    onAzul: '#FFFFFF',
  },

  // ==========================================
  // Bordas
  // ==========================================
  border: {
    default: '#E8D5DD',                    // Rosa suave para bordas
    light: 'rgba(255, 107, 157, 0.2)',     // Borda rosa light
    medium: 'rgba(255, 107, 157, 0.4)',    // Borda rosa medium
    azulLight: 'rgba(91, 163, 217, 0.5)',  // Borda azul light
  },

  // ==========================================
  // Background
  // ==========================================
  background: {
    main: '#FFF8FA',       // Branco cálido maternal
    card: '#FFFFFF',       // Cards
    muted: '#FFE8F0',      // Muted backgrounds
    elevated: '#FFFFFF',   // Surface elevada
  },

  // ==========================================
  // Dark Mode Variants
  // ==========================================
  dark: {
    background: '#1F1F2E',   // Fundo escuro suave
    card: '#2A2A3E',         // Surface card
    elevated: '#333347',     // Surface elevada
    foreground: '#F5F5F5',   // Texto claro
    rosa: '#FF85B3',         // Rosa mais clara para contraste
    azul: '#7BB8E0',         // Azul mais claro
    lilas: '#D4A5E0',        // Lilás mais claro
    border: 'rgba(255, 255, 255, 0.1)',
    borderMedium: 'rgba(255, 255, 255, 0.2)',
  },
} as const;

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Valida se uma string é uma cor hex válida
 */
export const isValidHex = (color: string): boolean => {
  return /^#([A-Fa-f0-9]{3}|[A-Fa-f0-9]{6}|[A-Fa-f0-9]{8})$/.test(color);
};

/**
 * Valida se uma string é uma cor rgba válida
 */
export const isValidRgba = (color: string): boolean => {
  return /^rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*(,\s*[\d.]+\s*)?\)$/.test(color);
};

/**
 * Converte cor hex para RGB
 */
export const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  const cleanHex = hex.replace('#', '');

  // Expande hex de 3 dígitos para 6
  const fullHex = cleanHex.length === 3
    ? cleanHex.split('').map(c => c + c).join('')
    : cleanHex;

  if (fullHex.length !== 6) return null;

  const r = parseInt(fullHex.substring(0, 2), 16);
  const g = parseInt(fullHex.substring(2, 4), 16);
  const b = parseInt(fullHex.substring(4, 6), 16);

  if (isNaN(r) || isNaN(g) || isNaN(b)) return null;

  return { r, g, b };
};

/**
 * Converte RGB para hex
 */
export const rgbToHex = (r: number, g: number, b: number): string => {
  const toHex = (n: number) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

/**
 * Helper para obter cor com opacidade
 * @param color - Cor em formato hex (#RRGGBB) ou rgba
 * @param opacity - Opacidade de 0 a 1
 * @returns Cor em formato rgba
 */
export const withOpacity = (color: string, opacity: number): string => {
  // Valida opacidade
  const validOpacity = Math.max(0, Math.min(1, opacity));

  // Se já é rgba, substitui a opacidade
  if (color.startsWith('rgba')) {
    return color.replace(/[\d.]+\)$/, `${validOpacity})`);
  }

  // Se é rgb, converte para rgba
  if (color.startsWith('rgb(')) {
    return color.replace('rgb(', 'rgba(').replace(')', `, ${validOpacity})`);
  }

  // Converte hex para rgba
  if (color.startsWith('#')) {
    const rgb = hexToRgb(color);
    if (rgb) {
      return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${validOpacity})`;
    }
  }

  // Fallback: retorna a cor original
  return color;
};

/**
 * Clareia uma cor hex
 * @param color - Cor em formato hex
 * @param amount - Quantidade de clareamento (0-1)
 */
export const lighten = (color: string, amount: number): string => {
  const rgb = hexToRgb(color);
  if (!rgb) return color;

  const { r, g, b } = rgb;
  const factor = Math.max(0, Math.min(1, amount));

  return rgbToHex(
    r + (255 - r) * factor,
    g + (255 - g) * factor,
    b + (255 - b) * factor
  );
};

/**
 * Escurece uma cor hex
 * @param color - Cor em formato hex
 * @param amount - Quantidade de escurecimento (0-1)
 */
export const darken = (color: string, amount: number): string => {
  const rgb = hexToRgb(color);
  if (!rgb) return color;

  const { r, g, b } = rgb;
  const factor = 1 - Math.max(0, Math.min(1, amount));

  return rgbToHex(r * factor, g * factor, b * factor);
};

/**
 * Obtém cor baseado no tema (light/dark)
 * @param category - Categoria da cor (rosa, azul, lilas)
 * @param variant - Variante da cor (main, light, etc)
 * @param isDark - Se está em dark mode
 */
export const getThemeColor = (
  category: 'rosa' | 'azul' | 'lilas',
  variant: string,
  isDark: boolean
): string => {
  if (isDark) {
    // Retorna variante dark se disponível
    const darkVariant = WebColors.dark[category as keyof typeof WebColors.dark];
    if (typeof darkVariant === 'string') return darkVariant;
  }

  // Retorna cor light mode
  const lightCategory = WebColors[category];
  const colorValue = (lightCategory as unknown as Record<string, string>)[variant];
  return colorValue ?? WebColors[category].main;
};

/**
 * Obtém gradiente baseado no tema
 */
export const getThemeGradient = (
  name: 'header' | 'nathIA',
  isDark: boolean
): readonly string[] => {
  if (isDark) {
    return name === 'header'
      ? WebColors.gradients.darkHeader
      : WebColors.gradients.darkNathIA;
  }
  return name === 'header'
    ? WebColors.gradients.header
    : WebColors.gradients.nathIA;
};

// ============================================
// GRADIENT CONFIGURATIONS
// ============================================

/**
 * Configurações de gradiente prontas para LinearGradient
 */
export const GradientConfigs: Record<string, GradientConfig> = {
  header: {
    colors: WebColors.gradients.header,
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  headerRosaAzul: {
    colors: WebColors.gradients.headerRosaAzul,
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  nathIA: {
    colors: WebColors.gradients.nathIA,
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  primary: {
    colors: WebColors.gradients.primary,
    start: { x: 0, y: 0 },
    end: { x: 1, y: 0 },
  },
  azulOverlay: {
    colors: WebColors.gradients.azulOverlay,
    start: { x: 0, y: 0 },
    end: { x: 0, y: 1 },
  },
  calm: {
    colors: WebColors.gradients.calm,
    start: { x: 0, y: 0 },
    end: { x: 0, y: 1 },
  },
  darkHeader: {
    colors: WebColors.gradients.darkHeader,
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  darkNathIA: {
    colors: WebColors.gradients.darkNathIA,
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
} as const;

// ============================================
// ACCESSIBILITY HELPERS
// ============================================

/**
 * Calcula luminância relativa de uma cor (WCAG)
 */
export const getLuminance = (color: string): number => {
  const rgb = hexToRgb(color);
  if (!rgb) return 0;

  const { r, g, b } = rgb;

  const sRGB = [r, g, b].map(c => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * sRGB[0] + 0.7152 * sRGB[1] + 0.0722 * sRGB[2];
};

/**
 * Calcula razão de contraste entre duas cores (WCAG)
 * @returns Razão de contraste (1 a 21)
 */
export const getContrastRatio = (color1: string, color2: string): number => {
  const l1 = getLuminance(color1);
  const l2 = getLuminance(color2);

  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return (lighter + 0.05) / (darker + 0.05);
};

/**
 * Verifica se o contraste atende WCAG AA (4.5:1 para texto normal)
 */
export const meetsWcagAA = (foreground: string, background: string): boolean => {
  return getContrastRatio(foreground, background) >= 4.5;
};

/**
 * Verifica se o contraste atende WCAG AAA (7:1 para texto normal)
 */
export const meetsWcagAAA = (foreground: string, background: string): boolean => {
  return getContrastRatio(foreground, background) >= 7;
};

/**
 * Sugere cor de texto ideal (preto ou branco) para um background
 */
export const getIdealTextColor = (backgroundColor: string): string => {
  const luminance = getLuminance(backgroundColor);
  return luminance > 0.179 ? WebColors.text.primary : WebColors.text.inverse;
};

export default WebColors;
