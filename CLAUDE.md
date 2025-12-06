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
| Verificar autônomo   | `npm run verify:autonomous`          |

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

### Scripts NPM - Exemplos Práticos

**Desenvolvimento Diário:**
```bash
npm start                          # Metro bundler + Expo
npx expo start -c                  # Clear cache (quando há problemas)
npm run ios                        # iOS Simulator
npm run android                    # Android Emulator
```

**Qualidade de Código:**
```bash
npm run validate                   # Validação completa (type-check + lint + design + env)
npm run type-check                 # Apenas TypeScript
npm run lint                       # Apenas ESLint
npm run lint:fix                   # ESLint auto-fix
npm run validate:design            # Apenas design tokens
```

**Build e Deploy:**
```bash
npm run diagnose:production        # Relatório completo de prontidão para produção
npm run build:dev                  # EAS build (development profile)
npm run build:android              # Android APK/AAB (produção)
npm run build:ios                  # iOS IPA (produção)
npm run build:production           # Ambas plataformas (produção)
npm run validate:android           # Verifica config Android antes do build
```

**Utilitários:**
```bash
npm run verify:cursor              # Verifica config Cursor
npm run verify:autonomous          # Verifica modo autônomo
npm run validate:env               # Verifica .env
npm run test:connection            # Testa conexões Supabase
npm run test:gemini-edge           # Testa Gemini edge function
npm run deploy:gemini              # Deploy Gemini edge function
```

---

## ⚠️ Mobile-Only Platform

**CRÍTICO:** Este é um projeto React Native (iOS/Android), **NÃO web**.

### O que usar:
- ✅ Componentes React Native nativos (View, Text, TouchableOpacity, FlatList)
- ✅ `expo-image` para imagens (não `<img>`)
- ✅ `expo-router` ou React Navigation para navegação (não react-router)
- ✅ `StyleSheet.create` ou NativeWind para estilos
- ✅ `onPress` para eventos de toque (não `onClick`)

### O que NUNCA usar:
- ❌ Tags HTML (`div`, `span`, `button`, `img`, `a`)
- ❌ Eventos web (`onClick`, `onSubmit`, `onChange` direto)
- ❌ CSS classes sem NativeWind
- ❌ `window`, `document`, ou outras APIs web

**Lembre-se:** Se você ver código com `div` ou `onClick`, está errado para este projeto.

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

### Hybrid Component Pattern

Alguns componentes suportam dois modos de estilização (migração gradual):

```typescript
// Modo 1: className + textClassName (PREFERIDO - NativeWind v4)
<Button
  title="Clique aqui"
  onPress={handlePress}
  className="bg-primary rounded-xl px-6 py-3"
  textClassName="text-white font-bold text-lg"
/>

// Modo 2: Props semânticas (LEGADO - compatibilidade)
<Button
  title="Clique aqui"
  onPress={handlePress}
  variant="primary"
  size="lg"
/>

// Prioridade: className > Props
// Se ambos fornecidos, className vence
<Button
  title="Híbrido"
  onPress={handlePress}
  className="bg-success"  // ← Este será usado
  variant="primary"        // ← Ignorado para estilos
/>
```

**Componentes híbridos:**
- [Button.tsx](src/components/atoms/Button.tsx) - Suporta ambos os modos
- [Text.tsx](src/components/atoms/Text.tsx) - className ou variant/size
- Outros componentes atoms migrados gradualmente

**Quando usar cada modo:**
- **className:** Novo código, flexibilidade total, Tailwind completo
- **Props:** Código legado, compatibilidade, refatoração gradual

**Testes:** Todos componentes híbridos têm `*.hybrid.test.tsx` testando ambos os modos.

### Error Handling Pattern

**Services** retornam `{ data, error }` para tratamento consistente:

```typescript
// ✅ CORRETO: Service com error handling
async function getProfile(userId: string) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select()
      .eq('id', userId)
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    logger.error('getProfile failed', error);
    return { data: null, error: error as Error };
  }
}

// No componente/screen
const { data, error } = await profileService.getProfile(userId);
if (error) {
  logger.error('Failed to load profile', error);
  // Mostrar erro ao usuário
  return;
}
// usar data...
```

**Components:** Use ErrorBoundary para erros React:

