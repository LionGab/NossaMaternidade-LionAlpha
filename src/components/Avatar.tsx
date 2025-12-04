import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { View, Text, TouchableOpacity, ViewStyle } from 'react-native';

import { useThemeColors } from '@/theme';
import { ColorTokens } from '@/theme/tokens';

export interface AvatarProps {
  size?: number;
  source?: { uri: string } | number;
  name?: string;
  fallback?: string;
  onPress?: () => void;
  accessibilityIgnoresInvertColors?: boolean;
  borderWidth?: number;
  borderColor?: string;
  useGradientFallback?: boolean;
  style?: ViewStyle;
}

export const Avatar: React.FC<AvatarProps> = ({
  size = 40,
  source,
  name,
  fallback,
  onPress,
  accessibilityIgnoresInvertColors = false,
  borderWidth = 0,
  borderColor,
  useGradientFallback = false,
  style,
}) => {
  const colors = useThemeColors();
  const TouchableComponent = onPress ? TouchableOpacity : View;

  const displayName = name || fallback || '👤';
  const hasImage = Boolean(source);
  const showFallback = !hasImage;

  const containerStyle: ViewStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
    overflow: 'hidden',
    backgroundColor: colors.background.card,
    ...(borderWidth > 0 && {
      borderWidth,
      borderColor: borderColor || colors.border.light,
    }),
    ...style,
  };

  const content = (
    <View style={containerStyle}>
      {hasImage ? (
        <Image
          source={typeof source === 'object' && 'uri' in source ? source : source}
          style={{
            width: size,
            height: size,
          }}
          contentFit="cover"
          accessibilityIgnoresInvertColors={accessibilityIgnoresInvertColors}
        />
      ) : showFallback ? (
        useGradientFallback ? (
          <LinearGradient
            colors={ColorTokens.nathIA.gradient.light}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              width: size,
              height: size,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text
              style={{
                color: ColorTokens.neutral[0],
                fontSize: size * 0.4,
                fontWeight: '600',
              }}
            >
              {displayName.length <= 2 ? displayName.toUpperCase() : displayName}
            </Text>
          </LinearGradient>
        ) : (
          <View
            style={{
              width: size,
              height: size,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: colors.background.elevated,
            }}
          >
            <Text
              style={{
                color: colors.text.primary,
                fontSize: displayName.length <= 2 ? size * 0.4 : size * 0.6,
                fontWeight: '600',
              }}
            >
              {displayName.length <= 2 ? displayName.toUpperCase() : displayName}
            </Text>
          </View>
        )
      ) : null}
    </View>
  );

  if (onPress) {
    return (
      <TouchableComponent onPress={onPress} activeOpacity={0.7}>
        {content}
      </TouchableComponent>
    );
  }

  return content;
};

export default Avatar;
