/**
 * VoicePlayer - Componente de player de voz da Nathália
 * Botão animado com controles de play/pause/loading
 */

import * as Haptics from 'expo-haptics';
import { Play, Pause, VolumeX } from 'lucide-react-native';
import React, { useRef, useEffect } from 'react';
import { TouchableOpacity, Animated, Easing, View, ActivityIndicator } from 'react-native';

import { Text } from '@/components/primitives/Text';
import { useVoice, type VoiceType, type ScriptKey } from '@/hooks/useVoice';
import { useTheme } from '@/theme';
import { Tokens, ColorTokens } from '@/theme/tokens';

export interface VoicePlayerProps {
  /** Texto para falar (ou usar scriptKey) */
  text?: string;
  /** Chave de script pré-definido */
  scriptKey?: ScriptKey;
  /** Tipo de voz */
  voiceType?: VoiceType;
  /** Tamanho do botão */
  size?: 'sm' | 'md' | 'lg';
  /** Variante visual */
  variant?: 'primary' | 'secondary' | 'ghost';
  /** Mostrar label */
  showLabel?: boolean;
  /** Label personalizado */
  label?: string;
  /** Desabilitado */
  disabled?: boolean;
  /** Callback ao iniciar */
  onPlay?: () => void;
  /** Callback ao parar */
  onStop?: () => void;
}

const SIZE_CONFIG = {
  sm: { button: 36, icon: 16, fontSize: 'xs' as const },
  md: { button: 44, icon: 20, fontSize: 'sm' as const },
  lg: { button: 56, icon: 24, fontSize: 'md' as const },
};

export function VoicePlayer({
  text,
  scriptKey,
  voiceType = 'NATHALIA_MAIN',
  size = 'md',
  variant = 'primary',
  showLabel = false,
  label,
  disabled = false,
  onPlay,
  onStop,
}: VoicePlayerProps) {
  const { colors, isDark } = useTheme();
  const { isLoading, isPlaying, isConfigured, speak, speakScript, stop } = useVoice({
    defaultVoiceType: voiceType,
    onPlayStart: onPlay,
    onPlayEnd: onStop,
  });

  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  const config = SIZE_CONFIG[size];

  // Animação de pulso durante reprodução
  useEffect(() => {
    if (isPlaying) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isPlaying, pulseAnim]);

  // Animação de loading (rotação)
  useEffect(() => {
    if (isLoading) {
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
    } else {
      rotateAnim.setValue(0);
    }
  }, [isLoading, rotateAnim]);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.92,
      useNativeDriver: true,
      damping: 15,
      stiffness: 300,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      damping: 15,
      stiffness: 300,
    }).start();
  };

  const handlePress = async () => {
    if (disabled || !isConfigured) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (isPlaying) {
      await stop();
    } else if (isLoading) {
      // Não fazer nada durante loading
    } else {
      if (scriptKey) {
        await speakScript(scriptKey, voiceType);
      } else if (text) {
        await speak(text, voiceType);
      }
    }
  };

  // Cores baseadas na variante
  const getColors = () => {
    if (disabled || !isConfigured) {
      return {
        bg: isDark ? ColorTokens.neutral[800] : ColorTokens.neutral[200],
        icon: ColorTokens.neutral[400],
        border: 'transparent',
      };
    }

    switch (variant) {
      case 'primary':
        return {
          bg: isPlaying
            ? ColorTokens.primary[500]
            : isDark
              ? ColorTokens.primary[600]
              : ColorTokens.primary[500],
          icon: ColorTokens.neutral[0],
          border: 'transparent',
        };
      case 'secondary':
        return {
          bg: isDark ? `${ColorTokens.primary[500]}30` : `${ColorTokens.primary[500]}20`,
          icon: ColorTokens.primary[500],
          border: `${ColorTokens.primary[500]}50`,
        };
      case 'ghost':
        return {
          bg: 'transparent',
          icon: isPlaying ? ColorTokens.primary[500] : colors.text.secondary,
          border: isDark ? ColorTokens.neutral[700] : ColorTokens.neutral[300],
        };
    }
  };

  const colorConfig = getColors();

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const displayLabel = label || (isPlaying ? 'Pausar' : isLoading ? 'Carregando...' : 'Ouvir');

  return (
    <View
      style={{
        flexDirection: showLabel ? 'row' : 'column',
        alignItems: 'center',
        gap: showLabel ? Tokens.spacing['2'] : 0,
      }}
    >
      <Animated.View
        style={{
          transform: [{ scale: scaleAnim }, { scale: isPlaying ? pulseAnim : 1 }],
        }}
      >
        <TouchableOpacity
          onPress={handlePress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={disabled || !isConfigured}
          activeOpacity={1}
          accessibilityRole="button"
          accessibilityLabel={isPlaying ? 'Pausar áudio da Nathália' : 'Ouvir áudio da Nathália'}
          accessibilityHint={isPlaying ? 'Toque para pausar' : 'Toque para ouvir a voz da Nathália'}
          accessibilityState={{ disabled: disabled || !isConfigured }}
          style={{
            width: config.button,
            height: config.button,
            borderRadius: Tokens.radius.full,
            backgroundColor: colorConfig.bg,
            borderWidth: variant === 'ghost' || variant === 'secondary' ? 1.5 : 0,
            borderColor: colorConfig.border,
            alignItems: 'center',
            justifyContent: 'center',
            ...Tokens.shadows.sm,
          }}
        >
          {isLoading ? (
            <Animated.View style={{ transform: [{ rotate }] }}>
              <ActivityIndicator size="small" color={colorConfig.icon} />
            </Animated.View>
          ) : isPlaying ? (
            <Pause size={config.icon} color={colorConfig.icon} fill={colorConfig.icon} />
          ) : !isConfigured ? (
            <VolumeX size={config.icon} color={colorConfig.icon} />
          ) : (
            <Play size={config.icon} color={colorConfig.icon} fill={colorConfig.icon} />
          )}
        </TouchableOpacity>
      </Animated.View>

      {showLabel && (
        <Text
          size={config.fontSize}
          weight="medium"
          style={{
            color: disabled ? colors.text.secondary : colors.text.primary,
          }}
        >
          {displayLabel}
        </Text>
      )}
    </View>
  );
}

export default VoicePlayer;
