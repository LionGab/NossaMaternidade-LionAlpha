/**
 * ChatScreen - Design Estilo Claude Mobile (Dezembro 2025)
 *
 * Features:
 * - Interface minimalista e limpa
 * - Input flutuante com transição texto/voz
 * - Modo de voz fullscreen imersivo
 * - Mensagens com animações suaves
 * - Acessibilidade WCAG AAA
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { CompositeNavigationProp } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { ListRenderItemInfo } from '@shopify/flash-list';
import { FlashList, FlashListRef } from '@shopify/flash-list';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { ArrowLeft, Sparkles, Zap, Lock, CheckCircle2 } from 'lucide-react-native';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  AccessibilityInfo,
  Keyboard,
  Alert,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
  FadeIn,
  FadeInDown,
  FadeOut,
  Layout,
} from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { Avatar } from '@/components/Avatar';
import { VoiceMode } from '@/components/chat/VoiceMode';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { AIDisclaimerModal } from '@/components/molecules/AIDisclaimerModal';
import { NathIAChatInput } from '@/components/nathia/NathIAChatInput';
import { Box } from '@/components/primitives/Box';
import { ChatBubble } from '@/components/primitives/ChatBubble';
import { IconButton } from '@/components/primitives/IconButton';
import { Text } from '@/components/primitives/Text';
import { ThemeToggle } from '@/components/ThemeToggle';

import { useWellness } from '../features/wellness';
import { useHasConsent } from '../hooks/useConsent';
import type { RootStackParamList, MainTabParamList } from '../navigation/types';
import { chatService, ChatMessage } from '../services/chatService';
import { profileService } from '../services/profileService';
import { useTheme } from '../theme/ThemeContext';
import { Tokens, ColorTokens } from '../theme/tokens';
import {
  buildUserContext,
  generateDynamicChips,
  formatChipText,
  type DynamicChip,
} from '../utils/buildUserContext';
import { logger } from '../utils/logger';

// ======================
// CONSTANTES
// ======================

// Mensagem inicial de greeting (para uso futuro)
// const INITIAL_CHAT_GREETING = "Oi, mãe. Tô aqui com você. Como você está se sentindo agora?";
const AVATAR_URL = 'https://i.imgur.com/oB9ewPG.jpg';

// Chave para persistir estado de crise (segurança crítica)
const CRISIS_MODE_KEY = '@nathia:crisis_mode';
const CRISIS_DURATION_MS = 24 * 60 * 60 * 1000; // 24 horas

interface CrisisState {
  active: boolean;
  timestamp: string;
  expiresAt: number;
  level: 'severe' | 'critical';
}

const Spacing = Tokens.spacing;
const Radius = Tokens.radius;

const DEFAULT_CHIPS: DynamicChip[] = [
  { text: 'Meu bebê não dorme', emoji: '😴', priority: 1, category: 'sleep' },
  { text: 'Dica de alimentação', emoji: '🍎', priority: 2, category: 'practical' },
  { text: 'Estou exausta', emoji: '😔', priority: 1, category: 'emotional' },
  { text: 'O que fazer com cólica?', emoji: '🍼', priority: 2, category: 'practical' },
];

type ChatScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Chat'>,
  NativeStackNavigationProp<RootStackParamList>
>;

// ======================
// COMPONENTE: MessageBubble
// ======================

interface MessageBubbleProps {
  message: ChatMessage;
  isLatest: boolean;
}

const MessageBubble = React.memo(({ message, isLatest }: MessageBubbleProps) => {
  const bubbleRole: 'user' | 'assistant' = message.role === 'user' ? 'user' : 'assistant';

  return (
    <Animated.View entering={FadeInDown.duration(300).springify()} layout={Layout.springify()}>
      <ChatBubble
        role={bubbleRole}
        content={message.content}
        timestamp={message.created_at}
        avatar={bubbleRole === 'assistant' ? AVATAR_URL : undefined}
        isLatest={isLatest}
      />
    </Animated.View>
  );
});

MessageBubble.displayName = 'MessageBubble';

// ======================
// COMPONENTE: TypingIndicator
// ======================

const TypingIndicator = React.memo(() => {
  const { colors, isDark } = useTheme();
  const dot1 = useSharedValue(0);
  const dot2 = useSharedValue(0);
  const dot3 = useSharedValue(0);

  useEffect(() => {
    const animateDot = (dot: { value: number }, delay: number) => {
      setTimeout(() => {
        dot.value = withSpring(1, { damping: 8 }, () => {
          dot.value = withSpring(0, { damping: 8 });
        });
      }, delay);
    };

    const interval = setInterval(() => {
      animateDot(dot1, 0);
      animateDot(dot2, 150);
      animateDot(dot3, 300);
    }, 1200);

    return () => clearInterval(interval);
  }, [dot1, dot2, dot3]);

  const dotStyle1 = useAnimatedStyle(() => ({
    transform: [{ translateY: interpolate(dot1.value, [0, 1], [0, -8]) }],
    opacity: interpolate(dot1.value, [0, 1], [0.5, 1]),
  }));

  const dotStyle2 = useAnimatedStyle(() => ({
    transform: [{ translateY: interpolate(dot2.value, [0, 1], [0, -8]) }],
    opacity: interpolate(dot2.value, [0, 1], [0.5, 1]),
  }));

  const dotStyle3 = useAnimatedStyle(() => ({
    transform: [{ translateY: interpolate(dot3.value, [0, 1], [0, -8]) }],
    opacity: interpolate(dot3.value, [0, 1], [0.5, 1]),
  }));

  return (
    <Animated.View
      entering={FadeIn.duration(200)}
      exiting={FadeOut.duration(200)}
      style={styles.typingContainer}
    >
      <Image source={{ uri: AVATAR_URL }} style={styles.typingAvatar} contentFit="cover" />
      <View
        style={[
          styles.typingBubble,
          {
            backgroundColor: isDark ? ColorTokens.neutral[800] : ColorTokens.neutral[50],
            borderColor: isDark ? ColorTokens.neutral[700] : ColorTokens.neutral[200],
          },
        ]}
      >
        <View style={styles.typingDots}>
          <Animated.View
            style={[styles.typingDot, { backgroundColor: colors.primary.main }, dotStyle1]}
          />
          <Animated.View
            style={[styles.typingDot, { backgroundColor: colors.primary.main }, dotStyle2]}
          />
          <Animated.View
            style={[styles.typingDot, { backgroundColor: colors.primary.main }, dotStyle3]}
          />
        </View>
      </View>
    </Animated.View>
  );
});

TypingIndicator.displayName = 'TypingIndicator';

// ======================
// COMPONENTE: EmptyState
// ======================

interface EmptyStateProps {
  chips: DynamicChip[];
  onChipPress: (text: string) => void;
}

const EmptyState = React.memo(({ chips, onChipPress }: EmptyStateProps) => {
  const { isDark } = useTheme();

  return (
    <Animated.View entering={FadeIn.duration(500)} style={styles.emptyState}>
      {/* Avatar */}
      <View style={styles.emptyAvatar}>
        <Image source={{ uri: AVATAR_URL }} style={styles.emptyAvatarImage} contentFit="cover" />
        <LinearGradient
          colors={isDark ? ColorTokens.nathIA.gradient.dark : ColorTokens.nathIA.gradient.light}
          style={styles.avatarBadge}
        >
          <Sparkles size={12} color={ColorTokens.neutral[0]} />
        </LinearGradient>
      </View>

      {/* Nome */}
      <Text size="2xl" weight="bold" color="primary" style={{ marginTop: Spacing['4'] }}>
        NathIA
      </Text>

      {/* Descrição */}
      <Text
        color="tertiary"
        size="md"
        align="center"
        style={{ marginTop: Spacing['2'], maxWidth: 260 }}
      >
        Sua assistente maternal. Estou aqui para te ouvir e ajudar.
      </Text>

      {/* Chips de sugestão */}
      <View style={styles.chipsGrid}>
        {chips.slice(0, 4).map((chip, idx) => (
          <TouchableOpacity
            key={`${chip.text}-${idx}`}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onChipPress(formatChipText(chip));
            }}
            style={[
              styles.chip,
              {
                backgroundColor: isDark ? ColorTokens.neutral[800] : ColorTokens.neutral[0],
                borderColor: isDark ? ColorTokens.neutral[700] : ColorTokens.neutral[200],
              },
            ]}
            accessibilityRole="button"
            accessibilityLabel={`Sugestão: ${chip.text}`}
          >
            <Text style={{ marginRight: 6 }}>{chip.emoji}</Text>
            <Text size="sm" color="secondary" numberOfLines={1}>
              {chip.text}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </Animated.View>
  );
});

