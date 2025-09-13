#!/usr/bin/env bash
# patch_maestros_match.sh — aplica patch no src/pages/Match.tsx e cria commit
set -u

FILE="src/pages/Match.tsx"
COMMIT_MSG='feat(ui): placeholder no autor do gol, ícones e painéis com scroll'

echo "==> Verificando $FILE"
[ -f "$FILE" ] || { echo "ERRO: não achei $FILE"; exit 1; }

STAMP="$(date +%Y%m%d-%H%M%S)"
BACKUP="$FILE.bak.$STAMP"
cp "$FILE" "$BACKUP" && echo "Backup: $BACKUP"

# util sed in-place (compatível com Git Bash)
sedi () { sed -i.bak "$@" && rm -f "${1##*/}.bak" 2>/dev/null || true; }

echo "==> Garantindo import de ícones (Pencil, Trash2) de lucide-react"
if grep -qE 'from\s+["'\'']lucide-react["'\'']\s*;' "$FILE"; then
  grep -q 'Pencil' "$FILE" || sedi 's/import[[:space:]]*{[[:space:]]*/&Pencil, /' "$FILE"
  grep -q 'Trash2' "$FILE" || sedi 's/import[[:space:]]*{[[:space:]]*/&Trash2, /' "$FILE"
else
  printf 'import { Pencil, Trash2 } from "lucide-react";\n' | cat - "$FILE" > "$FILE.tmp" && mv "$FILE.tmp" "$FILE"
fi

echo "==> Placeholder no Select (Autor do gol) e estado inicial vazio"
# (a) trocar o primeiro <SelectValue> após o label "Autor do gol" por placeholder
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

# (b) garantir estado inicial vazio (selectedPlayer|autorDoGol|player)
sedi -E 's/(const[[:space:]]+\[[[:space:]]*(selectedPlayer|autorDoGol|player)[[:space:]]*,[[:space:]]*set[A-Za-z]+[[:space:]]*\][[:space:]]*=[[:space:]]*useState[[:space:]]*<[[:space:]]*string[[:space:]]*>[[:space:]]*)\(([^)]*)\)/\1("")/g' "$FILE"

echo "==> Trocando botões de texto por ícones (Editar/Excluir)"
sedi -E 's#<Button([^>]*)>[[:space:]]*Editar[[:space:]]*</Button>#<Button\1 aria-label="Editar"><Pencil className="h-4 w-4" /></Button>#g' "$FILE"
sedi -E 's#<Button([^>]*)>[[:space:]]*Excluir[[:space:]]*</Button>#<Button\1 aria-label="Excluir" variant="destructive"><Trash2 className="h-4 w-4" /></Button>#g' "$FILE"

echo "==> Ajustando título para: Estatísticas de jogadores"
sedi -E 's/Estatísticas dos jogadores[[:space:]]*\(sess[aã]o\)/Estatísticas de jogadores/Ig' "$FILE"

echo "==> Adicionando .scroll-panel no globals.css (se existir)"
GLOBAL_CSS=""
for c in "app/globals.css" "src/app/globals.css" "styles/globals.css"; do
  [ -f "$c" ] && { GLOBAL_CSS="$c"; break; }
done
if [ -n "$GLOBAL_CSS" ]; then
  if ! grep -q ".scroll-panel" "$GLOBAL_CSS"; then
    cat >> "$GLOBAL_CSS" <<'CSS'

/* ===== Maestros FC: painéis com rolagem ===== */
.scroll-panel {
  max-height: 16rem; /* ajuste (ex.: 20rem) */
  overflow-y: auto;
  overscroll-behavior: contain;
  scrollbar-gutter: stable;
}
CSS
    echo "→ .scroll-panel adicionada em $GLOBAL_CSS"
  else
    echo "→ .scroll-panel já existia"
  fi
else
  echo "→ globals.css não encontrado; sem criação de .scroll-panel"
fi

echo "==> Marcando listas com rolagem (Gols recentes / Estatísticas de jogadores / Histórico de Partidas)"
add_scroll_after_title () {
  local title_regex="$1"
  local f="$2"
  awk -v PATTERN="$title_regex" '
    BEGIN{mark=0}
    {
      line=$0
      if (mark==0 && line ~ PATTERN) { mark=1; print line; next }
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
  ' "$f" > "$f.tmp" && mv "$f.tmp" "$f"
}
add_scroll_after_title "Gols[[:space:]]+recentes" "$FILE"
add_scroll_after_title "Estat[íi]sticas[[:space:]]+de[[:space:]]+jogadores" "$FILE"
add_scroll_after_title "Hist[óo]rico[[:space:]]+de[[:space:]]Partidas" "$FILE"

echo "==> Commit"
if git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  git add "$FILE" 2>/dev/null || true
  [ -n "$GLOBAL_CSS" ] && git add "$GLOBAL_CSS" 2>/dev/null || true
  if git diff --cached --quiet; then
    echo "(nada para commitar)"
  else
    git commit -m "$COMMIT_MSG" && echo "Commit criado."
  fi
else
  echo "(não é repo Git; sem commit)"
fi

echo "✅ Patch concluído. Ajuste a altura em .scroll-panel se quiser (max-height)."
