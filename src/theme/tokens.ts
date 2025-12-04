/**
 * Design System Tokens - Nossa Maternidade
 * Sistema unificado de design tokens com suporte a Light/Dark Mode
 * @version 2.0.0
 */

import { Dimensions, Platform } from 'react-native';

import type { ThemeColors as _ThemeColors } from './ThemeContext';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// ======================
// 🎨 COLOR TOKENS
// ======================

/**
 * Paleta de cores principal com escalas 50-900
 * Baseado em Material Design 3 + Nossa identidade maternal
 */
export const ColorTokens = {
  // Primary - Rosa Magenta Maternal (Screenshots reference)
  // Rosa vibrante usado em headers, botões e destaques
  primaryPink: {
    50: '#FFF1F4', // Lightest pink
    100: '#FFE4EB', // Very light pink
    200: '#FFCCD9', // Soft pink
    300: '#FFA8C0', // Light coral pink
    400: '#FF6B9D', // Rosa médio
    500: '#E91E63', // Rosa Magenta MAIN ⭐ (screenshots) - Material Pink 500
    600: '#D81B60', // Deep pink
    700: '#C2185B', // Darker pink
    800: '#AD1457', // Almost dark
    900: '#880E4F', // Darkest pink
  },

  // Primary - Rosa Magenta (Screenshots reference) [NOVO]
  // Cor principal do app conforme screenshots
  primary: {
    50: '#FCE4EC', // Lightest pink
    100: '#F8BBD9', // Very light pink
    200: '#F48FB1', // Soft pink
    300: '#F06292', // Light pink
    400: '#EC407A', // Mid-light pink
    500: '#E91E63', // Rosa Magenta MAIN ⭐ (screenshots)
    600: '#D81B60', // Deep pink
    700: '#C2185B', // Darker pink
    800: '#AD1457', // Dark pink
    900: '#880E4F', // Darkest pink
  },

  // Secondary - Roxo Vibrante (Screenshots reference)
  // Usado em gradientes com rosa e badges
  secondary: {
    50: '#F3E5F5', // Lightest purple
    100: '#E1BEE7', // Very light purple
    200: '#CE93D8', // Soft purple
    300: '#BA68C8', // Light purple
    400: '#AB47BC', // Mid purple
    500: '#9C27B0', // Roxo Vibrante MAIN ⭐ (screenshots) - Material Purple 500
    600: '#8E24AA', // Deep purple
    700: '#7B1FA2', // Darker purple
    800: '#6A1B9A', // Almost dark
    900: '#4A148C', // Darkest purple
  },

  // Neutral - Escala de cinzas moderna
  neutral: {
    0: '#FFFFFF',
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#E5E5E5',
    300: '#D4D4D4',
    400: '#A3A3A3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
    950: '#0A0A0A',
  },

  // Success - Verde suave
  success: {
    50: '#F0FDF4',
    100: '#DCFCE7',
    200: '#BBF7D0',
    300: '#86EFAC',
    400: '#4ADE80',
    500: '#10B981',
    600: '#059669',
    700: '#047857',
    800: '#065F46',
    900: '#064E3B',
  },

  // Warning - Laranja/Amarelo
  warning: {
    50: '#FFFBEB',
    100: '#FEF3C7',
    200: '#FDE68A',
    300: '#FCD34D',
    400: '#FBBF24',
    500: '#F59E0B',
    600: '#D97706',
    700: '#B45309',
    800: '#92400E',
    900: '#78350F',
  },

  // Error - Vermelho
  error: {
    50: '#FEF2F2',
    100: '#FEE2E2',
    200: '#FECACA',
    300: '#FCA5A5',
    400: '#F87171',
    500: '#EF4444',
    600: '#DC2626',
    700: '#B91C1C',
    800: '#991B1B',
    900: '#7F1D1D',
  },

  // Info - Azul claro
  info: {
    50: '#EFF6FF',
    100: '#DBEAFE',
    200: '#BFDBFE',
    300: '#93C5FD',
    400: '#60A5FA',
    500: '#3B82F6',
    600: '#2563EB',
    700: '#1D4ED8',
    800: '#1E40AF',
    900: '#1E3A8A',
  },

  // ⭐ Brand Colors (Screenshots reference)
  // Cores principais do design conforme screenshots
  brand: {
    primary: '#E91E63', // Rosa Magenta (main brand color)
    secondary: '#9C27B0', // Roxo vibrante
    bg: '#FAFAFA', // Fundo off-white (canvas)
    text: '#212121', // Texto escuro (primary text)
    pink: '#E91E63', // Rosa magenta principal
    purple: '#9C27B0', // Roxo principal
    // Escala completa rosa para consistência
    50: '#FCE4EC', // Lightest pink
    100: '#F8BBD9', // Very light pink
    200: '#F48FB1', // Light pink
    300: '#F06292', // Mid-light
    400: '#EC407A', // Mid pink
    500: '#E91E63', // MAIN pink ⭐
    600: '#D81B60', // Deep pink
    700: '#C2185B', // Darker
    800: '#AD1457', // Dark
    900: '#880E4F', // Darkest
  },

  // Accent colors (GeminiApp-inspired semantic colors)
  accent: {
    purple: '#8B5CF6',
    teal: '#14B8A6',
    orange: '#FB923C',
    pink: '#EC4899',
    green: '#10B981',
    blue: '#60A5FA', // Light ocean (for dark mode accents)
    // ⭐ GeminiApp Semantic Colors
    ocean: '#0EA5E9', // Sky 500 - primary action, trust
    oceanDeep: '#0369A1', // Sky 700 - darker accent
    oceanLight: '#E0F2FE', // Sky 100 - light backgrounds
    coral: '#F43F5E', // Rose 500 - emotional, likes, errors
    coralLight: '#FFE4E6', // Rose 100 - light coral bg
    mint: '#10B981', // Emerald 500 - success, completion
    mintLight: '#D1FAE5', // Emerald 100 - light mint bg
    sunshine: '#F59E0B', // Amber 500 - warning, premium, highlights
    sunshineLight: '#FEF3C7', // Amber 100 - light sunshine bg
    gold: '#FFA500', // Gold (lifestyle Nathalia)
    indigo: '#6366F1', // Indigo 500 - thinking mode
  },

  // Overlay System - For semi-transparent backgrounds
  overlay: {
    light: 'rgba(255, 255, 255, 0.25)', // Light overlay for dark backgrounds
    medium: 'rgba(0, 0, 0, 0.4)', // Medium overlay
    dark: 'rgba(0, 0, 0, 0.6)', // Dark overlay
    heavy: 'rgba(0, 0, 0, 0.7)', // Heavy overlay
    backdrop: 'rgba(0, 0, 0, 0.5)', // Modal backdrop
    card: 'rgba(255, 255, 255, 0.1)', // Card overlay for dark mode
    // ⭐ NOVOS: Overlays inspirados em Clean Slate e Catppuccin
    glass: 'rgba(255, 255, 255, 0.08)', // Glass effect suave
    glassStrong: 'rgba(255, 255, 255, 0.12)', // Glass effect forte
    darkGlass: 'rgba(0, 0, 0, 0.3)', // Glass dark mode
    blur: 'rgba(0, 0, 0, 0.45)', // Blur backdrop
    highlight: 'rgba(255, 122, 150, 0.15)', // Rosa highlight overlay
  },

  // Mood Colors - Emotional tracking (Lofee-inspired)
  mood: {
    happy: '#FFD93D', // Yellow - Happy/Joyful
    calm: '#6BCB77', // Green - Calm/Peaceful
    sad: '#4D96FF', // Blue - Sad
    anxious: '#FF6B6B', // Red - Anxious/Worried
    angry: '#FF4757', // Dark Red - Angry
    tired: '#A29BFE', // Purple - Tired
    energetic: '#FF9FF3', // Pink - Energetic
    loved: '#FF6B9D', // Rose - Loved
  },

  // Cycle Colors - Period/Fertility tracking (Lofee-inspired)
  cycle: {
    period: {
      main: '#FF6B9D',
      gradient: ['#FF6B9D', '#FF8A80'] as const,
    },
    fertile: {
      main: '#B794F6',
      gradient: ['#9C7CF4', '#B794F6'] as const,
    },
    ovulation: {
      main: '#7C4DFF',
      gradient: ['#7C4DFF', '#B388FF'] as const,
    },
    luteal: {
      main: '#FF80AB',
      gradient: ['#FF80AB', '#FF4081'] as const,
    },
  },

  // Category Colors - Content categories (Lofee-inspired)
  category: {
    dailyWoman: ['#FF6B9D', '#FF8A80'] as const,
    moodBooster: ['#7C4DFF', '#B388FF'] as const,
    spreadHappiness: ['#FFD93D', '#FF9500'] as const,
    healthTips: ['#6BCB77', '#4ECDC4'] as const,
    selfCare: ['#A29BFE', '#6C5CE7'] as const,
    pregnancy: ['#FF9FF3', '#F368E0'] as const,
    postpartum: ['#54A0FF', '#5F27CD'] as const,
    nutrition: ['#1DD1A1', '#10AC84'] as const,
  },

  // Notification Colors - Alert types
  notification: {
    ovulation: { main: '#7C4DFF', bg: '#7C4DFF20' },
    period: { main: '#FF6B9D', bg: '#FF6B9D20' },
    pregnancy: { main: '#FF9FF3', bg: '#FF9FF320' },
    reminder: { main: '#FFD93D', bg: '#FFD93D20' },
    mood: { main: '#FF6B6B', bg: '#FF6B6B20' },
    sleep: { main: '#A29BFE', bg: '#A29BFE20' },
    water: { main: '#54A0FF', bg: '#54A0FF20' },
    medicine: { main: '#6BCB77', bg: '#6BCB7720' },
    appointment: { main: '#FF9500', bg: '#FF950020' },
    general: { main: '#636E72', bg: '#636E7220' },
  },

  // ⭐ NathIA Gradients (Screenshots reference - centralizados)
  nathIA: {
    gradient: {
      light: ['#E91E63', '#9C27B0'] as const, // Rosa → Roxo (screenshots)
      dark: ['#F06292', '#BA68C8'] as const, // Rosa claro → Roxo claro (dark mode)
    },
    header: {
      light: ['#E91E63', '#9C27B0'] as const, // Header gradient (screenshots)
      dark: ['#D81B60', '#8E24AA'] as const, // Header dark mode
    },
    warm: {
      light: ['#E91E63', '#EC407A', '#F06292'] as const, // Rosa gradient
      dark: ['#F06292', '#F48FB1', '#F8BBD9'] as const, // Rosa claro gradient
    },
    accent: {
      light: '#E91E63', // Rosa magenta main
      dark: '#F06292', // Rosa light
    },
    text: {
      light: '#FFFFFF',
      dark: '#FFFFFF',
    },
    badge: {
      success: {
        bg: 'rgba(76, 175, 80, 0.2)', // Verde success
        text: '#4CAF50', // Verde Material
      },
      novo: {
        bg: '#FFC107', // Amarelo (badge NOVO)
        text: '#212121', // Texto escuro
      },
      online: {
        bg: 'rgba(76, 175, 80, 0.2)', // Verde online
        text: '#4CAF50', // Verde
      },
    },
    button: {
      primary: '#E91E63', // Rosa magenta
      secondary: '#9C27B0', // Roxo
    },
    shadow: 'rgba(233, 30, 99, 0.3)', // Rosa shadow
  },

  // ⭐ NOVO: Content Type Colors (para EmpatheticHighlights, HighlightsList, etc.)
  contentType: {
    video: {
      light: '#4ECDC4', // Teal vibrante
      dark: '#3BB3B5', // Teal escuro
      bg: { light: 'rgba(78, 205, 196, 0.15)', dark: 'rgba(59, 179, 181, 0.25)' },
    },
    audio: {
      light: '#A78BFA', // Roxo suave
      dark: '#C4B5FD', // Roxo claro
      bg: { light: 'rgba(167, 139, 250, 0.15)', dark: 'rgba(196, 181, 253, 0.25)' },
    },
    story: {
      light: '#FF6B9D', // Rosa coral
      dark: '#FF8FAF', // Rosa suave
      bg: { light: 'rgba(255, 107, 157, 0.15)', dark: 'rgba(255, 143, 175, 0.25)' },
    },
    article: {
      light: '#60A5FA', // Azul info
      dark: '#93C5FD', // Azul claro
      bg: { light: 'rgba(96, 165, 250, 0.15)', dark: 'rgba(147, 197, 253, 0.25)' },
    },
    guide: {
      light: '#F59E0B', // Amber
      dark: '#FCD34D', // Amber claro
      bg: { light: 'rgba(245, 158, 11, 0.15)', dark: 'rgba(252, 211, 77, 0.25)' },
    },
  },

  // ⭐ NOVO: Mood Chip Colors (para EmpatheticMoodChips, MoodChips, etc.)
  moodChip: {
    sobrecarregada: {
      bg: { light: '#FFE8EC', dark: '#3D1A24' },
      border: { light: '#FFB5C5', dark: '#8B3A4A' },
      text: { light: '#9F1239', dark: '#FECDD3' },
      icon: '😓',
    },
    precisandoApoio: {
      bg: { light: '#E8F4FF', dark: '#1A2840' },
      border: { light: '#93C5FD', dark: '#3B82F6' },
      text: { light: '#1E40AF', dark: '#BFDBFE' },
      icon: '🤗',
    },
    tranquila: {
      bg: { light: '#F0F8FF', dark: '#1A1E2E' },
      border: { light: '#BFDBFE', dark: '#60A5FA' },
      text: { light: '#1E3A8A', dark: '#DBEAFE' },
      icon: '😌',
    },
    comEsperanca: {
      bg: { light: '#FFF8E8', dark: '#3D351A' },
      border: { light: '#FDE047', dark: '#EAB308' },
      text: { light: '#854D0E', dark: '#FEF9C3' },
      icon: '🌟',
    },
    feliz: {
      bg: { light: '#FEF9C3', dark: '#422006' },
      border: { light: '#FDE047', dark: '#CA8A04' },
      text: { light: '#713F12', dark: '#FEF08A' },
      icon: '😊',
    },
    amada: {
      bg: { light: '#FCE7F3', dark: '#500724' },
      border: { light: '#F9A8D4', dark: '#DB2777' },
      text: { light: '#9D174D', dark: '#FBCFE8' },
      icon: '🥰',
    },
    outro: {
      bg: { light: '#F5F5F5', dark: '#2A2A2A' },
      border: { light: '#D4D4D4', dark: '#525252' },
      text: { light: '#525252', dark: '#D4D4D4' },
      icon: '💭',
    },
    // ⭐ NOVO: Moods V2 (EmpatheticMoodChipsV2)
    // Mapeamento para compatibilidade com V2 (usando hífen nos IDs)
    cansada: {
      bg: { light: '#FFE8EC', dark: '#3D1A24' }, // Rosa suave (cansada/exausta)
      border: { light: '#FFB5C5', dark: '#8B3A4A' },
      text: { light: '#9F1239', dark: '#FECDD3' },
      icon: '😮‍💨',
    },
    'precisando-colo': {
      bg: { light: '#E8F4FF', dark: '#1A2840' }, // Azul acolhedor
      border: { light: '#93C5FD', dark: '#3B82F6' },
      text: { light: '#1E40AF', dark: '#BFDBFE' },
      icon: '💙',
    },
    ansiosa: {
      bg: { light: '#FFF3E8', dark: '#3D2A1A' }, // Laranja suave
      border: { light: '#FDBA74', dark: '#F97316' },
      text: { light: '#9A3412', dark: '#FED7AA' },
      icon: '😰',
    },
    'em-paz': {
      bg: { light: '#E8FFF0', dark: '#1A3D24' }, // Verde sereno
      border: { light: '#86EFAC', dark: '#22C55E' },
      text: { light: '#065F46', dark: '#D1FAE5' },
      icon: '😌',
    },
    esperancosa: {
      bg: { light: '#FFFBE8', dark: '#3D351A' }, // Amarelo suave
      border: { light: '#FDE047', dark: '#EAB308' },
      text: { light: '#854D0E', dark: '#FEF9C3' },
      icon: '🌟',
    },
    grata: {
      bg: { light: '#F3E8FF', dark: '#2A1A3D' }, // Roxo espiritual
      border: { light: '#C4B5FD', dark: '#8B5CF6' },
      text: { light: '#5B21B6', dark: '#DDD6FE' },
      icon: '🙏',
    },
    outra: {
      bg: { light: '#F5F5F5', dark: '#2A2A2A' }, // Neutro
      border: { light: '#D4D4D4', dark: '#525252' },
      text: { light: '#525252', dark: '#D4D4D4' },
      icon: '💭',
    },
  },

  // ⭐ NOVO: Chat Colors (centralizados para ChatScreen)
  chat: {
    userBubble: {
      bg: { light: '#007AFF', dark: '#60A5FA' },
      text: { light: '#FFFFFF', dark: '#FFFFFF' },
    },
    aiBubble: {
      bg: { light: '#F3F4F6', dark: '#2A2A2A' },
      text: { light: '#1F2937', dark: '#F9FAFB' },
      border: { light: '#E5E7EB', dark: '#374151' },
    },
    input: {
      bg: { light: '#F3F4F6', dark: '#1F2937' },
      text: { light: '#1F2937', dark: '#F9FAFB' },
      placeholder: { light: '#6B7280', dark: '#9CA3AF' },
      border: { light: '#E5E7EB', dark: '#374151' },
    },
    timestamp: {
      text: { light: '#9CA3AF', dark: '#6B7280' },
    },
    typing: {
      dot: { light: '#9CA3AF', dark: '#6B7280' },
    },
  },

  // ⭐ NOVO: Extra Oomph Colors (cores vibrantes para destaque)
  vibrant: {
    // Gradientes premium para CTAs e elementos de destaque
    sunrise: ['#FF6B6B', '#FF8E53', '#FFC93C'] as const, // Vermelho → Laranja → Amarelo
    ocean: ['#667EEA', '#764BA2'] as const, // Azul → Roxo
    aurora: ['#A8E6CF', '#88D8B0', '#6FCF97'] as const, // Verde gradiente
    sunset: ['#FA709A', '#FEE140'] as const, // Rosa → Amarelo
    cosmic: ['#8B5CF6', '#EC4899', '#EF4444'] as const, // Roxo → Rosa → Vermelho
    dream: ['#FFECD2', '#FCB69F'] as const, // Pêssego suave
    mint: ['#A8E6CF', '#DCEDC1'] as const, // Mint suave
    lavender: ['#E0C3FC', '#8EC5FC'] as const, // Lavanda → Azul claro

    // Cores sólidas vibrantes para badges e destaques
    coral: '#FF6B6B',
    teal: '#4ECDC4',
    gold: '#FFC93C',
    violet: '#8B5CF6',
    rose: '#EC4899',
    emerald: '#10B981',
    sky: '#38BDF8',
    amber: '#F59E0B',
  },

  // Mint System (web reference - success/positive accent)
  mint: {
    50: '#F0FDFA',
    100: '#CCFBF1',
    200: '#99F6E4',
    300: '#5EEAD4',
    400: '#236B62', // Mint (main) - web reference
    500: '#0F5247', // Deep mint
    600: '#0D4B3F',
    700: '#0B4037',
    800: '#09362F',
    900: '#072D27',
  },

  // ⭐ NOVO: Sage (Verde Wellness - Airbnb/Flo inspired)
  sage: {
    50: '#F0FDF7', // Lightest sage
    100: '#DCFCE7', // Very light
    200: '#BBF7D0', // Light
    300: '#86EFAC', // Soft sage
    400: '#7DD4B0', // Sage MAIN ⭐ (wellness, completed)
    500: '#5CC99B', // Mid sage
    600: '#4ADE80', // Vibrant
    700: '#22C55E', // Deep sage
    800: '#16A34A', // Darker
    900: '#15803D', // Darkest
  },

  // ⭐ NOVO: Coral (Accent para CTAs e destaques)
  coral: {
    50: '#FFF5F5',
    100: '#FFE4E6',
    200: '#FECDD3',
    300: '#FDA4AF',
    400: '#FB7185', // Coral MAIN
    500: '#F43F5E', // Vibrant coral
    600: '#E11D48',
    700: '#BE123C',
    800: '#9F1239',
    900: '#881337',
  },

  // ⭐ PADRONIZADO: Header Gradients (Screenshots reference)
  // Usado em TODOS os headers das páginas
  header: {
    // Gradiente principal: pink-400 → rose-400 → purple-400 (opacity 95%)
    gradient: {
      light: ['#F472B6', '#FB7185', '#A855F7'] as const, // pink-400 → rose-400 → purple-400
      dark: ['#EC4899', '#F43F5E', '#9333EA'] as const, // pink-500 → rose-500 → purple-600 (dark mode)
    },
    // Overlay: from-black/10 via-transparent to-transparent
    overlay: {
      start: 'rgba(0, 0, 0, 0.10)',
      middle: 'transparent',
      end: 'transparent',
    },
    // Altura padrão do header
    height: {
      small: 120, // Headers compactos
      medium: 160, // Headers padrão (Home, Chat)
      large: 200, // Headers expandidos (Perfil, Community)
      hero: 280, // Hero headers (Onboarding)
    },
    // Blur orbs padronizados
    blurOrbs: {
      // Bolha superior direita: w-40 h-40 bg-white/15 blur-3xl -mr-24 -mt-24
      topRight: {
        size: 160, // w-40 h-40 (40 * 4 = 160)
        color: 'rgba(255, 255, 255, 0.15)', // bg-white/15
        blur: 64, // blur-3xl
        offset: { x: 96, y: -96 }, // -mr-24 -mt-24 (24 * 4 = 96)
      },
      // Bolha inferior esquerda: w-32 h-32 bg-pink-200/25 blur-3xl -ml-20 -mb-20
      bottomLeft: {
        size: 128, // w-32 h-32 (32 * 4 = 128)
        color: 'rgba(251, 207, 232, 0.25)', // bg-pink-200/25 (#FBCFE8)
        blur: 64, // blur-3xl
        offset: { x: -80, y: 80 }, // -ml-20 -mb-20 (20 * 4 = 80)
      },
    },
  },
} as const;

