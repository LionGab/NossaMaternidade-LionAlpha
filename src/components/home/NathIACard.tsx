/**
 * NathIACard - Card premium "Falar com a NathIA agora"
 * Design inspirado nos screenshots de referência
 *
 * Features:
 * - Gradiente ciano/teal vibrante
 * - Ícone sparkle animado
 * - Botão "Abrir chat" destacado
 * - Suporte light/dark mode
 */

import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { Sparkles, MessageCircle, Zap } from 'lucide-react-native';
import React, { memo, useEffect, useRef } from 'react';
import { View, TouchableOpacity, Pressable, StyleSheet, Animated, Easing } from 'react-native';

import { Text } from '@/components/primitives/Text';
import { useTheme } from '@/theme';
import { Tokens, Typography, ColorTokens } from '@/theme/tokens';

// ======================
// TIPOS
// ======================

export interface NathIACardProps {
  /** Título do card */
  title?: string;
  /** Subtítulo/descrição */
  subtitle?: string;
  /** Texto do botão */
  buttonText?: string;
  /** Callback ao pressionar o card ou botão */
  onPress: () => void;
  /** Mostrar badge "Online" */
  showOnlineBadge?: boolean;
  /** Variante do card */
  variant?: 'default' | 'compact' | 'hero';
}

// ======================
// GRADIENTES - Brand Blue (Web Design)
// ======================

const GRADIENTS = {
  light: ['#6DA9E4', '#5A8FD8', '#4A7FCC'] as const, // Brand blue gradient
  dark: ['#4A8FD8', '#2E75CC', '#1E5BB0'] as const, // Brand blue dark gradient
};

// ======================
// COMPONENTE
// ======================

export const NathIACard = memo(function NathIACard({
  title = 'Falar com a NathIA agora',
  subtitle = 'Desabafe, pergunte ou apenas ganhe clareza em poucos minutos.',
  buttonText = 'Abrir chat',
  onPress,
  showOnlineBadge = true,
  variant = 'default',
}: NathIACardProps) {
  const { isDark } = useTheme();

  // Animação de sparkle
  const sparkleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animação de rotação do sparkle
    Animated.loop(
      Animated.timing(sparkleAnim, {
        toValue: 1,
        duration: 3000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
    // sparkleAnim é ref que não muda
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  };

  const sparkleRotation = sparkleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  if (variant === 'compact') {
    return (
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={0.9}
        accessibilityRole="button"
        accessibilityLabel="Abrir chat com NathIA"
        accessibilityHint="Inicia uma conversa com a assistente NathIA"
      >
        <LinearGradient
          colors={isDark ? GRADIENTS.dark : GRADIENTS.light}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.compactCard}
        >
          <View style={styles.compactContent}>
            <Sparkles size={20} color="#FFFFFF" />
            <Text size="sm" weight="semibold" style={styles.compactText}>
              Conversar com NathIA
            </Text>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <Pressable
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityHint="Abre o chat com a assistente NathIA"
      style={({ pressed }) => [
        styles.cardContainer,
        variant === 'hero' && styles.heroCard,
        pressed && { opacity: 0.95 },
      ]}
    >
      <LinearGradient
        colors={isDark ? GRADIENTS.dark : GRADIENTS.light}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.card, variant === 'hero' && styles.heroCard]}
      >
        {/* Decoração de fundo */}
        <View style={styles.decorationContainer}>
          <View style={[styles.decoration1, { opacity: isDark ? 0.1 : 0.15 }]} />
          <View style={[styles.decoration2, { opacity: isDark ? 0.08 : 0.12 }]} />
        </View>

        {/* Badge superior */}
        <View style={styles.badgeRow}>
          <View style={styles.badge}>
            <Animated.View
              style={{
                transform: [{ rotate: sparkleRotation }],
              }}
            >
              <Sparkles size={14} color="#FFFFFF" />
            </Animated.View>
            <Text size="xs" weight="bold" style={styles.badgeText}>
              INTELIGÊNCIA NATHIA
            </Text>
          </View>

          {showOnlineBadge && (
            <View style={styles.onlineBadge}>
              <View style={styles.onlineDot} />
              <Text size="xs" style={styles.onlineText}>
                Online
              </Text>
            </View>
          )}
        </View>

        {/* Conteúdo principal */}
        <View style={styles.content}>
          <Text size="lg" weight="bold" style={styles.title}>
            {title}
          </Text>

          <Text size="sm" style={styles.subtitle}>
            {subtitle}
          </Text>
        </View>

        {/* Botão de ação - agora é apenas visual, o Pressable pai cuida do toque */}
        <View style={styles.button}>
          <MessageCircle
            size={18}
            color={ColorTokens.brand[800]} // Azul muito escuro (#134294) - contraste WCAG AAA 9.2:1 com branco
          />
          <Text
            size="sm"
            weight="semibold"
            style={{
              color: ColorTokens.brand[800], // Azul muito escuro (#134294) - contraste WCAG AAA 9.2:1 com branco
              fontSize: Typography.sizes.sm, // 14px
              lineHeight: Typography.lineHeights.sm, // 20px
              letterSpacing: Typography.letterSpacing.normal,
              // Garantir que a cor não seja sobrescrita
              fontWeight: Typography.weights.semibold,
            }}
          >
            {buttonText}
          </Text>
        </View>

        {/* Indicador de IA */}
        <View style={styles.aiIndicator}>
          <Zap size={12} color="rgba(255,255,255,0.6)" />
          <Text size="xs" style={styles.aiText}>
            IA conversacional
          </Text>
        </View>
      </LinearGradient>
    </Pressable>
  );
});

