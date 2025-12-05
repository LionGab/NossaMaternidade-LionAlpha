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
  Volume2,
  VolumeX,
} from 'lucide-react-native';
import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import Animated, {
  FadeIn,
  SlideInRight,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  cancelAnimation,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Box } from '@/components/atoms/Box';
import { Button } from '@/components/atoms/Button';
import { Text } from '@/components/atoms/Text';
import { useTheme } from '@/theme';
import { Tokens } from '@/theme/tokens';
import { logger } from '@/utils/logger';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/navigation/types';
import {
  RitualStep,
  EmotionState,
  EmotionValue,
  AmbientSoundType,
  BreathingConfig,
  EMOTION_OPTIONS,
  AMBIENT_SOUNDS,
  DEFAULT_BREATHING_CONFIG,
} from '@/types/ritual';

type RitualPhase = 'preparation' | 'running' | 'completion';
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

// ============================================
// EMOTION CHECK-IN COMPONENT
// ============================================
interface EmotionCheckInProps {
  onComplete: (emotion: EmotionState) => void;
  context: 'before' | 'after';
  title: string;
  description: string;
}

const EmotionCheckIn: React.FC<EmotionCheckInProps> = ({
  onComplete,
  context,
  title,
  description,
}) => {
  const { colors } = useTheme();
  const [selectedEmotion, setSelectedEmotion] = useState<EmotionValue | null>(null);

  const handleSelect = useCallback(
    (emotion: EmotionValue) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setSelectedEmotion(emotion);
    },
    []
  );

  const handleContinue = useCallback(() => {
    if (selectedEmotion) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onComplete({
        emotion: selectedEmotion,
        intensity: 7,
      });
    }
  }, [selectedEmotion, onComplete]);

  return (
    <Animated.View entering={FadeIn.duration(400)}>
      <Box p="4" gap="6">
        {/* Header */}
        <Box gap="2" align="center">
          <Text
            variant="body"
            size="xl"
            weight="bold"
            align="center"
            style={{ color: colors.text.primary }}
          >
            {title}
          </Text>
          <Text
            variant="body"
            size="sm"
            align="center"
            style={{ color: colors.text.secondary }}
          >
            {description}
          </Text>
        </Box>

        {/* Emotion Options */}
        <Box direction="row" justify="center" gap="3" style={{ flexWrap: 'wrap' }}>
          {EMOTION_OPTIONS.map((option) => {
            const isSelected = selectedEmotion === option.value;
            return (
              <TouchableOpacity
                key={option.value}
                onPress={() => handleSelect(option.value)}
                accessibilityRole="button"
                accessibilityLabel={option.label}
                accessibilityState={{ selected: isSelected }}
                style={{
                  alignItems: 'center',
                  padding: Tokens.spacing['3'],
                  borderRadius: Tokens.radius.xl,
                  backgroundColor: isSelected
                    ? `${colors.primary.main}20`
                    : 'transparent',
                  borderWidth: 2,
                  borderColor: isSelected ? colors.primary.main : 'transparent',
                  minWidth: 70,
                }}
              >
                <Text style={{ fontSize: 40 }}>{option.value}</Text>
                <Text
                  variant="caption"
                  size="xs"
                  weight={isSelected ? 'semibold' : 'regular'}
                  style={{
                    color: isSelected ? colors.primary.main : colors.text.tertiary,
                    marginTop: Tokens.spacing['1'],
                  }}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </Box>

        {/* Continue Button */}
        <Button
          title={context === 'before' ? 'Começar Ritual' : 'Finalizar'}
          onPress={handleContinue}
          disabled={!selectedEmotion}
          style={{
            backgroundColor: colors.primary.main,
          }}
        />
      </Box>
    </Animated.View>
  );
};

// ============================================
// BREATHING GUIDE COMPONENT
// ============================================
interface BreathingGuideProps {
  config: BreathingConfig;
  onComplete: () => void;
  isPaused: boolean;
}

const BreathingGuide: React.FC<BreathingGuideProps> = ({
  config,
  onComplete,
  isPaused,
}) => {
  const { colors } = useTheme();
  const [currentPhase, setCurrentPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [cyclesCompleted, setCyclesCompleted] = useState(0);
  const [countdown, setCountdown] = useState(config.inhaleDuration);

  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.6);

  // Animation based on phase
  useEffect(() => {
    if (isPaused) {
      cancelAnimation(scale);
      return;
    }

    if (currentPhase === 'inhale') {
      scale.value = withTiming(1.5, {
        duration: config.inhaleDuration * 1000,
        easing: Easing.inOut(Easing.ease),
      });
      opacity.value = withTiming(1, { duration: config.inhaleDuration * 1000 });
    } else if (currentPhase === 'hold') {
      // Keep scale steady during hold
    } else if (currentPhase === 'exhale') {
      scale.value = withTiming(1, {
        duration: config.exhaleDuration * 1000,
        easing: Easing.inOut(Easing.ease),
      });
      opacity.value = withTiming(0.6, { duration: config.exhaleDuration * 1000 });
    }
  }, [currentPhase, isPaused, config, scale, opacity]);

  // Timer logic
  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          // Transition to next phase
          if (currentPhase === 'inhale') {
            setCurrentPhase('hold');
            return config.holdDuration;
          } else if (currentPhase === 'hold') {
            setCurrentPhase('exhale');
            return config.exhaleDuration;
          } else {
            // Exhale complete - new cycle
            const newCycles = cyclesCompleted + 1;
            setCyclesCompleted(newCycles);

            if (newCycles >= config.cycles) {
              onComplete();
              return 0;
            }

            setCurrentPhase('inhale');
            return config.inhaleDuration;
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentPhase, cyclesCompleted, isPaused, config, onComplete]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const phaseLabels = {
    inhale: 'Inspire...',
    hold: 'Segure...',
    exhale: 'Expire...',
  };

  return (
    <Box align="center" gap="6" py="4">
      {/* Breathing Circle */}
      <Animated.View style={animatedStyle}>
        <View
          style={{
            width: 180,
            height: 180,
            borderRadius: 90,
            backgroundColor: `${colors.primary.main}30`,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 4,
            borderColor: colors.primary.main,
          }}
        >
      <Text
        variant="body"
        size="3xl"
        weight="bold"
        style={{ color: colors.primary.main }}
      >
        {countdown}
      </Text>
        </View>
      </Animated.View>

      {/* Phase Label */}
      <Text
        variant="body"
        size="xl"
        weight="semibold"
        style={{ color: colors.text.primary }}
      >
        {phaseLabels[currentPhase]}
      </Text>

      {/* Progress */}
      <Box direction="row" gap="2" align="center">
        {Array.from({ length: config.cycles }).map((_, i) => (
          <View
            key={i}
            style={{
              width: 12,
              height: 12,
              borderRadius: 6,
              backgroundColor:
                i < cyclesCompleted
                  ? colors.primary.main
                  : i === cyclesCompleted
                  ? `${colors.primary.main}60`
                  : colors.border.light,
            }}
          />
        ))}
      </Box>
      <Text variant="caption" size="sm" style={{ color: colors.text.tertiary }}>
        Ciclo {cyclesCompleted + 1} de {config.cycles}
      </Text>
    </Box>
  );
};

// ============================================
// AMBIENT SOUND SELECTOR
// ============================================
interface AmbientSoundSelectorProps {
  selectedSound: AmbientSoundType | null;
  enabled: boolean;
  onToggle: () => void;
  onSelectSound: (sound: AmbientSoundType) => void;
}

const AmbientSoundSelector: React.FC<AmbientSoundSelectorProps> = ({
  selectedSound,
  enabled,
  onToggle,
  onSelectSound,
}) => {
  const { colors } = useTheme();

  return (
    <Box
      p="4"
      gap="3"
      style={{
        backgroundColor: colors.background.card,
        borderRadius: Tokens.radius['2xl'],
        borderWidth: 1,
        borderColor: colors.border.light,
      }}
    >
      <Box direction="row" justify="space-between" align="center">
        <Text variant="body" size="sm" weight="semibold" style={{ color: colors.text.primary }}>
          Som ambiente
        </Text>
        <TouchableOpacity onPress={onToggle} accessibilityLabel="Alternar som ambiente">
          {enabled ? (
            <Volume2 size={24} color={colors.primary.main} />
          ) : (
            <VolumeX size={24} color={colors.text.tertiary} />
          )}
        </TouchableOpacity>
      </Box>

      {enabled && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <Box direction="row" gap="2">
            {AMBIENT_SOUNDS.map((sound) => (
              <TouchableOpacity
                key={sound.type}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  onSelectSound(sound.type);
                }}
                style={{
                  paddingHorizontal: Tokens.spacing['3'],
                  paddingVertical: Tokens.spacing['2'],
                  borderRadius: Tokens.radius.full,
                  backgroundColor:
                    selectedSound === sound.type
                      ? colors.primary.main
                      : colors.background.input,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: Tokens.spacing['1'],
                }}
              >
                <Text>{sound.icon}</Text>
                <Text
                  variant="caption"
                  size="xs"
                  style={{
                    color: selectedSound === sound.type ? '#FFFFFF' : colors.text.secondary,
                  }}
                >
                  {sound.label}
                </Text>
              </TouchableOpacity>
            ))}
          </Box>
        </ScrollView>
      )}
    </Box>
  );
};

