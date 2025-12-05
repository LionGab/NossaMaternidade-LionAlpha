# 🔧 Configuração MCP - Nossa Maternidade

Guia completo de configuração dos Model Context Protocol (MCP) servers para o projeto.

---

## 📋 Visão Geral

O projeto utiliza múltiplos servidores MCP para:
- **Database & Backend**: Supabase MCP
- **IA & Documentação**: Context7, OpenAI, Anthropic
- **Busca**: Brave Search
- **Desenvolvimento**: GitHub, Filesystem, Git
- **Validação**: Design Tokens, Code Quality, Accessibility
- **Automação**: Docker Gateway, Playwright, Puppeteer

---

## ✅ Configuração Rápida

### 1. Arquivo `.env`

Crie o arquivo `.env` na raiz do projeto com todas as variáveis necessárias:

```bash
# Brave Search
BRAVE_API_KEY=BSA_HzGhPTbT2loxQCr5jw95NGgMAqk

# Supabase
EXPO_PUBLIC_SUPABASE_URL=https://mnszbkeuerjcevjvdqme.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=sua_chave_aqui
SUPABASE_SERVICE_ROLE_KEY=sua_chave_aqui

# PostgreSQL
POSTGRES_CONNECTION_STRING=postgresql://user:pass@host:5432/db

# AI APIs
EXPO_PUBLIC_CLAUDE_API_KEY=sua_chave_aqui
EXPO_PUBLIC_OPENAI_API_KEY=sua_chave_aqui

# Sentry
EXPO_PUBLIC_SENTRY_DSN=sua_dsn_aqui

# GitHub (opcional)
GITHUB_TOKEN=seu_token_aqui
```

### 2. Arquivo `mcp.json`

O arquivo `mcp.json` já está configurado na raiz do projeto. Ele contém:

- **17 servidores MCP** configurados
- **Caminhos relativos** ao workspace
- **Variáveis de ambiente** para secrets

### 3. Gerar `mcp.json` Dinamicamente

Para regenerar o `mcp.json` com caminhos atualizados:

```bash
node scripts/generate-mcp-config.js
```

Este script:
- ✅ Detecta o workspace atual automaticamente
- ✅ Lê variáveis do `.env` se disponível
- ✅ Gera caminhos absolutos para runners customizados
- ✅ Mantém variáveis de ambiente para secrets

---

## 🎯 Servidores MCP Configurados

### Essenciais (Carregados Imediatamente)

| Servidor | Função | Status |
|----------|--------|--------|
| **supabase** | Database, Auth, Storage | ✅ Essencial |
| **context7** | Documentação de bibliotecas | ✅ Essencial |
| **docker** | Gateway para múltiplos MCPs | ✅ Essencial |
| **brave-search** | Busca web | ✅ Essencial |

### IA & Análise

| Servidor | Função | Status |
|----------|--------|--------|
| **postgres** | Acesso direto ao PostgreSQL | ⚙️ Opcional |
| **github** | Integração GitHub | ⚙️ Opcional |

### Desenvolvimento

| Servidor | Função | Status |
|----------|--------|--------|
| **filesystem** | Acesso ao filesystem | ⚙️ Opcional |
| **git** | Operações Git | ⚙️ Opcional |
| **playwright** | Automação de browser | ⚙️ Opcional |
| **puppeteer** | Automação de browser | ⚙️ Opcional |
| **chrome-devtools** | Debugging | ⚙️ Opcional |

### Validação (Custom Runners)

| Servidor | Função | Runner |
|----------|--------|--------|
| **design-tokens** | Validação de design tokens | `src/mcp/runners/design-tokens-runner.js` |
| **code-quality** | Análise de qualidade | `src/mcp/runners/code-quality-runner.js` |
| **accessibility** | Auditoria WCAG AAA | `src/mcp/runners/accessibility-runner.js` |
| **mobile-optimization** | Otimizações mobile | `src/mcp/runners/mobile-optimization-runner.js` |
| **prompt-testing** | Validação de prompts | `src/mcp/runners/prompt-testing-runner.js` |

### Memória & Persistência

| Servidor | Função | Status |
|----------|--------|--------|
| **basicmemory** | Memória persistente | ⚙️ Opcional |

---

## 🔐 Segurança

### Variáveis Sensíveis

