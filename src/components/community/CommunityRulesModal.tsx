/**
 * CommunityRulesModal - Modal de regras da comunidade
 *
 * Exibe regras claras no primeiro uso:
 * - Proíbe comparações tóxicas
 * - Proíbe conselhos médicos perigosos
 * - Proíbe dietas malucas pós-parto
 * - Enfatiza respeito e acolhimento
 *
 * @version 1.0
 * @date 2025-12-04
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { Shield, Heart, AlertTriangle, Users, CheckCircle2 } from 'lucide-react-native';
import React, { useState, useEffect, useCallback } from 'react';
import { Modal, ScrollView, View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Box } from '@/components/atoms/Box';
import { HapticButton } from '@/components/atoms/HapticButton';
import { Text } from '@/components/atoms/Text';
import { useTheme } from '@/theme';
import { Tokens, ColorTokens } from '@/theme/tokens';
import { logger } from '@/utils/logger';

// ======================
// TYPES
// ======================

export interface CommunityRulesModalProps {
  /** Forçar exibição (ignora storage) */
  forceShow?: boolean;
  /** Callback quando aceitar */
  onAccept?: () => void;
  /** Callback quando fechar (só se forceShow) */
  onClose?: () => void;
}

const RULES_ACCEPTED_KEY = '@community:rules_accepted';
const RULES_VERSION = '1.0'; // Incrementar para forçar nova aceitação

// ======================
// DATA
// ======================

interface Rule {
  icon: React.ComponentType<{ size?: number; color?: string }>;
  title: string;
  description: string;
  examples?: string[];
  type: 'positive' | 'negative';
}

const COMMUNITY_RULES: Rule[] = [
  {
    icon: Heart,
    title: 'Acolhimento sempre',
    description: 'Aqui todas as mães são bem-vindas. Cada jornada é única e válida.',
    examples: ['Validar sentimentos', 'Oferecer apoio', 'Compartilhar experiências'],
    type: 'positive',
  },
  {
    icon: Users,
    title: 'Respeito às diferenças',
    description: 'Cada família tem sua forma de criar. Não existe "mãe certa" ou "mãe errada".',
    examples: [
      'Respeitar escolhas de amamentação',
      'Não julgar volta ao trabalho',
      'Aceitar diferentes estilos de maternagem',
    ],
    type: 'positive',
  },
  {
    icon: AlertTriangle,
    title: 'Sem conselhos médicos',
    description: 'Não dê diagnósticos ou receitas. Sempre oriente a buscar profissionais.',
    examples: [
      'Não indicar medicamentos',
      'Não fazer diagnósticos',
      'Sempre sugerir consulta médica',
    ],
    type: 'negative',
  },
  {
    icon: Shield,
    title: 'Sem comparações tóxicas',
    description: 'Evite frases que fazem outras mães se sentirem inadequadas.',
    examples: [
      '"Eu consegui, por que você não?"',
      '"Na minha época era diferente"',
      '"Você deveria estar feliz"',
    ],
    type: 'negative',
  },
];

// ======================
// COMPONENT
// ======================

