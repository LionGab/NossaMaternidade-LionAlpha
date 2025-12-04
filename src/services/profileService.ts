import type { StorageError } from '@supabase/storage-js';
import type { PostgrestError } from '@supabase/supabase-js';
import { decode } from 'base64-arraybuffer';
import * as FileSystem from 'expo-file-system';

import type { UserProfile } from '@/types/user';
import { logger } from '@/utils/logger';

import { supabase } from './supabase';

// Re-export UserProfile for backward compatibility
export type { UserProfile } from '@/types/user';

export interface ServiceResponse {
  success: boolean;
  error?: PostgrestError | StorageError | string;
}

export interface AvatarUploadResponse {
  url: string | null;
  error?: StorageError | string;
}

export interface UpdateProfileData {
  full_name?: string;
  avatar_url?: string | null;
  phone?: string;
  motherhood_stage?: string;
  pregnancy_week?: number;
  baby_birth_date?: string;
  baby_name?: string;
  baby_gender?: string;
  emotions?: string[];
  needs?: string[];
  interests?: string[];
  theme?: string;
  language?: string;
  notifications_enabled?: boolean;
  onboarding_completed?: boolean;
  onboarding_step?: number;
}

/**
 * Serviço de Perfil
 * Gerencia dados do perfil das usuárias
 */
class ProfileService {
  /**
   * Obter perfil da usuária atual
   */
  async getCurrentProfile(): Promise<UserProfile | null> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        logger.info('Usuária não autenticada');
        return null;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        logger.error('Erro ao buscar perfil:', error);
        return null;
      }

      return { ...data, id: user.id } as UserProfile;
    } catch (error) {
      logger.error('Erro inesperado ao buscar perfil:', error, { service: 'ProfileService' });
      return null;
    }
  }

  /**
   * Obter perfil por ID
   */
  async getProfileById(userId: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();

      if (error) {
        logger.error('Erro ao buscar perfil:', error, { service: 'ProfileService', userId });
        return null;
      }

      return { ...data, id: userId } as UserProfile;
    } catch (error) {
      logger.error('Erro inesperado ao buscar perfil:', error, {
        service: 'ProfileService',
        userId,
      });
      return null;
    }
  }

  /**
   * Atualizar perfil
   */
  async updateProfile(updates: UpdateProfileData): Promise<ServiceResponse> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return { success: false, error: 'Usuária não autenticada' };
      }

      const { error } = await supabase.from('profiles').update(updates).eq('id', user.id);

      if (error) {
        logger.error('Erro ao atualizar perfil:', error, {
          service: 'ProfileService',
          userId: user.id,
        });
        return { success: false, error };
      }

      return { success: true };
    } catch (error) {
      logger.error('Erro inesperado ao atualizar perfil:', error, { service: 'ProfileService' });
      const errorMsg = error instanceof Error ? error.message : String(error);
      return { success: false, error: errorMsg };
    }
  }

  /**
   * Fazer upload de avatar
   */
  async uploadAvatar(uri: string): Promise<AvatarUploadResponse> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return { url: null, error: 'Usuária não autenticada' };
      }

      // Ler arquivo como base64
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: 'base64',
      });

      // Gerar nome único para o arquivo
      const fileExt = uri.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      // Upload para o Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, decode(base64), {
          contentType: `image/${fileExt}`,
          upsert: true,
        });

      if (uploadError) {
        logger.error('Erro ao fazer upload de avatar:', uploadError, {
          service: 'ProfileService',
          userId: user.id,
        });
        return { url: null, error: uploadError };
      }

      // Obter URL pública
      const {
        data: { publicUrl },
      } = supabase.storage.from('avatars').getPublicUrl(filePath);

      // Atualizar perfil com nova URL
      await this.updateProfile({ avatar_url: publicUrl });

      return { url: publicUrl };
    } catch (error) {
      logger.error('Erro inesperado ao fazer upload de avatar:', error, {
        service: 'ProfileService',
      });
      const errorMsg = error instanceof Error ? error.message : String(error);
      return { url: null, error: errorMsg };
    }
  }

  /**
   * Deletar avatar
   */
  async deleteAvatar(): Promise<ServiceResponse> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return { success: false, error: 'Usuária não autenticada' };
      }

      const profile = await this.getCurrentProfile();
      if (!profile?.avatar_url) {
        return { success: true }; // Já não tem avatar
      }

      // Extrair caminho do arquivo da URL
      const filePath = profile.avatar_url.split('/').slice(-2).join('/');

      // Deletar do storage
      const { error: deleteError } = await supabase.storage.from('avatars').remove([filePath]);

      if (deleteError) {
        logger.error('Erro ao deletar avatar:', deleteError, {
          service: 'ProfileService',
          userId: user.id,
        });
        return { success: false, error: deleteError };
      }

      // Atualizar perfil removendo URL
      await this.updateProfile({ avatar_url: null });

      return { success: true };
    } catch (error) {
      logger.error('Erro inesperado ao deletar avatar:', error, { service: 'ProfileService' });
      const errorMsg = error instanceof Error ? error.message : String(error);
      return { success: false, error: errorMsg };
    }
  }

  /**
   * Atualizar passo do onboarding
   */
  async updateOnboardingStep(step: number): Promise<ServiceResponse> {
    return this.updateProfile({ onboarding_step: step });
  }

  /**
   * Completar onboarding
   */
  async completeOnboarding(): Promise<ServiceResponse> {
    return this.updateProfile({
      onboarding_completed: true,
      onboarding_step: 9, // Último passo
    });
  }

  /**
   * Verificar se onboarding foi completado
   */
  async isOnboardingCompleted(): Promise<boolean> {
    const profile = await this.getCurrentProfile();
    return profile?.onboarding_completed ?? false;
  }

  /**
   * Calcular idade do bebê em meses
   */
  calculateBabyAgeInMonths(birthDate: string): number {
    const birth = new Date(birthDate);
    const now = new Date();

    const years = now.getFullYear() - birth.getFullYear();
    const months = now.getMonth() - birth.getMonth();

    return years * 12 + months;
  }

  /**
   * Calcular idade gestacional
   */
  calculatePregnancyAge(pregnancyWeek: number): {
    weeks: number;
    days: number;
    trimester: number;
  } {
    const weeks = pregnancyWeek;
    const days = 0; // Pode ser expandido para incluir dias também
    const trimester = weeks >= 27 ? 3 : weeks >= 13 ? 2 : 1;

    return { weeks, days, trimester };
  }

  /**
   * Atualizar tema
   */
  async updateTheme(theme: 'light' | 'dark' | 'auto'): Promise<ServiceResponse> {
    return this.updateProfile({ theme });
  }

  /**
   * Atualizar configurações de notificação
   */
  async updateNotificationSettings(enabled: boolean): Promise<ServiceResponse> {
    return this.updateProfile({ notifications_enabled: enabled });
  }

  /**
   * Deletar conta (delega para userDataService)
   * @deprecated Use userDataService.deleteAccount() ou userDataService.requestAccountDeletion()
   */
  async deleteAccount(): Promise<ServiceResponse> {
    // Importar dinamicamente para evitar circular dependency
    const { userDataService } = await import('./userDataService');
    const result = await userDataService.requestAccountDeletion();

    // Normalizar o tipo de erro para ServiceResponse
    return {
      success: result.success,
      error: result.error instanceof Error ? result.error.message : (result.error ?? undefined),
    };
  }
}

export const profileService = new ProfileService();
export default profileService;
