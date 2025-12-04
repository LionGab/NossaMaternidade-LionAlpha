/**
 * ResetPasswordScreen - Tela para redefinir senha
 *
 * Exibida quando o usuário clica no link de reset de senha
 * enviado por email. Permite definir uma nova senha.
 */

import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Eye, EyeOff, Lock, CheckCircle } from 'lucide-react-native';
import React, { useState, useEffect } from 'react';
import { View, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Input } from '../components/Input';
import { Box } from '../components/primitives/Box';
import { Button } from '../components/primitives/Button';
import { HapticButton } from '../components/primitives/HapticButton';
import { Heading } from '../components/primitives/Heading';
import { Text } from '../components/primitives/Text';
import { useHaptics } from '../hooks/useHaptics';
import type { RootStackParamList } from '../navigation/types';
import { authService } from '../services/authService';
import { supabase } from '../services/supabase';
import { useTheme } from '../theme/ThemeContext';
import { Spacing } from '../theme/tokens';
import { logger } from '../utils/logger';

export default function ResetPasswordScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { colors } = useTheme();
  const haptics = useHaptics();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [isValidSession, setIsValidSession] = useState<boolean | null>(null);

  useEffect(() => {
    // Verificar se há uma sessão válida (necessária para reset de senha)
    const checkSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        setIsValidSession(!!session);

        if (!session) {
          logger.warn('[ResetPassword] Nenhuma sessão válida para reset de senha');
        }
      } catch (error) {
        logger.error('[ResetPassword] Erro ao verificar sessão', error);
        setIsValidSession(false);
      }
    };

    checkSession();
  }, []);

  const validatePassword = (value: string): string | null => {
    if (!value.trim()) {
      return 'Senha é obrigatória';
    }
    if (value.length < 6) {
      return 'Senha deve ter pelo menos 6 caracteres';
    }
    if (value.length > 72) {
      return 'Senha deve ter no máximo 72 caracteres';
    }
    return null;
  };

  const validateConfirmPassword = (value: string): string | null => {
    if (!value.trim()) {
      return 'Confirmação de senha é obrigatória';
    }
    if (value !== password) {
      return 'As senhas não conferem';
    }
    return null;
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    setPasswordError(validatePassword(value));
    if (confirmPassword) {
      setConfirmError(value !== confirmPassword ? 'As senhas não conferem' : null);
    }
  };

  const handleConfirmPasswordChange = (value: string) => {
    setConfirmPassword(value);
    setConfirmError(validateConfirmPassword(value));
  };

  const handleSubmit = async () => {
    const passError = validatePassword(password);
    const confError = validateConfirmPassword(confirmPassword);

    setPasswordError(passError);
    setConfirmError(confError);

    if (passError || confError) {
      haptics.error();
      return;
    }

    setIsLoading(true);
    haptics.light();

    try {
      logger.info('[ResetPassword] Atualizando senha...');

      const { error } = await authService.updatePassword(password);

      if (error) {
        logger.error('[ResetPassword] Erro ao atualizar senha', error);
        haptics.error();
        Alert.alert(
          'Erro',
          'Não foi possível atualizar sua senha. O link pode ter expirado. Solicite um novo link de recuperação.'
        );
        return;
      }

      logger.info('[ResetPassword] Senha atualizada com sucesso');
      haptics.success();
      setIsSuccess(true);

      // Aguardar 2 segundos e redirecionar para login
      setTimeout(() => {
        navigation.replace('Auth');
      }, 2000);
    } catch (error) {
      logger.error('[ResetPassword] Erro inesperado', error);
      haptics.error();
      Alert.alert('Erro', 'Ocorreu um erro inesperado. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    haptics.light();
    navigation.replace('Auth');
  };

  // Tela de sucesso
  if (isSuccess) {
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
            padding: Spacing['6'],
          }}
        >
          <Box align="center" gap="6">
            <View
              style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                backgroundColor: colors.status.success + '20',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <CheckCircle size={48} color={colors.status.success} />
            </View>

            <Heading level="h3" align="center">
              Senha atualizada!
            </Heading>

            <Text size="md" color="secondary" align="center">
              Sua senha foi alterada com sucesso.{'\n'}
              Redirecionando para o login...
            </Text>
          </Box>
        </View>
      </SafeAreaView>
    );
  }

  // Tela de sessão inválida
  if (isValidSession === false) {
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
            padding: Spacing['6'],
          }}
        >
          <Box align="center" gap="6">
            <Heading level="h3" align="center">
              Link expirado
            </Heading>

            <Text size="md" color="secondary" align="center" style={{ maxWidth: 280 }}>
              Este link de recuperação expirou ou já foi utilizado. Solicite um novo link na tela de
              login.
            </Text>

            <Button
              title="Voltar ao login"
              onPress={handleBackToLogin}
              variant="primary"
              size="lg"
              fullWidth
              style={{ marginTop: Spacing['4'] }}
            />
          </Box>
        </View>
      </SafeAreaView>
    );
  }

  // Loading inicial
  if (isValidSession === null) {
    return (
      <SafeAreaView
        style={{ flex: 1, backgroundColor: colors.background.canvas }}
        edges={['top', 'bottom']}
      >
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text size="md" color="secondary">
            Verificando link...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.canvas }} edges={['top']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
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
          {/* Header */}
          <Box align="center" mb="10" style={{ marginTop: Spacing['8'] }}>
            <View
              style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                backgroundColor: colors.primary.light,
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: Spacing['4'],
              }}
            >
              <Lock size={36} color={colors.primary.main} />
            </View>

            <Heading level="h3" align="center">
              Nova senha
            </Heading>

            <Text
              size="sm"
              color="secondary"
              align="center"
              style={{ marginTop: Spacing['2'], maxWidth: 280 }}
            >
              Digite sua nova senha. Ela deve ter pelo menos 6 caracteres.
            </Text>
          </Box>

          {/* Form */}
          <Box gap="4">
            {/* Nova senha */}
            <Input
              label="NOVA SENHA"
              placeholder="Digite sua nova senha"
              value={password}
              onChangeText={handlePasswordChange}
              secureTextEntry={!showPassword}
              autoComplete="new-password"
              autoCapitalize="none"
              autoCorrect={false}
              textContentType="newPassword"
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
              accessibilityLabel="Campo de nova senha"
            />

            {/* Confirmar senha */}
            <Input
              label="CONFIRMAR SENHA"
              placeholder="Digite a senha novamente"
              value={confirmPassword}
              onChangeText={handleConfirmPasswordChange}
              secureTextEntry={!showConfirmPassword}
              autoComplete="new-password"
              autoCapitalize="none"
              autoCorrect={false}
              textContentType="newPassword"
              leftIcon={
                <Lock size={18} color={confirmError ? colors.status.error : colors.text.tertiary} />
              }
              rightIcon={
                <HapticButton
                  variant="ghost"
                  size="sm"
                  onPress={() => {
                    setShowConfirmPassword(!showConfirmPassword);
                    haptics.light();
                  }}
                  accessibilityLabel={showConfirmPassword ? 'Ocultar senha' : 'Mostrar senha'}
                  style={{ padding: 4 }}
                >
                  {showConfirmPassword ? (
                    <EyeOff size={18} color={colors.text.tertiary} />
                  ) : (
                    <Eye size={18} color={colors.text.tertiary} />
                  )}
                </HapticButton>
              }
              error={confirmError || undefined}
              disabled={isLoading}
              accessibilityLabel="Campo de confirmação de senha"
            />
          </Box>

          {/* Submit button */}
          <Button
            title={isLoading ? 'Atualizando...' : 'Atualizar senha'}
            onPress={handleSubmit}
            variant="primary"
            size="lg"
            loading={isLoading}
            disabled={isLoading || !password || !confirmPassword}
            fullWidth
            style={{ marginTop: Spacing['8'] }}
            accessibilityLabel="Atualizar senha"
          />

          {/* Back to login */}
          <Box align="center" style={{ marginTop: Spacing['6'] }}>
            <HapticButton
              variant="ghost"
              size="sm"
              onPress={handleBackToLogin}
              accessibilityLabel="Voltar ao login"
            >
              <Text size="sm" color="link">
                Voltar ao login
              </Text>
            </HapticButton>
          </Box>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
