/**
 * Tipos para Desculpa Hoje - Sistema de Validação de Culpa
 * Migrado de app-redesign-studio
 */

export type GuiltType =
  | 'gritei_com_filho'
  | 'nao_brinquei_suficiente'
  | 'deixei_na_tv'
  | 'perdi_paciencia'
  | 'nao_refeicao_saudavel'
  | 'nao_brinquei_fora'
  | 'usei_celular_demais'
  | 'nao_li_historia'
  | 'outro';

export interface GuiltLog {
  id?: string;
  userId: string;
  guiltType: GuiltType;
  customText?: string;
  intensity: number; // 1-10
  timestamp: string;
  actionAccepted?: boolean;
  badgeUnlocked?: string;
  shared?: boolean;
}

export interface GuiltValidation {
  guiltType: GuiltType;
  normalizePercentage: number; // % de mães que sentiram o mesmo
  similarCount: number; // Número absoluto de mães similares
  message: string; // Mensagem empática gerada por IA
  suggestedAction?: string;
  badgeEligible?: boolean;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement: {
    type: 'guilt_count' | 'streak' | 'specific_guilt';
    value: number;
    period: 'day' | 'week' | 'month';
  };
  unlockedAt?: string;
}

export interface GuiltStats {
  totalThisWeek: number;
  mostCommonGuilt: GuiltType;
  streakDays: number;
  badgesUnlocked: string[];
  trend: 'improving' | 'stable' | 'worsening';
}

export const GUILT_PRESETS: Array<{ type: GuiltType; label: string; emoji: string }> = [
  { type: 'gritei_com_filho', label: 'Gritei com meu filho', emoji: '😤' },
  { type: 'nao_brinquei_suficiente', label: 'Não brinquei o suficiente', emoji: '🎮' },
  { type: 'deixei_na_tv', label: 'Deixei na frente da TV', emoji: '📺' },
  { type: 'perdi_paciencia', label: 'Perdi a paciência', emoji: '😫' },
  { type: 'nao_refeicao_saudavel', label: 'Não fiz refeição saudável', emoji: '🥗' },
  { type: 'nao_brinquei_fora', label: 'Não brincamos fora', emoji: '🌳' },
  { type: 'usei_celular_demais', label: 'Usei celular demais', emoji: '📱' },
  { type: 'nao_li_historia', label: 'Não li história', emoji: '📚' },
  { type: 'outro', label: 'Outra coisa...', emoji: '✍️' },
];

export const BADGES: Badge[] = [
  {
    id: 'mae_real',
    name: 'Mãe Real',
    description: 'Você registrou 3+ "desculpas" esta semana',
    icon: '🏆',
    requirement: { type: 'guilt_count', value: 3, period: 'week' },
  },
  {
    id: 'mae_que_pede_desculpa',
    name: 'Mãe que Pede Desculpa',
    description: 'Você registrou 5+ "desculpas" esta semana',
    icon: '💛',
    requirement: { type: 'guilt_count', value: 5, period: 'week' },
  },
  {
    id: 'mae_consciente',
    name: 'Mãe Consciente',
    description: '7 dias seguidos registrando',
    icon: '✨',
    requirement: { type: 'streak', value: 7, period: 'day' },
  },
];

