/**
 * Input Component - Theme-aware text input with animations
 * Componente de input profissional com suporte a temas e animações
 */

import React, { useState } from 'react';
import { TextInput, View, Text, TextInputProps, ViewStyle, TextStyle } from 'react-native';

import { useThemeColors } from '@/theme';
import { Spacing, Radius, Typography, ColorTokens } from '@/theme/tokens';

export interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  disabled?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  containerStyle,
  inputStyle,
  disabled = false,
  ...props
}) => {
  const colors = useThemeColors();
  const [isFocused, setIsFocused] = useState(false);

  const getBorderColor = () => {
    if (disabled) return colors.border.light;
    if (error) return colors.status.error;
    if (isFocused) return colors.border.focus;
    return colors.border.medium;
  };

  const getBackgroundColor = () => {
    // Input sempre tem fundo branco, mesmo no dark mode (conforme design do site)
    if (disabled) return ColorTokens.neutral[100]; // #F5F5F5
    return colors.background.input; // #FFFFFF
  };

  return (
    <View style={[{ marginBottom: Spacing['4'] }, containerStyle]}>
      {label && (
        <Text
          style={{
            color: colors.text.secondary,
            fontSize: Typography.sizes.sm,
            fontWeight: Typography.weights.medium,
            marginBottom: Spacing['2'],
          }}
        >
          {label}
        </Text>
      )}

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: getBackgroundColor(),
          borderRadius: Radius.lg,
          paddingHorizontal: Spacing['4'],
          paddingVertical: Spacing['3'],
          borderWidth: 2,
          borderColor: getBorderColor(),
          opacity: disabled ? 0.6 : 1,
        }}
      >
        {leftIcon && <View style={{ marginRight: Spacing['3'] }}>{leftIcon}</View>}

        <TextInput
          {...props}
          editable={!disabled}
          onFocus={(e) => {
            setIsFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            props.onBlur?.(e);
          }}
          placeholderTextColor={colors.text.placeholder}
          style={[
            {
              flex: 1,
              color: colors.text.inverse, // Texto sempre preto no input (fundo branco)
              fontSize: Typography.sizes.base,
              fontFamily: Typography.fonts.body,
            },
            inputStyle,
          ]}
        />

        {rightIcon && <View style={{ marginLeft: Spacing['3'] }}>{rightIcon}</View>}
      </View>

      {(error || helperText) && (
        <Text
          style={{
            color: error ? colors.status.error : colors.text.tertiary,
            fontSize: Typography.sizes.sm,
            marginTop: Spacing['1'],
          }}
        >
          {error || helperText}
        </Text>
      )}
    </View>
  );
};

export default Input;
