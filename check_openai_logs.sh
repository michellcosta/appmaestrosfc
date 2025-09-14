#!/usr/bin/env bash
set -euo pipefail

BRANCH="feature/test-openai-fn2"

echo "==> Pegando último deployment da branch $BRANCH..."
URL=$(vercel ls appmaestrosfc --scope michellcosta --json \
  | jq -r '.projects[] | select(.name=="appmaestrosfc") 
    | .targets.preview[] | select(.branch=="'"$BRANCH"'") 
    | .url' | tail -n1)

if [ -z "$URL" ]; then
  echo "❌ Nenhum preview encontrado para $BRANCH"
  exit 1
fi

echo "==> Deployment: $URL"
echo
echo "==> Logs ao vivo (Ctrl+C pra sair):"
vercel logs "https://$URL" --since=20m --follow