// ======================
// ESTILOS
// ======================

const styles = StyleSheet.create({
  cardContainer: {
    borderRadius: Tokens.radius['2xl'],
    overflow: 'hidden',
  },
  card: {
    borderRadius: Tokens.radius['2xl'],
    padding: Tokens.spacing['5'],
    overflow: 'hidden',
    position: 'relative',
    minHeight: 200,
  },
  heroCard: {
    minHeight: 240,
    padding: Tokens.spacing['6'],
  },
  compactCard: {
    borderRadius: Tokens.radius.xl,
    padding: Tokens.spacing['3'],
  },
  compactContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Tokens.spacing['2'],
  },
  compactText: {
    color: '#FFFFFF',
  },

  // Decorações de fundo
  decorationContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  decoration1: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#FFFFFF',
  },
  decoration2: {
    position: 'absolute',
    bottom: -30,
    left: -30,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FFFFFF',
  },

  // Badge superior
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Tokens.spacing['4'],
    paddingLeft: Tokens.spacing['2'], // Move um pouco para a direita
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Tokens.spacing['3'], // Aumentado de 2 para 3 (12px)
    backgroundColor: 'rgba(255, 255, 255, 0.25)', // Aumentado de 0.2 para 0.25 (mais visível)
    paddingHorizontal: Tokens.spacing['4'], // Aumentado de 3 para 4 (16px)
    paddingVertical: Tokens.spacing['2'], // Aumentado de 1.5 para 2 (8px)
    borderRadius: Tokens.radius.full,
    // Sombra sutil para profundidade
    shadowColor: ColorTokens.neutral[900],
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    // Borda sutil para definição
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: Typography.sizes.xs, // 12px (aumentado de 10px)
    letterSpacing: Typography.letterSpacing.wider, // 0.5px (usando token)
    fontWeight: Typography.weights.bold, // 700
    lineHeight: Typography.lineHeights.xs, // 18px
  },
  onlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Tokens.spacing['1'],
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4ADE80',
  },
  onlineText: {
    color: 'rgba(255, 255, 255, 0.8)',
  },

  // Conteúdo
  content: {
    marginBottom: Tokens.spacing['5'],
  },
  title: {
    color: '#FFFFFF',
    marginBottom: Tokens.spacing['2'],
    fontSize: Typography.sizes.lg, // 18px (reduzido de xl/20px)
    lineHeight: Typography.lineHeights.lg, // 26px
    letterSpacing: Typography.letterSpacing.normal,
  },
  subtitle: {
    color: 'rgba(255, 255, 255, 0.85)',
    lineHeight: Typography.lineHeights.sm, // 20px
    letterSpacing: Typography.letterSpacing.normal,
  },

  // Botão (agora é apenas visual, o Pressable pai cuida da interação)
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Tokens.spacing['3'], // 12px - espaçamento entre ícone e texto
    backgroundColor: '#FFFFFF',
    // Padding aumentado para melhor espaçamento interno
    paddingVertical: Tokens.spacing['5'], // 20px (aumentado de 16px)
    paddingHorizontal: Tokens.spacing['6'], // 24px (mantido, já adequado)
    borderRadius: Tokens.radius.xl,
    alignSelf: 'flex-start',
    minWidth: 140,
    minHeight: Tokens.touchTargets.min, // 44pt (WCAG AAA)
    // Sombra melhorada para feedback visual
    shadowColor: ColorTokens.neutral[900],
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
    // Borda sutil para melhor definição
    borderWidth: 1,
    borderColor: ColorTokens.neutral[200], // Cinza claro para borda sutil
  },
  buttonText: {
    // color definido inline baseado no tema
  },

  // Indicador de IA
  aiIndicator: {
    position: 'absolute',
    bottom: Tokens.spacing['3'],
    right: Tokens.spacing['4'],
    flexDirection: 'row',
    alignItems: 'center',
    gap: Tokens.spacing['1'],
  },
  aiText: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 10,
  },
});

export default NathIACard;
