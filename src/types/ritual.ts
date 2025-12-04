/**
 * Tipos para Ritual de Reconexão
 * Migrado de app-redesign-studio
 */

export type EmotionValue = '😴' | '😢' | '😰' | '😊' | '🥰';

export interface EmotionState {
  emotion: EmotionValue;
  intensity: number; // 1-10
  note?: string;
}

export type RitualStepType =
  | 'preparation'
  | 'breathing'
  | 'gratitude'
  | 'intention'
  | 'visualization'
  | 'closing';

export type AnimationType =
  | 'gradient'
  | 'pulse'
  | 'particles'
  | 'waves';

export interface BreathingConfig {
  pattern: '4-4-4' | '4-7-8' | 'box';
  inhaleDuration: number;
  holdDuration: number;
  exhaleDuration: number;
  cycles: number;
}

export interface RitualStep {
  id: string;
  type: RitualStepType;
  title: string;
  description: string;
  content: string;
  duration: number; // seconds
  breathingConfig?: BreathingConfig;
  audioTrack?: string;
  animationType?: AnimationType;
}

export type AmbientSoundType =
  | 'rain'
  | 'ocean'
  | 'forest'
  | 'birds'
  | 'fireplace'
  | 'white_noise';

export interface AmbientSoundConfig {
  type: AmbientSoundType;
  volume: number; // 0-1
  enabled: boolean;
}

export interface RitualSession {
  id?: string;
  userId: string;
  startTime: string;
  endTime?: string;
  emotionBefore: EmotionState;
  emotionAfter?: EmotionState;
  stepsCompleted: string[];
  totalDuration: number; // seconds
  ambientSound?: AmbientSoundType;
}

export interface RitualStats {
  totalSessions: number;
  totalMinutes: number;
  currentStreak: number;
  longestStreak: number;
  averageEmotionImprovement: number;
  favoriteStep?: RitualStepType;
  lastSessionDate?: string;
}

export const EMOTION_OPTIONS: Array<{ value: EmotionValue; label: string }> = [
  { value: '😴', label: 'Exausta' },
  { value: '😢', label: 'Triste' },
  { value: '😰', label: 'Ansiosa' },
  { value: '😊', label: 'Tranquila' },
  { value: '🥰', label: 'Feliz' },
];

export const AMBIENT_SOUNDS: Array<{ type: AmbientSoundType; label: string; icon: string }> = [
  { type: 'rain', label: 'Chuva', icon: '🌧️' },
  { type: 'ocean', label: 'Ondas', icon: '🌊' },
  { type: 'forest', label: 'Floresta', icon: '🌲' },
  { type: 'birds', label: 'Pássaros', icon: '🐦' },
  { type: 'fireplace', label: 'Lareira', icon: '🔥' },
  { type: 'white_noise', label: 'Ruído branco', icon: '📻' },
];

export const DEFAULT_BREATHING_CONFIG: BreathingConfig = {
  pattern: '4-7-8',
  inhaleDuration: 4,
  holdDuration: 7,
  exhaleDuration: 8,
  cycles: 5,
};

