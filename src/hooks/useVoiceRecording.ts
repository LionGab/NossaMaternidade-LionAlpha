/**
 * useVoiceRecording - Hook para gravação de voz e transcrição
 * Permite gravar áudio do usuário e transcrever via Whisper API
 *
 * Features:
 * - Gravação de áudio com preview
 * - Transcrição via OpenAI Whisper ou Google Speech-to-Text
 * - Controles de gravação (start, stop, cancel)
 * - Estado visual da gravação (tempo, amplitude)
 */

import { Audio, AVPlaybackStatus } from 'expo-av';
import * as FileSystem from 'expo-file-system/legacy';
import * as Haptics from 'expo-haptics';
import { useState, useCallback, useRef, useEffect } from 'react';

import { logger } from '@/utils/logger';

// ======================
// TIPOS
// ======================

export interface VoiceRecordingState {
  /** Se está gravando */
  isRecording: boolean;
  /** Se está transcrevendo */
  isTranscribing: boolean;
  /** Se está reproduzindo preview */
  isPlayingPreview: boolean;
  /** Tempo de gravação em segundos */
  recordingDuration: number;
  /** URI do áudio gravado (para preview) */
  recordedUri: string | null;
  /** Texto transcrito */
  transcribedText: string | null;
  /** Erro, se houver */
  error: string | null;
  /** Se tem permissão de microfone */
  hasPermission: boolean;
  /** Amplitude atual (0-1) para visualização */
  amplitude: number;
}

export interface VoiceRecordingControls {
  /** Inicia gravação */
  startRecording: () => Promise<boolean>;
  /** Para gravação e retorna URI */
  stopRecording: () => Promise<string | null>;
  /** Cancela gravação */
  cancelRecording: () => Promise<void>;
  /** Reproduz preview do áudio gravado */
  playPreview: () => Promise<void>;
  /** Para preview */
  stopPreview: () => Promise<void>;
  /** Envia áudio para transcrição */
  transcribe: () => Promise<string | null>;
  /** Limpa estado (após enviar) */
  clear: () => void;
  /** Solicita permissão de microfone */
  requestPermission: () => Promise<boolean>;
}

export interface UseVoiceRecordingReturn extends VoiceRecordingState, VoiceRecordingControls {}

export interface UseVoiceRecordingOptions {
  /** Haptic feedback */
  hapticFeedback?: boolean;
  /** Máximo de segundos de gravação */
  maxDuration?: number;
  /** Callback quando gravação terminar */
  onRecordingComplete?: (uri: string) => void;
  /** Callback quando transcrição terminar */
  onTranscriptionComplete?: (text: string) => void;
  /** Callback em caso de erro */
  onError?: (error: string) => void;
}

// ======================
// CONFIGURAÇÕES
// ======================

const RECORDING_OPTIONS: Audio.RecordingOptions = {
  ...Audio.RecordingOptionsPresets.HIGH_QUALITY,
  android: {
    extension: '.m4a',
    outputFormat: Audio.AndroidOutputFormat.MPEG_4,
    audioEncoder: Audio.AndroidAudioEncoder.AAC,
    sampleRate: 44100,
    numberOfChannels: 1,
    bitRate: 128000,
  },
  ios: {
    extension: '.m4a',
    outputFormat: Audio.IOSOutputFormat.MPEG4AAC,
    audioQuality: Audio.IOSAudioQuality.HIGH,
    sampleRate: 44100,
    numberOfChannels: 1,
    bitRate: 128000,
  },
  web: {
    mimeType: 'audio/webm',
    bitsPerSecond: 128000,
  },
};

const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY || '';
const GOOGLE_SPEECH_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_SPEECH_API_KEY || '';

// ======================
// HOOK
// ======================

