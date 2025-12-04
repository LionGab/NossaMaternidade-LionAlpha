/**
 * Conteúdos do Mundo Nath
 *
 * Esta estrutura permite adicionar facilmente:
 * - Áudios reais da Nathália Valente
 * - Vídeos estilo Instagram/TikTok
 * - Reels
 * - Textos e bastidores
 *
 * Para adicionar conteúdo real, substitua os URLs mockados pelos reais
 */

import { ContentItem } from '../types/content';

// Áudios Reais da Nathália Valente
export const AUDIOS_REAIS: ContentItem[] = [
  {
    id: 'audio-001',
    title: 'Meditação: 5 minutos para você se reconectar',
    type: 'audio',
    isExclusive: true,
    date: 'Hoje',
    description:
      'Uma meditação guiada para você encontrar paz no meio da correria. Perfeita para fazer no banho ou antes de dormir.',
    imageUrl: 'https://picsum.photos/seed/meditacao/400/400',
    duration: '5:20',
    views: 12500,
    likes: 890,
    category: 'Bem-estar',
    tags: ['meditação', 'autocuidado', 'relaxamento'],
    // URL do áudio real (substituir quando disponível)
    audioUrl: 'https://example.com/audios/meditacao-5min.mp3',
  },
  {
    id: 'audio-002',
    title: 'Desabafo: A realidade do pós-parto que ninguém conta',
    type: 'audio',
    isExclusive: true,
    date: 'Ontem',
    description:
      'Um áudio sincero sobre os primeiros dias após o parto. A verdade que você precisa ouvir.',
    imageUrl: 'https://picsum.photos/seed/posparto/400/400',
    duration: '12:45',
    views: 8900,
    likes: 567,
    category: 'Maternidade Real',
    tags: ['pós-parto', 'realidade', 'desabafo'],
    audioUrl: 'https://example.com/audios/posparto-realidade.mp3',
  },
  {
    id: 'audio-003',
    title: 'Dica rápida: Como lidar com a culpa materna',
    type: 'audio',
    isExclusive: false,
    date: '3 dias atrás',
    description: 'Uma conversa rápida sobre como lidar com aquela culpa que toda mãe sente.',
    imageUrl: 'https://picsum.photos/seed/culpa/400/400',
    duration: '8:30',
    views: 15600,
    likes: 1200,
    category: 'Dicas',
    tags: ['culpa', 'maternidade', 'dicas'],
    audioUrl: 'https://example.com/audios/culpa-materna.mp3',
  },
];

// Vídeos estilo Instagram/TikTok
export const VIDEOS_INSTAGRAM: ContentItem[] = [
  {
    id: 'video-001',
    title: 'Diário da madrugada com o Thales',
    type: 'video',
    isExclusive: true,
    date: 'Há 2 horas',
    description:
      'Gravei às 3h da manhã. A realidade que ninguém mostra no Instagram sobre as cólicas.',
    imageUrl: 'https://picsum.photos/seed/madrugada/400/400',
    duration: '12:34',
    views: 12400,
    likes: 890,
    category: 'Maternidade Real',
    tags: ['cólicas', 'madrugada', 'realidade'],
    videoUrl: 'https://example.com/videos/madrugada-thales.mp4',
    thumbnailUrl: 'https://picsum.photos/seed/madrugada/400/400',
  },
  {
    id: 'video-002',
    title: 'Bastidores: O que realmente acontece no quarto do bebê',
    type: 'video',
    isExclusive: true,
    date: 'Ontem',
    description: 'O que eu comprei e me arrependi. Dica de ouro pra economizar.',
    imageUrl: 'https://i.imgur.com/tNIrNIs.jpg',
    duration: '8:15',
    views: 8900,
    likes: 567,
    category: 'Dicas',
    tags: ['decoração', 'economia', 'dicas'],
    videoUrl: 'https://example.com/videos/bastidores-quarto.mp4',
    thumbnailUrl: 'https://i.imgur.com/tNIrNIs.jpg',
  },
  {
    id: 'video-003',
    title: 'TikTok: 3 coisas que ninguém te conta sobre amamentação',
    type: 'reels',
    isExclusive: false,
    date: '2 dias atrás',
    description: 'A verdade sobre amamentação que você precisa saber antes de começar.',
    imageUrl: 'https://picsum.photos/seed/amamentacao/400/400',
    duration: '1:30',
    views: 45600,
    likes: 3400,
    category: 'Amamentação',
    tags: ['amamentação', 'dicas', 'tiktok'],
    videoUrl: 'https://example.com/videos/reels-amamentacao.mp4',
    thumbnailUrl: 'https://picsum.photos/seed/amamentacao/400/400',
  },
  {
    id: 'video-004',
    title: 'Instagram Story: Um dia na minha vida',
    type: 'reels',
    isExclusive: false,
    date: 'Semana passada',
    description: 'Um dia real na vida de mãe. Sem filtros, sem perfeição.',
    imageUrl: 'https://picsum.photos/seed/dia-real/400/400',
    duration: '2:45',
    views: 23400,
    likes: 1890,
    category: 'Dia a Dia',
    tags: ['dia-a-dia', 'realidade', 'instagram'],
    videoUrl: 'https://example.com/videos/story-dia-real.mp4',
    thumbnailUrl: 'https://picsum.photos/seed/dia-real/400/400',
  },
];

