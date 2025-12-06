/**
 * CommunityScreen - Tela de Comunidade MãesValentes
 *
 * Feed de posts da comunidade com criação de posts, filtros por categoria,
 * curtidas e comentários.
 * Referência: app-redesign-studio-ab40635e/src/pages/Community.tsx
 * Refatorado para usar componentes separados (CreatePostModal, PostCard).
 */

import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Plus, Users, Grid, Sparkles, Loader2 } from 'lucide-react-native';
import React, { useState, useCallback, useEffect } from 'react';
import {
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  View,
  FlatList,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar } from '@/components/Avatar';
import { Badge } from '@/components/Badge';
import { CreatePostModal, PostCard } from '@/components/community';
import { Box } from '@/components/atoms/Box';
import { Text } from '@/components/atoms/Text';
import { ThemeToggle } from '@/components/ThemeToggle';
import type { RootStackParamList } from '@/navigation/types';
import { communityService, type CommunityPost } from '@/services/communityService';
import { useTheme } from '@/theme';
import { triggerPlatformHaptic } from '@/theme/platform';
import {
  ColorTokens,
  Tokens,
  Shadows,
  Spacing,
  Radius,
} from '@/theme/tokens';
import { logger } from '@/utils/logger';

type FilterType = 'Todos' | 'Dicas' | 'Desabafos' | 'Dúvidas' | 'Humor';

type CommunityNavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function CommunityScreen() {
  const { colors, isDark } = useTheme();
  useNavigation<CommunityNavigationProp>();
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('Todos');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [likingPostId, setLikingPostId] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const filters: FilterType[] = ['Todos', 'Dicas', 'Desabafos', 'Dúvidas', 'Humor'];

  // Carregar posts
  const loadPosts = useCallback(async (pageNum = 0, reset = false) => {
    try {
      if (reset) {
        setLoading(true);
      }

      const newPosts = await communityService.getPosts(pageNum, 20);

      if (reset) {
        setPosts(newPosts);
      } else {
        setPosts((prev) => [...prev, ...newPosts]);
      }

      setHasMore(newPosts.length === 20);
      setPage(pageNum);
    } catch (error) {
      logger.error('[CommunityScreen] Erro ao carregar posts', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Carregar posts iniciais
  useEffect(() => {
    loadPosts(0, true);
  }, [loadPosts]);

  // Refresh
  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadPosts(0, true);
  }, [loadPosts]);

  // Load more
  const handleLoadMore = useCallback(() => {
    if (!loading && hasMore && !refreshing) {
      loadPosts(page + 1, false);
    }
  }, [loading, hasMore, refreshing, page, loadPosts]);

  const handleFilterPress = (filter: FilterType) => {
    triggerPlatformHaptic('selection');
    setSelectedFilter(filter);
    // TODO: Filtrar posts por categoria quando backend suportar
    logger.info('[CommunityScreen] Filter changed', { filter });
  };

  const handleCreatePost = () => {
    triggerPlatformHaptic('buttonPress');
    logger.info('[CommunityScreen] Criar Post pressionado');
    setIsCreateModalOpen(true);
  };

  const handleCreatePostSubmit = useCallback(
    async (postData: {
      title?: string;
      content: string;
      category?: string;
      is_anonymous?: boolean;
      image_url?: string;
    }) => {
      try {
        // TODO: Adicionar suporte a title, category, is_anonymous no communityService
        // Por enquanto, usando apenas content e image_url
        const result = await communityService.createPost({
          content: postData.content,
          image_uri: postData.image_url,
          // tags: postData.category ? [postData.category] : undefined, // Usar tags como categoria temporariamente
        });

        if (result) {
          logger.info('[CommunityScreen] Post criado com sucesso', { postId: result.id });
          // Recarregar posts
          await loadPosts(0, true);
          setIsCreateModalOpen(false);
          triggerPlatformHaptic('success');
        } else {
          logger.error('[CommunityScreen] Erro ao criar post');
          triggerPlatformHaptic('error');
        }
      } catch (error) {
        logger.error('[CommunityScreen] Erro ao criar post', error);
        triggerPlatformHaptic('error');
      }
    },
    [loadPosts]
  );

  const handleViewFeed = () => {
    triggerPlatformHaptic('buttonPress');
    logger.info('[CommunityScreen] Ver Feed pressionado');
    // Scroll para o topo (se houver ref do ScrollView)
  };

  const handleToggleLike = useCallback(
    async (postId: string) => {
      if (likingPostId) return;

      triggerPlatformHaptic('buttonPress');
      setLikingPostId(postId);

      try {
        const newLikedState = await communityService.togglePostLike(postId);

        // Atualizar estado local
        setPosts((prev) =>
          prev.map((post) =>
            post.id === postId
              ? {
                  ...post,
                  is_liked_by_user: newLikedState,
                  likes_count: newLikedState
                    ? (post.likes_count || 0) + 1
                    : Math.max(0, (post.likes_count || 0) - 1),
                }
              : post
          )
        );

        logger.info('[CommunityScreen] Like toggled', { postId, liked: newLikedState });
      } catch (error) {
        logger.error('[CommunityScreen] Erro ao curtir post', error);
      } finally {
        setLikingPostId(null);
      }
    },
    [likingPostId]
  );

  const handleCommentPost = (postId: string) => {
    triggerPlatformHaptic('buttonPress');
    logger.info('[CommunityScreen] Comentários pressionado', { postId });
    // TODO: Navegar para tela de comentários quando disponível
  };

  const handlePostMenu = (postId: string) => {
    triggerPlatformHaptic('buttonPress');
    logger.info('[CommunityScreen] Menu do post pressionado', { postId });
    // TODO: Mostrar menu de opções (editar, deletar, reportar)
  };

  // Filtrar posts (temporário, até backend suportar)
  const filteredPosts = posts; // TODO: Filtrar por selectedFilter quando backend suportar

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background.canvas }}
      edges={['top']}
      accessible={false}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: Spacing['20'] }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primary.main} />
        }
      >
        {/* Header Section */}
        <Box
          bg="card"
          px="4"
          pt="4"
          pb="6"
          style={{
            borderBottomWidth: 1,
            borderBottomColor: colors.border.light,
          }}
        >
          {/* Avatar + Info */}
          <Box direction="row" align="center" gap="3" mb="4">
            <Avatar
              size={64}
              source={{ uri: 'https://i.imgur.com/OLdeyD6.jpg' }}
              fallback="MV"
              borderWidth={2}
              borderColor={colors.secondary.main}
              useGradientFallback={true}
            />
            <Box flex={1}>
              <View
                style={{
                  backgroundColor: `${ColorTokens.primary[500]}33`,
                  paddingHorizontal: Spacing['2.5'],
                  paddingVertical: Spacing['1'],
                  borderRadius: Radius.full,
                  marginBottom: Spacing['2'],
                  alignSelf: 'flex-start',
                }}
              >
                <Text size="xs" weight="semibold" style={{ color: colors.primary.main }}>
                  ✨ MÃESVALENTES
                </Text>
              </View>
              <Text size="2xl" weight="bold" style={{ marginBottom: Spacing['0.5'] }}>
                Comunidade
              </Text>
              <Text size="sm" color="tertiary">
                Mãe ajuda mãe 💜
              </Text>
            </Box>
            <ThemeToggle variant="outline" />
          </Box>

          {/* Botões de Ação */}
          <Box direction="row" gap="2">
            <TouchableOpacity
              onPress={handleCreatePost}
              activeOpacity={0.8}
              style={{
                flex: 1,
                backgroundColor: colors.primary.main,
                minHeight: Tokens.touchTargets.min,
                paddingVertical: Spacing['3'],
                paddingHorizontal: Spacing['4'],
                borderRadius: Radius.xl,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: Spacing['2'],
              }}
              accessibilityRole="button"
              accessibilityLabel="Criar Post"
              accessibilityHint="Toque para criar um novo post na comunidade"
            >
              <Plus size={16} color={ColorTokens.neutral[0]} />
              <Text size="sm" weight="semibold" style={{ color: ColorTokens.neutral[0] }}>
                Criar Post
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleViewFeed}
              activeOpacity={0.8}
              style={{
                backgroundColor: 'transparent',
                borderWidth: 1,
                borderColor: colors.secondary.main,
                minHeight: Tokens.touchTargets.min,
                paddingVertical: Spacing['3'],
                paddingHorizontal: Spacing['4'],
                borderRadius: Radius.xl,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: Spacing['2'],
              }}
              accessibilityRole="button"
              accessibilityLabel="Ver Feed"
              accessibilityHint="Toque para ver o feed completo da comunidade"
            >
              <Grid size={16} color={colors.secondary.main} />
              <Text size="sm" weight="semibold" style={{ color: colors.secondary.main }}>
                Ver Feed
              </Text>
            </TouchableOpacity>
          </Box>
        </Box>

        {/* Categories */}
        <Box px="4" pt="4" pb="2">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: Spacing['2'] }}
          >
            {filters.map((category) => (
              <TouchableOpacity
                key={category}
                onPress={() => handleFilterPress(category)}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel={`Filtrar por ${category}`}
                accessibilityState={{ selected: selectedFilter === category }}
                style={{
                  paddingHorizontal: Spacing['4'],
                  paddingVertical: Spacing['2'],
                  borderRadius: Radius.full,
                  backgroundColor:
                    selectedFilter === category
                      ? colors.primary.main
                      : isDark
                        ? ColorTokens.neutral[800]
                        : ColorTokens.neutral[100],
                  borderWidth: selectedFilter === category ? 0 : 1,
                  borderColor: colors.border.medium,
                }}
              >
                <Text
                  size="sm"
                  weight={selectedFilter === category ? 'semibold' : 'medium'}
                  style={{
                    color:
                      selectedFilter === category ? ColorTokens.neutral[0] : colors.text.primary,
                  }}
                >
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Box>

        {/* Loading State */}
        {loading && posts.length === 0 && (
          <Box py="12" align="center">
            <ActivityIndicator size="large" color={colors.primary.main} />
            <Text size="sm" color="secondary" style={{ marginTop: Spacing['3'] }}>
              Carregando posts...
            </Text>
          </Box>
        )}

        {/* Empty State */}
        {!loading && posts.length === 0 && (
          <Box py="12" align="center" px="4">
            <Box
              p="5"
              rounded="full"
              style={{
                backgroundColor: isDark ? ColorTokens.secondary[900] : ColorTokens.secondary[100],
                marginBottom: Spacing['4'],
              }}
            >
              <Users size={40} color={colors.secondary.main} />
            </Box>
            <Text size="lg" weight="bold" style={{ color: colors.text.primary, marginBottom: Spacing['2'] }}>
              Nenhum post ainda
            </Text>
            <Text size="sm" color="secondary" style={{ marginBottom: Spacing['4'], textAlign: 'center' }}>
              Seja a primeira a compartilhar algo com a comunidade!
            </Text>
            <TouchableOpacity
              onPress={handleCreatePost}
              activeOpacity={0.8}
              style={{
                backgroundColor: colors.primary.main,
                paddingVertical: Spacing['3'],
                paddingHorizontal: Spacing['6'],
                borderRadius: Radius.xl,
                flexDirection: 'row',
                alignItems: 'center',
                gap: Spacing['2'],
              }}
              accessibilityRole="button"
              accessibilityLabel="Criar primeiro post"
            >
              <Plus size={16} color={ColorTokens.neutral[0]} />
              <Text size="sm" weight="semibold" style={{ color: ColorTokens.neutral[0] }}>
                Criar primeiro post
              </Text>
            </TouchableOpacity>
          </Box>
        )}

        {/* Lista de Posts */}
        {!loading && posts.length > 0 && (
          <Box pt="4" px="4">
            {filteredPosts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                isLiking={likingPostId === post.id}
                onLike={handleToggleLike}
                onComment={handleCommentPost}
                onMenu={handlePostMenu}
              />
            ))}

            {/* Load More Indicator */}
            {hasMore && (
              <Box py="4" align="center">
                <ActivityIndicator size="small" color={colors.primary.main} />
              </Box>
            )}
          </Box>
        )}
      </ScrollView>

      {/* Modal Criar Post */}
      <CreatePostModal
        visible={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreatePost={handleCreatePostSubmit}
      />
    </SafeAreaView>
  );
}