**NUNCA** commite no Git:
- ✅ `.env` (já está no `.gitignore`)
- ✅ `mcp.json` com secrets hardcoded (use variáveis de ambiente)

### Boas Práticas

1. **Use variáveis de ambiente** no `mcp.json`:
   ```json
   {
     "env": {
       "BRAVE_API_KEY": "${BRAVE_API_KEY}"
     }
   }
   ```

2. **Para desenvolvimento local**, você pode hardcodear temporariamente:
   ```json
   {
     "env": {
       "BRAVE_API_KEY": "BSA_..."
     }
   }
   ```

3. **Para produção**, sempre use variáveis de ambiente

---

## 🐳 Docker MCP Gateway

O Docker Gateway permite acessar múltiplos servidores MCP via containers.

### Pré-requisitos

1. **Docker Desktop 4.43+** instalado e rodando
2. **Docker MCP Toolkit** instalado
3. **Docker Swarm** inicializado

### Instalação

```powershell
# Script automático
pwsh -ExecutionPolicy Bypass -File scripts/install-docker-mcp.ps1

# Ou manualmente
docker swarm init
echo -n "SEU_TOKEN" | docker secret create github.personal_access_token -
echo -n "postgresql://..." | docker secret create postgres.url -
```

### Servidores Disponíveis via Docker

- `context7` (2 tools)
- `fetch` (1 tool)
- `github` (26 tools) - precisa secret
- `memory` (9 tools)
- `playwright` (21 tools)
- `postgres` (vários) - precisa secret
- `sequentialthinking` (1 tool)

**Total:** ~60+ tools disponíveis

---

## 🧪 Testar Configuração

### 1. Verificar MCPs no Cursor

1. Abra **Settings > Tools & MCP**
2. Verifique se os servidores aparecem na lista
3. Teste conexão clicando em cada servidor

### 2. Testar via Terminal

```bash
# Testar Supabase MCP
npx -y @supabase/mcp-server-supabase

# Testar Brave Search
npx -y @modelcontextprotocol/server-brave-search

# Testar Context7
npx -y @context7/mcp-server
```

### 3. Testar Docker Gateway

```bash
docker mcp gateway run
```

Se funcionar, você verá logs do gateway iniciando.

---

## 🔧 Troubleshooting

### Erro: "MCP server not found"

**Solução:**
1. Verifique se o servidor está no `mcp.json`
2. Reinicie o Cursor completamente
3. Verifique se o `npx` está funcionando: `npx --version`

### Erro: "Environment variable not set"

**Solução:**
1. Verifique se o `.env` existe e tem a variável
2. No `mcp.json`, use `${VAR_NAME}` para referenciar
3. Reinicie o Cursor após alterar `.env`

### Erro: "Path not found" (runners customizados)

**Solução:**
1. Execute `node scripts/generate-mcp-config.js` para regenerar
2. Verifique se os arquivos runners existem em `src/mcp/runners/`
3. Teste manualmente: `node src/mcp/runners/design-tokens-runner.js`

### Erro: "Docker Gateway not starting"

**Solução:**
1. Verifique se Docker Desktop está rodando
2. Verifique Swarm: `docker info --format '{{.Swarm.LocalNodeState}}'`
3. Verifique secrets: `docker secret ls`
4. Veja logs: `docker mcp gateway run`

---

## 📚 Referências

- **MCP Documentation**: https://modelcontextprotocol.io
- **Docker MCP Toolkit**: https://github.com/docker/mcp-toolkit
- **Context7 MCP**: https://github.com/context7/mcp-server
- **Supabase MCP**: https://github.com/supabase/mcp-server-supabase

---

## ✅ Checklist de Configuração

- [ ] Arquivo `.env` criado com todas as variáveis
- [ ] Arquivo `mcp.json` configurado
- [ ] Cursor reiniciado após configuração
- [ ] Servidores MCP aparecem em Settings > Tools & MCP
- [ ] Supabase MCP testado e funcionando
- [ ] Brave Search MCP testado e funcionando
- [ ] Context7 MCP testado e funcionando
- [ ] Docker Gateway configurado (se usar Dynamic MCP)
- [ ] Runners customizados testados

---

**Última atualização:** Janeiro 2025  
**Mantido por:** Equipe Nossa Maternidade

