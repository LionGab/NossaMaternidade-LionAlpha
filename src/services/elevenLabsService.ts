/**
 * ElevenLabs Service - Text-to-Speech com voz personalizada da Nathália
 * Integração completa com ElevenLabs API v1
 *
 * Features:
 * - Síntese de voz em tempo real
 * - Cache de áudios gerados
 * - Vozes pré-configuradas (Nathália, calma, energética)
 * - Streaming de áudio
 */

import { Audio, AVPlaybackStatus } from 'expo-av';
import * as FileSystem from 'expo-file-system/legacy';

import { logger } from '@/utils/logger';

// ======================
// TIPOS
// ======================

export interface VoiceSettings {
  /** Estabilidade da voz (0-1) - mais alto = mais consistente */
  stability: number;
  /** Similaridade com a voz original (0-1) */
  similarity_boost: number;
  /** Intensidade do estilo (0-1) */
  style?: number;
  /** Usar speaker boost */
  use_speaker_boost?: boolean;
}

export interface Voice {
  voice_id: string;
  name: string;
  category?: string;
  description?: string;
  preview_url?: string;
  settings?: VoiceSettings;
}

export interface TTSRequest {
  text: string;
  voice_id?: string;
  model_id?: string;
  voice_settings?: VoiceSettings;
}

export interface TTSResponse {
  audioUri: string;
  duration?: number;
  cached: boolean;
}

// ======================
// CONFIGURAÇÕES
// ======================

const ELEVENLABS_API_KEY = process.env.EXPO_PUBLIC_ELEVENLABS_API_KEY || '';
const ELEVENLABS_BASE_URL = 'https://api.elevenlabs.io/v1';

// Modelos disponíveis
export const ELEVENLABS_MODELS = {
  MULTILINGUAL_V2: 'eleven_multilingual_v2', // Melhor para português
  TURBO_V2: 'eleven_turbo_v2', // Mais rápido
  MONOLINGUAL_V1: 'eleven_monolingual_v1', // Inglês apenas
} as const;

// Vozes pré-configuradas para o app
// Voice ID da Nathália Valente clonada no ElevenLabs
const NATHALIA_VOICE_ID = 'ux2J2EvwciGXj9xGOHNN';

export const NATHALIA_VOICES = {
  // Voz principal da Nathália - acolhedora e maternal
  NATHALIA_MAIN: {
    voice_id: NATHALIA_VOICE_ID,
    name: 'Nathália Principal',
    description: 'Voz acolhedora e maternal da Nathália Valente',
    settings: {
      stability: 0.5,
      similarity_boost: 0.75,
      style: 0.3,
      use_speaker_boost: true,
    },
  },
  // Voz calma para meditações e rituais
  NATHALIA_CALM: {
    voice_id: NATHALIA_VOICE_ID,
    name: 'Nathália Calma',
    description: 'Voz suave para meditações e rituais de relaxamento',
    settings: {
      stability: 0.75,
      similarity_boost: 0.85,
      style: 0.1,
      use_speaker_boost: false,
    },
  },
  // Voz energética para motivação
  NATHALIA_ENERGETIC: {
    voice_id: NATHALIA_VOICE_ID,
    name: 'Nathália Energética',
    description: 'Voz animada para motivação e incentivo',
    settings: {
      stability: 0.4,
      similarity_boost: 0.7,
      style: 0.6,
      use_speaker_boost: true,
    },
  },
  // Voz empática para apoio emocional
  NATHALIA_EMPATHETIC: {
    voice_id: NATHALIA_VOICE_ID,
    name: 'Nathália Empática',
    description: 'Voz carinhosa para momentos de apoio emocional',
    settings: {
      stability: 0.6,
      similarity_boost: 0.8,
      style: 0.2,
      use_speaker_boost: true,
    },
  },
} as const;

// Diretório de cache
const CACHE_DIR = `${FileSystem.cacheDirectory}elevenlabs/`;

// ======================
// CACHE MANAGER
// ======================

class AudioCacheManager {
  private cacheInitialized = false;

