# 🗺️ Roadmap Priorizado - Nossa Maternidade

**Data:** 2025-11-29  
**Baseado em:** Revisão Completa do Projeto

---

## 🎯 VISÃO GERAL

Este roadmap prioriza ações baseado em:

1. **Bloqueadores críticos** (impedem app funcionar)
2. **Dependências** (o que precisa ser feito antes)
3. **Impacto** (o que traz mais valor)
4. **Esforço** (tempo necessário)

---

## 🔴 PRIORIDADE CRÍTICA (Fazer Primeiro)

### 1. Completar Configuração de Ambiente

**Status:** ⚠️ PARCIAL  
**Tempo:** 5 minutos  
**Bloqueador:** Sim - App não funciona sem .env completo

**Ações:**

- [ ] Adicionar `SUPABASE_URL` no .env
- [ ] Adicionar `SUPABASE_ANON_KEY` no .env
- [ ] Adicionar `GEMINI_API_KEY` no .env
- [ ] Validar: `npm run validate:env`

**Como obter:**

- Supabase: Dashboard → Settings → API
- Gemini: https://aistudio.google.com/app/apikey

---

### 2. Aplicar Schema Supabase

**Status:** ❌ NÃO FEITO  
**Tempo:** 10 minutos (manual)  
**Bloqueador:** Sim - App não funciona sem banco de dados

**Ações:**

- [ ] Acessar: https://app.supabase.com/project/bbcwitnbnosyfpfjtzkr/sql/new
- [ ] Copiar conteúdo de `supabase/schema.sql`
- [ ] Executar no SQL Editor
- [ ] Verificar criação de 13 tabelas

