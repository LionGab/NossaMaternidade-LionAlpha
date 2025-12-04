import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, Logo } from '../components';
import type { RootStackParamList } from '../navigation/types';
import { Tokens, ColorTokens } from '../theme';
import { useTheme } from '../theme/ThemeContext';
import { logger } from '../utils/logger';

// Manter splash screen visível enquanto carrega
SplashScreen.preventAutoHideAsync();

interface SplashScreenProps {
  onComplete?: () => void;
}

export default function SplashScreenComponent({ onComplete }: SplashScreenProps) {
  const { colors, isDark: _isDark } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);

  useEffect(() => {
    // Verificar se usuário já completou onboarding
    const checkOnboarding = async () => {
      try {
        const savedUser = await AsyncStorage.getItem('nath_user');
        setHasCompletedOnboarding(!!savedUser);
      } catch (error) {
        logger.warn('Erro ao verificar onboarding', error);
        setHasCompletedOnboarding(false);
      }
    };
    checkOnboarding();

    // Esconder splash após 2 segundos
    const timer = setTimeout(() => {
      SplashScreen.hideAsync();
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleStart = () => {
    if (onComplete) {
      onComplete();
    } else {
      // Navegar para Auth se já completou onboarding, senão para Onboarding
      if (hasCompletedOnboarding) {
        navigation.navigate('Auth');
      } else {
        navigation.navigate('Onboarding');
      }
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background.canvas }]}>
      <View style={styles.content}>
        {/* Top Title */}
        <View style={styles.titleContainer}>
          <Text style={[styles.title, { color: colors.text.primary }]}>Nossa{'\n'}Maternidade</Text>
        </View>

        {/* Center Image */}
        <View style={styles.imageContainer}>
          <View style={styles.logoWrapper}>
            <Logo size={256} variant="elevated" showShadow={true} />
          </View>

          {/* Quote */}
          <View style={styles.quoteContainer}>
            <Text style={[styles.quote, { color: colors.text.primary }]}>
              "Você é forte.{'\n'}Mesmo nos dias em que não parece."
            </Text>
          </View>
        </View>

        {/* Bottom Button */}
        <View style={styles.buttonContainer}>
          <Button
            title="Começar com a Nath"
            onPress={handleStart}
            fullWidth
            variant="primary"
            size="lg"
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Tokens.spacing['8'], // 32
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleContainer: {
    marginTop: Tokens.spacing['12'], // 48
  },
  title: {
    fontSize: Tokens.typography.sizes['4xl'], // 32 (próximo de 30)
    fontWeight: Tokens.typography.weights.bold, // '700'
    textAlign: 'center',
    lineHeight: Tokens.typography.lineHeights['3xl'], // 36
  },
  imageContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  logoWrapper: {
    width: 256,
    height: 256,
    borderRadius: 128,
    borderWidth: 4,
    overflow: 'hidden',
    marginBottom: Tokens.spacing['8'], // 32
    shadowColor: ColorTokens.neutral[900],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  quoteContainer: {
    maxWidth: 280,
  },
  quote: {
    fontSize: Tokens.typography.sizes.lg, // 18
    fontWeight: Tokens.typography.weights.medium, // '500'
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: Tokens.typography.lineHeights.lg, // 26
  },
  buttonContainer: {
    width: '100%',
    marginBottom: Tokens.spacing['8'], // 32
  },
});
