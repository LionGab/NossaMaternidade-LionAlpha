/**
 * Testes para bookmarkService
 *
 * Cobre: toggle, get, isBookmarked, clear, validação de dados corrompidos
 */

// Mock AsyncStorage - persistente usando Map
const mockStorageMap = new Map<string, string>();

// Funções mock sem jest.fn() para garantir persistência
const mockStorage = {
  setItem: (key: string, value: string) => {
    mockStorageMap.set(key, value);
    return Promise.resolve();
  },
  getItem: (key: string) => {
    const value = mockStorageMap.get(key);
    return Promise.resolve(value !== undefined ? value : null);
  },
  removeItem: (key: string) => {
    mockStorageMap.delete(key);
    return Promise.resolve();
  },
  clear: () => {
    mockStorageMap.clear();
    return Promise.resolve();
  },
  getAllKeys: () => {
    return Promise.resolve(Array.from(mockStorageMap.keys()));
  },
  multiGet: (keys: string[]) => {
    return Promise.resolve(
      keys.map((key) => [key, mockStorageMap.get(key) ?? null])
    );
  },
  multiSet: (pairs: [string, string][]) => {
    pairs.forEach(([key, value]) => mockStorageMap.set(key, value));
    return Promise.resolve();
  },
  multiRemove: (keys: string[]) => {
    keys.forEach((key) => mockStorageMap.delete(key));
    return Promise.resolve();
  },
};

jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: mockStorage,
}));

