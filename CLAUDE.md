# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> **Para contexto completo:** Leia `CONTEXTO.md` antes de tarefas importantes.

---

## Quick Reference

| Acao                    | Comando                                           |
| ----------------------- | ------------------------------------------------- |
| Dev server              | `npm start`                                       |
| Type check              | `npm run type-check`                              |
| Lint                    | `npm run lint`                                    |
| Test                    | `npm test`                                        |
| Test especifico         | `npx jest __tests__/services/chatService.test.ts` |
| **Diagnostico producao** | `npm run diagnose:production`                    |
| Build Android           | `npm run build:android`                           |
| Build iOS               | `npm run build:ios`                               |
| Limpar cache Metro      | `npx expo start -c`                               |
| Validar design          | `npm run validate:design`                         |
| Validar tudo            | `npm run validate`                                |

### Path Aliases (tsconfig.json)

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

## Regras de Ouro

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

## Patterns Criticos

### Logger (src/utils/logger.ts)

```typescript
import { logger } from '@/utils/logger';

logger.debug('Debug info'); // Dev only
logger.info('User action', { userId });
logger.warn('Problema', error); // + Sentry
logger.error('Falha critica', error); // + Sentry
```

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

### LLM Router (src/agents/helpers/llmRouter.ts)

```typescript
// Fallback: Gemini → GPT-4o → Claude Opus
const result = await llmRouter.route({
  context: 'chat',
  message: userMessage,
  userId,
});
```

---

## Design System (Obrigatorio)

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
Tokens.spacing['6']; // 24px

// Typography
Tokens.typography.sizes.md; // 16

// Border radius
Tokens.radius.lg; // 12

// Touch targets (WCAG AAA)
Tokens.touchTargets.min; // 44pt
```

---

## AI Architecture

### Agentes (9 total)

| Agente                       | Funcao                       |
| ---------------------------- | ---------------------------- |
| `AgentOrchestrator`          | Gerencia todos os agentes    |
| `MaternalChatAgent`          | Chat principal com IA        |
| `ContentRecommendationAgent` | Recomendacoes personalizadas |
| `HabitsAnalysisAgent`        | Analise de habitos           |
| `EmotionAnalysisAgent`       | Analise emocional            |
| `NathiaPersonalityAgent`     | Personalidade da NathIA      |
| `SleepAnalysisAgent`         | Analise de sono              |
| `DesignQualityAgent`         | Qualidade de design          |

**Localizacao:** `src/agents/`

### MCP Servers (6 total)

| Server                | Funcao                    |
| --------------------- | ------------------------- |
| `SupabaseMCPServer`   | Database + Auth + Storage |
| `GoogleAIMCPServer`   | Gemini integration        |
| `OpenAIMCPServer`     | GPT integration           |
| `AnthropicMCPServer`  | Claude integration        |
| `AnalyticsMCPServer`  | Metricas e analytics      |
| `PlaywrightMCPServer` | Automacao de testes       |

**Localizacao:** `src/mcp/servers/`

### Parallel Execution

```typescript
const result = await orchestrator.callMCPParallel([
  { server: 'supabase', method: 'db.query', params: {...} },
  { server: 'googleai', method: 'analyze', params: {...} }
]);
```

---

## Arquitetura de Pastas

```
src/
├── screens/            # Telas do app
├── components/
│   └── primitives/     # Design System base (Box, Text, Button)
├── navigation/         # React Navigation 7
├── theme/              # Tokens e ThemeContext
├── services/           # Logica de negocio (retornam { data, error })
├── contexts/           # AuthContext, AgentsContext
├── agents/             # Sistema de Agentes IA (9)
│   ├── core/           # BaseAgent, AgentOrchestrator
│   └── helpers/        # llmRouter.ts
├── mcp/                # Model Context Protocol (6 servers)
├── hooks/              # Custom hooks (useTheme, useHaptics)
├── types/              # TypeScript definitions
└── utils/              # logger.ts, helpers
```

---

## Antes de Commit

```bash
npm run lint && npm run type-check && npm test
```

**Antes de Build/Deploy:**
```bash
npm run diagnose:production
```

**Conventional Commits (portugues):**

```bash
feat: adiciona funcionalidade X
fix: corrige crash ao abrir perfil
refactor: extrai logica de autenticacao
```

---

## Documentacao Relacionada

| Arquivo                                   | Conteudo                               |
| ----------------------------------------- | -------------------------------------- |
| `CONTEXTO.md`                             | Visao completa, regras, estado atual   |
| `README.md`                               | Setup, deploy, estrutura detalhada     |
| `docs/design/`                            | Design System (fonte unica da verdade) |
| `docs/ORGANIZACAO/`                       | Fluxo de trabalho, templates           |
| `docs/PRODUCTION_READINESS_DIAGNOSTIC.md` | Guia do diagnostico de producao        |

---

## Claude Code Infrastructure (Avançado)

Este projeto inclui um workflow avançado do Claude Code baseado no post do Reddit: "Claude Code is a Beast – Tips from 6 Months of Heavy Usage".

### Recursos Disponíveis

- **Auto-ativação de Skills:** Guidelines injetadas automaticamente baseadas em keywords, intenção e arquivos
- **Validação Pós-Edição:** Type-check, lint e design tokens validados automaticamente
- **Agentes Especializados:** `/plan`, `/test`, `/review` para tarefas específicas
- **Sistema de Dev Docs:** Documentação automática para tarefas complexas

### Quick Start

1. **Skills são auto-ativadas** - Não precisa fazer nada, funciona automaticamente
2. **Validações automáticas** - Após editar arquivos, validações são executadas
3. **Use slash commands** - `/plan`, `/test`, `/review` para agentes especializados

**Documentação completa:** `.claude/README.md`
**Quick Start:** `.claude/QUICK_START.md`

---

_Ultima atualizacao: 4 de dezembro de 2025_
