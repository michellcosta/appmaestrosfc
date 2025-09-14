#!/usr/bin/env bash
set -euo pipefail

BRANCH="feature/test-openai-fn2"
MSG="fix(api): return to ESM .js for /api/test-openai (no template literals)"

# 1) Remover a versão .cjs (se existir)
[ -f api/test-openai.cjs ] && git rm -f api/test-openai.cjs || true
mkdir -p api

# 2) Criar ESM estável, sem backticks
cat > api/test-openai.js <<'JS'
export default async function handler(req, res) {
  const key = process.env.OPENAI_API_KEY || "";
  if (!key) {
    res.status(500).json({ ok: false, reason: "missing_key", message: "OPENAI_API_KEY não encontrada" });
    return;
  }

  try {
    const r = await fetch("https://api.openai.com/v1/models", {
      method: "GET",
      headers: {
        "Authorization": "Bearer " + key,
        "Content-Type": "application/json"
      }
    });

    const text = await r.text();
    let body;
    try { body = JSON.parse(text); } catch { body = text; }

    res.status(r.status).json({
      ok: r.ok,
      status: r.status,
      body: body,
      runtime: "vercel-esm-no-templates"
    });
  } catch (err) {
    res.status(500).json({
      ok: false,
      reason: "handler_crash",
      message: err?.message || String(err)
    });
  }
}
JS

# 3) Commit + push
git fetch origin --prune
git checkout "$BRANCH" || git checkout -b "$BRANCH"
git add api/test-openai.js
git commit -m "$MSG" || echo "(nada para commitar)"
git push -u origin "$BRANCH"

echo
echo "✅ Voltou para ESM (.js). Assim que o Preview ficar Ready, teste:"
echo "   https://<preview-url>.vercel.app/api/test-openai"
echo "Se der 401/429, o JSON mostrará o erro da OpenAI (não vai crashar)."
