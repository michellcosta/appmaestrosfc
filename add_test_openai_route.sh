#!/usr/bin/env bash
set -euo pipefail

BRANCH="feature/test-openai"
COMMIT_MSG="chore(api): add /api/test-openai to validate OPENAI_API_KEY"

# 0) Pré-checagens
command -v git >/dev/null 2>&1 || { echo "ERRO: git não encontrado"; exit 1; }
git rev-parse --is-inside-work-tree >/dev/null 2>&1 || { echo "ERRO: não é repo git"; exit 1; }
git remote get-url origin >/dev/null 2>&1 || { echo "ERRO: remote 'origin' não configurado"; exit 1; }

# 1) Detecta/cria pasta de API
API_DIR=""
if [ -d "src/pages/api" ]; then
  API_DIR="src/pages/api"
elif [ -d "pages/api" ]; then
  API_DIR="pages/api"
else
  API_DIR="src/pages/api"
  mkdir -p "$API_DIR"
fi

TARGET="$API_DIR/test-openai.ts"
echo "→ Criando $TARGET"

# 2) Cria a rota de teste
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
    });
  } catch (err: any) {
    return res.status(500).json({ ok: false, message: err?.message ?? "erro desconhecido" });
  }
}
TS

echo "→ Arquivo criado: $TARGET"

# 3) Commit + push em branch de preview
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
echo "✅ Pronto! Preview sendo criado pelo Vercel para a branch $BRANCH."
echo "• Local (rodando dev):  http://localhost:3000/api/test-openai"
echo "• Preview Vercel: abra o último deployment da branch $BRANCH e acesse /api/test-openai"
