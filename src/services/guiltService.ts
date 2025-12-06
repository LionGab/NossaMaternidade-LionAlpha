/**
 * guiltService - Service para gerenciar fluxo "Desculpa Hoje"
 *
 * Gerencia registro de culpas, validações empáticas, estatísticas e badges.
 * Migrado de app-redesign-studio-ab40635e/src/services/supabase/guiltService.ts
 * Adaptado para o projeto React Native atual.
 */

import { supabase } from './supabase';
import { logger } from '@/utils/logger';
import type {
  GuiltLog,
  GuiltValidation,
  GuiltStats,
  GuiltType,
  Badge,
} from '@/types/guilt';
import { BADGES } from '@/types/guilt';

// Mock de mensagens empáticas (fallback quando IA não está disponível)
const FALLBACK_MESSAGES: Record<GuiltType, string> = {
  gritei_com_filho:
    'Você gritou hoje. Isso acontece. Você está fazendo o melhor que consegue neste momento.',
  nao_brinquei_suficiente: 'Você não brincou o suficiente hoje. Amanhã é uma nova chance.',
  deixei_na_tv: 'Você deixou na TV. Às vezes precisamos de um respiro. Está tudo bem.',
  perdi_paciencia: 'Você perdeu a paciência. Você é humana, e isso é normal.',
  nao_refeicao_saudavel:
    'A refeição não foi a mais saudável hoje. Não precisa ser perfeita todos os dias.',
  nao_brinquei_fora: 'Vocês não brincaram fora hoje. Há sempre amanhã.',
  usei_celular_demais:
    'Você usou o celular demais. Reconhecer isso já é um passo importante.',
  nao_li_historia: 'Você não leu história hoje. Não é o fim do mundo.',
  outro: 'Você sentiu culpa hoje. Isso é válido e você não está sozinha.',
};

const FALLBACK_ACTIONS: Record<GuiltType, string> = {
  gritei_com_filho:
    'Amanhã, que tal tentar respirar 3x antes de responder quando sentir a irritação?',
  nao_brinquei_suficiente: 'Que tal reservar 15 minutos amanhã só para brincar?',
  deixei_na_tv: 'Amanhã, tente limitar a TV e fazer uma atividade juntos.',
  perdi_paciencia: 'Respire fundo. Você está fazendo o seu melhor.',
  nao_refeicao_saudavel:
    'Uma refeição não define o dia. Amanhã você pode tentar algo diferente.',
  nao_brinquei_fora: 'Que tal um passeio rápido amanhã? Nem que seja 10 minutos.',
  usei_celular_demais:
    'Amanhã, tente deixar o celular em outro cômodo por algumas horas.',
  nao_li_historia: 'Que tal ler uma história curta antes de dormir amanhã?',
  outro: 'Respire. Você está fazendo o melhor que pode.',
};

