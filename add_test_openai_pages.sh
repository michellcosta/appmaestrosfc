#!/usr/bin/env bash
set -euo pipefail

BRANCH="feature/test-openai-pages"
COMMIT_MSG="chore(api): add Pages Router /api/test-openai fallback"

mkdir -p src/pages/api
TARGET="src/pages/api/test-openai.ts"

cat > "$TARGET" <<'TS'
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    return res.status(500).json({ ok: false, message: "OPENAI_API_KEY não encontrada" });
  }

  try {
    const r = await fetch("https://api.openai.com/v1/models", {
      headers: { Authorization: `Bearer ${key}` },
    });

    if (!r.ok) {
      const text = await r.text();
      return res.status(r.status).json({ ok: false, message: text });
    }

    const data = await r.json();
    res.status(200).json({
      ok: true,
      models: Array.isArray(data?.data) ? data.data.slice(0, 3).map((m: any) => m.id) : [],
      runtime: "pages-router",
    });
  } catch (err: any) {
    res.status(500).json({ ok: false, message: err?.message ?? "erro desconhecido" });
  }
}
TS

git fetch origin --prune
if git show-ref --verify --quiet "refs/heads/$BRANCH"; then
  git checkout "$BRANCH"
else
  git checkout -b "$BRANCH"
fi

git add "$TARGET"
git commit -m "$COMMIT_MSG" || echo "(nada para commitar)"
git push -u origin "$BRANCH"

echo ""
echo "✅ Rota criada em Pages Router. Quando o deploy Preview estiver pronto,"
echo "acesse: https://<seu-preview>.vercel.app/api/test-openai"
