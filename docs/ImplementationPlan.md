# Plano de Implementação: Documento Definitivo Final

**Referência:** [docs/Docfinal.md](docs/Docfinal.md)

---

## Fase 1: Segurança + Plataforma (CRÍTICO)

### Tema 1.1: Gemini Edge Function (Seção 5.1)

**Problema:** API Key do Gemini exposta no bundle via `EXPO_PUBLIC_GEMINI_API_KEY` (visível no APK/IPA).

- [ ] Criar Edge Function `supabase/functions/chat-gemini/index.ts` (novo arquivo) - implementar proxy para Gemini API conforme seção 5.1 do Docfinal.md
- [ ] Configurar secret no Supabase: `npx supabase secrets set GEMINI_API_KEY=xxx` (comando)
- [ ] Deploy da Edge Function: `npx supabase functions deploy chat-gemini` (comando)
- [ ] Criar service `src/services/geminiService.ts` (refatorar) - substituir chamada direta por `supabase.functions.invoke('chat-gemini')`
- [ ] Atualizar `src/mcp/servers/GoogleAIMCPServer.ts` (refatorar) - remover uso de `EXPO_PUBLIC_GEMINI_API_KEY`
- [ ] Atualizar `src/core/ai/providers/gemini.ts` (refatorar) - remover uso de `EXPO_PUBLIC_GEMINI_API_KEY`
- [ ] Atualizar `src/ai/llmConfig.ts` (refatorar) - remover verificação de `EXPO_PUBLIC_GEMINI_API_KEY`
- [ ] Remover `EXPO_PUBLIC_GEMINI_API_KEY` de `env.template` (editar) - manter apenas comentário explicando uso em Edge Functions
- [ ] Testar Edge Function localmente: `npx supabase functions serve chat-gemini` (comando)
- [ ] Validar que bundle não contém mais a API key (verificar build)

### Tema 1.2: RLS Supabase (Seção 5.2)

**Problema:** Tabelas sem Row Level Security habilitado, permitindo acesso indevido a dados.

- [ ] Criar migration `supabase/migrations/002_rls_policies.sql` (novo arquivo) - implementar RLS conforme seção 5.2 do Docfinal.md
- [ ] Habilitar RLS em `profiles`, `diary_entries`, `habit_entries`, `check_ins`, `chat_sessions`, `chat_messages`, `user_consents` (SQL)
- [ ] Criar policies SELECT/UPDATE/INSERT para cada tabela usando `auth.uid() = user_id` (SQL)
- [ ] Criar policy para `content` (SELECT público para autenticados, INSERT/UPDATE apenas admin) (SQL)
- [ ] Aplicar migration: `npx supabase db push` (comando)
- [ ] Verificar RLS ativo: `SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public'` (SQL)
- [ ] Testar acesso: tentar ler dados de outro usuário (deve falhar) (teste manual)

### Tema 1.3: Privacy Policy (Bug #6, Seção 3)

**Problema:** `openPrivacyPolicy()` vazio em `ConsentScreen.tsx`, causando rejeição nas stores.

- [ ] Verificar se `src/screens/PrivacyPolicyScreen.tsx` existe (verificar)
- [ ] Implementar navegação em `src/features/consent/ConsentScreen.tsx` (editar) - função `openPrivacyPolicy()` navegar para `PrivacyPolicyScreen`
- [ ] Testar navegação do botão "Política de Privacidade" (teste manual)

### Tema 1.4: Android 16 Edge-to-Edge + SafeArea (Seção 4.1)

**Problema:** `SafeAreaView` do React Native deprecated no Android 16, app deve usar edge-to-edge.

- [ ] Verificar se `react-native-safe-area-context` está instalado: `npm list react-native-safe-area-context` (comando)
- [ ] Instalar se necessário: `npx expo install react-native-safe-area-context` (comando)
- [ ] Verificar `App.tsx` já usa `SafeAreaProvider` (verificar) - já está correto
- [ ] Verificar `src/components/layout/SafeAreaContainer.tsx` já usa `react-native-safe-area-context` (verificar) - já está correto
- [ ] Buscar usos de `SafeAreaView` do `react-native`: `grep -r "from 'react-native'" | grep SafeAreaView` (comando)
- [ ] Substituir todos os imports de `SafeAreaView` do `react-native` por `react-native-safe-area-context` (refatorar múltiplos arquivos)
- [ ] Configurar `android/gradle.properties` (editar ou criar) - adicionar `edgeToEdgeEnabled=true`
- [ ] Testar em dispositivo Android 16 (ou emulador) com notch e sem notch (teste manual)

### Tema 1.5: TextDecoder Polyfill (Seção 4.2)

**Problema:** Supabase precisa de `TextDecoder`/`TextEncoder` que não existe no Hermes por padrão.

