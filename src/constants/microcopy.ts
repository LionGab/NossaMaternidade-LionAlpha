/**
 * Microcópias Humanizadas - Nossa Maternidade
 * Textos empáticos, acolhedores e livres de julgamentos
 *
 * Inspirado no conceito "lugar livre de julgamentos" do projeto de referência
 * Linguagem validação emocional e acolhimento maternal
 *
 * @version 2.0.0
 */

// ======================
// 🏠 BOAS-VINDAS E ONBOARDING
// ======================

export const Welcome = {
  title: 'Bem-vinda, mãe! 💙',
  subtitle: 'Este é um espaço livre de julgamentos. Aqui, você é acolhida exatamente como está.',
  cta: 'Vamos começar?',
  tagline: 'Sua jornada de autocuidado maternal começa aqui',
  safeSpace: 'Um lugar seguro para você ser você mesma',
};

export const Onboarding = {
  step1: {
    title: 'Vamos nos conhecer?',
    subtitle: 'Queremos criar uma experiência feita para você',
    skip: 'Prefiro pular isso agora',
  },
  step2: {
    title: 'Como você quer ser chamada?',
    subtitle: 'Pode ser seu nome, apelido, ou como preferir',
  },
  step3: {
    title: 'Em que fase você está?',
    subtitle: 'Isso nos ajuda a personalizar conteúdos e recomendações',
  },
  step4: {
    title: 'O que você mais precisa agora?',
    subtitle: 'Pode marcar tudo que fizer sentido para você',
  },
  step9: {
    title: 'Pronta para começar! 🎉',
    subtitle: 'Sua jornada personalizada está preparada. Vamos juntas?',
    cta: 'Começar minha jornada',
  },
  progress: (current: number, total: number) => `Passo ${current} de ${total}`,
};

// ======================
// 💬 CHAT COM IA (MãesValente)
// ======================

export const Chat = {
  title: 'MãesValente',
  subtitle: 'Seu espaço de escuta sem julgamentos',
  placeholder: 'Conte o que você está sentindo...',
  emptyState: 'Estou aqui para você. Quando quiser conversar, estarei pronta para ouvir.',
  thinking: 'Pensando com carinho...',
  typing: 'Nath está escrevendo...',
  welcome: 'Olá! Como você está se sentindo hoje?',
  errors: {
    network: 'Ops, estou com dificuldade para me conectar. Quer tentar novamente?',
    generic: 'Algo não saiu como esperado. Podemos tentar de novo?',
  },
  suggestions: [
    'Estou me sentindo ansiosa',
    'Preciso de apoio hoje',
    'Quero falar sobre sono',
    'Como lidar com a culpa?',
  ],
};

// ======================
// 📊 HÁBITOS E BEM-ESTAR
// ======================

export const Habits = {
  title: 'Seus momentos de autocuidado',
  subtitle: 'Pequenos passos, grandes transformações',
  emptyState: 'Cada pequeno passo é uma vitória. Que tal começar registrando como você está hoje?',
  addFirst: 'Registrar meu primeiro hábito',
  streak: (count: number) =>
    count === 1
      ? 'Você cuidou de você hoje. Que orgulho! 🌟'
      : `Você tem cuidado de você por ${count} dias seguidos. Que orgulho! 🌟`,
  noStreak: 'Comece uma sequência hoje!',
  encouragement: [
    'Você está fazendo seu melhor, e isso é suficiente.',
    'Cada dia é uma nova chance de se cuidar.',
    'Seu bem-estar importa. Não esqueça disso.',
    'Você não precisa ser perfeita. Você só precisa tentar.',
  ],
};

// ======================
// 👥 COMUNIDADE
// ======================

export const Community = {
  title: 'Mães Valentes',
  subtitle: 'Outras mães que entendem sua jornada',
  emptyState: 'Ainda não há conversas aqui. Que tal ser a primeira a compartilhar?',
  share: 'Compartilhar com a comunidade',
  supportGiven: (count: number) => `Você já deu apoio para ${count} mães. Que lindo! 💙`,
  connectionsMade: (count: number) =>
    count === 1 ? 'Você se conectou com 1 mãe' : `Você se conectou com ${count} mães`,
  safeSpace: 'Lembre-se: este é um espaço livre de julgamentos. Seja gentil, seja empática.',
};

// ======================
// 📚 CONTEÚDO (MUNDO NATH)
// ======================

export const Content = {
  title: 'Mundo Nath',
  subtitle: 'Conteúdo pensado para você',
  emptyState: 'Estamos preparando conteúdos especiais para você...',
  filters: {
    all: 'Todos',
    videos: 'Vídeos',
    audio: 'Áudios',
    articles: 'Artigos',
    series: 'Séries',
  },
  angelOfTheDay: 'Mensagem do dia para você',
  personalized: 'Recomendado para você',
  continue: 'Continuar assistindo',
  new: 'Novidades',
  popular: 'Mais assistidos',
};

// ======================
// 🏠 HOME / DASHBOARD
// ======================

export const Home = {
  greeting: (name?: string, hour?: number) => {
    const period = hour && hour < 12 ? 'Bom dia' : hour && hour < 18 ? 'Boa tarde' : 'Boa noite';

    return name ? `${period}, ${name}!` : `${period}!`;
  },
  todayQuestion: 'Como você está se sentindo hoje?',
  quickActions: 'Acesso rápido',
  recentActivity: 'Atividade recente',
  suggestions: 'Sugestões para você',
};

// ======================
// ⚙️ CONFIGURAÇÕES
// ======================