```typescript
// App.tsx
<ErrorBoundary>
  <YourApp />
</ErrorBoundary>
```

**Logging centralizado:**

```typescript
import { logger } from '@/utils/logger';

logger.debug('Dev only info');           // Dev only
logger.info('User action', { userId });  // Info geral
logger.warn('Problema menor', error);    // → Sentry
logger.error('Falha crítica', error);    // → Sentry
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

## Testing

### Estrutura de Testes

```
__tests__/
├── components/
│   ├── Button.hybrid.test.tsx    # Testes híbridos (ambos os modos)
│   └── Text.hybrid.test.tsx
└── helpers/
    ├── testWrapper.tsx           # Provider wrapper para testes
    └── supabase.mock.ts         # Mocks do Supabase
```

### Comandos de Teste

```bash
# Rodar todos os testes
npm test

# Modo watch (desenvolvimento)
npm run test:watch

# Coverage report
npm run test:coverage

# Teste específico
npx jest __tests__/components/Button.hybrid.test.tsx

# CI mode (usado em GitHub Actions)
npm run test:ci

# Dev mode (sem coverage threshold)
npm run test:dev
```

### Padrão de Teste

**Híbridos:** `*.hybrid.test.tsx` para componentes que suportam className + props semânticas

```typescript
import { render, fireEvent } from '@testing-library/react-native';
import { Button } from '@/components/atoms/Button';
import { TestWrapper } from '../helpers/testWrapper';

const renderWithTheme = (component: React.ReactElement) => {
  return render(component, { wrapper: TestWrapper });
};

describe('Button - Hybrid Pattern', () => {
  it('deve aplicar className quando fornecido', () => {
    const { getByTestId } = renderWithTheme(
      <Button
        testID="button"
        title="Clique"
        onPress={() => {}}
        className="bg-primary rounded-xl px-6"
      />
    );

    expect(getByTestId('button').props.className).toBe('bg-primary rounded-xl px-6');
  });

  it('deve aplicar variant quando className não fornecido', () => {
    const { getByTestId } = renderWithTheme(
      <Button
        testID="button"
        title="Clique"
        onPress={() => {}}
        variant="primary"
      />
    );

    expect(getByTestId('button').props['data-variant']).toBe('primary');
  });
});
```

**TestWrapper:** Sempre usar para testes que precisam de tema:

```typescript
import { TestWrapper } from '../helpers/testWrapper';

// Wrapper fornece ThemeContext mockado
const { getByText } = render(<MyComponent />, { wrapper: TestWrapper });
```

**Mocks obrigatórios:**
- Supabase: `__tests__/helpers/supabase.mock.ts`
- AsyncStorage: Mockado automaticamente pelo Jest
- APIs externas: Sempre mockar (não fazer chamadas reais)

**Coverage mínimo:**
- MVP: 40%
- Phase 2: 60%
- Produção: 80%

---

## Pre-commit Validation

O projeto usa **Husky** para validação automática antes de commit.

**Verificações automáticas:**
1. Design tokens: `npm run validate:design`
2. TypeScript: `npm run type-check`
3. ESLint: `npm run lint`

**Setup dos hooks:**
```bash
npm run setup:hooks  # Configura hooks Git (executado automaticamente no npm install)
```

**Bypass (use com cuidado):**
```bash
git commit --no-verify -m "WIP: teste rápido"
```

**⚠️ Importante:** Sempre deixe hooks ativos. Eles previnem erros antes de ir pro repositório.

---

## Before Commit

**Validação completa (recomendado):**
```bash
npm run validate  # type-check + lint + design + env
```

**Validação mínima:**
```bash
npm run lint && npm run type-check && npm test
```

**Before Build/Deploy:**
```bash
npm run diagnose:production  # Relatório completo de prontidão
```

**Conventional Commits (português):**
```bash
feat: adiciona funcionalidade X
fix: corrige crash ao abrir perfil
refactor: extrai lógica de autenticação
test: adiciona testes para Button
docs: atualiza CLAUDE.md
```

---

## Key Documentation

| Arquivo                                   | Conteúdo                                     |
| ----------------------------------------- | -------------------------------------------- |
| `CONTEXTO.md`                             | Estado atual, métricas, próximos passos      |
| `README.md`                               | Visão geral, setup, estrutura do projeto     |
| `docs/HYBRID_PATTERN.md`                  | Padrão híbrido de componentes                |
| `docs/HYBRID_MIGRATION_STATUS.md`         | Status da migração para padrão híbrido       |
| `docs/design/`                            | Design System (fonte única da verdade)       |
| `docs/PRODUCTION_READINESS_DIAGNOSTIC.md` | Guia do diagnóstico de produção              |
| `.claude/skill-rules.json`                | Auto-ativação de skills por contexto         |
| `.claude/autonomous-prompts.md`           | Prompts prontos para modo autônomo 2h        |
| `.claude/QUICK_START_AUTONOMOUS.md`       | Quick start modo autônomo (2 min)            |
| `docs/CURSOR_AUTONOMOUS_MODE.md`          | Guia completo modo autônomo                  |
| `__tests__/helpers/testWrapper.tsx`       | Helper para testes com ThemeContext mockado  |
| `__tests__/helpers/supabase.mock.ts`      | Mocks do Supabase para testes                |

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

## Common Pitfalls (Armadilhas Comuns)

### 1. Usar HTML tags em vez de React Native

❌ **ERRADO:**
```typescript
<div className="container">
  <p onClick={handleClick}>Texto</p>
