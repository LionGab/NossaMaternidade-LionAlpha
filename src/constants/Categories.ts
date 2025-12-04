/**
 * Categorias de conteúdo
 */

export const CONTENT_CATEGORIES = [
  { id: 'todos', name: 'Todos', icon: 'grid-outline' },
  { id: 'video', name: 'Vídeo', icon: 'videocam-outline' },
  { id: 'audio', name: 'Áudio', icon: 'headset-outline' },
  { id: 'texto', name: 'Texto', icon: 'document-text-outline' },
  { id: 'reels', name: 'Reels', icon: 'film-outline' },
] as const;

export type ContentCategoryId = (typeof CONTENT_CATEGORIES)[number]['id'];
