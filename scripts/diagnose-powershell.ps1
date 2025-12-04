# 🔍 Script de Diagnóstico: PowerShell Extension no Cursor/VS Code
# Uso: pwsh -ExecutionPolicy Bypass -File scripts/diagnose-powershell.ps1
# 
# Este script diagnostica problemas com o PowerShell Extension e fornece soluções

param(
    [switch]$Fix,
    [switch]$Verbose
)

$ErrorActionPreference = "Continue"
$script:issues = @()
$script:warnings = @()
$script:fixes = @()

function Write-Info {
    param([string]$Message)
    Write-Host $Message -ForegroundColor Cyan
}

function Write-Success {
    param([string]$Message)
    Write-Host "✅ $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "⚠️  $Message" -ForegroundColor Yellow
    $script:warnings += $Message
}

function Write-Error {
    param([string]$Message)
    Write-Host "❌ $Message" -ForegroundColor Red
    $script:issues += $Message
}

function Write-Fix {
    param([string]$Message)
    Write-Host "🔧 $Message" -ForegroundColor Magenta
    $script:fixes += $Message
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "🔍 DIAGNÓSTICO: PowerShell Extension" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 1. Verificar versão do PowerShell
Write-Info "1️⃣ Verificando versão do PowerShell..."
$psVersion = $PSVersionTable.PSVersion
$psEdition = $PSVersionTable.PSEdition

Write-Success "PowerShell $psVersion ($psEdition) instalado"

if ($psVersion.Major -lt 7) {
    Write-Warning "Recomendado: PowerShell 7+ para melhor compatibilidade"
    Write-Fix "Instale PowerShell 7+ em: https://aka.ms/powershell-release"
}

Write-Host ""

# 2. Verificar PowerShell Extension instalada
Write-Info "2️⃣ Verificando PowerShell Extension..."

$vscodeExtensions = @()
$cursorExtensions = @()

# VS Code
$vscodePath = "$env:USERPROFILE\.vscode\extensions"
if (Test-Path $vscodePath) {
    $vscodeExtensions = Get-ChildItem $vscodePath -Filter "ms-vscode.powershell-*" -Directory -ErrorAction SilentlyContinue
}

# Cursor
$cursorPath = "$env:USERPROFILE\.cursor\extensions"
if (Test-Path $cursorPath) {
    $cursorExtensions = Get-ChildItem $cursorPath -Filter "ms-vscode.powershell-*" -Directory -ErrorAction SilentlyContinue
}

if ($vscodeExtensions.Count -gt 0) {
    $ext = $vscodeExtensions[0]
    $version = (Get-Content "$($ext.FullName)\package.json" -Raw | ConvertFrom-Json).version
    Write-Success "PowerShell Extension encontrada no VS Code: v$version"
} elseif ($cursorExtensions.Count -gt 0) {
    $ext = $cursorExtensions[0]
    $version = (Get-Content "$($ext.FullName)\package.json" -Raw | ConvertFrom-Json).version
    Write-Success "PowerShell Extension encontrada no Cursor: v$version"
} else {
    Write-Error "PowerShell Extension não encontrada"
    Write-Fix "Instale a extensão: ms-vscode.powershell"
}

Write-Host ""

# 3. Verificar Execution Policy
Write-Info "3️⃣ Verificando Execution Policy..."
$execPolicy = Get-ExecutionPolicy -Scope CurrentUser

Write-Host "   Política atual: $execPolicy" -ForegroundColor Gray

if ($execPolicy -eq "Restricted") {
    Write-Error "Execution Policy está 'Restricted' - scripts não podem executar"
    Write-Fix "Execute: Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser"
    
    if ($Fix) {
        Write-Info "   Aplicando correção..."
        Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser -Force
        Write-Success "Execution Policy atualizada para RemoteSigned"
    }
} elseif ($execPolicy -eq "AllSigned") {
    Write-Warning "Execution Policy 'AllSigned' pode bloquear scripts locais"
} else {
    Write-Success "Execution Policy adequada para desenvolvimento"
}

Write-Host ""

# 4. Verificar processos PowerShell Editor Services
Write-Info "4️⃣ Verificando processos PowerShell Editor Services (PSES)..."
$psesProcesses = Get-Process -Name "pwsh","powershell" -ErrorAction SilentlyContinue | 
    Where-Object { $_.CommandLine -like "*PowerShell Editor Services*" -or $_.MainWindowTitle -like "*PSES*" }

if ($psesProcesses.Count -gt 0) {
    Write-Success "$($psesProcesses.Count) processo(s) PSES rodando"
    
    if ($Verbose) {
        foreach ($proc in $psesProcesses) {
            Write-Host "   PID: $($proc.Id) - $($proc.ProcessName)" -ForegroundColor Gray
        }
    }
} else {
    Write-Warning "Nenhum processo PSES encontrado (pode ser normal se extension não está ativa)"
}

Write-Host ""

# 5. Verificar logs do PowerShell Extension
Write-Info "5️⃣ Verificando logs do PowerShell Extension..."

$logPaths = @(
    "$env:USERPROFILE\.vscode\extensions\ms-vscode.powershell-*\logs",
    "$env:USERPROFILE\.cursor\extensions\ms-vscode.powershell-*\logs"
)

$foundLogs = $false
foreach ($logPathPattern in $logPaths) {
    $logDirs = Get-ChildItem -Path (Split-Path $logPathPattern -Parent) -Filter (Split-Path $logPathPattern -Leaf) -Directory -ErrorAction SilentlyContinue
    foreach ($logDir in $logDirs) {
        $logFiles = Get-ChildItem $logDir.FullName -Filter "*.log" | Sort-Object LastWriteTime -Descending | Select-Object -First 1
        if ($logFiles) {
            $foundLogs = $true
            $logFile = $logFiles[0]
            Write-Success "Log encontrado: $($logFile.Name)"
            
            # Verificar erros recentes
            $recentErrors = Select-String -Path $logFile.FullName -Pattern "Error|Exception|Failed" | Select-Object -Last 5
            if ($recentErrors) {
                Write-Warning "Erros encontrados no log (últimos 5):"
                foreach ($err in $recentErrors) {
                    Write-Host "   $($err.Line.Trim())" -ForegroundColor Yellow
                }
            } else {
                Write-Success "Nenhum erro recente no log"
            }
            break
        }
    }
    if ($foundLogs) { break }
}

if (-not $foundLogs) {
    Write-Warning "Logs não encontrados (extension pode não ter sido usada ainda)"
}

Write-Host ""

# 6. Verificar configurações do PowerShell Extension
Write-Info "6️⃣ Verificando configurações do PowerShell Extension..."

$settingsPaths = @(
    "$env:APPDATA\Code\User\settings.json",
    "$env:APPDATA\Cursor\User\settings.json"
)

$foundSettings = $false
foreach ($settingsPath in $settingsPaths) {
    if (Test-Path $settingsPath) {
        $settings = Get-Content $settingsPath -Raw | ConvertFrom-Json
        $foundSettings = $true
        
        Write-Success "Configurações encontradas: $(Split-Path $settingsPath -Leaf)"
        
        # Verificar configurações importantes
        $psSettings = $settings.PSObject.Properties | Where-Object { $_.Name -like "*powershell*" -or $_.Name -like "*pses*" }
        
        if ($psSettings) {
            Write-Host "   Configurações PowerShell encontradas:" -ForegroundColor Gray
            foreach ($setting in $psSettings) {
                Write-Host "   - $($setting.Name): $($setting.Value)" -ForegroundColor Gray
            }
        } else {
            Write-Warning "Nenhuma configuração específica do PowerShell encontrada"
        }
        break
    }
}

if (-not $foundSettings) {
    Write-Warning "Arquivo de configurações não encontrado"
}

Write-Host ""

# 7. Verificar scripts do projeto
Write-Info "7️⃣ Verificando scripts PowerShell do projeto..."
$projectScripts = Get-ChildItem -Path "." -Filter "*.ps1" -Recurse -ErrorAction SilentlyContinue | 
    Where-Object { $_.FullName -notlike "*node_modules*" -and $_.FullName -notlike "*.git*" }

if ($projectScripts.Count -gt 0) {
    Write-Success "$($projectScripts.Count) script(s) PowerShell encontrado(s)"
    
    # Verificar encoding e BOM
    $encodingIssues = 0
    foreach ($script in $projectScripts) {
        $content = Get-Content $script.FullName -Raw -Encoding UTF8
        if ($content -match "`r`n") {
            # Windows line endings - OK
        } else {
            $encodingIssues++
        }
    }
    
    if ($encodingIssues -gt 0) {
        Write-Warning "$encodingIssues script(s) com encoding/line endings incorretos"
    } else {
        Write-Success "Todos os scripts com encoding correto"
    }
} else {
    Write-Warning "Nenhum script PowerShell encontrado no projeto"
}

Write-Host ""

# 8. Verificar variáveis de ambiente relacionadas
Write-Info "8️⃣ Verificando variáveis de ambiente..."
$envVars = @("PSModulePath", "CLAUDE_CODE_GIT_BASH_PATH")

foreach ($var in $envVars) {
    $value = [Environment]::GetEnvironmentVariable($var, "User")
    if ($value) {
        Write-Success "$var definida"
        if ($Verbose) {
            Write-Host "   Valor: $value" -ForegroundColor Gray
        }
    } else {
        Write-Warning "$var não definida"
    }
}

Write-Host ""

# 9. Testar execução de script simples
Write-Info "9️⃣ Testando execução de script..."
try {
    $testScript = @"
Write-Output "Teste de execução PowerShell"
"@
    $testScript | Out-File -FilePath "$env:TEMP\ps-test.ps1" -Encoding UTF8
    $result = & "$env:TEMP\ps-test.ps1" 2>&1
    
    if ($LASTEXITCODE -eq 0 -or $result -match "Teste de execução") {
        Write-Success "Scripts podem ser executados"
    } else {
        Write-Error "Falha ao executar script de teste"
        Write-Fix "Verifique Execution Policy: Get-ExecutionPolicy"
    }
    
    Remove-Item "$env:TEMP\ps-test.ps1" -ErrorAction SilentlyContinue
} catch {
    Write-Error "Erro ao testar execução: $_"
}

Write-Host ""

# Resumo e recomendações
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "📊 RESUMO DO DIAGNÓSTICO" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

if ($script:issues.Count -eq 0 -and $script:warnings.Count -eq 0) {
    Write-Success "TUDO OK! Nenhum problema encontrado."
    Write-Host ""
    Write-Info "💡 DICAS:"
    Write-Host "   - Se a conexão ainda falhar, reinicie o Cursor/VS Code completamente" -ForegroundColor Gray
    Write-Host "   - Verifique se a extensão está habilitada (Ctrl+Shift+X)" -ForegroundColor Gray
    Write-Host "   - Tente abrir um arquivo .ps1 para ativar a extensão" -ForegroundColor Gray
} else {
    if ($script:issues.Count -gt 0) {
        Write-Host "❌ PROBLEMAS ENCONTRADOS: $($script:issues.Count)" -ForegroundColor Red
        foreach ($issue in $script:issues) {
            Write-Host "   - $issue" -ForegroundColor Red
        }
        Write-Host ""
    }
    
    if ($script:warnings.Count -gt 0) {
        Write-Host "⚠️  AVISOS: $($script:warnings.Count)" -ForegroundColor Yellow
        foreach ($warning in $script:warnings) {
            Write-Host "   - $warning" -ForegroundColor Yellow
        }
        Write-Host ""
    }
    
    if ($script:fixes.Count -gt 0) {
        Write-Host "🔧 CORREÇÕES SUGERIDAS:" -ForegroundColor Magenta
        foreach ($fix in $script:fixes) {
            Write-Host "   - $fix" -ForegroundColor Magenta
        }
        Write-Host ""
        
        if (-not $Fix) {
            Write-Info "💡 Execute com -Fix para aplicar correções automáticas:"
            Write-Host "   pwsh -ExecutionPolicy Bypass -File scripts/diagnose-powershell.ps1 -Fix" -ForegroundColor Cyan
        }
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "📚 PRÓXIMOS PASSOS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Se problemas persistirem:" -ForegroundColor White
Write-Host "   - Feche COMPLETAMENTE o Cursor/VS Code" -ForegroundColor Gray
Write-Host "   - Reabra e tente novamente" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Reinstalar PowerShell Extension:" -ForegroundColor White
Write-Host "   - Ctrl+Shift+X (Extensions)" -ForegroundColor Gray
Write-Host "   - Procure 'PowerShell'" -ForegroundColor Gray
Write-Host "   - Desinstale e reinstale" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Verificar logs detalhados:" -ForegroundColor White
Write-Host "   - View > Output > PowerShell" -ForegroundColor Gray
Write-Host "   - Procure por erros ou warnings" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Documentação:" -ForegroundColor White
Write-Host "   - docs/POWERSHELL_SETUP.md" -ForegroundColor Gray
Write-Host ""

# Exit code
if ($script:issues.Count -gt 0) {
    exit 1
} elseif ($script:warnings.Count -gt 0) {
    exit 0
} else {
    exit 0
}

