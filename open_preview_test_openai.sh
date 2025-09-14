#!/usr/bin/env bash
set -euo pipefail

APP="appmaestrosfc"                 # nome do projeto no Vercel
BRANCH="feature/test-openai-fn2"    # branch de preview
PATH_SUFFIX="/api/test-openai"      # rota a abrir
TRIES=40                            # ~40 tentativas * 5s = ~200s
SLEEP=5

need() { command -v "$1" >/dev/null 2>&1 || { echo "❌ Falta: $1"; exit 1; }; }

echo "==> Checando dependências..."
need vercel
need node
need curl
echo "OK."

# Função para pegar a URL mais recente do preview da branch via Node (dispensa jq)
get_url() {
  vercel ls "$APP" --json 2>/dev/null \
  | node -e '
    const fs = require("fs");
    let data = "";
    process.stdin.on("data", d => data += d);
    process.stdin.on("end", () => {
      try {
        const j = JSON.parse(data);
        // formato 1: { projects: [ { name, targets: { preview: [ { branch, url } ] } } ] }
        if (j && Array.isArray(j.projects)) {
          const p = j.projects.find(x => x.name === process.argv[1]);
          if (p && p.targets && Array.isArray(p.targets.preview)) {
            const cand = p.targets.preview
              .filter(x => x.branch === process.argv[2])
              .map(x => x.url)
              .filter(Boolean);
            if (cand.length) { console.log(cand[cand.length - 1]); return; }
          }
        }
        // fallback (formato 2): { deployments: [ { url, meta: { githubCommitRef } } ] }
        if (j && Array.isArray(j.deployments)) {
          const cand = j.deployments
            .filter(d => (d.meta && (d.meta.githubCommitRef === process.argv[2] || d.meta.gitlabCommitRef === process.argv[2] || d.meta.bitbucketCommitRef === process.argv[2])))
            .map(d => d.url);
          if (cand.length) { console.log(cand[0]); return; }
        }
      } catch (e) {}
    });
  ' "$APP" "$BRANCH"
}

echo "==> Aguardando Preview da branch \"$BRANCH\" ficar pronto..."
URL=""
for i in $(seq 1 $TRIES); do
  URL="$(get_url || true)"
  if [ -n "$URL" ]; then
    # checa se já responde (status 200..599)
    CODE="$(curl -sS -o /dev/null -w "%{http_code}" "https://$URL/")" || true
    if [ "$CODE" -ge 200 ] && [ "$CODE" -le 599 ]; then
      break
    fi
  fi
  printf "."
  sleep "$SLEEP"
done
echo

if [ -z "$URL" ]; then
  echo "❌ Não encontrei preview para $BRANCH. Confira no painel do Vercel."
  exit 1
fi

FULL="https://$URL$PATH_SUFFIX"
echo "✅ Preview encontrado:"
echo "   https://$URL"
echo "→ Abrindo $FULL"

# Abrir no navegador (Windows / Linux / macOS)
if command -v cmd.exe >/dev/null 2>&1; then
  cmd.exe /c start "" "$FULL" >/dev/null 2>&1 || true
elif command -v xdg-open >/dev/null 2>&1; then
  xdg-open "$FULL" >/dev/null 2>&1 || true
elif command -v open >/dev/null 2>&1; then
  open "$FULL" >/dev/null 2>&1 || true
fi

echo
echo "==> Resposta (curl):"
curl -sS "$FULL" || true
echo
