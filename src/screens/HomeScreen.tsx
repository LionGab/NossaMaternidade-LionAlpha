/**
 * HomeScreen - Adaptado do design web para React Native
 *
 * Features:
 * - Header com BlurView (iOS) e elevation (Android)
 * - SafeAreaInsets para iOS e Android
 * - Design tokens (sem hardcoded colors)
 * - Acessibilidade WCAG AAA
 * - Dark mode support
 *
 * @version 2.0.0
 */

import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Moon, Sun, Play, Heart, Search } from 'lucide-react-native';
import React, { useState } from 'react';
import { ScrollView, TouchableOpacity, View, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Avatar } from '@/components/Avatar';
import { Badge } from '@/components/Badge';
import { SafeAreaContainer } from '@/components/layout/SafeAreaContainer';
import { NeedsPrompt, type NeedValue } from '@/components/molecules/NeedsPrompt';
import { Box } from '@/components/primitives/Box';
import { Button } from '@/components/primitives/Button';
import { IconButton } from '@/components/primitives/IconButton';
import { Text } from '@/components/primitives/Text';
import { ThemeToggle } from '@/components/ThemeToggle';
import type { MainTabParamList, RootStackParamList } from '@/navigation/types';
import { needsRewardsService } from '@/services/needsRewardsService';
import { useTheme } from '@/theme';
import { getPlatformShadow } from '@/theme/platform';
import { Tokens, ColorTokens } from '@/theme/tokens';
import { logger } from '@/utils/logger';

type NavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Home'>,
  NativeStackNavigationProp<RootStackParamList>
>;