  async init(): Promise<void> {
    if (this.cacheInitialized) return;

    try {
      const dirInfo = await FileSystem.getInfoAsync(CACHE_DIR);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(CACHE_DIR, { intermediates: true });
      }
      this.cacheInitialized = true;
    } catch (error) {
      logger.error('Failed to initialize audio cache', error);
    }
  }

  getCacheKey(text: string, voiceId: string): string {
    // Criar hash simples do texto + voiceId
    const input = `${voiceId}:${text}`;
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return `audio_${Math.abs(hash).toString(16)}.mp3`;
  }

  async get(text: string, voiceId: string): Promise<string | null> {
    await this.init();
    const fileName = this.getCacheKey(text, voiceId);
    const filePath = `${CACHE_DIR}${fileName}`;

    try {
      const fileInfo = await FileSystem.getInfoAsync(filePath);
      if (fileInfo.exists) {
        logger.debug('Audio cache hit', { fileName });
        return filePath;
      }
    } catch {
      // Cache miss
    }
    return null;
  }

  async set(text: string, voiceId: string, audioData: string): Promise<string> {
    await this.init();
    const fileName = this.getCacheKey(text, voiceId);
    const filePath = `${CACHE_DIR}${fileName}`;

    await FileSystem.writeAsStringAsync(filePath, audioData, {
      encoding: FileSystem.EncodingType.Base64,
    });

    logger.debug('Audio cached', { fileName });
    return filePath;
  }

  async clear(): Promise<void> {
    try {
      await FileSystem.deleteAsync(CACHE_DIR, { idempotent: true });
      this.cacheInitialized = false;
      logger.info('Audio cache cleared');
    } catch (error) {
      logger.error('Failed to clear audio cache', error);
    }
  }
}

const cacheManager = new AudioCacheManager();

// ======================
// ELEVENLABS SERVICE
// ======================

class ElevenLabsService {
  private apiKey: string;
  private sound: Audio.Sound | null = null;
  private isPlaying = false;

  constructor() {
    this.apiKey = ELEVENLABS_API_KEY;

    // Não mostrar warning em desenvolvimento se não configurado (é esperado)
    // Apenas logar em modo debug
    if (!this.apiKey && __DEV__) {
      logger.debug('[ElevenLabs] API key não configurada - funcionalidade de voz desabilitada');
    }
  }

  /**
   * Verifica se o serviço está configurado
   */
  isConfigured(): boolean {
    return Boolean(this.apiKey && this.apiKey.trim() !== '');
  }

