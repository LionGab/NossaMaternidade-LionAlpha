/**
 * CreatePostModal - Modal para criar novo post na comunidade
 *
 * Permite que usuárias criem posts com título, conteúdo, categoria, opção de anonimato
 * e preview do post antes de publicar.
 * Referência: app-redesign-studio-ab40635e/src/components/community/CreatePostModal.tsx
 * Adaptado para React Native com design system atual.
 */

import * as Haptics from 'expo-haptics';
import {
  MessageCircle,
  Send,
  Heart,
  Sparkles,
  HelpCircle,
  Laugh,
  X,
  Loader2,
} from 'lucide-react-native';
import React, { useState, useCallback } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Badge } from '@/components/Badge';
import { Box } from '@/components/atoms/Box';
import { Button } from '@/components/atoms/Button';
import { Text } from '@/components/atoms/Text';
import { Modal } from '@/components/Modal';
import { useTheme } from '@/theme';
import { Tokens, ColorTokens } from '@/theme/tokens';
import { logger } from '@/utils/logger';

interface CreatePostModalProps {
  /** Se o modal está aberto */
  visible: boolean;
  /** Callback para fechar o modal */
  onClose: () => void;
  /** Callback quando o post é criado */
  onCreatePost: (post: {
    title?: string;
    content: string;
    category?: string;
    is_anonymous?: boolean;
    image_url?: string;
  }) => Promise<void>;
}

const CATEGORIES = [
  { value: 'dicas', label: 'Dicas', icon: Sparkles, color: ColorTokens.warning[500] },
  { value: 'desabafos', label: 'Desabafos', icon: Heart, color: ColorTokens.secondary[500] },
  { value: 'duvidas', label: 'Dúvidas', icon: HelpCircle, color: ColorTokens.info[500] },
  { value: 'humor', label: 'Humor', icon: Laugh, color: ColorTokens.accent.purple },
] as const;

const MAX_TITLE_LENGTH = 100;
const MAX_CONTENT_LENGTH = 500;

