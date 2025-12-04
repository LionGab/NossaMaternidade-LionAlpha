# Guia de Implementação - Nossa Maternidade

## Implementação Completa Realizada ✅

Este documento detalha toda a implementação de MCPs (Model Context Protocol), Agentes IA e a estrutura da aplicação baseada na página de referência.

---

## 📦 1. MCPs (Model Context Protocol) Implementados

### Localização: `src/mcp/`

#### 1.1 Supabase MCP Server (`src/mcp/servers/SupabaseMCPServer.ts`)

- **Autenticação**: Sign in, Sign up, Sign out
- **Database**: Query, Insert, Update, Delete
- **Storage**: Upload, Download, Delete de arquivos
- **Uso**:

```typescript
import { supabaseMCP, createMCPRequest } from '@/mcp/servers';

// Exemplo: Login
const request = createMCPRequest('auth.signIn', {
  email: 'user@example.com',
  password: 'password123',
});
const response = await supabaseMCP.handleRequest(request);
```

#### 1.2 Google AI MCP Server (`src/mcp/servers/GoogleAIMCPServer.ts`)

- **Chat**: Conversas contextualizadas com Gemini
- **Análise**: Análise de emoções e sentimentos
- **Geração**: Criação de conteúdo personalizado
- **Summarização**: Resumos de textos
- **Uso**:

```typescript
import { googleAIMCP, createMCPRequest } from '@/mcp/servers';

// Exemplo: Chat
const request = createMCPRequest('chat.send', {
  message: 'Estou me sentindo ansiosa...',
  context: { lifeStage: 'pregnant', challenges: ['anxiety'] },
});
const response = await googleAIMCP.handleRequest(request);
```

#### 1.3 Analytics MCP Server (`src/mcp/servers/AnalyticsMCPServer.ts`)

- **Eventos**: Tracking de eventos personalizados
- **Telas**: Tracking de visualizações de tela
- **Usuários**: Identificação e aliasing de usuários
- **Uso**:

```typescript
import { analyticsMCP, createMCPRequest } from '@/mcp/servers';

// Exemplo: Track evento
const request = createMCPRequest('event.track', {
  name: 'onboarding_completed',
  properties: { lifeStage: 'pregnant' },
});
await analyticsMCP.handleRequest(request);
```

---

## 🤖 2. Agentes IA Implementados

### Localização: `src/agents/`

#### 2.1 Maternal Chat Agent (`src/agents/maternal/MaternalChatAgent.ts`)

- **Função**: Chat empático e informativo para mães
- **Capacidades**:
  - Suporte emocional contextualizado
  - Histórico de conversas
  - Análise de emoções em tempo real
  - Mensagens de boas-vindas personalizadas
- **Uso**:

```typescript
import { MaternalChatAgent, orchestrator } from '@/agents';

// Inicializar agente
const chatAgent = new MaternalChatAgent();
await chatAgent.initialize();
orchestrator.registerAgent(chatAgent);

// Iniciar sessão
const session = await chatAgent.startSession('user-123', {
  name: 'Maria',
  lifeStage: 'pregnant',
  emotion: 'anxious',
});

// Enviar mensagem
const response = await chatAgent.process({
  message: 'Como lidar com a ansiedade?',
  attachContext: true,
});
```

#### 2.2 Content Recommendation Agent (`src/agents/content/ContentRecommendationAgent.ts`)

- **Função**: Recomendação personalizada de conteúdo
- **Capacidades**:
  - Scoring de relevância baseado em perfil
  - Otimização de diversidade
  - Explicações geradas por IA
  - Filtros personalizáveis
- **Uso**:

```typescript
import { ContentRecommendationAgent } from '@/agents';

const recommendationAgent = new ContentRecommendationAgent();
await recommendationAgent.initialize();

const result = await recommendationAgent.process({
  userId: 'user-123',
  userProfile: {
    lifeStage: 'new-mother',
    challenges: ['sleep', 'breastfeeding'],
    viewHistory: ['content-1', 'content-2'],
  },
  contentPool: contentItems,
  maxResults: 10,
});
```

#### 2.3 Habits Analysis Agent (`src/agents/habits/HabitsAnalysisAgent.ts`)

- **Função**: Análise de hábitos e bem-estar
- **Capacidades**:
  - Detecção de padrões de comportamento
  - Análise de tendências
  - Geração de insights personalizados
  - Alertas de bem-estar
- **Uso**:

```typescript
import { HabitsAnalysisAgent } from '@/agents';

const habitsAgent = new HabitsAnalysisAgent();
await habitsAgent.initialize();

const analysis = await habitsAgent.process({
  userId: 'user-123',
  entries: habitEntries,
  timeRange: { start: '2025-01-01', end: '2025-01-31' },
});

// Resultado: scores, padrões, recomendações, alertas
console.log(analysis.overallScore); // 0-100
console.log(analysis.recommendations); // Array de recomendações
```

