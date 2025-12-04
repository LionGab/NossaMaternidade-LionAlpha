/**
 * AudioPlayer Component - UI component for audio playback
 * Componente de UI para reprodução de áudio (sem player real por enquanto)
 * Theme-aware with Design System tokens
 */

import { Ionicons } from '@expo/vector-icons';
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Platform } from 'react-native';

import { useThemeColors, type ThemeColors } from '@/theme';
import { Tokens } from '@/theme/tokens';

import { useHaptics } from '../hooks/useHaptics';

interface AudioPlayerProps {
  audioUrl: string;
  title?: string;
  duration?: string;
  onPlay?: () => void;
  onPause?: () => void;
  onEnd?: () => void;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  audioUrl: _audioUrl,
  title,
  duration,
  onPlay,
  onPause,
  onEnd,
}: AudioPlayerProps) => {
  const colors = useThemeColors();
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [durationMs, setDurationMs] = useState(0);
  const haptics = useHaptics();

  const progressAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const styles = useMemo(() => createStyles(colors), [colors]);

  // Converter duration string para milliseconds se fornecido
  useEffect(() => {
    if (duration) {
      const parts = duration.split(':');
      if (parts.length === 2) {
        const minutes = parseInt(parts[0], 10);
        const seconds = parseInt(parts[1], 10);
        setDurationMs((minutes * 60 + seconds) * 1000);
      } else if (!isNaN(parseInt(duration, 10))) {
        // Se for apenas um número (segundos)
        setDurationMs(parseInt(duration, 10) * 1000);
      }
    }
  }, [duration]);

  useEffect(() => {
    if (isPlaying) {
      // Animação de pulso quando está tocando
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Simular progresso (apenas visual)
      const interval = setInterval(() => {
        setPosition((prev: number) => {
          const newPos = prev + 100;
          if (newPos >= durationMs) {
            setIsPlaying(false);
            setPosition(0);
            progressAnim.setValue(0);
            onEnd?.();
            return 0;
          }
          const progress = newPos / durationMs;
          progressAnim.setValue(progress);
          return newPos;
        });
      }, 100);

      return () => clearInterval(interval);
    } else {
      pulseAnim.setValue(1);
      return undefined;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    // progressAnim e pulseAnim são refs estáveis (useRef), não precisam estar nas dependências
    // onEnd é callback opcional - incluí-lo causaria re-execução desnecessária do efeito
    // eslint-disable-next-line react-hooks/exhaustive-deps
    // progressAnim e pulseAnim são refs estáveis (useRef), não precisam estar nas dependências
    // onEnd é callback opcional - incluí-lo causaria re-execução desnecessária do efeito
  }, [isPlaying, durationMs]);

  const playPause = () => {
    haptics.light();

    if (isPlaying) {
      setIsPlaying(false);
      onPause?.();
    } else {
      setIsPlaying(true);
      onPlay?.();
    }
  };

  const formatTime = (milliseconds: number): string => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.container}>
      {/* Player Controls */}
      <View style={styles.playerContainer}>
        {/* Play/Pause Button */}
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel={isPlaying ? 'Pausar áudio' : 'Reproduzir áudio'}
          accessibilityHint={
            isPlaying ? 'Pausa a reprodução do áudio atual' : 'Inicia a reprodução do áudio'
          }
          style={styles.playButton}
          onPress={playPause}
          activeOpacity={0.7}
        >
          <Animated.View
            style={[
              styles.playButtonInner,
              {
                transform: [{ scale: pulseAnim }],
              },
            ]}
            accessibilityIgnoresInvertColors={true}
          >
            {isPlaying ? (
              <Ionicons name="pause" size={24} color={colors.raw.neutral[0]} />
            ) : (
              <Ionicons name="play" size={24} color={colors.raw.neutral[0]} />
            )}
          </Animated.View>
        </TouchableOpacity>

        {/* Info */}
        <View style={styles.infoContainer}>
          {title && (
            <Text style={styles.title} numberOfLines={1}>
              {title}
            </Text>
          )}
          <View style={styles.timeContainer}>
            <Text style={styles.time}>
              {formatTime(position)} / {duration || formatTime(durationMs)}
            </Text>
          </View>
        </View>
      </View>

      {/* Progress Bar */}
      <View
        style={styles.progressBarContainer}
        accessibilityLabel="Barra de progresso do áudio"
        accessibilityHint={`${Math.round((position / durationMs) * 100)}% reproduzido`}
      >
        <Animated.View
          style={[
            styles.progressBar,
            {
              width: progressWidth,
            },
          ]}
          accessibilityIgnoresInvertColors={true}
        />
      </View>
    </View>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      width: '100%',
      paddingVertical: Tokens.spacing['4'],
    },
    playerContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Tokens.spacing['4'],
      marginBottom: Tokens.spacing['3'],
    },
    playButton: {
      width: 56,
      height: 56,
      borderRadius: Tokens.radius.full,
      backgroundColor: colors.primary.main,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: Tokens.touchTargets.min,
      ...(Platform.OS === 'web'
        ? {
            boxShadow: `0px 4px 8px 0px ${colors.primary.main}33`, // 0.3 opacity
          }
        : {
            shadowColor: colors.primary.main,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 6,
          }),
    },
    playButtonInner: {
      width: 56,
      height: 56,
      borderRadius: Tokens.radius.full,
      alignItems: 'center',
      justifyContent: 'center',
    },
    infoContainer: {
      flex: 1,
      gap: Tokens.spacing['1'],
    },
    title: {
      fontSize: Tokens.typography.sizes.base,
      fontWeight: Tokens.typography.weights.semibold,
      color: colors.text.primary,
    },
    timeContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Tokens.spacing['2'],
    },
    time: {
      fontSize: Tokens.typography.sizes.sm - 1,
      color: colors.text.secondary,
      fontVariant: ['tabular-nums'],
    },
    progressBarContainer: {
      width: '100%',
      height: 4,
      backgroundColor: colors.background.card,
      borderRadius: Tokens.radius.sm,
      overflow: 'hidden',
    },
    progressBar: {
      height: '100%',
      backgroundColor: colors.primary.main,
      borderRadius: Tokens.radius.sm,
    },
  });

export default AudioPlayer;
