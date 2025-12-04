# 🎯 Plano de Correção de Qualidade - Nossa Maternidade

**Data:** 2025-01-27  
**Status:** 🟢 Ativo  
**Objetivo:** Alcançar qualidade de código profissional (TypeScript strict, ESLint clean, 80%+ test coverage)

---

## 📊 Estado Atual

| Métrica                 | Atual     | Meta Sprint 1 | Meta Final |
| ----------------------- | --------- | ------------- | ---------- |
| TypeScript errors       | ✅ 0      | 0             | 0          |
| TypeScript `any` types  | 🟡 ~300   | <50           | <10        |
| ESLint warnings         | 🟡 484    | <50           | <10        |
| ESLint errors           | ✅ 0      | 0             | 0          |
| Console.log em produção | 🟡 ~40-63 | 0             | 0          |
| Test coverage           | ❌ 0%     | 40%           | 80%+       |
| Variáveis não usadas    | 🟡 ~50-70 | <10           | 0          |

---

## 🎯 Fases de Correção

### ✅ Fase 0: Preparação (COMPLETO)

- [x] Verificar estado atual
- [x] Identificar bloqueadores
- [x] Configurar MCPs e agentes
- [x] Criar plano de ação

---

### 🔥 Fase 1: Limpeza Rápida (4-6 horas) - PRIORIDADE CRÍTICA

#### 1.1 Remover console.log (30min)

**Arquivos afetados:**

- `src/agents/core/AgentOrchestrator.ts` (5 console.log)
- `src/utils/supabaseSecureStorage.ts` (4 console.log)
- `src/services/secureStorage.ts` (3 console.log)
- `src/utils/logger.ts` (2 console.log irônico)
- ~30 outros arquivos

**Ação:**

1. Executar script de busca: `grep -r "console.log" src/`
2. Substituir por `logger.debug()` ou remover
3. Validar: `npm run lint` não deve reportar console.log

**Agente responsável:** `DesignQualityAgent`
**MCP necessário:** `code-quality`

---

#### 1.2 Limpar Variáveis Não Usadas (1-2h)

**Problema:** ~50-70 variáveis/parâmetros não utilizados

**Ação:**

1. Executar ESLint auto-fix: `npm run lint -- --fix`
2. Prefixar imports/variáveis não usadas com `_` (ex: `_AgentContext`)
3. Remover parâmetros não usados ou prefixar com `_`

**Padrão a seguir:**

```typescript
// ❌ ERRADO
import { AgentContext } from './types';
function doSomething(options: Options) {}

// ✅ CORRETO
import { AgentContext as _AgentContext } from './types'; // Se realmente não usado
function doSomething(_options: Options) {} // Se não usado agora, mas pode ser no futuro
```

**Agente responsável:** `DesignQualityAgent`
**MCP necessário:** `code-quality`

---

#### 1.3 Corrigir `let` → `const` (15min)

**Problema:** ~10 casos onde `let` pode ser `const`

**Ação:**

1. Buscar padrões: `let filteredContent` → `const filteredContent`
2. Validar que não há reatribuição
3. Substituir onde aplicável

**Agente responsável:** `DesignQualityAgent`
**MCP necessário:** `code-quality`

---

### 🔧 Fase 2: Tipagem TypeScript (12-16 horas) - PRIORIDADE ALTA

#### 2.1 Tipar Services Críticos (3-4h)

**Arquivos prioritários:**

1. `src/services/userDataService.ts` (16 `any` types)
2. `src/services/authService.ts` (verificar tipos)
3. `src/services/chatService.ts` (verificar tipos)
4. `src/services/sessionManager.ts` (verificar tipos)

**Ação:**

1. Analisar cada service
2. Criar interfaces TypeScript apropriadas
3. Substituir `any` por tipos específicos
4. Adicionar type guards onde necessário

**Exemplo:**

```typescript
// ❌ ANTES
function saveUserData(data: any): any {
  // ...
}

// ✅ DEPOIS
interface UserData {
  id: string;
  profile: UserProfile;
  preferences: UserPreferences;
}

function saveUserData(data: UserData): Promise<UserData> {
  // ...
}
```

**Agente responsável:** `DesignQualityAgent`
**MCP necessário:** `code-quality`

---

#### 2.2 Tipar Agents Core (4-5h)

**Arquivos prioritários:**

1. `src/agents/core/AgentOrchestrator.ts` (14 `any` types)
2. `src/agents/core/BaseAgent.ts` (9 `any` types)
3. `src/agents/core/MCPLoader.ts` (verificar tipos)

**Ação:**

1. Definir interfaces genéricas para AgentContext
2. Tipar corretamente todas as operações do orchestrator
3. Adicionar type guards para validação

