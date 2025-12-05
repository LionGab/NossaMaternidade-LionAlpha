/**
 * Skeleton
 *
 * Componente de loading placeholder (skeleton screen).
 * Usado para mostrar loading state enquanto conteúdo carrega.
 * Inspirado no design do Flo app.
 *
 * @module components/atoms/Skeleton
 */

import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, ViewStyle, Easing, DimensionValue } from 'react-native';

import { useTheme } from '@/theme';
import { Tokens } from '@/theme/tokens';

// ======================
// 🎯 TYPES
// ======================

export interface SkeletonProps {
  /** Largura (número ou porcentagem) */
  width?: number | string;
  /** Altura */
  height?: number;
  /** Raio de borda */
  borderRadius?: number;
  /** Variante do skeleton */
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  /** Ativar animação shimmer */
  animated?: boolean;
  /** Estilo adicional */
  style?: ViewStyle;
}

export interface SkeletonGroupProps {
  /** Número de linhas */
  lines?: number;
  /** Altura de cada linha */
  lineHeight?: number;
  /** Espaçamento entre linhas */
  spacing?: number;
  /** Última linha menor (para simular texto) */
  lastLineWidth?: number | string;
  /** Animação */
  animated?: boolean;
}

// ======================
// 🎨 VARIANT CONFIGS
// ======================

const getVariantStyle = (variant: SkeletonProps['variant'], height?: number) => {
  switch (variant) {
    case 'circular':
      return {
        borderRadius: height ? height / 2 : 20,
      };
    case 'rounded':
      return {
        borderRadius: Tokens.radius.lg,
      };
    case 'text':
      return {
        borderRadius: Tokens.radius.sm,
        height: height || 16,
      };
    case 'rectangular':
    default:
      return {
        borderRadius: Tokens.radius.md,
      };
  }
};

// ======================
// 🧩 MAIN COMPONENT
// ======================

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 20,
  borderRadius,
  variant = 'rectangular',
  animated = true,
  style,
}) => {
  const { colors, isDark } = useTheme();
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  // Shimmer animation
  useEffect(() => {
    if (!animated) return;

    const animation = Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 1500,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    animation.start();

    return () => animation.stop();
  }, [animated, shimmerAnim]);

  const variantStyle = getVariantStyle(variant, height);

  const baseColor = isDark ? colors.background.elevated : colors.border.light;
  const highlightColor = isDark ? colors.background.card : colors.background.canvas;

  const translateX = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-200, 200],
  });

  const containerStyle: ViewStyle = {
    width: width as DimensionValue,
    height: (variant === 'circular'
      ? typeof width === 'number'
        ? width
        : height
      : height) as DimensionValue,
    backgroundColor: baseColor,
    overflow: 'hidden',
    ...variantStyle,
    ...(borderRadius !== undefined && { borderRadius }),
  };

  return (
    <View style={[containerStyle, style]}>
      {animated && (
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            {
              transform: [{ translateX }],
            },
          ]}
        >
          <LinearGradient
            colors={[baseColor, highlightColor, baseColor]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
      )}
    </View>
  );
};

// ======================
// 🧩 SKELETON GROUP (Multiple Lines)
// ======================

export const SkeletonGroup: React.FC<SkeletonGroupProps> = ({
  lines = 3,
  lineHeight = 16,
  spacing = Tokens.spacing['2'],
  lastLineWidth = '70%',
  animated = true,
}) => {
  return (
    <View style={{ gap: spacing }}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          variant="text"
          height={lineHeight}
          width={index === lines - 1 ? lastLineWidth : '100%'}
          animated={animated}
        />
      ))}
    </View>
  );
};

// ======================
// 🧩 PRESET SKELETONS
// ======================

export const SkeletonAvatar: React.FC<{ size?: number; animated?: boolean }> = ({
  size = 48,
  animated = true,
}) => <Skeleton variant="circular" width={size} height={size} animated={animated} />;

export const SkeletonCard: React.FC<{
  height?: number;
  animated?: boolean;
  showImage?: boolean;
}> = ({ height = 120, animated = true, showImage = true }) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: colors.background.card }]}>
      {showImage && (
        <Skeleton
          variant="rectangular"
          height={height}
          animated={animated}
          style={{ marginBottom: Tokens.spacing['3'] }}
        />
      )}
      <SkeletonGroup lines={2} animated={animated} />
      <View style={styles.cardFooter}>
        <SkeletonAvatar size={32} animated={animated} />
        <Skeleton variant="text" width={100} height={14} animated={animated} />
      </View>
    </View>
  );
};

export const SkeletonListItem: React.FC<{ animated?: boolean }> = ({ animated = true }) => {
  return (
    <View style={styles.listItem}>
      <SkeletonAvatar size={44} animated={animated} />
      <View style={styles.listItemContent}>
        <Skeleton variant="text" width="60%" height={16} animated={animated} />
        <Skeleton
          variant="text"
          width="80%"
          height={14}
          animated={animated}
          style={{ marginTop: Tokens.spacing['1'] }}
        />
      </View>
    </View>
  );
};

// ======================
// 💄 STYLES
// ======================

const styles = StyleSheet.create({
  card: {
    padding: Tokens.spacing['4'],
    borderRadius: Tokens.radius.xl,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Tokens.spacing['3'],
    marginTop: Tokens.spacing['3'],
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Tokens.spacing['3'],
    paddingVertical: Tokens.spacing['3'],
  },
  listItemContent: {
    flex: 1,
  },
});

export default Skeleton;
