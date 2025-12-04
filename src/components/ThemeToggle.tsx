/**
 * ThemeToggle - Componente para alternar tema Light/Dark
 * Convertido do componente web para React Native
 */

import * as Haptics from 'expo-haptics';
import { Moon, Sun } from 'lucide-react-native';
import React from 'react';
import { TouchableOpacity, ViewStyle } from 'react-native';

import { useTheme } from '@/theme';
import { Tokens, ColorTokens } from '@/theme/tokens';
import { logger } from '@/utils/logger';

export interface ThemeToggleProps {
  /** Estilo customizado */
  style?: ViewStyle;
  /** Tamanho do ícone */
  iconSize?: number;
  /** Variante do botão */
  variant?: 'outline' | 'ghost';
  /** Cor customizada do ícone (para uso sobre gradientes) */
  iconColor?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  style,
  iconSize = 20,
  variant = 'outline',
  iconColor,
}) => {
  const { colors, isDark, toggleTheme } = useTheme();

  const handlePress = () => {
    logger.info('Theme toggle pressed', { currentTheme: isDark ? 'dark' : 'light' });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    toggleTheme();
  };

  const containerStyle: ViewStyle = {
    width: 40,
    height: 40,
    borderRadius: Tokens.radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: Tokens.touchTargets.min,
    minWidth: Tokens.touchTargets.min,
    ...(variant === 'outline' && {
      borderWidth: 1,
      borderColor: colors.border.light,
      backgroundColor: `${colors.background.card}80`, // 50% opacity (backdrop blur effect)
    }),
    ...(variant === 'ghost' && {
      backgroundColor: 'transparent',
    }),
    ...style,
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={containerStyle}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={isDark ? 'Alternar para tema claro' : 'Alternar para tema escuro'}
      accessibilityHint="Muda entre tema claro e escuro"
    >
      {isDark ? (
        <Sun size={iconSize} color={iconColor || ColorTokens.warning[500]} />
      ) : (
        <Moon
          size={iconSize}
          color={iconColor || (variant === 'ghost' ? ColorTokens.neutral[0] : colors.primary.main)}
        />
      )}
    </TouchableOpacity>
  );
};

export default ThemeToggle;
