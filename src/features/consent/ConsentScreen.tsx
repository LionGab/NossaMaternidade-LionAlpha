/**
 * ConsentScreen - Tela de Consentimentos LGPD
 *
 * Tela para gerenciar consentimentos granulares conforme LGPD:
 * - Dados de saúde (obrigatório)
 * - Processamento por IA (obrigatório)
 * - Analytics (opcional)
 * - Notificações (opcional)
 */

import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState, useEffect } from 'react';
import { ScrollView, Switch } from 'react-native';

import { Box } from '@/components/primitives/Box';
import { Button } from '@/components/primitives/Button';
import { Card } from '@/components/primitives/Card';
import { Heading } from '@/components/primitives/Heading';
import { Text } from '@/components/primitives/Text';
import type { ConsentType } from '@/core/security';
import { useThemeColors } from '@/hooks/useTheme';
import type { RootStackParamList } from '@/navigation/types';
import { logger } from '@/utils/logger';

import { useConsent } from './hooks/useConsent';

interface ConsentScreenProps {
  userId: string;
  onComplete?: () => void;
  showSkip?: boolean;
}

interface ConsentItem {
  type: ConsentType;
  title: string;
  description: string;
  required: boolean;
}

const CONSENT_ITEMS: ConsentItem[] = [
  {
    type: 'health_data',
    title: 'Dados de Saúde',
    description:
      'Permitir armazenamento seguro de informações de saúde e gestação para personalizar sua experiência.',
    required: true,
  },
  {
    type: 'ai_processing',
    title: 'Processamento por IA',
    description:
      'Permitir que a NathIA (nossa assistente virtual) processe suas informações para oferecer orientações personalizadas.',
    required: true,
  },
  {
    type: 'analytics',
    title: 'Analytics e Melhorias',
    description: 'Permitir coleta de dados anônimos de uso para melhorar o aplicativo.',
    required: false,
  },
  {
    type: 'notifications',
    title: 'Notificações',
    description: 'Permitir envio de notificações sobre lembretes, dicas e novidades.',
    required: false,
  },
];

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export function ConsentScreen({ userId, onComplete, showSkip = false }: ConsentScreenProps) {
  const navigation = useNavigation<NavigationProp>();
  const colors = useThemeColors();
  const { consents, loading, updateConsent, hasRequiredConsents } = useConsent(userId);
  const [localConsents, setLocalConsents] = useState<Record<ConsentType, boolean>>({
    health_data: false,
    ai_processing: false,
    analytics: false,
    notifications: false,
  });
  const [saving, setSaving] = useState(false);

  // Sincronizar com consents carregados
  useEffect(() => {
    if (consents) {
      const newLocalConsents: Record<ConsentType, boolean> = {
        health_data: consents.consents.health_data?.granted ?? false,
        ai_processing: consents.consents.ai_processing?.granted ?? false,
        analytics: consents.consents.analytics?.granted ?? false,
        notifications: consents.consents.notifications?.granted ?? false,
      };
      setLocalConsents(newLocalConsents);
    }
  }, [consents]);

  /**
   * Verifica se todos os consentimentos obrigatórios estão marcados
   */
  const canProceed = (): boolean => {
    return localConsents.health_data && localConsents.ai_processing;
  };

  /**
   * Atualiza consentimento local
   */
  const handleToggle = (type: ConsentType, value: boolean) => {
    setLocalConsents((prev) => ({
      ...prev,
      [type]: value,
    }));
  };

  /**
   * Salva todos os consentimentos
   */
  const handleSave = async () => {
    if (!canProceed()) {
      return;
    }

    setSaving(true);

    try {
      // Salvar cada consentimento
      for (const [type, granted] of Object.entries(localConsents)) {
        const success = await updateConsent(userId, type as ConsentType, granted);
        if (!success) {
          logger.error('[ConsentScreen] Falha ao salvar consent', new Error(`Failed for ${type}`));
        }
      }

      logger.info('[ConsentScreen] Consentimentos salvos', { userId });

      // Chamar callback de conclusão
      if (onComplete) {
        onComplete();
      }
    } catch (error) {
      logger.error('[ConsentScreen] Erro ao salvar consentimentos', error);
    } finally {
      setSaving(false);
    }
  };

  /**
   * Abre política de privacidade
   * Navega para a tela PrivacyPolicyScreen conforme Bug #6 do Docfinal.md
   */
  const openPrivacyPolicy = () => {
    try {
      logger.info('[ConsentScreen] Navegando para Política de Privacidade');
      navigation.navigate('PrivacyPolicy');
    } catch (error) {
      logger.error('[ConsentScreen] Erro ao navegar para Política de Privacidade', error);
      // Fallback: tentar abrir URL externa se navegação falhar
      // Por enquanto, apenas loga o erro (URL externa pode ser configurada futuramente)
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background.canvas }}>
      <Box style={{ padding: 24 }}>
        {/* Header */}
        <Heading level="h1" style={{ marginBottom: 8 }}>
          Seus Dados, Suas Regras
        </Heading>
        <Text style={{ marginBottom: 24, color: colors.text.secondary }}>
          De acordo com a LGPD, você tem controle sobre seus dados. Configure suas preferências
          abaixo.
        </Text>

        {/* Consent Items */}
        <Box style={{ gap: 16 }}>
          {CONSENT_ITEMS.map((item) => (
            <Card key={item.type} variant="elevated">
              <Box
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 8,
                }}
              >
                <Text style={{ flex: 1, fontWeight: '600' }}>
                  {item.title}
                  {item.required && <Text style={{ color: colors.status.error }}> *</Text>}
                </Text>
                <Switch
                  value={localConsents[item.type]}
                  onValueChange={(value) => handleToggle(item.type, value)}
                  disabled={loading || saving}
                  accessibilityLabel={`Ativar ${item.title}`}
                />
              </Box>
              <Text style={{ color: colors.text.secondary, fontSize: 14 }}>{item.description}</Text>
              {item.required && (
                <Text style={{ color: colors.status.warning, fontSize: 12, marginTop: 4 }}>
                  Obrigatório para uso do aplicativo
                </Text>
              )}
            </Card>
          ))}
        </Box>

        {/* Privacy Policy Link */}
        <Box style={{ marginTop: 24 }}>
          <Button
            title="Ler Política de Privacidade Completa"
            variant="ghost"
            onPress={openPrivacyPolicy}
          />
        </Box>

        {/* Info Box */}
        <Card variant="elevated" style={{ marginTop: 24 }}>
          <Text style={{ fontSize: 14 }}>
            <Text style={{ fontWeight: '600' }}>💡 Seus direitos: </Text>
            Você pode alterar ou revogar seus consentimentos a qualquer momento nas configurações do
            app.
          </Text>
        </Card>

        {/* Action Buttons */}
        <Box style={{ marginTop: 32, gap: 12 }}>
          <Button
            title={hasRequiredConsents ? 'Salvar Alterações' : 'Continuar'}
            onPress={handleSave}
            disabled={!canProceed() || loading || saving}
            loading={saving}
          />

          {!canProceed() && (
            <Text style={{ color: colors.status.error, textAlign: 'center', fontSize: 14 }}>
              É necessário aceitar os consentimentos obrigatórios para continuar
            </Text>
          )}

          {showSkip && hasRequiredConsents && (
            <Button
              title="Pular por enquanto"
              variant="ghost"
              onPress={onComplete}
              disabled={loading || saving}
            />
          )}
        </Box>
      </Box>
    </ScrollView>
  );
}
