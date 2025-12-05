/**
 * TTSButton - Botão para ouvir mensagens da NathIA
 * 
 * Features:
 * - Gera áudio via ElevenLabs TTS
 * - Cache de áudio para mensagens repetidas
 * - Estados: idle, loading, playing, paused
 * - Acessibilidade WCAG AAA
 */

import * as Haptics from 'expo-haptics';
import { Volume2, Square } from 'lucide-react-native';
import React, { useState, useCallback, useEffect } from 'react';
import { TouchableOpacity, ViewStyle, ActivityIndicator } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';

import { useTheme } from '@/theme';
import { Tokens, ColorTokens } from '@/theme/tokens';
import { logger } from '@/utils/logger';
import { elevenLabsService } from '@/services/elevenLabsService';
import { Audio } from 'expo-av';

import { Text } from '@/components/primitives/Text';

export interface TTSButtonProps {
  /** Texto da mensagem para TTS */
  text: string;
  /** ID da mensagem (para cache) */
  messageId: string;
  /** Estilo customizado */
  style?: ViewStyle;
  /** Se está desabilitado */
  disabled?: boolean;
}

type TTSState = 'idle' | 'loading' | 'playing' | 'paused';

export const TTSButton: React.FC<TTSButtonProps> = React.memo(
  ({ text, messageId, style, disabled = false }) => {
  const { isDark } = useTheme();
  const [ttsState, setTtsState] = useState<TTSState>('idle');
  const [audioUri, setAudioUri] = useState<string | null>(null);
  const [currentPlayingId, setCurrentPlayingId] = useState<string | null>(null);
  const soundRef = React.useRef<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

    // Animação de pulso quando está tocando
    const pulseScale = useSharedValue(1);

    useEffect(() => {
      if (ttsState === 'playing') {
        pulseScale.value = withTiming(1.1, { duration: 500 }, () => {
          pulseScale.value = withTiming(1, { duration: 500 });
        });
      } else {
        pulseScale.value = withTiming(1, { duration: 200 });
      }
    }, [ttsState, pulseScale]);

    // Cleanup ao desmontar
    useEffect(() => {
      return () => {
        if (soundRef.current) {
          soundRef.current.unloadAsync().catch(() => {});
        }
      };
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: pulseScale.value }],
    }));

    const handlePress = useCallback(async () => {
      if (disabled) return;

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      // Se já está tocando, parar
      if (ttsState === 'playing' && currentPlayingId === messageId && soundRef.current) {
        try {
          await soundRef.current.stopAsync();
          await soundRef.current.unloadAsync();
          soundRef.current = null;
          setIsPlaying(false);
          setTtsState('idle');
          setCurrentPlayingId(null);
          logger.info('[TTSButton] Áudio pausado', { messageId });
        } catch (error) {
          logger.error('[TTSButton] Erro ao pausar áudio', error);
        }
        return;
      }

      // Se já tem áudio gerado, tocar
      if (audioUri) {
        try {
          setTtsState('playing');
          setCurrentPlayingId(messageId);
          const { sound } = await Audio.Sound.createAsync({ uri: audioUri }, { shouldPlay: true });
          soundRef.current = sound;
          setIsPlaying(true);
          sound.setOnPlaybackStatusUpdate((status) => {
            if (status.isLoaded && status.didJustFinish) {
              setIsPlaying(false);
              setTtsState('idle');
              setCurrentPlayingId(null);
            }
          });
          logger.info('[TTSButton] Áudio reproduzido do cache', { messageId });
        } catch (error) {
          logger.error('[TTSButton] Erro ao reproduzir áudio', error);
          setTtsState('idle');
          setCurrentPlayingId(null);
        }
        return;
      }

      // Gerar novo áudio
      setTtsState('loading');
      try {
        const response = await elevenLabsService.textToSpeech({
          text,
          voice_id: 'nathalia_main', // Usar voz da NathIA
        });

        if (response.audioUri) {
          setAudioUri(response.audioUri);
          setTtsState('playing');
          setCurrentPlayingId(messageId);
          const { sound } = await Audio.Sound.createAsync(
            { uri: response.audioUri },
            { shouldPlay: true }
          );
          soundRef.current = sound;
          setIsPlaying(true);
          sound.setOnPlaybackStatusUpdate((status) => {
            if (status.isLoaded && status.didJustFinish) {
              setIsPlaying(false);
              setTtsState('idle');
              setCurrentPlayingId(null);
            }
          });
          logger.info('[TTSButton] Áudio gerado e reproduzido', {
            messageId,
            cached: response.cached,
          });
        } else {
          throw new Error('Áudio não gerado');
        }
      } catch (error) {
        logger.error('[TTSButton] Erro ao gerar TTS', error);
        setTtsState('idle');
        // Fallback: usar Web Speech API (se disponível)
        // Em React Native, isso não está disponível, então apenas mostrar erro
      }
    }, [text, messageId, audioUri, ttsState, currentPlayingId, disabled, play, stop]);

    const getButtonContent = () => {
      switch (ttsState) {
        case 'loading':
          return (
            <>
              <ActivityIndicator
                size="small"
                color={isDark ? ColorTokens.primary[300] : ColorTokens.primary[600]}
              />
              <Text size="xs" style={{ marginLeft: Tokens.spacing['1.5'] }}>
                Gerando...
              </Text>
            </>
          );
        case 'playing':
          return (
            <>
              <Square
                size={14}
                color={isDark ? ColorTokens.primary[300] : ColorTokens.primary[600]}
                fill={isDark ? ColorTokens.primary[300] : ColorTokens.primary[600]}
              />
              <Text
                size="xs"
                style={{
                  marginLeft: Tokens.spacing['1.5'],
                  color: isDark ? ColorTokens.primary[300] : ColorTokens.primary[600],
                }}
              >
                Parar
              </Text>
            </>
          );
        default:
          return (
            <>
              <Volume2
                size={14}
                color={isDark ? ColorTokens.primary[300] : ColorTokens.primary[600]}
              />
              <Text
                size="xs"
                style={{
                  marginLeft: Tokens.spacing['1.5'],
                  color: isDark ? ColorTokens.primary[300] : ColorTokens.primary[600],
                }}
              >
                Ouvir
              </Text>
            </>
          );
      }
    };

    return (
      <Animated.View style={animatedStyle}>
        <TouchableOpacity
          onPress={handlePress}
          disabled={disabled || ttsState === 'loading'}
          activeOpacity={0.7}
          style={[
            {
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: Tokens.spacing['3'],
              paddingVertical: Tokens.spacing['2'],
              borderRadius: Tokens.radius.full,
              backgroundColor: isDark
                ? `${ColorTokens.primary[500]}15`
                : `${ColorTokens.primary[500]}10`,
              borderWidth: 1,
              borderColor: isDark
                ? `${ColorTokens.primary[500]}30`
                : `${ColorTokens.primary[500]}20`,
              minHeight: Tokens.touchTargets.min,
            },
            style,
          ]}
          accessibilityRole="button"
          accessibilityLabel={
            ttsState === 'playing' ? 'Parar áudio' : ttsState === 'loading' ? 'Gerando áudio' : 'Ouvir mensagem'
          }
          accessibilityHint="Toque duas vezes para ouvir a mensagem da NathIA em áudio"
        >
          {getButtonContent()}
        </TouchableOpacity>
      </Animated.View>
    );
  }
);

TTSButton.displayName = 'TTSButton';