export function useVoiceRecording(options: UseVoiceRecordingOptions = {}): UseVoiceRecordingReturn {
  const {
    hapticFeedback = true,
    maxDuration = 60, // 60 segundos máximo
    onRecordingComplete,
    onTranscriptionComplete,
    onError,
  } = options;

  // Estado
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [recordedUri, setRecordedUri] = useState<string | null>(null);
  const [transcribedText, setTranscribedText] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState(false);
  const [amplitude, setAmplitude] = useState(0);

  // Refs
  const recordingRef = useRef<Audio.Recording | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);
  const durationIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const amplitudeIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isMountedRef = useRef(true);
  const stopRecordingRef = useRef<(() => Promise<string | null>) | null>(null);

  // Cleanup ao desmontar
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      cleanup();
    };
  }, []);

  // Verificar permissão ao montar
  useEffect(() => {
    checkPermission();
  }, []);

  const cleanup = async () => {
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }
    if (amplitudeIntervalRef.current) {
      clearInterval(amplitudeIntervalRef.current);
      amplitudeIntervalRef.current = null;
    }
    if (recordingRef.current) {
      try {
        await recordingRef.current.stopAndUnloadAsync();
      } catch {
        // Ignorar erros de cleanup
      }
      recordingRef.current = null;
    }
    if (soundRef.current) {
      try {
        await soundRef.current.unloadAsync();
      } catch {
        // Ignorar erros de cleanup
      }
      soundRef.current = null;
    }
  };

  const checkPermission = async () => {
    try {
      const { status } = await Audio.getPermissionsAsync();
      if (isMountedRef.current) {
        setHasPermission(status === 'granted');
      }
    } catch (err) {
      logger.error('[useVoiceRecording] Error checking permission', err);
    }
  };

  const requestPermission = useCallback(async (): Promise<boolean> => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      const granted = status === 'granted';
      if (isMountedRef.current) {
        setHasPermission(granted);
      }
      return granted;
    } catch (err) {
      logger.error('[useVoiceRecording] Error requesting permission', err);
      return false;
    }
  }, []);

  const startRecording = useCallback(async (): Promise<boolean> => {
    try {
      setError(null);

      // Verificar permissão
      if (!hasPermission) {
        const granted = await requestPermission();
        if (!granted) {
          const errorMsg = 'Permissão de microfone negada';
          setError(errorMsg);
          onError?.(errorMsg);
          return false;
        }
      }

      // Configurar modo de áudio para gravação
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
      });

      // Limpar gravação anterior
      if (recordedUri) {
        try {
          await FileSystem.deleteAsync(recordedUri, { idempotent: true });
        } catch {
          // Ignorar erro de deleção
        }
      }

      // Iniciar gravação
      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync(RECORDING_OPTIONS);
      await recording.startAsync();

      recordingRef.current = recording;

      if (isMountedRef.current) {
        setIsRecording(true);
        setRecordingDuration(0);
        setRecordedUri(null);
        setTranscribedText(null);
      }

      if (hapticFeedback) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }

      // Timer para duração
      // Usar ref para evitar dependência circular
      durationIntervalRef.current = setInterval(() => {
        if (isMountedRef.current) {
          setRecordingDuration((prev) => {
            if (prev >= maxDuration) {
              // Auto-stop quando atingir máximo
              stopRecordingRef.current?.();
              return prev;
            }
            return prev + 1;
          });
        }
      }, 1000);

      // Timer para amplitude (visualização)
      amplitudeIntervalRef.current = setInterval(async () => {
        if (recordingRef.current && isMountedRef.current) {
          try {
            const status = await recordingRef.current.getStatusAsync();
            if (status.isRecording && status.metering !== undefined) {
              // Converter dB para 0-1 (normalizado)
              const db = status.metering;
              const normalized = Math.max(0, Math.min(1, (db + 60) / 60));
              setAmplitude(normalized);
            }
          } catch {
            // Ignorar erros de status
          }
        }
      }, 100);

      logger.info('[useVoiceRecording] Recording started');
      return true;
    } catch (err) {
      const errorMsg = 'Erro ao iniciar gravação';
      logger.error('[useVoiceRecording] Start recording error', err);
      if (isMountedRef.current) {
        setError(errorMsg);
        setIsRecording(false);
      }
      onError?.(errorMsg);
      return false;
    }
  }, [hasPermission, requestPermission, recordedUri, hapticFeedback, maxDuration, onError]);

  const stopRecording = useCallback(async (): Promise<string | null> => {
    try {
      // Limpar timers
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
        durationIntervalRef.current = null;
      }
      if (amplitudeIntervalRef.current) {
        clearInterval(amplitudeIntervalRef.current);
        amplitudeIntervalRef.current = null;
      }

      if (!recordingRef.current) {
        return null;
      }

      await recordingRef.current.stopAndUnloadAsync();
      const uri = recordingRef.current.getURI();
      recordingRef.current = null;

      // Restaurar modo de áudio
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
      });

      if (isMountedRef.current) {
        setIsRecording(false);
        setAmplitude(0);
        if (uri) {
          setRecordedUri(uri);
          onRecordingComplete?.(uri);
        }
      }

      if (hapticFeedback) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }

      logger.info('[useVoiceRecording] Recording stopped', { uri });
      return uri;
    } catch (err) {
      const errorMsg = 'Erro ao parar gravação';
      logger.error('[useVoiceRecording] Stop recording error', err);
      if (isMountedRef.current) {
        setError(errorMsg);
        setIsRecording(false);
        setAmplitude(0);
      }
      onError?.(errorMsg);
      return null;
    }
  }, [hapticFeedback, onRecordingComplete, onError]);

  // Atualizar ref quando stopRecording mudar
  useEffect(() => {
    stopRecordingRef.current = stopRecording;
  }, [stopRecording]);

  const cancelRecording = useCallback(async (): Promise<void> => {
    try {
      await cleanup();
      if (isMountedRef.current) {
        setIsRecording(false);
        setRecordingDuration(0);
        setAmplitude(0);
        setRecordedUri(null);
        setTranscribedText(null);
      }

      if (hapticFeedback) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      }

      logger.info('[useVoiceRecording] Recording cancelled');
    } catch (err) {
      logger.error('[useVoiceRecording] Cancel recording error', err);
    }
  }, [hapticFeedback]);

  const playPreview = useCallback(async (): Promise<void> => {
    if (!recordedUri) {
      logger.warn('[useVoiceRecording] No recorded audio to play');
      return;
    }

    try {
      // Parar preview anterior se existir
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
      });

      const { sound } = await Audio.Sound.createAsync({ uri: recordedUri }, { shouldPlay: true });

      soundRef.current = sound;

      if (isMountedRef.current) {
        setIsPlayingPreview(true);
      }

      // Listener para quando terminar
      sound.setOnPlaybackStatusUpdate((status: AVPlaybackStatus) => {
        if (status.isLoaded && status.didJustFinish) {
          if (isMountedRef.current) {
            setIsPlayingPreview(false);
          }
          sound.unloadAsync();
          soundRef.current = null;
        }
      });

      if (hapticFeedback) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }

      logger.info('[useVoiceRecording] Playing preview');
    } catch (err) {
      logger.error('[useVoiceRecording] Play preview error', err);
      if (isMountedRef.current) {
        setError('Erro ao reproduzir preview');
      }
    }
  }, [recordedUri, hapticFeedback]);

  const stopPreview = useCallback(async (): Promise<void> => {
    try {
      if (soundRef.current) {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }
      if (isMountedRef.current) {
        setIsPlayingPreview(false);
      }
    } catch (err) {
      logger.error('[useVoiceRecording] Stop preview error', err);
    }
  }, []);

  const transcribe = useCallback(async (): Promise<string | null> => {
    if (!recordedUri) {
      logger.warn('[useVoiceRecording] No recorded audio to transcribe');
      return null;
    }

    try {
      setIsTranscribing(true);
      setError(null);

      // Verificar qual API usar
      if (OPENAI_API_KEY) {
        const text = await transcribeWithWhisper(recordedUri);
        if (isMountedRef.current) {
          setTranscribedText(text);
          setIsTranscribing(false);
        }
        onTranscriptionComplete?.(text);
        return text;
      } else if (GOOGLE_SPEECH_API_KEY) {
        const text = await transcribeWithGoogle(recordedUri);
        if (isMountedRef.current) {
          setTranscribedText(text);
          setIsTranscribing(false);
        }
        onTranscriptionComplete?.(text);
        return text;
      } else {
        // Fallback: retornar placeholder
        logger.warn('[useVoiceRecording] No transcription API configured');
        const fallbackText = '[Áudio de ' + recordingDuration + ' segundos]';
        if (isMountedRef.current) {
          setTranscribedText(fallbackText);
          setIsTranscribing(false);
        }
        return fallbackText;
      }
    } catch (err) {
      const errorMsg = 'Erro ao transcrever áudio';
      logger.error('[useVoiceRecording] Transcription error', err);
      if (isMountedRef.current) {
        setError(errorMsg);
        setIsTranscribing(false);
      }
      onError?.(errorMsg);
      return null;
    }
  }, [recordedUri, recordingDuration, onTranscriptionComplete, onError]);

  const clear = useCallback(() => {
    setRecordedUri(null);
    setTranscribedText(null);
    setRecordingDuration(0);
    setAmplitude(0);
    setError(null);
    if (soundRef.current) {
      soundRef.current.unloadAsync().catch(() => {});
      soundRef.current = null;
    }
  }, []);

  return {
    // State
    isRecording,
    isTranscribing,
    isPlayingPreview,
    recordingDuration,
    recordedUri,
    transcribedText,
    error,
    hasPermission,
    amplitude,
    // Controls
    startRecording,
    stopRecording,
    cancelRecording,
    playPreview,
    stopPreview,
    transcribe,
    clear,
    requestPermission,
  };
}

