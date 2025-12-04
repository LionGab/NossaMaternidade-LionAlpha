/**
 * State Persistence Manager
 *
 * Gerencia persistência de estado usando volumes Docker.
 * Implementa o conceito de "State Persistence" do Docker MCP.
 *
 * Features:
 * - Volumes Docker para persistir dados entre execuções
 * - Evita enviar dados grandes ao modelo
 * - Persistência de estado entre tool calls
 * - Gerenciamento automático de volumes
 */

import { logger } from '../../utils/logger';
import { JsonValue } from '../types';

export interface VolumeConfig {
  /** Nome do volume */
  name: string;
  /** Caminho no container */
  containerPath: string;
  /** Se é somente leitura */
  readonly?: boolean;
}

export interface PersistedState {
  /** Chave do estado */
  key: string;
  /** Dados persistidos */
  data: JsonValue;
  /** Timestamp de criação */
  createdAt: number;
  /** Timestamp de atualização */
  updatedAt: number;
  /** TTL em segundos (opcional) */
  ttl?: number;
}

/**
 * State Persistence Manager
 *
 * Gerencia estado persistido em volumes Docker
 */
export class StatePersistenceManager {
  private static instance: StatePersistenceManager;
  private volumes: Map<string, VolumeConfig> = new Map();
  private stateCache: Map<string, PersistedState> = new Map();
  private defaultVolumeName = 'mcp-state-volume';

  private constructor() {
    // Singleton
  }

  static getInstance(): StatePersistenceManager {
    if (!StatePersistenceManager.instance) {
      StatePersistenceManager.instance = new StatePersistenceManager();
    }
    return StatePersistenceManager.instance;
  }

  /**
   * Inicializa o gerenciador e cria volume padrão se necessário
   */
  async initialize(): Promise<void> {
    try {
      logger.info('[StatePersistenceManager] Initializing...');

      // Criar volume padrão se não existir
      await this.ensureVolume(this.defaultVolumeName);

      logger.info('[StatePersistenceManager] Initialized', {
        volumes: this.volumes.size,
      });
    } catch (error) {
      logger.error('[StatePersistenceManager] Initialization failed', error);
      throw error;
    }
  }

  /**
   * Garante que um volume existe (cria se necessário)
   */
  async ensureVolume(volumeName: string): Promise<boolean> {
    if (this.volumes.has(volumeName)) {
      return true;
    }

    try {
      // Em implementação real, isso criaria o volume Docker:
      // docker volume create ${volumeName}

      const config: VolumeConfig = {
        name: volumeName,
        containerPath: `/mcp-state/${volumeName}`,
        readonly: false,
      };

      this.volumes.set(volumeName, config);
      logger.info('[StatePersistenceManager] Volume ensured', { volumeName });
      return true;
    } catch (error) {
      logger.error('[StatePersistenceManager] Failed to ensure volume', {
        volumeName,
        error,
      });
      return false;
    }
  }

  /**
   * Salva estado em um volume
   */
  async saveState(
    key: string,
    data: JsonValue,
    volumeName?: string,
    ttl?: number
  ): Promise<boolean> {
    const volume = volumeName || this.defaultVolumeName;

    try {
      await this.ensureVolume(volume);

      const state: PersistedState = {
        key,
        data,
        createdAt: this.stateCache.get(key)?.createdAt || Date.now(),
        updatedAt: Date.now(),
        ttl,
      };

      // Em implementação real, isso salvaria em arquivo no volume:
      // docker run --rm -v ${volume}:/data alpine sh -c "echo '${JSON.stringify(state)}' > /data/${key}.json"

      // Por enquanto, apenas cache em memória
      this.stateCache.set(key, state);

      logger.debug('[StatePersistenceManager] State saved', {
        key,
        volume,
        dataSize: JSON.stringify(data).length,
      });

      return true;
    } catch (error) {
      logger.error('[StatePersistenceManager] Failed to save state', {
        key,
        volume,
        error,
      });
      return false;
    }
  }