- [ ] Instalar dependências: `npm install text-encoding react-native-get-random-values` (comando)
- [ ] Criar `src/polyfills.ts` (novo arquivo) - implementar polyfills conforme seção 4.2 do Docfinal.md
- [ ] Importar polyfills em `index.ts` (editar) - adicionar `import './src/polyfills'` como PRIMEIRA linha
- [ ] Configurar Jest: atualizar `jest.setup.js` (editar) - adicionar polyfills de `util` para testes
- [ ] Testar login Supabase (deve funcionar sem erro de TextDecoder) (teste manual)

---

## Fase 2: Lógica de Negócio + UX (IMPORTANTE)

### Tema 2.1: Analytics Não Bloqueia Chat (Bug #1, Seção 3)

**Problema:** Se analytics falhar, chat inteiro para, mesmo com resposta válida da IA.

- [ ] Ler `src/agents/maternal/MaternalChatAgent.ts` linhas 151-158 (ler)
- [ ] Criar método `trackEventSafely()` em `MaternalChatAgent.ts` (editar) - envolver analytics em try/catch com fire-and-forget
- [ ] Substituir `await this.callMCP('analytics', ...)` por `this.trackEventSafely(...)` em `startSession()` (editar)
- [ ] Substituir analytics em `process()` método (editar) - usar `trackEventSafely()` após resposta da IA
- [ ] Aplicar mesmo padrão em `src/agents/content/ContentRecommendationAgent.ts` (editar)
- [ ] Aplicar mesmo padrão em `src/agents/habits/HabitsAnalysisAgent.ts` (editar)
- [ ] Testar: desabilitar analytics e verificar que chat continua funcionando (teste manual)

### Tema 2.2: Filtro de Tags Vazio (Bug #2, Seção 3)

**Problema:** Se `filters.tags = []`, nenhum conteúdo passa no filtro (deveria passar tudo).

- [ ] Ler `src/agents/content/ContentRecommendationAgent.ts` método `applyFilters()` (ler)
- [ ] Corrigir lógica: só aplicar filtro de tags se `filters.tags && filters.tags.length > 0` (editar)
- [ ] Aplicar mesma correção para `filters.types` e `filters.categories` (editar)
- [ ] Testar: passar `filters.tags = []` e verificar que conteúdo não é filtrado (teste unitário)

### Tema 2.3: Ordenação de Hábitos (Bug #3, Seção 3)

**Problema:** Streaks calculados com dados fora de ordem cronológica, gerando resultados incorretos.

- [ ] Ler `src/agents/habits/HabitsAnalysisAgent.ts` método `analyzeHabitPatterns()` (ler)
- [ ] Criar método `sortByDate()` em `HabitsAnalysisAgent.ts` (editar) - ordenar por data crescente
- [ ] Chamar `sortByDate()` ANTES de `analyzeHabitPatterns()` em `process()` (editar)
- [ ] Atualizar `calculateStreaks()` para assumir dados já ordenados (editar) - adicionar comentário
- [ ] Atualizar `detectTrend()` para assumir dados já ordenados (editar) - adicionar comentário
- [ ] Testar: passar entries desordenadas e verificar streaks corretos (teste unitário)

### Tema 2.4: Streak Dias Duplicados (Bug #4, Seção 3)

**Problema:** Múltiplos check-ins no mesmo dia contam como múltiplos dias no streak.

- [ ] Ler `src/features/wellness/context/WellnessContext.tsx` cálculo de `currentStreak` (ler)
- [ ] Filtrar datas únicas antes de calcular streak (editar) - usar `Set` ou `Map` por data
- [ ] Testar: criar 2 check-ins no mesmo dia e verificar que conta como 1 dia (teste unitário)

### Tema 2.5: JSON Parse Sem Proteção (Bug #5, Seção 3)

**Problema:** `JSON.parse()` pode crashar se dados estiverem corrompidos no AsyncStorage.

- [ ] Ler `src/features/wellness/context/WellnessContext.tsx` método `loadInitialData()` (ler)
- [ ] Envolver `JSON.parse()` em try/catch (editar)
- [ ] Retornar estado inicial (objeto vazio) se parse falhar (editar)
- [ ] Logar erro com `logger.warn()` (editar)
- [ ] Testar: corromper dados no AsyncStorage e verificar que app não crasha (teste manual)

### Tema 2.6: Throw Desnecessário (Bug #7, Seção 3)

**Problema:** `throw error` em `ContentRecommendationAgent.ts` trava a tela sem fallback.

- [ ] Ler `src/agents/content/ContentRecommendationAgent.ts` método `process()` catch block (ler)
- [ ] Substituir `throw error` por retorno de `RecommendationResult` com array vazio e mensagem amigável (editar)
- [ ] Testar: simular erro e verificar que tela mostra mensagem em vez de travar (teste manual)

