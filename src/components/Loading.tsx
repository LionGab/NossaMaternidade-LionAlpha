import React from 'react';
import { View, ActivityIndicator, Text } from 'react-native';

import { ColorTokens } from '@/theme/tokens';

export interface LoadingProps {
  size?: 'small' | 'large';
  color?: string;
  message?: string;
  fullScreen?: boolean;
  className?: string;
}

export const Loading: React.FC<LoadingProps> = ({
  size = 'large',
  color = ColorTokens.primary[500], // Rosa Nathália
  message,
  fullScreen = false,
  className = '',
}) => {
  const content = (
    <View
      className={`
        items-center
        justify-center
        ${fullScreen ? 'flex-1' : 'py-8'}
        ${className}
      `}
    >
      <ActivityIndicator size={size} color={color} />
      {message && <Text className="text-text-light text-sm mt-4">{message}</Text>}
    </View>
  );

  if (fullScreen) {
    return (
      <View className="absolute inset-0 bg-white items-center justify-center z-50">{content}</View>
    );
  }

  return content;
};

export default Loading;
