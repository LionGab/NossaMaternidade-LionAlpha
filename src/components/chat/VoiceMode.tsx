/**
 * VoiceMode - Modo de voz fullscreen estilo Claude Mobile
 *
 * Features:
 * - Visualização de waveform animada
 * - Botão central para controle
 * - Transcrição em tempo real (opcional)
 * - Animações fluidas
 */

import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { Mic, MicOff, X, Send, Pause, Play, Trash2, Loader2 } from 'lucide-react-native';
import React, { useEffect, useRef } from 'react';
import { View, TouchableOpacity, StyleSheet, Dimensions, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withRepeat,
  withSequence,
  interpolate,
  Extrapolate,
  FadeIn,
  FadeOut,
  SlideInDown,
  SlideOutDown,
} from 'react-native-reanimated';

import { AudioWaveformLarge } from '@/components/chat/AudioWaveform';
import { Box } from '@/components/primitives/Box';
import { Text } from '@/components/primitives/Text';
import { useVoiceRecording, formatRecordingTime } from '@/hooks/useVoiceRecording';
import { useTheme } from '@/theme';
import { Tokens, ColorTokens } from '@/theme/tokens';

// ======================
// TIPOS
// ======================

export interface VoiceModeProps {
  visible: boolean;
  onClose: () => void;
  onSend: (text: string) => void;
  autoTranscribe?: boolean;
}

const { width: SCREEN_WIDTH, height: _SCREEN_HEIGHT } = Dimensions.get('window');
const Spacing = Tokens.spacing;
const Radius = Tokens.radius;

// Waveform agora usa o componente migrado AudioWaveformLarge

// ======================
// COMPONENTE PRINCIPAL
// ======================

