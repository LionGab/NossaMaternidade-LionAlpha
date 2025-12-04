/**
 * useVoice - Hook para Text-to-Speech com voz da Nathália
 * Integração com ElevenLabs Service
 *
 * Features:
 * - Estado de loading/playing
 * - Controles de play/pause/stop
 * - Cache automático
 * - Diferentes tipos de voz
 */

import * as Haptics from 'expo-haptics';
import { useState, useCallback, useEffect, useRef } from 'react';

import { elevenLabsService, NATHALIA_VOICES, NATHALIA_SCRIPTS } from '@/services/elevenLabsService';
import { logger } from '@/utils/logger';

export type VoiceType = keyof typeof NATHALIA_VOICES;
export type ScriptKey = keyof typeof NATHALIA_SCRIPTS;

export interface UseVoiceOptions {
  /** Tipo de voz padrão */
  defaultVoiceType?: VoiceType;
  /** Haptic feedback ao iniciar/parar */
  hapticFeedback?: boolean;
  /** Callback quando começar a tocar */
  onPlayStart?: () => void;
  /** Callback quando terminar */
  onPlayEnd?: () => void;
  /** Callback em caso de erro */
  onError?: (error: Error) => void;
}

export interface UseVoiceReturn {
  /** Se está carregando o áudio */
  isLoading: boolean;
  /** Se está reproduzindo */
  isPlaying: boolean;
  /** Se o serviço está configurado */
  isConfigured: boolean;
  /** Erro atual */
  error: Error | null;
  /** Fala um texto personalizado */
  speak: (text: string, voiceType?: VoiceType) => Promise<void>;
  /** Fala um script pré-definido */
  speakScript: (scriptKey: ScriptKey, voiceType?: VoiceType) => Promise<void>;
  /** Para a reprodução */
  stop: () => Promise<void>;
  /** Pausa a reprodução */
  pause: () => Promise<void>;
  /** Retoma a reprodução */
  resume: () => Promise<void>;
  /** Limpa o cache de áudios */
  clearCache: () => Promise<void>;
}

export function useVoice(options: UseVoiceOptions = {}): UseVoiceReturn {
  const {
    defaultVoiceType = 'NATHALIA_MAIN',
    hapticFeedback = true,
    onPlayStart,
    onPlayEnd,
    onError,
  } = options;

  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const isMountedRef = useRef(true);
  const currentTextRef = useRef<string | null>(null);

  // Verificar se está configurado
  const isConfigured = elevenLabsService.isConfigured();

  // Cleanup no unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      elevenLabsService.stop();
    };
  }, []);

  // Monitorar estado de reprodução
  useEffect(() => {
    const checkPlaybackStatus = setInterval(() => {
      const playing = elevenLabsService.getIsPlaying();
      if (isMountedRef.current && isPlaying !== playing) {
        setIsPlaying(playing);
        if (!playing && currentTextRef.current) {
          currentTextRef.current = null;
          onPlayEnd?.();
        }
      }
    }, 100);

    return () => clearInterval(checkPlaybackStatus);
  }, [isPlaying, onPlayEnd]);

  const speak = useCallback(
    async (text: string, voiceType: VoiceType = defaultVoiceType): Promise<void> => {
      if (!isConfigured) {
        // Fallback gracioso: não mostrar erro, apenas não executar
        if (__DEV__) {
          logger.debug(
            '[useVoice] Funcionalidade de voz desabilitada - ElevenLabs não configurado'
          );
        }
        // Não chamar onError para não quebrar a UX
        return;
      }

      if (!text || text.trim().length === 0) {
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        currentTextRef.current = text;

        if (hapticFeedback) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }

        logger.info('Starting voice synthesis', { voiceType, textLength: text.length });

        await elevenLabsService.speak(text, voiceType);

        if (isMountedRef.current) {
          setIsPlaying(true);
          onPlayStart?.();
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Erro ao gerar voz');
        logger.error('Voice synthesis failed', error);

        if (isMountedRef.current) {
          setError(error);
          onError?.(error);
        }
      } finally {
        if (isMountedRef.current) {
          setIsLoading(false);
        }
      }
    },
    [isConfigured, defaultVoiceType, hapticFeedback, onPlayStart, onError]
  );

  const speakScript = useCallback(
    async (scriptKey: ScriptKey, voiceType?: VoiceType): Promise<void> => {
      if (!isConfigured) {
        // Fallback gracioso: não mostrar erro, apenas não executar
        if (__DEV__) {
          logger.debug(
            '[useVoice] Funcionalidade de voz desabilitada - ElevenLabs não configurado'
          );
        }
        return;
      }

      const text = NATHALIA_SCRIPTS[scriptKey];
      if (!text) {
        logger.warn('Script not found', { scriptKey });
        return;
      }

      // Determinar tipo de voz baseado no script
      let effectiveVoiceType = voiceType || defaultVoiceType;
      if (!voiceType) {
        if (
          scriptKey.includes('MEDITATION') ||
          scriptKey.includes('RITUAL') ||
          scriptKey.includes('CALM')
        ) {
          effectiveVoiceType = 'NATHALIA_CALM';
        } else if (scriptKey.includes('MOTIVATION') || scriptKey.includes('ENERGETIC')) {
          effectiveVoiceType = 'NATHALIA_ENERGETIC';
        } else if (scriptKey.includes('SUPPORT')) {
          effectiveVoiceType = 'NATHALIA_EMPATHETIC';
        }
      }

      await speak(text, effectiveVoiceType);
    },
    [speak, defaultVoiceType]
  );

  const stop = useCallback(async (): Promise<void> => {
    try {
      if (hapticFeedback) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      await elevenLabsService.stop();
      if (isMountedRef.current) {
        setIsPlaying(false);
        currentTextRef.current = null;
      }
    } catch (err) {
      logger.error('Failed to stop playback', err);
    }
  }, [hapticFeedback]);

  const pause = useCallback(async (): Promise<void> => {
    try {
      await elevenLabsService.pause();
      if (isMountedRef.current) {
        setIsPlaying(false);
      }
    } catch (err) {
      logger.error('Failed to pause playback', err);
    }
  }, []);

  const resume = useCallback(async (): Promise<void> => {
    try {
      await elevenLabsService.resume();
      if (isMountedRef.current) {
        setIsPlaying(true);
      }
    } catch (err) {
      logger.error('Failed to resume playback', err);
    }
  }, []);

  const clearCache = useCallback(async (): Promise<void> => {
    try {
      await elevenLabsService.clearCache();
      logger.info('Voice cache cleared');
    } catch (err) {
      logger.error('Failed to clear voice cache', err);
    }
  }, []);

  return {
    isLoading,
    isPlaying,
    isConfigured,
    error,
    speak,
    speakScript,
    stop,
    pause,
    resume,
    clearCache,
  };
}

export default useVoice;
