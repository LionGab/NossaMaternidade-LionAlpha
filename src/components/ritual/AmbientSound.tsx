/**
 * AmbientSound - Controle de som ambiente para Ritual
 *
 * Permite selecionar e controlar volume de sons ambiente (chuva, oceano, etc.)
 * durante o ritual.
 * Referência: app-redesign-studio-ab40635e/src/components/ritual/AmbientSound.tsx
 * Adaptado para React Native usando expo-av.
 */

import { Volume2, VolumeX } from 'lucide-react-native';
import React, { useState, useEffect, useRef } from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';

import { Box } from '@/components/atoms/Box';
import { Text } from '@/components/atoms/Text';
import { useTheme } from '@/theme';
import { Tokens, ColorTokens } from '@/theme/tokens';
import { logger } from '@/utils/logger';
import type { AmbientSoundConfig, AmbientSoundType } from '@/types/ritual';
import { AMBIENT_SOUNDS } from '@/types/ritual';

interface AmbientSoundProps {
  config: AmbientSoundConfig;
  onConfigChange?: (config: AmbientSoundConfig) => void;
}

// URLs de exemplo para sons ambiente (TODO: substituir por URLs reais)
const AMBIENT_SOUND_URLS: Record<AmbientSoundType, string | null> = {
  rain: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', // Placeholder
  ocean: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', // Placeholder
  forest: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', // Placeholder
  birds: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3', // Placeholder
  fireplace: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', // Placeholder
  white_noise: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', // Placeholder
};

export function AmbientSound({ config, onConfigChange }: AmbientSoundProps) {
  const { colors, isDark } = useTheme();
  const [isPlaying, setIsPlaying] = useState(config.enabled && config.type !== 'white_noise');
  const soundRef = useRef<Audio.Sound | null>(null);

  useEffect(() => {
    if (config.type === 'white_noise' || !config.enabled) {
      if (soundRef.current) {
        soundRef.current.pauseAsync().catch(() => {});
        setIsPlaying(false);
      }
      return;
    }

    const url = AMBIENT_SOUND_URLS[config.type];
    if (!url) return;

    let sound: Audio.Sound | null = null;

    const loadAudio = async () => {
      try {
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: false,
        });

        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri: url },
          {
            shouldPlay: config.enabled && isPlaying,
            volume: config.volume,
            isLooping: true,
          }
        );

        sound = newSound;
        soundRef.current = sound;
      } catch (error) {
        logger.warn('[AmbientSound] Error loading ambient sound (may not be configured)', error);
      }
    };

    loadAudio();

    return () => {
      if (sound) {
        sound.unloadAsync().catch(() => {});
      }
    };
  }, [config.type]);

  useEffect(() => {
    if (soundRef.current) {
      soundRef.current.setVolumeAsync(config.volume).catch(() => {});
    }
  }, [config.volume]);

  useEffect(() => {
    if (!soundRef.current) return;

    if (config.enabled && config.type !== 'white_noise' && isPlaying) {
      soundRef.current.playAsync().catch((error) => {
        logger.error('[AmbientSound] Error playing ambient sound', error);
      });
    } else {
      soundRef.current.pauseAsync().catch(() => {});
    }
  }, [config.enabled, isPlaying, config.type]);

  const toggleSound = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newEnabled = !config.enabled;
    setIsPlaying(newEnabled);
    onConfigChange?.({
      ...config,
      enabled: newEnabled,
    });
  };

  const handleSelectSound = (soundType: AmbientSoundType) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onConfigChange?.({
      ...config,
      type: soundType,
      enabled: soundType !== 'white_noise',
    });
    setIsPlaying(soundType !== 'white_noise');
  };

  if (config.type === 'white_noise') {
    return null;
  }

  const selectedSound = AMBIENT_SOUNDS.find((s) => s.type === config.type);

  return (
    <Box
      direction="row"
      align="center"
      gap="3"
      p="3"
      style={{
        backgroundColor: isDark ? `${ColorTokens.neutral[800]}80` : `${ColorTokens.neutral[100]}80`,
        borderRadius: Tokens.radius.xl,
      }}
    >
      <TouchableOpacity
        onPress={toggleSound}
        style={{
          width: 40,
          height: 40,
          borderRadius: 20,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor:
            config.enabled && isPlaying
              ? isDark
                ? `${ColorTokens.primary[500]}33`
                : `${ColorTokens.primary[500]}20`
              : 'transparent',
        }}
        accessibilityRole="button"
        accessibilityLabel={config.enabled ? 'Desativar som ambiente' : 'Ativar som ambiente'}
      >
        {config.enabled && isPlaying ? (
          <Volume2 size={20} color={isDark ? ColorTokens.primary[300] : ColorTokens.primary[500]} />
        ) : (
          <VolumeX size={20} color={colors.text.tertiary} />
        )}
      </TouchableOpacity>

      <Box flex={1} gap="1" style={{ minWidth: 0 }}>
        <Box direction="row" align="center" justify="space-between">
          <Text size="sm" weight="medium" numberOfLines={1}>
            {selectedSound?.label || 'Som ambiente'}
          </Text>
          <Text size="xs" color="tertiary">
            {Math.round(config.volume * 100)}%
          </Text>
        </Box>
        {/* Barra de volume simplificada */}
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
              width: `${config.volume * 100}%`,
              height: '100%',
              backgroundColor: isDark ? ColorTokens.primary[500] : ColorTokens.primary[500],
            }}
          />
        </View>
      </Box>

      {/* Seletor de som (scroll horizontal) */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: Tokens.spacing['2'] }}
      >
        {AMBIENT_SOUNDS.filter((s) => s.type !== 'white_noise').map((sound) => (
          <TouchableOpacity
            key={sound.type}
            onPress={() => handleSelectSound(sound.type)}
            style={{
              paddingHorizontal: Tokens.spacing['3'],
              paddingVertical: Tokens.spacing['2'],
              borderRadius: Tokens.radius.full,
              backgroundColor:
                config.type === sound.type
                  ? isDark
                    ? ColorTokens.primary[600]
                    : ColorTokens.primary[500]
                  : isDark
                  ? ColorTokens.neutral[700]
                  : ColorTokens.neutral[200],
              flexDirection: 'row',
              alignItems: 'center',
              gap: Tokens.spacing['1'],
            }}
            accessibilityRole="button"
            accessibilityLabel={`Selecionar som ${sound.label}`}
          >
            <Text size="sm">{sound.icon}</Text>
            <Text
              size="xs"
              style={{
                color:
                  config.type === sound.type
                    ? ColorTokens.neutral[0]
                    : isDark
                    ? ColorTokens.neutral[300]
                    : ColorTokens.neutral[700],
              }}
            >
              {sound.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </Box>
  );
}