  /**
   * Lista todas as vozes disponíveis na conta
   */
  async getVoices(): Promise<Voice[]> {
    if (!this.isConfigured()) {
      logger.warn('ElevenLabs not configured');
      return [];
    }

    try {
      const response = await fetch(`${ELEVENLABS_BASE_URL}/voices`, {
        headers: {
          'xi-api-key': this.apiKey,
        },
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      return data.voices || [];
    } catch (error) {
      logger.error('Failed to fetch voices', error);
      return [];
    }
  }

  /**
   * Gera áudio a partir de texto (Text-to-Speech)
   */
  async textToSpeech(request: TTSRequest): Promise<TTSResponse> {
    const {
      text,
      voice_id = NATHALIA_VOICES.NATHALIA_MAIN.voice_id,
      model_id = ELEVENLABS_MODELS.MULTILINGUAL_V2,
      voice_settings = NATHALIA_VOICES.NATHALIA_MAIN.settings,
    } = request;

    if (!this.isConfigured()) {
      // Retornar erro silencioso em desenvolvimento, mas logar
      const error = new Error('ElevenLabs API key not configured');
      if (__DEV__) {
        logger.debug('[ElevenLabs] TTS request ignorado - API key não configurada');
      }
      throw error;
    }

    if (!text || text.trim().length === 0) {
      throw new Error('Text is required');
    }

    // Verificar cache
    const cachedUri = await cacheManager.get(text, voice_id);
    if (cachedUri) {
      return { audioUri: cachedUri, cached: true };
    }

    try {
      logger.info('Generating TTS audio', { textLength: text.length, voice_id });

      const response = await fetch(`${ELEVENLABS_BASE_URL}/text-to-speech/${voice_id}`, {
        method: 'POST',
        headers: {
          Accept: 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': this.apiKey,
        },
        body: JSON.stringify({
          text,
          model_id,
          voice_settings,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`TTS API error: ${response.status} - ${errorText}`);
      }

      // Converter response para base64
      const arrayBuffer = await response.arrayBuffer();
      const base64 = this.arrayBufferToBase64(arrayBuffer);

      // Salvar no cache
      const audioUri = await cacheManager.set(text, voice_id, base64);

      logger.info('TTS audio generated successfully');
      return { audioUri, cached: false };
    } catch (error) {
      logger.error('TTS generation failed', error);
      throw error;
    }
  }

  /**
   * Reproduz áudio de um URI
   */
  async play(audioUri: string): Promise<void> {
    try {
      // Parar áudio anterior se houver
      await this.stop();

      // Configurar modo de áudio
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
      });

      // Carregar e tocar
      const { sound } = await Audio.Sound.createAsync({ uri: audioUri }, { shouldPlay: true });

      this.sound = sound;
      this.isPlaying = true;

      // Listener para quando terminar
      sound.setOnPlaybackStatusUpdate((status: AVPlaybackStatus) => {
        if (status.isLoaded && status.didJustFinish) {
          this.isPlaying = false;
        }
      });

      logger.info('Audio playback started');
    } catch (error) {
      logger.error('Audio playback failed', error);
      throw error;
    }
  }

  /**
   * Para a reprodução atual
   */
  async stop(): Promise<void> {
    if (this.sound) {
      try {
        await this.sound.stopAsync();
        await this.sound.unloadAsync();
      } catch {
        // Ignorar erros ao parar
      }
      this.sound = null;
      this.isPlaying = false;
    }
  }

  /**
   * Pausa a reprodução
   */
  async pause(): Promise<void> {
    if (this.sound && this.isPlaying) {
      await this.sound.pauseAsync();
      this.isPlaying = false;
    }
  }

  /**
   * Retoma a reprodução
   */
  async resume(): Promise<void> {
    if (this.sound && !this.isPlaying) {
      await this.sound.playAsync();
      this.isPlaying = true;
    }
  }

  /**
   * Gera e reproduz áudio (conveniência)
   */
  async speak(
    text: string,
    voiceType: keyof typeof NATHALIA_VOICES = 'NATHALIA_MAIN'
  ): Promise<void> {
    const voice = NATHALIA_VOICES[voiceType];

    const { audioUri } = await this.textToSpeech({
      text,
      voice_id: voice.voice_id,
      voice_settings: voice.settings,
    });

    await this.play(audioUri);
  }

  /**
   * Verifica se está reproduzindo
   */
  getIsPlaying(): boolean {
    return this.isPlaying;
  }

  /**
   * Limpa o cache de áudios
   */
  async clearCache(): Promise<void> {
    await cacheManager.clear();
  }

  // Helper para converter ArrayBuffer para Base64
  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }
}

// Singleton
export const elevenLabsService = new ElevenLabsService();

// ======================
// TEXTOS PRÉ-DEFINIDOS PARA VOZ DA NATHÁLIA
// ======================

export const NATHALIA_SCRIPTS = {
  // Saudações
  GREETING_MORNING: 'Bom dia, mãe! Que bom te ver por aqui. Vamos começar o dia juntas?',
  GREETING_AFTERNOON:
    'Boa tarde! Como você está se sentindo? Lembre-se: você está fazendo um trabalho incrível.',
  GREETING_EVENING: 'Boa noite! Hora de desacelerar. Você merece esse momento de paz.',

  // Ritual de 3 minutos
  RITUAL_INTRO:
    'Vamos fazer uma pausa juntas? Apenas 3 minutinhos pra você se reconectar consigo mesma.',
  RITUAL_BREATHING:
    'Respire fundo comigo. Inspire pelo nariz... segura... e solta pela boca. Muito bem.',
  RITUAL_AFFIRMATION:
    'Repita comigo: Eu sou uma boa mãe. Eu faço o meu melhor. Eu mereço cuidar de mim.',
  RITUAL_CLOSE:
    'Pronto! Você tirou um tempinho pra você. Isso é muito importante. Estou orgulhosa de você.',

  // Meditação
  MEDITATION_INTRO:
    'Encontre uma posição confortável. Feche os olhos se quiser. Vou te guiar nessa jornada.',
  MEDITATION_BODY_SCAN:
    'Sinta seu corpo. Os pés no chão. As mãos relaxadas. O peito subindo e descendo.',
  MEDITATION_VISUALIZATION:
    'Imagine um lugar seguro. Um lugar só seu. Onde você pode simplesmente ser.',
  MEDITATION_CLOSE: 'Quando estiver pronta, abra os olhos devagar. Leve essa paz com você.',

  // Apoio emocional
  SUPPORT_EXHAUSTION:
    'Eu sei que você está exausta. Tá tudo bem sentir isso. A maternidade é intensa. Você não está sozinha.',
  SUPPORT_ANXIETY: 'Respira fundo. Uma coisa de cada vez. Você não precisa resolver tudo agora.',
  SUPPORT_GUILT:
    'Não se culpe. Você está fazendo o que pode com o que tem. E isso é mais que suficiente.',
  SUPPORT_OVERWHELM: 'Está pesado, né? Tá tudo bem pedir ajuda. Tá tudo bem não dar conta de tudo.',

  // Motivação
  MOTIVATION_MORNING: 'Hoje é um novo dia. Novas chances. Você consegue.',
  MOTIVATION_STRENGTH: 'Olha quanta coisa você já superou. Você é muito mais forte do que imagina.',
  MOTIVATION_SELF_CARE: 'Cuidar de você não é egoísmo. É necessário. Mãe cansada cuida menos bem.',
} as const;

export default elevenLabsService;
