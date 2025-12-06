/**
 * HomeScreen Constants
 *
 * Centralizadas para facilitar manutenção e evitar magic numbers.
 *
 * @version 1.0.0
 */

import { Tokens } from '@/theme/tokens';

/**
 * URLs de imagens (temporário - TODO: mover para Supabase Storage)
 */
export const IMAGES = {
  logo: 'https://i.imgur.com/jzb0IgO.jpg',
  sleepCard: 'https://i.imgur.com/w4rZvGG.jpg',
  nathiaAvatar: 'https://i.imgur.com/oB9ewPG.jpg',
} as const;

/**
 * Layout dimensions
 */
export const LAYOUT = {
  // Header
  headerPaddingTop: Tokens.spacing['6'],
  headerPaddingBottom: Tokens.spacing['6'],
  headerHeight: 180, // Altura aproximada do header (calcula dinamicamente se possível)

  // Avatar sizes
  logoSize: 64,
  avatarSize: 56,
  statusIndicatorSize: 20,
  statusIndicatorSmall: 16,

  // Cards
  sleepCardImageHeight: 192,
  iconContainerSize: 64,
  iconSize: 36,
  iconSizeSmall: 24,

  // Blur effects (círculos decorativos)
  blurCircleLarge: 256,
  blurCircleMedium: 192,
  blurCircleSmall: 160,

  // Spacing
  contentPaddingBottom: 100,
  sectionSpacing: Tokens.spacing['8'],
} as const;

/**
 * Mensagens de conforto para diferentes contextos
 */
export const COMFORT_MESSAGES = {
  sleep: [
    'O sono é tão importante para você, mãe. Como você tem dormido? Quer conversar sobre o que está afetando seu descanso? Estou aqui para te ajudar a encontrar formas de melhorar isso. 🌙',
    'Descanso é autocuidado, e você merece isso. Vamos conversar sobre como você pode ter noites melhores? Estou aqui para te apoiar nessa jornada. 💙',
  ],
  story: [
    'Histórias de outras mães podem ser tão acolhedoras, né? Quer conversar sobre o que você está sentindo ao ler essas histórias? Estou aqui para te ouvir. 💙',
    'Compartilhar experiências nos conecta. Quer falar sobre o que essas histórias despertam em você? Estou aqui para conversar e apoiar. 🌸',
  ],
  welcome: [
    'Oi, mãe! Tô aqui com você. Como você está se sentindo hoje? Quer conversar sobre o que está no seu coração? 💙',
    'Olá! Estou aqui para te ouvir e apoiar. O que você gostaria de compartilhar hoje? Como você está? 🌸',
  ],
  mic: [
    'Oi! Pode falar, estou te ouvindo. Como você está se sentindo agora? 🎤💙',
    'Fale livremente, mãe. Estou aqui para te escutar com toda atenção e carinho. 🎤🌸',
  ],
  emotions: {
    '😴': [
      'Entendo que você está cansada. O cansaço faz parte dessa jornada, e você está fazendo o melhor que pode. Que tal respirarmos juntas um pouquinho? 💙',
      'Cansada, né? Isso é completamente normal. Você está dando tudo de si, e isso já é incrível. Vamos conversar sobre como você pode se cuidar melhor? 🌙',
    ],
    '😊': [
      'Que bom saber que você está bem! É importante celebrar esses momentos. O que está te deixando feliz hoje? Vamos aproveitar essa energia positiva! ✨',
      'Fico feliz em saber que você está se sentindo bem! Esses momentos são preciosos. Quer compartilhar o que está te trazendo essa alegria? 💖',
    ],
    '😰': [
      'Vejo que você está ansiosa. A ansiedade pode ser difícil, mas você não está sozinha nisso. Vamos respirar juntas e conversar sobre o que está te preocupando? 💙',
      'Ansiedade é pesada, eu sei. Mas você é mais forte do que imagina. Estou aqui para te ouvir. O que está te deixando ansiosa hoje? 🌸',
    ],
    '🥰': [
      'Que lindo ver você grata! A gratidão é um sentimento tão especial. O que está te deixando grata hoje? Vamos celebrar isso juntas! ✨',
      'Gratidão é um presente. Fico feliz que você esteja sentindo isso. Quer compartilhar o que está te enchendo de gratidão? 💖',
    ],
  },
} as const;

/**
 * Helper para pegar mensagem aleatória
 * Retorna fallback se array vazio
 */
export function getRandomMessage(messages: readonly string[]): string {
  if (messages.length === 0) {
    return 'Estou aqui com você 💙';
  }
  return messages[Math.floor(Math.random() * messages.length)] ?? messages[0];
}
