#!/usr/bin/env bash
set -euo pipefail

BRANCH="feature/test-openai-fn2"
MSG="fix(api): rewrite /api/test-openai in plain CommonJS without template literals"

# Escreve versão CommonJS estável (sem crases/backticks)
mkdir -p api
cat > api/test-openai.js <<'JS'
/**
 * Rota de diagnóstico da OpenAI em CommonJS.
 * - Sem ESM / export default
 * - Sem template strings (evita '$' fora de contexto)
 */
module.exports = async function (req, res) {
  try {
    var key = process.env.OPENAI_API_KEY || "";
    if (!key) {
      res.status(500).json({ ok: false, reason: "missing_key", message: "OPENAI_API_KEY não encontrada" });
      return;
    }

    // Chama a API de modelos
    var r = await fetch("https://api.openai.com/v1/models", {
      method: "GET",
      headers: {
        "Authorization": "Bearer " + key,
        "Content-Type": "application/json"
      }
    });

    var text = await r.text();
    var body;
    try { body = JSON.parse(text); } catch (e) { body = text; }

    res.status(r.status).json({
      ok: r.ok,
      status: r.status,
      body: body,
      runtime: "vercel-commonjs"
    });
  } catch (err) {
    res.status(500).json({
      ok: false,
      reason: "handler_crash",
      message: (err && err.message) ? err.message : String(err)
    });
  }
};
JS

# Commit + push
git fetch origin --prune
git checkout "$BRANCH" || git checkout -b "$BRANCH"
git add api/test-openai.js
git commit -m "$MSG" || echo "(nada para commitar)"
git push -u origin "$BRANCH"

echo
echo "✅ Atualizado. Assim que o Preview ficar Ready, teste:"
echo "   https://<preview-url>.vercel.app/api/test-openai"
echo
echo "Se ainda vier erro, rode os logs:"
echo "   vercel logs https://<preview-url>.vercel.app --since=20m --follow"
