/**
 * ForYouSection - Seção "Para Você" com recomendações personalizadas
 * Release C: MundoNath Personalizado
 *
 * Mostra conteúdos personalizados baseados no perfil do usuário
 * com explicação gerada por IA sobre o motivo das recomendações.
 */

import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { Sparkles, Play, Clock, Eye, ChevronRight } from 'lucide-react-native';
import React, { useEffect, useState, useCallback } from 'react';
import { View, TouchableOpacity, ActivityIndicator, Image, StyleSheet } from 'react-native';

import { Box } from '@/components/atoms/Box';
import { Text } from '@/components/atoms/Text';
import { useResponsiveDimensions } from '@/hooks/useResponsiveDimensions';
import type { PersonalizedContent } from '@/services/contentRecommendationService';
import { feedService } from '@/services/feedService';
import { useTheme } from '@/theme';
import { Tokens, ColorTokens } from '@/theme/tokens';
import type { ContentItem } from '@/types/content';
import { logger } from '@/utils/logger';

interface ForYouContentItem {
  id: string;
  title: string;
  imageUrl?: string;
  category: string;
  isLocked?: boolean;
  isNew?: boolean;
  duration?: string | number;
}

interface ForYouSectionProps {
  onItemPress?: (item: ForYouContentItem) => void;
  onSeeAllPress?: () => void;
}

export function ForYouSection({ onItemPress, onSeeAllPress }: ForYouSectionProps) {
  const { colors, isDark } = useTheme();
  const { cardWidth, cardGap } = useResponsiveDimensions();
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState<PersonalizedContent | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadContent = useCallback(async (forceRefresh = false) => {
    try {
      setLoading(true);
      setError(null);

      const result = await feedService.getPersonalizedRecommendations(4, { forceRefresh });
      setContent(result);

      logger.info('[ForYouSection] Loaded personalized content', {
        count: result.forYou.length,
        confidence: result.confidence,
        source: result.source,
      });
    } catch (err) {
      logger.error('[ForYouSection] Failed to load content', err);
      setError('Não foi possível carregar recomendações');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadContent();
  }, [loadContent]);

  const handleItemPress = (item: ContentItem) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Converter para o formato esperado pela prop
    const convertedItem: ForYouContentItem = {
      id: item.id,
      title: item.title,
      imageUrl: item.thumbnailUrl || item.imageUrl,
      category: item.category,
      isNew: item.isExclusive,
      duration: item.duration,
    };
    onItemPress?.(convertedItem);
  };

  const handleSeeAll = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSeeAllPress?.();
  };

  const handleRefresh = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    loadContent(true);
  };

  // Loading state
  if (loading && !content) {
    return (
      <Box
        py="6"
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 200,
        }}
      >
        <ActivityIndicator size="small" color={colors.primary.main} />
        <Text size="sm" style={{ color: colors.text.secondary, marginTop: Tokens.spacing['3'] }}>
          Personalizando para você...
        </Text>
      </Box>
    );
  }

  // Error state (still show section with retry)
  if (error && !content) {
    return (
      <Box py="4">
        <TouchableOpacity
          onPress={handleRefresh}
          style={{
            padding: Tokens.spacing['4'],
            backgroundColor: isDark ? ColorTokens.neutral[800] : ColorTokens.neutral[100],
            borderRadius: Tokens.radius.lg,
            alignItems: 'center',
          }}
          accessibilityRole="button"
          accessibilityLabel="Tentar novamente carregar recomendações"
          accessibilityHint="Toque para recarregar as recomendações personalizadas"
        >
          <Text size="sm" style={{ color: colors.text.secondary }}>
            {error}
          </Text>
          <Text
            size="sm"
            weight="medium"
            style={{ color: colors.primary.main, marginTop: Tokens.spacing['2'] }}
          >
            Tentar novamente
          </Text>
        </TouchableOpacity>
      </Box>
    );
  }

  if (!content || content.forYou.length === 0) {
    return null;
  }

  return (
    <Box>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={[styles.iconContainer, { backgroundColor: `${colors.primary.main}20` }]}>
            <Sparkles size={18} color={colors.primary.main} />
          </View>
          <View>
            <Text size="lg" weight="bold" style={{ color: colors.text.primary }}>
              Para Você
            </Text>
            {content.confidence > 0.5 && (
              <Text size="xs" style={{ color: colors.text.secondary }}>
                Baseado no seu perfil
              </Text>
            )}
          </View>
        </View>

        <TouchableOpacity
          onPress={handleSeeAll}
          style={styles.seeAllButton}
          accessibilityRole="button"
          accessibilityLabel="Ver todos os conteúdos personalizados"
          accessibilityHint="Abre a lista completa de conteúdos recomendados"
        >
          <Text size="sm" weight="medium" style={{ color: colors.primary.main }}>
            Ver mais
          </Text>
          <ChevronRight size={16} color={colors.primary.main} />
        </TouchableOpacity>
      </View>

      {/* AI Reasoning (se confiança alta) */}
      {content.confidence > 0.4 && content.reasoning && (
        <View
          style={[
            styles.reasoningContainer,
            {
              backgroundColor: isDark ? `${colors.primary.main}10` : `${colors.primary.main}08`,
              borderColor: isDark ? `${colors.primary.main}30` : `${colors.primary.main}20`,
            },
          ]}
        >
          <Text
            size="xs"
            style={{
              color: isDark ? colors.primary.main : ColorTokens.primary[700],
              fontStyle: 'italic',
              lineHeight: 18,
            }}
          >
            {content.reasoning}
          </Text>
        </View>
      )}

      {/* Content Grid (2 columns) */}
      <View style={[styles.grid, { gap: cardGap }]}>
        {content.forYou.slice(0, 4).map((item, index) => (
          <ContentCard
            key={item.id}
            item={item}
            onPress={() => handleItemPress(item)}
            index={index}
            isDark={isDark}
            colors={colors}
            cardWidth={cardWidth}
          />
        ))}
      </View>
    </Box>
  );
}

