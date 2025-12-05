# 🧠 CÉREBRO EXTERNO - Nossa Maternidade

> **Este documento serve como a "memória permanente" da IA.**
>
> **Use estas informações como base para todas as respostas.**
>
> **Última atualização:** 5 de Dezembro de 2025

---

## 📋 ÍNDICE RÁPIDO

1. [Sobre o Projeto](#sobre-o-projeto)
2. [Sobre o Desenvolvimento](#sobre-o-desenvolvimento)
3. [Objetivos Atuais](#objetivos-atuais)
4. [Regras Fundamentais](#regras-fundamentais)
5. [Stack e Arquitetura](#stack-e-arquitetura)
6. [Estado Atual](#estado-atual)
7. [Próximos Passos](#próximos-passos)

---

## Sobre o Projeto

### Visão

**Nossa Maternidade** é um aplicativo mobile React Native + Expo para mães brasileiras, focado em:

- 🤖 **Apoio emocional** com IA amigável (NathIA)
- 💬 **Comunidade** de mães (MãesValentes)
- 📚 **Conteúdo personalizado** (MundoNath)
- 📊 **Tracking de hábitos** e bem-estar
- 🎯 **Autocuidado** e desenvolvimento pessoal

### Público-Alvo

- **Idade:** 18-45 anos
- **Classe:** C-D (Brasil)
- **Contexto:** LGPD compliance obrigatório
- **Plataformas:** iOS App Store + Google Play Store

### Status Atual

- ✅ **MVP funcional** existe
- ✅ **Arquitetura moderna** (MCPs + Agentes IA)
- ✅ **TypeScript:** 0 errors (21 → 0)
- ✅ **ESLint:** 0 errors (8 → 0)
- 🟡 **Qualidade de código** em melhoria contínua
- 🟡 **Testes** em expansão (1.4% → meta 80%)
- ⏳ **Deploy** preparação em andamento

### Funcionalidades Principais

- Chat Inteligente (MãesValente) com IA contextualizada (Gemini 2.0)
- Conteúdo Personalizado com recomendações baseadas em IA
- Análise de Hábitos com tracking inteligente e insights
- Comunidade MãesValentes para conexão entre mães
- Onboarding Completo com 9 etapas personalizadas
- Sleep Tracker para rastreamento de qualidade do sono
- Exercícios de Respiração para técnicas de calma
- Mundo Nath com feed de vídeos, áudios, reels e textos educativos

---

## Sobre o Desenvolvimento

### Estilo de Comunicação Preferido

**Contexto:** Desenvolvedor neurodivergente (TDAH + Autismo). Adapte TODA comunicação.

**Formato de Resposta Padrão:**

1. **RESUMO EXECUTIVO** (máx 5 bullets)
   - O que este código/documento FAZ?
   - Por que EXISTE?
   - Qual o ESTADO atual?

2. **ARQUITETURA CLARA**
   - Estrutura visual hierárquica
   - Componentes principais (1 linha cada)
   - Fluxo de dados: A → B → C

3. **DEPENDÊNCIAS CRÍTICAS**
   - O que PRECISA funcionar primeiro?
   - O que BLOQUEIA o quê?
   - Ordem de prioridade: 1, 2, 3...

4. **PRÓXIMOS PASSOS CONCRETOS**
   - Ações com MÁXIMO 30 minutos cada
   - Formato: `[VERBO] + [O QUÊ] + [ONDE]`
   - Exemplo: "Refatorar HomeScreen.tsx removendo lógica de API"

5. **ALERTAS & ARMADILHAS**
   - O que pode DAR ERRADO?
   - Onde está a COMPLEXIDADE oculta?
   - Qual o RISCO se ignorar X?

**Restrições de Comunicação:**

| NUNCA               | SEMPRE                          |
| ------------------- | ------------------------------- |
| Parágrafos longos   | Listas e bullets                |
| Jargão sem explicar | Termos simples ou com definição |
| Misturar conceitos  | Uma ideia por bloco             |
| Respostas vagas     | Ações concretas e específicas   |
| Assumir contexto    | Confirmar entendimento          |

### Desafios Comuns

- Dificuldade com gerenciamento de tempo
- Iniciar tarefas grandes (precisa quebrar em partes menores)
- Sobrecarregamento quando há muitas informações de uma vez
- Necessidade de estimativas de tempo e nível de energia para tarefas

### Preferências de Trabalho

- **Tarefas:** Sempre quebrar grandes tarefas em passos de no máximo 25-30 minutos
- **Estimativas:** Sempre incluir estimativa de tempo e nível de energia (baixo, médio, alto)
- **Validação:** Verificar e ajustar o curso em cada etapa
- **Contexto:** Iniciar novo chat quando conversa fica muito longa (renovar foco)

---

## Objetivos Atuais

### Meta Principal

**Organizar e profissionalizar o projeto Nossa Maternidade para publicação nas lojas (App Store + Google Play) nas próximas 4-8 semanas.**

**Sub-objetivos:**

- Completar migração de design tokens (0 violations)
- Aumentar test coverage para 40%+ (atual: 1.4%)
- Reduzir ESLint warnings para <50 (atual: 272)
- WCAG AAA compliance 100% (atual: 75-80%)
- Dark mode 100% (atual: 75-80%)

### Meta Secundária

**Manter qualidade de código e documentação durante desenvolvimento contínuo.**

**Sub-objetivos:**

- TypeScript: 0 errors (✅ mantido)
- ESLint: 0 errors (✅ mantido)
- Design system unificado (✅ concluído)
- Documentação atualizada e acessível

---

## Regras Fundamentais

### Regra 1: Sempre quebrar grandes tarefas em passos de no máximo 25-30 minutos

**Porquê:** Isso ajuda a evitar procrastinação e sobrecarga. Tarefas grandes são intimidadoras e difíceis de iniciar. Quebrar em partes menores torna o trabalho gerenciável e permite progresso constante.

**Como aplicar:**

- Antes de começar uma tarefa, perguntar: "Posso quebrar isso em partes menores?"
- Cada parte deve ter objetivo claro e verificável
- Marcar progresso após cada parte completa

### Regra 2: Ao sugerir atividades, sempre incluir estimativa de tempo e nível de energia (baixo, médio, alto)

**Porquê:** Necessito alinhar as tarefas com minha capacidade no momento. Alguns dias tenho mais energia, outros menos. Saber o tempo e energia necessários ajuda a planejar melhor e evitar sobrecarga.

**Como aplicar:**

- Sempre incluir: "Tempo estimado: X minutos/horas"
- Sempre incluir: "Nível de energia: baixo/médio/alto"
- Considerar contexto (manhã vs tarde, dias da semana)

### Regra 3: Usar TypeScript strict mode com zero `any`

**Porquê:** TypeScript strict mode previne bugs em tempo de compilação e garante qualidade de código. Zero `any` força tipagem explícita, tornando o código mais seguro e manutenível.

**Como aplicar:**

- `strict: true` sempre no tsconfig.json
- Usar `unknown` + type guards quando necessário
- Nunca usar `// @ts-ignore` ou `@ts-expect-error` (exceto casos documentados)

### Regra 4: Usar design tokens (`src/theme/tokens.ts`) e nunca valores hardcoded

**Porquê:** Design tokens garantem consistência visual, suporte a dark mode automático, e facilitam manutenção. Valores hardcoded quebram o sistema de design e criam inconsistências.

**Como aplicar:**

- Sempre usar `useThemeColors()` para cores
- Sempre usar `Tokens.spacing`, `Tokens.radius`, `Tokens.typography`
- Nunca usar `#FFFFFF`, `rgba(...)`, ou valores numéricos diretos

### Regra 5: Usar `logger.*` para logs e nunca `console.log`

**Porquê:** Logger centralizado permite controle de nível de log, formatação consistente, e facilita debugging em produção. `console.log` espalhado pelo código dificulta manutenção.

**Como aplicar:**

- Importar: `import { logger } from '@/utils/logger'`
- Usar: `logger.info()`, `logger.error()`, `logger.debug()`, `logger.warn()`
- Nunca usar `console.log/warn/error` (exceto em `logger.ts` e runners legítimos)
- Logger integra com Sentry automaticamente (warn/error)

### Regra 6: WCAG AAA compliance - contraste mínimo 7:1 e touch targets 44pt+

**Porquê:** Acessibilidade não é opcional. WCAG AAA garante que o app seja usável por todas as pessoas, incluindo aquelas com deficiências visuais ou motoras. Touch targets pequenos são difíceis de usar.

**Como aplicar:**

- Contraste mínimo 7:1 para texto normal, 4.5:1 para texto grande
- Touch targets mínimos 44x44pt (iOS) / 48x48dp (Android)
- Sempre adicionar `accessibilityLabel` e `accessibilityRole`
- Testar com VoiceOver (iOS) e TalkBack (Android)

### Regra 7: Sempre rotear IA via `llmRouter.ts` com fallback automático

**Porquê:** Roteamento inteligente garante que usamos o melhor modelo para cada situação. Fallback automático garante que o app continue funcionando mesmo se um provider cair.

**Como aplicar:**

- Sempre usar `llmRouter.ts` para decidir provider
- Implementar fallback: Gemini → GPT-4o → Claude Opus
- Log cada chamada (provider, tokens, cost)
- Crisis detection antes de qualquer resposta

### Regra 8: RLS policies em TODAS as tables do Supabase

**Porquê:** Row Level Security é essencial para LGPD compliance e segurança. Sem RLS, dados podem ser acessados por usuários não autorizados.

**Como aplicar:**

- Criar RLS policies para cada table
- Testar policies com diferentes usuários
- Documentar policies em migrations
- Nunca desabilitar RLS em produção

### Regra 9: Services SEMPRE retornam `{ data, error }`

**Porquê:** Padrão consistente de error handling facilita tratamento de erros em toda a aplicação. Evita try/catch espalhados e garante que erros nunca passem silenciosamente.

**Como aplicar:**

```typescript
// No service
async function getProfile(userId: string): Promise<{ data: Profile | null; error: Error | null }> {
  try {
    const data = await supabase.from('profiles').select().eq('id', userId).single();
    return { data, error: null };
  } catch (error) {
    return { data: null, error: error as Error };
  }
}

// No componente/screen
const { data, error } = await profileService.getProfile(userId);
if (error) {
  logger.error('Falha ao carregar perfil', error);
  return;
}
// usar data...
```

---

## Stack e Arquitetura

### Frontend

- **Framework:** React Native + Expo SDK 54+
- **Language:** TypeScript 5.7+ (strict mode, zero `any`)
- **Styling:** NativeWind (Tailwind) + Design Tokens (`src/theme/tokens.ts`)
- **Navigation:** React Navigation 7
- **State:** TanStack Query (React Query) para Supabase sync
- **UI:** Componentes customizados (Atomic Design)
- **Theme:** "Bubblegum" design system (azul pastel #B3D9E8, rosa, verde)
- **Testing:** Jest + React Native Testing Library

### Backend

- **Database:** Supabase (PostgreSQL) + RLS policies (LGPD)
- **Auth:** Supabase Auth (magic links + social)
- **Storage:** Supabase Storage (avatares, thumbs)
- **Realtime:** Supabase Realtime (comunidade live)
- **Edge Functions:** Supabase Edge Functions (Deno) para orquestração IA

### IA Stack (Multi-Provider + Fallback)

| Caso de Uso           | Primary                   | Fallback 1          | Fallback 2  |
| --------------------- | ------------------------- | ------------------- | ----------- |
| Chat NathIA (default) | Gemini 2.5 Flash          | GPT-4o              | Claude Opus |
| Crise emocional       | GPT-4o (safety)           | Gemini thinking     | Claude Opus |
| Análise profunda      | Gemini 2.5 Flash thinking | Claude Opus         | —           |
| Embeddings            | Gemini 1.5                | OpenAI text-embed-3 | —           |
| Moderação conteúdo    | Claude API                | OpenAI Moderation   | —           |

**Arquitetura IA:**

- `llmRouter.ts`: Roteamento inteligente baseado em contexto
- `MaternalChatAgent` + `ContentRecommendationAgent` + `HabitsAnalysisAgent`
- MCP architecture: SupabaseMCP, GoogleAIMCP, OpenAIMCP, AnthropicMCP
- Prompt registry: `/src/ai/prompts/`
- Fallback automático entre providers

### Estrutura de Pastas

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

## Estado Atual

### Métricas de Qualidade (Dezembro 2025)

| Métrica                 | Status | Valor Atual         | Meta | Prioridade |
| ----------------------- | ------ | ------------------- | ---- | ---------- |
| **TypeScript Errors**   | ✅     | 0                   | 0    | ✅ Mantido |
| **TypeScript Warnings** | 🟡     | ~50-64              | 0    | 🟡 Médio   |
| **ESLint Errors**       | ✅     | 0                   | 0    | ✅ Mantido |
| **ESLint Warnings**     | 🟡     | 272                 | <50  | 🔴 Alto    |
| **Tipos `any`**         | ✅     | 0 (services/agents) | <10  | ✅ Mantido |
| **console.log**         | ✅     | 0 (legítimos)       | 0    | ✅ Mantido |
| **Test Coverage**       | 🟡     | 1.4%                | 80%  | 🔴 Alto    |
| **Design Violations**   | 🟡     | ~100                | 0    | 🟡 Médio   |
| **WCAG AAA**            | 🟡     | 75-80%              | 100% | 🟡 Médio   |
| **Dark Mode**           | 🟡     | 75-80%              | 100% | 🟡 Médio   |

### Conquistas Recentes

**Organizacao e Limpeza (5 Dez 2025):**
- ✅ **Raiz limpa:** 4 .md apenas (README, CONTEXTO, CLAUDE, MEMORY)
- ✅ **docs/archive/ removido:** 70 arquivos obsoletos (~724 KB)
- ✅ **Migrations consolidadas:** 48 → 7 SQL limpos (migrations_mvp)
- ✅ **Components refatorados:** primitives → atoms, home/chat → features/
- ✅ **tsconfig.json:** Path aliases corrigidos + 5 novos adicionados
- ✅ **Pre-commit hook:** Corrigido (removida validacao quebrada)
- ✅ **Bug ChatScreen:** initializeChat usado antes de declarar (corrigido)

**Qualidade Anterior:**
- ✅ **TypeScript:** 0 errors (21 → 0)
- ✅ **ESLint:** 0 errors (8 → 0)
- ✅ **Design System:** Unificado (migrado de dual para unico)
- ✅ **Arquivos criticos:** 5 componentes migrados para tokens modernos
- ✅ **Documentacao:** +1,926 linhas de guias e scripts
- ✅ **Tipos `any`:** 0 em services e agents criticos (~300 → 0)
- ✅ **console.log:** Removidos (exceto legitimos)

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

## Próximos Passos

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
   - **Ações:**
     - Aplicar auto-fix batch: `node scripts/cursor-auto-fix.js --mode=batch --confidence=high`
     - Validar: `npm run validate:design`
     - Corrigir manualmente se necessário

5. **WCAG AAA 100%**
   - **Tempo estimado:** 3-4 horas
   - **Nível de energia:** Médio
   - **Ações:**
     - Verificar contraste em todas as telas
     - Adicionar accessibility labels faltantes
     - Testar com VoiceOver/TalkBack
     - Corrigir touch targets < 44pt

6. **Dark Mode 100%**
   - **Tempo estimado:** 2-3 horas
   - **Nível de energia:** Médio
   - **Ações:**
     - Verificar todas as telas
     - Testar transição entre temas
     - Corrigir cores hardcoded restantes

### 🟢 Desejável - Fazer NAS PRÓXIMAS 2 SEMANAS

7. **TypeScript Warnings** (~50-64 → 0)
   - **Tempo estimado:** 2-3 horas
   - **Nível de energia:** Baixo
   - **Ações:**
     - Corrigir tipos faltantes
     - Remover `@ts-ignore` desnecessários
     - Adicionar tipos explícitos

8. **Build Preview**
   - **Tempo estimado:** 1-2 horas
   - **Nível de energia:** Médio
   - **Ações:**
     - Testar em device físico
     - Validar todas as features principais
     - Corrigir bugs encontrados

---

## Referências Rápidas

### Documentação Principal

- **`README.md`** - Visão geral e setup
- **`CLAUDE.md`** - Diretrizes para Claude Code
- **`.cursor/rules`** - Regras para Cursor AI
- **`docs/DOCUMENTO_DEFINITIVO_NOSSA_MATERNIDADE.md`** - Documento consolidado completo ⭐
- **`docs/ANALISE_QUALIDADE.md`** - Análise de qualidade com métricas e prioridades ⭐
- **`docs/ORGANIZACAO/`** - Sistema de organização estruturado

### Scripts Úteis

```bash
# Validação
npm run validate              # Tudo
npm run validate:env          # Ambiente
npm run validate:design      # Design tokens
npm run type-check            # TypeScript
npm run lint                  # ESLint
npm test                      # Testes

# Auto-fix
node scripts/cursor-auto-fix.js --mode=batch --confidence=high

# Build
npm run build:preview         # Preview
npm run build:production     # Produção
```

### Comandos Git

```bash
# Workflow padrão
git checkout dev
git pull origin dev
git checkout -b feature/nome-da-funcionalidade

# Commit (Conventional, em português)
git commit -m "feat: adiciona funcionalidade X"
git commit -m "fix: corrige crash ao abrir perfil"
git commit -m "refactor: extrai lógica de autenticação"
```

### Links Importantes

- **Repo GitHub:** LionGab/NossaMaternidade
- **Design System:** `src/theme/tokens.ts`
- **IA Docs:** `CLAUDE.md`, `src/ai/`
- **Supabase Setup:** `docs/SUPABASE_SETUP.md`
- **Gemini Setup:** `docs/GEMINI_SETUP.md`

---

## Checklist de Qualidade (Antes de Commit)

- [ ] TypeScript: `npm run type-check` → 0 errors
- [ ] Lint: `npm run lint` → 0 critical warnings
- [ ] Tests: `npm test` → All green
- [ ] Design: `npm run validate:design` → 0 violations
- [ ] Naming: Arquivos kebab-case, variáveis camelCase
- [ ] No console.log: Use logger
- [ ] No hardcoded colors: Use tokens
- [ ] Accessibility: Labels, 44pt+ touch targets
- [ ] Performance: No unnecessary re-renders (use memo)
- [ ] Commit message: `feat|fix|refactor(scope): description`

---

**Última atualização:** 4 de Dezembro de 2025
**Versão:** 1.2.0
**Mantido por:** Equipe Nossa Maternidade + Claude Code

---

> 💡 **Dica:** Sempre consulte este documento antes de fazer mudanças significativas no projeto. Ele é sua "memória permanente" e garante consistência em todas as decisões.
