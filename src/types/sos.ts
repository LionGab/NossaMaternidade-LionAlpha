/**
 * Tipos para SOS Mãe - Suporte Emergencial
 * Migrado de app-redesign-studio
 */

export type SentimentType =
  | 'sobrecarregada'
  | 'ansiosa'
  | 'triste'
  | 'irritada'
  | 'sozinha'
  | 'desesperada'
  | 'culpada'
  | 'cansada';

export type OutcomeType =
  | 'calmed'
  | 'talked_to_someone'
  | 'sought_help'
  | 'continued_browsing'
  | 'exited';

export interface SOSInteraction {
  id?: string;
  userId: string;
  sentiment: SentimentType;
  intensity: number; // 1-10
  emotionCode: string;
  inputText?: string;
  timestamp: string;
  durationSeconds: number;
  shared?: boolean;
  outcome?: OutcomeType;
  testimonialShown?: string;
}

export interface CommunityTestimonial {
  id: string;
  authorName: string;
  authorInitials: string;
  avatarUrl?: string;
  sentiment: SentimentType;
  message: string;
  helpedCount: number;
  createdAt: string;
  isAnonymous?: boolean;
}

export interface SOSStats {
  usesToday: number;
  usesThisWeek: number;
  mostCommonSentiment: SentimentType;
  averageIntensity: number;
  positiveOutcomes: number;
}

export interface EmpathyAudio {
  id: string;
  sentiment: SentimentType;
  audioUrl: string;
  transcription: string;
  durationSeconds: number;
  voiceActor: string;
}

export interface SentimentAnalysis {
  sentiment: SentimentType;
  intensity: number;
  keywords: string[];
  needsUrgentHelp: boolean;
  suggestedResources?: string[];
}

export const SENTIMENT_OPTIONS: Array<{ type: SentimentType; label: string; emoji: string; color: string }> = [
  { type: 'sobrecarregada', label: 'Sobrecarregada', emoji: '😮‍💨', color: '#FF6B9D' },
  { type: 'ansiosa', label: 'Ansiosa', emoji: '😰', color: '#F59E0B' },
  { type: 'triste', label: 'Triste', emoji: '😢', color: '#60A5FA' },
  { type: 'irritada', label: 'Irritada', emoji: '😤', color: '#EF4444' },
  { type: 'sozinha', label: 'Sozinha', emoji: '🥺', color: '#8B5CF6' },
  { type: 'desesperada', label: 'Desesperada', emoji: '😭', color: '#DC2626' },
  { type: 'culpada', label: 'Culpada', emoji: '😔', color: '#9333EA' },
  { type: 'cansada', label: 'Cansada', emoji: '😴', color: '#6B7280' },
];

export const EMERGENCY_CONTACTS = [
  {
    name: 'CVV - Centro de Valorização da Vida',
    phone: '188',
    description: 'Apoio emocional 24h, gratuito',
    icon: '💙',
  },
  {
    name: 'SAMU',
    phone: '192',
    description: 'Emergências médicas',
    icon: '🚑',
  },
  {
    name: 'Polícia',
    phone: '190',
    description: 'Emergências de segurança',
    icon: '🚔',
  },
];

