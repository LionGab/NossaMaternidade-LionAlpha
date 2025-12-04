/**
 * SearchBarPill - Barra de busca estilo Airbnb
 * Componente primitivo para busca com visual pill centralizado
 *
 * ATUALIZADO: Estilo das imagens Airbnb
 * - 2 linhas: título + subtítulo
 * - Centralizado
 * - Seta voltar à esquerda, ícone filtro à direita
 *
 * @example
 * // Estilo simples (1 linha)
 * <SearchBarPill
 *   title="Onde você quer ir?"
 *   onPress={() => navigation.navigate('Search')}
 * />
 *
 * // Estilo Airbnb completo (2 linhas)
 * <SearchBarPill
 *   title="Experiências em Paris"
 *   subtitle="Qualquer dia · 3 participantes"
 *   onBackPress={() => navigation.goBack()}
 *   onFilterPress={() => openFilters()}
 * />
 */

import * as Haptics from 'expo-haptics';
import { Search, ChevronLeft, SlidersHorizontal } from 'lucide-react-native';
import React from 'react';
import { TouchableOpacity, ViewStyle, View } from 'react-native';

import { useAccessibilityProps } from '@/hooks/useAccessibilityProps';
import { useTheme } from '@/theme';
import { Tokens, ColorTokens } from '@/theme/tokens';

import { Box } from './Box';
import { Text } from './Text';

export interface SearchBarPillProps {
  /** Título principal (linha 1) */
  title?: string;
  /** Subtítulo (linha 2) - estilo Airbnb */
  subtitle?: string;
  /** @deprecated Use title instead */
  placeholder?: string;
  /** Callback ao pressionar a pill */
  onPress?: () => void;
  /** Callback ao pressionar botão voltar (mostra seta) */
  onBackPress?: () => void;
  /** Callback ao pressionar botão filtro (mostra ícone) */
  onFilterPress?: () => void;
  /** Ícone customizado (opcional) */
  icon?: React.ReactNode | null;
  /** Esconder ícone de busca padrão */
  hideIcon?: boolean;
  /** Estilo customizado */
  style?: ViewStyle;
  /** Desabilitado */
  disabled?: boolean;
  /** Mostrar sombra */
  showShadow?: boolean;
  /** Tamanho */
  size?: 'sm' | 'md' | 'lg';
  /** Variante visual */
  variant?: 'default' | 'centered';
}

