#!/usr/bin/env bash
set -euo pipefail

BRANCH="feature/test-openai"
FILE="src/pages/api/test-openai.ts"

echo "==> Garantindo que está na branch $BRANCH..."
git checkout $BRANCH

echo "==> Criando diretório se não existir..."
mkdir -p src/pages/api

echo "==> Sobrescrevendo $FILE..."
cat > $FILE <<'EOF'
// src/pages/api/test-openai.ts
import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json({
    ok: true,
    message: "API funcionando 🚀 (Pages Router)",
  });
}
EOF

echo "==> Adicionando ao Git..."
git add $FILE

echo "==> Commitando alteração..."
git commit -m "fix(api): corrige rota test-openai para Pages Router"

echo "==> Fazendo push para $BRANCH..."
git push origin $BRANCH

echo "==> Pronto! 🎉 Aguarde o deploy no Vercel e depois acesse:"
echo "    https://<seu-projeto>.vercel.app/api/test-openai"