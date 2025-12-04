/**
 * ChatInputBar - Input estilo Claude Mobile (Dezembro 2025)
 *
 * Design minimalista com:
 * - Input de texto expansível
 * - Botão de voz/enviar contextual
 * - Transições suaves
 * - Acessibilidade completa
 */

import * as Haptics from 'expo-haptics';
import { Mic, Send, Paperclip, StopCircle } from 'lucide-react-native';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  Extrapolate,
  FadeIn,
  FadeOut,
} from 'react-native-reanimated';

import { Text } from '@/components/primitives/Text';
import { useTheme } from '@/theme';
import { Tokens, ColorTokens } from '@/theme/tokens';

// ======================
// TIPOS
// ======================

export interface ChatInputBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  onVoicePress: () => void;
  onAttachPress?: () => void;
  onCameraPress?: () => void;
  placeholder?: string;
  disabled?: boolean;
  isRecording?: boolean;
  recordingDuration?: number;
  onStopRecording?: () => void;
}

const Spacing = Tokens.spacing;
const Radius = Tokens.radius;

// ======================
// COMPONENTE PRINCIPAL
// ======================

export function ChatInputBar({
  value,
  onChangeText,
  onSend,
  onVoicePress,
  onAttachPress,
  onCameraPress: _onCameraPress,
  placeholder = 'Mensagem',
  disabled = false,
  isRecording = false,
  recordingDuration = 0,
  onStopRecording,
}: ChatInputBarProps) {
  const { colors, isDark } = useTheme();
  const inputRef = useRef<TextInput>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [inputHeight, setInputHeight] = useState(44);

  // Animações
  const sendButtonScale = useSharedValue(0);
  const micButtonScale = useSharedValue(1);
  const containerScale = useSharedValue(1);
  const borderWidth = useSharedValue(1);

  const hasText = value.trim().length > 0;

  // Atualizar animações baseado no texto
  useEffect(() => {
    if (hasText) {
      sendButtonScale.value = withSpring(1, { damping: 15, stiffness: 200 });
      micButtonScale.value = withSpring(0, { damping: 15, stiffness: 200 });
    } else {
      sendButtonScale.value = withSpring(0, { damping: 15, stiffness: 200 });
      micButtonScale.value = withSpring(1, { damping: 15, stiffness: 200 });
    }
  }, [hasText, sendButtonScale, micButtonScale]);

  // Animação do foco
  useEffect(() => {
    borderWidth.value = withTiming(isFocused ? 2 : 1, { duration: 150 });
  }, [isFocused, borderWidth]);

  // Estilos animados
  const sendButtonStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: sendButtonScale.value },
      { translateX: interpolate(sendButtonScale.value, [0, 1], [20, 0], Extrapolate.CLAMP) },
    ],
    opacity: sendButtonScale.value,
  }));

  const micButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: micButtonScale.value }],
    opacity: micButtonScale.value,
  }));

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: containerScale.value }],
    borderWidth: borderWidth.value,
  }));

  const handlePressIn = () => {
    containerScale.value = withSpring(0.98, { damping: 15 });
  };

  const handlePressOut = () => {
    containerScale.value = withSpring(1, { damping: 15 });
  };

  const handleSend = useCallback(() => {
    if (hasText && !disabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onSend();
    }
  }, [hasText, disabled, onSend]);

  const handleVoice = useCallback(() => {
    if (!disabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onVoicePress();
    }
  }, [disabled, onVoicePress]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Estado de gravação
  if (isRecording) {
    return (
      <Animated.View
        entering={FadeIn.duration(200)}
        exiting={FadeOut.duration(200)}
        style={[
          styles.container,
          styles.recordingContainer,
          {
            backgroundColor: isDark ? ColorTokens.error[900] + 'E6' : ColorTokens.error[50] + 'F2',
            borderColor: ColorTokens.error[500],
          },
        ]}
      >
        <View style={styles.recordingContent}>
          {/* Indicador de gravação */}
          <View style={styles.recordingIndicator}>
            <Animated.View
              style={[styles.recordingDot, { backgroundColor: ColorTokens.error[500] }]}
            />
            <Text color="error" weight="bold" size="md">
              {formatDuration(recordingDuration)}
            </Text>
          </View>

          {/* Texto */}
          <Text color="secondary" size="sm" style={{ flex: 1, marginLeft: Spacing['3'] }}>
            Gravando...
          </Text>

          {/* Botão parar */}
          <TouchableOpacity
            onPress={onStopRecording}
            style={[styles.stopButton, { backgroundColor: ColorTokens.error[500] }]}
            accessibilityRole="button"
            accessibilityLabel="Parar gravação"
          >
            <StopCircle size={24} color={ColorTokens.neutral[0]} />
          </TouchableOpacity>
        </View>
      </Animated.View>
    );
  }

  return (
    <Animated.View
      style={[
        styles.container,
        containerStyle,
        {
          backgroundColor: isDark ? ColorTokens.neutral[900] + 'E6' : ColorTokens.neutral[0] + 'F2',
          borderColor: isFocused
            ? colors.primary.main
            : isDark
              ? ColorTokens.neutral[700]
              : ColorTokens.neutral[200],
        },
      ]}
    >
      {/* Ações à esquerda */}
      <View style={styles.leftActions}>
        {onAttachPress && (
          <TouchableOpacity
            onPress={onAttachPress}
            style={styles.iconButton}
            accessibilityRole="button"
            accessibilityLabel="Anexar arquivo"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Paperclip size={20} color={colors.text.tertiary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Input de texto */}
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.text.tertiary}
        multiline
        maxLength={2000}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onContentSizeChange={(e) => {
          const height = Math.min(Math.max(44, e.nativeEvent.contentSize.height), 120);
          setInputHeight(height);
        }}
        style={[
          styles.input,
          {
            color: colors.text.primary,
            height: inputHeight,
          },
        ]}
        editable={!disabled}
        accessibilityLabel="Campo de mensagem"
        accessibilityHint="Digite sua mensagem"
      />

      {/* Ações à direita */}
      <View style={styles.rightActions}>
        {/* Botão de mic (quando não tem texto) */}
        <Animated.View style={[styles.actionButtonWrapper, micButtonStyle]}>
          {!hasText && (
            <TouchableOpacity
              onPress={handleVoice}
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
              disabled={disabled}
              style={[
                styles.actionButton,
                {
                  backgroundColor: isDark ? ColorTokens.neutral[800] : ColorTokens.neutral[100],
                },
              ]}
              accessibilityRole="button"
              accessibilityLabel="Gravar áudio"
            >
              <Mic size={20} color={colors.text.secondary} />
            </TouchableOpacity>
          )}
        </Animated.View>

        {/* Botão de enviar (quando tem texto) */}
        <Animated.View
          style={[styles.actionButtonWrapper, sendButtonStyle, styles.sendButtonWrapper]}
        >
          {hasText && (
            <TouchableOpacity
              onPress={handleSend}
              disabled={disabled}
              style={[
                styles.actionButton,
                styles.sendButton,
                { backgroundColor: colors.primary.main },
              ]}
              accessibilityRole="button"
              accessibilityLabel="Enviar mensagem"
            >
              <Send size={18} color={ColorTokens.neutral[0]} />
            </TouchableOpacity>
          )}
        </Animated.View>
      </View>
    </Animated.View>
  );
}

// ======================
// ESTILOS
// ======================

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: Spacing['3'],
    paddingVertical: Spacing['2'],
    borderRadius: Radius['2xl'],
    marginHorizontal: Spacing['4'],
    marginBottom: Platform.OS === 'ios' ? Spacing['2'] : Spacing['4'],
    minHeight: 52,
    ...Tokens.shadows.sm,
  },
  recordingContainer: {
    borderWidth: 2,
    paddingVertical: Spacing['3'],
  },
  recordingContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing['2'],
  },
  recordingDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  stopButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  leftActions: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: Spacing['2'],
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: Spacing['2'],
    position: 'relative',
    height: 44,
    width: 44,
  },
  iconButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.full,
  },
  actionButtonWrapper: {
    position: 'absolute',
    right: 0,
    bottom: 0,
  },
  sendButtonWrapper: {
    zIndex: 2,
  },
  actionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButton: {
    ...Tokens.shadows.md,
  },
  input: {
    flex: 1,
    fontSize: Tokens.typography.sizes.md,
    lineHeight: 22,
    paddingTop: Platform.OS === 'ios' ? 12 : 10,
    paddingBottom: Platform.OS === 'ios' ? 12 : 10,
    textAlignVertical: 'center',
  },
});

export default ChatInputBar;
