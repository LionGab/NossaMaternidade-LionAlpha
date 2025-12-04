/**
 * GuidedExercises - Exercícios guiados para bem-estar
 *
 * Oferece mini-jornadas estruturadas:
 * - Respiração guiada (4-7-8)
 * - Grounding (5-4-3-2-1)
 * - Reestruturação de pensamento (CBT simples)
 * - Auto-compaixão
 *
 * @version 1.0
 * @date 2025-12-04
 */

import * as Haptics from 'expo-haptics';
import { Wind, Eye, Heart, Brain, CheckCircle2, ChevronRight } from 'lucide-react-native';
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { StyleSheet, Animated, Easing } from 'react-native';

import { Box } from '@/components/primitives/Box';
import { HapticButton } from '@/components/primitives/HapticButton';
import { Text } from '@/components/primitives/Text';
import { useTheme } from '@/theme';
import { Tokens, ColorTokens } from '@/theme/tokens';
import { logger } from '@/utils/logger';

// ======================
// TYPES
// ======================

export type ExerciseType = 'breathing' | 'grounding' | 'thought_reframe' | 'self_compassion';

export interface GuidedExercise {
  id: ExerciseType;
  title: string;
  subtitle: string;
  duration: string;
  icon: React.ComponentType<{ size?: number; color?: string }>;
  steps: ExerciseStep[];
  color: string;
}

export interface ExerciseStep {
  instruction: string;
  duration?: number; // em segundos
  action?: 'breathe_in' | 'hold' | 'breathe_out' | 'observe' | 'write' | 'reflect';
}

export interface GuidedExercisesProps {
  /** Callback quando exercício é completado */
  onComplete?: (exerciseId: ExerciseType) => void;
  /** Callback quando exercício é iniciado */
  onStart?: (exerciseId: ExerciseType) => void;
  /** Variante de exibição */
  variant?: 'list' | 'carousel' | 'single';
  /** Exercício específico para mostrar (se variant='single') */
  exerciseId?: ExerciseType;
  /** Mostrar apenas exercícios rápidos */
  quickOnly?: boolean;
}

// ======================
// DATA
// ======================

