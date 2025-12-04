import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useRef, useEffect } from 'react';
import {
  StyleSheet,
  ViewStyle,
  StyleProp,
  Animated,
  TouchableOpacity,
  Platform,
  Dimensions,
} from 'react-native';

import { ColorTokens } from '@/theme/tokens';

import { COLORS, RADIUS, SHADOWS, SPACING, ANIMATIONS } from '../../constants/Theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export interface PremiumCardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'gradient' | 'glass' | 'bordered';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  margin?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  onPress?: () => void;
  disabled?: boolean;
  animated?: boolean;
  animationType?: 'fadeIn' | 'slideUp' | 'scaleIn' | 'slideInLeft' | 'slideInRight';
  delay?: number;
  style?: ViewStyle;
  gradientColors?: string[];
  hapticFeedback?: boolean;
  fullWidth?: boolean;
}

export const PremiumCard: React.FC<PremiumCardProps> = ({
  children,
  variant = 'default',
  padding = 'md',
  margin = 'none',
  onPress,
  disabled = false,
  animated = true,
  animationType = 'fadeIn',
  delay = 0,
  style,
  gradientColors = COLORS.background.gradient.premium as string[],
  hapticFeedback = true,
  fullWidth = false,
}) => {
  const fadeAnim = useRef(new Animated.Value(animated ? 0 : 1)).current;
  const translateY = useRef(new Animated.Value(animated ? 20 : 0)).current;
  const translateX = useRef(
    new Animated.Value(
      animated
        ? animationType === 'slideInLeft'
          ? -SCREEN_WIDTH
          : animationType === 'slideInRight'
            ? SCREEN_WIDTH
            : 0
        : 0
    )
  ).current;
  const scale = useRef(new Animated.Value(animated ? 0.9 : 1)).current;
  const pressScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!animated) return;

    const animations = [];

    switch (animationType) {
      case 'fadeIn':
        animations.push(
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: ANIMATIONS.duration.normal,
            delay,
            useNativeDriver: true,
          })
        );
        break;

      case 'slideUp':
        animations.push(
          Animated.parallel([
            Animated.timing(fadeAnim, {
              toValue: 1,
              duration: ANIMATIONS.duration.normal,
              delay,
              useNativeDriver: true,
            }),
            Animated.spring(translateY, {
              toValue: 0,
              delay,
              useNativeDriver: true,
              damping: 12,
              stiffness: 100,
            }),
          ])
        );
        break;

      case 'scaleIn':
        animations.push(
          Animated.parallel([
            Animated.timing(fadeAnim, {
              toValue: 1,
              duration: ANIMATIONS.duration.normal,
              delay,
              useNativeDriver: true,
            }),
            Animated.spring(scale, {
              toValue: 1,
              delay,
              useNativeDriver: true,
              damping: 10,
              stiffness: 100,
            }),
          ])
        );
        break;

      case 'slideInLeft':
      case 'slideInRight':
        animations.push(
          Animated.parallel([
            Animated.timing(fadeAnim, {
              toValue: 1,
              duration: ANIMATIONS.duration.normal,
              delay,
              useNativeDriver: true,
            }),
            Animated.spring(translateX, {
              toValue: 0,
              delay,
              useNativeDriver: true,
              damping: 15,
              stiffness: 100,
            }),
          ])
        );
        break;
    }

    if (animations.length > 0) {
      Animated.parallel(animations).start();
    }
  }, [animated, animationType, delay]);

  const handlePressIn = () => {
    Animated.spring(pressScale, {
      toValue: 0.98,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(pressScale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  };

  const handlePress = () => {
    if (disabled || !onPress) return;

    if (hapticFeedback) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    onPress();
  };

  const getPaddingStyle = (): ViewStyle => {
    switch (padding) {
      case 'none':
        return { padding: 0 };
      case 'sm':
        return { padding: SPACING[3] };
      case 'md':
        return { padding: SPACING[4] };
      case 'lg':
        return { padding: SPACING[5] };
      case 'xl':
        return { padding: SPACING[6] };
      default:
        return {};
    }
  };

  const getMarginStyle = (): ViewStyle => {
    switch (margin) {
      case 'none':
        return {};
      case 'sm':
        return { margin: SPACING[2] };
      case 'md':
        return { margin: SPACING[3] };
      case 'lg':
        return { margin: SPACING[4] };
      case 'xl':
        return { margin: SPACING[5] };
      default:
        return {};
    }
  };

  const getVariantStyle = (): ViewStyle => {
    switch (variant) {
      case 'elevated':
        return {
          backgroundColor: COLORS.background.elevated,
          ...SHADOWS.xl,
        };
      case 'bordered':
        return {
          backgroundColor: COLORS.background.card,
          borderWidth: 1,
          borderColor: COLORS.border.light,
        };
      case 'glass':
        return {
          backgroundColor: ColorTokens.overlay.glass || 'rgba(255, 255, 255, 0.95)', // Glass effect overlay
          ...Platform.select({
            ios: {
              backdropFilter: 'blur(20px)',
            },
          }),
          ...SHADOWS.lg,
        };
      case 'gradient':
        return {
          overflow: 'hidden',
          ...SHADOWS.xl,
        };
      default:
        return {
          backgroundColor: COLORS.background.card,
          ...SHADOWS.md,
        };
    }
  };

  const getAnimatedStyle = () => {
    const transforms: Array<{
      scale?: Animated.Value;
      translateY?: Animated.Value;
      translateX?: Animated.Value;
    }> = [];

    // Sempre adicionar scale
    transforms.push({ scale: pressScale });

    // Adicionar transform específico por tipo de animação
    switch (animationType) {
      case 'slideUp':
        transforms.push({ translateY });
        break;
      case 'scaleIn':
        // Substituir o scale anterior
        return {
          opacity: fadeAnim,
          transform: [{ scale: Animated.multiply(scale, pressScale) }],
        };
      case 'slideInLeft':
      case 'slideInRight':
        transforms.push({ translateX });
        break;
    }

    return {
      opacity: fadeAnim,
      transform: transforms,
    };
  };

  const cardStyle = [
    styles.card,
    getPaddingStyle(),
    getMarginStyle(),
    getVariantStyle(),
    fullWidth && styles.fullWidth,
    disabled && styles.disabled,
    style,
  ];

  const animatedCardStyle = [getAnimatedStyle(), cardStyle];

  const content =
    variant === 'gradient' ? (
      <LinearGradient
        colors={
          gradientColors.length >= 2
            ? ([gradientColors[0], gradientColors[1]] as readonly [string, string])
            : [COLORS.primary.main, COLORS.primary.dark]
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.gradientContainer, getPaddingStyle()]}
      >
        {children}
      </LinearGradient>
    ) : (
      children
    );

  if (onPress) {
    return (
      <Animated.View style={animatedCardStyle as StyleProp<ViewStyle>}>
        <TouchableOpacity
          onPress={handlePress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={disabled}
          activeOpacity={0.9}
          accessibilityRole="button"
          accessibilityState={{ disabled }}
          style={styles.touchable}
        >
          {content}
        </TouchableOpacity>
      </Animated.View>
    );
  }

  return <Animated.View style={animatedCardStyle as StyleProp<ViewStyle>}>{content}</Animated.View>;
};

const styles = StyleSheet.create({
  card: {
    borderRadius: RADIUS['2xl'],
    overflow: 'hidden',
  },
  touchable: {
    flex: 1,
  },
  gradientContainer: {
    flex: 1,
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.6,
  },
});

export default PremiumCard;