/**
 * Semantic color mappings para Light Mode
 * ⭐ ATUALIZADO: Design baseado nos screenshots (Rosa/Magenta + Roxo)
 */
export const LightTheme = {
  // Backgrounds - Branco/Off-white (screenshots)
  background: {
    canvas: '#FAFAFA', // ⭐ ATUALIZADO: Off-white (screenshots)
    beige: '#F5F5F5', // Cinza muito claro
    warm: '#FFF5F7', // Rosa muito suave
    peach: '#FCE4EC', // Rosa claro
    card: '#FFFFFF', // Branco puro para cards
    elevated: '#FFFFFF', // Superfícies elevadas
    input: '#F5F5F5', // Input background
    overlay: 'rgba(0, 0, 0, 0.5)',
    gradient: {
      primary: ColorTokens.header.gradient.light, // pink-400 → rose-400 → purple-400 (PADRONIZADO)
      soft: ['#FCE4EC', '#F3E5F5'], // Rosa claro → Roxo claro
      warm: ['#FFFFFF', '#FFF5F7'], // Branco → Rosa suave
      header: ColorTokens.header.gradient.light, // Header gradient (PADRONIZADO)
      // ⭐ NathIA gradient
      nathIA: ColorTokens.header.gradient.light, // pink-400 → rose-400 → purple-400 (PADRONIZADO)
    },
  },

  // Text - Cores de texto (screenshots)
  text: {
    primary: '#212121', // Texto escuro principal (Material Grey 900)
    secondary: '#424242', // Texto secundário (Material Grey 800)
    tertiary: '#616161', // Texto terciário (Material Grey 700)
    disabled: '#9E9E9E', // Texto desabilitado (Material Grey 500)
    placeholder: '#757575', // Placeholder (Material Grey 600)
    inverse: '#FFFFFF', // Texto em fundos escuros
    link: '#E91E63', // Links em rosa magenta
    success: '#388E3C', // Verde success (Material Green 700)
    warning: '#F57C00', // Laranja warning (Material Orange 700)
    error: '#D32F2F', // Vermelho error (Material Red 700)
    info: '#1976D2', // Azul info (Material Blue 700)
  },

  // Borders
  border: {
    light: 'rgba(0, 0, 0, 0.08)',
    medium: '#E0E0E0', // Material Grey 300
    dark: 'rgba(0, 0, 0, 0.16)',
    focus: '#E91E63', // Rosa magenta focus
    error: '#D32F2F', // Vermelho error
    success: '#388E3C', // Verde success
  },

  // Primary - Rosa Magenta (Screenshots) ⭐ ATUALIZADO
  primary: {
    main: ColorTokens.primary[500], // #E91E63 Rosa Magenta
    light: ColorTokens.primary[100], // #F8BBD9 Very light pink
    dark: ColorTokens.primary[700], // #C2185B Darker pink
    gradient: ['#E91E63', '#D81B60', '#C2185B'], // Rosa gradient
    // Rosa (compatibilidade)
    pink: {
      main: ColorTokens.primaryPink[500], // #E91E63 Rosa Magenta
      light: ColorTokens.primaryPink[100], // #FFE4EB Very light pink
      dark: ColorTokens.primaryPink[700], // #C2185B Darker pink
      gradient: ['#E91E63', '#D81B60', '#C2185B'], // Rosa gradient
    },
  },

  // Secondary - Roxo Vibrante (Screenshots) ⭐ ATUALIZADO
  secondary: {
    main: ColorTokens.secondary[500], // #9C27B0 Roxo vibrante
    light: ColorTokens.secondary[100], // #E1BEE7 Very light purple
    dark: ColorTokens.secondary[700], // #7B1FA2 Deep purple
    gradient: ['#9C27B0', '#8E24AA', '#7B1FA2'], // Roxo gradient
  },

  // Status colors - Material Design colors
  status: {
    success: '#4CAF50', // Material Green 500
    warning: '#FFC107', // Material Amber 500 (badge NOVO)
    error: '#F44336', // Material Red 500
    info: '#2196F3', // Material Blue 500
  },

  // Gradients
  gradients: {
    success: ['#66BB6A', '#4CAF50', '#388E3C'], // Green gradient
    warning: ['#FFCA28', '#FFC107', '#FFA000'], // Amber gradient
    error: ['#EF5350', '#F44336', '#D32F2F'], // Red gradient
    info: ['#42A5F5', '#2196F3', '#1976D2'], // Blue gradient
    maternal: ['#E91E63', '#D81B60', '#C2185B'], // Rosa Magenta gradient
    spiritual: ['#AB47BC', '#9C27B0', '#7B1FA2'], // Roxo gradient
    // ⭐ Header gradient (PADRONIZADO: pink-400 → rose-400 → purple-400)
    header: ColorTokens.header.gradient.light, // ['#F472B6', '#FB7185', '#A855F7']
    nathIA: ColorTokens.header.gradient.light, // NathIA gradient (PADRONIZADO)
    // Gradientes adicionais
    hero: ColorTokens.header.gradient.light, // Hero banner (PADRONIZADO)
    wellness: ['#66BB6A', '#4CAF50'] as const, // Verde wellness
    premium: ['#AB47BC', '#9C27B0'] as const, // Premium roxo
    card: ['#FFFFFF', '#FFF5F7'] as const, // Card subtle gradient
    search: ['#FFFFFF', '#F5F5F5'] as const, // Search pill gradient
  },

  // Tertiary colors (Verde/Success)
  tertiary: {
    main: '#4CAF50', // Verde main
    light: '#81C784', // Light green
    dark: '#388E3C', // Dark green
    gradient: ['#66BB6A', '#4CAF50', '#388E3C'] as const,
  },
};