const EXERCISES: GuidedExercise[] = [
  {
    id: 'breathing',
    title: 'Respiração 4-7-8',
    subtitle: 'Acalme seu sistema nervoso',
    duration: '2 min',
    icon: Wind,
    color: ColorTokens.primary[500],
    steps: [
      { instruction: 'Encontre uma posição confortável', duration: 3 },
      { instruction: 'Inspire pelo nariz contando até 4', duration: 4, action: 'breathe_in' },
      { instruction: 'Segure a respiração contando até 7', duration: 7, action: 'hold' },
      { instruction: 'Expire pela boca contando até 8', duration: 8, action: 'breathe_out' },
      { instruction: 'Inspire pelo nariz contando até 4', duration: 4, action: 'breathe_in' },
      { instruction: 'Segure a respiração contando até 7', duration: 7, action: 'hold' },
      { instruction: 'Expire pela boca contando até 8', duration: 8, action: 'breathe_out' },
      { instruction: 'Inspire pelo nariz contando até 4', duration: 4, action: 'breathe_in' },
      { instruction: 'Segure a respiração contando até 7', duration: 7, action: 'hold' },
      { instruction: 'Expire pela boca contando até 8', duration: 8, action: 'breathe_out' },
      { instruction: 'Muito bem! Observe como você se sente agora.', duration: 5 },
    ],
  },
  {
    id: 'grounding',
    title: 'Grounding 5-4-3-2-1',
    subtitle: 'Volte ao momento presente',
    duration: '3 min',
    icon: Eye,
    color: ColorTokens.success[500],
    steps: [
      { instruction: 'Respire fundo e observe ao seu redor', duration: 5 },
      { instruction: '5 coisas que você pode VER', duration: 15, action: 'observe' },
      { instruction: '4 coisas que você pode TOCAR', duration: 12, action: 'observe' },
      { instruction: '3 coisas que você pode OUVIR', duration: 10, action: 'observe' },
      { instruction: '2 coisas que você pode CHEIRAR', duration: 8, action: 'observe' },
      { instruction: '1 coisa que você pode SENTIR no corpo', duration: 8, action: 'observe' },
      { instruction: 'Respire fundo. Você está aqui, agora, segura.', duration: 5 },
    ],
  },
  {
    id: 'thought_reframe',
    title: 'Reestruturar Pensamento',
    subtitle: 'Questione pensamentos difíceis',
    duration: '5 min',
    icon: Brain,
    color: ColorTokens.warning[500],
    steps: [
      {
        instruction: 'Qual pensamento está te incomodando agora?',
        duration: 10,
        action: 'reflect',
      },
      {
        instruction: 'Esse pensamento é um FATO ou uma INTERPRETAÇÃO?',
        duration: 10,
        action: 'reflect',
      },
      {
        instruction: 'Que evidências você tem A FAVOR desse pensamento?',
        duration: 15,
        action: 'reflect',
      },
      {
        instruction: 'Que evidências você tem CONTRA esse pensamento?',
        duration: 15,
        action: 'reflect',
      },
      {
        instruction: 'O que você diria a uma amiga que pensasse isso?',
        duration: 15,
        action: 'reflect',
      },
      {
        instruction: 'Como você pode reformular esse pensamento de forma mais equilibrada?',
        duration: 15,
        action: 'reflect',
      },
      { instruction: 'Você fez um ótimo trabalho refletindo sobre isso.', duration: 5 },
    ],
  },
  {
    id: 'self_compassion',
    title: 'Auto-compaixão',
    subtitle: 'Seja gentil consigo mesma',
    duration: '3 min',
    icon: Heart,
    color: ColorTokens.error[400],
    steps: [
      { instruction: 'Coloque a mão no peito e respire fundo', duration: 5, action: 'breathe_in' },
      {
        instruction: 'Reconheça: "Este é um momento difícil"',
        duration: 8,
        action: 'reflect',
      },
      {
        instruction: 'Lembre-se: "Todas as mães passam por momentos assim"',
        duration: 8,
        action: 'reflect',
      },
      {
        instruction: 'Diga a si mesma: "Que eu possa ser gentil comigo mesma"',
        duration: 8,
        action: 'reflect',
      },
      {
        instruction: 'Repita: "Que eu possa me dar a compaixão que preciso"',
        duration: 8,
        action: 'reflect',
      },
      { instruction: 'Respire e sinta essa gentileza consigo mesma', duration: 10 },
      { instruction: 'Você merece compaixão. Sempre.', duration: 5 },
    ],
  },
];

// ======================
// COMPONENTS
// ======================

interface ExerciseCardProps {
  exercise: GuidedExercise;
  onPress: () => void;
  isActive?: boolean;
}

const ExerciseCard = React.memo(({ exercise, onPress, isActive }: ExerciseCardProps) => {
  const { colors, isDark } = useTheme();
  const Icon = exercise.icon;

  return (
    <HapticButton
      onPress={onPress}
      style={[
        styles.exerciseCard,
        {
          backgroundColor: isDark ? ColorTokens.neutral[800] : ColorTokens.neutral[0],
          borderColor: isActive ? exercise.color : colors.border.light,
          borderWidth: isActive ? 2 : 1,
        },
      ]}
      accessibilityLabel={`${exercise.title}: ${exercise.subtitle}`}
      accessibilityHint={`Duração: ${exercise.duration}. Toque para iniciar`}
    >
      <Box
        p="3"
        rounded="xl"
        style={{
          backgroundColor: `${exercise.color}20`,
        }}
      >
        <Icon size={24} color={exercise.color} />
      </Box>
      <Box ml="3" flex={1}>
        <Text size="md" weight="semibold" color="primary">
          {exercise.title}
        </Text>
        <Text size="xs" color="secondary" style={{ marginTop: 2 }}>
          {exercise.subtitle}
        </Text>
      </Box>
      <Box direction="row" align="center" gap="2">
        <Text size="xs" color="tertiary">
          {exercise.duration}
        </Text>
        <ChevronRight size={16} color={colors.text.tertiary} />
      </Box>
    </HapticButton>
  );
});

ExerciseCard.displayName = 'ExerciseCard';

interface ExercisePlayerProps {
  exercise: GuidedExercise;
  onComplete: () => void;
  onClose: () => void;
}