// Mock logger
jest.mock('@/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

// Imports devem vir DEPOIS dos mocks para garantir que os mocks sejam aplicados
import AsyncStorage from '@react-native-async-storage/async-storage';
import { bookmarkService } from '@/services/bookmarkService';

describe('bookmarkService', () => {
  beforeEach(() => {
    // Clear apenas os dados do Map
    mockStorageMap.clear();
  });

  describe('toggleBookmark', () => {
    it('deve adicionar bookmark quando não existe', async () => {
      const bookmark = {
        id: 'test-1',
        type: 'article' as const,
        title: 'Test Article',
        description: 'Test description',
      };

      const result = await bookmarkService.toggleBookmark(bookmark);

      expect(result.data).toBe(true); // true = adicionado
      expect(result.error).toBeNull();

      const stored = await bookmarkService.getBookmarks();

      expect(stored.data).toHaveLength(1);
      expect(stored.data[0]?.id).toBe('test-1');
      expect(stored.data[0]?.savedAt).toBeDefined();
    });

    it('deve remover bookmark quando já existe', async () => {
      const bookmark = {
        id: 'test-1',
        type: 'article' as const,
        title: 'Test Article',
      };

      // Adiciona
      await bookmarkService.toggleBookmark(bookmark);

      // Remove
      const result = await bookmarkService.toggleBookmark(bookmark);

      expect(result.data).toBe(false); // false = removido
      expect(result.error).toBeNull();

      const stored = await bookmarkService.getBookmarks();
      expect(stored.data).toHaveLength(0);
    });

    it('deve adicionar múltiplos bookmarks', async () => {
      const bookmark1 = { id: 'test-1', type: 'article' as const, title: 'Article 1' };
      const bookmark2 = { id: 'test-2', type: 'video' as const, title: 'Video 1' };

      await bookmarkService.toggleBookmark(bookmark1);
      await bookmarkService.toggleBookmark(bookmark2);

      const stored = await bookmarkService.getBookmarks();
      expect(stored.data).toHaveLength(2);
    });
  });

  describe('getBookmarks', () => {
    it('deve retornar array vazio quando não há bookmarks', async () => {
      const result = await bookmarkService.getBookmarks();

      expect(result.data).toEqual([]);
      expect(result.error).toBeNull();
    });

    it('deve retornar bookmarks ordenados por mais recente', async () => {
      // Adiciona 3 bookmarks com delay entre eles
      await bookmarkService.toggleBookmark({ id: 'test-1', type: 'article' as const, title: 'First' });
      await new Promise((resolve) => setTimeout(resolve, 10));

      await bookmarkService.toggleBookmark({ id: 'test-2', type: 'video' as const, title: 'Second' });
      await new Promise((resolve) => setTimeout(resolve, 10));

      await bookmarkService.toggleBookmark({ id: 'test-3', type: 'story' as const, title: 'Third' });

      const result = await bookmarkService.getBookmarks();

      expect(result.data).toHaveLength(3);
      expect(result.data[0]?.id).toBe('test-3'); // Mais recente primeiro
      expect(result.data[1]?.id).toBe('test-2');
      expect(result.data[2]?.id).toBe('test-1');
    });

    it('deve limpar dados corrompidos (não é array)', async () => {
      // Simula dado corrompido
      await AsyncStorage.setItem('@NossaMaternidade:bookmarks', '{"invalid": "data"}');

      const result = await bookmarkService.getBookmarks();

      expect(result.data).toEqual([]);
      expect(result.error).toBeNull();

      // Verifica que foi removido
      const stored = await AsyncStorage.getItem('@NossaMaternidade:bookmarks');
      expect(stored).toBeNull();
    });

    it('deve filtrar bookmarks com estrutura inválida', async () => {
      // Simula bookmarks com alguns inválidos
      const mixed = [
        { id: 'test-1', type: 'article', title: 'Valid', savedAt: '2024-01-01' },
        { id: 'test-2', title: 'Missing type' }, // inválido: falta type
        { type: 'video', title: 'Missing id' }, // inválido: falta id
        { id: 'test-3', type: 'video', title: 'Valid 2', savedAt: '2024-01-02' },
      ];

      await AsyncStorage.setItem('@NossaMaternidade:bookmarks', JSON.stringify(mixed));

      const result = await bookmarkService.getBookmarks();

      expect(result.data).toHaveLength(2); // Apenas os válidos
      expect(result.data[0]?.id).toBe('test-3');
      expect(result.data[1]?.id).toBe('test-1');
    });
  });

  describe('isBookmarked', () => {
    it('deve retornar false quando bookmark não existe', async () => {
      const result = await bookmarkService.isBookmarked('test-1');

      expect(result.data).toBe(false);
      expect(result.error).toBeNull();
    });

    it('deve retornar true quando bookmark existe', async () => {
      await bookmarkService.toggleBookmark({
        id: 'test-1',
        type: 'article' as const,
        title: 'Test',
      });

      const result = await bookmarkService.isBookmarked('test-1');

      expect(result.data).toBe(true);
      expect(result.error).toBeNull();
    });
  });

  describe('clearAllBookmarks', () => {
    it('deve limpar todos os bookmarks', async () => {
      // Adiciona alguns bookmarks
      await bookmarkService.toggleBookmark({ id: 'test-1', type: 'article' as const, title: 'Test 1' });
      await bookmarkService.toggleBookmark({ id: 'test-2', type: 'video' as const, title: 'Test 2' });

      // Limpa
      const result = await bookmarkService.clearAllBookmarks();

      expect(result.data).toBe(true);
      expect(result.error).toBeNull();

      // Verifica que foi limpo
      const stored = await bookmarkService.getBookmarks();
      expect(stored.data).toHaveLength(0);
    });
  });

  describe('Error handling', () => {
    it('deve retornar erro quando AsyncStorage falha', async () => {
      // Mock AsyncStorage para lançar erro
      const mockError = new Error('Storage error');
      jest.spyOn(AsyncStorage, 'getItem').mockRejectedValueOnce(mockError);

      const result = await bookmarkService.getBookmarks();

      expect(result.data).toEqual([]);
      expect(result.error).toEqual(mockError);
    });

    it('deve retornar erro quando JSON.parse falha', async () => {
      // Simula JSON inválido
      jest.spyOn(AsyncStorage, 'getItem').mockResolvedValueOnce('invalid json {');

      const result = await bookmarkService.getBookmarks();

      expect(result.data).toEqual([]);
      expect(result.error).toBeDefined();
    });
  });
});
