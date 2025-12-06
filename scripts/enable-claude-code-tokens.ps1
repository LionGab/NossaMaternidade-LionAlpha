# 🔧 Script para Habilitar Exibição de Tokens no Claude Code
# Uso: pwsh -ExecutionPolicy Bypass -File scripts/enable-claude-code-tokens.ps1
#      ou: npm run enable:claude-tokens

$ErrorActionPreference = "Stop"

Write-Host "🔧 Configurando exibição de tokens no Claude Code..." -ForegroundColor Cyan
Write-Host ""

# Variáveis de ambiente para habilitar exibição de tokens no Claude Code
$envVars = @{
    "ANTHROPIC_SHOW_TOKEN_USAGE" = "true"
    "ANTHROPIC_DISPLAY_METRICS" = "true"
    "CLAUDE_CODE_SHOW_TOKENS" = "true"
    "CLAUDE_CODE_VERBOSE" = "true"
    "ANTHROPIC_VERBOSE_LOGGING" = "true"
}

Write-Host "📋 Configurando variáveis de ambiente..." -ForegroundColor Yellow

foreach ($key in $envVars.Keys) {
    $value = $envVars[$key]
    
    try {
        # Verificar se já existe
        $currentValue = [Environment]::GetEnvironmentVariable($key, "User")
        
        if ($currentValue -eq $value) {
            Write-Host "   ✅ $key já está configurado: $value" -ForegroundColor Green
        } else {
            # Configurar variável
            [Environment]::SetEnvironmentVariable($key, $value, "User")
            Write-Host "   ✅ $key configurado: $value" -ForegroundColor Green
        }
    } catch {
        Write-Host "   ⚠️  Erro ao configurar $key : $_" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✅ CONFIGURAÇÃO CONCLUÍDA!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "📋 PRÓXIMOS PASSOS:" -ForegroundColor Yellow
Write-Host ""
Write-Host "   1. Feche COMPLETAMENTE o Cursor/Claude Code" -ForegroundColor White
Write-Host "   2. Reabra o Cursor/Claude Code" -ForegroundColor White
Write-Host "   3. Os tokens devem aparecer na interface" -ForegroundColor White
Write-Host ""

Write-Host "💡 ALTERNATIVA - Ver tokens via API:" -ForegroundColor Cyan
Write-Host "   Acesse: https://console.anthropic.com/settings/usage" -ForegroundColor Gray
Write-Host "   Ou use o script: npm run monitor:tokens" -ForegroundColor Gray
Write-Host ""

Write-Host "⚠️  NOTA: O Claude Code pode não ter suporte nativo para exibição de tokens." -ForegroundColor Yellow
Write-Host "   Nesse caso, você precisará verificar o uso via console da Anthropic." -ForegroundColor Yellow
Write-Host ""

