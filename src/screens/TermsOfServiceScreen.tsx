import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { StatusBar } from 'expo-status-bar';
import { ArrowLeft, CheckCircle2, Circle } from 'lucide-react-native';
import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme, type ThemeColors } from '../theme/ThemeContext';
import { logger } from '../utils/logger';
import { getShadowFromToken } from '../utils/shadowHelper';

const TERMS_ACCEPTANCE_KEY = 'terms_accepted_date';

export default function TermsOfServiceScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { colors, isDark } = useTheme();

  const params = route.params as { requireAcceptance?: boolean } | undefined;
  const requireAcceptance = params?.requireAcceptance ?? false;

  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleGoBack = () => {
    if (requireAcceptance && !accepted) {
      Alert.alert(
        'Atenção',
        'Você precisa aceitar os Termos de Serviço para continuar usando o app.',
        [{ text: 'OK' }]
      );
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.goBack();
  };

  const handleToggleAcceptance = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setAccepted(!accepted);
  };

  const handleAccept = async () => {
    if (!accepted) {
      Alert.alert('Atenção', 'Por favor, marque a caixa para aceitar os termos.');
      return;
    }

    try {
      setLoading(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Salvar data de aceitação
      await AsyncStorage.setItem(TERMS_ACCEPTANCE_KEY, new Date().toISOString());

      Alert.alert('Sucesso', 'Termos aceitos com sucesso!', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      logger.error('Erro ao aceitar termos', error);
      Alert.alert('Erro', 'Não foi possível salvar sua aceitação. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background.canvas }}
      accessibilityLabel="Tela de Termos de Serviço"
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
          Termos de Serviço
        </Text>
      </View>

      {/* Content */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 20 }}
        showsVerticalScrollIndicator={false}
        accessible={true}
        accessibilityLabel="Conteúdo dos Termos de Serviço"
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
        <Section title="1. Aceitação dos Termos" colors={colors}>
          <Paragraph colors={colors}>
            Ao criar uma conta ou usar o app Nossa Maternidade ("Serviço", "App", "Nossa
            Maternidade"), você concorda com estes Termos de Serviço ("Termos"). Se você não
            concorda, não utilize o Serviço.
          </Paragraph>
        </Section>

        {/* Service Description */}
        <Section title="2. Descrição do Serviço" colors={colors}>
          <Paragraph colors={colors}>
            Nossa Maternidade é uma plataforma digital de suporte emocional e informacional para
            mães, gestantes e cuidadores, oferecendo:
          </Paragraph>
          <BulletPoint colors={colors}>
            Assistente de IA para apoio emocional (MãesValente)
          </BulletPoint>
          <BulletPoint colors={colors}>
            Rastreamento de marcos de desenvolvimento do bebê
          </BulletPoint>
          <BulletPoint colors={colors}>Diário emocional e de sono</BulletPoint>
          <BulletPoint colors={colors}>Comunidade de mães (posts, comentários)</BulletPoint>
          <BulletPoint colors={colors}>
            Conteúdos educacionais (vídeos, artigos, áudios)
          </BulletPoint>
          <BulletPoint colors={colors}>Exercícios de respiração e bem-estar</BulletPoint>
        </Section>

        {/* Eligibility */}
        <Section title="3. Elegibilidade" colors={colors}>
          <Paragraph colors={colors}>
            Você deve ter pelo menos 18 anos de idade para usar este Serviço. Ao criar uma conta,
            você declara que:
          </Paragraph>
          <BulletPoint colors={colors}>Tem capacidade legal plena</BulletPoint>
          <BulletPoint colors={colors}>Fornecerá informações verdadeiras e atualizadas</BulletPoint>
          <BulletPoint colors={colors}>Manterá a segurança de sua senha</BulletPoint>
          <BulletPoint colors={colors}>É responsável por toda atividade em sua conta</BulletPoint>
        </Section>

        {/* User Responsibilities */}
        <Section title="4. Responsabilidades do Usuário" colors={colors}>
          <Paragraph colors={colors} bold>
            Você concorda em NÃO:
          </Paragraph>
          <BulletPoint colors={colors}>
            Usar o Serviço para fins ilegais ou não autorizados
          </BulletPoint>
          <BulletPoint colors={colors}>
            Postar conteúdo ofensivo, discriminatório, difamatório ou inadequado
          </BulletPoint>
          <BulletPoint colors={colors}>Assediar, intimidar ou ameaçar outros usuários</BulletPoint>
          <BulletPoint colors={colors}>Compartilhar informações falsas ou enganosas</BulletPoint>
          <BulletPoint colors={colors}>
            Fazer engenharia reversa, hackear ou violar sistemas de segurança
          </BulletPoint>
          <BulletPoint colors={colors}>Usar bots, scrapers ou automação não autorizada</BulletPoint>
          <BulletPoint colors={colors}>Revender ou comercializar acesso ao Serviço</BulletPoint>
        </Section>

        {/* Medical Disclaimer */}
        <Section title="5. Isenção Médica (IMPORTANTE)" colors={colors}>
          <View
            style={{
              backgroundColor: isDark ? colors.raw.error[900] : colors.raw.error[50],
              padding: 16,
              borderRadius: 12,
              borderLeftWidth: 4,
              borderLeftColor: colors.status.error,
              marginBottom: 12,
            }}
          >
            <Paragraph colors={colors} bold>
              ⚠️ AVISO CRÍTICO:
            </Paragraph>
            <Paragraph colors={colors}>
              Este app NÃO substitui atendimento médico profissional. A IA (MãesValente) oferece
              apoio emocional, mas NÃO fornece diagnóstico, tratamento ou aconselhamento médico.
            </Paragraph>
            <Paragraph colors={colors}>
              Em caso de emergência, ligue 192 (SAMU) ou procure um hospital imediatamente.
            </Paragraph>
            <Paragraph colors={colors}>
              Sempre consulte um médico, pediatra ou profissional de saúde qualificado para questões
              de saúde.
            </Paragraph>
          </View>
        </Section>

        {/* Content and IP */}
        <Section title="6. Propriedade Intelectual" colors={colors}>
          <Paragraph colors={colors}>
            Todo conteúdo do app (textos, vídeos, imagens, código, marca) é propriedade da Nossa
            Maternidade ou de seus licenciadores, protegido por leis de direitos autorais.
          </Paragraph>
          <Paragraph colors={colors}>
            <Text style={{ fontWeight: 'bold', color: colors.text.primary }}>Seu conteúdo:</Text>{' '}
            Você mantém direitos sobre posts, fotos e comentários que publica. Ao postar, você nos
            concede licença mundial, não exclusiva, para exibir, reproduzir e distribuir seu
            conteúdo no contexto do Serviço.
          </Paragraph>
        </Section>

        {/* Community Guidelines */}
        <Section title="7. Moderação de Conteúdo" colors={colors}>
          <Paragraph colors={colors}>
            Reservamo-nos o direito de remover qualquer conteúdo que viole estes Termos, sem aviso
            prévio. Podemos suspender ou encerrar contas que violem repetidamente nossas diretrizes.
          </Paragraph>
          <Paragraph colors={colors}>Conteúdos proibidos incluem (mas não se limitam a):</Paragraph>
          <BulletPoint colors={colors}>Discurso de ódio, racismo, discriminação</BulletPoint>
          <BulletPoint colors={colors}>Nudez ou conteúdo sexual explícito</BulletPoint>
          <BulletPoint colors={colors}>Violência ou auto-lesão</BulletPoint>
          <BulletPoint colors={colors}>Spam, golpes ou fraudes</BulletPoint>
          <BulletPoint colors={colors}>Informações médicas falsas ou perigosas</BulletPoint>
        </Section>

        {/* Payments */}
        <Section title="8. Assinaturas e Pagamentos (Futuro)" colors={colors}>
          <Paragraph colors={colors}>
            Atualmente, o app é gratuito. Caso implementemos recursos premium:
          </Paragraph>
          <BulletPoint colors={colors}>
            Preços serão claramente exibidos antes da compra
          </BulletPoint>
          <BulletPoint colors={colors}>
            Pagamentos processados via App Store/Google Play
          </BulletPoint>
          <BulletPoint colors={colors}>
            Política de cancelamento conforme direitos do consumidor (CDC)
          </BulletPoint>
          <BulletPoint colors={colors}>
            Reembolsos conforme políticas das lojas (7 dias no Brasil)
          </BulletPoint>
        </Section>

        {/* Termination */}
        <Section title="9. Encerramento de Conta" colors={colors}>
          <Paragraph colors={colors}>
            Você pode deletar sua conta a qualquer momento em Configurações → Conta → Deletar Conta.
            Seus dados serão anonimizados ou deletados conforme nossa Política de Privacidade.
          </Paragraph>
          <Paragraph colors={colors}>
            Podemos suspender ou encerrar sua conta se você violar estes Termos, com ou sem aviso
            prévio.
          </Paragraph>
        </Section>

        {/* Disclaimers */}
        <Section title="10. Isenções de Garantia" colors={colors}>
          <Paragraph colors={colors}>
            O Serviço é fornecido "no estado em que se encontra" (AS IS), sem garantias de qualquer
            tipo. Não garantimos que o Serviço será ininterrupto, livre de erros ou 100% seguro.
          </Paragraph>
        </Section>

        {/* Liability */}
        <Section title="11. Limitação de Responsabilidade" colors={colors}>
          <Paragraph colors={colors}>
            Na extensão máxima permitida por lei, Nossa Maternidade não será responsável por:
          </Paragraph>
          <BulletPoint colors={colors}>Danos indiretos, incidentais ou consequenciais</BulletPoint>
          <BulletPoint colors={colors}>Perda de dados ou lucros cessantes</BulletPoint>
          <BulletPoint colors={colors}>
            Ações de terceiros (ex: conteúdo de outros usuários)
          </BulletPoint>
          <BulletPoint colors={colors}>
            Interrupções de serviço (manutenção, falhas técnicas)
          </BulletPoint>

          <Paragraph colors={colors} style={{ marginTop: 12 }}>
            Nossa responsabilidade total nunca excederá o valor pago por você nos últimos 12 meses
            (se aplicável).
          </Paragraph>
        </Section>

        {/* Governing Law */}
        <Section title="12. Lei Aplicável e Foro" colors={colors}>
          <Paragraph colors={colors}>
            Estes Termos são regidos pelas leis da República Federativa do Brasil. Qualquer disputa
            será resolvida no foro da comarca de [Cidade da Sede da Empresa], com exclusão de
            qualquer outro.
          </Paragraph>
        </Section>

        {/* Changes to Terms */}
        <Section title="13. Alterações nos Termos" colors={colors}>
          <Paragraph colors={colors}>
            Podemos modificar estes Termos a qualquer momento. Alterações significativas serão
            notificadas via email ou notificação no app. Continuar usando o Serviço após alterações
            constitui aceitação dos novos Termos.
          </Paragraph>
        </Section>

        {/* Contact */}
        <Section title="14. Contato" colors={colors}>
          <Paragraph colors={colors}>Dúvidas sobre estes Termos? Entre em contato:</Paragraph>
          <Paragraph colors={colors}>
            <Text style={{ fontWeight: 'bold', color: colors.text.primary }}>Email:</Text>{' '}
            legal@nossaMATERNIDADE.app
          </Paragraph>
          <Paragraph colors={colors}>
            <Text style={{ fontWeight: 'bold', color: colors.text.primary }}>Suporte:</Text>{' '}
            contato@nossaMATERNIDADE.app
          </Paragraph>
        </Section>

        {/* Space before acceptance button */}
        <View style={{ height: 20 }} />

        {/* Acceptance Section (only if requireAcceptance) */}
        {requireAcceptance && (
          <View
            style={{
              backgroundColor: colors.background.card,
              padding: 20,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: colors.border.light,
              marginBottom: 20,
            }}
          >
            <TouchableOpacity
              onPress={handleToggleAcceptance}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: 16,
              }}
              accessibilityRole="checkbox"
              accessibilityLabel="Aceito os Termos de Serviço"
              accessibilityState={{ checked: accepted }}
            >
              {accepted ? (
                <CheckCircle2 size={24} color={colors.primary.main} />
              ) : (
                <Circle size={24} color={colors.text.tertiary} />
              )}
              <Text
                style={{
                  marginLeft: 12,
                  fontSize: 14,
                  color: colors.text.primary,
                  flex: 1,
                }}
              >
                Li e aceito os Termos de Serviço
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleAccept}
              disabled={!accepted || loading}
              style={{
                backgroundColor: !accepted || loading ? colors.text.disabled : colors.primary.main,
                paddingVertical: 14,
                paddingHorizontal: 24,
                borderRadius: 12,
                alignItems: 'center',
              }}
              accessibilityRole="button"
              accessibilityLabel="Confirmar aceitação dos termos"
              accessibilityState={{ disabled: !accepted || loading }}
            >
              <Text
                style={{
                  color: colors.text.inverse,
                  fontSize: 16,
                  fontWeight: '600',
                }}
              >
                {loading ? 'Salvando...' : 'Confirmar'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

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
