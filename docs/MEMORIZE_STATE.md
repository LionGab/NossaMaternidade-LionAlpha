# Estado do Projeto - Memorização para Compactação

**Data:** 5 de dezembro de 2025, 22:45
**Sessão:** Migração Híbrida (Props + className)
**Status:** 🟡 Pausado (60% concluído) - Aguardando compactação

---

## 📦 CONTEXTO DA SESSÃO

### Solicitação Inicial
Usuário enviou screenshot de HomeScreen moderna com:
- Header gradiente rosa/roxo
- Cards estilizados
- Layout limpo
- Emojis grandes

Pediu para criar HomeScreen similar.

### Análise Realizada
1. ✅ Leitura de arquivos do projeto
2. ✅ Identificação de conflito: Tailwind (azul) vs Tokens.ts (rosa)
3. ✅ Identificação de arquitetura: Props semânticas vs className
4. ✅ Proposta de 3 opções (A: Props only, B: NativeWind only, C: Híbrido)
5. ✅ Usuário escolheu **OPÇÃO C (Híbrido)** para cumprir stack + não quebrar código

### Estratégia Aprovada
**Migração Híbrida (Props + className):**
- Atoms suportam ambos
- className tem prioridade
- Migração gradual
- Backwards compatible

---

## ✅ TRABALHO CONCLUÍDO

### 1. Tailwind Config Sincronizado (5 min)
**Arquivo:** `tailwind.config.js`

**Mudanças:**
```diff
- primary.DEFAULT: '#004E9A' (Ocean Blue) ❌
+ primary.DEFAULT: '#E91E63' (Rosa Magenta) ✅

- secondary.DEFAULT: '#D93025' (Coral) ❌
+ secondary.DEFAULT: '#9C27B0' (Roxo Vibrante) ✅
```

**Impacto:**
- Alinhado com Tokens.ts
- Alinhado com screenshots (rosa/roxo)
- Sem conflitos visuais

---

### 2. Box.tsx Híbrido (30 min)
**Arquivo:** `src/components/atoms/Box.tsx`

**Implementação:**
```tsx
export const Box = React.memo(function Box({
  className, // ⭐ NOVO
  bg, p, rounded, shadow, // Props legadas
  ...
}: BoxProps) {
  // Modo 1: className tem prioridade
  if (className) {
    return <View className={className} style={style} {...props}>{children}</View>;
  }

  // Modo 2: Props semânticas (fallback - backwards compatible)
  const computedStyle = useMemo(() => {
    // Lógica existente preservada
  }, [...]);

  return <View style={computedStyle} {...props}>{children}</View>;
});
```

**Características:**
- ✅ Suporta `className` (NativeWind)
- ✅ Suporta props (legado)
- ✅ Prioridade: className > props
- ⚠️ NÃO usa `styled()` (className direto no View)

---

### 3. Text.tsx Híbrido (automático - usuário fez)
**Arquivo:** `src/components/atoms/Text.tsx`

**Implementação similar a Box:**
- ✅ Suporta `className`
- ✅ Suporta props variant/size/color
- ✅ Prioridade: className > props

---

### 4. HomeScreen Parcialmente Migrada (usuário fez)
**Arquivo:** `src/screens/HomeScreen.tsx`

**Áreas migradas para className:**
- ✅ Greeting (text-2xl, font-bold, etc)
- ✅ Dica do Dia (rounded-3xl, p-5, shadow-md)
- ✅ Featured Content (flex-row, gap-3, items-center)
- ✅ NathIA Card (flex-row, justify-between, mb-4)
- ✅ Needs Prompt Card (bg-card, rounded-3xl, p-6)
- ✅ Mood Check Card (bg-card, rounded-3xl, border)

**Padrão misto comum:**
```tsx
<Box
  className="rounded-3xl p-5 shadow-md border mb-6"
  style={{
    backgroundColor: ColorTokens.info[50], // Cores específicas via style
    borderColor: `${ColorTokens.info[300]}50`,
  }}
>
```

**Áreas ainda com props:**
- ⏸️ Alguns Text (variant, size, color)
- ⏸️ LinearGradient (não suporta className completo)
- ⏸️ Badges
- ⏸️ Estilos inline complexos

