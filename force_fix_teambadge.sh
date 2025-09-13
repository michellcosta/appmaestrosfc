#!/usr/bin/env bash
set -euo pipefail

FILE="src/pages/Match.tsx"
[ -f "$FILE" ] || { echo "❌ $FILE não encontrado"; exit 1; }

echo "��� Backup: $FILE.bak.force-teambadge"
cp -f "$FILE" "$FILE.bak.force-teambadge"

awk '
BEGIN{skipping=0; inserted=0; seenSpan=0}
{
  # Detecta início do componente TeamBadge (tolerante a espaços/formatos)
  if (skipping==0 && $0 ~ /const[[:space:]]+TeamBadge[[:space:]]*:/) {
    print "const TeamBadge: React.FC<{ color: TeamColor; className?: string }> = ({ color, className }) => ("
    print "  <span"
    print "    className={inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${colorChip[color]} ${className ?? \"\"}}"
    print "  >"
    print "    {color}"
    print "  </span>"
    print ")"
    skipping=1
    inserted=1
    next
  }

  if (skipping==1) {
    # Pula o bloco antigo até fechar o componente;
    # marca quando viu </span> e para quando encontrar a linha apenas com ')'
    if ($0 ~ /<\/span>/) { seenSpan=1; next }
    if (seenSpan==1 && $0 ~ /^\)\s*;?\s*$/) { skipping=0; seenSpan=0; next }

    # Segurança extra: se por acaso aparecer um novo bloco grande, saímos do skip
    if ($0 ~ /^export[[:space:]]|^const[[:space:]]|^function[[:space:]]/) { skipping=0; seenSpan=0 }
    if (skipping==0) { print $0 }
    next
  }

  print
}
END{
  if (inserted==0) {
    print "WARN: TeamBadge não encontrado. Verifique o arquivo." > "/dev/stderr"
  }
}
' "$FILE" > "$FILE.tmp" && mv "$FILE.tmp" "$FILE"

# Sanity check
if ! grep -q 'className={`inline-flex items-center px-3 py-1' "$FILE"; then
  echo "❌ A correção não foi aplicada. Abra src/pages/Match.tsx e substitua manualmente o componente TeamBadge."
  exit 1
fi

git add "$FILE" "$FILE.bak.force-teambadge" || true
git commit -m "fix(ui): substituir TeamBadge por versão com template string correta (crases) para className"
git push origin feature/supabase-setup

echo "✅ TeamBadge corrigido e enviado. Dispare o build do Vercel."
