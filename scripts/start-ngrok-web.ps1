#!/usr/bin/env pwsh
/**
 * Script para iniciar Expo Web + Ngrok Tunnel
 * 
 * Uso:
 *   .\scripts\start-ngrok-web.ps1
 * 
 * Ou:
 *   pwsh scripts/start-ngrok-web.ps1
 */

Write-Host "🚀 Iniciando Expo Web + Ngrok Tunnel..." -ForegroundColor Cyan

# Verificar se Expo está rodando
$expoProcess = Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object {
    $_.CommandLine -like "*expo*" -or $_.Path -like "*expo*"
}

if (-not $expoProcess) {
    Write-Host "⚠️  Expo não está rodando. Iniciando Expo Web..." -ForegroundColor Yellow
    Write-Host "   Execute em outro terminal: npm run web" -ForegroundColor Yellow
    Write-Host ""
}

# Verificar se ngrok está instalado
try {
    $ngrokVersion = npx ngrok version 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Ngrok não encontrado. Instalando..." -ForegroundColor Red
        npm install -g ngrok
    }
} catch {
    Write-Host "❌ Erro ao verificar ngrok: $_" -ForegroundColor Red
    exit 1
}

# Verificar se porta 8082 está em uso
$portInUse = Get-NetTCPConnection -LocalPort 8082 -ErrorAction SilentlyContinue
if (-not $portInUse) {
    Write-Host "⚠️  Porta 8082 não está em uso." -ForegroundColor Yellow
    Write-Host "   Certifique-se de que Expo Web está rodando (npm run web)" -ForegroundColor Yellow
    Write-Host ""
}

# Verificar authtoken
Write-Host "🔐 Verificando authtoken do ngrok..." -ForegroundColor Cyan
$configCheck = npx ngrok config check 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Authtoken não configurado. Configure com:" -ForegroundColor Yellow
    Write-Host "   npx ngrok config add-authtoken SEU_TOKEN" -ForegroundColor Yellow
    Write-Host ""
}

# Criar túnel
Write-Host "🌐 Criando túnel ngrok para porta 8082..." -ForegroundColor Green
Write-Host "   URL pública será exibida abaixo:" -ForegroundColor Green
Write-Host ""

# Iniciar ngrok
npx ngrok http 8082

# Se ngrok fechar, mostrar mensagem
Write-Host ""
Write-Host "✅ Túnel ngrok encerrado." -ForegroundColor Yellow
Write-Host "   Para reiniciar, execute este script novamente." -ForegroundColor Yellow