/**
 * Semantic color mappings para Dark Mode (Premium Dark Theme)
 * ⭐ ATUALIZADO: Design baseado nos screenshots (Rosa/Magenta + Roxo)
 */
export const DarkTheme = {
  // Backgrounds - Escuro premium
  background: {
    canvas: '#121212', // Material Dark background
    card: '#1E1E1E', // Card escuro
    elevated: '#2D2D2D', // Superfície elevada
    surface: '#1A1A1A', // Superfície alternativa
    input: '#2D2D2D', // Input background
    overlay: 'rgba(0, 0, 0, 0.7)',
    gradient: {
      primary: ColorTokens.header.gradient.dark, // pink-500 → rose-500 → purple-600 (PADRONIZADO)
      soft: ['#1E1E1E', '#2D2D2D'], // Cards gradient
      card: ['#1E1E1E', '#252525'], // Card gradient
      header: ColorTokens.header.gradient.dark, // Header gradient dark (PADRONIZADO)
      nathIA: ColorTokens.header.gradient.dark, // NathIA gradient dark (PADRONIZADO)
    },
  },

  // Text - Cores de texto dark mode
  text: {
    primary: '#FFFFFF', // Branco puro
    secondary: '#E0E0E0', // Cinza claro (Material Grey 300)
    tertiary: '#BDBDBD', // Cinza médio (Material Grey 400)
    disabled: '#757575', // Cinza desabilitado (Material Grey 600)
    placeholder: '#9E9E9E', // Placeholder (Material Grey 500)
    inverse: '#121212', // Texto em fundos claros
    link: '#F48FB1', // Links em rosa claro
    success: '#81C784', // Verde claro (Material Green 300)
    warning: '#FFD54F', // Amarelo claro (Material Amber 300)
    error: '#EF5350', // Vermelho claro (Material Red 400)
    info: '#64B5F6', // Azul claro (Material Blue 300)
  },

  // Borders - Dark mode
  border: {
    light: 'rgba(255, 255, 255, 0.08)',
    medium: '#424242', // Material Grey 800
    dark: 'rgba(255, 255, 255, 0.16)',
    focus: '#F06292', // Rosa light focus
    error: '#EF5350', // Vermelho light
    success: '#81C784', // Verde light
  },

  // Primary - Rosa Light (Dark mode)
  primary: {
    main: '#F06292', // Rosa light (melhor contraste em dark mode)
    light: '#F48FB1', // Rosa mais claro
    dark: '#EC407A', // Rosa médio
    gradient: ['#F48FB1', '#F06292', '#EC407A'], // Rosa light gradient
    // Rosa (compatibilidade)
    pink: {
      main: '#F06292', // Rosa light
      light: '#F48FB1', // Rosa mais claro
      dark: '#EC407A', // Rosa médio
      gradient: ['#F48FB1', '#F06292', '#EC407A'], // Rosa light gradient
    },
  },

  // Secondary - Roxo Light (Dark mode)
  secondary: {
    main: '#BA68C8', // Roxo light (dark mode friendly)
    light: '#CE93D8', // Roxo mais claro
    dark: '#AB47BC', // Roxo médio
    gradient: ['#CE93D8', '#BA68C8', '#AB47BC'], // Roxo light gradient
  },

  // Status colors - lighter for dark mode
  status: {
    success: '#81C784', // Material Green 300
    warning: '#FFD54F', // Material Amber 300
    error: '#EF5350', // Material Red 400
    info: '#64B5F6', // Material Blue 300
  },

  // Gradients - brighter for dark mode
  gradients: {
    success: ['#A5D6A7', '#81C784', '#66BB6A'], // Green light gradient
    warning: ['#FFE082', '#FFD54F', '#FFCA28'], // Amber light gradient
    error: ['#EF9A9A', '#EF5350', '#E57373'], // Red light gradient
    info: ['#90CAF9', '#64B5F6', '#42A5F5'], // Blue light gradient
    maternal: ['#F48FB1', '#F06292', '#EC407A'], // Rosa light gradient
    spiritual: ['#CE93D8', '#BA68C8', '#AB47BC'], // Roxo light gradient
    // Header gradient dark (PADRONIZADO)
    header: ColorTokens.header.gradient.dark, // pink-500 → rose-500 → purple-600
    nathIA: ColorTokens.header.gradient.dark, // NathIA gradient dark (PADRONIZADO)
    hero: ColorTokens.header.gradient.dark, // Hero gradient dark (PADRONIZADO)
    // Warm gradient
    warm: ['#FFD54F', '#FFCA28', '#FFC107'] as const, // Warm amber gradient
  },
};