</div>
```

✅ **CORRETO:**
```typescript
<View className="container">
  <Text onPress={handleClick}>Texto</Text>
</View>
```

### 2. Esquecer TestWrapper em testes

❌ **ERRADO:**
```typescript
render(<Button title="Test" onPress={() => {}} />);
// Erro: ThemeContext não disponível
```

✅ **CORRETO:**
```typescript
render(<Button title="Test" onPress={() => {}} />, { wrapper: TestWrapper });
```

### 3. Usar console.log em vez de logger

❌ **ERRADO:**
```typescript
console.log('User logged in', userId);
```

✅ **CORRETO:**
```typescript
logger.info('User logged in', { userId });
```

### 4. Cores hardcoded em vez de tokens

❌ **ERRADO:**
```typescript
<View style={{ backgroundColor: '#FFFFFF' }}>
```

✅ **CORRETO:**
```typescript
const colors = useThemeColors();
<View style={{ backgroundColor: colors.background.canvas }}>
```

### 5. ScrollView com map em vez de FlatList

❌ **ERRADO:**
```typescript
<ScrollView>
  {items.map(item => <Item key={item.id} {...item} />)}
</ScrollView>
```

✅ **CORRETO:**
```typescript
<FlatList
  data={items}
  renderItem={({ item }) => <Item {...item} />}
  keyExtractor={(item) => item.id}
/>
```

### 6. Services sem error handling

❌ **ERRADO:**
```typescript
async function getProfile(userId: string) {
  const data = await supabase.from('profiles').select().eq('id', userId).single();
  return data; // E se der erro?
}
```

✅ **CORRETO:**
```typescript
async function getProfile(userId: string) {
  try {
    const { data, error } = await supabase.from('profiles').select().eq('id', userId).single();
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    logger.error('getProfile failed', error);
    return { data: null, error: error as Error };
  }
}
```

### 7. Esquecer acessibilidade

❌ **ERRADO:**
```typescript
<TouchableOpacity onPress={handlePress}>
  <Text>Botão</Text>
</TouchableOpacity>
```

✅ **CORRETO:**
```typescript
<TouchableOpacity
  onPress={handlePress}
  accessibilityLabel="Botão de ação principal"
  accessibilityRole="button"
  accessibilityHint="Clique para continuar"
>
  <Text>Botão</Text>
</TouchableOpacity>
```

### 8. Touch targets muito pequenos

❌ **ERRADO:**
```typescript
<TouchableOpacity style={{ width: 20, height: 20 }}>
  <Icon name="close" size={16} />
</TouchableOpacity>
```

✅ **CORRETO:**
```typescript
<TouchableOpacity
  style={{ width: 44, height: 44, justifyContent: 'center', alignItems: 'center' }}
  accessibilityLabel="Fechar"
>
  <Icon name="close" size={16} />
</TouchableOpacity>
```

---

_Última atualização: 5 de dezembro de 2025_
