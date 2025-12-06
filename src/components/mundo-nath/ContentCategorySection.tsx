/**
 * ContentCategorySection - Seção de conteúdo por categoria
 *
 * Exibe uma seção de conteúdo agrupada por categoria (ex: "Para Você", "Mais Vistos", etc.)
 * com header, lista de cards e botão "Ver mais".
 * Referência: app-redesign-studio-ab40635e/src/pages/Content.tsx (seção "Para Você")
 * Adaptado para React Native com design system atual.
 */

import { Sparkles, ChevronRight, Clock, Eye } from 'lucide-react-native';
import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

import { Box } from '@/components/atoms/Box';
import { Text } from '@/components/atoms/Text';
import { Badge } from '@/components/Badge';
import { useTheme } from '@/theme';
import { Tokens, ColorTokens } from '@/theme/tokens';
import type { ContentItem } from '@/types/content';

interface ContentCategorySectionProps {
  /** Título da seção */
  title: string;
  /** Subtítulo opcional */
  subtitle?: string;
  /** Ícone da seção */
  icon?: React.ReactNode;
  /** Lista de conteúdos */
  items: ContentItem[];
  /** Callback quando um item é pressionado */
  onItemPress?: (item: ContentItem) => void;
  /** Callback quando "Ver mais" é pressionado */
  onSeeAllPress?: () => void;
  /** Limite de itens a exibir (padrão: todos) */
  limit?: number;
}

export function ContentCategorySection({
  title,
  subtitle,
  icon,
  items,
  onItemPress,
  onSeeAllPress,
  limit,
}: ContentCategorySectionProps) {
  const { colors, isDark } = useTheme();
  const displayItems = limit ? items.slice(0, limit) : items;

  const handleItemPress = (item: ContentItem) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onItemPress?.(item);
  };

  const handleSeeAll = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSeeAllPress?.();
  };

  return (
    <Box gap="4">
      {/* Header */}
      <Box direction="row" align="center" justify="space-between">
        <Box direction="row" align="center" gap="3">
          {icon && (
            <Box
              p="2"
              style={{
                borderRadius: Tokens.radius.xl,
                backgroundColor: isDark ? `${ColorTokens.primary[600]}20` : `${ColorTokens.primary[500]}20`,
              }}
            >
              {icon}
            </Box>
          )}
          <Box>
            <Text size="lg" weight="bold" style={{ color: colors.text.primary }}>
              {title}
            </Text>
            {subtitle && (
              <Text size="xs" color="secondary" style={{ color: colors.text.secondary }}>
                {subtitle}
              </Text>
            )}
          </Box>
        </Box>

        {onSeeAllPress && (
          <TouchableOpacity
            onPress={handleSeeAll}
            activeOpacity={0.7}
            style={styles.seeAllButton}
            accessibilityRole="button"
            accessibilityLabel={`Ver todos os conteúdos de ${title}`}
            accessibilityHint="Abre a lista completa de conteúdos desta seção"
          >
            <Text size="sm" weight="medium" style={{ color: colors.primary.main }}>
              Ver mais
            </Text>
            <ChevronRight size={16} color={colors.primary.main} />
          </TouchableOpacity>
        )}
      </Box>

      {/* Content List */}
      <Box gap="3">
        {displayItems.map((item) => (
          <ContentCard key={item.id} item={item} onPress={() => handleItemPress(item)} />
        ))}
      </Box>
    </Box>
  );
}

// ======================
// ContentCard Component
// ======================

interface ContentCardProps {
  item: ContentItem;
  onPress: () => void;
}

function ContentCard({ item, onPress }: ContentCardProps) {
  const { colors, isDark } = useTheme();
  const isVideo = item.type === 'video' || item.type === 'reels';
  const isAudio = item.type === 'audio';

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={[
        styles.card,
        {
          backgroundColor: colors.background.card,
          borderColor: colors.border.light,
        },
      ]}
      accessibilityRole="button"
      accessibilityLabel={`${item.title}. ${item.type === 'video' ? 'Vídeo' : item.type === 'audio' ? 'Áudio' : 'Texto'}. ${item.duration || ''}`}
      accessibilityHint="Toque para ver este conteúdo"
    >
      {/* Thumbnail */}
      <View
        style={[
          styles.thumbnail,
          {
            backgroundColor: isDark
              ? `${ColorTokens.accent.purple}33`
              : `${ColorTokens.accent.purple}33`,
          },
        ]}
      >
        <LinearGradient
          colors={[
            isVideo
              ? `${ColorTokens.primary[500]}33`
              : isAudio
                ? `${ColorTokens.info[500]}33`
                : `${ColorTokens.accent.purple}33`,
            `${ColorTokens.secondary[500]}33`,
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />

        {/* Type Badge */}
        <Badge
          variant={isVideo ? 'primary' : isAudio ? 'info' : 'secondary'}
          containerStyle={{
            position: 'absolute',
            top: Tokens.spacing['3'],
            left: Tokens.spacing['3'],
          }}
        >
          {isVideo ? 'VÍDEO' : isAudio ? 'ÁUDIO' : 'TEXTO'}
        </Badge>

        {/* Play Icon (for video/audio) */}
        {(isVideo || isAudio) && (
          <View style={styles.playIcon}>
            <View
              style={{
                width: 0,
                height: 0,
                borderLeftWidth: 12,
                borderTopWidth: 8,
                borderBottomWidth: 8,
                borderLeftColor: ColorTokens.neutral[0],
                borderTopColor: 'transparent',
                borderBottomColor: 'transparent',
                marginLeft: 4,
              }}
            />
          </View>
        )}

        {/* Emoji placeholder (for text) */}
        {!isVideo && !isAudio && (
          <View style={styles.emojiContainer}>
            <Text style={{ fontSize: 40 }}>🦆</Text>
          </View>
        )}
      </View>

      {/* Content Info */}
      <Box p="4" gap="2">
        <Text size="md" weight="semibold" numberOfLines={2} style={{ color: colors.text.primary }}>
          {item.title}
        </Text>
        {item.description && (
          <Text size="sm" color="secondary" numberOfLines={2} style={{ color: colors.text.secondary }}>
            {item.description}
          </Text>
        )}
        <Box direction="row" align="center" justify="space-between" pt="2">
          <Box direction="row" align="center" gap="2">
            {item.duration && (
              <Box direction="row" align="center" gap="1">
                <Clock size={12} color={colors.text.tertiary} />
                <Text size="xs" color="tertiary">
                  {item.duration}
                </Text>
              </Box>
            )}
            {item.views !== undefined && (
              <Box direction="row" align="center" gap="1">
                <Eye size={12} color={colors.text.tertiary} />
                <Text size="xs" color="tertiary">
                  {formatNumber(item.views)}
                </Text>
              </Box>
            )}
          </Box>
          <ChevronRight size={16} color={colors.primary.main} />
        </Box>
      </Box>
    </TouchableOpacity>
  );
}

// ======================
// HELPERS
// ======================

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
}

// ======================
// STYLES
// ======================

const styles = StyleSheet.create({
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingVertical: Tokens.spacing['2'],
    paddingHorizontal: Tokens.spacing['3'],
  },
  card: {
    borderRadius: Tokens.radius['3xl'],
    overflow: 'hidden',
    borderWidth: 1,
    ...Tokens.shadows.card,
  },
  thumbnail: {
    width: '100%',
    height: 192,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: `${ColorTokens.neutral[0]}66`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emojiContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: `${ColorTokens.neutral[0]}66`,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