// ======================
// ✍️ TYPOGRAPHY TOKENS
// ======================

export const Typography = {
  // Font families - System fonts otimizados
  fonts: {
    body: Platform.select({
      // alias for regular
      ios: 'System',
      android: 'Roboto',
      default: 'System',
    }),
    regular: Platform.select({
      ios: 'System',
      android: 'Roboto',
      default: 'System',
    }),
    medium: Platform.select({
      ios: 'System',
      android: 'Roboto-Medium',
      default: 'System',
    }),
    semibold: Platform.select({
      ios: 'System',
      android: 'Roboto-Medium',
      default: 'System',
    }),
    bold: Platform.select({
      ios: 'System',
      android: 'Roboto-Bold',
      default: 'System',
    }),
  },

  // Font sizes - Mobile optimized
  sizes: {
    '3xs': 10,
    '2xs': 11,
    xs: 12,
    sm: 14,
    base: 16, // alias for md
    md: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 28,
    '4xl': 32,
    '5xl': 36,
    '6xl': 42,
    '7xl': 48,
  },

  // Line heights
  lineHeights: {
    '3xs': 14,
    '2xs': 16,
    xs: 18,
    sm: 20,
    base: 24, // alias for md
    md: 24,
    lg: 26,
    xl: 28,
    '2xl': 32,
    '3xl': 36,
    '4xl': 40,
    '5xl': 44,
    '6xl': 52,
    '7xl': 60,
  },

  // Letter spacing
  letterSpacing: {
    tighter: -0.5,
    tight: -0.25,
    normal: 0,
    wide: 0.25,
    wider: 0.5,
    widest: 1,
  },

  // Font weights
  weights: {
    light: '300' as const,
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
  },
} as const;

