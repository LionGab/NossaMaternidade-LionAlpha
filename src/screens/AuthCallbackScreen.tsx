/**
 * AuthCallbackScreen - Processa OAuth callbacks
 *
 * Esta tela é exibida brevemente enquanto o Supabase processa
 * os tokens de autenticação do OAuth (Google/Apple).
 *
 * O redirecionamento para Main ou Onboarding é feito automaticamente
 * pelo AuthContext quando a sessão é detectada.
 */

import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Box } from '../components/atoms/Box';
import { Heading } from '../components/atoms/Heading';
import { Text } from '../components/atoms/Text';
import type { RootStackParamList } from '../navigation/types';
import { profileService } from '../services/profileService';
import { supabase } from '../services/supabase';
import { useTheme } from '../theme/ThemeContext';
import { logger } from '../utils/logger';

export default function AuthCallbackScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { colors } = useTheme();

  useEffect(() => {
    const processCallback = async () => {
      try {
        logger.info('[AuthCallback] Processando OAuth callback...');

        // Verificar se há uma sessão válida
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          logger.error('[AuthCallback] Erro ao obter sessão', error);
          navigation.replace('Auth');
          return;
        }

        if (!session) {
          logger.warn('[AuthCallback] Nenhuma sessão encontrada após callback');
          navigation.replace('Auth');
          return;
        }

        logger.info('[AuthCallback] Sessão OAuth válida', { userId: session.user.id });

        // Verificar se usuário completou onboarding
        const profile = await profileService.getCurrentProfile();

        if (profile?.onboarding_completed) {
          logger.info('[AuthCallback] Usuário já completou onboarding, indo para Main');
          navigation.replace('Main');
        } else {
          logger.info('[AuthCallback] Usuário precisa completar onboarding');
          navigation.replace('Onboarding');
        }
      } catch (error) {
        logger.error('[AuthCallback] Erro inesperado no processamento', error);
        navigation.replace('Auth');
      }
    };

    // Aguardar um momento para o Supabase processar os tokens da URL
    const timer = setTimeout(processCallback, 500);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background.canvas }}
      edges={['top', 'bottom']}
    >
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          padding: 24,
        }}
      >
        <Box align="center" gap="6">
          <ActivityIndicator size="large" color={colors.primary.main} />

          <Heading level="h4" align="center">
            Finalizando login...
          </Heading>

          <Text size="sm" color="secondary" align="center">
            Aguarde enquanto validamos sua conta.
          </Text>
        </Box>
      </View>
    </SafeAreaView>
  );
}
