/**
 * Premium Gradients System - Nossa Maternidade
 * Gradientes inspirados nos screenshots de referência
 *
 * @version 2.0.0 - Novo design premium
 */

// ======================
// 🎨 GRADIENTES PREMIUM
// ======================

/**
 * Gradiente principal do card da NathIA
 * Usado no card "Falar com a NathIA agora"
 */
export const NathIAGradients = {
  // Card principal - Ciano/Teal vibrante
  card: {
    light: ['#4ECDC4', '#45B7AA', '#3BB3B5'] as const,
    dark: ['#3BB3B5', '#2D9A93', '#258F88'] as const,
  },

  // Botão dentro do card
  button: {
    light: ['#FFFFFF', '#F8FFFE'] as const,
    dark: ['#FFFFFF', '#F0FFFE'] as const,
  },

  // Sparkle/brilho no card
  sparkle: {
    light: ['rgba(255,255,255,0.8)', 'rgba(255,255,255,0.2)'] as const,
    dark: ['rgba(255,255,255,0.6)', 'rgba(255,255,255,0.1)'] as const,
  },
} as const;

/**
 * Gradientes de background principal
 */
export const BackgroundGradients = {
  // Light mode - Rosa pêssego suave
  light: {
    primary: ['#FFF8F5', '#FFF1EB', '#FFE8E0'] as const, // Pêssego suave
    warm: ['#FFF5F5', '#FFF0EE', '#FFEAEA'] as const, // Rosa quente
    neutral: ['#FAFAFA', '#F5F5F5', '#F0F0F0'] as const, // Neutro
    peach: ['#FFF8F3', '#FFF2EC', '#FFEDE4'] as const, // Pêssego claro
  },

  // Dark mode - Azul profundo
  dark: {
    primary: ['#0A0D14', '#0F1219', '#141820'] as const, // Azul muito escuro
    elevated: ['#141820', '#1A1F2E', '#202638'] as const, // Elevado
    card: ['#1A1F2E', '#1E2436', '#242A3F'] as const, // Cards
    surface: ['#0F1219', '#121622', '#151B2B'] as const, // Superfícies
  },
} as const;

/**
 * Gradientes de emoções/mood
 */
export const MoodGradients = {
  // Estados emocionais (chips)
  ansiosa: {
    background: ['#FFE8EC', '#FFD5DC'] as const,
    text: '#C44569',
  },
  cansada: {
    background: ['#E8F0FF', '#D5E3FF'] as const,
    text: '#5A7BB5',
  },
  culpada: {
    background: ['#F0E8FF', '#E3D5FF'] as const,
    text: '#7B5AB5',
  },
  feliz: {
    background: ['#E8FFF0', '#D5FFE3'] as const,
    text: '#5AB57B',
  },
} as const;

/**
 * Gradientes para cards de conteúdo
 */
export const ContentGradients = {
  // Card de vídeo/conteúdo
  video: {
    overlay: ['rgba(0,0,0,0)', 'rgba(0,0,0,0.6)'] as const,
    shine: ['rgba(255,255,255,0.3)', 'rgba(255,255,255,0)'] as const,
  },

  // Card de história
  story: {
    light: ['#FFF5F8', '#FFEFF4'] as const,
    dark: ['#2D1F24', '#241A1E'] as const,
  },

  // Card premium
  premium: {
    light: ['#F5F0FF', '#EFE8FF', '#E8E0FF'] as const,
    dark: ['#2A1F3D', '#231A35', '#1D152E'] as const,
  },
} as const;

/**
 * Gradientes de destaque/hero
 */
export const HeroGradients = {
  // Banner hero principal
  primary: {
    light: ['#4ECDC4', '#45B7AA', '#3BB3B5'] as const,
    dark: ['#3BB3B5', '#2D9A93', '#258F88'] as const,
  },

  // Destaque secundário
  secondary: {
    light: ['#FF8FA3', '#FF7B91', '#FF6B82'] as const,
    dark: ['#FF6B82', '#E85A71', '#D14A61'] as const,
  },

  // Espiritual/meditação
  spiritual: {
    light: ['#A78BFA', '#9B7BF0', '#8B6BE0'] as const,
    dark: ['#8B6BE0', '#7B5BD0', '#6B4BC0'] as const,
  },
} as const;

/**
 * Gradientes de chat/conversa
 */
export const ChatGradients = {
  // Toggle rápido/profundo
  quickMode: {
    active: ['#FFD93D', '#FFC107'] as const,
    inactive: ['#F5F5F5', '#EEEEEE'] as const,
  },
  deepMode: {
    active: ['#E8E0FF', '#DDD0FF'] as const,
    inactive: ['#F5F5F5', '#EEEEEE'] as const,
  },

  // Balões de mensagem
  userBubble: {
    light: ['#4ECDC4', '#45B7AA'] as const,
    dark: ['#3BB3B5', '#2D9A93'] as const,
  },
  assistantBubble: {
    light: ['#FFFFFF', '#FAFAFA'] as const,
    dark: ['#1E2436', '#242A3F'] as const,
  },

  // Chips de sugestão
  suggestionChip: {
    light: ['#E8F4FF', '#D5EBFF'] as const,
    dark: ['#1A2838', '#202F42'] as const,
  },
} as const;

/**
 * Gradientes de status/feedback
 */
export const StatusGradients = {
  success: {
    light: ['#E8FFF0', '#D5FFE3', '#C2FFD6'] as const,
    dark: ['#1A3D2E', '#153528', '#102D22'] as const,
  },
  warning: {
    light: ['#FFF8E8', '#FFF0D5', '#FFE8C2'] as const,
    dark: ['#3D351A', '#352D15', '#2D2510'] as const,
  },
  error: {
    light: ['#FFE8E8', '#FFD5D5', '#FFC2C2'] as const,
    dark: ['#3D1A1A', '#351515', '#2D1010'] as const,
  },
  info: {
    light: ['#E8F4FF', '#D5EBFF', '#C2E2FF'] as const,
    dark: ['#1A2838', '#152030', '#101828'] as const,
  },
} as const;

/**
 * Gradientes de navegação/tab bar
 */
export const NavigationGradients = {
  // Tab bar background
  tabBar: {
    light: ['#FFFFFF', '#FAFAFA'] as const,
    dark: ['#141820', '#0F1219'] as const,
  },

  // Tab ativo
  activeTab: {
    light: ['#4ECDC4', '#3BB3B5'] as const,
    dark: ['#4ECDC4', '#3BB3B5'] as const,
  },

  // Header
  header: {
    light: ['#FFFFFF', '#FAFAFA'] as const,
    dark: ['#0F1219', '#141820'] as const,
  },
} as const;

// ======================
// 📦 EXPORT CONSOLIDADO
// ======================

export const PremiumGradients = {
  nathIA: NathIAGradients,
  background: BackgroundGradients,
  mood: MoodGradients,
  content: ContentGradients,
  hero: HeroGradients,
  chat: ChatGradients,
  status: StatusGradients,
  navigation: NavigationGradients,
} as const;

export default PremiumGradients;
