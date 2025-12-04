/**
 * AIModePicker - Seletor de Modos de IA
 *
 * Adaptado do GeminiApp para React Native
 * Modos: Fast, Balanced, Thinking, Search, Live
 *
 * @version 1.0.0
 */

import * as Haptics from 'expo-haptics';
import { Zap, Sparkles, Brain, Globe, Phone } from 'lucide-react-native';
import React, { useCallback, useMemo } from 'react';
import { View, ScrollView, StyleSheet, Pressable, Text as RNText } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { useTheme } from '../theme/ThemeContext';
import {
  Spacing,
  Radius,
  Shadows,
  ColorTokens,
  Typography,
  DarkTheme,
  LightTheme,
} from '../theme/tokens';

export type AIMode = 'fast' | 'balanced' | 'thinking' | 'search' | 'live';

export interface AIModeOption {
  id: AIMode;
  label: string;
  icon: React.ComponentType<{ size: number; color: string }>;
  color: string;
  bgColor: string;
  description: string;
}

export const AI_MODE_OPTIONS: AIModeOption[] = [
  {
    id: 'fast',
    label: 'Rapido',
    icon: Zap,
    color: ColorTokens.accent.sunshine,
    bgColor: ColorTokens.accent.sunshineLight,
    description: 'Respostas instantaneas',
  },
  {
    id: 'balanced',
    label: 'Normal',
    icon: Sparkles,
    color: ColorTokens.accent.ocean,
    bgColor: ColorTokens.accent.oceanLight,
    description: 'Equilibrio entre velocidade e qualidade',
  },
  {
    id: 'thinking',
    label: 'Pensar',
    icon: Brain,
    color: ColorTokens.accent.indigo,
    bgColor: ColorTokens.secondary[100],
    description: 'Analise profunda e detalhada',
  },
  {
    id: 'search',
    label: 'Buscar',
    icon: Globe,
    color: ColorTokens.accent.mint,
    bgColor: ColorTokens.accent.mintLight,
    description: 'Busca na web em tempo real',
  },
  {
    id: 'live',
    label: 'Ao Vivo',
    icon: Phone,
    color: ColorTokens.accent.coral,
    bgColor: ColorTokens.accent.coralLight,
    description: 'Conversa por voz em tempo real',
  },
];

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface AIModeItemProps {
  option: AIModeOption;
  isSelected: boolean;
  onSelect: (id: AIMode) => void;
  isDark: boolean;
  compact?: boolean;
}

const AIModeItem: React.FC<AIModeItemProps> = React.memo(
  ({ option, isSelected, onSelect, isDark, compact = false }) => {
    const scale = useSharedValue(1);
    const pulse = useSharedValue(1);

    // Pulse animation for live mode
    React.useEffect(() => {
      if (option.id === 'live' && isSelected) {
        pulse.value = withRepeat(
          withSequence(withTiming(1.1, { duration: 800 }), withTiming(1, { duration: 800 })),
          -1,
          true
        );
      } else {
        pulse.value = withTiming(1, { duration: 200 });
      }
    }, [option.id, isSelected, pulse]);

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [
        { scale: scale.value },
        ...(option.id === 'live' ? [{ scale: pulse.value }] : []),
      ],
    }));

    const handlePressIn = () => {
      scale.value = withSpring(0.95, { damping: 15, stiffness: 400 });
    };

    const handlePressOut = () => {
      scale.value = withSpring(1, { damping: 15, stiffness: 400 });
    };

    const handlePress = useCallback(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onSelect(option.id);
    }, [option.id, onSelect]);

    const IconComponent = option.icon;

    const containerStyle = useMemo(
      () => ({
        backgroundColor: isSelected
          ? isDark
            ? option.color + '30'
            : option.bgColor
          : isDark
            ? ColorTokens.overlay.glass
            : ColorTokens.overlay.card,
        borderColor: isSelected ? option.color : 'transparent',
        borderWidth: isSelected ? 2 : 0,
      }),
      [isDark, isSelected, option]
    );

    if (compact) {
      return (
        <AnimatedPressable
          onPress={handlePress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={[styles.compactItem, containerStyle, animatedStyle, isSelected && Shadows.sm]}
          accessibilityRole="button"
          accessibilityLabel={`Modo ${option.label}: ${option.description}`}
          accessibilityState={{ selected: isSelected }}
        >
          <IconComponent
            size={20}
            color={
              isSelected
                ? option.color
                : isDark
                  ? DarkTheme.text.disabled
                  : LightTheme.text.tertiary
            }
          />
        </AnimatedPressable>
      );
    }

    return (
      <AnimatedPressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[styles.modeItem, containerStyle, animatedStyle, isSelected && Shadows.card]}
        accessibilityRole="button"
        accessibilityLabel={`Modo ${option.label}: ${option.description}`}
        accessibilityState={{ selected: isSelected }}
      >
        <View style={[styles.iconWrapper, { backgroundColor: option.bgColor }]}>
          <IconComponent size={20} color={option.color} />
        </View>
        <RNText
          style={{
            ...styles.label,
            color: isSelected
              ? option.color
              : isDark
                ? DarkTheme.text.secondary
                : LightTheme.text.secondary,
          }}
        >
          {option.label}
        </RNText>
      </AnimatedPressable>
    );
  }
);

AIModeItem.displayName = 'AIModeItem';

export interface AIModePickerProps {
  /** Modo selecionado */
  selectedMode: AIMode;
  /** Callback ao selecionar modo */
  onModeSelect: (mode: AIMode) => void;
  /** Layout compacto (apenas icones) */
  compact?: boolean;
  /** Estilo customizado do container */
  containerStyle?: object;
}

export const AIModePicker: React.FC<AIModePickerProps> = ({
  selectedMode,
  onModeSelect,
  compact = false,
  containerStyle,
}) => {
  const { isDark } = useTheme();

  return (
    <View style={[styles.container, containerStyle]}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, compact && styles.scrollContentCompact]}
      >
        {AI_MODE_OPTIONS.map((option) => (
          <AIModeItem
            key={option.id}
            option={option}
            isSelected={selectedMode === option.id}
            onSelect={onModeSelect}
            isDark={isDark}
            compact={compact}
          />
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: Spacing['2'],
  },
  scrollContent: {
    paddingHorizontal: Spacing['4'],
    gap: Spacing['3'],
  },
  scrollContentCompact: {
    gap: Spacing['2'],
  },
  modeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing['3'],
    paddingVertical: Spacing['2'],
    borderRadius: Radius.pill,
    gap: Spacing['2'],
  },
  compactItem: {
    width: 44,
    height: 44,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapper: {
    width: 32,
    height: 32,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semibold,
  },
});

export default AIModePicker;
