/**
 * Logo Component - Nossa Maternidade
 * Componente refatorado com borda elegante e suporte completo a design tokens
 */

import { Image } from 'expo-image';
import React from 'react';
import { View, StyleSheet, ViewStyle, ImageStyle } from 'react-native';

import { useTheme } from '@/theme';
import { Tokens, ColorTokens } from '@/theme/tokens';
import { getShadowFromToken } from '@/utils/shadowHelper';

import { logoPrincipal } from '../assets/images';

export type LogoVariant = 'default' | 'rounded' | 'circle' | 'bordered' | 'elevated';
export type LogoSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

export interface LogoProps {
  /** Tamanho do logo (preset ou número customizado) */
  size?: LogoSize | number;
  /** Variante visual do logo */
  variant?: LogoVariant;
  /** Estilo customizado para o container */
  style?: ViewStyle;
  /** Estilo customizado para a imagem */
  imageStyle?: ImageStyle;
  /** Largura da borda (apenas para variant 'bordered') */
  borderWidth?: number;
  /** Cor da borda (usa design tokens se não especificado) */
  borderColor?: string;
  /** Mostrar sombra (apenas para variant 'elevated') */
  showShadow?: boolean;
}

const SIZE_PRESETS: Record<LogoSize, number> = {
  xs: 24,
  sm: 32,
  md: 48,
  lg: 64,
  xl: 96,
  '2xl': 128,
};

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  variant = 'default',
  style,
  imageStyle,
  borderWidth = 2,
  borderColor,
  showShadow = true,
}) => {
  const { isDark } = useTheme();

  // Calcular tamanho real
  const actualSize = typeof size === 'number' ? size : SIZE_PRESETS[size];

  // Calcular border radius baseado na variant
  const getBorderRadius = (): number => {
    switch (variant) {
      case 'circle':
        return actualSize / 2;
      case 'rounded':
        return Tokens.radius.lg;
      case 'bordered':
        return Tokens.radius.md;
      default:
        return 0;
    }
  };

  // Calcular cor da borda
  const getBorderColor = (): string => {
    if (borderColor) return borderColor;

    if (variant === 'bordered' || variant === 'elevated') {
      return isDark ? ColorTokens.neutral[700] : ColorTokens.neutral[200];
    }

    return 'transparent';
  };

  // Calcular padding interno (para variant bordered)
  const getPadding = (): number => {
    if (variant === 'bordered' || variant === 'elevated') {
      return borderWidth;
    }
    return 0;
  };

  const borderRadius = getBorderRadius();
  const borderColorValue = getBorderColor();
  const padding = getPadding();
  const imageSize = actualSize - padding * 2;

  // Estilos dinâmicos
  const containerStyle: ViewStyle = {
    width: actualSize,
    height: actualSize,
    borderRadius,
    padding,
    backgroundColor:
      variant === 'elevated'
        ? isDark
          ? ColorTokens.neutral[800]
          : ColorTokens.neutral[0]
        : 'transparent',
    borderWidth: variant === 'bordered' || variant === 'elevated' ? borderWidth : 0,
    borderColor: borderColorValue,
    overflow: variant === 'circle' || variant === 'rounded' ? 'hidden' : 'visible',
    ...(variant === 'elevated' && showShadow ? getShadowFromToken('sm') : {}),
  };

  const imageStyleFinal: ImageStyle = {
    width: imageSize,
    height: imageSize,
    borderRadius: variant === 'circle' ? imageSize / 2 : borderRadius - padding,
  };

  return (
    <View
      style={[styles.container, containerStyle, style]}
      accessibilityRole="image"
      accessibilityLabel="Logo NossaMaternidade"
      accessibilityHint="Logo da aplicação Nossa Maternidade"
    >
      <Image
        source={logoPrincipal}
        style={[styles.image, imageStyleFinal, imageStyle]}
        contentFit="contain"
        transition={200}
        cachePolicy="memory-disk"
        accessibilityIgnoresInvertColors={true}
        accessibilityLabel="Logo NossaMaternidade"
        accessibilityHint="Logo da aplicação Nossa Maternidade"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    // Estilos base aplicados dinamicamente
  },
});

export default Logo;
