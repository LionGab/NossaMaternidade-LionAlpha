# 🐳 Guia de Instalação dos MCPs do Docker - Claude Code

**Data:** Janeiro 2025  
**Projeto:** Nossa Maternidade  
**Status:** ✅ Configuração Automatizada

---

## 📋 Visão Geral

O Docker MCP Gateway permite acessar múltiplos servidores MCP através de containers Docker. Este guia mostra como instalar e configurar os MCPs do Docker no Claude Code (Cursor).

---

## ✅ Pré-requisitos

1. **Docker Desktop** instalado (versão 4.43+)
   - Download: https://www.docker.com/products/docker-desktop
   - Verificar: `docker --version`

2. **Docker Desktop rodando**
   - O ícone do Docker deve aparecer na bandeja do sistema
   - Verificar: `docker info`

3. **Docker MCP Toolkit** instalado
   - Geralmente vem com Docker Desktop 4.43+
   - Verificar: `docker mcp --version`

---

## 🚀 Instalação Automática (Recomendado)

Execute o script PowerShell na raiz do projeto:

```powershell
pwsh -ExecutionPolicy Bypass -File scripts/install-docker-mcp.ps1
```

O script irá:

1. ✅ Verificar Docker Desktop instalado
2. ✅ Verificar Docker Desktop rodando
3. ✅ Verificar Docker MCP Toolkit
4. ✅ Inicializar Docker Swarm (se necessário)
5. ✅ Criar secrets necessários (github.personal_access_token, postgres.url)
6. ✅ Verificar configuração do mcp.json
7. ✅ Testar Docker MCP Gateway

---

## 📝 Instalação Manual

### Passo 1: Verificar Docker Desktop

```powershell
# Verificar versão
docker --version
# Deve retornar: Docker version 28.x.x ou superior

# Verificar se está rodando
docker info
# Não deve retornar erros
```

**Se o Docker não estiver rodando:**

- Abra o Docker Desktop
- Aguarde até aparecer "Docker Desktop is running" na bandeja

### Passo 2: Verificar Docker MCP Toolkit

```powershell
docker mcp --version
# Deve retornar: v0.21.0 ou superior
```

**Se não estiver instalado:**

```powershell
# Instalar via Docker extension
docker extension install docker/mcp-toolkit
```

### Passo 3: Inicializar Docker Swarm

```powershell
# Verificar status do Swarm
docker info --format '{{.Swarm.LocalNodeState}}'
# Deve retornar: "active" ou "inactive"

# Se retornar "inactive", inicializar:
docker swarm init
```

### Passo 4: Criar Docker Secrets

Os secrets são necessários para que o Docker MCP Gateway acesse credenciais dos servidores MCP.

#### Secret: GitHub Personal Access Token

```powershell
# Ler token do mcp.json (ou usar seu próprio token)
$mcpConfig = Get-Content mcp.json | ConvertFrom-Json
$githubToken = $mcpConfig.mcpServers.github.env.GITHUB_PERSONAL_ACCESS_TOKEN

# Criar secret
echo -n $githubToken | docker secret create github.personal_access_token -
```

**Ou criar manualmente:**

```powershell
# Substitua SEU_TOKEN pelo token real
echo -n "SEU_TOKEN_AQUI" | docker secret create github.personal_access_token -
```

#### Secret: PostgreSQL Connection String

```powershell
# Ler URL do mcp.json (ou usar sua própria URL)
$mcpConfig = Get-Content mcp.json | ConvertFrom-Json
$postgresUrl = $mcpConfig.mcpServers.postgres.args[2]

# Criar secret
echo -n $postgresUrl | docker secret create postgres.url -
```

**Ou criar manualmente:**

```powershell
# Substitua pela sua connection string
echo -n "postgresql://user:password@host:port/database" | docker secret create postgres.url -
```

### Passo 5: Verificar Secrets Criados

```powershell
docker secret ls
# Deve listar:
# github.personal_access_token
# postgres.url
```

### Passo 6: Configurar mcp.json

O arquivo `mcp.json` na raiz do projeto já deve conter a configuração do Docker MCP:

```json
{
  "mcpServers": {
    "docker": {
      "command": "docker",
      "args": ["mcp", "gateway", "run"],
      "type": "stdio"
    }
  }
}
```

