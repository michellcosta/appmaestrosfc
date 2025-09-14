#!/usr/bin/env bash
set -euo pipefail

BRANCH="feature/test-openai-fn2"
MSG="fix(api): restore /api/test-openai to call OpenAI with detailed logs"

TARGET="api/test-openai.js"
cat > "$TARGET" <<'JS'
export default async function handler(req, res) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    res.status(500).json({ ok: false, message: "OPENAI_API_KEY não encontrada" });
    return;
  }

  try {
    const r = await fetch("https://api.openai.com/v1/models", {
      method: "GET",
      headers: {
        "Authorization": Bearer ${key},
        "Content-Type": "application/json",
      },
    });

    const text = await r.text();
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = text;
    }

    res.status(r.status).json({
      ok: r.ok,
      status: r.status,
      body: parsed,
      runtime: "vercel-openai-test"
    });
  } catch (err) {
    res.status(500).json({
      ok: false,
      message: err.message || "erro desconhecido",
    });
  }
}
JS

git fetch origin --prune
git checkout "$BRANCH" || git checkout -b "$BRANCH"
git add "$TARGET"
git commit -m "$MSG" || echo "(nada para commitar)"
git push -u origin "$BRANCH"

echo
echo "✅ Função restaurada com chamada para a OpenAI."
echo "Assim que o Preview ficar pronto, teste em:"
echo "https://<preview-url>.vercel.app/api/test-openai"
