# 🔌 Script de Instalação - Cursor Workbench Extension
# Uso: .\scripts\install-cursor-workbench.ps1

Write-Host "🔍 Verificando Cursor Workbench Extension..." -ForegroundColor Cyan

# Verificar se cursor está instalado
$cursorPath = Get-Command cursor -ErrorAction SilentlyContinue
if (-not $cursorPath) {
    Write-Host "❌ Cursor não encontrado no PATH" -ForegroundColor Red
    Write-Host "   Instale o Cursor ou adicione ao PATH" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Cursor encontrado: $($cursorPath.Source)" -ForegroundColor Green

# Verificar se já está instalado
Write-Host "`n📦 Verificando extensões instaladas..." -ForegroundColor Cyan
$installed = cursor --list-extensions 2>&1 | Select-String -Pattern "workbench" -CaseSensitive:$false

if ($installed) {
    Write-Host "✅ Cursor Workbench já está instalado!" -ForegroundColor Green
    Write-Host "   $installed" -ForegroundColor Gray
    Write-Host "`n🎯 Próximos passos:" -ForegroundColor Cyan
    Write-Host "   1. Recarregue o Cursor: Ctrl+Shift+P → 'Developer: Reload Window'" -ForegroundColor Yellow
    Write-Host "   2. Teste: Ctrl+Shift+P → 'Cursor Workbench: Show Rules'" -ForegroundColor Yellow
    exit 0
}

Write-Host "⚠️  Cursor Workbench não encontrado" -ForegroundColor Yellow
Write-Host "`n📥 Opções de instalação:" -ForegroundColor Cyan

# Opção 1: Marketplace (se disponível)
Write-Host "`n1️⃣ Tentar instalar do marketplace:" -ForegroundColor Cyan
Write-Host "   cursor --install-extension zackiles.cursor-workbench" -ForegroundColor Gray

$installMarketplace = Read-Host "   Tentar instalar do marketplace? (S/N)"
if ($installMarketplace -eq "S" -or $installMarketplace -eq "s") {
    Write-Host "`n📦 Instalando do marketplace..." -ForegroundColor Cyan
    $result = cursor --install-extension zackiles.cursor-workbench 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Instalado com sucesso!" -ForegroundColor Green
        Write-Host "`n🎯 Próximos passos:" -ForegroundColor Cyan
        Write-Host "   1. Recarregue o Cursor: Ctrl+Shift+P → 'Developer: Reload Window'" -ForegroundColor Yellow
        Write-Host "   2. Teste: Ctrl+Shift+P → 'Cursor Workbench: Show Rules'" -ForegroundColor Yellow
        exit 0
    } else {
        Write-Host "❌ Falha na instalação do marketplace" -ForegroundColor Red
        Write-Host "   $result" -ForegroundColor Gray
    }
}

# Opção 2: VSIX local
Write-Host "`n2️⃣ Instalar via VSIX local:" -ForegroundColor Cyan
Write-Host "   Se você tem o arquivo .vsix, use:" -ForegroundColor Gray
Write-Host "   cursor --install-extension caminho/para/cursor-workbench.vsix" -ForegroundColor Gray

$vsixPath = Read-Host "`n   Caminho para o arquivo .vsix (ou Enter para pular)"
if ($vsixPath -and (Test-Path $vsixPath)) {
    Write-Host "`n📦 Instalando via VSIX..." -ForegroundColor Cyan
    $result = cursor --install-extension $vsixPath 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Instalado com sucesso!" -ForegroundColor Green
        Write-Host "`n🎯 Próximos passos:" -ForegroundColor Cyan
        Write-Host "   1. Recarregue o Cursor: Ctrl+Shift+P → 'Developer: Reload Window'" -ForegroundColor Yellow
        Write-Host "   2. Teste: Ctrl+Shift+P → 'Cursor Workbench: Show Rules'" -ForegroundColor Yellow
        exit 0
    } else {
        Write-Host "❌ Falha na instalação via VSIX" -ForegroundColor Red
        Write-Host "   $result" -ForegroundColor Gray
    }
}

# Opção 3: Interface gráfica
Write-Host "`n3️⃣ Instalar via Interface Gráfica (Recomendado):" -ForegroundColor Cyan
Write-Host "   1. Pressione: Ctrl+Shift+X" -ForegroundColor Yellow
Write-Host "   2. Busque: 'Cursor Workbench'" -ForegroundColor Yellow
Write-Host "   3. Clique em 'Install'" -ForegroundColor Yellow
Write-Host "`n📖 Guia completo: .cursor\INSTALL_EXTENSION.md" -ForegroundColor Cyan

Write-Host "`n✅ Script concluído!" -ForegroundColor Green

