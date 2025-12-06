import type { NavigatorScreenParams } from '@react-navigation/native';

export type RootStackParamList = {
  Splash: undefined;
  Auth: { action?: string } | undefined;
  AuthCallback: undefined; // 🔐 OAuth callback (Google/Apple)
  ResetPassword: { token?: string } | undefined; // 🔐 Reset de senha
  Onboarding: undefined;
  Consent: { mode?: 'onboarding' | 'settings'; onComplete?: () => void } | undefined;
  Main: NavigatorScreenParams<MainTabParamList> | undefined;
  Ritual: { ritual?: string; autoStart?: boolean; message?: string } | undefined; // 🧘 Ritual com params opcionais
  Diary: undefined;
  DesculpaHoje: undefined; // 💗 Reflexão sobre arrependimentos
  ContentDetail: { contentId: string }; // 🆕 Tela de detalhes de conteúdo (Week 1)
  ChatSessions: undefined; // 💬 Modal de histórico de conversas
  SOSMae: undefined; // 🆘 SOS Mãe - suporte emergencial
  PrivacyPolicy: undefined;
  TermsOfService: undefined;
  Settings: undefined;
  AgentsStatus: undefined; // 🆕 Tela de status dos agentes IA
  Profile: undefined;
  Search: undefined; // 🔍 Tela de busca funcional
  DesignSystem: undefined; // 🎨 Tela de teste do Design System
  DesignMetrics: undefined; // 📊 Dashboard de métricas do design system
  BreastfeedingTracker: undefined; // 🍼 Rastreador de amamentação
  CrisisDashboard: undefined; // 📊 Dashboard de monitoramento de crises
  NotFound: undefined; // 404 - Página não encontrada
};

/**
 * MainTabParamList - 5 Tabs Principais
 *
 * 🏠 Home - Dashboard principal
 * 👥 MaesValentes - Comunidade de mães
 * 💬 Chat - MãesValente IA (NathIA)
 * 📚 MundoNath - Conteúdo e Feed
 * ❤️ Habitos - Meus Cuidados e bem-estar
 */
export type MainTabParamList = {
  Home: undefined;
  MaesValentes: undefined;
  Chat: { sessionId?: string } | undefined;
  MundoNath: undefined;
  Habitos: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
