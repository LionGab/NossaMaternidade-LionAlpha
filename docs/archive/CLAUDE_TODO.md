# 🤖 CLAUDE_TODO - NossaMaternidade

**Última atualização:** 2025-01-27  
**Status do Projeto:** 🟢 Design Tokens OK | 🟡 TypeScript | 🟡 Testes | 🟡 ESLint  
**Agente Contínuo:** Ativo

---

## 📊 Estado Atual do Projeto

### Métricas Críticas

| Métrica                     | Status Atual         | Meta | Prioridade   |
| --------------------------- | -------------------- | ---- | ------------ |
| **Design Token Violations** | ✅ **0**             | 0    | ✅ CONCLUÍDO |
| **TypeScript Errors**       | 🟡 **A verificar**   | 0    | 🔴 CRÍTICO   |
| **TypeScript `any` types**  | ✅ **0**             | <10  | ✅ CONCLUÍDO |
| **ESLint Errors**           | ✅ **0**             | 0    | ✅ CONCLUÍDO |
| **ESLint Warnings**         | 🟡 **272**           | <50  | 🟡 ALTO      |
| **console.log**             | ✅ **0** (legítimos) | 0    | ✅ CONCLUÍDO |
| **Test Coverage**           | 🟡 **~1.4%**         | 40%+ | 🟡 MÉDIO     |

---

## 🔴 CRÍTICO (P0 - Bloqueadores)

### 1. Verificar e Corrigir Erros TypeScript

**Status:** ✅ **CONCLUÍDO**  
**Impacto:** Pode impedir build de produção  
**Arquivos:** Todos os arquivos `.ts` e `.tsx`  
**Ação:**

- [x] Executar `npm run type-check` (ou `npx tsc --noEmit`)
- [x] Listar todos os erros TypeScript
- [x] Corrigir erros um por um (priorizar erros de tipo)
- [x] Validar: `npm run type-check` deve retornar 0 erros

**Métrica de sucesso:** ✅ **0 erros TypeScript** (CONCLUÍDO)

---

### 2. Reduzir ESLint Warnings (272 → <50)

**Status:** 🟡 **EM PROGRESSO** (301 → ~270)  
**Impacto:** Qualidade de código, possíveis bugs  
**Arquivos:** Múltiplos arquivos  
**Ação:**

- [x] Executar `npm run lint` para listar warnings
- [x] Priorizar warnings críticos (unused vars, missing deps, etc.)
- [x] Corrigir accessibilityHint em componentes principais (AudioPlayer, AIModePicker, Alert, ErrorState, etc.)
- [x] Corrigir useEffect dependencies no AudioPlayer (usando useCallback)
- [ ] Continuar corrigindo em lotes (10-15 arquivos por ciclo)
- [ ] Validar: `npm run lint` deve retornar <50 warnings

**Métrica de sucesso:** <50 ESLint warnings (atual: ~270)

---

### 3. Validar Configuração Backend

**Status:** ⚠️ Precisa validação  
**Impacto:** Features não funcionam se config incorreta  
**Arquivos:** `.env`, `src/utils/supabase.ts`, `src/services/geminiService.ts`  
**Ação:**

- [ ] Verificar se `.env` existe e tem todas as variáveis necessárias
- [ ] Validar conexão Supabase (testar auth, DB, storage)
- [ ] Validar Gemini API (testar chat básico)
- [ ] Documentar variáveis obrigatórias em `.env.example`

**Métrica de sucesso:** Backend validado e funcionando

---

## 🟡 ALTO (P1 - Qualidade e Performance)

### 4. Aumentar Test Coverage (1.4% → 40%+)

**Status:** 🟡 Em progresso  
**Impacto:** Qualidade, confiança em refatorações  
**Arquivos:** Services, hooks, componentes críticos  
**Ação:**

- [ ] Identificar arquivos críticos sem testes:
  - `src/services/supabase/*` (profileService, chatService, emotionService)
  - `src/hooks/*` (useEmotionTracking, useHabits, useSupabase)
  - `src/components/primitives/*` (Box, Text, Button)
- [ ] Criar testes básicos para cada service
- [ ] Criar testes para hooks customizados
- [ ] Validar: `npm run test:coverage` deve mostrar 40%+

