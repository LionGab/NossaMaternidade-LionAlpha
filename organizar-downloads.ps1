# Script para Organizar e Limpar Pasta Downloads
# Autor: Nossa Maternidade
# Versão: 1.0

param(
    [switch]$AutoConfirm = $false,
    [switch]$DryRun = $false
)

Write-Host "`n📁 ORGANIZAÇÃO DA PASTA DOWNLOADS" -ForegroundColor Cyan
Write-Host ("=" * 70) -ForegroundColor Gray
Write-Host ""

$downloadsPath = "$env:USERPROFILE\Downloads"

if (-not (Test-Path $downloadsPath)) {
    Write-Host "[ERRO] Pasta Downloads não encontrada: $downloadsPath" -ForegroundColor Red
    exit 1
}

Write-Host "[INFO] Pasta Downloads: $downloadsPath" -ForegroundColor Yellow
Write-Host ""

# Função para calcular tamanho
function Get-TamanhoItem {
    param([string]$Caminho)
    
    try {
        if (-not (Test-Path $Caminho)) { return 0 }
        
        if (Test-Path $Caminho -PathType Leaf) {
            return (Get-Item $Caminho).Length
        }
        
        $tamanho = (Get-ChildItem $Caminho -Recurse -File -ErrorAction SilentlyContinue | 
                    Measure-Object -Property Length -Sum).Sum
        return $tamanho
    }
    catch {
        return 0
    }
}

# Função para formatar tamanho
function Format-Tamanho {
    param([long]$Bytes)
    
    if ($Bytes -lt 1KB) { return "$Bytes B" }
    if ($Bytes -lt 1MB) { return "$([math]::Round($Bytes/1KB, 2)) KB" }
    if ($Bytes -lt 1GB) { return "$([math]::Round($Bytes/1MB, 2)) MB" }
    return "$([math]::Round($Bytes/1GB, 2)) GB"
}

# Analisar Downloads
Write-Host "[ANÁLISE] Analisando pasta Downloads..." -ForegroundColor Yellow
Write-Host ""

$itens = Get-ChildItem $downloadsPath -ErrorAction SilentlyContinue
$pastas = $itens | Where-Object { $_.PSIsContainer }
$arquivos = $itens | Where-Object { -not $_.PSIsContainer }

Write-Host "   [INFO] Total de itens: $($itens.Count)" -ForegroundColor White
Write-Host "   [INFO] Pastas: $($pastas.Count)" -ForegroundColor White
Write-Host "   [INFO] Arquivos: $($arquivos.Count)" -ForegroundColor White
Write-Host ""

# Analisar pastas
Write-Host "[PASTAS] Analisando pastas..." -ForegroundColor Cyan
Write-Host ""

$pastasAnalisadas = @()
$pastasVazias = @()
$totalEspacoPastas = 0

foreach ($pasta in $pastas) {
    $tamanho = Get-TamanhoItem -Caminho $pasta.FullName
    $arquivosNaPasta = (Get-ChildItem $pasta.FullName -Recurse -File -ErrorAction SilentlyContinue).Count
    
    $info = @{
        Nome = $pasta.Name
        Caminho = $pasta.FullName
        Tamanho = $tamanho
        TamanhoGB = [math]::Round($tamanho / 1GB, 2)
        Arquivos = $arquivosNaPasta
        UltimaModificacao = $pasta.LastWriteTime
        Vazia = ($arquivosNaPasta -eq 0)
    }
    
    $pastasAnalisadas += $info
    $totalEspacoPastas += $tamanho
    
    if ($info.Vazia) {
        $pastasVazias += $info
        Write-Host "   [VAZIA] $($pasta.Name)" -ForegroundColor DarkGray
    }
    else {
        Write-Host "   [✓] $($pasta.Name)" -ForegroundColor Green
        Write-Host "      Tamanho: $(Format-Tamanho -Bytes $tamanho)" -ForegroundColor Gray
        Write-Host "      Arquivos: $arquivosNaPasta" -ForegroundColor Gray
        Write-Host "      Última modificação: $($pasta.LastWriteTime.ToString('yyyy-MM-dd'))" -ForegroundColor DarkGray
    }
    Write-Host ""
}

