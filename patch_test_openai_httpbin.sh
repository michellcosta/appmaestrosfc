#!/usr/bin/env bash
set -euo pipefail

BRANCH="feature/test-openai-fn2"
MSG="test(api): replace /api/test-openai with httpbin.org test fetch"

TARGET="api/test-openai.js"
mkdir -p api
cat > "$TARGET" <<'JS'
export default async function handler(req, res) {
  try {
    const r = await fetch("https://httpbin.org/get");
    const data = await r.json();
    res.status(200).json({ ok: true, data });
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
}
JS

git fetch origin --prune
git checkout "$BRANCH" || git checkout -b "$BRANCH"
git add "$TARGET"
git commit -m "$MSG" || echo "(nada para commitar)"
git push -u origin "$BRANCH"

echo
echo "✅ Função atualizada para teste mínimo (httpbin.org)."
echo "Assim que o Preview do Vercel ficar pronto, acesse:"
echo "https://<preview-url>.vercel.app/api/test-openai"
echo
echo "Se isso funcionar e retornar JSON do httpbin, sabemos que fetch funciona no Vercel e o problema é só na chamada da OpenAI."
