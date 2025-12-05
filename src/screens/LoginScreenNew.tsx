/**
 * LoginScreenNew - Tela de Login Robusta e Moderna
 *
 * Design System completo com:
 * - Validação visual em tempo real
 * - Animações suaves
 * - Feedback háptico
 * - Dark mode completo
 * - Acessibilidade WCAG AAA
 *
 * @version 2.0.0
 * @date 2025-11-27
 */

import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Image } from 'expo-image';
import { Eye, EyeOff, ChevronLeft, Sun, Moon, Apple, Mail, Lock } from 'lucide-react-native';
import React, { useState, useRef } from 'react';
import { View, ScrollView, Alert, Animated, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Input } from '../components/Input';
import { Box } from '../components/atoms/Box';
import { Button } from '../components/atoms/Button';
import { HapticButton } from '../components/atoms/HapticButton';
import { Heading } from '../components/atoms/Heading';
import { Text } from '../components/atoms/Text';
import { useHaptics } from '../hooks/useHaptics';
import type { RootStackParamList } from '../navigation/types';
import { authService } from '../services/authService';
import { profileService } from '../services/profileService';
import { useTheme } from '../theme/ThemeContext';
import { Spacing, Radius } from '../theme/tokens';
import { logger } from '../utils/logger';
import { getShadowFromToken } from '../utils/shadowHelper';
import { isValidEmail } from '../utils/validation';

interface LoginScreenProps {
  onLogin?: () => void;
  onBack?: () => void;
}

