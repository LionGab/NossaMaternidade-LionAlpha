/**
 * RiskPostBanner - Banner de recursos para posts de risco
 *
 * Exibido automaticamente quando um post contém:
 * - Menção a violência
 * - Ideação suicida
 * - Auto-agressão
 * - Ódio ao bebê
 *
 * Mostra recursos de ajuda imediata.
 *
 * @version 1.0
 * @date 2025-12-04
 */

import * as Haptics from 'expo-haptics';
import { Heart, Phone, AlertCircle } from 'lucide-react-native';
import React, { useCallback } from 'react';
import { View, Linking, StyleSheet } from 'react-native';

import { Box } from '@/components/primitives/Box';
import { HapticButton } from '@/components/primitives/HapticButton';
import { Text } from '@/components/primitives/Text';
import { useTheme } from '@/theme';
import { Tokens, ColorTokens } from '@/theme/tokens';
import { logger } from '@/utils/logger';

// ======================
// TYPES
// ======================

export type RiskType =
  | 'self_harm'
  | 'suicidal'
  | 'violence'
  | 'child_harm'
  | 'severe_distress'
  | 'postpartum_crisis';

export interface RiskPostBannerProps {
  /** Tipo de risco detectado */
  riskType: RiskType;
  /** Se é o autor do post (mostra mensagem diferente) */
  isAuthor?: boolean;
  /** Callback ao clicar em recurso */
  onResourceClick?: (resource: string) => void;
  /** Variante visual */
  variant?: 'full' | 'compact';
}

// ======================
// DATA
// ======================

const RISK_MESSAGES: Record<RiskType, { title: string; message: string }> = {
  self_harm: {
    title: 'Você não está sozinha',
    message: 'Se você está pensando em se machucar, há pessoas prontas para te ajudar agora.',
  },
  suicidal: {
    title: 'Sua vida importa',
    message: 'Se você está tendo pensamentos difíceis, ligue agora para o CVV.',
  },
  violence: {
    title: 'Você merece segurança',
    message: 'Se você está em situação de violência, busque ajuda imediata.',
  },
  child_harm: {
    title: 'Respire. Você não é má mãe.',
    message:
      'Pensamentos assustadores sobre o bebê podem ser sintoma de PPD. Fale com um profissional.',
  },
  severe_distress: {
    title: 'Está muito difícil agora',
    message: 'Você não precisa passar por isso sozinha. Há ajuda disponível.',
  },
  postpartum_crisis: {
    title: 'Isso pode ser pós-parto',
    message: 'O que você está sentindo é real e tratável. Procure ajuda profissional.',
  },
};

// ======================
// COMPONENT
// ======================