export function CreatePostModal({ visible, onClose, onCreatePost }: CreatePostModalProps) {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<string | null>(null);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const remainingChars = MAX_CONTENT_LENGTH - content.length;
  const canSubmit = (content.trim().length > 0 || title.trim().length > 0) && !isSubmitting;

  const handleCategoryPress = useCallback(
    (catValue: string) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setCategory(category === catValue ? null : catValue);
    },
    [category]
  );

  const handleToggleAnonymous = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsAnonymous((prev) => !prev);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!canSubmit) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsSubmitting(true);

    try {
      await onCreatePost({
        title: title.trim() || undefined,
        content: content.trim(),
        category: category || undefined,
        is_anonymous: isAnonymous,
      });

      // Limpar formulário
      setTitle('');
      setContent('');
      setCategory(null);
      setIsAnonymous(false);
      onClose();

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      logger.info('[CreatePostModal] Post criado com sucesso');
    } catch (error) {
      logger.error('[CreatePostModal] Erro ao criar post', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsSubmitting(false);
    }
  }, [title, content, category, isAnonymous, canSubmit, onCreatePost, onClose]);

  const handleClose = useCallback(() => {
    if (isSubmitting) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
  }, [isSubmitting, onClose]);

  const selectedCategory = category ? CATEGORIES.find((c) => c.value === category) : null;

  return (
    <Modal visible={visible} onClose={handleClose} title="Novo Post" fullScreen={false}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={insets.top}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            padding: Tokens.spacing['4'],
            paddingBottom: insets.bottom + Tokens.spacing['4'],
          }}
          showsVerticalScrollIndicator={false}
        >
          <Box gap="5">
            {/* Título do post */}
            <Box gap="2">
              <Text size="sm" weight="medium" color="secondary">
                Título (opcional)
              </Text>
              <TextInput
                placeholder="Dê um título ao seu post..."
                placeholderTextColor={colors.text.placeholder}
                value={title}
                onChangeText={(text) => setTitle(text.slice(0, MAX_TITLE_LENGTH))}
                style={{
                  backgroundColor: colors.background.input,
                  borderRadius: Tokens.radius.xl,
                  padding: Tokens.spacing['4'],
                  color: colors.text.primary,
                  fontSize: Tokens.typography.sizes.md,
                  borderWidth: 1,
                  borderColor: colors.border.light,
                }}
                maxLength={MAX_TITLE_LENGTH}
                accessibilityLabel="Título do post"
                accessibilityHint="Digite um título opcional para seu post"
              />
              <Text size="xs" color="tertiary">
                {title.length}/{MAX_TITLE_LENGTH} caracteres
              </Text>
            </Box>

            {/* Categorias */}
            <Box gap="2">
              <Text size="sm" weight="medium" color="secondary">
                Categoria (opcional)
              </Text>
              <Box direction="row" flexWrap="wrap" gap="2">
                {CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  const isSelected = category === cat.value;

                  return (
                    <TouchableOpacity
                      key={cat.value}
                      onPress={() => handleCategoryPress(cat.value)}
                      activeOpacity={0.7}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: Tokens.spacing['1.5'],
                        paddingHorizontal: Tokens.spacing['3'],
                        paddingVertical: Tokens.spacing['2'],
                        borderRadius: Tokens.radius.full,
                        backgroundColor: isSelected
                          ? `${cat.color}20`
                          : isDark
                            ? ColorTokens.neutral[800]
                            : ColorTokens.neutral[100],
                        borderWidth: 1,
                        borderColor: isSelected ? cat.color : colors.border.light,
                      }}
                      accessibilityRole="button"
                      accessibilityLabel={`Categoria ${cat.label}`}
                      accessibilityState={{ selected: isSelected }}
                    >
                      <Icon size={14} color={isSelected ? cat.color : colors.text.secondary} />
                      <Text
                        size="xs"
                        weight={isSelected ? 'semibold' : 'medium'}
                        style={{
                          color: isSelected ? cat.color : colors.text.secondary,
                        }}
                      >
                        {cat.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </Box>
            </Box>

            {/* Conteúdo do post */}
            <Box gap="2">
              <Box direction="row" align="center" justify="space-between">
                <Text size="sm" weight="medium" color="secondary">
                  Descrição
                </Text>
                <Text
                  size="xs"
                  style={{
                    color: remainingChars < 50 ? ColorTokens.warning[500] : colors.text.tertiary,
                  }}
                >
                  {remainingChars} caracteres
                </Text>
              </Box>
              <TextInput
                placeholder="Conta pra gente... estamos aqui para te ouvir 💜"
                placeholderTextColor={colors.text.placeholder}
                value={content}
                onChangeText={(text) => setContent(text.slice(0, MAX_CONTENT_LENGTH))}
                multiline
                numberOfLines={6}
                style={{
                  backgroundColor: colors.background.input,
                  borderRadius: Tokens.radius.xl,
                  padding: Tokens.spacing['4'],
                  color: colors.text.primary,
                  fontSize: Tokens.typography.sizes.md,
                  minHeight: 120,
                  textAlignVertical: 'top',
                  borderWidth: 1,
                  borderColor: colors.border.light,
                }}
                maxLength={MAX_CONTENT_LENGTH}
                accessibilityLabel="Conteúdo do post"
                accessibilityHint="Digite o conteúdo do seu post"
              />
            </Box>

            {/* Opção de anonimato */}
            <TouchableOpacity
              onPress={handleToggleAnonymous}
              activeOpacity={0.7}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: Tokens.spacing['3'],
                borderRadius: Tokens.radius.xl,
                backgroundColor: isDark ? ColorTokens.neutral[800] : ColorTokens.neutral[100],
                borderWidth: 1,
                borderColor: colors.border.light,
              }}
              accessibilityRole="switch"
              accessibilityLabel="Postar anonimamente"
              accessibilityState={{ checked: isAnonymous }}
              accessibilityHint="Ativa ou desativa o modo anônimo para o post"
            >
              <Box gap="0.5">
                <Text size="sm" weight="medium" style={{ color: colors.text.primary }}>
                  Postar anonimamente
                </Text>
                <Text size="xs" color="tertiary">
                  Seu nome não será exibido no post
                </Text>
              </Box>
              <View
                style={{
                  width: 48,
                  height: 28,
                  borderRadius: 14,
                  backgroundColor: isAnonymous ? colors.primary.main : colors.border.medium,
                  justifyContent: 'center',
                  paddingHorizontal: 2,
                }}
              >
                <View
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 12,
                    backgroundColor: ColorTokens.neutral[0],
                    transform: [{ translateX: isAnonymous ? 20 : 0 }],
                  }}
                />
              </View>
            </TouchableOpacity>

            {/* Preview do post */}
            {(content.trim() || title.trim()) && (
              <Box
                p="3"
                rounded="xl"
                style={{
                  backgroundColor: isDark
                    ? `${ColorTokens.secondary[600]}20`
                    : `${ColorTokens.secondary[500]}10`,
                  borderWidth: 1,
                  borderColor: isDark ? ColorTokens.secondary[700] : ColorTokens.secondary[200],
                }}
              >
                <Box direction="row" align="center" gap="2" mb="2">
                  <Box
                    align="center"
                    justify="center"
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 16,
                      backgroundColor: isDark
                        ? ColorTokens.secondary[600]
                        : ColorTokens.secondary[500],
                    }}
                  >
                    <Text size="xs" weight="bold" style={{ color: ColorTokens.neutral[0] }}>
                      {isAnonymous ? '?' : 'EU'}
                    </Text>
                  </Box>
                  <Box flex={1}>
                    <Text size="xs" weight="medium" style={{ color: colors.text.primary }}>
                      {isAnonymous ? 'Mãe Anônima' : 'Você'}
                    </Text>
                    <Text size="xs" color="tertiary">
                      Agora
                    </Text>
                  </Box>
                  {selectedCategory && (
                    <Badge
                      variant="outline"
                      containerStyle={{
                        backgroundColor: `${selectedCategory.color}20`,
                        borderColor: selectedCategory.color,
                      }}
                    >
                      <Text size="xs" style={{ color: selectedCategory.color }}>
                        {selectedCategory.label}
                      </Text>
                    </Badge>
                  )}
                </Box>
                {title.trim() && (
                  <Text size="sm" weight="bold" style={{ color: colors.text.primary, marginBottom: Tokens.spacing['1'] }}>
                    {title}
                  </Text>
                )}
                {content.trim() && (
                  <Text
                    size="xs"
                    color="secondary"
                    numberOfLines={3}
                    style={{ color: colors.text.secondary }}
                  >
                    {content}
                  </Text>
                )}
              </Box>
            )}

            {/* Botões */}
            <Box direction="row" gap="3" pt="2">
              <Button
                title="Cancelar"
                onPress={handleClose}
                variant="outline"
                disabled={isSubmitting}
                style={{ flex: 1 }}
                textClassName="font-semibold"
              />
              <Button
                title={isSubmitting ? 'Publicando...' : 'Publicar'}
                onPress={handleSubmit}
                disabled={!canSubmit}
                leftIcon={
                  isSubmitting ? (
                    <ActivityIndicator size="small" color={ColorTokens.neutral[0]} />
                  ) : (
                    <Send size={16} color={ColorTokens.neutral[0]} />
                  )
                }
                style={{
                  flex: 1,
                  backgroundColor: canSubmit ? colors.primary.main : colors.border.medium,
                }}
                textClassName="font-semibold text-white"
              />
            </Box>
          </Box>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

