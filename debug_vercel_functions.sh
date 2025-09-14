#!/usr/bin/env bash
set -euo pipefail

BRANCH="feature/test-openai-fn2"
MSG="chore(api): add /api/hello and /api/debug-openai; improve /api/test-openai logs"

mkdir -p api

# 1) /api/hello
cat > api/hello.js <<'JS'
export default function handler(req, res) {
  res.status(200).json({ ok: true, message: "hello from vercel function" });
}
JS

# 2) /api/debug-openai (sem chamar a API)
cat > api/debug-openai.js <<'JS'
export default function handler(req, res) {
  const key = process.env.OPENAI_API_KEY || "";
  res.status(200).json({
    ok: true,
    hasKey: Boolean(key),
    keyPrefix: key ? key.slice(0, 7) : null,
    node: process.version,
    env: "vercel-node",
  });
}
JS

# 3) Reforça /api/test-openai com logs e timeout
cat > api/test-openai.js <<'JS'
function withTimeout(promise, ms = 8000) {
  let t;
  const timeout = new Promise((_, rej) => { t = setTimeout(() => rej(new Error("fetch timeout")), ms); });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(t));
}

export default async function handler(req, res) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    console.error("OPENAI_API_KEY ausente no ambiente do Vercel.");
    res.status(500).json({ ok: false, message: "OPENAI_API_KEY não encontrada" });
    return;
  }

  try {
    console.log("Chamando OpenAI /v1/models ...");
    const r = await withTimeout(fetch("https://api.openai.com/v1/models", {
      headers: { Authorization: Bearer ${key} },
    }));

    const text = await r.text();
    if (!r.ok) {
      console.error("OpenAI retornou erro:", r.status, text.slice(0, 300));
      res.status(r.status).json({ ok: false, message: text });
      return;
    }

    const data = JSON.parse(text);
    const models = Array.isArray(data?.data) ? data.data.slice(0, 3).map((m) => m.id) : [];
    res.status(200).json({ ok: true, models, runtime: "vercel-esm" });
  } catch (err) {
    console.error("Falha ao chamar OpenAI:", err?.message || err);
    res.status(500).json({ ok: false, message: err?.message || "erro desconhecido" });
  }
}
JS

git fetch origin --prune
git checkout "$BRANCH" || git checkout -b "$BRANCH"
git add api/hello.js api/debug-openai.js api/test-openai.js
git commit -m "$MSG" || true
git push -u origin "$BRANCH"

echo ""
echo "✅ Enviado. Assim que o Preview ficar Ready, teste na ordem:"
echo "1) /api/hello           -> deve retornar { ok: true, ... }"
echo "2) /api/debug-openai    -> deve dizer hasKey=true e mostrar node/version"
echo "3) /api/test-openai     -> deve listar modelos OU retornar erro da OpenAI com detalhes"
echo ""
echo "Exemplos de URLs:"
echo "  https://<preview-url>.vercel.app/api/hello"
echo "  https://<preview-url>.vercel.app/api/debug-openai"
echo "  https://<preview-url>.vercel.app/api/test-openai"
echo ""
echo "Para ver logs (ao vivo):"
echo "  vercel logs https://<preview-url>.vercel.app --since=20m --follow"