export const RiskPostBanner: React.FC<RiskPostBannerProps> = React.memo(
  ({ riskType, isAuthor = false, onResourceClick, variant = 'full' }) => {
    const { colors, isDark } = useTheme();
    const riskInfo = RISK_MESSAGES[riskType];

    const handleCallCVV = useCallback(async () => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      logger.info('[RiskPostBanner] CVV call initiated', { riskType, isAuthor });
      onResourceClick?.('cvv');

      try {
        await Linking.openURL('tel:188');
      } catch (error) {
        logger.error('[RiskPostBanner] Error opening phone', error);
      }
    }, [riskType, isAuthor, onResourceClick]);

    const handleCallSAMU = useCallback(async () => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      logger.info('[RiskPostBanner] SAMU call initiated', { riskType });
      onResourceClick?.('samu');

      try {
        await Linking.openURL('tel:192');
      } catch (error) {
        logger.error('[RiskPostBanner] Error opening phone', error);
      }
    }, [riskType, onResourceClick]);

    if (variant === 'compact') {
      return (
        <View
          style={[
            styles.compactContainer,
            {
              backgroundColor: isDark ? `${ColorTokens.error[900]}40` : `${ColorTokens.error[50]}`,
              borderColor: ColorTokens.error[300],
            },
          ]}
          accessibilityLabel="Recursos de ajuda disponíveis"
        >
          <Box direction="row" align="center" gap="2">
            <Heart size={14} color={ColorTokens.error[500]} />
            <Text size="xs" style={{ color: ColorTokens.error[600] }}>
              Precisa de ajuda?
            </Text>
          </Box>
          <HapticButton
            onPress={handleCallCVV}
            style={[styles.compactButton, { backgroundColor: ColorTokens.success[600] }]}
          >
            <Phone size={12} color={ColorTokens.neutral[0]} />
            <Text size="xs" weight="semibold" color="inverse" style={{ marginLeft: 4 }}>
              CVV 188
            </Text>
          </HapticButton>
        </View>
      );
    }

    return (
      <View
        style={[
          styles.container,
          {
            backgroundColor: isDark ? `${ColorTokens.error[900]}30` : ColorTokens.error[50],
            borderColor: isDark ? ColorTokens.error[700] : ColorTokens.error[200],
          },
        ]}
        accessibilityLabel={`${riskInfo.title}. ${riskInfo.message}`}
      >
        {/* Header */}
        <Box direction="row" align="center" gap="2" mb="2">
          <Heart size={20} color={ColorTokens.error[500]} fill={ColorTokens.error[500]} />
          <Text size="md" weight="bold" style={{ color: ColorTokens.error[700] }}>
            {riskInfo.title}
          </Text>
        </Box>

        {/* Message */}
        <Text
          size="sm"
          style={{
            color: isDark ? ColorTokens.neutral[300] : ColorTokens.neutral[700],
            marginBottom: Tokens.spacing['3'],
          }}
        >
          {isAuthor ? riskInfo.message : 'Se você ou alguém que conhece precisa de ajuda:'}
        </Text>

        {/* Resources */}
        <Box gap="2">
          <HapticButton
            onPress={handleCallCVV}
            style={[styles.resourceButton, { backgroundColor: ColorTokens.success[600] }]}
            accessibilityLabel="Ligar para o CVV"
            accessibilityHint="Abre o discador para ligar para o CVV, número 188"
          >
            <Phone size={18} color={ColorTokens.neutral[0]} />
            <Box ml="2">
              <Text size="sm" weight="bold" color="inverse">
                CVV - 188
              </Text>
              <Text size="xs" color="inverse" style={{ opacity: 0.8 }}>
                24h, gratuito, sigiloso
              </Text>
            </Box>
          </HapticButton>

          {(riskType === 'violence' || riskType === 'child_harm') && (
            <HapticButton
              onPress={handleCallSAMU}
              style={[
                styles.resourceButton,
                {
                  backgroundColor: isDark ? ColorTokens.neutral[700] : ColorTokens.neutral[200],
                },
              ]}
              accessibilityLabel="Ligar para o SAMU"
            >
              <AlertCircle size={18} color={colors.text.primary} />
              <Box ml="2">
                <Text size="sm" weight="semibold" color="primary">
                  SAMU - 192
                </Text>
                <Text size="xs" color="secondary">
                  Emergências médicas
                </Text>
              </Box>
            </HapticButton>
          )}
        </Box>

        {/* Disclaimer */}
        <Text size="xs" color="tertiary" align="center" style={{ marginTop: Tokens.spacing['3'] }}>
          Este post pode conter conteúdo sensível. A moderação foi notificada.
        </Text>
      </View>
    );
  }
);

RiskPostBanner.displayName = 'RiskPostBanner';

// ======================
// STYLES
// ======================

const styles = StyleSheet.create({
  container: {
    padding: Tokens.spacing['4'],
    borderRadius: Tokens.radius.xl,
    borderWidth: 1,
    marginVertical: Tokens.spacing['3'],
  },
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Tokens.spacing['3'],
    borderRadius: Tokens.radius.lg,
    borderWidth: 1,
    marginVertical: Tokens.spacing['2'],
  },
  resourceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Tokens.spacing['3'],
    borderRadius: Tokens.radius.lg,
    minHeight: Tokens.touchTargets.min,
  },
  compactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Tokens.spacing['2'],
    paddingHorizontal: Tokens.spacing['3'],
    borderRadius: Tokens.radius.full,
  },
});

export default RiskPostBanner;
