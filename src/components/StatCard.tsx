/**
 * StatCard Component - Statistics display card
 * Componente de card para exibição de estatísticas
 */

import React from 'react';
import { View, Text, ViewStyle, TextStyle } from 'react-native';

import { useTheme } from '../theme/ThemeContext';
import { Tokens } from '../theme/tokens';

export type StatCardVariant = 'default' | 'compact' | 'detailed';

export interface StatCardProps {
  title?: string;
  value: string | number;
  label: string;
  icon?: React.ReactNode;
  color?: string;
  variant?: StatCardVariant;
  subtitle?: string;
  accessibilityLabel?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  label,
  icon,
  color,
  variant = 'default',
  subtitle,
  accessibilityLabel,
}) => {
  const { colors } = useTheme();
  const statColor = color || colors.primary.main;

  const variantStyles: { [key in StatCardVariant]: ViewStyle } = {
    default: {
      alignItems: 'center',
      gap: Tokens.spacing['2'],
    },
    compact: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Tokens.spacing['2'],
      flex: 1,
    },
    detailed: {
      alignItems: 'flex-start',
      gap: Tokens.spacing['3'],
    },
  };

  const cardStyle: ViewStyle = {
    backgroundColor: colors.background.card,
    borderRadius: Tokens.radius.xl,
    padding: Tokens.spacing['4'],
    borderWidth: 1,
    borderColor: colors.border.light,
    ...Tokens.shadows.sm,
  };

  const titleStyle: TextStyle = {
    fontSize: Tokens.typography.sizes.sm,
    fontWeight: Tokens.typography.weights.semibold,
    color: colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  };

  const valueStyle: TextStyle = {
    fontSize: Tokens.typography.sizes['2xl'],
    fontWeight: Tokens.typography.weights.bold,
    color: statColor,
  };

  const labelStyle: TextStyle = {
    fontSize: Tokens.typography.sizes.xs,
    color: colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  };

  const subtitleStyle: TextStyle = {
    fontSize: Tokens.typography.sizes.sm,
    color: colors.text.tertiary,
    marginTop: Tokens.spacing['1'],
  };

  return (
    <View
      style={cardStyle}
      accessible
      accessibilityLabel={accessibilityLabel || `${title || ''}: ${value} ${label}`}
    >
      {variant === 'detailed' && title && <Text style={titleStyle}>{title}</Text>}

      <View style={variantStyles[variant]}>
        {icon && (
          <View
            style={{
              width: Tokens.icons.md,
              height: Tokens.icons.md,
              borderRadius: Tokens.radius.md,
              backgroundColor: `${statColor}20`,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {icon}
          </View>
        )}

        <View style={{ flex: variant === 'compact' ? 1 : undefined }}>
          <Text style={valueStyle}>{value}</Text>
          <Text style={labelStyle}>{label}</Text>
          {subtitle && <Text style={subtitleStyle}>{subtitle}</Text>}
        </View>
      </View>
    </View>
  );
};

export default StatCard;
