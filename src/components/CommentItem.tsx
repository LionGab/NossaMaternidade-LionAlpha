/**
 * CommentItem Component
 * Componente de comentário individual com suporte a tema
 */

import { Ionicons } from '@expo/vector-icons';
import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

import { useThemeColors, type ThemeColors } from '@/theme';
import { Tokens } from '@/theme/tokens';

import { Avatar } from './Avatar';
import { nathAvatar } from '../assets/images';
import { useHaptics } from '../hooks/useHaptics';
import { Comment } from '../types/comments';

interface CommentItemProps {
  comment: Comment;
  onLike?: (commentId: string) => void;
  onReply?: (commentId: string) => void;
}

export const CommentItem: React.FC<CommentItemProps> = ({ comment, onLike, onReply }) => {
  const colors = useThemeColors();
  const [isLiked, setIsLiked] = useState(comment.isLiked);
  const [likesCount, setLikesCount] = useState(comment.likes);
  const haptics = useHaptics();

  const styles = useMemo(() => createStyles(colors), [colors]);

  const handleLike = () => {
    haptics.light();
    const newLiked = !isLiked;
    setIsLiked(newLiked);
    setLikesCount((prev) => (newLiked ? prev + 1 : prev - 1));
    onLike?.(comment.id);
  };

  return (
    <View
      style={[
        styles.commentContainer,
        comment.isPinned && styles.pinnedComment,
        comment.isFromNath && styles.nathComment,
      ]}
    >
      {/* Header */}
      <View style={styles.commentHeader}>
        <View style={styles.authorInfo}>
          <Avatar
            size={32}
            source={comment.isFromNath ? nathAvatar : undefined}
            name={comment.author.charAt(0)}
            accessibilityIgnoresInvertColors={true}
          />
          <View style={styles.authorText}>
            <View style={styles.authorRow}>
              <Text style={styles.authorName}>{comment.author}</Text>
              {comment.isFromNath && (
                <View style={styles.verifiedBadge}>
                  <Ionicons name="checkmark-circle" size={14} color={colors.primary.main} />
                </View>
              )}
              {comment.isPinned && (
                <View style={styles.pinnedBadge}>
                  <Ionicons name="pin" size={12} color={colors.raw.warning[500]} />
                  <Text style={styles.pinnedBadgeText}>FIXADO</Text>
                </View>
              )}
              {comment.isAngelOfTheDay && (
                <View style={styles.angelBadge}>
                  <Ionicons name="star" size={12} color={colors.raw.warning[300]} />
                  <Text style={styles.angelBadgeText}>ANJO DO DIA</Text>
                </View>
              )}
            </View>
            <Text style={styles.timestamp}>{comment.timestamp}</Text>
          </View>
        </View>
      </View>

      {/* Content */}
      <Text style={styles.commentContent} selectable>
        {comment.content}
      </Text>

      {/* Actions */}
      <View style={styles.commentActions}>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel={isLiked ? 'Remover curtida' : 'Curtir comentário'}
          accessibilityHint={
            isLiked
              ? 'Remove sua curtida deste comentário'
              : 'Adiciona uma curtida a este comentário'
          }
          style={styles.actionButton}
          onPress={handleLike}
          activeOpacity={0.7}
        >
          <Ionicons
            name={isLiked ? 'heart' : 'heart-outline'}
            size={18}
            color={isLiked ? colors.raw.error[500] : colors.text.secondary}
          />
          <Text style={[styles.actionText, isLiked && { color: colors.raw.error[500] }]}>
            {likesCount}
          </Text>
        </TouchableOpacity>

        {onReply && (
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Responder comentário"
            accessibilityHint="Abre o campo de texto para escrever uma resposta a este comentário"
            style={styles.actionButton}
            onPress={() => onReply(comment.id)}
            activeOpacity={0.7}
          >
            <Ionicons name="chatbubble-outline" size={18} color={colors.text.secondary} />
            <Text style={styles.actionText}>Responder</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    commentContainer: {
      padding: Tokens.spacing['4'],
      marginBottom: Tokens.spacing['3'],
      backgroundColor: colors.background.card,
      borderRadius: Tokens.radius.lg,
      borderWidth: 1,
      borderColor: colors.border.light,
    },
    pinnedComment: {
      borderColor: colors.raw.warning[500],
      borderWidth: 2,
      backgroundColor: `${colors.raw.warning[500]}10`,
    },
    nathComment: {
      borderColor: colors.primary.main,
      borderWidth: 2,
      backgroundColor: `${colors.primary.main}10`,
    },
    commentHeader: {
      marginBottom: Tokens.spacing['2'],
    },
    authorInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Tokens.spacing['3'],
    },
    authorText: {
      flex: 1,
    },
    authorRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Tokens.spacing['1.5'],
      marginBottom: 2,
    },
    authorName: {
      fontSize: Tokens.typography.sizes.base - 1,
      fontWeight: Tokens.typography.weights.semibold,
      color: colors.text.primary,
    },
    verifiedBadge: {
      marginLeft: 2,
    },
    pinnedBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: `${colors.raw.warning[500]}20`,
      paddingHorizontal: Tokens.spacing['1.5'],
      paddingVertical: 2,
      borderRadius: Tokens.radius.sm,
      gap: 3,
    },
    pinnedBadgeText: {
      fontSize: Tokens.typography.sizes.xs - 3,
      fontWeight: Tokens.typography.weights.bold,
      color: colors.raw.warning[500],
      letterSpacing: 0.5,
    },
    angelBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: `${colors.raw.warning[300]}20`,
      paddingHorizontal: Tokens.spacing['1.5'],
      paddingVertical: 2,
      borderRadius: Tokens.radius.sm,
      gap: 3,
    },
    angelBadgeText: {
      fontSize: Tokens.typography.sizes.xs - 3,
      fontWeight: Tokens.typography.weights.bold,
      color: colors.raw.warning[300],
      letterSpacing: 0.5,
    },
    timestamp: {
      fontSize: Tokens.typography.sizes.xs,
      color: colors.text.tertiary,
    },
    commentContent: {
      fontSize: Tokens.typography.sizes.base - 1,
      color: colors.text.primary,
      lineHeight: 22,
      marginBottom: Tokens.spacing['3'],
    },
    commentActions: {
      flexDirection: 'row',
      gap: Tokens.spacing['5'],
    },
    actionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Tokens.spacing['1.5'],
      minHeight: Tokens.touchTargets.min,
    },
    actionText: {
      fontSize: Tokens.typography.sizes.sm,
      color: colors.text.secondary,
      fontWeight: Tokens.typography.weights.medium,
    },
  });

export default CommentItem;
