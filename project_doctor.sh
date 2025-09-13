#!/usr/bin/env bash
set -euo pipefail

echo "== Maestros FC • Project Doctor =="
echo "� Git:"
git rev-parse --abbrev-ref HEAD || true
git status -s || true

echo
echo "� Ambiente:"
node -v || true
npm -v || true

echo
echo "� Estrutura básica:"
test -f src/pages/Match.tsx && echo "✓ src/pages/Match.tsx" || echo "✗ src/pages/Match.tsx ausente"
test -f src/store/matchStore.ts && echo "✓ src/store/matchStore.ts" || echo "✗ src/store/matchStore.ts ausente"
test -f public/manifest.json && echo "✓ public/manifest.json" || echo "✗ public/manifest.json ausente"
test -f index.html && echo "✓ index.html" || echo "ℹ index.html não encontrado (ok em setups sem HTML raiz)"

echo
echo "� Checagens rápidas em Match.tsx:"
if [ -f src/pages/Match.tsx ]; then
  # className sem crases no TeamBadge
  echo "- Procurando className sem crases no TeamBadge…"
  grep -nE 'className=\s*inline-flex|className=\{inline-flex' src/pages/Match.tsx || echo "  ✓ ok"

  # Duplicidade de historyFilter
  echo "- Duplicidade de historyFilter:"
  grep -nE 'const \[historyFilter,\s*setHistoryFilter\]' src/pages/Match.tsx || echo "  ✓ ok"

  # Uso de getElapsedSec (pode causar crash se método não existir no store)
  echo "- Uso de getElapsedSec:"
  grep -n 'getElapsedSec' src/pages/Match.tsx || echo "  ✓ não encontrado (ok)"

  # Select.Item sem value
  echo "- Radix Select.Item sem value (padrões perigosos):"
  grep -nE '<SelectItem>([^<]|$)' -n src/pages/Match.tsx || echo "  ✓ nenhum SelectItem sem value aparente"
fi

echo
echo "� Checagens no projeto:"
# procurar SelectItem sem value no projeto todo
grep -RInE '<SelectItem>([^<]|$)' src || echo "✓ nenhum SelectItem sem value aparente (projeto)"
# procurar imports quebrados comuns
grep -RIn "import { Match } from \"./pages/Match\"" src || true

echo
echo "� Tentativa de correção automática do TeamBadge (se necessário):"
if [ -f src/pages/Match.tsx ]; then
  cp -f src/pages/Match.tsx src/pages/Match.tsx.bak.doctor 2>/dev/null || true
  perl -0777 -pe 's/className=\{?inline-flex items-center px-3 py-1 rounded-full text-sm font-medium \${colorChip\[color\]} \${className \?\? ""}\}?/className={inline-flex items-center px-3 py-1 rounded-full text-sm font-medium \${colorChip[color]} \${className ?? ""}}/g' -i src/pages/Match.tsx

  # Se ainda não ficou certo, força substituição do componente inteiro (fallback)
  if ! grep -q 'className={`inline-flex items-center' src/pages/Match.tsx; then
    awk '
    BEGIN{skipping=0; replaced=0}
    {
      if ($0 ~ /const TeamBadge: React\.FC<\{ color: TeamColor; className\?: string \}>.=>\s\(/) {
        skipping=1; replaced=1
        print "const TeamBadge: React.FC<{ color: TeamColor; className?: string }> = ({ color, className }) => ("
        print "  <span"
        print "    className={inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${colorChip[color]} ${className ?? \"\"}}"
        print "  >"
        print "    {color}"
        print "  </span>"
        print ")"
        next
      }
      if (skipping==1) {
        if ($0 ~ /^\)\s*$/) { skipping=0; next }
        else { next }
      }
      print
    }
    END{
      if (replaced==0) {
        print "WARN: TeamBadge não encontrado para substituir." > "/dev/stderr"
      }
    }' src/pages/Match.tsx > src/pages/Match.tsx.tmp && mv src/pages/Match.tsx.tmp src/pages/Match.tsx
  fi
fi

echo
echo "� TypeScript check:"
npx --yes tsc --noEmit || echo "⚠  tsc retornou erros (cole acima)"

echo
echo "� ESLint (se configurado):"
npx --yes eslint . --ext .ts,.tsx || echo "ℹ eslint não configurado ou retornou avisos/erros (veja acima)"

echo
echo "� Build (vite build):"
npm run -s build || echo "❌ Build falhou – cole os erros acima"

echo
echo "� RESUMO:"
echo "- Se o build passou, o Vercel deve compilar também."
echo "- Se falhou, copie os erros exibidos na seção 'Build (vite build)'."
echo "- Se acusou SelectItem sem value, corrija adicionando value=\"algum-valor\" em cada <SelectItem>."
echo "- Se acusou duplicidade de historyFilter, mantenha apenas UMA declaração de useState para historyFilter."
