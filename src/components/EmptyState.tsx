/**
 * EmptyState Component - Estado vazio padronizado
 * Componente reutilizável para exibir estados vazios em listas/telas
 */

import * as Haptics from 'expo-haptics';
import React from 'react';
import { View, Text, ViewStyle, Pressable } from 'react-native';

import { useThemeColors } from '@/theme';
import { Spacing, Radius, Typography } from '@/theme/tokens';

export interface EmptyStateProps {
  /** Ícone a ser exibido */
  icon: React.ReactNode;
  /** Título do estado vazio */
  title: string;
  /** Descrição explicativa */
  description: string;
  /** Botão de ação opcional */
  action?: {
    label: string;
    onPress: () => void;
  };
  /** Estilos customizados do container */
  containerStyle?: ViewStyle;
  /** Variante visual */
  variant?: 'default' | 'compact';
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  containerStyle,
  variant = 'default',
}) => {
  const colors = useThemeColors();

  const handleAction = () => {
    if (action) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      action.onPress();
    }
  };

  const isCompact = variant === 'compact';

  return (
    <View
      style={[
        {
          flex: isCompact ? 0 : 1,
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: Spacing['6'],
          paddingVertical: isCompact ? Spacing['8'] : Spacing['12'],
        },
        containerStyle,
      ]}
      accessible
      accessibilityRole="text"
      accessibilityLabel={`${title}. ${description}`}
    >
      {/* Icon Container */}
      <View
        style={{
          width: isCompact ? 64 : 80,
          height: isCompact ? 64 : 80,
          borderRadius: isCompact ? 32 : 40,
          backgroundColor: `${colors.primary.main}15`,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: Spacing['4'],
        }}
        accessibilityElementsHidden
      >
        {icon}
      </View>

      {/* Title */}
      <Text
        style={{
          fontSize: isCompact ? Typography.sizes.lg : Typography.sizes.xl,
          fontWeight: Typography.weights.bold,
          color: colors.text.primary,
          textAlign: 'center',
          marginBottom: Spacing['2'],
        }}
        accessibilityElementsHidden
      >
        {title}
      </Text>

      {/* Description */}
      <Text
        style={{
          fontSize: Typography.sizes.sm,
          color: colors.text.secondary,
          textAlign: 'center',
          lineHeight: 22,
          maxWidth: 280,
          marginBottom: action ? Spacing['6'] : 0,
        }}
        accessibilityElementsHidden
      >
        {description}
      </Text>

      {/* Action Button */}
      {action && (
        <Pressable
          onPress={handleAction}
          accessibilityRole="button"
          accessibilityLabel={action.label}
          accessibilityHint="Toque para executar a ação"
          style={({ pressed }) => ({
            backgroundColor: colors.primary.main,
            paddingVertical: Spacing['3'],
            paddingHorizontal: Spacing['6'],
            borderRadius: Radius.lg,
            opacity: pressed ? 0.8 : 1,
            minHeight: 44,
            justifyContent: 'center',
          })}
        >
          <Text
            style={{
              color: colors.raw.neutral[0],
              fontSize: Typography.sizes.sm,
              fontWeight: Typography.weights.semibold,
              textAlign: 'center',
            }}
          >
            {action.label}
          </Text>
        </Pressable>
      )}
    </View>
  );
};

export default EmptyState;
