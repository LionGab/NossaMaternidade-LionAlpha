/**
 * NextGoalBadge - Badge de próxima meta com countdown
 * Design inspirado na screenshot - "Próxima Meta"
 */

import * as Haptics from 'expo-haptics';
import { Target, Calendar } from 'lucide-react-native';
import React from 'react';
import { View, TouchableOpacity } from 'react-native';

import { Box } from '@/components/primitives/Box';
import { Text } from '@/components/primitives/Text';
import { useTheme } from '@/theme';
import { Tokens, ColorTokens } from '@/theme/tokens';

export interface NextGoalBadgeProps {
  /** Título da meta */
  title: string;
  /** Dias restantes */
  daysLeft: number;
  /** Callback ao pressionar */
  onPress?: () => void;
}

export function NextGoalBadge({ title, daysLeft, onPress }: NextGoalBadgeProps) {
  const { colors, isDark } = useTheme();

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.();
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.8}
      disabled={!onPress}
      accessibilityRole="button"
      accessibilityLabel={`Próxima meta: ${title}. ${daysLeft} dias restantes`}
      accessibilityHint="Toque para ver detalhes da meta"
    >
      <Box
        style={{
          backgroundColor: isDark
            ? `${ColorTokens.secondary[500]}20`
            : `${ColorTokens.secondary[100]}`,
          borderRadius: Tokens.radius.xl,
          paddingVertical: Tokens.spacing['3'],
          paddingHorizontal: Tokens.spacing['4'],
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderWidth: 1,
          borderColor: isDark ? `${ColorTokens.secondary[500]}30` : ColorTokens.secondary[200],
        }}
      >
        {/* Ícone + Título */}
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
          <View
            style={{
              width: 32,
              height: 32,
              borderRadius: Tokens.radius.full,
              backgroundColor: isDark ? ColorTokens.secondary[600] : ColorTokens.secondary[400],
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: Tokens.spacing['3'],
            }}
          >
            <Target size={16} color={ColorTokens.neutral[0]} />
          </View>
          <View style={{ flex: 1 }}>
            <Text
              size="xs"
              weight="semibold"
              style={{
                color: isDark ? ColorTokens.secondary[300] : ColorTokens.secondary[600],
                textTransform: 'uppercase',
                letterSpacing: 0.5,
                marginBottom: 2,
              }}
            >
              Próxima Meta
            </Text>
            <Text size="sm" weight="bold" color="primary" numberOfLines={1}>
              {title}
            </Text>
          </View>
        </View>

        {/* Countdown Badge */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: isDark ? ColorTokens.neutral[800] : ColorTokens.neutral[0],
            paddingVertical: Tokens.spacing['1'],
            paddingHorizontal: Tokens.spacing['2'],
            borderRadius: Tokens.radius.md,
            gap: Tokens.spacing['1'],
          }}
        >
          <Calendar size={12} color={colors.text.secondary} />
          <Text size="xs" weight="bold" color="secondary">
            {daysLeft} {daysLeft === 1 ? 'dia' : 'dias'}
          </Text>
        </View>
      </Box>
    </TouchableOpacity>
  );
}

export default NextGoalBadge;
