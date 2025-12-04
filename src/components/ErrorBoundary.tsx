/* eslint-disable no-restricted-syntax */
/**
 * Error Boundary Global
 * Captura erros React e exibe UI de fallback user-friendly
 * Preparado para integração com Sentry
 *
 * ⚠️ Cores hardcoded intencionalmente - fallback quando tema quebra
 */

import { AlertTriangle, RefreshCw } from 'lucide-react-native';
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { captureException, addBreadcrumb } from '../services/sentry';
import { logger } from '../utils/logger';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string | null;
}

const isDevelopment = process.env.NODE_ENV === 'development' || __DEV__;

/**
 * Cores do Design System (inline para garantir funcionamento mesmo com erro de tema)
 * Valores sincronizados com src/theme/tokens.ts - ColorTokens
 *
 * ⚠️ IMPORTANTE: Manter hardcoded pois ErrorBoundary não pode depender de hooks/contexto.
 * Este componente precisa funcionar mesmo quando o sistema de tema quebra.
 * As cores aqui são uma cópia estática dos tokens para garantir fallback seguro.
 *
 * ESLint: no-restricted-syntax desabilitado no topo do arquivo.
 */
const colors = {
  background: '#FFFFFF', // ColorTokens.neutral[0]
  backgroundDark: '#F5F5F5', // ColorTokens.neutral[100]
  text: '#0F172A', // LightTheme.text.primary (Charcoal)
  textSecondary: '#475569', // LightTheme.text.tertiary (WCAG AAA)
  error: '#EF4444', // ColorTokens.error[500]
  errorLight: '#FEE2E2', // ColorTokens.error[100]
  primary: '#007AFF', // ColorTokens.primary[500] (Rosa Nathália)
  white: '#FFFFFF', // ColorTokens.neutral[0]
  shadowColor: '#171717', // ColorTokens.neutral[900]
};

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Gerar ID único para o erro
    const errorId = `ERR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Logar erro com contexto
    logger.error('[ErrorBoundary] Erro capturado', {
      errorId,
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    });

    this.setState({
      error,
      errorInfo,
      errorId,
    });

    // Callback para integração externa
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Enviar para Sentry (crash reporting)
    captureException(error, {
      tags: {
        errorBoundary: 'true',
        errorId,
      },
      extras: {
        componentStack: errorInfo.componentStack,
        message: error.message,
      },
      level: 'fatal',
    });

    // Adicionar breadcrumb para contexto
    addBreadcrumb({
      category: 'error',
      message: `ErrorBoundary capturou: ${error.message}`,
      level: 'error',
      data: { errorId },
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
    });
  };

  render() {
    if (this.state.hasError) {
      // Usar fallback customizado se fornecido
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // UI de erro padrão com Design System
      return (
        <SafeAreaView
          style={{ flex: 1, backgroundColor: colors.background }}
          accessibilityLabel="Tela de erro"
          accessibilityHint="Exibe informações sobre o erro ocorrido e opção de tentar novamente"
        >
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{
              flexGrow: 1,
              alignItems: 'center',
              justifyContent: 'center',
              padding: 24,
            }}
          >
            <View style={{ alignItems: 'center', maxWidth: 320 }}>
              {/* Ícone de erro */}
              <View
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 40,
                  backgroundColor: colors.errorLight,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 24,
                }}
                accessibilityLabel="Ícone de erro"
                accessibilityHint="Indica que ocorreu um problema no aplicativo"
              >
                <AlertTriangle size={40} color={colors.error} />
              </View>

              {/* Título */}
              <Text
                style={{
                  fontSize: 24,
                  fontWeight: 'bold',
                  color: colors.text,
                  textAlign: 'center',
                  marginBottom: 12,
                }}
                accessibilityRole="header"
              >
                Ops! Algo deu errado
              </Text>

              {/* Descrição */}
              <Text
                style={{
                  fontSize: 16,
                  color: colors.textSecondary,
                  textAlign: 'center',
                  lineHeight: 24,
                  marginBottom: 8,
                }}
              >
                Encontramos um problema inesperado. Não se preocupe, isso foi registrado e nossa
                equipe vai verificar.
              </Text>

              {/* ID do erro para suporte */}
              {this.state.errorId && (
                <Text
                  style={{
                    fontSize: 12,
                    color: colors.textSecondary,
                    textAlign: 'center',
                    marginBottom: 24,
                  }}
                  selectable={true}
                >
                  Código: {this.state.errorId}
                </Text>
              )}

              {/* Detalhes técnicos em desenvolvimento */}
              {isDevelopment && this.state.error && (
                <View
                  style={{
                    width: '100%',
                    padding: 16,
                    backgroundColor: colors.backgroundDark,
                    borderRadius: 12,
                    marginBottom: 24,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      fontFamily: 'monospace',
                      color: colors.error,
                      marginBottom: 8,
                    }}
                  >
                    {this.state.error.toString()}
                  </Text>
                  {this.state.errorInfo?.componentStack && (
                    <ScrollView horizontal showsHorizontalScrollIndicator={true}>
                      <Text
                        style={{
                          fontSize: 10,
                          fontFamily: 'monospace',
                          color: colors.textSecondary,
                        }}
                      >
                        {this.state.errorInfo.componentStack.slice(0, 500)}
                      </Text>
                    </ScrollView>
                  )}
                </View>
              )}

              {/* Botão de retry */}
              <TouchableOpacity
                onPress={this.handleReset}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: colors.primary,
                  paddingHorizontal: 32,
                  paddingVertical: 16,
                  borderRadius: 30,
                  shadowColor: colors.shadowColor,
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 3,
                }}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel="Tentar novamente"
                accessibilityHint="Recarrega a aplicação para tentar novamente"
              >
                <RefreshCw size={20} color={colors.white} />
                <Text
                  style={{
                    color: colors.white,
                    fontWeight: '600',
                    fontSize: 16,
                    marginLeft: 8,
                  }}
                >
                  Tentar Novamente
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>
      );
    }

    return this.props.children;
  }
}

/**
 * Hook-based error boundary wrapper
 */
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode,
  onError?: (error: Error, errorInfo: ErrorInfo) => void
) => {
  return (props: P) => (
    <ErrorBoundary fallback={fallback} onError={onError}>
      <Component {...props} />
    </ErrorBoundary>
  );
};

export default ErrorBoundary;
