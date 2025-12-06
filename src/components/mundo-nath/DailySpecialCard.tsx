/**
 * DailySpecialCard - Card de conteúdo especial do dia
 *
 * Exibe um card destacado com conteúdo especial de hoje, geralmente usado na Home
 * ou em uma tela dedicada de "Conteúdo Especial".
 * Referência: app-redesign-studio-ab40635e/src/pages/Content.tsx (seção "Conteúdo Especial de Hoje")
 * Adaptado para React Native com design system atual.
 */

import { BookOpen as _BookOpen, Sparkles, Clock, ChevronRight, Heart as _Heart } from 'lucide-react-native';
import React from 'react';
import { View as _View, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient as _LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

import { Badge } from '@/components/Badge';
import { Box } from '@/components/atoms/Box';
import { Text } from '@/components/atoms/Text';
import { useTheme } from '@/theme';
import { Tokens, ColorTokens } from '@/theme/tokens';
import type { ContentItem } from '@/types/content';

interface DailySpecialCardProps {
  /** Conteúdo especial a ser exibido */
  content?: ContentItem;
  /** Callback quando o card é pressionado */
  onPress?: () => void;
  /** Variante do card (default ou compact) */
  variant?: 'default' | 'compact';
}

const DEFAULT_CONTENT: ContentItem = {
  id: 'daily-special-1',
  title: '5 Formas Simples de Se Cuidar na Maternidade',
  description:
    'Pequenos gestos que fazem toda diferença no seu bem-estar. Aprenda a se cuidar mesmo no meio da correria.',
  type: 'article',
  category: 'autocuidado',
  duration: '8 min',
  thumbnailUrl: undefined,
};

export function DailySpecialCard({
  content = DEFAULT_CONTENT,
  onPress,
  variant = 'default',
}: DailySpecialCardProps) {
  const { colors, isDark } = useTheme();

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.();
  };

  const categoryColors: Record<string, { bg: string; text: string; icon: string }> = {
    autocuidado: {
      bg: isDark ? `${ColorTokens.secondary[600]}20` : `${ColorTokens.secondary[500]}20`,
      text: isDark ? ColorTokens.secondary[300] : ColorTokens.secondary[700],
      icon: ColorTokens.secondary[600],
    },
    maternidade: {
      bg: isDark ? `${ColorTokens.info[600]}20` : `${ColorTokens.info[500]}20`,
      text: isDark ? ColorTokens.info[300] : ColorTokens.info[700],
      icon: ColorTokens.info[600],
    },
    bem_estar: {
      bg: isDark ? `${ColorTokens.accent.purple}20` : `${ColorTokens.accent.purple}20`,
      text: isDark ? ColorTokens.accent.purple : ColorTokens.accent.purple,
      icon: ColorTokens.accent.purple,
    },
  };

  const categoryConfig = categoryColors[content.category] || categoryColors.autocuidado;

  if (variant === 'compact') {
    return (
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={0.85}
        style={[
          styles.compactCard,
          {
            backgroundColor: colors.background.card,
            borderColor: colors.border.light,
          },
        ]}
        accessibilityRole="button"
        accessibilityLabel={`${content.title}. ${content.type === 'article' ? 'Artigo' : 'Conteúdo'}. ${content.duration || ''}`}
        accessibilityHint="Toque para ver este conteúdo especial"
      >
        <Box direction="row" align="center" gap="3">
          <Box
            align="center"
            justify="center"
            style={{
              width: 56,
              height: 56,
              borderRadius: Tokens.radius.xl,
              backgroundColor: categoryConfig.bg,
            }}
          >
            <Sparkles size={28} color={categoryConfig.icon} />
          </Box>
          <Box flex={1} gap="1">
            <Badge
              variant="primary"
              outlined={true}
              containerStyle={{
                backgroundColor: categoryConfig.bg,
                borderColor: categoryConfig.text,
                alignSelf: 'flex-start',
              }}
            >
              <Text size="xs" weight="semibold" style={{ color: categoryConfig.text }}>
                {content.category.toUpperCase()}
              </Text>
            </Badge>
            <Text size="sm" weight="semibold" numberOfLines={2} style={{ color: colors.text.primary }}>
              {content.title}
            </Text>
            {content.duration && (
              <Box direction="row" align="center" gap="1">
                <Clock size={12} color={colors.text.tertiary} />
                <Text size="xs" color="tertiary">
                  {content.duration}
                </Text>
              </Box>
            )}
          </Box>
          <ChevronRight size={20} color={colors.text.tertiary} />
        </Box>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.85}
      style={[
        styles.card,
        {
          backgroundColor: colors.background.card,
          borderColor: colors.border.light,
        },
      ]}
      accessibilityRole="button"
      accessibilityLabel={`${content.title}. ${content.type === 'article' ? 'Artigo' : 'Conteúdo'}. ${content.duration || ''}`}
      accessibilityHint="Toque para ver este conteúdo especial"
    >
      <Box direction="row" align="flex-start" gap="4">
        <Box
          align="center"
          justify="center"
          style={{
            width: 64,
            height: 64,
            borderRadius: Tokens.radius['2xl'],
            backgroundColor: categoryConfig.bg,
            flexShrink: 0,
          }}
        >
          <Sparkles size={32} color={categoryConfig.icon} />
        </Box>
        <Box flex={1} gap="2">
          <Badge
            variant="primary"
            outlined={true}
            containerStyle={{
              backgroundColor: categoryConfig.bg,
              borderColor: categoryConfig.text,
              alignSelf: 'flex-start',
            }}
          >
            <Text size="xs" weight="semibold" style={{ color: categoryConfig.text }}>
              {content.category.toUpperCase()}
            </Text>
          </Badge>
          <Text size="md" weight="bold" numberOfLines={2} style={{ color: colors.text.primary }}>
            {content.title}
          </Text>
          <Text size="sm" color="secondary" numberOfLines={2} style={{ color: colors.text.secondary }}>
            {content.description}
          </Text>
          <Box direction="row" align="center" gap="3">
            {content.duration && (
              <Box direction="row" align="center" gap="1">
                <Clock size={12} color={colors.text.tertiary} />
                <Text size="xs" color="tertiary">
                  {content.duration}
                </Text>
              </Box>
            )}
            <Box direction="row" align="center" gap="1">
              <ChevronRight size={16} color={colors.primary.main} />
              <Text size="xs" weight="medium" style={{ color: colors.primary.main }}>
                Ler
              </Text>
            </Box>
          </Box>
        </Box>
      </Box>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Tokens.radius['3xl'],
    padding: Tokens.spacing['5'],
    borderWidth: 1,
    ...Tokens.shadows.card,
  },
  compactCard: {
    borderRadius: Tokens.radius['2xl'],
    padding: Tokens.spacing['4'],
    borderWidth: 1,
    ...Tokens.shadows.sm,
  },
});

