/**
 * Ritual de Reconexão Screen
 * Exercícios de respiração e mindfulness para mães
 * Migrado de app-redesign-studio
 */

import * as Haptics from 'expo-haptics';
import {
  ArrowLeft,
  Clock,
  Heart,
  Sparkles,
  CheckCircle2,
  Play,
  Pause,
  SkipForward,
} from 'lucide-react-native';
import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import Animated, {
  FadeIn,
  SlideInRight,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Box } from '@/components/atoms/Box';
import { Button } from '@/components/atoms/Button';
import { Text } from '@/components/atoms/Text';
import {
  EmotionCheckIn,
  BreathingGuide,
  AudioGuide,
  AmbientSound,
  RitualProgress,
  RitualAnimations,
} from '@/components/ritual';
import { useTheme } from '@/theme';
import { Tokens, ColorTokens } from '@/theme/tokens';
import { logger } from '@/utils/logger';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/navigation/types';
import {
  RitualStep,
  EmotionState,
  EMOTION_OPTIONS,
  DEFAULT_BREATHING_CONFIG,
} from '@/types/ritual';
import type { AmbientSoundConfig } from '@/types/ritual';

type RitualPhase = 'preparation' | 'running' | 'completion';
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
export default function RitualScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();

  const [phase, setPhase] = useState<RitualPhase>('preparation');
  const [emotionBefore, setEmotionBefore] = useState<EmotionState | null>(null);
  const [emotionAfter, setEmotionAfter] = useState<EmotionState | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [ambientSoundConfig, setAmbientSoundConfig] = useState<AmbientSoundConfig>({
    type: 'rain',
    volume: 0.3,
    enabled: true,
  });
  const startTimeRef = useRef<number>(0);

  // Ritual Steps
  const steps: RitualStep[] = [
    {
      id: 'preparation',
      type: 'preparation',
      title: 'Preparação',
      description: 'Vamos reconectar você com você mesma em apenas alguns minutos.',
      content: 'Respire fundo e prepare-se para este momento especial. Este é um tempo só seu.',
      duration: 10,
      animationType: 'gradient',
    },
    {
      id: 'breathing',
      type: 'breathing',
      title: 'Respiração Consciente',
      description: 'Inspire profundamente pelo nariz... e expire pela boca.',
      content: 'Siga o guia visual. Sinta o ar entrando e saindo do seu corpo.',
      duration: 90,
      breathingConfig: DEFAULT_BREATHING_CONFIG,
      animationType: 'pulse',
    },
    {
      id: 'gratitude',
      type: 'gratitude',
      title: 'Gratidão',
      description: 'Pense em 3 coisas pelas quais você é grata hoje.',
      content:
        'Pode ser algo simples: um sorriso, um abraço, um momento de paz. Deixe sua mente viajar por esses momentos.',
      duration: 60,
      animationType: 'particles',
    },
    {
      id: 'intention',
      type: 'intention',
      title: 'Intenção do Dia',
      description: 'Qual é a sua intenção para hoje?',
      content:
        'Pense em uma palavra ou frase que vai guiar seu dia. Pode ser "paciência", "amor", "presença".',
      duration: 45,
      animationType: 'gradient',
    },
    {
      id: 'closing',
      type: 'closing',
      title: 'Encerramento',
      description: 'Este momento é só seu. Respire, sinta, reconecte-se.',
      content: 'Você dedicou este tempo para você mesma. Isso faz toda a diferença.',
      duration: 15,
      animationType: 'gradient',
    },
  ];

  const currentStep = steps[currentStepIndex];
  const progress = ((currentStepIndex + 1) / steps.length) * 100;
  const totalDuration = steps.reduce((sum, step) => sum + step.duration, 0);

  // Timer for non-breathing steps
  useEffect(() => {
    if (
      phase !== 'running' ||
      isPaused ||
      !currentStep ||
      currentStep.type === 'breathing'
    )
      return;

    // Set initial time outside interval
    const stepDuration = currentStep.duration;
    let remaining = stepDuration;
    setTimeRemaining(stepDuration);

    const timer = setInterval(() => {
      remaining -= 1;
      if (remaining <= 0) {
        clearInterval(timer);
        // Move to next step
        if (currentStepIndex < steps.length - 1) {
          setCurrentStepIndex((prev) => prev + 1);
        } else {
          setPhase('completion');
        }
        return;
      }
      setTimeRemaining(remaining);
    }, 1000);

    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStepIndex, phase, isPaused, steps.length]);

  const handleStepComplete = useCallback(() => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      setPhase('completion');
    }
  }, [currentStepIndex, steps.length]);

  const handleStartRitual = useCallback((emotion: EmotionState) => {
    setEmotionBefore(emotion);
    startTimeRef.current = Date.now();
    setPhase('running');
    setCurrentStepIndex(0);
    logger.info('Ritual started', { emotionBefore: emotion.emotion });
  }, []);

  const handleCompleteRitual = useCallback(
    (emotion: EmotionState) => {
      setEmotionAfter(emotion);
      const duration = Math.floor((Date.now() - startTimeRef.current) / 1000);
      logger.info('Ritual completed', {
        emotionBefore: emotionBefore?.emotion,
        emotionAfter: emotion.emotion,
        duration,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    },
    [emotionBefore]
  );

  const handleGoBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleSkipStep = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    handleStepComplete();
  }, [handleStepComplete]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // ============================================
  // RENDER: PREPARATION PHASE
  // ============================================
  if (phase === 'preparation') {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: colors.background.canvas,
        }}
      >
        <RitualAnimations animationType="gradient" progress={0} />
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
          <Box flex={1} ml="3">
            <Text size="lg" weight="bold" style={{ color: colors.primary.main }}>
              ✨ Ritual de Reconexão
            </Text>
            <Text size="xs" color="tertiary">
              ~{Math.ceil(totalDuration / 60)} minutos
            </Text>
          </Box>
        </Box>

        <EmotionCheckIn
          onComplete={handleStartRitual}
          context="before"
          title="Como você está se sentindo agora?"
          description="Vamos começar reconhecendo como você está neste momento."
        />
      </SafeAreaView>
    );
  }

  // ============================================
  // RENDER: COMPLETION PHASE
  // ============================================
  if (phase === 'completion') {
    const emotionImproved =
      emotionBefore &&
      emotionAfter &&
      EMOTION_OPTIONS.findIndex((e) => e.value === emotionAfter.emotion) >
        EMOTION_OPTIONS.findIndex((e) => e.value === emotionBefore.emotion);

    const totalDuration = Math.floor((Date.now() - startTimeRef.current) / 60);

    return (
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: colors.background.canvas,
        }}
      >
        <RitualAnimations animationType="particles" progress={100} />
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
          showsVerticalScrollIndicator={false}
        >
          {!emotionAfter ? (
            <EmotionCheckIn
              onComplete={handleCompleteRitual}
              context="after"
              title="Como você está se sentindo agora?"
              description="Vamos ver como você se sente após este momento de reconexão."
            />
          ) : (
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
                    backgroundColor: ColorTokens.success[500],
                    ...Tokens.shadows.xl,
                  }}
                >
                  <CheckCircle2 size={40} color={ColorTokens.neutral[0]} fill={ColorTokens.neutral[0]} />
                </Box>

                {/* Success Message */}
                <Box gap="2" align="center">
                  <Text
                    size="2xl"
                    weight="bold"
                    align="center"
                    style={{
                      color: isDark ? ColorTokens.primary[300] : ColorTokens.primary[600],
                    }}
                  >
                    Pausa Concluída! ✨
                  </Text>
                  <Text size="lg" align="center" color="secondary">
                    Você dedicou {totalDuration} minutos para você mesma. Isso faz toda a diferença.
                  </Text>
                </Box>

                {/* Emotion Journey */}
                {emotionBefore && emotionAfter && (
                  <Box
                    p="5"
                    gap="4"
                    style={{
                      backgroundColor: colors.background.card,
                      borderRadius: Tokens.radius['3xl'],
                      borderWidth: 2,
                      borderColor: colors.border.light,
                      width: '100%',
                      ...Tokens.shadows.xl,
                    }}
                  >
                    <Text size="lg" weight="bold" align="center">
                      Sua Jornada
                    </Text>
                    <Box direction="row" align="center" justify="space-between">
                      <Box align="center">
                        <Text size="4xl">{emotionBefore.emotion}</Text>
                        <Text size="xs" color="tertiary">
                          Antes
                        </Text>
                      </Box>
                      <View
                        style={{
                          flex: 1,
                          height: 4,
                          backgroundColor: colors.primary.main,
                          marginHorizontal: Tokens.spacing['3'],
                          borderRadius: 2,
                        }}
                      />
                      <Box align="center">
                        <Text size="4xl">{emotionAfter.emotion}</Text>
                        <Text size="xs" color="tertiary">
                          Depois
                        </Text>
                      </Box>
                    </Box>
                    {emotionImproved && (
                      <Text
                        size="sm"
                        weight="semibold"
                        align="center"
                        style={{ color: ColorTokens.success[600] }}
                      >
                        Você se sente melhor! 🎉
                      </Text>
                    )}
                  </Box>
                )}

                {/* Actions */}
                <Box gap="3" style={{ width: '100%' }}>
                  <Button
                    title="Conversar com NathIA"
                    onPress={() => navigation.navigate('Main', { screen: 'Chat' })}
                    leftIcon={<Heart size={20} color={ColorTokens.neutral[0]} />}
                    variant="primary"
                    size="lg"
                    fullWidth
                    style={{
                      borderRadius: Tokens.radius['2xl'],
                      backgroundColor: isDark ? ColorTokens.primary[600] : ColorTokens.primary[500],
                      ...Tokens.shadows.lg,
                    }}
                  />
                  <Button
                    title="Voltar para Home"
                    onPress={handleGoBack}
                    variant="outline"
                    size="lg"
                    fullWidth
                    style={{
                      borderRadius: Tokens.radius['2xl'],
                      borderWidth: 2,
                      borderColor: colors.primary.main,
                    }}
                  />
                </Box>
              </Box>
            </Animated.View>
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ============================================
  // RENDER: RUNNING PHASE
  // ============================================
  const { isDark } = useTheme();

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: colors.background.canvas,
      }}
    >
      <RitualAnimations
        animationType={currentStep?.animationType}
        stepType={currentStep?.type}
        progress={progress}
      />

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
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            if (currentStepIndex > 0) {
              navigation.goBack();
            } else {
              handleGoBack();
            }
          }}
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
          <Text size="base" weight="bold" style={{ color: colors.primary.main }}>
            Momento de Autocuidado
          </Text>
          <Text size="xs" color="tertiary">
            Passo {currentStepIndex + 1} de {steps.length}
          </Text>
        </Box>
        {currentStep?.type !== 'breathing' && (
          <Box
            direction="row"
            align="center"
            gap="1"
            px="3"
            py="1.5"
            style={{
              backgroundColor: isDark ? ColorTokens.neutral[800] : ColorTokens.neutral[100],
              borderRadius: Tokens.radius.full,
            }}
          >
            <Clock size={16} color={colors.text.tertiary} />
            <Text size="sm" weight="semibold" color="secondary">
              {formatTime(timeRemaining)}
            </Text>
          </Box>
        )}
      </Box>

      <ScrollView
        contentContainerStyle={{
          padding: Tokens.spacing['4'],
          paddingBottom: insets.bottom + Tokens.spacing['8'],
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Progress */}
        <RitualProgress
          steps={steps}
          currentStepIndex={currentStepIndex}
          progress={progress}
          timeRemaining={timeRemaining}
        />

        {/* Step Card */}
        <Animated.View
          key={currentStepIndex}
          entering={SlideInRight.duration(300)}
        >
          <Box
            p="5"
            gap="4"
            style={{
              backgroundColor: colors.background.card,
              borderRadius: Tokens.radius['3xl'],
              borderWidth: 2,
              borderColor: colors.border.light,
              ...Tokens.shadows.xl,
            }}
          >
            {/* Step Header */}
            <Box align="center" gap="3">
              <Box
                align="center"
                justify="center"
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 32,
                  backgroundColor: isDark ? ColorTokens.primary[600] : ColorTokens.primary[500],
                  ...Tokens.shadows.lg,
                }}
              >
                <Sparkles size={32} color={ColorTokens.neutral[0]} />
              </Box>
              <Box
                px="3"
                py="1"
                style={{
                  backgroundColor: `${colors.primary.main}20`,
                  borderRadius: Tokens.radius.full,
                }}
              >
                <Text size="xs" weight="semibold" style={{ color: colors.primary.main }}>
                  Passo {currentStepIndex + 1}
                </Text>
              </Box>
              <Text
                size="2xl"
                weight="bold"
                align="center"
                style={{
                  color: isDark ? ColorTokens.primary[300] : ColorTokens.primary[600],
                }}
              >
                {currentStep?.title}
              </Text>
              <Text size="lg" align="center" color="secondary" style={{ lineHeight: Tokens.typography.lineHeights.relaxed }}>
                {currentStep?.description}
              </Text>
            </Box>

            {/* Step Content */}
            {currentStep?.type === 'breathing' && currentStep.breathingConfig && (
              <BreathingGuide
                config={currentStep.breathingConfig}
                onComplete={handleStepComplete}
                autoStart={!isPaused}
              />
            )}

            {/* Áudio guiado (se disponível) */}
            {currentStep?.audioTrack && (
              <AudioGuide
                trackUrl={currentStep.audioTrack}
                autoPlay={!isPaused}
                fallbackText={currentStep.content}
                onEnded={handleStepComplete}
              />
            )}

            {/* Conteúdo padrão */}
            {!currentStep?.breathingConfig && !currentStep?.audioTrack && (
              <Box
                p="5"
                style={{
                  backgroundColor: isDark ? `${ColorTokens.neutral[800]}80` : `${ColorTokens.neutral[100]}80`,
                  borderRadius: Tokens.radius['2xl'],
                }}
              >
                <Text
                  size="md"
                  align="center"
                  style={{
                    color: colors.text.primary,
                    lineHeight: Tokens.typography.lineHeights.relaxed,
                  }}
                >
                  {currentStep?.content}
                </Text>
              </Box>
            )}

            {/* Timer visual (apenas se não for respiração) */}
            {currentStep?.type !== 'breathing' && (
              <Box align="center">
                <View
                  style={{
                    width: 128,
                    height: 128,
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                  }}
                >
                  <View
                    style={{
                      position: 'absolute',
                      inset: 0,
                      borderRadius: 64,
                      borderWidth: 4,
                      borderColor: isDark ? ColorTokens.neutral[700] : ColorTokens.neutral[200],
                    }}
                  />
                  <View
                    style={{
                      position: 'absolute',
                      inset: 0,
                      borderRadius: 64,
                      borderWidth: 4,
                      borderColor: colors.primary.main,
                      clipPath: `inset(0 ${((currentStep.duration - timeRemaining) / currentStep.duration) * 100}% 0 0)`,
                    }}
                  />
                  <Text size="3xl" weight="bold" style={{ color: colors.text.primary }}>
                    {formatTime(timeRemaining)}
                  </Text>
                </View>
              </Box>
            )}
          </Box>
        </Animated.View>

        {/* Ambiente sonoro */}
        <Box mt="4">
          <AmbientSound
            config={ambientSoundConfig}
            onConfigChange={setAmbientSoundConfig}
          />
        </Box>

        {/* Botões de Ação */}
        <Box direction="row" gap="3" mt="4">
          <Button
            title={isPaused ? 'Retomar' : 'Pausar'}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setIsPaused(!isPaused);
            }}
            variant="outline"
            size="lg"
            leftIcon={
              isPaused ? (
                <Play size={18} color={colors.text.primary} />
              ) : (
                <Pause size={18} color={colors.text.primary} />
              )
            }
            style={{ flex: 1 }}
          />
          {currentStepIndex < steps.length - 1 && (
            <Button
              title="Pular Passo"
              onPress={handleSkipStep}
              variant="outline"
              size="lg"
              leftIcon={<SkipForward size={18} color={colors.text.primary} />}
              style={{ flex: 1 }}
            />
          )}
          <Button
            title={currentStepIndex < steps.length - 1 ? 'Próximo' : 'Finalizar'}
            onPress={handleStepComplete}
            variant="primary"
            size="lg"
            style={{
              flex: 1,
              backgroundColor: isDark ? ColorTokens.primary[600] : ColorTokens.primary[500],
              borderRadius: Tokens.radius['2xl'],
              ...Tokens.shadows.lg,
            }}
          />
        </Box>
      </ScrollView>
    </SafeAreaView>
  );
}
