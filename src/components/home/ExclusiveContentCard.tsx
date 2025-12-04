/**
 * ExclusiveContentCard - Card de conteúdo exclusivo com gradiente
 * Design inspirado no screenshot - "Ritual de 3 Minutos"
 * Integração com voz da Nathália via ElevenLabs
 */

import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { Sparkles, Play, Clock, Star } from 'lucide-react-native';
import React, { useRef, useEffect, useMemo } from 'react';
import { Pressable, Animated, Easing, View, useWindowDimensions, Platform } from 'react-native';

import { Text } from '@/components/primitives/Text';
import { VoicePlayer } from '@/components/voice';
import { useAccessibilityProps } from '@/hooks/useAccessibilityProps';
import type { ScriptKey } from '@/hooks/useVoice';
import type { MainTabParamList, RootStackParamList } from '@/navigation/types';
import { Tokens, ColorTokens } from '@/theme/tokens';

type NavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Home'>,
  NativeStackNavigationProp<RootStackParamList>
>;

export interface ExclusiveContentCardProps {
  /** Título do conteúdo */
  title: string;
  /** Descrição curta */
  description: string;
  /** Duração em minutos (opcional) */
  duration?: number;
  /** Tipo de conteúdo */
  type?: 'ritual' | 'meditation' | 'exercise' | 'tip';
  /** Se é conteúdo novo */
  isNew?: boolean;
  /** Callback ao pressionar */
  onPress?: () => void;
  /** Script de voz para reproduzir (ElevenLabs) */
  voiceScript?: ScriptKey;
  /** Habilitar botão de voz */
  enableVoice?: boolean;
}

