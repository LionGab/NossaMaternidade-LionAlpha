/**
 * Card Component - Theme-aware card with variants
 * Componente de card profissional com suporte a temas e variantes
 */

import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { View, ViewProps, Pressable, ViewStyle } from 'react-native';

import { useThemeColors } from '@/theme';
import { Spacing, Radius, Shadows } from '@/theme/tokens';

export type CardVariant = 'default' | 'outlined' | 'elevated' | 'ghost' | 'gradient';

export interface CardProps extends Omit<ViewProps, 'style'> {
  children: React.ReactNode;
  variant?: CardVariant;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  pressable?: boolean;
  onPress?: () => void;
  padding?: keyof typeof Spacing;
  style?: ViewStyle;
  gradientColors?: string[];
  borderRadius?: number; // Para suportar rounded-[22px]
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  header,
  footer,
  pressable = false,
  onPress,
  padding = '4',
  style,
  gradientColors,
  borderRadius,
  ...props
}) => {
  const colors = useThemeColors();

  const handlePress = () => {
    if (onPress) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress();
    }
  };

  const variantStyles: Record<CardVariant, ViewStyle> = {
    default: {
      backgroundColor: colors.background.card,
      ...Shadows.sm,
    },
    outlined: {
      backgroundColor: colors.background.card,
      borderWidth: 1,
      borderColor: colors.border.medium,
    },
    elevated: {
      backgroundColor: colors.background.elevated,
      ...Shadows.md,
    },
    ghost: {
      backgroundColor: 'transparent',
    },
    gradient: {
      // Gradient será aplicado via LinearGradient
    },
  };

  const containerStyle: ViewStyle = {
    borderRadius: borderRadius ?? Radius.xl,
    overflow: 'hidden',
    ...(variant !== 'gradient' ? variantStyles[variant] : {}),
    ...style,
  };

  const cardRadius = borderRadius ?? Radius.xl;

  const cardContent = (
    <>
      {header && (
        <View
          style={{
            paddingHorizontal: Spacing[padding],
            paddingTop: Spacing[padding],
            paddingBottom: Spacing['2'],
          }}
        >
          {header}
        </View>
      )}

      <View
        style={{
          paddingHorizontal: Spacing[padding],
          paddingVertical:
            !header && !footer
              ? Spacing[padding]
              : header && footer
                ? Spacing['2']
                : Spacing[padding],
        }}
      >
        {children}
      </View>

      {footer && (
        <View
          style={{
            paddingHorizontal: Spacing[padding],
            paddingTop: Spacing['2'],
            paddingBottom: Spacing[padding],
          }}
        >
          {footer}
        </View>
      )}
    </>
  );

  const renderCard = () => {
    if (variant === 'gradient' && gradientColors && gradientColors.length >= 2) {
      return (
        <LinearGradient
          colors={gradientColors as [string, string, ...string[]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[containerStyle, { borderRadius: cardRadius }]}
        >
          {cardContent}
        </LinearGradient>
      );
    }

    return (
      <View style={containerStyle} {...props}>
        {cardContent}
      </View>
    );
  };

  if (pressable && onPress) {
    return (
      <Pressable
        accessibilityRole="button"
        onPress={handlePress}
        style={({ pressed }) => [pressed && { opacity: 0.8 }]}
      >
        {renderCard()}
      </Pressable>
    );
  }

  return renderCard();
};

export default Card;
