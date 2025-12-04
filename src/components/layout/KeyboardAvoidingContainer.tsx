/**
 * KeyboardAvoidingContainer - Layout Component
 * Container com KeyboardAvoidingView otimizado para iOS e Android
 * @version 1.0.0
 */

import React from 'react';
import { KeyboardAvoidingView, Platform, ViewStyle, StyleProp } from 'react-native';

import { useThemeColors } from '@/theme';
import { isIOS, isAndroid } from '@/theme/platform';

export interface KeyboardAvoidingContainerProps {
  children: React.ReactNode;
  behavior?: 'padding' | 'height' | 'position';
  keyboardVerticalOffset?: number;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

/**
 * KeyboardAvoidingContainer - Container que ajusta quando teclado aparece
 *
 * iOS: usa 'padding' behavior (recomendado)
 * Android: usa 'height' behavior (mais compatível)
 *
 * @example
 * <KeyboardAvoidingContainer keyboardVerticalOffset={100}>
 *   <TextInput placeholder="Digite algo" />
 * </KeyboardAvoidingContainer>
 */
export const KeyboardAvoidingContainer = React.memo(function KeyboardAvoidingContainer({
  children,
  behavior,
  keyboardVerticalOffset = 0,
  style,
  testID,
}: KeyboardAvoidingContainerProps) {
  const colors = useThemeColors();

  // Comportamento padrão por plataforma
  const defaultBehavior = isIOS ? 'padding' : isAndroid ? 'height' : 'padding';

  const containerStyle: ViewStyle = {
    flex: 1,
    backgroundColor: colors.background.canvas,
  };

  return (
    <KeyboardAvoidingView
      behavior={behavior || defaultBehavior}
      keyboardVerticalOffset={keyboardVerticalOffset}
      style={[containerStyle, style]}
      testID={testID}
      enabled={Platform.OS !== 'web'}
    >
      {children}
    </KeyboardAvoidingView>
  );
});

KeyboardAvoidingContainer.displayName = 'KeyboardAvoidingContainer';

export default KeyboardAvoidingContainer;
