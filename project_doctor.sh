#!/usr/bin/env bash
set -euo pipefail

echo "== Maestros FC ‚Ä¢ Project Doctor =="
echo "Ì≥¶ Git:"
git rev-parse --abbrev-ref HEAD || true
git status -s || true

echo
echo "Ì∑∞ Ambiente:"
node -v || true
npm -v || true

echo
echo "Ì∑Ç Estrutura b√°sica:"
test -f src/pages/Match.tsx && echo "‚úì src/pages/Match.tsx" || echo "‚úó src/pages/Match.tsx ausente"
test -f src/store/matchStore.ts && echo "‚úì src/store/matchStore.ts" || echo "‚úó src/store/matchStore.ts ausente"
test -f public/manifest.json && echo "‚úì public/manifest.json" || echo "‚úó public/manifest.json ausente"
test -f index.html && echo "‚úì index.html" || echo "‚Ñπ index.html n√£o encontrado (ok em setups sem HTML raiz)"

echo
echo "Ì¥é Checagens r√°pidas em Match.tsx:"
if [ -f src/pages/Match.tsx ]; then
  # className sem crases no TeamBadge
  echo "- Procurando className sem crases no TeamBadge‚Ä¶"
  grep -nE 'className=\s*inline-flex|className=\{inline-flex' src/pages/Match.tsx || echo "  ‚úì ok"

  # Duplicidade de historyFilter
  echo "- Duplicidade de historyFilter:"
  grep -nE 'const \[historyFilter,\s*setHistoryFilter\]' src/pages/Match.tsx || echo "  ‚úì ok"

  # Uso de getElapsedSec (pode causar crash se m√©todo n√£o existir no store)
  echo "- Uso de getElapsedSec:"
  grep -n 'getElapsedSec' src/pages/Match.tsx || echo "  ‚úì n√£o encontrado (ok)"

  # Select.Item sem value
  echo "- Radix Select.Item sem value (padr√µes perigosos):"
  grep -nE '<SelectItem>([^<]|$)' -n src/pages/Match.tsx || echo "  ‚úì nenhum SelectItem sem value aparente"
fi

echo
echo "Ì¥é Checagens no projeto:"
# procurar SelectItem sem value no projeto todo
grep -RInE '<SelectItem>([^<]|$)' src || echo "‚úì nenhum SelectItem sem value aparente (projeto)"
# procurar imports quebrados comuns
grep -RIn "import { Match } from \"./pages/Match\"" src || true

echo
echo "Ì∑π Tentativa de corre√ß√£o autom√°tica do TeamBadge (se necess√°rio):"
if [ -f src/pages/Match.tsx ]; then
  cp -f src/pages/Match.tsx src/pages/Match.tsx.bak.doctor 2>/dev/null || true
  perl -0777 -pe 's/className=\{?inline-flex items-center px-3 py-1 rounded-full text-sm font-medium \${colorChip\[color\]} \${className \?\? ""}\}?/className={inline-flex items-center px-3 py-1 rounded-full text-sm font-medium \${colorChip[color]} \${className ?? ""}}/g' -i src/pages/Match.tsx

  # Se ainda n√£o ficou certo, for√ßa substitui√ß√£o do componente inteiro (fallback)
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
        print "WARN: TeamBadge n√£o encontrado para substituir." > "/dev/stderr"
      }
    }' src/pages/Match.tsx > src/pages/Match.tsx.tmp && mv src/pages/Match.tsx.tmp src/pages/Match.tsx
  fi
fi

echo
echo "Ì∑™ TypeScript check:"
npx --yes tsc --noEmit || echo "‚ö†  tsc retornou erros (cole acima)"

echo
echo "Ì¥é ESLint (se configurado):"
npx --yes eslint . --ext .ts,.tsx || echo "‚Ñπ eslint n√£o configurado ou retornou avisos/erros (veja acima)"

echo
echo "Ìøó Build (vite build):"
npm run -s build || echo "‚ùå Build falhou ‚Äì cole os erros acima"

echo
echo "Ì≥ã RESUMO:"
echo "- Se o build passou, o Vercel deve compilar tamb√©m."
echo "- Se falhou, copie os erros exibidos na se√ß√£o 'Build (vite build)'."
echo "- Se acusou SelectItem sem value, corrija adicionando value=\"algum-valor\" em cada <SelectItem>."
echo "- Se acusou duplicidade de historyFilter, mantenha apenas UMA declara√ß√£o de useState para historyFilter."
