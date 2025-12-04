# 🐳 Como Iniciar Docker Desktop e Configurar MCPs

## ⚠️ Problema Identificado

O Docker Desktop não está rodando. Você precisa iniciá-lo antes de configurar os MCPs.

---

## 🚀 Passo a Passo

### 1. Iniciar Docker Desktop

**Opção A: Via Menu Iniciar**

1. Pressione `Windows` (tecla Windows)
2. Digite "Docker Desktop"
3. Clique em "Docker Desktop"
4. Aguarde o Docker Desktop abrir

**Opção B: Via Executável**

1. Abra o Explorador de Arquivos
2. Navegue até: `C:\Program Files\Docker\Docker\`
3. Execute `Docker Desktop.exe`

**Opção C: Via PowerShell (como administrador)**

```powershell
Start-Process "C:\Program Files\Docker\Docker\Docker Desktop.exe"
```

### 2. Aguardar Docker Desktop Iniciar

Você verá:

- Ícone do Docker na bandeja do sistema (canto inferior direito)
- Mensagem "Docker Desktop is starting..." no ícone
- Quando estiver pronto, o ícone ficará estável e mostrará "Docker Desktop is running"

**⏱️ Tempo estimado:** 30-60 segundos

### 3. Verificar se Está Rodando

Abra um novo PowerShell e execute:

```powershell
docker info
```

**✅ Se funcionar:** Você verá informações do Docker (não erros)  
**❌ Se der erro:** Aguarde mais alguns segundos e tente novamente

### 4. Executar Script de Instalação dos MCPs

Quando o Docker estiver rodando, execute:

```powershell
cd C:\Users\User\Downloads\NM-gl\NossaMaternidade-1
pwsh -ExecutionPolicy Bypass -File scripts/install-docker-mcp.ps1
```

O script irá:

- ✅ Verificar Docker Desktop rodando
- ✅ Inicializar Docker Swarm
- ✅ Criar secrets necessários (github.personal_access_token, postgres.url)
- ✅ Validar configuração

### 5. Reiniciar Claude Code

1. **Feche completamente o Claude Code (Cursor)**
   - Feche todas as janelas
   - Verifique na bandeja do sistema se não há processos rodando

2. **Abra o Claude Code novamente**

3. **Verifique os MCPs**
   - Settings > Tools & MCP
   - Deve aparecer "docker" na lista de servidores MCP

---

## 🔍 Verificação Rápida

Execute estes comandos para verificar tudo:

```powershell
# 1. Docker rodando?
docker info
# Deve mostrar informações, não erros

# 2. Docker MCP Toolkit instalado?
docker mcp --version
# Deve retornar: v0.21.0

# 3. Swarm ativo?
docker info --format '{{.Swarm.LocalNodeState}}'
# Deve retornar: "active" (após inicializar)

# 4. Secrets criados?
docker secret ls
# Deve listar: github.personal_access_token e postgres.url
```

---

## 🆘 Problemas Comuns

### "Docker Desktop não inicia"

**Soluções:**

1. Reinicie o computador
2. Verifique se há atualizações do Windows pendentes
3. Execute Docker Desktop como Administrador
4. Verifique se o WSL2 está instalado (requisito do Docker Desktop)

### "Docker Desktop inicia mas dá erro"

**Soluções:**

1. Aguarde mais tempo (pode levar 1-2 minutos na primeira vez)
2. Verifique se há outros containers/processos Docker rodando
3. Reinicie o Docker Desktop: Clique com botão direito no ícone > Quit Docker Desktop > Abra novamente

### "Swarm não inicializa"

**Soluções:**

```powershell
# Verificar se já está inicializado
docker info --format '{{.Swarm.LocalNodeState}}'

# Se retornar "active", está OK!
# Se retornar "inactive", execute:
docker swarm init
```

### "Secrets não criam"

**Soluções:**

```powershell
# Verificar se Swarm está ativo primeiro
docker info --format '{{.Swarm.LocalNodeState}}'
# Deve retornar "active"

# Se não estiver, inicialize:
docker swarm init

# Então crie os secrets novamente
```

---

## ✅ Checklist Final

Antes de usar os MCPs no Claude Code, verifique:

- [ ] Docker Desktop está rodando (`docker info` funciona)
- [ ] Docker Swarm está ativo (`docker info --format '{{.Swarm.LocalNodeState}}'` = "active")
- [ ] Secrets criados (`docker secret ls` lista os 2 secrets)
- [ ] mcp.json configurado (já está configurado no projeto)
- [ ] Claude Code reiniciado completamente

---

## 📚 Próximos Passos

Após seguir este guia:

1. ✅ Docker Desktop rodando
2. ✅ Docker Swarm inicializado
3. ✅ Secrets criados
4. ✅ Claude Code reiniciado

**Os MCPs do Docker estarão disponíveis automaticamente!**

Para mais detalhes, veja:

- `docs/DOCKER_MCP_QUICK_START.md` - Guia rápido
- `docs/DOCKER_MCP_SETUP.md` - Documentação completa

---

**Última atualização:** Janeiro 2025
