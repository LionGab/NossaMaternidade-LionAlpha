/**
 * Haptic Feedback Patterns - Nossa Maternidade
 * Padrões de feedback tátil para criar uma experiência sensorial premium
 *
 * @requires expo-haptics
 * @platform iOS, Android
 */

import * as Haptics from 'expo-haptics';

// ======================
// 🎯 HAPTIC PATTERNS
// ======================

/**
 * Tipos de impacto haptic disponíveis
 */
export const HapticImpact = {
  /** Feedback leve - Para seleções sutis, switches, chips */
  light: Haptics.ImpactFeedbackStyle.Light,

  /** Feedback médio - Para botões padrão, cards clicáveis */
  medium: Haptics.ImpactFeedbackStyle.Medium,

  /** Feedback forte - Para ações importantes, confirmações */
  heavy: Haptics.ImpactFeedbackStyle.Heavy,

  /** Feedback rígido - Para arrastar e soltar, gestos */
  rigid: Haptics.ImpactFeedbackStyle.Rigid,

  /** Feedback suave - Para transições, animações */
  soft: Haptics.ImpactFeedbackStyle.Soft,
} as const;

/**
 * Tipos de notificação haptic
 */
export const HapticNotification = {
  /** Ação bem-sucedida */
  success: Haptics.NotificationFeedbackType.Success,

  /** Aviso ou alerta */
  warning: Haptics.NotificationFeedbackType.Warning,

  /** Erro ou falha */
  error: Haptics.NotificationFeedbackType.Error,
} as const;

/**
 * Padrões haptic específicos para ações do app
 */
export const HapticPatterns = {
  // 🔘 Interações básicas
  tap: () => Haptics.selectionAsync(),
  buttonPress: () => Haptics.impactAsync(HapticImpact.medium),
  buttonPressLight: () => Haptics.impactAsync(HapticImpact.light),
  buttonPressHeavy: () => Haptics.impactAsync(HapticImpact.heavy),

  // ✅ Feedback de sucesso
  success: () => Haptics.notificationAsync(HapticNotification.success),
  habitCompleted: () => Haptics.notificationAsync(HapticNotification.success),
  achievementUnlocked: async () => {
    // Padrão especial: impacto forte + notificação de sucesso
    await Haptics.impactAsync(HapticImpact.heavy);
    setTimeout(() => Haptics.notificationAsync(HapticNotification.success), 100);
  },

  // ⚠️ Alertas e avisos
  warning: () => Haptics.notificationAsync(HapticNotification.warning),
  reminder: () => Haptics.impactAsync(HapticImpact.medium),

  // ❌ Erros
  error: () => Haptics.notificationAsync(HapticNotification.error),
  validationError: () => Haptics.notificationAsync(HapticNotification.error),

  // 🎚️ Seleção e navegação
  selection: () => Haptics.selectionAsync(),
  tabChange: () => Haptics.selectionAsync(),
  swipe: () => Haptics.impactAsync(HapticImpact.soft),

  // 📝 Formulários
  inputFocus: () => Haptics.impactAsync(HapticImpact.light),
  toggleOn: () => Haptics.impactAsync(HapticImpact.medium),
  toggleOff: () => Haptics.impactAsync(HapticImpact.light),
  checkboxCheck: () => Haptics.impactAsync(HapticImpact.medium),
  radioSelect: () => Haptics.selectionAsync(),

  // 🎭 Emoções e bem-estar (específico do app)
  emotionSelect: () => Haptics.impactAsync(HapticImpact.soft),
  breathingIn: () => Haptics.impactAsync(HapticImpact.light),
  breathingOut: () => Haptics.impactAsync(HapticImpact.soft),
  meditationStart: () => Haptics.impactAsync(HapticImpact.soft),
  meditationEnd: () => Haptics.notificationAsync(HapticNotification.success),

  // 💬 Chat e comunidade
  messageSent: () => Haptics.impactAsync(HapticImpact.light),
  messageReceived: () => Haptics.impactAsync(HapticImpact.soft),
  reactionAdd: () => Haptics.impactAsync(HapticImpact.light),

  // 🎯 Onboarding
  stepComplete: () => Haptics.impactAsync(HapticImpact.medium),
  onboardingComplete: async () => {
    // Sequência especial de celebração
    await Haptics.impactAsync(HapticImpact.heavy);
    setTimeout(() => Haptics.notificationAsync(HapticNotification.success), 150);
  },

  // 🔄 Refresh e loading
  refreshStart: () => Haptics.impactAsync(HapticImpact.light),
  refreshComplete: () => Haptics.impactAsync(HapticImpact.soft),

  // 🎨 Interações premium
  cardPress: () => Haptics.impactAsync(HapticImpact.medium),
  modalOpen: () => Haptics.impactAsync(HapticImpact.light),
  modalClose: () => Haptics.impactAsync(HapticImpact.soft),
  drawerOpen: () => Haptics.impactAsync(HapticImpact.medium),
  drawerClose: () => Haptics.impactAsync(HapticImpact.light),

  // 🌟 Conquistas e celebrações
  streakMilestone: async () => {
    // Padrão de celebração - 3 impactos crescentes
    await Haptics.impactAsync(HapticImpact.medium);
    setTimeout(() => Haptics.impactAsync(HapticImpact.heavy), 100);
    setTimeout(() => Haptics.notificationAsync(HapticNotification.success), 200);
  },
  weeklyGoal: () => Haptics.notificationAsync(HapticNotification.success),
  firstHabit: async () => {
    // Celebração especial para primeiro hábito
    await Haptics.impactAsync(HapticImpact.heavy);
    setTimeout(() => Haptics.notificationAsync(HapticNotification.success), 150);
  },
};

// ======================
// 🛠️ UTILITY FUNCTIONS
// ======================

/**
 * Executa haptic apenas se o dispositivo suportar
 * @param pattern - Função de haptic a executar
 */
export const triggerHaptic = async (pattern: () => Promise<void> | void) => {
  try {
    await pattern();
  } catch (_error) {
    // Silently fail se haptic não for suportado - não precisa logar
  }
};

/**
 * Hook helper para usar haptics de forma simplificada
 * @example
 * const { success, buttonPress } = useHapticPatterns();
 * <Button onPress={() => { buttonPress(); handleAction(); }} />
 */
export const useHapticPatterns = () => {
  return {
    ...HapticPatterns,
    trigger: triggerHaptic,
  };
};

/**
 * Verifica se haptics estão disponíveis no dispositivo
 */
export const isHapticsAvailable = async (): Promise<boolean> => {
  try {
    // Tenta executar um haptic leve para testar suporte
    await Haptics.selectionAsync();
    return true;
  } catch {
    return false;
  }
};

// ======================
// 📚 EXPORT
// ======================

export default {
  Impact: HapticImpact,
  Notification: HapticNotification,
  Patterns: HapticPatterns,
  trigger: triggerHaptic,
  isAvailable: isHapticsAvailable,
};
