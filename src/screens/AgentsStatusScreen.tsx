/**
 * Agents Status Screen
 * Tela de debug/monitoring que mostra o status de todos os agentes IA
 */

import { useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Loader2,
  Brain,
  Heart,
  Sparkles,
  // Moon, // 🚫 MVP: Não usado (SleepAgent desabilitado)
} from 'lucide-react-native';
import React from 'react';
import { ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Box } from '@/components/atoms/Box';
import { Heading } from '@/components/atoms/Heading';
import { IconButton } from '@/components/atoms/IconButton';
import { Text } from '@/components/atoms/Text';
import { Tokens, Typography } from '@/theme/tokens';

import { useAgents } from '../contexts/AgentsContext';
import { useTheme } from '../theme/ThemeContext';

export default function AgentsStatusScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const {
    initialized,
    chatAgent,
    contentAgent,
    // habitsAgent, // 🚫 MVP: Desabilitado
    emotionAgent,
    nathiaAgent,
    // sleepAgent, // 🚫 MVP: Desabilitado
    designAgent,
    error,
  } = useAgents();

  const [refreshing, setRefreshing] = React.useState(false);

  const handleRefresh = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.goBack();
  };

  const agents = [
    {
      name: 'Maternal Chat Agent',
      description: 'Chat empático com IA Gemini 2.0',
      agent: chatAgent,
      icon: Sparkles,
      color: colors.primary.main,
      capabilities: ['chat', 'emotion-analysis', 'session-management'],
    },
    {
      name: 'Content Recommendation',
      description: 'Recomendações personalizadas',
      agent: contentAgent,
      icon: Brain,
      color: colors.status.info,
      capabilities: ['recommendation', 'filtering', 'scoring'],
    },
    // 🚫 MVP: Desabilitado
    // {
    //   name: 'Habits Analysis Agent',
    //   description: 'Análise de bem-estar e hábitos',
    //   agent: habitsAgent,
    //   icon: Heart,
    //   color: colors.status.success,
    //   capabilities: ['habit-tracking', 'pattern-detection', 'insights'],
    // },
    {
      name: 'Emotion Analysis Agent',
      description: 'Análise emocional profunda',
      agent: emotionAgent,
      icon: Heart,
      color: colors.status.warning,
      capabilities: ['emotion-detection', 'risk-assessment', 'support'],
      badge: 'NEW',
    },
    {
      name: 'Nathia Personality Agent',
      description: 'Voz autêntica da Nathália',
      agent: nathiaAgent,
      icon: Sparkles,
      color: colors.primary.dark,
      capabilities: ['personality-validation', 'medical-prevention', 'tone-correction'],
      badge: 'NEW',
      special: true,
    },
    // 🚫 MVP: Desabilitado
    // {
    //   name: 'Sleep Analysis Agent',
    //   description: 'Análise inteligente de sono',
    //   agent: sleepAgent,
    //   icon: Moon,
    //   color: colors.status.info,
    //   capabilities: ['sleep-tracking', 'deprivation-assessment', 'recommendations'],
    //   badge: 'NEW',
    // },
    {
      name: 'Design Quality Agent',
      description: 'Validação de design tokens e acessibilidade',
      agent: designAgent,
      icon: Sparkles,
      color: colors.secondary.main,
      capabilities: ['validate-design-tokens', 'audit-accessibility', 'suggest-fixes'],
      badge: 'NEW',
    },
  ];

  const activeCount = agents.filter((a) => a.agent !== null).length;
  const progress = (activeCount / agents.length) * 100;

  const successColor = colors.status.success;
  const errorColor = colors.status.error;
  const warningColor = colors.status.warning;

  // Helper para converter hex para rgba com opacidade
  const hexToRgba = (hex: string, opacity: number): string => {
    // Remove # se presente
    const cleanHex = hex.replace('#', '');
    // Converte para RGB
    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };

  // Overlays para cores de status - usa hexToRgba para cores específicas
  // ColorTokens.overlay.* é usado apenas para overlays genéricos (preto/branco)
  const getStatusOverlay = (color: string, opacity: number): string => {
    // Para cores específicas (success, error, warning, etc), sempre usar hexToRgba
    return hexToRgba(color, opacity);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.canvas }}>
      {/* Header */}
      <Box
        direction="row"
        align="center"
        px="4"
        py="3"
        borderWidth={1}
        borderColor="light"
        style={{ borderTopWidth: 0, borderLeftWidth: 0, borderRightWidth: 0 }}
      >
        <IconButton
          icon={<ArrowLeft size={20} color={colors.text.primary} />}
          onPress={handleBack}
          accessibilityLabel="Voltar"
          variant="ghost"
        />

        <Box flex={1} style={{ marginLeft: Tokens.spacing['3'] }}>
          <Heading level="h4" color="primary">
            Status dos Agentes IA
          </Heading>
          <Text size="sm" color="secondary" style={{ marginTop: Tokens.spacing['0.5'] }}>
            Sistema de inteligência artificial
          </Text>
        </Box>
      </Box>

      <ScrollView
        contentContainerStyle={{ padding: Tokens.spacing['4'] }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary.main}
          />
        }
      >
        {/* Status Geral */}
        <Box
          bg="elevated"
          p="5"
          rounded="xl"
          borderWidth={1}
          style={{
            marginBottom: Tokens.spacing['6'],
            backgroundColor: initialized
              ? getStatusOverlay(successColor, 0.15)
              : error
                ? getStatusOverlay(errorColor, 0.15)
                : getStatusOverlay(warningColor, 0.15),
            borderColor: initialized
              ? getStatusOverlay(successColor, 0.4)
              : error
                ? getStatusOverlay(errorColor, 0.4)
                : getStatusOverlay(warningColor, 0.4),
          }}
        >
          <Box direction="row" align="center" style={{ marginBottom: Tokens.spacing['3'] }}>
            {initialized ? (
              <CheckCircle2 size={28} color={successColor} />
            ) : error ? (
              <XCircle size={28} color={errorColor} />
            ) : (
              <Loader2 size={28} color={warningColor} />
            )}
            <Box style={{ marginLeft: Tokens.spacing['3'], flex: 1 }}>
              <Heading level="h5" color="primary">
                {initialized
                  ? 'Sistema Ativo'
                  : error
                    ? 'Erro na Inicialização'
                    : 'Inicializando...'}
              </Heading>
              <Text size="sm" color="secondary" style={{ marginTop: Tokens.spacing['0.5'] }}>
                {initialized
                  ? `${activeCount}/${agents.length} agentes ativos`
                  : error
                    ? 'Falha ao inicializar agentes'
                    : 'Aguarde...'}
              </Text>
            </Box>
          </Box>

          {/* Progress Bar */}
          <Box
            style={{
              height: Tokens.spacing['2'],
              backgroundColor: colors.background.elevated,
              borderRadius: Tokens.radius.sm,
              overflow: 'hidden',
            }}
          >
            <Box
              style={{
                height: '100%',
                width: `${progress}%`,
                backgroundColor: initialized ? successColor : warningColor,
              }}
            />
          </Box>

          {error && (
            <Box
              mt="3"
              p="3"
              rounded="lg"
              style={{
                backgroundColor: getStatusOverlay(errorColor, 0.2),
              }}
            >
              <Text size="xs" style={{ color: errorColor }}>
                Erro: {error}
              </Text>
            </Box>
          )}
        </Box>

        {/* Lista de Agentes */}
        <Heading level="h5" color="primary" style={{ marginBottom: Tokens.spacing['3'] }}>
          Agentes Registrados
        </Heading>

        {agents.map((item, index) => {
          const Icon = item.icon;
          const isActive = item.agent !== null;

          return (
            <Box
              key={index}
              bg={item.special ? 'elevated' : 'card'}
              p="4"
              rounded="lg"
              borderWidth={item.special ? 2 : 1}
              style={{
                marginBottom: Tokens.spacing['3'],
                borderColor: item.special ? getStatusOverlay(item.color, 0.8) : colors.border.light,
              }}
            >
              <Box direction="row" align="center" style={{ marginBottom: Tokens.spacing['2'] }}>
                <Box
                  width={Tokens.spacing['12']}
                  height={Tokens.spacing['12']}
                  rounded="lg"
                  align="center"
                  justify="center"
                  style={{
                    backgroundColor: getStatusOverlay(item.color, 0.2),
                  }}
                >
                  <Icon size={24} color={item.color} />
                </Box>

                <Box flex={1} style={{ marginLeft: Tokens.spacing['3'] }}>
                  <Box direction="row" align="center">
                    <Heading level="h6" color="primary">
                      {item.name}
                    </Heading>
                    {item.badge && (
                      <Box
                        bg="elevated"
                        px="2"
                        py="0.5"
                        rounded="sm"
                        style={{
                          marginLeft: Tokens.spacing['2'],
                          backgroundColor: item.color,
                        }}
                      >
                        <Text size="xs" weight="bold" color="inverse">
                          {item.badge}
                        </Text>
                      </Box>
                    )}
                  </Box>
                  <Text size="sm" color="secondary" style={{ marginTop: Tokens.spacing['0.5'] }}>
                    {item.description}
                  </Text>
                </Box>

                {isActive ? (
                  <CheckCircle2 size={20} color={successColor} />
                ) : (
                  <XCircle size={20} color={colors.text.disabled} />
                )}
              </Box>

              {/* Capabilities */}
              <Box
                direction="row"
                style={{
                  flexWrap: 'wrap',
                  marginTop: Tokens.spacing['2'],
                  gap: Tokens.spacing['1.5'],
                }}
              >
                {item.capabilities.map((cap, idx) => (
                  <Box
                    key={idx}
                    bg="elevated"
                    px="2"
                    py="1"
                    rounded="md"
                    borderWidth={1}
                    borderColor="light"
                  >
                    <Text size="xs" color="secondary" weight="medium">
                      {cap}
                    </Text>
                  </Box>
                ))}
              </Box>

              {/* Special Notice para Nathia */}
              {item.special && isActive && (
                <Box
                  mt="3"
                  p="2"
                  rounded="lg"
                  borderWidth={0}
                  style={{
                    backgroundColor: getStatusOverlay(item.color, 0.15),
                    borderLeftWidth: 3,
                    borderLeftColor: item.color,
                  }}
                >
                  <Text size="xs" weight="semibold" color="primary">
                    🎭 VOZ AUTÊNTICA ATIVA
                  </Text>
                  <Text size="xs" color="secondary" style={{ marginTop: Tokens.spacing['1'] }}>
                    Todas as respostas passam por validação. Zero conselhos médicos garantido.
                  </Text>
                </Box>
              )}
            </Box>
          );
        })}

        {/* Orchestrator Info */}
        <Box mt="3" bg="elevated" p="4" rounded="lg" borderWidth={1} borderColor="light">
          <Heading level="h6" color="primary">
            🎛️ Orchestrator
          </Heading>
          <Text
            size="xs"
            color="secondary"
            style={{
              marginTop: Tokens.spacing['1'],
              lineHeight: Typography.lineHeights.sm,
            }}
          >
            Sistema de coordenação central que gerencia todos os agentes e MCPs (Supabase, Google
            AI, Analytics). Garante comunicação eficiente e tracking de eventos.
          </Text>
        </Box>

        {/* Footer Info */}
        <Box mt="6" align="center">
          <Text size="xs" color="tertiary">
            Sistema de Agentes IA v1.0.0
          </Text>
          <Text
            size="xs"
            color="tertiary"
            align="center"
            style={{ marginTop: Tokens.spacing['1'] }}
          >
            Powered by Gemini 2.0 Flash • React Native • Expo
          </Text>
        </Box>
      </ScrollView>
    </SafeAreaView>
  );
}
