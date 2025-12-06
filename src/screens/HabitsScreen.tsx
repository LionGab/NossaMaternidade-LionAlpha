/**
 * HabitsScreen - Tela de hábitos e autocuidado
 *
 * Permite visualizar, criar e gerenciar hábitos de autocuidado.
 * Referência: app-redesign-studio-ab40635e/src/pages/Habits.tsx
 * Refatorado para usar componentes separados (CreateHabitModal, HabitCard) e integrar com habitsService.
 */

import * as _Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { Plus, Heart, Sparkles as _Sparkles, Trophy, Flame, TrendingUp } from 'lucide-react-native';
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar } from '@/components/Avatar';
import { Badge } from '@/components/Badge';
import { CreateHabitModal, HabitCard } from '@/components/habits';
import { Box } from '@/components/atoms/Box';
import { Button as _Button } from '@/components/atoms/Button';
import { Text } from '@/components/atoms/Text';
import { ThemeToggle } from '@/components/ThemeToggle';
import { habitsService, type UserHabit } from '@/services/habitsService';
import { useTheme } from '@/theme';
import { triggerPlatformHaptic } from '@/theme/platform';
import {
  ColorTokens,
  Tokens,
  Shadows,
  Spacing,
  Radius,
} from '@/theme/tokens';
import { logger } from '@/utils/logger';

