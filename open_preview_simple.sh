#!/usr/bin/env bash
set -euo pipefail
if [ $# -lt 1 ]; then
  echo "Uso: $0 https://SEU-PREVIEW.vercel.app"
  exit 1
fi
BASE="$1"
URL="$BASE/api/test-openai"

echo "→ Abrindo no navegador: $URL"
if command -v cmd.exe >/dev/null 2>&1; then
  cmd.exe /c start "" "$URL" >/dev/null 2>&1 || true
elif command -v xdg-open >/dev/null 2>&1; then
  xdg-open "$URL" >/dev/null 2>&1 || true
elif command -v open >/dev/null 2>&1; then
  open "$URL" >/dev/null 2>&1 || true
fi

echo "→ Resposta (curl):"
curl -sS "$URL" || true

echo
echo "→ Logs ao vivo (Ctrl+C pra sair):"
vercel logs "$BASE" --since=20m --follow
