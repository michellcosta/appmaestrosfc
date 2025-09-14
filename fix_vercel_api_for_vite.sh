#!/usr/bin/env bash
set -euo pipefail

BRANCH="feature/test-openai"

echo "==> Trocando para a branch $BRANCH..."
git checkout "$BRANCH"

# 1) Remover a tentativa de Pages Router (não é Next.js)
if [ -f src/pages/api/test-openai.ts ]; then
  echo "==> Removendo src/pages/api/test-openai.ts (não usado em Vite)..."
  git rm -f src/pages/api/test-openai.ts || true
fi

# 2) Criar função Serverless do Vercel para Vite: api/test-openai.js (na RAIZ)
echo "==> Escrevendo api/test-openai.js (ESM) na raiz..."
mkdir -p api
cat > api/test-openai.js <<'JS'
// Função Serverless do Vercel (Node.js ESM) para projeto Vite/React.
// Caminho correto para Vite: /api/*.js na RAIZ do repositório.
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
    let body; try { body = JSON.parse(text); } catch { body = text; }

    res.status(r.status).json({
      ok: r.ok,
      status: r.status,
      body: body,
      runtime: "vercel-node (vite + serverless api)"
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

echo "==> Commitando e enviando..."
git add api/test-openai.js
git commit -m "fix(api): move /api/test-openai para raiz (Vite/React no Vercel)"
git push origin "$BRANCH"

echo
echo "✅ Pronto! Assim que o Preview ficar Ready, teste:"
echo "   https://<seu-preview>.vercel.app/api/test-openai"
echo "Se aparecer 200 com JSON, está OK; se vier 401/429, é resposta da OpenAI."
