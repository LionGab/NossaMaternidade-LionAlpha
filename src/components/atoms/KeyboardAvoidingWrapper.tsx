/**
 * KeyboardAvoidingWrapper - Wrapper para evitar sobreposição do teclado
 * Comportamento otimizado para iOS e Android
 *
 * @example
 * <KeyboardAvoidingWrapper>
 *   <TextInput placeholder="Digite aqui..." />
 *   <Button title="Enviar" />
 * </KeyboardAvoidingWrapper>
 */

import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  ViewStyle,
  Keyboard,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '../../theme/ThemeContext';

export interface KeyboardAvoidingWrapperProps {
  /** Conteúdo a ser renderizado */
  children: React.ReactNode;
  /** Comportamento do KeyboardAvoidingView (auto-detectado se não fornecido) */
  behavior?: 'height' | 'position' | 'padding';
  /** Offset vertical adicional */
  keyboardVerticalOffset?: number;
  /** Usar ScrollView interno */
  withScrollView?: boolean;
  /** Props do ScrollView interno */
  scrollViewProps?: ScrollView['props'];
  /** Desabilitar dismiss de teclado ao tocar fora */
  disableTouchDismiss?: boolean;
  /** Estilos do container */
  style?: ViewStyle;
  /** Estilos do conteúdo interno */
  contentContainerStyle?: ViewStyle;
  /** Cor de fundo (usa tema por padrão) */
  backgroundColor?: string;
}

export const KeyboardAvoidingWrapper: React.FC<KeyboardAvoidingWrapperProps> = ({
  children,
  behavior,
  keyboardVerticalOffset,
  withScrollView = true,
  scrollViewProps,
  disableTouchDismiss = false,
  style,
  contentContainerStyle,
  backgroundColor,
}) => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  // Determinar comportamento baseado na plataforma
  const keyboardBehavior = behavior || (Platform.OS === 'ios' ? 'padding' : 'height');

  // Calcular offset baseado na plataforma
  const offset = keyboardVerticalOffset ?? (Platform.OS === 'ios' ? insets.top : 0);

  // Cor de fundo
  const bgColor = backgroundColor || colors.background.canvas;

  // Função para dismiss do teclado
  const dismissKeyboard = () => {
    if (!disableTouchDismiss) {
      Keyboard.dismiss();
    }
  };

  // Conteúdo interno
  const innerContent = withScrollView ? (
    <ScrollView
      bounces={false}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={[styles.scrollContent, contentContainerStyle]}
      {...scrollViewProps}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.content, contentContainerStyle]}>{children}</View>
  );

  // Wrapper com dismiss de teclado
  const wrappedContent = disableTouchDismiss ? (
    innerContent
  ) : (
    <TouchableWithoutFeedback onPress={dismissKeyboard} accessible={false}>
      {innerContent}
    </TouchableWithoutFeedback>
  );

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: bgColor }, style]}
      behavior={keyboardBehavior}
      keyboardVerticalOffset={offset}
    >
      {wrappedContent}
    </KeyboardAvoidingView>
  );
};

/**
 * Versão simplificada para formulários
 * Com ScrollView interno e dismiss automático
 */
export const FormWrapper: React.FC<{
  children: React.ReactNode;
  style?: ViewStyle;
  contentContainerStyle?: ViewStyle;
}> = ({ children, style, contentContainerStyle }) => {
  return (
    <KeyboardAvoidingWrapper
      withScrollView={true}
      style={style}
      contentContainerStyle={contentContainerStyle}
    >
      {children}
    </KeyboardAvoidingWrapper>
  );
};

/**
 * Versão simplificada para chat
 * Sem ScrollView interno (chat geralmente tem seu próprio)
 */
export const ChatWrapper: React.FC<{
  children: React.ReactNode;
  style?: ViewStyle;
}> = ({ children, style }) => {
  return (
    <KeyboardAvoidingWrapper withScrollView={false} disableTouchDismiss={true} style={style}>
      {children}
    </KeyboardAvoidingWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
});

export default KeyboardAvoidingWrapper;