export function ExclusiveContentCard({
  title,
  description,
  duration,
  type = 'ritual',
  isNew = true,
  onPress,
  voiceScript,
  enableVoice = true,
}: ExclusiveContentCardProps) {
  const navigation = useNavigation<NavigationProp>();
  const { width: screenWidth } = useWindowDimensions();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // ✅ Dimensão responsiva para efeito de brilho (máx 200px, responsivo à tela)
  const glowSize = useMemo(() => {
    // 50% da largura da tela, com máximo de 200px e mínimo de 150px
    const calculatedSize = screenWidth * 0.5;
    return Math.max(150, Math.min(calculatedSize, 200));
  }, [screenWidth]);

  // ✅ CORRIGIDO: useEffect sem dependências de refs
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
    // glowAnim é ref que não muda
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ✅ CORRIGIDO: useEffect sem dependências de refs
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
    // pulseAnim é ref que não muda
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.6],
  });

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
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

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (onPress) {
      onPress();
    } else {
      // Navegar para conteúdo ou chat
      navigation.navigate('Chat');
    }
  };

  // Cores do gradiente por tipo
  const gradientColors: Record<string, readonly [string, string, string]> = {
    ritual: [ColorTokens.secondary[600], ColorTokens.secondary[500], ColorTokens.primary[500]],
    meditation: [ColorTokens.info[600], ColorTokens.info[500], ColorTokens.secondary[500]],
    exercise: [ColorTokens.success[600], ColorTokens.success[500], ColorTokens.info[500]],
    tip: [ColorTokens.warning[600], ColorTokens.warning[500], ColorTokens.primary[500]],
  };

  // Determinar script de voz baseado no tipo
  const getDefaultVoiceScript = (): ScriptKey | undefined => {
    if (voiceScript) return voiceScript;
    switch (type) {
      case 'ritual':
        return 'RITUAL_INTRO';
      case 'meditation':
        return 'MEDITATION_INTRO';
      default:
        return undefined;
    }
  };

  const defaultScript = getDefaultVoiceScript();

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <View style={{ position: 'relative' }}>
        {/* Card principal - usar Pressable em vez de TouchableOpacity para evitar botão na web */}
        <Pressable
          onPress={handlePress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          {...useAccessibilityProps({
            accessibilityRole: 'button',
            accessibilityLabel: `${title}. ${description}${duration ? `. Duração: ${duration} minutos` : ''}`,
            accessibilityHint: 'Toque para iniciar o conteúdo exclusivo',
          })}
          style={{ flex: 1 }}
        >
          <LinearGradient
            colors={gradientColors[type] || gradientColors.ritual}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              borderRadius: Tokens.radius['2xl'],
              padding: Tokens.spacing['5'],
              minHeight: 140,
              overflow: 'hidden',
              ...Tokens.shadows.xl,
            }}
          >
            {/* Efeito de brilho animado - Responsivo */}
            <Animated.View
              style={{
                position: 'absolute',
                top: -glowSize * 0.25, // ✅ Responsivo: -25% do tamanho
                right: -glowSize * 0.25,
                width: glowSize, // ✅ Responsivo em vez de hardcoded 200
                height: glowSize, // ✅ Responsivo em vez de hardcoded 200
                borderRadius: glowSize / 2, // ✅ Círculo perfeito (50% do tamanho)
                backgroundColor: ColorTokens.neutral[0],
                opacity: glowOpacity,
                pointerEvents: 'none',
                // ✅ Otimização web: hint para browser otimizar opacity (GPU-accelerated)
                ...(Platform.OS === 'web' ? { willChange: 'opacity' as unknown as string } : {}),
              }}
              accessible={false}
              accessibilityRole="none"
            />

            {/* Badge EXCLUSIVO */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: Tokens.spacing['3'],
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: `${ColorTokens.neutral[0]}25`,
                  paddingVertical: Tokens.spacing['1'],
                  paddingHorizontal: Tokens.spacing['2'],
                  borderRadius: Tokens.radius.full,
                  gap: Tokens.spacing['1'],
                }}
              >
                {isNew ? (
                  <Star
                    size={12}
                    color={ColorTokens.warning[300]}
                    fill={ColorTokens.warning[300]}
                  />
                ) : (
                  <Sparkles size={12} color={ColorTokens.neutral[0]} />
                )}
                <Text
                  size="xs"
                  weight="bold"
                  style={{
                    color: ColorTokens.neutral[0],
                    letterSpacing: 1,
                  }}
                >
                  {isNew ? 'NOVO' : 'EXCLUSIVO'}
                </Text>
              </View>
            </View>

            {/* Título */}
            <Text
              size="xl"
              weight="bold"
              style={{
                color: ColorTokens.neutral[0],
                marginBottom: Tokens.spacing['2'],
              }}
            >
              {title}
            </Text>

            {/* Descrição */}
            <Text
              size="sm"
              style={{
                color: `${ColorTokens.neutral[0]}B3`,
                marginBottom: Tokens.spacing['4'],
                lineHeight: 20,
              }}
              numberOfLines={2}
            >
              {description}
            </Text>

            {/* Botão Começar + Duração */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              {/* Botão Começar */}
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: ColorTokens.neutral[0],
                  paddingVertical: Tokens.spacing['2'],
                  paddingHorizontal: Tokens.spacing['4'],
                  borderRadius: Tokens.radius.full,
                  gap: Tokens.spacing['2'],
                }}
              >
                <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                  <Play
                    size={14}
                    color={ColorTokens.secondary[600]}
                    fill={ColorTokens.secondary[600]}
                  />
                </Animated.View>
                <Text
                  size="sm"
                  weight="bold"
                  style={{
                    color: ColorTokens.secondary[600],
                  }}
                >
                  Começar Agora
                </Text>
              </View>

              {/* Duração */}
              {duration && (
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: Tokens.spacing['1'],
                  }}
                >
                  <Clock size={14} color={`${ColorTokens.neutral[0]}99`} />
                  <Text
                    size="xs"
                    weight="semibold"
                    style={{
                      color: `${ColorTokens.neutral[0]}99`,
                    }}
                  >
                    {duration} min
                  </Text>
                </View>
              )}
            </View>
          </LinearGradient>
        </Pressable>

        {/* Botão de voz posicionado absolutamente FORA do card clicável */}
        {enableVoice && defaultScript && (
          <View
            style={{
              position: 'absolute',
              bottom: Tokens.spacing['5'],
              right: duration ? Tokens.spacing['12'] : Tokens.spacing['5'],
              zIndex: 10, // Garantir que fica acima
              pointerEvents: 'box-none', // Permite cliques passarem através, exceto no VoicePlayer
            }}
          >
            <VoicePlayer
              scriptKey={defaultScript}
              voiceType={type === 'meditation' ? 'NATHALIA_CALM' : 'NATHALIA_MAIN'}
              size="sm"
              variant="ghost"
            />
          </View>
        )}
      </View>
    </Animated.View>
  );
}

export default ExclusiveContentCard;
