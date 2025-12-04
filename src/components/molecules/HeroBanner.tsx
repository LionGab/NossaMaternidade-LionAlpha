/**
 * HeroBanner - Componente de banner hero com imagem e overlay
 * Design System: Ocean Blue + Coral (Web Reference)
 */

import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { View, StyleSheet, ImageBackground } from 'react-native';

import { useTheme } from '@/theme';
import { Radius, ColorTokens, Tokens } from '@/theme/tokens';

export interface HeroBannerProps {
  imageUrl: string;
  height?: number;
  overlay?: {
    type: 'gradient' | 'solid';
    direction?: 'top' | 'bottom' | 'left' | 'right';
    opacity?: number;
    color?: string;
    colors?: readonly string[]; // Array de cores para gradiente customizado (Flo-inspired)
  };
  borderRadius?: keyof typeof Radius | number;
  accessibilityLabel?: string;
  children?: React.ReactNode;
}

export function HeroBanner({
  imageUrl,
  height = 200,
  overlay,
  borderRadius = 'lg',
  accessibilityLabel,
  children,
}: HeroBannerProps) {
  const { isDark: _isDark } = useTheme();

  const borderRadiusValue = typeof borderRadius === 'number' ? borderRadius : Radius[borderRadius];

  // Cor base para overlays (usando tokens)
  const overlayBaseColor = ColorTokens.neutral[950]; // #0A0A0A - quase preto

  // Preparar cores do overlay
  const getGradientColors = (): string[] => {
    // Se colors customizados foram fornecidos, usar diretamente (Flo-inspired gradients)
    if (overlay?.colors && overlay.colors.length >= 2) {
      // Aplicar opacity às cores se fornecida
      if (overlay.opacity !== undefined && overlay.opacity < 1) {
        const opacityHex = Math.round(overlay.opacity * 255)
          .toString(16)
          .padStart(2, '0');
        return overlay.colors.map((color) => {
          // Se a cor já tem alpha, substituir; senão, adicionar
          if (color.length === 9) {
            return color.slice(0, 7) + opacityHex;
          }
          return color + opacityHex;
        });
      }
      return [...overlay.colors];
    }

    if (!overlay || overlay.type === 'solid') {
      const opacity = overlay?.opacity ?? 0.5;
      const color = overlay?.color ?? overlayBaseColor;
      return [
        `${color}${Math.round(opacity * 255)
          .toString(16)
          .padStart(2, '0')}`,
        color,
      ];
    }

    // Gradient overlay padrão
    const opacity = overlay.opacity ?? 0.6;
    const baseColor = overlay.color ?? overlayBaseColor;
    const transparent = `${baseColor}00`;
    const opaque = `${baseColor}${Math.round(opacity * 255)
      .toString(16)
      .padStart(2, '0')}`;

    if (overlay.direction === 'top') {
      return [opaque, transparent];
    } else if (overlay.direction === 'left') {
      return [opaque, transparent];
    } else if (overlay.direction === 'right') {
      return [transparent, opaque];
    } else {
      // bottom (default)
      return [transparent, opaque];
    }
  };

  return (
    <View
      style={[
        styles.container,
        {
          height,
          borderRadius: borderRadiusValue,
          overflow: 'hidden',
        },
      ]}
      accessible={!!accessibilityLabel}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={
        accessibilityLabel ? 'Banner decorativo com imagem e conteúdo sobreposto' : undefined
      }
      accessibilityRole="image"
    >
      <ImageBackground
        source={{ uri: imageUrl }}
        style={styles.imageBackground}
        resizeMode="cover"
        accessible={false}
      >
        {overlay && (
          <LinearGradient
            colors={getGradientColors() as [string, string, ...string[]]}
            style={[StyleSheet.absoluteFill, { pointerEvents: 'none' }]}
            start={overlay.direction === 'top' ? { x: 0, y: 0 } : { x: 0, y: 0 }}
            end={overlay.direction === 'top' ? { x: 0, y: 1 } : { x: 0, y: 1 }}
            accessible={false}
            accessibilityRole="none"
          />
        )}
        {children && <View style={styles.content}>{children}</View>}
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  imageBackground: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  content: {
    padding: Tokens.spacing['5'], // ✅ Usar token (20px)
    zIndex: 1,
  },
});
