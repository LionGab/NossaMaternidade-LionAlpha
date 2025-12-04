import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  TextInputProps,
  ViewStyle,
  TextStyle,
  KeyboardType,
} from 'react-native';

import { COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS, ANIMATIONS } from '../../constants/Theme';

export interface PremiumInputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  success?: boolean;
  helperText?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
  secureTextEntry?: boolean;
  variant?: 'default' | 'filled' | 'outlined';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  required?: boolean;
  maxLength?: number;
  showCharCount?: boolean;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  labelStyle?: TextStyle;
  animated?: boolean;
  hapticFeedback?: boolean;
  keyboardType?: KeyboardType;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  returnKeyType?: 'done' | 'go' | 'next' | 'search' | 'send';
  onSubmitEditing?: () => void;
}

export const PremiumInput: React.FC<PremiumInputProps> = ({
  label,
  placeholder,
  value,
  onChangeText,
  error,
  success,
  helperText,
  icon,
  rightIcon,
  onRightIconPress,
  secureTextEntry = false,
  variant = 'outlined',
  size = 'md',
  disabled = false,
  required = false,
  maxLength,
  showCharCount = false,
  containerStyle,
  inputStyle,
  labelStyle,
  animated = true,
  hapticFeedback = true,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  returnKeyType = 'done',
  onSubmitEditing,
  ...rest
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const labelAnim = useRef(new Animated.Value(value ? 1 : 0)).current;
  const borderAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (animated) {
      Animated.timing(labelAnim, {
        toValue: isFocused || value ? 1 : 0,
        duration: ANIMATIONS.duration.fast,
        useNativeDriver: true,
      }).start();

      Animated.timing(borderAnim, {
        toValue: isFocused ? 1 : 0,
        duration: ANIMATIONS.duration.fast,
        useNativeDriver: false,
      }).start();
    }
  }, [isFocused, value, animated]);

  useEffect(() => {
    if (error && animated) {
      Animated.sequence([
        Animated.timing(shakeAnim, {
          toValue: 10,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: -10,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: 10,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: 0,
          duration: 50,
          useNativeDriver: true,
        }),
      ]).start();

      if (hapticFeedback) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    }
  }, [error, animated, hapticFeedback]);

  const handleFocus = () => {
    setIsFocused(true);
    if (hapticFeedback) {
      Haptics.selectionAsync();
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
    if (hapticFeedback) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          input: {
            fontSize: TYPOGRAPHY.sizes.sm,
            paddingVertical: SPACING[2],
            paddingHorizontal: SPACING[3],
            minHeight: 40,
          },
          label: {
            fontSize: TYPOGRAPHY.sizes.xs,
          },
        };
      case 'lg':
        return {
          input: {
            fontSize: TYPOGRAPHY.sizes.lg,
            paddingVertical: SPACING[4],
            paddingHorizontal: SPACING[5],
            minHeight: 56,
          },
          label: {
            fontSize: TYPOGRAPHY.sizes.md,
          },
        };
      default:
        return {
          input: {
            fontSize: TYPOGRAPHY.sizes.md,
            paddingVertical: SPACING[3],
            paddingHorizontal: SPACING[4],
            minHeight: 48,
          },
          label: {
            fontSize: TYPOGRAPHY.sizes.sm,
          },
        };
    }
  };

  const getVariantStyles = () => {
    const baseStyles = {
      borderRadius: RADIUS.lg,
    };

    switch (variant) {
      case 'filled':
        return {
          ...baseStyles,
          backgroundColor: isFocused ? COLORS.neutral[50] : COLORS.neutral[100],
          borderWidth: 0,
        };
      case 'outlined':
        return {
          ...baseStyles,
          backgroundColor: COLORS.background.primary,
          borderWidth: 2,
          borderColor: error
            ? COLORS.error.main
            : success
              ? COLORS.success.main
              : isFocused
                ? COLORS.primary[500]
                : COLORS.border.light,
        };
      default:
        return {
          ...baseStyles,
          backgroundColor: COLORS.background.primary,
          borderBottomWidth: 2,
          borderColor: error
            ? COLORS.error.main
            : success
              ? COLORS.success.main
              : isFocused
                ? COLORS.primary[500]
                : COLORS.border.light,
        };
    }
  };

  const sizeStyles = getSizeStyles();
  const variantStyles = getVariantStyles();
  const showPassword = secureTextEntry && !isPasswordVisible;

  const animatedBorderColor = borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [COLORS.border.light, COLORS.primary[500]],
  });

  const animatedLabelStyle = {
    transform: [
      {
        translateY: labelAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -24],
        }),
      },
      {
        scale: labelAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 0.85],
        }),
      },
    ],
  };

  return (
    <Animated.View
      style={[styles.container, { transform: [{ translateX: shakeAnim }] }, containerStyle]}
    >
      {label && (
        <View style={styles.labelContainer}>
          <Animated.Text
            style={[
              styles.label,
              sizeStyles.label,
              animatedLabelStyle,
              {
                color: error
                  ? COLORS.error.main
                  : success
                    ? COLORS.success.main
                    : isFocused
                      ? COLORS.primary[500]
                      : COLORS.text.secondary,
              },
              labelStyle,
            ]}
          >
            {label}
            {required && <Text style={styles.required}> *</Text>}
          </Animated.Text>
        </View>
      )}

      <Animated.View
        style={[
          styles.inputContainer,
          variantStyles,
          variant === 'outlined' && {
            borderColor: animatedBorderColor,
          },
          disabled && styles.disabled,
        ]}
      >
        {icon && (
          <Ionicons
            name={icon}
            size={20}
            color={
              error
                ? COLORS.error.main
                : success
                  ? COLORS.success.main
                  : isFocused
                    ? COLORS.primary[500]
                    : COLORS.text.tertiary
            }
            style={styles.leftIcon}
          />
        )}

        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={COLORS.text.tertiary}
          onFocus={handleFocus}
          onBlur={handleBlur}
          secureTextEntry={showPassword}
          editable={!disabled}
          maxLength={maxLength}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          returnKeyType={returnKeyType}
          onSubmitEditing={onSubmitEditing}
          style={[
            styles.input,
            sizeStyles.input,
            { color: COLORS.text.primary },
            icon && { paddingLeft: 0 },
            (rightIcon || secureTextEntry) && { paddingRight: 0 },
            inputStyle,
          ]}
          {...rest}
        />

        {secureTextEntry && (
          <TouchableOpacity
            accessibilityRole="button"
            onPress={togglePasswordVisibility}
            style={styles.rightIconButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name={isPasswordVisible ? 'eye-outline' : 'eye-off-outline'}
              size={20}
              color={COLORS.text.tertiary}
            />
          </TouchableOpacity>
        )}

        {rightIcon && !secureTextEntry && (
          <TouchableOpacity
            accessibilityRole="button"
            onPress={onRightIconPress}
            style={styles.rightIconButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            disabled={!onRightIconPress}
          >
            <Ionicons
              name={rightIcon}
              size={20}
              color={
                error ? COLORS.error.main : success ? COLORS.success.main : COLORS.text.tertiary
              }
            />
          </TouchableOpacity>
        )}
      </Animated.View>

      {(error || helperText || (showCharCount && maxLength)) && (
        <View style={styles.helperContainer}>
          <Text
            style={[styles.helperText, error && styles.errorText, success && styles.successText]}
            numberOfLines={2}
          >
            {error || helperText}
          </Text>
          {showCharCount && maxLength && (
            <Text style={styles.charCount}>
              {value.length}/{maxLength}
            </Text>
          )}
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING[4],
  },
  labelContainer: {
    position: 'relative',
    height: 24,
    marginBottom: SPACING[2],
  },
  label: {
    position: 'absolute',
    left: 0,
    fontFamily: TYPOGRAPHY.fonts.medium,
    letterSpacing: TYPOGRAPHY.letterSpacing.wide,
  },
  required: {
    color: COLORS.error.main,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
    ...SHADOWS.sm,
  },
  input: {
    flex: 1,
    fontFamily: TYPOGRAPHY.fonts.regular,
    letterSpacing: TYPOGRAPHY.letterSpacing.normal,
  },
  leftIcon: {
    marginLeft: SPACING[3],
    marginRight: SPACING[2],
  },
  rightIconButton: {
    padding: SPACING[3],
  },
  helperContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING[1.5],
    paddingHorizontal: SPACING[2],
  },
  helperText: {
    flex: 1,
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.text.secondary,
    fontFamily: TYPOGRAPHY.fonts.regular,
  },
  errorText: {
    color: COLORS.error.main,
  },
  successText: {
    color: COLORS.success.main,
  },
  charCount: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.text.tertiary,
    fontFamily: TYPOGRAPHY.fonts.regular,
    marginLeft: SPACING[2],
  },
  disabled: {
    opacity: 0.6,
  },
});

export default PremiumInput;