// ======================
// 📝 SEMANTIC TEXT STYLES (Flo-inspired + Material Design 3)
// ======================

/**
 * Semantic Text Styles - Use these instead of raw Typography.sizes
 *
 * Inspirado em:
 * - Flo app (period tracker)
 * - Material Design 3 (Google)
 * - Apple Human Interface Guidelines
 *
 * @example
 * // ❌ ANTES (hardcoded, inconsistente)
 * <Text style={{ fontSize: 28, fontWeight: '700', lineHeight: 36 }}>
 *   Olá, mãe!
 * </Text>
 *
 * // ✅ DEPOIS (semântico, consistente)
 * import { TextStyles } from '@/theme/tokens';
 * <Text style={TextStyles.displayMedium}>
 *   Olá, mãe!
 * </Text>
 */
export const TextStyles = {
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // DISPLAYS (Títulos de página, hero headlines)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  displayLarge: {
    fontSize: Typography.sizes['4xl'], // 32
    fontWeight: Typography.weights.bold, // 700
    lineHeight: Typography.lineHeights['4xl'], // 40
    letterSpacing: -0.25,
  } as const,

  displayMedium: {
    fontSize: Typography.sizes['3xl'], // 28
    fontWeight: Typography.weights.bold, // 700
    lineHeight: Typography.lineHeights['3xl'], // 36
    letterSpacing: 0,
  } as const,

  displaySmall: {
    fontSize: Typography.sizes['2xl'], // 24
    fontWeight: Typography.weights.semibold, // 600
    lineHeight: Typography.lineHeights['2xl'], // 32
    letterSpacing: 0,
  } as const,

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // TITLES (Card headers, section titles)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  titleLarge: {
    fontSize: Typography.sizes.xl, // 20
    fontWeight: Typography.weights.semibold, // 600
    lineHeight: Typography.lineHeights.xl, // 28
    letterSpacing: 0,
  } as const,

  titleMedium: {
    fontSize: Typography.sizes.lg, // 18
    fontWeight: Typography.weights.medium, // 500
    lineHeight: Typography.lineHeights.lg, // 26
    letterSpacing: 0.15,
  } as const,

  titleSmall: {
    fontSize: Typography.sizes.md, // 16
    fontWeight: Typography.weights.medium, // 500
    lineHeight: Typography.lineHeights.md, // 24
    letterSpacing: 0.1,
  } as const,

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // BODY TEXT (Paragraph text, descriptions)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  bodyLarge: {
    fontSize: Typography.sizes.md, // 16
    fontWeight: Typography.weights.regular, // 400
    lineHeight: Typography.lineHeights.md, // 24
    letterSpacing: 0.5,
  } as const,

  bodyMedium: {
    fontSize: Typography.sizes.sm, // 14
    fontWeight: Typography.weights.regular, // 400
    lineHeight: Typography.lineHeights.sm, // 20
    letterSpacing: 0.25,
  } as const,

  bodySmall: {
    fontSize: Typography.sizes.xs, // 12
    fontWeight: Typography.weights.regular, // 400
    lineHeight: Typography.lineHeights.xs, // 18
    letterSpacing: 0.4,
  } as const,

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // LABELS (Buttons, chips, form labels, captions)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  labelLarge: {
    fontSize: Typography.sizes.sm, // 14
    fontWeight: Typography.weights.semibold, // 600
    lineHeight: Typography.lineHeights.sm, // 20
    letterSpacing: 0.1,
    textTransform: 'none' as const,
  } as const,

  labelMedium: {
    fontSize: Typography.sizes.xs, // 12
    fontWeight: Typography.weights.semibold, // 600
    lineHeight: Typography.lineHeights.xs, // 18
    letterSpacing: 0.5,
    textTransform: 'none' as const,
  } as const,

  labelSmall: {
    fontSize: 11, // 11
    fontWeight: Typography.weights.medium, // 500
    lineHeight: 16,
    letterSpacing: 0.5,
    textTransform: 'uppercase' as const, // Flo usa uppercase em tiny labels
  } as const,

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ALIASES (Para uso comum, backwards compatibility)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  h1: {
    fontSize: Typography.sizes['5xl'], // 40
    fontWeight: Typography.weights.extrabold, // 800
    lineHeight: Typography.lineHeights['5xl'], // 44
    letterSpacing: -1,
  } as const,

  h2: {
    fontSize: Typography.sizes['4xl'], // 32
    fontWeight: Typography.weights.bold, // 700
    lineHeight: Typography.lineHeights['4xl'], // 40
    letterSpacing: -0.5,
  } as const,

  h3: {
    fontSize: Typography.sizes['3xl'], // 28
    fontWeight: Typography.weights.bold, // 700
    lineHeight: Typography.lineHeights['3xl'], // 36
    letterSpacing: 0,
  } as const,

  h4: {
    fontSize: Typography.sizes['2xl'], // 24
    fontWeight: Typography.weights.semibold, // 600
    lineHeight: Typography.lineHeights['2xl'], // 32
  } as const,

  h5: {
    fontSize: Typography.sizes.lg, // 18
    fontWeight: Typography.weights.semibold, // 600
    lineHeight: Typography.lineHeights.lg, // 26
  } as const,

  h6: {
    fontSize: Typography.sizes.base, // 16
    fontWeight: Typography.weights.semibold, // 600
    lineHeight: Typography.lineHeights.md, // 24
  } as const,

  body: {
    fontSize: Typography.sizes.base, // 16
    fontWeight: Typography.weights.regular, // 400
    lineHeight: Typography.lineHeights.md, // 24
  } as const,

  caption: {
    fontSize: Typography.sizes.xs, // 12
    fontWeight: Typography.weights.medium, // 500
    lineHeight: Typography.lineHeights.xs, // 18
  } as const,

  button: {
    fontSize: Typography.sizes.base, // 16
    fontWeight: Typography.weights.semibold, // 600
    lineHeight: Typography.lineHeights.md, // 24
  } as const,

  buttonSmall: {
    fontSize: Typography.sizes.sm, // 14
    fontWeight: Typography.weights.semibold, // 600
    lineHeight: Typography.lineHeights.sm, // 20
  } as const,
} as const;

