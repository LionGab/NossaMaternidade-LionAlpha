/**
 * Switch Component - Animated toggle switch with haptic feedback
 * Componente de switch animado com feedback háptico
 */

import * as Haptics from 'expo-haptics';
import React from 'react';
import { Pressable, Text, View, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  interpolateColor,
} from 'react-native-reanimated';

import { useThemeColors } from '@/theme';
import { Spacing, Typography } from '@/theme/tokens';

export interface SwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  containerStyle?: ViewStyle;
}

export const Switch: React.FC<SwitchProps> = ({
  checked,
  onCheckedChange,
  label,
  description,
  disabled = false,
  size = 'md',
  containerStyle,
}) => {
  const colors = useThemeColors();
  const translateX = useSharedValue(checked ? 1 : 0);

  const sizeConfig = {
    sm: { width: 44, height: 24, thumbSize: 18, padding: 3 },
    md: { width: 52, height: 28, thumbSize: 22, padding: 3 },
    lg: { width: 60, height: 32, thumbSize: 26, padding: 3 },
  };

  const { width, height, thumbSize, padding } = sizeConfig[size];

  React.useEffect(() => {
    translateX.value = withSpring(checked ? 1 : 0, {
      damping: 15,
      stiffness: 150,
    });
  }, [checked]);

  const handlePress = () => {
    if (disabled) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onCheckedChange(!checked);
  };

  const animatedTrackStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      translateX.value,
      [0, 1],
      [colors.border.medium, colors.primary.main]
    );

    return {
      backgroundColor,
    };
  });

  const animatedThumbStyle = useAnimatedStyle(() => {
    const translateValue = (width - thumbSize - padding * 2) * translateX.value;

    return {
      transform: [{ translateX: translateValue }],
    };
  });

  return (
    <Pressable
      accessibilityRole="button"
      onPress={handlePress}
      disabled={disabled}
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          opacity: disabled ? 0.5 : 1,
        },
        containerStyle,
      ]}
    >
      <Animated.View
        style={[
          animatedTrackStyle,
          {
            width,
            height,
            borderRadius: height / 2,
            padding,
            justifyContent: 'center',
          },
        ]}
      >
        <Animated.View
          style={[
            animatedThumbStyle,
            {
              width: thumbSize,
              height: thumbSize,
              borderRadius: thumbSize / 2,
              backgroundColor: colors.text.inverse,
              shadowColor: colors.raw.neutral[900],
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.2,
              shadowRadius: 2,
              elevation: 3,
            },
          ]}
        />
      </Animated.View>

      {(label || description) && (
        <View style={{ marginLeft: Spacing['3'], flex: 1 }}>
          {label && (
            <Text
              style={{
                color: colors.text.primary,
                fontSize: Typography.sizes.base,
                fontWeight: Typography.weights.medium,
                marginBottom: description ? Spacing['0.5'] : 0,
              }}
            >
              {label}
            </Text>
          )}
          {description && (
            <Text
              style={{
                color: colors.text.secondary,
                fontSize: Typography.sizes.sm,
              }}
            >
              {description}
            </Text>
          )}
        </View>
      )}
    </Pressable>
  );
};

export default Switch;
