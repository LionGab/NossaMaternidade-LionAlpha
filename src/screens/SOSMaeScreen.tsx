/**
 * SOS Mãe Screen
 * Suporte emergencial para mães em momentos difíceis
 * Migrado de app-redesign-studio
 */

import * as Haptics from 'expo-haptics';
import * as Linking from 'expo-linking';
import {
  ArrowLeft,
  Share2,
  CheckCircle2,
  Phone,
  Heart,
  MessageCircle,
  Users,
} from 'lucide-react-native';
import React, { useState, useCallback } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Share,
  Platform,
  Alert,
} from 'react-native';
import Animated, {
  FadeIn,
  SlideInRight,
  SlideOutLeft,
  SlideInUp,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Box } from '@/components/primitives/Box';
import { Button } from '@/components/primitives/Button';
import { Text } from '@/components/primitives/Text';
import { useTheme } from '@/theme';
import { Tokens } from '@/theme/tokens';
import { logger } from '@/utils/logger';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/navigation/types';
import {
  SentimentType,
  CommunityTestimonial,
  SENTIMENT_OPTIONS,
  EMERGENCY_CONTACTS,
} from '@/types/sos';

type SOSPhase = 'analyzing' | 'support' | 'testimonial' | 'complete';
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

// ============================================
// SENTIMENT ANALYZER COMPONENT
// ============================================
interface SentimentAnalyzerProps {
  onSentimentSelected: (sentiment: SentimentType, text?: string) => void;
}