const ExercisePlayer = React.memo(({ exercise, onComplete, onClose }: ExercisePlayerProps) => {
  const { colors } = useTheme();
  const [currentStep, setCurrentStep] = useState(0);
  const [timeLeft, setTimeLeft] = useState(exercise.steps[0]?.duration || 5);
  const [isComplete, setIsComplete] = useState(false);
  const progressAnim = useRef(new Animated.Value(0)).current;
  const breatheAnim = useRef(new Animated.Value(1)).current;

  const step = exercise.steps[currentStep];
  const Icon = exercise.icon;

  // Timer para cada step
  useEffect(() => {
    if (isComplete) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Próximo step
          if (currentStep < exercise.steps.length - 1) {
            setCurrentStep((s) => s + 1);
            return exercise.steps[currentStep + 1]?.duration || 5;
          } else {
            // Completou
            setIsComplete(true);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            onComplete();
            return 0;
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [currentStep, exercise.steps, isComplete, onComplete]);

  // Animação de respiração
  useEffect(() => {
    if (step?.action === 'breathe_in') {
      Animated.timing(breatheAnim, {
        toValue: 1.3,
        duration: (step.duration || 4) * 1000,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }).start();
    } else if (step?.action === 'breathe_out') {
      Animated.timing(breatheAnim, {
        toValue: 1,
        duration: (step.duration || 8) * 1000,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }).start();
    }
  }, [currentStep, step, breatheAnim]);

  // Progress bar
  useEffect(() => {
    const progress = (currentStep / exercise.steps.length) * 100;
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [currentStep, exercise.steps.length, progressAnim]);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  if (isComplete) {
    return (
      <Box flex={1} justify="center" align="center" p="6">
        <Box
          p="6"
          rounded="full"
          style={{ backgroundColor: `${ColorTokens.success[500]}20` }}
          mb="4"
        >
          <CheckCircle2 size={48} color={ColorTokens.success[500]} />
        </Box>
        <Text size="xl" weight="bold" color="primary" align="center">
          Exercício Completo!
        </Text>
        <Text size="md" color="secondary" align="center" style={{ marginTop: 8 }}>
          Muito bem! Você dedicou um tempo para cuidar de si mesma.
        </Text>
        <HapticButton
          onPress={onClose}
          style={[styles.completeButton, { backgroundColor: colors.primary.main }]}
        >
          <Text size="md" weight="semibold" color="inverse">
            Fechar
          </Text>
        </HapticButton>
      </Box>
    );
  }

  return (
    <Box flex={1} p="4">
      {/* Header */}
      <Box direction="row" align="center" justify="space-between" mb="4">
        <Box direction="row" align="center" gap="2">
          <Icon size={20} color={exercise.color} />
          <Text size="sm" weight="semibold" color="primary">
            {exercise.title}
          </Text>
        </Box>
        <HapticButton onPress={onClose}>
          <Text size="sm" color="tertiary">
            Fechar
          </Text>
        </HapticButton>
      </Box>

      {/* Progress bar */}
      <Box
        style={{
          height: 4,
          borderRadius: Tokens.radius.full,
          backgroundColor: colors.border.light,
          marginBottom: Tokens.spacing['6'],
        }}
      >
        <Animated.View
          style={[
            styles.progressBar,
            {
              width: progressWidth,
              backgroundColor: exercise.color,
            },
          ]}
        />
      </Box>

      {/* Step counter */}
      <Text size="xs" color="tertiary" align="center" style={{ marginBottom: Tokens.spacing['4'] }}>
        Passo {currentStep + 1} de {exercise.steps.length}
      </Text>

      {/* Main content */}
      <Box flex={1} justify="center" align="center">
        {/* Breathing circle */}
        {(step?.action === 'breathe_in' ||
          step?.action === 'hold' ||
          step?.action === 'breathe_out') && (
          <Animated.View
            style={[
              styles.breatheCircle,
              {
                backgroundColor: `${exercise.color}30`,
                borderColor: exercise.color,
                transform: [{ scale: breatheAnim }],
              },
            ]}
          >
            <Text size="3xl" weight="bold" style={{ color: exercise.color }}>
              {timeLeft}
            </Text>
          </Animated.View>
        )}

        {/* Instruction */}
        <Text
          size="xl"
          weight="semibold"
          color="primary"
          align="center"
          style={{ marginTop: 24, paddingHorizontal: 16 }}
        >
          {step?.instruction}
        </Text>

        {/* Timer for non-breathing steps */}
        {step?.action !== 'breathe_in' &&
          step?.action !== 'hold' &&
          step?.action !== 'breathe_out' && (
            <Box mt="4" p="3" rounded="full" style={{ backgroundColor: `${exercise.color}20` }}>
              <Text size="lg" weight="bold" style={{ color: exercise.color }}>
                {timeLeft}s
              </Text>
            </Box>
          )}
      </Box>

      {/* Skip button */}
      <HapticButton
        onPress={() => {
          if (currentStep < exercise.steps.length - 1) {
            setCurrentStep((s) => s + 1);
            setTimeLeft(exercise.steps[currentStep + 1]?.duration || 5);
          } else {
            setIsComplete(true);
            onComplete();
          }
        }}
        style={styles.skipButton}
      >
        <Text size="sm" color="tertiary">
          Pular passo
        </Text>
      </HapticButton>
    </Box>
  );
});

ExercisePlayer.displayName = 'ExercisePlayer';

// ======================
// MAIN COMPONENT
// ======================

export const GuidedExercises: React.FC<GuidedExercisesProps> = React.memo(
  ({ onComplete, onStart, variant = 'list', exerciseId, quickOnly = false }) => {
    useTheme(); // Ensure theme is available
    const [activeExercise, setActiveExercise] = useState<GuidedExercise | null>(null);

    // Filtrar exercícios
    const filteredExercises = quickOnly
      ? EXERCISES.filter((e) => e.id === 'breathing' || e.id === 'self_compassion')
      : EXERCISES;

    // Se variant='single' e exerciseId fornecido
    useEffect(() => {
      if (variant === 'single' && exerciseId) {
        const exercise = EXERCISES.find((e) => e.id === exerciseId);
        if (exercise) {
          setActiveExercise(exercise);
        }
      }
    }, [variant, exerciseId]);

    const handleStartExercise = useCallback(
      (exercise: GuidedExercise) => {
        logger.info('[GuidedExercises] Starting exercise', { exerciseId: exercise.id });
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        setActiveExercise(exercise);
        onStart?.(exercise.id);
      },
      [onStart]
    );

    const handleCompleteExercise = useCallback(() => {
      if (activeExercise) {
        logger.info('[GuidedExercises] Exercise completed', { exerciseId: activeExercise.id });
        onComplete?.(activeExercise.id);
      }
    }, [activeExercise, onComplete]);

    const handleCloseExercise = useCallback(() => {
      setActiveExercise(null);
    }, []);

    // Player mode
    if (activeExercise) {
      return (
        <Box
          flex={1}
          bg="canvas"
          style={{
            borderRadius: Tokens.radius.xl,
            overflow: 'hidden',
          }}
        >
          <ExercisePlayer
            exercise={activeExercise}
            onComplete={handleCompleteExercise}
            onClose={handleCloseExercise}
          />
        </Box>
      );
    }

    // List mode
    return (
      <Box>
        <Box mb="3">
          <Text size="lg" weight="bold" color="primary">
            Exercícios de Bem-estar
          </Text>
          <Text size="sm" color="secondary" style={{ marginTop: 4 }}>
            Mini-jornadas para te ajudar agora
          </Text>
        </Box>

        <Box gap="3">
          {filteredExercises.map((exercise) => (
            <ExerciseCard
              key={exercise.id}
              exercise={exercise}
              onPress={() => handleStartExercise(exercise)}
            />
          ))}
        </Box>
      </Box>
    );
  }
);

GuidedExercises.displayName = 'GuidedExercises';

// ======================
// STYLES
// ======================

const styles = StyleSheet.create({
  exerciseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Tokens.spacing['4'],
    borderRadius: Tokens.radius.xl,
    minHeight: 72,
    ...Tokens.shadows.sm,
  },
  progressBar: {
    height: '100%',
    borderRadius: Tokens.radius.full,
  },
  breatheCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipButton: {
    alignSelf: 'center',
    padding: Tokens.spacing['3'],
    marginTop: Tokens.spacing['4'],
  },
  completeButton: {
    paddingVertical: Tokens.spacing['4'],
    paddingHorizontal: Tokens.spacing['8'],
    borderRadius: Tokens.radius.xl,
    marginTop: Tokens.spacing['6'],
  },
});

export default GuidedExercises;