// ======================
// HELPERS DE TRANSCRIÇÃO
// ======================

async function transcribeWithWhisper(audioUri: string): Promise<string> {
  try {
    // Criar FormData com o arquivo de áudio
    const formData = new FormData();
    formData.append('file', {
      uri: audioUri,
      type: 'audio/m4a',
      name: 'recording.m4a',
    } as unknown as Blob);
    formData.append('model', 'whisper-1');
    formData.append('language', 'pt');

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Whisper API error: ${response.status}`);
    }

    const data = await response.json();
    return data.text || '';
  } catch (err) {
    logger.error('[transcribeWithWhisper] Error', err);
    throw err;
  }
}

async function transcribeWithGoogle(audioUri: string): Promise<string> {
  try {
    // Ler arquivo como base64
    const base64 = await FileSystem.readAsStringAsync(audioUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    const response = await fetch(
      `https://speech.googleapis.com/v1/speech:recognize?key=${GOOGLE_SPEECH_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          config: {
            encoding: 'MP3',
            sampleRateHertz: 44100,
            languageCode: 'pt-BR',
          },
          audio: {
            content: base64,
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Google Speech API error: ${response.status}`);
    }

    const data = await response.json();
    const transcript = data.results?.[0]?.alternatives?.[0]?.transcript || '';
    return transcript;
  } catch (err) {
    logger.error('[transcribeWithGoogle] Error', err);
    throw err;
  }
}

// ======================
// HELPERS
// ======================

/** Formata segundos para mm:ss */
export function formatRecordingTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export default useVoiceRecording;
