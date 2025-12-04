/**
 * ChatBubble - Primitivo para mensagens de chat
 *
 * Design System compliant com tokens centralizados e acessibilidade WCAG AAA.
 *
 * Features:
 * - Suporte a reações (útil/não útil)
 * - Tokens centralizados de cores e spacing
 * - Animações suaves com Reanimated
 * - Acessibilidade completa
 * - Avatar com status online
 *
 * @example
 * <ChatBubble
 *   role="user"
 *   content="Oi NathIA!"
 *   timestamp="2025-12-02T10:30:00Z"
 *   avatar="https://..."
 *   onReaction={(type) => console.log(type)}
 * />
 */

import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { ThumbsUp, ThumbsDown } from 'lucide-react-native';
import React from 'react';
import { View, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import Animated, { Layout, SlideInDown, SlideInUp } from 'react-native-reanimated';

import { useTheme } from '@/theme';
import { Tokens, ColorTokens } from '@/theme/tokens';
import { logger } from '@/utils/logger';

import { Box } from './Box';
import { Text } from './Text';

export interface ChatBubbleProps {
  /** Papel do remetente */
  role: 'user' | 'assistant';
  /** Conteúdo da mensagem */
  content: string;
  /** Timestamp ISO 8601 */
  timestamp: string;
  /** URL do avatar (apenas para assistant) */
  avatar?: string;
  /** Se é a mensagem mais recente */
  isLatest?: boolean;
  /** Callback ao reagir à mensagem */
  onReaction?: (type: 'helpful' | 'not-helpful') => void;
  /** Índice da mensagem (para animação) */
  index?: number;
  /** Estilo customizado */
  style?: ViewStyle;
}

export const ChatBubble: React.FC<ChatBubbleProps> = React.memo(
  ({ role, content, timestamp, avatar, isLatest = false, onReaction, index = 0, style }) => {
    const { colors, isDark } = useTheme();
    const isUser = role === 'user';

    // Animação de entrada baseada no role
    const entering = isUser
      ? SlideInDown.duration(300).springify()
      : SlideInUp.duration(300).springify();

    // Handler de reação
    const handleReaction = (type: 'helpful' | 'not-helpful') => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      logger.info('Chat bubble reaction', { type, messageIndex: index });
      onReaction?.(type);
    };

    // Formatar timestamp
    const formattedTime = new Date(timestamp).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });

    return (
      <Animated.View
        entering={entering}
        layout={Layout.springify()}
        style={[styles.container, { justifyContent: isUser ? 'flex-end' : 'flex-start' }, style]}
        accessible={true}
        accessibilityRole="text"
        accessibilityLabel={isUser ? `Você disse: ${content}` : `NathIA respondeu: ${content}`}
        accessibilityHint={isUser ? 'Sua mensagem' : 'Resposta da NathIA'}
      >
        {/* Avatar (apenas IA) */}
        {!isUser && avatar && (
          <View style={styles.avatarContainer}>
            <Image
              source={{ uri: avatar }}
              style={styles.avatar}
              contentFit="cover"
              transition={200}
            />
            {isLatest && (
              <View style={[styles.onlineDot, { backgroundColor: colors.status.success }]} />
            )}
          </View>
        )}

        {/* Bubble */}
        <View
          style={[
            styles.bubble,
            {
              backgroundColor: isUser
                ? colors.primary.main
                : Tokens.colors.chat.aiBubble.bg[isDark ? 'dark' : 'light'],
              borderColor: isUser
                ? 'transparent'
                : Tokens.colors.chat.aiBubble.border[isDark ? 'dark' : 'light'],
              borderBottomRightRadius: isUser ? Tokens.radius.sm : Tokens.radius.xl,
              borderBottomLeftRadius: isUser ? Tokens.radius.xl : Tokens.radius.sm,
            },
          ]}
        >
          {/* Conteúdo */}
          <Text
            style={{
              color: isUser ? colors.text.inverse : colors.text.primary,
              ...Tokens.textStyles.bodyMedium,
            }}
          >
            {content}
          </Text>

          {/* Timestamp */}
          <Text
            size="xs"
            style={{
              marginTop: Tokens.spacing['1'],
              color: isUser
                ? Tokens.colors.chat.timestamp.text.light
                : Tokens.colors.chat.timestamp.text[isDark ? 'dark' : 'light'],
              opacity: 0.9, // WCAG AAA: Contraste melhorado
            }}
          >
            {formattedTime}
          </Text>

          {/* Reações (apenas IA + latest) */}
          {!isUser && isLatest && onReaction && (
            <Box direction="row" mt="2" gap="2">
              <TouchableOpacity
                onPress={() => handleReaction('helpful')}
                style={[
                  styles.reactionButton,
                  { backgroundColor: isDark ? ColorTokens.neutral[800] : ColorTokens.neutral[100] },
                ]}
                accessibilityRole="button"
                accessibilityLabel="Marcar como útil"
                accessibilityHint="Toque duas vezes para indicar que esta resposta foi útil"
              >
                <ThumbsUp size={14} color={colors.text.secondary} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleReaction('not-helpful')}
                style={[
                  styles.reactionButton,
                  { backgroundColor: isDark ? ColorTokens.neutral[800] : ColorTokens.neutral[100] },
                ]}
                accessibilityRole="button"
                accessibilityLabel="Marcar como não útil"
                accessibilityHint="Toque duas vezes para indicar que esta resposta não foi útil"
              >
                <ThumbsDown size={14} color={colors.text.secondary} />
              </TouchableOpacity>
            </Box>
          )}
        </View>
      </Animated.View>
    );
  }
);

ChatBubble.displayName = 'ChatBubble';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginBottom: Tokens.spacing['3'],
    paddingHorizontal: Tokens.spacing['2'],
  },
  avatarContainer: {
    position: 'relative',
    marginRight: Tokens.spacing['2'],
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  onlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: ColorTokens.neutral[0],
  },
  bubble: {
    maxWidth: '80%',
    padding: Tokens.spacing['3'],
    borderRadius: Tokens.radius.xl,
    borderWidth: 1,
  },
  reactionButton: {
    width: Tokens.touchTargets.min,
    height: Tokens.touchTargets.min,
    borderRadius: Tokens.radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default ChatBubble;