---

### 5. Documentação Criada

**Arquivos:**
1. ✅ `EXEMPLO_BOX_HIBRIDO.tsx` - Exemplo de uso (validação PoC)
2. ✅ `docs/HYBRID_MIGRATION_STATUS.md` - Status detalhado
3. ✅ `docs/MEMORIZE_STATE.md` - Este arquivo

---

## ⏸️ TRABALHO PENDENTE

### Próxima Sessão (Curto Prazo)

**6. Button.tsx Híbrido (~45 min)**
- [ ] Adicionar `className?: string` na interface
- [ ] Implementar lógica condicional
- [ ] Manter haptic feedback
- [ ] Manter acessibilidade
- [ ] Testar variantes (primary, outline, ghost)

**7. Helper Dark Mode (~20 min)**
- [ ] Criar `src/utils/themeClassName.ts`
- [ ] Implementar `useThemeClassName()` hook
- [ ] Implementar `useThemeClass()` helper
- [ ] Documentar uso

**8. Finalizar HomeScreen (~1h)**
- [ ] Converter todos Text para className
- [ ] Testar dark mode
- [ ] Validar responsividade
- [ ] Verificar acessibilidade WCAG

**9. Testes Smoke (~30 min)**
- [ ] Criar `__tests__/atoms/Box.test.tsx`
- [ ] Casos: props, className, prioridade
- [ ] Criar `__tests__/atoms/Text.test.tsx`
- [ ] Rodar `npm test`

**10. Documentação Final (~20 min)**
- [ ] Criar `docs/HYBRID_PATTERN.md` (guia de uso)
- [ ] Criar `docs/MIGRATION_GUIDE.md` (como migrar)
- [ ] Atualizar `README.md` (stack híbrido)

**TOTAL PENDENTE:** ~3h 35min

---

## 🎯 DECISÕES TÉCNICAS CRÍTICAS

### ✅ Decisões Tomadas

1. **Padrão Híbrido (OPÇÃO C):**
   - Atoms suportam className E props
   - className tem prioridade quando ambos fornecidos
   - Backwards compatible (código existente funciona)
   - Migração gradual (código novo usa className)

2. **Implementação Simples:**
   - NÃO usar `styled()` do NativeWind (desnecessário)
   - Usar `className` diretamente em View/Text nativo
   - Preservar lógica de props como fallback

