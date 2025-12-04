/**
 * ProgressIndicator Component
 * Indicador de progresso com dots horizontais conforme design do site
 */

import React from 'react';
import { View, ViewStyle } from 'react-native';

import { useThemeColors } from '@/theme';

export interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  className?: string;
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  currentStep,
  totalSteps,
  className = '',
}) => {
  const colors = useThemeColors();

  return (
    <View className={`flex-row gap-1 items-center ${className}`}>
      {Array.from({ length: totalSteps }).map((_, index) => {
        const stepNumber = index + 1;
        const isActive = stepNumber <= currentStep;

        const dotStyle: ViewStyle = {
          height: 6,
          borderRadius: 3,
          backgroundColor: isActive ? colors.primary.main : colors.border.light,
          width: isActive ? 16 : 6,
        };

        return <View key={index} style={dotStyle} className="transition-all duration-500" />;
      })}
    </View>
  );
};

export default ProgressIndicator;
