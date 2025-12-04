/**
 * ListingCard - Card estilo Airbnb
 * Componente para exibir listagens com imagem, rating, preço e favoritos
 *
 * @example
 * <ListingCard
 *   id="1"
 *   image="https://..."
 *   title="Apartamento aconchegante"
 *   subtitle="São Paulo, Brasil"
 *   rating={4.8}
 *   reviews={127}
 *   price={150}
 *   isFavorite={false}
 *   onPress={() => {}}
 *   onFavoritePress={() => {}}
 * />
 */

import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { Heart, Star } from 'lucide-react-native';
import React from 'react';
import { ViewStyle, Pressable, View } from 'react-native';

import { Box } from '@/components/primitives/Box';
import { HapticButton } from '@/components/primitives/HapticButton';
import { Text } from '@/components/primitives/Text';
import { useResponsiveDimensions } from '@/hooks/useResponsiveDimensions';
import { useTheme } from '@/theme';
import { Tokens, ColorTokens } from '@/theme/tokens';

export interface ListingCardProps {
  /** ID único */
  id: string;
  /** URL da imagem */
  image: string;
  /** Título */
  title: string;
  /** Subtítulo (localização, categoria, etc.) */
  subtitle?: string;
  /** Rating (0-5) */
  rating?: number;
  /** Número de reviews */
  reviews?: number;
  /** Preço (opcional) */
  price?: number;
  /** Moeda (padrão: R$) */
  currency?: string;
  /** Badge opcional (ex: "Preferido", "NOVO") */
  badge?: string;
  /** É favorito */
  isFavorite?: boolean;
  /** Callback ao pressionar card */
  onPress?: () => void;
  /** Callback ao favoritar */
  onFavoritePress?: () => void;
  /** Estilo customizado */
  style?: ViewStyle;
  /** Variante do card */
  variant?: 'default' | 'compact';
}

export function ListingCard({
  image,
  title,
  subtitle,
  rating,
  reviews,
  price,
  currency = 'R$',
  badge,
  isFavorite = false,
  onPress,
  onFavoritePress,
  style,
  variant = 'default',
}: ListingCardProps) {
  const { isDark } = useTheme();
  const { cardWidth } = useResponsiveDimensions();

  const handleFavoritePress = () => {
    if (onFavoritePress) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onFavoritePress();
    }
  };

  const handlePress = () => {
    if (onPress) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress();
    }
  };

  const imageHeight = variant === 'compact' ? 180 : 240;

  return (
    <View style={style}>
      <Box
        style={{
          width: cardWidth,
          marginBottom: Tokens.spacing['4'],
        }}
      >
        {/* Container da imagem com posicionamento relativo */}
        <View style={{ position: 'relative' }}>
          {/* Card principal - usar Pressable em vez de TouchableOpacity para evitar botão aninhado na web */}
          <Pressable
            onPress={handlePress}
            accessibilityRole="button"
            accessibilityLabel={`${title}${subtitle ? ` em ${subtitle}` : ''}${rating ? `. ${rating} estrelas` : ''}`}
            style={({ pressed }) => ({
              opacity: pressed ? 0.9 : 1,
            })}
          >
            {/* Imagem */}
            <Box
              style={{
                width: '100%',
                height: imageHeight,
                borderRadius: Tokens.radius.xl,
                overflow: 'hidden',
                marginBottom: Tokens.spacing['2'],
                position: 'relative',
              }}
            >
              <Image
                source={{ uri: image }}
                style={{ width: '100%', height: '100%' }}
                contentFit="cover"
                transition={300}
                cachePolicy="memory-disk"
              />

              {/* Overlay gradiente sutil */}
              <Box
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: '30%',
                  backgroundColor: ColorTokens.overlay.darkGlass, // rgba(0, 0, 0, 0.3) - usando token
                }}
              />

              {/* Badge */}
              {badge && (
                <Box
                  bg="elevated"
                  px="2"
                  py="1"
                  rounded="md"
                  style={{
                    position: 'absolute',
                    top: Tokens.spacing['2'],
                    left: Tokens.spacing['2'],
                    backgroundColor: isDark ? ColorTokens.neutral[900] : ColorTokens.neutral[0],
                    opacity: 0.9,
                  }}
                >
                  <Text size="xs" weight="bold" color="primary">
                    {badge}
                  </Text>
                </Box>
              )}
            </Box>
          </Pressable>

          {/* Botão favorito posicionado absolutamente FORA do Pressable para evitar aninhamento */}
          {onFavoritePress && (
            <View
              style={{
                position: 'absolute',
                top: Tokens.spacing['2'],
                right: Tokens.spacing['2'],
                zIndex: 10, // Garantir que fica acima
                pointerEvents: 'box-none', // Permite cliques passarem através, exceto no botão
              }}
            >
              <HapticButton
                variant="ghost"
                onPress={handleFavoritePress}
                style={{
                  width: Tokens.touchTargets.min,
                  height: Tokens.touchTargets.min,
                  borderRadius: Tokens.radius.full,
                  backgroundColor: isDark ? ColorTokens.overlay.dark : ColorTokens.overlay.light,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                accessibilityLabel={
                  isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'
                }
              >
                <Heart
                  size={20}
                  color={isFavorite ? ColorTokens.error[500] : ColorTokens.neutral[0]}
                  fill={isFavorite ? ColorTokens.error[500] : 'none'}
                />
              </HapticButton>
            </View>
          )}
        </View>

        {/* Conteúdo */}
        <Box>
          {/* Rating e reviews */}
          {rating !== undefined && (
            <Box direction="row" align="center" style={{ marginBottom: Tokens.spacing['1'] }}>
              <Star size={14} color={ColorTokens.warning[500]} fill={ColorTokens.warning[500]} />
              <Text
                size="sm"
                weight="semibold"
                color="primary"
                style={{ marginLeft: Tokens.spacing['1'] }}
              >
                {rating.toFixed(1)}
              </Text>
              {reviews !== undefined && reviews > 0 && (
                <Text size="sm" color="tertiary" style={{ marginLeft: Tokens.spacing['1'] }}>
                  ({reviews})
                </Text>
              )}
            </Box>
          )}

          {/* Título */}
          <Text
            size="md"
            weight="semibold"
            color="primary"
            numberOfLines={2}
            style={{ marginBottom: Tokens.spacing['0.5'] }}
          >
            {title}
          </Text>

          {/* Subtítulo */}
          {subtitle && (
            <Text
              size="sm"
              color="secondary"
              numberOfLines={1}
              style={{ marginBottom: Tokens.spacing['1'] }}
            >
              {subtitle}
            </Text>
          )}

          {/* Preço */}
          {price !== undefined && (
            <Box direction="row" align="flex-end">
              <Text size="lg" weight="bold" color="primary">
                {currency} {price}
              </Text>
              <Text size="sm" color="tertiary" style={{ marginLeft: Tokens.spacing['1'] }}>
                /noite
              </Text>
            </Box>
          )}
        </Box>
      </Box>
    </View>
  );
}

export default ListingCard;
