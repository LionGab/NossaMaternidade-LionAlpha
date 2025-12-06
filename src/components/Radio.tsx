/**
 * Radio Component - Animated radio button with group support
 * Componente de radio button animado com suporte a grupos
 */

import * as Haptics from 'expo-haptics';
import React, { createContext, useContext } from 'react';
import { Pressable, Text, View, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { useThemeColors } from '@/theme';
import { Spacing, Typography } from '@/theme/tokens';

interface RadioGroupContextValue {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

const RadioGroupContext = createContext<RadioGroupContextValue | undefined>(undefined);

export interface RadioGroupProps {
  value: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
  children: React.ReactNode;
  containerStyle?: ViewStyle;
}

export const RadioGroup: React.FC<RadioGroupProps> = ({
  value,
  onValueChange,
  disabled = false,
  children,
  containerStyle,
}) => {
  return (
    <RadioGroupContext.Provider value={{ value, onChange: onValueChange, disabled }}>
      <View style={containerStyle}>{children}</View>
    </RadioGroupContext.Provider>
  );
};

export interface RadioProps {
  value: string;
  label?: string;
  description?: string;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  containerStyle?: ViewStyle;
}

export const Radio: React.FC<RadioProps> = ({
  value,
  label,
  description,
  disabled: disabledProp = false,
  size = 'md',
  containerStyle,
}) => {
  const colors = useThemeColors();
  const context = useContext(RadioGroupContext);
  const scale = useSharedValue(1);
  const innerScale = useSharedValue(0);

  const sizeMap = {
    sm: 20,
    md: 24,
    lg: 28,
  };

  const innerSizeMap = {
    sm: 10,
    md: 12,
    lg: 14,
  };

  const circleSize = sizeMap[size];
  const innerSize = innerSizeMap[size];

  const disabled = disabledProp || context?.disabled;
  const checked = context?.value === value;

  const handlePress = () => {
    if (disabled || !context) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    context.onChange(value);

    // Animate scale
    scale.value = withSpring(0.9, {}, () => {
      scale.value = withSpring(1);
    });

    // Animate inner circle
    innerScale.value = withSpring(checked ? 0 : 1, {
      damping: 15,
      stiffness: 150,
    });
  };

  React.useEffect(() => {
    innerScale.value = withTiming(checked ? 1 : 0, { duration: 200 });
    // innerScale é useSharedValue (estável), não precisa estar nas dependências
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checked]);

  const animatedOuterStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const animatedInnerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: innerScale.value }],
    opacity: innerScale.value,
  }));

  const getOuterColor = () => {
    if (checked) return colors.primary.main;
    return colors.border.medium;
  };

  // Gerar label de acessibilidade
  const accessibilityLabel = label || `Opção ${value}`;
  const accessibilityHint = disabled
    ? 'Desabilitado'
    : checked
      ? 'Selecionado. Toque para desmarcar'
      : 'Toque para selecionar';

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      accessibilityRole="radio"
      accessibilityState={{ checked, disabled }}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      style={[
        {
          flexDirection: 'row',
          alignItems: 'flex-start',
          opacity: disabled ? 0.5 : 1,
          paddingVertical: Spacing['2'],
        },
        containerStyle,
      ]}
    >
      <Animated.View
        style={[
          animatedOuterStyle,
          {
            width: circleSize,
            height: circleSize,
            borderRadius: circleSize / 2,
            borderWidth: 2,
            borderColor: getOuterColor(),
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: label ? 2 : 0,
          },
        ]}
      >
        <Animated.View
          style={[
            animatedInnerStyle,
            {
              width: innerSize,
              height: innerSize,
              borderRadius: innerSize / 2,
              backgroundColor: colors.primary.main,
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

export default Radio;
