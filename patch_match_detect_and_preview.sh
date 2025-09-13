#!/usr/bin/env bash
# Aplica patch de UX na Partida em todos os arquivos candidatos e publica em preview.

set -u

BRANCH="feature/match-ux"
COMMIT_MSG='feat(match): recomeçar azul, modal encerrar com desafiante, placar 2 times e histórico maior'

command -v git >/dev/null 2>&1 || { echo "ERRO: git não encontrado"; exit 1; }
git rev-parse --is-inside-work-tree >/dev/null 2>&1 || { echo "ERRO: não é repo Git"; exit 1; }

echo "==> Coletando arquivos candidatos…"
mapfile -t CANDS < <(
  git ls-files '*.tsx' |
  grep -iE '/(src/)?(pages|components)/Match(es)?\.tsx$' || true
)

# Fallback por conteúdo (se o nome não ajudar)
if [ ${#CANDS[@]} -eq 0 ]; then
  mapfile -t CANDS < <(
    git ls-files '*.tsx' | xargs -I{} grep -ilE 'Partida ao Vivo|Placar|Encerrar|Iniciar' {} || true
  )
fi

if [ ${#CANDS[@]} -eq 0 ]; then
  echo "ERRO: não achei nenhum .tsx com cara de tela de Partida."
  exit 1
fi

echo "→ Candidatos:"
printf '  - %s\n' "${CANDS[@]}"

# Localiza globals.css
GLOBAL_CSS=""
for c in "app/globals.css" "src/app/globals.css" "styles/globals.css"; do
  [ -f "$c" ] && { GLOBAL_CSS="$c"; break; }
done

# Criar classe do histórico (se não existir)
if [ -n "$GLOBAL_CSS" ]; then
  if ! grep -q ".scroll-panel--history" "$GLOBAL_CSS"; then
    cat >> "$GLOBAL_CSS" <<'CSS'

/* Área maior para Histórico da Semana */
.scroll-panel--history {
  max-height: 28rem;
  overflow-y: auto;
}
CSS
    echo "→ Adicionada .scroll-panel--history em $GLOBAL_CSS"
  else
    echo "→ .scroll-panel--history já existe em $GLOBAL_CSS"
  fi
else
  echo "→ globals.css não encontrado; pulando classe do histórico"
fi

# sed compatível Git Bash
sedi(){ sed -i.bak "$@" && rm -f "${1##*/}.bak" 2>/dev/null || true; }

patch_one () {
  local FILE="$1"
  [ -f "$FILE" ] || return 0

  echo ""
  echo "=== Patching: $FILE ==="
  local STAMP="$(date +%Y%m%d-%H%M%S)"
  cp "$FILE" "$FILE.bak.$STAMP"

  # 1) Imports de dialog e ícones
  grep -q 'from "@/components/ui/dialog"' "$FILE" || \
    printf 'import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from "@/components/ui/dialog";\n' | cat - "$FILE" > "$FILE.tmp" && mv "$FILE.tmp" "$FILE"

  if grep -qE 'from\s+"lucide-react"' "$FILE"; then
    grep -q 'Pencil' "$FILE"  || sedi '0,/import[[:space:]]{/{s/import[[:space:]]{[[:space:]]*/&Pencil, /}' "$FILE"
    grep -q 'Trash2' "$FILE" || sedi '0,/import[[:space:]]{/{s/import[[:space:]]{[[:space:]]*/&Trash2, /}' "$FILE"
  else
    sed -i '1i import { Pencil, Trash2 } from "lucide-react";' "$FILE"
  fi

  # 2) Estados: openEnd / nextChallenger / activeTeams (só se não existir)
  grep -q 'openEnd' "$FILE" || awk '
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

  # 3) Botão Recomeçar (azul) — cria se não existir
  if ! grep -qE 'Recomeçar' "$FILE"; then
    # insere após o botão Iniciar/Pausar mais próximo
    awk '
      BEGIN{done=0}
      {
        line=$0
        print line
        if (!done && line ~ /<Button/ && line ~ /(Iniciar|Pausar)/) {
          print "              <Button className=\"bg-blue-600 hover:bg-blue-700 text-white ml-2\" onClick={() => { /* TODO: ligar ao reset do cronômetro */ }}>"
          print "                Recomeçar"
          print "              </Button>"
          done=1
        }
      }
    ' "$FILE" > "$FILE.tmp" && mv "$FILE.tmp" "$FILE"
  else
    # se já existe, só garante a cor azul
    sedi -E 's#<Button([^>])>[[:space:]]*Recomeçar[[:space:]]</Button>#<Button\1 className="bg-blue-600 hover:bg-blue-700 text-white">Recomeçar</Button>#g' "$FILE"
  fi

  # 4) Botão Encerrar → abrir modal (mantém cor/variant se já houver)
  if ! grep -q 'setOpenEnd(true)' "$FILE"; then
    sedi -E 's#(<Button[^>])(>[^<]*Encerrar[^<]</Button>)#\1 onClick={() => setOpenEnd(true)}\2#g' "$FILE"
  fi

  # 5) Modal Encerrar — injeta se não existir
  if ! grep -q 'Encerrar partida' "$FILE"; then
    awk '
      BEGIN{done=0}
      {
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
          print "            <button className=\\"px-3 py-2 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white\\""
          print "              onClick={() => {"
          print "                // TODO: calcule vencedor e troque desafiante:"
          print "                // const winner = /* seu vencedor */ 'Preto';"
          print "                // setActiveTeams([winner, nextChallenger || 'Verde']);"
          print "                setOpenEnd(false);"
          print "              }}"
          print "            >Confirmar</button>"
          print "          </DialogFooter>"
          print "        </DialogContent>"
          print "      </Dialog>"
          print $0
          done=1
        } else { print $0 }
      }
    ' "$FILE" > "$FILE.tmp" && mv "$FILE.tmp" "$FILE"
  fi

  # 6) Placar: tenta usar activeTeams (sem quebrar se já estiver)
  sedi -E 's/\(\s*\[[^]]\]\s\)\.map/ (activeTeams).map/g' "$FILE"
  sedi -E 's/\[\s*"Preto"\s*,\s*"Verde"\s*,\s*"Cinza"\s*,\s*"Vermelho"\s*\]/activeTeams/g' "$FILE"

  # 7) Histórico da semana: aplicar classe maior, se o container tiver className
  sedi -E 's/(Hist[óo]rico[^<]Semana[^\n]\n[^\n]<div[^>]*className=")([^"])"/\1\2 scroll-panel--history"/' "$FILE"

  echo "--- Resumo do que ficou no arquivo ---"
  grep -nE 'Recomeçar|Encerrar partida|DialogTitle|activeTeams|scroll-panel--history' "$FILE" || true
}

# Aplica patch em todos os candidatos
for f in "${CANDS[@]}"; do
  # Confirma que tem cara de Partida
  if grep -qiE 'Partida ao Vivo|Placar|Encerrar|Iniciar' "$f"; then
    patch_one "$f"
  fi
done

# Commit + push em branch de preview
echo ""
echo "==> Commit + push para $BRANCH"
git fetch origin --prune
if git show-ref --verify --quiet "refs/heads/$BRANCH"; then
  git checkout "$BRANCH"
else
  git checkout -b "$BRANCH"
fi

git add -A
if git diff --cached --quiet; then
  echo "(nada para commitar)"
else
  git commit -m "$COMMIT_MSG"
fi

git push -u origin "$BRANCH"
echo "✅ Preview: a branch $BRANCH foi enviada. Veja no Vercel → Deployments."
