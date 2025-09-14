Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$branch   = "feature/test-openai"
$repoRoot = (Resolve-Path ".").Path

# Arquivos candidatos de roteamento
$routerFiles = @(
  "src\main.tsx",
  "src\App.tsx",
  "src\app\App.tsx"
) | ForEach-Object { Join-Path $repoRoot $_ } | Where-Object { Test-Path $_ }

if (-not $routerFiles) {
  Write-Host "❌ Não encontrei src/main.tsx nem src/App.tsx. Me diga qual é o arquivo de rotas."
  exit 1
}

$changed = @()

function RxReplace($text, $pattern, $evaluator, [System.Text.RegularExpressions.RegexOptions]$opts) {
  return [regex]::Replace($text, $pattern, $evaluator, $opts)
}

function Remove-ChatStuff([string]$code) {
  $opts = [System.Text.RegularExpressions.RegexOptions]::IgnoreCase -bor
          [System.Text.RegularExpressions.RegexOptions]::Multiline

  # import Chat
  $code = RxReplace $code '^\s*import\s+.?\sfrom\s["''](?:\.\/|@\/)pages\/Chat(?:\.tsx)?["''];?\s*$' { "" } $opts

  # rota Chat (JSX), usar Singleline para pegar quebra de linha
  $opts2 = [System.Text.RegularExpressions.RegexOptions]::IgnoreCase -bor
           [System.Text.RegularExpressions.RegexOptions]::Singleline

  $code = RxReplace $code '<Route\s+path\s*=\s*["'']\/chat["'']\s+element\s*=\s*{\s*<\s*Chat[^}]}\s\/>\s*' { "" } $opts2
  $code = RxReplace $code '<Route[^>]element\s=\s*{\s*<\s*Chat[^}]}\s\/>\s*' { "" } $opts2
  return $code
}

function EnsureRRDImports([string]$code) {
  $optsM = [System.Text.RegularExpressions.RegexOptions]::IgnoreCase -bor
           [System.Text.RegularExpressions.RegexOptions]::Multiline

  # remove qualquer import existente de RRD
  $code = RxReplace $code '^\s*import\s*\{?[^\n]\}?\s*from\s["'']react-router-dom["''];?\s*$' { "" } $optsM

  if ($code -notmatch 'from\s+["'']react-router-dom["'']') {
    $rrd = 'import { Routes, Route, Navigate } from "react-router-dom";'
    $code = $rrd + "`r`n" + $code
  }
  return $code
}

function EnsureMatchImport([string]$code) {
  if ($code -notmatch 'from\s+["''](\.\/|@\/)pages\/Match') {
    $code = 'import Match from "./pages/Match";' + "`r`n" + $code
  }
  return $code
}

function EnsurePartidaRoutes([string]$code) {
  if ($code -notmatch '<Routes') { return $code }

  $addPartida = '<Route path="/partida" element={<Match />} />'
  $addRootNav = '<Route path="/" element={<Navigate to="/partida" replace />} />'

  $optsI  = [System.Text.RegularExpressions.RegexOptions]::IgnoreCase
  $optsIS = $optsI -bor [System.Text.RegularExpressions.RegexOptions]::Singleline

  # cria rota /partida se não existir
  if ($code -notmatch '<Route\s+path\s*=\s*["'']\/partida["'']') {
    $code = RxReplace $code '(<Routes[^>]*>)' { param($m) $m.Groups[1].Value + "`r`n    " + $addPartida } $optsI
  }

  # raiz "/" → Navigate para /partida
  if ($code -match '<Route\s+path\s*=\s*["'']\/["'']') {
    # se já tem element={}, troca o conteúdo
    $code = RxReplace $code '(<Route\s+path\s*=\s*["'']\/["''][^>]element\s=\s*{)[^}]+(}\s*\/>)' { param($m) $m.Groups[1].Value + '<Navigate to="/partida" replace />' + $m.Groups[2].Value } $optsIS
    # se não tinha element, injeta um
    $code = RxReplace $code '(<Route\s+path\s*=\s*["'']\/["''])(\s*\/>)' { param($m) $m.Groups[1].Value + ' element={<Navigate to="/partida" replace />}' + $m.Groups[2].Value } $optsI
  } else {
    # adiciona rota de raiz apontando para /partida
    $code = RxReplace $code '(<Routes[^>]*>)' { param($m) $m.Groups[1].Value + "`r`n    " + $addRootNav } $optsI
  }

  return $code
}

foreach ($path in $routerFiles) {
  $orig = Get-Content -Raw -Encoding UTF8 $path
  $code = $orig

  $code = Remove-ChatStuff  $code
  $code = EnsureRRDImports  $code
  $code = EnsureMatchImport $code
  $code = EnsurePartidaRoutes $code

  if ($code -ne $orig) {
    Copy-Item $path "$path.bak.$(Get-Date -Format 'yyyyMMdd-HHmmss')" -Force
    Set-Content -Path $path -Value $code -Encoding UTF8
    $changed += $path
    Write-Host ("✔ Ajustado: " + ($path.Replace($repoRoot+'\','')))
  } else {
    Write-Host ("ℹ Sem alterações em: " + ($path.Replace($repoRoot+'\','')))
  }
}

if ($changed.Count -gt 0) {
  git add $changed | Out-Null
  git commit -m "fix(routes): raiz -> /partida; rota /partida com Match; Chat removido" | Out-Null
  git push origin $branch | Out-Null
  Write-Host "🚀 Commit enviado. Quando o Preview do Vercel terminar, abra a raiz do app: deve cair em /partida."
} else {
  Write-Host "ℹ Nada a alterar (parece certo). Se ainda cair no Chat, me diga qual arquivo é o roteador real."
}
