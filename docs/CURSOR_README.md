# 🚀 Claude no Cursor - Nossa Maternidade

**Guia completo para configurar e usar Claude no Cursor com máxima eficiência**

---

## 📚 Documentação Disponível

### 1. **Quick Start** (10 minutos) ⚡

**Arquivo:** `docs/CURSOR_QUICK_START.md`

Comece aqui! Setup rápido e primeiros passos práticos.

```
✅ Setup básico (5 min)
✅ Primeiros testes (5 min)
✅ Checklist de verificação
```

---

### 2. **Guia Completo** (Leitura completa) 📖

**Arquivo:** `docs/CURSOR_CLAUDE_SETUP.md`

O guia definitivo com tudo que você precisa saber:

- ✅ Configuração passo a passo
- ✅ Otimizações de performance
- ✅ Melhores práticas avançadas
- ✅ Antipadrões comuns (evita erros caros!)
- ✅ Troubleshooting expandido
- ✅ Curva de aprendizado (Semana 1-4)
- ✅ Métricas de sucesso
- ✅ FAQ completo

**Tamanho:** 1228 linhas de conhecimento prático

---

### 3. **Templates de Prompts** (Pronto para usar) 📝

**Arquivo:** `docs/CURSOR_PROMPT_TEMPLATES.md`

Templates prontos para copiar, colar e ajustar:

- ✅ Criar componente novo
- ✅ Refatorar tela para design tokens
- ✅ Integrar service com Supabase
- ✅ Implementar feature completa
- ✅ Debug e correção de erros
- ✅ Refatoração de múltiplos arquivos
- ✅ Explorar e entender código
- ✅ Otimização de performance
- ✅ Templates específicos do projeto

**Uso:** Copie o template, ajuste os placeholders, cole no Cursor!

---

### 4. **Checklist de Implementação** ✅

**Arquivo:** `docs/CURSOR_IMPLEMENTATION_CHECKLIST.md`

Checklist prático para acompanhar o progresso:

- ✅ Status de cada item
- ✅ Próximos passos claros
- ✅ Métricas de sucesso
- ✅ Troubleshooting rápido

### 5. **Próximos Passos** (Após verificação) 🎯

**Arquivo:** `docs/CURSOR_NEXT_STEPS.md`

Guia passo a passo para configuração manual:

- ✅ Como obter API Key
- ✅ Como configurar no Cursor
- ✅ Como testar configuração
- ✅ Troubleshooting detalhado

---

## ⚡ Início Rápido

### 1. Verificar Configuração Atual

```bash
npm run verify:cursor
```

### 2. Configurar (se necessário)

Siga o **Quick Start**: `docs/CURSOR_QUICK_START.md`

### 3. Começar a Usar

Use os **Templates**: `docs/CURSOR_PROMPT_TEMPLATES.md`

---

## 🎯 Por Onde Começar?

### Se você é novo aqui:

1. **Quick Start** (10 min) → `docs/CURSOR_QUICK_START.md`
2. **Templates** (5 min) → `docs/CURSOR_PROMPT_TEMPLATES.md`
3. **Antipadrões** (10 min) → Seção 7 do guia completo

### Se você já configurou:

1. **Templates** → Use os templates prontos
2. **Melhores Práticas** → Seção 6 do guia completo
3. **Otimizações** → Seção 4 do guia completo

### Se você quer aprofundar:

1. **Guia Completo** → Leia tudo
2. **Troubleshooting** → Seção 9 do guia completo
3. **Métricas** → Seção 10 do guia completo

---

## 🔧 Ferramentas Disponíveis

### Script de Verificação

```bash
npm run verify:cursor
```

Verifica:

- ✅ `.cursor/settings.json` configurado
- ✅ `.cursor/rules` presente
- ✅ `.cursorignore` configurado
- ✅ Documentação presente
- ✅ Estrutura do projeto OK

---

## 📁 Arquivos de Configuração

### `.cursor/settings.json`

Configurações otimizadas do Cursor para Claude:

- Modelo padrão: Claude Sonnet 4.5
- Codebase Indexing habilitado
- Context Window: Large (8192 tokens)

### `.cursor/rules`

Regras do projeto que o Claude segue automaticamente:

