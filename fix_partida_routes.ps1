$branch = "feature/test-openai"
$indexFile = "src\main.tsx"

# 1) Garantir branch
git checkout $branch

# 2) Verifica se o arquivo existe
if (-Not (Test-Path $indexFile)) {
  Write-Host "❌ Não achei $indexFile"
  exit 1
}

# 3) Garante que a rota /partida existe
$app = Get-Content $indexFile -Raw
if ($app -notmatch 'path\s*=\s*"/partida"') {
  $app = $app -replace '(</Routes>)', '  <Route path="/partida" element={<Match />} />`n$1'
  Set-Content -Encoding UTF8 $indexFile $app
  Write-Host "✅ Rota /partida adicionada em $indexFile"
} else {
  Write-Host "ℹ Já existe rota /partida em $indexFile"
}

# 4) Commit e push
git add $indexFile
git commit -m "fix(routes): adiciona rota /partida para Match"
git push origin $branch

Write-Host "🚀 Pronto! Veja no Preview do Vercel em /partida"
