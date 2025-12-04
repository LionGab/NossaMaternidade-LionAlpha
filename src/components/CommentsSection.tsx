/**
 * CommentsSection Component
 * Seção de comentários com suporte a tema
 */

import { Ionicons } from '@expo/vector-icons';
import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useThemeColors, type ThemeColors } from '@/theme';
import { Tokens } from '@/theme/tokens';

import { CommentItem } from './CommentItem';
import { useHaptics } from '../hooks/useHaptics';
import { Comment } from '../types/comments';
import { logger } from '../utils/logger';

interface CommentsSectionProps {
  comments: Comment[];
  totalComments: number;
  onClose: () => void;
  onAddComment?: (content: string) => void;
}

export const CommentsSection: React.FC<CommentsSectionProps> = ({
  comments,
  totalComments,
  onClose,
  onAddComment,
}) => {
  const colors = useThemeColors();
  const [newComment, setNewComment] = useState('');
  const haptics = useHaptics();

  const styles = useMemo(() => createStyles(colors), [colors]);

  const handleLike = (commentId: string) => {
    // Implementar lógica de like
    logger.debug('[CommentsSection] Like comment', { commentId });
  };

  const handleReply = (commentId: string) => {
    haptics.light();
    // Implementar lógica de reply
    logger.debug('[CommentsSection] Reply to comment', { commentId });
  };

  const handleSendComment = () => {
    if (newComment.trim()) {
      haptics.medium();
      onAddComment?.(newComment.trim());
      setNewComment('');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Comentários ({totalComments})</Text>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Fechar comentários"
          accessibilityHint="Fecha a tela de comentários e retorna à visualização anterior"
          onPress={onClose}
          style={styles.closeButton}
        >
          <Ionicons name="close" size={24} color={colors.text.primary} />
        </TouchableOpacity>
      </View>

      {/* Comments List */}
      <ScrollView
        style={styles.commentsList}
        contentContainerStyle={styles.commentsContent}
        showsVerticalScrollIndicator={false}
      >
        {comments.map((comment) => (
          <CommentItem
            key={comment.id}
            comment={comment}
            onLike={handleLike}
            onReply={handleReply}
          />
        ))}

        {/* Load More */}
        {totalComments > comments.length && (
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Carregar mais comentários"
            accessibilityHint={`Carrega mais ${totalComments - comments.length} comentários restantes`}
            style={styles.loadMoreButton}
          >
            <Text style={styles.loadMoreText}>
              Ver mais {totalComments - comments.length} comentários
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Input Area */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.inputContainer}
      >
        <View style={styles.inputWrapper}>
          <TextInput
            accessibilityLabel="Campo de comentário"
            accessibilityHint="Digite sua mensagem para compartilhar com outras mães. Máximo de 500 caracteres"
            style={styles.input}
            placeholder="Compartilhe seu momento, mãe..."
            placeholderTextColor={colors.text.tertiary}
            value={newComment}
            onChangeText={setNewComment}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Enviar comentário"
            accessibilityHint={
              newComment.trim()
                ? 'Envia seu comentário para a comunidade'
                : 'Botão desabilitado. Digite uma mensagem para habilitar'
            }
            style={[styles.sendButton, !newComment.trim() && styles.sendButtonDisabled]}
            onPress={handleSendComment}
            disabled={!newComment.trim()}
          >
            <Ionicons
              name="send"
              size={20}
              color={newComment.trim() ? colors.primary.main : colors.text.tertiary}
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background.canvas,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: Tokens.spacing['5'],
      paddingVertical: Tokens.spacing['4'],
      borderBottomWidth: 1,
      borderBottomColor: colors.border.light,
    },
    headerTitle: {
      fontSize: Tokens.typography.sizes.xl,
      fontWeight: Tokens.typography.weights.bold,
      color: colors.text.primary,
    },
    closeButton: {
      padding: Tokens.spacing['1'],
      minWidth: Tokens.touchTargets.min,
      minHeight: Tokens.touchTargets.min,
      alignItems: 'center',
      justifyContent: 'center',
    },
    commentsList: {
      flex: 1,
    },
    commentsContent: {
      padding: Tokens.spacing['5'],
      paddingBottom: 100,
    },
    loadMoreButton: {
      padding: Tokens.spacing['4'],
      alignItems: 'center',
      marginTop: Tokens.spacing['2'],
      minHeight: Tokens.touchTargets.min,
      justifyContent: 'center',
    },
    loadMoreText: {
      fontSize: Tokens.typography.sizes.sm,
      fontWeight: Tokens.typography.weights.semibold,
      color: colors.primary.main,
    },
    inputContainer: {
      borderTopWidth: 1,
      borderTopColor: colors.border.light,
      paddingHorizontal: Tokens.spacing['5'],
      paddingVertical: Tokens.spacing['3'],
      backgroundColor: colors.background.canvas,
    },
    inputWrapper: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      gap: Tokens.spacing['3'],
    },
    input: {
      flex: 1,
      minHeight: Tokens.touchTargets.min,
      maxHeight: 100,
      backgroundColor: colors.background.card,
      borderRadius: Tokens.radius['2xl'],
      paddingHorizontal: Tokens.spacing['4'],
      paddingVertical: Tokens.spacing['3'],
      fontSize: Tokens.typography.sizes.base - 1,
      color: colors.text.primary,
      textAlignVertical: 'top',
    },
    sendButton: {
      width: Tokens.touchTargets.min,
      height: Tokens.touchTargets.min,
      borderRadius: Tokens.radius['2xl'],
      backgroundColor: colors.background.card,
      alignItems: 'center',
      justifyContent: 'center',
    },
    sendButtonDisabled: {
      opacity: 0.5,
    },
  });

export default CommentsSection;