- Design tokens obrigatórios
- Componentes primitivos
- WCAG AAA acessibilidade
- Performance mobile

### `.cursorignore`

Otimização de contexto (economia 30-50% tokens):

- Exclui `node_modules/`, `.expo/`, `dist/`, etc.
- Reduz tokens desnecessários

---

## ⚡ Atalhos Essenciais

| Ação             | Windows/Linux      | Mac               |
| ---------------- | ------------------ | ----------------- |
| Abrir Chat       | `Ctrl + L`         | `Cmd + L`         |
| Composer (Agent) | `Ctrl + Shift + I` | `Cmd + Shift + I` |
| Inline Edit      | `Ctrl + K`         | `Cmd + K`         |
| Settings         | `Ctrl + ,`         | `Cmd + ,`         |
| Aceitar Sugestão | `Tab`              | `Tab`             |

---

## 💡 Pro Tips

### 1. Economia de Tokens

- ✅ Use `@arquivo.ts` em vez de copiar código
- ✅ Inicie novas conversas para novos tópicos
- ✅ Use Haiku para exploração (mais barato)
- ✅ `.cursorignore` configurado (economia 30-50%)

### 2. Qualidade de Respostas

- ✅ Seja específico no prompt
- ✅ Inclua arquivos relacionados com `@`
- ✅ Referencie exemplos similares
- ✅ Mencione padrões do projeto

### 3. Workflow Rápido

```
Você sabe EXATAMENTE o que fazer?
├─ SIM → Ctrl+K (Inline Edit)
└─ NÃO → Precisa entender código?
   ├─ SIM → Ctrl+L (Chat) → Haiku
   └─ NÃO → Ctrl+Shift+I (Composer)
```

---

## 🆘 Precisa de Ajuda?

### Problemas de Configuração

1. Execute: `npm run verify:cursor`
2. Consulte: `docs/CURSOR_CLAUDE_SETUP.md` - Seção "Troubleshooting"

### Problemas de Uso

1. Consulte: `docs/CURSOR_PROMPT_TEMPLATES.md`
2. Leia: Antipadrões no guia completo (evita erros!)

### Dúvidas Gerais

1. Consulte: FAQ no guia completo
2. Verifique: Links úteis no guia completo

---

## 📊 Status da Implementação

### ✅ Completo (100%)

- [x] Arquivos de configuração criados
- [x] Scripts de verificação funcionando
- [x] Documentação completa escrita
- [x] Templates de prompts prontos
- [x] Quick Start disponível
- [x] Checklist de implementação criado

### ⏳ Pendente (Configuração Manual)

- [ ] API Key configurada no Cursor
- [ ] Plano Max do Claude ativo
- [ ] Modelo padrão selecionado
- [ ] Testes básicos realizados

**Siga:** `docs/CURSOR_QUICK_START.md` para completar

---

## 🔗 Links Úteis

- **Cursor Docs**: https://docs.cursor.com
- **Claude Console**: https://console.anthropic.com
- **Claude Settings**: https://claude.ai/settings

---

## 📚 Estrutura de Documentação

```
docs/
├── CURSOR_README.md (este arquivo) ← VOCÊ ESTÁ AQUI
├── CURSOR_QUICK_START.md (10 min setup)
├── CURSOR_CLAUDE_SETUP.md (guia completo)
├── CURSOR_PROMPT_TEMPLATES.md (templates prontos)
└── CURSOR_IMPLEMENTATION_CHECKLIST.md (checklist)

.cursor/
├── settings.json (configurações)
└── rules (regras do projeto)

.cursorignore (otimização)

scripts/
└── verify-cursor-setup.js (verificação)
```

---

## ✅ Próximos Passos

1. **Hoje** (15 min):
   - [ ] Seguir `docs/CURSOR_QUICK_START.md`
   - [ ] Configurar API Key
   - [ ] Testar chat básico

2. **Esta Semana** (30 min/dia):
   - [ ] Explorar templates
   - [ ] Ler antipadrões
   - [ ] Otimizar workflow

3. **Próximas Semanas**:
   - [ ] Criar Rules personalizadas
   - [ ] Documentar aprendizados
   - [ ] Compartilhar com time

---

**Última atualização:** 29/11/2025  
**Mantido por:** Equipe Nossa Maternidade
