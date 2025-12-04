# GUIA COMPLETO - Nossa Maternidade
## Documento Unificado: Desenvolvimento, Deploy e Store Readiness
### Versao 3.0.0 - Dezembro 2025

---

> **Proposito:** Este documento consolida TODA a documentacao do projeto Nossa Maternidade em um unico lugar. Inclui visao geral, arquitetura, bugs criticos, codigo refatorado, compliance de stores e checklists de deploy.

> **Como Usar:** Use o indice para navegar diretamente para a secao desejada.

---

## INDICE

1. [PARTE 1: VISAO GERAL](#parte-1-visao-geral)
   - [1.1 O Que E Este App](#11-o-que-e-este-app)
   - [1.2 Stack Tecnologica](#12-stack-tecnologica)
   - [1.3 Nota de Qualidade](#13-nota-de-qualidade)
   - [1.4 Status Atual](#14-status-atual)

2. [PARTE 2: QUICK START](#parte-2-quick-start)
   - [2.1 Setup Inicial](#21-setup-inicial)
   - [2.2 Comandos Essenciais](#22-comandos-essenciais)
   - [2.3 Path Aliases](#23-path-aliases)
   - [2.4 Troubleshooting Comum](#24-troubleshooting-comum)

3. [PARTE 3: ARQUITETURA](#parte-3-arquitetura)
   - [3.1 Estrutura de Pastas](#31-estrutura-de-pastas)
   - [3.2 Sistema de Agentes IA](#32-sistema-de-agentes-ia)
   - [3.3 MCP Servers](#33-mcp-servers)
   - [3.4 Design System](#34-design-system)

4. [PARTE 4: PADROES DE CODIGO](#parte-4-padroes-de-codigo)
   - [4.1 Regras de Ouro](#41-regras-de-ouro)
   - [4.2 Patterns Criticos](#42-patterns-criticos)
   - [4.3 Error Handling](#43-error-handling)
   - [4.4 Logging](#44-logging)

5. [PARTE 5: BUGS CRITICOS E CORRECOES](#parte-5-bugs-criticos-e-correcoes)
   - [5.1 Bug #1: Analytics Quebra o Chat](#51-bug-1-analytics-quebra-o-chat)
   - [5.2 Bug #2: Filtro de Tags Elimina Tudo](#52-bug-2-filtro-de-tags-elimina-tudo)
   - [5.3 Bug #3: Ordenacao de Habitos Quebrada](#53-bug-3-ordenacao-de-habitos-quebrada)
   - [5.4 Bug #4: Streak Conta Dias Duplicados](#54-bug-4-streak-conta-dias-duplicados)
   - [5.5 Bug #5: JSON Parse Sem Protecao](#55-bug-5-json-parse-sem-protecao)
   - [5.6 Bug #6: Privacy Policy Nao Implementada](#56-bug-6-privacy-policy-nao-implementada)
   - [5.7 Bug #7: Throw Desnecessario Trava Tela](#57-bug-7-throw-desnecessario-trava-tela)
   - [5.8 Bug #8: useCallback Faltando](#58-bug-8-usecallback-faltando)

6. [PARTE 6: SEGURANCA](#parte-6-seguranca)
   - [6.1 API Key Exposta (CRITICO)](#61-api-key-exposta-critico)
   - [6.2 Edge Function Segura](#62-edge-function-segura)
   - [6.3 Row Level Security (RLS)](#63-row-level-security-rls)
   - [6.4 SecureStore para Tokens](#64-securestore-para-tokens)

7. [PARTE 7: ATUALIZACOES OBRIGATORIAS 2025](#parte-7-atualizacoes-obrigatorias-2025)
   - [7.1 Android 16 Edge-to-Edge](#71-android-16-edge-to-edge)
   - [7.2 SDK 35 Obrigatorio](#72-sdk-35-obrigatorio)
   - [7.3 Privacy Manifest iOS](#73-privacy-manifest-ios)
   - [7.4 AI Disclosure](#74-ai-disclosure)
   - [7.5 Account Deletion](#75-account-deletion)

8. [PARTE 8: CODIGO REFATORADO](#parte-8-codigo-refatorado)
   - [8.1 MaternalChatAgent.ts](#81-maternalchatagenttts)
   - [8.2 ContentRecommendationAgent.ts](#82-contentrecommendationagenttts)
   - [8.3 HabitsAnalysisAgent.ts](#83-habitsanalysisagenttts)
   - [8.4 AgentsContext.tsx](#84-agentscontexttsx)
   - [8.5 WellnessContext.tsx](#85-wellnesscontexttsx)

9. [PARTE 9: COMPLIANCE E LEGAL](#parte-9-compliance-e-legal)
   - [9.1 LGPD Compliance](#91-lgpd-compliance)
   - [9.2 Privacy Policy](#92-privacy-policy)
   - [9.3 Data Safety Google Play](#93-data-safety-google-play)
   - [9.4 App Store Privacy Details](#94-app-store-privacy-details)

10. [PARTE 10: DEPLOY E STORES](#parte-10-deploy-e-stores)
    - [10.1 Configuracao EAS](#101-configuracao-eas)
    - [10.2 Checklist iOS App Store](#102-checklist-ios-app-store)
    - [10.3 Checklist Google Play](#103-checklist-google-play)
    - [10.4 Timeline de Submissao](#104-timeline-de-submissao)

---

# PARTE 1: VISAO GERAL

## 1.1 O Que E Este App

**Nossa Maternidade** e um aplicativo mobile React Native + Expo para maes brasileiras, focado em:

- **Apoio emocional** com IA amigavel (NathIA)
- **Comunidade** de maes (MaesValentes)
- **Conteudo personalizado** (MundoNath)
- **Tracking de habitos** e bem-estar
- **Autocuidado** e desenvolvimento pessoal

### Funcionalidades Principais

| Funcionalidade | Descricao | Status |
|----------------|-----------|--------|
| Chat com IA (NathIA) | Assistente empatica usando Google Gemini | Funcional |
| Recomendacoes | Conteudo personalizado por fase | Funcional |
| Analise de Habitos | Padroes de bem-estar e streaks | Bugs identificados |
| Comunidade | Conexao entre maes | Funcional |
| Diario | Registro de momentos | Funcional |
| Mundo Nath | Feed de videos, audios, reels | Funcional |
| Exercicios de Respiracao | Tecnicas de calma | Funcional |
| Sleep Tracker | Rastreamento de sono | Funcional |

---

## 1.2 Stack Tecnologica

### Frontend

| Tecnologia | Versao | Status |
|------------|--------|--------|
| Framework | React Native + Expo SDK 54+ | OK |
| Language | TypeScript 5.7+ (strict mode) | OK |
| Styling | NativeWind 4.2.1 (Tailwind) | OK |
| Navigation | React Navigation 7 | OK |
| State | TanStack Query (React Query) | OK |
| UI | Componentes customizados (Atomic Design) | OK |
| Theme | Design Tokens (`src/theme/tokens.ts`) | OK |
| Testing | Jest + React Native Testing Library | OK |

### Backend

| Tecnologia | Funcao | Status |
|------------|--------|--------|
| Database | Supabase (PostgreSQL) + RLS | OK |
| Auth | Supabase Auth (magic links + social) | OK |
| Storage | Supabase Storage (avatares, thumbs) | OK |
| Realtime | Supabase Realtime (comunidade live) | OK |
| Edge Functions | Supabase Edge Functions (Deno) | OK |

### IA Stack (Multi-Provider + Fallback)

| Caso de Uso | Primary | Fallback 1 | Fallback 2 |
|-------------|---------|-----------|-----------|
| Chat NathIA (default) | Gemini 2.5 Flash | GPT-4o | Claude Opus |
| Crise emocional | GPT-4o (safety) | Gemini thinking | Claude Opus |
| Analise profunda | Gemini 2.5 Flash thinking | Claude Opus | - |
| Embeddings | Gemini 1.5 | OpenAI text-embed-3 | - |
| Moderacao conteudo | Claude API | OpenAI Moderation | - |

---

## 1.3 Nota de Qualidade

| Fonte | Nota | Observacao |
|-------|------|------------|
| Doc 1 (Best Practices) | 8.5/10 | Foco em seguranca |
| Doc 2 (Grok) | 7/10 | Visao geral |
| Doc 3 (Manual 2025) | 8.5/10 | Atualizacoes plataforma |
| Doc 4 (ChatGPT) | 9/10 | Analise de codigo |
| Doc 5 (Analise Profunda) | 9/10 | Bugs de logica |
| **CONSOLIDADO** | **8.8/10** | Meta: 9.5+ |

**Pontos Fortes:**
- Arquitetura moderna (MCPs + Agentes IA)
- TypeScript strict mode (0 errors)
- Design System unificado
- Codigo limpo e organizado

**Bloqueadores Identificados:**
- 23 issues (8 criticos, 10 importantes, 5 melhorias)
- Test coverage: 1.4% (meta: 80%)
- ESLint warnings: 272 (meta: <50)
- Design violations: ~100 (meta: 0)

---

## 1.4 Status Atual

### Metricas de Qualidade (Dezembro 2025)

| Metrica | Status | Valor Atual | Meta |
|---------|--------|-------------|------|
| TypeScript Errors | OK | 0 | 0 |
| TypeScript Warnings | ATENCAO | ~50-64 | 0 |
| ESLint Errors | OK | 0 | 0 |
| ESLint Warnings | ATENCAO | 272 | <50 |
| Tipos `any` | OK | 0 (services/agents) | <10 |
| console.log | OK | 0 (legitimos) | 0 |
| Test Coverage | ATENCAO | 1.4% | 80% |
| Design Violations | ATENCAO | ~100 | 0 |
| WCAG AAA | ATENCAO | 75-80% | 100% |
| Dark Mode | ATENCAO | 75-80% | 100% |

---

# PARTE 2: QUICK START

## 2.1 Setup Inicial

### Pre-requisitos

- Node.js 18+ (recomendado: Node 22 LTS)
- npm ou yarn
- Expo CLI (`npm install -g expo-cli`)
- Git

### Instalacao Rapida

```bash
# 1. Clone o repositorio
git clone https://github.com/LionGab/NossaMaternidade.git
cd NossaMaternidade

# 2. Instale as dependencias
npm install

# 3. Configure as variaveis de ambiente
cp .env.example .env
# Edite .env com suas chaves

# 4. Inicie o servidor de desenvolvimento
npm start
```

### Variaveis de Ambiente

```env
# SUPABASE (Backend)
EXPO_PUBLIC_SUPABASE_URL=https://[PROJECT_ID].supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=[ANON_KEY]
EXPO_PUBLIC_SUPABASE_FUNCTIONS_URL=https://[PROJECT_ID].supabase.co/functions/v1

# GEMINI AI (Chat IA) - MOVER PARA EDGE FUNCTION!
EXPO_PUBLIC_GEMINI_API_KEY=[GEMINI_KEY]
```

**IMPORTANTE:** O arquivo `.env` esta no `.gitignore` e nao sera commitado.

---

## 2.2 Comandos Essenciais

### Desenvolvimento

| Comando | Descricao |
|---------|-----------|
| `npm start` | Inicia servidor Expo |
| `npm run ios` | Executa no iOS Simulator |
| `npm run android` | Executa no Android Emulator |
| `npm run web` | Executa na web (porta 8082) |

### Qualidade de Codigo

| Comando | Descricao |
|---------|-----------|
| `npm run type-check` | Verifica tipos TypeScript |
| `npm run lint` | Executa ESLint |
| `npm test` | Executa testes |
| `npm run test:coverage` | Cobertura de testes |

### Build e Deploy

| Comando | Descricao |
|---------|-----------|
| `npm run build:ios` | Build producao iOS |
| `npm run build:android` | Build producao Android |
| `npm run build:production` | Build ambas plataformas |
| `npm run submit:ios` | Submit para App Store |
| `npm run submit:android` | Submit para Google Play |

### Validacao

| Comando | Descricao |
|---------|-----------|
| `npm run validate` | Valida tudo (TS, design, env) |
| `npm run validate:design` | Valida design tokens |
| `npm run validate:env` | Valida variaveis de ambiente |
| `npm run check-ready` | Checklist pre-deploy |

---

## 2.3 Path Aliases

```typescript
@/*           -> ./src/*
@components/* -> ./src/components/*
@screens/*    -> ./src/screens/*
@services/*   -> ./src/services/*
@utils/*      -> ./src/utils/*
@types/*      -> ./src/types/*
@constants/*  -> ./src/constants/*
@hooks/*      -> ./src/hooks/*
@context/*    -> ./src/context/*
```

---

## 2.4 Troubleshooting Comum

### Erro: "API key nao configurada"

```bash
# Verifique se .env existe e tem EXPO_PUBLIC_GEMINI_API_KEY
npm start -- --clear
```

### Erro: "Cannot find module"

```bash
rm -rf node_modules package-lock.json
npm install
npx expo start -c
```

### Erro: Metro bundler nao carrega

```bash
npx expo start -c
# Ou
killall node
npm start
```

---

# PARTE 3: ARQUITETURA

## 3.1 Estrutura de Pastas

```
src/
├── app/                    # App.tsx, navegacao root
├── screens/                # HomeScreen, ChatScreen, OnboardingScreen, etc
├── components/
│   ├── primitives/         # Atoms: Box, Text, Button, HapticButton
│   ├── molecules/          # Molecules: Avatar, Badge, EmotionalPrompt
│   ├── organisms/          # Organisms: MaternalCard (6 variants)
│   └── templates/          # Templates: ScreenLayout, SectionLayout
├── services/
│   ├── supabase/           # profileService, chatService, emotionService
│   ├── ai/                 # llmRouter, aiOrchestrator, aiFallback
│   └── geminiService.ts    # Legacy (manter compativel)
├── ai/
│   ├── config/             # llmConfig.ts, llmRouter.ts
│   ├── agents/             # MaternalChatAgent, ContentRecommendationAgent
│   ├── prompts/            # nathia.system.md, crisis.system.md
│   └── moderation/         # MedicalModerationService.ts
├── theme/                  # tokens.ts (DESIGN SYSTEM MODERNO)
├── types/                  # user.ts, ai.ts, content.ts
├── hooks/                  # useAIRouting, useEmotionTracking, useHabits
└── utils/                  # logger.ts, ai.ts, supabase.ts
```

---

## 3.2 Sistema de Agentes IA

### Agentes Disponiveis (9 total)

| Agente | Funcao | Localizacao |
|--------|--------|-------------|
| `AgentOrchestrator` | Gerencia todos os agentes | `src/agents/core/` |
| `MaternalChatAgent` | Chat principal com IA | `src/agents/maternal/` |
| `ContentRecommendationAgent` | Recomendacoes personalizadas | `src/agents/content/` |
| `HabitsAnalysisAgent` | Analise de habitos | `src/agents/habits/` |
| `EmotionAnalysisAgent` | Analise emocional | `src/agents/emotion/` |
| `NathiaPersonalityAgent` | Personalidade da NathIA | `src/agents/personality/` |
| `SleepAnalysisAgent` | Analise de sono | `src/agents/sleep/` |
| `DesignQualityAgent` | Qualidade de design | `src/agents/design/` |

---

## 3.3 MCP Servers

### Servers Disponiveis (6 total)

| Server | Funcao |
|--------|--------|
| `SupabaseMCPServer` | Database + Auth + Storage |
| `GoogleAIMCPServer` | Gemini integration |
| `OpenAIMCPServer` | GPT integration |
| `AnthropicMCPServer` | Claude integration |
| `AnalyticsMCPServer` | Metricas e analytics |
| `PlaywrightMCPServer` | Automacao de testes |

### Parallel Execution

```typescript
const result = await orchestrator.callMCPParallel([
  { server: 'supabase', method: 'db.query', params: {...} },
  { server: 'googleai', method: 'analyze', params: {...} }
]);
```

---

## 3.4 Design System

### Principios Fundamentais

1. **Humanizado e Maternal:** Acolhedor, confiavel, sereno, empoderador
2. **Acessibilidade como Prioridade:** WCAG AAA (contraste 7:1, touch targets 44pt+)
3. **Simplicidade e Clareza:** Menos e mais, hierarquia clara, consistencia

### Tokens do Design System

**Fonte Unica da Verdade:** `src/theme/tokens.ts`

```typescript
import { Tokens } from '@/theme/tokens';
import { useThemeColors } from '@/hooks/useTheme';

const colors = useThemeColors();
colors.background.canvas;
colors.text.primary;
colors.primary.main;

// Spacing (multiplos de 4)
Tokens.spacing['4']; // 16px
Tokens.spacing['6']; // 24px

// Typography
Tokens.typography.sizes.md; // 16

// Border radius
Tokens.radius.lg; // 12

// Touch targets (WCAG AAA)
Tokens.touchTargets.min; // 44pt
```

**NUNCA usar:** `@/design-system` (sistema legado)

---

# PARTE 4: PADROES DE CODIGO

## 4.1 Regras de Ouro

### SEMPRE fazer:

- `logger.*` para logs (NUNCA `console.log`)
- `useThemeColors()` para cores (NUNCA hardcoded)
- `FlatList` para listas (NUNCA `ScrollView` com `.map()`)
- Tokens do Design System (`Tokens.spacing`, `Tokens.radius`)
- Touch targets minimo 44pt (iOS) / 48dp (Android)
- Memoizar componentes de lista com `memo()`
- Tratar erros explicitamente (padrao `{ data, error }`)
- Rotear IA via `llmRouter.ts` (fallback automatico)

### NUNCA fazer:

- Usar `any` em TypeScript (use `unknown`)
- Usar `console.log/warn/error`
- Commitar secrets, API keys, tokens
- Fazer `git push --force` em main/master
- Deixar RLS desabilitado no Supabase

---

## 4.2 Patterns Criticos

### LLM Router

```typescript
// Fallback: Gemini -> GPT-4o -> Claude Opus
const result = await llmRouter.route({
  context: 'chat',
  message: userMessage,
  userId,
});
```

### Services Pattern

```typescript
// Services SEMPRE retornam { data, error }
async function getProfile(userId: string): Promise<{ data: Profile | null; error: Error | null }> {
  try {
    const data = await supabase.from('profiles').select().eq('id', userId).single();
    return { data, error: null };
  } catch (error) {
    return { data: null, error: error as Error };
  }
}
```

---

## 4.3 Error Handling

```typescript
// Services SEMPRE retornam { data, error }
const { data, error } = await profileService.getProfile(userId);
if (error) {
  logger.error('Falha ao carregar perfil', error);
  return;
}
// usar data...
```

---

## 4.4 Logging

```typescript
import { logger } from '@/utils/logger';

logger.debug('Debug info'); // Dev only
logger.info('User action', { userId });
logger.warn('Problema', error); // + Sentry
logger.error('Falha critica', error); // + Sentry
```

**NUNCA:** `console.log/warn/error`

---

# PARTE 5: BUGS CRITICOS E CORRECOES

## 5.1 Bug #1: Analytics Quebra o Chat (CRITICO)

**Arquivos Afetados:**
- `src/agents/maternal/MaternalChatAgent.ts`
- `src/agents/content/ContentRecommendationAgent.ts`
- `src/agents/habits/HabitsAnalysisAgent.ts`

**O Problema:**
```typescript
// Se o analytics falhar, TODO o chat para!
async startSession(userId: string, userContext?: UserContext): Promise<ChatSession> {
  // ... codigo criando sessao ...

  // PROBLEMA: Sem try/catch, erro aqui cancela tudo!
  await this.callMCP('analytics', 'event.track', {
    name: 'chat_session_started',
    properties: { sessionId: this.currentSession.id, userId, context: userContext }
  });
  // Se analytics falhar -> catch geral -> usuaria recebe mensagem de erro
}
```

**Analogia:** E como parar o jogo de futebol porque o placar eletronico travou.

**Impacto:**
- Usuaria ve "Erro tecnico" mesmo quando a IA respondeu
- Experiencia quebrada por servico secundario

**Correcao:** Ver codigo refatorado em [8.1 MaternalChatAgent.ts](#81-maternalchatagenttts)

---

## 5.2 Bug #2: Filtro de Tags Elimina Tudo (MEDIO)

**Arquivo:** `src/agents/content/ContentRecommendationAgent.ts`

**O Problema:**
```typescript
// Se tags for array vazio [], NADA passa no filtro!
private applyFilters(content: ContentItem[], filters?: RecommendationFilters): ContentItem[] {
  return content.filter(item => {
    if (filters.tags) {
      const hasTag = item.tags.some(tag => filters.tags!.includes(tag));
      if (!hasTag) return false; // [].includes(qualquer) = false sempre!
    }
    return true;
  });
}
```

**Analogia:** E como uma peneira que segura TUDO quando voce nao especifica o tamanho dos buracos.

**Impacto:**
- Zero recomendacoes exibidas
- Tela vazia sem explicacao

**Correcao:** Ver codigo refatorado em [8.2 ContentRecommendationAgent.ts](#82-contentrecommendationagenttts)

---

## 5.3 Bug #3: Ordenacao de Habitos Quebrada (CRITICO)

**Arquivo:** `src/agents/habits/HabitsAnalysisAgent.ts`

**O Problema:**
```typescript
// Calcula bestStreak com dados FORA DE ORDEM!
private analyzeHabitPatterns(entries: HabitEntry[]): HabitPattern[] {
  for (const entry of entries) { // Ordem original, nao cronologica!
    // Se entries = [Dia10, Dia8, Dia9]
    // O calculo pensa que a sequencia "quebrou" no Dia8
  }
}
```

**Analogia:** E como ler as paginas de um diario embaralhadas.

**Impacto:**
- Streaks calculados incorretamente
- Tendencias invertidas

**Correcao:** Ver codigo refatorado em [8.3 HabitsAnalysisAgent.ts](#83-habitsanalysisagenttts)

---

## 5.4 Bug #4: Streak Conta Dias Duplicados (MEDIO)

**Arquivo:** `src/features/wellness/context/WellnessContext.tsx`

**O Problema:**
```typescript
// Se 2 check-ins no mesmo dia, conta 2x!
const currentStreak = useMemo(() => {
  const sorted = [...checkIns].sort(...);
  // Nao filtra datas unicas!
  // Dia 1: check-in A, check-in B -> conta como 2 dias!
}, [checkIns]);
```

**Impacto:**
- Streak inflado artificialmente
- Gamificacao perde credibilidade

**Correcao:** Ver codigo refatorado em [8.5 WellnessContext.tsx](#85-wellnesscontexttsx)

---

## 5.5 Bug #5: JSON Parse Sem Protecao (MEDIO)

**Arquivo:** `src/features/wellness/context/WellnessContext.tsx`

**O Problema:**
```typescript
// Se JSON estiver corrompido, TODO o carregamento falha!
const loadInitialData = async () => {
  const profileData = await AsyncStorage.getItem('nath_wellness_profile');
  const profile = JSON.parse(profileData); // Pode crashar!
  setProfile(profile);
};
```

**Impacto:**
- App crasha ao abrir
- Usuaria perde acesso a seus dados

**Correcao:** Ver codigo refatorado em [8.5 WellnessContext.tsx](#85-wellnesscontexttsx)

---

## 5.6 Bug #6: Privacy Policy Nao Implementada (CRITICO para Stores)

**Arquivo:** `src/features/consent/ConsentScreen.tsx`

**O Problema:**
```typescript
const openPrivacyPolicy = () => {
  logger.info('Abrindo politica de privacidade...');
  // TODO: Implementar navegacao para politica <- NAO FAZ NADA!
};
```

**IMPORTANTE:** Apple e Google REJEITAM apps sem link funcional para Politica de Privacidade!

**Impacto:**
- Rejeicao garantida em ambas as stores
- Violacao de LGPD/GDPR

**Correcao:** Ver secao [9.2 Privacy Policy](#92-privacy-policy)

---

## 5.7 Bug #7: Throw Desnecessario Trava Tela (MEDIO)

**Arquivo:** `src/agents/content/ContentRecommendationAgent.ts`

**O Problema:**
```typescript
async process(input: RecommendationRequest): Promise<RecommendationResult> {
  try {
    // ... logica ...
  } catch (error) {
    logger.error('Erro ao gerar recomendacoes', error);
    throw error; // Por que propagar? Isso trava a tela!
  }
}
```

**Impacto:**
- Tela congela ou mostra erro generico
- Sem fallback para conteudo padrao

**Correcao:** Ver codigo refatorado em [8.2 ContentRecommendationAgent.ts](#82-contentrecommendationagenttts)

---

## 5.8 Bug #8: useCallback Faltando (PERFORMANCE)

**Arquivo:** `src/contexts/AgentsContext.tsx`

**O Problema:**
```typescript
// Funcoes recriadas a cada render!
const AgentsProvider = ({ children }) => {
  const initializeAgent = async (agentName: string) => { ... };
  const isAgentReady = (agentName: string) => agentStatus[agentName] === true;

  // Isso faz o useMemo recriar o value do contexto toda hora
  const value = useMemo(() => ({
    initializeAgent,  // Nova referencia a cada render!
    isAgentReady,     // Nova referencia a cada render!
  }), [...]);
};
```

**Impacto:**
- Re-renders desnecessarios em toda a arvore
- Performance degradada
- Bateria consumida mais rapido

**Correcao:** Ver codigo refatorado em [8.4 AgentsContext.tsx](#84-agentscontexttsx)

---

# PARTE 6: SEGURANCA

## 6.1 API Key Exposta (CRITICO)

**O Problema:**
```typescript
// A chave esta visivel no bundle do app!
const GEMINI_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
// Qualquer pessoa pode extrair essa chave do APK/IPA
```

A Expo documenta oficialmente: "Nunca coloque segredos em variaveis EXPO_PUBLIC_"

**Impacto:**
- Qualquer um pode usar sua API key
- Custos inesperados na sua conta Google
- Possivel bloqueio da conta

---

## 6.2 Edge Function Segura

**Arquivo:** `supabase/functions/chat-gemini/index.ts`

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ChatRequest {
  messages: Array<{ role: string; content: string }>;
  systemPrompt?: string;
  context?: Record<string, unknown>;
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { messages, systemPrompt, context } = await req.json() as ChatRequest;

    // Chave segura no servidor - NUNCA vai para o app!
    const GEMINI_KEY = Deno.env.get('GEMINI_API_KEY');
    if (!GEMINI_KEY) {
      console.error('GEMINI_API_KEY nao configurada');
      throw new Error('Configuracao de IA invalida');
    }

    // Formatar mensagens para Gemini
    const contents = messages.map((msg) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    }));

    // Adicionar system prompt
    if (systemPrompt && contents.length > 0 && contents[0].role === 'user') {
      contents[0].parts[0].text = `${systemPrompt}\n\nUsuaria: ${contents[0].parts[0].text}`;
    }

    // Chamar Gemini 2.0 Flash
    const response = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': GEMINI_KEY,
        },
        body: JSON.stringify({
          contents,
          generationConfig: {
            temperature: 0.7,
            topP: 0.95,
            topK: 40,
            maxOutputTokens: 2048,
          },
          safetySettings: [
            { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
            { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
            { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
            { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          ],
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Erro Gemini:', errorData);
      throw new Error(errorData.error?.message || 'Erro na API Gemini');
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    return new Response(
      JSON.stringify({
        text,
        success: true,
        model: 'gemini-2.0-flash',
        timestamp: Date.now(),
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Erro na funcao chat-gemini:', error);

    return new Response(
      JSON.stringify({
        error: 'Nao foi possivel processar sua mensagem. Tente novamente.',
        success: false,
        timestamp: Date.now(),
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
```

**Deploy:**
```bash
# Configurar secret (so precisa fazer uma vez)
npx supabase secrets set GEMINI_API_KEY=sua_chave_real_aqui

# Deploy da funcao
npx supabase functions deploy chat-gemini
```

---

## 6.3 Row Level Security (RLS)

```sql
-- HABILITAR RLS EM TODAS AS TABELAS COM DADOS PESSOAIS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE diary_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE check_ins ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_consents ENABLE ROW LEVEL SECURITY;

-- PROFILES: Usuaria so ve/edita seu proprio perfil
CREATE POLICY "profiles_select_own" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "profiles_insert_own" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- DIARY: Usuaria so acessa suas proprias entradas
CREATE POLICY "diary_all_own" ON diary_entries
  FOR ALL USING (auth.uid() = user_id);

-- HABITS: Usuaria so acessa seus proprios habitos
CREATE POLICY "habits_all_own" ON habit_entries
  FOR ALL USING (auth.uid() = user_id);

-- CHECK-INS: Usuaria so acessa seus proprios check-ins
CREATE POLICY "checkins_all_own" ON check_ins
  FOR ALL USING (auth.uid() = user_id);

-- CHAT: Usuaria so acessa suas proprias sessoes
CREATE POLICY "chat_sessions_all_own" ON chat_sessions
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "chat_messages_all_own" ON chat_messages
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM chat_sessions
      WHERE chat_sessions.id = chat_messages.session_id
      AND chat_sessions.user_id = auth.uid()
    )
  );

-- CONSENTS: Usuaria so acessa seus proprios consentimentos
CREATE POLICY "consents_all_own" ON user_consents
  FOR ALL USING (auth.uid() = user_id);

-- CONTENT: Conteudo publico pode ser lido por todos (autenticados)
CREATE POLICY "content_select_published" ON content
  FOR SELECT USING (is_published = true AND auth.role() = 'authenticated');
```

---

## 6.4 SecureStore para Tokens

```typescript
// src/utils/supabaseSecureStorage.ts
import * as SecureStore from 'expo-secure-store';
import { logger } from '@/utils/logger';

const STORAGE_PREFIX = 'supabase_';

export const supabaseSecureStorage = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      const value = await SecureStore.getItemAsync(`${STORAGE_PREFIX}${key}`);
      return value;
    } catch (error) {
      logger.error('[SecureStorage] Erro ao ler', { key, error });
      return null;
    }
  },

  setItem: async (key: string, value: string): Promise<void> => {
    try {
      await SecureStore.setItemAsync(`${STORAGE_PREFIX}${key}`, value);
    } catch (error) {
      logger.error('[SecureStorage] Erro ao salvar', { key, error });
    }
  },

  removeItem: async (key: string): Promise<void> => {
    try {
      await SecureStore.deleteItemAsync(`${STORAGE_PREFIX}${key}`);
    } catch (error) {
      logger.error('[SecureStorage] Erro ao remover', { key, error });
    }
  },
};
```

---

# PARTE 7: ATUALIZACOES OBRIGATORIAS 2025

## 7.1 Android 16 Edge-to-Edge (CRITICO)

O Android 16 **proibiu** as barras pretas no topo e fundo. O app DEVE desenhar a tela inteira.

**O Problema:**
```typescript
// SafeAreaView do React Native esta DEPRECATED!
import { SafeAreaView } from 'react-native';
```

**A Correcao:**

1. **Instalar dependencia:**
```bash
npx expo install react-native-safe-area-context
```

2. **Migrar imports:**
```typescript
// Usar a biblioteca correta
import { SafeAreaView } from 'react-native-safe-area-context';
```

3. **Envolver o App:**
```typescript
// App.tsx
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function App() {
  return (
    <SafeAreaProvider>
      <QueryProvider>
        <ThemeProvider>
          {/* Resto do app */}
        </ThemeProvider>
      </QueryProvider>
    </SafeAreaProvider>
  );
}
```

4. **Configurar Android:**
```properties
# android/gradle.properties
edgeToEdgeEnabled=true
```

---

## 7.2 SDK 35 Obrigatorio

Desde Agosto 2025, todas as novas apps devem usar **Android 15 (API 35)**.

**app.json:**
```json
{
  "expo": {
    "plugins": [
      [
        "expo-build-properties",
        {
          "android": {
            "compileSdkVersion": 35,
            "targetSdkVersion": 35,
            "buildToolsVersion": "35.0.0",
            "minSdkVersion": 24
          }
        }
      ]
    ]
  }
}
```

---

## 7.3 Privacy Manifest iOS

**Obrigatorio desde Maio 2024.**

**app.json:**
```json
{
  "expo": {
    "ios": {
      "privacyManifests": {
        "NSPrivacyTracking": false,
        "NSPrivacyCollectedDataTypes": [
          {
            "NSPrivacyCollectedDataType": "NSPrivacyCollectedDataTypeEmailAddress",
            "NSPrivacyCollectedDataTypeLinked": true,
            "NSPrivacyCollectedDataTypeTracking": false,
            "NSPrivacyCollectedDataTypePurposes": ["NSPrivacyCollectedDataTypePurposeAppFunctionality"]
          },
          {
            "NSPrivacyCollectedDataType": "NSPrivacyCollectedDataTypeHealthData",
            "NSPrivacyCollectedDataTypeLinked": true,
            "NSPrivacyCollectedDataTypeTracking": false,
            "NSPrivacyCollectedDataTypePurposes": ["NSPrivacyCollectedDataTypePurposeAppFunctionality"]
          }
        ],
        "NSPrivacyAccessedAPITypes": [
          {
            "NSPrivacyAccessedAPIType": "NSPrivacyAccessedAPICategoryUserDefaults",
            "NSPrivacyAccessedAPITypeReasons": ["CA92.1"]
          }
        ]
      }
    }
  }
}
```

---

## 7.4 AI Disclosure

**Novo Novembro 2025:** Apple exige consentimento explicito ANTES do primeiro uso da IA.

```typescript
// src/features/consent/AIConsentModal.tsx
import React, { useState } from 'react';
import { Modal, View, Text, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AIConsentModalProps {
  visible: boolean;
  onAccept: () => void;
  onDecline: () => void;
}

const AI_CONSENT_KEY = 'ai_consent_granted';
const AI_CONSENT_VERSION = '1.0';

export const AIConsentModal: React.FC<AIConsentModalProps> = ({
  visible,
  onAccept,
  onDecline,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleAccept = async () => {
    setIsProcessing(true);
    try {
      await AsyncStorage.setItem(AI_CONSENT_KEY, JSON.stringify({
        granted: true,
        version: AI_CONSENT_VERSION,
        timestamp: new Date().toISOString(),
      }));
      onAccept();
    } catch (error) {
      console.error('Failed to save AI consent:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <SafeAreaView style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
        <View style={{ backgroundColor: 'white', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '80%' }}>
          <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 16 }}>
            Assistente de IA Maternal
          </Text>

          <ScrollView style={{ marginBottom: 24 }}>
            <Text style={{ color: '#374151', marginBottom: 16 }}>
              Nossa assistente de IA usa o Google Gemini para fornecer
              orientacoes personalizadas sobre maternidade.
            </Text>

            <View style={{ backgroundColor: '#FEF3C7', padding: 16, borderRadius: 12, marginBottom: 16 }}>
              <Text style={{ fontWeight: '600', marginBottom: 8 }}>
                Dados compartilhados com a IA:
              </Text>
              <Text>
                - Suas perguntas e mensagens de chat{'\n'}
                - Semana da gestacao (se informada){'\n'}
                - Preferencias de bem-estar
              </Text>
            </View>

            <Text style={{ color: '#6B7280', fontSize: 14 }}>
              Esta assistente nao substitui aconselhamento medico profissional.
            </Text>
          </ScrollView>

          <View style={{ flexDirection: 'row', gap: 12 }}>
            <Pressable
              onPress={onDecline}
              style={{ flex: 1, paddingVertical: 16, borderRadius: 12, backgroundColor: '#F3F4F6' }}
            >
              <Text style={{ textAlign: 'center', color: '#374151', fontWeight: '600' }}>
                Nao, obrigada
              </Text>
            </Pressable>

            <Pressable
              onPress={handleAccept}
              disabled={isProcessing}
              style={{ flex: 1, paddingVertical: 16, borderRadius: 12, backgroundColor: '#EC4899' }}
            >
              <Text style={{ textAlign: 'center', color: 'white', fontWeight: '600' }}>
                {isProcessing ? 'Salvando...' : 'Aceitar e continuar'}
              </Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

export const checkAIConsent = async (): Promise<boolean> => {
  try {
    const consent = await AsyncStorage.getItem(AI_CONSENT_KEY);
    if (!consent) return false;
    const parsed = JSON.parse(consent);
    return parsed.granted === true && parsed.version === AI_CONSENT_VERSION;
  } catch {
    return false;
  }
};
```

---

## 7.5 Account Deletion

**Obrigatorio desde Junho 2022 (iOS).**

```typescript
// src/features/settings/AccountDeletionScreen.tsx
import React, { useState } from 'react';
import { View, Text, Alert, ActivityIndicator, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';

export default function AccountDeletionScreen() {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    Alert.alert(
      'Excluir Conta Permanentemente',
      'Esta acao nao pode ser desfeita. Todos os seus dados serao permanentemente removidos.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir Permanentemente',
          style: 'destructive',
          onPress: confirmDeletion,
        },
      ]
    );
  };

  const confirmDeletion = async () => {
    setIsDeleting(true);

    try {
      const { error } = await supabase.functions.invoke('delete-account');

      if (error) throw error;

      await supabase.auth.signOut();

      Alert.alert(
        'Conta Excluida',
        'Sua conta e todos os dados foram removidos permanentemente.',
        [{ text: 'OK', onPress: () => router.replace('/') }]
      );
    } catch (error) {
      Alert.alert('Erro', 'Nao foi possivel excluir sua conta. Tente novamente.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <View style={{ flex: 1, padding: 24 }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 16 }}>
          Excluir Conta
        </Text>

        <View style={{ backgroundColor: '#FEE2E2', padding: 16, borderRadius: 12, marginBottom: 24 }}>
          <Text style={{ color: '#991B1B', fontWeight: '600', marginBottom: 8 }}>
            Atencao
          </Text>
          <Text style={{ color: '#B91C1C' }}>
            A exclusao da conta e permanente e irreversivel.
          </Text>
        </View>

        <Text style={{ color: '#374151', marginBottom: 24 }}>
          De acordo com a LGPD, voce tem direito a exclusao completa dos seus dados pessoais.
        </Text>

        <View style={{ flex: 1 }} />

        <Pressable
          onPress={handleDeleteAccount}
          disabled={isDeleting}
          style={{
            paddingVertical: 16,
            borderRadius: 12,
            backgroundColor: isDeleting ? '#D1D5DB' : '#EF4444'
          }}
        >
          {isDeleting ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={{ textAlign: 'center', color: 'white', fontWeight: '600' }}>
              Excluir Minha Conta
            </Text>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
```

**Edge Function para delecao:**

```typescript
// supabase/functions/delete-account/index.ts
import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Nao autorizado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Deletar arquivos do storage
    const { data: userFiles } = await supabaseAdmin
      .storage
      .from('user-files')
      .list(user.id);

    if (userFiles && userFiles.length > 0) {
      const filePaths = userFiles.map((f) => `${user.id}/${f.name}`);
      await supabaseAdmin.storage.from('user-files').remove(filePaths);
    }

    // Deletar dados das tabelas
    await Promise.all([
      supabaseAdmin.from('wellness_entries').delete().eq('user_id', user.id),
      supabaseAdmin.from('habits').delete().eq('user_id', user.id),
      supabaseAdmin.from('chat_history').delete().eq('user_id', user.id),
      supabaseAdmin.from('consent_records').delete().eq('user_id', user.id),
      supabaseAdmin.from('profiles').delete().eq('user_id', user.id),
    ]);

    // Deletar a conta
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user.id);

    if (deleteError) throw deleteError;

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Delete account error:', error);
    return new Response(
      JSON.stringify({ error: 'Falha ao excluir conta' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
```

---

# PARTE 8: CODIGO REFATORADO

## 8.1 MaternalChatAgent.ts

```typescript
// src/agents/maternal/MaternalChatAgent.ts
// VERSAO CORRIGIDA - Analytics em try/catch separado

import { BaseAgent } from '../base/BaseAgent';
import { logger } from '@/utils/logger';
import { sendMessageToGemini } from '@/services/geminiService';

interface UserContext {
  phase?: string;
  babyAge?: number;
  preferences?: Record<string, unknown>;
}

interface ChatSession {
  id: string;
  userId: string;
  startedAt: number;
  messages: ChatMessage[];
  context?: UserContext;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

interface ChatInput {
  message: string;
  userId: string;
  context?: UserContext;
}

interface ChatOutput {
  text: string;
  sessionId?: string;
  timestamp: number;
  error?: boolean;
}

export class MaternalChatAgent extends BaseAgent {
  private currentSession: ChatSession | null = null;
  private readonly MAX_HISTORY = 20;

  async startSession(userId: string, userContext?: UserContext): Promise<ChatSession> {
    try {
      this.currentSession = await this.getOrCreateSession(userId, userContext);

      // Analytics em try/catch separado - nao bloqueia o chat!
      this.trackEventSafely('chat_session_started', {
        sessionId: this.currentSession.id,
        userId,
        hasContext: !!userContext,
        phase: userContext?.phase,
      });

      // Persistir sessao (fire and forget com tratamento)
      this.persistSession().catch((error) => {
        logger.error('[MaternalChatAgent] Erro ao persistir sessao inicial', error);
      });

      logger.info('[MaternalChatAgent] Sessao iniciada', {
        sessionId: this.currentSession.id
      });

      return this.currentSession;

    } catch (error) {
      logger.error('[MaternalChatAgent] Erro ao iniciar sessao', error);

      // Criar sessao minima para nao bloquear o usuario
      this.currentSession = {
        id: `fallback-${Date.now()}`,
        userId,
        startedAt: Date.now(),
        messages: [],
        context: userContext,
      };

      return this.currentSession;
    }
  }

  async process(input: ChatInput): Promise<ChatOutput> {
    const { message, userId, context } = input;
    const startTime = Date.now();

    try {
      if (!this.currentSession) {
        await this.startSession(userId, context);
      }

      // 1. Verificar se e situacao de crise
      const crisisCheck = await this.detectCrisis(message);
      if (crisisCheck.isCrisis) {
        logger.warn('[MaternalChatAgent] Crise detectada', {
          type: crisisCheck.type,
          userId
        });
        return this.handleCrisisResponse(crisisCheck);
      }

      // 2. Moderar conteudo
      const moderation = await this.moderateContent(message);
      if (!moderation.isAppropriate) {
        return this.handleModerationResponse(moderation);
      }

      // 3. Preparar historico para contexto
      const history = this.prepareHistory();

      // 4. Obter resposta da IA
      const systemPrompt = this.buildSystemPrompt(context);
      const response = await sendMessageToGemini(
        [...history, { role: 'user', content: message }],
        systemPrompt,
        context
      );

      if (response.error) {
        throw new Error(response.error);
      }

      // 5. Adicionar ao historico
      await this.addToHistory(message, response.text);

      // 6. Analytics (nao bloqueia resposta)
      const latency = Date.now() - startTime;
      this.trackEventSafely('chat_message_exchanged', {
        sessionId: this.currentSession?.id,
        userId,
        latencyMs: latency,
        messageLength: message.length,
        responseLength: response.text.length,
      });

      logger.debug('[MaternalChatAgent] Mensagem processada', { latency });

      return {
        text: response.text,
        sessionId: this.currentSession?.id,
        timestamp: Date.now(),
      };

    } catch (error) {
      logger.error('[MaternalChatAgent] Erro ao processar mensagem', error);

      // Resposta amigavel em vez de erro tecnico
      return {
        text: 'Desculpe, estou tendo dificuldades tecnicas no momento. Pode repetir sua mensagem?',
        sessionId: this.currentSession?.id,
        timestamp: Date.now(),
        error: true,
      };
    }
  }

  /**
   * Tracking seguro - NUNCA bloqueia o fluxo principal
   */
  private trackEventSafely(name: string, properties: Record<string, unknown>): void {
    try {
      this.callMCP('analytics', 'event.track', { name, properties })
        .catch((error) => {
          logger.warn(`[MaternalChatAgent] Analytics falhou para ${name}`, { error });
        });
    } catch (error) {
      logger.warn(`[MaternalChatAgent] Erro ao preparar analytics`, { error });
    }
  }

  private async getOrCreateSession(userId: string, context?: UserContext): Promise<ChatSession> {
    const existingSession = await this.loadTodaySession(userId);

    if (existingSession) {
      existingSession.context = { ...existingSession.context, ...context };
      return existingSession;
    }

    return {
      id: `session-${userId}-${Date.now()}`,
      userId,
      startedAt: Date.now(),
      messages: [],
      context,
    };
  }

  private async loadTodaySession(userId: string): Promise<ChatSession | null> {
    try {
      return null;
    } catch (error) {
      logger.warn('[MaternalChatAgent] Erro ao carregar sessao existente', error);
      return null;
    }
  }

  private prepareHistory(): Array<{ role: string; content: string }> {
    if (!this.currentSession) return [];

    return this.currentSession.messages
      .slice(-this.MAX_HISTORY)
      .map(msg => ({
        role: msg.role,
        content: msg.content,
      }));
  }

  private buildSystemPrompt(context?: UserContext): string {
    const basePrompt = `
Voce e a MaesValente, a assistente virtual de IA do app "Nossa Maternidade".

Seu tom de voz e:
- Acolhedor, calmo, direto, sem infantilizar
- Voce usa a 2a pessoa ("voce")
- Voce fala portugues do Brasil
- Voce e proxima, carinhosa, vulneravel, mas firme
- Voce NAO e uma guru perfeita; voce entende que a maternidade e dificil

Regras OBRIGATORIAS:
1. Sempre comece acolhendo a emocao da usuaria
2. Faca perguntas abertas para entender melhor
3. NUNCA de diagnosticos medicos
4. Mantenha as respostas concisas (maximo 3 paragrafos curtos)
5. Se detectar sinais de crise, oriente a buscar ajuda profissional
`;

    if (context?.phase) {
      return `${basePrompt}\n\nContexto: A mae esta na fase "${context.phase}".`;
    }

    return basePrompt;
  }

  private async addToHistory(userMessage: string, assistantResponse: string): Promise<void> {
    if (!this.currentSession) return;

    this.currentSession.messages.push(
      { role: 'user', content: userMessage, timestamp: Date.now() },
      { role: 'assistant', content: assistantResponse, timestamp: Date.now() }
    );

    if (this.currentSession.messages.length > this.MAX_HISTORY * 2) {
      this.currentSession.messages = this.currentSession.messages.slice(-this.MAX_HISTORY * 2);
    }

    await this.persistSession();
  }

  private async persistSession(): Promise<void> {
    // Implementar persistencia
  }

  private async detectCrisis(message: string): Promise<{ isCrisis: boolean; type?: string }> {
    const crisisKeywords = [
      'nao aguento mais',
      'quero morrer',
      'me machucar',
      'suicidio',
      'desistir de tudo',
    ];

    const lowerMessage = message.toLowerCase();
    const foundKeyword = crisisKeywords.find(kw => lowerMessage.includes(kw));

    return {
      isCrisis: !!foundKeyword,
      type: foundKeyword ? 'mental_health' : undefined,
    };
  }

  private handleCrisisResponse(crisis: { isCrisis: boolean; type?: string }): ChatOutput {
    return {
      text: `Percebo que voce esta passando por um momento muito dificil.

Quero que voce saiba que nao esta sozinha. Se estiver pensando em se machucar, por favor ligue agora para o CVV (Centro de Valorizacao da Vida): 188.

O atendimento e 24 horas, gratuito e sigiloso. Eles podem te ajudar.

Voce e importante e merece apoio profissional neste momento.`,
      sessionId: this.currentSession?.id,
      timestamp: Date.now(),
    };
  }

  private async moderateContent(message: string): Promise<{ isAppropriate: boolean; reason?: string }> {
    return { isAppropriate: true };
  }

  private handleModerationResponse(moderation: { isAppropriate: boolean; reason?: string }): ChatOutput {
    return {
      text: 'Desculpe, nao consegui processar essa mensagem. Pode reformular de outra forma?',
      sessionId: this.currentSession?.id,
      timestamp: Date.now(),
    };
  }
}

export const maternalChatAgent = new MaternalChatAgent();
```

---

## 8.2 ContentRecommendationAgent.ts

```typescript
// src/agents/content/ContentRecommendationAgent.ts
// VERSAO CORRIGIDA - Filtro de tags vazio nao elimina tudo

import { BaseAgent } from '../base/BaseAgent';
import { logger } from '@/utils/logger';

interface ContentItem {
  id: string;
  title: string;
  description: string;
  type: 'article' | 'video' | 'tip' | 'story';
  category: string;
  tags: string[];
  score?: number;
}

interface RecommendationFilters {
  types?: string[];
  categories?: string[];
  tags?: string[];
}

interface UserProfile {
  phase?: string;
  interests?: string[];
  babyAge?: number;
}

interface RecommendationRequest {
  userId: string;
  userProfile: UserProfile;
  contentPool: ContentItem[];
  maxResults?: number;
  filters?: RecommendationFilters;
}

interface RecommendationResult {
  recommendations: ContentItem[];
  reasoning: string;
  confidence: number;
  timestamp: number;
}

export class ContentRecommendationAgent extends BaseAgent {

  async process(input: RecommendationRequest): Promise<RecommendationResult> {
    const { userId, userProfile, contentPool, maxResults = 10, filters } = input;
    const startTime = Date.now();

    try {
      this.trackEventSafely('content_recommendation_requested', {
        userId,
        poolSize: contentPool.length,
        hasFilters: !!filters,
        maxResults,
      });

      // 1. Aplicar filtros
      const filteredContent = this.applyFilters(contentPool, filters);

      if (filteredContent.length === 0) {
        logger.info('[ContentRecommendation] Nenhum conteudo apos filtros', {
          originalSize: contentPool.length,
          filters,
        });

        return {
          recommendations: [],
          reasoning: 'Nao encontramos conteudo com os filtros selecionados. Tente remover alguns filtros.',
          confidence: 0,
          timestamp: Date.now(),
        };
      }

      // 2. Pontuar conteudo baseado no perfil
      const scoredContent = await this.scoreContent(filteredContent, userProfile);

      // 3. Otimizar diversidade
      const diversifiedContent = this.optimizeDiversity(scoredContent);

      // 4. Limitar resultados
      const recommendations = diversifiedContent.slice(0, maxResults);

      // 5. Gerar explicacao
      const reasoning = await this.generateReasoning(recommendations, userProfile);

      // 6. Calcular confianca
      const confidence = this.calculateConfidence(recommendations, userProfile);

      const result: RecommendationResult = {
        recommendations,
        reasoning,
        confidence,
        timestamp: Date.now(),
      };

      const latency = Date.now() - startTime;
      this.trackEventSafely('content_recommendations_delivered', {
        userId,
        count: recommendations.length,
        confidence,
        latencyMs: latency,
      });

      return result;

    } catch (error) {
      logger.error('[ContentRecommendation] Erro ao gerar recomendacoes', error);

      // Retornar resultado padrao em vez de throw!
      return {
        recommendations: [],
        reasoning: 'Nao foi possivel carregar recomendacoes no momento. Tente novamente em alguns instantes.',
        confidence: 0,
        timestamp: Date.now(),
      };
    }
  }

  /**
   * Aplica filtros de forma robusta
   * CORRECAO: Arrays vazios nao filtram (deixam passar tudo)
   */
  private applyFilters(content: ContentItem[], filters?: RecommendationFilters): ContentItem[] {
    if (!filters) return content;

    return content.filter(item => {
      // Filtro por tipo - SO aplica se tiver tipos especificados
      if (filters.types && filters.types.length > 0) {
        if (!filters.types.includes(item.type)) {
          return false;
        }
      }

      // Filtro por categoria - SO aplica se tiver categorias especificadas
      if (filters.categories && filters.categories.length > 0) {
        if (!filters.categories.includes(item.category)) {
          return false;
        }
      }

      // Filtro por tags - SO aplica se tiver tags especificadas E nao for vazio
      if (filters.tags && filters.tags.length > 0) {
        const hasMatchingTag = item.tags.some(tag => filters.tags!.includes(tag));
        if (!hasMatchingTag) {
          return false;
        }
      }

      return true;
    });
  }

  private async scoreContent(content: ContentItem[], profile: UserProfile): Promise<ContentItem[]> {
    return content.map(item => {
      let score = 50;

      if (profile.phase && item.tags.includes(profile.phase)) {
        score += 20;
      }

      if (profile.interests) {
        const matchingInterests = item.tags.filter(tag =>
          profile.interests!.includes(tag)
        );
        score += matchingInterests.length * 10;
      }

      if (profile.babyAge !== undefined) {
        score += 5;
      }

      return { ...item, score };
    }).sort((a, b) => (b.score || 0) - (a.score || 0));
  }

  private optimizeDiversity(content: ContentItem[]): ContentItem[] {
    const result: ContentItem[] = [];
    const typeCount: Record<string, number> = {};
    const maxPerType = 3;

    for (const item of content) {
      const currentCount = typeCount[item.type] || 0;
      if (currentCount < maxPerType) {
        result.push(item);
        typeCount[item.type] = currentCount + 1;
      }
    }

    return result;
  }

  private async generateReasoning(recommendations: ContentItem[], profile: UserProfile): Promise<string> {
    if (recommendations.length === 0) {
      return 'Nao encontramos conteudo relevante para seu perfil no momento.';
    }

    const types = [...new Set(recommendations.map(r => r.type))];
    const typeNames: Record<string, string> = {
      article: 'artigos',
      video: 'videos',
      tip: 'dicas',
      story: 'historias',
    };

    const typeList = types.map(t => typeNames[t] || t).join(', ');

    return `Selecionamos ${recommendations.length} conteudos para voce: ${typeList}. ` +
           `Baseado no seu momento${profile.phase ? ` (${profile.phase})` : ''} e interesses.`;
  }

  private calculateConfidence(recommendations: ContentItem[], profile: UserProfile): number {
    if (recommendations.length === 0) return 0;

    const avgScore = recommendations.reduce((sum, r) => sum + (r.score || 50), 0) / recommendations.length;
    return Math.min(100, Math.round(avgScore));
  }

  private trackEventSafely(name: string, properties: Record<string, unknown>): void {
    try {
      this.callMCP('analytics', 'event.track', { name, properties })
        .catch((error) => {
          logger.warn(`[ContentRecommendation] Analytics falhou para ${name}`, { error });
        });
    } catch (error) {
      logger.warn(`[ContentRecommendation] Erro ao preparar analytics`, { error });
    }
  }
}

export const contentRecommendationAgent = new ContentRecommendationAgent();
```

---

## 8.3 HabitsAnalysisAgent.ts

```typescript
// src/agents/habits/HabitsAnalysisAgent.ts
// VERSAO CORRIGIDA - Ordenacao por data ANTES de qualquer calculo

import { BaseAgent } from '../base/BaseAgent';
import { logger } from '@/utils/logger';

interface HabitEntry {
  id: string;
  habitId: string;
  habitName: string;
  date: string;
  completed: boolean;
  notes?: string;
}

interface HabitPattern {
  habitId: string;
  habitName: string;
  completionRate: number;
  currentStreak: number;
  bestStreak: number;
  trend: 'improving' | 'stable' | 'declining';
  insights: string[];
}

interface WellbeingAnalysis {
  patterns: HabitPattern[];
  overallScore: number;
  recommendations: string[];
  timestamp: number;
}

interface AnalysisInput {
  userId: string;
  entries: HabitEntry[];
  timeRange?: { start: string; end: string };
}

export class HabitsAnalysisAgent extends BaseAgent {

  async process(input: AnalysisInput): Promise<WellbeingAnalysis> {
    const { userId, entries, timeRange } = input;

    try {
      this.trackEventSafely('habits_analysis_requested', {
        userId,
        entriesCount: entries.length,
        hasTimeRange: !!timeRange,
      });

      // 1. Filtrar por periodo se especificado
      let filteredEntries = entries;
      if (timeRange) {
        filteredEntries = this.filterByTimeRange(entries, timeRange);
      }

      // 2. ORDENAR POR DATA ANTES DE QUALQUER ANALISE
      const sortedEntries = this.sortByDate(filteredEntries);

      // 3. Analisar padroes (com dados ordenados!)
      const patterns = await this.analyzeHabitPatterns(sortedEntries);

      // 4. Calcular score geral
      const overallScore = this.calculateOverallScore(patterns);

      // 5. Gerar recomendacoes
      const recommendations = await this.generateRecommendations(patterns, overallScore);

      const result: WellbeingAnalysis = {
        patterns,
        overallScore,
        recommendations,
        timestamp: Date.now(),
      };

      this.trackEventSafely('habits_analysis_completed', {
        userId,
        patternsCount: patterns.length,
        overallScore,
      });

      return result;

    } catch (error) {
      logger.error('[HabitsAnalysis] Erro na analise', error);

      return {
        patterns: [],
        overallScore: 0,
        recommendations: ['Nao foi possivel analisar seus habitos no momento. Tente novamente.'],
        timestamp: Date.now(),
      };
    }
  }

  /**
   * CORRECAO: Ordenar entradas por data CRESCENTE
   */
  private sortByDate(entries: HabitEntry[]): HabitEntry[] {
    return [...entries].sort((a, b) => {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });
  }

  private filterByTimeRange(
    entries: HabitEntry[],
    range: { start: string; end: string }
  ): HabitEntry[] {
    const startDate = new Date(range.start).getTime();
    const endDate = new Date(range.end).getTime();

    return entries.filter(entry => {
      const entryDate = new Date(entry.date).getTime();
      return entryDate >= startDate && entryDate <= endDate;
    });
  }

  private async analyzeHabitPatterns(entries: HabitEntry[]): Promise<HabitPattern[]> {
    const habitGroups = this.groupByHabit(entries);
    const patterns: HabitPattern[] = [];

    for (const [habitId, habitEntries] of Object.entries(habitGroups)) {
      const habitName = habitEntries[0]?.habitName || habitId;

      const completedCount = habitEntries.filter(e => e.completed).length;
      const completionRate = habitEntries.length > 0
        ? (completedCount / habitEntries.length) * 100
        : 0;

      const { currentStreak, bestStreak } = this.calculateStreaks(habitEntries);
      const trend = this.detectTrend(habitEntries);
      const insights = this.generateInsights({
        completionRate,
        currentStreak,
        bestStreak,
        trend,
      });

      patterns.push({
        habitId,
        habitName,
        completionRate: Math.round(completionRate),
        currentStreak,
        bestStreak,
        trend,
        insights,
      });
    }

    return patterns.sort((a, b) => b.completionRate - a.completionRate);
  }

  private groupByHabit(entries: HabitEntry[]): Record<string, HabitEntry[]> {
    const groups: Record<string, HabitEntry[]> = {};

    for (const entry of entries) {
      if (!groups[entry.habitId]) {
        groups[entry.habitId] = [];
      }
      groups[entry.habitId].push(entry);
    }

    return groups;
  }

  /**
   * CORRECAO: Calcula streaks com dados ordenados por data
   */
  private calculateStreaks(entries: HabitEntry[]): { currentStreak: number; bestStreak: number } {
    if (entries.length === 0) {
      return { currentStreak: 0, bestStreak: 0 };
    }

    let currentStreak = 0;
    let bestStreak = 0;
    let tempStreak = 0;
    let lastDate: Date | null = null;

    for (const entry of entries) {
      if (!entry.completed) {
        if (tempStreak > bestStreak) {
          bestStreak = tempStreak;
        }
        tempStreak = 0;
        lastDate = null;
        continue;
      }

      const entryDate = new Date(entry.date);
      entryDate.setHours(0, 0, 0, 0);

      if (lastDate) {
        const diffDays = Math.floor(
          (entryDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (diffDays === 1) {
          tempStreak++;
        } else if (diffDays > 1) {
          if (tempStreak > bestStreak) {
            bestStreak = tempStreak;
          }
          tempStreak = 1;
        }
      } else {
        tempStreak = 1;
      }

      lastDate = entryDate;
    }

    if (tempStreak > bestStreak) {
      bestStreak = tempStreak;
    }

    // Verificar se o streak ainda esta ativo (ultimo dia e hoje ou ontem)
    if (lastDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const diffFromToday = Math.floor(
        (today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (diffFromToday <= 1) {
        currentStreak = tempStreak;
      } else {
        currentStreak = 0;
      }
    }

    return { currentStreak, bestStreak };
  }

  private detectTrend(entries: HabitEntry[]): 'improving' | 'stable' | 'declining' {
    if (entries.length < 7) return 'stable';

    const recentEntries = entries.slice(-7);
    const olderEntries = entries.slice(-14, -7);

    if (olderEntries.length === 0) return 'stable';

    const recentRate = recentEntries.filter(e => e.completed).length / recentEntries.length;
    const olderRate = olderEntries.filter(e => e.completed).length / olderEntries.length;

    const diff = recentRate - olderRate;

    if (diff > 0.15) return 'improving';
    if (diff < -0.15) return 'declining';
    return 'stable';
  }

  private generateInsights(data: {
    completionRate: number;
    currentStreak: number;
    bestStreak: number;
    trend: string;
  }): string[] {
    const insights: string[] = [];

    if (data.completionRate >= 80) {
      insights.push('Excelente consistencia! Continue assim.');
    } else if (data.completionRate >= 50) {
      insights.push('Bom progresso! Ha espaco para melhorar.');
    } else {
      insights.push('Considere comecar com metas menores.');
    }

    if (data.currentStreak >= 7) {
      insights.push(`Incrivel! ${data.currentStreak} dias consecutivos!`);
    }

    if (data.trend === 'improving') {
      insights.push('Tendencia positiva! Voce esta melhorando.');
    } else if (data.trend === 'declining') {
      insights.push('Que tal retomar o ritmo esta semana?');
    }

    return insights;
  }

  private calculateOverallScore(patterns: HabitPattern[]): number {
    if (patterns.length === 0) return 0;

    const avgCompletionRate = patterns.reduce((sum, p) => sum + p.completionRate, 0) / patterns.length;
    return Math.round(avgCompletionRate);
  }

  private async generateRecommendations(patterns: HabitPattern[], overallScore: number): Promise<string[]> {
    const recommendations: string[] = [];

    if (overallScore < 50) {
      recommendations.push('Comece com apenas 1-2 habitos para criar consistencia.');
    }

    const decliningPatterns = patterns.filter(p => p.trend === 'declining');
    if (decliningPatterns.length > 0) {
      recommendations.push(`Foque em retomar: ${decliningPatterns.map(p => p.habitName).join(', ')}`);
    }

    if (overallScore >= 70) {
      recommendations.push('Otimo trabalho! Considere adicionar um novo habito.');
    }

    return recommendations;
  }

  private trackEventSafely(name: string, properties: Record<string, unknown>): void {
    try {
      this.callMCP('analytics', 'event.track', { name, properties })
        .catch((error) => {
          logger.warn(`[HabitsAnalysis] Analytics falhou para ${name}`, { error });
        });
    } catch (error) {
      logger.warn(`[HabitsAnalysis] Erro ao preparar analytics`, { error });
    }
  }
}

export const habitsAnalysisAgent = new HabitsAnalysisAgent();
```

---

## 8.4 AgentsContext.tsx

```typescript
// src/contexts/AgentsContext.tsx
// VERSAO CORRIGIDA - useCallback e memoizacao adequada

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react';
import { maternalChatAgent, type ChatMessage, type ChatContext } from '../agents/MaternalChatAgent';
import { contentRecommendationAgent } from '../agents/ContentRecommendationAgent';
import { habitsAnalysisAgent } from '../agents/HabitsAnalysisAgent';

interface AgentsContextType {
  chatMessages: ChatMessage[];
  isChatLoading: boolean;
  chatError: string | null;

  sendChatMessage: (message: string) => Promise<void>;
  setChatContext: (context: ChatContext) => void;
  clearChat: () => void;

  getRecommendations: (tags: string[]) => Promise<ContentRecommendation[]>;
  analyzeHabits: () => Promise<HabitsAnalysis>;
}

const AgentsContext = createContext<AgentsContextType | undefined>(undefined);

interface AgentsProviderProps {
  children: ReactNode;
}

export function AgentsProvider({ children }: AgentsProviderProps) {
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);

  // CORRECAO: Wrap em useCallback para prevenir re-renders desnecessarios
  const sendChatMessage = useCallback(async (message: string) => {
    if (!message.trim()) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: message,
      timestamp: new Date(),
    };

    setChatMessages((prev) => [...prev, userMessage]);
    setIsChatLoading(true);
    setChatError(null);

    try {
      const response = await maternalChatAgent.sendMessage(message);

      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: response.response,
        timestamp: new Date(),
      };

      setChatMessages((prev) => [...prev, assistantMessage]);

      // Analytics isolado em try/catch - nao quebra o fluxo do chat
      try {
        await trackChatInteraction(userMessage, assistantMessage);
      } catch (analyticsError) {
        console.warn('Analytics tracking failed:', analyticsError);
      }
    } catch (error) {
      const errorMessage = error instanceof Error
        ? error.message
        : 'Erro ao enviar mensagem. Tente novamente.';
      setChatError(errorMessage);
    } finally {
      setIsChatLoading(false);
    }
  }, []);

  // CORRECAO: Wrap em useCallback
  const setChatContext = useCallback((context: ChatContext) => {
    maternalChatAgent.setContext(context);
  }, []);

  // CORRECAO: Wrap em useCallback
  const clearChat = useCallback(() => {
    setChatMessages([]);
    setChatError(null);
    maternalChatAgent.clearHistory();
  }, []);

  // CORRECAO: Wrap em useCallback com tratamento de tags vazias
  const getRecommendations = useCallback(async (tags: string[]) => {
    // Retorna todo conteudo se nenhuma tag especificada
    if (!tags || tags.length === 0) {
      return contentRecommendationAgent.getAllRecommendations();
    }
    return contentRecommendationAgent.getRecommendationsByTags(tags);
  }, []);

  // CORRECAO: Wrap em useCallback
  const analyzeHabits = useCallback(async () => {
    return habitsAnalysisAgent.analyze();
  }, []);

  // Memoizar valor do contexto para prevenir re-renders desnecessarios
  const contextValue = useMemo<AgentsContextType>(
    () => ({
      chatMessages,
      isChatLoading,
      chatError,
      sendChatMessage,
      setChatContext,
      clearChat,
      getRecommendations,
      analyzeHabits,
    }),
    [
      chatMessages,
      isChatLoading,
      chatError,
      sendChatMessage,
      setChatContext,
      clearChat,
      getRecommendations,
      analyzeHabits,
    ]
  );

  return (
    <AgentsContext.Provider value={contextValue}>
      {children}
    </AgentsContext.Provider>
  );
}

export function useAgents(): AgentsContextType {
  const context = useContext(AgentsContext);
  if (context === undefined) {
    throw new Error('useAgents must be used within an AgentsProvider');
  }
  return context;
}

async function trackChatInteraction(
  userMessage: ChatMessage,
  assistantMessage: ChatMessage
): Promise<void> {
  // Implementacao depende do provider de analytics
}
```

---

## 8.5 WellnessContext.tsx

```typescript
// src/contexts/WellnessContext.tsx
// VERSAO CORRIGIDA - JSON parse seguro e streaks ordenados

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';

const WELLNESS_STORAGE_KEY = 'wellness_data';
const HABITS_STORAGE_KEY = 'habits_data';

interface WellnessEntry {
  id: string;
  date: string;
  mood: number;
  energy: number;
  symptoms: string[];
  notes?: string;
}

interface HabitEntry {
  id: string;
  habitId: string;
  completedAt: string;
}

interface WellnessContextType {
  entries: WellnessEntry[];
  habits: HabitEntry[];
  isLoading: boolean;
  error: string | null;

  addEntry: (entry: Omit<WellnessEntry, 'id'>) => Promise<void>;
  getStreak: (habitId: string) => number;
  syncWithServer: () => Promise<void>;
}

const WellnessContext = createContext<WellnessContextType | undefined>(undefined);

// CORRECAO: Safe JSON parse helper com validacao de tipo
function safeJsonParse<T>(json: string | null, defaultValue: T): T {
  if (!json) return defaultValue;

  try {
    const parsed = JSON.parse(json);
    if (Array.isArray(defaultValue) && !Array.isArray(parsed)) {
      console.warn('Expected array from storage, got:', typeof parsed);
      return defaultValue;
    }
    return parsed as T;
  } catch (error) {
    console.error('JSON parse error:', error);
    return defaultValue;
  }
}

export function WellnessProvider({ children }: { children: ReactNode }) {
  const [entries, setEntries] = useState<WellnessEntry[]>([]);
  const [habits, setHabits] = useState<HabitEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);

        const [wellnessJson, habitsJson] = await Promise.all([
          AsyncStorage.getItem(WELLNESS_STORAGE_KEY),
          AsyncStorage.getItem(HABITS_STORAGE_KEY),
        ]);

        // CORRECAO: Usar safe JSON parsing
        setEntries(safeJsonParse<WellnessEntry[]>(wellnessJson, []));
        setHabits(safeJsonParse<HabitEntry[]>(habitsJson, []));
      } catch (err) {
        console.error('Failed to load wellness data:', err);
        setError('Nao foi possivel carregar seus dados de bem-estar');
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  const addEntry = useCallback(async (entry: Omit<WellnessEntry, 'id'>) => {
    const newEntry: WellnessEntry = {
      ...entry,
      id: `entry-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };

    try {
      const updatedEntries = [...entries, newEntry];
      setEntries(updatedEntries);

      await AsyncStorage.setItem(
        WELLNESS_STORAGE_KEY,
        JSON.stringify(updatedEntries)
      );

      syncEntryToServer(newEntry).catch(console.error);
    } catch (err) {
      console.error('Failed to save entry:', err);
      setError('Nao foi possivel salvar a entrada');
      throw err;
    }
  }, [entries]);

  // CORRECAO: Calculo de streak com dados ordenados
  const getStreak = useCallback((habitId: string): number => {
    const habitEntries = habits.filter((h) => h.habitId === habitId);

    if (habitEntries.length === 0) return 0;

    // CORRECAO: Ordenar entradas por data (mais recente primeiro) antes de calcular streak
    const sortedEntries = [...habitEntries].sort((a, b) =>
      new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
    );

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Verificar cada dia indo para tras
    for (let i = 0; i < sortedEntries.length; i++) {
      const entryDate = new Date(sortedEntries[i].completedAt);
      entryDate.setHours(0, 0, 0, 0);

      const expectedDate = new Date(today);
      expectedDate.setDate(today.getDate() - streak);

      if (entryDate.getTime() === expectedDate.getTime()) {
        streak++;
      } else if (entryDate.getTime() < expectedDate.getTime()) {
        // Gap nos dias - streak quebrado
        break;
      }
    }

    return streak;
  }, [habits]);

  const syncWithServer = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: serverEntries, error: fetchError } = await supabase
        .from('wellness_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (fetchError) throw fetchError;

      if (serverEntries) {
        setEntries(serverEntries);
        await AsyncStorage.setItem(
          WELLNESS_STORAGE_KEY,
          JSON.stringify(serverEntries)
        );
      }
    } catch (err) {
      console.error('Sync failed:', err);
    }
  }, []);

  const contextValue = useMemo<WellnessContextType>(
    () => ({
      entries,
      habits,
      isLoading,
      error,
      addEntry,
      getStreak,
      syncWithServer,
    }),
    [entries, habits, isLoading, error, addEntry, getStreak, syncWithServer]
  );

  return (
    <WellnessContext.Provider value={contextValue}>
      {children}
    </WellnessContext.Provider>
  );
}

export function useWellness(): WellnessContextType {
  const context = useContext(WellnessContext);
  if (context === undefined) {
    throw new Error('useWellness must be used within a WellnessProvider');
  }
  return context;
}

async function syncEntryToServer(entry: WellnessEntry): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from('wellness_entries').upsert({
    ...entry,
    user_id: user.id,
  });
}
```

---

# PARTE 9: COMPLIANCE E LEGAL

## 9.1 LGPD Compliance

### Direitos do Usuario

- **Acesso:** Exportar todos os dados
- **Correcao:** Editar perfil e preferencias
- **Exclusao:** Deletar conta completamente
- **Portabilidade:** Exportar em formato JSON

### Implementacao

- **Export Data:** `src/services/userDataService.ts`
- **Delete Account:** Edge Function `delete-account`
- **Privacy Policy:** Link funcional no app

---

## 9.2 Privacy Policy

```typescript
// src/features/legal/PrivacyPolicyScreen.tsx
import React from 'react';
import { ScrollView, View, Text, Linking, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PrivacyPolicyScreen() {
  const contactEmail = 'privacidade@nossamaternidade.com.br';
  const lastUpdated = '4 de dezembro de 2025';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <ScrollView style={{ flex: 1, padding: 24 }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 8 }}>
          Politica de Privacidade
        </Text>
        <Text style={{ color: '#6B7280', marginBottom: 24 }}>
          Ultima atualizacao: {lastUpdated}
        </Text>

        <Section title="1. Introducao">
          <Text style={{ color: '#374151', lineHeight: 24 }}>
            A NossaMaternidade esta comprometida com a protecao da sua privacidade.
            Esta politica descreve como coletamos, usamos e protegemos seus dados
            pessoais de acordo com a Lei Geral de Protecao de Dados (LGPD).
          </Text>
        </Section>

        <Section title="2. Dados que Coletamos">
          <Text style={{ color: '#374151', lineHeight: 24 }}>
            2.1 Dados de Cadastro: nome, e-mail, data prevista do parto.{'\n\n'}
            2.2 Dados de Saude e Bem-estar: registros de humor, energia, sintomas
            gestacionais. Estes sao considerados dados sensiveis pela LGPD.{'\n\n'}
            2.3 Dados de Uso: interacoes com o aplicativo, conversas com a assistente de IA.
          </Text>
        </Section>

        <Section title="3. Finalidade do Tratamento">
          <Text style={{ color: '#374151', lineHeight: 24 }}>
            Seus dados sao usados exclusivamente para:{'\n'}
            - Fornecer recomendacoes personalizadas de bem-estar{'\n'}
            - Registrar seu progresso gestacional{'\n'}
            - Operar a assistente de IA maternal{'\n'}
            - Melhorar a experiencia do aplicativo
          </Text>
        </Section>

        <Section title="4. Base Legal">
          <Text style={{ color: '#374151', lineHeight: 24 }}>
            O tratamento de seus dados pessoais e baseado no seu consentimento
            explicito (Art. 7, I e Art. 11, I da LGPD).
          </Text>
        </Section>

        <Section title="5. Compartilhamento de Dados">
          <Text style={{ color: '#374151', lineHeight: 24 }}>
            5.1 Google Gemini AI: mensagens enviadas a assistente de IA sao
            processadas pelo Google Gemini.{'\n\n'}
            5.2 Supabase: seus dados sao armazenados de forma segura nos
            servidores da Supabase.{'\n\n'}
            Nao vendemos ou compartilhamos seus dados para marketing.
          </Text>
        </Section>

        <Section title="6. Seus Direitos (LGPD Art. 18)">
          <Text style={{ color: '#374151', lineHeight: 24 }}>
            Voce tem direito a:{'\n'}
            - Confirmar a existencia de tratamento{'\n'}
            - Acessar seus dados{'\n'}
            - Corrigir dados incompletos{'\n'}
            - Solicitar anonimizacao ou eliminacao{'\n'}
            - Revogar consentimento{'\n'}
            - Portabilidade dos dados{'\n'}
            - Excluir sua conta completamente
          </Text>
        </Section>

        <Section title="7. Contato do Encarregado (DPO)">
          <Pressable onPress={() => Linking.openURL(`mailto:${contactEmail}`)}>
            <Text style={{ color: '#EC4899', fontWeight: '600' }}>
              {contactEmail}
            </Text>
          </Pressable>
        </Section>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={{ marginBottom: 24 }}>
      <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 8 }}>{title}</Text>
      {children}
    </View>
  );
}
```

---

## 9.3 Data Safety Google Play

Informacoes necessarias para o formulario:

| Dado | Coletado | Compartilhado | Finalidade |
|------|----------|---------------|------------|
| E-mail | Sim | Nao | Autenticacao |
| Dados de saude | Sim | Sim (Google AI) | Funcionalidade |
| Mensagens | Sim | Sim (Google AI) | Funcionalidade |

---

## 9.4 App Store Privacy Details

| Categoria | Dados |
|-----------|-------|
| Contact Info | Email address |
| Health & Fitness | Health data |
| Identifiers | User ID |
| Usage Data | Product interaction |

---

# PARTE 10: DEPLOY E STORES

## 10.1 Configuracao EAS

**eas.json:**
```json
{
  "cli": {
    "version": ">= 14.0.0",
    "requireCommit": true
  },
  "build": {
    "base": {
      "node": "20.19.4",
      "env": {
        "APP_ENV": "production"
      }
    },
    "development": {
      "extends": "base",
      "developmentClient": true,
      "distribution": "internal",
      "env": {
        "APP_ENV": "development"
      },
      "android": {
        "buildType": "apk"
      },
      "ios": {
        "simulator": true
      }
    },
    "preview": {
      "extends": "base",
      "distribution": "internal",
      "channel": "preview",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "extends": "base",
      "channel": "production",
      "autoIncrement": true,
      "android": {
        "buildType": "app-bundle",
        "resourceClass": "medium"
      },
      "ios": {
        "resourceClass": "large"
      }
    }
  },
  "submit": {
    "production": {
      "android": {
        "track": "internal",
        "serviceAccountKeyPath": "./google-service-account.json"
      },
      "ios": {
        "ascAppId": "YOUR_APP_STORE_CONNECT_APP_ID"
      }
    }
  }
}
```

---

## 10.2 Checklist iOS App Store

- [ ] Privacy Manifest configurado em app.json
- [ ] Account deletion implementado e acessivel
- [ ] AI consent disclosure antes do uso do chat
- [ ] Privacy Policy em portugues acessivel no app
- [ ] App Privacy details preenchido no App Store Connect
- [ ] Health data disclosures corretos
- [ ] Icone 1024x1024 (sem transparencia, sem cantos arredondados)
- [ ] Submeter ate 15 de dezembro para aprovacao pre-feriado

---

## 10.3 Checklist Google Play

- [ ] targetSdkVersion = 35
- [ ] compileSdkVersion = 35
- [ ] Edge-to-edge display usando react-native-safe-area-context
- [ ] Data Safety section completa (health data, AI data)
- [ ] LGPD compliance documentado
- [ ] Adaptive icon configurado (foreground + monochrome)
- [ ] Formato AAB para builds de producao

---

## 10.4 Timeline de Submissao

| Data | Acao |
|------|------|
| Ate 10/12 | Corrigir todos os bugs criticos |
| Ate 12/12 | Implementar todas as features de compliance |
| Ate 15/12 | Submeter para ambas as stores |
| 20-27/12 | Apple review mais lento (feriados) |

---

# APENDICE: RESUMO DE BUGS

| Bug | Localizacao | Problema | Correcao Aplicada |
|-----|-------------|----------|-------------------|
| Analytics quebrando chat | AgentsContext.tsx | Falha de analytics interrompia chat | Isolado em try/catch |
| Filtro de tags vazio | AgentsContext.tsx | `getRecommendations([])` retornava nada | Retorna todo conteudo quando vazio |
| Dados de streak nao ordenados | WellnessContext.tsx | Calculo de streak errado | Adicionado sort antes do calculo |
| JSON.parse crash | WellnessContext.tsx | Sem try/catch no JSON.parse | Criado `safeJsonParse` helper |
| Privacy Policy TODO | Settings | Nao implementado | Tela LGPD-compliant adicionada |
| useCallback faltando | AgentsContext.tsx | Funcoes recriadas a cada render | Todos handlers em useCallback |
| API key exposta | Environment | Gemini key em EXPO_PUBLIC_ | Movido para Edge Function |
| Sem account deletion | Settings | Requisito App Store faltando | Fluxo completo de delecao |
| SafeAreaView legado | Multiplos arquivos | Deprecated no RN 0.81 | Migrado para react-native-safe-area-context |

---

**Ultima atualizacao:** 4 de dezembro de 2025
**Versao do documento:** 3.0.0 (Unificado)
**Mantido por:** Equipe Nossa Maternidade + Claude Code
