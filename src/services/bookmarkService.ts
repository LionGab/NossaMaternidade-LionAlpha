/**
 * Bookmark Service
 *
 * Gerencia conteúdo salvo/favoritado pela usuária.
 * MVP: Usa AsyncStorage (local)
 * TODO: Migrar para Supabase para sincronização cross-device
 *
 * @version 1.0.0
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

import { logger } from '@/utils/logger';

const BOOKMARKS_KEY = '@NossaMaternidade:bookmarks';

export interface Bookmark {
  id: string;
  type: 'content' | 'article' | 'video' | 'story' | 'special';
  title: string;
  description?: string;
  thumbnailUrl?: string;
  savedAt: string; // ISO timestamp
  metadata?: Record<string, unknown>;
}

/**
 * Salvar/remover bookmark (toggle)
 */
async function toggleBookmark(bookmark: Omit<Bookmark, 'savedAt'>): Promise<{ data: boolean; error: null } | { data: null; error: Error }> {
  try {
    const bookmarks = await getBookmarks();
    if (bookmarks.error) {
      return { data: null, error: bookmarks.error };
    }

    const exists = bookmarks.data.some((b) => b.id === bookmark.id);

    if (exists) {
      // Remove
      const updated = bookmarks.data.filter((b) => b.id !== bookmark.id);
      await AsyncStorage.setItem(BOOKMARKS_KEY, JSON.stringify(updated));
      logger.info('[bookmarkService] Bookmark removed', { id: bookmark.id });
      return { data: false, error: null }; // false = removido
    } else {
      // Adiciona
      const newBookmark: Bookmark = {
        ...bookmark,
        savedAt: new Date().toISOString(),
      };
      const updated = [...bookmarks.data, newBookmark];
      await AsyncStorage.setItem(BOOKMARKS_KEY, JSON.stringify(updated));
      logger.info('[bookmarkService] Bookmark added', { id: bookmark.id });
      return { data: true, error: null }; // true = adicionado
    }
  } catch (error) {
    logger.error('[bookmarkService] toggleBookmark failed', error);
    return { data: null, error: error as Error };
  }
}

/**
 * Obter todos os bookmarks (ordenado por mais recente)
 */
async function getBookmarks(): Promise<{ data: Bookmark[]; error: null } | { data: []; error: Error }> {
  try {
    const stored = await AsyncStorage.getItem(BOOKMARKS_KEY);
    if (!stored) {
      return { data: [], error: null };
    }

    const parsed = JSON.parse(stored);

    // Validação básica: deve ser array
    if (!Array.isArray(parsed)) {
      logger.warn('[bookmarkService] Stored data is not an array, resetting');
      await AsyncStorage.removeItem(BOOKMARKS_KEY);
      return { data: [], error: null };
    }

    // Validação de estrutura dos bookmarks
    const bookmarks: Bookmark[] = parsed.filter((item): item is Bookmark => {
      return (
        typeof item === 'object' &&
        item !== null &&
        typeof item.id === 'string' &&
        typeof item.type === 'string' &&
        typeof item.title === 'string' &&
        typeof item.savedAt === 'string'
      );
    });

    // Se houve itens inválidos, sobrescreve com os válidos
    if (bookmarks.length !== parsed.length) {
      logger.warn('[bookmarkService] Some bookmarks were invalid, cleaned up');
      await AsyncStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
    }

    // Ordena por mais recente primeiro
    const sorted = bookmarks.sort((a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime());

    return { data: sorted, error: null };
  } catch (error) {
    logger.error('[bookmarkService] getBookmarks failed', error);
    return { data: [], error: error as Error };
  }
}

/**
 * Verificar se item está salvo
 */
async function isBookmarked(id: string): Promise<{ data: boolean; error: null } | { data: false; error: Error }> {
  try {
    const bookmarks = await getBookmarks();
    if (bookmarks.error) {
      return { data: false, error: bookmarks.error };
    }

    const exists = bookmarks.data.some((b) => b.id === id);
    return { data: exists, error: null };
  } catch (error) {
    logger.error('[bookmarkService] isBookmarked failed', error);
    return { data: false, error: error as Error };
  }
}

/**
 * Limpar todos os bookmarks (cuidado!)
 */
async function clearAllBookmarks(): Promise<{ data: true; error: null } | { data: null; error: Error }> {
  try {
    await AsyncStorage.removeItem(BOOKMARKS_KEY);
    logger.warn('[bookmarkService] All bookmarks cleared');
    return { data: true, error: null };
  } catch (error) {
    logger.error('[bookmarkService] clearAllBookmarks failed', error);
    return { data: null, error: error as Error };
  }
}

export const bookmarkService = {
  toggleBookmark,
  getBookmarks,
  isBookmarked,
  clearAllBookmarks,
};
