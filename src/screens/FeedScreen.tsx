import { FlashList } from '@shopify/flash-list';
import { Image } from 'expo-image';
import {
  Heart,
  MessageCircle,
  Share2,
  BookmarkPlus,
  Play,
  FileText,
  Mic,
  Video,
} from 'lucide-react-native';
import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FilterChip } from '../components/FilterChip';
import { MOCK_POSTS } from '../constants/data';
import { useHaptics } from '../hooks/useHaptics';
import { Tokens } from '../theme';
import { useTheme, ThemeColors } from '../theme/ThemeContext';

type FilterType = 'all' | 'video' | 'text' | 'audio' | 'reels';

interface PostCardProps {
  item: (typeof MOCK_POSTS)[0];
  colors: ThemeColors;
  onPress?: () => void;
}

const PostCard: React.FC<PostCardProps> = ({ item, colors, onPress }) => {
  const getIconForType = useCallback(() => {
    switch (item.type.toLowerCase()) {
      case 'video':
        return <Video size={16} color={colors.text.inverse} />;
      case 'text':
      case 'article':
        return <FileText size={16} color={colors.text.inverse} />;
      case 'audio':
        return <Mic size={16} color={colors.text.inverse} />;
      case 'reels':
        return <Play size={16} color={colors.text.inverse} />;
      default:
        return null;
    }
  }, [item.type, colors.text.inverse]);

  const getTypeLabel = useCallback((type: string): string => {
    const labels: Record<string, string> = {
      video: 'Vídeo',
      text: 'Texto',
      article: 'Artigo',
      audio: 'Áudio',
      reels: 'Reels',
    };
    return labels[type.toLowerCase()] || type;
  }, []);

  return (
    <TouchableOpacity
      style={[
        styles.postCard,
        { borderBottomColor: colors.border.light, backgroundColor: colors.background.canvas },
      ]}
      activeOpacity={0.7}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${item.title}. Tipo: ${getTypeLabel(item.type)}. ${item.isNew ? 'Novo conteúdo' : ''}`}
      accessibilityHint="Toque para ver detalhes deste conteúdo"
    >
      {/* Post Image */}
      <View style={styles.postImageContainer}>
        <Image
          source={{ uri: item.thumbnailUrl }}
          style={[styles.postImage, { backgroundColor: colors.border.medium }]}
          contentFit="cover"
          transition={200}
          accessibilityLabel={`Imagem de capa: ${item.title}`}
          accessibilityIgnoresInvertColors
        />
        {/* Type badge */}
        <View style={[styles.typeBadge, { backgroundColor: colors.background.overlay }]}>
          {getIconForType()}
          <Text style={[styles.typeBadgeText, { color: colors.text.inverse }]}>
            {getTypeLabel(item.type)}
          </Text>
        </View>
        {/* New badge */}
        {item.isNew && (
          <View style={[styles.newBadge, { backgroundColor: colors.secondary.main }]}>
            <Text style={[styles.newBadgeText, { color: colors.text.inverse }]}>NOVO</Text>
          </View>
        )}
      </View>

      {/* Post Title */}
      <Text style={[styles.postTitle, { color: colors.text.primary }]} numberOfLines={2}>
        {item.title}
      </Text>

      {/* Actions */}
      <View style={styles.postActions} accessible={true} accessibilityRole="toolbar">
        <TouchableOpacity
          style={styles.postAction}
          accessibilityRole="button"
          accessibilityLabel="Curtir. 12 curtidas"
          accessibilityHint="Toque para curtir este post"
        >
          <Heart size={20} color={colors.text.tertiary} />
          <Text style={[styles.postActionText, { color: colors.text.tertiary }]}>12</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.postAction}
          accessibilityRole="button"
          accessibilityLabel="Comentar. 5 comentários"
          accessibilityHint="Toque para ver e adicionar comentários"
        >
          <MessageCircle size={20} color={colors.text.tertiary} />
          <Text style={[styles.postActionText, { color: colors.text.tertiary }]}>5</Text>
        </TouchableOpacity>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Compartilhar"
          accessibilityHint="Toque para compartilhar este conteúdo"
        >
          <Share2 size={20} color={colors.text.tertiary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.postActionBookmark}
          accessibilityRole="button"
          accessibilityLabel="Salvar nos favoritos"
          accessibilityHint="Toque para salvar este conteúdo"
        >
          <BookmarkPlus size={20} color={colors.text.tertiary} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

export default function FeedScreen() {
  const { colors, isDark: _isDark } = useTheme();
  const haptics = useHaptics();
  const [filter, setFilter] = useState<FilterType>('all');

  const filterOptions: { value: FilterType; label: string }[] = useMemo(
    () => [
      { value: 'all', label: 'Tudo' },
      { value: 'video', label: 'Vídeo' },
      { value: 'text', label: 'Texto' },
      { value: 'audio', label: 'Áudio' },
      { value: 'reels', label: 'Reels' },
    ],
    []
  );

  const filteredPosts = useMemo(() => {
    if (filter === 'all') return MOCK_POSTS;
    return MOCK_POSTS.filter((p) => p.type.toLowerCase() === filter.toLowerCase());
  }, [filter]);

  const handleFilterChange = useCallback(
    (value: FilterType) => {
      haptics.light();
      setFilter(value);
    },
    [haptics]
  );

  const renderPost = useCallback(
    ({ item }: { item: (typeof MOCK_POSTS)[0] }) => <PostCard item={item} colors={colors} />,
    [colors]
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background.canvas }]}
      edges={['top']}
      accessible={true}
      accessibilityLabel="Tela do Feed Mundo Nath"
    >
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: colors.background.card,
            borderBottomColor: colors.border.light,
          },
        ]}
        accessible={true}
        accessibilityRole="header"
      >
        <Text
          style={[styles.headerTitle, { color: colors.text.primary }]}
          accessibilityRole="header"
          accessibilityLabel="Feed de conteúdos Mundo Nath"
        >
          Mundo Nath
        </Text>

        {/* Filter chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterScroll}
          contentContainerStyle={styles.filterContainer}
          accessible={false}
        >
          {filterOptions.map((option) => (
            <FilterChip
              key={option.value}
              label={option.label}
              selected={filter === option.value}
              onPress={() => handleFilterChange(option.value)}
              variant="primary"
              size="md"
            />
          ))}
        </ScrollView>
      </View>

      {/* Feed List */}
      {filteredPosts.length === 0 ? (
        <View
          style={styles.emptyState}
          accessible={true}
          accessibilityRole="text"
          accessibilityLabel="Nenhum conteúdo encontrado para este filtro"
        >
          <Text style={[styles.emptyStateText, { color: colors.text.secondary }]}>
            Nenhum conteúdo encontrado para este filtro
          </Text>
        </View>
      ) : (
        <FlashList
          data={filteredPosts}
          renderItem={renderPost}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          accessible={true}
          accessibilityRole="list"
          accessibilityLabel={`Lista de posts. ${filteredPosts.length} ${filteredPosts.length === 1 ? 'post' : 'posts'} ${filter === 'all' ? '' : `filtrado por ${filter}`}`}
          // ✅ Otimizações de performance (FlashList v2)
          drawDistance={500}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: Tokens.typography.sizes['2xl'], // 24
    fontWeight: Tokens.typography.weights.bold,
    marginBottom: 12,
  },
  filterScroll: {
    marginLeft: -16,
    paddingLeft: 16,
  },
  filterContainer: {
    paddingRight: 16,
  },
  listContent: {
    paddingBottom: 120, // Espaço para tab bar
  },
  postCard: {
    padding: 16,
    borderBottomWidth: 1,
  },
  postImageContainer: {
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
  },
  postImage: {
    width: '100%',
    height: 200,
  },
  typeBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  typeBadgeText: {
    fontSize: Tokens.typography.sizes.xs, // 12
    fontWeight: Tokens.typography.weights.semibold, // '600'
  },
  newBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  newBadgeText: {
    fontSize: Tokens.typography.sizes['3xs'], // 10
    fontWeight: Tokens.typography.weights.bold,
  },
  postTitle: {
    fontSize: Tokens.typography.sizes.lg, // 18
    fontWeight: Tokens.typography.weights.bold,
    marginBottom: 12,
    lineHeight: 24,
  },
  postActions: {
    flexDirection: 'row',
    gap: 20,
    alignItems: 'center',
  },
  postAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  postActionText: {
    fontSize: Tokens.typography.sizes.sm, // 14
    fontWeight: Tokens.typography.weights.medium, // '500'
  },
  postActionBookmark: {
    marginLeft: 'auto',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  emptyStateText: {
    fontSize: Tokens.typography.sizes.base, // 16
    textAlign: 'center',
  },
});
