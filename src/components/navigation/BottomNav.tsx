/**
 * BottomNav - Navegação inferior customizada
 * Convertido do componente web para React Native
 *
 * Nota: O projeto já usa TabNavigator do React Navigation.
 * Este componente é uma alternativa customizada caso necessário.
 */

import { Home, Users, MessageCircle, Sparkles, Heart } from 'lucide-react-native';
import React from 'react';
import { View, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Box } from '@/components/atoms/Box';
import { useTheme } from '@/theme';
import { getPlatformShadow } from '@/theme/platform';
import { Tokens } from '@/theme/tokens';

import { NavLink } from './NavLink';

export interface BottomNavProps {
  /** Estilo customizado */
  style?: ViewStyle;
}

export const BottomNav: React.FC<BottomNavProps> = ({ style }) => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const navItems = [
    { icon: Home, label: 'Início', path: 'Home' },
    { icon: Users, label: 'Comunidade', path: 'MaesValentes' },
    { icon: MessageCircle, label: 'NathIA', path: 'Chat' },
    { icon: Sparkles, label: 'Mundo Naty', path: 'MundoNath' },
    { icon: Heart, label: 'Meus Cuidados', path: 'Habitos' },
  ];

  const containerStyle: ViewStyle = {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.background.card,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    paddingBottom: Math.max(insets.bottom, Tokens.spacing['2']),
    paddingTop: Tokens.spacing['2'],
    paddingHorizontal: Tokens.spacing['2'],
    zIndex: Tokens.zIndex.sticky,
    ...getPlatformShadow('xl'),
    ...style,
  };

  return (
    <View style={containerStyle}>
      <Box
        direction="row"
        align="center"
        justify="space-around"
        style={{
          maxWidth: 428, // Max width para centralizar em tablets
          alignSelf: 'center',
          width: '100%',
        }}
      >
        {navItems.map((item) => (
          <NavLink key={item.path} to={item.path} label={item.label} icon={item.icon} />
        ))}
      </Box>
    </View>
  );
};

export default BottomNav;
