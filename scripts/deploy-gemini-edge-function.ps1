# ============================================
# Deploy Edge Function chat-gemini (PowerShell)
# ============================================
# Script de deploy automatizado com validações
#
# Uso:
#   .\scripts\deploy-gemini-edge-function.ps1
#   .\scripts\deploy-gemini-edge-function.ps1 -SkipTest
#   .\scripts\deploy-gemini-edge-function.ps1 -SkipValidation

param(
    [switch]$SkipTest,
    [switch]$SkipValidation
)

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "🚀 Deploy: Edge Function chat-gemini" -ForegroundColor Cyan
Write-Host ("=" * 50) -ForegroundColor Cyan
Write-Host ""

# Função para verificar Supabase CLI
function Test-SupabaseCLI {
    try {
        $version = supabase --version 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  ✅ Supabase CLI instalado: $version" -ForegroundColor Green
            return $true
        }
    } catch {
        Write-Host "  ❌ Supabase CLI não instalado!" -ForegroundColor Red
        Write-Host ""
        Write-Host "  Instale com:" -ForegroundColor Yellow
        Write-Host "    npm install -g supabase" -ForegroundColor Yellow
        Write-Host "    ou: winget install Supabase.CLI" -ForegroundColor Yellow
        return $false
    }
}

# Função para verificar projeto linkado
function Test-ProjectLinked {
    try {
        $status = supabase status 2>&1
        if ($status -match "not linked" -or $status -match "not found") {
            return $false
        }
        return $true
    } catch {
        return $false
    }
}

# Função para verificar GEMINI_API_KEY
function Test-GeminiSecret {
    try {
        $output = supabase secrets list 2>&1
        if ($LASTEXITCODE -eq 0 -and $output -match "GEMINI_API_KEY") {
            return $true
        }
        return $false
    } catch {
        return $false
    }
}

# Função para verificar Edge Function
function Test-EdgeFunctionExists {
    $functionPath = Join-Path $PSScriptRoot "..\supabase\functions\chat-gemini\index.ts"
    $functionPath = Resolve-Path $functionPath -ErrorAction SilentlyContinue
    return $null -ne $functionPath
}

# Validações pré-deploy
if (-not $SkipValidation) {
    Write-Host "📋 Validações pré-deploy:" -ForegroundColor Blue
    Write-Host ""

    # 1. Supabase CLI
    Write-Host "  1. Verificando Supabase CLI..." -ForegroundColor Gray
    if (-not (Test-SupabaseCLI)) {
        exit 1
    }
    Write-Host ""

    # 2. Projeto linkado
    Write-Host "  2. Verificando link ao projeto..." -ForegroundColor Gray
    if (-not (Test-ProjectLinked)) {
        Write-Host "  ❌ Projeto não está linkado!" -ForegroundColor Red
        Write-Host ""
        Write-Host "  Execute:" -ForegroundColor Yellow
        Write-Host "    supabase link --project-ref [seu-project-ref]" -ForegroundColor Yellow
        Write-Host ""
        exit 1
    }
    Write-Host "  ✅ Projeto linkado" -ForegroundColor Green
    Write-Host ""

    # 3. GEMINI_API_KEY
    Write-Host "  3. Verificando GEMINI_API_KEY secret..." -ForegroundColor Gray
    if (-not (Test-GeminiSecret)) {
        Write-Host "  ❌ GEMINI_API_KEY não configurado!" -ForegroundColor Red
        Write-Host ""
        Write-Host "  Configure antes de fazer deploy:" -ForegroundColor Yellow
        Write-Host "    node scripts/validate-gemini-secret.js" -ForegroundColor Yellow
        Write-Host "    ou: supabase secrets set GEMINI_API_KEY=`"AIzaSy...`"" -ForegroundColor Yellow
        Write-Host ""
        exit 1
    }
    Write-Host "  ✅ GEMINI_API_KEY configurado" -ForegroundColor Green
    Write-Host ""

    # 4. Edge Function existe
    Write-Host "  4. Verificando Edge Function..." -ForegroundColor Gray
    if (-not (Test-EdgeFunctionExists)) {
        Write-Host "  ❌ Edge Function não encontrada!" -ForegroundColor Red
        Write-Host ""
        Write-Host "  Caminho esperado:" -ForegroundColor Yellow
        Write-Host "    supabase/functions/chat-gemini/index.ts" -ForegroundColor Yellow
        Write-Host ""
        exit 1
    }
    Write-Host "  ✅ Edge Function encontrada" -ForegroundColor Green
    Write-Host ""
} else {
    Write-Host "⚠️  Validações puladas (-SkipValidation)" -ForegroundColor Yellow
    Write-Host ""
}

# Deploy
Write-Host "🚀 Iniciando deploy..." -ForegroundColor Cyan
Write-Host ""

try {
    supabase functions deploy chat-gemini
    if ($LASTEXITCODE -ne 0) {
        Write-Host ""
        Write-Host "❌ Deploy falhou!" -ForegroundColor Red
        Write-Host ""
        Write-Host "📝 Verifique:" -ForegroundColor Cyan
        Write-Host "   - Logs de erro acima" -ForegroundColor Yellow
        Write-Host "   - Supabase CLI está atualizado?" -ForegroundColor Yellow
        Write-Host "   - Você tem permissão para fazer deploy?" -ForegroundColor Yellow
        Write-Host ""
        exit 1
    }
} catch {
    Write-Host ""
    Write-Host "❌ Erro durante deploy: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "✅ Deploy concluído!" -ForegroundColor Green
Write-Host ""

# Teste pós-deploy
if (-not $SkipTest) {
    Write-Host "🧪 Testando função após deploy..." -ForegroundColor Cyan
    Write-Host ""

    try {
        node scripts/test-gemini-edge-function.js
        if ($LASTEXITCODE -eq 0) {
            Write-Host ""
            Write-Host "🎉 Deploy e teste concluídos com sucesso!" -ForegroundColor Green
            Write-Host ""
        } else {
            Write-Host ""
            Write-Host "⚠️  Deploy concluído, mas teste falhou" -ForegroundColor Yellow
            Write-Host ""
            Write-Host "📝 Verifique:" -ForegroundColor Cyan
            Write-Host "   - Logs da Edge Function no Dashboard" -ForegroundColor Yellow
            Write-Host "   - Secret GEMINI_API_KEY está correto?" -ForegroundColor Yellow
            Write-Host "   - API key do Gemini está válida?" -ForegroundColor Yellow
            Write-Host ""
        }
    } catch {
        Write-Host ""
        Write-Host "⚠️  Erro ao executar teste: $_" -ForegroundColor Yellow
        Write-Host ""
    }
} else {
    Write-Host "⚠️  Teste pós-deploy pulado (-SkipTest)" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "💡 Execute manualmente:" -ForegroundColor Cyan
    Write-Host "   node scripts/test-gemini-edge-function.js" -ForegroundColor Yellow
    Write-Host ""
}

Write-Host ("=" * 50) -ForegroundColor Cyan
Write-Host "✅ Processo concluído!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Próximos passos:" -ForegroundColor Cyan
Write-Host "   - Use a função no app via:" -ForegroundColor Yellow
Write-Host "     EXPO_PUBLIC_SUPABASE_FUNCTIONS_URL/functions/v1/chat-gemini" -ForegroundColor Gray
Write-Host "   - Monitore logs no Supabase Dashboard" -ForegroundColor Yellow
Write-Host "   - Verifique custos no Google Cloud Console" -ForegroundColor Yellow
Write-Host ""

