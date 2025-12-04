/**
 * EmpatheticNathIACard V2 - Card principal redesenhado
 *
 * Melhorias:
 * - Animação de respiração suave no fundo
 * - Microcopy empático rotativo
 * - 3 variantes (default, minimal, warm)
 * - Melhor hierarquia visual
 * - WCAG AAA compliant
 */

import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { MessageCircle, Heart } from 'lucide-react-native';
import React, { memo, useEffect, useMemo, useRef } from 'react';
import { View, TouchableOpacity, StyleSheet, Animated, Easing } from 'react-native';

import { Text } from '@/components/primitives/Text';
import { useTheme } from '@/theme';
import { Tokens, ColorTokens } from '@/theme/tokens';

export interface EmpatheticNathIACardV2Props {
  /** Callback ao pressionar o card */
  onPress: () => void;
  /** Variante visual */
  variant?: 'default' | 'minimal' | 'warm' | 'functional';
}

// Configurações de microcopy
const COPY_OPTIONS = {
  warm: {
    titles: ['Posso te ouvir agora', 'Estou aqui pra você', 'Vamos conversar?'],
    subtitles: [
      'Sem pressa. Sem julgamentos.',
      'Tudo que você sentir é válido.',
      'Estou disponível agora.',
    ],
    questions: ['Como você está, de verdade?', 'O que está pesando hoje?', 'Quer desabafar?'],
    buttons: ['Me conta', 'Quero conversar', 'Desabafar'],
  },
  default: {
    titles: ['Converse com a NathIA'],
    subtitles: ['Apoio imediato, sem julgamentos.'],
    questions: [], // ✅ Removido question da variante default conforme plano
    buttons: ['Quero conversar'],
  },
  functional: {
    titles: ['NathIA'],
    subtitles: ['Chat disponível'],
    questions: [],
    buttons: ['Abrir chat'],
  },
};

// ⭐ Gradientes do design system (centralizados em tokens.ts)
const GRADIENTS = {
  light: {
    default: ColorTokens.nathIA.gradient.light, // Rosa → Roxo (design web v2)
    warm: ColorTokens.nathIA.warm.light,
  },
  dark: {
    default: ColorTokens.nathIA.gradient.dark, // Rosa → Roxo (design web v2)
    warm: ColorTokens.nathIA.warm.dark,
  },
};

function getRandomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export const EmpatheticNathIACardV2 = memo(function EmpatheticNathIACardV2({
  onPress,
  variant = 'default',
}: EmpatheticNathIACardV2Props) {
  const { isDark } = useTheme();

  // Animações
  const breatheAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(0.3)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // ✅ CORRIGIDO: useMemo para objeto calculado uma vez
  const copyType =
    variant === 'warm' ? 'warm' : variant === 'functional' ? 'functional' : 'default';
  const copy = useMemo(
    () => ({
      title: getRandomItem(COPY_OPTIONS[copyType].titles),
      subtitle: getRandomItem(COPY_OPTIONS[copyType].subtitles),
      question:
        COPY_OPTIONS[copyType].questions.length > 0
          ? getRandomItem(COPY_OPTIONS[copyType].questions)
          : null,
      button: getRandomItem(COPY_OPTIONS[copyType].buttons),
    }),
    [copyType]
  );

  // ✅ CORRIGIDO: useEffect sem dependências de refs
  useEffect(() => {
    const breathe = Animated.loop(
      Animated.sequence([
        Animated.timing(breatheAnim, {
          toValue: 1.15,
          duration: 4000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(breatheAnim, {
          toValue: 1,
          duration: 4000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    breathe.start();
    return () => breathe.stop();
    // breatheAnim é ref que não muda
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ✅ CORRIGIDO: useEffect sem dependências de refs
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.7,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.3,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
    // pulseAnim é ref que não muda
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  };

  const gradientColors = isDark
    ? variant === 'warm'
      ? GRADIENTS.dark.warm
      : GRADIENTS.dark.default
    : variant === 'warm'
      ? GRADIENTS.light.warm
      : GRADIENTS.light.default;

  // Variante Minimal (pill button)
  if (variant === 'minimal') {
    return (
      <TouchableOpacity
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
        accessibilityRole="button"
        accessibilityLabel="Abrir conversa com NathIA"
        accessibilityHint="Toque para iniciar uma conversa"
      >
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <LinearGradient
            colors={gradientColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.minimalCard}
          >
            <MessageCircle size={20} color={ColorTokens.nathIA.text.light} />
            <Text size="md" weight="semibold" style={styles.minimalText}>
              Conversar com NathIA
            </Text>
          </LinearGradient>
        </Animated.View>
      </TouchableOpacity>
    );
  }

  // Variante Functional (compacta)
  if (variant === 'functional') {
    return (
      <TouchableOpacity
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
        accessibilityRole="button"
        accessibilityLabel="Abrir chat com NathIA"
        accessibilityHint="Toque para iniciar uma conversa"
      >
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <LinearGradient
            colors={gradientColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.functionalCard}
          >
            <View style={styles.functionalLeft}>
              <View style={styles.functionalIcon}>
                <MessageCircle size={22} color={ColorTokens.nathIA.text.light} />
              </View>
              <View>
                <Text size="md" weight="semibold" style={styles.whiteText}>
                  {copy.title}
                </Text>
                <Text size="xs" style={styles.whiteTextMuted}>
                  {copy.subtitle}
                </Text>
              </View>
            </View>
            <View style={styles.functionalButton}>
              <Text size="sm" weight="semibold" style={{ color: gradientColors[0] }}>
                {copy.button}
              </Text>
            </View>
          </LinearGradient>
        </Animated.View>
      </TouchableOpacity>
    );
  }

  // Variantes Default e Warm (cards completos) - Igual ao design web
  return (
    <TouchableOpacity
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={0.95}
      accessibilityRole="button"
      accessibilityLabel="Converse com a NathIA. Apoio imediato, sem julgamentos."
      accessibilityHint="Toque para iniciar uma conversa com NathIA"
    >
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <View style={styles.card}>
          {/* Gradiente de fundo com opacity-90 - igual ao web */}
          <LinearGradient
            colors={gradientColors as [string, string]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[StyleSheet.absoluteFill, { opacity: 0.9 }]} // opacity-90 igual ao web
          />

          {/* Conteúdo - space-y-4 igual ao web */}
          <View style={styles.content}>
            {/* Header - Ícone + Badge lado a lado (gap-3) */}
            <View style={styles.header}>
              <View style={styles.iconContainer}>
                <MessageCircle size={24} color={ColorTokens.nathIA.text.light} />
              </View>
              <View style={styles.onlineBadge}>
                <Text size="xs" weight="medium" style={styles.onlineText}>
                  Disponível
                </Text>
              </View>
            </View>

            {/* Textos */}
            <View style={styles.textContainer}>
              <Text size="xl" weight="bold" style={styles.title}>
                Converse com a NathIA
              </Text>
              <Text size="sm" style={styles.subtitle}>
                Apoio imediato, sem julgamentos.
              </Text>
            </View>

            {/* Botão de ação - Branco igual ao web (h-11 px-8) */}
            {/* Usando View ao invés de TouchableOpacity para evitar button aninhado no web */}
            <View style={styles.button}>
              <Heart size={16} color={gradientColors[0]} />
              <Text size="md" weight="semibold" style={styles.buttonText}>
                Quero conversar
              </Text>
            </View>
          </View>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  // Card principal (default/warm) - Igual ao design web
  card: {
    borderRadius: Tokens.radius['3xl'], // rounded-3xl (24px) igual ao web
    padding: Tokens.spacing['6'], // p-6
    overflow: 'hidden',
    ...Tokens.shadows.sm, // shadow-card
  },

  // Círculos de respiração
  breatheContainer: {
    position: 'absolute',
    top: -60,
    right: -60,
    width: 200,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'none',
  },
  breatheCircle: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: ColorTokens.neutral[0],
    pointerEvents: 'none',
  },
  breatheCircleInner: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: ColorTokens.neutral[0],
    pointerEvents: 'none',
  },

  // Conteúdo - space-y-4 igual ao web (p-6 space-y-4)
  content: {
    position: 'relative',
    zIndex: 1,
    gap: Tokens.spacing['4'], // space-y-4
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Tokens.spacing['3'], // gap-3
  },
  iconContainer: {
    width: 48, // w-12 h-12
    height: 48,
    borderRadius: Tokens.radius.full,
    backgroundColor: ColorTokens.overlay.light, // bg-background/20 backdrop-blur-sm
    alignItems: 'center',
    justifyContent: 'center',
  },
  onlineBadge: {
    backgroundColor: ColorTokens.nathIA.badge.success.bg, // bg-success/20
    paddingVertical: Tokens.spacing['1'],
    paddingHorizontal: Tokens.spacing['2.5'],
    borderRadius: Tokens.radius.full,
    borderWidth: 0,
  },
  onlineText: {
    color: ColorTokens.nathIA.badge.success.text, // text-success
    fontSize: 12,
    fontWeight: '500',
  },

  // Textos - Igual ao design web
  textContainer: {
    // Sem marginBottom, usa gap do content
  },
  title: {
    color: ColorTokens.nathIA.text.light, // text-white
    marginBottom: Tokens.spacing['2'], // mb-2
    fontSize: 20, // text-xl
    fontWeight: '700', // font-bold
    lineHeight: 28,
  },
  subtitle: {
    color: ColorTokens.nathIA.text.light, // text-white (já tem opacity no componente)
    opacity: 0.8, // 80% opacity
    fontSize: 14, // text-sm
    lineHeight: 20,
  },
  question: {
    color: ColorTokens.nathIA.text.light,
    fontStyle: 'italic',
    lineHeight: 20,
    marginTop: Tokens.spacing['1'],
  },

  // Botão - Igual ao design web (bg-white text-primary rounded-2xl h-11 px-8)
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Tokens.spacing['2'], // mr-2 no Heart
    backgroundColor: ColorTokens.neutral[0], // bg-white
    height: 44, // h-11 (44px)
    paddingHorizontal: Tokens.spacing['8'], // px-8 (32px)
    borderRadius: Tokens.radius.lg, // rounded-2xl
    width: '100%',
  },
  buttonText: {
    color: ColorTokens.nathIA.button.primary, // Rosa maternal (design web)
    fontSize: 16,
    fontWeight: '600', // font-semibold
  },

  // Variante Minimal
  minimalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Tokens.spacing['2.5'],
    paddingVertical: Tokens.spacing['4'],
    paddingHorizontal: Tokens.spacing['6'],
    borderRadius: Tokens.radius.full,
    ...Tokens.shadows.lg,
  },
  minimalText: {
    color: ColorTokens.nathIA.text.light,
  },

  // Variante Functional
  functionalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Tokens.spacing['4'],
    paddingHorizontal: Tokens.spacing['4'],
    borderRadius: Tokens.radius.xl,
    ...Tokens.shadows.md,
  },
  functionalLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Tokens.spacing['3'],
  },
  functionalIcon: {
    width: 48, // ✅ WCAG AAA: touch target mínimo 48dp
    height: 48,
    borderRadius: Tokens.radius.full,
    backgroundColor: ColorTokens.overlay.light,
    alignItems: 'center',
    justifyContent: 'center',
  },
  functionalButton: {
    backgroundColor: ColorTokens.neutral[0],
    paddingVertical: Tokens.spacing['2'],
    paddingHorizontal: Tokens.spacing['4'],
    borderRadius: Tokens.radius.full,
  },
  whiteText: {
    color: ColorTokens.nathIA.text.light,
  },
  whiteTextMuted: {
    color: ColorTokens.nathIA.text.light,
    marginTop: 2,
  },
});

export default EmpatheticNathIACardV2;