export const CommunityRulesModal: React.FC<CommunityRulesModalProps> = React.memo(
  ({ forceShow = false, onAccept, onClose }) => {
    const { colors, isDark } = useTheme();
    const insets = useSafeAreaInsets();
    const [visible, setVisible] = useState(false);
    const [checkedRules, setCheckedRules] = useState<Set<number>>(new Set());

    // Verificar se já aceitou
    useEffect(() => {
      if (forceShow) {
        setVisible(true);
        return;
      }

      const checkRulesAccepted = async () => {
        try {
          const stored = await AsyncStorage.getItem(RULES_ACCEPTED_KEY);
          if (!stored) {
            setVisible(true);
            return;
          }

          const { version } = JSON.parse(stored);
          if (version !== RULES_VERSION) {
            setVisible(true);
          }
        } catch (error) {
          logger.error('[CommunityRulesModal] Error checking rules', error);
          setVisible(true);
        }
      };

      checkRulesAccepted();
    }, [forceShow]);

    const handleCheckRule = useCallback((index: number) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setCheckedRules((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(index)) {
          newSet.delete(index);
        } else {
          newSet.add(index);
        }
        return newSet;
      });
    }, []);

    const handleAccept = useCallback(async () => {
      if (checkedRules.size < COMMUNITY_RULES.length) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        return;
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      try {
        await AsyncStorage.setItem(
          RULES_ACCEPTED_KEY,
          JSON.stringify({
            version: RULES_VERSION,
            acceptedAt: new Date().toISOString(),
          })
        );
        logger.info('[CommunityRulesModal] Rules accepted');
      } catch (error) {
        logger.error('[CommunityRulesModal] Error saving acceptance', error);
      }

      setVisible(false);
      onAccept?.();
    }, [checkedRules, onAccept]);

    const handleClose = useCallback(() => {
      if (forceShow && onClose) {
        setVisible(false);
        onClose();
      }
    }, [forceShow, onClose]);

    const allChecked = checkedRules.size === COMMUNITY_RULES.length;

    if (!visible) return null;

    return (
      <Modal
        visible={visible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleClose}
      >
        <View
          style={[
            styles.container,
            {
              backgroundColor: colors.background.canvas,
              paddingTop: insets.top,
              paddingBottom: insets.bottom,
            },
          ]}
        >
          {/* Header */}
          <Box p="5" align="center">
            <Box
              p="4"
              rounded="full"
              style={{ backgroundColor: `${colors.primary.main}20` }}
              mb="3"
            >
              <Shield size={32} color={colors.primary.main} />
            </Box>
            <Text size="xl" weight="bold" color="primary" align="center">
              Bem-vinda à Comunidade
            </Text>
            <Text size="sm" color="secondary" align="center" style={{ marginTop: 8 }}>
              Um espaço seguro para mães. Leia e aceite nossas regras de convivência.
            </Text>
          </Box>

          {/* Rules */}
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {COMMUNITY_RULES.map((rule, index) => {
              const Icon = rule.icon;
              const isChecked = checkedRules.has(index);
              const isNegative = rule.type === 'negative';

              return (
                <HapticButton
                  key={index}
                  onPress={() => handleCheckRule(index)}
                  style={[
                    styles.ruleCard,
                    {
                      backgroundColor: isChecked
                        ? isDark
                          ? `${colors.primary.main}20`
                          : `${colors.primary.main}10`
                        : colors.background.card,
                      borderColor: isChecked ? colors.primary.main : colors.border.light,
                      borderWidth: isChecked ? 2 : 1,
                    },
                  ]}
                  accessibilityLabel={`${rule.title}: ${rule.description}`}
                  accessibilityState={{ checked: isChecked }}
                >
                  <Box direction="row" align="flex-start" gap="3">
                    {/* Checkbox */}
                    <View
                      style={[
                        styles.checkbox,
                        {
                          backgroundColor: isChecked ? colors.primary.main : 'transparent',
                          borderColor: isChecked ? colors.primary.main : colors.border.medium,
                        },
                      ]}
                    >
                      {isChecked && <CheckCircle2 size={16} color={ColorTokens.neutral[0]} />}
                    </View>

                    {/* Content */}
                    <Box flex={1}>
                      <Box direction="row" align="center" gap="2" mb="1">
                        <Icon
                          size={18}
                          color={isNegative ? ColorTokens.error[500] : ColorTokens.success[500]}
                        />
                        <Text size="md" weight="semibold" color="primary">
                          {rule.title}
                        </Text>
                      </Box>
                      <Text
                        size="sm"
                        color="secondary"
                        style={{ marginBottom: Tokens.spacing['2'] }}
                      >
                        {rule.description}
                      </Text>
                      {rule.examples && (
                        <Box
                          p="2"
                          rounded="lg"
                          style={{
                            backgroundColor: isDark
                              ? ColorTokens.neutral[800]
                              : ColorTokens.neutral[100],
                          }}
                        >
                          {rule.examples.map((example, i) => (
                            <Text
                              key={i}
                              size="xs"
                              color="tertiary"
                              style={{
                                marginBottom: i < rule.examples!.length - 1 ? 4 : 0,
                              }}
                            >
                              {isNegative ? '✗' : '✓'} {example}
                            </Text>
                          ))}
                        </Box>
                      )}
                    </Box>
                  </Box>
                </HapticButton>
              );
            })}
          </ScrollView>

          {/* Footer */}
          <Box p="5" style={{ borderTopWidth: 1, borderTopColor: colors.border.light }}>
            <Text
              size="xs"
              color="tertiary"
              align="center"
              style={{ marginBottom: Tokens.spacing['3'] }}
            >
              Marque todas as regras para continuar
            </Text>
            <HapticButton
              onPress={handleAccept}
              disabled={!allChecked}
              style={[
                styles.acceptButton,
                {
                  backgroundColor: allChecked ? colors.primary.main : colors.border.medium,
                },
              ]}
              accessibilityLabel="Aceitar regras da comunidade"
            >
              <Text size="md" weight="semibold" color="inverse">
                {allChecked
                  ? 'Entrar na Comunidade'
                  : `${checkedRules.size}/${COMMUNITY_RULES.length} marcadas`}
              </Text>
            </HapticButton>
          </Box>
        </View>
      </Modal>
    );
  }
);

CommunityRulesModal.displayName = 'CommunityRulesModal';

// ======================
// STYLES
// ======================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Tokens.spacing['4'],
    gap: Tokens.spacing['3'],
  },
  ruleCard: {
    padding: Tokens.spacing['4'],
    borderRadius: Tokens.radius.xl,
    ...Tokens.shadows.sm,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: Tokens.radius.md,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  acceptButton: {
    paddingVertical: Tokens.spacing['4'],
    paddingHorizontal: Tokens.spacing['6'],
    borderRadius: Tokens.radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: Tokens.touchTargets.min,
  },
});

export default CommunityRulesModal;
