import { NavigationContainer, LinkingOptions } from '@react-navigation/native';
import * as Linking from 'expo-linking';
import React, { useEffect } from 'react';

import { StackNavigator } from './StackNavigator';
import type { RootStackParamList } from './types';
import { AuthProvider } from '../contexts/AuthContext';
import { supabase } from '../services/supabase';
import { logger } from '../utils/logger';
import { networkMonitor } from '../utils/networkMonitor';

/**
 * Deep Linking Configuration
 *
 * URL Scheme canônico: nossamaternidade://
 *
 * Rotas suportadas:
 * - nossamaternidade://auth/callback - OAuth callback (Apple/Google)
 * - nossamaternidade://auth/reset-password - Password reset
 * - nossamaternidade://main/* - Tabs principais
 *
 * O Supabase processa os tokens OAuth automaticamente via URL e
 * atualiza a sessão através do onAuthStateChange no AuthContext.
 */
const linking: LinkingOptions<RootStackParamList> = {
  prefixes: [Linking.createURL('/'), 'nossamaternidade://', 'https://nossamaternidade.app'],
  config: {
    screens: {
      // OAuth callback - processa tokens de login social
      AuthCallback: 'auth/callback',
      // Reset de senha - exibe formulário para nova senha
      ResetPassword: 'auth/reset-password',
      // Login tradicional
      Auth: 'auth',
      Main: {
        screens: {
          Home: 'home',
          MaesValentes: 'comunidade',
          Chat: 'chat',
          MundoNath: 'conteudo',
          Habitos: 'habitos',
        },
      },
      ContentDetail: 'content/:contentId',
      Profile: 'profile',
      Settings: 'settings',
      Onboarding: 'onboarding',
    },
  },
  // Handler customizado para processar OAuth tokens antes da navegação
  async getInitialURL() {
    // Primeiro, verificar se há uma URL que abriu o app
    const url = await Linking.getInitialURL();

    if (url) {
      logger.debug('[Navigation] Initial URL:', { url });

      // Se for um callback OAuth, processar com Supabase
      if (url.includes('auth/callback') || url.includes('#access_token')) {
        try {
          // Supabase processa automaticamente os tokens da URL
          const { data, error } = await supabase.auth.getSession();
          if (error) {
            logger.error('[Navigation] Erro ao processar OAuth callback:', error);
          } else if (data.session) {
            logger.info('[Navigation] OAuth callback processado com sucesso');
          }
        } catch (err) {
          logger.error('[Navigation] Erro no processamento OAuth:', err);
        }
      }
    }

    return url;
  },
  // Listener para URLs enquanto o app está aberto
  subscribe(listener) {
    const linkingSubscription = Linking.addEventListener('url', async ({ url }) => {
      logger.debug('[Navigation] URL received while open:', { url });

      // Se for um callback OAuth, processar com Supabase
      if (url.includes('auth/callback') || url.includes('#access_token')) {
        try {
          // Para OAuth, o Supabase extrai tokens do fragmento da URL
          // e atualiza a sessão via onAuthStateChange
          const { data, error } = await supabase.auth.getSession();
          if (error) {
            logger.error('[Navigation] Erro ao processar OAuth:', error);
          } else if (data.session) {
            logger.info('[Navigation] Sessão OAuth atualizada');
          }
        } catch (err) {
          logger.error('[Navigation] Erro no processamento OAuth:', err);
        }
      }

      listener(url);
    });

    return () => {
      linkingSubscription.remove();
    };
  },
};

export const Navigation = () => {
  useEffect(() => {
    // Inicializar network monitor
    networkMonitor.startMonitoring().catch((error) => {
      logger.error('[Navigation] Erro ao inicializar network monitor', error);
    });

    return () => {
      networkMonitor.stopMonitoring();
    };
  }, []);

  return (
    <AuthProvider>
      <NavigationContainer linking={linking}>
        <StackNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
};

export default Navigation;
