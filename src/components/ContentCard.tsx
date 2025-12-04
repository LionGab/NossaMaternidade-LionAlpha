/**
 * ContentCard Component
 * Card reutilizável para exibir conteúdo do Mundo Nath
 * Theme-aware with Design System tokens
 */

import { Ionicons } from '@expo/vector-icons';
import React, { useRef, memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Animated,
  GestureResponderEvent,
} from 'react-native';

import { useThemeColors, type ThemeColors } from '@/theme';
import { Tokens, CardSizes } from '@/theme/tokens';

import { useHaptics } from '../hooks/useHaptics';
import { ContentItem, ContentType } from '../types/content';

interface ContentCardProps {
  item: ContentItem;
  onPress: () => void;
  onLike?: (item: ContentItem) => void;
  onComment?: (item: ContentItem) => void;
}

const getTypeIcon = (type: ContentType): keyof typeof Ionicons.glyphMap => {
  switch (type) {
    case 'video':
      return 'play-circle';
    case 'audio':
      return 'headset';
    case 'text':
      return 'document-text';
    case 'reels':
      return 'film';
    default:
      return 'ellipse';
  }
};

const getTypeColor = (type: ContentType, colors: ThemeColors): string => {
  switch (type) {
    case 'video':
      return colors.primary.main;
    case 'audio':
      return colors.raw.warning[500];
    case 'text':
      return colors.raw.success[500];
    case 'reels':
      return colors.raw.secondary[400];
    default:
      return colors.text.secondary;
  }
};

