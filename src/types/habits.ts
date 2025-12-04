/**
 * Tipos do sistema de hábitos diários
 */

export type HabitCategory =
  | 'saude'
  | 'autocuidado'
  | 'bebe'
  | 'mental'
  | 'social'
  | 'bemestar'
  | 'exercicio'
  | 'alimentacao'
  | 'sono';

export type HabitFrequency = 'daily' | 'weekly' | 'custom';

export interface Habit {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  category: HabitCategory;
  icon?: string; // emoji ou nome do ícone
  frequency: HabitFrequency;
  target_days?: number[]; // [0-6] para dias da semana
  reminder_time?: string; // HH:mm
  is_active: boolean;
  created_at: string;
  // Legacy/compatibilidade fields
  color?: string;
  streak?: number;
  bestStreak?: number;
  totalCompletions?: number;
}

export interface HabitLog {
  id: string;
  habit_id: string;
  user_id: string;
  completed: boolean;
  completed_at?: string;
  notes?: string;
  date: string; // YYYY-MM-DD
}

export interface HabitStats {
  habit_id: string;
  total_completions: number;
  current_streak: number;
  longest_streak: number;
  completion_rate: number; // 0-100%
}

// Legacy types (mantidos para compatibilidade)
export interface HabitCompletion {
  habitId: string;
  date: string; // YYYY-MM-DD format
  completed: boolean;
  notes?: string;
}
