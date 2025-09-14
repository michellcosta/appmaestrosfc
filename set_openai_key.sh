#!/usr/bin/env bash
set -euo pipefail

# Pergunta pela chave sem exibir no terminal
read -sp "Digite sua OpenAI API Key (começa com sk-): " OPENAI_KEY
echo ""

# 1. Local - escreve no .env.local (ignorado pelo git)
echo "OPENAI_API_KEY=$OPENAI_KEY" > .env.local
echo "→ Key adicionada em .env.local (uso local)"

# 2. Atualiza .env.example (para documentar, sem a key real)
if [ -f ".env.example" ]; then
  grep -q "OPENAI_API_KEY" .env.example \
    && sed -i 's/^OPENAI_API_KEY.*/OPENAI_API_KEY=coloque_sua_chave_aqui/' .env.example \
    || echo "OPENAI_API_KEY=coloque_sua_chave_aqui" >> .env.example
  git add .env.example
  git commit -m "docs(env): adiciona OPENAI_API_KEY no .env.example" || true
fi

# 3. Configura no Vercel (precisa do vercel-cli instalado e logado)
if command -v vercel >/dev/null 2>&1; then
  vercel env add OPENAI_API_KEY production <<< "$OPENAI_KEY"
  vercel env add OPENAI_API_KEY preview <<< "$OPENAI_KEY"
  vercel env add OPENAI_API_KEY development <<< "$OPENAI_KEY"
  echo "→ Key configurada no Vercel (produção, preview, development)"
else
  echo "⚠️ vercel-cli não encontrado. Instale com: npm i -g vercel"
fi

echo "✅ Tudo pronto!"
