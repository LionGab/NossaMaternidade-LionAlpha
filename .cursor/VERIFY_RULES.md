# ✅ Guia de Verificação - Cursor Workbench Rules

## 🎯 Como Verificar se as Regras "Always" Estão Aplicadas

### Método 1: Visual no Chat (Mais Rápido)

1. **Abra qualquer arquivo do projeto** (ex: `src/screens/HomeScreen.tsx`)
2. **Inicie o chat do Cursor:**
   - `Ctrl+L` (Windows/Linux) ou `Cmd+L` (Mac)
3. **Procure no painel do chat:**
   - No topo do chat, deve aparecer uma seção **"Rules"** ou **"Context"**
   - Você deve ver as regras listadas como anexadas
   - Ou: No rodapé do chat, pode haver um indicador de regras ativas

4. **Regras "Always" que devem aparecer:**
   - ✅ Contexto do Projeto
   - ✅ Regras TypeScript
   - ✅ Design System Rules
   - ✅ Code Quality Rules
   - ✅ Accessibility Rules

### Método 2: Via Command Palette

1. **Abra Command Palette:**
   - `Ctrl+Shift+P` (Windows/Linux) ou `Cmd+Shift+P` (Mac)

2. **Execute comando:**

   ```
   Cursor Workbench: Show Rules
   ```

3. **Verifique o painel:**
   - Deve abrir um painel lateral mostrando todas as 7 regras
   - Regras com `alwaysApply: true` devem ter status 🟢 (ativo)
   - Status visual:
     - 🟢 Verde = Ativo e aplicado
     - 🟡 Amarelo = Pendente ou mudanças locais
     - 🔴 Vermelho = Conflito ou erro
     - ⚪ Cinza = Não configurado

### Método 3: Teste Prático (Recomendado)

1. **Abra um arquivo `.tsx`:**

   ```
   src/screens/HomeScreen.tsx
   ```

2. **Inicie chat e faça uma pergunta:**

   ```
   "Quais são as regras de design tokens que devo seguir neste projeto?"
   ```

3. **Verifique a resposta:**
   - Se a IA mencionar:
     - ✅ `useThemeColors()` em vez de cores hardcoded
     - ✅ `Tokens.spacing` em vez de valores fixos
     - ✅ `ColorTokens.overlay.*` para overlays
     - ✅ WCAG AAA compliance
   - **Então as regras estão funcionando!** ✅

4. **Teste TypeScript:**
   ```
   "Posso usar 'any' neste código?"
   ```

   - Resposta deve ser: **"Não, zero 'any', use 'unknown' + type guards"**
   - **Então as regras TypeScript estão funcionando!** ✅

### Método 4: Verificação Automatizada (Script)

Execute no terminal:

```bash
# Verificar se workbench.json existe
Test-Path "workbench.json"

# Verificar se regras .mdc existem
Get-ChildItem -Path ".cursor\rules" -Filter "*.mdc" | Measure-Object | Select-Object -ExpandProperty Count
# Deve retornar: 8
```

---

## 🔍 Onde Ver as Regras Aplicadas

### No Chat do Cursor

Quando você abre o chat (`Ctrl+L`), as regras podem aparecer em:

1. **Topo do painel de chat:**
   - Seção "Rules" ou "Context"
   - Lista de regras anexadas
   - Ícones de status (🟢/🟡/🔴)

2. **Rodapé do chat:**
   - Contador de regras ativas
   - Link para ver detalhes

3. **Sidebar do Workbench:**
   - Se a extensão estiver instalada
   - Painel lateral dedicado

### No Workbench Panel

1. **Abrir painel:**
   - `Ctrl+Shift+P` → "Cursor Workbench: Show Rules"

2. **Visualizar:**
   - Lista completa de regras
   - Status de cada uma
   - Tags e globs configurados
   - Última atualização

---

## ✅ Checklist de Verificação

Marque cada item quando verificar:

- [ ] Extensão Cursor Workbench instalada
- [ ] `workbench.json` existe na raiz do projeto
- [ ] 8 arquivos `.mdc` existem em `.cursor/rules/`
- [ ] Command "Cursor Workbench: Show Rules" funciona
- [ ] Painel mostra 7 regras configuradas
- [ ] 5 regras com `alwaysApply: true` aparecem como 🟢
- [ ] Ao abrir chat (`Ctrl+L`), regras aparecem no contexto
- [ ] Teste prático: IA menciona design tokens corretos
- [ ] Teste prático: IA rejeita uso de `any`

---

## 🚨 Problemas Comuns

### "Não vejo regras no chat"

**Solução:**

1. Verifique se a extensão está instalada e ativada
2. Recarregue o Cursor: `Ctrl+Shift+P` → "Developer: Reload Window"
3. Verifique se `workbench.json` está na raiz (não em `.cursor/`)
4. Tente abrir um arquivo `.tsx` e iniciar novo chat

### "Command 'Show Rules' não encontrado"

**Solução:**

1. Extensão não está instalada → Instale via Extensions
2. Extensão desativada → Ative nas Extensions
3. Cursor desatualizado → Atualize o Cursor

### "Regras aparecem mas não são seguidas"

**Solução:**

1. Verifique conteúdo dos arquivos `.mdc` (podem estar vazios)
2. Verifique se `alwaysApply: true` está configurado
3. Tente fazer pergunta mais específica no chat
4. Verifique se está usando Cursor (não VS Code)

---

## 📊 Status Esperado

### Regras Always (5 regras)

- ✅ Contexto do Projeto → Sempre aplicada
- ✅ TypeScript Rules → Sempre aplicada
- ✅ Design System → Sempre aplicada + Auto em `**/*.tsx`
- ✅ Code Quality → Sempre aplicada
- ✅ Accessibility → Sempre aplicada + Auto em `**/*.tsx`

### Regras Auto (2 regras)

- 🔄 IA Integration → Aplica em `src/ai/**`
- 🔄 Supabase Rules → Aplica em `src/services/supabase/**`
- 🔄 Testing Rules → Aplica em `**/*.test.ts`

---

## 🎯 Teste Rápido (30 segundos)

1. Abra: `src/screens/HomeScreen.tsx`
2. Pressione: `Ctrl+L` (ou `Cmd+L`)
3. Digite: `"Quais cores devo usar neste componente?"`
4. **Resposta esperada:** Menciona `useThemeColors()`, `ColorTokens`, `Tokens.spacing`
5. ✅ **Se aparecer isso, está funcionando!**

---

**Última atualização:** Verifique sempre após instalar/atualizar extensão
