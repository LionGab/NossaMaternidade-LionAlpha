# 🔍 Script de Verificação: Claude Code Git Bash
# Uso: pwsh -ExecutionPolicy Bypass -File scripts/verify-claude-code-bash.ps1
#      ou: npm run verify:claude-bash

$ErrorActionPreference = "Continue"

Write-Host "🔍 Verificando configuração do Claude Code Git Bash..." -ForegroundColor Cyan
Write-Host ""

$allGood = $true

# 1. Verificar variável de ambiente
Write-Host "1️⃣ Variável de ambiente CLAUDE_CODE_GIT_BASH_PATH:" -ForegroundColor Yellow
$envVar = [Environment]::GetEnvironmentVariable("CLAUDE_CODE_GIT_BASH_PATH", "User")

if ($envVar) {
    Write-Host "   ✅ Definida: $envVar" -ForegroundColor Green
    
    # Verificar se arquivo existe
    if (Test-Path $envVar) {
        Write-Host "   ✅ Arquivo existe" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Arquivo NÃO existe: $envVar" -ForegroundColor Red
        $allGood = $false
    }
} else {
    Write-Host "   ❌ Variável NÃO está definida" -ForegroundColor Red
    $allGood = $false
}

# 2. Verificar Git instalado
Write-Host ""
Write-Host "2️⃣ Instalação do Git:" -ForegroundColor Yellow
try {
    $gitVersion = git --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ Git instalado: $gitVersion" -ForegroundColor Green
    } else {
        throw "Git não encontrado"
    }
} catch {
    Write-Host "   ❌ Git não encontrado no PATH" -ForegroundColor Red
    $allGood = $false
}

# 3. Verificar bash.exe
Write-Host ""
Write-Host "3️⃣ Localização do bash.exe:" -ForegroundColor Yellow
$possiblePaths = @(
    "C:\Program Files\Git\bin\bash.exe",
    "C:\Program Files\Git\usr\bin\bash.exe",
    "$env:ProgramFiles\Git\bin\bash.exe",
    "$env:ProgramFiles\Git\usr\bin\bash.exe"
)

$found = $false
foreach ($path in $possiblePaths) {
    if (Test-Path $path) {
        Write-Host "   ✅ Encontrado: $path" -ForegroundColor Green
        $found = $true
        break
    }
}

if (-not $found) {
    Write-Host "   ❌ bash.exe não encontrado" -ForegroundColor Red
    $allGood = $false
}

# Resultado final
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan

if ($allGood) {
    Write-Host "✅ TUDO CONFIGURADO CORRETAMENTE!" -ForegroundColor Green
    Write-Host ""
    Write-Host "💡 Se o Claude Code ainda não funcionar:" -ForegroundColor Yellow
    Write-Host "   1. Feche COMPLETAMENTE o Cursor" -ForegroundColor White
    Write-Host "   2. Reabra o Cursor" -ForegroundColor White
    Write-Host "   3. Tente novamente" -ForegroundColor White
} else {
    Write-Host "❌ CONFIGURAÇÃO INCOMPLETA" -ForegroundColor Red
    Write-Host ""
    Write-Host "💡 Execute o script de fix:" -ForegroundColor Yellow
    Write-Host "   pwsh -ExecutionPolicy Bypass -File scripts/fix-claude-code-bash.ps1" -ForegroundColor Cyan
}

Write-Host ""