// ======================
// 📐 SPACING TOKENS
// ======================

export const Spacing = {
  '0': 0,
  px: 1,
  '0.5': 2,
  '1': 4,
  '1.5': 6,
  '2': 8,
  '2.5': 10,
  '3': 12,
  '3.5': 14,
  '4': 16,
  '5': 20,
  '6': 24,
  '7': 28,
  '8': 32,
  '9': 36,
  '10': 40,
  '11': 44,
  '12': 48,
  '14': 56,
  '16': 64,
  '20': 80,
  '24': 96,
  '28': 112,
  '32': 128,
} as const;

// ======================
// 🔲 BORDER RADIUS TOKENS
// ======================

export const Radius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 20,
  '2.5xl': 22,
  '3xl': 24,
  '4xl': 28, // ⭐ NOVO: Extra large (Airbnb-style cards)
  '5xl': 32, // ⭐ NOVO: Hero cards
  full: 9999,

  // Aliases from web reference
  pill: 9999, // Fully rounded (pill buttons) - rounded-full
  card: 20, // Card corners - rounded-card (same as 2xl)
  input: 12, // Input fields - rounded-input (same as lg)

  // ⭐ NOVOS: Airbnb-style aliases
  airbnb: 20, // Padrão Airbnb cards
  searchPill: 28, // Search bar pill
  contentCard: 24, // Content cards maiores
} as const;

