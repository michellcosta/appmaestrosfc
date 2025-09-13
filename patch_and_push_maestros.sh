#!/usr/bin/env bash
# patch_and_push_maestros.sh — aplica patch no Match, comita e dá push (gera Preview no Vercel)

set -u

echo "==> Detectando arquivo Match.tsx..."
# candidatos comuns
mapfile -t CAND < <(git ls-files '*.tsx' 2>/dev/null | grep -iE '/(pages|components)/Match\.tsx$' || true)
# fallback: qualquer tsx com 'Match' no nome
if [ ${#CAND[@]} -eq 0 ]; then
  mapfile -t CAND < <(git ls-files '*.tsx' 2>/dev/null | grep -iE 'Match\.tsx$' || true)
fi
# fallback por conteúdo
if [ ${#CAND[@]} -eq 0 ]; then
  mapfile -t CAND < <(git ls-files '*.tsx' 2>/dev/null | xargs -I{} grep -ilE 'Registrar Gol|Gols recentes|Estat(í|i)sticas dos jogadores' {} || true)
fi

if [ ${#CAND[@]} -eq 0 ]; then
  echo "ERRO: Não encontrei Match.tsx. Me diga o caminho exato e eu ajusto."
  exit 1
fi

# escolhe o melhor
BEST=""; SCORE=-1
for f in "${CAND[@]}"; do
  s=0
  [[ "$f" =~ src/pages/Match\.tsx$ ]] && s=$((s+4))
  [[ "$f" =~ pages/Match\.tsx$ ]] && s=$((s+3))
  [[ "$f" =~ components/Match\.tsx$ ]] && s=$((s+2))
  [[ "$f" =~ Match\.tsx$ ]] && s=$((s+1))
  if (( s > SCORE )); then BEST="$f"; SCORE=$s; fi
done
FILE="$BEST"
echo "→ Arquivo escolhido: $FILE"

STAMP="$(date +%Y%m%d-%H%M%S)"
BACKUP="$FILE.bak.$STAMP"
cp "$FILE" "$BACKUP"
echo "Backup criado: $BACKUP"

sedi () { sed -i.bak "$@" && rm -f "${1##*/}.bak" 2>/dev/null || true; }

echo "==> Garantindo ícones (Pencil, Trash2) do lucide-react"
if grep -qE 'from\s+["'\'']lucide-react["'\'']\s*;' "$FILE"; then
  grep -q 'Pencil' "$FILE" || sedi '0,/import[[:space:]]*{/{s/import[[:space:]]*{[[:space:]]*/&Pencil, /}' "$FILE"
  grep -q 'Trash2' "$FILE" || sedi '0,/import[[:space:]]*{/{s/import[[:space:]]*{[[:space:]]*/&Trash2, /}' "$FILE"
else
  printf 'import { Pencil, Trash2 } from "lucide-react";\n' | cat - "$FILE" > "$FILE.tmp" && mv "$FILE.tmp" "$FILE"
fi

echo "==> Placeholder no Select (Autor do gol) e estado inicial vazio"
# placeholder no primeiro <SelectValue> após "Autor do gol"
awk '
  BEGIN{mark=0}
  {
    line=$0
    if (mark==0 && line ~ /Autor do gol/i) { mark=1; print line; next }
    if (mark==1 && line ~ /<SelectValue/) {
      gsub(/<SelectValue[^>]*>[^<]*<\/SelectValue>/,"<SelectValue placeholder=\"Selecione o autor do gol\"/>",line)
      mark=2
    }
    print line
  }
' "$FILE" > "$FILE.tmp" && mv "$FILE.tmp" "$FILE"

# estado inicial vazio para selectedPlayer/autorDoGol/player
sedi -E 's/(const[[:space:]]+\[[[:space:]]*(selectedPlayer|autorDoGol|player)[[:space:]]*,[[:space:]]*set[A-Za-z]+[[:space:]]*\][[:space:]]*=[[:space:]]*useState[[:space:]]*<[[:space:]]*string[[:space:]]*>[[:space:]]*)\(([^)]*)\)/\1("")/g' "$FILE"

echo "==> Trocando botões de texto por ícones (Editar/Excluir)"
sedi -E 's#<Button([^>]*)>[[:space:]]*Editar[[:space:]]*</Button>#<Button\1 aria-label="Editar"><Pencil className="h-4 w-4" /></Button>#g' "$FILE"
sedi -E 's#<Button([^>]*)>[[:space:]]*Excluir[[:space:]]*</Button>#<Button\1 aria-label="Excluir" variant="destructive"><Trash2 className="h-4 w-4" /></Button>#g' "$FILE"

echo "==> Ajustando título"
sedi -E 's/Estatísticas dos jogadores[[:space:]]*\(sess[aã]o\)/Estatísticas de jogadores/Ig' "$FILE"

echo "==> Criando .scroll-panel em globals.css (se existir)"
GLOBAL_CSS=""
for c in "app/globals.css" "src/app/globals.css" "styles/globals.css"; do
  [ -f "$c" ] && { GLOBAL_CSS="$c"; break; }
done
if [ -n "$GLOBAL_CSS" ]; then
  if ! grep -q ".scroll-panel" "$GLOBAL_CSS"; then
    cat >> "$GLOBAL_CSS" <<'CSS'

/* ===== Maestros FC: painéis com rolagem ===== */
.scroll-panel {
  max-height: 16rem; /* ajuste se quiser (ex.: 20rem) */
  overflow-y: auto;
  overscroll-behavior: contain;
  scrollbar-gutter: stable;
}
CSS
    echo "→ .scroll-panel adicionada em $GLOBAL_CSS"
  else
    echo "→ .scroll-panel já existe"
  fi
else
  echo "→ globals.css não encontrado; etapa pulada"
fi

echo "==> Marcando containers com rolagem (Gols recentes / Estatísticas de jogadores / Histórico de Partidas)"
wrap_after () {
  local pattern="$1"; local file="$2"
  awk -v P="$pattern" '
    BEGIN{mark=0}
    {
      line=$0
      if (mark==0 && line ~ P) { mark=1; print line; next }
      if (mark==1 && line ~ /<div[^>]*>/) {
        if (line ~ /className="/) {
          sub(/className="([^"]*)"/, "className=\"\\1 scroll-panel\"", line)
        } else if (line ~ /className=\{/) {
          sub(/className=\{([^}]*)\}/, "className={\\1 + \" scroll-panel\"}", line)
        } else {
          sub(/<div/, "<div className=\"scroll-panel\"", line)
        }
        mark=2
      }
      print line
    }
  ' "$file" > "$file.tmp" && mv "$file.tmp" "$file"
}
wrap_after "Gols[[:space:]]+recentes" "$FILE"
wrap_after "Estat[íi]sticas[[:space:]]+de[[:space:]]+jogadores" "$FILE"
wrap_after "Hist[óo]rico[[:space:]]+de[[:space:]]Partidas" "$FILE"

echo "==> Criando commit e dando push"
if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "ERRO: não é um repositório Git. Abra este projeto clonado do GitHub."
  exit 1
fi

git add "$FILE" 2>/dev/null || true
[ -n "$GLOBAL_CSS" ] && git add "$GLOBAL_CSS" 2>/dev/null || true

if git diff --cached --quiet; then
  echo "Nada para commitar (nenhuma mudança detectada)."
else
  git commit -m 'feat(ui): placeholder no autor do gol, ícones e listas com scroll'
fi

BRANCH="$(git rev-parse --abbrev-ref HEAD)"
echo "→ Branch atual: $BRANCH"
git push -u origin "$BRANCH"

echo ""
echo "✅ Pronto! O Vercel deve criar um Preview para a branch $BRANCH."
echo "Abra o painel do Vercel > Deployments e clique no último Preview."
