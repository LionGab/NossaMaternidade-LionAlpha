/**
 * useAccessibilityProps - Hook para adaptar props de acessibilidade para web/mobile
 * Resolve o problema de accessibilityHint não funcionar na web
 */

import { Platform, AccessibilityRole } from 'react-native';

export interface AccessibilityProps {
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityRole?: AccessibilityRole;
  title?: string; // Para web
  [key: string]: unknown;
}

/**
 * Adapta props de acessibilidade para a plataforma
 * Na web: converte accessibilityHint para title ou aria-describedby
 * No mobile: mantém accessibilityHint
 */
export function useAccessibilityProps(props: AccessibilityProps): AccessibilityProps {
  if (Platform.OS === 'web') {
    const { accessibilityHint, ...rest } = props;

    // Na web, usar title em vez de accessibilityHint
    if (accessibilityHint) {
      return {
        ...rest,
        // title funciona melhor na web para tooltips
        title: accessibilityHint,
        // Remover accessibilityHint para evitar warning
      };
    }

    return rest;
  }

  // No mobile, manter todas as props como estão
  return props;
}

/**
 * Helper para criar props de acessibilidade adaptadas
 */
export function createAccessibilityProps(
  label?: string,
  hint?: string,
  role?: AccessibilityRole
): AccessibilityProps {
  const baseProps: AccessibilityProps = {};

  if (label) {
    baseProps.accessibilityLabel = label;
  }

  if (role) {
    baseProps.accessibilityRole = role;
  }

  if (Platform.OS === 'web' && hint) {
    // Na web, usar title
    baseProps.title = hint;
  } else if (hint) {
    // No mobile, usar accessibilityHint
    baseProps.accessibilityHint = hint;
  }

  return baseProps;
}
