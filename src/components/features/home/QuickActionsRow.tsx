/**
 * QuickActionsRow - Linha de ações rápidas (Pausa, Água, Mover)
 * Design inspirado na screenshot - 3 botões circulares
 */

import * as Haptics from 'expo-haptics';
import { Coffee, Droplets, Activity, Moon, Heart, Leaf } from 'lucide-react-native';
import React from 'react';
import { View, TouchableOpacity, Animated } from 'react-native';

import { Text } from '@/components/atoms/Text';
import { useTheme } from '@/theme';
import { Tokens, ColorTokens } from '@/theme/tokens';

export type QuickActionType = 'pause' | 'water' | 'move' | 'sleep' | 'breathe' | 'gratitude';

export interface QuickAction {
  id: QuickActionType;
  label: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

export interface QuickActionsRowProps {
  /** Ações a exibir (máx 3) */
  actions?: QuickActionType[];
  /** Callback ao pressionar ação */
  onActionPress?: (action: QuickActionType) => void;
}

const DEFAULT_ACTIONS: QuickActionType[] = ['pause', 'water', 'move'];

const ACTION_CONFIG: Record<QuickActionType, Omit<QuickAction, 'id'>> = {
  pause: {
    label: 'Pausa',
    icon: <Coffee size={24} />,
    color: ColorTokens.warning[500],
    bgColor: `${ColorTokens.warning[500]}20`,
  },
  water: {
    label: 'Água',
    icon: <Droplets size={24} />,
    color: ColorTokens.info[500],
    bgColor: `${ColorTokens.info[500]}20`,
  },
  move: {
    label: 'Mover',
    icon: <Activity size={24} />,
    color: ColorTokens.success[500],
    bgColor: `${ColorTokens.success[500]}20`,
  },
  sleep: {
    label: 'Sono',
    icon: <Moon size={24} />,
    color: ColorTokens.secondary[500],
    bgColor: `${ColorTokens.secondary[500]}20`,
  },
  breathe: {
    label: 'Respirar',
    icon: <Leaf size={24} />,
    color: ColorTokens.success[400],
    bgColor: `${ColorTokens.success[400]}20`,
  },
  gratitude: {
    label: 'Gratidão',
    icon: <Heart size={24} />,
    color: ColorTokens.primary[500],
    bgColor: `${ColorTokens.primary[500]}20`,
  },
};

function ActionButton({ action, onPress }: { action: QuickAction; onPress: () => void }) {
  const { colors, isDark } = useTheme();
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.92,
      useNativeDriver: true,
      damping: 15,
      stiffness: 300,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      damping: 15,
      stiffness: 300,
    }).start();
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }], flex: 1 }}>
      <TouchableOpacity
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
        accessibilityRole="button"
        accessibilityLabel={`Ação rápida: ${action.label}`}
        accessibilityHint={`Toque para registrar ${action.label.toLowerCase()}`}
        style={{
          alignItems: 'center',
          paddingVertical: Tokens.spacing['3'],
          minHeight: Tokens.touchTargets.min,
        }}
      >
        {/* Ícone circular */}
        <View
          style={{
            width: 56,
            height: 56,
            borderRadius: Tokens.radius.full,
            backgroundColor: isDark ? `${action.color}30` : action.bgColor,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: Tokens.spacing['2'],
            borderWidth: 2,
            borderColor: isDark ? `${action.color}50` : `${action.color}30`,
            ...Tokens.shadows.sm,
          }}
        >
          {React.cloneElement(action.icon as React.ReactElement<{ color: string }>, {
            color: action.color,
          })}
        </View>

        {/* Label */}
        <Text
          size="xs"
          weight="semibold"
          numberOfLines={2}
          style={{
            color: isDark ? colors.text.primary : colors.text.secondary,
            textAlign: 'center',
            minHeight: 32,
          }}
        >
          {action.label}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

export function QuickActionsRow({
  actions = DEFAULT_ACTIONS,
  onActionPress,
}: QuickActionsRowProps) {
  const { colors, isDark } = useTheme();

  const actionsToRender = actions.slice(0, 3).map((id) => ({
    id,
    ...ACTION_CONFIG[id],
  }));

  return (
    <View
      style={{
        flexDirection: 'row',
        backgroundColor: isDark ? ColorTokens.neutral[900] : colors.background.card,
        borderRadius: Tokens.radius['2xl'],
        paddingVertical: Tokens.spacing['2'],
        paddingHorizontal: Tokens.spacing['3'],
        borderWidth: 1,
        borderColor: isDark ? ColorTokens.neutral[800] : colors.border.light,
        ...Tokens.shadows.sm,
      }}
      accessibilityRole="toolbar"
      accessibilityLabel="Ações rápidas de autocuidado"
      accessibilityHint="Registre atividades de bem-estar como pausa, água ou movimento"
    >
      {actionsToRender.map((action) => (
        <ActionButton key={action.id} action={action} onPress={() => onActionPress?.(action.id)} />
      ))}
    </View>
  );
}

export default QuickActionsRow;
