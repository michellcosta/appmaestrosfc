#!/usr/bin/env bash
set -euo pipefail

BRANCH="feature/test-openai"
COMMIT_MSG="chore(api): add app router /api/test-openai to validate OPENAI_API_KEY"

# 1) Cria a pasta se não existir
API_DIR="src/app/api/test-openai"
mkdir -p "$API_DIR"

TARGET="$API_DIR/route.ts"
echo "→ Criando $TARGET"

cat > "$TARGET" <<'TS'
import { NextResponse } from "next/server";

export async function GET() {
  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    return NextResponse.json({ ok: false, message: "OPENAI_API_KEY não encontrada" }, { status: 500 });
  }
  try {
    const r = await fetch("https://api.openai.com/v1/models", {
      headers: { Authorization: `Bearer ${key}` },
    });
    if (!r.ok) {
      const text = await r.text();
      return NextResponse.json({ ok: false, message: text }, { status: r.status });
    }
    const data = await r.json();
    return NextResponse.json({
      ok: true,
      models: Array.isArray(data?.data) ? data.data.slice(0, 3).map((m: any) => m.id) : [],
    });
  } catch (err: any) {
    return NextResponse.json({ ok: false, message: err?.message ?? "erro desconhecido" }, { status: 500 });
  }
}
TS

# 2) Commit + push
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
echo "✅ Pronto! Agora o Vercel vai criar o Preview em /api/test-openai (App Router)."
