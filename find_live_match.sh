#!/usr/bin/env bash
set -euo pipefail

# 1) Coleta arquivos .tsx/.jsx sob controle do git (fallback para find)
FILES="$(git ls-files '.tsx' '.jsx' 2>/dev/null || true)"
[ -z "$FILES" ] && FILES="$(find . -type f \( -name '.tsx' -o -name '.jsx' \) | sed 's|^\./||')"
[ -z "$FILES" ] && { echo "Nenhum .tsx/.jsx encontrado."; exit 1; }

# 2) Termos/assinaturas da tela atual (ajuste livre se quiser)
TERMS=(
  "Partida ao Vivo"
  "Gols recentes"
  "Estatísticas de jogadores"
  "Histórico da Semana"
  "Iniciar"
  "Pausar"
  "Recomeçar"
  "Encerrar"
  "StopCircle"
  "RefreshCw"
  "handleStart"
  "handlePause"
  "handleReset"
  "handleEnd"
)

# 3) Rankeia por quantidade de matches + bônus por nomes/caminhos
TMP="$(mktemp)"
> "$TMP"
for f in $FILES; do
  # ignora backups antigos
  [[ "$f" =~ \.bak(\.|$) ]] && continue
  [[ "$f" =~ \.bak\.[0-9]{8}-[0-9]{6}$ ]] && continue

  score=0
  for t in "${TERMS[@]}"; do
    if grep -Iq . "$f"; then
      hits=$(grep -n -F "$t" "$f" | wc -l | tr -d ' ')
      (( score += hits ))
    fi
  done
  [[ "$f" =~ (^|/)src/pages/ ]]      && (( score += 3 ))
  [[ "$f" =~ (^|/)pages/ ]]          && (( score += 2 ))
  [[ "$f" =~ (^|/)components/ ]]     && (( score += 1 ))
  [[ "$f" =~ ([Mm]atch|[Pp]artida) ]]&& (( score += 2 ))
  echo -e "${score}\t${f}" >> "$TMP"
done

echo "Top candidatos (score decrescente):"
echo -e "score\tpath"
sort -nr -k1,1 "$TMP" | head -n 12

BEST="$(sort -nr -k1,1 "$TMP" | head -n1 | awk '{print $2}')"
BEST_SCORE="$(sort -nr -k1,1 "$TMP" | head -n1 | awk '{print $1}')"
echo ""
echo "Arquivo mais provável: $BEST (score ${BEST_SCORE})"
echo ""

show_ctx () {
  local term="$1"
  if grep -n -F "$term" "$BEST" >/dev/null 2>&1; then
    echo "---- $term ----"
    grep -n -F "$term" "$BEST" | head -n 2 | cut -d: -f1 | while read -r ln; do
      start=$((ln-3)); [ $start -lt 1 ] && start=1
      end=$((ln+3));  nl=$(wc -l < "$BEST"); [ $end -gt $nl ] && end=$nl
      nl -ba -w1 -s': ' "$BEST" | sed -n "${start},${end}p"
      echo ""
    done
  fi
}

for t in "Recomeçar" "Encerrar" "Iniciar" "Pausar" "Partida ao Vivo" "Gols recentes" "Histórico da Semana"; do
  show_ctx "$t"
done

# Sugerir linha pra abrir no VS Code
if grep -nE "<Button|Recomeçar|Encerrar|Iniciar|Pausar" "$BEST" >/dev/null 2>&1; then
  LN="$(grep -nE "<Button|Recomeçar|Encerrar|Iniciar|Pausar" "$BEST" | head -n1 | cut -d: -f1)"
  echo "Abra no VS Code nessa linha:"
  echo "code -g $BEST:$LN"
else
  echo "Abra no VS Code:"
  echo "code $BEST"
fi