// ======================
// ContentCard Component
// ======================

interface ContentCardProps {
  item: ContentItem;
  onPress: () => void;
  index: number;
  isDark: boolean;
  colors: ReturnType<typeof useTheme>['colors'];
  cardWidth: number;
}

function ContentCard({
  item,
  onPress,
  index: _index,
  isDark,
  colors,
  cardWidth,
}: ContentCardProps) {
  const isVideo = item.type === 'video' || item.type === 'reels';
  const isAudio = item.type === 'audio';

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={[
        styles.card,
        {
          width: cardWidth,
          backgroundColor: isDark ? ColorTokens.neutral[800] : ColorTokens.neutral[0],
        },
      ]}
      accessibilityRole="button"
      accessibilityLabel={`${item.title}. ${item.type === 'video' ? 'Vídeo' : item.type === 'audio' ? 'Áudio' : 'Texto'}. ${item.duration || ''}`}
      accessibilityHint="Toque para ver este conteúdo"
    >
      {/* Thumbnail */}
      <View style={styles.thumbnailContainer}>
        <Image
          source={{ uri: item.thumbnailUrl || item.imageUrl || 'https://picsum.photos/200/200' }}
          style={styles.thumbnail}
          resizeMode="cover"
          accessibilityIgnoresInvertColors
        />

        {/* Overlay gradient */}
        <LinearGradient
          colors={['transparent', ColorTokens.overlay.dark]}
          style={styles.thumbnailOverlay}
        />

        {/* Play button for video/audio */}
        {(isVideo || isAudio) && (
          <View style={styles.playButton}>
            <Play size={20} color={ColorTokens.neutral[0]} fill={ColorTokens.neutral[0]} />
          </View>
        )}

        {/* Duration badge */}
        {item.duration && (
          <View style={styles.durationBadge}>
            <Clock size={10} color={ColorTokens.neutral[0]} />
            <Text
              size="xs"
              style={{
                color: ColorTokens.neutral[0],
                marginLeft: 2,
                fontSize: 10,
              }}
            >
              {item.duration}
            </Text>
          </View>
        )}

        {/* Type badge */}
        <View
          style={[
            styles.typeBadge,
            {
              backgroundColor: isVideo
                ? ColorTokens.primary[500]
                : isAudio
                  ? ColorTokens.info[500]
                  : ColorTokens.secondary[500],
            },
          ]}
        >
          <Text
            size="xs"
            weight="bold"
            style={{
              color: ColorTokens.neutral[0],
              fontSize: 9,
              textTransform: 'uppercase',
              letterSpacing: 0.5,
            }}
          >
            {item.type === 'reels' ? 'REEL' : item.type?.toUpperCase()}
          </Text>
        </View>

        {/* Exclusive badge */}
        {item.isExclusive && (
          <View style={styles.exclusiveBadge}>
            <Sparkles size={10} color={ColorTokens.warning[400]} />
          </View>
        )}
      </View>

      {/* Content info */}
      <View style={styles.cardContent}>
        <Text
          size="sm"
          weight="semibold"
          numberOfLines={2}
          style={{
            color: colors.text.primary,
            lineHeight: 18,
          }}
        >
          {item.title}
        </Text>

        {/* Stats */}
        {(item.views || item.likes) && (
          <View style={styles.stats}>
            {item.views !== undefined && (
              <View style={styles.statItem}>
                <Eye size={12} color={colors.text.tertiary} />
                <Text
                  size="xs"
                  style={{
                    color: colors.text.tertiary,
                    marginLeft: 4,
                  }}
                >
                  {formatNumber(item.views)}
                </Text>
              </View>
            )}
          </View>
        )}
      </View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Tokens.spacing['3'],
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Tokens.spacing['3'],
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: Tokens.radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingVertical: Tokens.spacing['2'],
    paddingHorizontal: Tokens.spacing['3'],
  },
  reasoningContainer: {
    padding: Tokens.spacing['3'],
    borderRadius: Tokens.radius.lg,
    borderWidth: 1,
    marginBottom: Tokens.spacing['4'],
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  card: {
    borderRadius: Tokens.radius.xl,
    overflow: 'hidden',
    ...Tokens.shadows.sm,
  },
  thumbnailContainer: {
    width: '100%',
    aspectRatio: 1,
    position: 'relative',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  thumbnailOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
  },
  playButton: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: ColorTokens.overlay.backdrop,
    alignItems: 'center',
    justifyContent: 'center',
    // ✅ Otimizado: usar transform em vez de margin para centering (GPU-accelerated)
    transform: [{ translateX: -20 }, { translateY: -20 }],
  },
  durationBadge: {
    position: 'absolute',
    bottom: Tokens.spacing['2'],
    right: Tokens.spacing['2'],
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ColorTokens.overlay.heavy,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Tokens.radius.sm,
  },
  typeBadge: {
    position: 'absolute',
    top: Tokens.spacing['2'],
    left: Tokens.spacing['2'],
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Tokens.radius.sm,
  },
  exclusiveBadge: {
    position: 'absolute',
    top: Tokens.spacing['2'],
    right: Tokens.spacing['2'],
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: ColorTokens.overlay.backdrop,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContent: {
    padding: Tokens.spacing['3'],
    minHeight: 70,
    justifyContent: 'space-between',
  },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Tokens.spacing['2'],
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default ForYouSection;
