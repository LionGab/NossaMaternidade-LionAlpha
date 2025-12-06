/**
 * Skeleton Component - Loading skeleton with shimmer animation
 * Componente de skeleton para loading states com animação shimmer
 */

import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect } from 'react';
import { View, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  interpolate,
} from 'react-native-reanimated';

import { useThemeColors } from '@/theme';
import { Radius } from '@/theme/tokens';

export type SkeletonVariant = 'text' | 'circular' | 'rectangular';

export interface SkeletonProps {
  variant?: SkeletonVariant;
  width?: number | string;
  height?: number | string;
  borderRadius?: keyof typeof Radius;
  containerStyle?: ViewStyle;
  animated?: boolean;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'rectangular',
  width = '100%',
  height = 20,
  borderRadius,
  containerStyle,
  animated = true,
}) => {
  const colors = useThemeColors();
  const shimmerTranslate = useSharedValue(-1);

  useEffect(() => {
    if (animated) {
      shimmerTranslate.value = withRepeat(withTiming(1, { duration: 1500 }), -1, false);
    }
    // shimmerTranslate é useSharedValue (estável), não precisa estar nas dependências
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animated]);

  const animatedStyle = useAnimatedStyle(() => {
    if (!animated) return {};

    const translateX = interpolate(shimmerTranslate.value, [-1, 1], [-300, 300]);

    return {
      transform: [{ translateX }],
    };
  });

  const getVariantStyle = () => {
    switch (variant) {
      case 'text':
        return {
          width,
          height: height || 16,
          borderRadius: borderRadius ? Radius[borderRadius] : Radius.sm,
        };
      case 'circular':
        {
          const size = typeof width === 'number' ? width : 40;
          return {
            width: size,
            height: size,
            borderRadius: size / 2,
          };
        }
      case 'rectangular':
      default:
        return {
          width,
          height,
          borderRadius: borderRadius ? Radius[borderRadius] : Radius.md,
        };
    }
  };

  const baseColor = colors.background.elevated;
  const highlightColor = colors.background.card;

  return (
    <View
      style={[
        {
          overflow: 'hidden',
          backgroundColor: baseColor,
        },
        getVariantStyle() as ViewStyle,
        containerStyle,
      ]}
    >
      {animated && (
        <Animated.View style={[{ width: '100%', height: '100%' }, animatedStyle]}>
          <LinearGradient
            colors={[baseColor, highlightColor, baseColor]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ width: '100%', height: '100%' }}
          />
        </Animated.View>
      )}
    </View>
  );
};

// Pre-built skeleton patterns
export const SkeletonText: React.FC<{ lines?: number; containerStyle?: ViewStyle }> = ({
  lines = 3,
  containerStyle,
}) => {
  return (
    <View style={containerStyle}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          variant="text"
          width={index === lines - 1 ? '70%' : '100%'}
          containerStyle={{ marginBottom: 8 }}
        />
      ))}
    </View>
  );
};

export const SkeletonCard: React.FC<{ containerStyle?: ViewStyle }> = ({ containerStyle }) => {
  const colors = useThemeColors();

  return (
    <View
      style={[
        {
          backgroundColor: colors.background.card,
          borderRadius: Radius.xl,
          padding: 16,
        },
        containerStyle,
      ]}
    >
      <View style={{ flexDirection: 'row', marginBottom: 16 }}>
        <Skeleton variant="circular" width={48} containerStyle={{ marginRight: 12 }} />
        <View style={{ flex: 1 }}>
          <Skeleton variant="text" height={16} width="60%" containerStyle={{ marginBottom: 8 }} />
          <Skeleton variant="text" height={14} width="40%" />
        </View>
      </View>
      <Skeleton variant="rectangular" height={120} containerStyle={{ marginBottom: 12 }} />
      <SkeletonText lines={2} />
    </View>
  );
};

export default Skeleton;
