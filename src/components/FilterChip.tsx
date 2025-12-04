/**
 * FilterChip Component - Filter chip for content filtering
 * Componente de chip de filtro para filtragem de conteúdo
 *
 * ATUALIZADO: Estilo Airbnb com ícone dropdown
 * - Chips com borda fina e fundo branco
 * - Ícone chevron/dropdown à direita
 * - Variante "dropdown" para filtros tipo "Tipo ▼"
 */

import * as Haptics from 'expo-haptics';
import { ChevronDown } from 'lucide-react-native';
import React from 'react';
import { TouchableOpacity, Text, ViewStyle, TextStyle, View } from 'react-native';

import { useAccessibilityProps } from '../hooks/useAccessibilityProps';
import { useTheme } from '../theme/ThemeContext';
import { Tokens, ColorTokens } from '../theme/tokens';

export type FilterChipSize = 'sm' | 'md';
export type FilterChipVariant = 'primary' | 'secondary' | 'outline' | 'dropdown';

export interface FilterChipProps {
  label: string;
  selected?: boolean;
  onPress: () => void;
  size?: FilterChipSize;
  variant?: FilterChipVariant;
  disabled?: boolean;
  /** Mostrar ícone dropdown (estilo Airbnb) */
  showDropdown?: boolean;
  /** Ícone customizado à esquerda */
  icon?: React.ReactNode;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

export const FilterChip: React.FC<FilterChipProps> = ({
  label,
  selected = false,
  onPress,
  size = 'md',
  variant = 'primary',
  disabled = false,
  showDropdown = false,
  icon,
  accessibilityLabel,
  accessibilityHint,
}) => {
  const { colors, isDark } = useTheme();

  const handlePress = () => {
    if (disabled) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  // Se variante é dropdown, sempre mostra o ícone
  const shouldShowDropdown = showDropdown || variant === 'dropdown';

  const sizeStyles = {
    sm: {
      paddingHorizontal: Tokens.spacing['3'],
      paddingVertical: Tokens.spacing['1.5'],
      fontSize: Tokens.typography.sizes.xs,
      minHeight: 32,
    },
    md: {
      paddingHorizontal: Tokens.spacing['4'],
      paddingVertical: Tokens.spacing['2'],
      fontSize: Tokens.typography.sizes.sm,
      minHeight: Tokens.touchTargets.min, // 44pt WCAG AAA
    },
  };

  // Cores por variante
  const getVariantStyles = () => {
    switch (variant) {
      case 'dropdown':
      case 'outline':
        // Estilo Airbnb: fundo branco, borda fina, texto escuro
        return {
          backgroundColor: colors.background.card,
          borderColor: isDark ? colors.border.medium : ColorTokens.neutral[300],
          textColor: colors.text.primary,
        };
      case 'secondary':
        return {
          backgroundColor: selected ? colors.secondary.main : colors.background.card,
          borderColor: selected ? colors.secondary.main : colors.border.light,
          textColor: selected ? colors.text.inverse : colors.text.secondary,
        };
      case 'primary':
      default:
        return {
          backgroundColor: selected ? colors.primary.main : colors.background.card,
          borderColor: selected ? colors.primary.main : colors.border.light,
          textColor: selected ? colors.text.inverse : colors.text.secondary,
        };
    }
  };

  const variantStyles = getVariantStyles();

  const containerStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: sizeStyles[size].paddingHorizontal,
    paddingVertical: sizeStyles[size].paddingVertical,
    minHeight: sizeStyles[size].minHeight,
    borderRadius: Tokens.radius['2xl'],
    borderWidth: 1,
    backgroundColor: variantStyles.backgroundColor,
    borderColor: variantStyles.borderColor,
    opacity: disabled ? 0.5 : 1,
    marginRight: Tokens.spacing['2'],
    gap: Tokens.spacing['1.5'],
  };

  const textStyle: TextStyle = {
    color: variantStyles.textColor,
    fontSize: sizeStyles[size].fontSize,
    fontWeight: selected ? Tokens.typography.weights.bold : Tokens.typography.weights.medium,
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={disabled}
      style={containerStyle}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || `Filtro: ${label}`}
      {...useAccessibilityProps({
        accessibilityHint:
          accessibilityHint || (selected ? 'Filtro ativo' : 'Toque para ativar este filtro'),
      })}
      accessibilityState={{ selected, disabled }}
    >
      {/* Ícone opcional à esquerda */}
      {icon && <View>{icon}</View>}

      {/* Label */}
      <Text style={textStyle}>{label}</Text>

      {/* Ícone dropdown à direita (estilo Airbnb) */}
      {shouldShowDropdown && (
        <ChevronDown size={size === 'sm' ? 14 : 16} color={variantStyles.textColor} />
      )}
    </TouchableOpacity>
  );
};

export default FilterChip;
