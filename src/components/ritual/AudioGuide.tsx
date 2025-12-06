/**
 * AudioGuide - Player de áudio guiado para passos do Ritual
 *
 * Componente de player de áudio para reproduzir trilhas guiadas durante o ritual.
 * Referência: app-redesign-studio-ab40635e/src/components/ritual/AudioGuide.tsx
 * Adaptado para React Native usando expo-av (se disponível) ou placeholder.
 */

import { Play, Pause, Volume2, VolumeX } from 'lucide-react-native';
import React, { useState, useEffect, useRef } from 'react';
import { View } from 'react-native';
import { Audio } from 'expo-av';

import { Box } from '@/components/atoms/Box';
import { Button } from '@/components/atoms/Button';
import { Text } from '@/components/atoms/Text';
import { useTheme } from '@/theme';
import { Tokens, ColorTokens } from '@/theme/tokens';
import { logger } from '@/utils/logger';

interface AudioGuideProps {
  trackUrl?: string;
  title?: string;
  autoPlay?: boolean;
  onEnded?: () => void;
  fallbackText?: string;
}

export function AudioGuide({
  trackUrl,
  title,
  autoPlay = false,
  onEnded,
  fallbackText,
}: AudioGuideProps) {
  const { colors, isDark } = useTheme();
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, _setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const soundRef = useRef<Audio.Sound | null>(null);

  useEffect(() => {
    if (!trackUrl) return;

    let sound: Audio.Sound | null = null;

    const loadAudio = async () => {
      try {
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: false,
        });

        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri: trackUrl },
          { shouldPlay: autoPlay, volume: isMuted ? 0 : volume },
          (status) => {
            if (status.isLoaded) {
              setCurrentTime(status.positionMillis / 1000);
              setDuration(status.durationMillis ? status.durationMillis / 1000 : 0);

              if (status.didJustFinish) {
                setIsPlaying(false);
                onEnded?.();
              }
            }
          }
        );

        sound = newSound;
        soundRef.current = sound;
        setIsPlaying(autoPlay);
      } catch (error) {
        logger.error('[AudioGuide] Error loading audio', error);
      }
    };

    loadAudio();

    return () => {
      if (sound) {
        sound.unloadAsync().catch(() => {});
      }
    };
  }, [trackUrl, autoPlay, onEnded]);

  useEffect(() => {
    if (soundRef.current) {
      soundRef.current.setVolumeAsync(isMuted ? 0 : volume).catch(() => {});
    }
  }, [volume, isMuted]);

  const togglePlay = async () => {
    if (!soundRef.current) return;

    try {
      if (isPlaying) {
        await soundRef.current.pauseAsync();
        setIsPlaying(false);
      } else {
        await soundRef.current.playAsync();
        setIsPlaying(true);
      }
    } catch (error) {
      logger.error('[AudioGuide] Error toggling play', error);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Se não há áudio, mostrar fallback de texto
  if (!trackUrl && fallbackText) {
    return (
      <Box
        p="6"
        align="center"
        style={{
          backgroundColor: isDark ? ColorTokens.neutral[800] : ColorTokens.neutral[100],
          borderRadius: Tokens.radius['2xl'],
        }}
      >
        <Text size="md" align="center" style={{ lineHeight: Tokens.typography.lineHeights.lg }}>
          {fallbackText}
        </Text>
      </Box>
    );
  }

  if (!trackUrl) return null;

  return (
    <Box
      p="4"
      gap="4"
      style={{
        backgroundColor: isDark ? ColorTokens.neutral[800] : ColorTokens.neutral[50],
        borderRadius: Tokens.radius['2xl'],
        borderWidth: 1,
        borderColor: isDark ? ColorTokens.neutral[700] : ColorTokens.neutral[200],
      }}
    >
      {/* Título do áudio */}
      {title && (
        <Box align="center">
          <Text size="lg" weight="semibold">
            {title}
          </Text>
        </Box>
      )}

      {/* Player de áudio */}
      <Box direction="row" align="center" gap="4">
        <Button
          title=""
          onPress={togglePlay}
          variant="primary"
          size="md"
          leftIcon={
            isPlaying ? (
              <Pause size={20} color={ColorTokens.neutral[0]} />
            ) : (
              <Play size={20} color={ColorTokens.neutral[0]} />
            )
          }
          style={{
            width: 48,
            height: 48,
            borderRadius: 24,
            backgroundColor: isDark ? ColorTokens.primary[600] : ColorTokens.primary[500],
            ...Tokens.shadows.lg,
          }}
        />

        {/* Barra de progresso simplificada */}
        <Box flex={1} gap="1">
          <View
            style={{
              height: 4,
              backgroundColor: isDark ? ColorTokens.neutral[700] : ColorTokens.neutral[200],
              borderRadius: 2,
              overflow: 'hidden',
            }}
          >
            <View
              style={{
                width: duration > 0 ? `${(currentTime / duration) * 100}%` : '0%',
                height: '100%',
                backgroundColor: isDark ? ColorTokens.primary[500] : ColorTokens.primary[500],
              }}
            />
          </View>
          <Box direction="row" justify="space-between">
            <Text size="xs" color="tertiary">
              {formatTime(currentTime)}
            </Text>
            <Text size="xs" color="tertiary">
              {formatTime(duration)}
            </Text>
          </Box>
        </Box>

        {/* Controle de volume simplificado */}
        <Button
          title=""
          onPress={() => setIsMuted(!isMuted)}
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
      </Box>

      {/* Fallback de texto se disponível */}
      {fallbackText && (
        <Box
          pt="4"
          style={{
            borderTopWidth: 1,
            borderTopColor: isDark ? ColorTokens.neutral[700] : ColorTokens.neutral[200],
          }}
        >
          <Text size="sm" align="center" color="secondary" style={{ lineHeight: Tokens.typography.lineHeights.lg }}>
            {fallbackText}
          </Text>
        </Box>
      )}
    </Box>
  );
}

