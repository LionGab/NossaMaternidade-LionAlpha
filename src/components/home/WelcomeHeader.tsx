/**
 * WelcomeHeader - Header com avatar, saudação e toggle de tema
 * Design inspirado na screenshot - "Boa noite, Bem-vinda"
 */

import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { Sun, Moon } from 'lucide-react-native';
import React from 'react';
import { View, TouchableOpacity } from 'react-native';

import { Box } from '@/components/primitives/Box';
import { Text } from '@/components/primitives/Text';
import { useResponsiveDimensions } from '@/hooks/useResponsiveDimensions';
import { useTheme } from '@/theme';
import { Tokens, ColorTokens } from '@/theme/tokens';

export interface WelcomeHeaderProps {
  /** Nome do usuário */
  userName: string;
  /** Avatar URL (opcional) */
  avatarUrl?: string;
  /** Saudação customizada (opcional) */
  greeting?: string;
}

/**
 * Retorna saudação baseada no horário
 */
function getTimeBasedGreeting(): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'Bom dia';
  if (hour >= 12 && hour < 18) return 'Boa tarde';
  return 'Boa noite';
}

export function WelcomeHeader({ userName, avatarUrl, greeting }: WelcomeHeaderProps) {
  const { colors, isDark, toggleTheme } = useTheme();
  const { avatarSize } = useResponsiveDimensions();
  const displayGreeting = greeting || getTimeBasedGreeting();

  // Avatar padrão da Nathália
  const defaultAvatar = 'https://i.imgur.com/GDYdiuy.jpg';

  const handleThemeToggle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    toggleTheme();
  };

  return (
    <Box
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: Tokens.spacing['3'],
      }}
    >
      {/* Avatar + Saudação */}
      <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
        {/* Avatar circular (responsivo) */}
        <View
          style={{
            width: avatarSize,
            height: avatarSize,
            borderRadius: Tokens.radius.full,
            overflow: 'hidden',
            marginRight: Tokens.spacing['3'],
            borderWidth: 2,
            borderColor: ColorTokens.success[400],
            ...Tokens.shadows.md,
          }}
          accessibilityLabel={`Avatar de ${userName}`}
          accessibilityHint="Sua foto de perfil"
        >
          <Image
            source={{ uri: avatarUrl || defaultAvatar }}
            style={{ width: '100%', height: '100%' }}
            contentFit="cover"
            transition={200}
            cachePolicy="memory-disk"
          />
          {/* Badge "V" online (responsivo) */}
          <View
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              width: Math.max(16, Math.floor(avatarSize * 0.375)), // ~37.5% do avatar, mínimo 16
              height: Math.max(16, Math.floor(avatarSize * 0.375)),
              borderRadius: Tokens.radius.full,
              backgroundColor: ColorTokens.success[500],
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 2,
              borderColor: isDark ? ColorTokens.neutral[900] : ColorTokens.neutral[0],
            }}
          >
            <Text
              style={{
                color: ColorTokens.neutral[0],
                fontSize: Math.max(8, Math.floor(avatarSize * 0.208)), // ~20.8% do avatar, mínimo 8
                fontWeight: '700',
              }}
            >
              V
            </Text>
          </View>
        </View>

        {/* Texto de saudação */}
        <View style={{ flex: 1 }}>
          <Text
            size="xs"
            weight="semibold"
            style={{
              color: colors.text.secondary,
              textTransform: 'uppercase',
              letterSpacing: 1,
              marginBottom: 2,
            }}
          >
            {displayGreeting}
          </Text>
          <Text size="xl" weight="bold" color="primary" numberOfLines={1}>
            Bem-vinda{userName ? `, ${userName}` : ''}
          </Text>
        </View>
      </View>

      {/* Theme Toggle */}
      <TouchableOpacity
        onPress={handleThemeToggle}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={isDark ? 'Mudar para modo claro' : 'Mudar para modo escuro'}
        accessibilityHint="Alterna entre tema claro e escuro"
        style={{
          width: 44,
          height: 44,
          borderRadius: Tokens.radius.full,
          backgroundColor: isDark ? ColorTokens.warning[500] : ColorTokens.neutral[800],
          alignItems: 'center',
          justifyContent: 'center',
          ...Tokens.shadows.sm,
        }}
      >
        {isDark ? (
          <Sun size={22} color={ColorTokens.neutral[900]} />
        ) : (
          <Moon size={22} color={ColorTokens.neutral[0]} />
        )}
      </TouchableOpacity>
    </Box>
  );
}

export default WelcomeHeader;