**Agente responsável:** `DesignQualityAgent`
**MCP necessário:** `code-quality`

---

#### 2.3 Tipar Agents Especializados (3-4h)

**Arquivos prioritários:**

1. `src/agents/nathia/NathiaPersonalityAgent.ts` (12 `any` types)
2. `src/agents/emotion/EmotionAnalysisAgent.ts` (12 `any` types)
3. `src/agents/maternal/MaternalChatAgent.ts` (11 `any` types)
4. `src/agents/sleep/SleepAnalysisAgent.ts` (8 `any` types)
5. `src/agents/content/ContentRecommendationAgent.ts` (7 `any` types)

**Ação:**

1. Tipar inputs/outputs de cada agente
2. Definir interfaces para agent-specific types
3. Validar tipos em runtime quando necessário

**Agente responsável:** Cada agente específico + `DesignQualityAgent`
**MCP necessário:** `code-quality`

---

#### 2.4 Tipar Types Globais (2-3h)

**Arquivos prioritários:**

1. `src/types/onboarding.ts` (5 `any` types)
2. `src/types/content.ts` (2 `any` types)
3. Outros arquivos em `src/types/`

**Ação:**

1. Revisar todas as interfaces em `src/types/`
2. Remover `any` e definir tipos específicos
3. Usar unions, generics, e type guards apropriadamente

**Agente responsável:** `DesignQualityAgent`
**MCP necessário:** `code-quality`

---

### 🧪 Fase 3: Testes Básicos (8-10 horas) - PRIORIDADE MÉDIA

#### 3.1 Setup Test Infrastructure (1h)

**Ação:**

1. Verificar `jest.config.js` está configurado corretamente
2. Verificar `jest.setup.js` tem mocks necessários
3. Criar mocks para Supabase, Gemini API, etc.
4. Validar: `npm test` roda sem erros

**Agente responsável:** `DesignQualityAgent`
**MCP necessário:** `code-quality`

---

#### 3.2 Testes para Services Críticos (3-4h)

**Arquivos a testar:**

1. `src/services/authService.ts` (já tem `__tests__/services/authService.test.ts`)
2. `src/services/chatService.ts` (já tem `__tests__/services/chatService.test.ts`)
3. `src/services/sessionManager.ts` (já tem `__tests__/services/sessionManager.test.ts`)
4. `src/services/userDataService.ts` (criar testes)

**Ação:**

1. Expandir testes existentes para 80%+ coverage
2. Adicionar testes para edge cases
3. Testar error handling
4. Validar: `npm test -- --coverage` mostra 40%+ coverage

**Agente responsável:** `DesignQualityAgent`
**MCP necessário:** `code-quality`

---

#### 3.3 Testes para Components Primitivos (2-3h)

**Arquivos a testar:**

1. `src/components/primitives/Button.tsx`
2. `src/components/primitives/Text.tsx`
3. `src/components/primitives/Box.tsx`

**Ação:**

1. Criar testes para cada componente primitivo
2. Testar props, accessibility, styling
3. Validar comportamento em dark mode

**Agente responsável:** `DesignQualityAgent`
**MCP necessário:** `accessibility`, `mobile-optimization`

---

#### 3.4 Testes para Agents (2-3h)

**Arquivos a testar:**

1. `src/agents/core/BaseAgent.ts`
2. `src/agents/core/AgentOrchestrator.ts`
3. Um agente especializado como exemplo (ex: `MaternalChatAgent`)

**Ação:**

1. Mock MCP servers
2. Testar initialization, error handling
3. Testar tool execution

**Agente responsável:** `DesignQualityAgent`
**MCP necessário:** `code-quality`

---

### ✨ Fase 4: Refinamento Final (4-6 horas) - PRIORIDADE BAIXA

#### 4.1 Design System Validation (2h)

**Ação:**

1. Validar todos os componentes usam `src/theme/tokens.ts`
2. Remover imports de `src/design-system/` (sistema legado)
3. Validar: `npm run validate:design` retorna 0 violations

**Agente responsável:** `DesignQualityAgent`
**MCP necessário:** `design-tokens`, `accessibility`

---

#### 4.2 Accessibility Audit (1-2h)

**Ação:**

1. Validar todos os componentes têm `accessibilityLabel`
2. Validar touch targets >= 44pt (iOS) / 48dp (Android)
3. Validar contraste WCAG AAA (7:1 para text, 4.5:1 para large text)
4. Validar: `npm run validate:a11y` passa

**Agente responsável:** `DesignQualityAgent`
**MCP necessário:** `accessibility`

---

#### 4.3 Mobile Optimization Check (1-2h)

**Ação:**

