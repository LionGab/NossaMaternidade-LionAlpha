/**
 * Helper para dark mode com className (NativeWind v4)
 * Mapeia classes NativeWind para respeitar tema dinâmico
 *
 * @version 1.0.0
 */

import { useTheme } from '@/theme';

/**
 * Aplica prefixo dark: quando isDark = true
 * Remove dark: prefixes quando isDark = false
 *
 * @example
 * const cn = useThemeClassName();
 * cn('bg-white dark:bg-gray-900') // → 'bg-gray-900' (if dark mode)
 * cn('bg-white dark:bg-gray-900') // → 'bg-white' (if light mode)
 */
export function useThemeClassName() {
  const { isDark } = useTheme();

  return (className: string): string => {
    if (!className) return '';

    if (!isDark) {
      // Light mode: remover dark: prefixes
      return className.replace(/dark:[^\s]+/g, '').replace(/\s+/g, ' ').trim();
    }

    // Dark mode: aplicar apenas dark: classes
    const classes = className.split(' ');
    return classes
      .map((cls) => {
        if (cls.startsWith('dark:')) {
          return cls.replace('dark:', ''); // Remove prefix, aplica classe
        }
        // Se não tem dark: variant, não incluir (usar apenas dark: classes)
        return '';
      })
      .filter(Boolean)
      .join(' ');
  };
}

/**
 * Versão simplificada: retorna classe baseada em tema
 * Escolhe entre lightClass e darkClass automaticamente
 *
 * @example
 * const bgClass = useThemeClass('bg-white', 'bg-gray-900');
 * // → 'bg-gray-900' (if dark)
 * // → 'bg-white' (if light)
 */
export function useThemeClass(lightClass: string, darkClass: string): string {
  const { isDark } = useTheme();
  return isDark ? darkClass : lightClass;
}
