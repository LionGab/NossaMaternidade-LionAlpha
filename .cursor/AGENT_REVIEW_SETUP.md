# 🔍 Como Ativar Agent Review Automático no Cursor

> **Guia passo-a-passo para configurar revisão automática de código**

---

## 📋 O Que É Agent Review?

O **Agent Review** é uma funcionalidade do Cursor que analisa automaticamente seu código após commits, identificando:
- 🐛 Bugs potenciais
- 🔍 Code smells
- 🔒 Problemas de segurança
- 📐 Violações de design system
- ⚠️ Problemas de performance

---

## ✅ Passo a Passo para Ativar

### **Método 1: Via Settings UI (Recomendado)**

1. **Abra as Configurações do Cursor:**
   - **Windows/Linux:** `Ctrl+,` (Ctrl + vírgula)
   - **Mac:** `Cmd+,` (Cmd + vírgula)
   - Ou: Menu → **File** → **Preferences** → **Settings**

2. **Navegue até a seção de Agent:**
   - Na barra de busca das configurações, digite: `agent review`
   - Ou procure por: **"Cursor: Agent"** ou **"Auto Review"**

3. **Ative as opções:**
   - ✅ **"Cursor: Enable Agent Review"** → Marque como `true`
   - ✅ **"Cursor: Agent Review on Commit"** → Marque como `true`
   - ✅ **"Cursor: Agent Review on Save"** (opcional) → Marque como `true` se quiser revisão ao salvar

4. **Configure o nível de análise:**
   - **"Cursor: Agent Review Level"** → Escolha:
     - `basic` - Análise rápida (recomendado para começar)
     - `standard` - Análise completa (padrão)
     - `strict` - Análise rigorosa (pode ser mais lento)

5. **Salve as configurações:**
   - As mudanças são aplicadas automaticamente

---

### **Método 2: Via settings.json (Avançado)**

Se preferir editar diretamente o arquivo de configurações:

1. **Abra o arquivo de configurações:**
   - **Windows/Linux:** `Ctrl+Shift+P` → Digite: `Preferences: Open User Settings (JSON)`
   - **Mac:** `Cmd+Shift+P` → Digite: `Preferences: Open User Settings (JSON)`

2. **Adicione as seguintes configurações:**

```json
{
  // Agent Review - Revisão Automática de Código
  "cursor.agent.review.enabled": true,
  "cursor.agent.review.onCommit": true,
  "cursor.agent.review.onSave": false,
  "cursor.agent.review.level": "standard",
  "cursor.agent.review.includeTests": true,
  "cursor.agent.review.checkSecurity": true,
  "cursor.agent.review.checkPerformance": true,
  "cursor.agent.review.checkDesignSystem": true
}
```

3. **Salve o arquivo** (`Ctrl+S` / `Cmd+S`)

---

## 🎯 Configurações Recomendadas para Nossa Maternidade

Baseado nas regras do projeto, recomendo:

```json
{
  "cursor.agent.review.enabled": true,
  "cursor.agent.review.onCommit": true,
  "cursor.agent.review.onSave": false,
  "cursor.agent.review.level": "standard",
  "cursor.agent.review.includeTests": true,
  "cursor.agent.review.checkSecurity": true,
  "cursor.agent.review.checkPerformance": true,
  "cursor.agent.review.checkDesignSystem": true,
  
  // Regras específicas do projeto
  "cursor.agent.review.rules": [
    "check-typescript-strict",
    "check-no-console-log",
    "check-design-tokens",
    "check-rls-policies",
    "check-accessibility",
    "check-dark-mode"
  ]
}
```

---

## 🔍 Como Funciona Após Ativar

### **Após Cada Commit:**

1. Você faz commit normalmente (`git commit`)
2. O Agent Review é acionado automaticamente
3. Uma notificação aparece no Cursor mostrando:
   - ✅ **Issues encontrados** (se houver)
   - ✅ **Sugestões de melhoria**
   - ✅ **Violações de regras do projeto**

### **O Que É Analisado:**

- ✅ **TypeScript:** Tipos corretos, zero `any`
- ✅ **Design System:** Uso de tokens, primitives
- ✅ **Segurança:** RLS policies, sanitização
- ✅ **Performance:** FlatList, memo, useMemo
- ✅ **Acessibilidade:** Labels, touch targets, contraste
- ✅ **Arquitetura:** Services pattern, hooks

---

## 📊 Exemplo de Saída do Agent Review

```
🔍 Agent Review - Commit: abc123

✅ TypeScript: 0 errors
✅ Design Tokens: Todos corretos
⚠️  Performance: FlatList sem getItemLayout em FeedScreen.tsx
⚠️  Acessibilidade: Touch target < 44pt em Button.tsx
✅ RLS Policies: Todas presentes
✅ Dark Mode: Implementado

Sugestões:
- Adicionar getItemLayout em FlatList para melhor performance
- Aumentar touch target do Button para 44pt mínimo
```

---

## ⚙️ Configurações Avançadas

### **Ignorar Arquivos Específicos:**

Se quiser que o Agent Review ignore certos arquivos:

```json
{
  "cursor.agent.review.ignore": [
    "**/node_modules/**",
    "**/.expo/**",
    "**/dist/**",
    "**/build/**",
    "**/*.test.ts",
    "**/*.spec.ts"
  ]
}
```

### **Regras Customizadas:**

Você pode criar regras específicas baseadas nas regras do projeto:

```json
{
  "cursor.agent.review.customRules": {
    "no-hardcoded-colors": {
      "enabled": true,
      "severity": "error",
      "message": "Use design tokens (useThemeColors()) ao invés de cores hardcoded"
    },
    "always-flatlist": {
      "enabled": true,
      "severity": "warning",
      "message": "Use FlatList para listas, não ScrollView + map"
    }
  }
}
```

---

## 🚨 Troubleshooting

### **Agent Review não está funcionando:**

1. **Verifique se está ativado:**
   - Settings → Busque por "agent review"
   - Confirme que `cursor.agent.review.enabled` está `true`

2. **Reinicie o Cursor:**
   - Feche completamente o Cursor
   - Abra novamente

3. **Verifique logs:**
   - `Ctrl+Shift+P` → `Output: Show Output`
   - Selecione "Cursor Agent" no dropdown

### **Agent Review está muito lento:**

1. **Reduza o nível:**
   - Mude `level` de `strict` para `standard` ou `basic`

2. **Desative revisão ao salvar:**
   - Mantenha apenas `onCommit: true`
   - Desative `onSave: false`

3. **Configure ignore patterns:**
   - Adicione arquivos grandes/pesados ao ignore

---

## ✅ Checklist de Ativação

- [ ] Abrir Settings do Cursor (`Ctrl+,` / `Cmd+,`)
- [ ] Buscar por "agent review"
- [ ] Ativar `cursor.agent.review.enabled`
- [ ] Ativar `cursor.agent.review.onCommit`
- [ ] Configurar nível (`standard` recomendado)
- [ ] Salvar configurações
- [ ] Fazer um commit de teste
- [ ] Verificar se a revisão aparece

---

## 📚 Referências

- **Documentação Cursor:** https://cursor.com/docs/agent/review
- **Regras do Projeto:** `.cursor/rules`
- **Guia Prático:** `.cursor/CURSOR_GUIDE.md`

---

**Última atualização:** Dezembro 2025

