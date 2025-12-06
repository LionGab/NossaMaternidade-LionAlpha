/**
 * MundoNathScreen - Tela de conteúdo exclusivo da Nathália
 * Design baseado no Content.tsx do app-redesign-studio-ab40635e/src/pages/Content.tsx
 * Refatorado para usar componentes separados de src/components/mundo-nath/
 */

import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { Play, Sparkles } from 'lucide-react-native';
import React, { useRef, useEffect } from 'react';
import { View, ScrollView, Animated, Easing } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { Avatar } from '@/components/Avatar';
import { Badge } from '@/components/Badge';
import { Box } from '@/components/atoms/Box';
import { Button } from '@/components/atoms/Button';
import { Text } from '@/components/atoms/Text';
import { ThemeToggle } from '@/components/ThemeToggle';
import {
  FeaturedVideo,
  ContentCategorySection,
  ForYouSection,
} from '@/components/mundo-nath';
import type { RootStackParamList } from '@/navigation/types';
import { useTheme } from '@/theme';
import { Tokens, ColorTokens, Spacing, Radius } from '@/theme/tokens';
import { logger } from '@/utils/logger';
import type { ContentItem } from '@/types/content';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

// Gradiente sunrise (laranja/rosa suave) - usando ColorTokens
const getSunriseGradient = (isDark: boolean) => {
  if (isDark) {
    return [
      ColorTokens.warning[800],
      ColorTokens.warning[700],
      ColorTokens.warning[600],
      ColorTokens.warning[500],
    ] as const;
  }
  return [
    ColorTokens.warning[100],
    ColorTokens.warning[200],
    ColorTokens.warning[300],
    ColorTokens.warning[400],
  ] as const;
};

