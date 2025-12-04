/**
 * SafeAreaWrapper - Wrapper com Safe Areas automáticas
 * Componente que aplica safe areas corretamente em iOS e Android
 *
 * @requires react-native-safe-area-context
 * @example
 * <SafeAreaWrapper edges={['top', 'bottom']}>
 *   <YourContent />
 * </SafeAreaWrapper>
 */

import React from 'react';
import { StyleSheet, ViewStyle, StatusBar, Platform } from 'react-native';
import { SafeAreaView, Edge, useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '../../theme/ThemeContext';

export interface SafeAreaWrapperProps {
  /** Conteúdo a ser renderizado */
  children: React.ReactNode;
  /** Edges a aplicar safe area (padrão: todas) */
  edges?: Edge[];
  /** Cor de fundo customizada */
  backgroundColor?: string;
  /** Usar cor do tema automaticamente */
  useThemeBackground?: boolean;
  /** Estilo adicional */
  style?: ViewStyle;
  /** Forçar padding extra no topo (útil para Android) */
  statusBarPadding?: boolean;
  /** Label de acessibilidade para a área */
  accessibilityLabel?: string;
}

export const SafeAreaWrapper: React.FC<SafeAreaWrapperProps> = ({
  children,
  edges = ['top', 'bottom', 'left', 'right'],
  backgroundColor,
  useThemeBackground = true,
  style,
  statusBarPadding = false,
  accessibilityLabel,
}) => {
  const { colors } = useTheme();
  // insets removed - using SafeAreaView component instead

  // Determinar cor de fundo
  const bgColor = backgroundColor
    ? backgroundColor
    : useThemeBackground
      ? colors.background.canvas
      : 'transparent';

  // Calcular padding extra para Android se necessário
  const extraTopPadding =
    statusBarPadding && Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0;

  return (
    <SafeAreaView
      edges={edges}
      style={[
        styles.container,
        {
          backgroundColor: bgColor,
          paddingTop: extraTopPadding,
        },
        style,
      ]}
      accessible={!!accessibilityLabel}
      accessibilityLabel={accessibilityLabel}
    >
      {children}
    </SafeAreaView>
  );
};

/**
 * Hook para usar safe area insets diretamente
 * @returns Objeto com os insets (top, bottom, left, right)
 */
export const useSafeInsets = () => {
  return useSafeAreaInsets();
};

/**
 * Wrapper simplificado apenas para telas principais
 * Aplica safe area apenas no topo e usa tema
 */
export const ScreenWrapper: React.FC<{
  children: React.ReactNode;
  style?: ViewStyle;
  accessibilityLabel?: string;
}> = ({ children, style, accessibilityLabel }) => {
  return (
    <SafeAreaWrapper
      edges={['top']}
      useThemeBackground={true}
      style={style}
      accessibilityLabel={accessibilityLabel}
    >
      {children}
    </SafeAreaWrapper>
  );
};

/**
 * Wrapper para modais que precisam de safe area em baixo
 * Útil para bottom sheets e modais
 */
export const ModalWrapper: React.FC<{
  children: React.ReactNode;
  style?: ViewStyle;
  accessibilityLabel?: string;
}> = ({ children, style, accessibilityLabel }) => {
  return (
    <SafeAreaWrapper
      edges={['bottom']}
      useThemeBackground={true}
      style={style}
      accessibilityLabel={accessibilityLabel}
    >
      {children}
    </SafeAreaWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default SafeAreaWrapper;
