/**
 * EmotionalCard - Card com Sistema de Cores Emocionais
 * Cards temáticos para diferentes estados emocionais
 *
 * @example
 * <EmotionalCard variant="joy" title="Momentos Felizes">
 *   <Text>Conteúdo aqui</Text>
 * </EmotionalCard>
 */

import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, ViewStyle } from 'react-native';

import { Tokens, ColorTokens } from '../../theme';
import { HapticPatterns, triggerHaptic } from '../../theme/haptics';
import { useTheme } from '../../theme/ThemeContext';

export type EmotionalVariant = 'joy' | 'calm' | 'support' | 'warning';

export interface EmotionalCardProps {
  /** Variante emocional do card */
  variant?: EmotionalVariant;
  /** Título do card */
  title?: string;
  /** Subtítulo do card */
  subtitle?: string;
  /** Conteúdo do card */
  children?: React.ReactNode;
  /** Ícone ou emoji no header */
  icon?: React.ReactNode;
  /** Handler de clique */
  onPress?: () => void;
  /** Animar entrada */
  animateEntry?: boolean;
  /** Estilos customizados */
  style?: ViewStyle;
  /** Label de acessibilidade */
  accessibilityLabel?: string;
}

// Mapeamento de variantes para cores usando tokens
const getVariantColors = (variant: EmotionalVariant, isDark: boolean) => {
  switch (variant) {
    case 'joy':
      return {
        background: isDark ? ColorTokens.warning[900] : ColorTokens.warning[50],
        border: isDark ? ColorTokens.warning[700] : ColorTokens.warning[200],
        accent: ColorTokens.warning[500],
        title: isDark ? ColorTokens.warning[100] : ColorTokens.warning[800],
        subtitle: isDark ? ColorTokens.warning[300] : ColorTokens.warning[600],
      };
    case 'calm':
      return {
        background: isDark ? ColorTokens.info[900] : ColorTokens.info[50],
        border: isDark ? ColorTokens.info[700] : ColorTokens.info[200],
        accent: ColorTokens.info[500],
        title: isDark ? ColorTokens.info[100] : ColorTokens.info[800],
        subtitle: isDark ? ColorTokens.info[300] : ColorTokens.info[600],
      };
    case 'support':
      return {
        background: isDark ? ColorTokens.secondary[900] : ColorTokens.secondary[50],
        border: isDark ? ColorTokens.secondary[700] : ColorTokens.secondary[200],
        accent: ColorTokens.secondary[500],
        title: isDark ? ColorTokens.secondary[100] : ColorTokens.secondary[800],
        subtitle: isDark ? ColorTokens.secondary[300] : ColorTokens.secondary[600],
      };
    case 'warning':
      return {
        background: isDark ? ColorTokens.error[900] : ColorTokens.error[50],
        border: isDark ? ColorTokens.error[700] : ColorTokens.error[200],
        accent: ColorTokens.error[500],
        title: isDark ? ColorTokens.error[100] : ColorTokens.error[800],
        subtitle: isDark ? ColorTokens.error[300] : ColorTokens.error[600],
      };
    default:
      return {
        background: isDark ? ColorTokens.neutral[800] : ColorTokens.neutral[50],
        border: isDark ? ColorTokens.neutral[700] : ColorTokens.neutral[200],
        accent: ColorTokens.primary[500],
        title: isDark ? ColorTokens.neutral[100] : ColorTokens.neutral[800],
        subtitle: isDark ? ColorTokens.neutral[400] : ColorTokens.neutral[600],
      };
  }
};

export const EmotionalCard: React.FC<EmotionalCardProps> = ({
  variant = 'calm',
  title,
  subtitle,
  children,
  icon,
  onPress,
  animateEntry = true,
  style,
  accessibilityLabel,
}) => {
  const { isDark } = useTheme();
  const variantColors = getVariantColors(variant, isDark);

  // Animação de entrada
  const fadeAnim = useRef(new Animated.Value(animateEntry ? 0 : 1)).current;
  const scaleAnim = useRef(new Animated.Value(animateEntry ? 0.95 : 1)).current;

  useEffect(() => {
    if (animateEntry) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [animateEntry, fadeAnim, scaleAnim]);

  // Handler de press com haptic
  const handlePress = () => {
    if (onPress) {
      triggerHaptic(HapticPatterns.cardPress);
      onPress();
    }
  };

  // Animação de press
  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      friction: 8,
      tension: 100,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 8,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const cardContent = (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: variantColors.background,
          borderColor: variantColors.border,
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        },
        style,
      ]}
    >
      {/* Accent bar */}
      <View style={[styles.accentBar, { backgroundColor: variantColors.accent }]} />

      {/* Header */}
      {(title || icon) && (
        <View style={styles.header}>
          {icon && <View style={styles.iconContainer}>{icon}</View>}
          <View style={styles.titleContainer}>
            {title && (
              <Text style={[styles.title, { color: variantColors.title }]} numberOfLines={2}>
                {title}
              </Text>
            )}
            {subtitle && (
              <Text style={[styles.subtitle, { color: variantColors.subtitle }]} numberOfLines={2}>
                {subtitle}
              </Text>
            )}
          </View>
        </View>
      )}

      {/* Content */}
      {children && <View style={styles.content}>{children}</View>}
    </Animated.View>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel || title}
      >
        {cardContent}
      </TouchableOpacity>
    );
  }

  return (
    <View accessible={true} accessibilityLabel={accessibilityLabel || title}>
      {cardContent}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: Tokens.radius.xl,
    borderWidth: 1,
    overflow: 'hidden',
    ...Tokens.shadows.md,
  },
  accentBar: {
    height: 4,
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Tokens.spacing['4'],
    paddingBottom: Tokens.spacing['2'],
  },
  iconContainer: {
    marginRight: Tokens.spacing['3'],
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: Tokens.typography.sizes.lg,
    fontWeight: '600',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: Tokens.typography.sizes.sm,
  },
  content: {
    padding: Tokens.spacing['4'],
    paddingTop: Tokens.spacing['2'],
  },
});

export default EmotionalCard;
