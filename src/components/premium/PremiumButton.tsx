import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useRef, useCallback } from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  View,
  ViewStyle,
  TextStyle,
  Animated,
} from 'react-native';

import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS, TOUCH_TARGETS } from '../../constants/Theme';
// ANIMATIONS não utilizado - removido

export interface PremiumButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'gradient';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  iconPosition?: 'left' | 'right';
  hapticFeedback?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  testID?: string;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

export const PremiumButton: React.FC<PremiumButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  icon,
  iconPosition = 'left',
  hapticFeedback = true,
  style,
  textStyle,
  testID,
  accessibilityLabel,
  accessibilityHint,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = useCallback(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 0.95,
        useNativeDriver: true,
        speed: 50,
        bounciness: 4,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, [scaleAnim, opacityAnim]);

  const handlePressOut = useCallback(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        speed: 50,
        bounciness: 4,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, [scaleAnim, opacityAnim]);

  const handlePress = useCallback(() => {
    if (disabled || loading) return;

    if (hapticFeedback) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    onPress();
  }, [disabled, loading, hapticFeedback, onPress]);

  const getSizeStyles = (): ViewStyle => {
    switch (size) {
      case 'xs':
        return {
          paddingHorizontal: SPACING[3],
          paddingVertical: SPACING[2],
          minHeight: TOUCH_TARGETS.small,
        };
      case 'sm':
        return {
          paddingHorizontal: SPACING[4],
          paddingVertical: SPACING[2.5],
          minHeight: TOUCH_TARGETS.small,
        };
      case 'md':
        return {
          paddingHorizontal: SPACING[5],
          paddingVertical: SPACING[3],
          minHeight: TOUCH_TARGETS.medium,
        };
      case 'lg':
        return {
          paddingHorizontal: SPACING[6],
          paddingVertical: SPACING[3.5],
          minHeight: TOUCH_TARGETS.large,
        };
      case 'xl':
        return {
          paddingHorizontal: SPACING[8],
          paddingVertical: SPACING[4],
          minHeight: TOUCH_TARGETS.xl,
        };
      default:
        return {};
    }
  };

  const getTextSize = () => {
    switch (size) {
      case 'xs':
        return TYPOGRAPHY.sizes.xs;
      case 'sm':
        return TYPOGRAPHY.sizes.sm;
      case 'md':
        return TYPOGRAPHY.sizes.md;
      case 'lg':
        return TYPOGRAPHY.sizes.lg;
      case 'xl':
        return TYPOGRAPHY.sizes.xl;
      default:
        return TYPOGRAPHY.sizes.md;
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'xs':
        return 14;
      case 'sm':
        return 16;
      case 'md':
        return 18;
      case 'lg':
        return 20;
      case 'xl':
        return 24;
      default:
        return 18;
    }
  };

  const getVariantStyles = (): { container: ViewStyle; text: TextStyle } => {
    const isDisabled = disabled || loading;

    switch (variant) {
      case 'primary':
        return {
          container: {
            backgroundColor: isDisabled ? COLORS.neutral[300] : COLORS.primary[500],
            ...SHADOWS.md,
          },
          text: {
            color: COLORS.text.inverse,
            fontWeight: TYPOGRAPHY.weights.semibold,
          },
        };
      case 'secondary':
        return {
          container: {
            backgroundColor: isDisabled ? COLORS.neutral[100] : COLORS.secondary[500],
            ...SHADOWS.md,
          },
          text: {
            color: COLORS.text.inverse,
            fontWeight: TYPOGRAPHY.weights.semibold,
          },
        };
      case 'outline':
        return {
          container: {
            backgroundColor: 'transparent',
            borderWidth: 2,
            borderColor: isDisabled ? COLORS.neutral[300] : COLORS.primary[500],
          },
          text: {
            color: isDisabled ? COLORS.text.disabled : COLORS.primary[500],
            fontWeight: TYPOGRAPHY.weights.medium,
          },
        };
      case 'ghost':
        return {
          container: {
            backgroundColor: 'transparent',
          },
          text: {
            color: isDisabled ? COLORS.text.disabled : COLORS.primary[500],
            fontWeight: TYPOGRAPHY.weights.medium,
          },
        };
      case 'gradient':
        return {
          container: {
            overflow: 'hidden',
            ...SHADOWS.lg,
          },
          text: {
            color: COLORS.text.inverse,
            fontWeight: TYPOGRAPHY.weights.bold,
          },
        };
      default:
        return { container: {}, text: {} };
    }
  };

  const variantStyles = getVariantStyles();
  const sizeStyles = getSizeStyles();
  const isDisabled = disabled || loading;

  const buttonContent = (
    <View style={styles.contentContainer}>
      {loading ? (
        <ActivityIndicator
          size="small"
          color={
            variant === 'outline' || variant === 'ghost' ? COLORS.primary[500] : COLORS.text.inverse
          }
        />
      ) : (
        <>
          {icon && iconPosition === 'left' && (
            <Ionicons
              name={icon}
              size={getIconSize()}
              color={variantStyles.text.color}
              style={styles.iconLeft}
            />
          )}
          <Text
            style={[
              styles.text,
              {
                fontSize: getTextSize(),
                lineHeight: getTextSize() * 1.5,
              },
              variantStyles.text,
              textStyle,
            ]}
            numberOfLines={1}
          >
            {title}
          </Text>
          {icon && iconPosition === 'right' && (
            <Ionicons
              name={icon}
              size={getIconSize()}
              color={variantStyles.text.color}
              style={styles.iconRight}
            />
          )}
        </>
      )}
    </View>
  );

  const animatedStyle = {
    transform: [{ scale: scaleAnim }],
    opacity: opacityAnim,
  };

  if (variant === 'gradient' && !isDisabled) {
    return (
      <Animated.View style={[animatedStyle, fullWidth && styles.fullWidth]}>
        <TouchableOpacity
          onPress={handlePress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={isDisabled}
          activeOpacity={0.8}
          testID={testID}
          accessibilityLabel={accessibilityLabel || title}
          accessibilityHint={accessibilityHint}
          accessibilityRole="button"
          accessibilityState={{ disabled: isDisabled }}
          style={fullWidth && styles.fullWidth}
        >
          <LinearGradient
            colors={
              COLORS.primary.gradient.length >= 2
                ? ([COLORS.primary.gradient[0], COLORS.primary.gradient[1]] as readonly [
                    string,
                    string,
                  ])
                : [COLORS.primary.main, COLORS.primary.dark]
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.button, sizeStyles, variantStyles.container, style]}
          >
            {buttonContent}
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={[animatedStyle, fullWidth && styles.fullWidth]}>
      <TouchableOpacity
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={isDisabled}
        activeOpacity={0.7}
        testID={testID}
        accessibilityLabel={accessibilityLabel || title}
        accessibilityHint={accessibilityHint}
        accessibilityRole="button"
        accessibilityState={{ disabled: isDisabled }}
        style={[
          styles.button,
          sizeStyles,
          variantStyles.container,
          fullWidth && styles.fullWidth,
          isDisabled && styles.disabled,
          style,
        ]}
      >
        {buttonContent}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: RADIUS.xl,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontFamily: TYPOGRAPHY.fonts.medium,
    letterSpacing: TYPOGRAPHY.letterSpacing.wide,
    textAlign: 'center',
  },
  iconLeft: {
    marginRight: SPACING[2],
  },
  iconRight: {
    marginLeft: SPACING[2],
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.6,
  },
});

export default PremiumButton;
