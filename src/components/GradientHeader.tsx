/**
 * GradientHeader - Componente de header gradiente padronizado
 *
 * Usa os tokens padronizados:
 * - Gradiente: pink-400 → rose-400 → purple-400 (opacity 95%)
 * - Blur orbs: white/15 (top-right) e pink-200/25 (bottom-left)
 * - Alturas: small (120), medium (160), large (200), hero (280)
 *
 * @example
 * <GradientHeader height="medium" title="Mães Valente" subtitle="Mãe ajuda mãe" />
 */

import { LinearGradient } from 'expo-linear-gradient';
import React, { ReactNode } from 'react';
import { View, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Box } from '@/components/atoms/Box';
import { Text } from '@/components/atoms/Text';
import { useTheme } from '@/theme';
import { Tokens, ColorTokens } from '@/theme/tokens';

// ============================================
// TYPES
// ============================================

type HeaderHeight = 'small' | 'medium' | 'large' | 'hero';

interface GradientHeaderProps {
  /** Altura do header (small: 120, medium: 160, large: 200, hero: 280) */
  height?: HeaderHeight;
  /** Altura customizada em pixels (sobrescreve height) */
  customHeight?: number;
  /** Título principal */
  title?: string;
  /** Subtítulo */
  subtitle?: string;
  /** Conteúdo customizado (sobrescreve title/subtitle) */
  children?: ReactNode;
  /** Mostrar blur orbs decorativos */
  showBlurOrbs?: boolean;
  /** Mostrar overlay escuro suave */
  showOverlay?: boolean;
  /** Estilos adicionais */
  style?: ViewStyle;
  /** Incluir SafeArea no topo */
  includeSafeArea?: boolean;
}

// ============================================
// COMPONENT
// ============================================

export function GradientHeader({
  height = 'medium',
  customHeight,
  title,
  subtitle,
  children,
  showBlurOrbs = true,
  showOverlay = true,
  style,
  includeSafeArea = true,
}: GradientHeaderProps) {
  const { isDark } = useTheme();
  const insets = useSafeAreaInsets();

  // Altura do header baseada no token
  const headerHeight = customHeight ?? ColorTokens.header.height[height];
  const totalHeight = includeSafeArea ? headerHeight + insets.top : headerHeight;

  // Cores do gradiente baseado no tema
  const gradientColors = isDark
    ? ColorTokens.header.gradient.dark
    : ColorTokens.header.gradient.light;

  // Blur orbs tokens
  const { topRight, bottomLeft } = ColorTokens.header.blurOrbs;

  // Estilo do subtítulo com opacity
  const subtitleStyle: TextStyle = {
    ...styles.subtitle,
    opacity: 0.9,
  };

  return (
    <View style={[styles.container, { height: totalHeight }, style]}>
      {/* Gradiente principal */}
      <LinearGradient
        colors={[...gradientColors] as [string, string, ...string[]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[StyleSheet.absoluteFill, { opacity: 0.95 }]}
      />

      {/* Overlay escuro suave (from-black/10) */}
      {showOverlay && (
        <LinearGradient
          colors={[
            ColorTokens.header.overlay.start,
            ColorTokens.header.overlay.middle,
            ColorTokens.header.overlay.end,
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      )}

      {/* Blur Orbs decorativos */}
      {showBlurOrbs && (
        <>
          {/* Bolha superior direita */}
          <View
            style={[
              styles.blurOrb,
              {
                width: topRight.size,
                height: topRight.size,
                backgroundColor: topRight.color,
                top: topRight.offset.y,
                right: -topRight.offset.x, // Negativo porque offset.x é positivo para direita
                borderRadius: topRight.size / 2,
              },
            ]}
          />

          {/* Bolha inferior esquerda */}
          <View
            style={[
              styles.blurOrb,
              {
                width: bottomLeft.size,
                height: bottomLeft.size,
                backgroundColor: bottomLeft.color,
                bottom: -bottomLeft.offset.y, // Negativo porque offset.y é positivo para baixo
                left: bottomLeft.offset.x, // Negativo para esquerda
                borderRadius: bottomLeft.size / 2,
              },
            ]}
          />
        </>
      )}

      {/* Conteúdo */}
      <View
        style={[
          styles.content,
          { paddingTop: includeSafeArea ? insets.top + Tokens.spacing['4'] : Tokens.spacing['4'] },
        ]}
      >
        {children ? (
          children
        ) : (
          <Box px="4" py="4" style={styles.defaultContent}>
            {title && (
              <Text size="2xl" weight="bold" color="inverse" style={styles.title}>
                {title}
              </Text>
            )}
            {subtitle && (
              <Text size="sm" color="inverse" style={subtitleStyle}>
                {subtitle}
              </Text>
            )}
          </Box>
        )}
      </View>
    </View>
  );
}

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
    width: '100%',
  },
  content: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: Tokens.spacing['4'],
  },
  defaultContent: {
    alignItems: 'center',
  },
  title: {
    textAlign: 'center',
    textShadowColor: ColorTokens.neutral[900] + '33', // 20% opacity usando token
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  subtitle: {
    textAlign: 'center',
    marginTop: Tokens.spacing['1'],
  },
  blurOrb: {
    position: 'absolute',
    // O blur é simulado com a cor semi-transparente
    // Em produção, pode usar react-native-blur ou similar
  },
});

// ============================================
// EXPORTS
// ============================================

export default GradientHeader;
