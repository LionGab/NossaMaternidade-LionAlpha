/**
 * CreateHabitModal - Modal para criar novo hábito
 *
 * Permite que usuárias criem hábitos com nome, descrição, frequência e sugestões rápidas.
 * Referência: app-redesign-studio-ab40635e/src/components/habits/CreateHabitModal.tsx
 * Adaptado para React Native com design system atual.
 */

import * as Haptics from 'expo-haptics';
import {
  Sparkles,
  Droplet,
  Moon,
  Heart,
  Coffee,
  BookOpen,
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

import { Box } from '@/components/atoms/Box';
import { Button } from '@/components/atoms/Button';
import { Text } from '@/components/atoms/Text';
import { Modal } from '@/components/Modal';
import { useTheme } from '@/theme';
import { Tokens, ColorTokens } from '@/theme/tokens';
import { logger } from '@/utils/logger';

interface CreateHabitModalProps {
  /** Se o modal está aberto */
  visible: boolean;
  /** Callback para fechar o modal */
  onClose: () => void;
  /** Callback quando o hábito é criado */
  onCreateHabit: (habit: {
    name: string;
    description?: string;
    frequency?: string;
  }) => Promise<void>;
}

const HABIT_SUGGESTIONS = [
  { name: 'Beber água', icon: Droplet, color: ColorTokens.info[500] },
  { name: 'Momento de autocuidado', icon: Sparkles, color: ColorTokens.secondary[500] },
  { name: 'Dormir cedo', icon: Moon, color: ColorTokens.accent.purple },
  { name: 'Respirar fundo', icon: Coffee, color: ColorTokens.warning[500] },
  { name: 'Ler 10 minutos', icon: BookOpen, color: ColorTokens.success[500] },
  { name: 'Gratidão diária', icon: Heart, color: ColorTokens.secondary[500] },
] as const;

const FREQUENCY_OPTIONS = [
  { value: 'daily', label: 'Diário' },
  { value: 'weekly', label: 'Semanal' },
  { value: '3x_week', label: '3x por semana' },
  { value: 'weekdays', label: 'Dias úteis' },
] as const;

export function CreateHabitModal({
  visible,
  onClose,
  onCreateHabit,
}: CreateHabitModalProps) {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [frequency, setFrequency] = useState<string>('daily');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canSubmit = name.trim().length > 0 && !isSubmitting;

  const handleSuggestionClick = useCallback(
    (suggestionName: string) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setName(suggestionName);
    },
    []
  );

  const handleFrequencySelect = useCallback((freq: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setFrequency(freq);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!canSubmit) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsSubmitting(true);

    try {
      await onCreateHabit({
        name: name.trim(),
        description: description.trim() || undefined,
        frequency,
      });

      // Limpar formulário
      setName('');
      setDescription('');
      setFrequency('daily');
      onClose();

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      logger.info('[CreateHabitModal] Hábito criado com sucesso');
    } catch (error) {
      logger.error('[CreateHabitModal] Erro ao criar hábito', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsSubmitting(false);
    }
  }, [name, description, frequency, canSubmit, onCreateHabit, onClose]);

  const handleClose = useCallback(() => {
    if (isSubmitting) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
  }, [isSubmitting, onClose]);

  return (
    <Modal visible={visible} onClose={handleClose} title="Novo Hábito" fullScreen={false}>
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
            {/* Sugestões rápidas */}
            <Box gap="2">
              <Text size="sm" weight="medium" color="secondary">
                Sugestões rápidas
              </Text>
              <Box direction="row" flexWrap="wrap" gap="2">
                {HABIT_SUGGESTIONS.map((suggestion) => {
                  const Icon = suggestion.icon;
                  const isSelected = name === suggestion.name;

                  return (
                    <TouchableOpacity
                      key={suggestion.name}
                      onPress={() => handleSuggestionClick(suggestion.name)}
                      activeOpacity={0.7}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: Tokens.spacing['1.5'],
                        paddingHorizontal: Tokens.spacing['3'],
                        paddingVertical: Tokens.spacing['2'],
                        borderRadius: Tokens.radius.full,
                        backgroundColor: isSelected
                          ? `${suggestion.color}20`
                          : isDark
                            ? ColorTokens.neutral[800]
                            : ColorTokens.neutral[100],
                        borderWidth: 1,
                        borderColor: isSelected ? suggestion.color : colors.border.light,
                      }}
                      accessibilityRole="button"
                      accessibilityLabel={`Sugestão: ${suggestion.name}`}
                      accessibilityState={{ selected: isSelected }}
                    >
                      <Icon size={14} color={isSelected ? suggestion.color : colors.text.secondary} />
                      <Text
                        size="xs"
                        weight={isSelected ? 'semibold' : 'medium'}
                        style={{
                          color: isSelected ? suggestion.color : colors.text.secondary,
                        }}
                      >
                        {suggestion.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </Box>
            </Box>

            {/* Nome do hábito */}
            <Box gap="2">
              <Text size="sm" weight="medium" color="secondary">
                Nome do hábito *
              </Text>
              <TextInput
                placeholder="Ex: Beber 2L de água"
                placeholderTextColor={colors.text.placeholder}
                value={name}
                onChangeText={setName}
                style={{
                  backgroundColor: colors.background.input,
                  borderRadius: Tokens.radius.xl,
                  padding: Tokens.spacing['4'],
                  color: colors.text.primary,
                  fontSize: Tokens.typography.sizes.md,
                  borderWidth: 1,
                  borderColor: colors.border.light,
                }}
                accessibilityLabel="Nome do hábito"
                accessibilityHint="Digite o nome do hábito que deseja criar"
              />
            </Box>

            {/* Descrição */}
            <Box gap="2">
              <Text size="sm" weight="medium" color="secondary">
                Descrição (opcional)
              </Text>
              <TextInput
                placeholder="Por que esse hábito é importante para você?"
                placeholderTextColor={colors.text.placeholder}
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={2}
                style={{
                  backgroundColor: colors.background.input,
                  borderRadius: Tokens.radius.xl,
                  padding: Tokens.spacing['4'],
                  color: colors.text.primary,
                  fontSize: Tokens.typography.sizes.md,
                  minHeight: 80,
                  textAlignVertical: 'top',
                  borderWidth: 1,
                  borderColor: colors.border.light,
                }}
                accessibilityLabel="Descrição do hábito"
                accessibilityHint="Digite uma descrição opcional para o hábito"
              />
            </Box>

            {/* Frequência */}
            <Box gap="2">
              <Text size="sm" weight="medium" color="secondary">
                Frequência
              </Text>
              <Box direction="row" flexWrap="wrap" gap="2">
                {FREQUENCY_OPTIONS.map((option) => {
                  const isSelected = frequency === option.value;

                  return (
                    <TouchableOpacity
                      key={option.value}
                      onPress={() => handleFrequencySelect(option.value)}
                      activeOpacity={0.7}
                      style={{
                        paddingHorizontal: Tokens.spacing['4'],
                        paddingVertical: Tokens.spacing['2.5'],
                        borderRadius: Tokens.radius.xl,
                        backgroundColor: isSelected
                          ? colors.primary.main
                          : isDark
                            ? ColorTokens.neutral[800]
                            : ColorTokens.neutral[100],
                        borderWidth: 1,
                        borderColor: isSelected ? colors.primary.main : colors.border.light,
                      }}
                      accessibilityRole="button"
                      accessibilityLabel={`Frequência: ${option.label}`}
                      accessibilityState={{ selected: isSelected }}
                    >
                      <Text
                        size="sm"
                        weight={isSelected ? 'semibold' : 'medium'}
                        style={{
                          color: isSelected ? ColorTokens.neutral[0] : colors.text.primary,
                        }}
                      >
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </Box>
            </Box>

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
                title={isSubmitting ? 'Criando...' : 'Criar Hábito'}
                onPress={handleSubmit}
                disabled={!canSubmit}
                leftIcon={
                  isSubmitting ? (
                    <ActivityIndicator size="small" color={ColorTokens.neutral[0]} />
                  ) : (
                    <Sparkles size={16} color={ColorTokens.neutral[0]} />
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