// Hook para animações escalonadas
function useStaggeredAnimations(itemCount: number, baseDelay = 100) {
  const animations = useRef(
    Array.from({ length: itemCount }, () => ({
      opacity: new Animated.Value(0),
      translateY: new Animated.Value(30),
    }))
  ).current;

  useEffect(() => {
    const staggeredAnimations = animations.map((anim, index) =>
      Animated.parallel([
        Animated.timing(anim.opacity, {
          toValue: 1,
          duration: 500,
          delay: index * baseDelay,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(anim.translateY, {
          toValue: 0,
          duration: 600,
          delay: index * baseDelay,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ])
    );

    Animated.stagger(baseDelay, staggeredAnimations).start();
  }, [animations, baseDelay]);

  return animations;
}

// Mock data para conteúdo
const MOCK_CONTENT_ITEMS: ContentItem[] = [
  {
    id: 'content-1',
    title: 'Como lidar com os primeiros dias',
    description:
      'Dicas práticas para atravessar os momentos mais desafiadores da maternidade inicial.',
    type: 'article',
    category: 'pos_parto',
    duration: '5 min',
    views: 1234,
  },
  {
    id: 'content-2',
    title: 'Meditação para noites difíceis',
    description:
      'Um momento de paz para quando tudo parecer demais. Respire fundo e se permita sentir.',
    type: 'audio',
    category: 'saude_mental',
    duration: '8 min',
    views: 987,
  },
];

export default function MundoNathScreen() {
  const { colors, isDark } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();
  const SUNRISE_GRADIENT = getSunriseGradient(isDark);

  // Animações: header (0), featured card (1), featured video (2), section header (3)
  const animations = useStaggeredAnimations(4, 120);

  // Animação do avatar (scale + fade)
  const avatarScale = useRef(new Animated.Value(0)).current;
  const avatarOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(avatarScale, {
        toValue: 1,
        delay: 200,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(avatarOpacity, {
        toValue: 1,
        duration: 400,
        delay: 200,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [avatarScale, avatarOpacity]);

  const handleContentPress = (itemId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    logger.info('Content pressed', { itemId, screen: 'MundoNathScreen' });
    // TODO: Navegar para tela de detalhes quando disponível
    // navigation.navigate('ContentDetail', { contentId: itemId });
  };

  const handleRitualPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    navigation.navigate('Ritual');
  };

  const handleVideoPlay = () => {
    logger.info('Featured video played', { screen: 'MundoNathScreen' });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.canvas }} edges={['top']}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: Tokens.spacing['10'] }}
      >
        {/* Header com gradiente sunrise */}
        <View style={{ position: 'relative', overflow: 'hidden' }}>
          <LinearGradient
            colors={SUNRISE_GRADIENT}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              paddingTop: insets.top + Spacing['4'],
              paddingBottom: Spacing['8'],
              paddingHorizontal: Spacing['4'],
              opacity: 0.8,
            }}
          >
            {/* Theme Toggle */}
            <View
              style={{
                position: 'absolute',
                top: insets.top + Spacing['4'],
                right: Spacing['4'],
                zIndex: 10,
              }}
            >
              <ThemeToggle variant="outline" iconColor={ColorTokens.neutral[900]} />
            </View>

            {/* Avatar da Nathália - Animado */}
            <Animated.View
              style={{
                alignItems: 'center',
                marginTop: Spacing['4'],
                opacity: avatarOpacity,
                transform: [{ scale: avatarScale }],
              }}
            >
              <Avatar
                size={80}
                source={{ uri: 'https://i.imgur.com/tNIrNIs.jpg' }}
                fallback="NV"
                borderWidth={3}
                borderColor={ColorTokens.overlay.light}
                style={{
                  backgroundColor: ColorTokens.overlay.light,
                }}
              />
            </Animated.View>

            {/* Título e subtítulo - Animado */}
            <Animated.View
              style={{
                alignItems: 'center',
                marginTop: Spacing['4'],
                opacity: animations[0].opacity,
                transform: [{ translateY: animations[0].translateY }],
              }}
            >
              <Text
                className="text-3xl font-bold mb-2"
                style={{
                  color: ColorTokens.neutral[900],
                }}
              >
                Mundo Naty
              </Text>
              <Text
                className="text-sm"
                style={{
                  color: ColorTokens.neutral[700],
                }}
              >
                Olá, Hi! Conteúdo exclusivo pra você ✨
              </Text>
            </Animated.View>
          </LinearGradient>
        </View>

        {/* Content */}
        <Box className="px-4" style={{ gap: Spacing['6'], marginTop: -Spacing['6'] }}>
          {/* Featured Card - Ritual de 3 Minutos - Animado */}
          <Animated.View
            style={{
              borderRadius: Radius['3xl'],
              overflow: 'hidden',
              ...Tokens.shadows.card,
              opacity: animations[1].opacity,
              transform: [{ translateY: animations[1].translateY }],
            }}
          >
            <LinearGradient
              colors={isDark ? ColorTokens.nathIA.gradient.dark : ColorTokens.nathIA.gradient.light}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                padding: Spacing['6'],
                gap: Spacing['4'],
                opacity: 0.95,
              }}
            >
              <Badge
                variant="warning"
                containerStyle={{
                  alignSelf: 'flex-start',
                }}
              >
                ⭐ NOVO
              </Badge>

              <Text
                className="text-2xl font-bold"
                style={{
                  color: ColorTokens.neutral[0],
                  lineHeight: 28,
                }}
              >
                Ritual de 3 Minutos
              </Text>

              <Text
                className="text-sm"
                style={{
                  color: `${ColorTokens.neutral[0]}E6`, // 90% opacity
                }}
              >
                Reconecte-se com você antes de começar o caos do dia.
              </Text>

              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: Spacing['3'],
                }}
              >
                <Button
                  title="Começar Agora"
                  onPress={handleRitualPress}
                  leftIcon={<Play size={16} color={colors.primary.main} />}
                  className="flex-1 bg-white rounded-xl px-6 py-3"
                  textClassName="text-primary font-semibold text-lg"
                />
              </View>
            </LinearGradient>
          </Animated.View>

          {/* Vídeo Especial em Destaque - Animado */}
          <Animated.View
            style={{
              opacity: animations[2].opacity,
              transform: [{ translateY: animations[2].translateY }],
            }}
          >
            <FeaturedVideo
              videoId="riVUidsF2qo"
              title="O Vídeo que Marcou o Coração de Muitas Mães"
              description="Um conteúdo que tocou profundamente milhares de mães. Uma experiência emocional única e transformadora."
              viewsCount={10000}
              rating={4.9}
              duration={15}
              onPlay={handleVideoPlay}
            />
          </Animated.View>

          {/* Seção: Para Você - Usando ContentCategorySection - Animado */}
          <Animated.View
            style={{
              opacity: animations[3].opacity,
              transform: [{ translateY: animations[3].translateY }],
            }}
          >
            <ContentCategorySection
              title="Para Você"
              subtitle="Conteúdo selecionado especialmente"
              icon={<Sparkles size={20} color={colors.primary.main} />}
              items={MOCK_CONTENT_ITEMS}
              onItemPress={(item) => handleContentPress(item.id)}
              onSeeAllPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                logger.info('See all pressed', { screen: 'MundoNathScreen' });
              }}
            />
          </Animated.View>

          {/* Seção: ForYouSection (personalizada com IA) */}
          <ForYouSection
            onItemPress={(item) => handleContentPress(item.id)}
            onSeeAllPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              logger.info('See all personalized pressed', { screen: 'MundoNathScreen' });
            }}
          />
        </Box>
      </ScrollView>
    </SafeAreaView>
  );
}
