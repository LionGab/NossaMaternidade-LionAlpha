# 🚀 Guia de Instalação - Cursor Workbench

## ✅ Status Atual

- ✅ Arquivos `.mdc` criados em `.cursor/rules/`
- ✅ `workbench.json` configurado
- ✅ 7 regras organizadas e prontas
- ⏳ **Próximo passo:** Instalar extensão

---

## 📦 Passo 1: Instalar Extensão

### Método 1: Via Extensions (Recomendado)

1. **Abrir Extensions:**
   - `Ctrl+Shift+X` (Windows/Linux)
   - `Cmd+Shift+X` (Mac)
   - Ou: View → Extensions

2. **Buscar extensão:**
   - Digite: `Cursor Workbench`
   - Ou: `@zackiles/cursor-workbench`

3. **Instalar:**
   - Clique em **Install**
   - Aguarde instalação completa

### Método 2: Via Command Palette

1. **Abrir Command Palette:**
   - `Ctrl+Shift+P` (Windows/Linux)
   - `Cmd+Shift+P` (Mac)

2. **Instalar extensão:**
   - Digite: `Extensions: Install Extensions`
   - Busque: `Cursor Workbench`
   - Clique em Install

---

## ✅ Passo 2: Verificar Instalação

### Verificar se Workbench está ativo:

1. **Command Palette:**
   - `Ctrl/Cmd+Shift+P`
   - Digite: `Cursor Workbench: Show Rules`
   - Deve abrir painel com suas regras

2. **Status Bar (rodapé):**
   - Procure ícone do Workbench
   - Status: 🟢 (ativo) ou ⚪ (inativo)

3. **Testar aplicação automática:**
   - Abra um arquivo `.tsx` (ex: `src/screens/HomeScreen.tsx`)
   - As regras com `alwaysApply: true` devem ser anexadas automaticamente
   - Verifique no chat do Cursor (deve mostrar regras aplicadas)

---

## 🎯 Passo 3: Testar Regras

### Teste 1: Regras Always (Sempre Aplicadas)

1. Abra qualquer arquivo do projeto
2. Inicie conversa no Cursor (`Ctrl/Cmd+L`)
3. **Verifique:** As seguintes regras devem estar anexadas:
   - ✅ Contexto do Projeto
   - ✅ Regras TypeScript
   - ✅ Design System Rules
   - ✅ Code Quality Rules
   - ✅ Accessibility Rules

### Teste 2: Regras Auto (Por Globs)

1. **Teste IA Integration:**
   - Abra: `src/ai/config/llmRouter.ts` (ou qualquer arquivo em `src/ai/**`)
   - Inicie conversa
   - **Verifique:** Regra "IA Integration Rules" deve estar anexada

2. **Teste Supabase:**
   - Abra: `src/services/supabase/profileService.ts` (ou qualquer arquivo em `src/services/supabase/**`)
   - Inicie conversa
   - **Verifique:** Regra "Supabase Rules" deve estar anexada

3. **Teste Testing:**
   - Abra: `src/components/__tests__/Button.test.tsx` (ou qualquer `*.test.ts`)
   - Inicie conversa
   - **Verifique:** Regra "Testing Rules" deve estar anexada

---

## 📊 Passo 4: Ver Painel de Regras

### Abrir Workbench Panel:

1. **Command Palette:**
   - `Ctrl/Cmd+Shift+P`
   - Digite: `Cursor Workbench: Show Rules`

2. **Visualizar regras:**
   - Lista de todas as 7 regras
   - Status de cada regra (🟢/🟡/🔴/⚪)
   - Tags e globs configurados

3. **Editar regras:**
   - Clique em uma regra para editar
   - Salve alterações
   - Workbench detecta mudanças automaticamente

---

## 🔄 Passo 5: (Opcional) Criar Registry Remoto

### Para sincronizar regras entre projetos/equipe:

1. **Criar repositório GitHub:**

   ```bash
   # Criar novo repo (exemplo):
   # Nome: nossa-maternidade-cursor-rules
   # Visibilidade: Private (recomendado) ou Public
   ```

2. **Estrutura do repositório:**

   ```
   nossa-maternidade-cursor-rules/
   └── .cursor/
       └── rules/
           ├── 00-project-context.mdc
           ├── 01-typescript-rules.mdc
           ├── 02-design-system.mdc
           ├── 03-ai-integration.mdc
           ├── 04-supabase-rules.mdc
           ├── 05-testing-rules.mdc
           ├── 06-code-quality.mdc
           ├── 07-accessibility.mdc
           └── README.md
   ```

3. **Adicionar Registry no Workbench:**
   - Command Palette: `Cursor Workbench: Add Registry`
   - URL: `https://github.com/LionGab/nossa-maternidade-cursor-rules`
   - (Substitua pelo seu repositório)

4. **Sincronizar:**
   - Workbench detecta mudanças automaticamente
   - Status visual: 🟢 (atualizado) / 🟡 (pendente) / 🔴 (conflito)
   - Clique no status para sincronizar

---

## 🐛 Troubleshooting

### Problema: Workbench não detecta regras

**Solução:**

1. Verifique se `workbench.json` está na raiz do projeto
2. Verifique se arquivos `.mdc` estão em `.cursor/rules/`
3. Recarregue Cursor: `Ctrl/Cmd+Shift+P` → `Developer: Reload Window`

### Problema: Regras não são anexadas automaticamente

**Solução:**

1. Verifique `alwaysApply: true` nas regras que devem ser sempre aplicadas
2. Verifique `globs` nas regras auto (padrões devem corresponder aos arquivos)
3. Teste abrindo arquivo que corresponde ao glob

### Problema: Extensão não aparece

**Solução:**

1. Verifique se está usando Cursor (não VS Code)
2. Atualize Cursor para versão mais recente
3. Tente instalar manualmente via marketplace

---

## 📚 Referências

- **Cursor Workbench GitHub:** https://github.com/zackiles/cursor-workbench
- **Documentação Oficial:** Ver `.cursor/rules/README.md`
- **Projeto:** `CONTEXTO.md` (raiz do projeto)

---

## ✅ Checklist Final

- [ ] Extensão Cursor Workbench instalada
- [ ] Workbench Panel acessível via Command Palette
- [ ] Regras Always aplicadas automaticamente
- [ ] Regras Auto aplicadas por globs
- [ ] (Opcional) Registry remoto configurado

---

**Status:** Pronto para uso! 🎉

Se encontrar problemas, verifique `.cursor/rules/README.md` para mais detalhes.
