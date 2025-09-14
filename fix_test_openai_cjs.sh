#!/usr/bin/env bash
set -euo pipefail

BRANCH="feature/test-openai-fn2"
MSG="fix(api): move /api/test-openai to CommonJS (.cjs) for ESM project"

mkdir -p api
# remove .js antigo, se houver
[ -f api/test-openai.js ] && git rm -f api/test-openai.js || true

# cria .cjs (CommonJS) sem template strings
cat > api/test-openai.cjs <<'CJS'
/**
 * CommonJS handler para projetos ESM ("type":"module").
 * Mantém a URL /api/test-openai (Vercel resolve .cjs automaticamente).
 */
module.exports = async function (req, res) {
  try {
    var key = process.env.OPENAI_API_KEY || "";
    if (!key) {
      res.status(500).json({ ok: false, reason: "missing_key", message: "OPENAI_API_KEY não encontrada" });
      return;
    }

    // Chamada simples à API de modelos (retorna texto para evitar JSON malformado)
    var r = await fetch("https://api.openai.com/v1/models", {
      method: "GET",
      headers: {
        "Authorization": "Bearer " + key,
        "Content-Type": "application/json"
      }
    });

    var text = await r.text();
    var parsed;
    try { parsed = JSON.parse(text); } catch (e) { parsed = text; }

    res.status(r.status).json({
      ok: r.ok,
      status: r.status,
      body: parsed,
      runtime: "vercel-commonjs(.cjs)"
    });
  } catch (err) {
    res.status(500).json({
      ok: false,
      reason: "handler_crash",
      message: (err && err.message) ? err.message : String(err)
    });
  }
};
CJS

git fetch origin --prune
git checkout "$BRANCH" || git checkout -b "$BRANCH"
git add api/test-openai.cjs
git commit -m "$MSG" || echo "(nada para commitar)"
git push -u origin "$BRANCH"

echo
echo "✅ Atualizado para .cjs. Assim que o Preview ficar Ready, teste:"
echo "   https://<preview-url>.vercel.app/api/test-openai"
echo "Se ainda falhar, rode logs:"
echo "   vercel logs https://<preview-url>.vercel.app --since=20m --follow"