# Analisar arquivos grandes
Write-Host "[ARQUIVOS] Analisando arquivos grandes (>100MB)..." -ForegroundColor Cyan
Write-Host ""

$arquivosGrandes = $arquivos | Where-Object { $_.Length -gt 100MB } | 
                   Sort-Object Length -Descending | 
                   Select-Object -First 20

$totalEspacoArquivos = ($arquivos | Measure-Object -Property Length -Sum).Sum

if ($arquivosGrandes) {
    Write-Host "   [INFO] Arquivos grandes encontrados: $($arquivosGrandes.Count)" -ForegroundColor Yellow
    foreach ($arquivo in $arquivosGrandes) {
        Write-Host "   • $($arquivo.Name)" -ForegroundColor White
        Write-Host "     $(Format-Tamanho -Bytes $arquivo.Length)" -ForegroundColor Gray
        Write-Host "     $($arquivo.LastWriteTime.ToString('yyyy-MM-dd'))" -ForegroundColor DarkGray
    }
    Write-Host ""
}

# Resumo
Write-Host "[RESUMO] Resumo da Análise:" -ForegroundColor Cyan
Write-Host "   Total de pastas: $($pastas.Count)" -ForegroundColor White
Write-Host "   Pastas vazias: $($pastasVazias.Count)" -ForegroundColor $(if ($pastasVazias.Count -gt 0) { "Yellow" } else { "Green" })
Write-Host "   Espaço usado por pastas: $(Format-Tamanho -Bytes $totalEspacoPastas)" -ForegroundColor White
Write-Host "   Espaço usado por arquivos: $(Format-Tamanho -Bytes $totalEspacoArquivos)" -ForegroundColor White
Write-Host "   Espaço total: $(Format-Tamanho -Bytes ($totalEspacoPastas + $totalEspacoArquivos))" -ForegroundColor Yellow
Write-Host ""

# Ações sugeridas
Write-Host "[AÇÕES SUGERIDAS] O que podemos fazer:" -ForegroundColor Cyan
Write-Host ""

$acoes = @()

# 1. Remover pastas vazias
if ($pastasVazias.Count -gt 0) {
    $acoes += @{
        Tipo = "Remover pastas vazias"
        Descricao = "$($pastasVazias.Count) pasta(s) vazia(s)"
        Itens = $pastasVazias
    }
    Write-Host "   1. [REMOVER] $($pastasVazias.Count) pasta(s) vazia(s)" -ForegroundColor Yellow
}

# 2. Organizar arquivos por tipo
if ($arquivos.Count -gt 0) {
    $acoes += @{
        Tipo = "Organizar arquivos por tipo"
        Descricao = "$($arquivos.Count) arquivo(s) em subpastas por extensão"
        Itens = $arquivos
    }
    Write-Host "   2. [ORGANIZAR] $($arquivos.Count) arquivo(s) em subpastas por tipo" -ForegroundColor Cyan
}

# 3. Mover arquivos antigos (>1 ano)
$arquivosAntigos = $arquivos | Where-Object { 
    $_.LastWriteTime -lt (Get-Date).AddYears(-1) 
}
if ($arquivosAntigos.Count -gt 0) {
    $acoes += @{
        Tipo = "Mover arquivos antigos"
        Descricao = "$($arquivosAntigos.Count) arquivo(s) com mais de 1 ano"
        Itens = $arquivosAntigos
    }
    Write-Host "   3. [MOVER] $($arquivosAntigos.Count) arquivo(s) antigo(s) (>1 ano) para pasta 'Arquivos Antigos'" -ForegroundColor Yellow
}

# 4. Remover duplicados (mesmo nome)
$duplicados = $arquivos | Group-Object Name | Where-Object { $_.Count -gt 1 }
if ($duplicados) {
    $totalDuplicados = ($duplicados | ForEach-Object { $_.Count - 1 } | Measure-Object -Sum).Sum
    $acoes += @{
        Tipo = "Remover duplicados"
        Descricao = "$totalDuplicados arquivo(s) duplicado(s)"
        Itens = $duplicados
    }
    Write-Host "   4. [REMOVER] $totalDuplicados arquivo(s) duplicado(s) (mesmo nome)" -ForegroundColor Red
}

