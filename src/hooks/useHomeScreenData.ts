/**
 * useHomeScreenData - Hook para buscar dados da HomeScreen
 * Centraliza toda a lógica de fetch de dados
 */

import { useState, useEffect, useCallback } from 'react';

import type { UserContext } from '@/agents/maternal/MaternalChatAgent';
import { useAgents } from '@/contexts/AgentsContext';
import { checkInService, type EmotionValue } from '@/services/checkInService';
import { profileService } from '@/services/profileService';
import { sessionManager } from '@/services/sessionManager';
import { sleepService } from '@/services/sleepService';
import type { UserProfile } from '@/types/user';
import { logger } from '@/utils/logger';

export interface DailyTip {
  text: string;
  emoji: string;
}

export interface HomeScreenData {
  userName: string;
  todayEmotion: EmotionValue | null;
  dailyTip: DailyTip;
  hasRegisteredSleep: boolean;
  shouldShowSleepPrompt: boolean;
  loading: boolean;
  refreshing: boolean;
  refresh: () => Promise<void>;
}

/**
 * Hook para buscar dados da HomeScreen
 */
export function useHomeScreenData(): HomeScreenData {
  const [userName, setUserName] = useState('mãe');
  const [todayEmotion, setTodayEmotion] = useState<EmotionValue | null>(null);
  const [dailyTip, setDailyTip] = useState<DailyTip>({
    text: 'Lembre-se: você está fazendo o seu melhor.',
    emoji: '💛',
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [hasRegisteredSleep, setHasRegisteredSleep] = useState(false);
  const { chatAgent, initialized } = useAgents();

  /**
   * Buscar dica do dia via IA
   */
  const fetchDailyTip = useCallback(
    async (profile: UserProfile | null, emotion: EmotionValue | null) => {
      try {
        // Se o chatAgent estiver disponível, gerar dica personalizada
        if (chatAgent && initialized) {
          const lifeStage = profile?.motherhood_stage || 'postpartum';
          const emotionContext = emotion ? `A mãe está se sentindo ${emotion} hoje.` : '';

          const prompt = `Você é NathIA, uma assistente de apoio emocional para mães brasileiras.

${emotionContext}
Estágio da maternidade: ${lifeStage}

Gere uma dica do dia curta, acolhedora e empática (máximo 80 caracteres).
Formato: apenas o texto da dica, sem aspas, sem explicações.
Seja específica e calorosa.`;

          try {
            // Verificar se há sessão ativa, criar temporária se necessário
            const currentSession = chatAgent.getSession();
            if (!currentSession) {
              // Obter userId do session manager ou usar profile
              const currentUser = sessionManager.getCurrentUser();
              const userId = currentUser?.id || profile?.id || 'anonymous';

              // Criar sessão temporária para gerar a dica
              const userContext: UserContext = {
                name: profile?.display_name || profile?.full_name,
                lifeStage: profile?.motherhood_stage || 'postpartum',
                emotion: emotion || undefined,
              };
              await chatAgent.startSession(userId, userContext);
            }

            // Usar o chatAgent para gerar a dica
            const response = await chatAgent.process(
              {
                message: prompt,
                attachContext: true,
              },
              {}
            );

            if (response && typeof response === 'object' && 'content' in response) {
              const tipText = String(response.content).trim();
              if (tipText.length > 0 && tipText.length < 200) {
                // Extrair emoji se houver no início
                const emojiMatch = tipText.match(
                  /^[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u
                );
                const emoji = emojiMatch ? emojiMatch[0] : '💙';
                const text = tipText
                  .replace(/^[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]\s*/u, '')
                  .trim();

                setDailyTip({ text, emoji });
                return;
              }
            }
          } catch (error) {
            logger.warn('Failed to generate daily tip via AI', error);
          }
        }

        // Fallback: dicas estáticas
        const tips: DailyTip[] = [
          { text: 'Lembre-se: você está fazendo o seu melhor.', emoji: '💛' },
          { text: 'Cuide-se para cuidar melhor. Você merece!', emoji: '💙' },
          { text: 'Cada mãe tem seu ritmo. Respeite o seu.', emoji: '🌸' },
          { text: 'Não existe mãe perfeita. Existe a mãe que ama.', emoji: '💕' },
          { text: 'Peça ajuda quando precisar. É sinal de força!', emoji: '💪' },
        ];

        // Selecionar dica baseada no humor (se disponível)
        if (emotion) {
          const emotionTips: Record<EmotionValue, DailyTip> = {
            bem: { text: 'Que bom que você está bem! Continue cuidando de si mesma.', emoji: '😊' },
            triste: { text: 'Está tudo bem se sentir triste. Você não está sozinha.', emoji: '💙' },
            ansiosa: { text: 'Respire fundo. Você está fazendo o seu melhor.', emoji: '🌿' },
            cansada: { text: 'Descansar também é produtivo. Cuide-se.', emoji: '😴' },
            calma: { text: 'Que bom sentir essa calma. Aproveite este momento.', emoji: '😌' },
          };
          setDailyTip(emotionTips[emotion]);
        } else {
          const randomTip = tips[Math.floor(Math.random() * tips.length)];
          setDailyTip(randomTip);
        }
      } catch (error) {
        logger.error('Failed to fetch daily tip', error);
        // Fallback final
        setDailyTip({
          text: 'Lembre-se: você está fazendo o seu melhor.',
          emoji: '💛',
        });
      }
    },
    [chatAgent, initialized]
  );

  /**
   * Carregar todos os dados
   */
  const loadData = useCallback(async () => {
    try {
      setLoading(true);

      // 1. Buscar perfil do usuário
      const profile = await profileService.getCurrentProfile();
      if (profile) {
        setUserName(profile.display_name || profile.full_name || 'mãe');
      }

      // 2. Buscar emoção de hoje
      const emotion = await checkInService.getTodayEmotion();
      setTodayEmotion(emotion);

      // 3. Buscar sono de hoje
      const todaySleep = await sleepService.getTodaySleep();
      setHasRegisteredSleep(!!todaySleep);

      // 4. Buscar dica do dia (com contexto do perfil e emoção)
      await fetchDailyTip(profile, emotion);
    } catch (error) {
      logger.error('Failed to load HomeScreen data', error, { screen: 'HomeScreen' });
    } finally {
      setLoading(false);
    }
  }, [fetchDailyTip]);

  /**
   * Refresh dos dados
   */
  const refresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Determinar se deve mostrar prompt de sono
  const shouldShowSleepPrompt = (() => {
    const now = new Date();
    const hour = now.getHours();
    return hour >= 20 && !hasRegisteredSleep;
  })();

  return {
    userName,
    todayEmotion,
    dailyTip,
    hasRegisteredSleep,
    shouldShowSleepPrompt,
    loading,
    refreshing,
    refresh,
  };
}
