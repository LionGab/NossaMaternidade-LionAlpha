/**
 * EmergencyResources Component
 *
 * Componente reutilizável para exibir recursos de emergência
 * (CVV 188, SAMU 192, etc) com acessibilidade WCAG AAA
 *
 * @version 1.0
 * @date 2025-11-24
 */

import { Phone, Heart, AlertCircle, Shield, Stethoscope, Users } from 'lucide-react-native';
import React, { useCallback, useMemo } from 'react';
import { Linking } from 'react-native';

import { Box } from '@/components/atoms/Box';
import { HapticButton } from '@/components/atoms/HapticButton';
import { Text } from '@/components/atoms/Text';
import { useHaptics } from '@/hooks/useHaptics';
import { useTheme } from '@/theme';
import { Tokens, ColorTokens } from '@/theme/tokens';
import { logger } from '@/utils/logger';

// ======================
// 🎯 TYPES
// ======================

export type EmergencyResourceType =
  | 'cvv' // Centro de Valorização da Vida
  | 'samu' // Serviço de Atendimento Móvel de Urgência
  | 'policia' // Polícia Militar
  | 'mulher' // Ligue 180 - Central de Atendimento à Mulher
  | 'caps' // Centro de Atenção Psicossocial
  | 'pronto-socorro'; // Pronto-socorro genérico

export interface EmergencyResource {
  type: EmergencyResourceType;
  title: string;
  number: string;
  description: string;
  icon: React.ComponentType<{ size?: number; color?: string }>;
  isUrgent?: boolean; // Se true, destaca visualmente
  url?: string; // URL para mais informações
}

export interface EmergencyResourcesProps {
  /** Variante de exibição */
  variant?: 'compact' | 'full' | 'card';
  /** Mostrar apenas recursos urgentes */
  urgentOnly?: boolean;
  /** Título do componente */
  title?: string;
  /** Callback quando um recurso é pressionado */
  onResourcePress?: (resource: EmergencyResource) => void;
  /** Estilos customizados */
  style?: Record<string, unknown>;
}

// ======================
// 📋 DATA
// ======================

const EMERGENCY_RESOURCES: EmergencyResource[] = [
  {
    type: 'cvv',
    title: 'CVV - Centro de Valorização da Vida',
    number: '188',
    description: 'Apoio emocional 24h, gratuito, confidencial',
    icon: Heart,
    isUrgent: false,
    url: 'https://www.cvv.org.br',
  },
  {
    type: 'samu',
    title: 'SAMU',
    number: '192',
    description: 'Emergências médicas 24h',
    icon: Stethoscope,
    isUrgent: true,
  },
  {
    type: 'policia',
    title: 'Polícia Militar',
    number: '190',
    description: 'Emergências de segurança',
    icon: Shield,
    isUrgent: true,
  },
  {
    type: 'mulher',
    title: 'Ligue 180',
    number: '180',
    description: 'Central de Atendimento à Mulher (violência doméstica)',
    icon: Users,
    isUrgent: true,
    url: 'https://www.gov.br/mdh/pt-br/ligue180',
  },
  {
    type: 'caps',
    title: 'CAPS',
    number: 'Informe-se no posto de saúde',
    description: 'Centro de Atenção Psicossocial - Atendimento gratuito pelo SUS',
    icon: AlertCircle,
    isUrgent: false,
    url: 'https://www.gov.br/saude/pt-br/composicao/saes/caps',
  },
];

// ======================
// 🎨 COMPONENT
// ======================

