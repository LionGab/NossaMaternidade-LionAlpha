/**
 * NavLink - Componente de navegação para React Native
 * Equivalente ao NavLink do React Router, mas usando React Navigation
 * Convertido do componente web para React Native
 */

import { useNavigation, useRoute } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import React from 'react';
import { TouchableOpacity, ViewStyle, TextStyle } from 'react-native';

import { Text } from '@/components/atoms/Text';
import { useTheme } from '@/theme';
import { Tokens } from '@/theme/tokens';
import { logger } from '@/utils/logger';

export interface NavLinkProps {
  /** Nome da rota para navegar */
  to: string;
  /** Label do link */
  label: string;
  /** Ícone do link */
  icon: React.ComponentType<{ size: number; color: string }>;
  /** Estilo customizado do container */
  containerStyle?: ViewStyle;
  /** Estilo customizado do texto */
  textStyle?: TextStyle;
  /** Classe CSS ativa (não usado em RN, mas mantido para compatibilidade) */
  activeClassName?: string;
  /** Callback ao pressionar */
  onPress?: () => void;
}

export const NavLink: React.FC<NavLinkProps> = ({
  to,
  label,
  icon: Icon,
  containerStyle,
  textStyle,
  activeClassName: _activeClassName,
  onPress,
}) => {
  const navigation = useNavigation<NavigationProp<Record<string, object | undefined>>>();
  const route = useRoute();
  const { colors } = useTheme();

  // Verificar se a rota está ativa
  const isActive = route.name === to || route.name === to.split('/')[0];

  const handlePress = () => {
    logger.info('NavLink pressed', { to, label, screen: route.name });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (onPress) {
      onPress();
    } else {
      // Navegar para a rota
      try {
        navigation.navigate(to as never);
      } catch (error) {
        logger.error('Failed to navigate', error, { to, label });
      }
    }
  };

  const activeColor = isActive ? colors.primary.main : colors.text.tertiary;
  const activeBackgroundColor = isActive
    ? `${colors.primary.main}1A` // 10% opacity
    : 'transparent';

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: isActive }}
      style={[
        {
          flexDirection: 'column',
          alignItems: 'center',
          gap: Tokens.spacing['1'],
          paddingHorizontal: Tokens.spacing['3'],
          paddingVertical: Tokens.spacing['2'],
          borderRadius: Tokens.radius.xl,
          backgroundColor: activeBackgroundColor,
          minHeight: Tokens.touchTargets.min,
          minWidth: Tokens.touchTargets.min,
        },
        containerStyle,
      ]}
    >
      <Icon size={20} color={activeColor} />
      <Text size="xs" weight="medium" color={isActive ? 'primary' : 'tertiary'} style={textStyle}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

export default NavLink;
