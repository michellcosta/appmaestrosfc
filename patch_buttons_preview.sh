#!/usr/bin/env bash
set -euo pipefail

BRANCH="feature/buttons-ux"
COMMIT_MSG='feat(match): Recomeçar azul e Encerrar vermelho (preview)'
CANDIDATES=("Match.tsx" "src/pages/Match.tsx" "components/Match.tsx")

# 1) Descobrir arquivo alvo
FILE=""
for f in "${CANDIDATES[@]}"; do
  if [ -f "$f" ]; then FILE="$f"; break; fi
done
if [ -z "$FILE" ]; then
  # varredura por nome/conteúdo
  mapfile -t found < <(git ls-files '*.tsx' 2>/dev/null | grep -iE '(\/|^)Match\.tsx$' || true)
  if [ "${#found[@]}" -gt 0 ]; then
    FILE="${found[0]}"
  else
    echo "ERRO: não encontrei Match.tsx. Ajuste o caminho dentro do script."
    exit 1
  fi
fi
echo "→ Arquivo alvo: $FILE"

# 2) Backup
STAMP="$(date +%Y%m%d-%H%M%S)"
cp "$FILE" "$FILE.bak.$STAMP"
echo "→ Backup criado: $FILE.bak.$STAMP"

# 3) Patch (multilinha, robusto)
#    - Recomeçar (handleReset) recebe classes azuis
#    - Encerrar (handleEnd) recebe classes vermelhas
perl -0777 -pe '
  sub add_or_append_class {
    my ($attrs, $new) = @_;
    if ($attrs =~ s/className="([^"]*)"/className="$1 $new"/e) {
      return $attrs;
    } else {
      $attrs .= qq{ className="$new"};
      return $attrs;
    }
  }

  s{
    <Button([^>])onClick=\{handleReset\}([^>])>
  }{
    my $attrs = "$1$2";
    $attrs = add_or_append_class($attrs, q/bg-blue-600 hover:bg-blue-700 text-white/);
    "<Button$attrs>"
  }egx;

  s{
    <Button([^>])onClick=\{handleEnd\}([^>])>
  }{
    my $attrs = "$1$2";
    $attrs = add_or_append_class($attrs, q/bg-red-600 hover:bg-red-700 text-white/);
    "<Button$attrs>"
  }egx;
' -i "$FILE"

echo "→ Patch aplicado."

# 4) Git: commit + push em branch de preview
git fetch origin --prune
if git show-ref --verify --quiet "refs/heads/$BRANCH"; then
  git checkout "$BRANCH"
else
  git checkout -b "$BRANCH"
fi

git add "$FILE"
if git diff --cached --quiet; then
  echo "Nada para commitar (nenhuma mudança detectada)."
else
  git commit -m "$COMMIT_MSG"
fi

git push -u origin "$BRANCH"
echo "✅ Enviado para $BRANCH. Abra o Vercel → Deployments e acesse o Preview dessa branch."