export default function HomeScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const [isDayTime] = useState(false);

  // Handlers
  const handleSearchPress = () => {
    logger.info('Search pressed', { screen: 'HomeScreen' });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate('Search');
  };

  const handleNathIAPress = () => {
    logger.info('NathIA card pressed', { screen: 'HomeScreen' });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    navigation.navigate('Chat');
  };

  const handleSleepCardPress = () => {
    logger.info('Sleep card pressed', { screen: 'HomeScreen' });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate('Diary');
  };

  const handleMoodPress = (mood: { emoji: string; label: string }) => {
    logger.info('Mood selected', { mood: mood.label, screen: 'HomeScreen' });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // TODO: Salvar emoção no Supabase
  };

  const handleNeedSelect = async (need: NeedValue) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Processar reward e registrar analytics
    const reward = await needsRewardsService.processNeedSelection(need);

    logger.info('Need selected with reward', {
      need,
      destination: reward.destination,
      screen: 'HomeScreen',
    });

    // Navegar para destino apropriado (entrega valor imediato)
    switch (need) {
      case 'descanso':
        // Navega para Ritual com respiração automática
        navigation.navigate('Ritual', {
          ritual: 'breathing',
          autoStart: true,
          message: reward.immediateValue.description,
        });
        break;

      case 'apoio-emocional':
        // Navega para Chat (NathIA vai dar mensagem empática)
        navigation.navigate('Main', { screen: 'Chat' });
        break;

      case 'organizacao':
        // Navega para Rastreador de Amamentação
        navigation.navigate('BreastfeedingTracker');
        break;

      case 'conexao':
        // Navega para Comunidade
        navigation.navigate('Main', { screen: 'MaesValentes' });
        break;
    }
  };

  const moods = [
    { emoji: '😴', label: 'Cansada' },
    { emoji: '😊', label: 'Bem' },
    { emoji: '😰', label: 'Ansiosa' },
    { emoji: '🥰', label: 'Grata' },
  ];

  // Header com BlurView (iOS) ou LinearGradient (Android)
  const HeaderContent = (
    <Box
      direction="row"
      align="center"
      gap="3"
      p="4"
      style={{
        paddingTop: insets.top + Tokens.spacing['4'],
      }}
    >
      {/* Avatar */}
      <View
        accessible={true}
        accessibilityLabel="Avatar de Nathália Valente"
        accessibilityRole="image"
        accessibilityHint="Foto de perfil de Nathália Valente"
      >
        <Avatar
          size={48}
          source={{ uri: 'https://i.imgur.com/8CpKlpW.jpg' }}
          name="Nathália Valente"
          fallback="NV"
          borderWidth={2}
          borderColor={colors.primary.main}
          useGradientFallback
        />
      </View>

      {/* Search Input */}
      <Box flex={1} direction="row" align="center">
        <Box
          style={{
            position: 'absolute',
            left: Tokens.spacing['3'],
            zIndex: 1,
          }}
        >
          <Search size={16} color={colors.text.tertiary} />
        </Box>
        <TouchableOpacity
          onPress={handleSearchPress}
          style={{
            flex: 1,
            backgroundColor: colors.background.elevated,
            borderRadius: Tokens.radius['2xl'],
            paddingLeft: Tokens.spacing['10'],
            paddingRight: Tokens.spacing['3'],
            paddingVertical: Tokens.spacing['2.5'],
            minHeight: Tokens.touchTargets.min,
          }}
          accessibilityRole="button"
          accessibilityLabel="Buscar conteúdo"
          accessibilityHint="Abre a tela de busca para encontrar conteúdo"
        >
          <Text variant="body" size="sm" color="tertiary">
            Onde...
          </Text>
        </TouchableOpacity>
      </Box>

      {/* Theme Toggle */}
      <ThemeToggle variant="ghost" />
    </Box>
  );

  return (
    <SafeAreaContainer edges={['top']} backgroundColor={colors.background.canvas}>
      {/* Header Sticky com Blur */}
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 40,
          borderBottomWidth: 1,
          borderBottomColor: colors.border.light,
        }}
      >
        {Platform.OS === 'ios' ? (
          <BlurView
            intensity={80}
            tint={isDark ? 'dark' : 'light'}
            style={{
              backgroundColor: `${colors.background.card}CC`,
            }}
          >
            {HeaderContent}
          </BlurView>
        ) : (
          <LinearGradient
            colors={
              isDark
                ? [`${colors.background.card}E6`, `${colors.background.card}CC`]
                : [`${colors.background.card}E6`, `${colors.background.card}CC`]
            }
            style={{
              backgroundColor: colors.background.card,
            }}
          >
            {HeaderContent}
          </LinearGradient>
        )}
      </View>

      {/* Content */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingTop: insets.top + 80, // Header height + safe area
          paddingBottom: insets.bottom + 80, // Tab bar height
          paddingHorizontal: Tokens.spacing['4'],
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Greeting */}
        <Box direction="row" align="center" justify="space-between" mb="6">
          <Box flex={1}>
            <Box direction="row" align="center" gap="2" mb="1">
              {isDayTime ? (
                <Sun size={20} color={ColorTokens.warning[500]} />
              ) : (
                <Moon size={20} color={colors.primary.main} />
              )}
              <Text variant="body" size="2xl" weight="bold">
                Olá, mãe 🌙
              </Text>
            </Box>
            <Text variant="body" size="sm" color="secondary">
              Respira um pouquinho. Estamos aqui por você.
            </Text>
          </Box>
          <IconButton
            icon={<Sun size={20} color={ColorTokens.warning[500]} />}
            onPress={() => {}}
            accessibilityLabel="Alternar tema"
            variant="ghost"
            size="md"
            style={{
              backgroundColor: `${ColorTokens.warning[500]}33`,
            }}
          />
        </Box>

        {/* Sleep Card */}
        <TouchableOpacity
          onPress={handleSleepCardPress}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Como você dormiu hoje?"
          accessibilityHint="Toque para registrar suas horas de sono de hoje"
          style={{
            marginBottom: Tokens.spacing['6'],
            borderRadius: Tokens.radius['3xl'],
            overflow: 'hidden',
            ...getPlatformShadow('md'),
          }}
        >
          <Image
            source={{ uri: 'https://i.imgur.com/w4rZvGG.jpg' }}
            style={{
              width: '100%',
              height: 160,
            }}
            contentFit="cover"
          />
          <LinearGradient
            colors={[
              'transparent',
              `${ColorTokens.neutral[900]}B3`,
              `${ColorTokens.neutral[900]}CC`,
            ]}
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              padding: Tokens.spacing['5'],
            }}
          >
            <Badge
              variant="primary"
              size="sm"
              containerStyle={{ marginBottom: Tokens.spacing['2'] }}
            >
              Sono
            </Badge>
            <Text
              variant="body"
              size="lg"
              weight="bold"
              color="inverse"
              style={{ marginBottom: Tokens.spacing['1'] }}
            >
              Como você dormiu hoje?
            </Text>
            <Text variant="body" size="sm" color="inverse" style={{ opacity: 0.8 }}>
              Registre seu descanso e cuide de você
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Featured Content */}
        <Box mb="6">
          <Text
            variant="body"
            size="lg"
            weight="semibold"
            style={{ marginBottom: Tokens.spacing['3'] }}
          >
            Destaques de hoje
          </Text>
          <Text
            variant="body"
            size="sm"
            color="secondary"
            style={{ marginBottom: Tokens.spacing['4'] }}
          >
            Selecionados especialmente para você
          </Text>

          <Box gap="3">
            {/* Video Card */}
            <Box bg="card" rounded="3xl" p="4" shadow="md" borderWidth={1} borderColor="light">
              <Box direction="row" gap="3">
                <Box
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: Tokens.radius['2xl'],
                    backgroundColor: `${colors.primary.main}33`,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Play size={24} color={colors.primary.main} fill={colors.primary.main} />
                </Box>
                <Box flex={1}>
                  <Box direction="row" align="center" gap="2" mb="1">
                    <Badge variant="success" size="sm">
                      NOVO
                    </Badge>
                    <Text variant="caption" size="xs" color="tertiary">
                      Vídeo
                    </Text>
                  </Box>
                  <Text
                    variant="body"
                    size="md"
                    weight="semibold"
                    style={{ marginBottom: Tokens.spacing['1'] }}
                  >
                    Conteúdo especial de hoje
                  </Text>
                  <Text
                    variant="body"
                    size="sm"
                    color="secondary"
                    style={{ marginBottom: Tokens.spacing['2'] }}
                  >
                    Algo que preparamos pensando em você.
                  </Text>
                  <Text
                    variant="caption"
                    size="xs"
                    color="tertiary"
                    style={{ fontStyle: 'italic' }}
                  >
                    Feito com carinho para este momento
                  </Text>
                </Box>
              </Box>
            </Box>

            {/* Story Card */}
            <Box bg="card" rounded="3xl" p="4" shadow="md" borderWidth={1} borderColor="light">
              <Box direction="row" gap="3">
                <Box
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: Tokens.radius['2xl'],
                    backgroundColor: `${ColorTokens.secondary[400]}33`,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Heart
                    size={24}
                    color={ColorTokens.secondary[400]}
                    fill={ColorTokens.secondary[400]}
                  />
                </Box>
                <Box flex={1}>
                  <Text
                    variant="caption"
                    size="xs"
                    color="secondary"
                    weight="medium"
                    style={{ marginBottom: Tokens.spacing['1'] }}
                  >
                    História real
                  </Text>
                  <Text
                    variant="body"
                    size="md"
                    weight="semibold"
                    style={{ marginBottom: Tokens.spacing['1'] }}
                  >
                    História que tocou muitas mães
                  </Text>
                  <Text
                    variant="body"
                    size="sm"
                    color="secondary"
                    style={{ marginBottom: Tokens.spacing['2'] }}
                  >
                    Uma jornada de amor e superação
                  </Text>
                  <Text
                    variant="caption"
                    size="xs"
                    color="tertiary"
                    style={{ fontStyle: 'italic', marginBottom: Tokens.spacing['2'] }}
                  >
                    Mais de mil mães se identificaram
                  </Text>
                  <Box direction="row" align="center" gap="1">
                    <Heart size={12} color={colors.text.tertiary} />
                    <Text variant="caption" size="xs" color="tertiary">
                      1.234 mães
                    </Text>
                  </Box>
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Chat with NathIA */}
        <TouchableOpacity
          onPress={handleNathIAPress}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Converse com a NathIA"
          accessibilityHint="Abre o chat com a assistente virtual NathIA"
          style={{
            marginBottom: Tokens.spacing['6'],
            borderRadius: Tokens.radius['3xl'],
            overflow: 'hidden',
            ...getPlatformShadow('md'),
          }}
        >
          <LinearGradient
            colors={[ColorTokens.primary[500], ColorTokens.secondary[500]]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              padding: Tokens.spacing['6'],
            }}
          >
            <Box direction="row" align="center" gap="3" mb="4">
              <Avatar
                size={48}
                source={{ uri: 'https://i.imgur.com/RRIaE7t.jpg' }}
                name="NathIA"
                fallback="N"
                borderWidth={2}
                borderColor={`${ColorTokens.neutral[0]}4D`}
                useGradientFallback
              />
              <Badge
                variant="success"
                size="sm"
                containerStyle={{
                  backgroundColor: `${ColorTokens.neutral[0]}33`,
                }}
              >
                Disponível
              </Badge>
            </Box>
            <Text
              variant="body"
              size="xl"
              weight="bold"
              color="inverse"
              style={{ marginBottom: Tokens.spacing['2'] }}
            >
              Converse com a NathIA
            </Text>
            <Text
              variant="body"
              size="sm"
              color="inverse"
              style={{ opacity: 0.8, marginBottom: Tokens.spacing['4'] }}
            >
              Apoio imediato, sem julgamentos.
            </Text>
            <Button
              title="Quero conversar"
              onPress={handleNathIAPress}
              variant="secondary"
              size="lg"
              fullWidth
              leftIcon={<Heart size={16} color={ColorTokens.neutral[0]} />}
              style={{
                backgroundColor: ColorTokens.neutral[0],
              }}
              accessibilityLabel="Abrir chat com NathIA"
              accessibilityHint="Inicia uma conversa com a assistente virtual NathIA"
            />
          </LinearGradient>
        </TouchableOpacity>

        {/* O que você mais precisa agora? */}
        <Box bg="card" rounded="3xl" p="6" shadow="md" borderWidth={1} borderColor="light" mb="6">
          <NeedsPrompt title="O que você mais precisa agora?" onSelect={handleNeedSelect} />
        </Box>

        {/* Mood Check */}
        <Box bg="card" rounded="3xl" p="6" shadow="md" borderWidth={1} borderColor="light" mb="6">
          <Box direction="row" align="center" gap="2" mb="4">
            <Text variant="body" size="2xl">
              🧡
            </Text>
            <Text variant="body" size="md" weight="semibold">
              Como você está hoje?
            </Text>
          </Box>
          <Text
            variant="body"
            size="sm"
            color="secondary"
            style={{ marginBottom: Tokens.spacing['4'] }}
          >
            Toque na opção que mais combina com seu momento:
          </Text>
          <Box
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              gap: Tokens.spacing['2'],
            }}
          >
            {moods.map((mood) => (
              <TouchableOpacity
                key={mood.label}
                onPress={() => handleMoodPress(mood)}
                accessibilityRole="button"
                accessibilityLabel={`Estou me sentindo ${mood.label}`}
                accessibilityHint={`Registra que você está se sentindo ${mood.label} hoje`}
                style={{
                  flex: 1,
                  minWidth: '45%',
                  paddingVertical: Tokens.spacing['3'],
                  paddingHorizontal: Tokens.spacing['2'],
                  borderRadius: Tokens.radius['2xl'],
                  borderWidth: 1,
                  borderColor: colors.border.medium,
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: Tokens.touchTargets.min,
                  backgroundColor: colors.background.canvas,
                }}
                activeOpacity={0.7}
              >
                <Text variant="body" size="2xl" style={{ marginBottom: Tokens.spacing['2'] }}>
                  {mood.emoji}
                </Text>
                <Text variant="body" size="sm">
                  {mood.label}
                </Text>
              </TouchableOpacity>
            ))}
          </Box>
        </Box>
      </ScrollView>
    </SafeAreaContainer>
  );
}
