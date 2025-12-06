/**
 * SOS Mãe Screen
 * Suporte emergencial para mães em momentos difíceis
 * Migrado de app-redesign-studio-ab40635e/src/pages/SOSMae.tsx
 * Refatorado para usar componentes separados de src/components/sos/
 */

import * as Haptics from 'expo-haptics';
import {
  ArrowLeft,
  Share2,
  CheckCircle2,
  MessageCircle,
} from 'lucide-react-native';
import React, { useState, useCallback } from 'react';
import {
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Share,
  Platform,
  SafeAreaView,
} from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Box } from '@/components/atoms/Box';
import { Button } from '@/components/atoms/Button';
import { Text } from '@/components/atoms/Text';
import {
  SentimentAnalyzer,
  EmpathyAudioPlayer,
  CommunityTestimonial,
} from '@/components/sos';
import { useTheme } from '@/theme';
import { Tokens, ColorTokens } from '@/theme/tokens';
import { logger } from '@/utils/logger';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/navigation/types';
import {
  SentimentType,
  CommunityTestimonial as TestimonialType,
} from '@/types/sos';

type SOSPhase = 'analyzing' | 'audio' | 'testimonial' | 'complete';
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

// ============================================
// MAIN SCREEN COMPONENT
// ============================================
export default function SOSMaeScreen() {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();

  const [phase, setPhase] = useState<SOSPhase>('analyzing');
  const [sentiment, setSentiment] = useState<SentimentType | null>(null);
  const [inputText, setInputText] = useState<string>('');
  const [testimonial, setTestimonial] = useState<TestimonialType | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Mock testimonial data
  // TODO: Integrar com serviço real de depoimentos (Supabase)
  const getTestimonial = useCallback(
    async (selectedSentiment: SentimentType): Promise<TestimonialType> => {
      await new Promise((resolve) => setTimeout(resolve, 500));

      const testimonials: Record<SentimentType, TestimonialType> = {
        sobrecarregada: {
          id: '1',
          authorName: 'Maria',
          authorInitials: 'MA',
          sentiment: 'sobrecarregada',
          message:
            'Eu me sentia assim todos os dias. Achava que era só comigo. Descobrir que outras mães também se sentem assim foi libertador. Você não está falhando, você está vivendo a maternidade real.',
          helpedCount: 1234,
          createdAt: new Date().toISOString(),
          isAnonymous: false,
        },
        ansiosa: {
          id: '2',
          authorName: 'Ana',
          authorInitials: 'AN',
          sentiment: 'ansiosa',
          message:
            'A ansiedade me consumia. Mas aprendi que ela não me define. Pequenos passos, como respirar fundo e pedir ajuda, fizeram toda diferença. Você também vai conseguir.',
          helpedCount: 987,
          createdAt: new Date().toISOString(),
          isAnonymous: false,
        },
        triste: {
          id: '3',
          authorName: '',
          authorInitials: '',
          sentiment: 'triste',
          message:
            'A tristeza da maternidade é real e pouco falada. Não é frescura, não é falta de amor. É exaustão, é saudade de si mesma. Sinta, chore, e depois levante. Você é mais forte do que imagina.',
          helpedCount: 2156,
          createdAt: new Date().toISOString(),
          isAnonymous: true,
        },
        irritada: {
          id: '4',
          authorName: 'Carla',
          authorInitials: 'CA',
          sentiment: 'irritada',
          message:
            'Perdi a conta de quantas vezes gritei e me arrependi. A raiva é um sinal de que você precisa de uma pausa. Não se culpe, se cuide.',
          helpedCount: 876,
          createdAt: new Date().toISOString(),
          isAnonymous: false,
        },
        sozinha: {
          id: '5',
          authorName: '',
          authorInitials: '',
          sentiment: 'sozinha',
          message:
            'Rodeada de gente e ainda assim sozinha. Essa solidão da maternidade dói. Mas olha, você encontrou este app, e aqui tem milhares de mães que entendem. Estamos juntas.',
          helpedCount: 3421,
          createdAt: new Date().toISOString(),
          isAnonymous: true,
        },
        desesperada: {
          id: '6',
          authorName: 'Julia',
          authorInitials: 'JU',
          sentiment: 'desesperada',
          message:
            'Eu estava no fundo do poço. Mas pedir ajuda foi o primeiro passo. Não tenha vergonha de ligar para os números de apoio. Esse momento vai passar.',
          helpedCount: 1567,
          createdAt: new Date().toISOString(),
          isAnonymous: false,
        },
        culpada: {
          id: '7',
          authorName: 'Fernanda',
          authorInitials: 'FE',
          sentiment: 'culpada',
          message:
            'A culpa era minha companheira diária. Mas sabe o que aprendi? Mães perfeitas não existem. Mães que amam e tentam, sim. E você é uma delas.',
          helpedCount: 2890,
          createdAt: new Date().toISOString(),
          isAnonymous: false,
        },
        cansada: {
          id: '8',
          authorName: '',
          authorInitials: '',
          sentiment: 'cansada',
          message:
            'O cansaço que nenhum café resolve. Esse cansaço de alma, de corpo, de mente. Você não é fraca por estar assim. Você é humana. Descanse sem culpa.',
          helpedCount: 4123,
          createdAt: new Date().toISOString(),
          isAnonymous: true,
        },
      };

      return testimonials[selectedSentiment];
    },
    []
  );

  const handleSentimentSelected = useCallback(
    async (selectedSentiment: SentimentType, text?: string) => {
      setSentiment(selectedSentiment);
      setInputText(text || '');
      setIsLoading(true);

      try {
        const testimonialData = await getTestimonial(selectedSentiment);
        setTestimonial(testimonialData);
        setPhase('audio');
      } catch (error) {
        logger.error('Error getting testimonial', error);
      } finally {
        setIsLoading(false);
      }
    },
    [getTestimonial]
  );

  const handleAudioComplete = useCallback(() => {
    setPhase('testimonial');
  }, []);

  const handleComplete = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setPhase('complete');
    logger.info('SOS session completed', { sentiment });
  }, [sentiment]);

  const handleShare = useCallback(async () => {
    try {
      const message = `💖 Usei o SOS Mãe quando estava me sentindo ${sentiment}. Você não está sozinha. #NossaMaternidade #SOSMae`;

      if (Platform.OS === 'web') {
        await navigator.clipboard.writeText(message);
      } else {
        await Share.share({ message });
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      logger.error('Error sharing', error);
    }
  }, [sentiment]);

  const handleGoBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleGoToChat = useCallback(() => {
    navigation.navigate('Main', { screen: 'Chat' });
  }, [navigation]);

  // ============================================
  // RENDER: COMPLETE PHASE
  // ============================================
  if (phase === 'complete') {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: colors.background.canvas,
        }}
      >
        {/* Header */}
        <Box
          direction="row"
          align="center"
          p="4"
          style={{
            borderBottomWidth: 1,
            borderBottomColor: colors.border.light,
            paddingTop: insets.top + Tokens.spacing['4'],
          }}
        >
          <TouchableOpacity
            onPress={handleGoBack}
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              alignItems: 'center',
              justifyContent: 'center',
            }}
            accessibilityLabel="Voltar"
          >
            <ArrowLeft size={24} color={colors.text.primary} />
          </TouchableOpacity>
        </Box>

        <ScrollView
          contentContainerStyle={{
            padding: Tokens.spacing['4'],
            paddingBottom: insets.bottom + Tokens.spacing['8'],
          }}
        >
          <Animated.View entering={FadeIn.duration(500)}>
            <Box gap="6" align="center" py="8">
              {/* Success Icon */}
              <Box
                align="center"
                justify="center"
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 40,
                  backgroundColor: ColorTokens.secondary[500],
                }}
              >
                <CheckCircle2 size={40} color={ColorTokens.neutral[0]} />
              </Box>

              {/* Success Message */}
              <Box gap="2" align="center">
                <Text
                  size="2xl"
                  weight="bold"
                  align="center"
                  style={{ color: ColorTokens.secondary[500] }}
                >
                  Você está segura 💖
                </Text>
                <Text size="lg" align="center" color="secondary">
                  Você dedicou este momento para cuidar de si mesma. Isso é importante.
                </Text>
              </Box>

              {/* Actions */}
              <Box gap="3" style={{ width: '100%' }}>
                <Button
                  title="Conversar com NathIA"
                  onPress={handleGoToChat}
                  leftIcon={<MessageCircle size={20} color={ColorTokens.neutral[0]} />}
                  variant="primary"
                  size="lg"
                  fullWidth
                  style={{
                    backgroundColor: isDark ? ColorTokens.primary[600] : ColorTokens.primary[500],
                    borderRadius: Tokens.radius.xl,
                  }}
                />
                <Button
                  title="Compartilhar"
                  onPress={handleShare}
                  variant="outline"
                  size="lg"
                  fullWidth
                  leftIcon={<Share2 size={20} color={colors.text.primary} />}
                  style={{
                    borderRadius: Tokens.radius.xl,
                    borderWidth: 2,
                    borderColor: colors.primary.main,
                  }}
                />
                <Button
                  title="Voltar para Home"
                  onPress={handleGoBack}
                  variant="outline"
                  size="lg"
                  fullWidth
                  style={{
                    borderRadius: Tokens.radius.xl,
                  }}
                />
              </Box>
            </Box>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ============================================
  // RENDER: MAIN FLOW
  // ============================================
  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: colors.background.canvas,
      }}
    >
      {/* Header */}
      <Box
        direction="row"
        align="center"
        p="4"
        gap="3"
        style={{
          borderBottomWidth: 1,
          borderBottomColor: colors.border.light,
          paddingTop: insets.top + Tokens.spacing['4'],
        }}
      >
        <TouchableOpacity
          onPress={handleGoBack}
          style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            alignItems: 'center',
            justifyContent: 'center',
          }}
          accessibilityLabel="Voltar"
        >
          <ArrowLeft size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Box flex={1}>
          <Text size="lg" weight="bold" style={{ color: ColorTokens.secondary[500] }}>
            🆘 SOS Mãe
          </Text>
          <Text size="xs" color="tertiary">
            Estamos aqui com você
          </Text>
        </Box>
      </Box>

      {/* Content */}
      <ScrollView
        contentContainerStyle={{
          paddingBottom: insets.bottom + Tokens.spacing['8'],
        }}
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <Box align="center" justify="center" py="16">
            <ActivityIndicator size="large" color={ColorTokens.secondary[500]} />
            <Text size="sm" color="secondary" style={{ marginTop: Tokens.spacing['4'] }}>
              Preparando seu acolhimento...
            </Text>
          </Box>
        ) : (
          <>
            {phase === 'analyzing' && (
              <SentimentAnalyzer onSentimentSelected={handleSentimentSelected} />
            )}

            {phase === 'audio' && sentiment && (
              <Box p="4" gap="4">
                <EmpathyAudioPlayer
                  sentiment={sentiment}
                  text={inputText}
                  onComplete={handleAudioComplete}
                />
                <Button
                  title="Continuar"
                  onPress={handleAudioComplete}
                  variant="outline"
                  size="lg"
                  fullWidth
                  style={{
                    borderRadius: Tokens.radius['2xl'],
                  }}
                />
              </Box>
            )}

            {phase === 'testimonial' && sentiment && testimonial && (
              <Box p="4" gap="4">
                <CommunityTestimonial
                  testimonial={testimonial}
                  sentiment={sentiment}
                />

                <Box direction="row" gap="3">
                  <Button
                    title="Compartilhar"
                    onPress={handleShare}
                    variant="outline"
                    size="lg"
                    leftIcon={<Share2 size={18} color={colors.text.primary} />}
                    style={{ flex: 1 }}
                  />
                  <Button
                    title="Finalizar"
                    onPress={handleComplete}
                    variant="primary"
                    size="lg"
                    style={{
                      flex: 1,
                      backgroundColor: ColorTokens.secondary[500],
                    }}
                  />
                </Box>
              </Box>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
