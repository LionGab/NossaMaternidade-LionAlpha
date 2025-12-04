/**
 * SafeAreaContainer - Layout Component
 * Container com safe area automática para iOS e Android
 * @version 1.0.0
 */

import React from 'react';
import { View, ViewStyle, StyleProp } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { useThemeColors } from '@/theme';
import { isIOS, isAndroid } from '@/theme/platform';

export interface SafeAreaContainerProps {
  children: React.ReactNode;
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
  backgroundColor?: string;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

/**
 * SafeAreaContainer - Container com safe area automática
 *
 * @example
 * <SafeAreaContainer edges={['top', 'bottom']}>
 *   <Text>Conteúdo seguro</Text>
 * </SafeAreaContainer>
 */
export const SafeAreaContainer = React.memo(function SafeAreaContainer({
  children,
  edges = ['top', 'bottom'],
  backgroundColor,
  style,
  testID,
}: SafeAreaContainerProps) {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();

  const containerStyle: ViewStyle = {
    flex: 1,
    backgroundColor: backgroundColor || colors.background.canvas,
  };

  // iOS: usar SafeAreaView nativo
  if (isIOS) {
    return (
      <SafeAreaView edges={edges} style={[containerStyle, style]} testID={testID}>
        {children}
      </SafeAreaView>
    );
  }

  // Android: aplicar padding manualmente
  if (isAndroid) {
    const paddingStyle: ViewStyle = {
      paddingTop: edges.includes('top') ? insets.top : 0,
      paddingBottom: edges.includes('bottom') ? insets.bottom : 0,
      paddingLeft: edges.includes('left') ? insets.left : 0,
      paddingRight: edges.includes('right') ? insets.right : 0,
    };

    return (
      <View style={[containerStyle, paddingStyle, style]} testID={testID}>
        {children}
      </View>
    );
  }

  // Web fallback
  return (
    <View style={[containerStyle, style]} testID={testID}>
      {children}
    </View>
  );
});

SafeAreaContainer.displayName = 'SafeAreaContainer';

export default SafeAreaContainer;
