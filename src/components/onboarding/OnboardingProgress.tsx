// components/onboarding/OnboardingProgress.tsx
import React, { memo } from 'react';
import { View, Text } from 'react-native';

import { useTheme } from '@/theme/ThemeContext';

interface OnboardingProgressProps {
  step: number;
  totalSteps: number;
  progress: number;
}

export const OnboardingProgress = memo<OnboardingProgressProps>(
  ({ step, totalSteps, progress }) => {
    const { isDark, colors } = useTheme();

    return (
      <View className="flex-1 mx-4">
        <View
          className="h-2 rounded-full overflow-hidden"
          style={{
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)',
          }}
          accessibilityRole="progressbar"
          accessibilityValue={{ now: progress, min: 0, max: 100 }}
          accessibilityLabel={`Progresso do onboarding: ${Math.round(progress)}%`}
        >
          <View
            className="h-full rounded-full"
            style={{
              width: `${progress}%`,
              backgroundColor: colors.primary.main,
            }}
          />
        </View>
        <Text className="text-xs mt-1 text-center" style={{ color: colors.text.tertiary }}>
          {step} de {totalSteps - 1}
        </Text>
      </View>
    );
  }
);

OnboardingProgress.displayName = 'OnboardingProgress';
