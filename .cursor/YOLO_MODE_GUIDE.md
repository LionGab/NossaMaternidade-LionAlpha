# 🚀 YOLO MODE - Guia de Aceitação Automática

> **⚠️ MODO AVANÇADO: Use com responsabilidade!**

---

## ⚠️ AVISOS IMPORTANTES

### **O Que É YOLO MODE?**

O **YOLO MODE** (You Only Live Once Mode) é uma configuração que permite aceitação automática de sugestões do Cursor **sem revisão manual**.

### **⚠️ RISCOS:**

- ❌ **Código pode ter bugs** não detectados
- ❌ **Violações de design system** podem passar
- ❌ **Problemas de segurança** podem ser introduzidos
- ❌ **Performance issues** podem não ser detectados
- ❌ **Mudanças inesperadas** podem quebrar funcionalidades

### **✅ QUANDO USAR:**

- ✅ **Prototipação rápida**
- ✅ **Features experimentais** (branch separada)
- ✅ **Refactoring simples** e bem definido
- ✅ **Correções óbvias** (typos, formatação)
- ✅ **Desenvolvimento local** (não produção)

### **❌ QUANDO NÃO USAR:**

- ❌ **Código de produção**
- ❌ **Mudanças críticas** (auth, segurança, pagamentos)
- ❌ **Primeira vez usando uma feature**
- ❌ **Código que afeta múltiplos arquivos**
- ❌ **Antes de commits importantes**

---

## ⚙️ Configurações Ativadas

### **1. Cursor Tab (Inline Suggestions)**

```json
{
  "cursor.tab.autoAccept": true,
  "cursor.tab.autoAcceptDelay": 100
}
```

**O que faz:**
- Aceita automaticamente sugestões inline após 100ms
- Você ainda pode rejeitar com `Esc` ou `Ctrl+Z`

**Recomendação:** ✅ Seguro para uso diário (sugestões são pequenas)

### **2. Composer (Multi-File Edits)**

```json
{
  "cursor.composer.autoApply": true,
  "cursor.composer.autoApplyConfidence": 0.85,
  "cursor.composer.skipReview": true
}
```

**O que faz:**
- Aplica automaticamente edições do Composer
- Apenas se confiança ≥ 85%
- Pula tela de revisão

**Recomendação:** ⚠️ Use com cuidado (edita múltiplos arquivos)

### **3. Chat Edits**

```json
{
  "cursor.chat.autoAcceptEdits": false
}
```

**Status:** ❌ **DESATIVADO** (recomendado)

**Por quê:** Edições via Chat podem ser grandes e complexas. Sempre revise!

---

## 🎯 Níveis de YOLO MODE

### **Nível 1: Conservador (Recomendado para Começar)**

```json
{
  "cursor.tab.autoAccept": true,
  "cursor.tab.autoAcceptDelay": 500,
  "cursor.composer.autoApply": false,
  "cursor.chat.autoAcceptEdits": false
}
```

**Uso:** Apenas sugestões inline pequenas são aceitas automaticamente.

### **Nível 2: Moderado (Atual)**

```json
{
  "cursor.tab.autoAccept": true,
  "cursor.tab.autoAcceptDelay": 100,
  "cursor.composer.autoApply": true,
  "cursor.composer.autoApplyConfidence": 0.85,
  "cursor.composer.skipReview": true,
  "cursor.chat.autoAcceptEdits": false
}
```

**Uso:** Sugestões inline + Composer com alta confiança.

### **Nível 3: YOLO Completo (⚠️ Perigoso)**

```json
{
  "cursor.tab.autoAccept": true,
  "cursor.tab.autoAcceptDelay": 50,
  "cursor.composer.autoApply": true,
  "cursor.composer.autoApplyConfidence": 0.70,
  "cursor.composer.skipReview": true,
  "cursor.chat.autoAcceptEdits": true
}
```

**Uso:** ⚠️ **NÃO RECOMENDADO** - Aceita tudo automaticamente!

---

## 🛡️ Proteções Recomendadas

### **1. Git Hooks**

Configure pre-commit hooks para validar código:

```bash
# .husky/pre-commit
npm run type-check
npm run lint
npm run validate:design
```

### **2. Agent Review**

Mantenha Agent Review ativado para detectar problemas:

```json
{
  "cursor.agent.review.enabled": true,
  "cursor.agent.review.onCommit": true
}
```

