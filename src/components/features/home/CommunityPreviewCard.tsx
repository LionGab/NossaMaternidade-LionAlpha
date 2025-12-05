/**
 * CommunityPreviewCard - Preview de post da comunidade
 * Design inspirado no screenshot - Post com avatar + texto emocional
 */

import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { Heart, MessageCircle, Users, ArrowRight } from 'lucide-react-native';
import React, { useRef } from 'react';
import { View, TouchableOpacity, Animated } from 'react-native';

import { Box } from '@/components/atoms/Box';
import { Text } from '@/components/atoms/Text';
import type { MainTabParamList, RootStackParamList } from '@/navigation/types';
import { useTheme } from '@/theme';
import { Tokens, ColorTokens } from '@/theme/tokens';

type NavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Home'>,
  NativeStackNavigationProp<RootStackParamList>
>;

export interface CommunityPost {
  id: string;
  authorName: string;
  authorAvatar?: string;
  timeAgo: string;
  title: string;
  excerpt: string;
  likesCount: number;
  commentsCount: number;
  isLiked?: boolean;
}

export interface CommunityPreviewCardProps {
  /** Post em destaque */
  post: CommunityPost;
  /** Callback ao pressionar */
  onPress?: () => void;
  /** Callback ao curtir */
  onLike?: (postId: string) => void;
}

export function CommunityPreviewCard({ post, onPress, onLike }: CommunityPreviewCardProps) {
  const { colors, isDark } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const heartAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      useNativeDriver: true,
      damping: 15,
      stiffness: 300,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      damping: 15,
      stiffness: 300,
    }).start();
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (onPress) {
      onPress();
    } else {
      navigation.navigate('MaesValentes');
    }
  };

  const handleLike = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Animação de coração
    Animated.sequence([
      Animated.timing(heartAnim, {
        toValue: 1.3,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(heartAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    onLike?.(post.id);
  };

  // Avatar padrão
  const defaultAvatar = 'https://i.imgur.com/WxNkK7J.png';

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
        accessibilityRole="button"
        accessibilityLabel={`Post de ${post.authorName}: ${post.title}`}
        accessibilityHint="Toque para ver o post completo na comunidade"
      >
        <Box
          style={{
            backgroundColor: isDark ? ColorTokens.neutral[900] : colors.background.card,
            borderRadius: Tokens.radius['2xl'],
            padding: Tokens.spacing['4'],
            borderWidth: 1,
            borderColor: isDark ? ColorTokens.neutral[800] : colors.border.light,
            ...Tokens.shadows.md,
          }}
        >
          {/* Header: Comunidade label + Ver mais */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: Tokens.spacing['3'],
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: Tokens.spacing['2'],
              }}
            >
              <Users
                size={14}
                color={isDark ? ColorTokens.primary[500] : ColorTokens.primary[500]}
              />
              <Text
                size="xs"
                weight="bold"
                style={{
                  color: isDark ? ColorTokens.primary[500] : ColorTokens.primary[500],
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                }}
              >
                Comunidade
              </Text>
            </View>

            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: Tokens.spacing['1'],
              }}
            >
              <Text
                size="xs"
                weight="semibold"
                style={{
                  color: colors.text.secondary,
                }}
              >
                Ver mais
              </Text>
              <ArrowRight size={12} color={colors.text.secondary} />
            </View>
          </View>

          {/* Autor: Avatar + Nome + Tempo - Espaçamento perfeito */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: Tokens.spacing['4'],
              paddingBottom: Tokens.spacing['2'],
            }}
          >
            <View
              style={{
                width: 36,
                height: 36,
                borderRadius: Tokens.radius.full,
                overflow: 'hidden',
                marginRight: Tokens.spacing['3'],
                borderWidth: 2,
                borderColor: isDark ? ColorTokens.primary[500] : ColorTokens.primary[200],
              }}
            >
              <Image
                source={{ uri: post.authorAvatar || defaultAvatar }}
                style={{ width: '100%', height: '100%' }}
                contentFit="cover"
                transition={200}
                cachePolicy="memory-disk"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                size="sm"
                weight="bold"
                color="primary"
                style={{
                  marginBottom: Tokens.spacing['1'],
                }}
              >
                {post.authorName}
              </Text>
              <Text size="xs" color="secondary">
                {post.timeAgo}
              </Text>
            </View>
          </View>

          {/* Título do post - Espaçamento perfeito */}
          <Text
            size="md"
            weight="bold"
            color="primary"
            style={{
              marginBottom: Tokens.spacing['4'],
              lineHeight: 24,
              letterSpacing: 0.3,
            }}
            numberOfLines={2}
          >
            {post.title}
          </Text>

          {/* Excerpt/Preview do texto - Espaçamento perfeito */}
          <Text
            size="sm"
            color="secondary"
            style={{
              marginBottom: Tokens.spacing['4'],
              lineHeight: 20,
              letterSpacing: 0.1,
            }}
            numberOfLines={3}
          >
            {post.excerpt}
          </Text>

          {/* Footer: Likes + Comments - Espaçamento perfeito */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: Tokens.spacing['4'],
              paddingTop: Tokens.spacing['4'],
              marginTop: Tokens.spacing['2'],
              borderTopWidth: 1,
              borderTopColor: isDark ? ColorTokens.neutral[800] : colors.border.light,
            }}
          >
            {/* Like button */}
            <TouchableOpacity
              onPress={handleLike}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: Tokens.spacing['1'],
              }}
              accessibilityRole="button"
              accessibilityLabel={`${post.likesCount} curtidas. ${post.isLiked ? 'Você curtiu' : 'Toque para curtir'}`}
              accessibilityHint="Toque para curtir este post"
            >
              <Animated.View style={{ transform: [{ scale: heartAnim }] }}>
                <Heart
                  size={18}
                  color={post.isLiked ? ColorTokens.primary[500] : colors.text.secondary}
                  fill={post.isLiked ? ColorTokens.primary[500] : 'transparent'}
                />
              </Animated.View>
              <Text
                size="sm"
                weight="semibold"
                style={{
                  color: post.isLiked ? ColorTokens.primary[500] : colors.text.secondary,
                }}
              >
                {post.likesCount}
              </Text>
            </TouchableOpacity>

            {/* Comments */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: Tokens.spacing['1'],
              }}
            >
              <MessageCircle size={18} color={colors.text.secondary} />
              <Text size="sm" weight="semibold" color="secondary">
                {post.commentsCount}
              </Text>
            </View>

            {/* Spacer + "Mãe ajuda mãe" */}
            <View style={{ flex: 1, alignItems: 'flex-end' }}>
              <Text
                size="xs"
                weight="medium"
                style={{
                  color: isDark ? ColorTokens.primary[500] : ColorTokens.primary[500],
                  fontStyle: 'italic',
                }}
              >
                Mãe ajuda mãe 💕
              </Text>
            </View>
          </View>
        </Box>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default CommunityPreviewCard;
