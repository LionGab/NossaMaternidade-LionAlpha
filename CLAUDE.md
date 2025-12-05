# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> **Contexto completo:** `CONTEXTO.md` contém estado atual, métricas e próximos passos.

---

## Quick Reference

| Ação                 | Comando                              |
| -------------------- | ------------------------------------ |
| Dev server           | `npm start`                          |
| Type check           | `npm run type-check`                 |
| Lint                 | `npm run lint`                       |
| Test                 | `npm test`                           |
| Test específico      | `npx jest __tests__/path/to/test.ts` |
| Diagnóstico produção | `npm run diagnose:production`        |
| Build Android        | `npm run build:android`              |
| Build iOS            | `npm run build:ios`                  |
| Limpar cache Metro   | `npx expo start -c`                  |
| Validar design       | `npm run validate:design`            |
| Validar tudo         | `npm run validate`                   |

### Path Aliases

```typescript
@/*           → ./src/*
@components/* → ./src/components/*
@screens/*    → ./src/screens/*
@services/*   → ./src/services/*
@utils/*      → ./src/utils/*
@types/*      → ./src/types/*
@hooks/*      → ./src/hooks/*
```

---

## Critical Rules

### SEMPRE:

1. `logger.*` para logs (integra Sentry)
2. `useThemeColors()` para cores (suporta dark mode)
3. `FlatList` para listas (nunca ScrollView + map)
4. `Tokens.*` do Design System (`Tokens.spacing`, `Tokens.radius`)
5. Touch targets mínimo 44pt (WCAG AAA)
6. `memo()` em componentes de lista
7. Retornar `{ data, error }` em services
8. Rotear IA via `llmRouter.ts`

### NUNCA:

1. `any` em TypeScript (use `unknown`)
2. `console.log/warn/error` (use `logger`)
3. Cores hardcoded (`#FFFFFF`, `rgba(...)`)
4. RLS desabilitado no Supabase

---

## Core Patterns

### Logger (`src/utils/logger.ts`)

```typescript
import { logger } from '@/utils/logger';

logger.debug('Debug info'); // Dev only
logger.info('User action', { userId });
logger.warn('Problema', error); // → Sentry
logger.error('Falha crítica', error); // → Sentry
```

### Service Error Handling

```typescript
// Services retornam { data, error }
const { data, error } = await profileService.getProfile(userId);
if (error) {
  logger.error('Falha ao carregar perfil', error);
  return;
}
```

### Design System (`src/theme/tokens.ts`)

```typescript
import { Tokens } from '@/theme/tokens';
import { useThemeColors } from '@/hooks/useTheme';

const colors = useThemeColors();
// colors.background.canvas, colors.text.primary, colors.primary.main

// Spacing (múltiplos de 4)
Tokens.spacing['4']; // 16px
Tokens.spacing['6']; // 24px

// Typography
Tokens.typography.sizes.md; // 16
Tokens.textStyles.bodyMedium; // Semantic text style

// Border radius
Tokens.radius.lg; // 12

// Touch targets (WCAG AAA)
Tokens.touchTargets.min; // 44pt
```

---

## AI Architecture

### LLM Router (`src/agents/helpers/llmRouter.ts`)

Roteamento inteligente com fallback automático:

- **Crisis detected** → GPT-4o (safety)
- **Complex context** → Gemini Flash (analysis)
- **Short messages** → Gemini Flash-Lite (cheap)
- **Default** → Gemini Flash

```typescript
import { selectLlmProfile } from '@/agents/helpers/llmRouter';

const profile = selectLlmProfile(message, { emotion, conversationDepth });
// Returns: 'CRISIS_SAFE' | 'ANALYSIS_DEEP' | 'CHAT_CHEAP' | 'CHAT_DEFAULT'
```

### Agent Orchestrator (`src/agents/core/AgentOrchestrator.ts`)

Singleton que gerencia agentes e MCP servers:

- Parallel tool execution
- Lazy loading de MCP servers
- Retry logic com exponential backoff