### **3. Branch Separada**

Use YOLO MODE apenas em branches de desenvolvimento:

```bash
git checkout -b feature/yolo-experiment
# Use YOLO MODE aqui
# Antes de merge, desative e revise tudo
```

### **4. Revisão Periódica**

Mesmo com YOLO MODE, revise código regularmente:
- Antes de cada commit
- Antes de push
- Antes de merge para main

---

## 🔄 Como Desativar Rapidamente

### **Método 1: Via Settings UI**

1. `Ctrl+,` (ou `Cmd+,`)
2. Buscar: `auto accept`
3. Desativar todas as opções

### **Método 2: Via settings.json**

Edite `.cursor/settings.json`:

```json
{
  "cursor.tab.autoAccept": false,
  "cursor.composer.autoApply": false,
  "cursor.chat.autoAcceptEdits": false
}
```

### **Método 3: Atalho Rápido**

Crie um atalho para alternar YOLO MODE:

```json
{
  "key": "ctrl+shift+y",
  "command": "cursor.toggleYoloMode"
}
```

---

## 📊 Monitoramento

### **O Que Monitorar:**

1. **Taxa de erros:** Aumentou após ativar YOLO MODE?
2. **Code review:** Quantos problemas são encontrados?
3. **Bugs em produção:** Houve aumento?
4. **Performance:** Código está mais lento?

### **Métricas Recomendadas:**

- ✅ TypeScript errors: Deve permanecer 0
- ✅ ESLint warnings: Monitorar aumento
- ✅ Test failures: Não deve aumentar
- ✅ Build time: Não deve aumentar significativamente

---

## ✅ Checklist Antes de Usar YOLO MODE

- [ ] Entendi os riscos
- [ ] Estou em branch de desenvolvimento (não main)
- [ ] Agent Review está ativado
- [ ] Pre-commit hooks configurados
- [ ] Tenho tempo para revisar código depois
- [ ] Não estou trabalhando em código crítico (auth, pagamentos, etc.)
- [ ] Sei como desativar rapidamente

---

## 🎯 Boas Práticas com YOLO MODE

### **✅ FAÇA:**

- ✅ Use para prototipação rápida
- ✅ Revise código antes de commit
- ✅ Use em branches separadas
- ✅ Mantenha Agent Review ativado
- ✅ Teste código após mudanças automáticas
- ✅ Revise diffs antes de push

### **❌ NÃO FAÇA:**

- ❌ Use em código de produção direto
- ❌ Confie 100% no código gerado
- ❌ Ignore erros do TypeScript/ESLint
- ❌ Commit sem revisar diffs
- ❌ Use em código crítico (segurança, pagamentos)
- ❌ Desative validações (type-check, lint)

---

## 🚨 Troubleshooting

### **YOLO MODE aceitou código ruim:**

1. **Desative imediatamente:** `Ctrl+,` → buscar "auto accept" → desativar
2. **Reverta mudanças:** `git checkout .` ou `git reset --hard HEAD`
3. **Revise o que aconteceu:** `git diff` para ver mudanças
4. **Reative com mais cuidado:** Use nível conservador

### **Muitos erros após ativar:**

1. **Reduza confiança mínima:** `autoApplyConfidence: 0.90` ou `0.95`
2. **Aumente delay:** `autoAcceptDelay: 500` ou `1000`
3. **Desative Composer auto-apply:** Mantenha apenas Tab
4. **Use Agent Review:** Para detectar problemas cedo

---

## 📚 Referências

- **Configurações Atuais:** `.cursor/settings.json`
- **Guia Cursor:** `.cursor/CURSOR_GUIDE.md`
- **Agent Review:** `.cursor/AGENT_REVIEW_SETUP.md`

---

## 🎉 Resumo

**YOLO MODE está ATIVADO** com configurações moderadas:

- ✅ **Cursor Tab:** Auto-aceita sugestões inline (seguro)
- ✅ **Composer:** Auto-aplica com confiança ≥ 85% (cuidado)
- ❌ **Chat Edits:** Desativado (sempre revise)

**Lembrete:** YOLO MODE acelera desenvolvimento, mas **não substitui revisão humana**. Sempre revise código antes de commit!

---

**Última atualização:** Dezembro 2025  
**Status:** 🚀 YOLO MODE ATIVADO (Moderado)

