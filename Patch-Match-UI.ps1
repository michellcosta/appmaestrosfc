Param(
  [string]$File = "src/pages/Match.tsx"
)

$ErrorActionPreference = 'Stop'
function Say($m,$c="Cyan"){ Write-Host $m -ForegroundColor $c }
function Ok($m){ Say $m "Green" }
function Warn($m){ Say $m "Yellow" }
function Err($m){ Say $m "Red" }

if (-not (Test-Path $File)) { Err "❌ Arquivo não encontrado: $File"; exit 1 }
$BRANCH = (git rev-parse --abbrev-ref HEAD 2>$null); if (-not $BRANCH) { $BRANCH = "main" }

# 1) Backup
$stamp = [DateTime]::UtcNow.Ticks
$bak = "$File.bak_$stamp"
Copy-Item $File $bak -Force
Say "📦 Backup criado: $bak"

# 2) Ler arquivo
$content = Get-Content $File -Raw

# 3) Corrigir acentuação comum
$map = @{
  'DuraÃ§Ã£o'   = 'Duração'
  'RecomeÃ§ar'  = 'Recomeçar'
  'InÃ­cio'     = 'Início'
  'PrÃ³ximo'    = 'Próximo'
  'OpÃ§Ã£o'     = 'Opção'
  'Selecione o prÃ³ximo time' = 'Selecione o próximo time'
}
foreach($k in $map.Keys){ $content = $content -replace [regex]::Escape($k), $map[$k] }

# 4) States permitem placeholder
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

# 5) Placeholders nos <SelectValue>
$openTag = '<SelectValue'
$rxNoPH = [regex]'<SelectValue(?![^>]*placeholder=)'
$matches = $rxNoPH.Matches($content)
if ($matches.Count -ge 1) {
  $i = $matches[0].Index
  $content = $content.Substring(0,$i) + '<SelectValue placeholder="Selecione o autor do gol"' + $content.Substring($i + $openTag.Length)
}
$matches = $rxNoPH.Matches($content)
if ($matches.Count -ge 1) {
  $i = $matches[0].Index
  $content = $content.Substring(0,$i) + '<SelectValue placeholder="Selecione o próximo time"' + $content.Substring($i + $openTag.Length)
}

# 6) Remove opção Automático
$content = [regex]::Replace($content, '(?is)^\s*<SelectItem\s+[^>]value=["'']auto["''][^>]>.?</SelectItem>\s$', '', 'Multiline')

# 7) Troca Editar/Excluir por ícones
$reEdit =  '(?is)<Button([^>])>\s*Editar\s</Button>'
$reDel  =  '(?is)<Button([^>])>\s*Excluir\s</Button>'
$rpEdit =  '<Button$1 variant="ghost" size="icon" className="h-8 w-8"><Pencil className="h-4 w-4" /><span className="sr-only">Editar</span></Button>'
$rpDel  =  '<Button$1 variant="ghost" size="icon" className="h-8 w-8"><Trash2 className="h-4 w-4 text-red-500" /><span className="sr-only">Excluir</span></Button>'
$content = [regex]::Replace($content, $reEdit, $rpEdit)
$content = [regex]::Replace($content, $reDel,  $rpDel)

# 8) Garantir import dos ícones
if ($content -notmatch 'from "lucide-react"') {
  $content = "import { Pencil, Trash2 } from ""lucide-react"";`r`n" + $content
} else {
  $content = [regex]::Replace($content,
    'import\s*\{\s*([^}])\}\s*from\s"lucide-react";',
    {
      param($m)
      $inside = $m.Groups[1].Value
      $set = New-Object System.Collections.Generic.HashSet[string]
      foreach($x in ($inside -split '\s*,\s*')){ if($x){ [void]$set.Add($x.Trim()) } }
      [void]$set.Add('Pencil'); [void]$set.Add('Trash2')
      'import { ' + ([string]::Join(', ', $set)) + ' } from "lucide-react";'
    }
  )
}

# 9) Salvar como UTF-8 (sem BOM)
$utf8 = New-Object System.Text.UTF8Encoding($false)
[System.IO.File]::WriteAllText($File, $content, $utf8)
Ok "✅ $File salvo em UTF-8 (sem BOM)"

# 10) Garantir lucide-react
if (-not (Select-String -Path "package.json" -Pattern 'lucide-react' -Quiet)) {
  Say "📦 Instalando lucide-react…"
  npm i lucide-react | Out-Null
}

# 11) Limpeza leve
Say "🧽 Limpando caches…"
foreach($p in @('node_modules\.vite','.turbo','dist','.vercel\output')){ if(Test-Path $p){ Remove-Item $p -Recurse -Force -ErrorAction SilentlyContinue } }

# 12) Git add/commit/push
Say "🧰 Git add/commit/push…"
git add $File | Out-Null
try { git commit -m "fix(match): encoding UTF-8, placeholders, ícones gols, remove Automático" | Out-Null } catch { Warn "ℹ Nada para commitar." }
try { git push origin $BRANCH | Out-Null; Ok "🚀 Push → $BRANCH" } catch { Warn "⚠ Push falhou. Rode: git push origin $BRANCH" }

Ok "Pronto! npm run dev / deploy e confira."