// ============================================
// MAIN SCREEN COMPONENT
// ============================================
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
  const [ambientSound, setAmbientSound] = useState<AmbientSoundType | null>('rain');
  const [ambientEnabled, setAmbientEnabled] = useState(true);
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
          <Box flex={1} ml="3">
          <Text
            variant="body"
            size="lg"
            weight="bold"
            style={{ color: colors.primary.main }}
          >
            ✨ Ritual de Reconexão
          </Text>
            <Text variant="caption" size="xs" style={{ color: colors.text.tertiary }}>
              ~{Math.ceil(totalDuration / 60)} minutos
            </Text>
          </Box>
        </Box>

        <ScrollView
          contentContainerStyle={{
            paddingBottom: insets.bottom + Tokens.spacing['8'],
          }}
        >
          <EmotionCheckIn
            onComplete={handleStartRitual}
            context="before"
            title="Como você está se sentindo agora?"
            description="Vamos começar reconhecendo como você está neste momento."
          />
        </ScrollView>
      </View>
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
                    backgroundColor: colors.primary.main,
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
                  style={{ color: colors.primary.main }}
                >
                  Ritual Concluído! ✨
                </Text>
                <Text
                  variant="body"
                  size="lg"
                  align="center"
                  style={{ color: colors.text.secondary }}
                >
                  Você completou seu ritual de reconexão.
                </Text>
              </Box>

                {/* Emotion Journey */}
                {emotionBefore && emotionAfter && (
                  <Box
                    p="5"
                    gap="4"
                    style={{
                      backgroundColor: colors.background.card,
                      borderRadius: Tokens.radius['2xl'],
                      borderWidth: 2,
                      borderColor: colors.border.light,
                      width: '100%',
                    }}
                  >
                <Text
                  variant="label"
                  size="md"
                  weight="bold"
                  align="center"
                  style={{ color: colors.text.primary }}
                >
                  Sua Jornada
                </Text>
                    <Box direction="row" align="center" justify="space-between">
                      <Box align="center">
                        <Text style={{ fontSize: 40 }}>{emotionBefore.emotion}</Text>
                        <Text
                          variant="caption"
                          size="xs"
                          style={{ color: colors.text.tertiary }}
                        >
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
                        <Text style={{ fontSize: 40 }}>{emotionAfter.emotion}</Text>
                        <Text
                          variant="caption"
                          size="xs"
                          style={{ color: colors.text.tertiary }}
                        >
                          Depois
                        </Text>
                      </Box>
                    </Box>
                    {emotionImproved && (
                      <Text
                        variant="body"
                        size="sm"
                        weight="semibold"
                        align="center"
                        style={{ color: Tokens.colors.success[600] }}
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
                    leftIcon={<Heart size={20} color="#FFFFFF" />}
                  />
                  <Button
                    title="Voltar para Home"
                    onPress={handleGoBack}
                    variant="outline"
                  />
                </Box>
              </Box>
            </Animated.View>
          )}
        </ScrollView>
      </View>
    );
  }

  // ============================================
  // RENDER: RUNNING PHASE
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
          onPress={() => {
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
          <Text
            variant="body"
            size="md"
            weight="bold"
            style={{ color: colors.primary.main }}
          >
            Ritual de Reconexão
          </Text>
          <Text variant="caption" size="xs" style={{ color: colors.text.tertiary }}>
            Passo {currentStepIndex + 1} de {steps.length}
          </Text>
        </Box>
        {currentStep?.type !== 'breathing' && (
          <Box
            direction="row"
            align="center"
            gap="1"
            px="3"
            py="1"
            style={{
              backgroundColor: colors.background.input,
              borderRadius: Tokens.radius.full,
            }}
          >
            <Clock size={16} color={colors.text.tertiary} />
            <Text
              variant="caption"
              size="sm"
              weight="semibold"
              style={{ color: colors.text.secondary }}
            >
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
      >
        {/* Progress Bar */}
        <Box mb="4">
          <View
            style={{
              height: 6,
              backgroundColor: colors.border.light,
              borderRadius: 3,
            }}
          >
            <View
              style={{
                width: `${progress}%`,
                height: '100%',
                backgroundColor: colors.primary.main,
                borderRadius: 3,
              }}
            />
          </View>
        </Box>

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
                  backgroundColor: colors.primary.main,
                }}
              >
                <Sparkles size={32} color="#FFFFFF" />
              </Box>
              <Box
                px="3"
                py="1"
                style={{
                  backgroundColor: `${colors.primary.main}20`,
                  borderRadius: Tokens.radius.full,
                }}
              >
                <Text
                  variant="caption"
                  size="xs"
                  weight="semibold"
                  style={{ color: colors.primary.main }}
                >
                  Passo {currentStepIndex + 1}
                </Text>
              </Box>
              <Text
                variant="body"
                size="xl"
                weight="bold"
                align="center"
                style={{ color: colors.text.primary }}
              >
                {currentStep?.title}
              </Text>
              <Text
                variant="body"
                size="md"
                align="center"
                style={{ color: colors.text.secondary }}
              >
                {currentStep?.description}
              </Text>
            </Box>

            {/* Step Content */}
            {currentStep?.type === 'breathing' && currentStep.breathingConfig && (
              <BreathingGuide
                config={currentStep.breathingConfig}
                onComplete={handleStepComplete}
                isPaused={isPaused}
              />
            )}

            {currentStep?.type !== 'breathing' && (
              <Box
                p="4"
                style={{
                  backgroundColor: `${colors.primary.main}10`,
                  borderRadius: Tokens.radius.xl,
                }}
              >
                <Text
                  variant="body"
                  size="md"
                  align="center"
                  style={{ color: colors.text.primary, fontStyle: 'italic' }}
                >
                  {currentStep?.content}
                </Text>
              </Box>
            )}
          </Box>
        </Animated.View>

        {/* Ambient Sound */}
        <Box mt="4">
          <AmbientSoundSelector
            selectedSound={ambientSound}
            enabled={ambientEnabled}
            onToggle={() => setAmbientEnabled(!ambientEnabled)}
            onSelectSound={setAmbientSound}
          />
        </Box>

        {/* Action Buttons */}
        <Box direction="row" gap="3" mt="4">
          <Button
            title={isPaused ? 'Retomar' : 'Pausar'}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setIsPaused(!isPaused);
            }}
            variant="outline"
            style={{ flex: 1 }}
            leftIcon={
              isPaused ? (
                <Play size={18} color={colors.text.primary} />
              ) : (
                <Pause size={18} color={colors.text.primary} />
              )
            }
          />
          {currentStepIndex < steps.length - 1 && (
            <Button
              title="Pular"
              onPress={handleSkipStep}
              variant="outline"
              style={{ flex: 1 }}
              leftIcon={<SkipForward size={18} color={colors.text.primary} />}
            />
          )}
          <Button
            title={currentStepIndex < steps.length - 1 ? 'Próximo' : 'Finalizar'}
            onPress={handleStepComplete}
            style={{ flex: 1 }}
          />
        </Box>
      </ScrollView>
    </View>
  );
}
