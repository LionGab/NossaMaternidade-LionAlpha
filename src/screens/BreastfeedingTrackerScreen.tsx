/**
 * BreastfeedingTrackerScreen - Rastreador de Amamentação
 *
 * Ferramenta prática para mães registrarem:
 * - Horários de amamentação
 * - Qual peito foi usado
 * - Duração
 * - Notas (cólica, sono, etc.)
 *
 * @version 1.0.0
 */

import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';
import { StatusBar } from 'expo-status-bar';
import {
  ArrowLeft,
  Clock,
  Droplet,
  TrendingUp,
  AlertCircle,
  CheckCircle,
} from 'lucide-react-native';
import React, { useState, useCallback, useEffect } from 'react';
import { ScrollView, TouchableOpacity, Alert, ActionSheetIOS, Platform } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { Box } from '@/components/primitives/Box';
import { Button } from '@/components/primitives/Button';
import { IconButton } from '@/components/primitives/IconButton';
import { Text } from '@/components/primitives/Text';
import type { RootStackParamList } from '@/navigation/types';
import {
  breastfeedingInsightsService,
  type DailyInsights,
  type BabyAgeGroup,
} from '@/services/breastfeedingInsightsService';
import { supabase } from '@/services/supabase';
import { useTheme } from '@/theme';
import { Tokens, ColorTokens } from '@/theme/tokens';
import { logger } from '@/utils/logger';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface FeedingSession {
  id: string;
  timestamp: string;
  side: 'left' | 'right' | 'both';
  duration: number; // minutos
  notes?: string;
}