// Textos e Reflexões
export const TEXTOS_REAIS: ContentItem[] = [
  {
    id: 'texto-001',
    title: 'Carta para meu corpo pós-parto',
    type: 'text',
    isExclusive: true,
    date: 'Ontem',
    description: 'Um texto sobre aceitação e as marcas que contam nossa história.',
    imageUrl: 'https://picsum.photos/seed/corpo/400/400',
    views: 8900,
    likes: 1560,
    category: 'Autoestima',
    tags: ['corpo', 'aceitação', 'amor-próprio'],
    content: `
      Querido corpo,

      Hoje eu olho para você e vejo marcas que antes me assustavam. 
      Estrias que contam histórias de crescimento, de vida crescendo dentro de mim.
      Uma barriga que já não é a mesma, mas que carregou meu maior amor.
      
      Você mudou, e eu também. E está tudo bem.
      
      Com amor,
      Nath
    `,
  },
  {
    id: 'texto-002',
    title: 'Quando a maternidade não é como você esperava',
    type: 'text',
    isExclusive: true,
    date: '3 dias atrás',
    description: 'Sobre expectativas, realidade e encontrar beleza no inesperado.',
    imageUrl: 'https://picsum.photos/seed/expectativas/400/400',
    views: 12300,
    likes: 2100,
    category: 'Reflexões',
    tags: ['expectativas', 'realidade', 'maternidade'],
    content: `
      Eu esperava que seria diferente. Mais fácil, mais natural, mais... perfeito.
      
      Mas a maternidade real não é sobre perfeição. É sobre tentar, errar, 
      aprender e tentar de novo. É sobre encontrar beleza no caos.
      
      E sabe o que é mais bonito? É que mesmo não sendo como eu esperava,
      é exatamente como deveria ser.
    `,
  },
];

// Série Original: Bastidores com o Thales
export interface Episode {
  id: string;
  number: number;
  title: string;
  duration: string;
  watched: boolean;
  locked: boolean;
  videoUrl?: string;
  thumbnailUrl?: string;
  description?: string;
}

export const SERIE_ORIGINAL: {
  title: string;
  subtitle: string;
  description: string;
  episodes: Episode[];
} = {
  title: 'Bastidores com o Thales',
  subtitle: 'Série Original',
  description: 'Uma série documental sobre maternidade real, sem filtros.',
  episodes: [
    {
      id: 'ep-001',
      number: 1,
      title: 'Primeira noite sem dormir',
      duration: '10 min',
      watched: true,
      locked: false,
      videoUrl: 'https://example.com/videos/ep1-primeira-noite.mp4',
      thumbnailUrl: 'https://picsum.photos/seed/ep1/400/400',
      description: 'A realidade da primeira noite em casa com o bebê.',
    },
    {
      id: 'ep-002',
      number: 2,
      title: 'Quando a culpa bate',
      duration: '12 min',
      watched: true,
      locked: false,
      videoUrl: 'https://example.com/videos/ep2-culpa.mp4',
      thumbnailUrl: 'https://picsum.photos/seed/ep2/400/400',
      description: 'Sobre a culpa materna e como lidar com ela.',
    },
    {
      id: 'ep-003',
      number: 3,
      title: 'A relação mudou?',
      duration: '15 min',
      watched: true,
      locked: false,
      videoUrl: 'https://example.com/videos/ep3-relacao.mp4',
      thumbnailUrl: 'https://picsum.photos/seed/ep3/400/400',
      description: 'Como a maternidade muda o relacionamento.',
    },
    {
      id: 'ep-004',
      number: 4,
      title: 'Rede de apoio',
      duration: '08 min',
      watched: true,
      locked: false,
      videoUrl: 'https://example.com/videos/ep4-rede-apoio.mp4',
      thumbnailUrl: 'https://picsum.photos/seed/ep4/400/400',
      description: 'A importância de ter uma rede de apoio.',
    },
    {
      id: 'ep-005',
      number: 5,
      title: 'Voltando ao trabalho',
      duration: '11 min',
      watched: true,
      locked: false,
      videoUrl: 'https://example.com/videos/ep5-trabalho.mp4',
      thumbnailUrl: 'https://picsum.photos/seed/ep5/400/400',
      description: 'O desafio de voltar ao trabalho após a licença.',
    },
    {
      id: 'ep-006',
      number: 6,
      title: 'O corpo pós-parto',
      duration: '14 min',
      watched: false,
      locked: false,
      videoUrl: 'https://example.com/videos/ep6-corpo.mp4',
      thumbnailUrl: 'https://picsum.photos/seed/ep6/400/400',
      description: 'Aceitando e amando o corpo após a gravidez.',
    },
    {
      id: 'ep-007',
      number: 7,
      title: 'Ritual de encerramento',
      duration: '20 min',
      watched: false,
      locked: true,
      videoUrl: 'https://example.com/videos/ep7-ritual.mp4',
      thumbnailUrl: 'https://picsum.photos/seed/ep7/400/400',
      description: 'Um ritual especial para fechar essa jornada.',
    },
  ],
};

// Combinar todos os conteúdos
export const ALL_CONTENT: ContentItem[] = [...AUDIOS_REAIS, ...VIDEOS_INSTAGRAM, ...TEXTOS_REAIS];

// Função helper para filtrar por tipo
export const getContentByType = (type: ContentItem['type']): ContentItem[] => {
  return ALL_CONTENT.filter((item) => item.type === type);
};

// Função helper para buscar conteúdo
export const searchContent = (query: string): ContentItem[] => {
  const lowerQuery = query.toLowerCase();
  return ALL_CONTENT.filter(
    (item) =>
      item.title.toLowerCase().includes(lowerQuery) ||
      item.description.toLowerCase().includes(lowerQuery) ||
      item.tags?.some((tag) => tag.toLowerCase().includes(lowerQuery))
  );
};
