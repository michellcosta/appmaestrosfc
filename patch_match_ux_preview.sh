#!/usr/bin/env bash
# Aplica ajustes na Partida e publica em branch de preview (feature/match-ux)

set -u

REQ_FILE="src/pages/Match.tsx"
BRANCH="feature/match-ux"
COMMIT_MSG='feat(match): recomeçar azul, modal encerrar com desafiante, placar com 2 times e histórico maior'

# --- Checks básicos ---
command -v git >/dev/null 2>&1 || { echo "ERRO: git não encontrado"; exit 1; }
git rev-parse --is-inside-work-tree >/dev/null 2>&1 || { echo "ERRO: não é repo git"; exit 1; }
[ -f "$REQ_FILE" ] || { echo "ERRO: não achei $REQ_FILE"; exit 1; }

FILE="$REQ_FILE"
STAMP="$(date +%Y%m%d-%H%M%S)"
BACKUP="$FILE.bak.$STAMP"
cp "$FILE" "$BACKUP" && echo "Backup: $BACKUP"

sedi(){ sed -i.bak "$@" && rm -f "${1##*/}.bak" 2>/dev/null || true; }

echo "==> Garantindo import do Dialog e ícones"
# Dialog (shadcn/ui)
grep -q 'from "@/components/ui/dialog"' "$FILE" || \
  printf 'import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from "@/components/ui/dialog";\n' | cat - "$FILE" > "$FILE.tmp" && mv "$FILE.tmp" "$FILE"
# Ícones Pencil/Trash2
if grep -qE 'from\s+"lucide-react"' "$FILE"; then
  grep -q 'Pencil' "$FILE" || sedi '0,/import[[:space:]]{/{s/import[[:space:]]{[[:space:]]*/&Pencil, /}' "$FILE"
  grep -q 'Trash2' "$FILE" || sedi '0,/import[[:space:]]{/{s/import[[:space:]]{[[:space:]]*/&Trash2, /}' "$FILE"
else
  sed -i '1i import { Pencil, Trash2 } from "lucide-react";' "$FILE"
fi

echo "==> Estados: openEnd, nextChallenger, activeTeams (se faltarem)"
awk '
  BEGIN{ins=0}
  {
    print $0
    if (!ins && $0 ~ /useState\(/) {
      print "  const [openEnd, setOpenEnd] = useState<boolean>(false);"
      print "  const [nextChallenger, setNextChallenger] = useState<string>(\"\");"
      print "  const [activeTeams, setActiveTeams] = useState<string[]>([\"Preto\", \"Verde\"]);"
      ins=1
    }
  }
' "$FILE" > "$FILE.tmp" && mv "$FILE.tmp" "$FILE"

echo "==> Botão Recomeçar (azul)"
sedi -E 's#<Button([^>])>[[:space:]]*Recomeçar[[:space:]]</Button>#<Button\1 className="bg-blue-600 hover:bg-blue-700 text-white">Recomeçar</Button>#g' "$FILE"

echo "==> Botão Encerrar abre modal"
sedi -E 's#<Button([^>])>[[:space:]]*Encerrar[[:space:]]</Button>#<Button\1 onClick={() => setOpenEnd(true)} variant="secondary">Encerrar</Button>#g' "$FILE"

echo "==> Modal Encerrar (próximo desafiante)"
# injeta Dialog antes do fechamento do componente
awk '
  BEGIN{done=0}
  {
    if (!done && /return\s*\(/) { print; next }
    if (!done && /\)\s*;\s*}$/) {
      print "      <Dialog open={openEnd} onOpenChange={setOpenEnd}>"
      print "        <DialogContent>"
      print "          <DialogHeader>"
      print "            <DialogTitle>Encerrar partida</DialogTitle>"
      print "            <DialogDescription>Escolha o próximo time desafiante. O vencedor atual permanecerá.</DialogDescription>"
      print "          </DialogHeader>"
      print "          <div className=\\"grid gap-3\\">"
      print "            <label className=\\"text-sm font-medium\\">Próximo desafiante</label>"
      print "            <select"
      print "              className=\\"border rounded-md p-2 text-sm\\""
      print "              value={nextChallenger}"
      print "              onChange={(e) => setNextChallenger(e.target.value)}"
      print "            >"
      print "              <option value=\\"\\">Selecione o time</option>"
      print "              {([\\"Preto\\", \\"Verde\\", \\"Cinza\\", \\"Vermelho\\"] as const).map((t) => ("
      print "                <option key={t} value={t}>{t}</option>"
      print "              ))}"
      print "            </select>"
      print "          </div>"
      print "          <DialogFooter>"
      print "            <button className=\\"px-3 py-2 rounded-md border\\" onClick={() => setOpenEnd(false)}>Cancelar</button>"
      print "            <button"
      print "              className=\\"px-3 py-2 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white\\""
      print "              onClick={() => {"
      print "                // TODO: calcule o vencedor e troque o desafiante abaixo"
      print "                // Ex.: const winner = /* seu vencedor */ 'Preto';"
      print "                // setActiveTeams([winner, nextChallenger || 'Verde']);"
      print "                setOpenEnd(false);"
      print "              }}"
      print "            >Confirmar</button>"
      print "          </DialogFooter>"
      print "        </DialogContent>"
      print "      </Dialog>"
      print
      done=1
    } else { print }
  }
' "$FILE" > "$FILE.tmp" && mv "$FILE.tmp" "$FILE"

echo "==> Placar só com 2 times (activeTeams)"
sedi -E 's/\(\s*\[[^]]\]\s\)\.map/ (activeTeams).map/g' "$FILE"
sedi -E 's/\[\s*"Preto"\s*,\s*"Verde"\s*,\s*"Cinza"\s*,\s*"Vermelho"\s*\]/activeTeams/g' "$FILE"

echo "==> Histórico da semana maior/visível"
# localizar globals.css
GLOBAL_CSS=""
for c in "app/globals.css" "src/app/globals.css" "styles/globals.css"; do
  [ -f "$c" ] && { GLOBAL_CSS="$c"; break; }
done
if [ -n "$GLOBAL_CSS" ]; then
  if ! grep -q ".scroll-panel--history" "$GLOBAL_CSS"; then
    cat >> "$GLOBAL_CSS" <<'CSS'

/* Área maior para Histórico da Semana */
.scroll-panel--history {
  max-height: 28rem;
  overflow-y: auto;
}
CSS
    echo "→ classe .scroll-panel--history adicionada em $GLOBAL_CSS"
  fi
else
  echo "→ globals.css não encontrado; pulei classe do histórico"
fi
# tenta aplicar a classe no container após título do histórico
sedi -E 's/(Hist[óo]rico[^<]Semana[^\n]\n[^\n]<div[^>]*className=")([^"])"/\1\2 scroll-panel--history"/' "$FILE"

echo "==> Commit + push em branch de preview ($BRANCH)"
git fetch origin --prune
if git show-ref --verify --quiet "refs/heads/$BRANCH"; then
  git checkout "$BRANCH"
else
  git checkout -b "$BRANCH"
fi

git add "$FILE" 2>/dev/null || true
[ -n "$GLOBAL_CSS" ] && git add "$GLOBAL_CSS" 2>/dev/null || true

if git diff --cached --quiet; then
  echo "(nada para commitar)"
else
  git commit -m "$COMMIT_MSG"
fi

git push -u origin "$BRANCH"
echo "✅ Pronto! O Vercel deve criar um Preview para a branch $BRANCH."
