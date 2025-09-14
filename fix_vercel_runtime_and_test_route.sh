#!/usr/bin/env bash
set -euo pipefail

BRANCH="feature/test-openai-pages"
COMMIT_MSG="fix(vercel): remove vercel.json e função crua; usar apenas Pages API /api/test-openai"

# 1) Remover configs que causam o erro (se existirem nesta branch)
[ -f vercel.json ] && git rm -f vercel.json || true
[ -f api/test-openai.ts ] && git rm -f api/test-openai.ts || true

# 2) Garantir rota de teste via Pages Router (src/pages/api)
mkdir -p src/pages/api
TARGET="src/pages/api/test-openai.ts"
if [ ! -f "$TARGET" ]; then
  cat > "$TARGET" <<'TS'
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    return res.status(500).json({ ok: false, message: "OPENAI_API_KEY não encontrada" });
  }
  try {
    const r = await fetch("https://api.openai.com/v1/models", {
      headers: { Authorization: Bearer ${key} },
    });
    if (!r.ok) {
      const text = await r.text();
      return res.status(r.status).json({ ok: false, message: text });
    }
    const data = await r.json();
    return res.status(200).json({
      ok: true,
      models: Array.isArray(data?.data) ? data.data.slice(0, 3).map((m: any) => m.id) : [],
      runtime: "pages-router",
    });
  } catch (err: any) {
    return res.status(500).json({ ok: false, message: err?.message ?? "erro desconhecido" });
  }
}
TS
  git add "$TARGET"
fi

# 3) Commit + push na branch de preview correta
git fetch origin --prune
if git rev-parse --verify --quiet "$BRANCH"; then
  git checkout "$BRANCH"
else
  git checkout -b "$BRANCH"
fi

git add -A
git commit -m "$COMMIT_MSG" || echo "(nada para commitar)"
git push -u origin "$BRANCH"

# 4) Forçar um redeploy rápido (commit vazio) — opcional
git commit --allow-empty -m "chore: trigger redeploy" || true
git push

echo
echo "✅ Corrigido e enviado para $BRANCH. Assim que o Preview ficar Ready, teste:"
echo "   https://<URL-DO-PREVIEW>.vercel.app/api/test-openai"
