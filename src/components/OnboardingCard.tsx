/**
 * OnboardingCard Component
 * Card de seleção para onboarding com suporte a tema
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

import { useThemeColors } from '@/theme';
import { Tokens } from '@/theme/tokens';

export interface OnboardingCardProps {
  icon?: React.ReactNode;
  title: string;
  subtitle?: string;
  selected?: boolean;
  onPress: () => void;
  className?: string;
}

export const OnboardingCard: React.FC<OnboardingCardProps> = ({
  icon,
  title,
  subtitle,
  selected = false,
  onPress,
  className: _className = '',
}) => {
  const colors = useThemeColors();

  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={`${title}${subtitle ? `, ${subtitle}` : ''}${selected ? ', selecionado' : ''}`}
      accessibilityHint={selected ? 'Opção já selecionada' : 'Toque para selecionar esta opção'}
      onPress={onPress}
      activeOpacity={0.7}
      style={[
        styles.container,
        {
          backgroundColor: selected ? `${colors.primary.main}20` : colors.background.card,
          borderColor: selected ? colors.primary.main : colors.border.light,
        },
      ]}
    >
      {icon && <View style={styles.iconContainer}>{icon}</View>}

      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text.primary }]}>{title}</Text>
        {subtitle && (
          <Text style={[styles.subtitle, { color: colors.text.secondary }]}>{subtitle}</Text>
        )}
      </View>

      {selected && (
        <View style={[styles.checkmark, { backgroundColor: colors.primary.main }]}>
          <View style={[styles.checkmarkInner, { backgroundColor: colors.raw.neutral[0] }]} />
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Tokens.spacing['4'],
    borderRadius: Tokens.radius['2xl'],
    marginBottom: Tokens.spacing['3'],
    borderWidth: 2,
    minHeight: Tokens.touchTargets.min,
  },
  iconContainer: {
    marginRight: Tokens.spacing['4'],
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: Tokens.typography.sizes.base,
    fontWeight: Tokens.typography.weights.semibold,
    marginBottom: Tokens.spacing['1'],
  },
  subtitle: {
    fontSize: Tokens.typography.sizes.sm,
  },
  checkmark: {
    width: 20,
    height: 20,
    borderRadius: Tokens.radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkInner: {
    width: 8,
    height: 8,
    borderRadius: Tokens.radius.full,
  },
});

export default OnboardingCard;
