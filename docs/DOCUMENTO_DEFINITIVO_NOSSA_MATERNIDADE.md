# 📚 DOCUMENTO DEFINITIVO CONSOLIDADO - Nossa Maternidade
## Guia Completo e Único de Referência do Projeto
### Versão 2.1.0 - 4 de Dezembro 2025

---

> **🎯 Propósito:** Este é o documento único e consolidado que reúne TODA a documentação do projeto Nossa Maternidade em um só lugar. Elimina duplicações, organiza informações de forma lógica e serve como referência definitiva para desenvolvimento, deploy e manutenção.

> **📖 Como Usar:** Use o índice abaixo para navegar diretamente para a seção desejada. Este documento substitui a necessidade de consultar múltiplos arquivos.

> **🔄 Atualização:** Este documento será atualizado periodicamente. Consulte a seção "Changelog" no final para ver o histórico de mudanças.

---

## 📑 ÍNDICE RÁPIDO

1. [PARTE 1: INTRODUÇÃO E VISÃO GERAL](#parte-1-introdução-e-visão-geral)
   - [1.1 Resumo Executivo](#11-resumo-executivo)
   - [1.2 Visão, Missão e Público-Alvo](#12-visão-missão-e-público-alvo)
   - [1.3 Status Atual do Projeto](#13-status-atual-do-projeto)
   - [1.4 Roadmap e Próximos Passos](#14-roadmap-e-próximos-passos)

2. [PARTE 2: QUICK START](#parte-2-quick-start)
   - [2.1 Setup Inicial (5 minutos)](#21-setup-inicial-5-minutos)
   - [2.2 Primeiros Passos para Desenvolvimento](#22-primeiros-passos-para-desenvolvimento)
   - [2.3 Comandos Essenciais](#23-comandos-essenciais)
   - [2.4 Troubleshooting Comum](#24-troubleshooting-comum)

3. [PARTE 3: ARQUITETURA E TECNOLOGIA](#parte-3-arquitetura-e-tecnologia)
   - [3.1 Stack Completa](#31-stack-completa)
   - [3.2 Arquitetura de Pastas](#32-arquitetura-de-pastas)
   - [3.3 Padrões de Código Obrigatórios](#33-padrões-de-código-obrigatórios)
   - [3.4 Design System](#34-design-system)

4. [PARTE 4: DESENVOLVIMENTO](#parte-4-desenvolvimento)
   - [4.1 Guias de Setup](#41-guias-de-setup)
   - [4.2 Melhores Práticas](#42-melhores-práticas)
   - [4.3 Code Patterns Críticos](#43-code-patterns-críticos)
   - [4.4 Testing Strategy](#44-testing-strategy)

5. [PARTE 5: FEATURES E FUNCIONALIDADES](#parte-5-features-e-funcionalidades)
   - [5.1 Chat IA (NathIA)](#51-chat-ia-nathia)
   - [5.2 Sistema de Agentes](#52-sistema-de-agentes)
   - [5.3 MCPs (Model Context Protocol)](#53-mcps-model-context-protocol)
   - [5.4 Outras Features Principais](#54-outras-features-principais)

6. [PARTE 6: DEPLOY E LOJAS](#parte-6-deploy-e-lojas)
   - [6.1 Checklist de Deploy Completo](#61-checklist-de-deploy-completo)
   - [6.2 Requisitos das Stores](#62-requisitos-das-stores)
   - [6.3 Configurações Necessárias](#63-configurações-necessárias)
   - [6.4 Guia de Build e Submit](#64-guia-de-build-e-submit)

7. [PARTE 7: LEGAL E COMPLIANCE](#parte-7-legal-e-compliance)
   - [7.1 LGPD Compliance](#71-lgpd-compliance)
   - [7.2 Privacy Policy](#72-privacy-policy)
   - [7.3 Terms of Service](#73-terms-of-service)
   - [7.4 Data Safety (Google Play)](#74-data-safety-google-play)

8. [PARTE 8: MANUTENÇÃO E OPERAÇÃO](#parte-8-manutenção-e-operação)
   - [8.1 Monitoramento](#81-monitoramento)
   - [8.2 Troubleshooting Avançado](#82-troubleshooting-avançado)
   - [8.3 Migrações Pendentes](#83-migrações-pendentes)
   - [8.4 Roadmap Técnico](#84-roadmap-técnico)

---

# PARTE 1: INTRODUÇÃO E VISÃO GERAL

## 1.1 Resumo Executivo

### O Que É Este App?

**Nossa Maternidade** é um aplicativo mobile React Native + Expo para mães brasileiras, focado em:

- 🤖 **Apoio emocional** com IA amigável (NathIA)
- 💬 **Comunidade** de mães (MãesValentes)
- 📚 **Conteúdo personalizado** (MundoNath)
- 📊 **Tracking de hábitos** e bem-estar
- 🎯 **Autocuidado** e desenvolvimento pessoal

### Funcionalidades Principais

| Funcionalidade | Descrição | Status |
|----------------|-----------|--------|
| 🤖 Chat com IA (NathIA) | Assistente empática para mães | ✅ Funcional |
| 📚 Recomendações | Conteúdo personalizado | ✅ Funcional |
| 📊 Análise de Hábitos | Padrões de bem-estar | ⚠️ Bugs identificados |
| 👩‍👩‍👧 Comunidade | Conexão entre mães | ✅ Funcional |
| 📔 Diário | Registro de momentos | ✅ Funcional |
| 🎬 Mundo Nath | Feed de vídeos, áudios, reels | ✅ Funcional |
| 🧘‍♀️ Exercícios de Respiração | Técnicas de calma | ✅ Funcional |
| 🌙 Sleep Tracker | Rastreamento de sono | ✅ Funcional |

### Nota de Qualidade Atual: 8.8/10 → Meta: 9.5+

**Pontos Fortes:**
- ✅ Arquitetura moderna (MCPs + Agentes IA)
- ✅ TypeScript strict mode (0 errors)
- ✅ Design System unificado
- ✅ Código limpo e organizado

**Bloqueadores Identificados:**
- 🟡 23 issues (8 críticos, 10 importantes, 5 melhorias)
- 🟡 Test coverage: 1.4% (meta: 80%)
- 🟡 ESLint warnings: 272 (meta: <50)
- 🟡 Design violations: ~100 (meta: 0)

---

## 1.2 Visão, Missão e Público-Alvo

### Visão

Ser o principal aplicativo de apoio e bem-estar para mães brasileiras, oferecendo um espaço seguro, acolhedor e inteligente para todas as etapas da jornada maternal.

### Missão

Prover apoio emocional, conteúdo personalizado e uma comunidade conectada para empoderar mães em sua jornada, utilizando tecnologia de ponta (IA) de forma ética e responsável.

### Público-Alvo

- **Idade:** 18-45 anos
- **Classe:** C-D (Brasil)
- **Contexto:** LGPD compliance obrigatório
- **Plataformas:** iOS App Store + Google Play Store
- **Perfil:** Mães em gestação, pós-parto ou com filhos pequenos, buscando apoio emocional e informações confiáveis

---

## 1.3 Status Atual do Projeto

### Métricas de Qualidade (Dezembro 2025)

| Métrica | Status | Valor Atual | Meta | Prioridade |
|---------|--------|-------------|------|------------|
| **TypeScript Errors** | ✅ | 0 | 0 | ✅ Mantido |
| **TypeScript Warnings** | 🟡 | ~50-64 | 0 | 🟡 Médio |
| **ESLint Errors** | ✅ | 0 | 0 | ✅ Mantido |
| **ESLint Warnings** | 🟡 | 272 | <50 | 🔴 Alto |
| **Tipos `any`** | ✅ | 0 (services/agents) | <10 | ✅ Mantido |
| **console.log** | ✅ | 0 (legítimos) | 0 | ✅ Mantido |
| **Test Coverage** | 🟡 | 1.4% | 80% | 🔴 Alto |
| **Design Violations** | 🟡 | ~100 | 0 | 🟡 Médio |
| **WCAG AAA** | 🟡 | 75-80% | 100% | 🟡 Médio |
| **Dark Mode** | 🟡 | 75-80% | 100% | 🟡 Médio |

### Conquistas Recentes

- ✅ **TypeScript:** 0 errors (21 → 0)
- ✅ **ESLint:** 0 errors (8 → 0)
- ✅ **Design System:** Unificado (migrado de dual para único)
- ✅ **Arquivos críticos:** 5 componentes migrados para tokens modernos
- ✅ **Documentação:** +1,926 linhas de guias e scripts
- ✅ **Tipos `any`:** 0 em services e agents críticos (~300 → 0)
- ✅ **console.log:** Removidos (exceto legítimos)

### Em Progresso

- 🟡 **ESLint Warnings:** 272 (era 484, meta <50)
- 🟡 **Test Coverage:** 1.4% (meta 80%)
- 🟡 **Design Violations:** ~100 (era 155, meta 0)
- 🟡 **WCAG AAA:** 75-80% (meta 100%)
- 🟡 **Dark Mode:** 75-80% (meta 100%)

### Bloqueadores Críticos

1. **Test Coverage baixo** (1.4% vs 80% meta)
   - **Impacto:** Risco de bugs em produção
   - **Ação:** Expandir testes existentes, adicionar edge cases

2. **ESLint Warnings alto** (272 vs <50 meta)
   - **Impacto:** Code quality afetada
   - **Ação:** Auto-fix quando possível, corrigir warnings críticos

3. **Design Violations** (~100 restantes)
   - **Impacto:** Inconsistências visuais, dark mode quebrado
   - **Ação:** Aplicar auto-fix batch, validar resultado

4. **Backend config** (precisa validação)
   - **Impacto:** Features não funcionam
   - **Ação:** Validar `.env`, testar conexões

---

## 1.4 Roadmap e Próximos Passos

### 🔴 Crítico - Fazer AGORA

1. **Aumentar Test Coverage** (1.4% → 40%+)
   - **Tempo estimado:** 4-6 horas
   - **Nível de energia:** Médio
   - **Ações:**
     - Expandir testes existentes para services críticos
     - Adicionar testes para agents IA
     - Testar componentes principais
     - Adicionar edge cases

2. **Reduzir ESLint Warnings** (272 → <50)
   - **Tempo estimado:** 2-4 horas
   - **Nível de energia:** Baixo
   - **Ações:**
     - Auto-fix quando possível: `npm run lint -- --fix`
     - Corrigir warnings de acessibilidade progressivamente
     - Remover estilos não usados
     - Documentar warnings aceitáveis

3. **Validar Backend Config**
   - **Tempo estimado:** 30 minutos
   - **Nível de energia:** Baixo
   - **Ações:**
     - Validar `.env` com `npm run validate:env`
     - Testar conexões com `npm run test:connection`
     - Corrigir problemas encontrados

### 🟡 Importante - Fazer ESTA SEMANA

4. **Eliminar Design Violations** (~100 → 0)
   - **Tempo estimado:** 1-2 horas
   - **Nível de energia:** Baixo

5. **WCAG AAA 100%**
   - **Tempo estimado:** 3-4 horas
   - **Nível de energia:** Médio

6. **Dark Mode 100%**
   - **Tempo estimado:** 2-3 horas
   - **Nível de energia:** Médio

---

# PARTE 2: QUICK START

## 2.1 Setup Inicial (5 minutos)

### Pré-requisitos

- Node.js 18+ (recomendado: Node 22 LTS)
- npm ou yarn
- Expo CLI (`npm install -g expo-cli`)
- Git

### Instalação Rápida

```bash
# 1. Clone o repositório
git clone https://github.com/LionGab/NossaMaternidade.git
cd NossaMaternidade

# 2. Instale as dependências
npm install

# 3. Configure as variáveis de ambiente
cp .env.example .env
# Edite .env com suas chaves

# 4. Inicie o servidor de desenvolvimento
npm start
```

### Para Expo Go (Recomendado para desenvolvimento)

1. **Instale o Expo Go no seu dispositivo:**
   - [iOS App Store](https://apps.apple.com/app/expo-go/id982107779)
   - [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)

2. **Escaneie o QR Code** que aparece no terminal

---

## 2.2 Primeiros Passos para Desenvolvimento

### Estrutura de Branches

```
main         ← Produção (sempre estável, protegida)
  ↑
  └── dev     ← Integração (trabalho diário)
       ↑
       ├── feature/onboarding-v2
       ├── feature/chat-voz
       └── fix/crash-login
```

### Fluxo Padrão

1. **Criar feature branch:**
```bash
git checkout dev
git pull origin dev
git checkout -b feature/nome-da-funcionalidade
```

2. **Desenvolver e commitar:**
```bash
git add .
git commit -m "feat: adiciona funcionalidade X"
git push -u origin feature/nome-da-funcionalidade
```

3. **Abrir Pull Request:**
   - Base: `dev` (NUNCA `main`)
   - Compare: `feature/nome-da-funcionalidade`

---

## 2.3 Comandos Essenciais

### Desenvolvimento

| Comando | Descrição |
|---------|-----------|
| `npm start` | Inicia servidor Expo |
| `npm run ios` | Executa no iOS Simulator |
| `npm run android` | Executa no Android Emulator |
| `npm run web` | Executa na web (porta 8082) |

### Qualidade de Código

| Comando | Descrição |
|---------|-----------|
| `npm run type-check` | Verifica tipos TypeScript |
| `npm run lint` | Executa ESLint |
| `npm test` | Executa testes |
| `npm run test:coverage` | Cobertura de testes |

### Build e Deploy

| Comando | Descrição |
|---------|-----------|
| `npm run build:ios` | Build produção iOS |
| `npm run build:android` | Build produção Android |
| `npm run build:production` | Build ambas plataformas |
| `npm run submit:ios` | Submit para App Store |
| `npm run submit:android` | Submit para Google Play |

### Validação

| Comando | Descrição |
|---------|-----------|
| `npm run validate` | Valida tudo (TS, design, env) |
| `npm run validate:design` | Valida design tokens |
| `npm run validate:env` | Valida variáveis de ambiente |
| `npm run check-ready` | Checklist pré-deploy |

---

## 2.4 Troubleshooting Comum

### Erro: "API key não configurada"

**Solução:**
1. Verifique se o arquivo `.env` existe na raiz
2. Confirme que a variável `EXPO_PUBLIC_GEMINI_API_KEY` está configurada
3. Reinicie o servidor Expo: `npm start -- --clear`

### Erro: "Cannot find module"

**Solução:**
```bash
# Limpar cache e reinstalar
rm -rf node_modules package-lock.json
npm install
npx expo start -c
```

### Erro: TypeScript errors

**Solução:**
```bash
# Verificar erros
npm run type-check

# Corrigir automaticamente quando possível
npm run lint -- --fix
```

### Erro: Metro bundler não carrega

**Solução:**
```bash
# Limpar cache Metro
npx expo start -c

# Ou reiniciar completamente
killall node
npm start
```

---

# PARTE 3: ARQUITETURA E TECNOLOGIA

## 3.1 Stack Completa

### Frontend

| Tecnologia | Versão | Status |
|------------|--------|--------|
| **Framework** | React Native + Expo SDK 54+ | ✅ |
| **Language** | TypeScript 5.7+ (strict mode) | ✅ |
| **Styling** | NativeWind (Tailwind) | ✅ |
| **Navigation** | React Navigation 7 | ✅ |
| **State** | TanStack Query (React Query) | ✅ |
| **UI** | Componentes customizados (Atomic Design) | ✅ |
| **Theme** | Design Tokens (`src/theme/tokens.ts`) | ✅ |
| **Testing** | Jest + React Native Testing Library | ✅ |

### Backend

| Tecnologia | Função | Status |
|------------|--------|--------|
| **Database** | Supabase (PostgreSQL) + RLS | ✅ |
| **Auth** | Supabase Auth (magic links + social) | ✅ |
| **Storage** | Supabase Storage (avatares, thumbs) | ✅ |
| **Realtime** | Supabase Realtime (comunidade live) | ✅ |
| **Edge Functions** | Supabase Edge Functions (Deno) | ✅ |

### IA Stack (Multi-Provider + Fallback)

| Caso de Uso | Primary | Fallback 1 | Fallback 2 |
|-------------|---------|-----------|-----------|
| Chat NathIA (default) | Gemini 2.5 Flash | GPT-4o | Claude Opus |
| Crise emocional | GPT-4o (safety) | Gemini thinking | Claude Opus |
| Análise profunda | Gemini 2.5 Flash thinking | Claude Opus | — |
| Embeddings | Gemini 1.5 | OpenAI text-embed-3 | — |
| Moderação conteúdo | Claude API | OpenAI Moderation | — |

**Arquitetura IA:**
- `llmRouter.ts`: Roteamento inteligente baseado em contexto
- `MaternalChatAgent` + `ContentRecommendationAgent` + `HabitsAnalysisAgent`
- MCP architecture: SupabaseMCP, GoogleAIMCP, OpenAIMCP, AnthropicMCP
- Prompt registry: `/src/ai/prompts/`
- Fallback automático entre providers

---

## 3.2 Arquitetura de Pastas

```
src/
├── app/                    # App.tsx, navegação root
├── screens/                # HomeScreen, ChatScreen, OnboardingScreen, etc
├── components/
│   ├── primitives/         # Atoms: Box, Text, Button, HapticButton
│   ├── molecules/          # Molecules: Avatar, Badge, EmotionalPrompt
│   ├── organisms/          # Organisms: MaternalCard (6 variants)
│   └── templates/          # Templates: ScreenLayout, SectionLayout
├── services/
│   ├── supabase/           # profileService, chatService, emotionService, etc
│   ├── ai/                 # llmRouter, aiOrchestrator, aiFallback
│   └── geminiService.ts     # Legacy (manter compatível)
├── ai/
│   ├── config/             # llmConfig.ts, llmRouter.ts
│   ├── agents/              # MaternalChatAgent, ContentRecommendationAgent, etc
│   ├── prompts/             # nathia.system.md, crisis.system.md, etc
│   └── moderation/          # MedicalModerationService.ts
├── theme/                   # tokens.ts (DESIGN SYSTEM MODERNO)
├── types/                   # user.ts, ai.ts, content.ts
├── hooks/                   # useAIRouting, useEmotionTracking, useHabits
└── utils/                   # logger.ts, ai.ts, supabase.ts
```

---

## 3.3 Padrões de Código Obrigatórios

### TypeScript

- ✅ `strict: true` sempre
- ✅ Zero `any` (use `unknown` + type guards)
- ❌ Sem `// @ts-ignore` ou `@ts-expect-error`

### Naming

- Services: `*Service.ts` (profileService, chatService)
- Screens: `*Screen.tsx` (HomeScreen, ChatScreen)
- Components: `*Component.tsx` ou `*Organism.tsx` (MaternalCard)
- Hooks: `use*` (useAIRouting, useEmotionTracking)

### Logging

```typescript
import { logger } from '@/utils/logger';

logger.debug('Debug info'); // Dev only
logger.info('User action', { userId });
logger.warn('Problema', error); // + Sentry
logger.error('Falha critica', error); // + Sentry
```

**❌ NUNCA:** `console.log/warn/error`

### Error Handling Pattern

```typescript
// Services SEMPRE retornam { data, error }
const { data, error } = await profileService.getProfile(userId);
if (error) {
  logger.error('Falha ao carregar perfil', error);
  return;
}
// usar data...
```

### Styling

```typescript
import { Tokens } from '@/theme/tokens';
import { useThemeColors } from '@/hooks/useTheme';

// Cores do tema (light/dark aware)
const colors = useThemeColors();
colors.background.canvas;
colors.text.primary;
colors.primary.main;

// Spacing (multiplos de 4)
Tokens.spacing['4']; // 16px

// Typography
Tokens.typography.sizes.md; // 16

// Border radius
Tokens.radius.lg; // 12
```

**❌ NUNCA:** Hardcoded colors (`#FFFFFF`, `rgba(...)`, `'white'`)

---

## 3.4 Design System

### Princípios Fundamentais

1. **Humanizado e Maternal:** Acolhedor, confiável, sereno, empoderador
2. **Acessibilidade como Prioridade:** WCAG AAA (contraste 7:1, touch targets 44pt+)
3. **Simplicidade e Clareza:** Menos é mais, hierarquia clara, consistência

### Paleta de Cores

| Cor | Código | Uso |
|-----|--------|-----|
| Azul iOS System | #007AFF | Ações primárias, links |
| Roxo Espiritual | #A78BFA | Elementos secundários |
| Verde Mint | #236B62 | Sucesso, conclusão |
| Vermelho | #EF4444 | Erros, alertas críticos |

### Tokens do Design System

**Fonte Única da Verdade:** `src/theme/tokens.ts`

```typescript
import { Tokens } from '@/theme/tokens';
import { useThemeColors } from '@/hooks/useTheme';

const colors = useThemeColors();
```

**❌ NUNCA:** Usar `@/design-system` (sistema legado)

---

# PARTE 4: DESENVOLVIMENTO

## 4.1 Guias de Setup

### Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
# SUPABASE (Backend)
EXPO_PUBLIC_SUPABASE_URL=https://[PROJECT_ID].supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=[ANON_KEY]
EXPO_PUBLIC_SUPABASE_FUNCTIONS_URL=https://[PROJECT_ID].supabase.co/functions/v1

# GEMINI AI (Chat IA)
EXPO_PUBLIC_GEMINI_API_KEY=[GEMINI_KEY]
```

**⚠️ IMPORTANTE:** O arquivo `.env` está no `.gitignore` e não será commitado.

### Configuração do Supabase

1. **Criar projeto no Supabase**
2. **Aplicar schema SQL:**
   - Acesse SQL Editor no dashboard
   - Execute o conteúdo de `supabase/schema.sql`
3. **Configurar RLS Policies:**
   - Veja `supabase/migrations/002_rls_policies.sql`
4. **Deploy Edge Functions:**
   ```bash
   supabase functions deploy chat-gemini
   supabase functions deploy delete-account
   ```

📖 Veja [docs/setup-supabase.md](./setup-supabase.md) para guia completo.

---

## 4.2 Melhores Práticas

### Arquitetura de Componentes

**Regra de Ouro:** Separação de responsabilidades

1. **Componentes (`src/components`) são APENAS apresentacionais:**
   - ✅ Recebem props e renderizam UI
   - ❌ NÃO fazem chamadas diretas a APIs

2. **Lógica de negócio vai em `src/services`:**
   - ✅ Services fazem chamadas a APIs, Supabase, IA
   - ✅ Services contêm regras de negócio

3. **Hooks (`src/hooks`) são bridges entre UI e Services:**
   - ✅ Encapsulam lógica reutilizável
   - ✅ Podem usar TanStack Query para cache/sync

### Performance

- ✅ `FlatList` para listas (NUNCA `ScrollView` com `.map()`)
- ✅ Memoizar componentes de lista com `memo()`
- ✅ `useCallback` para funções em contextos
- ✅ `useMemo` para valores derivados

### Acessibilidade

- ✅ Contraste mínimo 7:1 (WCAG AAA)
- ✅ Touch targets mínimos 44pt (iOS) / 48dp (Android)
- ✅ Sempre adicionar `accessibilityLabel` e `accessibilityRole`
- ✅ Testar com VoiceOver (iOS) e TalkBack (Android)

---

## 4.3 Code Patterns Críticos

### LLM Router (src/agents/helpers/llmRouter.ts)

```typescript
// Fallback: Gemini → GPT-4o → Claude Opus
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

### RLS Policies (Supabase)

- ✅ RLS policies em TODAS as tables
- ✅ Testar policies com diferentes usuários
- ❌ Nunca desabilitar RLS em produção

---

## 4.4 Testing Strategy

### Estrutura de Testes

```
__tests__/
├── hooks/
│   ├── useAppState.test.ts
│   └── useTheme.test.ts
├── services/
│   └── geminiService.test.ts
└── utils/
    ├── errorHandler.test.ts
    ├── logger.test.ts
    └── storage.test.ts
```

### Cobertura Alvo

- **MVP:** 40%+
- **Phase 2:** 60%+
- **Final:** 80%+

### Executar Testes

```bash
# Todos os testes
npm test

# Watch mode
npm run test:watch

# Com cobertura
npm run test:coverage

# Teste específico
npx jest __tests__/services/chatService.test.ts
```

---

# PARTE 5: FEATURES E FUNCIONALIDADES

## 5.1 Chat IA (NathIA)

### Funcionalidades

- Chat empático e contextualizado
- Histórico de conversas persistido
- Sugestões rápidas de perguntas
- Aviso médico permanente
- Indicador de digitação

### Arquitetura

- **Agent:** `MaternalChatAgent`
- **Service:** `geminiService.ts` (legacy) → Edge Function (futuro)
- **Router:** `llmRouter.ts` (fallback automático)

📖 Veja [docs/chat-ia.md](./chat-ia.md) para documentação completa.

---

## 5.2 Sistema de Agentes

### Agentes Disponíveis (9 total)

| Agente | Função | Localização |
|--------|--------|-------------|
| `AgentOrchestrator` | Gerencia todos os agentes | `src/agents/core/` |
| `MaternalChatAgent` | Chat principal com IA | `src/agents/maternal/` |
| `ContentRecommendationAgent` | Recomendações personalizadas | `src/agents/content/` |
| `HabitsAnalysisAgent` | Análise de hábitos | `src/agents/habits/` |
| `EmotionAnalysisAgent` | Análise emocional | `src/agents/emotion/` |
| `NathiaPersonalityAgent` | Personalidade da NathIA | `src/agents/personality/` |
| `SleepAnalysisAgent` | Análise de sono | `src/agents/sleep/` |
| `DesignQualityAgent` | Qualidade de design | `src/agents/design/` |

---

## 5.3 MCPs (Model Context Protocol)

### MCP Servers Disponíveis (6 total)

| Server | Função | Localização |
|--------|--------|-------------|
| `SupabaseMCPServer` | Database + Auth + Storage | `src/mcp/servers/` |
| `GoogleAIMCPServer` | Gemini integration | `src/mcp/servers/` |
| `OpenAIMCPServer` | GPT integration | `src/mcp/servers/` |
| `AnthropicMCPServer` | Claude integration | `src/mcp/servers/` |
| `AnalyticsMCPServer` | Métricas e analytics | `src/mcp/servers/` |
| `PlaywrightMCPServer` | Automação de testes | `src/mcp/servers/` |

### Parallel Execution

```typescript
const result = await orchestrator.callMCPParallel([
  { server: 'supabase', method: 'db.query', params: {...} },
  { server: 'googleai', method: 'analyze', params: {...} }
]);
```

---

## 5.4 Outras Features Principais

### Comunidade MãesValentes

- Feed de publicações
- Filtros (todos/populares/recentes/seguindo)
- Criar publicação (normal/anônima)
- Like, comentário, compartilhar
- Denúncia de conteúdo

### Mundo Nath

- Header premium com gradiente dourado
- Séries de vídeos em carousel
- Categorias (gestação, pós-parto, amamentação, etc.)
- Continue assistindo
- Player de vídeo nativo

### Hábitos

- Lista de hábitos do dia
- Progresso circular e barra
- Streak (sequência de dias)
- Calendário semanal
- Criar/editar/excluir hábitos

---

# PARTE 6: DEPLOY E LOJAS

## 6.1 Checklist de Deploy Completo

### 🔴 CRÍTICO (Antes do Build)

- [ ] **Segurança**
  - [ ] Edge Function Gemini criada e deployada
  - [ ] GEMINI_API_KEY como secret no Supabase
  - [ ] RLS ativo em todas as tabelas
  - [ ] Nenhuma EXPO_PUBLIC_ com segredos
  - [ ] SecureStore para tokens

- [ ] **Compliance iOS**
  - [ ] Privacy Manifest em app.json
  - [ ] Account Deletion implementado
  - [ ] AI Consent antes do chat
  - [ ] Privacy Policy link funcional

- [ ] **Compliance Android**
  - [ ] targetSdkVersion >= 35
  - [ ] SafeArea migrado para safe-area-context
  - [ ] Edge-to-edge habilitado
  - [ ] Data Safety preenchido

- [ ] **Bugs Críticos**
  - [ ] Analytics não bloqueia chat
  - [ ] JSON.parse com try/catch
  - [ ] Streak ordenado e deduplicado
  - [ ] Filtro vazio retorna tudo

📖 Veja [docs/DEPLOYMENT_READINESS_CHECKLIST.md](./DEPLOYMENT_READINESS_CHECKLIST.md) para checklist completo.

---

## 6.2 Requisitos das Stores

### iOS App Store

#### Privacy Manifest (OBRIGATÓRIO desde Maio 2024)

Adicionar em `app.json > expo > ios`:

```json
{
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
    ]
  }
}
```

#### AI Disclosure (NOVO - Novembro 2025)

- Consentimento explícito ANTES do primeiro uso da IA
- Divulgação clara de quais dados são enviados
- Link para política de privacidade do provedor de IA

#### Account Deletion (OBRIGATÓRIO desde Junho 2022)

- Opção de deletar conta visível em Settings
- Deleção completa de TODOS os dados do usuário
- Prazo máximo de 7 dias para conclusão

### Google Play Store

#### Target SDK 35+ (OBRIGATÓRIO desde Agosto 2025)

```json
{
  "android": {
    "compileSdkVersion": 35,
    "targetSdkVersion": 35,
    "buildToolsVersion": "35.0.0",
    "minSdkVersion": 24
  }
}
```

#### Edge-to-Edge (OBRIGATÓRIO Android 16)

- Sem barras pretas no topo/fundo
- Usar `react-native-safe-area-context`
- Configurar `edgeToEdgeEnabled=true` no gradle

---

## 6.3 Configurações Necessárias

### app.config.js

**Arquivo:** `app.config.js` (raiz do projeto)

Este arquivo contém toda a configuração do Expo, incluindo iOS, Android, web e plugins. É um arquivo JavaScript que permite processar variáveis de ambiente.

#### Configurações Principais

```javascript
module.exports = {
  expo: {
    name: 'Nossa Maternidade',
    slug: 'nossa-maternidade',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'automatic', // Suporta dark mode automático
    scheme: 'nossamaternidade', // Deep links
    owner: 'liongab',
    
    // New Architecture (React Native 0.76+)
    newArchEnabled: true,
    
    ios: {
      bundleIdentifier: 'com.nossamaternidade.app',
      buildNumber: '1',
      supportsTablet: true,
      // Privacy Manifest (iOS 17+)
      privacyManifests: {
        NSPrivacyAccessedAPITypes: [
          {
            NSPrivacyAccessedAPIType: 'NSPrivacyAccessedAPICategoryUserDefaults',
            NSPrivacyAccessedAPITypeReasons: ['CA92.1'], // App Functionality
          },
        ],
      },
      infoPlist: {
        NSMicrophoneUsageDescription: 'Precisamos acessar o microfone...',
        NSCameraUsageDescription: 'Precisamos acessar a câmera...',
        // ... outras permissões
      },
    },
    
    android: {
      package: 'com.nossamaternidade.app',
      versionCode: 1,
      targetSdkVersion: 34, // Android 14
      compileSdkVersion: 34,
      minSdkVersion: 24, // Android 7.0
      edgeToEdgeEnabled: true, // Android 16+
      permissions: [
        'android.permission.CAMERA',
        'android.permission.RECORD_AUDIO',
        // ... outras permissões
      ],
    },
    
    extra: {
      // Variáveis de ambiente públicas
      supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL || '',
      supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '',
      geminiApiKey: process.env.EXPO_PUBLIC_GEMINI_API_KEY || '',
      // ... outras variáveis
      eas: {
        projectId: 'ceee9479-e404-47b8-bc37-4f913c18f270',
      },
    },
    
    plugins: [
      'expo-secure-store',
      'expo-font',
      'expo-localization',
      'expo-tracking-transparency',
      '@sentry/react-native/expo',
      // ... outros plugins
    ],
  },
};
```

#### Configurações Críticas para Deploy

- **Bundle Identifier iOS:** `com.nossamaternidade.app`
- **Package Android:** `com.nossamaternidade.app`
- **Privacy Manifest:** Configurado para iOS 17+
- **Target SDK Android:** 34 (Android 14)
- **Edge-to-Edge:** Habilitado para Android 16+
- **Deep Links:** Scheme `nossamaternidade://`

📖 **Arquivo completo:** Veja `app.config.js` na raiz do projeto.

---

### eas.json

**Arquivo:** `eas.json` (raiz do projeto)

Este arquivo configura os perfis de build do EAS (Expo Application Services) para diferentes ambientes.

#### Estrutura Principal

```json
{
  "cli": {
    "version": ">= 12.0.0",
    "appVersionSource": "local",
    "requireCommit": true
  },
  "build": {
    "base": {
      "node": "20.11.1",
      "cache": {
        "key": "nossa-maternidade-v1",
        "paths": ["node_modules"]
      }
    },
    "development": {
      "extends": "base",
      "developmentClient": true,
      "distribution": "internal",
      "channel": "development"
    },
    "preview": {
      "extends": "base",
      "distribution": "internal",
      "channel": "preview"
    },
    "staging": {
      "extends": "base",
      "distribution": "internal",
      "channel": "staging"
    },
    "production": {
      "extends": "base",
      "channel": "production",
      "autoIncrement": true,
      "ios": {
        "enterpriseProvisioning": "universal",
        "autoIncrement": "buildNumber",
        "resourceClass": "m-medium"
      },
      "android": {
        "buildType": "app-bundle",
        "autoIncrement": "versionCode",
        "resourceClass": "m-medium"
      }
    }
  },
  "submit": {
    "production": {
      "ios": {
        "language": "pt-BR",
        "sku": "NOSSA_MATERNIDADE_2025",
        "ascAppId": "YOUR_APP_STORE_CONNECT_APP_ID",
        "appleTeamId": "YOUR_APPLE_TEAM_ID"
      },
      "android": {
        "serviceAccountKeyPath": "./google-play-service-account.json",
        "track": "production",
        "releaseStatus": "completed"
      }
    }
  }
}
```

#### Perfis de Build

| Perfil | Uso | Distribution | Channel |
|--------|-----|-------------|---------|
| **development** | Desenvolvimento local | Internal | development |
| **preview** | Testes internos | Internal | preview |
| **staging** | Testes antes de produção | Internal | staging |
| **production** | Builds para lojas | Store | production |

#### Configurações Importantes

- **Node Version:** 20.11.1 (fixo para builds consistentes)
- **Auto Increment:** Habilitado em produção (buildNumber iOS, versionCode Android)
- **Resource Class:** `m-medium` para builds de produção (mais rápido)
- **Build Type Android:** `app-bundle` para produção (requerido Google Play)

#### ⚠️ Antes do Deploy

1. **Preencher placeholders em `submit.production`:**
   - `ascAppId`: ID do app no App Store Connect
   - `appleTeamId`: ID do time Apple Developer
   - `serviceAccountKeyPath`: Caminho para service account do Google Play

2. **Verificar variáveis de ambiente:**
   - Cada perfil pode ter variáveis específicas em `env`

📖 **Arquivo completo:** Veja `eas.json` na raiz do projeto.

---

## 6.4 Guia de Build e Submit

### Build para Produção

```bash
# Android
npm run build:android

# iOS
npm run build:ios

# Ambas plataformas
npm run build:production
```

### Submit para Stores

```bash
# Android (Google Play)
npm run submit:android

# iOS (App Store)
npm run submit:ios

# Ambas
npm run submit:all
```

📖 Veja [docs/deployment.md](./deployment.md) para guia completo de deploy.

---

# PARTE 7: LEGAL E COMPLIANCE

## 7.1 LGPD Compliance

### Direitos do Usuário

- ✅ **Acesso:** Exportar todos os dados
- ✅ **Correção:** Editar perfil e preferências
- ✅ **Exclusão:** Deletar conta completamente
- ✅ **Portabilidade:** Exportar em formato JSON

### Implementação

- **Export Data:** `src/services/userDataService.ts`
- **Delete Account:** Edge Function `delete-account`
- **Privacy Policy:** Link funcional no app

📖 Veja [docs/PRIVACY_POLICY_TEMPLATE.md](./PRIVACY_POLICY_TEMPLATE.md) para template completo.

---

## 7.2 Privacy Policy

**Arquivo:** `docs/PRIVACY_POLICY_TEMPLATE.md`

**Conteúdo mínimo:**
- Dados coletados (nome, email, dados de saúde, fotos, mensagens)
- Como os dados são usados
- Compartilhamento com terceiros (Supabase, Google Gemini, OneSignal)
- Direitos do usuário (acesso, correção, exclusão)
- Contato do DPO
- Base legal (LGPD/GDPR)

**⚠️ IMPORTANTE:** Customizar com informações da empresa e revisar com advogado antes de publicar.

---

## 7.3 Terms of Service

**Arquivo:** `docs/TERMS_OF_SERVICE_TEMPLATE.md`

**Conteúdo mínimo:**
- Descrição do serviço
- Regras de uso aceitável
- Propriedade intelectual
- Limitação de responsabilidade
- Rescisão de conta
- Lei aplicável (Brasil)
- Idade mínima (18+)

**⚠️ IMPORTANTE:** Customizar com informações da empresa e revisar com advogado antes de publicar.

---

## 7.4 Data Safety (Google Play)

**Arquivo:** `docs/data-safety-google-play.md`

**Informações necessárias:**
- Coleta de email: Sim (autenticação)
- Coleta de dados de saúde: Sim (bem-estar maternal)
- Compartilhamento com terceiros: Sim (Google Gemini AI)
- Criptografia em trânsito: Sim

---

# PARTE 8: MANUTENÇÃO E OPERAÇÃO

## 8.1 Monitoramento

### Sentry (Error Tracking)

- Integração automática com `logger.warn()` e `logger.error()`
- Tracking de crashes e erros em produção
- Dashboard de erros em tempo real

📖 **Guia completo:** Veja [docs/SENTRY_SETUP_GUIDE.md](./SENTRY_SETUP_GUIDE.md) para configuração passo a passo, explicação sobre DSN vs Auth Tokens, e troubleshooting.

### Analytics

- Tracking de eventos via `AnalyticsMCPServer`
- Métricas de uso, engajamento, conversão
- Análise de funil de onboarding

---

## 8.2 Troubleshooting Avançado

### Problemas Comuns

1. **Metro bundler lento:**
   - Limpar cache: `npx expo start -c`
   - Verificar dependências conflitantes

2. **Build falha:**
   - Verificar `eas.json` e `app.json`
   - Validar variáveis de ambiente
   - Checar logs do EAS Build

3. **Erro de TypeScript:**
   - Executar `npm run type-check`
   - Verificar tipos em `src/types/`

---

## 8.3 Migrações Pendentes

### expo-av → expo-audio / expo-video

**Status:** Em progresso

**Arquivos afetados:**
- `src/services/elevenLabsService.ts`
- `src/hooks/useVoiceRecording.ts`
- `src/hooks/useAudioPlayer.ts`

📖 Veja [docs/MIGRATION_PLAN_EXPO_AV.md](./MIGRATION_PLAN_EXPO_AV.md) para plano completo.

### SafeAreaView deprecated

**Status:** Em progresso

**Migração:**
- `react-native.SafeAreaView` → `react-native-safe-area-context`

---

## 8.4 Roadmap Técnico

### Fase 1: MVP Básico (Semanas 1-4) ✅

- [x] Setup + TypeScript Clean
- [x] Onboarding + Home + Design System
- [x] Chat NathIA + Emotions + Supabase Integration

### Fase 2: Ampliação (Semanas 5-8) 🟡

- [ ] MundoNath Feed + Content Interactions
- [ ] Profile Completo + IA Routing
- [ ] Design System + Dark Mode + Acessibilidade

### Fase 3: Comunidade + Lançamento (Semanas 9-12) ⏳

- [ ] MãesValente (Comunidade)
- [ ] Embeddings + Semantic Search
- [ ] Polish + Lançamento

---

## 📝 Changelog

### Versão 2.1.0 - 4 de Dezembro 2025

- ✅ Atualização de métricas de qualidade
- ✅ Adição de referência ao documento de análise de qualidade
- ✅ Atualização de status do projeto
- ✅ Sincronização com CONTEXTO.md

### Versão 2.0.0 - Dezembro 2025

- ✅ Documento consolidado criado
- ✅ Todas as seções principais incluídas
- ✅ Eliminação de duplicações
- ✅ Organização lógica por partes

### Versão 1.0.0 - Novembro 2024

- Versão inicial do documento definitivo
- Foco em deploy e bugs

---

## 📚 Referências Rápidas

### Documentos Principais

- **`README.md`** - Visão geral e setup
- **`CONTEXTO.md`** - Contexto completo do projeto
- **`CLAUDE.md`** - Diretrizes para Claude Code
- **`docs/INDEX.md`** - Índice da documentação
- **`docs/ANALISE_QUALIDADE.md`** - Análise de qualidade com métricas e prioridades ⭐

### Links Importantes

- **Repo GitHub:** LionGab/NossaMaternidade
- **Design System:** `src/theme/tokens.ts`
- **IA Docs:** `CLAUDE.md`, `src/ai/`
- **Supabase Setup:** `docs/setup-supabase.md`

---

**Última atualização:** 4 de Dezembro 2025  
**Versão do documento:** 2.1.0  
**Mantido por:** Equipe Nossa Maternidade + Claude Code

---

> 💡 **Dica:** Este documento é sua referência única. Consulte-o sempre que precisar de informações sobre o projeto. Se algo estiver faltando ou desatualizado, abra uma issue ou PR para atualizar.
