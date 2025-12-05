/**
 * VoiceInputButton - Botão de gravação de voz estilo ChatGPT
 * Permite gravar áudio, visualizar preview e enviar para transcrição
 *
 * Features:
 * - Botão animado de gravação
 * - Visualização de amplitude (waveform)
 * - Preview de áudio antes de enviar
 * - Contagem de tempo
 * - Cancelar ou enviar
 */

import * as Haptics from 'expo-haptics';
import { Mic, Square, Play, Pause, Send, X, Loader2 } from 'lucide-react-native';
import React, { useEffect, useRef } from 'react';
import { View, TouchableOpacity, Animated, Easing, StyleSheet } from 'react-native';

import { Box } from '@/components/atoms/Box';
import { Text } from '@/components/atoms/Text';
import {
  useVoiceRecording,
  formatRecordingTime,
  type UseVoiceRecordingOptions,
} from '@/hooks/useVoiceRecording';
import { useTheme } from '@/theme';
import { Tokens, ColorTokens, Spacing, Radius } from '@/theme/tokens';

// ======================
// TIPOS
// ======================

export interface VoiceInputButtonProps {
  /** Callback quando transcrição estiver pronta */
  onTranscriptionReady?: (text: string) => void;
  /** Callback quando áudio estiver pronto (sem transcrição) */
  onAudioReady?: (uri: string) => void;
  /** Callback para cancelar */
  onCancel?: () => void;
  /** Tamanho do botão */
  size?: 'sm' | 'md' | 'lg';
  /** Se deve transcrever automaticamente após gravação */
  autoTranscribe?: boolean;
  /** Disabled */
  disabled?: boolean;
  /** Texto placeholder quando idle */
  placeholder?: string;
  /** Opções do hook de gravação */
  recordingOptions?: UseVoiceRecordingOptions;
}

// Configurações de tamanho
const SIZE_CONFIG = {
  sm: { button: 40, icon: 18 },
  md: { button: 48, icon: 22 },
  lg: { button: 56, icon: 26 },
};

// ======================
// COMPONENTE PRINCIPAL
// ======================

