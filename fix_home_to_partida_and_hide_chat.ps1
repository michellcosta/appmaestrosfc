param(
  [string]$Branch = "feature/test-openai",
  [string]$RouterFile = "src\main.tsx",          # arquivo onde ficam as <Routes> (Vite/React Router)
  [string]$MatchFile  = "src\pages\Match.tsx",   # componente da tela de Partida
  [string]$ChatFile   = "src\pages\Chat.tsx"     # componente do Chat (não será apagado aqui)
)

function Save-Backup($path) {
  if (Test-Path $path) {
    Copy-Item $path "$($path).bak.$(Get-Date -Format 'yyyyMMdd-HHmmss')" -Force
  }
}

# 0) Branch
git checkout $Branch | Out-Null

if (-not (Test-Path $RouterFile)) {
  Write-Host "❌ Não achei $RouterFile (onde ficam as <Routes>). Me diga qual é o arquivo de rotas."
  exit 1
}

# 1) Ajusta rotas no main.tsx
$code = Get-Content $RouterFile -Raw

# backup
Save-Backup $RouterFile

# 1.1) Garante import do Navigate (react-router-dom)
if ($code -notmatch 'Navigate\s*}') {
  $code = $code -replace 'from\s+["'']react-router-dom["'']\);', 'from "react-router-dom";'
  if ($code -notmatch 'Navigate') {
    $code = $code -replace 'from\s+"react-router-dom";', 'from "react-router-dom";`nimport { Navigate } from "react-router-dom";'
  }
}

# 1.2) Garante import de Match (sem duplicar)
if ((Test-Path $MatchFile) -and ($code -notmatch 'import\s+Match\s+from\s+["'']@?/?.*Match(\.tsx)?["''];?')) {
  # tenta importar relativo: src\pages\Match.tsx -> "./pages/Match"
  $code = $code -replace '(\r?\n)(import .?;\s)+$', "`$0`r`nimport Match from "./pages/Match";"
}

# 1.3) Garante rota /partida
if ($code -notmatch 'path\s*=\s*"/partida"') {
  # insere antes de </Routes>
  $code = $code -replace '(</Routes>)', '  <Route path="/partida" element={<Match />} />`r`n$1'
  Write-Host "✅ Rota /partida adicionada."
} else {
  Write-Host "ℹ Rota /partida já existia."
}

# 1.4) Home (/) deve redirecionar para /partida (remove Chat da home)
# - remove possíveis <Route path="/" element={<Chat ... />} />
$code = $code -replace '<Route\s+path="/"\s+element=\{<\s*Chat[^>]>\s\}\s*/>', ''
$code = $code -replace '<Route\s+element=\{<\s*Chat[^>]>\s\}\s*path="/"\s*/>', ''

# - garante <Route path="/" element={<Navigate to="/partida" replace />} />
if ($code -notmatch 'path="/"\s+element=\{<\s*Navigate\s+to="/partida"') {
  $code = $code -replace '(</Routes>)', '  <Route path="/" element={<Navigate to="/partida" replace />} />`r`n$1'
  Write-Host "✅ Home (/) agora redireciona para /partida."
} else {
  Write-Host "ℹ Home (/) já redirecionava para /partida."
}

# 1.5) Remove import e rota do Chat (apenas das rotas; arquivo continua)
$code = $code -replace 'import\s+Chat\s+from\s+["'']@?/?.Chat(\.tsx)?["''];?\s', ''
$code = $code -replace '<Route\s+path="/chat"[^>]/>\s', ''

# 1.6) Salva alterações
Set-Content -Encoding UTF8 $RouterFile $code
Write-Host "📝 Rotas atualizadas em $RouterFile"

# 2) (Opcional) Ajuste cosmético: se o formatTime estava quebrado no Match.tsx, conserta
if (Test-Path $MatchFile) {
  $m = Get-Content $MatchFile -Raw
  Save-Backup $MatchFile
  $fixed = $m -replace 'const\s+formatTime\s*=\s*\(s:\s*number\)\s*=>\s*[^;]+;',
    'const formatTime = (s: number) => ${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")};'
  if ($fixed -ne $m) {
    Set-Content -Encoding UTF8 $MatchFile $fixed
    Write-Host "🛠 formatTime corrigido no Match.tsx"
  }
}

# 3) Commit & push
git add $RouterFile $MatchFile 2>$null
git commit -m "chore(routes): home (/) -> /partida e remove Chat da home" | Out-Null
git push origin $Branch | Out-Null

Write-Host "🚀 Pronto! Abra o Preview da branch $Branch no Vercel e acesse a raiz do app — deve cair em /partida."
Write-Host "ℹ Quando confirmar, posso mandar um script que APAGA definitivamente o Chat (arquivo e quaisquer restos)."
