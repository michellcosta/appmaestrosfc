# fix_partida_routes.ps1
# Garante rota /partida e redirect / -> /partida, commit e push

$ErrorActionPreference = 'Stop'

# --- Configs ---
$branch   = 'feature/test-openai'
$matchRel = 'src/pages/Match.tsx'

# --- 0) Sanidade ---
if (-not (Test-Path .git)) { Write-Host "❌ Rode na raiz do repositório (onde existe .git)"; exit 1 }
git rev-parse --is-inside-work-tree *> $null

# --- 1) Checkout da branch ---
git checkout $branch

# --- 2) Descobrir o arquivo que contém <Routes> ---
# Tentativas comuns (ordem de prioridade)
$candidates = @(
  'src/App.tsx',
  'src/app/App.tsx',
  'src/pages/App.tsx',
  'src/App.jsx',
  'src/main.tsx',
  'src/main.jsx'
) | Where-Object { Test-Path $_ }

if (-not $candidates) { Write-Host "❌ Não achei nenhum arquivo com possíveis rotas. Me diga onde ficam." ; exit 1 }

# pega o primeiro que de fato contenha <Routes
$appFile = $null
foreach ($f in $candidates) {
  $txt = Get-Content -Raw -Encoding UTF8 $f
  if ($txt -match '<Routes') { $appFile = $f; break }
}
if (-not $appFile) {
  # último recurso: usa o primeiro candidato
  $appFile = $candidates[0]
}

Write-Host "🗺  Editando rotas em: $appFile"

# --- 3) Backups de segurança ---
$stamp = (Get-Date).ToString('yyyyMMdd-HHmmss')
Copy-Item $appFile "$appFile.bak.$stamp" -Force
if (Test-Path $matchRel) { Copy-Item $matchRel "$matchRel.bak.$stamp" -Force }

# --- 4) Garantir importações (Routes/Route/Navigate e Match) ---
$app = Get-Content -Raw -Encoding UTF8 $appFile

# Se não há import de react-router-dom, insere um padrão
if ($app -notmatch 'from\s+["'']react-router-dom["'']') {
  $app = "import { Routes, Route, Navigate } from 'react-router-dom';`r`n" + $app
} else {
  # garante Navigate/Routes/Route no mesmo import
  $app = $app -replace 'import\s*\{\s*([^}])\}\s*from\s["'']react-router-dom["'']\s*;',
                       { param($m)
                         $items = $m.Groups[1].Value -split ',' | ForEach-Object { $.Trim() } | Where-Object { $ }
                         $need  = @('Routes','Route','Navigate')
                         foreach ($n in $need) { if ($items -notcontains $n) { $items += $n } }
                         "import { {0} } from 'react-router-dom';" -f (($items | Select-Object -Unique) -join ', ')
                       }
}

# import do Match (ajuste de caminho relativo mais comum: ./pages/Match)
$relToMatch = (Split-Path $appFile -Parent)
$matchImportPath = if ($relToMatch -eq 'src') { "./pages/Match" } elseif ($relToMatch -like 'src*') { "../pages/Match" } else { "./src/pages/Match" }

if ($app -notmatch "from\s+['""]$([regex]::Escape($matchImportPath))['""]") {
  if ($app -notmatch 'import\s+Match\s+from') {
    # insere import Match após o primeiro import
    $app = $app -replace '(^import\s.*?$)',
                        "`$1`r`nimport Match from '$matchImportPath';"
  }
}

# --- 5) Inserir/garantir a rota /partida dentro de <Routes>…</Routes> ---
if ($app -notmatch 'path\s*=\s*"/partida"') {
  # Insere dentro do bloco de Routes usando backreferences $1 $2 $3 — tudo dentro de UMA string
  $app = [regex]::Replace($app,
    '(<Routes[^>]>)([\s\S]?)(</Routes>)',
    '$1$2  <Route path="/partida" element={<Match />} />$3',
    [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)
  Write-Host "🏁 Rota /partida adicionada."
} else {
  Write-Host "ℹ  Rota /partida já existe."
}

# --- 6) Garantir redirect da home "/" para "/partida" ---
if ($app -notmatch 'path\s*=\s*"/"\s*element\s*=\s*\{\s*<Navigate\s+to="/partida"') {
  $app = [regex]::Replace($app,
    '(<Routes[^>]>)([\s\S]?)(</Routes>)',
    '$1$2  <Route path="/" element={<Navigate to="/partida" replace />} />$3',
    [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)
  Write-Host "➡  Redirect / -> /partida garantido."
} else {
  Write-Host "ℹ  Redirect / -> /partida já existe."
}

# --- 7) Salvar app ---
Set-Content -Encoding UTF8 $appFile $app
Write-Host "💾 Salvo: $appFile"

# --- 8) (Opcional) garantir que Match exporta default (sem mexer no visual do seu app) ---
if (Test-Path $matchRel) {
  $match = Get-Content -Raw -Encoding UTF8 $matchRel
  if ($match -notmatch 'export\s+default\s+function\s+Match|export\s+default\s+Match') {
    # tenta transformar "export const Match = ..." em default (idempotente)
    $match = $match -replace 'export\s+const\s+Match\s*=\s*', 'const Match = '
    if ($match -notmatch 'export\s+default\s+Match') {
      $match += "`r`nexport default Match;`r`n"
    }
    Set-Content -Encoding UTF8 $matchRel $match
    Write-Host "🔧 Ajuste leve no export de Match (se necessário)."
  }
}

# --- 9) Commit & push ---
git add $appFile,$matchRel 2>$null
git commit -m "chore(routes): home (/) redireciona para /partida e garante rota /partida" | Out-Null
git push origin $branch | Out-Null

Write-Host "✅ Feito! Agora abra o Preview da branch $branch no Vercel (URL do deploy mais recente)."
Write-Host "   Deve abrir diretamente em /partida e mostrar a tela do jogo."