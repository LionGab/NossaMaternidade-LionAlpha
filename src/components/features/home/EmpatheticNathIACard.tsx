/**
 * EmpatheticNathIACard - Card redesenhado com linguagem empática
 * "💬 Converse com a NathIA - Apoio imediato, sem julgamentos."
 */

import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { MessageCircle, Heart, Sparkles } from 'lucide-react-native';
import React, { memo, useEffect, useRef } from 'react';
import { View, TouchableOpacity, StyleSheet, Animated, Easing } from 'react-native';

import { Text } from '@/components/atoms/Text';
import { useTheme } from '@/theme';
import { Tokens, ColorTokens } from '@/theme/tokens';

export interface EmpatheticNathIACardProps {
  /** Callback ao pressionar o card */
  onPress: () => void;
  /** Variante do card */
  variant?: 'default' | 'compact';
}

// ⭐ MIGRADO: Usa tokens centralizados de ColorTokens.nathIA
const GRADIENTS = {
  light: ColorTokens.nathIA.gradient.light,
  dark: ColorTokens.nathIA.gradient.dark,
};

// Textos alternativos para o botão
const BUTTON_TEXTS = [
  'Quero conversar',
  'Vamos conversar',
  'Preciso de apoio',
  'Falar agora',
  'Abrir chat',
];

export const EmpatheticNathIACard = memo(function EmpatheticNathIACard({
  onPress,
  variant = 'default',
}: EmpatheticNathIACardProps) {
  const { isDark } = useTheme();
  const sparkleAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // ✅ CORRIGIDO: useEffect sem dependências de refs
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(sparkleAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(sparkleAnim, {
          toValue: 0,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
    // sparkleAnim é ref que não muda
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ✅ CORRIGIDO: useEffect sem dependências de refs
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
    // pulseAnim é ref que não muda
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  };

  const sparkleOpacity = sparkleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  if (variant === 'compact') {
    return (
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={0.9}
        accessibilityRole="button"
        accessibilityLabel="Converse com a NathIA"
        accessibilityHint="Abre o chat com a assistente NathIA para apoio imediato"
      >
        <LinearGradient
          colors={isDark ? GRADIENTS.dark : GRADIENTS.light}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.compactCard}
        >
          <MessageCircle size={20} color={ColorTokens.nathIA.text.light} />
          <Text size="sm" weight="semibold" style={styles.compactText}>
            Converse com NathIA
          </Text>
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.95}
      accessibilityRole="button"
      accessibilityLabel="Converse com a NathIA - Apoio imediato, sem julgamentos"
      accessibilityHint="Abre o chat com a assistente NathIA para conversar sobre o que está acontecendo"
    >
      <LinearGradient
        colors={isDark ? GRADIENTS.dark : GRADIENTS.light}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        {/* Decoração sutil de fundo */}
        <View style={[styles.decorationContainer, { pointerEvents: 'none' }]}>
          <Animated.View
            style={[
              styles.decorationCircle,
              {
                opacity: sparkleOpacity,
                transform: [{ scale: pulseAnim }],
                pointerEvents: 'none',
              },
            ]}
          />
        </View>

        {/* Conteúdo principal */}
        <View style={styles.content}>
          {/* Header com ícone e badge */}
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <MessageCircle size={24} color={ColorTokens.nathIA.text.light} />
              <Animated.View
                style={[
                  styles.sparkleBadge,
                  {
                    opacity: sparkleOpacity,
                  },
                ]}
              >
                <Sparkles size={12} color={ColorTokens.nathIA.text.light} />
              </Animated.View>
            </View>
            <View style={styles.onlineBadge}>
              <View style={styles.onlineDot} />
              <Text size="xs" weight="medium" style={styles.onlineText}>
                Online agora
              </Text>
            </View>
          </View>

          {/* Título e descrição */}
          <View style={styles.textContainer}>
            <Text size="xl" weight="bold" style={styles.title}>
              Converse com a NathIA
            </Text>
            <Text size="sm" style={styles.subtitle}>
              Apoio imediato, sem julgamentos.
            </Text>
            <Text size="sm" style={styles.question}>
              &ldquo;O que está acontecendo aí dentro agora?&rdquo;
            </Text>
          </View>

          {/* Botão de ação */}
          <View style={styles.buttonContainer}>
            <View style={styles.button}>
              <Heart size={16} color={ColorTokens.primary[600]} />
              <Text size="md" weight="semibold" style={styles.buttonText}>
                {BUTTON_TEXTS[0]}
              </Text>
            </View>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  card: {
    borderRadius: Tokens.radius['2xl'],
    padding: Tokens.spacing['5'],
    minHeight: 180,
    overflow: 'hidden',
    ...Tokens.shadows.xl,
  },
  compactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Tokens.spacing['2'],
    paddingVertical: Tokens.spacing['3'],
    paddingHorizontal: Tokens.spacing['4'],
    borderRadius: Tokens.radius.full,
    ...Tokens.shadows.md,
  },
  compactText: {
    color: ColorTokens.nathIA.text.light,
  },
  decorationContainer: {
    position: 'absolute',
    top: -30,
    right: -30,
    width: 120,
    height: 120,
    borderRadius: 60,
    pointerEvents: 'none',
  },
  decorationCircle: {
    width: '100%',
    height: '100%',
    borderRadius: 60,
    backgroundColor: ColorTokens.nathIA.text.light,
    opacity: 0.1,
    pointerEvents: 'none',
  },
  content: {
    position: 'relative',
    zIndex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Tokens.spacing['4'],
  },
  iconContainer: {
    position: 'relative',
    width: 48,
    height: 48,
    borderRadius: Tokens.radius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sparkleBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: ColorTokens.warning[400],
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: ColorTokens.nathIA.text.light,
  },
  onlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Tokens.spacing['1'],
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: Tokens.spacing['1'],
    paddingHorizontal: Tokens.spacing['2'],
    borderRadius: Tokens.radius.full,
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: ColorTokens.success[400],
  },
  onlineText: {
    color: ColorTokens.nathIA.text.light,
    fontSize: 10,
  },
  textContainer: {
    marginBottom: Tokens.spacing['4'],
  },
  title: {
    color: ColorTokens.nathIA.text.light,
    marginBottom: Tokens.spacing['1'],
    lineHeight: 28,
  },
  subtitle: {
    color: 'rgba(255, 255, 255, 0.95)',
    marginBottom: Tokens.spacing['2'],
    lineHeight: 20,
  },
  question: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontStyle: 'italic',
    lineHeight: 20,
    marginTop: Tokens.spacing['1'],
  },
  buttonContainer: {
    marginTop: Tokens.spacing['2'],
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Tokens.spacing['2'],
    backgroundColor: ColorTokens.neutral[0],
    paddingVertical: Tokens.spacing['3'],
    paddingHorizontal: Tokens.spacing['5'],
    borderRadius: Tokens.radius.full,
    ...Tokens.shadows.md,
  },
  buttonText: {
    color: ColorTokens.primary[600],
  },
});
