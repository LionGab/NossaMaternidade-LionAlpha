/**
 * NotFoundScreen - Tela 404 adaptada do design web
 *
 * Features:
 * - Layout centralizado
 * - SafeAreaInsets
 * - Design tokens
 * - Acessibilidade WCAG AAA
 *
 * @version 1.0.0
 */

import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';

import { SafeAreaContainer } from '@/components/layout/SafeAreaContainer';
import { Box } from '@/components/atoms/Box';
import { Button } from '@/components/atoms/Button';
import { Text } from '@/components/atoms/Text';
import type { RootStackParamList } from '@/navigation/types';
import { useTheme } from '@/theme';
import { Tokens } from '@/theme/tokens';

type NotFoundNavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function NotFoundScreen() {
  const navigation = useNavigation<NotFoundNavigationProp>();
  const { colors } = useTheme();

  const handleGoHome = () => {
    navigation.navigate('Main', { screen: 'Home' });
  };

  return (
    <SafeAreaContainer edges={['top', 'bottom']} backgroundColor={colors.background.canvas}>
      <Box
        flex={1}
        align="center"
        justify="center"
        p="6"
        style={{
          minHeight: '100%',
        }}
      >
        <Text
          variant="body"
          size="3xl"
          weight="bold"
          style={{
            marginBottom: Tokens.spacing['4'],
            fontSize: 48,
          }}
        >
          404
        </Text>
        <Text
          variant="body"
          size="xl"
          weight="bold"
          color="secondary"
          style={{
            marginBottom: Tokens.spacing['4'],
          }}
        >
          Oops! Página não encontrada
        </Text>
        <Text
          variant="body"
          size="md"
          color="tertiary"
          align="center"
          style={{
            marginBottom: Tokens.spacing['8'],
            maxWidth: 300,
          }}
        >
          A página que você está procurando não existe ou foi movida.
        </Text>
        <Button
          title="Voltar para Home"
          onPress={handleGoHome}
          variant="primary"
          size="lg"
          fullWidth={false}
          accessibilityLabel="Voltar para a tela inicial"
          accessibilityHint="Navega de volta para a tela principal do aplicativo"
        />
      </Box>
    </SafeAreaContainer>
  );
}