export function SearchBarPill({
  title,
  subtitle,
  placeholder,
  onPress,
  onBackPress,
  onFilterPress,
  icon,
  hideIcon = false,
  style,
  disabled = false,
  showShadow = true,
  size = 'md',
  variant = 'default',
}: SearchBarPillProps) {
  const { colors, isDark } = useTheme();

  // Compatibilidade: usar placeholder se title não fornecido
  const displayTitle = title || placeholder || 'Onde você quer ir?';

  // Se tem subtitle, é variante Airbnb (2 linhas)
  const isAirbnbStyle = Boolean(subtitle) || variant === 'centered';

  const handlePress = () => {
    if (!disabled && onPress) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress();
    }
  };

  const handleBackPress = () => {
    if (onBackPress) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onBackPress();
    }
  };

  const handleFilterPress = () => {
    if (onFilterPress) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onFilterPress();
    }
  };

  const sizeStyles = {
    sm: {
      height: isAirbnbStyle ? 48 : 40, // ✅ Melhorado: reduzido de 52/44 para 48/40
      paddingHorizontal: Tokens.spacing['3.5'], // ✅ Melhorado: reduzido de '4' para '3.5'
    },
    md: {
      height: isAirbnbStyle ? 52 : 44, // ✅ Melhorado: reduzido de 56/48 para 52/44
      paddingHorizontal: Tokens.spacing['4'], // ✅ Melhorado: reduzido de '5' para '4'
    },
    lg: {
      height: isAirbnbStyle ? 60 : 52, // ✅ Melhorado: reduzido de 64/56 para 60/52
      paddingHorizontal: Tokens.spacing['5'], // ✅ Melhorado: reduzido de '6' para '5'
    },
  };

  const currentSize = sizeStyles[size];

  const accessibilityProps = useAccessibilityProps({
    accessibilityRole: 'button',
    accessibilityLabel: `Buscar: ${displayTitle}${subtitle ? `. ${subtitle}` : ''}`,
    accessibilityHint: 'Toque para abrir a busca',
  });

  // Estilo Airbnb: botões laterais + pill centralizada
  if (isAirbnbStyle) {
    return (
      <View
        style={[{ flexDirection: 'row', alignItems: 'center', gap: Tokens.spacing['3'] }, style]}
      >
        {/* Botão Voltar */}
        {onBackPress && (
          <TouchableOpacity
            onPress={handleBackPress}
            style={{
              width: Tokens.touchTargets.min,
              height: Tokens.touchTargets.min,
              alignItems: 'center',
              justifyContent: 'center',
            }}
            accessibilityRole="button"
            accessibilityLabel="Voltar"
          >
            <ChevronLeft size={24} color={colors.text.primary} />
          </TouchableOpacity>
        )}

        {/* Pill Centralizada */}
        <TouchableOpacity
          onPress={handlePress}
          disabled={disabled}
          activeOpacity={0.7}
          {...accessibilityProps}
          style={{ flex: 1 }}
        >
          <Box
            align="center"
            justify="center"
            bg="card"
            rounded="full"
            style={{
              height: currentSize.height,
              paddingHorizontal: currentSize.paddingHorizontal,
              backgroundColor: colors.background.card,
              borderWidth: 0.5, // ✅ Melhorado: reduzido de 1 para 0.5 (bordas menos grossas)
              borderColor: isDark ? ColorTokens.neutral[700] : ColorTokens.neutral[200], // ✅ Melhorado: borda mais suave
              ...(showShadow
                ? {
                    shadowColor: ColorTokens.neutral[900],
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.05, // ✅ Melhorado: sombra mais sutil
                    shadowRadius: 2,
                    elevation: 1,
                  }
                : {}),
              opacity: disabled ? 0.5 : 1,
            }}
          >
            {/* Título */}
            <Text size="sm" weight="semibold" color="primary" numberOfLines={1}>
              {displayTitle}
            </Text>
            {/* Subtítulo */}
            {subtitle && (
              <Text size="xs" color="tertiary" numberOfLines={1} style={{ marginTop: 2 }}>
                {subtitle}
              </Text>
            )}
          </Box>
        </TouchableOpacity>

        {/* Botão Filtro */}
        {onFilterPress && (
          <TouchableOpacity
            onPress={handleFilterPress}
            style={{
              width: Tokens.touchTargets.min,
              height: Tokens.touchTargets.min,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: colors.background.card,
              borderRadius: Tokens.radius.full,
              borderWidth: 1,
              borderColor: isDark ? colors.border.medium : ColorTokens.neutral[200],
            }}
            accessibilityRole="button"
            accessibilityLabel="Abrir filtros"
          >
            <SlidersHorizontal size={18} color={colors.text.primary} />
          </TouchableOpacity>
        )}
      </View>
    );
  }

  // Estilo padrão: ícone + texto
  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={disabled}
      activeOpacity={0.7}
      {...accessibilityProps}
      style={style}
    >
      <Box
        direction="row"
        align="center"
        bg="card"
        rounded="full"
        style={{
          height: currentSize.height,
          paddingHorizontal: currentSize.paddingHorizontal,
          backgroundColor: colors.background.card,
          borderWidth: 1,
          borderColor: isDark ? colors.border.medium : ColorTokens.neutral[200],
          ...(showShadow ? Tokens.shadows.sm : {}),
          opacity: disabled ? 0.5 : 1,
        }}
      >
        {!hideIcon &&
          (icon || (
            <Search
              size={20}
              color={colors.text.tertiary}
              style={{ marginRight: Tokens.spacing['2'] }}
            />
          ))}
        <Text size={size === 'sm' ? 'sm' : 'md'} color="tertiary" style={{ flex: 1 }}>
          {displayTitle}
        </Text>
      </Box>
    </TouchableOpacity>
  );
}

export default SearchBarPill;
