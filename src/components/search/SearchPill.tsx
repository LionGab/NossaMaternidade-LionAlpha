/**
 * SearchPill - Barra de busca estilo Airbnb
 * Design pill arredondado com shadow sutil
 *
 * @example
 * <SearchPill
 *   placeholder="O que você procura?"
 *   onPress={() => navigation.navigate('Search')}
 * />
 */

import * as Haptics from 'expo-haptics';
import { Search, SlidersHorizontal } from 'lucide-react-native';
import React from 'react';
import { View, TouchableOpacity, StyleSheet, ViewStyle, Text } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { useTheme } from '@/theme';
import { Tokens } from '@/theme/tokens';
import { getShadowFromToken } from '@/utils/shadowHelper';

export interface SearchPillProps {
  /** Texto placeholder */
  placeholder?: string;
  /** Subtítulo opcional (ex: "Qualquer hora · Qualquer tema") */
  subtitle?: string;
  /** Callback ao pressionar */
  onPress?: () => void;
  /** Callback ao pressionar filtros */
  onFilterPress?: () => void;
  /** Mostrar botão de filtros */
  showFilters?: boolean;
  /** Estilo customizado do container */
  style?: ViewStyle;
  /** Desabilitar componente */
  disabled?: boolean;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export function SearchPill({
  placeholder = 'Buscar...',
  subtitle,
  onPress,
  onFilterPress,
  showFilters = false,
  style,
  disabled = false,
}: SearchPillProps) {
  const { colors, isDark } = useTheme();
  const scale = useSharedValue(1);

  const handlePressIn = () => {
    scale.value = withSpring(0.98, { damping: 15, stiffness: 300 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  const handlePress = () => {
    if (disabled) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.();
  };

  const handleFilterPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onFilterPress?.();
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedTouchable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={0.9}
      disabled={disabled}
      style={[animatedStyle, style]}
      accessibilityLabel={placeholder}
      accessibilityRole="search"
      accessibilityHint="Toque para buscar conteúdo"
    >
      <View
        style={[
          styles.container,
          {
            backgroundColor: colors.background.card,
            borderColor: isDark ? colors.border.light : 'transparent',
          },
          isDark && styles.containerDark,
        ]}
      >
        {/* Ícone de busca */}
        <View style={styles.iconContainer}>
          <Search size={20} color={colors.text.secondary} strokeWidth={2.5} />
        </View>

        {/* Texto */}
        <View style={styles.textContainer}>
          <Text style={[styles.placeholder, { color: colors.text.primary }]} numberOfLines={1}>
            {placeholder}
          </Text>
          {subtitle && (
            <Text style={[styles.subtitle, { color: colors.text.tertiary }]} numberOfLines={1}>
              {subtitle}
            </Text>
          )}
        </View>

        {/* Botão de filtros */}
        {showFilters && (
          <TouchableOpacity
            onPress={handleFilterPress}
            style={[
              styles.filterButton,
              {
                borderColor: colors.border.medium,
              },
            ]}
            accessibilityLabel="Filtros"
            accessibilityRole="button"
          >
            <SlidersHorizontal size={16} color={colors.text.primary} strokeWidth={2} />
          </TouchableOpacity>
        )}
      </View>
    </AnimatedTouchable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Tokens.spacing['4'],
    paddingVertical: Tokens.spacing['3'],
    borderRadius: Tokens.radius.searchPill,
    minHeight: Tokens.touchTargets.large, // 56px
    // Shadow usando helper universal
    ...getShadowFromToken('md'),
  },
  containerDark: {
    borderWidth: 1,
  },
  iconContainer: {
    marginRight: Tokens.spacing['3'],
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  placeholder: {
    fontSize: Tokens.typography.sizes.md, // 16
    fontWeight: '500' as const,
    letterSpacing: 0.1,
  },
  subtitle: {
    fontSize: Tokens.typography.sizes.xs, // 12
    marginTop: 2,
  },
  filterButton: {
    width: 36,
    height: 36,
    borderRadius: Tokens.radius.full,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: Tokens.spacing['2'],
  },
});

export default SearchPill;
