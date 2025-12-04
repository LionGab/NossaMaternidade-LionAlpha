/**
 * AI Disclaimer Modal
 * Modal legal que exibe disclaimer sobre uso de IA antes do primeiro uso do chat
 * @version 1.0.0
 */

import * as Haptics from 'expo-haptics';
import { AlertTriangle, Heart, Stethoscope, Brain, Phone } from 'lucide-react-native';
import React from 'react';
import { ScrollView } from 'react-native';

import { Modal } from '@/components/Modal';
import { Box } from '@/components/primitives/Box';
import { HapticButton } from '@/components/primitives/HapticButton';
import { Heading } from '@/components/primitives/Heading';
import { Text } from '@/components/primitives/Text';
import { useTheme } from '@/theme';
import { Tokens, Typography } from '@/theme/tokens';
import { logger } from '@/utils/logger';

export interface AIDisclaimerModalProps {
  visible: boolean;
  onAccept: () => void;
  onDismiss?: () => void;
}

export const AIDisclaimerModal: React.FC<AIDisclaimerModalProps> = ({
  visible,
  onAccept,
  onDismiss,
}) => {
  const { colors, isDark } = useTheme();

  const handleAccept = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    logger.info('[AIDisclaimerModal] User accepted AI disclaimer');
    onAccept();
  };

  const handleDismiss = () => {
    if (onDismiss) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onDismiss();
    }
  };

  return (
    <Modal visible={visible} onClose={handleDismiss} title="Aviso Importante" fullScreen={false}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          padding: Tokens.spacing['6'],
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Ícone de alerta */}
        <Box align="center" mb="6">
          <Box
            p="4"
            rounded="full"
            style={{
              backgroundColor: isDark ? Tokens.colors.warning[900] : Tokens.colors.warning[100],
            }}
          >
            <AlertTriangle size={48} color={colors.status.warning} strokeWidth={2} />
          </Box>
        </Box>

        {/* Título principal */}
        <Heading
          level="h3"
          weight="bold"
          align="center"
          style={{ marginBottom: Tokens.spacing['4'] }}
        >
          NathIA - Assistente Virtual de IA
        </Heading>

        {/* Descrição */}
        <Box mb="6">
          <Text
            size="md"
            color="secondary"
            align="center"
            style={{ lineHeight: Typography.lineHeights.md * 1.5 }}
          >
            NathIA é uma assistente virtual de inteligência artificial desenvolvida para oferecer
            apoio emocional e informações gerais sobre maternidade.
          </Text>
        </Box>

        {/* Avisos críticos */}
        <Box mb="6">
          <Text
            size="md"
            weight="bold"
            color="primary"
            style={{ marginBottom: Tokens.spacing['3'] }}
          >
            NathIA NÃO substitui:
          </Text>

          <Box mb="3">
            <Box direction="row" align="flex-start" mb="2">
              <Box mt="1" mr="3">
                <Stethoscope size={20} color={colors.status.error} />
              </Box>
              <Box flex={1}>
                <Text
                  size="sm"
                  weight="semibold"
                  color="error"
                  style={{ marginBottom: Tokens.spacing['1'] }}
                >
                  Consultas médicas profissionais
                </Text>
                <Text size="xs" color="tertiary">
                  Para questões de saúde, sempre consulte um médico.
                </Text>
              </Box>
            </Box>
          </Box>

          <Box mb="3">
            <Box direction="row" align="flex-start" mb="2">
              <Box mt="1" mr="3">
                <Brain size={20} color={colors.status.error} />
              </Box>
              <Box flex={1}>
                <Text
                  size="sm"
                  weight="semibold"
                  color="error"
                  style={{ marginBottom: Tokens.spacing['1'] }}
                >
                  Diagnósticos clínicos
                </Text>
                <Text size="xs" color="tertiary">
                  NathIA não pode diagnosticar condições médicas.
                </Text>
              </Box>
            </Box>
          </Box>

          <Box mb="3">
            <Box direction="row" align="flex-start" mb="2">
              <Box mt="1" mr="3">
                <Heart size={20} color={colors.status.error} />
              </Box>
              <Box flex={1}>
                <Text
                  size="sm"
                  weight="semibold"
                  color="error"
                  style={{ marginBottom: Tokens.spacing['1'] }}
                >
                  Tratamentos psicológicos
                </Text>
                <Text size="xs" color="tertiary">
                  Para apoio psicológico profissional, procure um psicólogo.
                </Text>
              </Box>
            </Box>
          </Box>

          <Box mb="3">
            <Box direction="row" align="flex-start" mb="2">
              <Box mt="1" mr="3">
                <Phone size={20} color={colors.status.error} />
              </Box>
              <Box flex={1}>
                <Text
                  size="sm"
                  weight="semibold"
                  color="error"
                  style={{ marginBottom: Tokens.spacing['1'] }}
                >
                  Atendimento de emergência
                </Text>
                <Text size="xs" color="tertiary">
                  Em emergências, ligue imediatamente para 192 (SAMU) ou 190 (Polícia).
                </Text>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Aviso de emergência */}
        <Box
          p="4"
          rounded="lg"
          mb="6"
          style={{
            backgroundColor: isDark ? Tokens.colors.error[900] : Tokens.colors.error[50],
            borderWidth: 1,
            borderColor: colors.status.error,
          }}
        >
          <Text size="sm" weight="bold" color="error" style={{ marginBottom: Tokens.spacing['2'] }}>
            ⚠️ Em caso de emergência médica ou crise emocional:
          </Text>
          <Text size="sm" color="error">
            Procure imediatamente um profissional de saúde ou ligue para o{' '}
            <Text size="sm" weight="bold" color="error">
              CVV: 188
            </Text>{' '}
            (24h, gratuito, confidencial).
          </Text>
        </Box>

        {/* Botão de aceite */}
        <HapticButton
          onPress={handleAccept}
          variant="primary"
          style={{
            minHeight: Tokens.touchTargets.min, // WCAG AAA
          }}
          accessibilityLabel="Entendi e aceito continuar"
          accessibilityHint="Aceita os termos e fecha o aviso"
        >
          <Text size="md" weight="bold" align="center" style={{ color: colors.text.inverse }}>
            Entendi e aceito continuar
          </Text>
        </HapticButton>

        {/* Link para mais informações (opcional) */}
        <Box mt="4" align="center">
          <Text size="xs" color="tertiary" align="center">
            Ao continuar, você confirma que leu e compreendeu este aviso.
          </Text>
        </Box>
      </ScrollView>
    </Modal>
  );
};
