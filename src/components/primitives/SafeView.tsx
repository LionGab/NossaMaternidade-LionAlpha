/**
 * SafeView - Wrapper Seguro para View
 * Valida e sanitiza props antes de renderizar
 * Previne erros de renderização como [Object]
 */

import React, { useMemo } from 'react';
import { View, ViewProps, StyleSheet, Text, TextProps } from 'react-native';

import { logger } from '@/utils/logger';

export interface SafeViewProps extends Omit<ViewProps, 'style'> {
  style?: ViewProps['style'];
  fallbackStyle?: ViewProps['style'];
}

/**
 * SafeView - View com validação de props
 *
 * Validações:
 * - Style: Sanitiza arrays e objetos inválidos
 * - Children: Remove children inválidos
 * - Props: Remove props undefined/null que podem causar erros
 */
export function SafeView({ style, children, fallbackStyle, ...props }: SafeViewProps) {
  // Validar e sanitizar style
  const safeStyle = useMemo(() => {
    try {
      if (!style) {
        return fallbackStyle;
      }

      // Se for array, flatten e validar cada item
      if (Array.isArray(style)) {
        const validStyles = style.filter((s) => {
          if (!s) return false;
          if (typeof s !== 'object') return false;
          return true;
        });

        if (validStyles.length === 0) {
          return fallbackStyle;
        }

        try {
          return StyleSheet.flatten(validStyles);
        } catch (error) {
          logger.warn('[SafeView] Erro ao fazer flatten de style array', error);
          return fallbackStyle;
        }
      }

      // Se for objeto, validar propriedades
      if (typeof style === 'object') {
        // Remover propriedades inválidas
        const sanitized: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(style)) {
          // Ignorar valores null/undefined (exceto se for intencional)
          if (value !== null && value !== undefined) {
            sanitized[key] = value;
          }
        }
        return Object.keys(sanitized).length > 0 ? sanitized : fallbackStyle;
      }

      return fallbackStyle;
    } catch (error) {
      logger.warn('[SafeView] Erro ao processar style', error);
      return fallbackStyle;
    }
  }, [style, fallbackStyle]);

  // Validar children
  const safeChildren = useMemo(() => {
    if (children === null || children === undefined) {
      return null;
    }

    // Se children é um objeto inválido (não é React element), retornar null
    if (typeof children === 'object' && !React.isValidElement(children)) {
      // Verificar se é um objeto vazio ou inválido
      if (Object.keys(children).length === 0) {
        return null;
      }

      // Se tem propriedades mas não é um React element válido, logar warning
      logger.warn('[SafeView] Children inválido detectado', {
        childrenType: typeof children,
        childrenKeys: Object.keys(children),
      });
      return null;
    }

    return children;
  }, [children]);

  // Sanitizar props (remover undefined/null que podem causar warnings)
  const safeProps = useMemo(() => {
    const sanitized: Partial<ViewProps> = {};

    for (const [key, value] of Object.entries(props)) {
      // Manter apenas props com valores válidos
      if (value !== undefined && value !== null) {
        (sanitized as Record<string, unknown>)[key] = value;
      }
    }

    return sanitized;
  }, [props]);

  return (
    <View style={safeStyle} {...safeProps}>
      {safeChildren}
    </View>
  );
}

/**
 * SafeText - Wrapper seguro para Text
 */
export interface SafeTextProps extends TextProps {
  fallbackText?: string;
}

export function SafeText({ children, fallbackText = '', style, ...props }: SafeTextProps) {
  const safeChildren = useMemo(() => {
    if (children === null || children === undefined) {
      return fallbackText;
    }

    // Se children é string, retornar como está
    if (typeof children === 'string' || typeof children === 'number') {
      return String(children);
    }

    // Se é React element válido, retornar
    if (React.isValidElement(children)) {
      return children;
    }

    // Caso contrário, usar fallback
    logger.warn('[SafeText] Children inválido, usando fallback', {
      childrenType: typeof children,
    });
    return fallbackText;
  }, [children, fallbackText]);

  const safeStyle = useMemo(() => {
    try {
      if (!style) return undefined;
      if (Array.isArray(style)) {
        return StyleSheet.flatten(style);
      }
      return style;
    } catch (error) {
      logger.warn('[SafeText] Erro ao processar style', error);
      return undefined;
    }
  }, [style]);

  return (
    <Text style={safeStyle} {...props}>
      {safeChildren}
    </Text>
  );
}