const SentimentAnalyzer: React.FC<SentimentAnalyzerProps> = ({
  onSentimentSelected,
}) => {
  const { colors } = useTheme();
  const [selectedSentiment, setSelectedSentiment] = useState<SentimentType | null>(null);
  const [customText, setCustomText] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  const handleSelect = useCallback(
    (sentiment: SentimentType) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setSelectedSentiment(sentiment);
      setShowCustomInput(true);
    },
    []
  );

  const handleContinue = useCallback(() => {
    if (selectedSentiment) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onSentimentSelected(selectedSentiment, customText);
    }
  }, [selectedSentiment, customText, onSentimentSelected]);

  return (
    <Animated.View entering={FadeIn.duration(300)}>
      <Box p="4" gap="5">
        {/* Header */}
        <Box gap="2" align="center">
          <Text style={{ fontSize: 48 }}>💖</Text>
          <Text
            variant="body"
            size="xl"
            weight="bold"
            align="center"
            style={{ color: colors.text.primary }}
          >
            Como você está se sentindo agora?
          </Text>
          <Text
            variant="body"
            size="sm"
            align="center"
            style={{ color: colors.text.secondary }}
          >
            Estamos aqui com você. Escolha o que mais representa seu momento.
          </Text>
        </Box>

        {/* Sentiment Options */}
        <Box gap="2">
          {SENTIMENT_OPTIONS.map((option) => {
            const isSelected = selectedSentiment === option.type;
            return (
              <TouchableOpacity
                key={option.type}
                onPress={() => handleSelect(option.type)}
                accessibilityRole="button"
                accessibilityLabel={option.label}
                accessibilityState={{ selected: isSelected }}
                style={{
                  backgroundColor: isSelected
                    ? option.color
                    : colors.background.card,
                  borderRadius: Tokens.radius['2xl'],
                  padding: Tokens.spacing['4'],
                  borderWidth: 2,
                  borderColor: isSelected ? option.color : colors.border.light,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: Tokens.spacing['3'],
                }}
              >
                <Text style={{ fontSize: 28 }}>{option.emoji}</Text>
                <Text
                  variant="body"
                  size="md"
                  weight="semibold"
                  style={{
                    color: isSelected ? '#FFFFFF' : colors.text.primary,
                  }}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </Box>

        {/* Custom Input */}
        {showCustomInput && (
          <Animated.View entering={SlideInUp.duration(200)}>
            <Box gap="3">
              <Text
                variant="body"
                size="sm"
                weight="semibold"
                style={{ color: colors.text.secondary }}
              >
                Quer contar mais? (opcional)
              </Text>
              <TextInput
                placeholder="Escreva o que você está sentindo..."
                placeholderTextColor={colors.text.placeholder}
                value={customText}
                onChangeText={setCustomText}
                multiline
                numberOfLines={3}
                style={{
                  backgroundColor: colors.background.input,
                  borderRadius: Tokens.radius.xl,
                  padding: Tokens.spacing['4'],
                  color: colors.text.primary,
                  fontSize: Tokens.typography.sizes.md,
                  minHeight: 100,
                  textAlignVertical: 'top',
                }}
              />
              <Button
                title="Continuar"
                onPress={handleContinue}
                style={{
                  backgroundColor: Tokens.colors.coral[500],
                }}
              />
            </Box>
          </Animated.View>
        )}
      </Box>
    </Animated.View>
  );
};

// ============================================
// SUPPORT CARDS COMPONENT
// ============================================
interface SupportCardsProps {
  sentiment: SentimentType;
  onContinue: () => void;
}

const SupportCards: React.FC<SupportCardsProps> = ({ sentiment, onContinue }) => {
  const { colors } = useTheme();

  const handleCallEmergency = useCallback(async (phone: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    const url = `tel:${phone}`;
    const canOpen = await Linking.canOpenURL(url);

    if (canOpen) {
      await Linking.openURL(url);
      logger.info('Emergency call initiated', { phone });
    } else {
      Alert.alert(
        'Não foi possível abrir',
        `Por favor, ligue para ${phone}`,
        [{ text: 'OK' }]
      );
    }
  }, []);

  const supportMessages: Record<SentimentType, string> = {
    sobrecarregada:
      'É muito difícil carregar tanto peso. Você não precisa fazer tudo sozinha.',
    ansiosa:
      'A ansiedade pode ser paralisante, mas ela passa. Respire fundo, estamos aqui.',
    triste:
      'É ok não estar bem. Seus sentimentos são válidos e merecem atenção.',
    irritada:
      'A raiva é um sinal de que algo precisa mudar. Vamos cuidar de você.',
    sozinha:
      'Você não está sozinha, mesmo quando parece. Milhares de mães sentem o mesmo.',
    desesperada:
      'Este momento vai passar. Você é mais forte do que pensa. Busque ajuda.',
    culpada:
      'A culpa materna é real, mas não te define. Você está fazendo o seu melhor.',
    cansada:
      'O cansaço extremo é real. Você precisa e merece descansar.',
  };

  return (
    <Animated.View
      entering={SlideInRight.duration(300)}
      exiting={SlideOutLeft.duration(200)}
    >
      <Box gap="4" p="4">
        {/* Empathy Message */}
        <Box
          p="5"
          gap="3"
          align="center"
          style={{
            backgroundColor: `${Tokens.colors.coral[500]}15`,
            borderRadius: Tokens.radius['3xl'],
            borderWidth: 2,
            borderColor: `${Tokens.colors.coral[500]}30`,
          }}
        >
          <Text style={{ fontSize: 48 }}>💖</Text>
          <Text
            variant="body"
            size="lg"
            align="center"
            weight="medium"
            style={{ color: colors.text.primary }}
          >
            {supportMessages[sentiment]}
          </Text>
        </Box>

        {/* Emergency Contacts */}
        <Box gap="2">
          <Text
            variant="body"
            size="sm"
            weight="bold"
            style={{ color: colors.text.secondary }}
          >
            Se precisar de ajuda profissional:
          </Text>

          {EMERGENCY_CONTACTS.map((contact) => (
            <TouchableOpacity
              key={contact.phone}
              onPress={() => handleCallEmergency(contact.phone)}
              accessibilityRole="button"
              accessibilityLabel={`Ligar para ${contact.name}`}
              style={{
                backgroundColor: colors.background.card,
                borderRadius: Tokens.radius['2xl'],
                padding: Tokens.spacing['4'],
                borderWidth: 1,
                borderColor: colors.border.light,
                flexDirection: 'row',
                alignItems: 'center',
                gap: Tokens.spacing['3'],
              }}
            >
              <Box
                align="center"
                justify="center"
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  backgroundColor: `${Tokens.colors.success[500]}20`,
                }}
              >
                <Phone size={24} color={Tokens.colors.success[600]} />
              </Box>
              <Box flex={1}>
                <Text
                  variant="body"
                  size="md"
                  weight="semibold"
                  style={{ color: colors.text.primary }}
                >
                  {contact.name}
                </Text>
                <Text
                  variant="caption"
                  size="xs"
                  style={{ color: colors.text.tertiary }}
                >
                  {contact.description}
                </Text>
              </Box>
              <Box
                px="3"
                py="2"
                style={{
                  backgroundColor: Tokens.colors.success[500],
                  borderRadius: Tokens.radius.full,
                }}
              >
                <Text
                  variant="caption"
                  size="sm"
                  weight="bold"
                  style={{ color: '#FFFFFF' }}
                >
                  {contact.phone}
                </Text>
              </Box>
            </TouchableOpacity>
          ))}
        </Box>

        {/* Continue Button */}
        <Button
          title="Ver histórias de outras mães"
          onPress={onContinue}
          variant="outline"
          leftIcon={<Users size={20} color={colors.text.primary} />}
        />
      </Box>
    </Animated.View>
  );
};

// ============================================
// COMMUNITY TESTIMONIAL COMPONENT
// ============================================
interface TestimonialCardProps {
  testimonial: CommunityTestimonial;
  sentiment: SentimentType;
}

const TestimonialCard: React.FC<TestimonialCardProps> = ({
  testimonial,
  sentiment,
}) => {
  const { colors } = useTheme();
  const sentimentOption = SENTIMENT_OPTIONS.find((s) => s.type === sentiment);

  return (
    <Box
      p="5"
      gap="4"
      style={{
        backgroundColor: colors.background.card,
        borderRadius: Tokens.radius['3xl'],
        borderWidth: 2,
        borderColor: colors.border.light,
      }}
    >
      {/* Header */}
      <Box direction="row" align="center" gap="3">
        <Box
          align="center"
          justify="center"
          style={{
            width: 48,
            height: 48,
            borderRadius: 24,
            backgroundColor: `${sentimentOption?.color || colors.primary.main}20`,
          }}
        >
          <Text style={{ fontSize: 24 }}>
            {testimonial.isAnonymous ? '💙' : testimonial.authorInitials}
          </Text>
        </Box>
        <Box flex={1}>
          <Text
            variant="body"
            size="md"
            weight="semibold"
            style={{ color: colors.text.primary }}
          >
            {testimonial.isAnonymous ? 'Mãe Anônima' : testimonial.authorName}
          </Text>
          <Text variant="caption" size="xs" style={{ color: colors.text.tertiary }}>
            Também se sentiu {sentimentOption?.label.toLowerCase()}
          </Text>
        </Box>
      </Box>

      {/* Message */}
      <Text
        variant="body"
        size="md"
        style={{ color: colors.text.primary, lineHeight: 24 }}
      >
        &quot;{testimonial.message}&quot;
      </Text>

      {/* Stats */}
      <Box
        direction="row"
        align="center"
        gap="2"
        pt="3"
        style={{ borderTopWidth: 1, borderTopColor: colors.border.light }}
      >
        <Heart size={16} color={Tokens.colors.coral[500]} fill={Tokens.colors.coral[500]} />
        <Text variant="caption" size="sm" style={{ color: colors.text.tertiary }}>
          {testimonial.helpedCount} mães se sentiram acolhidas
        </Text>
      </Box>
    </Box>
  );
};

// ============================================
// MAIN SCREEN COMPONENT
// ============================================
export default function SOSMaeScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();

  const [phase, setPhase] = useState<SOSPhase>('analyzing');
  const [sentiment, setSentiment] = useState<SentimentType | null>(null);
  const [_inputText, setInputText] = useState<string>('');
  const [testimonial, setTestimonial] = useState<CommunityTestimonial | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Mock testimonial data
  const getTestimonial = useCallback(
    async (selectedSentiment: SentimentType): Promise<CommunityTestimonial> => {
      await new Promise((resolve) => setTimeout(resolve, 500));

      const testimonials: Record<SentimentType, CommunityTestimonial> = {
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
        setPhase('support');
      } catch (error) {
        logger.error('Error getting testimonial', error);
      } finally {
        setIsLoading(false);
      }
    },
    [getTestimonial]
  );

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
      <View
        style={{
          flex: 1,
          backgroundColor: colors.background.canvas,
          paddingTop: insets.top,
        }}
      >
        {/* Header */}
        <Box
          direction="row"
          align="center"
          p="4"
          style={{ borderBottomWidth: 1, borderBottomColor: colors.border.light }}
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
                  backgroundColor: Tokens.colors.coral[500],
                }}
              >
                <CheckCircle2 size={40} color="#FFFFFF" />
              </Box>

              {/* Success Message */}
              <Box gap="2" align="center">
                <Text
                  variant="body"
                  size="2xl"
                  weight="bold"
                  align="center"
                  style={{ color: Tokens.colors.coral[500] }}
                >
                  Você está segura 💖
                </Text>
                <Text
                  variant="body"
                  size="lg"
                  align="center"
                  style={{ color: colors.text.secondary }}
                >
                  Você dedicou este momento para cuidar de si mesma. Isso é importante.
                </Text>
              </Box>

              {/* Actions */}
              <Box gap="3" style={{ width: '100%' }}>
                <Button
                  title="Conversar com NathIA"
                  onPress={handleGoToChat}
                  leftIcon={<MessageCircle size={20} color="#FFFFFF" />}
                  style={{ backgroundColor: colors.primary.main }}
                />
                <Button
                  title="Compartilhar"
                  onPress={handleShare}
                  variant="outline"
                  leftIcon={<Share2 size={20} color={colors.text.primary} />}
                />
                <Button
                  title="Voltar para Home"
                  onPress={handleGoBack}
                  variant="ghost"
                />
              </Box>
            </Box>
          </Animated.View>
        </ScrollView>
      </View>
    );
  }

  // ============================================
  // RENDER: MAIN FLOW
  // ============================================
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.background.canvas,
        paddingTop: insets.top,
      }}
    >
      {/* Header */}
      <Box
        direction="row"
        align="center"
        p="4"
        gap="3"
        style={{ borderBottomWidth: 1, borderBottomColor: colors.border.light }}
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
          <Text
            variant="body"
            size="lg"
            weight="bold"
            style={{ color: Tokens.colors.coral[500] }}
          >
            🆘 SOS Mãe
          </Text>
          <Text variant="caption" size="xs" style={{ color: colors.text.tertiary }}>
            Estamos aqui com você
          </Text>
        </Box>
      </Box>

      {/* Content */}
      <ScrollView
        contentContainerStyle={{
          paddingBottom: insets.bottom + Tokens.spacing['8'],
        }}
      >
        {isLoading ? (
          <Box flex={1} align="center" justify="center" py="16">
            <ActivityIndicator size="large" color={Tokens.colors.coral[500]} />
            <Text style={{ color: colors.text.secondary, marginTop: Tokens.spacing['4'] }}>
              Preparando seu acolhimento...
            </Text>
          </Box>
        ) : (
          <>
            {phase === 'analyzing' && (
              <SentimentAnalyzer onSentimentSelected={handleSentimentSelected} />
            )}

            {phase === 'support' && sentiment && (
              <SupportCards
                sentiment={sentiment}
                onContinue={() => setPhase('testimonial')}
              />
            )}

            {phase === 'testimonial' && sentiment && testimonial && (
              <Box p="4" gap="4">
                <Box gap="2" align="center">
                  <Text
                    variant="body"
                    size="lg"
                    weight="bold"
                    align="center"
                    style={{ color: colors.text.primary }}
                  >
                    Você não está sozinha
                  </Text>
                  <Text
                    variant="body"
                    size="sm"
                    align="center"
                    style={{ color: colors.text.secondary }}
                  >
                    Outra mãe que também se sentiu assim:
                  </Text>
                </Box>

                <TestimonialCard testimonial={testimonial} sentiment={sentiment} />

                <Box direction="row" gap="3">
                  <Button
                    title="Compartilhar"
                    onPress={handleShare}
                    variant="outline"
                    style={{ flex: 1 }}
                    leftIcon={<Share2 size={18} color={colors.text.primary} />}
                  />
                  <Button
                    title="Finalizar"
                    onPress={handleComplete}
                    style={{
                      flex: 1,
                      backgroundColor: Tokens.colors.coral[500],
                    }}
                  />
                </Box>
              </Box>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

