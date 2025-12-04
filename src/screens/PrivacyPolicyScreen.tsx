import { useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { StatusBar } from 'expo-status-bar';
import { ArrowLeft } from 'lucide-react-native';
import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme, type ThemeColors } from '../theme/ThemeContext';
import { getShadowFromToken } from '../utils/shadowHelper';

export default function PrivacyPolicyScreen() {
  const navigation = useNavigation();
  const { colors, isDark } = useTheme();

  const handleGoBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.goBack();
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background.canvas }}
      accessibilityLabel="Tela de Política de Privacidade"
    >
      <StatusBar style={isDark ? 'light' : 'dark'} />

      {/* Header */}
      <View
        style={{
          backgroundColor: colors.background.card,
          padding: 16,
          flexDirection: 'row',
          alignItems: 'center',
          borderBottomWidth: 1,
          borderBottomColor: colors.border.light,
          ...getShadowFromToken('sm', colors.raw.neutral[900]),
        }}
      >
        <TouchableOpacity
          onPress={handleGoBack}
          style={{
            backgroundColor: colors.background.elevated,
            padding: 8,
            borderRadius: 20,
            marginRight: 12,
          }}
          accessibilityRole="button"
          accessibilityLabel="Voltar"
          accessibilityHint="Retorna para a tela anterior"
        >
          <ArrowLeft size={20} color={colors.text.primary} />
        </TouchableOpacity>

        <Text
          style={{
            fontSize: 20,
            fontWeight: 'bold',
            color: colors.text.primary,
          }}
          accessibilityRole="header"
        >
          Política de Privacidade
        </Text>
      </View>

      {/* Content */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 20 }}
        showsVerticalScrollIndicator={false}
        accessible={true}
        accessibilityLabel="Conteúdo da Política de Privacidade"
      >
        <Text
          style={{
            fontSize: 12,
            color: colors.text.tertiary,
            marginBottom: 20,
          }}
          accessibilityLabel="Última atualização: 24 de novembro de 2025"
        >
          Última atualização: 24 de novembro de 2025
        </Text>

        {/* Introduction */}
        <Section title="1. Introdução" colors={colors}>
          <Paragraph colors={colors}>
            A Nossa Maternidade ("nós", "nosso" ou "app") valoriza e respeita a privacidade de suas
            usuárias. Esta Política de Privacidade descreve como coletamos, usamos, armazenamos e
            protegemos suas informações pessoais, em conformidade com a Lei Geral de Proteção de
            Dados (LGPD - Lei 13.709/2018) e o Regulamento Geral de Proteção de Dados da União
            Europeia (GDPR).
          </Paragraph>
        </Section>

        {/* Data Collection */}
        <Section title="2. Dados Coletados" colors={colors}>
          <Paragraph colors={colors} bold>
            2.1. Dados fornecidos diretamente por você:
          </Paragraph>
          <BulletPoint colors={colors}>Nome completo, data de nascimento</BulletPoint>
          <BulletPoint colors={colors}>Email e senha (criptografada)</BulletPoint>
          <BulletPoint colors={colors}>Informações do bebê (nome, data de nascimento)</BulletPoint>
          <BulletPoint colors={colors}>Foto de perfil (opcional)</BulletPoint>
          <BulletPoint colors={colors}>Dados de saúde emocional (diário, humor, sono)</BulletPoint>
          <BulletPoint colors={colors}>Conversas com a IA (MãesValente)</BulletPoint>
          <BulletPoint colors={colors}>Posts e comentários na comunidade</BulletPoint>

          <Paragraph colors={colors} bold style={{ marginTop: 16 }}>
            2.2. Dados coletados automaticamente:
          </Paragraph>
          <BulletPoint colors={colors}>
            Dados de uso do app (telas visitadas, tempo de uso)
          </BulletPoint>
          <BulletPoint colors={colors}>
            Informações do dispositivo (modelo, sistema operacional, versão do app)
          </BulletPoint>
          <BulletPoint colors={colors}>
            Endereço IP e dados de localização aproximada (apenas se autorizado)
          </BulletPoint>
          <BulletPoint colors={colors}>Dados de crash e performance (via Sentry)</BulletPoint>
        </Section>

        {/* Data Usage */}
        <Section title="3. Como Usamos Seus Dados" colors={colors}>
          <BulletPoint colors={colors}>Fornecer e melhorar os serviços do app</BulletPoint>
          <BulletPoint colors={colors}>Personalizar conteúdos e recomendações</BulletPoint>
          <BulletPoint colors={colors}>Oferecer suporte ao cliente</BulletPoint>
          <BulletPoint colors={colors}>
            Enviar notificações importantes (com seu consentimento)
          </BulletPoint>
          <BulletPoint colors={colors}>Garantir a segurança e prevenir fraudes</BulletPoint>
          <BulletPoint colors={colors}>
            Realizar análises estatísticas (dados anonimizados)
          </BulletPoint>
          <BulletPoint colors={colors}>Cumprir obrigações legais</BulletPoint>
        </Section>

        {/* Data Sharing */}
        <Section title="4. Compartilhamento de Dados" colors={colors}>
          <Paragraph colors={colors}>
            Não vendemos seus dados pessoais. Compartilhamos apenas com:
          </Paragraph>
          <BulletPoint colors={colors}>
            <Text style={{ fontWeight: 'bold', color: colors.text.primary }}>Supabase:</Text>{' '}
            Infraestrutura de banco de dados (ISO 27001, SOC 2 Type II)
          </BulletPoint>
          <BulletPoint colors={colors}>
            <Text style={{ fontWeight: 'bold', color: colors.text.primary }}>Google Cloud:</Text>{' '}
            Integração de IA (Gemini) - dados processados conforme Google Cloud Privacy
          </BulletPoint>
          <BulletPoint colors={colors}>
            <Text style={{ fontWeight: 'bold', color: colors.text.primary }}>OneSignal:</Text> Envio
            de notificações push (apenas com consentimento)
          </BulletPoint>
          <BulletPoint colors={colors}>
            <Text style={{ fontWeight: 'bold', color: colors.text.primary }}>Sentry:</Text>{' '}
            Monitoramento de erros (dados anonimizados)
          </BulletPoint>
          <BulletPoint colors={colors}>Autoridades legais (quando exigido por lei)</BulletPoint>
        </Section>

        {/* Data Storage */}
        <Section title="5. Armazenamento e Segurança" colors={colors}>
          <Paragraph colors={colors}>
            Seus dados são armazenados em servidores seguros da Supabase (AWS/GCP) com:
          </Paragraph>
          <BulletPoint colors={colors}>
            Criptografia em trânsito (TLS 1.3) e em repouso (AES-256)
          </BulletPoint>
          <BulletPoint colors={colors}>
            Autenticação multifator e controle de acesso rigoroso
          </BulletPoint>
          <BulletPoint colors={colors}>Backups diários e redundância geográfica</BulletPoint>
          <BulletPoint colors={colors}>Monitoramento contínuo de segurança</BulletPoint>

          <Paragraph colors={colors} style={{ marginTop: 12 }}>
            Seus dados são mantidos enquanto sua conta estiver ativa. Após exclusão da conta, dados
            são anonimizados ou deletados em até 30 dias (exceto quando retenção é legalmente
            exigida).
          </Paragraph>
        </Section>

        {/* User Rights */}
        <Section title="6. Seus Direitos (LGPD/GDPR)" colors={colors}>
          <Paragraph colors={colors}>Você tem direito a:</Paragraph>
          <BulletPoint colors={colors}>
            <Text style={{ fontWeight: 'bold', color: colors.text.primary }}>Acesso:</Text>{' '}
            Visualizar todos os seus dados
          </BulletPoint>
          <BulletPoint colors={colors}>
            <Text style={{ fontWeight: 'bold', color: colors.text.primary }}>Correção:</Text>{' '}
            Atualizar dados incorretos
          </BulletPoint>
          <BulletPoint colors={colors}>
            <Text style={{ fontWeight: 'bold', color: colors.text.primary }}>Exclusão:</Text>{' '}
            Deletar sua conta e dados associados
          </BulletPoint>
          <BulletPoint colors={colors}>
            <Text style={{ fontWeight: 'bold', color: colors.text.primary }}>Portabilidade:</Text>{' '}
            Exportar seus dados em formato legível
          </BulletPoint>
          <BulletPoint colors={colors}>
            <Text style={{ fontWeight: 'bold', color: colors.text.primary }}>Oposição:</Text>{' '}
            Recusar processamento de dados (quando aplicável)
          </BulletPoint>
          <BulletPoint colors={colors}>
            <Text style={{ fontWeight: 'bold', color: colors.text.primary }}>Revogação:</Text>{' '}
            Retirar consentimento a qualquer momento
          </BulletPoint>

          <Paragraph colors={colors} style={{ marginTop: 12 }}>
            Para exercer seus direitos, acesse Configurações → Privacidade ou envie email para:{' '}
            <Text style={{ fontWeight: 'bold', color: colors.primary.main }}>
              privacidade@nossaMATERNIDADE.app
            </Text>
          </Paragraph>
        </Section>

        {/* Children Privacy */}
        <Section title="7. Privacidade de Menores" colors={colors}>
          <Paragraph colors={colors}>
            Nosso app é destinado a adultos (+18 anos). Não coletamos intencionalmente dados de
            menores de 18 anos sem consentimento parental. Dados do bebê são armazenados sob
            responsabilidade da mãe/pai.
          </Paragraph>
        </Section>

        {/* Cookies */}
        <Section title="8. Cookies e Rastreamento" colors={colors}>
          <Paragraph colors={colors}>Usamos tecnologias de rastreamento apenas para:</Paragraph>
          <BulletPoint colors={colors}>Manter você logada (tokens de sessão)</BulletPoint>
          <BulletPoint colors={colors}>Salvar preferências (tema, notificações)</BulletPoint>
          <BulletPoint colors={colors}>Analytics básico (anonimizado)</BulletPoint>

          <Paragraph colors={colors} style={{ marginTop: 12 }}>
            No iOS 14.5+, solicitaremos seu consentimento explícito para rastreamento entre apps
            (App Tracking Transparency).
          </Paragraph>
        </Section>

        {/* International Transfers */}
        <Section title="9. Transferência Internacional" colors={colors}>
          <Paragraph colors={colors}>
            Seus dados podem ser transferidos para servidores fora do Brasil (AWS/GCP), mas sempre
            com garantias adequadas (cláusulas contratuais padrão, certificações Privacy Shield
            quando aplicável).
          </Paragraph>
        </Section>

        {/* Updates */}
        <Section title="10. Alterações nesta Política" colors={colors}>
          <Paragraph colors={colors}>
            Podemos atualizar esta política periodicamente. Notificaremos alterações significativas
            via email ou notificação no app. Última atualização: 24/11/2025.
          </Paragraph>
        </Section>

        {/* Contact */}
        <Section title="11. Contato" colors={colors}>
          <Paragraph colors={colors}>
            <Text style={{ fontWeight: 'bold', color: colors.text.primary }}>
              Controlador de Dados:
            </Text>{' '}
            Nossa Maternidade Ltda.
          </Paragraph>
          <Paragraph colors={colors}>
            <Text style={{ fontWeight: 'bold', color: colors.text.primary }}>
              DPO (Encarregado de Dados):
            </Text>{' '}
            dpo@nossaMATERNIDADE.app
          </Paragraph>
          <Paragraph colors={colors}>
            <Text style={{ fontWeight: 'bold', color: colors.text.primary }}>Email geral:</Text>{' '}
            contato@nossaMATERNIDADE.app
          </Paragraph>
          <Paragraph colors={colors}>
            <Text style={{ fontWeight: 'bold', color: colors.text.primary }}>Endereço:</Text>{' '}
            [Endereço completo da empresa]
          </Paragraph>
        </Section>

        {/* Space at bottom */}
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// Helper Components
interface SectionProps {
  title: string;
  colors: ThemeColors;
  children: React.ReactNode;
}