---

## 🎯 3. Sistema de Onboarding (9 Etapas)

### Localização: `src/types/onboarding.ts` e `src/screens/onboarding/`

### Fluxo de Onboarding:

#### **Step 1: Nome**

- Coleta o nome do usuário
- Validação: Nome não vazio

#### **Step 2: Fase da Vida**

- Opções: Grávida, Mãe de primeira viagem, Mãe experiente, Tentando engravidar
- Enum: `UserLifeStage`

#### **Step 3: Timeline**

- Semanas de gestação OU meses pós-parto
- Opcional dependendo da fase

#### **Step 4: Emoção Atual**

- Opções: Ansiosa, Cansada, Culpada, Feliz, Confusa, Sobrecarregada
- Enum: `UserEmotion`

#### **Step 5: Desafios** (Múltipla escolha)

- Opções: Sono, Amamentação, Ansiedade, Relacionamentos, Trabalho, Solidão, etc.
- Enum: `UserChallenge`

#### **Step 6: Rede de Apoio**

- Opções: Forte, Moderado, Fraco, Nenhum
- Enum: `SupportLevel`

#### **Step 7: Necessidades Primárias** (Múltipla escolha)

- Opções: Chat, Aprendizado, Técnicas de calma, Comunidade, Tracking
- Enum: `UserNeed`

#### **Step 8: Preferências de Notificação**

- Toggle para diferentes tipos de notificações
- Lembretes diários, atualizações de conteúdo, atividade da comunidade

#### **Step 9: Termos e Privacidade**

- Checkboxes para aceite dos termos
- Validação: Ambos devem ser aceitos

### Uso do Onboarding:

```typescript
import { OnboardingFlowNew } from '@/screens/onboarding/OnboardingFlowNew';

<OnboardingFlowNew
  onComplete={(profile) => {
    // Profile completo com todas as informações
    console.log(profile);
    // Navegar para a home
  }}
/>
```

---

## 🏗️ 4. Estrutura de Telas (Mobile-First)

### Principais Screens a Implementar:

#### 4.1 HomeScreen

- Dashboard personalizado
- Sleep Tracker (qualidade do sono)
- Quick actions
- Feed de conteúdo "Mundo Nath"

#### 4.2 ChatScreen

- Interface de chat com MãesValente (AI)
- Integração com MaternalChatAgent
- Histórico persistente
- Sugestões contextuais

#### 4.3 ContentFeedScreen (Mundo Nath)

- Filtros por tipo: Vídeo, Áudio, Reels, Texto
- Integração com ContentRecommendationAgent
- Player fullscreen
- Sistema de busca

#### 4.4 SeriesScreen

- "Bastidores com o Thales" - 7 episódios
- Progress tracking
- Sistema de episódios bloqueados/desbloqueados

#### 4.5 CommunityScreen (MãesValentes)

- Conexões com outras mães
- Forum/discussões
- Grupos por fase/interesse

#### 4.6 HabitsScreen

- Tracking de hábitos diários
- Integração com HabitsAnalysisAgent
- Visualização de progresso
- Insights e recomendações

#### 4.7 RitualScreen

- Exercícios de respiração
- Técnicas de calma
- Meditações guiadas

---

## 🔗 5. Integração Completa

### 5.1 Inicialização do Sistema (App.tsx ou index.ts)

```typescript
import { orchestrator } from '@/agents';
import { MaternalChatAgent, ContentRecommendationAgent, HabitsAnalysisAgent } from '@/agents';

// No componente raiz da aplicação
useEffect(() => {
  async function initializeSystem() {
    // 1. Inicializar Orchestrator (inicializa todos os MCPs)
    await orchestrator.initialize();

    // 2. Criar e registrar agentes
    const chatAgent = new MaternalChatAgent();
    const contentAgent = new ContentRecommendationAgent();
    const habitsAgent = new HabitsAnalysisAgent();

    await Promise.all([
      chatAgent.initialize(),
      contentAgent.initialize(),
      habitsAgent.initialize(),
    ]);

    orchestrator.registerAgent(chatAgent);
    orchestrator.registerAgent(contentAgent);
    orchestrator.registerAgent(habitsAgent);

    console.log('Sistema inicializado com sucesso!');
  }

  initializeSystem().catch(console.error);

  // Cleanup
  return () => {
    orchestrator.shutdown();
  };
}, []);
```

### 5.2 Uso em Screens

