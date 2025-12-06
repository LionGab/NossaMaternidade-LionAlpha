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
import { Play, Heart, Search, Lightbulb, Info, MessageCircle, Zap, Menu, Mic, Sun, Moon, Sparkles, Users } from 'lucide-react-native';
import React from 'react';
import { ScrollView, TouchableOpacity, View, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Avatar } from '@/components/Avatar';
import { Badge } from '@/components/Badge';
import { SafeAreaContainer } from '@/components/layout/SafeAreaContainer';
import { Box } from '@/components/atoms/Box';
import { Button } from '@/components/atoms/Button';
import { IconButton } from '@/components/atoms/IconButton';
import { Text } from '@/components/atoms/Text';
import { ThemeToggle } from '@/components/ThemeToggle';
import { DesculpaHojeCard } from '@/components/guilt';
import { guiltService } from '@/services/guiltService';
import type { MainTabParamList, RootStackParamList } from '@/navigation/types';
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

// Determinar se é dia ou noite baseado no horário
const getTimeOfDay = () => {
  const hour = new Date().getHours();
  return hour >= 6 && hour < 18 ? 'day' : 'night';
};
const timeOfDay = getTimeOfDay();
const isDayTime = timeOfDay === 'day';

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

const handleDesculpaHojePress = () => {
  logger.info('Desculpa Hoje pressed', { screen: 'HomeScreen' });
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  navigation.navigate('DesculpaHoje');
};

const [selectedMood, setSelectedMood] = React.useState<string | null>(null);
const [streakDays, setStreakDays] = React.useState<number | null>(null);

// Carregar stats de "Desculpa Hoje" para exibir streak
React.useEffect(() => {
  const loadGuiltStats = async () => {
    try {
      const stats = await guiltService.getStats();
      if (stats) {
        setStreakDays(stats.streakDays);
      }
    } catch (error) {
      logger.error('[HomeScreen] Error loading guilt stats', error);
    }
  };
  loadGuiltStats();
}, []);

const handleMoodPress = (mood: { emoji: string; label: string }) => {
  logger.info('Mood selected', { mood: mood.label, screen: 'HomeScreen' });
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  setSelectedMood(mood.label);
  // TODO: Salvar emoção no Supabase
};

