# ============================================
# Script: Fix Supabase Migration History
# Descricao: Sincroniza historico de migracoes entre local e remoto
# Uso: .\scripts\fix-supabase-migrations.ps1
# ============================================

param(
    [switch]$DryRun = $false,
    [int]$RetryCount = 3,
    [int]$DelaySeconds = 2,
    [int]$TimeoutSeconds = 30
)

Write-Host "Fix Supabase Migration History" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

# Lista de migracoes para marcar como REVERTED (nao existem mais localmente)
$revertedMigrations = @(
    "001",
    "002",
    "20250103",
    "20250104",
    "20250105",
    "20250106",
    "20251116211817",
    "20251117005207"
)

# Lista de migracoes para marcar como APPLIED (existem localmente e no remoto)
$appliedMigrations = @(
    "20250101000000",
    "20250126000000",
    "20250126",
    "20250127000000",
    "20250127",
    "20251202000000"
)

function Invoke-SupabaseRepair {
    param(
        [string]$Status,
        [string]$MigrationName,
        [int]$TimeoutSec = 30
    )

    $command = "supabase migration repair --status $Status $MigrationName"
    Write-Host "  Executando: $command" -ForegroundColor Yellow

    if ($DryRun) {
        Write-Host "    [DRY-RUN] Nao executado" -ForegroundColor Gray
        return $true
    }

    $attempt = 0
    $success = $false

    while ($attempt -lt $RetryCount -and -not $success) {
        $attempt++
        Write-Host "    Tentativa $attempt/$RetryCount..." -ForegroundColor Gray

        try {
            $stdoutFile = [System.IO.Path]::GetTempFileName()
            $stderrFile = [System.IO.Path]::GetTempFileName()

            $process = Start-Process -FilePath "supabase" -ArgumentList "migration", "repair", "--status", $Status, $MigrationName -NoNewWindow -PassThru -RedirectStandardOutput $stdoutFile -RedirectStandardError $stderrFile

            $completed = $process.WaitForExit($TimeoutSec * 1000)

            if (-not $completed) {
                Write-Host "    Timeout apos ${TimeoutSec}s (tentativa $attempt/$RetryCount)" -ForegroundColor Yellow
                Stop-Process -Id $process.Id -Force -ErrorAction SilentlyContinue

                if ($attempt -lt $RetryCount) {
                    Write-Host "    Aguardando ${DelaySeconds}s antes de retry..." -ForegroundColor Gray
                    Start-Sleep -Seconds $DelaySeconds
                }
                else {
                    Write-Host "    Falhou apos $RetryCount tentativas (timeout)" -ForegroundColor Red
                }
                continue
            }

            if ($process.ExitCode -eq 0) {
                Write-Host "    Sucesso (tentativa $attempt)" -ForegroundColor Green
                $success = $true
            }
            else {
                $stderr = Get-Content $stderrFile -Raw -ErrorAction SilentlyContinue
                Write-Host "    Exit code: $($process.ExitCode) (tentativa $attempt/$RetryCount)" -ForegroundColor Yellow
                if ($stderr) {
                    Write-Host "    Erro: $stderr" -ForegroundColor Gray
                }

                if ($attempt -lt $RetryCount) {
                    Write-Host "    Aguardando ${DelaySeconds}s antes de retry..." -ForegroundColor Gray
                    Start-Sleep -Seconds $DelaySeconds
                }
                else {
                    Write-Host "    Falhou apos $RetryCount tentativas" -ForegroundColor Red
                }
            }

            Remove-Item $stdoutFile -ErrorAction SilentlyContinue
            Remove-Item $stderrFile -ErrorAction SilentlyContinue
        }
        catch {
            Write-Host "    Excecao: $_" -ForegroundColor Red
            $success = $false

            if ($attempt -lt $RetryCount) {
                Write-Host "    Aguardando ${DelaySeconds}s antes de retry..." -ForegroundColor Gray
                Start-Sleep -Seconds $DelaySeconds
            }
            else {
                break
            }
        }
    }

    if (-not $success -and -not $DryRun) {
        Write-Host "    Migracao $MigrationName falhou - continuando..." -ForegroundColor Yellow
    }

    if (-not $DryRun) {
        Start-Sleep -Milliseconds 500
    }

    return $success
}

