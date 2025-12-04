/**
 * ScreenLayout - Template base para telas
 * SafeArea + ScrollView vertical padrão
 */

import React, { ErrorInfo } from 'react';
import { ScrollView, ViewStyle, ScrollViewProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ErrorBoundary } from '@/components/ErrorBoundary';
import { useThemeColors } from '@/theme';
import { logger } from '@/utils/logger';

export interface ScreenLayoutProps extends Omit<ScrollViewProps, 'style'> {
  children: React.ReactNode;
  scrollEnabled?: boolean;
  contentContainerStyle?: ViewStyle;
  backgroundColor?: string;
}

export function ScreenLayout({
  children,
  scrollEnabled = true,
  contentContainerStyle,
  backgroundColor,
  ...scrollViewProps
}: ScreenLayoutProps) {
  const colors = useThemeColors();

  // Error handler para capturar erros específicos de elementos não encontrados
  const handleError = (error: Error, errorInfo: ErrorInfo) => {
    // Log específico para "Element not found"
    if (error.message.includes('Element not found') || error.message.includes('not found')) {
      logger.error('[ScreenLayout] Element not found error', {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
      });
    }
  };

  return (
    <ErrorBoundary onError={handleError}>
      <SafeAreaView
        style={{ flex: 1, backgroundColor: backgroundColor || colors.background.canvas }}
        edges={['top', 'left', 'right']}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={[{ flexGrow: 1, paddingBottom: 24 }, contentContainerStyle]}
          scrollEnabled={scrollEnabled}
          showsVerticalScrollIndicator={false}
          {...scrollViewProps}
        >
          {children}
        </ScrollView>
      </SafeAreaView>
    </ErrorBoundary>
  );
}
