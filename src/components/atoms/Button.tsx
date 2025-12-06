/**
 * Button - Componente Primitivo Robusto (Hybrid: Props + className)
 *
 * Baseado em Material Design 3 + Apple HIG
 * Usa tokens do design system
 *
 * @version 2.0 - Hybrid mode
 * @date 2025-12-05
 */

import React, { useMemo, useCallback, useState } from 'react';
import { Pressable, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';

import { useAccessibilityProps } from '@/hooks/useAccessibilityProps';
import { useThemeColors } from '@/hooks/useTheme';
import {
  triggerPlatformHaptic,
  isIOS,
  isAndroid,
  isWeb,
  getPlatformShadow,
} from '@/theme/platform';
import { Tokens } from '@/theme/tokens';

import { SafeView, SafeText } from './SafeView';
import { Text } from './Text';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps {
  /** Texto do botão */
  title: string;
  /** Handler de clique */
  onPress?: () => void;
  /** Variante visual (modo props) */
  variant?: ButtonVariant;
  /** Tamanho do botão (modo props) */
  size?: ButtonSize;
  /** Estado de carregamento */
  loading?: boolean;
  /** Estado desabilitado */
  disabled?: boolean;
  /** Ocupar largura total */
  fullWidth?: boolean;
  /** Ícone à esquerda */
  leftIcon?: React.ReactNode;
  /** Ícone à direita */
  rightIcon?: React.ReactNode;
  /**
   * ⭐ NOVO: Suporte a className (NativeWind v4) para o contêiner
   * Quando fornecido, className tem PRIORIDADE sobre variant/size para estilos visuais
   * (semântica de loading/disabled/onPress continua funcionando normalmente)
   */
  className?: string;
  /**
   * ⭐ NOVO: className para o texto interno (usa Text híbrido)
   * Quando fornecido, ignora o estilo de texto derivado de variant/size
   */
  textClassName?: string;
  /** Estilos customizados (style > className > props) */
  style?: ViewStyle;
  /** Label de acessibilidade */
  accessibilityLabel?: string;
  /** Hint de acessibilidade */
  accessibilityHint?: string;
  /** Test ID para testes automatizados */
  testID?: string;
}

export const Button: React.FC<ButtonProps> = React.memo(
  ({
    title,
    onPress,
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled = false,
    fullWidth = false,
    leftIcon,
    rightIcon,
    className,
    textClassName,
    style,
    accessibilityLabel,
    accessibilityHint,
    testID,
  }) => {
    const colors = useThemeColors();
    const isDisabled = disabled || loading;
    const [isFocused, setIsFocused] = useState(false);
    // Hook chamado incondicionalmente para evitar erro de rules-of-hooks
    const a11yProps = useAccessibilityProps({ accessibilityHint: accessibilityHint || '' });

    // Web focus handlers
    const handleFocus = useCallback(() => setIsFocused(true), []);
    const handleBlur = useCallback(() => setIsFocused(false), []);

    // Handler com haptic feedback
    const handlePress = useCallback(() => {
      if (!isDisabled && onPress) {
        triggerPlatformHaptic('buttonPress');
        onPress();
      }
    }, [isDisabled, onPress]);

    // Android ripple effect (compartilhado entre modos)
    const androidRipple = isAndroid
      ? {
          color: colors.text.primary,
          borderless: false,
        }
      : undefined;

    // Web focus ring style para acessibilidade (compartilhado entre modos)
    const webFocusStyle: ViewStyle = useMemo(() => {
      if (!isWeb || !isFocused) return {};
      return {
        outlineWidth: 2,
        outlineColor: colors.primary.main,
        outlineStyle: 'solid',
        outlineOffset: 2,
      } as ViewStyle;
    }, [isFocused, colors.primary.main]);

    // ⭐ CHAMADO INCONDICIONALMENTE (Rules of Hooks) - variantStyles
    const variantStyles = useMemo((): { container: ViewStyle; text: TextStyle } => {
      const baseContainer: ViewStyle = {
        borderRadius: Tokens.radius.lg,
        borderWidth: 2,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: Tokens.touchTargets.min,
        // Platform-specific shadow/elevation
        ...getPlatformShadow('md'),
      };

      const baseText: TextStyle = {
        fontSize: Tokens.typography.sizes.md,
        fontWeight: Tokens.typography.weights.semibold,
        textAlign: 'center',
      };

      switch (variant) {
        case 'primary':
          return {
            container: {
              ...baseContainer,
              backgroundColor: isDisabled ? colors.text.disabled : colors.primary.main,
              borderColor: 'transparent',
            },
            text: {
              ...baseText,
              color: colors.text.inverse,
            },
          };

        case 'secondary':
          return {
            container: {
              ...baseContainer,
              backgroundColor: isDisabled ? colors.border.light : colors.secondary.main,
              borderColor: 'transparent',
            },
            text: {
              ...baseText,
              color: colors.text.inverse,
            },
          };

        case 'outline':
          return {
            container: {
              ...baseContainer,
              backgroundColor: 'transparent',
              borderColor: isDisabled ? colors.border.light : colors.primary.main,
            },
            text: {
              ...baseText,
              color: isDisabled ? colors.text.disabled : colors.primary.main,
            },
          };

        case 'ghost':
          return {
            container: {
              ...baseContainer,
              backgroundColor: 'transparent',
              borderColor: 'transparent',
            },
            text: {
              ...baseText,
              color: isDisabled ? colors.text.disabled : colors.primary.main,
            },
          };

        case 'danger':
          return {
            container: {
              ...baseContainer,
              backgroundColor: isDisabled ? colors.text.disabled : colors.status.error,
              borderColor: 'transparent',
            },
            text: {
              ...baseText,
              color: colors.text.inverse,
            },
          };

        default:
          return {
            container: baseContainer,
            text: baseText,
          };
      }
    }, [variant, isDisabled, colors]);

    // ⭐ CHAMADO INCONDICIONALMENTE (Rules of Hooks) - sizeStyles
    const sizeStyles = useMemo((): { container: ViewStyle; text: TextStyle } => {
      switch (size) {
        case 'sm':
          return {
            container: {
              paddingHorizontal: Tokens.spacing['4'],
              paddingVertical: Tokens.spacing['2'],
            },
            text: {
              fontSize: Tokens.typography.sizes.sm,
              fontWeight: Tokens.typography.weights.semibold,
            },
          };

        case 'lg':
          return {
            container: {
              paddingHorizontal: Tokens.spacing['8'],
              paddingVertical: Tokens.spacing['4'],
            },
            text: {
              fontSize: Tokens.typography.sizes.lg,
              fontWeight: Tokens.typography.weights.bold,
            },
          };

        default: // md
          return {
            container: {
              paddingHorizontal: Tokens.spacing['6'],
              paddingVertical: Tokens.spacing['3'],
            },
            text: {
              fontSize: Tokens.typography.sizes.md,
              fontWeight: Tokens.typography.weights.semibold,
            },
          };
      }
    }, [size]);

    // ⭐ CHAMADO INCONDICIONALMENTE (Rules of Hooks) - containerStyle
    const containerStyle: ViewStyle = useMemo(
      () => ({
        ...variantStyles.container,
        ...sizeStyles.container,
        ...(fullWidth && { width: '100%' }),
        ...webFocusStyle,
        ...style,
      }),
      [variantStyles, sizeStyles, fullWidth, webFocusStyle, style]
    );

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // MODO 1: className/textClassName (NativeWind) → prioridade
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    if (className || textClassName) {
      return (
        <Pressable
          testID={testID}
          onPress={handlePress}
          disabled={isDisabled}
          onFocus={isWeb ? handleFocus : undefined}
          onBlur={isWeb ? handleBlur : undefined}
          className={className}
          style={({ pressed }) => [
            fullWidth && { width: '100%' },
            webFocusStyle,
            style,
            pressed && {
              opacity: isIOS ? 0.7 : 0.8,
            },
          ]}
          android_ripple={androidRipple}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel={accessibilityLabel || title}
          {...(accessibilityHint ? a11yProps : {})}
        accessibilityState={{
          disabled: isDisabled,
          busy: loading,
        }}
        // Passar props para testes (usando data-* para evitar conflitos de tipo)
        {...({
          'data-variant': variant,
          'data-size': size,
          'data-fullwidth': fullWidth,
        } as Record<string, unknown>)}
        >
          {loading ? (
            <ActivityIndicator size="small" color={colors.text.inverse} />
          ) : (
            <>
              {leftIcon && (
                <SafeView style={{ marginRight: Tokens.spacing['2'] }}>{leftIcon}</SafeView>
              )}
              {textClassName ? (
                <Text className={textClassName}>{title}</Text>
              ) : (
                <SafeText
                  style={{
                    fontSize: Tokens.typography.sizes.md,
                    fontWeight: Tokens.typography.weights.semibold,
                    textAlign: 'center',
                  }}
                  fallbackText={title}
                >
                  {title}
                </SafeText>
              )}
              {rightIcon && (
                <SafeView style={{ marginLeft: Tokens.spacing['2'] }}>{rightIcon}</SafeView>
              )}
            </>
          )}
        </Pressable>
      );
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // MODO 2: Props semânticas (legado, theme-aware)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // Usa variantStyles, sizeStyles, containerStyle já computados acima
      return (
        <Pressable
          testID={testID}
          onPress={handlePress}
          disabled={isDisabled}
          onFocus={isWeb ? handleFocus : undefined}
          onBlur={isWeb ? handleBlur : undefined}
          style={({ pressed }) => [
            containerStyle,
            pressed && {
              opacity: isIOS ? 0.7 : 0.8,
            },
          ]}
          android_ripple={androidRipple}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel={accessibilityLabel || title}
          {...(accessibilityHint ? a11yProps : {})}
          accessibilityState={{
            disabled: isDisabled,
            busy: loading,
          }}
          // Passar props para testes (usando data-* para evitar conflitos de tipo)
          {...({
            'data-variant': variant,
            'data-size': size,
            'data-fullwidth': fullWidth,
          } as Record<string, unknown>)}
      >
        {loading ? (
          <ActivityIndicator
            size="small"
            color={variantStyles.text?.color || colors.text.inverse}
          />
        ) : (
          <>
            {leftIcon && (
              <SafeView style={{ marginRight: Tokens.spacing['2'] }}>{leftIcon}</SafeView>
            )}
            <SafeText style={{ ...variantStyles.text, ...sizeStyles.text }} fallbackText={title}>
              {title}
            </SafeText>
            {rightIcon && (
              <SafeView style={{ marginLeft: Tokens.spacing['2'] }}>{rightIcon}</SafeView>
            )}
          </>
        )}
      </Pressable>
    );
  }
);

Button.displayName = 'Button';

export default Button;