# Verificar se Supabase CLI esta instalado
Write-Host "Verificando Supabase CLI..." -ForegroundColor Cyan
try {
    $supabaseVersion = supabase --version 2>&1
    Write-Host "  Supabase CLI encontrado: $supabaseVersion" -ForegroundColor Green
}
catch {
    Write-Host "  Supabase CLI nao encontrado!" -ForegroundColor Red
    Write-Host "  Instale com: npm install -g supabase" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "Processando migracoes REVERTED..." -ForegroundColor Cyan
Write-Host "  (Migracoes que nao existem mais localmente)" -ForegroundColor Gray
Write-Host ""

$revertedSuccess = 0
$revertedFailed = 0

foreach ($migration in $revertedMigrations) {
    if (Invoke-SupabaseRepair -Status "reverted" -MigrationName $migration -TimeoutSec $TimeoutSeconds) {
        $revertedSuccess++
    }
    else {
        $revertedFailed++
    }
}

Write-Host ""
Write-Host "Processando migracoes APPLIED..." -ForegroundColor Cyan
Write-Host "  (Migracoes que existem localmente e no remoto)" -ForegroundColor Gray
Write-Host ""

$appliedSuccess = 0
$appliedFailed = 0

foreach ($migration in $appliedMigrations) {
    if (Invoke-SupabaseRepair -Status "applied" -MigrationName $migration -TimeoutSec $TimeoutSeconds) {
        $appliedSuccess++
    }
    else {
        $appliedFailed++
    }
}

Write-Host ""
Write-Host "=================================" -ForegroundColor Cyan
Write-Host "Resumo:" -ForegroundColor Cyan

if ($revertedFailed -eq 0) {
    Write-Host "  REVERTED: $revertedSuccess sucesso, $revertedFailed falhas" -ForegroundColor Green
} else {
    Write-Host "  REVERTED: $revertedSuccess sucesso, $revertedFailed falhas" -ForegroundColor Yellow
}

if ($appliedFailed -eq 0) {
    Write-Host "  APPLIED:  $appliedSuccess sucesso, $appliedFailed falhas" -ForegroundColor Green
} else {
    Write-Host "  APPLIED:  $appliedSuccess sucesso, $appliedFailed falhas" -ForegroundColor Yellow
}

Write-Host ""

if ($revertedFailed -eq 0 -and $appliedFailed -eq 0) {
    Write-Host "Todas as migracoes foram sincronizadas com sucesso!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Proximo passo:" -ForegroundColor Cyan
    Write-Host "  supabase db pull" -ForegroundColor Yellow
}
else {
    Write-Host "Algumas migracoes falharam." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Alternativas:" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "  RECOMENDADO: Use SQL direto no Supabase Dashboard:" -ForegroundColor Yellow
    Write-Host "     1. Acesse: https://app.supabase.com/project/[seu-project-ref]" -ForegroundColor Gray
    Write-Host "     2. SQL Editor > New Query" -ForegroundColor Gray
    Write-Host "     3. Cole conteudo de: scripts/fix-migrations-manual.sql" -ForegroundColor Gray
    Write-Host "     4. Execute (Run ou Ctrl+Enter)" -ForegroundColor Gray
    Write-Host ""
    Write-Host "  Ou tente novamente com mais timeout:" -ForegroundColor Yellow
    Write-Host "     .\scripts\fix-supabase-migrations.ps1 -TimeoutSeconds 60 -DelaySeconds 5" -ForegroundColor Gray
}
