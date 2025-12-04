/**
 * HapticButton - Botão Premium com Feedback Tátil
 * Componente de botão com haptic feedback integrado
 *
 * @requires expo-haptics
 * @example
 * <HapticButton variant="primary" onPress={handlePress}>
 *   Clique aqui
 * </HapticButton>
 */

import React, { useCallback, useState, useMemo } from 'react';
import {
  Pressable,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  StyleProp,
  View,
  Platform,
} from 'react-native';

import { useAccessibilityProps } from '../../hooks/useAccessibilityProps';
import { Tokens } from '../../theme';
import { HapticPatterns, triggerHaptic } from '../../theme/haptics';
import { useTheme } from '../../theme/ThemeContext';
import { logger } from '../../utils/logger';

export type HapticButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
export type HapticButtonSize = 'sm' | 'md' | 'lg';

export interface HapticButtonProps {
  /** Conteúdo do botão */
  children: React.ReactNode;
  /** Variante visual do botão */
  variant?: HapticButtonVariant;
  /** Tamanho do botão */
  size?: HapticButtonSize;
  /** Handler de clique */
  onPress?: () => void;
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
  /** Desabilitar haptic feedback */
  disableHaptic?: boolean;
  /** Estilos customizados do container */
  style?: StyleProp<ViewStyle>;
  /** Estilos customizados do texto */
  textStyle?: TextStyle;
  /** Label de acessibilidade */
  accessibilityLabel?: string;
  /** Hint de acessibilidade */
  accessibilityHint?: string;
  /** Estado de acessibilidade */
  accessibilityState?: {
    disabled?: boolean;
    selected?: boolean;
    checked?: boolean | 'mixed';
    busy?: boolean;
    expanded?: boolean;
  };
}

export const HapticButton: React.FC<HapticButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  onPress,
  loading = false,
  disabled = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  disableHaptic = false,
  style,
  textStyle,
  accessibilityLabel,
  accessibilityHint,
  accessibilityState,
}) => {
  const { colors } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const isWeb = Platform.OS === 'web';
  // Hook chamado incondicionalmente para evitar erro de rules-of-hooks
  const a11yProps = useAccessibilityProps({ accessibilityHint: accessibilityHint || '' });

  // Web focus handlers
  const handleFocus = useCallback(() => setIsFocused(true), []);
  const handleBlur = useCallback(() => setIsFocused(false), []);

  // Web focus ring style para acessibilidade
  const webFocusStyle = useMemo<ViewStyle>(() => {
    if (!isWeb || !isFocused) return {};
    return {
      outlineWidth: 2,
      outlineColor: colors.primary.main,
      outlineStyle: 'solid',
      outlineOffset: 2,
    } as ViewStyle;
  }, [isWeb, isFocused, colors.primary.main]);

  const handlePress = useCallback(() => {
    if (disabled || loading) {
      logger.debug('[HapticButton] Press blocked', { disabled, loading });
      return;
    }

    logger.debug('[HapticButton] Press triggered', { onPress: !!onPress });

    if (!disableHaptic) {
      triggerHaptic(HapticPatterns.buttonPress);
    }

    if (onPress) {
      logger.debug('[HapticButton] Calling onPress');
      onPress();
    } else {
      logger.warn('[HapticButton] onPress is undefined');
    }
  }, [disabled, loading, disableHaptic, onPress]);

  // Estilos baseados na variante
  const getVariantStyles = (): { container: ViewStyle; text: TextStyle } => {
    switch (variant) {
      case 'primary':
        return {
          container: {
            backgroundColor: disabled ? colors.text.disabled : colors.primary.main,
          },
          text: {
            color: colors.raw.neutral[0],
          },
        };
      case 'secondary':
        return {
          container: {
            backgroundColor: disabled ? colors.text.disabled : colors.secondary.main,
          },
          text: {
            color: colors.raw.neutral[0],
          },
        };
      case 'outline':
        return {
          container: {
            backgroundColor: 'transparent',
            borderWidth: 2,
            borderColor: disabled ? colors.text.disabled : colors.primary.main,
          },
          text: {
            color: disabled ? colors.text.disabled : colors.primary.main,
          },
        };
      case 'ghost':
        return {
          container: {
            backgroundColor: 'transparent',
          },
          text: {
            color: disabled ? colors.text.disabled : colors.primary.main,
          },
        };
      default:
        return {
          container: {},
          text: {},
        };
    }
  };

  // Estilos baseados no tamanho
  const getSizeStyles = (): { container: ViewStyle; text: TextStyle } => {
    switch (size) {
      case 'sm':
        return {
          container: {
            paddingVertical: Tokens.spacing['2.5'],
            paddingHorizontal: Tokens.spacing['3'],
            borderRadius: Tokens.radius.md,
            minHeight: Tokens.touchTargets.min, // 44pt mínimo para acessibilidade
          },
          text: {
            fontSize: Tokens.typography.sizes.sm,
          },
        };
      case 'md':
        return {
          container: {
            paddingVertical: Tokens.spacing['3'],
            paddingHorizontal: Tokens.spacing['4'],
            borderRadius: Tokens.radius.lg,
            minHeight: 44,
          },
          text: {
            fontSize: Tokens.typography.sizes.base,
          },
        };
      case 'lg':
        return {
          container: {
            paddingVertical: Tokens.spacing['4'],
            paddingHorizontal: Tokens.spacing['6'],
            borderRadius: Tokens.radius.xl,
            minHeight: 56,
          },
          text: {
            fontSize: Tokens.typography.sizes.lg,
          },
        };
      default:
        return {
          container: {},
          text: {},
        };
    }
  };

  const variantStyles = getVariantStyles();
  const sizeStyles = getSizeStyles();

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled || loading}
      onFocus={isWeb ? handleFocus : undefined}
      onBlur={isWeb ? handleBlur : undefined}
      style={({ pressed }) => [
        styles.container,
        sizeStyles.container,
        variantStyles.container,
        fullWidth && styles.fullWidth,
        webFocusStyle,
        style,
        pressed && !isWeb && { opacity: 0.7 },
      ]}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={
        accessibilityLabel || (typeof children === 'string' ? children : undefined)
      }
      {...(accessibilityHint ? a11yProps : {})}
      accessibilityState={
        accessibilityState || {
          disabled: disabled || loading,
          busy: loading,
        }
      }
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={
            variant === 'outline' || variant === 'ghost'
              ? colors.primary.main
              : colors.raw.neutral[0]
          }
        />
      ) : (
        <View style={styles.content}>
          {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
          {typeof children === 'string' ? (
            <Text style={[styles.text, sizeStyles.text, variantStyles.text, textStyle]}>
              {children}
            </Text>
          ) : (
            children
          )}
          {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
        </View>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullWidth: {
    width: '100%',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
  leftIcon: {
    marginRight: 8,
  },
  rightIcon: {
    marginLeft: 8,
  },
});

export default HapticButton;
