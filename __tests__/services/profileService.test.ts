/**
 * Testes para ProfileService
 * Conforme Plano de Deploy - Aumentar cobertura para 40%+
 */

// Mock do Supabase antes de importar
jest.mock('../../src/services/supabase', () => ({
  supabase: {
    auth: {
      getUser: jest.fn(),
    },
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(),
        })),
      })),
      update: jest.fn(() => ({
        eq: jest.fn(),
      })),
    })),
    storage: {
      from: jest.fn(() => ({
        upload: jest.fn(),
        getPublicUrl: jest.fn(),
      })),
    },
  },
}));

// Mock do FileSystem
jest.mock('expo-file-system', () => ({
  readAsStringAsync: jest.fn(),
}));

// Mock do logger
jest.mock('../../src/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  },
}));

import { supabase } from '../../src/services/supabase';
import { profileService } from '../../src/services/profileService';
import * as FileSystem from 'expo-file-system';

describe('ProfileService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getCurrentProfile', () => {
    it('deve retornar perfil quando usuária está autenticada', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
      };

      const mockProfile = {
        id: 'user-123',
        full_name: 'Test User',
        avatar_url: 'https://example.com/avatar.jpg',
        motherhood_stage: 'pregnant',
      };

      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
      });

      const selectMock = jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn().mockResolvedValue({
            data: mockProfile,
            error: null,
          }),
        })),
      }));

      (supabase.from as jest.Mock).mockReturnValue({
        select: selectMock,
      });

      const result = await profileService.getCurrentProfile();

      expect(result).toEqual(mockProfile);
      expect(supabase.from).toHaveBeenCalledWith('profiles');
    });

    it('deve retornar null quando usuária não está autenticada', async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: null },
      });

      const result = await profileService.getCurrentProfile();

      expect(result).toBeNull();
    });

    it('deve retornar null quando há erro ao buscar perfil', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
      };

      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
      });

      const selectMock = jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn().mockResolvedValue({
            data: null,
            error: { message: 'Not found' },
          }),
        })),
      }));

      (supabase.from as jest.Mock).mockReturnValue({
        select: selectMock,
      });

      const result = await profileService.getCurrentProfile();

      expect(result).toBeNull();
    });
  });

  describe('getProfileById', () => {
    it('deve retornar perfil quando encontrado', async () => {
      const mockProfile = {
        id: 'user-123',
        full_name: 'Test User',
      };

      const selectMock = jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn().mockResolvedValue({
            data: mockProfile,
            error: null,
          }),
        })),
      }));

      (supabase.from as jest.Mock).mockReturnValue({
        select: selectMock,
      });

      const result = await profileService.getProfileById('user-123');

      expect(result).toEqual({ ...mockProfile, id: 'user-123' });
      expect(supabase.from).toHaveBeenCalledWith('profiles');
    });

    it('deve retornar null quando perfil não encontrado', async () => {
      const selectMock = jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn().mockResolvedValue({
            data: null,
            error: { message: 'Not found' },
          }),
        })),
      }));

      (supabase.from as jest.Mock).mockReturnValue({
        select: selectMock,
      });

      const result = await profileService.getProfileById('user-123');

      expect(result).toBeNull();
    });
  });

  describe('updateProfile', () => {
    it('deve atualizar perfil com sucesso', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
      };

      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
      });

      const updateMock = jest.fn(() => ({
        eq: jest.fn().mockResolvedValue({
          error: null,
        }),
      }));

      (supabase.from as jest.Mock).mockReturnValue({
        update: updateMock,
      });

      const updates = {
        full_name: 'Updated Name',
        motherhood_stage: 'postpartum',
      };

      const result = await profileService.updateProfile(updates);

      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
      expect(updateMock).toHaveBeenCalledWith(updates);
    });

    it('deve retornar erro quando usuária não está autenticada', async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: null },
      });

      const result = await profileService.updateProfile({ full_name: 'Test' });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Usuária não autenticada');
    });

    it('deve retornar erro quando atualização falha', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
      };

      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
      });

      const updateMock = jest.fn(() => ({
        eq: jest.fn().mockResolvedValue({
          error: { message: 'Update failed' },
        }),
      }));

      (supabase.from as jest.Mock).mockReturnValue({
        update: updateMock,
      });

      const result = await profileService.updateProfile({ full_name: 'Test' });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('uploadAvatar', () => {
    it('deve fazer upload de avatar com sucesso', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
      };

      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
      });

      (FileSystem.readAsStringAsync as jest.Mock).mockResolvedValue('base64data');

      const uploadMock = jest.fn().mockResolvedValue({
        error: null,
      });

      const getPublicUrlMock = jest.fn().mockReturnValue({
        data: {
          publicUrl: 'https://example.com/avatar.jpg',
        },
      });

      (supabase.storage.from as jest.Mock).mockReturnValue({
        upload: uploadMock,
        getPublicUrl: getPublicUrlMock,
      });

      const result = await profileService.uploadAvatar('file:///path/to/image.jpg');

      expect(result.url).toBe('https://example.com/avatar.jpg');
      expect(result.error).toBeUndefined();
      expect(FileSystem.readAsStringAsync).toHaveBeenCalled();
      expect(uploadMock).toHaveBeenCalled();
    });

    it('deve retornar erro quando usuária não está autenticada', async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: null },
      });

      const result = await profileService.uploadAvatar('file:///path/to/image.jpg');

      expect(result.url).toBeNull();
      expect(result.error).toBe('Usuária não autenticada');
    });

    it('deve retornar erro quando upload falha', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
      };

      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
      });

      (FileSystem.readAsStringAsync as jest.Mock).mockResolvedValue('base64data');

      const uploadMock = jest.fn().mockResolvedValue({
        error: { message: 'Upload failed' },
      });

      (supabase.storage.from as jest.Mock).mockReturnValue({
        upload: uploadMock,
      });

      const result = await profileService.uploadAvatar('file:///path/to/image.jpg');

      expect(result.url).toBeNull();
      expect(result.error).toBeDefined();
    });
  });
});