// ======================
// 🌑 SHADOW TOKENS
// ======================

/**
 * Helper para criar shadows compatíveis com Web e Native
 */
const createShadow = (
  offset: { width: number; height: number },
  opacity: number,
  radius: number,
  elevation: number
) => {
  if (Platform.OS === 'web') {
    const { width: x, height: y } = offset;
    const color = `rgba(0, 0, 0, ${opacity})`;
    // No web, usar apenas boxShadow (sem shadow* props para evitar warnings)
    return {
      boxShadow: `${x}px ${y}px ${radius}px 0px ${color}`,
    };
  }

  // No React Native nativo, usar shadow* props (correto)
  // Nota: Estas props são deprecated na web, mas ainda válidas no native
  // O helper createShadowStyle já trata isso corretamente
  return {
    shadowColor: '#000',
    shadowOffset: offset,
    shadowOpacity: opacity,
    shadowRadius: radius,
    elevation,
  };
};

export const Shadows = {
  none: {},
  sm: createShadow({ width: 0, height: 1 }, 0.05, 2, 1),
  md: createShadow({ width: 0, height: 2 }, 0.08, 4, 2),
  lg: createShadow({ width: 0, height: 4 }, 0.1, 8, 4),
  xl: createShadow({ width: 0, height: 8 }, 0.12, 16, 8),
  '2xl': createShadow({ width: 0, height: 12 }, 0.15, 24, 12),
  inner: createShadow({ width: 0, height: -2 }, 0.06, 3, -1),

  // Premium shadow with Ocean Blue tint (web reference: shadow-premium)
  premium:
    Platform.OS === 'web'
      ? { boxShadow: '0 10px 30px -5px rgba(0, 78, 154, 0.4)' }
      : {
          shadowColor: '#004E9A', // Ocean blue
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.4,
          shadowRadius: 20,
          elevation: 12,
        },

  // Card shadow (web reference: shadow-card)
  card: createShadow({ width: 0, height: 4 }, 0.1, 6, 4),

  // Card hover shadow (web reference: shadow-card-hover)
  cardHover: createShadow({ width: 0, height: 10 }, 0.15, 15, 8),

  // Soft shadow (web reference: shadow-soft)
  soft: createShadow({ width: 0, height: 2 }, 0.05, 8, 2),
} as const;

// ======================
// 🎬 ANIMATION TOKENS
// ======================

export const Animations = {
  duration: {
    instant: 0,
    fast: 150,
    normal: 300,
    slow: 500,
    slower: 700,
  },
  easing: {
    linear: [0, 0, 1, 1] as const,
    ease: [0.25, 0.1, 0.25, 1] as const,
    easeIn: [0.42, 0, 1, 1] as const,
    easeOut: [0, 0, 0.58, 1] as const,
    easeInOut: [0.42, 0, 0.58, 1] as const,
    spring: [0.25, 0.46, 0.45, 0.94] as const,
    bounce: [0.68, -0.55, 0.265, 1.55] as const,
  },
} as const;

// ======================
// 🎯 TOUCH TARGETS
// ======================

/**
 * Touch Targets - WCAG AAA Compliance
 * iOS: mínimo 44pt | Android: mínimo 48dp
 * Material Design 3: 48dp recommended
 */
export const TouchTargets = {
  // Mínimos para accessibility (WCAG AAA)
  min: 44, // iOS minimum (Apple HIG)
  minAndroid: 48, // Android minimum (Material Design 3)

  // Tamanhos padronizados
  small: 44, // Mínimo aceitável (WCAG AAA)
  medium: 48, // Recommended (Material Design 3)
  large: 56, // Comfortable touch
  xl: 64, // Large touch target

  // Hit slop adicional para área de toque expandida
  hitSlop: {
    small: 8,
    medium: 12,
    large: 16,
  },
} as const;

// ======================
// 📱 ICON SIZES
// ======================

export const IconSizes = {
  xs: 16,
  sm: 20,
  md: 24,
  lg: 28,
  xl: 32,
  '2xl': 40,
  '3xl': 48,
} as const;

// ======================
// 🏗️ Z-INDEX
// ======================

export const ZIndex = {
  base: 0,
  dropdown: 1000,
  sticky: 1100,
  overlay: 1200,
  modal: 1300,
  popover: 1400,
  tooltip: 1500,
  toast: 1600,
} as const;

// ======================
// 📐 BREAKPOINTS
// ======================

export const Breakpoints = {
  xs: 360,
  sm: 390,
  md: 428,
  lg: 768,
  xl: 1024,
} as const;

// ======================
// 😊 EMOJI SIZES
// ======================

export const EmojiSizes = {
  xs: 20,
  sm: 28,
  md: 32,
  lg: 44, // Recommendation: WCAG AAA touch target minimum
  xl: 56,
} as const;

// ======================
// 💧 OPACITY VALUES
// ======================

