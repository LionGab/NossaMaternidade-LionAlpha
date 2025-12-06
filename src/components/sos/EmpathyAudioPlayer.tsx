/**
 * EmpathyAudioPlayer - Player de áudio empático para SOS Mãe
 *
 * Reproduz mensagens empáticas de acolhimento baseadas no sentimento da usuária,
 * com guias de respiração e suporte emocional.
 * Referência: app-redesign-studio-ab40635e/src/components/sos/EmpathyAudioPlayer.tsx
 * Adaptado para React Native usando expo-av (ou placeholder se não disponível).
 */

import { Play, Pause, Volume2, VolumeX } from 'lucide-react-native';
import React, { useState, useEffect, useRef } from 'react';
import { View } from 'react-native';
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';

import { Box } from '@/components/atoms/Box';
import { Button } from '@/components/atoms/Button';
import { Text } from '@/components/atoms/Text';
import { useTheme } from '@/theme';
import { Tokens, ColorTokens } from '@/theme/tokens';
import { logger as _logger } from '@/utils/logger';
import type { SentimentType } from '@/types/sos';

interface EmpathyAudioPlayerProps {
  sentiment: SentimentType;
  text?: string;
  onComplete?: () => void;
}

const EMPATHY_MESSAGES: Record<SentimentType, string> = {
  sobrecarregada:
    'Ouvindo você. Você está sobrecarregada, e isso é normal. Vamos respirar juntas. Inspire por 4, segure por 7, expire por 8.',
  ansiosa:
    'Ouvindo você. A ansiedade pode ser avassaladora. Vamos respirar juntas. Inspire devagar, segure, expire ainda mais devagar.',
  triste:
    'Ouvindo você. A tristeza é válida. Vamos respirar juntas. Inspire profundamente, sinta o ar preenchendo seus pulmões, expire suavemente.',
  irritada:
    'Ouvindo você. A raiva é um sinal de que algo precisa mudar. Vamos respirar juntas. Inspire, segure, expire lentamente.',
  sozinha:
    'Ouvindo você. Você não está sozinha, mesmo quando se sente assim. Vamos respirar juntas. Inspire, sinta nossa presença, expire.',
  desesperada:
    'Ouvindo você. Este momento vai passar. Você é mais forte do que pensa. Vamos respirar juntas. Inspire profundamente, segure, expire devagar.',
  culpada:
    'Ouvindo você. A culpa que você sente mostra o quanto você se importa. Vamos respirar juntas. Inspire profundamente, segure, expire devagar.',
  cansada:
    'Ouvindo você. Você está cansada, e isso é válido. Vamos respirar juntas. Inspire por 4, segure por 4, expire por 4.',
};

export function EmpathyAudioPlayer({
  sentiment,
  text,
  onComplete,
}: EmpathyAudioPlayerProps) {
  const { colors, isDark } = useTheme();
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, _setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const soundRef = useRef<Audio.Sound | null>(null);

  const message = text || EMPATHY_MESSAGES[sentiment];

  // TODO: Integrar com serviço de geração de áudio empático (ex: ElevenLabs, TTS)
  // Por enquanto, usar texto-to-speech nativo ou placeholder
  useEffect(() => {
    // Placeholder: preparar para integração futura
    // Quando houver serviço de áudio, carregar aqui
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync().catch(() => {});
      }
    };
  }, [sentiment, message]);

  useEffect(() => {
    if (soundRef.current) {
      soundRef.current.setVolumeAsync(isMuted ? 0 : volume).catch(() => {});
    }
  }, [volume, isMuted]);

  const togglePlay = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // TODO: Implementar reprodução de áudio quando serviço estiver disponível
    // Por enquanto, apenas simular
    if (isPlaying) {
      if (soundRef.current) {
        await soundRef.current.pauseAsync();
      }
      setIsPlaying(false);
    } else {
      // Simular reprodução
      // Em produção, carregar áudio do serviço de TTS/IA
      setIsPlaying(true);

      // Simular término após alguns segundos
      setTimeout(() => {
        setIsPlaying(false);
        onComplete?.();
      }, 3000);
    }
  };

  return (
    <Box
      p="6"
      gap="4"
      style={{
        backgroundColor: isDark ? ColorTokens.neutral[800] : ColorTokens.neutral[50],
        borderRadius: Tokens.radius['3xl'],
        borderWidth: 2,
        borderColor: isDark ? ColorTokens.secondary[700] : ColorTokens.secondary[200],
        ...Tokens.shadows.xl,
      }}
    >
      {/* Header */}
      <Box align="center" gap="2">
        <Text size="lg" weight="bold">
          Áudio Empático
        </Text>
        <Text size="sm" color="secondary">
          Vamos respirar juntas
        </Text>
      </Box>

      {/* Player */}
      <Box direction="row" align="center" gap="4">
        <Button
          title=""
          onPress={togglePlay}
          variant="primary"
          size="md"
          leftIcon={
            isPlaying ? (
              <Pause size={24} color={ColorTokens.neutral[0]} />
            ) : (
              <Play size={24} color={ColorTokens.neutral[0]} />
            )
          }
          style={{
            width: 56,
            height: 56,
            borderRadius: 28,
            backgroundColor: isDark ? ColorTokens.secondary[600] : ColorTokens.secondary[500],
            ...Tokens.shadows.lg,
          }}
        />

        {/* Mensagem */}
        <Box flex={1} gap="2">
          <Box
            p="4"
            style={{
              backgroundColor: isDark ? `${ColorTokens.neutral[700]}80` : `${ColorTokens.neutral[100]}80`,
              borderRadius: Tokens.radius.xl,
            }}
          >
            <Text
              size="sm"
              style={{
                lineHeight: Tokens.typography.lineHeights.lg,
                color: colors.text.primary,
              }}
            >
              {message}
            </Text>
          </Box>
        </Box>

        {/* Controle de volume */}
        <Box align="center" gap="1">
          <Button
            title=""
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setIsMuted(!isMuted);
            }}
            variant="ghost"
            size="sm"
            leftIcon={
              isMuted || volume === 0 ? (
                <VolumeX size={16} color={colors.text.tertiary} />
              ) : (
                <Volume2 size={16} color={colors.text.tertiary} />
              )
            }
            style={{
              width: 32,
              height: 32,
            }}
          />
          {/* Barra de volume simplificada */}
          <View
            style={{
              width: 4,
              height: 40,
              backgroundColor: isDark ? ColorTokens.neutral[700] : ColorTokens.neutral[200],
              borderRadius: 2,
              overflow: 'hidden',
            }}
          >
            <View
              style={{
                width: '100%',
                height: `${(isMuted ? 0 : volume) * 100}%`,
                backgroundColor: isDark ? ColorTokens.secondary[500] : ColorTokens.secondary[500],
              }}
            />
          </View>
        </Box>
      </Box>
    </Box>
  );
}

