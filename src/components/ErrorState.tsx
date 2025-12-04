/**
 * ErrorState Component - Estado de erro padronizado
 * Componente reutilizável para exibir estados de erro em telas
 */

import * as Haptics from 'expo-haptics';
import { AlertCircle, RefreshCw, WifiOff } from 'lucide-react-native';
import React from 'react';
import { View, Text, ViewStyle, Pressable } from 'react-native';

import { useThemeColors } from '@/theme';
import { Spacing, Radius, Typography } from '@/theme/tokens';

export type ErrorType = 'generic' | 'network' | 'notFound' | 'permission' | 'custom';

export interface ErrorStateProps {
  /** Tipo de erro (determina ícone e textos padrão) */
  type?: ErrorType;
  /** Título customizado (sobrescreve o padrão) */
  title?: string;
  /** Mensagem de erro customizada (sobrescreve o padrão) */
  message?: string;
  /** Callback para tentar novamente */
  onRetry?: () => void;
  /** Texto do botão de retry */
  retryLabel?: string;
  /** Ícone customizado */
  icon?: React.ReactNode;
  /** Estilos customizados do container */
  containerStyle?: ViewStyle;
  /** Variante visual */
  variant?: 'default' | 'compact' | 'inline';
}

const errorConfigs: Record<ErrorType, { title: string; message: string }> = {
  generic: {
    title: 'Algo deu errado',
    message: 'Ocorreu um erro inesperado. Por favor, tente novamente.',
  },
  network: {
    title: 'Sem conexão',
    message: 'Verifique sua conexão com a internet e tente novamente.',
  },
  notFound: {
    title: 'Não encontrado',
    message: 'O conteúdo que você procura não está disponível.',
  },
  permission: {
    title: 'Acesso negado',
    message: 'Você não tem permissão para acessar este conteúdo.',
  },
  custom: {
    title: 'Erro',
    message: 'Ocorreu um erro.',
  },
};

export const ErrorState: React.FC<ErrorStateProps> = ({
  type = 'generic',
  title,
  message,
  onRetry,
  retryLabel = 'Tentar novamente',
  icon,
  containerStyle,
  variant = 'default',
}) => {
  const colors = useThemeColors();
  const config = errorConfigs[type];

  const handleRetry = () => {
    if (onRetry) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onRetry();
    }
  };

  const isCompact = variant === 'compact';
  const isInline = variant === 'inline';

  const getDefaultIcon = () => {
    const iconSize = isCompact ? 32 : 48;
    const iconColor = colors.status.error;

    switch (type) {
      case 'network':
        return <WifiOff size={iconSize} color={iconColor} />;
      default:
        return <AlertCircle size={iconSize} color={iconColor} />;
    }
  };

  const displayTitle = title || config.title;
  const displayMessage = message || config.message;

  if (isInline) {
    return (
      <View
        style={[
          {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: `${colors.status.error}15`,
            borderLeftWidth: 4,
            borderLeftColor: colors.status.error,
            borderRadius: Radius.lg,
            padding: Spacing['4'],
          },
          containerStyle,
        ]}
        accessible
        accessibilityRole="alert"
        accessibilityLabel={`Erro: ${displayTitle}. ${displayMessage}`}
      >
        <View style={{ marginRight: Spacing['3'] }} accessibilityElementsHidden>
          {icon || <AlertCircle size={20} color={colors.status.error} />}
        </View>
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontSize: Typography.sizes.sm,
              fontWeight: Typography.weights.semibold,
              color: colors.text.primary,
              marginBottom: Spacing['1'],
            }}
            accessibilityElementsHidden
          >
            {displayTitle}
          </Text>
          <Text
            style={{
              fontSize: Typography.sizes.xs,
              color: colors.text.secondary,
              lineHeight: 18,
            }}
            accessibilityElementsHidden
          >
            {displayMessage}
          </Text>
        </View>
        {onRetry && (
          <Pressable
            onPress={handleRetry}
            accessibilityRole="button"
            accessibilityLabel={retryLabel}
            accessibilityHint="Tenta carregar o conteúdo novamente"
            style={{ padding: Spacing['2'], marginLeft: Spacing['2'] }}
          >
            <RefreshCw size={18} color={colors.primary.main} />
          </Pressable>
        )}
      </View>
    );
  }

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
      accessibilityRole="alert"
      accessibilityLabel={`Erro: ${displayTitle}. ${displayMessage}`}
    >
      {/* Icon Container */}
      <View
        style={{
          width: isCompact ? 64 : 80,
          height: isCompact ? 64 : 80,
          borderRadius: isCompact ? 32 : 40,
          backgroundColor: `${colors.status.error}15`,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: Spacing['4'],
        }}
        accessibilityElementsHidden
      >
        {icon || getDefaultIcon()}
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
        {displayTitle}
      </Text>

      {/* Message */}
      <Text
        style={{
          fontSize: Typography.sizes.sm,
          color: colors.text.secondary,
          textAlign: 'center',
          lineHeight: 22,
          maxWidth: 280,
          marginBottom: onRetry ? Spacing['6'] : 0,
        }}
        accessibilityElementsHidden
      >
        {displayMessage}
      </Text>

      {/* Retry Button */}
      {onRetry && (
        <Pressable
          onPress={handleRetry}
          accessibilityRole="button"
          accessibilityLabel={retryLabel}
          accessibilityHint="Toque para tentar carregar o conteúdo novamente"
          style={({ pressed }) => ({
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: colors.primary.main,
            paddingVertical: Spacing['3'],
            paddingHorizontal: Spacing['6'],
            borderRadius: Radius.lg,
            opacity: pressed ? 0.8 : 1,
            gap: Spacing['2'],
            minHeight: 44,
          })}
        >
          <RefreshCw size={18} color={colors.raw.neutral[0]} />
          <Text
            style={{
              color: colors.raw.neutral[0],
              fontSize: Typography.sizes.sm,
              fontWeight: Typography.weights.semibold,
            }}
          >
            {retryLabel}
          </Text>
        </Pressable>
      )}
    </View>
  );
};

export default ErrorState;
