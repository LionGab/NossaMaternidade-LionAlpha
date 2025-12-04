# Script: fix-docker-virtualization.ps1
# Descrição: Verifica e habilita recursos do Windows para Docker Desktop
# Requer: Executar como Administrador

Write-Host "🔧 Docker Desktop - Fix Virtualização" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Verificar se está executando como Administrador
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "❌ ERRO: Este script precisa ser executado como Administrador!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Como executar:" -ForegroundColor Yellow
    Write-Host "1. Clique com botão direito no PowerShell" -ForegroundColor Yellow
    Write-Host "2. Selecione 'Executar como Administrador'" -ForegroundColor Yellow
    Write-Host "3. Execute: .\scripts\fix-docker-virtualization.ps1" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Executando como Administrador" -ForegroundColor Green
Write-Host ""

# 1. Verificar status atual da virtualização
Write-Host "📊 Verificando status atual..." -ForegroundColor Cyan
Write-Host ""

$virtualizationStatus = (Get-CimInstance Win32_ComputerSystem).HypervisorPresent
$virtualizationFirmware = (Get-CimInstance Win32_Processor).VirtualizationFirmwareEnabled

Write-Host "Status da Virtualização:" -ForegroundColor Yellow
Write-Host "  - Hypervisor Present: $virtualizationStatus" -ForegroundColor $(if ($virtualizationStatus) { "Green" } else { "Red" })
Write-Host "  - VirtualizationFirmwareEnabled: $virtualizationFirmware" -ForegroundColor $(if ($virtualizationFirmware) { "Green" } else { "Red" })
Write-Host ""

if (-not $virtualizationFirmware) {
    Write-Host "⚠️  ATENÇÃO: Virtualização está DESABILITADA no BIOS/UEFI!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Ação necessária:" -ForegroundColor Yellow
    Write-Host "1. Reinicie o computador" -ForegroundColor Yellow
    Write-Host "2. Pressione F2 (ou Delete) durante a inicialização" -ForegroundColor Yellow
    Write-Host "3. Vá para: Advanced → CPU Configuration" -ForegroundColor Yellow
    Write-Host "4. Habilite: Intel Virtualization Technology (ou AMD-V)" -ForegroundColor Yellow
    Write-Host "5. Salve e reinicie (F10)" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "📖 Guia completo: docs/TROUBLESHOOTING/DOCKER_VIRTUALIZATION_ASUS.md" -ForegroundColor Cyan
    Write-Host ""
}

# 2. Verificar recursos do Windows
Write-Host "📦 Verificando recursos do Windows..." -ForegroundColor Cyan
Write-Host ""

$features = @(
    @{ Name = "Microsoft-Hyper-V"; DisplayName = "Hyper-V" },
    @{ Name = "VirtualMachinePlatform"; DisplayName = "Virtual Machine Platform" },
    @{ Name = "Containers"; DisplayName = "Containers" }
)

$featuresToEnable = @()

foreach ($feature in $features) {
    $status = Get-WindowsOptionalFeature -Online -FeatureName $feature.Name -ErrorAction SilentlyContinue
    
    if ($status) {
        $isEnabled = $status.State -eq "Enabled"
        $statusText = if ($isEnabled) { "✅ Habilitado" } else { "❌ Desabilitado" }
        $color = if ($isEnabled) { "Green" } else { "Red" }
        
        Write-Host "  $($feature.DisplayName): $statusText" -ForegroundColor $color
        
        if (-not $isEnabled) {
            $featuresToEnable += $feature
        }
    }
}

Write-Host ""

# 3. Habilitar recursos se necessário
if ($featuresToEnable.Count -gt 0) {
    Write-Host "🔧 Habilitando recursos do Windows..." -ForegroundColor Cyan
    Write-Host ""
    
    foreach ($feature in $featuresToEnable) {
        Write-Host "  Habilitando: $($feature.DisplayName)..." -ForegroundColor Yellow
        
        try {
            Enable-WindowsOptionalFeature -Online -FeatureName $feature.Name -All -NoRestart | Out-Null
            Write-Host "    ✅ $($feature.DisplayName) habilitado" -ForegroundColor Green
        } catch {
            Write-Host "    ❌ Erro ao habilitar $($feature.DisplayName): $_" -ForegroundColor Red
        }
    }
    
    Write-Host ""
    Write-Host "⚠️  REINICIE O COMPUTADOR para aplicar as mudanças!" -ForegroundColor Yellow
    Write-Host ""
    
    $restart = Read-Host "Deseja reiniciar agora? (S/N)"
    if ($restart -eq "S" -or $restart -eq "s") {
        Write-Host ""
        Write-Host "🔄 Reiniciando em 10 segundos..." -ForegroundColor Yellow
        Start-Sleep -Seconds 10
        Restart-Computer
    }
} else {
    Write-Host "✅ Todos os recursos do Windows já estão habilitados" -ForegroundColor Green
    Write-Host ""
}

# 4. Verificar WSL2
Write-Host "🐧 Verificando WSL2..." -ForegroundColor Cyan
Write-Host ""

$wslVersion = wsl --version 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ WSL instalado" -ForegroundColor Green
    
    $wslList = wsl --list --verbose 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "Distribuições WSL:" -ForegroundColor Yellow
        Write-Host $wslList
    }
    
    Write-Host ""
    Write-Host "Verificando versão padrão do WSL..." -ForegroundColor Yellow
    $wslDefault = wsl --get-default-version 2>&1
    
    if ($wslDefault -match "2") {
        Write-Host "✅ WSL2 configurado como padrão" -ForegroundColor Green
    } else {
        Write-Host "⚠️  WSL2 não está configurado como padrão" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Configurando WSL2 como padrão..." -ForegroundColor Cyan
        wsl --set-default-version 2 | Out-Null
        Write-Host "✅ WSL2 configurado" -ForegroundColor Green
    }
} else {
    Write-Host "⚠️  WSL não encontrado" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Para instalar WSL2:" -ForegroundColor Cyan
    Write-Host "  wsl --install" -ForegroundColor Yellow
}

Write-Host ""

# 5. Resumo final
Write-Host "📋 Resumo:" -ForegroundColor Cyan
Write-Host "==========" -ForegroundColor Cyan
Write-Host ""

if ($virtualizationFirmware) {
    Write-Host "✅ Virtualização habilitada no BIOS/UEFI" -ForegroundColor Green
} else {
    Write-Host "❌ Virtualização DESABILITADA no BIOS/UEFI (ação manual necessária)" -ForegroundColor Red
}

if ($featuresToEnable.Count -eq 0) {
    Write-Host "✅ Recursos do Windows habilitados" -ForegroundColor Green
} else {
    Write-Host "⚠️  Alguns recursos do Windows foram habilitados (reiniciar necessário)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "📖 Documentação:" -ForegroundColor Cyan
Write-Host "  - docs/TROUBLESHOOTING/DOCKER_VIRTUALIZATION.md" -ForegroundColor Yellow
Write-Host "  - docs/TROUBLESHOOTING/DOCKER_VIRTUALIZATION_ASUS.md" -ForegroundColor Yellow
Write-Host ""

if (-not $virtualizationFirmware) {
    Write-Host "⚠️  PRÓXIMO PASSO: Habilite a virtualização no BIOS/UEFI (F2 durante boot)" -ForegroundColor Red
    Write-Host ""
}

