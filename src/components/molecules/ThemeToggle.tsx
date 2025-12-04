/**
 * ThemeToggle - Toggle de Tema Claro/Escuro
 *
 * Componente com ícone de lua/sol para alternar tema
 * Baseado em Material Design 3 + Apple HIG
 *
 * @version 1.0
 * @date 2025-11-27
 */

import { Moon, Sun } from 'lucide-react-native';
import React from 'react';
import { TouchableOpacity, ViewStyle, Animated } from 'react-native';

import { useThemeColors } from '@/hooks/useTheme';
import { useTheme } from '@/theme/ThemeContext';
import { Tokens } from '@/theme/tokens';
// getShadowFromToken não utilizado - removido
import { getAnimationConfig } from '@/utils/animationHelper';

export interface ThemeToggleProps {
  /** Tamanho do toggle */
  size?: 'sm' | 'md' | 'lg';
  /** Estilos customizados */
  style?: ViewStyle;
  /** Label de acessibilidade */
  accessibilityLabel?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  size = 'md',
  style,
  accessibilityLabel,
}) => {
  const { isDark, toggleTheme } = useTheme();
  const colors = useThemeColors();
  const [scaleAnim] = React.useState(new Animated.Value(1));

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // TAMANHOS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  const getSizeConfig = () => {
    switch (size) {
      case 'sm':
        return {
          container: 36,
          icon: 18,
          padding: Tokens.spacing['2'],
        };
      case 'lg':
        return {
          container: 56,
          icon: 28,
          padding: Tokens.spacing['4'],
        };
      default: // md
        return {
          container: Tokens.touchTargets.min, // 44pt WCAG AAA
          icon: 22,
          padding: Tokens.spacing['3'],
        };
    }
  };

  const sizeConfig = getSizeConfig();

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ANIMAÇÃO DE PRESS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  const handlePress = () => {
    // Animação de scale ao tocar
    const config = getAnimationConfig();

    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: config.useNativeDriver,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: config.useNativeDriver,
      }),
    ]).start();

    toggleTheme();
  };

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ESTILOS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  const containerStyle: ViewStyle = {
    width: sizeConfig.container,
    height: sizeConfig.container,
    borderRadius: Tokens.radius.lg,
    backgroundColor: colors.background.elevated,
    alignItems: 'center',
    justifyContent: 'center',
    ...Tokens.shadows.sm,
  };

  const Icon = isDark ? Sun : Moon;
  const iconColor = isDark
    ? colors.raw.warning[500] // Sol dourado no dark mode
    : colors.text.secondary; // Lua escura no light mode

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // RENDER
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={0.8}
        style={[containerStyle, style]}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={
          accessibilityLabel || (isDark ? 'Alternar para modo claro' : 'Alternar para modo escuro')
        }
        accessibilityHint={isDark ? 'Muda o tema para modo claro' : 'Muda o tema para modo escuro'}
      >
        <Icon size={sizeConfig.icon} color={iconColor} fill={iconColor} />
      </TouchableOpacity>
    </Animated.View>
  );
};

export default ThemeToggle;
