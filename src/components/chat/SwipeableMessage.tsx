/**
 * SwipeableMessage - Mensagem com gestos de swipe
 * 
 * Features:
 * - Swipe left → deletar (mensagens do usuário)
 * - Swipe right → responder (mensagens da NathIA)
 * - Animações suaves
 * - Acessibilidade WCAG AAA
 */

import * as Haptics from 'expo-haptics';
import { Trash2, Reply } from 'lucide-react-native';
import React, { useRef, useState } from 'react';
import { View, PanResponder, TouchableOpacity } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';

import { useTheme } from '@/theme';
import { Tokens, ColorTokens } from '@/theme/tokens';
import { logger } from '@/utils/logger';

import { ChatBubble, ChatBubbleProps } from '@/components/primitives/ChatBubble';

const SWIPE_THRESHOLD = 60;
const SWIPE_VELOCITY_THRESHOLD = 0.5;

export interface SwipeableMessageProps extends ChatBubbleProps {
  /** Callback ao deletar (swipe left) */
  onDelete?: () => void;
  /** Callback ao responder (swipe right) */
  onReply?: () => void;
  /** Se está desabilitado */
  disabled?: boolean;
}

export const SwipeableMessage: React.FC<SwipeableMessageProps> = React.memo(
  ({ onDelete, onReply, disabled = false, role, ...bubbleProps }) => {
    const translateX = useSharedValue(0);

    const panResponder = useRef(
      PanResponder.create({
        onStartShouldSetPanResponder: () => !disabled,
        onMoveShouldSetPanResponder: (_, gestureState) => {
          return Math.abs(gestureState.dx) > 10;
        },
        onPanResponderGrant: () => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        },
        onPanResponderMove: (_, gestureState) => {
          // Limitar movimento baseado no role
          if (role === 'user' && gestureState.dx < 0) {
            // Swipe left para deletar (usuário)
            translateX.value = Math.max(gestureState.dx, -120);
          } else if (role === 'assistant' && gestureState.dx > 0) {
            // Swipe right para responder (NathIA)
            translateX.value = Math.min(gestureState.dx, 120);
          }
        },
        onPanResponderRelease: (_, gestureState) => {
          const shouldTrigger = Math.abs(gestureState.dx) > SWIPE_THRESHOLD ||
            Math.abs(gestureState.vx || 0) > SWIPE_VELOCITY_THRESHOLD;

          if (shouldTrigger) {
            if (role === 'user' && gestureState.dx < 0 && onDelete) {
              // Swipe left → deletar
              runOnJS(handleDelete)();
            } else if (role === 'assistant' && gestureState.dx > 0 && onReply) {
              // Swipe right → responder
              runOnJS(handleReply)();
            } else {
              // Reset
              translateX.value = withSpring(0);
            }
          } else {
            // Reset se não atingiu threshold
            translateX.value = withSpring(0);
          }
        },
      })
    ).current;

    const handleDelete = () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      logger.info('[SwipeableMessage] Delete triggered', { messageId: bubbleProps.timestamp });
      onDelete?.();
      translateX.value = withSpring(0);
    };

    const handleReply = () => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      logger.info('[SwipeableMessage] Reply triggered', { messageId: bubbleProps.timestamp });
      onReply?.();
      translateX.value = withSpring(0);
    };

    const animatedStyle = useAnimatedStyle(() => {
      const opacity = interpolate(
        Math.abs(translateX.value),
        [0, SWIPE_THRESHOLD],
        [0, 1],
        Extrapolate.CLAMP
      );

      return {
        transform: [{ translateX: translateX.value }],
        opacity: 1 - opacity * 0.3, // Leve fade ao fazer swipe
      };
    });

    const actionStyle = useAnimatedStyle(() => {
      const opacity = interpolate(
        Math.abs(translateX.value),
        [0, SWIPE_THRESHOLD],
        [0, 1],
        Extrapolate.CLAMP
      );

      return {
        opacity,
      };
    });

    const getActionButton = () => {
      if (role === 'user' && onDelete) {
        return (
          <Animated.View
            style={[
              {
                position: 'absolute',
                right: 0,
                top: 0,
                bottom: 0,
                justifyContent: 'center',
                alignItems: 'center',
                width: 80,
                paddingRight: Tokens.spacing['4'],
              },
              actionStyle,
            ]}
          >
            <TouchableOpacity
              onPress={handleDelete}
              style={{
                width: 56,
                height: 56,
                borderRadius: 28,
                backgroundColor: ColorTokens.error[500],
                justifyContent: 'center',
                alignItems: 'center',
                ...Tokens.shadows.md,
              }}
              accessibilityRole="button"
              accessibilityLabel="Deletar mensagem"
            >
              <Trash2 size={20} color={ColorTokens.neutral[0]} />
            </TouchableOpacity>
          </Animated.View>
        );
      }

      if (role === 'assistant' && onReply) {
        return (
          <Animated.View
            style={[
              {
                position: 'absolute',
                left: 0,
                top: 0,
                bottom: 0,
                justifyContent: 'center',
                alignItems: 'center',
                width: 80,
                paddingLeft: Tokens.spacing['4'],
              },
              actionStyle,
            ]}
          >
            <TouchableOpacity
              onPress={handleReply}
              style={{
                width: 56,
                height: 56,
                borderRadius: 28,
                backgroundColor: ColorTokens.primary[500],
                justifyContent: 'center',
                alignItems: 'center',
                ...Tokens.shadows.md,
              }}
              accessibilityRole="button"
              accessibilityLabel="Responder a esta mensagem"
            >
              <Reply size={20} color={ColorTokens.neutral[0]} />
            </TouchableOpacity>
          </Animated.View>
        );
      }

      return null;
    };

    return (
      <View style={{ position: 'relative', marginBottom: Tokens.spacing['3'] }}>
        {getActionButton()}
        <Animated.View style={animatedStyle} {...panResponder.panHandlers}>
          <ChatBubble role={role} {...bubbleProps} />
        </Animated.View>
      </View>
    );
  }
);

SwipeableMessage.displayName = 'SwipeableMessage';