export const EmergencyResources: React.FC<EmergencyResourcesProps> = React.memo(
  ({
    variant = 'full',
    urgentOnly = false,
    title = 'Recursos de Emergência',
    onResourcePress,
    style,
  }) => {
    const { colors, isDark } = useTheme();
    const haptics = useHaptics();

    // Filtrar recursos baseado em urgentOnly
    const filteredResources = useMemo(() => {
      if (urgentOnly) {
        return EMERGENCY_RESOURCES.filter((r) => r.isUrgent);
      }
      return EMERGENCY_RESOURCES;
    }, [urgentOnly]);

    // Handler para ligar
    const handleCall = useCallback(
      async (resource: EmergencyResource) => {
        try {
          haptics.medium();
          const phoneNumber = resource.number.replace(/\D/g, ''); // Remove não-dígitos
          const url = `tel:${phoneNumber}`;

          const canOpen = await Linking.canOpenURL(url);
          if (canOpen) {
            await Linking.openURL(url);
          } else {
            logger.warn('[EmergencyResources] Cannot open phone URL', { url });
            // Fallback: mostrar número para copiar
            if (onResourcePress) {
              onResourcePress(resource);
            }
          }
        } catch (error) {
          logger.error('[EmergencyResources] Error opening phone', error);
          if (onResourcePress) {
            onResourcePress(resource);
          }
        }
      },
      [haptics, onResourcePress]
    );

    // Handler para abrir URL
    const handleOpenURL = useCallback(
      async (url: string) => {
        try {
          haptics.light();
          const canOpen = await Linking.canOpenURL(url);
          if (canOpen) {
            await Linking.openURL(url);
          } else {
            logger.warn('[EmergencyResources] Cannot open URL', { url });
          }
        } catch (error) {
          logger.error('[EmergencyResources] Error opening URL', error);
        }
      },
      [haptics]
    );

    // Renderizar recurso individual
    const renderResource = useCallback(
      (resource: EmergencyResource, index: number) => {
        const Icon = resource.icon;
        const isUrgent = resource.isUrgent ?? false;

        if (variant === 'compact') {
          return (
            <HapticButton
              key={resource.type}
              onPress={() => handleCall(resource)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                padding: Tokens.spacing['3'],
                backgroundColor: isUrgent
                  ? isDark
                    ? ColorTokens.error[900]
                    : ColorTokens.error[50]
                  : colors.background.card,
                borderRadius: Tokens.radius.md,
                marginBottom: index < filteredResources.length - 1 ? Tokens.spacing['2'] : 0,
                borderLeftWidth: 4,
                borderLeftColor: isUrgent ? colors.status.error : colors.primary.main,
                minHeight: 44, // WCAG AAA: touch target mínimo
              }}
              accessibilityLabel={`Ligar para ${resource.title}: ${resource.number}`}
              accessibilityHint={`Abre o aplicativo de telefone para ligar para ${resource.number}`}
            >
              <Icon size={20} color={isUrgent ? colors.status.error : colors.primary.main} />
              <Box ml="3" flex={1}>
                <Text size="sm" weight="semibold" color={isUrgent ? 'error' : 'primary'}>
                  {resource.title}
                </Text>
                <Box mt="1">
                  <Text size="xs" color="secondary">
                    {resource.number}
                  </Text>
                </Box>
              </Box>
              <Phone size={18} color={colors.text.tertiary} />
            </HapticButton>
          );
        }

        if (variant === 'card') {
          return (
            <Box
              key={resource.type}
              bg="card"
              p="4"
              rounded="lg"
              mb={index < filteredResources.length - 1 ? '3' : '0'}
              borderWidth={1}
              borderColor="light"
              style={{
                borderLeftWidth: 4,
                borderLeftColor: isUrgent ? colors.status.error : colors.primary.main,
                borderColor: isUrgent ? colors.status.error : colors.border.light,
              }}
            >
              <Box direction="row" align="center" mb="2">
                <Box
                  p="2"
                  rounded="md"
                  style={{
                    backgroundColor: isUrgent
                      ? isDark
                        ? ColorTokens.error[900]
                        : ColorTokens.error[100]
                      : isDark
                        ? ColorTokens.primary[900]
                        : ColorTokens.primary[100],
                  }}
                >
                  <Icon size={24} color={isUrgent ? colors.status.error : colors.primary.main} />
                </Box>
                <Box ml="3" flex={1}>
                  <Text size="md" weight="semibold" color="primary">
                    {resource.title}
                  </Text>
                  <Box mt="1">
                    <Text size="sm" color="secondary">
                      {resource.description}
                    </Text>
                  </Box>
                </Box>
              </Box>

              <Box direction="row" align="center" justify="space-between">
                <HapticButton
                  onPress={() => handleCall(resource)}
                  style={{
                    flex: 1,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: isUrgent ? colors.status.error : colors.primary.main,
                    paddingVertical: Tokens.spacing['3'],
                    paddingHorizontal: Tokens.spacing['4'],
                    borderRadius: Tokens.radius.md,
                    marginRight: resource.url ? Tokens.spacing['2'] : 0,
                    minHeight: 44, // WCAG AAA
                  }}
                  accessibilityLabel={`Ligar para ${resource.number}`}
                  accessibilityHint={`Abre o aplicativo de telefone`}
                >
                  <Phone size={18} color={colors.text.inverse} />
                  <Box ml="2">
                    <Text size="md" weight="semibold" color="inverse">
                      {resource.number}
                    </Text>
                  </Box>
                </HapticButton>

                {resource.url && (
                  <HapticButton
                    onPress={() => handleOpenURL(resource.url!)}
                    style={{
                      padding: Tokens.spacing['3'],
                      backgroundColor: colors.background.elevated,
                      borderRadius: Tokens.radius.md,
                      minWidth: 44,
                      minHeight: 44,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    accessibilityLabel="Mais informações"
                    accessibilityHint={`Abre ${resource.title} no navegador`}
                  >
                    <AlertCircle size={18} color={colors.text.secondary} />
                  </HapticButton>
                )}
              </Box>
            </Box>
          );
        }

        // Variant 'full' (default)
        return (
          <Box
            key={resource.type}
            bg="card"
            p="4"
            rounded="lg"
            mb={index < filteredResources.length - 1 ? '3' : '0'}
            borderWidth={1}
            borderColor="light"
            style={{
              borderLeftWidth: 4,
              borderLeftColor: isUrgent ? colors.status.error : colors.primary.main,
              borderColor: isUrgent ? colors.status.error : colors.border.light,
            }}
          >
            <Box direction="row" align="center" mb="3">
              <Icon size={28} color={isUrgent ? colors.status.error : colors.primary.main} />
              <Box ml="3" flex={1}>
                <Text size="lg" weight="semibold" color="primary">
                  {resource.title}
                </Text>
                <Box mt="1">
                  <Text size="sm" color="secondary">
                    {resource.description}
                  </Text>
                </Box>
              </Box>
            </Box>

            <Box direction="row" align="center" justify="space-between">
              <HapticButton
                onPress={() => handleCall(resource)}
                style={{
                  flex: 1,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: isUrgent ? colors.status.error : colors.primary.main,
                  paddingVertical: Tokens.spacing['3'],
                  paddingHorizontal: Tokens.spacing['4'],
                  borderRadius: Tokens.radius.md,
                  marginRight: resource.url ? Tokens.spacing['2'] : 0,
                  minHeight: 44, // WCAG AAA
                }}
                accessibilityLabel={`Ligar para ${resource.title}: ${resource.number}`}
                accessibilityHint={`Abre o aplicativo de telefone para ligar para ${resource.number}`}
              >
                <Phone size={20} color={colors.text.inverse} />
                <Box ml="2">
                  <Text size="lg" weight="bold" color="inverse">
                    {resource.number}
                  </Text>
                </Box>
              </HapticButton>

              {resource.url && (
                <HapticButton
                  onPress={() => handleOpenURL(resource.url!)}
                  style={{
                    padding: Tokens.spacing['3'],
                    backgroundColor: colors.background.elevated,
                    borderRadius: Tokens.radius.md,
                    minWidth: 44,
                    minHeight: 44,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  accessibilityLabel={`Mais informações sobre ${resource.title}`}
                  accessibilityHint={`Abre ${resource.title} no navegador`}
                >
                  <AlertCircle size={20} color={colors.text.secondary} />
                </HapticButton>
              )}
            </Box>
          </Box>
        );
      },
      [variant, colors, isDark, filteredResources, handleCall, handleOpenURL]
    );

    // Renderizar aviso de emergência
    const renderEmergencyWarning = useCallback(() => {
      if (variant === 'compact') {
        return null; // Não mostrar em variant compact
      }

      return (
        <Box
          p="4"
          rounded="lg"
          mb="4"
          style={{
            backgroundColor: isDark ? ColorTokens.error[900] : ColorTokens.error[50],
            borderLeftWidth: 4,
            borderLeftColor: colors.status.error,
          }}
        >
          <Box direction="row" align="center" mb="2">
            <AlertCircle size={24} color={colors.status.error} />
            <Box ml="2">
              <Text size="md" weight="bold" color="error">
                Emergência Médica ou Crise Emocional?
              </Text>
            </Box>
          </Box>
          <Text size="sm" color="secondary">
            Se você está em uma situação de emergência médica ou crise emocional grave,{' '}
            <Text size="sm" weight="semibold" color="error">
              não espere.
            </Text>{' '}
            Ligue imediatamente para o SAMU (192) ou CVV (188), ou vá ao pronto-socorro mais
            próximo.
          </Text>
        </Box>
      );
    }, [variant, colors, isDark]);

    return (
      <Box style={style} accessible={true}>
        {title && (
          <Box mb="4">
            <Text size="xl" weight="bold" color="primary">
              {title}
            </Text>
          </Box>
        )}

        {renderEmergencyWarning()}

        <Box>{filteredResources.map((resource, index) => renderResource(resource, index))}</Box>

        {variant !== 'compact' && (
          <Box mt="4" p="3" bg="elevated" rounded="md">
            <Text size="xs" color="tertiary" align="center">
              💙 Você não está sozinha. Há ajuda disponível 24 horas por dia.
            </Text>
          </Box>
        )}
      </Box>
    );
  }
);

EmergencyResources.displayName = 'EmergencyResources';
