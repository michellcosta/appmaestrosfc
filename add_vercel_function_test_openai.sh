#!/usr/bin/env bash
set -euo pipefail

BRANCH="feature/test-openai-fn"
COMMIT_MSG="chore(api): Vercel function /api/test-openai to validate OPENAI_API_KEY"

# 0) Pré-checks
command -v git >/dev/null 2>&1 || { echo "ERRO: git não encontrado"; exit 1; }
git rev-parse --is-inside-work-tree >/dev/null 2>&1 || { echo "ERRO: não é repo git"; exit 1; }
git remote get-url origin >/dev/null 2>&1 || { echo "ERRO: remote 'origin' não configurado"; exit 1; }

# 1) Cria a função na RAIZ /api (padrão de Serverless Functions da Vercel p/ projetos não-Next)
mkdir -p api
TARGET="api/test-openai.ts"
echo "→ Criando $TARGET"

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
      runtime: 'vercel-node-fn',
    });
  } catch (err: any) {
    return res.status(500).json({ ok: false, message: err?.message ?? 'erro desconhecido' });
  }
}
TS

# 2) (Opcional) Garante que o Vercel use Node 18+; cria vercel.json se não existir
if [ ! -f "vercel.json" ]; then
  cat > vercel.json <<'JSON'
{
  "functions": {
    "api/.ts": {
      "runtime": "nodejs18.x"
    }
  }
}
JSON
  add_vjson=1
else
  add_vjson=0
fi

echo "→ Arquivo criado: $TARGET"

# 3) Commit + push em branch de preview
git fetch origin --prune
if git show-ref --verify --quiet "refs/heads/$BRANCH"; then
  git checkout "$BRANCH"
else
  git checkout -b "$BRANCH"
fi

git add "$TARGET"
[ $add_vjson -eq 1 ] && git add vercel.json || true
git commit -m "$COMMIT_MSG" || echo "(nada para commitar)"
git push -u origin "$BRANCH"

echo ""
echo "✅ Preview será criado para a branch $BRANCH."
echo "Assim que o deploy ficar Ready, teste:"
echo "  https://<SEU-DOMÍNIO-DE-PREVIEW>.vercel.app/api/test-openai"