**Se não existir, adicione manualmente.**

### Passo 7: Testar Docker MCP Gateway

```powershell
# Testar gateway (pressione Ctrl+C para parar)
docker mcp gateway run
```

**Se funcionar, você verá logs do gateway iniciando.**

---

## 🔍 Verificação Final

### Checklist de Instalação

- [ ] Docker Desktop instalado e rodando
- [ ] Docker MCP Toolkit instalado (`docker mcp --version`)
- [ ] Docker Swarm inicializado (`docker info --format '{{.Swarm.LocalNodeState}}'` = "active")
- [ ] Secrets criados (`docker secret ls` mostra github.personal_access_token e postgres.url)
- [ ] mcp.json configurado com servidor "docker"
- [ ] Gateway testado (`docker mcp gateway run` inicia sem erros)

---

## 🎯 Servidores MCP Disponíveis via Docker Gateway

Após configurar, você terá acesso a estes servidores MCP:

| Servidor               | Tools  | Requisitos                             |
| ---------------------- | ------ | -------------------------------------- |
| **context7**           | 2      | Nenhum                                 |
| **fetch**              | 1      | Nenhum                                 |
| **github**             | 26     | Secret: `github.personal_access_token` |
| **memory**             | 9      | Nenhum                                 |
| **playwright**         | 21     | Nenhum                                 |
| **postgres**           | Vários | Secret: `postgres.url`                 |
| **sequentialthinking** | 1      | Nenhum                                 |
| **cloud-run-mcp**      | Vários | Credenciais Google Cloud               |

**Total:** ~60+ tools disponíveis

---

## 🔧 Troubleshooting

### Erro: "Docker Desktop não está rodando"

**Solução:**

1. Abra o Docker Desktop
2. Aguarde até aparecer "Docker Desktop is running"
3. Execute `docker info` para verificar

### Erro: "Docker Swarm não inicializado"

**Solução:**

```powershell
docker swarm init
```

**Se já estiver inicializado:**

```powershell
# Verificar status
docker info --format '{{.Swarm.LocalNodeState}}'

# Se retornar "active", está OK
```

### Erro: "Secret não encontrado"

**Solução:**

```powershell
# Listar secrets existentes
docker secret ls

# Criar secrets faltantes (veja Passo 4)
echo -n "VALOR" | docker secret create NOME_DO_SECRET -
```

### Erro: "docker mcp: command not found"

**Solução:**

```powershell
# Instalar Docker MCP Toolkit
docker extension install docker/mcp-toolkit

# Ou atualizar Docker Desktop para versão 4.43+
```

### Erro: "Gateway não inicia"

**Solução:**

1. Verificar se Docker Desktop está rodando
2. Verificar se Swarm está ativo: `docker info --format '{{.Swarm.LocalNodeState}}'`
3. Verificar logs: `docker mcp gateway run` (deve mostrar erros específicos)

### Claude Code não reconhece o Docker MCP

**Solução:**

1. **Reiniciar Claude Code completamente**
   - Feche todas as janelas
   - Abra novamente

2. **Verificar configuração**
   - Settings > Tools & MCP
   - Deve aparecer "docker" na lista

3. **Verificar mcp.json**
   - Arquivo deve estar na raiz do projeto
   - Formato JSON válido
   - Servidor "docker" configurado

---

## 📚 Referências

- **Docker MCP Toolkit:** https://github.com/docker/mcp-toolkit
- **Documentação MCP:** https://modelcontextprotocol.io
- **Docker Desktop:** https://www.docker.com/products/docker-desktop
- **Configuração MCPs:** `.claude/README.md`

---

## ✅ Status Final

Após seguir este guia, você deve ter:

- ✅ Docker Desktop rodando
- ✅ Docker Swarm ativo
- ✅ Secrets criados (github.personal_access_token, postgres.url)
- ✅ mcp.json configurado
- ✅ Docker MCP Gateway funcionando
- ✅ Claude Code reconhecendo os MCPs do Docker

**Próximo passo:** Reinicie o Claude Code e comece a usar os MCPs!

---

**Última atualização:** Janeiro 2025  
**Mantido por:** Equipe Nossa Maternidade
