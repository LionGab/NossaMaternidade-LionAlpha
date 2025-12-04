/**
 * PlatformScrollView - Layout Component
 * ScrollView otimizado para iOS e Android com comportamentos nativos
 * @version 1.0.0
 */

import React from 'react';
import { ScrollView, ScrollViewProps, StyleProp, ViewStyle } from 'react-native';

import { useThemeColors } from '@/theme';
import { isIOS } from '@/theme/platform';

export interface PlatformScrollViewProps extends Omit<ScrollViewProps, 'style'> {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  showsVerticalScrollIndicator?: boolean;
  showsHorizontalScrollIndicator?: boolean;
  bounces?: boolean; // iOS only
  overScrollMode?: 'auto' | 'always' | 'never'; // Android only
  testID?: string;
}

/**
 * PlatformScrollView - ScrollView com otimizações por plataforma
 *
 * iOS: Bounce effect habilitado por padrão
 * Android: Overscroll mode configurado
 *
 * @example
 * <PlatformScrollView bounces={true}>
 *   <Text>Conteúdo scrollável</Text>
 * </PlatformScrollView>
 */
export const PlatformScrollView = React.memo(function PlatformScrollView({
  children,
  style,
  contentContainerStyle,
  showsVerticalScrollIndicator = true,
  showsHorizontalScrollIndicator = false,
  bounces = isIOS, // iOS bounce por padrão
  overScrollMode = 'auto', // Android overscroll
  testID,
  ...props
}: PlatformScrollViewProps) {
  const colors = useThemeColors();

  const scrollViewStyle: ViewStyle = {
    flex: 1,
    backgroundColor: colors.background.canvas,
  };

  const contentStyle: ViewStyle = {
    flexGrow: 1,
  };

  return (
    <ScrollView
      style={[scrollViewStyle, style]}
      contentContainerStyle={[contentStyle, contentContainerStyle]}
      showsVerticalScrollIndicator={showsVerticalScrollIndicator}
      showsHorizontalScrollIndicator={showsHorizontalScrollIndicator}
      bounces={bounces}
      overScrollMode={overScrollMode}
      testID={testID}
      keyboardShouldPersistTaps="handled"
      {...props}
    >
      {children}
    </ScrollView>
  );
});

PlatformScrollView.displayName = 'PlatformScrollView';

export default PlatformScrollView;
