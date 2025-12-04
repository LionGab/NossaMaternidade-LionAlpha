# Script de Instalação e Configuração dos MCPs do Docker
# Nossa Maternidade - Claude Code Setup

Write-Host "🐳 Configurando Docker MCPs para Claude Code..." -ForegroundColor Cyan
Write-Host ""

# 1. Verificar Docker Desktop
Write-Host "1️⃣ Verificando Docker Desktop..." -ForegroundColor Yellow
try {
    $dockerVersion = docker --version
    Write-Host "   ✅ Docker instalado: $dockerVersion" -ForegroundColor Green
}
catch {
    Write-Host "   ❌ Docker não encontrado. Instale o Docker Desktop primeiro." -ForegroundColor Red
    Write-Host "   📥 Download: https://www.docker.com/products/docker-desktop" -ForegroundColor Yellow
    exit 1
}

# 2. Verificar se Docker Desktop está rodando
Write-Host ""
Write-Host "2️⃣ Verificando se Docker Desktop está rodando..." -ForegroundColor Yellow
try {
    docker info | Out-Null
    Write-Host "   ✅ Docker Desktop está rodando" -ForegroundColor Green
}
catch {
    Write-Host "   ⚠️  Docker Desktop não está rodando!" -ForegroundColor Red
    Write-Host "   🔄 Por favor, inicie o Docker Desktop e execute este script novamente." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "   Pressione qualquer tecla após iniciar o Docker Desktop..." -ForegroundColor Cyan
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    Write-Host ""
    
    # Tentar novamente
    try {
        docker info | Out-Null
        Write-Host "   ✅ Docker Desktop está rodando agora!" -ForegroundColor Green
    }
    catch {
        Write-Host "   ❌ Ainda não conseguiu conectar. Verifique se o Docker Desktop está realmente rodando." -ForegroundColor Red
        exit 1
    }
}

# 3. Verificar Docker MCP Toolkit
Write-Host ""
Write-Host "3️⃣ Verificando Docker MCP Toolkit..." -ForegroundColor Yellow
try {
    $mcpVersion = docker mcp --version 2>&1
    Write-Host "   ✅ Docker MCP Toolkit instalado: $mcpVersion" -ForegroundColor Green
}
catch {
    Write-Host "   ❌ Docker MCP Toolkit não encontrado!" -ForegroundColor Red
    Write-Host "   📦 Instalando Docker MCP Toolkit..." -ForegroundColor Yellow
    
    # Tentar instalar via Docker extension
    docker extension install docker/mcp-toolkit 2>&1 | Out-Null
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ Docker MCP Toolkit instalado!" -ForegroundColor Green
    }
    else {
        Write-Host "   ⚠️  Instalação automática falhou. Instale manualmente:" -ForegroundColor Yellow
        Write-Host "   📖 https://github.com/docker/mcp-toolkit" -ForegroundColor Cyan
        exit 1
    }
}

# 4. Inicializar Docker Swarm (se necessário)
Write-Host ""
Write-Host "4️⃣ Verificando Docker Swarm..." -ForegroundColor Yellow
$swarmState = docker info --format '{{.Swarm.LocalNodeState}}' 2>&1

if ($swarmState -eq "inactive" -or $swarmState -match "error") {
    Write-Host "   ⚠️  Docker Swarm não está inicializado" -ForegroundColor Yellow
    Write-Host "   🔄 Inicializando Docker Swarm..." -ForegroundColor Cyan
    
    docker swarm init 2>&1 | Out-Null
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ Docker Swarm inicializado!" -ForegroundColor Green
    }
    else {
        Write-Host "   ⚠️  Swarm já pode estar inicializado ou houve erro" -ForegroundColor Yellow
        $swarmState = docker info --format '{{.Swarm.LocalNodeState}}' 2>&1
        if ($swarmState -eq "active") {
            Write-Host "   ✅ Docker Swarm está ativo!" -ForegroundColor Green
        }
    }
}
else {
    Write-Host "   ✅ Docker Swarm está ativo: $swarmState" -ForegroundColor Green
}

# 5. Criar Secrets necessários (se não existirem)
Write-Host ""
Write-Host "5️⃣ Verificando Docker Secrets..." -ForegroundColor Yellow

$secrets = docker secret ls --format '{{.Name}}' 2>&1
$secretsList = if ($secrets) { $secrets -split "`n" | Where-Object { $_ } } else { @() }

# Secret: github.personal_access_token
if ($secretsList -notcontains "github.personal_access_token") {
    Write-Host "   ⚠️  Secret 'github.personal_access_token' não encontrado" -ForegroundColor Yellow
    
    # Tentar ler do mcp.json
    $mcpJsonPath = Join-Path $PSScriptRoot "..\mcp.json"
    if (Test-Path $mcpJsonPath) {
        $mcpConfig = Get-Content $mcpJsonPath | ConvertFrom-Json
        $githubToken = $mcpConfig.mcpServers.github.env.GITHUB_PERSONAL_ACCESS_TOKEN
        
        if ($githubToken) {
            Write-Host "   🔐 Criando secret 'github.personal_access_token'..." -ForegroundColor Cyan
            echo -n $githubToken | docker secret create github.personal_access_token - 2>&1 | Out-Null
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host "   ✅ Secret 'github.personal_access_token' criado!" -ForegroundColor Green
            }
            else {
                Write-Host "   ⚠️  Erro ao criar secret (pode já existir)" -ForegroundColor Yellow
            }
        }
        else {
            Write-Host "   ⚠️  Token do GitHub não encontrado no mcp.json" -ForegroundColor Yellow
            Write-Host "   💡 Crie manualmente: echo -n 'SEU_TOKEN' | docker secret create github.personal_access_token -" -ForegroundColor Cyan
        }
    }
}
else {
    Write-Host "   ✅ Secret 'github.personal_access_token' existe" -ForegroundColor Green
}

