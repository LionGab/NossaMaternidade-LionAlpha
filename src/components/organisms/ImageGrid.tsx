/**
 * ImageGrid - Grid 2x2 para experiências estilo Airbnb
 * Grid de 4 imagens com cantos arredondados, badge e favoritos
 *
 * ATUALIZADO: Estilo das imagens Airbnb
 * - Badge "Original" / "Popular" no canto superior esquerdo
 * - Botão de favorito (coração) no canto superior direito
 * - Bordas arredondadas maiores (estilo Airbnb)
 *
 * @example
 * <ImageGrid
 *   images={['...', '...', '...', '...']}
 *   badge="Original"
 *   isFavorite={false}
 *   onPress={() => {}}
 *   onFavoritePress={() => toggleFavorite()}
 * />
 */

import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { Heart } from 'lucide-react-native';
import React from 'react';
import { TouchableOpacity, ViewStyle, View, Pressable } from 'react-native';

import { Box } from '@/components/atoms/Box';
import { Text } from '@/components/atoms/Text';
import { useResponsiveDimensions } from '@/hooks/useResponsiveDimensions';
import { useTheme } from '@/theme';
import { Tokens, ColorTokens } from '@/theme/tokens';

export interface ImageGridProps {
  /** Array de 4 URLs de imagens */
  images: string[];
  /** Badge opcional (ex: "Original", "Popular", "Hoje") */
  badge?: string;
  /** Variante do badge */
  badgeVariant?: 'default' | 'highlight' | 'pink';
  /** É favorito */
  isFavorite?: boolean;
  /** Callback ao pressionar */
  onPress?: () => void;
  /** Callback ao favoritar */
  onFavoritePress?: () => void;
  /** Estilo customizado */
  style?: ViewStyle;
  /** Gap entre imagens */
  gap?: number;
  /** Mostrar overlay escuro no hover/press */
  showOverlay?: boolean;
}

export function ImageGrid({
  images,
  badge,
  badgeVariant = 'default',
  isFavorite = false,
  onPress,
  onFavoritePress,
  style,
  gap = 2,
  showOverlay = false,
}: ImageGridProps) {
  const { colors, isDark } = useTheme();
  const { cardWidth } = useResponsiveDimensions();

  // Garantir exatamente 4 imagens
  const displayImages = images.slice(0, 4);
  while (displayImages.length < 4) {
    displayImages.push('');
  }

  const handlePress = () => {
    if (onPress) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress();
    }
  };

  const handleFavoritePress = () => {
    if (onFavoritePress) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onFavoritePress();
    }
  };

  const gridSize = (cardWidth - gap) / 2; // 2 colunas, 1 gap central

  // Cores do badge por variante
  const getBadgeColors = () => {
    switch (badgeVariant) {
      case 'pink':
        // Badge rosa (ex: "Hoje" na timeline)
        return {
          bg: ColorTokens.primaryPink[400],
          text: ColorTokens.neutral[0],
        };
      case 'highlight':
        // Badge destacado
        return {
          bg: isDark ? ColorTokens.neutral[800] : ColorTokens.neutral[0],
          text: colors.text.primary,
        };
      default:
        // Badge padrão (branco com texto escuro)
        return {
          bg: isDark ? ColorTokens.neutral[900] : ColorTokens.neutral[0],
          text: colors.text.primary,
        };
    }
  };

  const badgeColors = getBadgeColors();

  return (
    <View style={[{ position: 'relative' }, style]}>
      {/* Grid principal */}
      <Pressable
        onPress={handlePress}
        disabled={!onPress}
        accessibilityRole={onPress ? 'button' : 'image'}
        accessibilityLabel={badge ? `Grid de imagens: ${badge}` : 'Grid de imagens'}
        style={({ pressed }) => ({
          opacity: pressed ? 0.95 : 1,
        })}
      >
        <Box
          style={{
            width: cardWidth,
            height: cardWidth, // Quadrado
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap,
            borderRadius: Tokens.radius.xl, // Borda arredondada do container
            overflow: 'hidden',
          }}
        >
          {displayImages.map((image, index) => (
            <Box
              key={index}
              style={{
                width: gridSize,
                height: gridSize,
                backgroundColor: isDark ? ColorTokens.neutral[800] : ColorTokens.neutral[200],
              }}
            >
              {image ? (
                <Image
                  source={{ uri: image }}
                  style={{ width: '100%', height: '100%' }}
                  contentFit="cover"
                  transition={300}
                  cachePolicy="memory-disk"
                />
              ) : (
                <Box flex={1} align="center" justify="center" bg="elevated">
                  <Text size="xs" color="tertiary">
                    {index + 1}
                  </Text>
                </Box>
              )}
            </Box>
          ))}

          {/* Overlay opcional */}
          {showOverlay && (
            <Box
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: ColorTokens.overlay.darkGlass,
              }}
            />
          )}
        </Box>
      </Pressable>

      {/* Badge (canto superior esquerdo) - estilo Airbnb */}
      {badge && (
        <Box
          px="3"
          py="1.5"
          rounded="md"
          shadow="sm"
          style={{
            position: 'absolute',
            top: Tokens.spacing['3'],
            left: Tokens.spacing['3'],
            backgroundColor: badgeColors.bg,
          }}
        >
          <Text size="xs" weight="semibold" style={{ color: badgeColors.text }}>
            {badge}
          </Text>
        </Box>
      )}

      {/* Botão favorito (canto superior direito) - estilo Airbnb */}
      {onFavoritePress && (
        <TouchableOpacity
          onPress={handleFavoritePress}
          style={{
            position: 'absolute',
            top: Tokens.spacing['3'],
            right: Tokens.spacing['3'],
            width: Tokens.touchTargets.min,
            height: Tokens.touchTargets.min,
            alignItems: 'center',
            justifyContent: 'center',
          }}
          accessibilityRole="button"
          accessibilityLabel={isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
          accessibilityState={{ selected: isFavorite }}
        >
          {/* Sombra de fundo para visibilidade sobre imagens claras */}
          {!isFavorite && (
            <View
              style={{
                position: 'absolute',
                width: 28,
                height: 28,
                borderRadius: 14,
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
              }}
            />
          )}
          <Heart
            size={24}
            color={isFavorite ? ColorTokens.error[500] : ColorTokens.neutral[0]}
            fill={isFavorite ? ColorTokens.error[500] : 'none'}
            strokeWidth={isFavorite ? 0 : 2}
          />
        </TouchableOpacity>
      )}
    </View>
  );
}

export default ImageGrid;
