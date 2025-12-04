// components/onboarding/StepTitle.tsx
import { Sparkles } from 'lucide-react-native';
import React, { memo } from 'react';
import { View, Text } from 'react-native';

import { useTheme } from '@/theme/ThemeContext';

interface StepTitleProps {
  title: string;
  subtitle: string;
}

export const StepTitle = memo<StepTitleProps>(({ title, subtitle }) => {
  const { colors } = useTheme();

  return (
    <View className="mb-8">
      <View className="flex-row items-center mb-3">
        <Sparkles size={20} color={colors.primary.main} style={{ marginRight: 8 }} />
        <Text
          className="text-2xl sm:text-3xl font-bold leading-tight"
          style={{ color: colors.text.primary, flex: 1 }}
        >
          {title}
        </Text>
      </View>
      <Text
        className="text-base sm:text-lg leading-relaxed"
        style={{ color: colors.text.secondary, paddingLeft: 28 }}
      >
        {subtitle}
      </Text>
    </View>
  );
});

StepTitle.displayName = 'StepTitle';