EmptyState.displayName = 'EmptyState';

// ======================
// COMPONENTE PRINCIPAL
// ======================

export default function ChatScreen() {
  const navigation = useNavigation<ChatScreenNavigationProp>();
  const { colors, isDark } = useTheme();
  const { profile } = useWellness();
  const insets = useSafeAreaInsets();

  // Estados
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [showVoiceMode, setShowVoiceMode] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [dynamicChips, setDynamicChips] = useState<DynamicChip[]>(DEFAULT_CHIPS);
  const [isScreenReaderEnabled, setIsScreenReaderEnabled] = useState(false);
  const [isCrisisMode, setIsCrisisMode] = useState(false); // Modo de crise - trava chat livre

  // Refs
  const flashListRef = useRef<FlashListRef<ChatMessage>>(null);

  // Animações
  // const scrollY = useSharedValue(0); // Para uso futuro com scroll animations
  const headerOpacity = useSharedValue(1);

  // ======================
  // EFEITOS
  // ======================

  useEffect(() => {
    AccessibilityInfo.isScreenReaderEnabled().then(setIsScreenReaderEnabled);
    const subscription = AccessibilityInfo.addEventListener(
      'screenReaderChanged',
      setIsScreenReaderEnabled
    );
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    if (profile) {
      const context = buildUserContext(profile);
      const chips = generateDynamicChips(context);
      if (chips.length > 0) setDynamicChips(chips);
    }
  }, [profile]);

  useEffect(() => {
    checkDisclaimerStatus();
    checkCrisisState();
    initializeChat();
  }, []);

  // Verificar estado de crise persistido (segurança crítica)
  const checkCrisisState = async () => {
    try {
      const stored = await AsyncStorage.getItem(CRISIS_MODE_KEY);
      if (stored) {
        const crisis: CrisisState = JSON.parse(stored);

        // Verificar se ainda está dentro do período de 24h
        if (crisis.active && Date.now() < crisis.expiresAt) {
          setIsCrisisMode(true);
          logger.info('[ChatScreen] Estado de crise restaurado', {
            level: crisis.level,
            expiresIn: Math.round((crisis.expiresAt - Date.now()) / (1000 * 60 * 60)) + 'h',
          });
        } else {
          // Expirou - limpar
          await AsyncStorage.removeItem(CRISIS_MODE_KEY);
          logger.info('[ChatScreen] Estado de crise expirado, removido');
        }
      }
    } catch (error) {
      logger.error('[ChatScreen] Erro ao verificar estado de crise', error);
    }
  };

  // Persistir estado de crise (chamado quando crise é detectada)
  const persistCrisisState = async (level: 'severe' | 'critical') => {
    try {
      const crisisState: CrisisState = {
        active: true,
        timestamp: new Date().toISOString(),
        expiresAt: Date.now() + CRISIS_DURATION_MS,
        level,
      };
      await AsyncStorage.setItem(CRISIS_MODE_KEY, JSON.stringify(crisisState));
      logger.warn('[ChatScreen] Estado de crise persistido', { level, expiresIn: '24h' });
    } catch (error) {
      logger.error('[ChatScreen] Erro ao persistir estado de crise', error);
    }
  };

  // ======================
  // FUNÇÕES
  // ======================

  const checkDisclaimerStatus = async () => {
    try {
      const accepted = await AsyncStorage.getItem('ai_disclaimer_accepted');
      setShowDisclaimer(accepted !== 'true');
    } catch (err) {
      logger.error('Erro ao verificar disclaimer', err);
      setShowDisclaimer(true);
    }
  };

  const handleAcceptDisclaimer = async () => {
    try {
      await AsyncStorage.setItem('ai_disclaimer_accepted', 'true');
      setShowDisclaimer(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (err) {
      logger.error('Erro ao salvar disclaimer', err);
    }
  };

  const initializeChat = async () => {
    setIsLoading(true);

    try {
      const conversations = await chatService.getConversations(1);

      if (conversations.length > 0) {
        const latestConv = conversations[0];
        setConversationId(latestConv.id);
        const msgs = await chatService.getMessages(latestConv.id);
        setMessages(msgs);
      }
    } catch (err) {
      logger.error('Erro ao inicializar chat', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Verificar consentimento para IA
  const { hasConsent: hasAIConsent, isLoading: isLoadingConsent } = useHasConsent('ai_processing');

  const handleSend = useCallback(
    async (customMessage?: string, options?: { clearInput?: boolean }) => {
      const messageContent = (customMessage ?? input).trim();
      if (!messageContent || isSending || isCrisisMode) return; // Bloquear envio em modo de crise

      // Verificar consentimento antes de enviar
      if (!isLoadingConsent && !hasAIConsent) {
        Alert.alert(
          'Consentimento Necessário',
          'Para usar o chat com NathIA, precisamos do seu consentimento para processamento por IA. Deseja conceder agora?',
          [
            { text: 'Cancelar', style: 'cancel' },
            {
              text: 'Ir para Configurações',
              onPress: () => {
                navigation.navigate('Consent', { mode: 'settings' });
              },
            },
          ]
        );
        return;
      }

      const shouldClearInput = options?.clearInput ?? !customMessage;

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      if (shouldClearInput) {
        Keyboard.dismiss();
      }

      let currentConversationId = conversationId;

      if (!currentConversationId) {
        try {
          const userProfile = await profileService.getCurrentProfile();
          if (!userProfile) {
            logger.warn('Usuário não autenticado');
            return;
          }
          const newConv = await chatService.createConversation({});
          if (!newConv) return;
          currentConversationId = newConv.id;
          setConversationId(newConv.id);
        } catch (err) {
          logger.error('Erro ao criar conversa', err);
          return;
        }
      }

      const userMessage: ChatMessage = {
        id: `temp-${Date.now()}`,
        conversation_id: currentConversationId,
        content: messageContent,
        role: 'user',
        created_at: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, userMessage]);
      if (shouldClearInput) {
        setInput('');
      }
      setIsSending(true);

      setTimeout(() => {
        flashListRef.current?.scrollToEnd({ animated: true });
      }, 100);

      try {
        // Verificar crise ANTES de enviar
        const { CrisisDetectionService } = await import('@/ai/moderation/CrisisDetectionService');
        const crisisResult = await CrisisDetectionService.detectCrisis(messageContent, true);

        // Ativar modo crise para critical E severe (não só critical)
        if (crisisResult.level === 'critical' || crisisResult.level === 'severe') {
          // ATIVAR MODO DE CRISE: Travar chat livre
          setIsCrisisMode(true);

          // PERSISTIR estado de crise por 24h (segurança crítica)
          await persistCrisisState(crisisResult.level as 'severe' | 'critical');

          // Exibir mensagem de crise com recursos humanos
          const crisisMessage: ChatMessage = {
            id: `crisis-${Date.now()}`,
            conversation_id: currentConversationId,
            content: `Entendo que você está passando por um momento muito difícil 💙

🆘 Por favor, procure ajuda profissional AGORA:

• CVV: 188 (24h, gratuito)
• SAMU: 192
• CAPS mais próximo

Você não está sozinha. Há pessoas prontas para te ajudar.`,
            role: 'assistant',
            created_at: new Date().toISOString(),
          };

          setMessages((prev) => [...prev, userMessage, crisisMessage]);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);

          // Não processar mensagem normalmente em modo de crise
          setIsSending(false);
          return;
        }

        const { userMsg, aiMsg } = await chatService.sendMessageWithAI(
          currentConversationId,
          messageContent
        );

        if (userMsg) {
          setMessages((prev) => prev.map((m) => (m.id === userMessage.id ? userMsg : m)));
        }

        if (aiMsg) {
          setMessages((prev) => [...prev, aiMsg]);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

          if (isScreenReaderEnabled) {
            AccessibilityInfo.announceForAccessibility(
              `NathIA respondeu: ${aiMsg.content.substring(0, 100)}`
            );
          }

          setTimeout(() => {
            flashListRef.current?.scrollToEnd({ animated: true });
          }, 100);
        }
      } catch (err) {
        logger.error('Erro ao enviar mensagem', err);
        setMessages((prev) => prev.filter((m) => m.id !== userMessage.id));
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      } finally {
        setIsSending(false);
      }
    },
    [
      conversationId,
      input,
      isScreenReaderEnabled,
      isSending,
      hasAIConsent,
      isLoadingConsent,
      navigation,
      isCrisisMode,
    ]
  );

  const handleVoiceSend = useCallback(
    (text: string) => {
      if (text.trim()) {
        handleSend(text.trim(), { clearInput: false });
      }
    },
    [handleSend]
  );

  const handleInputSend = useCallback(
    (text: string) => {
      handleSend(text, { clearInput: true });
    },
    [handleSend]
  );

  // ScrollHandler para animações de scroll (reservado para uso futuro)
  // Descomentar quando implementar animações de scroll no chat
  /*
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
      headerOpacity.value = interpolate(
        event.contentOffset.y,
        [0, 50],
        [1, 0.9],
        Extrapolate.CLAMP
      );
    },
  });
  */

  // ======================
  // RENDER
  // ======================

  const renderMessage = useCallback(
    (info: ListRenderItemInfo<ChatMessage>) => (
      <MessageBubble
        message={info.item}
        isLatest={info.index === messages.length - 1 && info.item.role === 'assistant'}
      />
    ),
    [messages.length]
  );

  const keyExtractor = useCallback((item: ChatMessage) => item.id, []);

  const headerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
  }));

  const hasMessages = messages.length > 0;

  return (
    <ErrorBoundary>
      <View style={[styles.container, { backgroundColor: colors.background.canvas }]}>
        <StatusBar style={isDark ? 'light' : 'dark'} />

        {/* Disclaimer Modal */}
        <AIDisclaimerModal
          visible={showDisclaimer}
          onAccept={handleAcceptDisclaimer}
          onDismiss={undefined}
        />

        {/* Voice Mode Overlay */}
        <VoiceMode
          visible={showVoiceMode}
          onClose={() => setShowVoiceMode(false)}
          onSend={handleVoiceSend}
          autoTranscribe={true}
        />

        {/* Disclaimer fixo no topo */}
        <Box
          p="2"
          style={{
            backgroundColor: isDark
              ? `${ColorTokens.warning[900]}33`
              : `${ColorTokens.warning[100]}CC`,
            borderBottomWidth: 1,
            borderBottomColor: colors.border.medium,
            paddingTop: insets.top,
          }}
        >
          <Text
            size="xs"
            style={{
              textAlign: 'center',
              color: isDark ? ColorTokens.warning[300] : ColorTokens.warning[800],
            }}
          >
            ⚠️ NathIA é apoio emocional. Não substitui médico ou psicólogo.
          </Text>
        </Box>

        {/* Header com gradiente */}
        <Animated.View
          style={[
            headerAnimatedStyle,
            {
              paddingTop: 0, // Removido insets.top pois já está no disclaimer
            },
          ]}
        >
          <LinearGradient
            colors={isDark ? ColorTokens.nathIA.gradient.dark : ColorTokens.nathIA.gradient.light}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              paddingHorizontal: Spacing['4'],
              paddingVertical: Spacing['4'],
            }}
          >
            <SafeAreaView edges={[]}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: Spacing['3'],
                  marginBottom: Spacing['3'],
                }}
              >
                <IconButton
                  icon={
                    <ArrowLeft
                      size={20}
                      color={isDark ? ColorTokens.neutral[0] : ColorTokens.neutral[900]}
                    />
                  }
                  onPress={() => navigation.goBack()}
                  accessibilityLabel="Voltar"
                  variant="ghost"
                />

                <Avatar
                  size={48}
                  source={{ uri: AVATAR_URL }}
                  fallback="N"
                  borderWidth={2}
                  borderColor={ColorTokens.overlay.light}
                  style={{
                    backgroundColor: ColorTokens.overlay.light,
                  }}
                />

                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing['1'] }}>
                    <Text
                      size="md"
                      weight="bold"
                      style={{ color: isDark ? ColorTokens.neutral[0] : ColorTokens.neutral[900] }}
                    >
                      NathIA
                    </Text>
                    <CheckCircle2
                      size={14}
                      color={ColorTokens.success[500]}
                      fill={ColorTokens.success[500]}
                    />
                  </View>
                  {/* Badge Online */}
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      marginTop: 2,
                      alignSelf: 'flex-start',
                      backgroundColor: isDark
                        ? ColorTokens.overlay.light
                        : `${ColorTokens.primary[500]}1A`,
                      paddingHorizontal: Spacing['2'],
                      paddingVertical: 2,
                      borderRadius: Radius.full,
                    }}
                  >
                    <Zap
                      size={10}
                      color={isDark ? ColorTokens.neutral[0] : ColorTokens.primary[600]}
                    />
                    <Text
                      size="xs"
                      weight="semibold"
                      style={{
                        color: isDark ? ColorTokens.neutral[0] : ColorTokens.primary[600],
                        marginLeft: 4,
                      }}
                    >
                      Online
                    </Text>
                  </View>
                </View>

                <ThemeToggle
                  variant="ghost"
                  iconColor={isDark ? ColorTokens.neutral[0] : ColorTokens.neutral[900]}
                />
              </View>

              {/* Badges Rápido e Profundo */}
              <View
                style={{
                  flexDirection: 'row',
                  gap: Spacing['2'],
                }}
              >
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: isDark
                      ? ColorTokens.overlay.light
                      : `${ColorTokens.primary[500]}1A`,
                    paddingHorizontal: Spacing['2.5'],
                    paddingVertical: Spacing['1'],
                    borderRadius: Radius.full,
                  }}
                >
                  <Zap
                    size={12}
                    color={isDark ? ColorTokens.neutral[0] : ColorTokens.primary[600]}
                  />
                  <Text
                    size="xs"
                    weight="semibold"
                    style={{
                      color: isDark ? ColorTokens.neutral[0] : ColorTokens.primary[600],
                      marginLeft: 4,
                    }}
                  >
                    Rápido
                  </Text>
                </View>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: isDark
                      ? ColorTokens.overlay.light
                      : `${ColorTokens.primary[500]}1A`,
                    paddingHorizontal: Spacing['2.5'],
                    paddingVertical: Spacing['1'],
                    borderRadius: Radius.full,
                  }}
                >
                  <Lock
                    size={12}
                    color={isDark ? ColorTokens.neutral[0] : ColorTokens.primary[600]}
                  />
                  <Text
                    size="xs"
                    weight="semibold"
                    style={{
                      color: isDark ? ColorTokens.neutral[0] : ColorTokens.primary[600],
                      marginLeft: 4,
                    }}
                  >
                    Profundo
                  </Text>
                </View>
              </View>
            </SafeAreaView>
          </LinearGradient>
        </Animated.View>

        {/* Messages ou Empty State */}
        {!hasMessages && !isLoading ? (
          <View style={{ flex: 1, paddingHorizontal: Spacing['4'], paddingTop: Spacing['6'] }}>
            {/* Mensagem inicial da NathIA */}
            <View style={{ flexDirection: 'row', gap: Spacing['3'], marginBottom: Spacing['4'] }}>
              <Avatar
                size={40}
                source={{ uri: AVATAR_URL }}
                fallback="N"
                borderWidth={0}
                useGradientFallback={true}
              />
              <View style={{ flex: 1, gap: Spacing['2'] }}>
                <Box
                  bg="card"
                  p="4"
                  rounded="3xl"
                  style={{
                    borderTopLeftRadius: Radius.lg,
                    borderWidth: 1,
                    borderColor: colors.border.light,
                    ...Tokens.shadows.card,
                  }}
                >
                  <Text size="sm" style={{ lineHeight: 20 }}>
                    Oi, mãe. Tô aqui com você. Como você está se sentindo agora?
                  </Text>
                </Box>
                {/* Quick replies */}
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: Spacing['2'] }}>
                  {dynamicChips.slice(0, 4).map((chip) => (
                    <TouchableOpacity
                      key={chip.text}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        handleSend(formatChipText(chip), { clearInput: false });
                      }}
                      activeOpacity={0.7}
                      style={{
                        paddingHorizontal: Spacing['3'],
                        paddingVertical: Spacing['2'],
                        borderRadius: Radius.full,
                        backgroundColor: isDark
                          ? ColorTokens.neutral[800]
                          : ColorTokens.neutral[100],
                        borderWidth: 0,
                      }}
                      accessibilityRole="button"
                      accessibilityLabel={`Sugestão: ${chip.text}`}
                    >
                      <Text size="xs" color="secondary" style={{ marginRight: 4 }}>
                        {chip.emoji}
                      </Text>
                      <Text size="xs" color="secondary">
                        {chip.text}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
          </View>
        ) : (
          <Animated.View style={styles.messagesContainer}>
            <FlashList
              ref={flashListRef}
              data={messages}
              renderItem={renderMessage}
              keyExtractor={keyExtractor}
              contentContainerStyle={{
                paddingHorizontal: Spacing['4'],
                paddingTop: Spacing['4'],
                paddingBottom: Spacing['4'],
              }}
              showsVerticalScrollIndicator={false}
              ListFooterComponent={isSending ? <TypingIndicator /> : null}
              onContentSizeChange={() => {
                flashListRef.current?.scrollToEnd({ animated: true });
              }}
              // ✅ Otimizações de performance (FlashList v2)
              drawDistance={300}
            />
          </Animated.View>
        )}

        {/* Input - componente NathIA (bloqueado em modo de crise) */}
        {!isCrisisMode ? (
          <NathIAChatInput
              value={input}
              onChangeText={setInput}
              onSend={handleInputSend}
              placeholder="Responder a NathIA..."
              sending={isSending || isLoading}
              multiline
              voiceEnabled
              onVoiceRequest={() => {
                Keyboard.dismiss();
                setShowVoiceMode(true);
              }}
              containerStyle={{
                borderTopWidth: 1,
                borderTopColor: colors.border.light,
              }}
              inputStyle={{
                fontSize: Tokens.typography.sizes.sm,
              }}
              accessibilityLabel="Campo de mensagem"
              accessibilityHint="Digite sua mensagem para a NathIA"
            />
        ) : (
          /* Banner de recursos de emergência em modo de crise - SEM botão de escape */
          <Box
            p="4"
            style={{
              backgroundColor: isDark
                ? `${ColorTokens.error[900]}33`
                : `${ColorTokens.error[100]}CC`,
              borderTopWidth: 2,
              borderTopColor: ColorTokens.error[500],
            }}
          >
            <Text
              size="sm"
              weight="semibold"
              style={{ marginBottom: Spacing['2'], textAlign: 'center' }}
            >
              💙 Você não está sozinha
            </Text>
            <Text
              size="xs"
              color="secondary"
              style={{ textAlign: 'center', marginBottom: Spacing['3'] }}
            >
              Ligue agora para conversar com alguém que pode ajudar
            </Text>
            <Box gap="2">
              <TouchableOpacity
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  // Abrir discador com CVV
                  import('react-native').then(({ Linking }) => {
                    Linking.openURL('tel:188');
                  });
                }}
                style={{
                  backgroundColor: ColorTokens.success[600],
                  paddingVertical: Spacing['3'],
                  paddingHorizontal: Spacing['4'],
                  borderRadius: Radius.xl,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: Spacing['2'],
                }}
                accessibilityRole="button"
                accessibilityLabel="Ligar para o CVV"
              >
                <Text size="sm" weight="bold" style={{ color: ColorTokens.neutral[0] }}>
                  📞 Ligar CVV (188)
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  import('react-native').then(({ Linking }) => {
                    Linking.openURL('tel:192');
                  });
                }}
                style={{
                  backgroundColor: isDark ? ColorTokens.neutral[700] : ColorTokens.neutral[200],
                  paddingVertical: Spacing['2.5'],
                  paddingHorizontal: Spacing['4'],
                  borderRadius: Radius.lg,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                accessibilityRole="button"
                accessibilityLabel="Ligar para o SAMU"
              >
                <Text size="xs" weight="semibold">
                  🏥 SAMU (192)
                </Text>
              </TouchableOpacity>
            </Box>
            <Text
              size="xs"
              color="tertiary"
              style={{ textAlign: 'center', marginTop: Spacing['3'] }}
            >
              Atendimento 24h, gratuito e sigiloso
            </Text>
          </Box>
        )}
      </View>
    </ErrorBoundary>
  );
}

// ======================
// ESTILOS
// ======================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
    marginTop: 100, // Account for header
  },
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingVertical: Spacing['2'],
  },
  typingAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: Spacing['2'],
  },
  typingBubble: {
    paddingHorizontal: Spacing['4'],
    paddingVertical: Spacing['3'],
    borderRadius: Radius.xl,
    borderBottomLeftRadius: Radius.sm,
    borderWidth: 1,
  },
  typingDots: {
    flexDirection: 'row',
    gap: 4,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing['6'],
    paddingBottom: 100,
  },
  emptyAvatar: {
    position: 'relative',
  },
  emptyAvatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: ColorTokens.neutral[0],
  },
  chipsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: Spacing['2'],
    marginTop: Spacing['8'],
    paddingHorizontal: Spacing['2'],
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing['4'],
    paddingVertical: Spacing['3'],
    borderRadius: Radius.full,
    borderWidth: 1,
    maxWidth: '48%',
    ...Tokens.shadows.sm,
  },
});
