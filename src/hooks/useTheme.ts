/**
 * Re-export do hook useTheme do ThemeContext
 * Mantém compatibilidade com imports @/hooks/useTheme
 */

export {
  useTheme,
  useThemeColors,
  useIsDark,
  useThemedStyles,
  type ThemeMode,
  type ActiveTheme,
  type ThemeColors,
  type ThemeContextValue,
} from '../theme/ThemeContext';
