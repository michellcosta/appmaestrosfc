#!/usr/bin/env bash
set -euo pipefail

echo "Procurando a view da 'Partida ao Vivo'…"

# Arquivos que vamos considerar
FILES=$(git ls-files '.tsx' '.jsx' 2>/dev/null || true)
if [ -z "${FILES}" ]; then
  FILES=$(find . -type f \( -name '.tsx' -o -name '.jsx' \) | sed 's|^\./||')
fi

if [ -z "${FILES}" ]; then
  echo "Nenhum .tsx/.jsx encontrado." ; exit 1
fi

# Termos que caracterizam a tela
TERMS=(
  "Partida ao Vivo"
  "Duração"
  "Placar"
  "Gols recentes"
  "Iniciar"
  "Encerrar"
)

# Procura e pontua
TMP=$(mktemp)
> "$TMP"
for f in $FILES; do
  score=0
  for t in "${TERMS[@]}"; do
    if grep -Iq . "$f"; then
      hits=$(grep -n -F "$t" "$f" | wc -l | tr -d ' ')
      [ "$hits" -gt 0 ] && score=$((score + hits))
    fi
  done
  # bônus por nomes comuns
  [[ "$f" =~ ([Mm]atch|[Ll]ive.*[Mm]atch|[Pp]artida) ]] && score=$((score + 2))
  # prioriza pastas prováveis
  [[ "$f" =~ (^|/)src/pages/ ]] && score=$((score + 2))
  [[ "$f" =~ (^|/)components/ ]] && score=$((score + 1))

  echo -e "${score}\t${f}" >> "$TMP"
done

# Ordena por score desc
echo ""
echo "Top candidatos (maior score primeiro):"
echo "score\tpath"
sort -nr -k1,1 "$TMP" | head -n 8

BEST=$(sort -nr -k1,1 "$TMP" | head -n 1 | awk '{print $2}')
BEST_SCORE=$(sort -nr -k1,1 "$TMP" | head -n 1 | awk '{print $1}')
rm -f "$TMP"

echo ""
echo "Arquivo mais provável: ${BEST} (score ${BEST_SCORE})"
echo ""

# Mostra contexto das principais palavras no melhor arquivo
show_ctx () {
  local term="$1"
  if grep -n -F "$term" "$BEST" >/dev/null 2>&1; then
    echo "---- $term ----"
    # mostra até 2 ocorrências com 3 linhas de contexto
    grep -n -F "$term" "$BEST" | head -n 2 | cut -d: -f1 | while read -r ln; do
      start=$((ln-3)); [ $start -lt 1 ] && start=1
      end=$((ln+3))
      nl=$(wc -l < "$BEST"); [ $end -gt $nl ] && end=$nl
      sed -n "${start},${end}p" "$BEST" | nl -ba -w1 -s': '
      echo ""
    done
  fi
}

for t in "${TERMS[@]}"; do
  show_ctx "$t"
done

# Primeira linha com JSX da área de ações (Iniciar/Recomeçar/Encerrar)
if grep -nE "<Button|Iniciar|Encerrar|Recomeçar" "$BEST" >/dev/null 2>&1; then
  LN=$(grep -nE "<Button|Iniciar|Encerrar|Recomeçar" "$BEST" | head -n1 | cut -d: -f1)
  echo "Abra no VS Code na linha provável (${LN}):"
  echo "code -g ${BEST}:${LN}"
else
  echo "Dica: abra no VS Code:"
  echo "code ${BEST}"
fi
