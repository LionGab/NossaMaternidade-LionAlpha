/**
 * SectionLayout - Template para seções com título e ação opcional
 * Usado para agrupar conteúdo relacionado (ex: "Hábitos de hoje", "Mundo Nath pra você")
 */

import React from 'react';
import { ViewStyle, StyleSheet } from 'react-native';

import { Box } from '@/components/primitives/Box';
import { HapticButton } from '@/components/primitives/HapticButton';
import { Heading } from '@/components/primitives/Heading';
import { Text } from '@/components/primitives/Text';
import { Tokens } from '@/theme/tokens';

export interface SectionLayoutProps {
  title: string | React.ReactNode;
  children: React.ReactNode;
  actionLabel?: string;
  onActionPress?: () => void;
  containerStyle?: ViewStyle;
  headingLevel?: 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

export function SectionLayout({
  title,
  children,
  actionLabel,
  onActionPress,
  containerStyle,
  headingLevel = 'h3',
}: SectionLayoutProps) {
  // Mapeamento de heading levels para tamanhos de fonte
  const getFontSize = () => {
    switch (headingLevel) {
      case 'h2':
        return Tokens.typography.sizes['2xl'];
      case 'h3':
        return Tokens.typography.sizes.xl;
      case 'h4':
        return Tokens.typography.sizes.lg;
      case 'h5':
        return Tokens.typography.sizes.md;
      case 'h6':
        return Tokens.typography.sizes.sm;
      default:
        return Tokens.typography.sizes.lg;
    }
  };

  const getFontWeight = () => {
    return headingLevel === 'h2' || headingLevel === 'h3'
      ? Tokens.typography.weights.bold
      : Tokens.typography.weights.semibold;
  };

  return (
    <Box
      style={StyleSheet.flatten([
        { paddingHorizontal: Tokens.spacing['4'], paddingVertical: Tokens.spacing['3'] },
        containerStyle,
      ])}
    >
      {/* Header: Título + Ação opcional */}
      <Box
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: Tokens.spacing['3'],
        }}
      >
        {typeof title === 'string' ? (
          <Heading
            level={headingLevel}
            color="primary"
            style={{
              fontSize: getFontSize(),
              fontWeight: getFontWeight(),
            }}
          >
            {title}
          </Heading>
        ) : (
          <Heading
            level={headingLevel}
            color="primary"
            style={{
              fontSize: getFontSize(),
              fontWeight: getFontWeight(),
            }}
          >
            {title}
          </Heading>
        )}

        {actionLabel && onActionPress && (
          <HapticButton
            variant="ghost"
            size="sm"
            onPress={onActionPress}
            accessibilityLabel={`${actionLabel} - ${title}`}
          >
            <Text size="sm" color="link" weight="medium">
              {actionLabel}
            </Text>
          </HapticButton>
        )}
      </Box>

      {/* Conteúdo da seção */}
      {children}
    </Box>
  );
}