1. Validar FlatList com `getItemLayout` quando possível
2. Validar images otimizadas (WebP, lazy loading)
3. Validar memo() em componentes pesados
4. Validar: `npm run validate:mobile` passa

**Agente responsável:** `DesignQualityAgent`
**MCP necessário:** `mobile-optimization`

---

## 🤖 Agentes e MCPs Necessários

### Agentes Ativos

✅ **Já configurados e ativos:**

- `DesignQualityAgent` - Principal para validação de qualidade
- `MaternalChatAgent` - Chat principal
- `ContentRecommendationAgent` - Recomendações
- `HabitsAnalysisAgent` - Análise de hábitos
- `EmotionAnalysisAgent` - Análise emocional
- `NathiaPersonalityAgent` - Personalidade NathIA
- `SleepAnalysisAgent` - Análise de sono

### MCPs Necessários

✅ **Já configurados em `mcp.json`:**

- `code-quality` - Validação de qualidade de código
- `design-tokens` - Validação de design tokens
- `accessibility` - Auditoria WCAG AAA
- `mobile-optimization` - Otimização mobile
- `prompt-testing` - Teste de prompts IA

⚠️ **Verificar se estão funcionando:**

- Executar `npm run validate:design`
- Executar `npm run validate:a11y`
- Executar `npm run validate:mobile`

---

## 📋 Checklist de Execução

### Sprint 1 - Semana 1 (20-24h)

- [ ] Fase 1.1: Remover console.log (30min)
- [ ] Fase 1.2: Limpar variáveis não usadas (1-2h)
- [ ] Fase 1.3: Corrigir `let` → `const` (15min)
- [ ] Fase 2.1: Tipar services críticos (3-4h)
- [ ] Fase 2.2: Tipar agents core (4-5h)
- [ ] Fase 3.1: Setup test infrastructure (1h)
- [ ] Fase 3.2: Testes para services (3-4h)

### Sprint 2 - Semana 2 (16-20h)

- [ ] Fase 2.3: Tipar agents especializados (3-4h)
- [ ] Fase 2.4: Tipar types globais (2-3h)
- [ ] Fase 3.3: Testes para components (2-3h)
- [ ] Fase 3.4: Testes para agents (2-3h)
- [ ] Fase 4.1: Design System validation (2h)
- [ ] Fase 4.2: Accessibility audit (1-2h)
- [ ] Fase 4.3: Mobile optimization check (1-2h)

---

## 🎯 Critérios de Sucesso

### Fase 1 Completa

- ✅ Zero `console.log` em produção
- ✅ Variáveis não usadas < 10
- ✅ Zero `let` que pode ser `const`

### Fase 2 Completa

- ✅ Types `any` < 50 (Sprint 1)
- ✅ Types `any` < 10 (Sprint 2)
- ✅ TypeScript strict mode sem erros

### Fase 3 Completa

- ✅ Test coverage 40%+ (Sprint 1)
- ✅ Test coverage 60%+ (Sprint 2)
- ✅ Todos os services críticos testados

### Fase 4 Completa

- ✅ Design tokens 100% validados
- ✅ Accessibility WCAG AAA 100%
- ✅ Mobile optimization checks passando

### Meta Final

- ✅ TypeScript: 0 errors, <10 `any` types
- ✅ ESLint: 0 errors, <10 warnings
- ✅ Test coverage: 80%+
- ✅ Design system: 100% validado
- ✅ Accessibility: WCAG AAA compliant
- ✅ Mobile: Otimizado para performance

---

## 🔧 Comandos de Validação

```bash
# TypeScript
npm run type-check

# ESLint
npm run lint
npm run lint -- --fix  # Auto-fix

# Testes
npm test
npm test -- --coverage

# Design Tokens
npm run validate:design

# Accessibility
npm run validate:a11y

# Mobile Optimization
npm run validate:mobile

# Tudo junto
npm run validate:all
```

---

## 📝 Notas Importantes

1. **Prioridade:** Fase 1 → Fase 2 → Fase 3 → Fase 4
2. **Incremental:** Não precisa esperar uma fase terminar para começar a próxima
3. **Validação contínua:** Rodar `npm run validate:all` após cada mudança significativa
4. **Commits pequenos:** Fazer commits frequentes com mensagens descritivas
5. **Testes primeiro:** Quando possível, escrever testes antes de refatorar (TDD)

---

## 🚀 Próximos Passos Imediatos

1. ✅ Criar este plano
2. 🔄 Verificar MCPs estão funcionando
3. 🔄 Ativar agentes necessários
4. ▶️ Começar Fase 1.1: Remover console.log

---

**Última atualização:** 2025-01-27  
**Responsável:** Sistema de Agentes + DesignQualityAgent  
**Status:** 🟢 Ativo e Pronto para Execução
