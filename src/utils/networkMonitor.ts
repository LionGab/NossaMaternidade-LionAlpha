/**
 * Network Monitor
 * Monitora conectividade e gerencia operações offline
 */

import NetInfo, { NetInfoState, NetInfoStateType } from '@react-native-community/netinfo';

import { logger } from './logger';

export type NetworkStatus = 'online' | 'offline' | 'unknown';
export type ConnectionType = NetInfoStateType | 'unknown';

export interface NetworkState {
  isConnected: boolean;
  type: ConnectionType;
  isInternetReachable: boolean | null;
}

type NetworkChangeListener = (state: NetworkState) => void;
type PendingOperation = () => Promise<void>;

class NetworkMonitor {
  private currentState: NetworkState = {
    isConnected: false,
    type: 'unknown',
    isInternetReachable: null,
  };

  private listeners: Set<NetworkChangeListener> = new Set();
  private offlineQueue: PendingOperation[] = [];
  private isMonitoring = false;
  private unsubscribe: (() => void) | null = null;

  /**
   * Inicia o monitoramento de rede
   */
  async startMonitoring(): Promise<void> {
    if (this.isMonitoring) {
      logger.warn('[NetworkMonitor] Já está monitorando');
      return;
    }

    try {
      // Obter estado inicial
      const initialState = await NetInfo.fetch();
      this.updateState(initialState);

      // Escutar mudanças
      this.unsubscribe = NetInfo.addEventListener((state) => {
        this.updateState(state);
      });

      this.isMonitoring = true;
      logger.info('[NetworkMonitor] Monitoramento iniciado', {
        isConnected: this.currentState.isConnected,
        type: this.currentState.type,
      });
    } catch (error) {
      logger.error('[NetworkMonitor] Erro ao iniciar monitoramento', error);
      throw error;
    }
  }

  /**
   * Para o monitoramento
   */
  stopMonitoring(): void {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
    this.isMonitoring = false;
    logger.info('[NetworkMonitor] Monitoramento parado');
  }

  /**
   * Atualiza o estado atual
   */
  private updateState(state: NetInfoState): void {
    const newState: NetworkState = {
      isConnected: state.isConnected ?? false,
      type: state.type || 'unknown',
      isInternetReachable: state.isInternetReachable ?? null,
    };

    const stateChanged =
      this.currentState.isConnected !== newState.isConnected ||
      this.currentState.type !== newState.type;

    this.currentState = newState;

    // Notificar listeners
    this.notifyListeners();

    // Se voltou online, processar fila
    if (stateChanged && newState.isConnected && this.offlineQueue.length > 0) {
      logger.info('[NetworkMonitor] Rede voltou online, processando fila', {
        queueSize: this.offlineQueue.length,
      });
      this.processOfflineQueue();
    }

    if (stateChanged) {
      logger.info('[NetworkMonitor] Estado de rede mudou', {
        isConnected: newState.isConnected,
        type: newState.type,
      });
    }
  }

  /**
   * Obtém o estado atual
   */
  getState(): NetworkState {
    return { ...this.currentState };
  }

  /**
   * Verifica se está online
   */
  isOnline(): boolean {
    return this.currentState.isConnected && (this.currentState.isInternetReachable ?? true);
  }

  /**
   * Obtém o tipo de conexão
   */
  getConnectionType(): ConnectionType {
    return this.currentState.type;
  }

  /**
   * Adiciona listener para mudanças de rede
   */
  addListener(listener: NetworkChangeListener): () => void {
    this.listeners.add(listener);

    // Retornar função de unsubscribe
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Notifica todos os listeners
   */
  private notifyListeners(): void {
    const state = this.getState();
    this.listeners.forEach((listener) => {
      try {
        listener(state);
      } catch (error) {
        logger.error('[NetworkMonitor] Erro ao notificar listener', error);
      }
    });
  }

  /**
   * Adiciona operação à fila offline
   */
  enqueueOperation(operation: PendingOperation): void {
    this.offlineQueue.push(operation);
    logger.debug('[NetworkMonitor] Operação adicionada à fila offline', {
      queueSize: this.offlineQueue.length,
    });
  }

  /**
   * Processa fila de operações offline quando voltar online
   */
  private async processOfflineQueue(): Promise<void> {
    if (!this.isOnline()) {
      return;
    }

    const operations = [...this.offlineQueue];
    this.offlineQueue = [];

    logger.info('[NetworkMonitor] Processando fila de operações', {
      count: operations.length,
    });

    for (const operation of operations) {
      try {
        await operation();
      } catch (error) {
        logger.error('[NetworkMonitor] Erro ao processar operação da fila', error);
        // Re-adicionar à fila se falhar (com limite para evitar loop infinito)
        if (this.offlineQueue.length < 100) {
          this.offlineQueue.push(operation);
        }
      }
    }
  }

  /**
   * Executa operação apenas se online, caso contrário adiciona à fila
   */
  async executeWhenOnline<T>(
    operation: () => Promise<T>,
    enqueueIfOffline = true
  ): Promise<T | null> {
    if (this.isOnline()) {
      try {
        return await operation();
      } catch (error) {
        logger.error('[NetworkMonitor] Erro ao executar operação online', error);
        throw error;
      }
    }

    if (enqueueIfOffline) {
      this.enqueueOperation(async () => {
        await operation();
      });
    }

    return null;
  }

  /**
   * Limpa a fila de operações offline
   */
  clearQueue(): void {
    const count = this.offlineQueue.length;
    this.offlineQueue = [];
    logger.info('[NetworkMonitor] Fila de operações limpa', { clearedCount: count });
  }

  /**
   * Obtém tamanho da fila
   */
  getQueueSize(): number {
    return this.offlineQueue.length;
  }
}

export const networkMonitor = new NetworkMonitor();
export default networkMonitor;