```typescript
// ChatScreen
import { orchestrator } from '@/agents';

const ChatScreen = () => {
  const sendMessage = async (message: string) => {
    const result = await orchestrator.executeTask('maternal-chat-agent', {
      message,
      attachContext: true,
    });
    return result;
  };
};

// HabitsScreen
const HabitsScreen = () => {
  const analyzeHabits = async (entries: HabitEntry[]) => {
    const analysis = await orchestrator.executeTask('habits-analysis-agent', {
      userId: currentUser.id,
      entries,
    });
    return analysis;
  };
};
```

---

## 📱 6. Navigation (Bottom Tab - Mobile First)

### Tab Structure:

```typescript
// src/navigation/BottomTabNavigator.tsx

<Tab.Navigator>
  <Tab.Screen name="Home" component={HomeScreen} />
  <Tab.Screen name="Community" component={CommunityScreen} />
  <Tab.Screen name="Chat" component={ChatScreen} />
  <Tab.Screen name="Content" component={ContentFeedScreen} />
  <Tab.Screen name="Habits" component={HabitsScreen} />
</Tab.Navigator>
```

---

## 🔐 7. Variáveis de Ambiente Necessárias

Criar arquivo `.env`:

```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
EXPO_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
```

---

## 🚀 8. Como Executar

### Instalar dependências:

```bash
npm install
```

### Executar:

```bash
# iOS
npm run ios

# Android
npm run android

# Web (desenvolvimento)
npm run web
```

### Build para produção:

```bash
# iOS
npm run build:ios

# Android
npm run build:android
```

---

## 📊 9. Fluxo de Dados

```
Usuário
  ↓
Screens (UI)
  ↓
Agent Orchestrator
  ↓
Agentes IA (Maternal, Content, Habits)
  ↓
MCP Servers (Supabase, Google AI, Analytics)
  ↓
Serviços Externos (Banco, AI, Tracking)
```

---

## 🎨 10. Design System

Utiliza o Design System já existente em `src/theme/`:

- Colors: Primary (azul), Success, Warning, Error
- Typography: Responsivo mobile-first
- Spacing: Sistema de espaçamento consistente
- Components: Primitivos já implementados

---

## ✅ 11. Checklist de Implementação

### Concluído ✅

- [x] Sistema de MCPs (Supabase, Google AI, Analytics)
- [x] Agentes IA (Maternal Chat, Content Recommendation, Habits Analysis)
- [x] Tipos de Onboarding (9 steps)
- [x] Arquitetura base e Orchestrator
- [x] Sistema de tipos TypeScript completo

### A Implementar 🔨

- [ ] Screens completas (Home, Chat, Content, etc.)
- [ ] Navigation completa com Bottom Tabs
- [ ] Integração final entre screens e agentes
- [ ] Sistema de Breathing Exercises
- [ ] Series Screen (Bastidores com Thales)
- [ ] Testes completos do fluxo

---

## 📝 12. Próximos Passos

1. **Implementar Screens Principais**:
   - HomeScreen com Dashboard
   - ChatScreen com agente integrado
   - ContentFeedScreen com recomendações
   - HabitsScreen com análise

2. **Configurar Navigation**:
   - Bottom Tab Navigator mobile-first
   - Stack Navigator para sub-screens
   - Deep linking

3. **Testar Integração**:
   - Fluxo completo de onboarding
   - Chat funcional com Gemini
   - Recomendações de conteúdo
   - Análise de hábitos

4. **Otimizar Performance**:
   - Lazy loading de agentes
   - Cache de respostas
   - Offline support

5. **Preparar para Stores**:
   - App Store guidelines
   - Google Play Store guidelines
   - Privacy policy & terms
   - Screenshots e assets

---

## 🆘 13. Troubleshooting

### MCPs não inicializam:

- Verificar variáveis de ambiente em `.env`
- Verificar conexão com Supabase
- Verificar API key do Gemini

### Agentes não respondem:

- Verificar se Orchestrator foi inicializado
- Verificar se agentes foram registrados
- Checar logs de erro no console

### Performance lenta:

- Implementar cache de respostas do AI
- Usar debounce em inputs de chat
- Implementar pagination no feed

---

## 📖 14. Documentação Adicional

- **MCPs**: Ver `src/mcp/types/index.ts` para todas as interfaces
- **Agentes**: Ver `src/agents/*/` para detalhes de cada agente
- **Onboarding**: Ver `src/types/onboarding.ts` para tipos completos
- **Theme**: Ver `src/theme/` para Design System

---

## 🎉 Conclusão

O sistema está arquitetado de forma escalável e mobile-first, pronto para iOS e Android (App Store e Google Play Store). A arquitetura MCP + Agentes permite:

- ✅ Separação de responsabilidades
- ✅ Fácil manutenção e testes
- ✅ Escalabilidade para novos agentes/MCPs
- ✅ Integração simples com serviços externos
- ✅ Experiência personalizada para cada mãe

**Status**: Infraestrutura completa implementada. Próximo passo: Implementar as screens e finalizar a UI.
