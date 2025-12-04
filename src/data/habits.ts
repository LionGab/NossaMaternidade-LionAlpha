/**
 * Dados mock de hábitos para mães
 * Inspirado nos melhores apps de hábitos
 *
 * @note Cores usam tokens do ColorTokens para consistência
 */

import { ColorTokens } from '../theme/tokens';
import { Habit } from '../types/habits';

// Cores semânticas para hábitos (baseadas nos tokens)
const HabitColors = {
  water: ColorTokens.info[400], // Azul água
  selfcare: ColorTokens.primary[500], // Rosa maternal
  wellness: ColorTokens.success[500], // Verde bem-estar
  health: ColorTokens.warning[500], // Laranja saúde
  exercise: ColorTokens.success[500], // Verde exercício
  food: ColorTokens.warning[500], // Laranja alimentação
  sleep: ColorTokens.info[400], // Azul sono
  social: ColorTokens.info[400], // Azul social
} as const;

export const DEFAULT_HABITS: Habit[] = [
  // Autocuidado
  {
    id: 'habit-1',
    user_id: 'mock-user',
    title: 'Tomar água',
    description: 'Beber pelo menos 2L de água por dia',
    icon: 'water',
    color: HabitColors.water,
    category: 'autocuidado',
    frequency: 'daily',
    streak: 5,
    bestStreak: 12,
    totalCompletions: 45,
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    is_active: true,
    reminder_time: '09:00',
  },
  {
    id: 'habit-2',
    user_id: 'mock-user',
    title: 'Momento para mim',
    description: '15 minutos de autocuidado',
    icon: 'sparkles',
    color: HabitColors.selfcare,
    category: 'autocuidado',
    frequency: 'daily',
    streak: 3,
    bestStreak: 7,
    totalCompletions: 28,
    created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    is_active: true,
    reminder_time: '20:00',
  },
  {
    id: 'habit-3',
    user_id: 'mock-user',
    title: 'Respiração consciente',
    description: '5 minutos de respiração profunda',
    icon: 'leaf',
    color: HabitColors.wellness,
    category: 'bemestar',
    frequency: 'daily',
    streak: 8,
    bestStreak: 15,
    totalCompletions: 52,
    created_at: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString(),
    is_active: true,
  },

  // Saúde
  {
    id: 'habit-4',
    user_id: 'mock-user',
    title: 'Vitaminas',
    description: 'Tomar vitaminas pré-natais',
    icon: 'medical',
    color: HabitColors.health,
    category: 'saude',
    frequency: 'daily',
    streak: 12,
    bestStreak: 30,
    totalCompletions: 89,
    created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    is_active: true,
    reminder_time: '08:00',
  },
  {
    id: 'habit-5',
    user_id: 'mock-user',
    title: 'Caminhada',
    description: '30 minutos de caminhada leve',
    icon: 'walk',
    color: HabitColors.exercise,
    category: 'exercicio',
    frequency: 'daily',
    streak: 0,
    bestStreak: 5,
    totalCompletions: 12,
    created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    is_active: true,
  },

  // Alimentação
  {
    id: 'habit-6',
    user_id: 'mock-user',
    title: 'Café da manhã nutritivo',
    description: 'Refeição balanceada pela manhã',
    icon: 'restaurant',
    color: HabitColors.food,
    category: 'alimentacao',
    frequency: 'daily',
    streak: 6,
    bestStreak: 10,
    totalCompletions: 38,
    created_at: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
    is_active: true,
    reminder_time: '07:30',
  },
  {
    id: 'habit-7',
    user_id: 'mock-user',
    title: 'Comer frutas',
    description: 'Incluir frutas nas refeições',
    icon: 'nutrition',
    color: HabitColors.wellness,
    category: 'alimentacao',
    frequency: 'daily',
    streak: 4,
    bestStreak: 8,
    totalCompletions: 31,
    created_at: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(),
    is_active: true,
  },

  // Sono
  {
    id: 'habit-8',
    user_id: 'mock-user',
    title: 'Ritual do sono',
    description: 'Desligar telas 1h antes de dormir',
    icon: 'moon',
    color: HabitColors.sleep,
    category: 'sono',
    frequency: 'daily',
    streak: 2,
    bestStreak: 6,
    totalCompletions: 19,
    created_at: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    is_active: true,
    reminder_time: '21:00',
  },
  {
    id: 'habit-9',
    user_id: 'mock-user',
    title: 'Diário de gratidão',
    description: 'Escrever 3 coisas pelas quais sou grata',
    icon: 'heart',
    color: HabitColors.selfcare,
    category: 'bemestar',
    frequency: 'daily',
    streak: 7,
    bestStreak: 14,
    totalCompletions: 42,
    created_at: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
    is_active: true,
    reminder_time: '22:00',
  },

  // Social
  {
    id: 'habit-10',
    user_id: 'mock-user',
    title: 'Conversar com alguém',
    description: 'Ligar ou conversar com amiga/família',
    icon: 'chatbubbles',
    color: HabitColors.social,
    category: 'social',
    frequency: 'daily',
    streak: 1,
    bestStreak: 4,
    totalCompletions: 15,
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    is_active: true,
  },
];

export const HABIT_CATEGORIES = [
  { id: 'all', name: 'Todos', icon: 'grid', color: ColorTokens.primary[500] },
  { id: 'autocuidado', name: 'Autocuidado', icon: 'sparkles', color: HabitColors.selfcare },
  { id: 'saude', name: 'Saúde', icon: 'medical', color: HabitColors.health },
  { id: 'alimentacao', name: 'Alimentação', icon: 'restaurant', color: HabitColors.food },
  { id: 'exercicio', name: 'Exercício', icon: 'fitness', color: HabitColors.exercise },
  { id: 'sono', name: 'Sono', icon: 'moon', color: HabitColors.sleep },
  { id: 'social', name: 'Social', icon: 'people', color: HabitColors.social },
  { id: 'bemestar', name: 'Bem-estar', icon: 'heart', color: HabitColors.selfcare },
] as const;
