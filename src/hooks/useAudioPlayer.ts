/**
 * useAudioPlayer - Hook para reprodução de áudios de bem-estar
 * Integra com ElevenLabs para TTS e gerencia estado de reprodução
 */

import { Audio, AVPlaybackStatus } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { useState, useCallback, useRef, useEffect } from 'react';

import type { AudioWellnessItem, VoiceStyle } from '@/data/audioWellness';
import {
  elevenLabsService,
  NATHALIA_VOICES,
  type VoiceSettings,
} from '@/services/elevenLabsService';
import { logger } from '@/utils/logger';

// ======================
// TIPOS
// ======================

export interface AudioPlayerState {
  /** Áudio atualmente carregado */
  currentAudio: AudioWellnessItem | null;
  /** Se está reproduzindo */
  isPlaying: boolean;
  /** Se está carregando/gerando áudio */
  isLoading: boolean;
  /** Progresso da reprodução (0-1) */
  progress: number;
  /** Duração em ms */
  duration: number;
  /** Posição atual em ms */
  position: number;
  /** Erro, se houver */
  error: string | null;
  /** Se o áudio foi cacheado (não precisou gerar) */
  wasCached: boolean;
}

export interface AudioPlayerControls {
  /** Carrega e reproduz um áudio */
  play: (audio: AudioWellnessItem) => Promise<void>;
  /** Pausa a reprodução */
  pause: () => Promise<void>;
  /** Retoma a reprodução */
  resume: () => Promise<void>;
  /** Para completamente */
  stop: () => Promise<void>;
  /** Alterna play/pause */
  toggle: () => Promise<void>;
  /** Busca para posição específica (0-1) */
  seekTo: (progress: number) => Promise<void>;
  /** Avança 10 segundos */
  forward: () => Promise<void>;
  /** Retrocede 10 segundos */
  rewind: () => Promise<void>;
}

export interface UseAudioPlayerReturn extends AudioPlayerState, AudioPlayerControls {}

// ======================
// HOOK
// ======================

export function useAudioPlayer(): UseAudioPlayerReturn {
  // Estado
  const [currentAudio, setCurrentAudio] = useState<AudioWellnessItem | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [wasCached, setWasCached] = useState(false);

  // Refs
  const soundRef = useRef<Audio.Sound | null>(null);
  const updateIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Cleanup ao desmontar
  useEffect(() => {
    return () => {
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
      }
      if (soundRef.current) {
        soundRef.current.unloadAsync().catch(() => {});
      }
    };
  }, []);

  // Mapeia VoiceStyle para settings do ElevenLabs
  const getVoiceSettings = (style: VoiceStyle): VoiceSettings => {
    return NATHALIA_VOICES[style].settings;
  };

  // Callback para atualização de status
  const onPlaybackStatusUpdate = useCallback((status: AVPlaybackStatus) => {
    if (!status.isLoaded) {
      if (status.error) {
        logger.error('Playback error', { error: status.error });
        setError('Erro ao reproduzir áudio');
      }
      return;
    }

    setIsPlaying(status.isPlaying);
    setDuration(status.durationMillis || 0);
    setPosition(status.positionMillis || 0);

    if (status.durationMillis && status.durationMillis > 0) {
      setProgress(status.positionMillis / status.durationMillis);
    }

    // Áudio terminou
    if (status.didJustFinish) {
      setIsPlaying(false);
      setProgress(0);
      setPosition(0);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, []);

  // Play
  const play = useCallback(
    async (audio: AudioWellnessItem) => {
      try {
        setIsLoading(true);
        setError(null);
        setCurrentAudio(audio);

        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

        // Para áudio anterior se existir
        if (soundRef.current) {
          await soundRef.current.stopAsync();
          await soundRef.current.unloadAsync();
          soundRef.current = null;
        }

        // Configura modo de áudio
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: true,
          shouldDuckAndroid: true,
        });

        // Verifica se ElevenLabs está configurado
        if (!elevenLabsService.isConfigured()) {
          logger.warn('ElevenLabs not configured, using fallback behavior');
          setError('Serviço de voz não configurado');
          setIsLoading(false);
          return;
        }

        // Gera áudio via TTS
        logger.info('Generating audio via ElevenLabs', { audioId: audio.id });

        const voiceId = NATHALIA_VOICES[audio.voiceStyle].voice_id;
        const voiceSettings = getVoiceSettings(audio.voiceStyle);

        const { audioUri, cached } = await elevenLabsService.textToSpeech({
          text: audio.script,
          voice_id: voiceId,
          voice_settings: voiceSettings,
        });

        setWasCached(cached);

        // Cria e toca o som
        const { sound } = await Audio.Sound.createAsync(
          { uri: audioUri },
          { shouldPlay: true },
          onPlaybackStatusUpdate
        );

        soundRef.current = sound;
        setIsPlaying(true);

        logger.info('Audio playback started', {
          audioId: audio.id,
          cached,
        });
      } catch (err) {
        logger.error('Failed to play audio', err);
        setError('Não foi possível reproduzir o áudio');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      } finally {
        setIsLoading(false);
      }
    },
    [onPlaybackStatusUpdate]
  );

  // Pause
  const pause = useCallback(async () => {
    if (soundRef.current) {
      await soundRef.current.pauseAsync();
      setIsPlaying(false);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, []);

  // Resume
  const resume = useCallback(async () => {
    if (soundRef.current) {
      await soundRef.current.playAsync();
      setIsPlaying(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, []);

  // Stop
  const stop = useCallback(async () => {
    if (soundRef.current) {
      await soundRef.current.stopAsync();
      await soundRef.current.unloadAsync();
      soundRef.current = null;
    }
    setIsPlaying(false);
    setProgress(0);
    setPosition(0);
    setCurrentAudio(null);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, []);

  // Toggle
  const toggle = useCallback(async () => {
    if (isPlaying) {
      await pause();
    } else {
      await resume();
    }
  }, [isPlaying, pause, resume]);

  // Seek
  const seekTo = useCallback(
    async (targetProgress: number) => {
      if (soundRef.current && duration > 0) {
        const targetPosition = targetProgress * duration;
        await soundRef.current.setPositionAsync(targetPosition);
        setProgress(targetProgress);
        setPosition(targetPosition);
      }
    },
    [duration]
  );

  // Forward 10s
  const forward = useCallback(async () => {
    if (soundRef.current && duration > 0) {
      const newPosition = Math.min(position + 10000, duration);
      await soundRef.current.setPositionAsync(newPosition);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, [duration, position]);

  // Rewind 10s
  const rewind = useCallback(async () => {
    if (soundRef.current) {
      const newPosition = Math.max(position - 10000, 0);
      await soundRef.current.setPositionAsync(newPosition);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, [position]);

  return {
    // State
    currentAudio,
    isPlaying,
    isLoading,
    progress,
    duration,
    position,
    error,
    wasCached,
    // Controls
    play,
    pause,
    resume,
    stop,
    toggle,
    seekTo,
    forward,
    rewind,
  };
}

// ======================
// HELPERS
// ======================

/** Formata milissegundos para mm:ss */
export function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export default useAudioPlayer;
