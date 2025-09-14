Param(
  [string]$File = "src/pages/Match.tsx"
)

function Write-Info($msg){ Write-Host $msg -ForegroundColor Cyan }
function Write-Ok($msg){ Write-Host $msg -ForegroundColor Green }
function Write-Err($msg){ Write-Host $msg -ForegroundColor Red }

# 0) Pré-checagens
if (-not (Test-Path $File)) {
  Write-Err "❌ Arquivo não encontrado: $File"
  exit 1
}

# Branch atual
$BRANCH = ""
try { $BRANCH = (git rev-parse --abbrev-ref HEAD).Trim() } catch { $BRANCH = "main" }

# 1) Backup
$stamp = [DateTime]::UtcNow.Ticks
$backup = "$File.bak_$stamp"
Copy-Item $File $backup -Force
Write-Info "📦 Backup criado: $backup"

# 2) Ler arquivo
$content = Get-Content $File -Raw

# 3) Ajustes de estado (permitem placeholder undefined)
$content = [regex]::Replace($content,
  'const \[goalAuthor,\s*setGoalAuthor\]\s*=\s*useState<[^>]+>\([^)]*\);',
  'const [goalAuthor, setGoalAuthor] = useState<string | undefined>(undefined);'
)
$content = [regex]::Replace($content,
  'const \[goalAssist,\s*setGoalAssist\]\s*=\s*useState<[^>]+>\([^)]*\);',
  'const [goalAssist, setGoalAssist] = useState<string | "none" | undefined>(undefined);'
)
$content = [regex]::Replace($content,
  'const \[nextTeamChoice,\s*setNextTeamChoice\]\s*=\s*useState<TeamColor>\([^)]*\);',
  'const [nextTeamChoice, setNextTeamChoice] = useState<TeamColor | undefined>(undefined);'
)

# 4) Placeholders nos dois primeiros <SelectValue> sem placeholder
$patternSelectValue = '<SelectValue(?![^>]*placeholder=)'
$matches = [regex]::Matches($content, $patternSelectValue)
if ($matches.Count -ge 1) {
  $i = $matches[0].Index; $l = $matches[0].Length
  $content = $content.Substring(0,$i) + '<SelectValue placeholder="Selecione o autor do gol"' + $content.Substring($i+$l)
}
$matches2 = [regex]::Matches($content, $patternSelectValue)
if ($matches2.Count -ge 1) {
  $i = $matches2[0].Index; $l = $matches2[0].Length
  $content = $content.Substring(0,$i) + '<SelectValue placeholder="Selecione o próximo time"' + $content.Substring($i+$l)
}

# 5) Gols Recentes – trocar botões por ícones (Pencil / Trash2)
$content = [regex]::Replace(
  $content,
  '<Button[^>]*>\s*Editar\s*</Button>',
  '<Button variant="ghost" size="icon" className="h-8 w-8"><Pencil className="h-4 w-4" /><span className="sr-only">Editar</span></Button>'
)
$content = [regex]::Replace(
  $content,
  '<Button[^>]*>\s*Excluir\s*</Button>',
  '<Button variant="ghost" size="icon" className="h-8 w-8"><Trash2 className="h-4 w-4 text-red-500" /><span className="sr-only">Excluir</span></Button>'
)

# 6) Import dos ícones (lucide-react)
if ($content -notmatch 'from "lucide-react"') {
  $content = "import { Pencil, Trash2 } from ""lucide-react"";`r`n" + $content
} else {
  $content = [regex]::Replace($content,
    'import\s*\{\s*([^}]*)\}\s*from\s*"lucide-react";',
    {
      param($m)
      $inside = $m.Groups[1].Value
      $items = @()
      foreach ($x in ($inside -split '\s*,\s*')) { if ($x -and $x.Trim()) { $items += $x.Trim() } }
      if ($items -notcontains 'Pencil') { $items += 'Pencil' }
      if ($items -notcontains 'Trash2') { $items += 'Trash2' }
      $newInside = ($items -join ', ')
      "import { $newInside } from ""lucide-react"";"
    }
  )
}

# 7) Gravar arquivo
Set-Content -Path $File -Value $content -NoNewline -Encoding UTF8
Write-Ok "✅ Patch de UI aplicado em $File"

# 8) Garantir dependência lucide-react
if (-not (Select-String -Path "package.json" -Pattern 'lucide-react' -Quiet)) {
  Write-Info "📦 Instalando lucide-react…"
  npm i lucide-react | Out-Null
}

# 9) Limpeza leve de caches e arquivos temporários
Write-Info "🧽 Limpando caches…"
$paths = @('node_modules\.vite','.turbo','dist','.vercel\output')
foreach($p in $paths){ if (Test-Path $p){ Remove-Item $p -Recurse -Force -ErrorAction SilentlyContinue } }

Write-Info "🧹 Limpando backups/scripts temporários…"
Get-ChildItem -Recurse -File -ErrorAction SilentlyContinue | Where-Object {
  $_.Name -match '(\.bak(_\d+)?$|^fix_.*\.sh$|^update_match_page_v.*\.sh$|^create_.*_v.*\.sh$)'
} | Remove-Item -Force -ErrorAction SilentlyContinue

# 10) Git add/commit/push
Write-Info "🧰 Enviando alterações para o Git…"
git add $File | Out-Null
try {
  git commit -m "ux(match): placeholders (+Gol/Encerrar) e ações com ícones (mobile); cleanup leve" | Out-Null
} catch {
  Write-Info "ℹ️ Nada para commitar (talvez já aplicado)."
}
try {
  git push origin $BRANCH
  Write-Ok "🚀 Push feito para: $BRANCH"
} catch {
  Write-Err "⚠️ Não consegui fazer push automático. Faça manualmente:  git push origin $BRANCH"
}

Write-Ok "Pronto! Agora rode: npm run dev (ou npm run build) e confira."
