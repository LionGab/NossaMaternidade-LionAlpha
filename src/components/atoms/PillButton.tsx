/**
 * PillButton
 *
 * Botão pequeno em formato de pílula (pill shape).
 * Usado para filter chips, quick actions, suggestion chips.
 * Inspirado no design do Flo app.
 *
 * @module components/atoms/PillButton
 */

import React, { useMemo, useCallback, useState } from 'react';
import { View, StyleSheet, Pressable, ViewStyle, TextStyle } from 'react-native';

import { useAccessibilityProps } from '@/hooks/useAccessibilityProps';
import { useTheme } from '@/theme';
import { triggerPlatformHaptic, isWeb } from '@/theme/platform';
import { Tokens } from '@/theme/tokens';

import { Text } from './Text';

// ======================
// 🎯 TYPES
// ======================

export interface PillButtonProps {
  /** Texto do botão */
  label: string;
  /** Se está selecionado */
  selected?: boolean;
  /** Callback ao pressionar */
  onPress: () => void;
  /** Ícone à esquerda */
  icon?: React.ReactNode;
  /** Ícone à direita */
  rightIcon?: React.ReactNode;
  /** Variante visual */
  variant?: 'default' | 'primary' | 'secondary' | 'outline' | 'ghost';
  /** Tamanho */
  size?: 'xs' | 'sm' | 'md';
  /** Se está desabilitado */
  disabled?: boolean;
  /** Cor customizada (quando selecionado) */
  selectedColor?: string;
  /** Estilo adicional do container */
  style?: ViewStyle;
  /** Label de acessibilidade */
  accessibilityLabel?: string;
  /** Hint de acessibilidade */
  accessibilityHint?: string;
}

// ======================
// 🎨 SIZE CONFIGS
// ======================

const SIZE_CONFIG = {
  xs: {
    paddingHorizontal: Tokens.spacing['2'], // 8
    paddingVertical: Tokens.spacing['1'], // 4
    minHeight: 28,
    fontSize: Tokens.typography.sizes.xs, // 12
    iconSize: 12,
    gap: Tokens.spacing['1'], // 4
  },
  sm: {
    paddingHorizontal: Tokens.spacing['3'], // 12
    paddingVertical: Tokens.spacing['1.5'], // 6
    minHeight: 32,
    fontSize: Tokens.typography.sizes.sm, // 14
    iconSize: 14,
    gap: Tokens.spacing['1.5'], // 6
  },
  md: {
    paddingHorizontal: Tokens.spacing['4'], // 16
    paddingVertical: Tokens.spacing['2'], // 8
    minHeight: Tokens.touchTargets.small, // 44 (WCAG AAA)
    fontSize: Tokens.typography.sizes.md, // 16
    iconSize: 16,
    gap: Tokens.spacing['2'], // 8
  },
};

// ======================
// 🧩 COMPONENT
// ======================