Write-Host ""

# Executar ações
if ($acoes.Count -eq 0) {
    Write-Host "[INFO] Nada a fazer. Downloads já está organizado!" -ForegroundColor Green
    exit 0
}

if ($DryRun) {
    Write-Host "[DRY RUN] Modo de simulação ativado. Nenhuma alteração será feita." -ForegroundColor Yellow
    Write-Host ""
    exit 0
}

# Confirmar ações
if (-not $AutoConfirm) {
    Write-Host "[CONFIRMAÇÃO] Deseja executar as ações sugeridas?" -ForegroundColor Yellow
    Write-Host ""
    $confirmacao = Read-Host "Digite 'SIM' para continuar ou 'NÃO' para cancelar"
    
    if ($confirmacao -ne "SIM") {
        Write-Host "`n[CANCELADO] Operação cancelada pelo usuário." -ForegroundColor Red
        exit 0
    }
}

Write-Host ""
Write-Host "[EXECUTANDO] Executando ações..." -ForegroundColor Yellow
Write-Host ""

$itensRemovidos = 0
$itensOrganizados = 0
$erros = 0

# 1. Remover pastas vazias
$acaoRemoverVazias = $acoes | Where-Object { $_.Tipo -eq "Remover pastas vazias" }
if ($acaoRemoverVazias) {
    Write-Host "[AÇÃO 1] Removendo pastas vazias..." -ForegroundColor Cyan
    foreach ($pasta in $acaoRemoverVazias.Itens) {
        try {
            if (-not $DryRun) {
                Remove-Item $pasta.Caminho -Recurse -Force -ErrorAction Stop
            }
            Write-Host "   [✓] Removida: $($pasta.Nome)" -ForegroundColor Green
            $itensRemovidos++
        }
        catch {
            Write-Host "   [✗] Erro ao remover $($pasta.Nome): $($_.Exception.Message)" -ForegroundColor Red
            $erros++
        }
    }
    Write-Host ""
}

