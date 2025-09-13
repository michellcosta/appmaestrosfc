#!/usr/bin/env bash
# patch_to_main.sh — aplica patch no Match.tsx e faz commit+push na branch main (produção no Vercel)

set -u

# --- 0) Pré-checks ---
command -v git >/dev/null 2>&1 || { echo "ERRO: git não encontrado no PATH."; exit 1; }
git rev-parse --is-inside-work-tree >/dev/null 2>&1 || { echo "ERRO: não é um repositório Git."; exit 1; }

# Garante que temos 'origin' configurado
git remote get-url origin >/dev/null 2>&1 || { echo "ERRO: remote 'origin' não configurado."; exit 1; }

echo "==> Atualizando remotos"
git fetch origin --prune

echo "==> Alternando para 'main'"
# cria main local se não existir, rastreando origin/main
if ! git show-ref --verify --quiet refs/heads/main; then
  if git show-ref --verify --quiet refs/remotes/origin/main; then
    git checkout -b main origin/main
  else
    echo "ERRO: 'origin/main' não existe no remoto. Crie a branch main no GitHub primeiro."
    exit 1
  fi
else
  git checkout main
  # traz últimas atualizações
  git pull --rebase origin main
fi

# --- 1) Detectar arquivo Match.tsx ---
echo "==> Detectando arquivo Match.tsx…"
mapfile -t CAND < <(git ls-files '*.tsx' | grep -iE '/(src/)?(pages|components)/Match\.tsx$' || true)
if [ ${#CAND[@]} -eq 0 ]; then
  mapfile -t CAND < <(git ls-files '*.tsx' | grep -iE 'Match\.tsx$' || true)
fi
if [ ${#CAND[@]} -eq 0 ]; then
  mapfile -t CAND < <(git ls-files '*.tsx' | xargs -I{} grep -ilE 'Registrar Gol|Gols recentes|Estat(í|i)sticas dos jogadores' {} || true)
fi
if [ ${#CAND[@]} -eq 0 ]; then
  echo "ERRO: Não encontrei Match.tsx. Me diga o caminho que ajusto o script."
  exit 1
fi

# escolher melhor candidato
BEST=""; SCORE=-1
for f in "${CAND[@]}"; do
  s=0
  [[ "$f" =~ src/pages/Match\.tsx$ ]] && s=$((s+4))
  [[ "$f" =~ pages/Match\.tsx$ ]]      && s=$((s+3))
  [[ "$f" =~ components/Match\.tsx$ ]] && s=$((s+2))
  [[ "$f" =~ Match\.tsx$ ]]            && s=$((s+1))
  if (( s > SCORE )); then BEST="$f"; SCORE=$s; fi
done
FILE="$BEST"
[ -f "$FILE" ] || { echo "ERRO inesperado: arquivo não existe: $FILE"; exit 1; }
echo "→ Arquivo escolhido: $FILE"

STAMP="$(date +%Y%m%d-%H%M%S)"
BACKUP="$FILE.bak.$STAMP"
cp "$FILE" "$BACKUP"
echo "Backup criado: $BACKUP"

# sed in-place compatível com Git Bash
sedi () { sed -i.bak "$@" && rm -f "${1##*/}.bak" 2>/dev/null || true; }

# --- 2) Garantir ícones (Pencil, Trash2) de lucide-react ---
echo "==> Garantindo imports dos ícones (Pencil, Trash2)"
if grep -qE 'from\s+["'\'']lucide-react["'\'']\s*;' "$FILE"; then
  grep -q 'Pencil' "$FILE" || sedi '0,/import[[:space:]]{/{s/import[[:space:]]{[[:space:]]*/&Pencil, /}' "$FILE"
  grep -q 'Trash2' "$FILE" || sedi '0,/import[[:space:]]{/{s/import[[:space:]]{[[:space:]]*/&Trash2, /}' "$FILE"
else
  printf 'import { Pencil, Trash2 } from "lucide-react";\n' | cat - "$FILE" > "$FILE.tmp" && mv "$FILE.tmp" "$FILE"
fi

# --- 3) Placeholder no Select (Autor do gol) e sem pré-seleção ---
echo "==> Ajustando placeholder de Autor do gol"
awk '
  BEGIN{mark=0}
  {
    line=$0
    if (mark==0 && line ~ /Autor do gol/i) { mark=1; print line; next }
    if (mark==1 && line ~ /<SelectValue/) {
      gsub(/<SelectValue[^>]>[^<]<\/SelectValue>/,"<SelectValue placeholder=\"Selecione o autor do gol\"/>",line)
      mark=2
    }
    print line
  }
' "$FILE" > "$FILE.tmp" && mv "$FILE.tmp" "$FILE"

# estado inicial vazio em variáveis comuns
sedi -E 's/(const[[:space:]]+\[[[:space:]](selectedPlayer|autorDoGol|player)[[:space:]],[[:space:]]set[A-Za-z]+[[:space:]]\][[:space:]]=[[:space:]]*useState[[:space:]]<[[:space:]]string[[:space:]]>[[:space:]])\(([^)])\)/\1("")/g' "$FILE"

# --- 4) Trocar "Editar"/"Excluir" por ícones ---
echo "==> Trocando botões de texto por ícones"
sedi -E 's#<Button([^>])>[[:space:]]*Editar[[:space:]]</Button>#<Button\1 aria-label="Editar"><Pencil className="h-4 w-4" /></Button>#g' "$FILE"
sedi -E 's#<Button([^>])>[[:space:]]*Excluir[[:space:]]</Button>#<Button\1 aria-label="Excluir" variant="destructive"><Trash2 className="h-4 w-4" /></Button>#g' "$FILE"

# --- 5) Ajustar título ---
echo "==> Ajustando título para 'Estatísticas de jogadores'"
sedi -E 's/Estatísticas dos jogadores[[:space:]]*\(sess[aã]o\)/Estatísticas de jogadores/Ig' "$FILE"

# --- 6) Criar .scroll-panel no globals.css ---
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

# --- 7) Envelopar listas com rolagem ---
echo "==> Marcando listas com rolagem"
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

# --- 8) Commit + push na main ---
echo "==> Criando commit"
git add "$FILE" 2>/dev/null || true
[ -n "$GLOBAL_CSS" ] && git add "$GLOBAL_CSS" 2>/dev/null || true

if git diff --cached --quiet; then
  echo "Nada para commitar (nenhuma mudança detectada)."
else
  git commit -m 'feat(ui): placeholder no autor do gol, ícones e listas com scroll'
fi

echo "==> Enviando para origin/main (produção)"
git push origin main

echo "✅ Pronto! O Vercel deve publicar a PRODUÇÃO (appmaestrosfc.vercel.app) com as mudanças."