export default function HabitsScreen() {
  const { colors, isDark } = useTheme();
  // const __insets = useSafeAreaInsets();

  const [habits, setHabits] = useState<UserHabit[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [completingHabitId, setCompletingHabitId] = useState<string | null>(null);

  // Carregar hábitos
  const loadHabits = useCallback(async () => {
    try {
      setLoading(true);
      const userHabits = await habitsService.getUserHabits();
      setHabits(userHabits);
    } catch (error) {
      logger.error('[HabitsScreen] Erro ao carregar hábitos', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Carregar hábitos iniciais
  useEffect(() => {
    loadHabits();
  }, [loadHabits]);

  // Refresh
  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadHabits();
  }, [loadHabits]);

  // Calcular estatísticas
  const stats = useMemo(() => {
    const completedToday = habits.filter((h) => h.today_completed).length;
    const totalHabits = habits.length;
    const completionRate = totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0;
    const longestStreak = Math.max(...habits.map((h) => h.current_streak || 0), 0);

    return {
      completedToday,
      totalHabits,
      completionRate,
      longestStreak,
    };
  }, [habits]);

  // Criar hábito
  const handleCreateHabit = () => {
    triggerPlatformHaptic('buttonPress');
    logger.info('[HabitsScreen] Criar hábito pressionado');
    setIsCreateModalOpen(true);
  };

  const handleCreateHabitSubmit = useCallback(
    async (habitData: { name: string; description?: string; frequency?: string }) => {
      try {
        const frequency = (habitData.frequency || 'daily') as 'daily' | 'weekly' | 'monthly';
        const result = await habitsService.createHabit({
          name: habitData.name,
          description: habitData.description,
          frequency,
        });

        if (result) {
          logger.info('[HabitsScreen] Hábito criado com sucesso', { habitId: result.id });
          await loadHabits();
          setIsCreateModalOpen(false);
          triggerPlatformHaptic('success');
        } else {
          logger.error('[HabitsScreen] Erro ao criar hábito');
          triggerPlatformHaptic('error');
        }
      } catch (error) {
        logger.error('[HabitsScreen] Erro ao criar hábito', error);
        triggerPlatformHaptic('error');
      }
    },
    [loadHabits]
  );

  // Toggle completar hábito
  const handleToggleComplete = useCallback(
    async (userHabitId: string) => {
      if (completingHabitId) return;

      triggerPlatformHaptic('buttonPress');
      setCompletingHabitId(userHabitId);

      try {
        const success = await habitsService.toggleHabitCompletion(userHabitId);

        if (success !== undefined) {
          // Atualizar estado local
          await loadHabits();
          logger.info('[HabitsScreen] Hábito completado/descompletado', {
            userHabitId,
            completed: success,
          });
        }
      } catch (error) {
        logger.error('[HabitsScreen] Erro ao completar hábito', error);
      } finally {
        setCompletingHabitId(null);
      }
    },
    [completingHabitId, loadHabits]
  );

  const handleHabitPress = useCallback((habit: UserHabit) => {
    triggerPlatformHaptic('buttonPress');
    logger.info('[HabitsScreen] Hábito pressionado', { habitId: habit.id });
    // TODO: Navegar para detalhes do hábito quando disponível
  }, []);

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background.canvas }}
      edges={['top']}
      accessible={false}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: Spacing['20'] }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary.main}
          />
        }
      >
        {/* Header Section */}
        <Box
          bg="card"
          px="4"
          pt="4"
          pb="6"
          style={{
            borderBottomWidth: 1,
            borderBottomColor: colors.border.light,
          }}
        >
          {/* Avatar + Info */}
          <Box direction="row" align="center" gap="3" mb="4">
            <Avatar
              size={64}
              source={{ uri: 'https://i.imgur.com/LF2PX1w.jpg' }}
              fallback="NV"
              borderWidth={2}
              borderColor={colors.secondary.main}
              useGradientFallback={true}
            />
            <Box flex={1}>
              <View
                style={{
                  backgroundColor: `${ColorTokens.warning[500]}33`,
                  paddingHorizontal: Spacing['2.5'],
                  paddingVertical: Spacing['1'],
                  borderRadius: Radius.full,
                  marginBottom: Spacing['2'],
                  alignSelf: 'flex-start',
                }}
              >
                <Text size="xs" weight="semibold" style={{ color: ColorTokens.warning[600] }}>
                  ✨ MEUS CUIDADOS
                </Text>
              </View>
              <Text size="2xl" weight="bold" style={{ marginBottom: Spacing['0.5'] }}>
                Meus Cuidados
              </Text>
              <Text size="sm" color="tertiary">
                {stats.totalHabits} hábitos • {stats.completedToday} completos hoje
              </Text>
            </Box>
            <ThemeToggle variant="outline" />
          </Box>

          {/* Botão Criar Hábito */}
          <TouchableOpacity
            onPress={handleCreateHabit}
            activeOpacity={0.8}
            style={{
              backgroundColor: colors.primary.main,
              minHeight: Tokens.touchTargets.min,
              paddingVertical: Spacing['3'],
              paddingHorizontal: Spacing['4'],
              borderRadius: Radius.xl,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: Spacing['2'],
            }}
            accessibilityRole="button"
            accessibilityLabel="Criar novo hábito"
            accessibilityHint="Abre o formulário para criar um novo hábito de autocuidado"
          >
            <Plus size={16} color={ColorTokens.neutral[0]} />
            <Text size="sm" weight="semibold" style={{ color: ColorTokens.neutral[0] }}>
              Criar Hábito
            </Text>
          </TouchableOpacity>
        </Box>

        <Box px="4" pt="6" gap="6">
          {/* Today's Stats */}
          <Box
            bg="card"
            p="6"
            rounded="3xl"
            style={{
              borderWidth: 1,
              borderColor: colors.border.light,
              ...Shadows.card,
            }}
          >
            <Box direction="row" align="center" gap="2" mb="4">
              <Box
                p="2"
                rounded="xl"
                style={{
                  backgroundColor: `${ColorTokens.secondary[500]}20`,
                }}
              >
                <Flame size={20} color={ColorTokens.secondary[500]} />
              </Box>
              <Text size="lg" weight="semibold">
                HOJE
              </Text>
              <Badge
                containerStyle={{
                  backgroundColor: colors.primary.main,
                  marginLeft: 'auto',
                }}
              >
                <Text size="xs" weight="bold" style={{ color: ColorTokens.neutral[0] }}>
                  {stats.completionRate}% completo
                </Text>
              </Badge>
            </Box>

            {/* Progress Ring Visual (simplificado) */}
            <Box align="center" mb="4">
              <View
                style={{
                  width: 120,
                  height: 120,
                  borderRadius: 60,
                  borderWidth: 8,
                  borderColor: colors.border.light,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: `${colors.primary.main}10`,
                }}
              >
                <Text size="3xl" weight="bold" style={{ color: colors.primary.main }}>
                  {stats.completedToday}
                </Text>
                <Text size="xs" color="tertiary">
                  de {stats.totalHabits}
                </Text>
              </View>
            </Box>

            {/* Stats Grid */}
            <Box direction="row" gap="3">
              <Box
                flex={1}
                p="4"
                rounded="xl"
                align="center"
                style={{
                  backgroundColor: isDark ? ColorTokens.warning[900] : ColorTokens.warning[100],
                }}
              >
                <Box direction="row" align="center" gap="1" mb="1">
                  <TrendingUp size={16} color={ColorTokens.warning[500]} />
                  <Text size="2xl" weight="bold" style={{ color: ColorTokens.warning[600] }}>
                    {stats.longestStreak}
                  </Text>
                </Box>
                <Text size="xs" color="tertiary">
                  Sequência máxima
                </Text>
              </Box>
              <Box
                flex={1}
                p="4"
                rounded="xl"
                align="center"
                style={{
                  backgroundColor: isDark
                    ? ColorTokens.accent.purple + '20'
                    : ColorTokens.accent.purple + '10',
                }}
              >
                <Box direction="row" align="center" gap="1" mb="1">
                  <Trophy size={16} color={ColorTokens.accent.purple} />
                  <Text size="2xl" weight="bold" style={{ color: ColorTokens.accent.purple }}>
                    {stats.completionRate}%
                  </Text>
                </Box>
                <Text size="xs" color="tertiary">
                  Taxa de sucesso
                </Text>
              </Box>
            </Box>
          </Box>

          {/* Loading State */}
          {loading && habits.length === 0 && (
            <Box py="12" align="center">
              <ActivityIndicator size="large" color={colors.primary.main} />
              <Text size="sm" color="secondary" style={{ marginTop: Spacing['3'] }}>
                Carregando hábitos...
              </Text>
            </Box>
          )}

          {/* Empty State */}
          {!loading && habits.length === 0 && (
            <Box py="12" align="center" px="4">
              <Box
                p="5"
                rounded="full"
                style={{
                  backgroundColor: isDark ? ColorTokens.secondary[900] : ColorTokens.secondary[100],
                  marginBottom: Spacing['4'],
                }}
              >
                <Heart size={40} color={colors.secondary.main} />
              </Box>
              <Text size="lg" weight="bold" style={{ color: colors.text.primary, marginBottom: Spacing['2'] }}>
                Comece seus cuidados hoje!
              </Text>
              <Text size="sm" color="secondary" style={{ marginBottom: Spacing['4'], textAlign: 'center' }}>
                Crie seu primeiro hábito e comece a cuidar de você mesma.
              </Text>
              <TouchableOpacity
                onPress={handleCreateHabit}
                activeOpacity={0.8}
                style={{
                  backgroundColor: colors.primary.main,
                  paddingVertical: Spacing['3'],
                  paddingHorizontal: Spacing['6'],
                  borderRadius: Radius.xl,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: Spacing['2'],
                }}
                accessibilityRole="button"
                accessibilityLabel="Criar primeiro hábito"
              >
                <Plus size={16} color={ColorTokens.neutral[0]} />
                <Text size="sm" weight="semibold" style={{ color: ColorTokens.neutral[0] }}>
                  Criar primeiro hábito
                </Text>
              </TouchableOpacity>
            </Box>
          )}

          {/* Habits List */}
          {!loading && habits.length > 0 && (
            <Box gap="4">
              <Box direction="row" align="center" justify="space-between">
                <Text size="lg" weight="bold">
                  Meus Hábitos
                </Text>
                <Badge
                  containerStyle={{
                    backgroundColor: isDark ? ColorTokens.secondary[800] : ColorTokens.secondary[100],
                  }}
                >
                  <Text size="xs" weight="medium" style={{ color: colors.secondary.main }}>
                    {habits.length} total
                  </Text>
                </Badge>
              </Box>

              {habits.map((habit) => (
                <HabitCard
                  key={habit.id}
                  habit={habit}
                  isCompleting={completingHabitId === habit.id}
                  onToggleComplete={handleToggleComplete}
                  onPress={handleHabitPress}
                />
              ))}
            </Box>
          )}

          {/* Encouragement Card */}
          {!loading && habits.length > 0 && (
            <Box
              rounded="3xl"
              style={{
                overflow: 'hidden',
                ...Shadows.card,
              }}
            >
              <LinearGradient
                colors={
                  isDark
                    ? [ColorTokens.secondary[700], ColorTokens.accent.purple + '80']
                    : [ColorTokens.secondary[400], ColorTokens.accent.purple + '60']
                }
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
                    textAlign: 'center',
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
            </Box>
          )}
        </Box>
      </ScrollView>

      {/* Modal Criar Hábito */}
      <CreateHabitModal
        visible={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateHabit={handleCreateHabitSubmit}
      />
    </SafeAreaView>
  );
}
