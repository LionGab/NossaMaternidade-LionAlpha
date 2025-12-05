# 🎯 CURSOR: Guia Prático Ultra-Eficiente - Nossa Maternidade

> **Guia condensado e acionável para uso eficiente do Cursor AI no projeto**

---

## ⚡ PRIMEIROS PASSOS (Faça AGORA)

### 1. Arquivos de Contexto Criados ✅

- ✅ `.cursor/rules` - Regras técnicas do projeto
- ✅ `AGENTS.md` - Contexto para agentes IA (raiz do projeto)
- ✅ `.cursor/CURSOR_GUIDE.md` - Este guia prático
- ✅ `.cursor/AGENT_REVIEW_SETUP.md` - Guia completo de Agent Review

### 2. Configuração Recomendada

**Settings → Auto-Run:**
- ✅ Terminal: "Executar em Sandbox" (allowlist: `expo`, `eas`, `npm`, `supabase`)
- ✅ Browser: Habilitado (para testes PWA, Figma, OAuth flows)
- ✅ Agent Review: **Ver guia completo em `.cursor/AGENT_REVIEW_SETUP.md`**

**⚡ Ativação Rápida do Agent Review:**
1. `Ctrl+,` (ou `Cmd+,` no Mac) → Abrir Settings
2. Buscar: `agent review`
3. Ativar: `cursor.agent.review.enabled: true`
4. Ativar: `cursor.agent.review.onCommit: true`
5. Nível: `standard` (recomendado)

---

## 🤖 3 MODOS ESSENCIAIS

### **Modo AGENT (`Ctrl+I`)** - Desenvolvimento Diário

**Use para:** Features, bugs, refactors multi-arquivo

**Exemplo:**
```
Ctrl+I

"Implementar tela de perfil da gestante com:
- Upload de foto (Supabase Storage)
- Edição de dados (nome, DPP, idade gestacional)
- RLS policy para user_id
- Hook useProfile com React Query cache"
```

**Agent vai:**
- ✅ Pesquisar código atual
- ✅ Criar componente, hook, types
- ✅ Configurar Supabase Storage
- ✅ Gerar RLS policies SQL
- ✅ Escrever testes

### **Modo PLAN (`Shift+Tab`)** - Arquitetura

**Use para:** Features grandes, migrações, decisões arquiteturais

**Exemplo:**
```
Shift+Tab → Plan Mode

"Adicionar sistema de posts da comunidade:
- Feed infinito (FlatList)
- Curtidas e comentários
- Notificações push
- Moderação de conteúdo
- Incluir migrations Supabase"
```

**Agent vai:**
1. Fazer perguntas clarificadoras
2. Pesquisar padrões existentes
3. **Gerar plano em Markdown** (você revisa antes!)
4. Executar passo a passo com sua aprovação

**💡 Pro tip:** Planos são salvos em `.cursor/plans/` para documentar decisões

### **Modo ASK (`Ctrl+.` → Ask)** - Exploração

**Use para:** Entender código, read-only

**Exemplo:**
```
"Como funciona o fluxo de autenticação atual?
Quais hooks estão envolvidos?"
```

Agent analisa sem modificar nada.

---

## 🛠️ FERRAMENTAS CRÍTICAS

### **Terminal Automático**

**Configure:** Settings → Auto-Run → **"Executar em Sandbox"**

Agent pode rodar automaticamente:
```bash
expo start
eas build --platform ios
supabase migration list
npm test
```

**Allowlist recomendada:** `expo`, `eas`, `npm`, `supabase`, `npx`

### **Browser para Testes**

**Use para:**
- Testar PWA antes de build nativa
- Capturar designs Figma → código
- Debugar OAuth flows
- Validar deep links

**Ative:** Settings → Auto-Run → Habilitar Browser

### **MCP Supabase**

Já configurado em `mcp.json`. Agent pode:
- Consultar schema do DB automaticamente
- Gerar migrations
- Validar RLS policies

---

## 📋 WORKFLOW DIÁRIO

### **Feature Nova:**

```
1. Shift+Tab (Plan Mode)
   "Adicionar busca de profissionais de saúde com filtros"

2. Agent pergunta: geolocalização? categorias? favoritos?

3. Revisa plano gerado

4. Ctrl+I para executar

5. Agent usa ferramentas:
   - Codebase search
   - Read files
   - Terminal (migrations)
   - Edit (criar componentes)

6. REVISAR DIFFS arquivo por arquivo

7. Aceitar seletivamente
```

### **Bug:**

```
1. Ctrl+I (Agent Mode)
   "FlatList do feed trava ao fazer scroll rápido"

2. Agent investiga

3. Propõe fix (useMemo, windowSize, etc)

4. Revisa diffs

5. Clique "Review" → "Find Issues" para análise extra
```

---

## 🔐 SEGURANÇA SUPABASE

**Regras críticas (já em `.cursor/rules`):**
- ❌ NUNCA usar `service_role_key` no app
- ✅ SEMPRE usar RLS policies
- ✅ Services retornam `{ data, error }` pattern
- ✅ Validar inputs com Zod

**Exemplo de RLS Policy:**
```sql
CREATE POLICY "Usuários veem só seus dados"
ON profiles FOR SELECT
USING (auth.uid() = user_id);
```

---

## ✅ REVISÃO DE CÓDIGO (CRÍTICO)

**NUNCA aceite diffs sem revisar!**

