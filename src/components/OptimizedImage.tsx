/**
 * OptimizedImage - Componente de imagem otimizado para performance
 *
 * Features:
 * - Cache policy inteligente baseado no tipo de imagem
 * - Placeholder support (blurhash opcional)
 * - Lazy loading automático
 * - Recycling de views para melhor performance
 *
 * @see https://docs.expo.dev/versions/latest/sdk/image/
 */

import { Image, ImageProps, ImageErrorEventData } from 'expo-image';
import React, { useMemo } from 'react';
import { StyleSheet, ImageStyle } from 'react-native';

import { logger } from '@/utils/logger';

export type ImagePriority = 'low' | 'normal' | 'high';
export type ImageCachePolicy = 'none' | 'disk' | 'memory' | 'memory-disk';

interface OptimizedImageProps extends Omit<ImageProps, 'source' | 'cachePolicy'> {
  /** URI da imagem */
  uri: string;
  /** Blurhash para placeholder (opcional) - gerar em https://blurha.sh/ */
  blurhash?: string;
  /** Prioridade de carregamento */
  priority?: ImagePriority;
  /** Aspect ratio fixo (opcional) - previne layout shift */
  aspectRatio?: number;
  /** Cache policy customizado (opcional) - auto-detecta se não fornecido */
  cachePolicy?: ImageCachePolicy;
  /** Tamanho máximo da imagem (opcional) - para otimização de memória */
  maxWidth?: number;
  maxHeight?: number;
}

/**
 * Determina cache policy baseado no tipo de imagem
 */
const getCachePolicy = (uri: string, customPolicy?: ImageCachePolicy): ImageCachePolicy => {
  if (customPolicy) return customPolicy;

  // Cache agressivo para imagens estáticas (avatars, ícones)
  if (uri.includes('avatar') || uri.includes('icon') || uri.includes('static')) {
    return 'memory-disk';
  }

  // Cache moderado para thumbnails
  if (uri.includes('thumbnail') || uri.includes('thumb')) {
    return 'memory';
  }

  // Cache mínimo para conteúdo dinâmico (posts, feed)
  return 'memory';
};

/**
 * OptimizedImage - Componente de imagem otimizado
 *
 * @example
 * ```tsx
 * <OptimizedImage
 *   uri="https://example.com/image.jpg"
 *   blurhash="LKO2?U%2Tw=w]~RBVZRi};RPxuwH"
 *   priority="high"
 *   aspectRatio={16/9}
 * />
 * ```
 */
export const OptimizedImage: React.FC<OptimizedImageProps> = React.memo(
  ({
    uri,
    blurhash,
    priority = 'normal',
    aspectRatio,
    cachePolicy,
    maxWidth,
    maxHeight,
    style,
    onError,
    ...props
  }: OptimizedImageProps) => {
    // Determinar cache policy automaticamente se não fornecido
    const finalCachePolicy = useMemo(() => getCachePolicy(uri, cachePolicy), [uri, cachePolicy]);

    // Estilo com aspect ratio se fornecido
    const imageStyle = useMemo(() => {
      const baseStyle: ImageStyle[] = [styles.image];

      if (aspectRatio) {
        baseStyle.push({ aspectRatio } as ImageStyle);
      }

      if (maxWidth) {
        baseStyle.push({ maxWidth } as ImageStyle);
      }

      if (maxHeight) {
        baseStyle.push({ maxHeight } as ImageStyle);
      }

      if (style) {
        baseStyle.push(StyleSheet.flatten(style) as ImageStyle);
      }

      return baseStyle;
    }, [aspectRatio, maxWidth, maxHeight, style]);

    // Handler de erro melhorado
    const handleError = (event: ImageErrorEventData) => {
      logger.error(`[OptimizedImage] Erro ao carregar imagem: ${uri}`, event.error);
      if (onError) {
        onError(event);
      }
    };

    return (
      <Image
        source={{ uri }}
        style={imageStyle}
        contentFit="cover"
        transition={200} // Transição suave
        cachePolicy={finalCachePolicy}
        priority={priority}
        placeholder={blurhash ? { blurhash } : undefined}
        recyclingKey={uri} // Reutilizar views de imagem para melhor performance
        onError={handleError}
        accessibilityIgnoresInvertColors // Respeitar preferências de acessibilidade
        {...props}
      />
    );
  },
  (prevProps: OptimizedImageProps, nextProps: OptimizedImageProps) => {
    // Comparação otimizada para evitar re-renders desnecessários
    return (
      prevProps.uri === nextProps.uri &&
      prevProps.blurhash === nextProps.blurhash &&
      prevProps.priority === nextProps.priority &&
      prevProps.aspectRatio === nextProps.aspectRatio &&
      prevProps.cachePolicy === nextProps.cachePolicy
    );
  }
) as React.FC<OptimizedImageProps>;

OptimizedImage.displayName = 'OptimizedImage';

const styles = StyleSheet.create({
  image: {
    width: '100%',
    height: '100%',
  },
});
