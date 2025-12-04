/**
 * MundoNathScreen - Tela de conteúdo exclusivo da Nathália
 * Design baseado no Content.tsx do app-redesign-studio
 * Com animações suaves de entrada
 */

import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { Play, ChevronRight, Clock } from 'lucide-react-native';
import React, { useRef, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, Animated, Easing } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { Avatar } from '@/components/Avatar';
import { Badge } from '@/components/Badge';
import { Box } from '@/components/primitives/Box';
import { Button } from '@/components/primitives/Button';
import { Text } from '@/components/primitives/Text';
import { ThemeToggle } from '@/components/ThemeToggle';
import type { RootStackParamList } from '@/navigation/types';
import { useTheme } from '@/theme';
import { Tokens, ColorTokens, Spacing, Radius } from '@/theme/tokens';
import { logger } from '@/utils/logger';

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

export default function MundoNathScreen() {
  const { colors, isDark } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();
  const SUNRISE_GRADIENT = getSunriseGradient(isDark);

  // Animações: header (0), featured card (1), section header (2), content item 1 (3), content item 2 (4)
  const animations = useStaggeredAnimations(5, 120);

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
    navigation.navigate('ContentDetail', { contentId: itemId });
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
                size="3xl"
                weight="bold"
                style={{
                  color: ColorTokens.neutral[900],
                  marginBottom: Spacing['2'],
                }}
              >
                Mundo Naty
              </Text>
              <Text
                size="sm"
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
        <Box px="4" style={{ gap: Spacing['6'], marginTop: -Spacing['6'] }}>
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
                size="2xl"
                weight="bold"
                style={{
                  color: ColorTokens.neutral[0],
                  lineHeight: 28,
                }}
              >
                Ritual de 3 Minutos
              </Text>

              <Text
                size="sm"
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
                  variant="primary"
                  size="lg"
                  title="Começar Agora"
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    handleContentPress('ritual-3min');
                  }}
                  leftIcon={<Play size={16} color={colors.primary.main} />}
                  style={{
                    flex: 1,
                    backgroundColor: ColorTokens.neutral[0],
                    borderRadius: Radius.xl,
                  }}
                />

                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: Spacing['1'],
                    paddingHorizontal: Spacing['3'],
                    paddingVertical: Spacing['2'],
                    borderRadius: Radius.xl,
                    backgroundColor: ColorTokens.overlay.light,
                  }}
                >
                  <Clock size={16} color={`${ColorTokens.neutral[0]}CC`} />
                  <Text
                    size="sm"
                    style={{
                      color: `${ColorTokens.neutral[0]}CC`,
                    }}
                  >
                    3 min
                  </Text>
                </View>
              </View>
            </LinearGradient>
          </Animated.View>

          {/* Seção: Para Você - Animado */}
          <Animated.View
            style={{
              opacity: animations[2].opacity,
              transform: [{ translateY: animations[2].translateY }],
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: Spacing['4'],
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: Spacing['2'],
                }}
              >
                <Text style={{ fontSize: 20 }}>❄️</Text>
                <Text size="lg" weight="bold" color="primary">
                  Para Você
                </Text>
              </View>

              <TouchableOpacity
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  logger.info('See all pressed', { screen: 'MundoNathScreen' });
                }}
                activeOpacity={0.7}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
                accessibilityRole="button"
                accessibilityLabel="Ver mais conteúdo"
                accessibilityHint="Mostra todos os conteúdos da seção Para Você"
              >
                <Text size="sm" color="primary">
                  Ver mais
                </Text>
                <ChevronRight size={16} color={colors.primary.main} style={{ marginLeft: 4 }} />
              </TouchableOpacity>
            </View>

            <View style={{ gap: Spacing['3'] }}>
              {/* Content Item 1 - TEXTO - Animado */}
              <Animated.View
                style={{
                  backgroundColor: colors.background.card,
                  borderRadius: Radius['3xl'],
                  overflow: 'hidden',
                  borderWidth: 1,
                  borderColor: colors.border.light,
                  ...Tokens.shadows.card,
                  opacity: animations[3].opacity,
                  transform: [{ translateY: animations[3].translateY }],
                }}
              >
                <View
                  style={{
                    height: 192,
                    position: 'relative',
                  }}
                >
                  <LinearGradient
                    colors={[
                      `${ColorTokens.accent.purple}33`, // accent/20
                      `${ColorTokens.secondary[500]}33`, // secondary/20
                    ]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{
                      flex: 1,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <Badge
                      variant="secondary"
                      containerStyle={{
                        position: 'absolute',
                        top: Spacing['3'],
                        left: Spacing['3'],
                      }}
                    >
                      TEXTO
                    </Badge>

                    <View
                      style={{
                        width: 80,
                        height: 80,
                        borderRadius: 40,
                        backgroundColor: `${ColorTokens.neutral[0]}66`, // background/40
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                    >
                      <Text style={{ fontSize: 40 }}>🦆</Text>
                    </View>
                  </LinearGradient>
                </View>

                <View style={{ padding: Spacing['4'] }}>
                  <Text size="md" weight="semibold" style={{ marginBottom: Spacing['2'] }}>
                    Como lidar com os primeiros dias
                  </Text>
                  <Text size="sm" color="secondary" style={{ marginBottom: Spacing['3'] }}>
                    Dicas práticas para atravessar os momentos mais desafiadores da maternidade
                    inicial.
                  </Text>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: Spacing['2'],
                    }}
                  >
                    <Clock size={12} color={colors.text.tertiary} />
                    <Text size="xs" color="tertiary">
                      5 min de leitura
                    </Text>
                  </View>
                </View>
              </Animated.View>

              {/* Content Item 2 - ÁUDIO - Animado */}
              <Animated.View
                style={{
                  backgroundColor: colors.background.card,
                  borderRadius: Radius['3xl'],
                  overflow: 'hidden',
                  borderWidth: 1,
                  borderColor: colors.border.light,
                  ...Tokens.shadows.card,
                  opacity: animations[4].opacity,
                  transform: [{ translateY: animations[4].translateY }],
                }}
              >
                <View
                  style={{
                    height: 192,
                    position: 'relative',
                  }}
                >
                  <LinearGradient
                    colors={[
                      `${ColorTokens.primary[500]}33`, // primary/20
                      `${ColorTokens.success[500]}33`, // success/20
                    ]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{
                      flex: 1,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <Badge
                      variant="primary"
                      containerStyle={{
                        position: 'absolute',
                        top: Spacing['3'],
                        left: Spacing['3'],
                      }}
                    >
                      ÁUDIO
                    </Badge>

                    <View
                      style={{
                        width: 80,
                        height: 80,
                        borderRadius: 40,
                        backgroundColor: `${ColorTokens.neutral[0]}66`, // background/40
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                    >
                      <Play size={32} color={colors.primary.main} />
                    </View>
                  </LinearGradient>
                </View>

                <View style={{ padding: Spacing['4'] }}>
                  <Text size="md" weight="semibold" style={{ marginBottom: Spacing['2'] }}>
                    Meditação para noites difíceis
                  </Text>
                  <Text size="sm" color="secondary" style={{ marginBottom: Spacing['3'] }}>
                    Um momento de paz para quando tudo parecer demais. Respire fundo e se permita
                    sentir.
                  </Text>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: Spacing['2'],
                    }}
                  >
                    <Clock size={12} color={colors.text.tertiary} />
                    <Text size="xs" color="tertiary">
                      8 min
                    </Text>
                  </View>
                </View>
              </Animated.View>
            </View>
          </Animated.View>
        </Box>
      </ScrollView>
    </SafeAreaView>
  );
}
