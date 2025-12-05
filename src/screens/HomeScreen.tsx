/**
 * HomeScreen - Adaptado do design web para React Native
 *
 * Features:
 * - Header com gradiente rosa-azul (60/40) igual ao design web
 * - Saudação integrada no header
 * - SafeAreaInsets para iOS e Android
 * - Design tokens + WebColors (sem hardcoded colors)
 * - Acessibilidade WCAG AAA
 * - Dark mode support
 *
 * @version 3.0.0 - Migração visual do design web
 */

import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Play, Heart, Search, AlertCircle, MessageCircle, Zap, Menu, Mic, Bookmark, BookmarkCheck } from 'lucide-react-native';
import React, { useState } from 'react';
import { ScrollView, TouchableOpacity, View, Platform, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Avatar } from '@/components/Avatar';
import { Badge } from '@/components/Badge';
import { DicaDoDiaCard } from '@/components/info/DicaDoDiaCard';
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
import { WebColors, GradientConfigs } from '@/theme/webColors';
import { logger } from '@/utils/logger';

type NavigationProp = CompositeNavigationProp<
BottomTabNavigationProp<MainTabParamList, 'Home'>,
NativeStackNavigationProp<RootStackParamList>
>;

export default function HomeScreen() {
const navigation = useNavigation<NavigationProp>();
const { colors, isDark } = useTheme();
const insets = useSafeAreaInsets();

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

  const handleSOSMaePress = () => {
  logger.info('SOS Mãe card pressed', { screen: 'HomeScreen' });
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  navigation.navigate('SOSMae');
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

// Header com Gradiente Rosa-Azul 60/40 (Web Design)
// Inclui: Avatar + Search + Theme + Saudação integrada
const HeaderContent = (
  <Box
    p="4"
    style={{
      paddingTop: insets.top + Tokens.spacing['2'],
    }}
  >
    {/* Linha 1: Avatar + Search + Theme */}
    <Box
      direction="row"
      align="center"
      gap="3"
      mb="3"
    >
      {/* Avatar maior conforme web (80-96px) */}
      <View
        accessible={true}
        accessibilityLabel="Avatar de Nathália Valente"
        accessibilityRole="image"
        accessibilityHint="Foto de perfil de Nathália Valente"
      >
        <Avatar
          size={72}
          source={{ uri: 'https://i.imgur.com/jzb0IgO.jpg' }}
          name="Nathália Valente"
          fallback="NV"
          borderWidth={3}
          borderColor={`${WebColors.rosa.foreground}99`}
          useGradientFallback
          style={{
            ...getPlatformShadow('xl'),
          }}
        />
      </View>

      {/* Search Input - estilo web */}
      <Box flex={1} direction="row" align="center">
        <Box
          style={{
            position: 'absolute',
            left: Tokens.spacing['3'],
            zIndex: 1,
          }}
        >
          <Search size={16} color={WebColors.text.secondary} />
        </Box>
        <TouchableOpacity
          onPress={handleSearchPress}
          style={{
            flex: 1,
            backgroundColor: `${WebColors.rosa.foreground}E6`,
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
          <Text variant="body" size="sm" style={{ color: WebColors.text.secondary }}>
            Onde...
          </Text>
        </TouchableOpacity>
      </Box>

      {/* Theme Toggle */}
      <ThemeToggle variant="ghost" />
    </Box>

    {/* Linha 2: Saudação integrada no header (como web) */}
    <Box>
      <Text
        variant="heading"
        size="2xl"
        weight="bold"
        style={{
          color: WebColors.rosa.foreground,
          textShadowColor: 'rgba(0,0,0,0.2)',
          textShadowOffset: { width: 0, height: 1 },
          textShadowRadius: 2,
          marginBottom: Tokens.spacing['1'],
        }}
      >
        Olá, mãe
      </Text>
      <Text
        variant="body"
        size="sm"
        style={{
          color: `${WebColors.rosa.foreground}E6`,
          fontWeight: '500',
        }}
      >
        Respira um pouquinho. Estamos aqui por você.
      </Text>
    </Box>
  </Box>
);

return (
  <SafeAreaContainer edges={['top']} backgroundColor={colors.background.canvas}>
    {/* Header Sticky com Gradiente Rosa-Azul (Web Design) */}
    <View
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 40,
        overflow: 'hidden',
      }}
    >
      {/* Gradiente principal rosa-azul equilibrado */}
      <LinearGradient
        colors={WebColors.gradients.headerRosaAzul}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          opacity: 0.95,
        }}
      >
        {/* Overlay escuro sutil de baixo para cima */}
        <LinearGradient
          colors={['transparent', 'transparent', 'rgba(0,0,0,0.1)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          }}
        />

        {/* Efeito de brilho animado - Azul (canto direito) */}
        <View
          style={{
            position: 'absolute',
            top: -24,
            right: -24,
            width: 120,
            height: 120,
            borderRadius: 60,
            backgroundColor: `${WebColors.azul.light}33`,
            opacity: 0.6,
          }}
        />

        {/* Efeito de brilho - Rosa (canto esquerdo inferior) */}
        <View
          style={{
            position: 'absolute',
            bottom: -20,
            left: -20,
            width: 100,
            height: 100,
            borderRadius: 50,
            backgroundColor: `${WebColors.rosa.light}40`,
            opacity: 0.5,
          }}
        />

        {HeaderContent}
      </LinearGradient>
    </View>

    {/* Content */}
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{
        paddingTop: insets.top + 140, // Header height aumentado (avatar maior + saudação)
        paddingBottom: insets.bottom + 80, // Tab bar height
        paddingHorizontal: Tokens.spacing['4'],
      }}
      showsVerticalScrollIndicator={false}
    >
      {/* Saudação agora está no header - espaço menor */}

      {/* Sleep Card - Com gradiente azul (PRIMEIRO CARD após header) */}
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
          borderWidth: 2,
          borderColor: `${WebColors.azul.light}80`, // Azul light do web
          backgroundColor: WebColors.azul.subtle,
          ...getPlatformShadow('xl'),
        }}
      >
        <View style={{ position: 'relative', width: '100%', height: 220 }}>
          <Image
            source={{ uri: 'https://i.imgur.com/w4rZvGG.jpg' }}
            style={{
              width: '100%',
              height: 220,
            }}
            contentFit="cover"
            placeholder={{ blurhash: 'LGF5]+Yk^6#M@-5c,1J5@[or[Q6.' }}
            transition={200}
            onError={(error) => {
              logger.warn('Failed to load sleep card image', error);
            }}
          />
          {/* Overlay gradiente azul suave (como web) */}
          <LinearGradient
            colors={[
              'transparent',
              `${WebColors.azul.main}66`, // 40%
              `${WebColors.azul.hover}CC`, // 80%
            ]}
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              top: 0,
            }}
          />
          <View
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              padding: Tokens.spacing['5'],
            }}
          >
            <Badge
              variant="info"
              size="sm"
              containerStyle={{
                marginBottom: Tokens.spacing['2'],
                ...getPlatformShadow('sm'),
              }}
            >
              🌙 Sono
            </Badge>
            <Text
              variant="body"
              size="lg"
              weight="bold"
              color="inverse"
              style={{
                marginBottom: Tokens.spacing['1'],
                textShadowColor: 'rgba(0,0,0,0.3)',
                textShadowOffset: { width: 0, height: 1 },
                textShadowRadius: 2,
              }}
            >
              Como você dormiu hoje?
            </Text>
            <Text
              variant="body"
              size="sm"
              color="inverse"
              style={{
                opacity: 0.9,
                textShadowColor: 'rgba(0,0,0,0.2)',
                textShadowOffset: { width: 0, height: 1 },
                textShadowRadius: 1,
              }}
            >
              Registre seu descanso e cuide de você
            </Text>
          </View>
        </View>
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

      {/* Chat with NathIA - Design Web (from-rose-400 via-pink-400 to-purple-500) */}
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
          borderWidth: 2,
          borderColor: `${WebColors.rosa.light}80`,
          ...getPlatformShadow('xl'),
        }}
      >
        {/* Gradiente NathIA do web design */}
        <LinearGradient
          colors={WebColors.gradients.nathIA}
          start={GradientConfigs.nathIA.start}
          end={GradientConfigs.nathIA.end}
          style={{
            padding: Tokens.spacing['5'],
            position: 'relative',
          }}
        >
          {/* Padrão de pontos decorativos (como web) */}
          <View
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              opacity: 0.1,
            }}
          />

          {/* Efeito de brilho superior */}
          <View
            style={{
              position: 'absolute',
              top: -20,
              left: '50%',
              marginLeft: -60,
              width: 120,
              height: 120,
              borderRadius: 60,
              backgroundColor: `${WebColors.rosa.foreground}26`, // 15%
            }}
          />

          {/* Efeito de brilho inferior */}
          <View
            style={{
              position: 'absolute',
              bottom: -18,
              left: '50%',
              marginLeft: -54,
              width: 108,
              height: 108,
              borderRadius: 54,
              backgroundColor: `${WebColors.lilas.main}33`, // 20%
            }}
          />
          {/* Header com Avatar e Badge (estilo web) */}
          <Box direction="row" align="center" justify="space-between" mb="4">
            <Box direction="row" align="center" gap="3" flex={1}>
              <View style={{ position: 'relative' }}>
                <Avatar
                  size={52}
                  source={{ uri: 'https://i.imgur.com/oB9ewPG.jpg' }}
                  name="NathIA"
                  fallback="N"
                  borderWidth={2}
                  borderColor={`${WebColors.rosa.foreground}80`}
                  useGradientFallback
                  style={{
                    ...getPlatformShadow('xl'),
                  }}
                />
                {/* Indicador Online - Verde sucesso (como web) */}
                <View
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    width: 12,
                    height: 12,
                    borderRadius: 6,
                    backgroundColor: WebColors.status.success,
                    borderWidth: 2,
                    borderColor: WebColors.rosa.foreground,
                    ...getPlatformShadow('sm'),
                  }}
                />
              </View>
              <Box flex={1}>
                <Text
                  variant="heading"
                  size="xl"
                  weight="bold"
                  style={{
                    color: WebColors.rosa.foreground,
                    textShadowColor: 'rgba(0,0,0,0.2)',
                    textShadowOffset: { width: 0, height: 1 },
                    textShadowRadius: 2,
                    marginBottom: Tokens.spacing['1'],
                  }}
                >
                  Converse com a NathIA
                </Text>
                {/* Badge ONLINE com gradiente verde */}
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    alignSelf: 'flex-start',
                    backgroundColor: `${WebColors.status.success}4D`, // 30%
                    paddingHorizontal: Tokens.spacing['2'],
                    paddingVertical: Tokens.spacing['0.5'],
                    borderRadius: Tokens.radius.full,
                    borderWidth: 1,
                    borderColor: `${WebColors.status.success}80`,
                  }}
                >
                  <MessageCircle size={10} color={WebColors.rosa.foreground} />
                  <Text
                    variant="caption"
                    size="xs"
                    weight="semibold"
                    style={{
                      color: WebColors.rosa.foreground,
                      marginLeft: 4,
                    }}
                  >
                    ONLINE
                  </Text>
                </View>
              </Box>
            </Box>
            {/* Botão de Microfone (estilo web) */}
            <IconButton
              icon={<Mic size={16} color={WebColors.rosa.foreground} />}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                navigation.navigate('Chat');
              }}
              accessibilityLabel="Iniciar gravação de voz"
              variant="ghost"
              size="sm"
              style={{
                backgroundColor: `${WebColors.rosa.foreground}1A`, // 10%
                borderWidth: 1,
                borderColor: `${WebColors.rosa.foreground}33`, // 20%
                borderRadius: Tokens.radius.lg,
                width: 36,
                height: 36,
              }}
            />
          </Box>

          {/* Descrição centralizada (estilo web) */}
          <Text
            variant="body"
            size="sm"
            style={{
              color: `${WebColors.rosa.foreground}F2`, // 95%
              marginBottom: Tokens.spacing['4'],
              textAlign: 'center',
              fontWeight: '500',
            }}
          >
            Apoio imediato, sem julgamentos. Estou aqui para você 💖
          </Text>

          {/* Badges Rápido e 24/7 (estilo web - backdrop-blur simulado) */}
          <Box direction="row" align="center" justify="center" gap="2" mb="4">
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: `${WebColors.rosa.foreground}33`, // 20%
                paddingHorizontal: Tokens.spacing['3'],
                paddingVertical: Tokens.spacing['1.5'],
                borderRadius: Tokens.radius.full,
                borderWidth: 1,
                borderColor: `${WebColors.rosa.foreground}4D`, // 30%
                ...getPlatformShadow('md'),
              }}
            >
              <Zap size={14} color={WebColors.rosa.foreground} />
              <Text
                variant="caption"
                size="xs"
                weight="semibold"
                style={{ color: WebColors.rosa.foreground, marginLeft: 6 }}
              >
                Rápido
              </Text>
            </View>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: `${WebColors.rosa.foreground}40`, // 25%
                paddingHorizontal: Tokens.spacing['3'],
                paddingVertical: Tokens.spacing['1.5'],
                borderRadius: Tokens.radius.full,
                borderWidth: 1,
                borderColor: `${WebColors.rosa.foreground}66`, // 40%
                ...getPlatformShadow('lg'),
              }}
            >
              <MessageCircle size={14} color={WebColors.rosa.foreground} />
              <Text
                variant="caption"
                size="xs"
                weight="semibold"
                style={{ color: WebColors.rosa.foreground, marginLeft: 6 }}
              >
                24/7
              </Text>
            </View>
          </Box>

          {/* Botões de ação (estilo web) */}
          <Box direction="row" gap="2">
            {/* Botão Histórico - estilo ghost */}
            <Button
              title="Histórico"
              onPress={() => navigation.navigate('ChatSessions')}
              variant="outline"
              size="md"
              leftIcon={<Menu size={16} color={WebColors.rosa.foreground} />}
              style={{
                flex: 1,
                backgroundColor: `${WebColors.rosa.foreground}1A`, // 10%
                borderColor: `${WebColors.rosa.foreground}33`, // 20%
                borderRadius: Tokens.radius.xl,
              }}
              textStyle={{
                color: WebColors.rosa.foreground,
                fontWeight: '600',
              }}
            />
            {/* Botão principal - branco com shimmer effect */}
            <Button
              title="Quero conversar"
              onPress={handleNathIAPress}
              variant="secondary"
              size="md"
              leftIcon={<Heart size={16} color={WebColors.rosa.main} fill={WebColors.rosa.main} />}
              style={{
                flex: 2,
                backgroundColor: WebColors.rosa.foreground,
                borderRadius: Tokens.radius.xl,
                ...getPlatformShadow('xl'),
              }}
              textStyle={{
                color: WebColors.rosa.main,
                fontWeight: '700',
              }}
            />
          </Box>
        </LinearGradient>
      </TouchableOpacity>

        {/* SOS Mãe - Suporte Emergencial (estilo web) */}
        <TouchableOpacity
          onPress={handleSOSMaePress}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="SOS Mãe - suporte emergencial"
          accessibilityHint="Abra a tela de suporte emergencial para momentos difíceis"
          style={{
            marginBottom: Tokens.spacing['6'],
            borderRadius: Tokens.radius['3xl'],
            overflow: 'hidden',
            minHeight: Tokens.touchTargets.min,
            ...getPlatformShadow('xl'),
          }}
        >
          <LinearGradient
            colors={[WebColors.status.destructive, '#B91C1C']} // red-600 to red-700
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              padding: Tokens.spacing['6'],
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: 140,
            }}
          >
            <View
              style={{
                width: 56,
                height: 56,
                borderRadius: Tokens.radius.full,
                backgroundColor: `${WebColors.rosa.foreground}33`,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: Tokens.spacing['4'],
                ...getPlatformShadow('md'),
              }}
            >
              <AlertCircle size={28} color={WebColors.rosa.foreground} />
            </View>
            <Text
              variant="heading"
              size="lg"
              weight="bold"
              style={{
                color: WebColors.rosa.foreground,
                textAlign: 'center',
                marginBottom: Tokens.spacing['2'],
                textShadowColor: 'rgba(0,0,0,0.3)',
                textShadowOffset: { width: 0, height: 1 },
                textShadowRadius: 2,
              }}
            >
              SOS Mãe
            </Text>
            <Text
              variant="body"
              size="sm"
              style={{
                color: `${WebColors.rosa.foreground}E6`,
                opacity: 0.9,
                textAlign: 'center',
              }}
            >
              Suporte emergencial 24/7. Estamos aqui por você.
            </Text>
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
