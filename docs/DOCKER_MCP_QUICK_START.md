# 🚀 Quick Start: Instalar MCPs do Docker no Claude Code

**Status Atual:** Docker instalado, mas Docker Desktop precisa ser iniciado.

---

## ⚡ Passos Rápidos

### 1. Iniciar Docker Desktop

1. Abra o **Docker Desktop** no Windows
2. Aguarde até aparecer "Docker Desktop is running" na bandeja do sistema
3. Verifique se está rodando:
   ```powershell
   docker info
   ```
   **Deve retornar informações do Docker, não erros.**

### 2. Executar Script de Instalação

```powershell
pwsh -ExecutionPolicy Bypass -File scripts/install-docker-mcp.ps1
```

**Ou fazer manualmente:**

### 3. Inicializar Docker Swarm

```powershell
docker swarm init
```

### 4. Criar Secrets Necessários

```powershell
# Secret do GitHub (token já está no mcp.json)
$mcpConfig = Get-Content mcp.json | ConvertFrom-Json
$githubToken = $mcpConfig.mcpServers.github.env.GITHUB_PERSONAL_ACCESS_TOKEN
echo -n $githubToken | docker secret create github.personal_access_token -

# Secret do PostgreSQL (URL já está no mcp.json)
$postgresUrl = $mcpConfig.mcpServers.postgres.args[2]
echo -n $postgresUrl | docker secret create postgres.url -
```

### 5. Verificar Secrets Criados

```powershell
docker secret ls
```

**Deve mostrar:**

- `github.personal_access_token`
- `postgres.url`

### 6. Reiniciar Claude Code

1. **Feche completamente o Claude Code (Cursor)**
2. Abra novamente
3. Os MCPs do Docker estarão disponíveis automaticamente

---

## ✅ Verificação Final

Após seguir os passos acima, verifique:

```powershell
# 1. Docker rodando
docker info

# 2. Swarm ativo
docker info --format '{{.Swarm.LocalNodeState}}'
# Deve retornar: "active"

# 3. Secrets criados
docker secret ls
# Deve listar os 2 secrets

# 4. Docker MCP Toolkit
docker mcp --version
# Deve retornar: v0.21.0 ou superior
```

---

## 🎯 Configuração no mcp.json

O arquivo `mcp.json` já está configurado com:

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

**Não precisa alterar nada!**

---

## 📚 Documentação Completa

Para mais detalhes, veja: `docs/DOCKER_MCP_SETUP.md`

---

## 🆘 Problemas?

### "Docker Desktop não está rodando"

- Abra o Docker Desktop
- Aguarde até aparecer na bandeja do sistema

### "Swarm já inicializado"

- Isso é OK! Continue para criar os secrets.

### "Secret já existe"

- Isso é OK! O secret já foi criado anteriormente.

### "Claude Code não reconhece os MCPs"

- Reinicie completamente o Claude Code
- Verifique Settings > Tools & MCP
- Verifique se o `mcp.json` está na raiz do projeto

---

**Pronto!** Após seguir estes passos, os MCPs do Docker estarão disponíveis no Claude Code! 🎉