**Verificação:**

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_type = 'BASE TABLE';
```

---

### 3. Implementar Fase 1: Setup Base (Plano Arquitetural)

**Status:** ❌ NÃO INICIADO  
**Tempo:** 30 minutos  
**Bloqueador:** Não - Mas necessário para arquitetura moderna

**Ações:**

- [ ] Instalar dependências:
  ```bash
  npm install @tanstack/react-query zustand immer
  npm install --save-dev @tanstack/eslint-plugin-query
  ```
- [ ] Criar estrutura de pastas:
  ```bash
  mkdir -p src/store/slices src/store/middleware
  mkdir -p src/hooks/queries src/hooks/mutations src/hooks/realtime
  mkdir -p src/services/realtime src/services/offline
  ```
- [ ] Criar `src/contexts/QueryProvider.tsx`
- [ ] Integrar no `App.tsx`

**Dependências:** Nenhuma  
**Referência:** `.claude/plano-arquitetural-ios.md` (Fase 1)

---

## 🟠 PRIORIDADE ALTA (Essencial)

### 4. Implementar Fase 2: Zustand Store

**Status:** ❌ NÃO INICIADO  
**Tempo:** 1 hora  
**Dependências:** Fase 1 completa

**Ações:**

- [ ] Criar `src/store/index.ts` (root store)
- [ ] Criar `src/store/slices/authSlice.ts`
- [ ] Criar `src/store/slices/offlineSlice.ts`
- [ ] Criar `src/store/slices/profileSlice.ts`
- [ ] Configurar persistência com AsyncStorage

**Referência:** `.claude/plano-arquitetural-ios.md` (Fase 2)

---

### 5. Implementar Fase 3: React Query Hooks Base

**Status:** ❌ NÃO INICIADO  
**Tempo:** 1 hora  
**Dependências:** Fase 1 e 2 completas

**Ações:**

- [ ] Criar `src/hooks/queries/useProfileQuery.ts`
- [ ] Criar `src/hooks/queries/useChatQuery.ts`
- [ ] Criar `src/hooks/queries/useHabitsQuery.ts`
- [ ] Criar mutations correspondentes
- [ ] Integrar optimistic updates

**Referência:** `.claude/plano-arquitetural-ios.md` (Fase 3)

---

### 6. Corrigir Erros TypeScript Críticos

**Status:** ⚠️ 64 ERROS  
**Tempo:** 2-3 horas  
**Dependências:** Nenhuma (pode fazer em paralelo)

**Ações:**

- [ ] Executar: `npm run type-check > ts-errors.txt`
- [ ] Priorizar erros que quebram build
- [ ] Corrigir erros de tipos
- [ ] Validar: `npm run type-check` deve retornar 0 erros críticos

**Meta:** Reduzir de 64 para <10 erros

---

## 🟡 PRIORIDADE MÉDIA (Importante)

### 7. Implementar Fase 4: Real-time Estruturado

**Status:** ⚠️ BÁSICO EXISTE  
**Tempo:** 1.5 horas  
**Dependências:** Fase 3 completa

**Ações:**

- [ ] Criar `src/services/realtime/chatRealtime.ts`
- [ ] Criar `src/services/realtime/communityRealtime.ts`
- [ ] Criar `src/hooks/realtime/useChatRealtime.ts`
- [ ] Criar `src/hooks/realtime/useCommunityRealtime.ts`
- [ ] Refatorar `chatService.ts` e `communityService.ts` para usar novos services

**Referência:** `.claude/plano-arquitetural-ios.md` (Fase 4)

---

### 8. Implementar Fase 5: Offline-first

**Status:** ⚠️ NETWORKMONITOR EXISTE  
**Tempo:** 2 horas  
**Dependências:** Fase 2 completa

**Ações:**

- [ ] Criar `src/services/offline/queueManager.ts`
- [ ] Criar `src/services/offline/syncManager.ts`
- [ ] Criar `src/services/offline/conflictResolver.ts`
- [ ] Integrar queue manager com mutations
- [ ] Testar offline/online scenarios

**Referência:** `.claude/plano-arquitetural-ios.md` (Fase 5)

---

### 9. Implementar Testes Básicos

**Status:** ❌ 0% COBERTURA  
**Tempo:** 4-6 horas  
**Dependências:** Nenhuma (pode fazer em paralelo)

**Ações:**

- [ ] Testes unitários para `authService.ts`
- [ ] Testes unitários para `profileService.ts`
- [ ] Testes unitários para `chatService.ts`
- [ ] Testes de componentes: `HomeScreen`, `ChatScreen`
- [ ] Meta: 40% cobertura mínima

**Estratégia:**

- Começar com services (mais fácil de testar)
- Depois componentes críticos
- Por último integração

---

## 🟢 PRIORIDADE BAIXA (Nice to Have)

### 10. Reestruturar Migrations

**Status:** ⚠️ PARCIAL  
**Tempo:** 1 hora  
**Dependências:** Nenhuma

**Ações:**

- [ ] Organizar migrations incrementais:
  - `00000000000000_initial_schema.sql`
  - `00000000000001_add_rls_policies.sql`
  - `00000000000002_add_indexes.sql`
  - etc.
- [ ] Adicionar versioning
- [ ] Documentar processo de rollback

---

### 11. Documentos Legais para Stores

**Status:** ⚠️ TELAS EXISTEM  
**Tempo:** 2-3 horas  
**Dependências:** Nenhuma

**Ações:**

- [ ] Publicar Privacy Policy em URL pública
- [ ] Publicar Terms of Service em URL pública
- [ ] Adicionar Disclaimer Médico no app
- [ ] Atualizar links nas telas correspondentes

**Nota:** Bloqueador para deploy nas lojas, mas não para desenvolvimento

---

## 📊 CRONOGRAMA SUGERIDO

### Semana 1: Bloqueadores + Base Arquitetural

- **Dia 1:** Completar .env + Aplicar schema (15 min)
- **Dia 1:** Fase 1 do plano arquitetural (30 min)
- **Dia 2-3:** Fase 2 - Zustand Store (1h)
- **Dia 3-4:** Fase 3 - React Query Hooks (1h)
- **Dia 5:** Corrigir erros TypeScript críticos (2-3h)

**Total Semana 1:** ~6 horas

### Semana 2: Arquitetura Avançada + Qualidade

- **Dia 1-2:** Fase 4 - Real-time (1.5h)
- **Dia 2-3:** Fase 5 - Offline-first (2h)
- **Dia 3-5:** Testes básicos (4-6h)

**Total Semana 2:** ~8 horas

### Semana 3: Polish + Preparação Lançamento

- **Dia 1:** Reestruturar migrations (1h)
- **Dia 2-3:** Documentos legais (2-3h)
- **Dia 4-5:** Builds de teste + Correções

**Total Semana 3:** ~6 horas

---

## 🎯 MARCOS (MILESTONES)

### Marco 1: App Funcional Localmente ✅

**Quando:** Após ações 1-2 (15 min)  
**Critério:** App consegue fazer login e carregar dados do Supabase

### Marco 2: Arquitetura Base Implementada ✅

**Quando:** Após ações 1-3 (45 min)  
**Critério:** React Query + Zustand instalados e QueryProvider funcionando

### Marco 3: Arquitetura Completa ✅

**Quando:** Após ações 1-8 (8-9 horas)  
**Critério:** Offline-first + Real-time funcionando

### Marco 4: Pronto para Testes ✅

**Quando:** Após ação 9 (12-15 horas)  
**Critério:** 40%+ cobertura de testes

### Marco 5: Pronto para Lançamento ✅

**Quando:** Após todas as ações (20-25 horas)  
**Critério:** Builds funcionando + Documentos legais + Testes passando

---

## 📝 NOTAS IMPORTANTES

### Dependências Críticas

- **Fase 2 depende de Fase 1** (Zustand precisa de estrutura)
- **Fase 3 depende de Fase 1 e 2** (React Query precisa de Zustand para offline)
- **Fase 4 depende de Fase 3** (Real-time precisa de hooks React Query)
- **Fase 5 depende de Fase 2** (Offline precisa de Zustand store)

### Pode Fazer em Paralelo

- Corrigir erros TypeScript (ação 6)
- Implementar testes (ação 9)
- Documentos legais (ação 11)

### Bloqueadores para Deploy

- Ações 1-2 (críticas para app funcionar)
- Ação 11 (documentos legais - requerido pelas stores)
- Ação 9 (testes - recomendado, mas não obrigatório)

---

**Última atualização:** 2025-11-29
