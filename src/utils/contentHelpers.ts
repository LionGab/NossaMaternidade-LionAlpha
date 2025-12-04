/**
 * Helpers para conteúdo
 * Funções utilitárias para trabalhar com ContentItem
 */

import { Colors, ColorTokens } from '../theme';
import { ContentItem } from '../types/content';

export const getTypeIcon = (type: ContentItem['type']): string => {
  switch (type) {
    case 'video':
      return 'play-circle';
    case 'audio':
      return 'headset';
    case 'text':
      return 'document-text';
    // case 'Bastidor': // Mapped to video in data
    //   return 'camera';
    case 'reels':
      return 'film';
    default:
      return 'ellipse';
  }
};

export const getTypeColor = (type: ContentItem['type']): string => {
  switch (type) {
    case 'video':
      return Colors.primary.main;
    case 'audio':
      return Colors.accent.orange;
    case 'text':
      return Colors.accent.green;
    // case 'Bastidor':
    //   return Colors.accent.pink;
    case 'reels':
      return ColorTokens.accent.pink; // Rosa para reels
    default:
      return Colors.text.secondary;
  }
};

export const getActionButtonText = (type: ContentItem['type']): string => {
  switch (type) {
    case 'video':
      return 'Assistir agora';
    case 'audio':
      return 'Ouvir agora';
    case 'text':
      return 'Ler completo';
    // case 'Bastidor':
    //   return 'Ver bastidores';
    case 'reels':
      return 'Assistir Reel';
    default:
      return 'Abrir';
  }
};

export const formatViews = (views?: number): string => {
  if (!views) return '0';
  if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
  if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
  return views.toString();
};

export const formatDuration = (duration?: string): string => {
  if (!duration) return '';
  return duration;
};

export const filterContentByCategory = (
  content: ContentItem[],
  category: string
): ContentItem[] => {
  if (category === 'todos') return content;

  return content.filter((item) => {
    if (category === 'video') return item.type === 'video';
    if (category === 'audio') return item.type === 'audio';
    if (category === 'texto') return item.type === 'text';
    if (category === 'reels') return item.type === 'reels';
    return true;
  });
};

export const searchContent = (content: ContentItem[], query: string): ContentItem[] => {
  if (!query.trim()) return content;

  const lowerQuery = query.toLowerCase();
  return content.filter(
    (item) =>
      item.title.toLowerCase().includes(lowerQuery) ||
      item.description.toLowerCase().includes(lowerQuery) ||
      item.tags?.some((tag) => tag.toLowerCase().includes(lowerQuery))
  );
};