### **Checklist:**

- [ ] Tipos TypeScript corretos?
- [ ] RLS policies implementadas?
- [ ] Compatível iOS + Android?
- [ ] Try-catch em chamadas async?
- [ ] Testes incluídos?
- [ ] Design tokens usados (não hardcoded)?
- [ ] Dark mode implementado?
- [ ] Acessibilidade (labels, touch targets)?

### **Agent Review Automático:**

**📖 Guia Completo:** Veja `.cursor/AGENT_REVIEW_SETUP.md` para instruções detalhadas

**Ativação Rápida:**
1. Settings (`Ctrl+,` / `Cmd+,`)
2. Buscar: `agent review`
3. Ativar: `cursor.agent.review.enabled: true`
4. Ativar: `cursor.agent.review.onCommit: true`
5. Nível: `standard` (recomendado)

Depois de cada commit, Agent analisa e aponta:
- Bugs potenciais
- Code smells
- Problemas de segurança
- Violações de design system

---

## ⚡ ATALHOS ESSENCIAIS

| Ação | Atalho | Quando usar |
|------|--------|-------------|
| Agent Full | `Ctrl+I` | Features, bugs |
| Plan Mode | `Shift+Tab` | Arquitetura |
| Inline Edit | `Ctrl+K` | Refactor rápido < 50 linhas |
| Enfileirar | `Ctrl+Enter` | Múltiplas tarefas sem esperar |
| Histórico | `Alt+Ctrl+'` | Recuperar contexto passado |
| Alternar modo | `Ctrl+.` | Ask ↔ Agent |
| Composer | `Cmd+Shift+I` (Mac) / `Ctrl+Shift+I` (Win) | Edições multi-arquivo |

---

## 🚀 EXEMPLO REAL: PUSH NOTIFICATIONS

### **Prompt (Plan Mode):**

```
Shift+Tab

"Implementar notificações push usando Expo Notifications:
- Salvar tokens no Supabase (tabela push_tokens)
- RLS policies
- Hook usePushNotifications
- Testar iOS e Android
- Migrations incluídas
- Envio via Cloud Function"
```

### **Agent vai:**

1. Perguntar: FCM? APNs? Background? Badge?
2. Gerar plano completo
3. Criar migration SQL
4. Implementar hook
5. Configurar `app.json`
6. Criar Cloud Function
7. Gerar testes

### **Você:**

- Revisa plano antes de executar
- Aprova etapa por etapa
- Testa em Expo Go
- Agent Review antes do commit

---

## 🎨 DESIGN → CÓDIGO (Figma Integration)

```
1. Abra Figma no Agent Browser

2. "Capture this screen and convert to React Native"

3. Agent extrai:
   - Cores (#hex)
   - Fonts (family, weight, size)
   - Spacings (margins, paddings)
   - Layouts (flex, absolute)

4. Gera componente com NativeWind + primitives
```

**Resultado:** Componente pronto com design system consistente.

---

## 🚨 ERROS COMUNS

❌ **NÃO faça:**
- Aceitar todos os diffs (`Accept All`)
- Usar Agent sem revisar `.cursor/rules`
- Ignorar Agent Review
- Expor credenciais Supabase
- Hardcoded colors/spacing

✅ **SEMPRE faça:**
- Revisar diffs arquivo por arquivo
- Usar Plan Mode para features grandes
- Configurar regras no início do projeto
- Testar em iOS E Android
- Usar design tokens

---

## 🎯 AÇÃO IMEDIATA

**Hoje (próxima hora):**
1. ✅ Arquivos de contexto criados
2. ✅ Configurar Terminal Auto-Run
3. ✅ Ativar Agent Review automático

**Esta semana:**
1. ✅ Testar Plan Mode em uma feature do Nossa Maternidade
2. ✅ Configurar MCP Supabase (já feito)
3. ✅ Testar Browser para capturar Figma designs

**Resultado esperado:**
- ⚡ Velocidade 3-5x maior
- 🛡️ Código mais seguro (RLS sempre correto)
- 📐 Arquitetura consistente
- 🧪 Bugs detectados antes de produção

---

## 🚀 YOLO MODE (Aceitação Automática)

**⚠️ MODO AVANÇADO ATIVADO!**

O YOLO MODE está configurado para aceitar automaticamente sugestões do Cursor.

**Configuração Atual:**
- ✅ Cursor Tab: Auto-aceita sugestões inline (seguro)
- ✅ Composer: Auto-aplica com confiança ≥ 85% (cuidado)
- ❌ Chat Edits: Desativado (sempre revise)

**📖 Guia Completo:** Veja `.cursor/YOLO_MODE_GUIDE.md` para:
- Avisos de segurança
- Como desativar rapidamente
- Boas práticas
- Troubleshooting

**⚠️ Lembrete:** YOLO MODE acelera desenvolvimento, mas **não substitui revisão humana**. Sempre revise código antes de commit!

---

## 📚 Referências

- **Regras Técnicas:** `.cursor/rules`
- **Contexto Projeto:** `AGENTS.md` (raiz)
- **Design System:** `docs/design/`
- **Cérebro Externo:** `CONTEXTO.md` (raiz)
- **YOLO MODE:** `.cursor/YOLO_MODE_GUIDE.md` 🚀

---

**Última atualização:** Dezembro 2025  
**Status:** 🚀 YOLO MODE ATIVADO (Moderado)