# 2. Organizar arquivos por tipo
$acaoOrganizar = $acoes | Where-Object { $_.Tipo -eq "Organizar arquivos por tipo" }
if ($acaoOrganizar) {
    Write-Host "[AÇÃO 2] Organizando arquivos por tipo..." -ForegroundColor Cyan
    
    $categorias = @{
        "Imagens" = @(".jpg", ".jpeg", ".png", ".gif", ".bmp", ".svg", ".webp", ".ico")
        "Videos" = @(".mp4", ".avi", ".mkv", ".mov", ".wmv", ".flv", ".webm", ".m4v", ".m4a")
        "Documentos" = @(".pdf", ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx", ".txt", ".rtf")
        "Arquivos" = @(".zip", ".rar", ".7z", ".tar", ".gz", ".iso")
        "Executaveis" = @(".exe", ".msi", ".dmg", ".pkg")
        "Musicas" = @(".mp3", ".wav", ".flac", ".aac", ".ogg", ".m4a")
        "Codigo" = @(".js", ".ts", ".py", ".java", ".cpp", ".c", ".html", ".css", ".json", ".xml")
    }
    
    foreach ($arquivo in $acaoOrganizar.Itens) {
        $extensao = $arquivo.Extension.ToLower()
        $categoria = "Outros"
        
        foreach ($cat in $categorias.GetEnumerator()) {
            if ($cat.Value -contains $extensao) {
                $categoria = $cat.Key
                break
            }
        }
        
        $pastaDestino = Join-Path $downloadsPath $categoria
        if (-not (Test-Path $pastaDestino)) {
            if (-not $DryRun) {
                New-Item -ItemType Directory -Path $pastaDestino -Force | Out-Null
            }
        }
        
        $destino = Join-Path $pastaDestino $arquivo.Name
        
        # Verificar se já existe
        if (Test-Path $destino) {
            $destino = Join-Path $pastaDestino "$($arquivo.BaseName)_$($arquivo.LastWriteTime.ToString('yyyyMMdd'))$($arquivo.Extension)"
        }
        
        try {
            if (-not $DryRun) {
                Move-Item $arquivo.FullName $destino -Force -ErrorAction Stop
            }
            Write-Host "   [✓] Movido: $($arquivo.Name) → $categoria\" -ForegroundColor Green
            $itensOrganizados++
        }
        catch {
            Write-Host "   [✗] Erro ao mover $($arquivo.Name): $($_.Exception.Message)" -ForegroundColor Red
            $erros++
        }
    }
    Write-Host ""
}

# 3. Mover arquivos antigos
$acaoAntigos = $acoes | Where-Object { $_.Tipo -eq "Mover arquivos antigos" }
if ($acaoAntigos) {
    Write-Host "[AÇÃO 3] Movendo arquivos antigos..." -ForegroundColor Cyan
    
    $pastaAntigos = Join-Path $downloadsPath "Arquivos Antigos"
    if (-not (Test-Path $pastaAntigos)) {
        if (-not $DryRun) {
            New-Item -ItemType Directory -Path $pastaAntigos -Force | Out-Null
        }
    }
    
    foreach ($arquivo in $acaoAntigos.Itens) {
        $destino = Join-Path $pastaAntigos $arquivo.Name
        
        if (Test-Path $destino) {
            $destino = Join-Path $pastaAntigos "$($arquivo.BaseName)_$($arquivo.LastWriteTime.ToString('yyyyMMdd'))$($arquivo.Extension)"
        }
        
        try {
            if (-not $DryRun) {
                Move-Item $arquivo.FullName $destino -Force -ErrorAction Stop
            }
            Write-Host "   [✓] Movido: $($arquivo.Name)" -ForegroundColor Green
            $itensOrganizados++
        }
        catch {
            Write-Host "   [✗] Erro ao mover $($arquivo.Name): $($_.Exception.Message)" -ForegroundColor Red
            $erros++
        }
    }
    Write-Host ""
}

# 4. Remover duplicados
$acaoDuplicados = $acoes | Where-Object { $_.Tipo -eq "Remover duplicados" }
if ($acaoDuplicados) {
    Write-Host "[AÇÃO 4] Removendo arquivos duplicados..." -ForegroundColor Cyan
    
    foreach ($grupo in $acaoDuplicados.Itens) {
        # Manter o mais recente, remover os outros
        $arquivosOrdenados = $grupo.Group | Sort-Object LastWriteTime -Descending
        $manter = $arquivosOrdenados[0]
        $remover = $arquivosOrdenados[1..($arquivosOrdenados.Count-1)]
        
        foreach ($arquivo in $remover) {
            try {
                if (-not $DryRun) {
                    Remove-Item $arquivo.FullName -Force -ErrorAction Stop
                }
                Write-Host "   [✓] Removido duplicado: $($arquivo.Name)" -ForegroundColor Green
                $itensRemovidos++
            }
            catch {
                Write-Host "   [✗] Erro ao remover $($arquivo.Name): $($_.Exception.Message)" -ForegroundColor Red
                $erros++
            }
        }
    }
    Write-Host ""
}

# Resumo final
Write-Host "[RESUMO FINAL] Resumo Final:" -ForegroundColor Cyan
Write-Host "   Pastas vazias removidas: $itensRemovidos" -ForegroundColor White
Write-Host "   Arquivos organizados: $itensOrganizados" -ForegroundColor White
Write-Host "   Erros: $erros" -ForegroundColor $(if ($erros -gt 0) { "Red" } else { "Green" })
Write-Host ""

Write-Host "[SUCCESS] Organização concluída!" -ForegroundColor Green
Write-Host ""
Write-Host "[PRÓXIMOS PASSOS]" -ForegroundColor Cyan
Write-Host "   • Revise as pastas criadas em Downloads" -ForegroundColor White
Write-Host "   • Verifique se tudo está organizado corretamente" -ForegroundColor White
Write-Host "   • Considere fazer backup antes de remover arquivos antigos" -ForegroundColor Yellow
Write-Host ""

