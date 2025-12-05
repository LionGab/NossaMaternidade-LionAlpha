/**
 * AIAssistantCard - Card gradiente para iniciar conversa com IA
 * Design inspirado na screenshot - "Vamos conversar?"
 */

import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { Sparkles, ArrowRight } from 'lucide-react-native';
import React, { useRef, useEffect } from 'react';
import { TouchableOpacity, Animated, Easing } from 'react-native';

import { Box } from '@/components/atoms/Box';
import { Text } from '@/components/atoms/Text';
import type { MainTabParamList, RootStackParamList } from '@/navigation/types';
import { Tokens, ColorTokens } from '@/theme/tokens';

type NavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Home'>,
  NativeStackNavigationProp<RootStackParamList>
>;

export interface AIAssistantCardProps {
  /** Título principal */
  title?: string;
  /** Subtítulo/descrição */
  subtitle?: string;
  /** Callback ao pressionar */
  onPress?: () => void;
}

export function AIAssistantCard({
  title = 'Vamos conversar?',
  subtitle = 'Rotina, carreira, saúde ou desabafo.',
  onPress,
}: AIAssistantCardProps) {
  const navigation = useNavigation<NavigationProp>();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const sparkleAnim = useRef(new Animated.Value(0)).current;

  // ✅ CORRIGIDO: useEffect sem dependências de refs
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(sparkleAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(sparkleAnim, {
          toValue: 0,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
    // sparkleAnim é ref que não muda
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sparkleOpacity = sparkleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.7, 1],
  });

  const sparkleScale = sparkleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.1],
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
      navigation.navigate('Chat');
    }
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
        accessibilityRole="button"
        accessibilityLabel={`${title}. ${subtitle}`}
        accessibilityHint="Abre a tela de chat com a assistente NathIA"
      >
        <LinearGradient
          colors={[ColorTokens.info[600], ColorTokens.info[500], ColorTokens.secondary[500]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            borderRadius: Tokens.radius['2xl'],
            padding: Tokens.spacing['5'],
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            minHeight: 80,
            ...Tokens.shadows.lg,
          }}
        >
          {/* Ícone + Texto */}
          <Box style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
            <Animated.View
              style={{
                opacity: sparkleOpacity,
                transform: [{ scale: sparkleScale }],
                marginRight: Tokens.spacing['3'],
              }}
            >
              <Sparkles size={24} color={ColorTokens.neutral[0]} />
            </Animated.View>

            <Box style={{ flex: 1 }}>
              <Text
                size="xs"
                weight="bold"
                style={{
                  color: `${ColorTokens.neutral[0]}CC`,
                  textTransform: 'uppercase',
                  letterSpacing: 1,
                  marginBottom: 4,
                }}
              >
                Assistente IA
              </Text>
              <Text
                size="lg"
                weight="bold"
                style={{
                  color: ColorTokens.neutral[0],
                  marginBottom: 2,
                }}
              >
                {title}
              </Text>
              <Text
                size="sm"
                style={{
                  color: `${ColorTokens.neutral[0]}99`,
                }}
              >
                {subtitle}
              </Text>
            </Box>
          </Box>

          {/* Arrow Button */}
          <Box
            style={{
              width: 44,
              height: 44,
              borderRadius: Tokens.radius.full,
              backgroundColor: `${ColorTokens.neutral[0]}20`,
              alignItems: 'center',
              justifyContent: 'center',
              marginLeft: Tokens.spacing['3'],
            }}
          >
            <ArrowRight size={24} color={ColorTokens.neutral[0]} />
          </Box>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default AIAssistantCard;
