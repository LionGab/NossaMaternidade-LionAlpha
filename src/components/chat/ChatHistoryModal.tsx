/**
 * ChatHistoryModal - Modal de histórico de conversas
 * 
 * Features:
 * - Lista de conversas anteriores
 * - Abrir conversa existente
 * - Deletar conversa
 * - Design igual ao web
 */

import * as Haptics from 'expo-haptics';
import { X, MessageCircle } from 'lucide-react-native';
import React, { useState, useCallback } from 'react';
import { Modal, View, TouchableOpacity, FlatList, Alert, ActivityIndicator } from 'react-native';
import Animated, { FadeIn, FadeOut, SlideInDown, SlideOutDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/theme';
import { Tokens, ColorTokens } from '@/theme/tokens';
import { logger } from '@/utils/logger';
import { chatService, type ChatConversation } from '@/services/chatService';

import { Box } from '@/components/primitives/Box';
import { Text } from '@/components/primitives/Text';
import { Avatar } from '@/components/Avatar';

const AVATAR_URL = 'https://i.imgur.com/oB9ewPG.jpg';

export interface ChatHistoryModalProps {
  /** Se o modal está visível */
  visible: boolean;
  /** Callback ao fechar */
  onClose: () => void;
  /** Callback ao abrir conversa */
  onOpenConversation: (conversationId: string) => void;
}

export const ChatHistoryModal: React.FC<ChatHistoryModalProps> = React.memo(
  ({ visible, onClose, onOpenConversation }) => {
    const { colors, isDark } = useTheme();
    const insets = useSafeAreaInsets();
    const [conversations, setConversations] = useState<ChatConversation[]>([]);
    const [loading, setLoading] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    // Carregar conversas
    const loadConversations = useCallback(async () => {
      if (!visible) return;

      setLoading(true);
      try {
        const data = await chatService.getConversations();
        setConversations(data || []);
        logger.info('[ChatHistoryModal] Conversas carregadas', { count: data?.length || 0 });
      } catch (error) {
        logger.error('[ChatHistoryModal] Erro ao carregar conversas', error);
      } finally {
        setLoading(false);
      }
    }, [visible]);

    React.useEffect(() => {
      if (visible) {
        loadConversations();
      }
    }, [visible, loadConversations]);

    // Deletar conversa
    const handleDelete = useCallback(
      async (conversationId: string) => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);

        Alert.alert(
          'Deletar conversa?',
          'Esta ação não pode ser desfeita.',
          [
            { text: 'Cancelar', style: 'cancel' },
            {
              text: 'Deletar',
              style: 'destructive',
              onPress: async () => {
                setDeletingId(conversationId);
                try {
                  const success = await chatService.deleteConversation(conversationId);
                  if (success) {
                    setConversations((prev) => prev.filter((c) => c.id !== conversationId));
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                    logger.info('[ChatHistoryModal] Conversa deletada', { conversationId });
                  } else {
                    Alert.alert('Erro', 'Não foi possível deletar a conversa.');
                  }
                } catch (error) {
                  logger.error('[ChatHistoryModal] Erro ao deletar conversa', error);
                  Alert.alert('Erro', 'Não foi possível deletar a conversa.');
                } finally {
                  setDeletingId(null);
                }
              },
            },
          ]
        );
      },
      []
    );

    // Abrir conversa
    const handleOpenConversation = useCallback(
      (conversationId: string) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onOpenConversation(conversationId);
        onClose();
      },
      [onOpenConversation, onClose]
    );

    // Render item
    const renderItem = useCallback(
      ({ item }: { item: ChatConversation }) => {
        const preview = item.last_message?.content || 'Nova conversa';
        const truncatedPreview = preview.length > 60 ? `${preview.slice(0, 60)}...` : preview;
        const isDeleting = deletingId === item.id;

        return (
          <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut.duration(150)}>
            <TouchableOpacity
              onPress={() => handleOpenConversation(item.id)}
              onLongPress={() => handleDelete(item.id)}
              activeOpacity={0.7}
              disabled={isDeleting}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                padding: Tokens.spacing['4'],
                marginBottom: Tokens.spacing['2'],
                backgroundColor: colors.background.card,
                borderRadius: Tokens.radius.xl,
                borderWidth: 1,
                borderColor: colors.border.light,
                opacity: isDeleting ? 0.5 : 1,
              }}
              accessibilityRole="button"
              accessibilityLabel={`Conversa: ${item.title || 'Nova conversa'}`}
              accessibilityHint="Toque para abrir, segure para deletar"
            >
              <Avatar
                size={48}
                source={{ uri: AVATAR_URL }}
                fallback="N"
                borderWidth={0}
                style={{ marginRight: Tokens.spacing['3'] }}
              />
              <View style={{ flex: 1 }}>
                <Text size="sm" weight="semibold" style={{ marginBottom: Tokens.spacing['1'] }}>
                  {item.title || 'Nova conversa'}
                </Text>
                <Text size="xs" color="tertiary" numberOfLines={1}>
                  {truncatedPreview}
                </Text>
                {item.updated_at && (
                  <Text size="xs" color="tertiary" style={{ marginTop: Tokens.spacing['0.5'] }}>
                    {new Date(item.updated_at).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                )}
              </View>
              {isDeleting ? (
                <ActivityIndicator size="small" color={colors.text.tertiary} />
              ) : (
                <MessageCircle size={16} color={colors.text.tertiary} />
              )}
            </TouchableOpacity>
          </Animated.View>
        );
      },
      [colors, deletingId, handleOpenConversation, handleDelete]
    );

    const keyExtractor = useCallback((item: ChatConversation) => item.id, []);

    return (
      <Modal
        visible={visible}
        transparent
        animationType="none"
        onRequestClose={onClose}
        statusBarTranslucent
      >
        <Animated.View
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(150)}
          style={{
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'flex-end',
          }}
        >
          <TouchableOpacity
            style={{ flex: 1 }}
            activeOpacity={1}
            onPress={onClose}
          />
          <Animated.View
            entering={SlideInDown.duration(300).springify()}
            exiting={SlideOutDown.duration(200)}
            style={{
              backgroundColor: colors.background.canvas,
              borderTopLeftRadius: Tokens.radius['3xl'],
              borderTopRightRadius: Tokens.radius['3xl'],
              maxHeight: '80%',
              paddingTop: insets.top + Tokens.spacing['4'],
              paddingBottom: insets.bottom + Tokens.spacing['4'],
            }}
          >
            {/* Header */}
            <Box
              direction="row"
              align="center"
              justify="space-between"
              p="4"
              style={{
                borderBottomWidth: 1,
                borderBottomColor: colors.border.light,
              }}
            >
              <Text size="lg" weight="bold">
                Histórico de Conversas
              </Text>
              <TouchableOpacity
                onPress={onClose}
                style={{
                  width: Tokens.touchTargets.min,
                  height: Tokens.touchTargets.min,
                  borderRadius: Tokens.radius.full,
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: isDark ? ColorTokens.neutral[800] : ColorTokens.neutral[100],
                }}
                accessibilityRole="button"
                accessibilityLabel="Fechar"
              >
                <X size={20} color={colors.text.primary} />
              </TouchableOpacity>
            </Box>

            {/* Lista */}
            {loading ? (
              <Box p="8" align="center">
                <ActivityIndicator size="large" color={colors.primary.main} />
                <Text size="sm" color="tertiary" style={{ marginTop: Tokens.spacing['4'] }}>
                  Carregando conversas...
                </Text>
              </Box>
            ) : conversations.length === 0 ? (
              <Box p="8" align="center">
                <MessageCircle size={48} color={colors.text.tertiary} />
                <Text size="md" color="tertiary" style={{ marginTop: Tokens.spacing['4'] }}>
                  Nenhuma conversa ainda
                </Text>
                <Text size="sm" color="tertiary" style={{ marginTop: Tokens.spacing['2'] }}>
                  Comece a conversar! 💬
                </Text>
              </Box>
            ) : (
              <FlatList
                data={conversations}
                renderItem={renderItem}
                keyExtractor={keyExtractor}
                contentContainerStyle={{
                  padding: Tokens.spacing['4'],
                }}
                showsVerticalScrollIndicator={false}
              />
            )}
          </Animated.View>
        </Animated.View>
      </Modal>
    );
  }
);

ChatHistoryModal.displayName = 'ChatHistoryModal';

