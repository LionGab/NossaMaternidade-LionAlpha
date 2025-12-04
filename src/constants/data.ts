import { Post } from '../types/content';

export const INITIAL_CHAT_GREETING =
  'Oi! Eu sou a MãesValente. Obrigada por confiar em mim. Como você está se sentindo agora?';

export const MOCK_POSTS: Post[] = [
  {
    id: '1',
    title: 'Como lidar com a culpa materna hoje?',
    type: 'video',
    thumbnailUrl: 'https://picsum.photos/400/300?random=1',
    isNew: true,
  },
  {
    id: '2',
    title: 'Meu relato de parto real e sem filtros',
    type: 'text',
    thumbnailUrl: 'https://picsum.photos/400/300?random=2',
    isNew: false,
  },
  {
    id: '3',
    title: '3 dicas para dormir melhor na gravidez',
    type: 'reels',
    thumbnailUrl: 'https://picsum.photos/400/300?random=3',
    isNew: false,
  },
  {
    id: '4',
    title: 'Amamentação: O que ninguém te conta',
    type: 'audio',
    thumbnailUrl: 'https://picsum.photos/400/300?random=4',
    isNew: true,
  },
];