export default function LoginScreen({ onLogin, onBack }: LoginScreenProps) {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { isDark, toggleTheme, colors } = useTheme();
  const haptics = useHaptics();

  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Validation state
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const errorShakeAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const shakeError = () => {
    Animated.sequence([
      Animated.timing(errorShakeAnim, {
        toValue: 10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(errorShakeAnim, {
        toValue: -10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(errorShakeAnim, {
        toValue: 10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(errorShakeAnim, {
        toValue: 0,
        duration: 50,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const validateEmail = (value: string): string | null => {
    if (!value.trim()) {
      return 'E-mail é obrigatório';
    }
    if (!isValidEmail(value)) {
      return 'Digite um e-mail válido';
    }
    return null;
  };

  const validatePassword = (value: string): string | null => {
    if (!value.trim()) {
      return 'Senha é obrigatória';
    }
    if (value.length < 6) {
      return 'Senha deve ter pelo menos 6 caracteres';
    }
    return null;
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (emailTouched) {
      const error = validateEmail(value);
      setEmailError(error);
      if (error) {
        haptics.light();
      }
    }
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    if (passwordTouched) {
      const error = validatePassword(value);
      setPasswordError(error);
      if (error) {
        haptics.light();
      }
    }
  };

  const handleEmailBlur = () => {
    setEmailTouched(true);
    const error = validateEmail(email);
    setEmailError(error);
    if (error) {
      shakeError();
      haptics.error();
    }
  };

  const handlePasswordBlur = () => {
    setPasswordTouched(true);
    const error = validatePassword(password);
    setPasswordError(error);
    if (error) {
      shakeError();
      haptics.error();
    }
  };

  const validateForm = (): boolean => {
    const emailErr = validateEmail(email);
    const passwordErr = validatePassword(password);

    setEmailError(emailErr);
    setPasswordError(passwordErr);
    setEmailTouched(true);
    setPasswordTouched(true);

    if (emailErr || passwordErr) {
      shakeError();
      haptics.error();
      return false;
    }

    return true;
  };

  const handleLogin = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    haptics.light();

    try {
      logger.info('[LoginScreen] Tentando fazer login', { email });

      const { user, session, error } = await authService.signIn({
        email: email.trim(),
        password,
      });

      if (error) {
        logger.error('[LoginScreen] Erro no login', error);
        haptics.error();
        shakeError();

        // Mensagens de erro mais amigáveis
        let errorMessage = 'Não foi possível fazer login. Tente novamente.';
        if (error.message.includes('Invalid login credentials')) {
          errorMessage = 'E-mail ou senha incorretos. Verifique e tente novamente.';
          setPasswordError('Senha incorreta');
        } else if (error.message.includes('Email not confirmed')) {
          errorMessage = 'Por favor, confirme seu e-mail antes de fazer login.';
          setEmailError('E-mail não confirmado');
        }

        Alert.alert('Erro no login', errorMessage);
        return;
      }

      if (user && session) {
        logger.info('[LoginScreen] Login realizado com sucesso', { userId: user.id });
        haptics.success();

        // Verificar se usuário já completou onboarding
        const profile = await profileService.getCurrentProfile();

        if (onLogin) {
          onLogin();
        } else if (profile?.onboarding_completed) {
          navigation.navigate('Main' as never);
        } else {
          navigation.navigate('Onboarding' as never);
        }
      }
    } catch (error) {
      logger.error('[LoginScreen] Erro inesperado no login', error);
      haptics.error();
      shakeError();
      Alert.alert('Erro', 'Ocorreu um erro inesperado. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  // Login social configurável via variável de ambiente
  // Por padrão habilitado em produção, pode ser desabilitado via EXPO_PUBLIC_SOCIAL_LOGIN_ENABLED=false
  // Para configurar OAuth: https://supabase.com/dashboard > Authentication > Providers
  const SOCIAL_LOGIN_ENABLED = process.env.EXPO_PUBLIC_SOCIAL_LOGIN_ENABLED !== 'false';

  const handleSocialLogin = async (provider: 'apple' | 'google') => {
    // Verificar se login social está habilitado
    if (!SOCIAL_LOGIN_ENABLED) {
      haptics.warning();
      Alert.alert(
        'Em breve! 🚀',
        `O login com ${provider === 'apple' ? 'Apple' : 'Google'} estará disponível em breve.\n\nPor enquanto, use email e senha para entrar.`,
        [{ text: 'OK', style: 'default' }]
      );
      return;
    }

    setIsLoading(true);
    haptics.light();

    try {
      logger.info(`[LoginScreen] Tentando login com ${provider}`);

      const result =
        provider === 'apple'
          ? await authService.signInWithApple()
          : await authService.signInWithGoogle();

      if (result.error) {
        logger.error(`[LoginScreen] Erro no login ${provider}`, result.error);
        haptics.error();
        Alert.alert(
          'Erro no login',
          `Não foi possível fazer login com ${provider === 'apple' ? 'Apple' : 'Google'}. Tente novamente.`
        );
        return;
      }

      // OAuth redireciona para callback, então não navegamos aqui
      // O callback será tratado pelo AuthContext
      haptics.success();
      logger.info(`[LoginScreen] Redirecionando para ${provider} OAuth`);
    } catch (error) {
      logger.error(`[LoginScreen] Erro inesperado no login ${provider}`, error);
      haptics.error();
      Alert.alert(
        'Erro',
        `Ocorreu um erro ao fazer login com ${provider === 'apple' ? 'Apple' : 'Google'}.`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      Alert.alert(
        'E-mail necessário',
        'Por favor, digite seu e-mail no campo acima para recuperar sua senha.'
      );
      return;
    }

    if (!isValidEmail(email)) {
      Alert.alert('E-mail inválido', 'Por favor, digite um e-mail válido.');
      return;
    }

    haptics.light();

    try {
      logger.info('[LoginScreen] Solicitando recuperação de senha', { email });

      const { error } = await authService.resetPassword(email.trim());

      if (error) {
        logger.error('[LoginScreen] Erro ao resetar senha', error);
        haptics.error();
        Alert.alert(
          'Erro',
          'Não foi possível enviar o e-mail de recuperação. Verifique seu e-mail e tente novamente.'
        );
        return;
      }

      haptics.success();
      Alert.alert(
        'E-mail enviado!',
        'Enviamos um link de recuperação para seu e-mail. Verifique sua caixa de entrada.'
      );
    } catch (error) {
      logger.error('[LoginScreen] Erro inesperado ao resetar senha', error);
      haptics.error();
      Alert.alert('Erro', 'Ocorreu um erro ao solicitar recuperação de senha.');
    }
  };

  const handleSignUp = () => {
    haptics.light();
    navigation.navigate('Onboarding');
  };

  const handleBack = () => {
    haptics.light();
    if (onBack) {
      onBack();
    } else {
      navigation.goBack();
    }
  };

  const animatedStyle = {
    opacity: fadeAnim,
    transform: [{ translateY: slideAnim }],
  };

  const errorShakeStyle = {
    transform: [{ translateX: errorShakeAnim }],
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.canvas }} edges={['top']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            flexGrow: 1,
            padding: Spacing['6'],
            paddingBottom: Spacing['10'],
          }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View style={animatedStyle}>
            {/* Top Navigation */}
            <Box direction="row" justify="space-between" align="center" mb="8">
              <HapticButton
                variant="ghost"
                size="sm"
                onPress={handleBack}
                accessibilityLabel="Voltar"
                accessibilityHint="Retorna para a tela anterior"
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: Radius.full,
                  backgroundColor: colors.background.card,
                  alignItems: 'center',
                  justifyContent: 'center',
                  ...getShadowFromToken('md', colors.text.primary),
                }}
              >
                <ChevronLeft size={22} color={colors.text.primary} />
              </HapticButton>

              <HapticButton
                variant="ghost"
                size="sm"
                onPress={toggleTheme}
                accessibilityLabel={
                  isDark ? 'Alternar para modo claro' : 'Alternar para modo escuro'
                }
                accessibilityHint="Muda o tema entre claro e escuro"
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: Radius.full,
                  backgroundColor: colors.background.card,
                  borderWidth: 1,
                  borderColor: colors.border.light,
                  alignItems: 'center',
                  justifyContent: 'center',
                  ...getShadowFromToken('md', colors.text.primary),
                }}
              >
                {isDark ? (
                  <Sun size={20} color={colors.text.primary} />
                ) : (
                  <Moon size={20} color={colors.text.primary} />
                )}
              </HapticButton>
            </Box>

            {/* Header */}
            <Box align="center" mb="10">
              <View
                style={{
                  width: 100,
                  height: 100,
                  borderRadius: 50,
                  overflow: 'hidden',
                  marginBottom: Spacing['4'],
                  backgroundColor: isDark ? colors.background.card : colors.primary.light,
                  borderWidth: 4,
                  borderColor: isDark ? colors.border.dark : colors.background.card,
                  ...getShadowFromToken(
                    'xl',
                    isDark ? colors.background.canvas : colors.primary.main
                  ),
                }}
              >
                <Image
                  source={{ uri: 'https://i.imgur.com/GDYdiuy.jpg' }}
                  style={{ width: '100%', height: '100%' }}
                  contentFit="cover"
                  transition={200}
                />
              </View>

              <Box mb="1" align="center">
                <Heading level="h3" weight="bold" align="center">
                  Bem-vinda de volta
                </Heading>
              </Box>

              <Text size="sm" align="center" color="secondary" style={{ maxWidth: '80%' }}>
                Entre para acessar seu espaço seguro.
              </Text>
            </Box>

            {/* Form */}
            <Animated.View style={errorShakeStyle}>
              {/* Email Input */}
              <Input
                label="E-MAIL"
                placeholder="exemplo@email.com"
                value={email}
                onChangeText={handleEmailChange}
                onBlur={handleEmailBlur}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                autoCorrect={false}
                textContentType="emailAddress"
                leftIcon={
                  <Mail size={18} color={emailError ? colors.status.error : colors.text.tertiary} />
                }
                error={emailError || undefined}
                disabled={isLoading}
                containerStyle={{ marginBottom: Spacing['4'] }}
                accessibilityLabel="Campo de e-mail"
                accessibilityHint="Digite seu endereço de e-mail"
              />

              {/* Password Input */}
              <Input
                label="SENHA"
                placeholder="••••••••"
                value={password}
                onChangeText={handlePasswordChange}
                onBlur={handlePasswordBlur}
                secureTextEntry={!showPassword}
                autoComplete="password"
                autoCapitalize="none"
                autoCorrect={false}
                textContentType="password"
                leftIcon={
                  <Lock
                    size={18}
                    color={passwordError ? colors.status.error : colors.text.tertiary}
                  />
                }
                rightIcon={
                  <HapticButton
                    variant="ghost"
                    size="sm"
                    onPress={() => {
                      setShowPassword(!showPassword);
                      haptics.light();
                    }}
                    accessibilityLabel={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                    accessibilityHint="Alterna a visibilidade da senha"
                    style={{ padding: 4 }}
                  >
                    {showPassword ? (
                      <EyeOff size={18} color={colors.text.tertiary} />
                    ) : (
                      <Eye size={18} color={colors.text.tertiary} />
                    )}
                  </HapticButton>
                }
                error={passwordError || undefined}
                disabled={isLoading}
                containerStyle={{ marginBottom: Spacing['2'] }}
                accessibilityLabel="Campo de senha"
                accessibilityHint="Digite sua senha"
              />
            </Animated.View>

            {/* Forgot Password Link */}
            <Box align="flex-end" mb="6">
              <HapticButton
                variant="ghost"
                size="sm"
                onPress={handleForgotPassword}
                accessibilityLabel="Esqueceu a senha"
                accessibilityHint="Abre diálogo para recuperar senha"
              >
                <Text
                  size="xs"
                  weight="semibold"
                  color="link"
                  style={{ textDecorationLine: 'underline' }}
                >
                  Esqueceu a senha?
                </Text>
              </HapticButton>
            </Box>

            {/* Login Button */}
            <Button
              title={isLoading ? 'Entrando...' : 'Entrar'}
              onPress={handleLogin}
              variant="primary"
              size="lg"
              loading={isLoading}
              disabled={isLoading}
              fullWidth
              style={{ marginBottom: Spacing['6'] }}
              accessibilityLabel="Entrar"
              accessibilityHint="Faz login com e-mail e senha"
            />

            {/* Divider */}
            <Box direction="row" align="center" mb="6">
              <View
                style={{
                  height: 1,
                  flex: 1,
                  backgroundColor: colors.border.light,
                }}
              />
              <Text
                size="xs"
                weight="semibold"
                color="tertiary"
                style={{
                  textTransform: 'uppercase',
                  letterSpacing: 2,
                  marginHorizontal: Spacing['4'],
                }}
              >
                Ou continue com
              </Text>
              <View
                style={{
                  height: 1,
                  flex: 1,
                  backgroundColor: colors.border.light,
                }}
              />
            </Box>

            {/* Social Login */}
            <Box mb="6">
              <HapticButton
                variant="outline"
                size="lg"
                onPress={() => handleSocialLogin('apple')}
                disabled={isLoading}
                style={{
                  width: '100%',
                  marginBottom: Spacing['3'],
                  backgroundColor: colors.background.card,
                  borderColor: colors.border.light,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingVertical: Spacing['4'],
                  borderRadius: Radius.lg,
                  opacity: SOCIAL_LOGIN_ENABLED ? 1 : 0.6,
                }}
                accessibilityLabel={
                  SOCIAL_LOGIN_ENABLED ? 'Continuar com Apple' : 'Login com Apple em breve'
                }
                accessibilityHint={
                  SOCIAL_LOGIN_ENABLED
                    ? 'Faz login usando sua conta Apple'
                    : 'Este recurso estará disponível em breve'
                }
              >
                <Apple
                  size={20}
                  color={colors.text.primary}
                  style={{ marginRight: Spacing['2'] }}
                />
                <Text size="md" weight="semibold" color="primary">
                  {SOCIAL_LOGIN_ENABLED ? 'Continuar com Apple' : 'Apple (em breve)'}
                </Text>
              </HapticButton>

              <HapticButton
                variant="outline"
                size="lg"
                onPress={() => handleSocialLogin('google')}
                disabled={isLoading}
                style={{
                  width: '100%',
                  backgroundColor: colors.background.card,
                  borderColor: colors.border.light,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingVertical: Spacing['4'],
                  borderRadius: Radius.lg,
                  opacity: SOCIAL_LOGIN_ENABLED ? 1 : 0.6,
                }}
                accessibilityLabel={
                  SOCIAL_LOGIN_ENABLED ? 'Continuar com Google' : 'Login com Google em breve'
                }
                accessibilityHint={
                  SOCIAL_LOGIN_ENABLED
                    ? 'Faz login usando sua conta Google'
                    : 'Este recurso estará disponível em breve'
                }
              >
                <View
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: 10,
                    backgroundColor: colors.primary.main,
                    marginRight: Spacing['2'],
                  }}
                />
                <Text size="md" weight="semibold" color="primary">
                  {SOCIAL_LOGIN_ENABLED ? 'Continuar com Google' : 'Google (em breve)'}
                </Text>
              </HapticButton>
            </Box>

            {/* Sign Up Link */}
            <Box align="center">
              <HapticButton
                variant="ghost"
                size="sm"
                onPress={handleSignUp}
                accessibilityLabel="Criar conta"
                accessibilityHint="Navega para tela de cadastro"
              >
                <Text size="xs" color="tertiary" align="center">
                  Ainda não tem conta?{' '}
                  <Text
                    size="xs"
                    weight="bold"
                    color="link"
                    style={{ textDecorationLine: 'underline' }}
                  >
                    Criar agora
                  </Text>
                </Text>
              </HapticButton>
            </Box>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