const Section: React.FC<SectionProps> = ({ title, colors, children }) => (
  <View style={{ marginBottom: 24 }} accessible={true} accessibilityRole="text">
    <Text
      style={{
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.text.primary,
        marginBottom: 12,
      }}
      accessibilityRole="header"
    >
      {title}
    </Text>
    {children}
  </View>
);

interface ParagraphProps {
  colors: ThemeColors;
  children: React.ReactNode;
  bold?: boolean;
  style?: Record<string, unknown>;
}

const Paragraph: React.FC<ParagraphProps> = ({ colors, children, bold = false, style }) => (
  <Text
    style={{
      fontSize: 14,
      lineHeight: 22,
      color: colors.text.secondary,
      marginBottom: 8,
      fontWeight: bold ? '600' : 'normal',
      ...style,
    }}
  >
    {children}
  </Text>
);

interface BulletPointProps {
  colors: ThemeColors;
  children: React.ReactNode;
}

const BulletPoint: React.FC<BulletPointProps> = ({ colors, children }) => (
  <View
    style={{
      flexDirection: 'row',
      marginBottom: 6,
      paddingLeft: 8,
    }}
  >
    <Text
      style={{
        color: colors.primary.main,
        marginRight: 8,
        fontSize: 14,
      }}
    >
      •
    </Text>
    <Text
      style={{
        flex: 1,
        fontSize: 14,
        lineHeight: 20,
        color: colors.text.secondary,
      }}
    >
      {children}
    </Text>
  </View>
);
