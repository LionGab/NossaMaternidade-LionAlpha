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
import { Play, Heart, Search, AlertCircle, Lightbulb, Info, MessageCircle, Zap, Menu, Mic } from 'lucide-react-native';
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
    {/* Avatar maior conforme web */}
    <View
      accessible={true}
      accessibilityLabel="Avatar de Nathália Valente"
      accessibilityRole="image"
      accessibilityHint="Foto de perfil de Nathália Valente"
    >
      <Avatar
        size={56}
        source={{ uri: 'https://i.imgur.com/jzb0IgO.jpg' }}
        name="Nathália Valente"
        fallback="NV"
        borderWidth={3}
        borderColor={ColorTokens.neutral[0]}
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
          backgroundColor: `${ColorTokens.neutral[0]}E6`,
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
          intensity={95}
          tint={isDark ? 'dark' : 'light'}
          style={{
            backgroundColor: 'transparent',
          }}
        >
          <LinearGradient
            colors={[ColorTokens.primary[400], ColorTokens.secondary[400]]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              opacity: 0.95,
            }}
          >
            {HeaderContent}
          </LinearGradient>
        </BlurView>
      ) : (
        <LinearGradient
          colors={[ColorTokens.primary[400], ColorTokens.secondary[400]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            opacity: 0.95,
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
      <Box mb="6">
        <Text variant="body" size="2xl" weight="bold" style={{ marginBottom: Tokens.spacing['1'] }}>
          Olá, mãe
        </Text>
        <Text variant="body" size="sm" color="secondary">
          Respira um pouquinho. Estamos aqui por você.
        </Text>
      </Box>

      {/* Dica do Dia - Card Azul Informativo */}
      <Box
        bg="card"
        rounded="3xl"
        p="5"
        shadow="md"
        borderWidth={1}
        borderColor="light"
        mb="6"
        style={{
          backgroundColor: ColorTokens.info[50],
          borderColor: `${ColorTokens.info[300]}50`,
        }}
      >
        <Box direction="row" gap="3" align="flex-start">
          <Box
            style={{
              padding: Tokens.spacing['2'],
              borderRadius: Tokens.radius.xl,
              backgroundColor: ColorTokens.info[100],
            }}
          >
            <Lightbulb size={24} color={ColorTokens.info[600]} />
          </Box>
          <Box flex={1}>
            <Box direction="row" align="center" gap="2" mb="2">
              <Text variant="body" size="md" weight="bold" style={{ color: ColorTokens.info[700] }}>
                Dica do dia
              </Text>
              <Badge variant="info" size="sm">
                Novo
              </Badge>
            </Box>
            <Text variant="body" size="sm" color="secondary" style={{ marginBottom: Tokens.spacing['3'] }}>
              Respire fundo por 30 segundos. Isso ajuda a acalmar o sistema nervoso e traz clareza mental.
            </Text>
            <Button
              title="Saiba mais"
              onPress={() => navigation.navigate('Ritual')}
              variant="outline"
              size="sm"
              leftIcon={<Info size={14} color={ColorTokens.info[600]} />}
              style={{
                borderColor: ColorTokens.info[300],
                backgroundColor: 'transparent',
              }}
            />
          </Box>
        </Box>
      </Box>

      {/* Sleep Card - Com gradiente azul */}
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
          borderColor: `${ColorTokens.info[300]}80`,
          ...getPlatformShadow('md'),
        }}
      >
        <Image
          source={{ uri: 'https://i.imgur.com/w4rZvGG.jpg' }}
          style={{
            width: '100%',
            height: 200,
          }}
          contentFit="cover"
        />
        <LinearGradient
          colors={[
            'transparent',
            `${ColorTokens.info[600]}80`,
            `${ColorTokens.info[600]}CC`,
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
            variant="info"
            size="sm"
            containerStyle={{ marginBottom: Tokens.spacing['2'] }}
          >
            🌙 Sono
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
          <Text variant="body" size="sm" color="inverse" style={{ opacity: 0.9 }}>
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

      {/* Chat with NathIA - Design Aprimorado */}
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
          borderColor: `${ColorTokens.primary[300]}50`,
          ...getPlatformShadow('xl'),
        }}
      >
        <LinearGradient
          colors={[ColorTokens.primary[400], ColorTokens.secondary[400], ColorTokens.secondary[500]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            padding: Tokens.spacing['6'],
          }}
        >
          {/* Header com Avatar e Badge */}
          <Box direction="row" align="center" justify="space-between" mb="4">
            <Box direction="row" align="center" gap="3" flex={1}>
              <View style={{ position: 'relative' }}>
                <Avatar
                  size={56}
                  source={{ uri: 'https://i.imgur.com/oB9ewPG.jpg' }}
                  name="NathIA"
                  fallback="N"
                  borderWidth={2}
                  borderColor={`${ColorTokens.neutral[0]}80`}
                  useGradientFallback
                />
                {/* Indicador Online */}
                <View
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    width: 14,
                    height: 14,
                    borderRadius: 7,
                    backgroundColor: ColorTokens.success[500],
                    borderWidth: 2,
                    borderColor: ColorTokens.neutral[0],
                  }}
                />
              </View>
              <Box flex={1}>
                <Text
                  variant="body"
                  size="xl"
                  weight="bold"
                  color="inverse"
                  style={{ marginBottom: Tokens.spacing['1'] }}
                >
                  Converse com a NathIA
                </Text>
                <Badge
                  variant="success"
                  size="sm"
                  containerStyle={{
                    backgroundColor: `${ColorTokens.success[500]}33`,
                    borderWidth: 1,
                    borderColor: `${ColorTokens.neutral[0]}50`,
                  }}
                >
                  <MessageCircle size={10} color={ColorTokens.neutral[0]} />
                  <Text variant="caption" size="xs" color="inverse" style={{ marginLeft: 4 }}>
                    ONLINE
                  </Text>
                </Badge>
              </Box>
            </Box>
            {/* Botão de Microfone */}
            <IconButton
              icon={<Mic size={20} color={ColorTokens.neutral[0]} />}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                navigation.navigate('Chat');
              }}
              accessibilityLabel="Iniciar gravação de voz"
              variant="ghost"
              size="md"
              style={{
                backgroundColor: `${ColorTokens.neutral[0]}20`,
              }}
            />
          </Box>

          {/* Descrição */}
          <Text
            variant="body"
            size="sm"
            color="inverse"
            style={{ opacity: 0.95, marginBottom: Tokens.spacing['4'], textAlign: 'center' }}
          >
            Apoio imediato, sem julgamentos. Estou aqui para você 💖
          </Text>

          {/* Badges Rápido e 24/7 */}
          <Box direction="row" align="center" justify="center" gap="2" mb="4">
            <Badge
              variant="default"
              size="sm"
              containerStyle={{
                backgroundColor: `${ColorTokens.neutral[0]}33`,
                borderWidth: 1,
                borderColor: `${ColorTokens.neutral[0]}50`,
              }}
            >
              <Zap size={12} color={ColorTokens.neutral[0]} />
              <Text variant="caption" size="xs" color="inverse" style={{ marginLeft: 4 }}>
                Rápido
              </Text>
            </Badge>
            <Badge
              variant="default"
              size="sm"
              containerStyle={{
                backgroundColor: `${ColorTokens.neutral[0]}40`,
                borderWidth: 1,
                borderColor: `${ColorTokens.neutral[0]}60`,
              }}
            >
              <MessageCircle size={12} color={ColorTokens.neutral[0]} />
              <Text variant="caption" size="xs" color="inverse" style={{ marginLeft: 4 }}>
                24/7
              </Text>
            </Badge>
          </Box>

          {/* Botões de ação */}
          <Box direction="row" gap="2">
            <Button
              title="Histórico"
              onPress={() => navigation.navigate('ChatSessions')}
              variant="outline"
              size="md"
              leftIcon={<Menu size={16} color={ColorTokens.neutral[0]} />}
              style={{
                flex: 1,
                backgroundColor: `${ColorTokens.neutral[0]}20`,
                borderColor: `${ColorTokens.neutral[0]}40`,
              }}
            />
            <Button
              title="Quero conversar"
              onPress={handleNathIAPress}
              variant="secondary"
              size="md"
              leftIcon={<Heart size={16} color={ColorTokens.primary[500]} />}
              style={{
                flex: 2,
                backgroundColor: ColorTokens.neutral[0],
              }}
              textStyle={{
                color: ColorTokens.primary[500],
                fontWeight: 'bold',
              }}
            />
          </Box>
        </LinearGradient>
      </TouchableOpacity>

        {/* SOS Mãe - Suporte Emergencial */}
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
            ...getPlatformShadow('md'),
          }}
        >
          <LinearGradient
            colors={[ColorTokens.error[500], ColorTokens.error[600]]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              padding: Tokens.spacing['6'],
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: 140,
            }}
          >
            <Box
              style={{
                width: 56,
                height: 56,
                borderRadius: Tokens.radius.full,
                backgroundColor: `${ColorTokens.neutral[0]}33`,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: Tokens.spacing['4'],
              }}
            >
              <AlertCircle size={28} color={ColorTokens.neutral[0]} />
            </Box>
            <Text
              variant="body"
              size="lg"
              weight="bold"
              color="inverse"
              style={{ textAlign: 'center', marginBottom: Tokens.spacing['2'] }}
            >
              SOS Mãe
            </Text>
            <Text variant="body" size="sm" color="inverse" style={{ opacity: 0.9, textAlign: 'center' }}>
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
