/**
 * HomeScreen - Dashboard Principal
 *
 * Tela inicial otimizada para iOS/Android com:
 * - Performance otimizada (useCallback, componentes extraídos)
 * - Persistência de bookmarks (AsyncStorage → Supabase futuro)
 * - Error handling robusto
 * - Gradientes reduzidos de 17 para 6
 * - Navegação consistente
 * - Constantes centralizadas
 *
 * @version 4.0.0 - Production Ready
 */

import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Bookmark,
  BookmarkCheck,
  Heart,
  Info,
  Lightbulb,
  Menu,
  MessageCircle,
  Mic,
  Play,
  Sparkles,
  Zap,
} from 'lucide-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, TouchableOpacity, View, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Avatar } from '@/components/Avatar';
import { Badge } from '@/components/Badge';
import { SafeAreaContainer } from '@/components/layout/SafeAreaContainer';
import { Box } from '@/components/atoms/Box';
import { Button } from '@/components/atoms/Button';
import { Text } from '@/components/atoms/Text';
import { ThemeToggle } from '@/components/ThemeToggle';
import { DesculpaHojeCard } from '@/components/guilt';
import { SOSMaeFloatingButton } from '@/components/sos';
import { guiltService } from '@/services/guiltService';
import { bookmarkService } from '@/services/bookmarkService';
import type { MainTabParamList, RootStackParamList } from '@/navigation/types';
import { useTheme } from '@/theme';
import { getPlatformShadow } from '@/theme/platform';
import { Tokens, ColorTokens } from '@/theme/tokens';
import { logger } from '@/utils/logger';

import { IMAGES, LAYOUT, COMFORT_MESSAGES, getRandomMessage } from './HomeScreen.constants';
import { HeaderEffects, CardBlurEffect } from './HomeScreen.components';

type NavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Home'>,
  NativeStackNavigationProp<RootStackParamList>
>;

const SPECIAL_CONTENT_ID = 'featured-special-content-001';

