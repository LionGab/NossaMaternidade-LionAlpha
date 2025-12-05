/**
 * Link Component - Typography primitive
 * Componente para links com estados (default, hover, visited) e theme-aware
 */

import React, { useState } from 'react';
import {
  Text as RNText,
  TextProps as _RNTextProps,
  TextStyle,
  Pressable,
  PressableProps,
} from 'react-native';

import { useThemeColors } from '@/theme';
import { Typography } from '@/theme/tokens';
import { logger } from '@/utils/logger';

export interface LinkProps extends Omit<PressableProps, 'children' | 'style'> {
  children: React.ReactNode;
  href?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  weight?: 'regular' | 'medium' | 'semibold' | 'bold';
  underline?: boolean | 'hover' | 'always';
  external?: boolean;
  style?: TextStyle;
  onPress?: () => void;
  /** Label de acessibilidade */
  accessibilityLabel?: string;
  /** Hint de acessibilidade */
  accessibilityHint?: string;
}

const sizeMap = {
  xs: Typography.sizes.xs,
  sm: Typography.sizes.sm,
  md: Typography.sizes.md,
  lg: Typography.sizes.lg,
};

export function Link({
  children,
  href,
  size = 'md',
  weight = 'medium',
  underline = 'hover',
  external = false,
  style,
  onPress,
  accessibilityLabel,
  accessibilityHint,
  ...props
}: LinkProps) {
  const colors = useThemeColors();
  const [isPressed, setIsPressed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else if (href && external) {
      // Para links externos, você pode usar Linking.openURL(href)
      logger.debug('Opening external link', { href });
    } else if (href) {
      // Para navegação interna (Expo Router)
      logger.debug('Navigating to', { href });
    }
  };

  const showUnderline =
    underline === 'always' ||
    (underline === 'hover' && (isHovered || isPressed)) ||
    underline === true;

  const computedStyle: TextStyle = {
    fontSize: sizeMap[size],
    fontWeight: Typography.weights[weight],
    color: isPressed ? colors.primary.dark : colors.text.link,
    textDecorationLine: showUnderline ? 'underline' : 'none',
    letterSpacing: Typography.letterSpacing.normal,
    ...style,
  };

  // Derivar label de acessibilidade do conteúdo se não fornecido
  const derivedLabel = accessibilityLabel || (typeof children === 'string' ? children : undefined);

  return (
    <Pressable
      onPress={handlePress}
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
      onHoverIn={() => setIsHovered(true)}
      onHoverOut={() => setIsHovered(false)}
      accessible={true}
      accessibilityRole="link"
      accessibilityLabel={derivedLabel}
      accessibilityHint={
        accessibilityHint || (external ? 'Abre em um navegador externo' : undefined)
      }
      {...props}
    >
      <RNText style={computedStyle}>{children}</RNText>
    </Pressable>
  );
}
