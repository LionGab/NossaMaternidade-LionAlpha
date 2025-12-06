/**
 * PostCard - Card de post da comunidade
 *
 * Exibe um post individual com informações do autor, conteúdo, imagem (opcional),
 * e ações (curtir, comentar).
 * Referência: app-redesign-studio-ab40635e/src/pages/Community.tsx (renderização de posts)
 * Adaptado para React Native com design system atual.
 */

import { MoreVertical, Heart, MessageCircle } from 'lucide-react-native';
import React from 'react';
import { View, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import * as Haptics from 'expo-haptics';

import { Avatar } from '@/components/Avatar';
import { Box } from '@/components/atoms/Box';
import { Text } from '@/components/atoms/Text';
import { useTheme } from '@/theme';
import { Tokens, ColorTokens } from '@/theme/tokens';
import { logger } from '@/utils/logger';
import type { CommunityPost } from '@/services/communityService';

interface PostCardProps {
  /** Dados do post */
  post: CommunityPost;
  /** Se o post está sendo curtido (loading state) */
  isLiking?: boolean;
  /** Callback quando o post é curtido */
  onLike?: (postId: string) => void;
  /** Callback quando comentários são acessados */
  onComment?: (postId: string) => void;
  /** Callback quando menu de opções é acessado */
  onMenu?: (postId: string) => void;
}

/**
 * Formata data relativa (ex: "há 2 horas", "há 3 dias")
 */
function formatRelativeTime(dateString?: string): string {
  if (!dateString) return 'Agora';
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Agora';
  if (diffMins < 60) return `${diffMins}min atrás`;
  if (diffHours < 24) return `${diffHours}h atrás`;
  if (diffDays < 7) return `${diffDays}d atrás`;
  return date.toLocaleDateString('pt-BR');
}

/**
 * Gera iniciais do nome
 */
function getInitials(name?: string): string {
  if (!name) return 'MV';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function PostCard({
  post,
  isLiking = false,
  onLike,
  onComment,
  onMenu,
}: PostCardProps) {
  const { colors, isDark } = useTheme();

  const displayName = post.author?.full_name || 'Mãe Valente';
  const initials = getInitials(displayName);
  const timeAgo = formatRelativeTime(post.created_at);
  const isLiked = post.is_liked_by_user || false;

  const handleLike = () => {
    if (isLiking) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onLike?.(post.id);
    logger.info('[PostCard] Like toggled', { postId: post.id });
  };

  const handleComment = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onComment?.(post.id);
    logger.info('[PostCard] Comments accessed', { postId: post.id });
  };

  const handleMenu = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onMenu?.(post.id);
    logger.info('[PostCard] Menu accessed', { postId: post.id });
  };

  return (
    <Box
      bg="card"
      p="5"
      mb="4"
      rounded="2xl"
      style={{
        borderWidth: 1,
        borderColor: colors.border.light,
        ...Tokens.shadows.card,
      }}
    >
      {/* Header do Post */}
      <Box direction="row" align="center" mb="4" style={{ paddingBottom: Tokens.spacing['3'] }}>
        <Avatar
          size={44}
          source={post.author?.avatar_url ? { uri: post.author.avatar_url } : undefined}
          fallback={initials}
          borderWidth={2}
          borderColor={colors.primary.main}
          style={{
            backgroundColor: colors.primary.light,
            marginRight: Tokens.spacing['3'],
          }}
        />

        <Box flex={1}>
          <Text size="sm" weight="semibold" style={{ color: colors.text.primary, marginBottom: Tokens.spacing['0.5'] }}>
            {displayName}
          </Text>
          <Text size="xs" color="tertiary">
            {timeAgo}
          </Text>
        </Box>

        <TouchableOpacity
          onPress={handleMenu}
          style={{
            minWidth: Tokens.touchTargets.min,
            minHeight: Tokens.touchTargets.min,
            alignItems: 'center',
            justifyContent: 'center',
            marginLeft: Tokens.spacing['2'],
          }}
          accessibilityRole="button"
          accessibilityLabel="Opções do post"
          accessibilityHint="Toque para ver opções do post"
        >
          <MoreVertical size={20} color={colors.text.tertiary} />
        </TouchableOpacity>
      </Box>

      {/* Conteúdo do Post */}
      {post.content && (
        <Text
          size="md"
          style={{
            color: colors.text.primary,
            marginBottom: post.image_url ? Tokens.spacing['3'] : Tokens.spacing['4'],
            lineHeight: 20,
          }}
        >
          {post.content}
        </Text>
      )}

      {/* Imagem do Post */}
      {post.image_url && (
        <Box
          mb="4"
          rounded="lg"
          style={{
            overflow: 'hidden',
            backgroundColor: colors.border.light,
          }}
        >
          <ExpoImage
            source={{ uri: post.image_url }}
            style={{
              width: '100%',
              aspectRatio: 16 / 9,
              backgroundColor: colors.border.light,
            }}
            contentFit="cover"
            transition={200}
            accessibilityLabel={`Imagem do post de ${displayName}`}
            accessibilityHint="Imagem compartilhada no post"
          />
        </Box>
      )}

      {/* Ações do Post */}
      <Box
        direction="row"
        gap="6"
        pt="4"
        style={{
          borderTopWidth: 1,
          borderTopColor: colors.border.light,
          marginTop: Tokens.spacing['2'],
        }}
      >
        <TouchableOpacity
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: Tokens.spacing['2'],
            minHeight: Tokens.touchTargets.min,
            paddingHorizontal: Tokens.spacing['2'],
          }}
          onPress={handleLike}
          disabled={isLiking}
          accessibilityRole="button"
          accessibilityLabel={`${post.likes_count || 0} curtidas. ${isLiked ? 'Você curtiu este post' : 'Toque para curtir'}`}
          accessibilityHint="Toque para curtir este post"
          accessibilityState={{ selected: isLiked, disabled: isLiking }}
        >
          {isLiking ? (
            <ActivityIndicator size="small" color={colors.status.error} />
          ) : (
            <Heart
              size={20}
              color={isLiked ? colors.status.error : colors.text.tertiary}
              fill={isLiked ? colors.status.error : 'transparent'}
            />
          )}
          <Text
            size="sm"
            weight="medium"
            style={{
              color: isLiked ? colors.status.error : colors.text.tertiary,
            }}
          >
            {post.likes_count || 0}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: Tokens.spacing['2'],
            minHeight: Tokens.touchTargets.min,
            paddingHorizontal: Tokens.spacing['2'],
          }}
          onPress={handleComment}
          accessibilityRole="button"
          accessibilityLabel={`${post.comments_count || 0} comentários`}
          accessibilityHint="Toque para ver ou adicionar comentários"
        >
          <MessageCircle size={20} color={colors.text.tertiary} />
          <Text size="sm" weight="medium" color="tertiary">
            {post.comments_count || 0}
          </Text>
        </TouchableOpacity>
      </Box>
    </Box>
  );
}

