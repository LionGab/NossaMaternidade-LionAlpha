/**
 * GlassCard - Card com Efeito Glassmorphism
 *
 * Adaptado do GeminiApp para React Native com blur e transparencia
 * Funciona em iOS e Android (fallback para semi-transparencia)
 *
 * @version 1.0.0
 */

import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useMemo } from 'react';
import { View, StyleSheet, ViewStyle, Platform, Pressable, PressableProps } from 'react-native';
import Animated, { useAnimatedStyle, withSpring, useSharedValue } from 'react-native-reanimated';

import { useTheme } from '../theme/ThemeContext';
import { Spacing, Radius, Shadows, ColorTokens, DarkTheme, LightTheme } from '../theme/tokens';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export type GlassVariant = 'light' | 'dark' | 'primary' | 'surface';

export interface GlassCardProps extends Omit<PressableProps, 'style'> {
  /** Conteudo do card */
  children: React.ReactNode;
  /** Variante do glass */
  variant?: GlassVariant;
  /** Border radius (default: card = 20) */
  borderRadius?: number;
  /** Intensidade do blur (1-100, default: 20) */
  blurIntensity?: number;
  /** Mostrar borda (default: true) */
  showBorder?: boolean;
  /** Padding interno (default: 5 = 20px) */
  padding?: keyof typeof Spacing;
  /** Pressable - se true, adiciona animacao de press */
  pressable?: boolean;
  /** Escala ao pressionar (default: 0.98) */
  pressScale?: number;
  /** Mostrar sombra (default: true) */
  showShadow?: boolean;
  /** Usar gradiente de fundo */
  useGradient?: boolean;
  /** Cores do gradiente (se useGradient=true) */
  gradientColors?: readonly [string, string, ...string[]];
  /** Estilo customizado */
  style?: ViewStyle;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  variant = 'surface',
  borderRadius = Radius.card,
  blurIntensity = 20,
  showBorder = true,
  padding = '5',
  pressable = false,
  pressScale = 0.98,
  showShadow = true,
  useGradient = false,
  gradientColors,
  style,
  onPress,
  ...pressableProps
}) => {
  const { colors, isDark } = useTheme();
  const scale = useSharedValue(1);

  // Determine background based on variant
  const backgroundConfig = useMemo(() => {
    switch (variant) {
      case 'light':
        return {
          color: isDark ? ColorTokens.overlay.glass : ColorTokens.overlay.light,
          tint: isDark ? 'light' : 'light',
          borderColor: isDark ? ColorTokens.overlay.glassStrong : ColorTokens.overlay.light,
        };
      case 'dark':
        return {
          color: isDark ? ColorTokens.overlay.darkGlass : ColorTokens.overlay.dark,
          tint: 'dark',
          borderColor: isDark ? ColorTokens.overlay.glassStrong : ColorTokens.overlay.card,
        };
      case 'primary':
        return {
          color: isDark ? ColorTokens.overlay.highlight : ColorTokens.overlay.card,
          tint: isDark ? 'dark' : 'light',
          borderColor: isDark ? DarkTheme.border.focus : LightTheme.border.focus,
        };
      case 'surface':
      default:
        return {
          color: isDark ? DarkTheme.background.card : LightTheme.background.card,
          tint: isDark ? 'dark' : 'light',
          borderColor: isDark ? colors.border.light : LightTheme.border.light,
        };
    }
  }, [variant, isDark, colors]);

  // Press animation
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (pressable) {
      scale.value = withSpring(pressScale, { damping: 15, stiffness: 400 });
    }
  };

  const handlePressOut = () => {
    if (pressable) {
      scale.value = withSpring(1, { damping: 15, stiffness: 400 });
    }
  };

  // Container styles
  const containerStyle: ViewStyle = useMemo(
    () => ({
      borderRadius,
      overflow: 'hidden',
      ...(showShadow && Shadows.card),
      ...style,
    }),
    [borderRadius, showShadow, style]
  );

  // Inner content styles
  const contentStyle: ViewStyle = useMemo(
    () => ({
      padding: Spacing[padding],
      ...(showBorder && {
        borderWidth: 1,
        borderColor: backgroundConfig.borderColor,
        borderRadius,
      }),
    }),
    [padding, showBorder, backgroundConfig.borderColor, borderRadius]
  );

  // Render content wrapper
  const renderContent = () => {
    if (useGradient && gradientColors) {
      return (
        <LinearGradient
          colors={gradientColors}
          style={[styles.gradientBackground, contentStyle]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {children}
        </LinearGradient>
      );
    }

    // Use BlurView on iOS, fallback on Android
    if (Platform.OS === 'ios') {
      return (
        <BlurView
          intensity={blurIntensity}
          tint={backgroundConfig.tint as 'light' | 'dark' | 'default'}
          style={[styles.blurView, contentStyle]}
        >
          <View style={[styles.innerOverlay, { backgroundColor: backgroundConfig.color }]}>
            {children}
          </View>
        </BlurView>
      );
    }

    // Android fallback - semi-transparent background
    return (
      <View style={[contentStyle, { backgroundColor: backgroundConfig.color }]}>{children}</View>
    );
  };

  // Pressable wrapper
  if (pressable || onPress) {
    return (
      <AnimatedPressable
        style={[containerStyle, animatedStyle]}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
        {...pressableProps}
      >
        {renderContent()}
      </AnimatedPressable>
    );
  }

  // Non-pressable view
  return <View style={containerStyle}>{renderContent()}</View>;
};

const styles = StyleSheet.create({
  blurView: {
    overflow: 'hidden',
  },
  innerOverlay: {
    flex: 1,
  },
  gradientBackground: {
    flex: 1,
  },
});

export default GlassCard;