export function VoiceMode({ visible, onClose, onSend, autoTranscribe = true }: VoiceModeProps) {
  const { colors, isDark } = useTheme();

  const {
    isRecording,
    isTranscribing,
    isPlayingPreview,
    recordingDuration,
    recordedUri,
    amplitude,
    transcribedText,
    startRecording,
    stopRecording,
    cancelRecording,
    playPreview,
    stopPreview,
    transcribe,
    clear,
  } = useVoiceRecording({
    maxDuration: 120,
    hapticFeedback: true,
  });

  // Animações
  const buttonScale = useSharedValue(1);
  const pulseScale = useSharedValue(1);
  const rotateAnim = useSharedValue(0);

  // Auto-start recording quando o modal abre
  useEffect(() => {
    if (visible && !isRecording && !recordedUri) {
      const timer = setTimeout(() => {
        startRecording();
      }, 300);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [visible, isRecording, recordedUri, startRecording]);

  // Animação de pulso durante gravação
  useEffect(() => {
    if (isRecording) {
      pulseScale.value = withRepeat(
        withSequence(withTiming(1.1, { duration: 800 }), withTiming(1, { duration: 800 })),
        -1,
        true
      );
    } else {
      pulseScale.value = withTiming(1, { duration: 200 });
    }
  }, [isRecording, pulseScale]);

  // Animação de loading
  useEffect(() => {
    if (isTranscribing) {
      rotateAnim.value = withRepeat(withTiming(360, { duration: 1000 }), -1, false);
    } else {
      rotateAnim.value = withTiming(0, { duration: 200 });
    }
  }, [isTranscribing, rotateAnim]);

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const pulseAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
    opacity: interpolate(pulseScale.value, [1, 1.1], [0.3, 0]),
  }));

  const rotateStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotateAnim.value}deg` }],
  }));

  const handleMainButton = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    if (isRecording) {
      await stopRecording();
    } else if (recordedUri) {
      // Preview toggle
      if (isPlayingPreview) {
        await stopPreview();
      } else {
        await playPreview();
      }
    } else {
      await startRecording();
    }
  };

  const handleSend = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    if (autoTranscribe && !transcribedText) {
      const text = await transcribe();
      if (text) {
        onSend(text);
        clear();
        onClose();
      }
    } else if (transcribedText) {
      onSend(transcribedText);
      clear();
      onClose();
    }
  };

  const handleCancel = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await cancelRecording();
    clear();
    onClose();
  };

  const handleDiscard = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    clear();
  };

  if (!visible) return null;

  return (
    <Animated.View
      entering={FadeIn.duration(200)}
      exiting={FadeOut.duration(200)}
      style={[StyleSheet.absoluteFill, styles.overlay]}
    >
      <BlurView
        intensity={isDark ? 40 : 60}
        tint={isDark ? 'dark' : 'light'}
        style={StyleSheet.absoluteFill}
      />

      {/* Background gradient */}
      <LinearGradient
        colors={
          isDark
            ? [ColorTokens.neutral[900] + 'CC', ColorTokens.neutral[900] + 'F2']
            : [ColorTokens.neutral[0] + 'E6', ColorTokens.neutral[0] + 'F2']
        }
        style={StyleSheet.absoluteFill}
      />

      {/* Content */}
      <Animated.View
        entering={SlideInDown.duration(300).springify()}
        exiting={SlideOutDown.duration(200)}
        style={styles.content}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={handleCancel}
            style={[
              styles.closeButton,
              {
                backgroundColor: isDark ? ColorTokens.neutral[800] : ColorTokens.neutral[100],
              },
            ]}
            accessibilityRole="button"
            accessibilityLabel="Fechar modo de voz"
          >
            <X size={24} color={colors.text.secondary} />
          </TouchableOpacity>

          <Text size="lg" weight="bold" color="primary">
            {isRecording ? 'Gravando' : recordedUri ? 'Preview' : 'Modo Voz'}
          </Text>

          <View style={{ width: 44 }} />
        </View>

        {/* Main content */}
        <View style={styles.mainContent}>
          {/* Status text */}
          <View style={styles.statusContainer}>
            {isTranscribing ? (
              <Box direction="row" align="center" gap="2">
                <Animated.View style={rotateStyle}>
                  <Loader2 size={18} color={colors.primary.main} />
                </Animated.View>
                <Text color="secondary" size="md">
                  Transcrevendo...
                </Text>
              </Box>
            ) : transcribedText ? (
              <View style={styles.transcribedTextContainer}>
                <Text color="primary" size="lg" align="center" style={{ lineHeight: 28 }}>
                  "{transcribedText}"
                </Text>
              </View>
            ) : (
              <Text color="tertiary" size="md">
                {isRecording
                  ? 'Fale sua mensagem...'
                  : recordedUri
                    ? 'Toque para ouvir'
                    : 'Toque para gravar'}
              </Text>
            )}
          </View>

          {/* Waveform - Usando componente migrado */}
          <AudioWaveformLarge
            state={isRecording ? 'recording' : recordedUri && isPlayingPreview ? 'playing' : 'idle'}
          />

          {/* Duration */}
          <Text size="3xl" weight="bold" color="primary" style={styles.duration}>
            {formatRecordingTime(recordingDuration)}
          </Text>

          {/* Main button */}
          <View style={styles.buttonContainer}>
            {/* Pulse effect */}
            {isRecording && (
              <Animated.View
                style={[
                  styles.pulseRing,
                  pulseAnimatedStyle,
                  { borderColor: ColorTokens.error[500] },
                ]}
              />
            )}

            <Animated.View style={buttonAnimatedStyle}>
              <Pressable
                onPress={handleMainButton}
                onPressIn={() => {
                  buttonScale.value = withSpring(0.9);
                }}
                onPressOut={() => {
                  buttonScale.value = withSpring(1);
                }}
                style={[
                  styles.mainButton,
                  {
                    backgroundColor: isRecording
                      ? ColorTokens.error[500]
                      : recordedUri
                        ? colors.primary.main
                        : isDark
                          ? ColorTokens.neutral[800]
                          : ColorTokens.neutral[100],
                    borderColor: isRecording
                      ? ColorTokens.error[400]
                      : recordedUri
                        ? colors.primary.light
                        : isDark
                          ? ColorTokens.neutral[700]
                          : ColorTokens.neutral[200],
                  },
                ]}
                accessibilityRole="button"
                accessibilityLabel={
                  isRecording
                    ? 'Parar gravação'
                    : recordedUri
                      ? isPlayingPreview
                        ? 'Pausar'
                        : 'Reproduzir'
                      : 'Iniciar gravação'
                }
              >
                {isRecording ? (
                  <MicOff size={36} color={ColorTokens.neutral[0]} />
                ) : recordedUri ? (
                  isPlayingPreview ? (
                    <Pause size={36} color={ColorTokens.neutral[0]} />
                  ) : (
                    <Play size={36} color={ColorTokens.neutral[0]} />
                  )
                ) : (
                  <Mic size={36} color={colors.text.primary} />
                )}
              </Pressable>
            </Animated.View>
          </View>
        </View>

        {/* Footer actions */}
        <View style={styles.footer}>
          {recordedUri && !isRecording && (
            <>
              {/* Discard button */}
              <TouchableOpacity
                onPress={handleDiscard}
                style={[
                  styles.footerButton,
                  {
                    backgroundColor: isDark ? ColorTokens.neutral[800] : ColorTokens.neutral[100],
                  },
                ]}
                accessibilityRole="button"
                accessibilityLabel="Descartar gravação"
              >
                <Trash2 size={22} color={ColorTokens.error[500]} />
                <Text color="error" size="sm" weight="medium" style={{ marginTop: 4 }}>
                  Descartar
                </Text>
              </TouchableOpacity>

              {/* Send button */}
              <TouchableOpacity
                onPress={handleSend}
                disabled={isTranscribing}
                style={[
                  styles.footerButton,
                  styles.sendFooterButton,
                  { backgroundColor: colors.primary.main },
                ]}
                accessibilityRole="button"
                accessibilityLabel="Enviar mensagem de voz"
              >
                <Send size={22} color={ColorTokens.neutral[0]} />
                <Text
                  style={{ color: ColorTokens.neutral[0], marginTop: 4 }}
                  size="sm"
                  weight="medium"
                >
                  Enviar
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </Animated.View>
    </Animated.View>
  );
}

// ======================
// ESTILOS
// ======================

const styles = StyleSheet.create({
  overlay: {
    zIndex: 1000,
  },
  content: {
    flex: 1,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing['4'],
    paddingBottom: Spacing['4'],
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing['6'],
  },
  statusContainer: {
    marginBottom: Spacing['8'],
    paddingHorizontal: Spacing['4'],
  },
  transcribedTextContainer: {
    maxWidth: 300,
    paddingHorizontal: Spacing['4'],
  },
  duration: {
    marginBottom: Spacing['8'],
    fontVariant: ['tabular-nums'],
  },
  buttonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseRing: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
  },
  mainButton: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    ...Tokens.shadows.lg,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing['4'],
    paddingHorizontal: Spacing['6'],
    paddingTop: Spacing['4'],
  },
  footerButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing['3'],
    paddingHorizontal: Spacing['6'],
    borderRadius: Radius.xl,
    minWidth: 100,
  },
  sendFooterButton: {
    ...Tokens.shadows.md,
  },
});

export default VoiceMode;
