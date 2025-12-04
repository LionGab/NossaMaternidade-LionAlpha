#!/usr/bin/env pwsh
/**
 * Script para iniciar Expo Web + Ngrok Tunnel automaticamente
 * Mantém ambos os processos ativos
 * 
 * Uso:
 *   .\scripts\start-web-with-tunnel.ps1
 */

Write-Host "🚀 Iniciando Expo Web + Ngrok Tunnel..." -ForegroundColor Cyan
Write-Host ""

# Verificar se ngrok está instalado
Write-Host "[1/4] Verificando ngrok..." -ForegroundColor Yellow
try {
    $null = npx ngrok version 2>&1
    Write-Host "   ✅ Ngrok encontrado" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Ngrok não encontrado. Instalando..." -ForegroundColor Red
    npm install -g ngrok
}

# Verificar authtoken
Write-Host "[2/4] Verificando authtoken..." -ForegroundColor Yellow
$configCheck = npx ngrok config check 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ Authtoken configurado" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  Authtoken não configurado" -ForegroundColor Yellow
    Write-Host "   Configure com: npx ngrok config add-authtoken SEU_TOKEN" -ForegroundColor Yellow
}

# Verificar se porta 8082 está livre
Write-Host "[3/4] Verificando porta 8082..." -ForegroundColor Yellow
$portInUse = Get-NetTCPConnection -LocalPort 8082 -ErrorAction SilentlyContinue
if ($portInUse) {
    Write-Host "   ⚠️  Porta 8082 já está em uso" -ForegroundColor Yellow
    Write-Host "   Encerrando processo anterior..." -ForegroundColor Yellow
    $process = Get-Process -Id ($portInUse | Select-Object -First 1).OwningProcess -ErrorAction SilentlyContinue
    if ($process) {
        Stop-Process -Id $process.Id -Force -ErrorAction SilentlyContinue
        Start-Sleep -Seconds 2
    }
}

# Iniciar Expo Web em background
Write-Host "[4/4] Iniciando Expo Web..." -ForegroundColor Yellow
$expoJob = Start-Job -ScriptBlock {
    Set-Location $using:PWD
    npm run web
}

Write-Host "   ✅ Expo Web iniciado em background" -ForegroundColor Green
Write-Host "   Aguardando Expo iniciar (10 segundos)..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Verificar se Expo está rodando
$expoRunning = Get-NetTCPConnection -LocalPort 8082 -ErrorAction SilentlyContinue
if (-not $expoRunning) {
    Write-Host "   ⚠️  Expo pode não ter iniciado. Verifique manualmente." -ForegroundColor Yellow
}

# Criar túnel ngrok
Write-Host ""
Write-Host "🌐 Criando túnel ngrok..." -ForegroundColor Green
Write-Host "   URL pública será exibida abaixo:" -ForegroundColor Green
Write-Host "   Dashboard: http://localhost:4040" -ForegroundColor Cyan
Write-Host ""
Write-Host "=" -ForegroundColor Gray -NoNewline
Write-Host "=" -ForegroundColor Gray -NoNewline
Write-Host "=" -ForegroundColor Gray -NoNewline
Write-Host "=" -ForegroundColor Gray -NoNewline
Write-Host "=" -ForegroundColor Gray -NoNewline
Write-Host "=" -ForegroundColor Gray -NoNewline
Write-Host "=" -ForegroundColor Gray -NoNewline
Write-Host "=" -ForegroundColor Gray -NoNewline
Write-Host "=" -ForegroundColor Gray -NoNewline
Write-Host "=" -ForegroundColor Gray -NoNewline
Write-Host "=" -ForegroundColor Gray -NoNewline
Write-Host "=" -ForegroundColor Gray -NoNewline
Write-Host "=" -ForegroundColor Gray -NoNewline
Write-Host "=" -ForegroundColor Gray -NoNewline
Write-Host "=" -ForegroundColor Gray -NoNewline
Write-Host "=" -ForegroundColor Gray -NoNewline
Write-Host "=" -ForegroundColor Gray -NoNewline
Write-Host "=" -ForegroundColor Gray -NoNewline
Write-Host "=" -ForegroundColor Gray -NoNewline
Write-Host "=" -ForegroundColor Gray
Write-Host ""

# Função para limpar ao sair
function Cleanup {
    Write-Host ""
    Write-Host "🛑 Encerrando processos..." -ForegroundColor Yellow
    
    # Parar Expo
    if ($expoJob) {
        Stop-Job -Job $expoJob -ErrorAction SilentlyContinue
        Remove-Job -Job $expoJob -ErrorAction SilentlyContinue
    }
    
    # Parar processos Node relacionados ao Expo
    Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object {
        $_.Path -like "*expo*" -or $_.CommandLine -like "*expo*"
    } | Stop-Process -Force -ErrorAction SilentlyContinue
    
    # Parar ngrok
    Get-Process -Name "ngrok" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
    
    Write-Host "   ✅ Processos encerrados" -ForegroundColor Green
}

# Registrar handler para Ctrl+C
[Console]::TreatControlCAsInput = $false
$null = Register-EngineEvent PowerShell.Exiting -Action { Cleanup }

# Iniciar ngrok (bloqueia até Ctrl+C)
try {
    npx ngrok http 8082
} finally {
    Cleanup
}