export const PillButton: React.FC<PillButtonProps> = ({
  label,
  selected = false,
  onPress,
  icon,
  rightIcon,
  variant = 'default',
  size = 'sm',
  disabled = false,
  selectedColor,
  style,
  accessibilityLabel,
  accessibilityHint,
}) => {
  const { colors, isDark } = useTheme();
  const sizeConfig = SIZE_CONFIG[size];
  const [isFocused, setIsFocused] = useState(false);
  // Hook chamado incondicionalmente para evitar erro de rules-of-hooks
  const a11yProps = useAccessibilityProps({ accessibilityHint: accessibilityHint || '' });

  // Web focus handlers
  const handleFocus = useCallback(() => setIsFocused(true), []);
  const handleBlur = useCallback(() => setIsFocused(false), []);

  // Handle press with haptic feedback
  const handlePress = useCallback(() => {
    if (disabled) return;
    triggerPlatformHaptic('selection');
    onPress();
  }, [disabled, onPress]);

  // Calculate colors based on variant and selected state
  const buttonColors = useMemo(() => {
    const activeColor = selectedColor || colors.primary.main;

    if (disabled) {
      return {
        background: colors.background.card,
        text: colors.text.disabled,
        border: colors.border.light,
      };
    }

    if (selected) {
      return {
        background: variant === 'outline' || variant === 'ghost' ? `${activeColor}15` : activeColor,
        text: variant === 'outline' || variant === 'ghost' ? activeColor : colors.text.inverse,
        border: activeColor,
      };
    }

    switch (variant) {
      case 'primary':
        return {
          background: colors.primary.main,
          text: colors.text.inverse,
          border: colors.primary.main,
        };
      case 'secondary':
        return {
          background: colors.secondary.main,
          text: colors.text.inverse,
          border: colors.secondary.main,
        };
      case 'outline':
        return {
          background: 'transparent',
          text: colors.text.primary,
          border: colors.border.medium,
        };
      case 'ghost':
        return {
          background: 'transparent',
          text: colors.text.secondary,
          border: 'transparent',
        };
      default:
        return {
          background: isDark ? colors.background.elevated : colors.background.card,
          text: colors.text.secondary,
          border: colors.border.light,
        };
    }
  }, [colors, isDark, variant, selected, disabled, selectedColor]);

  // Web focus ring style para acessibilidade
  const webFocusStyle = useMemo<ViewStyle>(() => {
    if (!isWeb || !isFocused) return {};
    return {
      outlineWidth: 2,
      outlineColor: colors.primary.main,
      outlineStyle: 'solid',
      outlineOffset: 2,
    } as ViewStyle;
  }, [isFocused, colors.primary.main]);

  // Container style
  const containerStyle = useMemo<ViewStyle>(
    () => ({
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: sizeConfig.paddingHorizontal,
      paddingVertical: sizeConfig.paddingVertical,
      minHeight: sizeConfig.minHeight,
      borderRadius: Tokens.radius.pill, // Full pill shape
      backgroundColor: buttonColors.background,
      borderWidth: variant === 'ghost' ? 0 : 1,
      borderColor: buttonColors.border,
      gap: sizeConfig.gap,
      ...webFocusStyle,
    }),
    [sizeConfig, buttonColors, variant, webFocusStyle]
  );

  // Text style
  const textStyle = useMemo<TextStyle>(
    () => ({
      fontSize: sizeConfig.fontSize,
      fontWeight: selected ? '600' : '500',
      color: buttonColors.text,
    }),
    [sizeConfig, buttonColors, selected]
  );

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      onFocus={isWeb ? handleFocus : undefined}
      onBlur={isWeb ? handleBlur : undefined}
      style={({ pressed }) => [
        containerStyle,
        pressed &&
          !disabled && {
            opacity: 0.8,
            transform: [{ scale: 0.98 }],
          },
        style,
      ]}
      accessibilityRole="button"
      accessibilityState={{
        selected,
        disabled,
      }}
      accessibilityLabel={accessibilityLabel || label}
      {...(accessibilityHint ? a11yProps : {})}
    >
      {/* Left Icon */}
      {icon && (
        <View style={styles.iconContainer}>
          {React.isValidElement(icon)
            ? React.cloneElement(icon as React.ReactElement<{ size?: number; color?: string }>, {
                size: sizeConfig.iconSize,
                color: buttonColors.text,
              })
            : icon}
        </View>
      )}

      {/* Label */}
      <Text style={textStyle} numberOfLines={1}>
        {label}
      </Text>

      {/* Right Icon */}
      {rightIcon && (
        <View style={styles.iconContainer}>
          {React.isValidElement(rightIcon)
            ? React.cloneElement(
                rightIcon as React.ReactElement<{ size?: number; color?: string }>,
                {
                  size: sizeConfig.iconSize,
                  color: buttonColors.text,
                }
              )
            : rightIcon}
        </View>
      )}
    </Pressable>
  );
};

// ======================
// 💄 STYLES
// ======================

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default PillButton;