const styles = StyleSheet.create({
  contentCard: {
    borderRadius: Tokens.radius['2xl'],
    overflow: 'hidden',
    marginBottom: Tokens.spacing['4'],
    borderWidth: 1,
  },
  cardImageContainer: {
    width: '100%',
    height: CardSizes.medium.imageHeight, // ✅ Usar token do design system
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  cardImageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
    backgroundColor: Tokens.colors.overlay.backdrop,
  },
  exclusiveBadge: {
    position: 'absolute',
    top: Tokens.spacing['3'],
    left: Tokens.spacing['3'],
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Tokens.spacing['2'],
    paddingVertical: Tokens.spacing['1'],
    borderRadius: Tokens.radius.md,
    gap: 4,
  },
  exclusiveBadgeText: {
    fontSize: Tokens.typography.sizes.xs - 3,
    fontWeight: Tokens.typography.weights.bold,
    letterSpacing: 0.5,
  },
  typeIconContainer: {
    position: 'absolute',
    top: Tokens.spacing['3'],
    right: Tokens.spacing['3'],
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  durationBadge: {
    position: 'absolute',
    bottom: Tokens.spacing['3'],
    right: Tokens.spacing['3'],
    backgroundColor: Tokens.colors.overlay.heavy,
    paddingHorizontal: Tokens.spacing['2'],
    paddingVertical: Tokens.spacing['1'],
    borderRadius: Tokens.radius.md,
  },
  durationText: {
    fontSize: Tokens.typography.sizes.xs,
    fontWeight: Tokens.typography.weights.semibold,
  },
  statsContainer: {
    position: 'absolute',
    bottom: Tokens.spacing['3'],
    left: Tokens.spacing['3'],
    flexDirection: 'row',
    gap: Tokens.spacing['3'],
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Tokens.colors.overlay.dark,
    paddingHorizontal: Tokens.spacing['2'],
    paddingVertical: Tokens.spacing['1'],
    borderRadius: Tokens.radius.md,
  },
  statText: {
    fontSize: Tokens.typography.sizes.xs,
    fontWeight: Tokens.typography.weights.semibold,
  },
  cardContent: {
    padding: Tokens.spacing['4'],
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Tokens.spacing['3'],
  },
  typeBadge: {
    paddingHorizontal: Tokens.spacing['2.5'],
    paddingVertical: Tokens.spacing['1'],
    borderRadius: Tokens.radius.md,
  },
  typeBadgeText: {
    fontSize: Tokens.typography.sizes.xs,
    fontWeight: Tokens.typography.weights.bold,
    letterSpacing: 0.5,
  },
  cardDate: {
    fontSize: Tokens.typography.sizes.xs,
  },
  cardTitle: {
    fontSize: Tokens.typography.sizes.lg,
    fontWeight: Tokens.typography.weights.bold,
    marginBottom: Tokens.spacing['1.5'],
    lineHeight: 24,
  },
  cardDescription: {
    fontSize: Tokens.typography.sizes.sm,
    lineHeight: 20,
    marginBottom: Tokens.spacing['3'],
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Tokens.spacing['1.5'],
    marginBottom: Tokens.spacing['3'],
  },
  tag: {
    paddingHorizontal: Tokens.spacing['2'],
    paddingVertical: Tokens.spacing['1'],
    borderRadius: Tokens.radius.sm,
  },
  tagText: {
    fontSize: Tokens.typography.sizes.xs,
  },
  cardActions: {
    flexDirection: 'row',
    gap: Tokens.spacing['4'],
    marginTop: Tokens.spacing['3'],
    paddingTop: Tokens.spacing['3'],
    borderTopWidth: 1,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Tokens.spacing['1.5'],
    paddingVertical: Tokens.spacing['1.5'],
    paddingHorizontal: Tokens.spacing['3'],
    borderRadius: Tokens.radius.lg,
    minHeight: Tokens.touchTargets.min,
  },
  actionButtonText: {
    fontSize: Tokens.typography.sizes.sm - 1,
    fontWeight: Tokens.typography.weights.semibold,
  },
});

const ContentCardComponent: React.FC<ContentCardProps> = ({ item, onPress, onLike, onComment }) => {
  const colors = useThemeColors();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const haptics = useHaptics();
  const [isLiked, setIsLiked] = React.useState(false);
  const [likesCount, setLikesCount] = React.useState(item.likes || 0);

  const typeColor = getTypeColor(item.type, colors);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      useNativeDriver: true,
    }).start();
    haptics.light();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const handleLikePress = (e: GestureResponderEvent) => {
    e.stopPropagation();
    setIsLiked(!isLiked);
    setLikesCount(isLiked ? likesCount - 1 : likesCount + 1);
    haptics.medium();
    onLike?.(item);
  };

  const handleCommentPress = (e: GestureResponderEvent) => {
    e.stopPropagation();
    haptics.light();
    onComment?.(item);
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel={`Conteúdo: ${item.title}`}
        accessibilityHint={`Abre o conteúdo do tipo ${item.type}: ${item.title}`}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
        style={[
          styles.contentCard,
          { backgroundColor: colors.background.card, borderColor: colors.border.light },
        ]}
      >
        <View style={styles.cardImageContainer}>
          <Image
            source={{ uri: item.imageUrl }}
            style={styles.cardImage}
            accessibilityIgnoresInvertColors={true}
          />
          <View
            style={[styles.cardImageOverlay, { pointerEvents: 'none' }]}
            accessible={false}
            accessibilityRole="none"
          />

          {/* Exclusive Badge */}
          {item.isExclusive && (
            <View style={[styles.exclusiveBadge, { backgroundColor: colors.raw.secondary[400] }]}>
              <Ionicons name="lock-closed" size={10} color={colors.raw.neutral[0]} />
              <Text style={[styles.exclusiveBadgeText, { color: colors.raw.neutral[0] }]}>
                EXCLUSIVO
              </Text>
            </View>
          )}

          {/* Type Icon */}
          <View style={[styles.typeIconContainer, { backgroundColor: `${typeColor}40` }]}>
            <Ionicons name={getTypeIcon(item.type)} size={20} color={typeColor} />
          </View>

          {/* Duration */}
          {item.duration && (
            <View style={styles.durationBadge}>
              <Text style={[styles.durationText, { color: colors.raw.neutral[0] }]}>
                {item.duration}
              </Text>
            </View>
          )}

          {/* Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Ionicons name="eye-outline" size={12} color={colors.raw.neutral[0]} />
              <Text style={[styles.statText, { color: colors.raw.neutral[0] }]}>
                {item.views?.toLocaleString()}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="heart-outline" size={12} color={colors.raw.neutral[0]} />
              <Text style={[styles.statText, { color: colors.raw.neutral[0] }]}>
                {item.likes?.toLocaleString()}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <View style={[styles.typeBadge, { backgroundColor: `${typeColor}20` }]}>
              <Text style={[styles.typeBadgeText, { color: typeColor }]}>{item.type}</Text>
            </View>
            <Text style={[styles.cardDate, { color: colors.text.tertiary }]}>{item.date}</Text>
          </View>

          <Text style={[styles.cardTitle, { color: colors.text.primary }]} numberOfLines={2}>
            {item.title}
          </Text>
          <Text
            style={[styles.cardDescription, { color: colors.text.secondary }]}
            numberOfLines={2}
          >
            {item.description}
          </Text>

          {item.tags && item.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {item.tags.slice(0, 3).map((tag, index) => (
                <View
                  key={index}
                  style={[styles.tag, { backgroundColor: colors.background.elevated }]}
                >
                  <Text style={[styles.tagText, { color: colors.text.secondary }]}>#{tag}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Action Buttons */}
          <View style={[styles.cardActions, { borderTopColor: colors.border.light }]}>
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel={isLiked ? 'Remover curtida' : 'Curtir'}
              accessibilityHint={
                isLiked
                  ? 'Remove sua curtida deste conteúdo'
                  : 'Adiciona uma curtida a este conteúdo'
              }
              style={[styles.actionButton, { backgroundColor: colors.background.elevated }]}
              onPress={handleLikePress}
              activeOpacity={0.7}
            >
              <Ionicons
                name={isLiked ? 'heart' : 'heart-outline'}
                size={20}
                color={isLiked ? colors.raw.error[500] : colors.text.secondary}
              />
              <Text
                style={[
                  styles.actionButtonText,
                  { color: colors.text.secondary },
                  isLiked && { color: colors.raw.error[500] },
                ]}
              >
                {likesCount.toLocaleString()}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Comentar"
              accessibilityHint="Abre a seção de comentários deste conteúdo"
              style={[styles.actionButton, { backgroundColor: colors.background.elevated }]}
              onPress={handleCommentPress}
              activeOpacity={0.7}
            >
              <Ionicons name="chatbubble-outline" size={20} color={colors.text.secondary} />
              <Text style={[styles.actionButtonText, { color: colors.text.secondary }]}>
                Comentar
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

// 🚀 MEMOIZATION: Evita re-renders desnecessários quando props não mudam
export const ContentCard = memo(ContentCardComponent);

export default ContentCard;
