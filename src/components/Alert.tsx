/**
 * Alert Component - Alert/notification with variants
 * Componente de alerta/notificação com variantes
 */

import * as Haptics from 'expo-haptics';
import { AlertCircle, CheckCircle2, AlertTriangle, Info, X } from 'lucide-react-native';
import React from 'react';
import { Text, View, Pressable, ViewStyle } from 'react-native';

import { useThemeColors } from '@/theme';
import { Spacing, Radius, Typography } from '@/theme/tokens';

export type AlertVariant = 'info' | 'success' | 'warning' | 'error';

export interface AlertProps {
  title?: string;
  description: string;
  variant?: AlertVariant;
  onClose?: () => void;
  icon?: React.ReactNode;
  containerStyle?: ViewStyle;
  /** Label de acessibilidade customizado */
  accessibilityLabel?: string;
}

export const Alert: React.FC<AlertProps> = ({
  title,
  description,
  variant = 'info',
  onClose,
  icon,
  containerStyle,
  accessibilityLabel,
}) => {
  const colors = useThemeColors();

  const variantConfig = {
    info: {
      bg: `${colors.status.info}15`,
      border: colors.status.info,
      icon: <Info size={20} color={colors.status.info} />,
    },
    success: {
      bg: `${colors.status.success}15`,
      border: colors.status.success,
      icon: <CheckCircle2 size={20} color={colors.status.success} />,
    },
    warning: {
      bg: `${colors.status.warning}15`,
      border: colors.status.warning,
      icon: <AlertTriangle size={20} color={colors.status.warning} />,
    },
    error: {
      bg: `${colors.status.error}15`,
      border: colors.status.error,
      icon: <AlertCircle size={20} color={colors.status.error} />,
    },
  };

  const config = variantConfig[variant];

  const handleClose = () => {
    if (onClose) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onClose();
    }
  };

  // Derivar label de acessibilidade
  const variantLabel =
    variant === 'error'
      ? 'Erro'
      : variant === 'warning'
        ? 'Aviso'
        : variant === 'success'
          ? 'Sucesso'
          : 'Informação';
  const derivedLabel =
    accessibilityLabel || `${variantLabel}: ${title ? `${title}. ` : ''}${description}`;

  return (
    <View
      style={{
        flexDirection: 'row',
        backgroundColor: config.bg,
        borderLeftWidth: 4,
        borderLeftColor: config.border,
        borderRadius: Radius.lg,
        padding: Spacing['4'],
        ...containerStyle,
      }}
      accessible={true}
      accessibilityRole="alert"
      accessibilityLabel={derivedLabel}
    >
      <View style={{ marginRight: Spacing['3'], paddingTop: 2 }} accessibilityElementsHidden={true}>
        {icon || config.icon}
      </View>

      <View style={{ flex: 1 }}>
        {title && (
          <Text
            style={{
              color: colors.text.primary,
              fontSize: Typography.sizes.base,
              fontWeight: Typography.weights.semibold,
              marginBottom: title && description ? Spacing['1'] : 0,
            }}
            accessibilityElementsHidden={true}
          >
            {title}
          </Text>
        )}
        <Text
          style={{
            color: colors.text.secondary,
            fontSize: Typography.sizes.sm,
            lineHeight: 20,
          }}
          accessibilityElementsHidden={true}
        >
          {description}
        </Text>
      </View>

      {onClose && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Fechar alerta"
          accessibilityHint="Remove esta mensagem da tela"
          onPress={handleClose}
          hitSlop={8}
          style={{ marginLeft: Spacing['2'], paddingTop: 2 }}
        >
          <X size={18} color={colors.text.tertiary} />
        </Pressable>
      )}
    </View>
  );
};

export default Alert;
