/**
 * OptimizedImage - Imagem otimizada para mobile
 *
 * Implementa todas as melhores práticas de performance:
 * - Lazy loading
 * - Caching em memória e disco
 * - Placeholder blur
 * - Skeleton loading
 * - Aspect ratio consistente
 * - Acessibilidade completa
 *
 * @version 1.0.0
 */

import { Image, ImageContentFit } from 'expo-image';
import React, { memo, useState, useCallback } from 'react';
import { View, ViewStyle, StyleSheet, ActivityIndicator, DimensionValue } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';

import { useMobileOptimization } from '@/hooks/useMobileOptimization';
import { useThemeColors } from '@/hooks/useTheme';

// ======================
// TIPOS
// ======================

export interface OptimizedImageProps {
  /** URL da imagem */
  source: string | { uri: string };

  /** Largura da imagem */
  width?: DimensionValue;

  /** Altura da imagem */
  height?: DimensionValue;

  /** Aspect ratio (ex: 16/9, 4/3, 1) */
  aspectRatio?: number;

  /** Como a imagem deve se encaixar */
  contentFit?: ImageContentFit;

  /** Border radius */
  borderRadius?: number;

  /** Se é circular */
  circular?: boolean;

  /** Placeholder blur hash */
  placeholder?: string;

  /** Cor de fundo do placeholder */
  placeholderColor?: string;

  /** Mostrar skeleton loading */
  showSkeleton?: boolean;

  /** Prioridade de carregamento */
  priority?: 'low' | 'normal' | 'high';

  /** Política de cache */
  cachePolicy?: 'none' | 'disk' | 'memory' | 'memory-disk';

  /** Duração da transição (ms) */
  transition?: number;

  /** Estilo customizado */
  style?: ViewStyle;

  /** Label de acessibilidade (obrigatório para WCAG) */
  accessibilityLabel: string;

  /** Se é decorativa (não precisa de label) */
  accessibilityIgnoresInvertColors?: boolean;

  /** Callback ao carregar */
  onLoad?: () => void;

  /** Callback ao falhar */
  onError?: () => void;
}

// ======================
// COMPONENTE SKELETON
// ======================

const ImageSkeleton = memo<{
  width?: DimensionValue;
  height?: DimensionValue;
  borderRadius?: number;
  aspectRatio?: number;
}>(({ width, height, borderRadius = 0, aspectRatio }) => {
  const colors = useThemeColors();

  return (
    <View
      style={[
        styles.skeleton,
        {
          width: width || '100%',
          height: height,
          aspectRatio: aspectRatio,
          borderRadius,
          backgroundColor: colors.background.elevated,
        },
      ]}
    >
      <ActivityIndicator size="small" color={colors.text.tertiary} />
    </View>
  );
});

ImageSkeleton.displayName = 'ImageSkeleton';

// ======================
// COMPONENTE ERRO
// ======================

const ImageError = memo<{
  width?: DimensionValue;
  height?: DimensionValue;
  borderRadius?: number;
  aspectRatio?: number;
}>(({ width, height, borderRadius = 0, aspectRatio }) => {
  const colors = useThemeColors();

  return (
    <View
      style={[
        styles.error,
        {
          width: width || '100%',
          height: height,
          aspectRatio: aspectRatio,
          borderRadius,
          backgroundColor: colors.background.elevated,
          borderColor: colors.border.light,
        },
      ]}
    >
      <View style={styles.errorIcon}>
        <View style={[styles.errorLine, { backgroundColor: colors.text.tertiary }]} />
        <View
          style={[
            styles.errorLine,
            styles.errorLineRotated,
            { backgroundColor: colors.text.tertiary },
          ]}
        />
      </View>
    </View>
  );
});

ImageError.displayName = 'ImageError';

// ======================
// COMPONENTE PRINCIPAL
// ======================

export const OptimizedImage = memo<OptimizedImageProps>(
  ({
    source,
    width,
    height,
    aspectRatio,
    contentFit = 'cover',
    borderRadius = 0,
    circular = false,
    placeholder,
    placeholderColor,
    showSkeleton = true,
    priority = 'normal',
    cachePolicy = 'memory-disk',
    transition = 200,
    style,
    accessibilityLabel,
    accessibilityIgnoresInvertColors = false,
    onLoad,
    onError,
  }) => {
    const colors = useThemeColors();
    const { isReduceMotionEnabled } = useMobileOptimization();

    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);

    // Animação de fade in
    const opacity = useSharedValue(0);

    const animatedStyle = useAnimatedStyle(() => ({
      opacity: opacity.value,
    }));

    // Calcular border radius
    const finalBorderRadius = circular
      ? typeof width === 'number'
        ? width / 2
        : 9999
      : borderRadius;

    // Processar source
    const imageSource = typeof source === 'string' ? { uri: source } : source;

    // Handlers
    const handleLoad = useCallback(() => {
      setIsLoading(false);
      opacity.value = withTiming(1, {
        duration: isReduceMotionEnabled ? 0 : transition,
      });
      onLoad?.();
    }, [opacity, transition, isReduceMotionEnabled, onLoad]);

    const handleError = useCallback(() => {
      setIsLoading(false);
      setHasError(true);
      onError?.();
    }, [onError]);

    // Container style
    const containerStyle: ViewStyle = {
      width: width || '100%',
      height: height,
      aspectRatio: aspectRatio,
      borderRadius: finalBorderRadius,
      overflow: 'hidden',
      backgroundColor: placeholderColor || colors.background.elevated,
      ...style,
    };

    // Se tem erro, mostrar fallback
    if (hasError) {
      return (
        <ImageError
          width={width}
          height={height}
          borderRadius={finalBorderRadius}
          aspectRatio={aspectRatio}
        />
      );
    }

    return (
      <View style={containerStyle}>
        {/* Skeleton enquanto carrega */}
        {isLoading && showSkeleton && (
          <View style={StyleSheet.absoluteFill}>
            <ImageSkeleton width="100%" height="100%" borderRadius={0} />
          </View>
        )}

        {/* Imagem principal */}
        <Animated.View style={[StyleSheet.absoluteFill, animatedStyle]}>
          <Image
            source={imageSource}
            style={styles.image}
            contentFit={contentFit}
            placeholder={placeholder}
            placeholderContentFit="cover"
            priority={priority}
            cachePolicy={cachePolicy}
            transition={isReduceMotionEnabled ? 0 : transition}
            onLoad={handleLoad}
            onError={handleError}
            // Acessibilidade
            accessible={true}
            accessibilityLabel={accessibilityLabel}
            accessibilityRole="image"
            accessibilityIgnoresInvertColors={accessibilityIgnoresInvertColors}
          />
        </Animated.View>
      </View>
    );
  }
);

OptimizedImage.displayName = 'OptimizedImage';

// ======================
// ESTILOS
// ======================

const styles = StyleSheet.create({
  skeleton: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  error: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  errorIcon: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorLine: {
    position: 'absolute',
    width: 20,
    height: 2,
    borderRadius: 1,
    transform: [{ rotate: '45deg' }],
  },
  errorLineRotated: {
    transform: [{ rotate: '-45deg' }],
  },
  image: {
    width: '100%',
    height: '100%',
  },
});

export default OptimizedImage;
