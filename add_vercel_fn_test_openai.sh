#!/usr/bin/env bash
set -euo pipefail

BRANCH="feature/test-openai-fn2"
COMMIT_MSG="chore(api): add Vercel Function /api/test-openai (Vite/React)"

# 0) Pré-checks
command -v git >/dev/null 2>&1 || { echo "ERRO: git não encontrado"; exit 1; }
git rev-parse --is-inside-work-tree >/dev/null 2>&1 || { echo "ERRO: não é repo git"; exit 1; }
git remote get-url origin >/dev/null 2>&1 || { echo "ERRO: remote 'origin' não configurado"; exit 1; }

# 1) Remover vercel.json legado (evita "Function Runtimes must have a valid version")
if [ -f vercel.json ]; then
  git rm -f vercel.json || true
fi

# 2) Criar função serverless em /api/test-openai.ts
mkdir -p api
TARGET="api/test-openai.ts"
cat > "$TARGET" <<'TS'
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    return res.status(500).json({ ok: false, message: 'OPENAI_API_KEY não encontrada' });
  }
  try {
    const r = await fetch('https://api.openai.com/v1/models', {
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
      runtime: 'vercel-node-fn'
    });
  } catch (err: any) {
    return res.status(500).json({ ok: false, message: err?.message ?? 'erro desconhecido' });
  }
}
TS

# 3) Commit + push em branch de preview
git fetch origin --prune
if git show-ref --verify --quiet "refs/heads/$BRANCH"; then
  git checkout "$BRANCH"
else
  git checkout -b "$BRANCH"
fi

git add "$TARGET"
# se removemos vercel.json acima, ele já foi git rm -f; garantir stage de mudanças
git add -A

git commit -m "$COMMIT_MSG" || echo "(nada para commitar)"
git push -u origin "$BRANCH"

echo
echo "✅ Preview sendo criado para a branch $BRANCH."
echo "Assim que ficar Ready, teste no navegador:"
echo "https://<URL-DO-PREVIEW>.vercel.app/api/test-openai"
echo
echo "Dica (curl): curl -sS https://<URL-DO-PREVIEW>.vercel.app/api/test-openai | jq ."