export default function HomeScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  const [isContentSaved, setIsContentSaved] = useState(false);
  const [guiltStats, setGuiltStats] = useState<{ streakDays: number | null; error?: boolean } | null>(null);
  const [emotionLoading, setEmotionLoading] = useState(false);

  // Carregar stats de "Desculpa Hoje"
  useEffect(() => {
    const loadGuiltStats = async () => {
      try {
        const stats = await guiltService.getStats();
        if (stats) {
          setGuiltStats({ streakDays: stats.streakDays });
        } else {
          setGuiltStats({ streakDays: 0 });
        }
      } catch (error) {
        logger.error('[HomeScreen] Error loading guilt stats', error);
        setGuiltStats({ streakDays: null, error: true });
      }
    };
    loadGuiltStats();
  }, []);

  // Carregar estado de bookmark
  useEffect(() => {
    const loadBookmarkState = async () => {
      const { data, error } = await bookmarkService.isBookmarked(SPECIAL_CONTENT_ID);
      if (error) {
        logger.warn('[HomeScreen] Failed to load bookmark state', error);
        setIsContentSaved(false);
        return;
      }
      setIsContentSaved(data);
    };
    loadBookmarkState();
  }, []);

  const handleSleepCardClick = useCallback(() => {
    logger.info('Sleep card clicked', { screen: 'HomeScreen' });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const randomMessage = getRandomMessage(COMFORT_MESSAGES.sleep);
    navigation.navigate('Chat', {
      sessionId: undefined,
      comfortMessage: randomMessage,
      context: 'sleep',
    });
  }, [navigation]);

  const handleViewSpecialContent = useCallback(() => {
    logger.info('View special content clicked', { screen: 'HomeScreen' });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate('MundoNath', { specialContent: true });
  }, [navigation]);

  const handleSaveForLater = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const { data, error } = await bookmarkService.toggleBookmark({
      id: SPECIAL_CONTENT_ID,
      type: 'special',
      title: 'Conteúdo especial de hoje',
      description: 'Algo que preparamos pensando em você.',
      thumbnailUrl: undefined,
    });

    if (error) {
      logger.error('[HomeScreen] Failed to toggle bookmark', error);
      return;
    }

    setIsContentSaved(data);
    logger.info('[HomeScreen] Content bookmark toggled', { saved: data });
  }, []);

  const handleStoryClick = useCallback(() => {
    logger.info('Story card clicked', { screen: 'HomeScreen' });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const randomMessage = getRandomMessage(COMFORT_MESSAGES.story);
    navigation.navigate('Chat', {
      sessionId: undefined,
      comfortMessage: randomMessage,
      context: 'story',
    });
  }, [navigation]);

  const handleChatClick = useCallback(() => {
    logger.info('Chat clicked', { screen: 'HomeScreen' });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const randomMessage = getRandomMessage(COMFORT_MESSAGES.welcome);
    navigation.navigate('Chat', {
      sessionId: undefined,
      comfortMessage: randomMessage,
      context: 'welcome',
    });
  }, [navigation]);

  const handleMicClick = useCallback(() => {
    logger.info('Mic clicked', { screen: 'HomeScreen' });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const randomMessage = getRandomMessage(COMFORT_MESSAGES.mic);
    navigation.navigate('Chat', {
      sessionId: undefined,
      comfortMessage: randomMessage,
      context: 'welcome',
      startRecording: true,
    });
  }, [navigation]);

  const handleMoodClick = useCallback(
    async (emoji: string, label: string) => {
      try {
        setEmotionLoading(true);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

        logger.info('Mood selected', { mood: label, screen: 'HomeScreen' });

        const messages = COMFORT_MESSAGES.emotions[emoji as keyof typeof COMFORT_MESSAGES.emotions] || [
          'Estou aqui com você. Como você está se sentindo? Quer conversar sobre isso? 💙',
        ];
        const randomMessage = getRandomMessage(messages);

        navigation.navigate('Chat', {
          sessionId: undefined,
          emotion: emoji,
          emotionLabel: label,
          comfortMessage: randomMessage,
        });
      } catch (error) {
        logger.error('[HomeScreen] Failed to handle mood click', error);
      } finally {
        setEmotionLoading(false);
      }
    },
    [navigation]
  );

  // Header content (memoized via component)
  const HeaderContent = (
    <View
      style={{
        paddingTop: insets.top + LAYOUT.headerPaddingTop,
        paddingBottom: LAYOUT.headerPaddingBottom,
        paddingHorizontal: Tokens.spacing['5'],
      }}
    >
      <Box direction="row" align="center" justify="space-between" gap="4" mb="5">
        <View style={{ position: 'relative' }}>
          <Image
            source={{ uri: IMAGES.logo }}
            style={{
              width: LAYOUT.logoSize,
              height: LAYOUT.logoSize,
              borderRadius: LAYOUT.logoSize / 2,
              borderWidth: 2,
              borderColor: `${ColorTokens.info[300]}4D`,
            }}
            contentFit="cover"
          />
          <View
            style={{
              position: 'absolute',
              bottom: -2,
              right: -2,
              width: LAYOUT.statusIndicatorSize,
              height: LAYOUT.statusIndicatorSize,
              borderRadius: LAYOUT.statusIndicatorSize / 2,
              backgroundColor: ColorTokens.info[400],
              borderWidth: 2,
              borderColor: colors.background.canvas,
            }}
          />
        </View>
        <ThemeToggle />
      </Box>

      <Box gap="3">
        <Text
          variant="body"
          size="2xl"
          weight="bold"
          style={{
            color: ColorTokens.primary[500],
          }}
        >
          Olá, mãe
        </Text>
        <Text variant="body" size="sm" style={{ color: `${ColorTokens.info[700]}B3`, lineHeight: 24 }}>
          Respira um pouquinho. Estamos aqui por você.
        </Text>
      </Box>
    </View>
  );

  return (
    <SafeAreaContainer edges={['top']} backgroundColor={colors.background.canvas}>
      {/* Header otimizado */}
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 40,
          borderBottomWidth: 1,
          borderBottomColor: `${ColorTokens.info[100]}80`,
        }}
      >
        {Platform.OS === 'ios' ? (
          <BlurView
            intensity={95}
            tint={isDark ? 'dark' : 'light'}
            style={{ backgroundColor: 'transparent' }}
          >
            <LinearGradient
              colors={[
                `${ColorTokens.info[50]}E6`,
                `${ColorTokens.accent.oceanLight}CC`,
                `${ColorTokens.info[50]}E6`,
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <HeaderEffects />
              {HeaderContent}
            </LinearGradient>
          </BlurView>
        ) : (
          <LinearGradient
            colors={[
              `${ColorTokens.info[50]}E6`,
              `${ColorTokens.accent.oceanLight}CC`,
              `${ColorTokens.info[50]}E6`,
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <HeaderEffects />
            {HeaderContent}
          </LinearGradient>
        )}
      </View>

      {/* Content */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingTop: insets.top + LAYOUT.headerHeight,
          paddingBottom: insets.bottom + LAYOUT.contentPaddingBottom,
          paddingHorizontal: Tokens.spacing['6'],
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Sleep Card */}
        <TouchableOpacity
          onPress={handleSleepCardClick}
          activeOpacity={0.98}
          accessibilityRole="button"
          accessibilityLabel="Como você dormiu hoje?"
          accessibilityHint="Toque para registrar suas horas de sono de hoje"
          style={{
            marginBottom: LAYOUT.sectionSpacing,
            borderRadius: Tokens.radius['3xl'],
            overflow: 'hidden',
            borderWidth: 1,
            borderColor: `${ColorTokens.info[100]}99`,
            backgroundColor: colors.background.card,
            ...getPlatformShadow('sm'),
          }}
        >
          <View style={{ width: '100%', height: LAYOUT.sleepCardImageHeight, overflow: 'hidden' }}>
            <Image
              source={{ uri: IMAGES.sleepCard }}
              style={{ width: '100%', height: '100%' }}
              contentFit="cover"
            />
            <LinearGradient
              colors={['transparent', `${ColorTokens.info[600]}BF`, `${ColorTokens.info[500]}59`]}
              start={{ x: 0, y: 1 }}
              end={{ x: 0, y: 0 }}
              style={{ position: 'absolute', inset: 0 }}
            />
          </View>
          <View style={{ padding: Tokens.spacing['6'] }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: Tokens.spacing['2'],
                marginBottom: Tokens.spacing['4'],
              }}
            >
              <Badge
                variant="info"
                size="sm"
                containerStyle={{
                  backgroundColor: ColorTokens.info[100],
                  borderWidth: 1,
                  borderColor: ColorTokens.info[200],
                }}
              >
                <Text variant="caption" size="xs" style={{ color: ColorTokens.info[700] }}>
                  🌙 Sono
                </Text>
              </Badge>
            </View>
            <Text
              variant="body"
              size="xl"
              weight="bold"
              style={{ color: `${ColorTokens.info[900]}E6`, marginBottom: Tokens.spacing['3'] }}
            >
              Como você dormiu hoje?
            </Text>
            <Text variant="body" size="sm" style={{ color: `${ColorTokens.info[700]}B3`, lineHeight: 24 }}>
              Registre seu descanso e cuide de você
            </Text>
          </View>
        </TouchableOpacity>

        {/* Dica do Dia */}
        <View
          style={{
            backgroundColor: colors.background.card,
            borderRadius: Tokens.radius['2xl'],
            padding: Tokens.spacing['6'],
            marginBottom: LAYOUT.sectionSpacing,
            borderWidth: 1,
            borderColor: `${ColorTokens.info[100]}80`,
            ...getPlatformShadow('sm'),
          }}
        >
          <Box direction="row" align="flex-start" gap="5">
            <View
              style={{
                padding: Tokens.spacing['3'],
                borderRadius: Tokens.radius.xl,
                backgroundColor: `${ColorTokens.info[50]}FF`,
                borderWidth: 1,
                borderColor: `${ColorTokens.info[100]}80`,
              }}
            >
              <Lightbulb size={LAYOUT.iconSizeSmall} color={ColorTokens.info[600]} />
            </View>
            <Box flex={1}>
              <Box direction="row" align="center" gap="2" mb="3">
                <Text variant="body" size="lg" weight="bold" style={{ color: `${ColorTokens.info[900]}E6` }}>
                  Dica do dia
                </Text>
                <Badge
                  variant="info"
                  size="sm"
                  containerStyle={{
                    backgroundColor: ColorTokens.info[100],
                    borderWidth: 1,
                    borderColor: ColorTokens.info[200],
                  }}
                >
                  <Text variant="caption" size="xs" style={{ color: ColorTokens.info[700] }}>
                    Novo
                  </Text>
                </Badge>
              </Box>
              <Text
                variant="body"
                size="sm"
                style={{
                  color: `${ColorTokens.info[700]}B3`,
                  lineHeight: 24,
                  marginBottom: Tokens.spacing['5'],
                }}
              >
                Respire fundo por 30 segundos. Isso ajuda a acalmar o sistema nervoso e traz clareza mental.
              </Text>
              <Button
                title="Saiba mais"
                onPress={() => navigation.navigate('Ritual')}
                leftIcon={<Info size={14} color={ColorTokens.info[700]} />}
                variant="outline"
                size="sm"
                className="border-blue-200/50 bg-transparent"
                textClassName="text-blue-700 text-xs"
              />
            </Box>
          </Box>
        </View>

        {/* Desculpa Hoje Card */}
        <DesculpaHojeCard streakDays={guiltStats?.streakDays ?? null} />

        {/* Featured Content */}
        <Box mb="8">
          <Box direction="row" align="center" gap="4" mb="6">
            <View
              style={{
                padding: Tokens.spacing['3'],
                borderRadius: Tokens.radius.xl,
                backgroundColor: `${ColorTokens.info[50]}FF`,
                borderWidth: 1,
                borderColor: `${ColorTokens.info[100]}80`,
              }}
            >
              <Sparkles size={LAYOUT.iconSizeSmall} color={ColorTokens.info[600]} />
            </View>
            <Box flex={1}>
              <Text
                variant="body"
                size="2xl"
                weight="bold"
                style={{
                  color: ColorTokens.info[600],
                }}
              >
                Destaques de hoje
              </Text>
              <Text
                variant="caption"
                size="xs"
                style={{ color: `${ColorTokens.info[600]}99`, marginTop: Tokens.spacing['1.5'] }}
              >
                Selecionados especialmente para você
              </Text>
            </Box>
          </Box>

          <Box gap="6">
            {/* Conteúdo especial */}
            <View
              style={{
                backgroundColor: colors.background.card,
                borderRadius: Tokens.radius['3xl'],
                padding: Tokens.spacing['6'],
                borderWidth: 1,
                borderColor: `${ColorTokens.info[100]}80`,
                ...getPlatformShadow('sm'),
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <CardBlurEffect position="top-right" color={`${ColorTokens.info[100]}33`} />

              <Box gap="5">
                <Box direction="row" gap="6">
                  <View
                    style={{
                      width: LAYOUT.iconContainerSize,
                      height: LAYOUT.iconContainerSize,
                      borderRadius: Tokens.radius['2xl'],
                      backgroundColor: `${ColorTokens.info[50]}FF`,
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderWidth: 1,
                      borderColor: `${ColorTokens.info[100]}80`,
                    }}
                  >
                    <Play
                      size={LAYOUT.iconSize}
                      color={ColorTokens.info[600]}
                      fill={ColorTokens.info[600]}
                    />
                  </View>
                  <Box flex={1}>
                    <Box direction="row" align="center" gap="3" mb="4" style={{ flexWrap: 'wrap' }}>
                      <Badge
                        variant="success"
                        size="sm"
                        containerStyle={{
                          backgroundColor: ColorTokens.success[500],
                          borderWidth: 0,
                        }}
                      >
                        <Text variant="caption" size="xs" color="inverse" weight="bold">
                          ⭐ NOVO
                        </Text>
                      </Badge>
                      <Badge
                        variant="info"
                        size="sm"
                        containerStyle={{
                          backgroundColor: ColorTokens.info[100],
                          borderWidth: 1,
                          borderColor: ColorTokens.info[200],
                        }}
                      >
                        <Text variant="caption" size="xs" style={{ color: ColorTokens.info[700] }}>
                          📹 Vídeo
                        </Text>
                      </Badge>
                    </Box>
                    <Text
                      variant="body"
                      size="xl"
                      weight="bold"
                      style={{ color: `${ColorTokens.info[900]}E6`, marginBottom: Tokens.spacing['3'] }}
                    >
                      Conteúdo especial de hoje
                    </Text>
                    <Text
                      variant="body"
                      size="sm"
                      style={{
                        color: `${ColorTokens.info[700]}B3`,
                        marginBottom: Tokens.spacing['3'],
                        lineHeight: 24,
                      }}
                    >
                      Algo que preparamos pensando em você.
                    </Text>
                    <Text
                      variant="caption"
                      size="xs"
                      style={{ color: `${ColorTokens.info[600]}99`, fontStyle: 'italic' }}
                    >
                      Feito com carinho para este momento 💙
                    </Text>
                  </Box>
                </Box>

                <Box direction="row" gap="4" pt="2">
                  <Button
                    title="Ver agora"
                    onPress={handleViewSpecialContent}
                    leftIcon={
                      <Play size={16} color={ColorTokens.neutral[0]} fill={ColorTokens.neutral[0]} />
                    }
                    className="flex-1 bg-gradient-to-r from-blue-500 via-sky-500 to-blue-600 rounded-2xl font-semibold h-12 shadow-md"
                    textClassName="text-white text-sm font-semibold"
                  />
                  <Button
                    title={isContentSaved ? 'Guardado' : 'Guardar'}
                    onPress={handleSaveForLater}
                    leftIcon={
                      isContentSaved ? (
                        <BookmarkCheck size={16} color={ColorTokens.info[700]} />
                      ) : (
                        <Bookmark size={16} color={ColorTokens.info[700]} />
                      )
                    }
                    variant="outline"
                    size="lg"
                    className="flex-1 rounded-2xl border-blue-200/50 bg-transparent"
                    textClassName="text-blue-700 text-sm font-semibold"
                  />
                </Box>
              </Box>
            </View>

            {/* Story Card */}
            <TouchableOpacity
              onPress={handleStoryClick}
              activeOpacity={0.98}
              accessibilityRole="button"
              accessibilityLabel="História que tocou muitas mães"
              accessibilityHint="Toque para ver a história completa"
              style={{
                backgroundColor: colors.background.card,
                borderRadius: Tokens.radius['3xl'],
                padding: Tokens.spacing['6'],
                borderWidth: 1,
                borderColor: `${ColorTokens.info[100]}80`,
                ...getPlatformShadow('sm'),
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <CardBlurEffect position="top-left" color={`${ColorTokens.info[100]}26`} />

              <Box direction="row" gap="6">
                <View
                  style={{
                    width: LAYOUT.iconContainerSize,
                    height: LAYOUT.iconContainerSize,
                    borderRadius: Tokens.radius['2xl'],
                    backgroundColor: `${ColorTokens.info[50]}FF`,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderWidth: 1,
                    borderColor: `${ColorTokens.info[100]}80`,
                  }}
                >
                  <Heart size={LAYOUT.iconSize} color={ColorTokens.info[600]} fill={ColorTokens.info[400]} />
                </View>
                <Box flex={1}>
                  <Box direction="row" align="center" gap="3" mb="4">
                    <Badge
                      variant="info"
                      size="sm"
                      containerStyle={{
                        backgroundColor: ColorTokens.info[500],
                        borderWidth: 0,
                      }}
                    >
                      <Text variant="caption" size="xs" color="inverse" weight="bold">
                        💙 História real
                      </Text>
                    </Badge>
                  </Box>
                  <Text
                    variant="body"
                    size="xl"
                    weight="bold"
                    style={{ color: `${ColorTokens.info[900]}E6`, marginBottom: Tokens.spacing['3'] }}
                  >
                    História que tocou muitas mães
                  </Text>
                  <Text
                    variant="body"
                    size="sm"
                    style={{
                      color: `${ColorTokens.info[700]}B3`,
                      marginBottom: Tokens.spacing['3'],
                      lineHeight: 24,
                    }}
                  >
                    Uma jornada de amor e superação
                  </Text>
                  <Text
                    variant="caption"
                    size="xs"
                    style={{
                      color: `${ColorTokens.info[600]}99`,
                      fontStyle: 'italic',
                      marginBottom: Tokens.spacing['4'],
                    }}
                  >
                    Mais de mil mães se identificaram
                  </Text>
                  <Box direction="row" align="center" gap="2">
                    <Heart size={16} color={ColorTokens.info[500]} fill={ColorTokens.info[500]} />
                    <Text variant="caption" size="xs" weight="semibold" style={{ color: ColorTokens.info[700] }}>
                      1.234 mães
                    </Text>
                  </Box>
                </Box>
              </Box>
            </TouchableOpacity>
          </Box>
        </Box>

        {/* Chat with NathIA */}
        <TouchableOpacity
          onPress={handleChatClick}
          activeOpacity={0.98}
          accessibilityRole="button"
          accessibilityLabel="Converse com a NathIA"
          accessibilityHint="Abre o chat com a assistente virtual NathIA"
          style={{
            marginBottom: LAYOUT.sectionSpacing,
            borderRadius: Tokens.radius['3xl'],
            overflow: 'hidden',
            borderWidth: 2,
            borderColor: `${ColorTokens.primary[200]}80`,
            ...getPlatformShadow('md'),
            position: 'relative',
          }}
        >
          <LinearGradient
            colors={[
              `${ColorTokens.primary[50]}4D`,
              `${ColorTokens.accent.oceanLight}66`,
              `${ColorTokens.primary[50]}4D`,
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ position: 'absolute', inset: 0 }}
          />

          <CardBlurEffect position="top-right" color={`${ColorTokens.primary[200]}26`} size={224} />
          <CardBlurEffect position="bottom-right" color={`${ColorTokens.info[200]}1F`} size={176} />

          <View style={{ padding: Tokens.spacing['6'], position: 'relative' }}>
            <Box direction="row" align="center" justify="space-between" gap="4" mb="5">
              <Box direction="row" align="center" gap="4" flex={1}>
                <View style={{ position: 'relative' }}>
                  <Avatar
                    size={LAYOUT.avatarSize}
                    source={{ uri: IMAGES.nathiaAvatar }}
                    name="NathIA"
                    fallback="N"
                    borderWidth={2}
                    borderColor={`${ColorTokens.primary[300]}4D`}
                    useGradientFallback
                  />
                  <View
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      right: 0,
                      width: LAYOUT.statusIndicatorSmall,
                      height: LAYOUT.statusIndicatorSmall,
                      borderRadius: LAYOUT.statusIndicatorSmall / 2,
                      backgroundColor: ColorTokens.primary[400],
                      borderWidth: 2,
                      borderColor: colors.background.canvas,
                    }}
                  />
                </View>

                <Box flex={1} gap="2">
                  <Text
                    variant="body"
                    size="2xl"
                    weight="bold"
                    style={{
                      color: ColorTokens.primary[600],
                    }}
                  >
                    Converse com a NathIA
                  </Text>
                  <Badge
                    variant="primary"
                    size="sm"
                    containerStyle={{
                      backgroundColor: ColorTokens.primary[500],
                      borderWidth: 0,
                    }}
                  >
                    <MessageCircle size={10} color={ColorTokens.neutral[0]} />
                    <Text variant="caption" size="xs" color="inverse" style={{ marginLeft: 6 }}>
                      ONLINE
                    </Text>
                  </Badge>
                </Box>
              </Box>

              <Button
                title=""
                onPress={handleMicClick}
                leftIcon={<Mic size={16} color={ColorTokens.primary[600]} />}
                variant="ghost"
                size="md"
                className="rounded-xl border-pink-200/50 bg-background/50 h-10 w-10"
              />
            </Box>

            <Text
              variant="body"
              size="sm"
              weight="medium"
              style={{
                color: `${ColorTokens.primary[700]}CC`,
                lineHeight: 24,
                textAlign: 'center',
                marginBottom: Tokens.spacing['5'],
              }}
            >
              Apoio imediato, sem julgamentos. Estou aqui para você 💖
            </Text>

            <Box direction="row" align="center" justify="center" gap="3" mb="5">
              <Badge
                variant="default"
                size="sm"
                containerStyle={{
                  backgroundColor: ColorTokens.primary[100],
                  borderWidth: 1,
                  borderColor: ColorTokens.primary[200],
                }}
              >
                <Zap size={14} color={ColorTokens.primary[700]} />
                <Text
                  variant="caption"
                  size="xs"
                  weight="semibold"
                  style={{ color: ColorTokens.primary[700], marginLeft: 6 }}
                >
                  Rápido
                </Text>
              </Badge>
              <Badge
                variant="default"
                size="sm"
                containerStyle={{
                  backgroundColor: ColorTokens.primary[100],
                  borderWidth: 1,
                  borderColor: ColorTokens.primary[200],
                }}
              >
                <MessageCircle size={14} color={ColorTokens.primary[700]} />
                <Text
                  variant="caption"
                  size="xs"
                  weight="semibold"
                  style={{ color: ColorTokens.primary[700], marginLeft: 6 }}
                >
                  24/7
                </Text>
              </Badge>
            </Box>

            <Box direction="row" align="center" gap="3">
              <Button
                title="Histórico"
                onPress={() => navigation.navigate('ChatSessions')}
                leftIcon={<Menu size={16} color={ColorTokens.primary[700]} />}
                variant="outline"
                size="lg"
                className="flex-1 border-pink-200/50 bg-card rounded-xl"
                textClassName="text-pink-700 text-xs font-semibold"
              />
              <Button
                title="Quero conversar"
                onPress={handleChatClick}
                leftIcon={<Heart size={16} color={ColorTokens.neutral[0]} fill={ColorTokens.neutral[0]} />}
                variant="primary"
                size="lg"
                className="flex-[2] bg-gradient-to-r from-pink-500 to-rose-500 rounded-xl font-bold shadow-md"
                textClassName="text-white text-xs font-bold"
              />
            </Box>
          </View>
        </TouchableOpacity>

        {/* Mood Check */}
        <View
          style={{
            backgroundColor: colors.background.card,
            borderRadius: Tokens.radius['3xl'],
            padding: Tokens.spacing['6'],
            marginBottom: LAYOUT.sectionSpacing,
            borderWidth: 1,
            borderColor: `${ColorTokens.primary[200]}80`,
            ...getPlatformShadow('sm'),
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <CardBlurEffect position="top-right" color={`${ColorTokens.primary[100]}26`} />
          <CardBlurEffect position="bottom-left" color={`${ColorTokens.info[100]}1F`} size={LAYOUT.blurCircleSmall} />

          <Box gap="6" style={{ position: 'relative' }}>
            <Box direction="row" align="center" gap="5">
              <View
                style={{
                  padding: Tokens.spacing['3'],
                  borderRadius: Tokens.radius.xl,
                  backgroundColor: `${ColorTokens.primary[50]}FF`,
                  borderWidth: 1,
                  borderColor: `${ColorTokens.primary[100]}80`,
                }}
              >
                <Text variant="body" size="2xl">
                  💖
                </Text>
              </View>
              <Box flex={1}>
                <Text
                  variant="body"
                  size="2xl"
                  weight="bold"
                  style={{
                    color: ColorTokens.primary[600],
                  }}
                >
                  Como você está hoje?
                </Text>
                <Text
                  variant="caption"
                  size="xs"
                  style={{ color: `${ColorTokens.primary[700]}99`, marginTop: Tokens.spacing['1.5'] }}
                >
                  Toque na opção que mais combina
                </Text>
              </Box>
            </Box>

            <Box
              style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                gap: Tokens.spacing['4'],
              }}
            >
              {[
                { emoji: '😴', label: 'Cansada' },
                { emoji: '😊', label: 'Bem' },
                { emoji: '😰', label: 'Ansiosa' },
                { emoji: '🥰', label: 'Grata' },
              ].map((mood) => (
                <TouchableOpacity
                  key={mood.label}
                  onPress={() => handleMoodClick(mood.emoji, mood.label)}
                  disabled={emotionLoading}
                  accessibilityRole="button"
                  accessibilityLabel={`Estou me sentindo ${mood.label}`}
                  accessibilityHint={`Registra que você está se sentindo ${mood.label} hoje`}
                  style={{
                    flex: 1,
                    minWidth: '45%',
                    paddingVertical: Tokens.spacing['5'],
                    paddingHorizontal: Tokens.spacing['2'],
                    borderRadius: Tokens.radius['2xl'],
                    borderWidth: 2,
                    borderColor: `${ColorTokens.primary[100]}80`,
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: Tokens.touchTargets.min,
                    backgroundColor: `${ColorTokens.primary[50]}FF`,
                    opacity: emotionLoading ? 0.5 : 1,
                  }}
                  activeOpacity={0.95}
                >
                  <Text variant="body" size="3xl" style={{ marginBottom: Tokens.spacing['3'] }}>
                    {mood.emoji}
                  </Text>
                  <Text variant="body" size="sm" weight="semibold" style={{ color: ColorTokens.primary[700] }}>
                    {mood.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </Box>
          </Box>
        </View>
      </ScrollView>

      <SOSMaeFloatingButton />
    </SafeAreaContainer>
  );
}
