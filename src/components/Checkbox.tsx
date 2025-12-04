/**
 * Checkbox Component - Animated checkbox with haptic feedback
 * Componente de checkbox animado com feedback háptico
 */

import * as Haptics from 'expo-haptics';
import { Check } from 'lucide-react-native';
import React from 'react';
import { Pressable, Text, View, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { useThemeColors } from '@/theme';
import { Spacing, Radius, Typography } from '@/theme/tokens';

export interface CheckboxProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  error?: boolean;
  size?: 'sm' | 'md' | 'lg';
  containerStyle?: ViewStyle;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  checked,
  onCheckedChange,
  label,
  description,
  disabled = false,
  error = false,
  size = 'md',
  containerStyle,
}) => {
  const colors = useThemeColors();
  const scale = useSharedValue(1);
  const opacity = useSharedValue(checked ? 1 : 0);

  const sizeMap = {
    sm: 20,
    md: 24,
    lg: 28,
  };

  const iconSizeMap = {
    sm: 14,
    md: 16,
    lg: 20,
  };

  const boxSize = sizeMap[size];
  const iconSize = iconSizeMap[size];

  const handlePress = () => {
    if (disabled) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const newValue = !checked;
    onCheckedChange(newValue);

    // Animate scale
    scale.value = withSpring(0.9, {}, () => {
      scale.value = withSpring(1);
    });

    // Animate checkmark
    opacity.value = withTiming(newValue ? 1 : 0, { duration: 200 });
  };

  const animatedBoxStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const animatedCheckStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const getBoxColor = () => {
    if (disabled) return colors.background.canvas;
    if (error) return colors.raw.error[500];
    if (checked) return colors.primary.main;
    return colors.background.card;
  };

  const getBorderColor = () => {
    if (disabled) return colors.border.light;
    if (error) return colors.raw.error[500];
    if (checked) return colors.primary.main;
    return colors.border.medium;
  };

  // Gerar label de acessibilidade
  const accessibilityLabel = label || (checked ? 'Marcado' : 'Desmarcado');
  const accessibilityHint = disabled
    ? 'Desabilitado'
    : checked
      ? 'Toque para desmarcar'
      : 'Toque para marcar';

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      accessibilityRole="checkbox"
      accessibilityState={{ checked, disabled }}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      style={[
        {
          flexDirection: 'row',
          alignItems: 'flex-start',
          opacity: disabled ? 0.5 : 1,
        },
        containerStyle,
      ]}
    >
      <Animated.View
        style={[
          animatedBoxStyle,
          {
            width: boxSize,
            height: boxSize,
            borderRadius: Radius.sm,
            borderWidth: 2,
            borderColor: getBorderColor(),
            backgroundColor: getBoxColor(),
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: label ? 2 : 0,
          },
        ]}
      >
        <Animated.View style={animatedCheckStyle}>
          <Check size={iconSize} color={colors.text.inverse} strokeWidth={3} />
        </Animated.View>
      </Animated.View>

      {(label || description) && (
        <View style={{ marginLeft: Spacing['3'], flex: 1 }}>
          {label && (
            <Text
              style={{
                color: colors.text.primary,
                fontSize: Typography.sizes.md,
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

export default Checkbox;