  /**
   * Carrega estado de um volume
   */
  async loadState(key: string, volumeName?: string): Promise<JsonValue | null> {
    const volume = volumeName || this.defaultVolumeName;

    try {
      // Verificar cache primeiro
      const cached = this.stateCache.get(key);
      if (cached) {
        // Verificar TTL
        if (cached.ttl) {
          const age = (Date.now() - cached.updatedAt) / 1000;
          if (age > cached.ttl) {
            logger.debug('[StatePersistenceManager] State expired', { key });
            this.stateCache.delete(key);
            return null;
          }
        }
        return cached.data;
      }

      // Em implementação real, isso carregaria do volume:
      // docker run --rm -v ${volume}:/data alpine cat /data/${key}.json

      logger.debug('[StatePersistenceManager] State not found', { key, volume });
      return null;
    } catch (error) {
      logger.error('[StatePersistenceManager] Failed to load state', {
        key,
        volume,
        error,
      });
      return null;
    }
  }

  /**
   * Remove estado de um volume
   */
  async deleteState(key: string, volumeName?: string): Promise<boolean> {
    const volume = volumeName || this.defaultVolumeName;

    try {
      // Em implementação real, isso removeria o arquivo do volume:
      // docker run --rm -v ${volume}:/data alpine rm /data/${key}.json

      this.stateCache.delete(key);

      logger.debug('[StatePersistenceManager] State deleted', { key, volume });
      return true;
    } catch (error) {
      logger.error('[StatePersistenceManager] Failed to delete state', {
        key,
        volume,
        error,
      });
      return false;
    }
  }

  /**
   * Lista todas as chaves de estado em um volume
   */
  async listStates(volumeName?: string): Promise<string[]> {
    const volume = volumeName || this.defaultVolumeName;

    try {
      // Em implementação real, isso listaria arquivos no volume:
      // docker run --rm -v ${volume}:/data alpine ls /data

      // Por enquanto, retorna chaves do cache
      return Array.from(this.stateCache.keys());
    } catch (error) {
      logger.error('[StatePersistenceManager] Failed to list states', {
        volume,
        error,
      });
      return [];
    }
  }

  /**
   * Salva dados grandes em arquivo e retorna apenas referência
   * Útil para evitar enviar dados grandes ao modelo
   */
  async saveLargeData(
    key: string,
    data: JsonValue,
    returnSummary = true
  ): Promise<{ saved: boolean; reference?: string; summary?: JsonValue }> {
    const saved = await this.saveState(key, data);

    if (!saved) {
      return { saved: false };
    }

    const result: { saved: boolean; reference?: string; summary?: JsonValue } = {
      saved: true,
      reference: `state://${key}`,
    };

    if (returnSummary) {
      // Gerar resumo dos dados
      if (typeof data === 'object' && data !== null) {
        if (Array.isArray(data)) {
          result.summary = {
            type: 'array',
            length: data.length,
            preview: data.slice(0, 3),
          };
        } else {
          const keys = Object.keys(data);
          result.summary = {
            type: 'object',
            keys,
            keyCount: keys.length,
          };
        }
      } else {
        result.summary = {
          type: typeof data,
          value: String(data).substring(0, 100),
        };
      }
    }

    logger.info('[StatePersistenceManager] Large data saved', {
      key,
      summary: result.summary,
    });

    return result;
  }

  /**
   * Obtém configuração de volume para usar em containers
   */
  getVolumeConfig(volumeName?: string): VolumeConfig | null {
    const volume = volumeName || this.defaultVolumeName;
    return this.volumes.get(volume) || null;
  }

  /**
   * Lista volumes gerenciados
   */
  listVolumes(): string[] {
    return Array.from(this.volumes.keys());
  }

  /**
   * Remove um volume (cuidado: apaga todos os dados)
   */
  async removeVolume(volumeName: string): Promise<boolean> {
    try {
      // Em implementação real:
      // docker volume rm ${volumeName}

      this.volumes.delete(volumeName);
      logger.info('[StatePersistenceManager] Volume removed', { volumeName });
      return true;
    } catch (error) {
      logger.error('[StatePersistenceManager] Failed to remove volume', {
        volumeName,
        error,
      });
      return false;
    }
  }

  /**
   * Limpa cache em memória (não afeta volumes)
   */
  clearCache(): void {
    this.stateCache.clear();
    logger.debug('[StatePersistenceManager] Cache cleared');
  }
}

// Singleton export
export const statePersistenceManager = StatePersistenceManager.getInstance();