export function VoiceInputButton({
  onTranscriptionReady,
  onAudioReady,
  onCancel,
  size = 'md',
  autoTranscribe = true,
  disabled = false,
  // placeholder not used yet, kept for future use
  recordingOptions,
}: VoiceInputButtonProps) {
  const { colors, isDark } = useTheme();
  const config = SIZE_CONFIG[size];

  const {
    isRecording,
    isTranscribing,
    isPlayingPreview,
    recordingDuration,
    recordedUri,
    amplitude,
    startRecording,
    stopRecording,
    cancelRecording,
    playPreview,
    stopPreview,
    transcribe,
    clear,
  } = useVoiceRecording({
    ...recordingOptions,
    onRecordingComplete: (uri) => {
      recordingOptions?.onRecordingComplete?.(uri);
      if (!autoTranscribe) {
        onAudioReady?.(uri);
      }
    },
    onTranscriptionComplete: (text) => {
      recordingOptions?.onTranscriptionComplete?.(text);
      onTranscriptionReady?.(text);
    },
  });

  // Animações
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const waveAnim1 = useRef(new Animated.Value(0.3)).current;
  const waveAnim2 = useRef(new Animated.Value(0.3)).current;
  const waveAnim3 = useRef(new Animated.Value(0.3)).current;

  // Animação de pulso durante gravação
  useEffect(() => {
    if (isRecording) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.15,
            duration: 600,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 600,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isRecording, pulseAnim]);

  // Animação de loading (rotação)
  useEffect(() => {
    if (isTranscribing) {
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
  }, [isTranscribing, rotateAnim]);

  // Animação de waveform baseada na amplitude
  useEffect(() => {
    if (isRecording) {
      const targetValue = 0.3 + amplitude * 0.7;
      Animated.parallel([
        Animated.timing(waveAnim1, {
          toValue: targetValue * 0.7,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(waveAnim2, {
          toValue: targetValue,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(waveAnim3, {
          toValue: targetValue * 0.85,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      waveAnim1.setValue(0.3);
      waveAnim2.setValue(0.3);
      waveAnim3.setValue(0.3);
    }
  }, [isRecording, amplitude, waveAnim1, waveAnim2, waveAnim3]);

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

  const handleMainButtonPress = async () => {
    if (disabled) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (isRecording) {
      // Parar gravação
      await stopRecording();
    } else if (recordedUri) {
      // Já tem gravação - enviar/transcrever
      if (autoTranscribe) {
        await transcribe();
      }
    } else {
      // Iniciar gravação
      await startRecording();
    }
  };

  const handleCancel = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    await cancelRecording();
    clear();
    onCancel?.();
  };

  const handlePreviewToggle = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (isPlayingPreview) {
      await stopPreview();
    } else {
      await playPreview();
    }
  };

  const handleSend = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (autoTranscribe) {
      await transcribe();
    } else if (recordedUri) {
      onAudioReady?.(recordedUri);
      clear();
    }
  };

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  // Estado idle - mostrar apenas botão de mic
  if (!isRecording && !recordedUri && !isTranscribing) {
    return (
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <TouchableOpacity
          onPress={handleMainButtonPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={disabled}
          activeOpacity={1}
          accessibilityRole="button"
          accessibilityLabel="Gravar mensagem de voz"
          accessibilityHint="Toque para iniciar gravação"
          style={[
            styles.mainButton,
            {
              width: config.button,
              height: config.button,
              backgroundColor: disabled
                ? colors.text.disabled
                : isDark
                  ? ColorTokens.neutral[700]
                  : ColorTokens.neutral[100],
              borderColor: isDark ? ColorTokens.neutral[600] : ColorTokens.neutral[200],
            },
          ]}
        >
          <Mic size={config.icon} color={disabled ? colors.text.tertiary : colors.text.secondary} />
        </TouchableOpacity>
      </Animated.View>
    );
  }

  // Estado de transcrição
  if (isTranscribing) {
    return (
      <Box
        bg="elevated"
        rounded="2xl"
        px="4"
        py="3"
        direction="row"
        align="center"
        borderWidth={1}
        borderColor="light"
        style={{ gap: Spacing['3'], flex: 1 }}
      >
        <Animated.View style={{ transform: [{ rotate }] }}>
          <Loader2 size={20} color={colors.primary.main} />
        </Animated.View>
        <Text color="secondary" size="sm" weight="medium">
          Transcrevendo áudio...
        </Text>
      </Box>
    );
  }

  // Estado de gravação
  if (isRecording) {
    return (
      <Box direction="row" align="center" style={{ gap: Spacing['3'], flex: 1 }}>
        {/* Botão cancelar */}
        <TouchableOpacity
          onPress={handleCancel}
          accessibilityRole="button"
          accessibilityLabel="Cancelar gravação"
          style={[
            styles.secondaryButton,
            {
              backgroundColor: isDark
                ? ColorTokens.error[500] + '20'
                : ColorTokens.error[500] + '15',
              borderColor: ColorTokens.error[500] + '40',
            },
          ]}
        >
          <X size={18} color={ColorTokens.error[500]} />
        </TouchableOpacity>

        {/* Área de gravação */}
        <Box
          flex={1}
          bg="elevated"
          rounded="2xl"
          px="4"
          py="3"
          direction="row"
          align="center"
          justify="space-between"
          borderWidth={2}
          style={{
            borderColor: ColorTokens.error[500],
            backgroundColor: isDark ? ColorTokens.error[500] + '10' : ColorTokens.error[500] + '08',
          }}
        >
          {/* Waveform */}
          <Box direction="row" align="center" style={{ gap: 3 }}>
            <View style={styles.recordingDot} />
            <Animated.View
              style={[
                styles.waveBar,
                {
                  backgroundColor: ColorTokens.error[500],
                  transform: [{ scaleY: waveAnim1 }],
                },
              ]}
            />
            <Animated.View
              style={[
                styles.waveBar,
                {
                  backgroundColor: ColorTokens.error[500],
                  transform: [{ scaleY: waveAnim2 }],
                },
              ]}
            />
            <Animated.View
              style={[
                styles.waveBar,
                {
                  backgroundColor: ColorTokens.error[500],
                  transform: [{ scaleY: waveAnim3 }],
                },
              ]}
            />
          </Box>

          {/* Tempo */}
          <Text color="error" size="sm" weight="bold">
            {formatRecordingTime(recordingDuration)}
          </Text>
        </Box>

        {/* Botão parar */}
        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          <TouchableOpacity
            onPress={handleMainButtonPress}
            accessibilityRole="button"
            accessibilityLabel="Parar gravação"
            style={[
              styles.mainButton,
              {
                width: config.button,
                height: config.button,
                backgroundColor: ColorTokens.error[500],
              },
            ]}
          >
            <Square size={18} color={ColorTokens.neutral[0]} fill={ColorTokens.neutral[0]} />
          </TouchableOpacity>
        </Animated.View>
      </Box>
    );
  }

  // Estado com gravação pronta (preview)
  if (recordedUri) {
    return (
      <Box direction="row" align="center" style={{ gap: Spacing['2'], flex: 1 }}>
        {/* Botão cancelar/deletar */}
        <TouchableOpacity
          onPress={handleCancel}
          accessibilityRole="button"
          accessibilityLabel="Descartar gravação"
          style={[
            styles.secondaryButton,
            {
              backgroundColor: isDark ? ColorTokens.neutral[800] : ColorTokens.neutral[100],
              borderColor: isDark ? ColorTokens.neutral[700] : ColorTokens.neutral[200],
            },
          ]}
        >
          <X size={18} color={colors.text.secondary} />
        </TouchableOpacity>

        {/* Preview do áudio */}
        <Box
          flex={1}
          bg={isDark ? 'canvas' : 'elevated'}
          rounded="2xl"
          px="3"
          py="2.5"
          direction="row"
          align="center"
          justify="space-between"
          borderWidth={1}
          borderColor="light"
        >
          {/* Botão play/pause */}
          <TouchableOpacity
            onPress={handlePreviewToggle}
            accessibilityRole="button"
            accessibilityLabel={isPlayingPreview ? 'Pausar preview' : 'Ouvir preview'}
            style={[
              styles.playButton,
              {
                backgroundColor: isDark ? ColorTokens.primary[700] : ColorTokens.primary[500],
              },
            ]}
          >
            {isPlayingPreview ? (
              <Pause size={14} color={ColorTokens.neutral[0]} fill={ColorTokens.neutral[0]} />
            ) : (
              <Play size={14} color={ColorTokens.neutral[0]} fill={ColorTokens.neutral[0]} />
            )}
          </TouchableOpacity>

          {/* Info do áudio */}
          <Box flex={1} style={{ marginLeft: Spacing['2'] }}>
            <Text size="sm" weight="medium" color="primary">
              Mensagem de voz
            </Text>
            <Text size="xs" color="tertiary">
              {formatRecordingTime(recordingDuration)}
            </Text>
          </Box>

          {/* Ícone de áudio */}
          <Mic size={16} color={colors.text.tertiary} />
        </Box>

        {/* Botão enviar */}
        <TouchableOpacity
          onPress={handleSend}
          accessibilityRole="button"
          accessibilityLabel="Enviar mensagem de voz"
          style={[
            styles.mainButton,
            {
              width: config.button,
              height: config.button,
              backgroundColor: colors.primary.main,
            },
          ]}
        >
          <Send size={config.icon - 4} color={ColorTokens.neutral[0]} />
        </TouchableOpacity>
      </Box>
    );
  }

  return null;
}

// ======================
// ESTILOS
// ======================

const styles = StyleSheet.create({
  mainButton: {
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    ...Tokens.shadows.sm,
  },
  secondaryButton: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  playButton: {
    width: 32,
    height: 32,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: ColorTokens.error[500],
    marginRight: 4,
  },
  waveBar: {
    width: 3,
    height: 16,
    borderRadius: 2,
  },
});

export default VoiceInputButton;