export const Settings = {
  title: 'Configurações',
  account: 'Minha conta',
  preferences: 'Preferências',
  notifications: 'Notificações',
  privacy: 'Privacidade',
  help: 'Ajuda e suporte',
  about: 'Sobre o app',
  logout: 'Sair',
  logoutConfirm: {
    title: 'Tem certeza?',
    message: 'Você pode voltar sempre que quiser. Estaremos aqui te esperando.',
    confirm: 'Sim, quero sair',
    cancel: 'Cancelar',
  },
};

// ======================
// ❌ ERROS E ESTADOS VAZIOS
// ======================

export const Errors = {
  network: 'Ops, algo deu errado. Mas não se preocupe, estamos aqui. Quer tentar novamente?',
  notFound: 'Não encontramos o que você procura. Podemos ajudar de outra forma?',
  unauthorized: 'Para sua segurança, precisamos que você entre novamente.',
  serverError: 'Estamos com uma dificuldade técnica. Já estamos trabalhando nisso!',
  generic: 'Algo inesperado aconteceu. Vamos tentar de novo?',
  offline: {
    title: 'Você está offline',
    message:
      'Algumas funcionalidades precisam de internet, mas você ainda pode navegar pelo conteúdo já baixado.',
    cta: 'Entendi',
  },
};

export const EmptyStates = {
  noHabits: {
    title: 'Nenhum hábito registrado ainda',
    message: 'Comece pequeno. Cada passo conta.',
    cta: 'Adicionar primeiro hábito',
  },
  noContent: {
    title: 'Nada por aqui ainda',
    message: 'Estamos preparando conteúdos especiais para você.',
  },
  noNotifications: {
    title: 'Tudo tranquilo por aqui',
    message: 'Você está em dia com tudo! 🌟',
  },
  searchEmpty: (query: string) => ({
    title: 'Nenhum resultado para "' + query + '"',
    message: 'Que tal tentar com outras palavras?',
  }),
};

// ======================
// 🎉 CONQUISTAS E CELEBRAÇÕES
// ======================

export const Achievements = {
  firstHabit: {
    title: 'Primeiro passo! 👣',
    message: 'Você registrou seu primeiro hábito. Cada jornada começa assim!',
  },
  weekStreak: {
    title: 'Uma semana de você! 🌟',
    message: 'Você tem cuidado de você por 7 dias. Isso é lindo!',
  },
  monthStreak: {
    title: 'Um mês inteiro! 🎉',
    message: 'Você está firme há 30 dias. Que transformação incrível!',
  },
  firstPost: {
    title: 'Primeira conexão! 💙',
    message: 'Você compartilhou pela primeira vez. Obrigada por confiar na gente!',
  },
  supportGiver: {
    title: 'Coração generoso! 💝',
    message: 'Você já apoiou 10 mães. Que lindo ver você espalhando amor!',
  },
};

// ======================
// 🔔 NOTIFICAÇÕES
// ======================

export const Notifications = {
  habitReminder: {
    title: 'Hora do autocuidado 💙',
    body: 'Que tal registrar como você está hoje?',
  },
  streakRisk: {
    title: 'Sua sequência está em risco',
    body: 'Você não registra há 2 dias. Estamos com saudade!',
  },
  newContent: {
    title: 'Novidade para você!',
    body: 'Temos um conteúdo novo que achamos que você vai gostar.',
  },
  communityReply: (name: string) => ({
    title: `${name} respondeu você`,
    body: 'Veja o que ela disse!',
  }),
  weeklyReport: {
    title: 'Seu resumo da semana ✨',
    body: 'Veja como foi sua jornada nos últimos 7 dias.',
  },
};

// ======================
// 🚀 CALL TO ACTIONS
// ======================

export const CTA = {
  getStarted: 'Começar',
  continue: 'Continuar',
  skip: 'Pular',
  save: 'Salvar',
  cancel: 'Cancelar',
  confirm: 'Confirmar',
  delete: 'Excluir',
  edit: 'Editar',
  share: 'Compartilhar',
  tryAgain: 'Tentar novamente',
  goBack: 'Voltar',
  close: 'Fechar',
  learnMore: 'Saiba mais',
  seeAll: 'Ver todos',
  showLess: 'Ver menos',
  loading: 'Carregando...',
  send: 'Enviar',
  post: 'Publicar',
};

// ======================
// 📝 FORMULÁRIOS
// ======================

export const Forms = {
  required: 'Campo obrigatório',
  invalid: 'Por favor, verifique este campo',
  emailInvalid: 'Digite um email válido',
  passwordWeak: 'Sua senha precisa ter pelo menos 8 caracteres',
  passwordMismatch: 'As senhas não coincidem',
  success: 'Tudo certo! ✨',
  saved: 'Salvo com sucesso',
  updated: 'Atualizado',
};

// ======================
// 📱 ACESSIBILIDADE
// ======================

export const A11y = {
  buttons: {
    close: 'Fechar',
    back: 'Voltar',
    menu: 'Abrir menu',
    more: 'Mais opções',
    play: 'Reproduzir',
    pause: 'Pausar',
    next: 'Próximo',
    previous: 'Anterior',
  },
  hints: {
    tapToOpen: 'Toque duas vezes para abrir',
    tapToSelect: 'Toque duas vezes para selecionar',
    swipeToDelete: 'Deslize para excluir',
    longPress: 'Pressione e segure para mais opções',
  },
};

// ======================
// 📦 DEFAULT EXPORT
// ======================

export default {
  Welcome,
  Onboarding,
  Chat,
  Habits,
  Community,
  Content,
  Home,
  Settings,
  Errors,
  EmptyStates,
  Achievements,
  Notifications,
  CTA,
  Forms,
  A11y,
};
