/**
 * Test Wrapper - Fornece providers necessários para testes
 */

import React, { useMemo } from 'react';
import ThemeContext, { ThemeContextValue } from '@/theme/ThemeContext';
import { LightTheme, ColorTokens } from '@/theme/tokens';

/**
 * TestWrapper - Fornece ThemeContext mockado para testes
 * Evita async loading do AsyncStorage que causa null renders
 */
export function TestWrapper({ children }: { children: React.ReactNode }) {
  const value: ThemeContextValue = useMemo(
    () => ({
      mode: 'light' as const,
      activeTheme: 'light' as const,
      colors: {
        ...LightTheme,
        raw: ColorTokens,
      },
      setMode: jest.fn(),
      toggleTheme: jest.fn(),
      isDark: false,
      isLight: true,
    }),
    []
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