export const guiltService = {
  /**
   * Salva um registro de culpa no Supabase
   */
  async saveGuiltLog(
    guilt: Omit<GuiltLog, 'id' | 'userId'>
  ): Promise<GuiltLog | null> {
    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        logger.debug(
          '[guiltService] User not authenticated - some features may be limited'
        );
        // Em modo desenvolvimento, permitir continuar sem autenticação
        return null;
      }

      const { data, error } = await supabase
        .from('guilt_logs')
        .insert({
          user_id: user.id,
          guilt_type: guilt.guiltType,
          custom_text: guilt.customText,
          intensity: guilt.intensity,
          timestamp: guilt.timestamp,
          action_accepted: guilt.actionAccepted,
          badge_unlocked: guilt.badgeUnlocked,
          shared: guilt.shared || false,
        })
        .select()
        .single();

      if (error) {
        logger.error('[guiltService] Error saving guilt log', error);
        return null;
      }

      return {
        id: data.id,
        userId: data.user_id,
        guiltType: data.guilt_type,
        customText: data.custom_text,
        intensity: data.intensity,
        timestamp: data.timestamp,
        actionAccepted: data.action_accepted,
        badgeUnlocked: data.badge_unlocked,
        shared: data.shared,
      };
    } catch (error) {
      logger.error('[guiltService] Error in saveGuiltLog', error);
      return null;
    }
  },

  /**
   * Busca validação empática para um tipo de culpa
   * Retorna estatísticas de normalização e mensagem empática
   */
  async getValidation(guiltType: GuiltType): Promise<GuiltValidation | null> {
    try {
      // Buscar quantas mães registraram o mesmo hoje
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayISO = today.toISOString();

      const { data: todayData, error: todayError } = await supabase
        .from('guilt_logs')
        .select('id')
        .eq('guilt_type', guiltType)
        .gte('timestamp', todayISO);

      if (todayError) {
        logger.warn(
          '[guiltService] Error fetching today guilt count (Supabase may not be configured)',
          todayError
        );
      }

      // Buscar total da semana
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - 7);
      const weekStartISO = weekStart.toISOString();

      const { data: weekData, error: weekError } = await supabase
        .from('guilt_logs')
        .select('id')
        .eq('guilt_type', guiltType)
        .gte('timestamp', weekStartISO);

      if (weekError) {
        logger.warn(
          '[guiltService] Error fetching week guilt count (Supabase may not be configured)',
          weekError
        );
      }

      const todayCount = todayData?.length || 0;
      const weekCount = weekData?.length || 0;

      // Calcular percentual (mock - será melhorado com dados reais)
      const normalizePercentage =
        weekCount > 0 ? Math.min(95, Math.round((weekCount / 1000) * 100)) : 75;

      // Usar mensagens fallback (em produção, pode integrar com IA)
      const message = FALLBACK_MESSAGES[guiltType];
      const suggestedAction = FALLBACK_ACTIONS[guiltType];

      return {
        guiltType,
        normalizePercentage,
        similarCount: todayCount,
        message,
        suggestedAction,
        badgeEligible: weekCount >= 3,
      };
    } catch (error) {
      logger.error('[guiltService] Error in getValidation', error);
      // Retornar validação padrão em caso de erro
      return {
        guiltType,
        normalizePercentage: 75,
        similarCount: 0,
        message: FALLBACK_MESSAGES[guiltType],
        suggestedAction: FALLBACK_ACTIONS[guiltType],
        badgeEligible: false,
      };
    }
  },

  /**
   * Busca estatísticas do usuário (streak, total da semana, etc.)
   */
  async getStats(): Promise<GuiltStats | null> {
    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        logger.debug(
          '[guiltService] User not authenticated - returning default stats'
        );
        return {
          totalThisWeek: 0,
          mostCommonGuilt: 'outro',
          streakDays: 0,
          badgesUnlocked: [],
          trend: 'stable',
        };
      }

      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - 7);
      const weekStartISO = weekStart.toISOString();

      const { data, error } = await supabase
        .from('guilt_logs')
        .select('*')
        .eq('user_id', user.id)
        .gte('timestamp', weekStartISO)
        .order('timestamp', { ascending: false });

      if (error) {
        logger.warn(
          '[guiltService] Error fetching guilt stats (Supabase may not be configured)',
          error
        );
        return {
          totalThisWeek: 0,
          mostCommonGuilt: 'outro',
          streakDays: 0,
          badgesUnlocked: [],
          trend: 'stable',
        };
      }

      if (!data || data.length === 0) {
        return {
          totalThisWeek: 0,
          mostCommonGuilt: 'outro',
          streakDays: 0,
          badgesUnlocked: [],
          trend: 'stable',
        };
      }

      // Contar culpa mais comum
      const guiltCounts = data.reduce(
        (acc, item) => {
          acc[item.guilt_type] = (acc[item.guilt_type] || 0) + 1;
          return acc;
        },
        {} as Record<GuiltType, number>
      );

      const mostCommonGuilt = (Object.entries(guiltCounts) as [GuiltType, number][]).reduce((a, b) =>
        a[1] > b[1] ? a : b
      )[0];

      // Calcular streak (dias consecutivos)
      const uniqueDays = new Set(
        data.map((item) => new Date(item.timestamp).toDateString())
      );
      const streakDays = uniqueDays.size;

      // Verificar badges desbloqueados
      const badgesUnlocked: string[] = [];
      const totalThisWeek = data.length;

      for (const badge of BADGES) {
        if (badge.requirement.type === 'guilt_count') {
          if (totalThisWeek >= badge.requirement.value) {
            badgesUnlocked.push(badge.id);
          }
        } else if (badge.requirement.type === 'streak') {
          if (streakDays >= badge.requirement.value) {
            badgesUnlocked.push(badge.id);
          }
        }
      }

      // Determinar tendência (simplificado)
      const trend: 'improving' | 'stable' | 'worsening' = 'stable';

      return {
        totalThisWeek,
        mostCommonGuilt,
        streakDays,
        badgesUnlocked,
        trend,
      };
    } catch (error) {
      logger.error('[guiltService] Error in getStats', error);
      return {
        totalThisWeek: 0,
        mostCommonGuilt: 'outro',
        streakDays: 0,
        badgesUnlocked: [],
        trend: 'stable',
      };
    }
  },

  /**
   * Verifica e desbloqueia badges baseado nas estatísticas
   */
  async checkAndUnlockBadges(): Promise<Badge[]> {
    const stats = await this.getStats();
    if (!stats) return [];

    const unlocked: Badge[] = [];

    for (const badge of BADGES) {
      if (stats.badgesUnlocked.includes(badge.id)) {
        unlocked.push({
          ...badge,
          unlockedAt: new Date().toISOString(),
        });
      }
    }

    return unlocked;
  },
};

