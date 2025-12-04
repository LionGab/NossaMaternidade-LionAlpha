/**
 * MoodSelector - Seletor de humor com emojis estilizados
 * Design inspirado na screenshot - "Como você está hoje?"
 * Salva no Supabase e navega para ChatScreen com contexto
 */

import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';
import { Smile } from 'lucide-react-native';
import React, { useRef } from 'react';
import { TouchableOpacity, View, Animated } from 'react-native';

import { Box } from '@/components/primitives/Box';
import { Text } from '@/components/primitives/Text';
import type { MainTabParamList, RootStackParamList } from '@/navigation/types';
import { checkInService, type EmotionValue } from '@/services/checkInService';
import { useTheme } from '@/theme';
import { Tokens, ColorTokens } from '@/theme/tokens';
import { logger } from '@/utils/logger';

type NavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Home'>,
  NativeStackNavigationProp<RootStackParamList>
>;

interface MoodOption {
  emoji: string;
  label: string;
  value: EmotionValue;
}

// Moods atualizados baseados na screenshot com código de cores
const MOODS: MoodOption[] = [
  { emoji: '😩', label: 'Exausta', value: 'cansada' },
  { emoji: '😰', label: 'Ansiosa', value: 'ansiosa' },
  { emoji: '😊', label: 'Bem', value: 'bem' },
  { emoji: '✨', label: 'Inspirada', value: 'calma' },
  { emoji: '💪', label: 'Poderosa', value: 'bem' },
];

// Função helper para obter cores do mood
function getMoodColors(moodValue: EmotionValue, isDark: boolean) {
  switch (moodValue) {
    case 'cansada':
      return {
        bg: isDark ? `${ColorTokens.warning[400]}30` : ColorTokens.warning[100],
        border: ColorTokens.warning[400],
        text: ColorTokens.warning[600],
      };
    case 'ansiosa':
      return {
        bg: isDark ? `${ColorTokens.warning[300]}30` : ColorTokens.warning[50],
        border: ColorTokens.warning[300],
        text: ColorTokens.warning[700],
      };
    case 'bem':
      return {
        bg: isDark ? `${ColorTokens.success[400]}30` : ColorTokens.success[100],
        border: ColorTokens.success[400],
        text: ColorTokens.success[600],
      };
    case 'calma':
      return {
        bg: isDark ? `${ColorTokens.success[300]}30` : ColorTokens.success[50],
        border: ColorTokens.success[300],
        text: ColorTokens.success[700],
      };
    default:
      return {
        bg: isDark ? ColorTokens.neutral[800] : ColorTokens.neutral[100],
        border: isDark ? ColorTokens.neutral[700] : ColorTokens.neutral[200],
        text: isDark ? ColorTokens.neutral[300] : ColorTokens.neutral[700],
      };
  }
}

export interface MoodSelectorProps {
  /** Humor selecionado */
  selectedMood?: EmotionValue | null;
  /** Callback ao selecionar humor */
  onMoodSelected?: (mood: EmotionValue) => void;
  /** Se deve navegar automaticamente para o chat */
  navigateOnSelect?: boolean;
}

function MoodButton({
  mood,
  isSelected,
  onPress,
}: {
  mood: MoodOption;
  isSelected: boolean;
  onPress: () => void;
}) {
  const { colors, isDark } = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.9,
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

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
        accessibilityRole="button"
        accessibilityLabel={`Estou me sentindo ${mood.label} hoje${isSelected ? '. Selecionado' : ''}`}
        accessibilityHint="Toque para registrar seu humor"
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          minWidth: 70,
          minHeight: 80,
          paddingVertical: Tokens.spacing['2'],
          paddingHorizontal: Tokens.spacing['1'],
          flexShrink: 1, // ✅ Melhorado: permite encolher em telas pequenas
          flexGrow: 0, // ✅ Melhorado: não cresce além do necessário
        }}
      >
        {/* Círculo com emoji - Aplicar código de cores */}
        <View
          style={{
            width: 52,
            height: 52,
            borderRadius: Tokens.radius.full,
            backgroundColor: isSelected
              ? getMoodColors(mood.value, isDark).bg
              : isDark
                ? ColorTokens.neutral[800]
                : ColorTokens.neutral[100],
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: Tokens.spacing['2'],
            borderWidth: isSelected ? 2 : 1,
            borderColor: isSelected
              ? getMoodColors(mood.value, isDark).border
              : isDark
                ? ColorTokens.neutral[700]
                : ColorTokens.neutral[200],
            ...Tokens.shadows.sm,
          }}
        >
          <Text
            style={{
              fontSize: 28,
              lineHeight: 32,
            }}
          >
            {mood.emoji}
          </Text>
        </View>

        {/* Label - Aplicar código de cores */}
        <Text
          size="xs"
          weight={isSelected ? 'bold' : 'medium'}
          numberOfLines={2}
          style={{
            color: isSelected ? getMoodColors(mood.value, isDark).text : colors.text.secondary,
            textAlign: 'center',
            minHeight: 32,
          }}
        >
          {mood.label}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

export function MoodSelector({
  selectedMood,
  onMoodSelected,
  navigateOnSelect = true,
}: MoodSelectorProps) {
  const { colors, isDark } = useTheme();
  const navigation = useNavigation<NavigationProp>();

  const handleMoodSelect = async (mood: EmotionValue) => {
    try {
      // Haptic feedback
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      // Salvar no Supabase
      const success = await checkInService.logEmotion(mood);
      if (success) {
        logger.info('Mood logged successfully', { mood, screen: 'MoodSelector' });
      } else {
        logger.error('Failed to log mood', null, { mood, screen: 'MoodSelector' });
      }

      // Callback local
      onMoodSelected?.(mood);

      // Navegar para ChatScreen
      if (navigateOnSelect) {
        navigation.navigate('Chat');
      }
    } catch (error) {
      logger.error('Error selecting mood', error, { mood, screen: 'MoodSelector' });
    }
  };

  return (
    <Box
      style={{
        backgroundColor: isDark ? ColorTokens.neutral[900] : colors.background.card,
        borderRadius: Tokens.radius['2xl'],
        padding: Tokens.spacing['3.5'], // ✅ Mobile: reduzido de '4' (16px) para '3.5' (14px)
        borderWidth: 1,
        borderColor: isDark ? ColorTokens.neutral[800] : colors.border.light,
        ...Tokens.shadows.sm,
      }}
    >
      {/* Header */}
      <Box
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: Tokens.spacing['2'],
          marginBottom: Tokens.spacing['4'], // ✅ Mobile: reduzido de '5' (20px) para '4' (16px)
        }}
      >
        <Smile size={18} color={colors.text.secondary} />
        <Text
          size="sm"
          weight="semibold"
          color="secondary"
          numberOfLines={1}
          style={{ flexShrink: 0 }}
        >
          Como você está hoje?
        </Text>
      </Box>

      {/* Mood Options */}
      <Box
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: Tokens.spacing['2'],
        }}
        accessibilityRole="radiogroup"
        accessibilityLabel="Selecione como você está se sentindo"
        accessibilityHint="Escolha um emoji que representa seu humor atual"
      >
        {MOODS.map((mood) => {
          const isSelected = selectedMood === mood.value;

          return (
            <MoodButton
              key={mood.label}
              mood={mood}
              isSelected={isSelected}
              onPress={() => handleMoodSelect(mood.value)}
            />
          );
        })}
      </Box>
    </Box>
  );
}

export default MoodSelector;