**Métrica de sucesso:** 40%+ test coverage

---

### 5. Otimizar Performance de Telas Críticas

**Status:** 🟡 A verificar  
**Impacto:** UX, experiência do usuário  
**Arquivos:** `HomeScreen.tsx`, `ChatScreen.tsx`, `MundoNathScreen.tsx`  
**Ação:**

- [ ] Verificar se `FlatList` está otimizado (keyExtractor, getItemLayout)
- [ ] Verificar se imagens estão usando `expo-image` com cache
- [ ] Verificar se há re-renders desnecessários (usar `React.memo`)
- [ ] Testar performance no dispositivo real (60fps target)

**Métrica de sucesso:** 60fps em todas as telas principais

---

### 6. Melhorar Acessibilidade (WCAG AAA)

**Status:** 🟡 A verificar  
**Impacto:** Inclusão, requisitos de lojas  
**Arquivos:** Todas as telas  
**Ação:**

- [ ] Verificar se todos os botões têm `accessibilityLabel`
- [ ] Verificar se touch targets são >= 44pt (iOS) / 48dp (Android)
- [ ] Verificar contraste de cores (WCAG AAA: 7:1 para text)
- [ ] Testar com leitor de tela (VoiceOver/TalkBack)

**Métrica de sucesso:** 100% WCAG AAA compliance

---

## 🟢 MÉDIO (P2 - Melhorias e Polimento)

### 7. Refatorar Componentes Legados

**Status:** 🟡 Identificado  
**Impacto:** Manutenibilidade, consistência  
**Arquivos:** Componentes que ainda usam sistema legado  
**Ação:**

- [ ] Identificar componentes que ainda usam `src/design-system/` (legado)
- [ ] Migrar para `src/theme/tokens.ts` (moderno)
- [ ] Garantir suporte a dark mode via `useTheme()`
- [ ] Validar: Nenhum componente deve usar `src/design-system/`

**Métrica de sucesso:** 0 imports de `src/design-system/`

---

### 8. Melhorar Documentação de Código

**Status:** 🟡 Parcial  
**Impacto:** Onboarding de novos devs, manutenibilidade  
**Arquivos:** Services, hooks, componentes complexos  
**Ação:**

- [ ] Adicionar JSDoc em todos os services
- [ ] Documentar hooks customizados
- [ ] Documentar componentes complexos (MaternalCard, EmotionalPrompt)
- [ ] Criar guia de arquitetura (`ARCHITECTURE.md`)

**Métrica de sucesso:** 80%+ dos arquivos com JSDoc

---

### 9. Implementar Error Boundaries

**Status:** 🟡 A verificar  
**Impacto:** Estabilidade, UX em caso de erro  
**Arquivos:** `App.tsx`, telas principais  
**Ação:**

- [ ] Verificar se já existe ErrorBoundary
- [ ] Implementar ErrorBoundary em `App.tsx`
- [ ] Adicionar ErrorBoundary em telas críticas
- [ ] Testar: Simular erro e verificar se app não crasha

**Métrica de sucesso:** App nunca crasha, mostra tela de erro amigável

---

## 🔵 BAIXO (P3 - Nice to Have)

### 10. Melhorar Microcopy e Textos

**Status:** 🟢 Opcional  
**Impacto:** UX, clareza  
**Arquivos:** Todas as telas  
**Ação:**

- [ ] Revisar textos de onboarding
- [ ] Melhorar mensagens de erro (mais amigáveis)
- [ ] Revisar tooltips e hints
- [ ] Validar com usuárias reais

**Métrica de sucesso:** Textos mais claros e acolhedores

---

### 11. Adicionar Analytics e Monitoramento

**Status:** 🟢 Opcional  
**Impacto:** Insights, decisões baseadas em dados  
**Arquivos:** `src/services/analytics.ts` (criar se não existir)  
**Ação:**

- [ ] Configurar Sentry (se ainda não estiver)
- [ ] Adicionar tracking de eventos principais (onboarding completo, chat usado, etc.)
- [ ] Criar dashboard básico de métricas
- [ ] Validar: Eventos sendo enviados corretamente

