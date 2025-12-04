import AsyncStorage from '@react-native-async-storage/async-storage';
import * as TrackingTransparency from 'expo-tracking-transparency';
import { Platform } from 'react-native';

import { logger } from '@/utils/logger';

const TRACKING_PERMISSION_ASKED_KEY = 'tracking_permission_asked';

export type TrackingStatus =
  | 'authorized'
  | 'denied'
  | 'restricted'
  | 'unavailable'
  | 'not-determined';

/**
 * Serviço para gerenciar App Tracking Transparency (iOS 14.5+)
 */
class TrackingService {
  /**
   * Verificar status atual de permissão de tracking
   */
  async getTrackingStatus(): Promise<TrackingStatus> {
    if (Platform.OS !== 'ios') {
      return 'unavailable';
    }

    try {
      const { status } = await TrackingTransparency.getTrackingPermissionsAsync();
      return status as TrackingStatus;
    } catch (error) {
      logger.error('Erro ao verificar status de tracking', error);
      return 'unavailable';
    }
  }

  /**
   * Solicitar permissão de tracking (iOS 14.5+)
   * IMPORTANTE: Só pode ser chamado UMA VEZ. Depois disso, usuário precisa ir em Settings.
   */
  async requestTrackingPermission(): Promise<TrackingStatus> {
    if (Platform.OS !== 'ios') {
      return 'unavailable';
    }

    try {
      // Verificar se já perguntamos antes
      const alreadyAsked = await AsyncStorage.getItem(TRACKING_PERMISSION_ASKED_KEY);
      if (alreadyAsked) {
        // Se já perguntamos, apenas retornar status atual
        return await this.getTrackingStatus();
      }

      // Solicitar permissão
      const { status } = await TrackingTransparency.requestTrackingPermissionsAsync();

      // Marcar como já perguntado
      await AsyncStorage.setItem(TRACKING_PERMISSION_ASKED_KEY, 'true');

      return status as TrackingStatus;
    } catch (error) {
      logger.error('Erro ao solicitar permissão de tracking', error);
      return 'unavailable';
    }
  }

  /**
   * Verificar se devemos mostrar o prompt de tracking
   * Retorna true se:
   * - Estamos no iOS
   * - Ainda não perguntamos
   * - Status é 'not-determined'
   */
  async shouldShowTrackingPrompt(): Promise<boolean> {
    if (Platform.OS !== 'ios') {
      return false;
    }

    const alreadyAsked = await AsyncStorage.getItem(TRACKING_PERMISSION_ASKED_KEY);
    if (alreadyAsked) {
      return false;
    }

    const status = await this.getTrackingStatus();
    return status === 'not-determined';
  }

  /**
   * Verificar se tracking está autorizado
   */
  async isTrackingAuthorized(): Promise<boolean> {
    const status = await this.getTrackingStatus();
    return status === 'authorized';
  }

  /**
   * Reset do flag de "já perguntado" (apenas para testes/desenvolvimento)
   * NÃO usar em produção!
   */
  async resetTrackingPermissionAsked(): Promise<void> {
    await AsyncStorage.removeItem(TRACKING_PERMISSION_ASKED_KEY);
  }

  /**
   * Obter mensagem amigável para cada status
   */
  getStatusMessage(status: TrackingStatus): string {
    switch (status) {
      case 'authorized':
        return 'Tracking autorizado. Obrigada por nos ajudar a melhorar o app!';
      case 'denied':
        return 'Tracking negado. Você pode alterar isso em Ajustes > Privacidade > Rastreamento.';
      case 'restricted':
        return 'Tracking restrito pelas configurações do dispositivo.';
      case 'not-determined':
        return 'Permissão de tracking ainda não solicitada.';
      case 'unavailable':
        return 'Tracking não disponível neste dispositivo.';
      default:
        return 'Status de tracking desconhecido.';
    }
  }
}

export const trackingService = new TrackingService();
export default trackingService;