3. **Tailwind = Tokens.ts:**
   - primary = Rosa Magenta (#E91E63)
   - secondary = Roxo Vibrante (#9C27B0)
   - Única fonte da verdade: Tokens.ts

4. **Dark Mode:**
   - Props: automático (useThemeColors)
   - className: precisa helper `useThemeClassName()`
   - Solução: Passo 7 (pendente)

### ⚠️ Limitações Conhecidas

1. **Dark Mode com className:**
   - `dark:bg-gray-900` não funciona automaticamente
   - Precisa helper manual
   - Solução: useThemeClassName() (pendente)

2. **Type Safety:**
   - Props: ✅ Type-safe (TS valida)
   - className: ❌ String livre (sem validação)
   - Trade-off aceito

3. **LinearGradient:**
   - Não suporta className completo
   - Apenas opacity/size
   - Colors continuam via props

---

## 📂 ARQUIVOS MODIFICADOS

### Modificados (Confirmado)
1. ✅ `tailwind.config.js` - Cores sincronizadas
2. ✅ `src/components/atoms/Box.tsx` - Híbrido
3. ✅ `src/components/atoms/Text.tsx` - Híbrido
4. ✅ `src/screens/HomeScreen.tsx` - Parcialmente migrado

### Criados
5. ✅ `EXEMPLO_BOX_HIBRIDO.tsx` - Exemplo PoC
6. ✅ `docs/HYBRID_MIGRATION_STATUS.md` - Status
7. ✅ `docs/MEMORIZE_STATE.md` - Este arquivo

### Pendentes (Não Criados)
8. ⏸️ `src/utils/themeClassName.ts` - Helper dark mode
9. ⏸️ `__tests__/atoms/Box.test.tsx` - Testes
10. ⏸️ `docs/HYBRID_PATTERN.md` - Guia de uso
11. ⏸️ `docs/MIGRATION_GUIDE.md` - Guia de migração

---

## 🧪 VALIDAÇÃO NECESSÁRIA

### Antes de Continuar (Próxima Sessão)

1. **Testar PoC:**
   ```bash
   npm start
   ```
   - Verificar HomeScreen renderiza
   - Verificar cores (rosa/roxo)
   - Verificar className funciona
   - Verificar props funcionam (backwards compatible)

2. **Verificar Dark Mode:**
   - Trocar tema no app
   - Ver se cores se adaptam
   - Identificar problemas com className

3. **Type Check:**
   ```bash
   npm run type-check
   ```
   - Garantir 0 erros TypeScript

4. **Build:**
   ```bash
   npm run build:android
   ```
   - Verificar build não quebrou

---

## 💡 INSIGHTS IMPORTANTES

1. **Híbrido É Prático:**
   - Não quebra código existente
   - Permite migração incremental
   - Flexibilidade para escolher melhor abordagem

2. **className Direto Funciona:**
   - `styled()` não é obrigatório
   - View/Text nativos aceitam className
   - Menos overhead

3. **Props Ainda São Úteis:**
   - Type safety
   - Theme-aware automático
   - Menos verbose em alguns casos

4. **Design System é Chave:**
   - Conflito Tailwind vs Tokens causou confusão
   - Sincronização é crítica
   - Tokens.ts = fonte da verdade

5. **Validação Visual é Essencial:**
   - Screenshots ajudam muito
   - Cores exatas importam (#E91E63 vs #004E9A)
   - Usuário percebe inconsistências

---

## 🚀 PRÓXIMA SESSÃO - ROTEIRO RÁPIDO

**Ao retomar:**

1. ✅ **Validar PoC** (5 min):
   - `npm start`
   - Verificar visualmente HomeScreen
   - Confirmar que híbrido funciona

2. ⏸️ **Button.tsx** (45 min):
   - Copiar padrão de Box.tsx
   - Adicionar suporte className
   - Testar variantes

3. ⏸️ **Helper Dark Mode** (20 min):
   - Criar `useThemeClassName()`
   - Testar com `dark:` classes
   - Validar funcionamento

4. ⏸️ **Finalizar HomeScreen** (1h):
   - Converter resto para className
   - Testar completamente
   - Verificar acessibilidade

5. ⏸️ **Testes + Docs** (50 min):
   - Smoke tests
   - Guias completos
   - Atualizar README

**TOTAL:** ~3h

---

## ❓ PERGUNTAS PARA PRÓXIMA SESSÃO

1. PoC funcionou visualmente? (cores, layout, props, className)
2. Dark mode com className apresentou problemas?
3. Build Android passou sem erros?
4. Performance está ok? (verificar com React DevTools)
5. Há necessidade de ajustes no padrão híbrido?

---

## 📝 NOTAS FINAIS

### O Que Funcionou Bem
- ✅ Análise inicial completa
- ✅ Identificação de conflito (Tailwind vs Tokens)
- ✅ Proposta de opções claras (A, B, C)
- ✅ Implementação rápida da PoC (35 min)
- ✅ Documentação detalhada

### O Que Melhorar
- ⚠️ Validação visual pendente (aguarda npm start)
- ⚠️ Testes automatizados pendentes
- ⚠️ Dark mode com className não testado
- ⚠️ Performance não medida

### Riscos Conhecidos
- 🔴 Dark mode pode não funcionar com className (precisa helper)
- 🟡 Type safety menor com className (strings livres)
- 🟡 Manutenção de dois sistemas (props + className)
- 🟢 Backwards compatibility garantida (baixo risco)

---

**Status Final:** 🟡 Pausado para compactação
**Progresso:** 60% concluído (4/10 tarefas)
**Próximo Passo:** Validar PoC → Continuar com Button.tsx
**Estimativa para Conclusão:** ~3h

---

**Preparado para compactação.** ✅