```typescript
const orchestrator = AgentOrchestrator.getInstance();
await orchestrator.callMCPParallel([
  { server: 'supabase', method: 'db.query', params: {...} },
  { server: 'analytics', method: 'track', params: {...} }
]);
```

### Agents (`src/agents/`)

| Agent                        | Função                       |
| ---------------------------- | ---------------------------- |
| `MaternalChatAgent`          | Chat principal (NathIA)      |
| `ContentRecommendationAgent` | Recomendações personalizadas |
| `HabitsAnalysisAgent`        | Análise de hábitos/streaks   |
| `EmotionAnalysisAgent`       | Análise emocional            |
| `SleepAnalysisAgent`         | Análise de sono              |
| `NathiaPersonalityAgent`     | Personalidade da NathIA      |
| `DesignQualityAgent`         | Validação de design          |

### MCP Servers (`src/mcp/servers/`)

| Server               | Função                    | Loading   |
| -------------------- | ------------------------- | --------- |
| `SupabaseMCPServer`  | Database + Auth + Storage | Essencial |
| `AnalyticsMCPServer` | Métricas e tracking       | Essencial |
| `OpenAIMCPServer`    | GPT fallback              | Lazy      |
| `AnthropicMCPServer` | Claude fallback           | Lazy      |

> **Nota:** GoogleAI MCP foi movido para Edge Function (`chat-gemini`)

---

## Architecture Overview

```
src/
├── screens/            # Telas (HomeScreen, ChatScreen, etc)
├── components/
│   └── primitives/     # Design System base (Box, Text, Button)
├── navigation/         # React Navigation 7
├── theme/
│   ├── tokens.ts       # Design tokens (cores, spacing, typography)
│   └── ThemeContext.tsx
├── services/           # Lógica de negócio (retornam { data, error })
├── agents/
│   ├── core/           # BaseAgent, AgentOrchestrator, MCPLoader
│   ├── helpers/        # llmRouter.ts
│   ├── maternal/       # MaternalChatAgent
│   └── ...             # Outros agentes especializados
├── mcp/
│   ├── servers/        # MCP server implementations
│   ├── dynamic/        # Dynamic MCP (Docker Gateway)
│   └── types/          # MCPMethod, MCPRequest, MCPResponse
├── ai/
│   ├── config/         # llmConfig.ts
│   ├── prompts/        # System prompts (nathia.system.md)
│   └── moderation/     # CrisisDetectionService
├── hooks/              # useTheme, useHaptics, etc
├── types/              # TypeScript definitions
└── utils/              # logger.ts, helpers
```

---

## Before Commit

```bash
npm run lint && npm run type-check && npm test
```

**Before Build/Deploy:**

```bash
npm run diagnose:production
```

**Conventional Commits (português):**

```bash
feat: adiciona funcionalidade X
fix: corrige crash ao abrir perfil
refactor: extrai lógica de autenticação
```

---

## Key Documentation

| Arquivo                                   | Conteúdo                                |
| ----------------------------------------- | --------------------------------------- |
| `CONTEXTO.md`                             | Estado atual, métricas, próximos passos |
| `docs/design/`                            | Design System (fonte única da verdade)  |
| `docs/PRODUCTION_READINESS_DIAGNOSTIC.md` | Guia do diagnóstico de produção         |
| `.claude/skill-rules.json`                | Auto-ativação de skills por contexto    |

---

## Claude Code Skills (Auto-Activation)

Skills são ativadas automaticamente baseado em arquivos editados e keywords:

| Trigger                    | Skills Ativadas                                    |
| -------------------------- | -------------------------------------------------- |
| `src/services/*.ts`        | typescript-strict, architecture, error-handling    |
| `src/components/*.tsx`     | react-native, design-tokens, accessibility         |
| `src/agents/*.ts`          | ai-architecture, error-handling, typescript-strict |
| `src/mcp/*.ts`             | mcp-architecture, typescript-strict                |
| Keywords: "fix", "bug"     | error-handling, debugging                          |
| Keywords: "feature", "add" | task-docs                                          |