export const Opacity = {
  disabled: 0.5,
  hover: 0.75,
  selected: 0.9,
  overlay: 0.12, // For background overlays (1F in hex)
  full: 1,
} as const;

// ======================
// 🌫️ BLUR VALUES (Flo-inspired glassmorphism)
// ======================

export const Blur = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 24,
  backdrop: 10, // For modal/sheet backdrops
  glass: 20, // For glassmorphism cards
} as const;

// ======================
// 🌈 EMOTION GRADIENTS (Flo-inspired)
// ======================

export const EmotionGradients = {
  calm: [ColorTokens.primary[500], ColorTokens.primary[100]], // Rosa maternal (main → light)
  warm: [ColorTokens.primary[300], '#FFC4D9'], // Light pink → Warm pink
  energetic: [ColorTokens.warning[400], ColorTokens.warning[500]], // Yellow → Orange
  peaceful: [ColorTokens.success[400], ColorTokens.success[500]], // Green → Mint
  safe: [ColorTokens.primary[500], ColorTokens.secondary[400]], // Rosa → Roxo (main → main)
  spiritual: [ColorTokens.secondary[400], ColorTokens.secondary[600]], // Roxo gradient
  joyful: [ColorTokens.primary[300], ColorTokens.warning[400]], // Pink → Yellow
  // ⭐ NOVOS: Gradientes com Azul (preferência Nathália)
  trust: [ColorTokens.info[400], ColorTokens.info[600]], // Azul confiança
  serenity: [ColorTokens.info[300], ColorTokens.primary[200]], // Azul → Rosa suave
  ocean: [ColorTokens.info[400], ColorTokens.info[500]], // Ocean blue
  hopeful: [ColorTokens.info[300], ColorTokens.success[400]], // Azul → Verde esperança
} as const;

// ======================
// 📱 SAFE AREAS
// ======================

export const SafeArea = {
  top: Platform.select({ ios: 44, android: 24, default: 24 }),
  bottom: Platform.select({ ios: 34, android: 0, default: 0 }),
  horizontal: 16,
} as const;

// ======================
// 🔧 RESPONSIVE HELPERS
// ======================

export const isSmallDevice = SCREEN_WIDTH < Breakpoints.sm;
export const isMediumDevice = SCREEN_WIDTH >= Breakpoints.sm && SCREEN_WIDTH < Breakpoints.md;
export const isLargeDevice = SCREEN_WIDTH >= Breakpoints.md;
export const isTablet = SCREEN_WIDTH >= Breakpoints.lg;

// ======================
// 📐 ASPECT RATIOS (Airbnb-inspired)
// ======================

export const AspectRatios = {
  // Cards
  card: 4 / 3, // 1.33 - Airbnb standard card
  cardWide: 16 / 9, // 1.77 - Wide cards, hero banners
  cardSquare: 1, // 1.0 - Square cards
  cardPortrait: 3 / 4, // 0.75 - Portrait cards

  // Media
  video: 16 / 9, // Standard video
  thumbnail: 4 / 3, // Thumbnails
  avatar: 1, // Profile pictures
  story: 9 / 16, // Stories format

  // Special
  hero: 2.5, // Hero banners (wide)
  feature: 1.5, // Feature cards

  // ⭐ NOVO: Airbnb Image Grid (imagens 2x2)
  gridItem: 1, // Quadrado para grid 2x2
} as const;

// ======================
// 🏷️ BADGE STYLES (Airbnb-inspired)
// ======================

export const BadgeStyles = {
  // Badge "Original" / "Popular" / "Hoje" das imagens Airbnb
  standard: {
    paddingHorizontal: Spacing['3'],
    paddingVertical: Spacing['1.5'],
    borderRadius: Radius.md,
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.semibold,
  },
  // Badge pequeno para contagens
  small: {
    paddingHorizontal: Spacing['2'],
    paddingVertical: Spacing['1'],
    borderRadius: Radius.sm,
    fontSize: Typography.sizes['2xs'],
    fontWeight: Typography.weights.bold,
  },
  // Badge de timeline (círculo com data)
  timeline: {
    width: 32,
    height: 32,
    borderRadius: Radius.full,
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
  },
} as const;

// ======================
// 🎯 CONTENT CARD SIZES (Airbnb-inspired)
// ======================

export const CardSizes = {
  // Small cards (2 per row)
  small: {
    width: (SCREEN_WIDTH - Spacing['4'] * 3) / 2, // Account for gaps
    height: 160,
    imageHeight: 100,
  },
  // Medium cards (featured)
  medium: {
    width: SCREEN_WIDTH - Spacing['4'] * 2,
    height: 200,
    imageHeight: 140,
  },
  // Large cards (hero)
  large: {
    width: SCREEN_WIDTH - Spacing['4'] * 2,
    height: 280,
    imageHeight: 200,
  },
  // Horizontal scroll cards
  horizontal: {
    width: 280,
    height: 220,
    imageHeight: 160,
  },
} as const;

// ======================
// 📦 DEFAULT EXPORT
// ======================

/**
 * Tokens consolidados - use este objeto para acessar todos os tokens
 */
export const Tokens = {
  colors: ColorTokens,
  light: LightTheme,
  dark: DarkTheme,
  typography: Typography,
  textStyles: TextStyles, // ⭐ NOVO: Semantic text styles (Flo-inspired)
  spacing: Spacing,
  radius: Radius,
  shadows: Shadows,
  animations: Animations,
  touchTargets: TouchTargets,
  icons: IconSizes,
  iconSizes: IconSizes, // Alias for compatibility
  emojiSizes: EmojiSizes, // ⭐ NOVO: Emoji sizes
  opacity: Opacity, // ⭐ NOVO: Opacity values
  blur: Blur, // ⭐ NOVO: Blur values (Flo-inspired glassmorphism)
  emotionGradients: EmotionGradients, // ⭐ NOVO: Emotion gradients (Flo-inspired)
  aspectRatios: AspectRatios, // ⭐ NOVO: Aspect ratios (Airbnb-inspired)
  cardSizes: CardSizes, // ⭐ NOVO: Card sizes (Airbnb-inspired)
  badgeStyles: BadgeStyles, // ⭐ NOVO: Badge styles (Airbnb-inspired)
  // ⭐ NOVO: Header tokens padronizados (Screenshots reference)
  header: ColorTokens.header,
  headerHeight: ColorTokens.header.height,
  headerGradient: ColorTokens.header.gradient,
  blurOrbs: ColorTokens.header.blurOrbs,
  zIndex: ZIndex,
  breakpoints: Breakpoints,
  safeArea: SafeArea,
  screen: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  isSmallDevice,
  isMediumDevice,
  isLargeDevice,
  isTablet,
} as const;

export default Tokens;