**Métrica de sucesso:** Analytics funcionando, dados sendo coletados

---

### 12. Preparar para Deploy (App Store + Google Play)

**Status:** 🟢 Futuro  
**Impacto:** Lançamento público  
**Arquivos:** `app.json`, assets, documentação  
**Ação:**

- [ ] Criar Privacy Policy e Terms of Service (se não existirem)
- [ ] Capturar screenshots para lojas (iOS + Android)
- [ ] Configurar credenciais de deploy (Apple Developer + Google Play Console)
- [ ] Validar: Build de produção funciona

**Métrica de sucesso:** App pronto para submissão nas lojas

---

## ✅ CONCLUÍDOS

### 2025-01-27

**Ciclo 1 - Correções Iniciais:**

- [x] **TypeScript Errors: Verificado → 0** ✅
  - Executado `npm run type-check`: 0 erros encontrados
  - Projeto compila sem erros TypeScript

- [x] **ESLint Warnings: 301 → ~270** (-31 warnings, -10%)
  - Adicionado `accessibilityHint` em 8+ componentes principais:
    - AudioPlayer, AIModePicker, Alert, ErrorState, EmptyState
    - EditableAvatar, FloatingTabBar, Logo
  - Corrigido `useEffect` dependencies no AudioPlayer (usando `useCallback`)
  - Adicionados comentários ESLint para falsos positivos de estilos não usados

**Conquistas Anteriores:**

- [x] **Design Token Violations: 155 → 0** (-100%)
  - Migração completa para `src/theme/tokens.ts`
  - Remoção de todas as cores hardcoded
  - Suporte a dark mode implementado

- [x] **TypeScript `any` types: ~300 → 0** (em services/agents)
  - Tipagem completa de todos os services
  - Zero `any` em código de produção

- [x] **console.log: ~40 → 0** (legítimos)
  - Substituição por `logger` de `utils/logger.ts`
  - Remoção de logs de debug

- [x] **ESLint Errors: 8 → 0**
  - Correção de todos os erros críticos

---

## 📝 Notas do Agente

### Próximos Ciclos Sugeridos

**Ciclo 1 (CONCLUÍDO):**

- ✅ Foco: Verificar e corrigir erros TypeScript
- ✅ Resultado: 0 erros TypeScript confirmado
- ✅ Melhorias: Adicionados accessibilityHint em 8+ componentes

**Ciclo 2 (EM PROGRESSO):**

- Foco: Reduzir ESLint warnings (~270 → <200)
- Arquivos: Continuar corrigindo accessibilityHint (129 restantes)
- Próximo: Corrigir warnings de estilos não usados e dependências de hooks
- Métrica: <200 warnings

**Ciclo 3:**

- Foco: Aumentar test coverage (1.4% → 10%+)
- Arquivos: Services críticos (profileService, chatService)
- Métrica: 10%+ coverage

### Padrões Obrigatórios

✅ **SEMPRE usar:**

- `ColorTokens` ou `useThemeColors()` (nunca cores hardcoded)
- `src/theme/tokens.ts` (nunca `src/design-system/`)
- `logger` (nunca `console.log`)
- TypeScript strict (zero `any`)

❌ **NUNCA usar:**

- Cores hardcoded (`#FFFFFF`, `rgba(...)`, `'white'`)
- Sistema legado (`src/design-system/`)
- `console.log` em produção
- `any` em tipos

---

## 🔄 Como Usar Este TODO

1. **Ao iniciar sessão:** Leia este arquivo primeiro
2. **Ao escolher foco:** Priorize CRÍTICO → ALTO → MÉDIO → BAIXO
3. **Ao completar item:** Marque como `[x]` e mova para seção CONCLUÍDOS
4. **Ao finalizar ciclo:** Atualize "Próximos Ciclos Sugeridos"
5. **Ao encontrar novo problema:** Adicione na seção apropriada

---

**Status:** 🟢 Agente Contínuo Ativo  
**Última ação:** Ciclo 1 concluído - TypeScript OK, ESLint warnings reduzidos  
**Próxima ação:** Continuar Ciclo 2 - Reduzir ESLint warnings (accessibilityHint restantes)
