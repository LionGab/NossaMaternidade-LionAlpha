# Script: check-virtualization-status.ps1
# Descrição: Verifica status da virtualização no sistema
# Não requer: Executar como Administrador (apenas leitura)

Write-Host "🔍 Verificando Status da Virtualização" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host ""

# 1. Informações do Sistema
Write-Host "💻 Informações do Sistema:" -ForegroundColor Yellow
Write-Host ""

$computerInfo = Get-CimInstance Win32_ComputerSystem
$processor = Get-CimInstance Win32_Processor

Write-Host "  Fabricante: $($computerInfo.Manufacturer)" -ForegroundColor White
Write-Host "  Modelo: $($computerInfo.Model)" -ForegroundColor White
Write-Host "  Processador: $($processor.Name)" -ForegroundColor White
Write-Host ""

# 2. Status da Virtualização
Write-Host "🔧 Status da Virtualização:" -ForegroundColor Yellow
Write-Host ""

$virtualizationFirmware = $processor.VirtualizationFirmwareEnabled
$hypervisorPresent = $computerInfo.HypervisorPresent

Write-Host "  VirtualizationFirmwareEnabled: " -NoNewline
if ($virtualizationFirmware) {
    Write-Host "✅ TRUE (Habilitado)" -ForegroundColor Green
} else {
    Write-Host "❌ FALSE (Desabilitado)" -ForegroundColor Red
}

Write-Host "  Hypervisor Present: " -NoNewline
if ($hypervisorPresent) {
    Write-Host "✅ Sim" -ForegroundColor Green
} else {
    Write-Host "❌ Não" -ForegroundColor Red
}

Write-Host ""

# 3. Recursos do Windows
Write-Host "📦 Recursos do Windows:" -ForegroundColor Yellow
Write-Host ""

$features = @(
    @{ Name = "Microsoft-Hyper-V"; DisplayName = "Hyper-V" },
    @{ Name = "VirtualMachinePlatform"; DisplayName = "Virtual Machine Platform" },
    @{ Name = "Containers"; DisplayName = "Containers" }
)

foreach ($feature in $features) {
    try {
        $status = Get-WindowsOptionalFeature -Online -FeatureName $feature.Name -ErrorAction SilentlyContinue
        
        if ($status) {
            $isEnabled = $status.State -eq "Enabled"
            $statusText = if ($isEnabled) { "✅ Habilitado" } else { "❌ Desabilitado" }
            $color = if ($isEnabled) { "Green" } else { "Red" }
            
            Write-Host "  $($feature.DisplayName): $statusText" -ForegroundColor $color
        } else {
            Write-Host "  $($feature.DisplayName): ⚠️  Não disponível" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "  $($feature.DisplayName): ❌ Erro ao verificar" -ForegroundColor Red
    }
}

Write-Host ""

# 4. WSL2
Write-Host "🐧 WSL2:" -ForegroundColor Yellow
Write-Host ""

$wslVersion = wsl --version 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✅ WSL instalado" -ForegroundColor Green
    
    $wslDefault = wsl --get-default-version 2>&1
    if ($wslDefault -match "2") {
        Write-Host "  ✅ WSL2 configurado como padrão" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️  Versão padrão: $wslDefault" -ForegroundColor Yellow
    }
} else {
    Write-Host "  ❌ WSL não encontrado" -ForegroundColor Red
}

Write-Host ""

# 5. Docker Desktop
Write-Host "🐳 Docker Desktop:" -ForegroundColor Yellow
Write-Host ""

$dockerProcess = Get-Process "Docker Desktop" -ErrorAction SilentlyContinue
if ($dockerProcess) {
    Write-Host "  ✅ Docker Desktop está em execução" -ForegroundColor Green
} else {
    Write-Host "  ❌ Docker Desktop não está em execução" -ForegroundColor Red
}

Write-Host ""

# 6. Diagnóstico e Recomendações
Write-Host "📋 Diagnóstico:" -ForegroundColor Cyan
Write-Host "================" -ForegroundColor Cyan
Write-Host ""

$issues = @()
$warnings = @()

if (-not $virtualizationFirmware) {
    $issues += "Virtualização está DESABILITADA no BIOS/UEFI"
}

if (-not $hypervisorPresent) {
    $warnings += "Hypervisor não está presente (pode ser necessário reiniciar após habilitar)"
}

if ($issues.Count -gt 0) {
    Write-Host "❌ Problemas encontrados:" -ForegroundColor Red
    foreach ($issue in $issues) {
        Write-Host "  - $issue" -ForegroundColor Red
    }
    Write-Host ""
    Write-Host "🔧 Solução:" -ForegroundColor Yellow
    Write-Host "  1. Execute: .\scripts\fix-docker-virtualization.ps1 (como Administrador)" -ForegroundColor Yellow
    Write-Host "  2. Ou siga o guia: docs/TROUBLESHOOTING/DOCKER_VIRTUALIZATION_ASUS.md" -ForegroundColor Yellow
    Write-Host ""
}

if ($warnings.Count -gt 0) {
    Write-Host "⚠️  Avisos:" -ForegroundColor Yellow
    foreach ($warning in $warnings) {
        Write-Host "  - $warning" -ForegroundColor Yellow
    }
    Write-Host ""
}

if ($issues.Count -eq 0 -and $warnings.Count -eq 0) {
    Write-Host "✅ Tudo configurado corretamente!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Se o Docker Desktop ainda não funcionar, tente:" -ForegroundColor Cyan
    Write-Host "  1. Reiniciar o Docker Desktop" -ForegroundColor Yellow
    Write-Host "  2. Verificar logs do Docker Desktop" -ForegroundColor Yellow
    Write-Host ""
}

Write-Host "📖 Documentação:" -ForegroundColor Cyan
Write-Host "  - docs/TROUBLESHOOTING/DOCKER_VIRTUALIZATION.md" -ForegroundColor Yellow
Write-Host "  - docs/TROUBLESHOOTING/DOCKER_VIRTUALIZATION_ASUS.md" -ForegroundColor Yellow
Write-Host ""