# Secret: postgres.url
if ($secretsList -notcontains "postgres.url") {
    Write-Host "   ⚠️  Secret 'postgres.url' não encontrado" -ForegroundColor Yellow
    
    # Tentar ler do mcp.json
    $mcpJsonPath = Join-Path $PSScriptRoot "..\mcp.json"
    if (Test-Path $mcpJsonPath) {
        $mcpConfig = Get-Content $mcpJsonPath | ConvertFrom-Json
        $postgresUrl = $mcpConfig.mcpServers.postgres.args[2]
        
        if ($postgresUrl) {
            Write-Host "   🔐 Criando secret 'postgres.url'..." -ForegroundColor Cyan
            echo -n $postgresUrl | docker secret create postgres.url - 2>&1 | Out-Null
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host "   ✅ Secret 'postgres.url' criado!" -ForegroundColor Green
            }
            else {
                Write-Host "   ⚠️  Erro ao criar secret (pode já existir)" -ForegroundColor Yellow
            }
        }
        else {
            Write-Host "   ⚠️  URL do PostgreSQL não encontrada no mcp.json" -ForegroundColor Yellow
            Write-Host "   💡 Crie manualmente: echo -n 'postgresql://...' | docker secret create postgres.url -" -ForegroundColor Cyan
        }
    }
}
else {
    Write-Host "   ✅ Secret 'postgres.url' existe" -ForegroundColor Green
}

# 6. Verificar configuração do mcp.json
Write-Host ""
Write-Host "6️⃣ Verificando configuração do mcp.json..." -ForegroundColor Yellow
$mcpJsonPath = Join-Path $PSScriptRoot "..\mcp.json"

if (Test-Path $mcpJsonPath) {
    $mcpConfig = Get-Content $mcpJsonPath | ConvertFrom-Json
    
    if ($mcpConfig.mcpServers.docker) {
        Write-Host "   ✅ Configuração do Docker MCP encontrada no mcp.json" -ForegroundColor Green
        Write-Host "      Command: $($mcpConfig.mcpServers.docker.command)" -ForegroundColor Gray
        Write-Host "      Args: $($mcpConfig.mcpServers.docker.args -join ' ')" -ForegroundColor Gray
    }
    else {
        Write-Host "   ⚠️  Configuração do Docker MCP não encontrada no mcp.json" -ForegroundColor Yellow
        Write-Host "   💡 Adicione manualmente:" -ForegroundColor Cyan
        Write-Host '      "docker": {' -ForegroundColor Gray
        Write-Host '        "command": "docker",' -ForegroundColor Gray
        Write-Host '        "args": ["mcp", "gateway", "run"],' -ForegroundColor Gray
        Write-Host '        "type": "stdio"' -ForegroundColor Gray
        Write-Host '      }' -ForegroundColor Gray
    }
}
else {
    Write-Host "   ⚠️  Arquivo mcp.json não encontrado em: $mcpJsonPath" -ForegroundColor Yellow
}

# 7. Testar Docker MCP Gateway
Write-Host ""
Write-Host "7️⃣ Testando Docker MCP Gateway..." -ForegroundColor Yellow
Write-Host "   ⏳ Verificando comando..." -ForegroundColor Cyan

# Verificar se o comando existe
try {
    $null = docker mcp --version 2>&1
    Write-Host "   ✅ Docker MCP Toolkit está disponível!" -ForegroundColor Green
    Write-Host "   💡 O gateway será iniciado automaticamente pelo Claude Code" -ForegroundColor Cyan
}
catch {
    Write-Host "   ⚠️  Docker MCP Toolkit não encontrado" -ForegroundColor Yellow
    Write-Host "   💡 Instale: docker extension install docker/mcp-toolkit" -ForegroundColor Cyan
}

# Resumo final
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "✅ CONFIGURAÇÃO CONCLUÍDA!" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 Próximos passos:" -ForegroundColor Yellow
Write-Host "   1. Reinicie o Claude Code (Cursor)" -ForegroundColor White
Write-Host "   2. Os MCPs do Docker estarão disponíveis automaticamente" -ForegroundColor White
Write-Host "   3. Verifique em: Settings > Tools & MCP" -ForegroundColor White
Write-Host ""
Write-Host "🔍 Servidores MCP disponíveis via Docker Gateway:" -ForegroundColor Cyan
Write-Host "   • context7 (2 tools)" -ForegroundColor Gray
Write-Host "   • fetch (1 tool)" -ForegroundColor Gray
Write-Host "   • github (26 tools)" -ForegroundColor Gray
Write-Host "   • memory (9 tools)" -ForegroundColor Gray
Write-Host "   • playwright (21 tools)" -ForegroundColor Gray
Write-Host "   • postgres (requer secret postgres.url)" -ForegroundColor Gray
Write-Host "   • sequentialthinking (1 tool)" -ForegroundColor Gray
Write-Host "   • cloud-run-mcp (requer credenciais Google Cloud)" -ForegroundColor Gray
Write-Host ""
Write-Host "📚 Documentação: .claude/README.md" -ForegroundColor Cyan
Write-Host ""

