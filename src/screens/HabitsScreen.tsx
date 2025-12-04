/**
 * HabitsScreen - Tela de hábitos
 * Design baseado no Habits.tsx do app-redesign-studio
 */

import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { Plus, TrendingUp, Droplet, Sparkles, Trophy } from 'lucide-react-native';
import React, { useRef, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, Animated, Easing } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { Badge } from '@/components/Badge';
import { Box } from '@/components/primitives/Box';
import { Button } from '@/components/primitives/Button';
import { ProgressBar } from '@/components/primitives/ProgressBar';
import { Text } from '@/components/primitives/Text';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useTheme } from '@/theme';
import { Tokens, ColorTokens, Spacing, Radius } from '@/theme/tokens';
import { logger } from '@/utils/logger';

// Hook para animações escalonadas
function useStaggeredAnimations(itemCount: number, baseDelay = 100) {
  const animations = useRef(
    Array.from({ length: itemCount }, () => ({
      opacity: new Animated.Value(0),
      translateY: new Animated.Value(30),
    }))
  ).current;

  useEffect(() => {
    const staggeredAnimations = animations.map((anim, index) =>
      Animated.parallel([
        Animated.timing(anim.opacity, {
          toValue: 1,
          duration: 500,
          delay: index * baseDelay,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(anim.translateY, {
          toValue: 0,
          duration: 600,
          delay: index * baseDelay,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ])
    );

    Animated.stagger(baseDelay, staggeredAnimations).start();
  }, [animations, baseDelay]);

  return animations;
}

interface Habit {
  icon: React.ComponentType<{ size?: number; color?: string }>;
  title: string;
  description: string;
  streak: number;
  best: number;
  progress: number;
  total: number;
  color: string;
  bgColor: string;
}

const HABITS: Habit[] = [
  {
    icon: Droplet,
    title: 'Tomar água',
    description: 'Beber pelo menos 2L de água por dia',
    streak: 5,
    best: 12,
    progress: 0,
    total: 10,
    color: 'primary',
    bgColor: 'primary',
  },
  {
    icon: Sparkles,
    title: 'Momento para mim',
    description: '15 minutos de autocuidado',
    streak: 3,
    best: 7,
    progress: 0,
    total: 1,
    color: 'secondary',
    bgColor: 'secondary',
  },
];

export default function HabitsScreen() {
  const { colors, isDark } = useTheme();
  useSafeAreaInsets(); // Hook usado para side effects

  // Animações: header (0), stats (1), chart (2), filters (3), habits (4, 5), encouragement (6)
  const animations = useStaggeredAnimations(7, 100);

  const handleAddHabit = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    logger.info('Add habit pressed', { screen: 'HabitsScreen' });
    // TODO: Abrir modal de adicionar hábito
  };

  const handleHabitPress = (habit: Habit) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    logger.info('Habit pressed', { habitTitle: habit.title, screen: 'HabitsScreen' });
    // TODO: Abrir detalhes do hábito
  };

  const renderProgressBar = (progress: number, total: number) => {
    // percentage pode ser usado para exibir texto ou debug
    // const percentage = total > 0 ? Math.round((progress / total) * 100) : 0;
    return (
      <ProgressBar
        current={progress}
        total={total}
        height={8}
        animated={true}
        style={{ marginTop: Spacing['2'] }}
        accessibilityLabel={`Progresso: ${progress} de ${total}`}
      />
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.canvas }} edges={['top']}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: Tokens.spacing['10'] }}
      >
        {/* Header (PADRONIZADO: py-4 sm:py-6) */}
        <Animated.View
          style={{
            backgroundColor: colors.background.card,
            borderBottomWidth: 1,
            borderBottomColor: colors.border.light,
            paddingTop: Spacing['4'],
            paddingBottom: Spacing['6'],
            paddingHorizontal: Spacing['4'],
            opacity: animations[0].opacity,
            transform: [{ translateY: animations[0].translateY }],
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: Spacing['4'],
            }}
          >
            <Text size="2xl" weight="bold">
              Meus Háb.
            </Text>
            <View style={{ flexDirection: 'row', gap: Spacing['2'], alignItems: 'center' }}>
              <ThemeToggle variant="outline" />
              <Button
                variant="primary"
                size="md"
                title=""
                onPress={handleAddHabit}
                leftIcon={<Plus size={20} color={ColorTokens.neutral[0]} />}
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: Radius.xl,
                  padding: 0,
                }}
                accessibilityLabel="Adicionar novo hábito"
                accessibilityHint="Abre o formulário para criar um novo hábito"
              />
            </View>
          </View>
          <Text size="sm" color="secondary">
            10 hábitos ativos
          </Text>
        </Animated.View>

        <Box px="4" style={{ gap: Spacing['6'], paddingTop: Spacing['6'] }}>
          {/* Today's Stats - Animado */}
          <Animated.View
            style={{
              backgroundColor: colors.background.card,
              borderRadius: Radius['3xl'],
              padding: Spacing['6'],
              borderWidth: 1,
              borderColor: colors.border.light,
              ...Tokens.shadows.card,
              opacity: animations[1].opacity,
              transform: [{ translateY: animations[1].translateY }],
            }}
          >
            <Text size="lg" weight="semibold" style={{ marginBottom: Spacing['4'] }}>
              HOJE
            </Text>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-around',
                gap: Spacing['4'],
              }}
            >
              <View style={{ alignItems: 'center', flex: 1 }}>
                <Text size="3xl" weight="bold" style={{ marginBottom: Spacing['1'] }}>
                  0
                </Text>
                <Text size="xs" color="tertiary">
                  DE 10
                </Text>
              </View>
              <View
                style={{
                  alignItems: 'center',
                  flex: 1,
                  borderLeftWidth: 1,
                  borderRightWidth: 1,
                  borderColor: colors.border.light,
                }}
              >
                <Text size="3xl" weight="bold" style={{ marginBottom: Spacing['1'] }}>
                  12
                </Text>
                <Text size="xs" color="tertiary">
                  SEQUÊNCIA
                </Text>
              </View>
              <View style={{ alignItems: 'center', flex: 1 }}>
                <Text size="3xl" weight="bold" style={{ marginBottom: Spacing['1'] }}>
                  0%
                </Text>
                <Text size="xs" color="tertiary">
                  TAXA
                </Text>
              </View>
            </View>
          </Animated.View>

          {/* Weekly Chart Placeholder - Animado */}
          <Animated.View
            style={{
              backgroundColor: colors.background.card,
              borderRadius: Radius['3xl'],
              padding: Spacing['6'],
              borderWidth: 1,
              borderColor: colors.border.light,
              ...Tokens.shadows.card,
              opacity: animations[2].opacity,
              transform: [{ translateY: animations[2].translateY }],
            }}
          >
            <View
              style={{
                height: 128,
                justifyContent: 'center',
                alignItems: 'center',
                flexDirection: 'row',
              }}
            >
              <TrendingUp
                size={32}
                color={colors.text.tertiary}
                style={{ marginRight: Spacing['2'] }}
              />
              <Text size="sm" color="tertiary">
                Gráfico semanal
              </Text>
            </View>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-around',
                marginTop: Spacing['4'],
              }}
            >
              <Text size="xs" color="tertiary">
                Qui
              </Text>
              <Text size="xs" color="tertiary">
                Sex
              </Text>
            </View>
          </Animated.View>

          {/* Filter Tabs - Animado */}
          <Animated.View
            style={{
              flexDirection: 'row',
              gap: Spacing['2'],
              paddingHorizontal: Spacing['4'],
              marginHorizontal: -Spacing['4'],
              paddingBottom: Spacing['2'],
              opacity: animations[3].opacity,
              transform: [{ translateY: animations[3].translateY }],
            }}
          >
            {['Todos', 'Atividade', 'Social'].map((filter, index) => (
              <Badge
                key={filter}
                variant={index === 0 ? 'primary' : 'default'}
                containerStyle={{
                  paddingHorizontal: Spacing['4'],
                  paddingVertical: Spacing['2'],
                  borderRadius: Radius.full,
                }}
              >
                {filter}
              </Badge>
            ))}
          </Animated.View>

          {/* Habits List */}
          <View style={{ gap: Spacing['3'] }}>
            {HABITS.map((habit, index) => {
              const IconComponent = habit.icon;
              const habitColor =
                habit.color === 'primary' ? colors.primary.main : colors.secondary.main;
              const habitBgColor =
                habit.color === 'primary'
                  ? `${ColorTokens.primary[500]}33`
                  : `${ColorTokens.secondary[500]}33`;

              return (
                <Animated.View
                  key={habit.title}
                  style={{
                    backgroundColor: colors.background.card,
                    borderRadius: Radius['3xl'],
                    padding: Spacing['5'],
                    borderWidth: 1,
                    borderColor: `${habitColor}4D`, // 30% opacity
                    ...Tokens.shadows.card,
                    opacity: animations[4 + index].opacity,
                    transform: [{ translateY: animations[4 + index].translateY }],
                  }}
                >
                  <TouchableOpacity
                    onPress={() => handleHabitPress(habit)}
                    activeOpacity={0.7}
                    accessibilityRole="button"
                    accessibilityLabel={`Hábito: ${habit.title}`}
                    accessibilityHint={`${habit.description}. Sequência: ${habit.streak} dias`}
                  >
                    <View style={{ flexDirection: 'row', gap: Spacing['4'] }}>
                      <View
                        style={{
                          width: 48,
                          height: 48,
                          borderRadius: Radius.xl,
                          backgroundColor: habitBgColor,
                          justifyContent: 'center',
                          alignItems: 'center',
                        }}
                      >
                        <IconComponent size={24} color={habitColor} />
                      </View>

                      <View style={{ flex: 1, minWidth: 0 }}>
                        <Text size="md" weight="semibold" style={{ marginBottom: Spacing['1'] }}>
                          {habit.title}
                        </Text>
                        <Text size="sm" color="secondary" style={{ marginBottom: Spacing['3'] }}>
                          {habit.description}
                        </Text>

                        <View
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: Spacing['4'],
                            marginBottom: Spacing['2'],
                          }}
                        >
                          <View
                            style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                              gap: Spacing['1'],
                            }}
                          >
                            <TrendingUp size={12} color={habitColor} />
                            <Text size="xs" style={{ color: habitColor, fontWeight: '500' }}>
                              {habit.streak} dias
                            </Text>
                          </View>
                          <View
                            style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                              gap: Spacing['1'],
                            }}
                          >
                            <Trophy size={12} color={colors.text.tertiary} />
                            <Text size="xs" color="tertiary">
                              Melhor: {habit.best}
                            </Text>
                          </View>
                        </View>

                        {renderProgressBar(habit.progress, habit.total)}

                        <Text size="xs" color="tertiary" style={{ marginTop: Spacing['1'] }}>
                          {habit.progress} de {habit.total}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                </Animated.View>
              );
            })}
          </View>

          {/* Encouragement - Animado */}
          <Animated.View
            style={{
              borderRadius: Radius['3xl'],
              overflow: 'hidden',
              ...Tokens.shadows.card,
              opacity: animations[6].opacity,
              transform: [{ translateY: animations[6].translateY }],
            }}
          >
            <LinearGradient
              colors={isDark ? ColorTokens.nathIA.gradient.dark : ColorTokens.nathIA.gradient.light}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                padding: Spacing['6'],
                alignItems: 'center',
              }}
            >
              <Text style={{ fontSize: 40, marginBottom: Spacing['2'] }}>💪</Text>
              <Text
                size="lg"
                weight="bold"
                style={{
                  color: ColorTokens.neutral[0],
                  marginBottom: Spacing['2'],
                }}
              >
                Continue assim!
              </Text>
              <Text
                size="sm"
                style={{
                  color: `${ColorTokens.neutral[0]}E6`,
                  textAlign: 'center',
                }}
              >
                Pequenos passos fazem grandes diferenças na sua jornada.
              </Text>
            </LinearGradient>
          </Animated.View>
        </Box>
      </ScrollView>
    </SafeAreaView>
  );
}