**Config:** `.claude/skill-rules.json`

---

## Context Compression & State Management

### Personalização do Resumo de Compactação

Quando o contexto exceder o threshold (80k-100k tokens), o Claude Code pode usar compactação automática. Para personalizar o resumo:

#### 1. Instruções Permanentes no CLAUDE.md

Ao usar `/compact`, o Claude seguirá estas instruções:

**Foco do Resumo:**

- **Código:** Mudanças de código, arquivos modificados, novas funções
- **Testes:** Output de testes, cobertura, testes quebrados
- **Decisões:** Decisões arquiteturais, trade-offs, restrições técnicas
- **Estado:** Progresso atual, bloqueadores, próximos passos
- **Contexto de Domínio:** Preferências do usuário, padrões do projeto, regras críticas

**Estrutura do Resumo:**

```
<summary>
## Task Overview
[Solicitação principal, critérios de sucesso, restrições]

## Current State
[O que foi completado, arquivos modificados, artefatos produzidos]

## Important Discoveries
[Restrições técnicas, decisões tomadas, erros resolvidos, abordagens que falharam]

## Next Steps
[Ações específicas necessárias, bloqueadores, ordem de prioridade]

## Context to Preserve
[Preferências do usuário, detalhes específicos do domínio, compromissos assumidos]
</summary>
```

#### 2. Comando Direto com `/compact`

Você pode fornecer instruções específicas ao usar o comando:

```
/compact Focus on code samples and API usage
/compact Preserve test output and error messages
/compact Emphasize architectural decisions and trade-offs
```

#### 3. Configuração via SDK (Futuro)

Para integração programática (quando disponível):

```python
compaction_control = {
    "enabled": True,
    "context_token_threshold": 100000,
    "summary_prompt": """Summarize the research conducted so far, including:
- Sources consulted and key findings
- Questions answered and remaining unknowns
- Recommended next steps

Wrap your summary in <summary></summary> tags."""
}
```

### Gerenciamento de Estado para Tarefas Longas

Para tarefas que exigem múltiplas janelas de contexto, use arquivos de estado estruturados:

#### Arquivos de Estado Estruturados (JSON)

Use JSON para dados estruturados em `.claude/state/`:

```json
// .claude/state/tests.json
{
  "tests": [
    { "id": 1, "name": "authentication_flow", "status": "passing" },
    { "id": 2, "name": "user_management", "status": "failing" },
    { "id": 3, "name": "api_endpoints", "status": "not_started" }
  ],
  "total": 200,
  "passing": 150,
  "failing": 25,
  "not_started": 25
}
```

#### Notas de Progresso (Texto Livre)

Use texto não estruturado para notas gerais em `.claude/state/`:

```text
// .claude/state/progress.txt
Session 3 progress:
- Fixed authentication token validation
- Updated user model to handle edge cases
- Next: investigate user_management test failures (test #2)
- Note: Do not remove tests as this could lead to missing functionality
```

#### Git para Rastreamento de Estado

Git fornece um log do que foi feito e checkpoints que podem ser restaurados:

- Use commits frequentes para marcar progresso
- Use branches para experimentos
- Use tags para marcos importantes
- O Claude 4.5+ tem desempenho especialmente bom usando git para rastrear estado

### Recomendações de Uso

1. **Compactação Automática:**
   - Threshold: 80k-100k tokens
   - Personalize o prompt de resumo para focar no que é importante
   - Use `/compact` com instruções específicas quando necessário

2. **Gerenciamento de Estado:**
   - Mantenha arquivos de estado estruturados (JSON) para dados
   - Mantenha notas de progresso (texto) para contexto geral
   - Use git para rastreamento de mudanças e checkpoints

3. **Preservação de Contexto:**
   - Sempre preserve preferências do usuário
   - Sempre preserve decisões arquiteturais importantes
   - Sempre preserve bloqueadores e próximos passos

---

_Última atualização: 4 de dezembro de 2025_
