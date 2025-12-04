/**
 * ImageCarousel - Carrossel de imagens estilo Airbnb
 * Com paginação dots e swipe horizontal
 *
 * @example
 * <ImageCarousel
 *   images={['url1', 'url2', 'url3']}
 *   aspectRatio={4/3}
 *   showDots
 * />
 */

import { Image } from 'expo-image';
import React, { useState, useCallback, useRef } from 'react';
import { View, FlatList, StyleSheet, Dimensions, ViewToken } from 'react-native';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';

import { useTheme, useThemeColors } from '@/theme';
import { Tokens, ColorTokens } from '@/theme/tokens';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export interface ImageCarouselProps {
  /** Array de URLs das imagens */
  images: string[];
  /** Largura do carrossel (default: screen width) */
  width?: number;
  /** Aspect ratio (ex: 4/3, 16/9) */
  aspectRatio?: number;
  /** Mostrar dots de paginação */
  showDots?: boolean;
  /** Posição dos dots */
  dotsPosition?: 'inside' | 'outside';
  /** Border radius das imagens */
  borderRadius?: number;
  /** Callback ao mudar de imagem */
  onIndexChange?: (index: number) => void;
  /** Placeholder enquanto carrega */
  placeholder?: string;
  /** Content fit da imagem */
  contentFit?: 'cover' | 'contain' | 'fill';
}

interface DotProps {
  index: number;
  activeIndex: number;
}

function PaginationDot({ index, activeIndex }: DotProps) {
  const isActive = index === activeIndex;
  const { isDark } = useTheme();
  const colors = useThemeColors();

  const animatedStyle = useAnimatedStyle(() => {
    const width = withSpring(isActive ? 24 : 8, {
      damping: 15,
      stiffness: 200,
    });
    const opacity = withSpring(isActive ? 1 : 0.5, {
      damping: 15,
      stiffness: 200,
    });

    return {
      width,
      opacity,
    };
  });

  return (
    <Animated.View
      style={[
        styles.dot,
        {
          backgroundColor: isActive
            ? colors.text.inverse
            : isDark
              ? ColorTokens.overlay.light
              : ColorTokens.overlay.light,
        },
        animatedStyle,
      ]}
    />
  );
}

export function ImageCarousel({
  images,
  width = SCREEN_WIDTH,
  aspectRatio = 4 / 3,
  showDots = true,
  dotsPosition = 'inside',
  borderRadius = Tokens.radius.airbnb,
  onIndexChange,
  placeholder = 'L6PZfSi_.AyE_3t7t7R**0LMxvR4',
  contentFit = 'cover',
}: ImageCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const colors = useThemeColors();

  const height = width / aspectRatio;

  const handleViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index !== null) {
        const newIndex = viewableItems[0].index;
        setActiveIndex(newIndex);
        onIndexChange?.(newIndex);
      }
    },
    [onIndexChange]
  );

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const renderImage = useCallback(
    ({ item, index }: { item: string; index: number }) => (
      <View
        style={[
          styles.imageContainer,
          {
            width,
            height,
            borderRadius: index === 0 ? borderRadius : 0,
          },
        ]}
      >
        <Image
          source={{ uri: item }}
          style={[
            styles.image,
            {
              width,
              height,
            },
          ]}
          contentFit={contentFit}
          placeholder={placeholder}
          transition={300}
        />
      </View>
    ),
    [width, height, borderRadius, contentFit, placeholder]
  );

  const keyExtractor = useCallback((item: string, index: number) => `${item}-${index}`, []);

  // Se só tem uma imagem, não precisa de carrossel
  if (images.length === 1) {
    return (
      <View style={[styles.container, { width, height, borderRadius }]}>
        <Image
          source={{ uri: images[0] }}
          style={[styles.image, { width, height }]}
          contentFit={contentFit}
          placeholder={placeholder}
          transition={300}
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, { width, borderRadius }]}>
      <FlatList
        ref={flatListRef}
        data={images}
        renderItem={renderImage}
        keyExtractor={keyExtractor}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={handleViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        bounces={false}
        decelerationRate="fast"
        snapToInterval={width}
        snapToAlignment="start"
        getItemLayout={(_, index) => ({
          length: width,
          offset: width * index,
          index,
        })}
      />

      {/* Pagination Dots */}
      {showDots && images.length > 1 && (
        <View
          style={[
            styles.dotsContainer,
            dotsPosition === 'inside' ? styles.dotsInside : styles.dotsOutside,
          ]}
        >
          {images.map((_, index) => (
            <PaginationDot key={index} index={index} activeIndex={activeIndex} />
          ))}
        </View>
      )}

      {/* Image counter */}
      {images.length > 1 && (
        <View style={styles.counter}>
          <Animated.Text style={[styles.counterText, { color: colors.text.inverse }]}>
            {activeIndex + 1}/{images.length}
          </Animated.Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    position: 'relative',
  },
  imageContainer: {
    overflow: 'hidden',
  },
  image: {
    backgroundColor: ColorTokens.neutral[100],
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  dotsInside: {
    position: 'absolute',
    bottom: Tokens.spacing['3'],
    left: 0,
    right: 0,
  },
  dotsOutside: {
    marginTop: Tokens.spacing['2'],
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  counter: {
    position: 'absolute',
    top: Tokens.spacing['3'],
    right: Tokens.spacing['3'],
    backgroundColor: ColorTokens.overlay.dark,
    paddingHorizontal: Tokens.spacing['2'],
    paddingVertical: Tokens.spacing['1'],
    borderRadius: Tokens.radius.md,
  },
  counterText: {
    fontSize: 12,
    fontWeight: '600',
  },
});

export default ImageCarousel;
