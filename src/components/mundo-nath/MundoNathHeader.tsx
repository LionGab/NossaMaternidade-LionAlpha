/**
 * MundoNathHeader - Header premium com foto da Nathália
 * Design inspirado no screenshot - Gradiente cyan com foto grande
 */

import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { View, Dimensions } from 'react-native';

import { Box } from '@/components/primitives/Box';
import { Text } from '@/components/primitives/Text';
import { useTheme } from '@/theme';
import { Tokens, ColorTokens } from '@/theme/tokens';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const HEADER_HEIGHT = 280;

export interface MundoNathHeaderProps {
  /** URL da imagem da Nathália */
  imageUrl?: string;
  /** Título (ex: "Mundo Naty") */
  title?: string;
  /** Subtítulo opcional */
  subtitle?: string;
}

export function MundoNathHeader({
  imageUrl = 'https://i.imgur.com/tNIrNIs.jpg',
  title = 'Mundo Naty',
  subtitle,
}: MundoNathHeaderProps) {
  const { isDark } = useTheme();

  return (
    <View
      style={{
        width: SCREEN_WIDTH,
        height: HEADER_HEIGHT,
        position: 'relative',
      }}
      accessible={true}
      accessibilityLabel={`Header do ${title}`}
      accessibilityHint="Seção de conteúdo exclusivo da Nathália"
      accessibilityRole="header"
    >
      {/* Background Image */}
      <Image
        source={{ uri: imageUrl }}
        style={{
          width: '100%',
          height: '100%',
          position: 'absolute',
        }}
        contentFit="cover"
        transition={300}
        cachePolicy="memory-disk"
      />

      {/* Gradiente de overlay - Cyan para fundo */}
      <LinearGradient
        colors={[`${ColorTokens.accent.teal}60`, `${ColorTokens.accent.teal}40`, 'transparent']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '60%',
        }}
      />

      {/* Gradiente inferior - transição para conteúdo */}
      <LinearGradient
        colors={[
          'transparent',
          isDark ? `${ColorTokens.neutral[950]}80` : `${ColorTokens.neutral[50]}80`,
          isDark ? ColorTokens.neutral[950] : ColorTokens.neutral[50],
        ]}
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '50%',
        }}
      />

      {/* Título na parte inferior */}
      <Box
        style={{
          position: 'absolute',
          bottom: Tokens.spacing['4'],
          left: Tokens.spacing['5'],
          right: Tokens.spacing['5'],
        }}
      >
        <Text
          size="2xl"
          weight="bold"
          style={{
            color: isDark ? ColorTokens.neutral[0] : ColorTokens.neutral[900],
            textShadowColor: ColorTokens.overlay.backdrop,
            textShadowOffset: { width: 0, height: 1 },
            textShadowRadius: 4,
          }}
        >
          {title}
        </Text>
        {subtitle && (
          <Text
            size="sm"
            style={{
              color: isDark ? ColorTokens.neutral[300] : ColorTokens.neutral[600],
              marginTop: Tokens.spacing['1'],
            }}
          >
            {subtitle}
          </Text>
        )}
      </Box>
    </View>
  );
}

export default MundoNathHeader;