export default function BreastfeedingTrackerScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  const [sessions, setSessions] = useState<FeedingSession[]>([]);
  const [selectedSide, setSelectedSide] = useState<'left' | 'right' | 'both'>('left');
  const [duration, setDuration] = useState(15); // minutos padrão
  const [, setIsLoading] = useState(true);
  const [insights, setInsights] = useState<DailyInsights | null>(null);
  const [babyAgeGroup] = useState<BabyAgeGroup>('1-3m'); // TODO: Buscar do perfil

  // Carregar histórico do Supabase
  useEffect(() => {
    loadTodaySessions();
  }, []);

  // Atualizar insights quando sessões mudam
  useEffect(() => {
    if (sessions.length >= 0) {
      const dailyInsights = breastfeedingInsightsService.generateDailyInsights(
        sessions,
        babyAgeGroup
      );
      setInsights(dailyInsights);
    }
  }, [sessions, babyAgeGroup]);

  const loadTodaySessions = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setIsLoading(false);
        return;
      }

      // Início do dia (timezone local)
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { data, error } = await supabase
        .from('breastfeeding_sessions')
        .select('*')
        .eq('user_id', user.id)
        .gte('timestamp', today.toISOString())
        .order('timestamp', { ascending: false });

      if (error) throw error;

      if (data) {
        const mapped: FeedingSession[] = data.map(
          (s: {
            id: string;
            timestamp: string;
            side: 'left' | 'right' | 'both';
            duration_minutes: number;
            notes?: string;
          }) => ({
            id: s.id,
            timestamp: s.timestamp,
            side: s.side,
            duration: s.duration_minutes,
            notes: s.notes,
          })
        );
        setSessions(mapped);
      }
    } catch (error) {
      logger.error('Erro ao carregar sessões de amamentação', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = useCallback(async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        Alert.alert('Erro', 'Você precisa estar logada para salvar');
        return;
      }

      const timestamp = new Date().toISOString();

      // Salvar no Supabase
      const { data: inserted, error } = await supabase
        .from('breastfeeding_sessions')
        .insert({
          user_id: user.id,
          side: selectedSide,
          duration_minutes: duration,
          timestamp,
        })
        .select()
        .single();

      if (error) throw error;

      const newSession: FeedingSession = {
        id: inserted?.id || `temp-${Date.now()}`,
        timestamp,
        side: selectedSide,
        duration,
      };

      setSessions((prev) => [newSession, ...prev]);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      Alert.alert('Sucesso', 'Sessão de amamentação registrada!');
    } catch (error) {
      logger.error('Erro ao salvar sessão de amamentação', error);
      Alert.alert('Erro', 'Não foi possível salvar. Tente novamente.');
    }
  }, [selectedSide, duration]);

  const handleDelete = useCallback(async (session: FeedingSession) => {
    const doDelete = async () => {
      try {
        // Se ID começa com "temp-", é local e não está no Supabase
        if (!session.id.startsWith('temp-')) {
          const { error } = await supabase
            .from('breastfeeding_sessions')
            .delete()
            .eq('id', session.id);

          if (error) throw error;
        }

        setSessions((prev) => prev.filter((s) => s.id !== session.id));
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (error) {
        logger.error('Erro ao deletar sessão', error);
        Alert.alert('Erro', 'Não foi possível deletar.');
      }
    };

    // iOS: ActionSheet nativo
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancelar', 'Deletar'],
          destructiveButtonIndex: 1,
          cancelButtonIndex: 0,
          title: 'Deletar esta sessão?',
          message: `${getSideLabel(session.side)} - ${session.duration} min`,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) doDelete();
        }
      );
    } else {
      // Android: Alert padrão
      Alert.alert('Deletar sessão?', `${getSideLabel(session.side)} - ${session.duration} min`, [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Deletar', style: 'destructive', onPress: doDelete },
      ]);
    }
  }, []);

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getSideLabel = (side: 'left' | 'right' | 'both') => {
    switch (side) {
      case 'left':
        return 'Esquerdo';
      case 'right':
        return 'Direito';
      case 'both':
        return 'Ambos';
    }
  };

  const getSideEmoji = (side: 'left' | 'right' | 'both') => {
    switch (side) {
      case 'left':
        return '👈';
      case 'right':
        return '👉';
      case 'both':
        return '👈👉';
    }
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: colors.background.canvas,
      }}
      edges={['top']}
    >
      <StatusBar style={isDark ? 'light' : 'dark'} />

      {/* Header */}
      <Box
        direction="row"
        align="center"
        p="4"
        style={{
          paddingTop: insets.top + Tokens.spacing['4'],
          borderBottomWidth: 1,
          borderBottomColor: colors.border.light,
        }}
      >
        <IconButton
          icon={<ArrowLeft size={20} color={colors.text.primary} />}
          onPress={() => navigation.goBack()}
          accessibilityLabel="Voltar"
          variant="ghost"
        />
        <Text size="lg" weight="bold" style={{ marginLeft: Tokens.spacing['3'] }}>
          Rastreador de Amamentação
        </Text>
      </Box>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          padding: Tokens.spacing['4'],
        }}
      >
        {/* Card de Registro */}
        <Box bg="card" rounded="3xl" p="6" shadow="md" borderWidth={1} borderColor="light" mb="6">
          <Text size="md" weight="semibold" style={{ marginBottom: Tokens.spacing['4'] }}>
            Nova Sessão
          </Text>

          {/* Seleção de Lado */}
          <Text size="sm" color="secondary" style={{ marginBottom: Tokens.spacing['3'] }}>
            Qual peito?
          </Text>
          <Box
            style={{
              flexDirection: 'row',
              gap: Tokens.spacing['3'],
              marginBottom: Tokens.spacing['5'],
            }}
          >
            {(['left', 'right', 'both'] as const).map((side) => (
              <TouchableOpacity
                key={side}
                onPress={() => {
                  setSelectedSide(side);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
                style={{
                  flex: 1,
                  padding: Tokens.spacing['4'],
                  borderRadius: Tokens.radius['2xl'],
                  borderWidth: 2,
                  borderColor: selectedSide === side ? colors.primary.main : colors.border.light,
                  backgroundColor:
                    selectedSide === side ? `${colors.primary.main}0F` : colors.background.card,
                  alignItems: 'center',
                  minHeight: Tokens.touchTargets.min,
                }}
                accessibilityRole="button"
                accessibilityLabel={`Selecionar peito ${getSideLabel(side)}`}
              >
                <Text size="2xl" style={{ marginBottom: Tokens.spacing['2'] }}>
                  {getSideEmoji(side)}
                </Text>
                <Text
                  size="sm"
                  weight={selectedSide === side ? 'semibold' : 'regular'}
                  color={selectedSide === side ? 'primary' : 'secondary'}
                >
                  {getSideLabel(side)}
                </Text>
              </TouchableOpacity>
            ))}
          </Box>

          {/* Duração */}
          <Text size="sm" color="secondary" style={{ marginBottom: Tokens.spacing['3'] }}>
            Duração (minutos)
          </Text>
          <Box direction="row" align="center" gap="4" style={{ marginBottom: Tokens.spacing['5'] }}>
            <TouchableOpacity
              accessibilityRole="button"
              onPress={() => {
                if (duration > 1) {
                  setDuration(duration - 1);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
              }}
              onLongPress={() => {
                // Decremento rápido de 5 min no long press
                if (duration > 5) {
                  setDuration(duration - 5);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                }
              }}
              style={{
                width: 44,
                height: 44,
                borderRadius: Tokens.radius.full,
                backgroundColor: colors.background.elevated,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text size="lg">−</Text>
            </TouchableOpacity>

            <Box
              style={{
                flex: 1,
                padding: Tokens.spacing['4'],
                backgroundColor: colors.background.elevated,
                borderRadius: Tokens.radius['2xl'],
                alignItems: 'center',
              }}
            >
              <Text size="2xl" weight="bold">
                {duration} min
              </Text>
            </Box>

            <TouchableOpacity
              accessibilityRole="button"
              onPress={() => {
                if (duration < 60) {
                  setDuration(duration + 1);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
              }}
              onLongPress={() => {
                // Incremento rápido de 5 min no long press
                if (duration < 55) {
                  setDuration(duration + 5);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                }
              }}
              style={{
                width: 44,
                height: 44,
                borderRadius: Tokens.radius.full,
                backgroundColor: colors.background.elevated,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text size="lg">+</Text>
            </TouchableOpacity>
          </Box>

          {/* Botão Salvar */}
          <Button
            title="Registrar Amamentação"
            onPress={handleSave}
            variant="primary"
            size="lg"
            fullWidth
            leftIcon={<Droplet size={16} color={ColorTokens.neutral[0]} />}
          />
        </Box>

        {/* Card de Insights (VALOR REAL) */}
        {insights && (
          <Box bg="card" rounded="3xl" p="5" shadow="md" borderWidth={1} borderColor="light" mb="6">
            {/* Header do Insight */}
            <Box
              direction="row"
              align="center"
              gap="3"
              style={{ marginBottom: Tokens.spacing['3'] }}
            >
              <Box
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor:
                    insights.summary.status === 'success'
                      ? `${ColorTokens.success[500]}20`
                      : insights.summary.status === 'warning'
                        ? `${ColorTokens.warning[500]}20`
                        : `${ColorTokens.primary[500]}20`,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {insights.summary.status === 'success' ? (
                  <CheckCircle size={20} color={ColorTokens.success[500]} />
                ) : insights.summary.status === 'warning' ? (
                  <AlertCircle size={20} color={ColorTokens.warning[500]} />
                ) : (
                  <TrendingUp size={20} color={colors.primary.main} />
                )}
              </Box>
              <Box style={{ flex: 1 }}>
                <Text size="md" weight="bold">
                  {insights.summary.title}
                </Text>
                <Text size="xs" color="secondary">
                  {insights.summary.message}
                </Text>
              </Box>
            </Box>

            {/* Próxima sessão sugerida */}
            <Box
              style={{
                backgroundColor: insights.nextSession.isOverdue
                  ? `${ColorTokens.warning[500]}15`
                  : `${ColorTokens.success[500]}10`,
                borderRadius: Tokens.radius.xl,
                padding: Tokens.spacing['3'],
                marginBottom: Tokens.spacing['3'],
              }}
            >
              <Box direction="row" justify="space-between" align="center">
                <Box>
                  <Text size="xs" color="tertiary">
                    Última mamada
                  </Text>
                  <Text size="sm" weight="semibold">
                    {insights.nextSession.lastSessionAgo}
                  </Text>
                </Box>
                <Box style={{ alignItems: 'flex-end' }}>
                  <Text size="xs" color="tertiary">
                    Próxima sugerida
                  </Text>
                  <Text
                    size="sm"
                    weight="semibold"
                    style={{
                      color: insights.nextSession.isOverdue
                        ? ColorTokens.warning[600]
                        : ColorTokens.success[600],
                    }}
                  >
                    {insights.nextSession.isOverdue ? '⚠️ Agora' : insights.nextSession.suggestedIn}
                  </Text>
                </Box>
              </Box>
            </Box>

            {/* Recomendação (se houver) */}
            {insights.summary.recommendation && (
              <Text size="xs" color="secondary" style={{ fontStyle: 'italic' }}>
                💡 {insights.summary.recommendation}
              </Text>
            )}
          </Box>
        )}

        {/* Histórico */}
        {sessions.length > 0 && (
          <Box>
            <Box
              direction="row"
              align="center"
              justify="space-between"
              style={{ marginBottom: Tokens.spacing['3'] }}
            >
              <Text size="md" weight="semibold">
                Histórico de Hoje
              </Text>
              <Text size="xs" color="tertiary">
                Segure para deletar
              </Text>
            </Box>
            <Box gap="3">
              {sessions.map((session) => (
                <TouchableOpacity
                  key={session.id}
                  onLongPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    handleDelete(session);
                  }}
                  delayLongPress={400}
                  accessibilityRole="button"
                  accessibilityLabel={`Sessão ${getSideLabel(session.side)}, ${session.duration} minutos às ${formatTime(session.timestamp)}. Segure para deletar.`}
                >
                  <Box bg="card" rounded="2xl" p="4" borderWidth={1} borderColor="light">
                    <Box direction="row" align="center" justify="space-between">
                      <Box direction="row" align="center" gap="3">
                        <Text size="2xl">{getSideEmoji(session.side)}</Text>
                        <Box>
                          <Text size="sm" weight="semibold">
                            {getSideLabel(session.side)}
                          </Text>
                          <Text size="xs" color="tertiary">
                            {formatTime(session.timestamp)} • {session.duration} min
                          </Text>
                        </Box>
                      </Box>
                      <Clock size={16} color={colors.text.tertiary} />
                    </Box>
                  </Box>
                </TouchableOpacity>
              ))}
            </Box>
          </Box>
        )}

        {sessions.length === 0 && (
          <Box bg="card" rounded="2xl" p="6" style={{ alignItems: 'center' }}>
            <Text size="lg" style={{ marginBottom: Tokens.spacing['2'] }}>
              👶
            </Text>
            <Text size="sm" color="secondary" style={{ textAlign: 'center' }}>
              Nenhuma sessão registrada hoje
            </Text>
          </Box>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
