/**
 * HomeScreen - Versão convertida do design web para React Native
 * Convertido do código web para React Native seguindo padrões do projeto
 *
 * Estrutura: Header (avatar + search + theme) → Saudação → Destaques → NathIA → Mood Check
 */

import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Moon, Sun, Play, Heart } from 'lucide-react-native';
import React, { useState } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Avatar } from '@/components/Avatar';
import { Badge } from '@/components/Badge';
import { Box } from '@/components/atoms/Box';
import { Button } from '@/components/atoms/Button';
import { SearchBarPill } from '@/components/atoms/SearchBarPill';
import { Text } from '@/components/atoms/Text';
import { ScreenLayout } from '@/components/templates/ScreenLayout';
import { ThemeToggle } from '@/components/ThemeToggle';
import type { MainTabParamList, RootStackParamList } from '@/navigation/types';
import { useTheme } from '@/theme';
import { Tokens, ColorTokens } from '@/theme/tokens';
import { logger } from '@/utils/logger';

type NavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Home'>,
  NativeStackNavigationProp<RootStackParamList>
>;

export default function HomeScreenWebConverted() {
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

  return (
    <>
      {/* Header fixo com backdrop-blur */}
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 40,
          paddingTop: insets.top,
          borderBottomWidth: 1,
          borderBottomColor: colors.border.light,
        }}
      >
        <BlurView
          intensity={80}
          tint={isDark ? 'dark' : 'light'}
          style={{
            paddingHorizontal: Tokens.spacing['4'],
            paddingVertical: Tokens.spacing['4'],
            backgroundColor: isDark
              ? `${colors.background.card}CC` // 80% opacity
              : `${colors.background.card}CC`, // 80% opacity
          }}
        >
          <Box direction="row" align="center" gap="3">
            {/* Avatar com foto real */}
            <View
              accessible={true}
              accessibilityLabel="Avatar de Nathália Valente"
              accessibilityRole="image"
            >
              <Avatar
                size={48}
                source={{ uri: 'https://i.imgur.com/8CpKlpW.jpg' }}
                fallback="NV"
                useGradientFallback={true}
                borderWidth={2}
                borderColor={`${colors.primary.main}4D`} // 30% opacity
              />
            </View>

            {/* Search Bar */}
            <Box flex={1}>
              <SearchBarPill
                placeholder="Onde..."
                onPress={handleSearchPress}
                size="md"
                hideIcon={true}
              />
            </Box>

            {/* Theme Toggle */}
            <ThemeToggle variant="outline" />
          </Box>
        </BlurView>
      </View>

      <ScreenLayout
        backgroundColor={colors.background.canvas}
        contentContainerStyle={{
          paddingTop: insets.top + 80, // Espaço para o header fixo + safe area
          paddingBottom: Tokens.spacing['12'],
        }}
      >
        {/* Main Content */}
        <Box px="4" py="6" style={{ gap: Tokens.spacing['6'] }}>
          {/* Greeting */}
          <Box direction="row" align="center" justify="space-between">
            <Box flex={1}>
              <Box
                direction="row"
                align="center"
                gap="2"
                style={{ marginBottom: Tokens.spacing['0.5'] }}
              >
                {isDayTime ? (
                  <Sun size={20} color={ColorTokens.warning[500]} />
                ) : (
                  <Moon size={20} color={colors.primary.main} />
                )}
                <Text size="2xl" weight="bold" color="primary">
                  Olá, mãe 🌙
                </Text>
              </Box>
              <Text size="sm" color="tertiary" style={{ marginTop: Tokens.spacing['0.5'] }}>
                Respira um pouquinho. Estamos aqui por você.
              </Text>
            </Box>
            <TouchableOpacity
              onPress={() => {
                // Theme toggle já está no header, mas mantendo para consistência com web
                // Pode ser usado para toggle local se necessário
              }}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={isDayTime ? 'Modo noturno' : 'Modo diurno'}
              accessibilityHint="Alterna entre modo claro e escuro"
              style={{
                width: 44,
                height: 44,
                borderRadius: Tokens.radius.full,
                backgroundColor: `${ColorTokens.warning[500]}33`, // 20% opacity
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Sun size={20} color={ColorTokens.warning[500]} />
            </TouchableOpacity>
          </Box>

          {/* Sleep Card - "Como você dormiu hoje?" */}
          <TouchableOpacity
            onPress={handleSleepCardPress}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="Como você dormiu hoje?"
            accessibilityHint="Toque para registrar seu descanso no diário"
          >
            <View
              style={{
                borderRadius: Tokens.radius['3xl'],
                overflow: 'hidden',
                ...Tokens.shadows.card,
              }}
            >
              <Image
                source={{ uri: 'https://i.imgur.com/w4rZvGG.jpg' }}
                style={{
                  width: '100%',
                  height: 160,
                }}
                contentFit="cover"
                accessible
                accessibilityLabel="Ilustração de mãe descansando"
              />
              {/* Overlay gradient de baixo para cima */}
              <LinearGradient
                colors={[ColorTokens.overlay.heavy, ColorTokens.overlay.darkGlass, 'transparent']}
                start={{ x: 0, y: 1 }}
                end={{ x: 0, y: 0 }}
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  top: 0,
                  bottom: 0,
                  pointerEvents: 'none',
                }}
              />
              <Box
                style={{
                  position: 'absolute',
                  bottom: Tokens.spacing['5'],
                  left: Tokens.spacing['5'],
                  right: Tokens.spacing['5'],
                  gap: Tokens.spacing['2'],
                }}
              >
                <View
                  style={{
                    alignSelf: 'flex-start',
                    backgroundColor: `${ColorTokens.primary[500]}E6`, // 90% opacity
                    paddingHorizontal: Tokens.spacing['2.5'],
                    paddingVertical: Tokens.spacing['1'],
                    borderRadius: Tokens.radius.full,
                  }}
                >
                  <Text
                    size="xs"
                    weight="medium"
                    style={{
                      color: ColorTokens.neutral[0],
                    }}
                  >
                    Sono
                  </Text>
                </View>
                <Text size="lg" weight="bold" color="inverse">
                  Como você dormiu hoje?
                </Text>
                <Text size="sm" color="inverse" style={{ opacity: 0.8 }}>
                  Registre seu descanso e cuide de você
                </Text>
              </Box>
            </View>
          </TouchableOpacity>

          {/* Featured Content */}
          <Box>
            <Text size="lg" weight="semibold" style={{ marginBottom: Tokens.spacing['3'] }}>
              Destaques de hoje
            </Text>
            <Text size="sm" color="tertiary" style={{ marginBottom: Tokens.spacing['4'] }}>
              Selecionados especialmente para você
            </Text>

            <Box style={{ gap: Tokens.spacing['3'] }}>
              {/* Video Card */}
              <TouchableOpacity
                onPress={() => {
                  logger.info('Video card pressed', { screen: 'HomeScreen' });
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel="Conteúdo especial de hoje"
                accessibilityHint="Toque para abrir o conteúdo em destaque"
              >
                <Box
                  bg="card"
                  p="4"
                  rounded="3xl"
                  shadow="card"
                  style={{
                    borderWidth: 1,
                    borderColor: colors.border.light,
                  }}
                >
                  <Box direction="row" gap="3">
                    <Box
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: Tokens.radius.xl,
                        backgroundColor: `${colors.primary.main}33`, // 20% opacity
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Play size={24} color={colors.primary.main} />
                    </Box>
                    <Box flex={1}>
                      <Box
                        direction="row"
                        align="center"
                        gap="2"
                        style={{ marginBottom: Tokens.spacing['0.5'] }}
                      >
                        <Badge variant="success" size="sm">
                          NOVO
                        </Badge>
                        <Text size="xs" color="tertiary">
                          Vídeo
                        </Text>
                      </Box>
                      <Text
                        size="md"
                        weight="semibold"
                        style={{ marginBottom: Tokens.spacing['0.5'] }}
                      >
                        Conteúdo especial de hoje
                      </Text>
                      <Text
                        size="sm"
                        color="tertiary"
                        style={{ marginBottom: Tokens.spacing['2'] }}
                      >
                        Algo que preparamos pensando em você.
                      </Text>
                      <Text size="xs" color="tertiary" italic>
                        Feito com carinho para este momento
                      </Text>
                    </Box>
                  </Box>
                </Box>
              </TouchableOpacity>

              {/* Story Card */}
              <TouchableOpacity
                onPress={() => {
                  logger.info('Story card pressed', { screen: 'HomeScreen' });
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel="História que tocou muitas mães"
                accessibilityHint="Toque para ler a história completa"
              >
                <Box
                  bg="card"
                  p="4"
                  rounded="3xl"
                  shadow="card"
                  style={{
                    borderWidth: 1,
                    borderColor: colors.border.light,
                  }}
                >
                  <Box direction="row" gap="3">
                    <Box
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: Tokens.radius.xl,
                        backgroundColor: `${colors.secondary.main}33`, // 20% opacity
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Heart size={24} color={colors.secondary.main} />
                    </Box>
                    <Box flex={1}>
                      <Box
                        direction="row"
                        align="center"
                        gap="2"
                        style={{ marginBottom: Tokens.spacing['0.5'] }}
                      >
                        <Text size="xs" color="secondary" weight="medium">
                          História real
                        </Text>
                      </Box>
                      <Text
                        size="md"
                        weight="semibold"
                        style={{ marginBottom: Tokens.spacing['0.5'] }}
                      >
                        História que tocou muitas mães
                      </Text>
                      <Text
                        size="sm"
                        color="tertiary"
                        style={{ marginBottom: Tokens.spacing['2'] }}
                      >
                        Uma jornada de amor e superação
                      </Text>
                      <Text size="xs" color="tertiary" italic>
                        Mais de mil mães se identificaram
                      </Text>
                      <Box
                        direction="row"
                        align="center"
                        gap="1"
                        style={{ marginTop: Tokens.spacing['2'] }}
                      >
                        <Heart size={12} color={colors.text.tertiary} />
                        <Text size="xs" color="tertiary">
                          1.234 mães
                        </Text>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              </TouchableOpacity>
            </Box>
          </Box>

          {/* Chat with NathIA */}
          <TouchableOpacity
            onPress={handleNathIAPress}
            activeOpacity={0.9}
            accessibilityRole="button"
            accessibilityLabel="Converse com a NathIA"
            accessibilityHint="Toque para abrir o chat com a assistente de IA"
          >
            <View
              style={{
                borderRadius: Tokens.radius['3xl'],
                overflow: 'hidden',
                ...Tokens.shadows.card,
              }}
            >
              <LinearGradient
                colors={
                  isDark ? ColorTokens.nathIA.gradient.dark : ColorTokens.nathIA.gradient.light
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  padding: Tokens.spacing['6'],
                  gap: Tokens.spacing['4'],
                }}
              >
                <Box direction="row" align="center" gap="3">
                  {/* Avatar com foto da NathIA */}
                  <View
                    accessible={true}
                    accessibilityLabel="Avatar da NathIA"
                    accessibilityRole="image"
                  >
                    <Avatar
                      size={48}
                      source={{ uri: 'https://i.imgur.com/RRIaE7t.jpg' }}
                      fallback="N"
                      borderWidth={2}
                      borderColor={ColorTokens.overlay.light}
                      style={{
                        backgroundColor: ColorTokens.overlay.light,
                      }}
                    />
                  </View>
                  {/* Badge "Disponível" com bg-success/20 */}
                  <View
                    style={{
                      backgroundColor: `${ColorTokens.success[500]}33`, // 20% opacity
                      paddingHorizontal: Tokens.spacing['2.5'],
                      paddingVertical: Tokens.spacing['1'],
                      borderRadius: Tokens.radius.full,
                    }}
                  >
                    <Text
                      size="xs"
                      weight="medium"
                      style={{
                        color: ColorTokens.success[500],
                      }}
                    >
                      Disponível
                    </Text>
                  </View>
                </Box>
                <Box>
                  <Text
                    size="xl"
                    weight="bold"
                    color="inverse"
                    style={{ marginBottom: Tokens.spacing['2'] }}
                  >
                    Converse com a NathIA
                  </Text>
                  <Text size="sm" color="inverse" style={{ opacity: 0.8 }}>
                    Apoio imediato, sem julgamentos.
                  </Text>
                </Box>
                <Button
                  title="Quero conversar"
                  variant="primary"
                  size="lg"
                  fullWidth
                  leftIcon={<Heart size={16} color={ColorTokens.nathIA.text.light} />}
                  onPress={handleNathIAPress}
                  style={{
                    backgroundColor: ColorTokens.nathIA.text.light,
                    borderRadius: Tokens.radius.xl,
                  }}
                  accessibilityLabel="Abrir chat com NathIA"
                  accessibilityHint="Inicia uma conversa com a assistente de IA"
                />
              </LinearGradient>
            </View>
          </TouchableOpacity>

          {/* Mood Check */}
          <Box
            bg="card"
            p="6"
            rounded="3xl"
            shadow="card"
            style={{
              borderWidth: 1,
              borderColor: colors.border.light,
            }}
          >
            <Box
              direction="row"
              align="center"
              gap="2"
              style={{ marginBottom: Tokens.spacing['4'] }}
            >
              <Text style={{ fontSize: 24 }}>🧡</Text>
              <Text size="md" weight="semibold">
                Como você está hoje?
              </Text>
            </Box>
            <Text size="sm" color="tertiary" style={{ marginBottom: Tokens.spacing['4'] }}>
              Toque na opção que mais combina com seu momento:
            </Text>
            {/* Grid 2 colunas perfeito */}
            <Box
              style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                gap: Tokens.spacing['2'],
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
                  onPress={() => handleMoodPress(mood)}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityLabel={`Selecionar humor: ${mood.label}`}
                  accessibilityHint={`Registra que você está se sentindo ${mood.label.toLowerCase()}`}
                  style={{
                    width: '48%',
                    paddingVertical: Tokens.spacing['3'],
                    paddingHorizontal: Tokens.spacing['4'],
                    borderRadius: Tokens.radius.xl,
                    borderWidth: 1,
                    borderColor: colors.border.medium,
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: Tokens.spacing['2'],
                    backgroundColor: colors.background.card,
                    minHeight: Tokens.touchTargets.min,
                  }}
                >
                  <Text style={{ fontSize: 24 }}>{mood.emoji}</Text>
                  <Text size="sm">{mood.label}</Text>
                </TouchableOpacity>
              ))}
            </Box>
          </Box>
        </Box>
      </ScreenLayout>
    </>
  );
}