### Tema 2.7: useCallback Faltando (Bug #8, Seção 3)

**Problema:** Funções recriadas a cada render em `AgentsContext.tsx`, causando re-renders desnecessários.

- [ ] Ler `src/contexts/AgentsContext.tsx` (ler)
- [ ] Envolver `initializeAgent` e `isAgentReady` em `useCallback()` (editar)
- [ ] Atualizar dependências do `useMemo` do `value` (editar)
- [ ] Testar: verificar que re-renders diminuíram (React DevTools Profiler)

---

## Fase 3: Stores + QA (PÓS-CÓDIGO)

### Tema 3.1: SecureStore para Tokens (Seção 5.3)

**Problema:** Tokens do Supabase podem estar em AsyncStorage (menos seguro).

- [ ] Verificar se `src/utils/supabaseSecureStorage.ts` existe (verificar)
- [ ] Criar `src/utils/supabaseSecureStorage.ts` se não existir (novo arquivo) - implementar conforme seção 5.3 do Docfinal.md
- [ ] Criar função de migração `migrateSupabaseSessionToSecureStore()` (editar ou criar)
- [ ] Chamar migração no primeiro app start (editar `App.tsx` ou hook de inicialização)
- [ ] Configurar Supabase client para usar `supabaseSecureStorage` (editar `src/utils/supabase.ts`)
- [ ] Testar: verificar que tokens estão em SecureStore (teste manual)

### Tema 3.2: React 19 Compiler (Seção 4.3, Opcional)

**Problema:** Performance pode ser melhorada com React Compiler automático.

- [ ] Atualizar `app.config.js` (editar) - adicionar `experiments.reactCompiler: true`
- [ ] Testar app completo (verificar que não quebrou nada) (teste manual)
- [ ] Remover `useMemo`/`useCallback` desnecessários (refatorar) - deixar compiler fazer

### Tema 3.3: NativeWind v5 (Seção 4.4, Opcional)

**Problema:** Versão 4 compila em runtime, v5 compila em build (mais rápido).

- [ ] Verificar versão atual: `npm list nativewind` (comando)
- [ ] Atualizar para v5: `npm install nativewind@^5.0.0` (comando)
- [ ] Atualizar `metro.config.js` conforme seção 4.4 (editar)
- [ ] Atualizar `babel.config.js` conforme seção 4.4 (editar)
- [ ] Testar: verificar que estilos ainda funcionam (teste manual)

### Tema 3.4: Predictive Back Navigation (Seção 4.5, Android 16)

**Problema:** App pode não funcionar bem com gesto de voltar do Android 16.

- [ ] Atualizar `app.config.js` (editar) - adicionar `android.predictiveBackGestureEnabled: true`
- [ ] Testar gesto de voltar em todas as telas (teste manual)
- [ ] Verificar que transições são suaves (teste manual)

### Tema 3.5: Checklist de Deploy (Seção 7)

**Problema:** Faltam validações finais antes de enviar para stores.

- [ ] Executar `npm run type-check` - deve retornar 0 erros (comando)
- [ ] Executar `npm run lint` - corrigir warnings críticos (comando)
- [ ] Executar `npm test` - coverage mínimo 40% (comando)
- [ ] Verificar que todas as Edge Functions estão deployadas (verificar Supabase dashboard)
- [ ] Verificar que RLS está ativo em todas as tabelas (SQL)
- [ ] Verificar que Privacy Policy está acessível (teste manual)
- [ ] Build Android: `npm run build:android` (comando)
- [ ] Build iOS: `npm run build:ios` (comando)
- [ ] Testar builds em dispositivos físicos (teste manual)
- [ ] Verificar que API keys não estão no bundle (análise de bundle)

---

## Prioridade: Próximos 2 Dias

**Recomendação:** Focar em itens que bloqueiam deploy nas stores.

### Dia 1 (Segurança Crítica):

1. **Gemini Edge Function** (Tema 1.1) - Tasks 1-4 (criar função, configurar secret, deploy, refatorar service)
2. **RLS Supabase** (Tema 1.2) - Tasks 1-3 (criar migration, habilitar RLS, criar policies básicas)
3. **Privacy Policy** (Tema 1.3) - Todas as tasks (implementar navegação)

### Dia 2 (Plataforma + Lógica Crítica):

4. **TextDecoder Polyfill** (Tema 1.5) - Todas as tasks (instalar, criar polyfills, importar)
5. **Analytics Não Bloqueia** (Tema 2.1) - Tasks 1-3 (criar método seguro, aplicar em MaternalChatAgent)
6. **Ordenação de Hábitos** (Tema 2.3) - Todas as tasks (corrigir ordenação antes de calcular streaks)

**Total estimado:** 6 temas, ~25 tasks em 2 dias (foco em itens bloqueantes).