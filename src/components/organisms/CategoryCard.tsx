/**
 * CategoryCard - Card de categoria estilo Airbnb
 * Card com imagem quadrada, título e contagem de itens
 *
 * Baseado na imagem 2 do Airbnb:
 * - Imagem quadrada com bordas arredondadas
 * - Borda destacada quando selecionado
 * - Título abaixo da imagem
 * - Contagem de itens disponíveis
 *
 * @example
 * <CategoryCard
 *   image="https://..."
 *   title="Chefs"
 *   count={32}
 *   isSelected={true}
 *   onPress={() => selectCategory('chefs')}
 * />
 */

import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import React from 'react';
import { TouchableOpacity, ViewStyle, View } from 'react-native';

import { Box } from '@/components/atoms/Box';
import { Text } from '@/components/atoms/Text';
import { useTheme } from '@/theme';
import { Tokens, ColorTokens } from '@/theme/tokens';

export interface CategoryCardProps {
  /** URL da imagem */
  image: string;
  /** Título da categoria */
  title: string;
  /** Contagem de itens disponíveis */
  count?: number;
  /** Sufixo para contagem (ex: "disponíveis", "itens") */
  countSuffix?: string;
  /** Se está selecionado (mostra borda destacada) */
  isSelected?: boolean;
  /** Callback ao pressionar */
  onPress?: () => void;
  /** Tamanho do card */
  size?: 'sm' | 'md' | 'lg';
  /** Estilo customizado */
  style?: ViewStyle;
}

export function CategoryCard({
  image,
  title,
  count,
  countSuffix = 'disponíveis',
  isSelected = false,
  onPress,
  size = 'md',
  style,
}: CategoryCardProps) {
  const { colors, isDark } = useTheme();

  const handlePress = () => {
    if (onPress) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress();
    }
  };

  // Tamanhos por variante
  const sizeStyles = {
    sm: {
      imageSize: 80,
      borderRadius: Tokens.radius.lg,
      titleSize: 'xs' as const,
      countSize: 'xs' as const,
      countFontSize: 10,
    },
    md: {
      imageSize: 100,
      borderRadius: Tokens.radius.xl,
      titleSize: 'sm' as const,
      countSize: 'xs' as const,
      countFontSize: 12,
    },
    lg: {
      imageSize: 120,
      borderRadius: Tokens.radius['2xl'],
      titleSize: 'md' as const,
      countSize: 'sm' as const,
      countFontSize: 14,
    },
  };

  const currentSize = sizeStyles[size];

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.7}
      disabled={!onPress}
      accessibilityRole="button"
      accessibilityLabel={`${title}${count ? `, ${count} ${countSuffix}` : ''}`}
      accessibilityState={{ selected: isSelected }}
      style={style}
    >
      <View>
        {/* Container da imagem */}
        <Box
          style={{
            width: currentSize.imageSize,
            height: currentSize.imageSize,
            borderRadius: currentSize.borderRadius,
            overflow: 'hidden',
            borderWidth: isSelected ? 2 : 0,
            borderColor: isSelected ? colors.text.primary : 'transparent',
            backgroundColor: isDark ? ColorTokens.neutral[800] : ColorTokens.neutral[100],
          }}
        >
          <Image
            source={{ uri: image }}
            style={{ width: '100%', height: '100%' }}
            contentFit="cover"
            transition={300}
            cachePolicy="memory-disk"
          />
        </Box>

        {/* Texto abaixo */}
        <Box style={{ marginTop: Tokens.spacing['2'], width: currentSize.imageSize }}>
          {/* Título */}
          <Text
            size={currentSize.titleSize}
            weight={isSelected ? 'bold' : 'medium'}
            color="primary"
            numberOfLines={1}
          >
            {title}
          </Text>

          {/* Contagem */}
          {count !== undefined && (
            <Text
              size={currentSize.countSize}
              color="tertiary"
              numberOfLines={1}
              style={{ marginTop: 2, fontSize: currentSize.countFontSize }}
            >
              {count} {countSuffix}
            </Text>
          )}
        </Box>
      </View>
    </TouchableOpacity>
  );
}

export default CategoryCard;