const moods = [
  { emoji: '😴', label: 'Cansada' },
  { emoji: '😊', label: 'Bem' },
  { emoji: '😰', label: 'Ansiosa' },
  { emoji: '😢', label: 'Triste' },
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
        paddingTop: insets.top + 80,
        paddingBottom: insets.bottom + 100,
        paddingHorizontal: Tokens.spacing['4'],
      }}
      showsVerticalScrollIndicator={false}
    >
      {/* Greeting */}
      <Box className="mb-6">
        <Box className="flex-row items-center gap-2 mb-1">
          {isDayTime ? (
            <Sun size={20} color={ColorTokens.warning[500]} />
          ) : (
            <Moon size={20} color={colors.primary.main} />
          )}
          <Text className="text-2xl font-bold">
            Olá, mãe
          </Text>
        </Box>
        <Text className="text-sm text-text-secondary">
          Respira um pouquinho. Estamos aqui por você.
        </Text>
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
          <Text variant="body" size="sm" color="inverse" style={{ opacity: 0.9, marginBottom: Tokens.spacing['3'] }}>
            Registre seu descanso e cuide de você
          </Text>
          <Box className="flex-row items-center gap-2">
            <Box
              style={{
                flex: 1,
                paddingVertical: Tokens.spacing['2'],
                paddingHorizontal: Tokens.spacing['4'],
                borderRadius: Tokens.radius['xl'],
                backgroundColor: `${ColorTokens.neutral[0]}33`,
                borderWidth: 1,
                borderColor: `${ColorTokens.neutral[0]}50`,
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: Tokens.touchTargets.min,
              }}
            >
              <Text variant="body" size="sm" weight="semibold" color="inverse">
                Registrar sono
              </Text>
            </Box>
          </Box>
        </LinearGradient>
      </TouchableOpacity>

      {/* Dica do Dia - Card Azul Escuro */}
      <Box
        className="rounded-3xl p-5 shadow-md border mb-6"
        style={{
          backgroundColor: ColorTokens.info[900],
          borderColor: `${ColorTokens.info[700]}50`,
        }}
      >
        <Box className="flex-row gap-3 items-start">
          <Box
            className="p-2 rounded-xl"
            style={{
              backgroundColor: `${ColorTokens.info[700]}80`,
            }}
          >
            <Lightbulb size={24} color={ColorTokens.neutral[0]} />
          </Box>
          <Box flex={1}>
            <Box className="flex-row items-center gap-2 mb-2">
              <Text variant="body" size="md" weight="bold" color="inverse">
                Dica do dia
              </Text>
              <Badge
                variant="info"
                size="sm"
                containerStyle={{
                  backgroundColor: ColorTokens.info[700],
                }}
              >
                Novo
              </Badge>
            </Box>
            <Text variant="body" size="sm" color="inverse" style={{ marginBottom: Tokens.spacing['3'], opacity: 0.9 }}>
              Respire fundo por 30 segundos. Isso ajuda a acalmar o sistema nervoso e traz clareza mental.
            </Text>
            <Button
              title="Saiba mais"
              onPress={() => navigation.navigate('Ritual')}
              leftIcon={<Info size={14} color={ColorTokens.neutral[0]} />}
              className="rounded-2xl border-2 border-white/40 bg-transparent px-4 py-2 min-h-[40px] flex-row items-center justify-center"
              textClassName="text-sm font-semibold text-white"
            />
          </Box>
        </Box>
      </Box>

      {/* Desculpa Hoje - Card usando componente DesculpaHojeCard */}
      <View
        style={{
          marginBottom: Tokens.spacing['6'],
        }}
      >
        <DesculpaHojeCard streakDays={streakDays} />
      </View>

      {/* Featured Content */}
      <Box className="mb-6">
        <Text className="text-lg font-semibold mb-3">
          Destaques de hoje
        </Text>
        <Text className="text-sm text-text-secondary mb-4">
          Selecionados especialmente para você
        </Text>

        <Box className="gap-3">
          {/* Video Card */}
          <Box className="bg-card rounded-3xl p-4 shadow-md border border-border-light">
            <Box className="flex-row gap-3">
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
                <Box className="flex-row items-center gap-2 mb-1">
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
                  Conteúdo especial preparado especialmente para você, feito com carinho para este momento.
                </Text>
              </Box>
            </Box>
          </Box>

          {/* Story Card */}
          <Box className="bg-card rounded-3xl p-4 shadow-md border border-border-light">
            <Box className="flex-row gap-3">
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
                <Box className="flex-row items-center gap-1">
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

      {/* Mundo Nath Preview - Scroll Horizontal */}
      <Box className="mb-6">
        <Box className="flex-row items-center justify-between mb-3">
          <Text className="text-lg font-semibold">
            Mundo da Nath
          </Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('MundoNath')}
            accessibilityRole="button"
            accessibilityLabel="Ver todos os conteúdos"
            accessibilityHint="Abre a tela com todos os conteúdos do Mundo da Nath"
          >
            <Text className="text-sm font-medium" style={{ color: colors.primary.main }}>
              Ver todos
            </Text>
          </TouchableOpacity>
        </Box>
        <Text className="text-sm text-text-secondary mb-4">
          Conteúdos feitos com carinho para você
        </Text>
        
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: Tokens.spacing['3'], paddingRight: Tokens.spacing['4'] }}
        >
          {/* Card 1 - Artigo */}
          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              navigation.navigate('MundoNath');
            }}
            activeOpacity={0.8}
            style={{
              width: 280,
              borderRadius: Tokens.radius['3xl'],
              overflow: 'hidden',
              ...getPlatformShadow('md'),
            }}
          >
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=200&fit=crop' }}
              style={{ width: '100%', height: 160 }}
              contentFit="cover"
            />
            <LinearGradient
              colors={[
                'transparent',
                `${ColorTokens.primary[600]}80`,
                `${ColorTokens.primary[600]}CC`,
              ]}
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                padding: Tokens.spacing['4'],
              }}
            >
              <Badge
                variant="default"
                size="sm"
                containerStyle={{ 
                  marginBottom: Tokens.spacing['2'],
                  backgroundColor: `${ColorTokens.neutral[0]}33`,
                  borderWidth: 1,
                  borderColor: `${ColorTokens.neutral[0]}50`,
                }}
              >
                <Text variant="caption" size="xs" color="inverse">
                  📖 Artigo
                </Text>
              </Badge>
              <Text
                variant="body"
                size="md"
                weight="bold"
                color="inverse"
              >
                5 dicas para equilibrar maternidade e trabalho
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Card 2 - Vídeo */}
          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              navigation.navigate('MundoNath');
            }}
            activeOpacity={0.8}
            style={{
              width: 280,
              borderRadius: Tokens.radius['3xl'],
              overflow: 'hidden',
              ...getPlatformShadow('md'),
            }}
          >
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=400&h=200&fit=crop' }}
              style={{ width: '100%', height: 160 }}
              contentFit="cover"
            />
            <LinearGradient
              colors={[
                'transparent',
                `${ColorTokens.secondary[600]}80`,
                `${ColorTokens.secondary[600]}CC`,
              ]}
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                padding: Tokens.spacing['4'],
              }}
            >
              <Badge
                variant="default"
                size="sm"
                containerStyle={{ 
                  marginBottom: Tokens.spacing['2'],
                  backgroundColor: `${ColorTokens.neutral[0]}33`,
                  borderWidth: 1,
                  borderColor: `${ColorTokens.neutral[0]}50`,
                }}
              >
                <Text variant="caption" size="xs" color="inverse">
                  🎥 Vídeo
                </Text>
              </Badge>
              <Text
                variant="body"
                size="md"
                weight="bold"
                color="inverse"
              >
                Meditação guiada para mães (8 min)
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Card 3 - Áudio */}
          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              navigation.navigate('MundoNath');
            }}
            activeOpacity={0.8}
            style={{
              width: 280,
              borderRadius: Tokens.radius['3xl'],
              overflow: 'hidden',
              ...getPlatformShadow('md'),
            }}
          >
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=400&h=200&fit=crop' }}
              style={{ width: '100%', height: 160 }}
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
                padding: Tokens.spacing['4'],
              }}
            >
              <Badge
                variant="default"
                size="sm"
                containerStyle={{ 
                  marginBottom: Tokens.spacing['2'],
                  backgroundColor: `${ColorTokens.neutral[0]}33`,
                  borderWidth: 1,
                  borderColor: `${ColorTokens.neutral[0]}50`,
                }}
              >
                <Text variant="caption" size="xs" color="inverse">
                  🎧 Áudio
                </Text>
              </Badge>
              <Text
                variant="body"
                size="md"
                weight="bold"
                color="inverse"
              >
                Podcast: Culpa materna - vamos falar?
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
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
          colors={['#FF6B9D', '#A855F7', '#3B82F6']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            padding: Tokens.spacing['6'],
          }}
        >
          {/* Header com Avatar e Badge */}
          <Box className="flex-row items-center justify-between mb-4">
            <Box className="flex-row items-center gap-3 flex-1">
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
          <Box className="flex-row items-center justify-center gap-2 mb-4">
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
          <Box className="flex-row gap-2">
            <Button
              title="Histórico"
              onPress={() => navigation.navigate('ChatSessions')}
              leftIcon={<Menu size={16} color={ColorTokens.neutral[0]} />}
              className="flex-1 flex-row items-center justify-center rounded-full border border-white/40 bg-white/20 px-4 py-3 min-h-[44px]"
              textClassName="text-sm font-semibold text-white"
            />
            <Button
              title="Quero conversar"
              onPress={handleNathIAPress}
              leftIcon={<Heart size={16} color={ColorTokens.primary[500]} />}
              className="flex-[2] flex-row items-center justify-center rounded-full bg-white px-5 py-3 min-h-[44px]"
              textClassName="text-sm font-semibold text-primary-500"
            />
          </Box>
        </LinearGradient>
      </TouchableOpacity>

      {/* Mood Check */}
      <Box className="bg-card rounded-3xl p-6 shadow-md border border-border-light mb-6">
        <Box className="flex-row items-center gap-2 mb-4">
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
            gap: Tokens.spacing['3'],
            justifyContent: 'space-between',
          }}
        >
          {moods.map((mood) => {
            const isSelected = selectedMood === mood.label;
            // Layout uniforme: todas as emoções com mesma largura (2 por linha, última linha com 1)
            // Calcula largura baseada no número de itens: (100% - gap) / 2
            const width = '48%';
            
            return (
              <TouchableOpacity
                key={mood.label}
                onPress={() => handleMoodPress(mood)}
                accessibilityRole="button"
                accessibilityLabel={`Estou me sentindo ${mood.label}`}
                accessibilityHint={`Registra que você está se sentindo ${mood.label} hoje`}
                accessibilityState={{ selected: isSelected }}
                style={{
                  width,
                  paddingVertical: Tokens.spacing['4'],
                  paddingHorizontal: Tokens.spacing['2'],
                  borderRadius: Tokens.radius['2xl'],
                  borderWidth: isSelected ? 2 : 1,
                  borderColor: isSelected ? colors.primary.main : colors.border.medium,
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: Tokens.touchTargets.min,
                  backgroundColor: isSelected ? `${colors.primary.main}15` : colors.background.canvas,
                }}
                activeOpacity={0.7}
              >
                <Text variant="body" size="2xl" style={{ marginBottom: Tokens.spacing['2'] }}>
                  {mood.emoji}
                </Text>
                <Text variant="body" size="sm" weight={isSelected ? 'semibold' : 'regular'}>
                  {mood.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </Box>
      </Box>

      {/* Mães Valente Preview - Comunidade */}
      <Box className="mb-6">
        <Box className="flex-row items-center justify-between mb-3">
          <Box className="flex-row items-center gap-2">
            <Text className="text-lg font-semibold">
              Mães Valente
            </Text>
            <Badge
              variant="default"
              size="sm"
              containerStyle={{
                backgroundColor: ColorTokens.warning[100],
                borderWidth: 1,
                borderColor: ColorTokens.warning[300],
              }}
            >
              <Text variant="caption" size="xs" style={{ color: ColorTokens.warning[700] }}>
                COMUNIDADE
              </Text>
            </Badge>
          </Box>
          <TouchableOpacity
            onPress={() => navigation.navigate('MaesValentes')}
            accessibilityRole="button"
            accessibilityLabel="Ver comunidade completa"
            accessibilityHint="Abre a tela da comunidade Mães Valente"
          >
            <Text className="text-sm font-medium" style={{ color: colors.primary.main }}>
              Ver todos
            </Text>
          </TouchableOpacity>
        </Box>
        <Text className="text-sm text-text-secondary mb-4">
          Mãe ajuda mãe 💜
        </Text>

        <Box className="gap-3">
          {/* Post 1 */}
          <Box className="bg-card rounded-3xl p-5 shadow-md border border-border-light">
            <Box className="flex-row items-start gap-3 mb-3">
              <Avatar
                size={40}
                source={{ uri: 'https://i.pravatar.cc/150?img=1' }}
                name="Ana Silva"
                fallback="AS"
                borderWidth={2}
                borderColor={colors.border.light}
              />
              <Box flex={1}>
                <Box className="flex-row items-center gap-2 mb-1">
                  <Text variant="body" size="sm" weight="semibold">
                    Ana Silva
                  </Text>
                  <Badge
                    variant="default"
                    size="sm"
                    containerStyle={{
                      backgroundColor: ColorTokens.success[100],
                      borderWidth: 1,
                      borderColor: ColorTokens.success[300],
                    }}
                  >
                    <Text variant="caption" size="xs" style={{ color: ColorTokens.success[700] }}>
                      Verificada
                    </Text>
                  </Badge>
                </Box>
                <Text variant="caption" size="xs" color="tertiary">
                  Há 2 horas
                </Text>
              </Box>
            </Box>

            <Text variant="body" size="sm" style={{ marginBottom: Tokens.spacing['3'], lineHeight: 20 }}>
              Hoje acordei às 5h, preparei café, dei banho nos 3, levei na escola e ainda consegui trabalhar. 
              Mas sabe? Tá tudo bem não ser perfeita. Estamos fazendo o nosso melhor! 💪
            </Text>

            <Box className="flex-row items-center gap-4">
              <TouchableOpacity className="flex-row items-center gap-1">
                <Heart size={16} color={colors.text.tertiary} />
                <Text variant="caption" size="xs" color="tertiary">
                  234
                </Text>
              </TouchableOpacity>
              <TouchableOpacity className="flex-row items-center gap-1">
                <MessageCircle size={16} color={colors.text.tertiary} />
                <Text variant="caption" size="xs" color="tertiary">
                  48
                </Text>
              </TouchableOpacity>
            </Box>
          </Box>

          {/* Post 2 */}
          <Box className="bg-card rounded-3xl p-5 shadow-md border border-border-light">
            <Box className="flex-row items-start gap-3 mb-3">
              <Avatar
                size={40}
                source={{ uri: 'https://i.pravatar.cc/150?img=5' }}
                name="Mariana Costa"
                fallback="MC"
                borderWidth={2}
                borderColor={colors.border.light}
              />
              <Box flex={1}>
                <Text variant="body" size="sm" weight="semibold" style={{ marginBottom: 2 }}>
                  Mariana Costa
                </Text>
                <Text variant="caption" size="xs" color="tertiary">
                  Há 5 horas
                </Text>
              </Box>
            </Box>

            <Text variant="body" size="sm" style={{ marginBottom: Tokens.spacing['3'], lineHeight: 20 }}>
              Alguém mais sentindo culpa por precisar trabalhar? Queria ficar mais tempo com meu bebê 😢
            </Text>

            <Box className="flex-row items-center gap-4">
              <TouchableOpacity className="flex-row items-center gap-1">
                <Heart size={16} color={colors.text.tertiary} />
                <Text variant="caption" size="xs" color="tertiary">
                  156
                </Text>
              </TouchableOpacity>
              <TouchableOpacity className="flex-row items-center gap-1">
                <MessageCircle size={16} color={colors.text.tertiary} />
                <Text variant="caption" size="xs" color="tertiary">
                  89
                </Text>
              </TouchableOpacity>
            </Box>
          </Box>

          {/* CTA para criar post */}
          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              navigation.navigate('MaesValentes');
            }}
            activeOpacity={0.8}
            style={{
              borderRadius: Tokens.radius['3xl'],
              overflow: 'hidden',
              ...getPlatformShadow('md'),
            }}
          >
            <LinearGradient
              colors={[ColorTokens.warning[400], ColorTokens.warning[500]]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{
                padding: Tokens.spacing['5'],
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Box flex={1}>
                <Text variant="body" size="md" weight="bold" color="inverse" style={{ marginBottom: 4 }}>
                  Compartilhe sua história
                </Text>
                <Text variant="body" size="sm" color="inverse" style={{ opacity: 0.9 }}>
                  Sua voz importa. Crie um post!
                </Text>
              </Box>
              <Box
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: Tokens.radius['2xl'],
                  backgroundColor: `${ColorTokens.neutral[0]}33`,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Users size={24} color={ColorTokens.neutral[0]} />
              </Box>
            </LinearGradient>
          </TouchableOpacity>
        </Box>
      </Box>
    </ScrollView>
  </SafeAreaContainer>
);
}
