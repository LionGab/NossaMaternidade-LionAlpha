/**
 * Needs Rewards Service
 *
 * Entrega valor IMEDIATO quando usuária seleciona uma necessidade.
 * Crítico para retenção D3 - sem isso, a pergunta "O que você precisa?" é inútil.
 *
 * @version 1.0.0
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

import { logger } from '@/utils/logger';

import { retentionService } from './analytics/retentionService';

export type NeedValue = 'descanso' | 'apoio-emocional' | 'organizacao' | 'conexao';

export interface NeedReward {
  need: NeedValue;
  action: 'navigate' | 'modal' | 'inline';
  destination?: string;
  params?: Record<string, unknown>;
  immediateValue: {
    title: string;
    description: string;
    emoji: string;
    cta: string;
  };
  trackingEvent: string;
}

/**
 * Define recompensas imediatas para cada necessidade
 */
export const NEED_REWARDS: Record<NeedValue, NeedReward> = {
  descanso: {
    need: 'descanso',
    action: 'navigate',
    destination: 'Ritual',
    params: {
      ritual: 'breathing',
      autoStart: true, // Inicia automaticamente
      message: 'Vamos fazer uma pausa juntas. Respire comigo por 3 minutos 💚',
    },
    immediateValue: {
      title: 'Momento de Descanso',
      description: 'Exercício de respiração 4-7-8 para relaxar',
      emoji: '🧘',
      cta: 'Começar respiração',
    },
    trackingEvent: 'need_reward_descanso',
  },
  'apoio-emocional': {
    need: 'apoio-emocional',
    action: 'navigate',
    destination: 'Chat',
    params: {
      initialMessage:
        'Percebi que você precisa de apoio emocional agora. Estou aqui para te ouvir, sem julgamentos. O que está pesando no seu coração? 💙',
      mode: 'empathetic', // NathIA entra em modo mais empático
    },
    immediateValue: {
      title: 'Apoio Emocional',
      description: 'NathIA está pronta para te ouvir',
      emoji: '💙',
      cta: 'Conversar agora',
    },
    trackingEvent: 'need_reward_apoio',
  },
  organizacao: {
    need: 'organizacao',
    action: 'navigate',
    destination: 'BreastfeedingTracker', // ou Diary com modo de organização
    params: {
      showQuickTips: true,
      message: 'Vamos organizar sua rotina! Comece registrando a última amamentação 📋',
    },
    immediateValue: {
      title: 'Organização',
      description: 'Rastreador de amamentação e rotina',
      emoji: '📋',
      cta: 'Registrar agora',
    },
    trackingEvent: 'need_reward_organizacao',
  },
  conexao: {
    need: 'conexao',
    action: 'navigate',
    destination: 'MaesValentes',
    params: {
      filter: 'trending', // Mostra posts mais engajados
      showWelcome: true,
      message: 'Milhares de mães passam pelo mesmo que você. Veja o que estão compartilhando 🤝',
    },
    immediateValue: {
      title: 'Conexão com Mães',
      description: 'Histórias de mães como você',
      emoji: '🤝',
      cta: 'Ver comunidade',
    },
    trackingEvent: 'need_reward_conexao',
  },
};

/**
 * Serviço de recompensas para necessidades
 */
class NeedsRewardsService {
  private readonly HISTORY_KEY = '@needs:history';

  /**
   * Processa seleção de necessidade e retorna recompensa
   */
  async processNeedSelection(need: NeedValue, userId?: string): Promise<NeedReward> {
    const reward = NEED_REWARDS[need];

    // Salvar no histórico
    await this.saveToHistory(need);

    // Track no funnel analytics (se userId disponível)
    if (userId) {
      await this.trackNeedSelection(need, userId);
    }

    logger.info('[NeedsRewards] Need processado', {
      need,
      destination: reward.destination,
      trackingEvent: reward.trackingEvent,
    });

    return reward;
  }

  /**
   * Salva seleção no histórico para análise
   */
  private async saveToHistory(need: NeedValue): Promise<void> {
    try {
      const historyRaw = await AsyncStorage.getItem(this.HISTORY_KEY);
      const history: { need: NeedValue; timestamp: string }[] = historyRaw
        ? JSON.parse(historyRaw)
        : [];

      history.push({
        need,
        timestamp: new Date().toISOString(),
      });

      // Manter apenas últimos 30 registros
      const trimmed = history.slice(-30);
      await AsyncStorage.setItem(this.HISTORY_KEY, JSON.stringify(trimmed));
    } catch (error) {
      logger.error('[NeedsRewards] Erro ao salvar histórico', error);
    }
  }

  /**
   * Track no funnel analytics
   */
  private async trackNeedSelection(need: NeedValue, userId: string): Promise<void> {
    try {
      // Mapear need para stage de aha_moment se for primeira vez
      const firstTimeKey = `@needs:first_${need}`;
      const isFirstTime = !(await AsyncStorage.getItem(firstTimeKey));

      if (isFirstTime) {
        await AsyncStorage.setItem(firstTimeKey, 'true');

        // Track como potencial aha_moment dependendo do need
        if (need === 'apoio-emocional') {
          await retentionService.trackFirstUse(userId, 'nathia');
        } else if (need === 'organizacao') {
          await retentionService.trackFirstUse(userId, 'tracker');
        } else if (need === 'conexao') {
          await retentionService.trackFirstUse(userId, 'community');
        }
      }
    } catch (error) {
      logger.error('[NeedsRewards] Erro ao track funnel', error);
    }
  }

  /**
   * Obtém necessidade mais comum (para personalização futura)
   */
  async getMostCommonNeed(): Promise<NeedValue | null> {
    try {
      const historyRaw = await AsyncStorage.getItem(this.HISTORY_KEY);
      if (!historyRaw) return null;

      const history: { need: NeedValue; timestamp: string }[] = JSON.parse(historyRaw);

      const counts: Record<NeedValue, number> = {
        descanso: 0,
        'apoio-emocional': 0,
        organizacao: 0,
        conexao: 0,
      };

      for (const entry of history) {
        counts[entry.need]++;
      }

      const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
      return sorted[0][1] > 0 ? (sorted[0][0] as NeedValue) : null;
    } catch (error) {
      logger.error('[NeedsRewards] Erro ao obter need mais comum', error);
      return null;
    }
  }

  /**
   * Gera mensagem personalizada baseada no histórico
   */
  async getPersonalizedGreeting(): Promise<string> {
    const mostCommon = await this.getMostCommonNeed();

    const greetings: Record<NeedValue, string> = {
      descanso: 'Você merece um descanso hoje. Quer começar com uma respiração? 🧘',
      'apoio-emocional': 'Como você está se sentindo hoje? Estou aqui para ouvir 💙',
      organizacao: 'Vamos organizar o dia? Comece registrando uma atividade 📋',
      conexao: 'Outras mães estão compartilhando histórias. Quer ver? 🤝',
    };

    if (mostCommon) {
      return greetings[mostCommon];
    }

    return 'O que você mais precisa agora?';
  }
}

export const needsRewardsService = new NeedsRewardsService();
