/**
 * Theme Context - Nossa Maternidade
 * Gerenciamento global de tema (Light/Dark Mode)
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useColorScheme } from 'react-native';

import { LightTheme, DarkTheme, ColorTokens } from './tokens';
import { logger } from '../utils/logger';

// ======================
// 🎨 TYPES
// ======================

export type ThemeMode = 'light' | 'dark' | 'system';
export type ActiveTheme = 'light' | 'dark';

export interface ThemeColors {
  background: {
    canvas: string;
    beige?: string; // Bege claro Airbnb
    warm?: string; // Rosa pêssego quente
    peach?: string; // Pêssego mais intenso (light only)
    surface?: string; // Superfície alternativa (dark only)
    card: string;
    elevated: string;
    input: string;
    overlay: string;
    gradient: {
      primary: readonly string[];
      soft: readonly string[];
      nathIA?: readonly string[]; // ⭐ NOVO: Gradiente ciano do card NathIA
      [key: string]: readonly string[] | undefined;
    };
  };
  text: {
    primary: string;
    secondary: string;
    tertiary: string;
    disabled: string;
    placeholder: string;
    inverse: string;
    link: string;
    success: string;
    warning: string;
    error: string;
    info: string;
  };
  border: {
    light: string;
    medium: string;
    dark: string;
    focus: string;
    error: string;
    success: string;
  };
  primary: {
    main: string;
    light: string;
    dark: string;
    gradient: readonly string[];
  };
  secondary: {
    main: string;
    light: string;
    dark: string;
    gradient: readonly string[];
  };
  status: {
    success: string;
    warning: string;
    error: string;
    info: string;
  };
  gradients: {
    success: readonly string[];
    warning: readonly string[];
    error: readonly string[];
    info: readonly string[];
  };
  // Cores raw sempre disponíveis
  raw: typeof ColorTokens;
}

export interface ThemeContextValue {
  // Estado atual
  mode: ThemeMode;
  activeTheme: ActiveTheme;
  colors: ThemeColors;

  // Ações
  setMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;

  // Helpers
  isDark: boolean;
  isLight: boolean;
}

// ======================
// 📦 CONTEXT
// ======================

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const THEME_STORAGE_KEY = '@nossa_maternidade:theme_mode';

// ======================
// 🎯 PROVIDER
// ======================

interface ThemeProviderProps {
  children: ReactNode;
  defaultMode?: ThemeMode;
}

export function ThemeProvider({ children, defaultMode = 'system' }: ThemeProviderProps) {
  const systemColorScheme = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>(defaultMode);
  const [isReady, setIsReady] = useState(false);

  // Carregar preferência do storage
  useEffect(() => {
    loadThemePreference();
  }, []);

  // Salvar preferência no storage
  useEffect(() => {
    if (isReady) {
      saveThemePreference(mode);
    }
  }, [mode, isReady]);

  const loadThemePreference = async () => {
    try {
      const stored = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (stored && ['light', 'dark', 'system'].includes(stored)) {
        setModeState(stored as ThemeMode);
      }
    } catch (error) {
      logger.error('Failed to load theme preference', error);
    } finally {
      setIsReady(true);
    }
  };

  const saveThemePreference = async (themeMode: ThemeMode) => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, themeMode);
    } catch (error) {
      logger.error('Failed to save theme preference', error);
    }
  };

  // Determinar tema ativo
  const activeTheme: ActiveTheme =
    mode === 'system' ? (systemColorScheme === 'dark' ? 'dark' : 'light') : mode;

  // Selecionar cores baseado no tema ativo
  const themeColors = activeTheme === 'dark' ? DarkTheme : LightTheme;

  const colors: ThemeColors = {
    ...themeColors,
    raw: ColorTokens,
  };

  const setMode = (newMode: ThemeMode) => {
    setModeState(newMode);
  };

  const toggleTheme = () => {
    if (mode === 'system') {
      // Se está em system, toggle para light ou dark (oposto do sistema)
      setMode(systemColorScheme === 'dark' ? 'light' : 'dark');
    } else if (mode === 'light') {
      setMode('dark');
    } else {
      setMode('light');
    }
  };

  const value: ThemeContextValue = {
    mode,
    activeTheme,
    colors,
    setMode,
    toggleTheme,
    isDark: activeTheme === 'dark',
    isLight: activeTheme === 'light',
  };

  return <ThemeContext.Provider value={value}>{isReady ? children : null}</ThemeContext.Provider>;
}

// ======================
// 🪝 HOOK
// ======================

/**
 * Hook para acessar o tema atual
 * @example
 * const { colors, isDark, toggleTheme } = useTheme();
 */
export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);

  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }

  return context;
}

// ======================
// 🎨 HELPER HOOKS
// ======================

/**
 * Hook para acessar apenas as cores (shorthand)
 * @example
 * const colors = useThemeColors();
 * return <View style={{ backgroundColor: colors.background.canvas }} />;
 */
export function useThemeColors() {
  const { colors } = useTheme();
  return colors;
}

/**
 * Hook para verificar se está em dark mode
 * @example
 * const isDark = useIsDark();
 */
export function useIsDark() {
  const { isDark } = useTheme();
  return isDark;
}

/**
 * Hook para criar estilos dinâmicos baseados no tema
 * @example
 * const styles = useThemedStyles((colors) => ({
 *   container: {
 *     backgroundColor: colors.background.canvas,
 *     borderColor: colors.border.light,
 *   }
 * }));
 */
export function useThemedStyles<T>(createStyles: (colors: ThemeColors) => T): T {
  const { colors } = useTheme();
  return createStyles(colors);
}

export default ThemeContext;
