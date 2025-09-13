#!/usr/bin/env bash
set -euo pipefail

FILE="src/pages/Match.tsx"

if [ ! -f "$FILE" ]; then
  echo "❌ Arquivo $FILE não encontrado. Execute a partir da raiz do projeto."
  exit 1
fi

echo "��� Backup de segurança..."
cp -f "$FILE" "$FILE.bak"

# 1) Remover 'elapsed' e 'tick' da desestruturação do useMatchStore
#    Remove tokens 'elapsed,' e 'tick,' na primeira desestruturação encontrada
echo "�� Removendo 'elapsed' e 'tick' da desestruturação do store..."
sed -i -E "0,/useMatchStore\(/s/\belapsed,\s*//" "$FILE"
sed -i -E "0,/useMatchStore\(/s/\btick,\s*//" "$FILE"

# 2) Inserir a linha 'const elapsed = useMatchStore(s => s.getElapsedSec())'
#    Logo após a linha que contém 'useMatchStore('
echo "➕ Inserindo elapsed derivado do relógio..."
awk '
  BEGIN{inserted=0}
  {
    print $0
    if (!inserted && $0 ~ /useMatchStore\(/) {
      print "  const elapsed = useMatchStore(s => s.getElapsedSec())"
      inserted=1
    }
  }
' "$FILE" > "$FILE.tmp" && mv "$FILE.tmp" "$FILE"

# 3) Remover o useEffect que fazia setInterval -> tick()
#    Apaga do início do useEffect até a linha com o fechamento e dependências [round.running, tick]
echo "���️ Removendo useEffect do tick()..."
awk '
  BEGIN {skip=0}
  /useEffect\(\s*\(\)\s*=>\s*\{/ {
    # Começou um useEffect; checar se dentro dele existe tick
    block=""
    block=block $0 "\n"
    skip=1
    next
  }
  skip==1 {
    block=block $0 "\n"
    if ($0 ~ /\}\s*,\s*\[.*round\.running.*tick.*\]\s*\)\s*/) {
      # Este é o useEffect do tick; não imprime (descarta bloco)
      skip=0
    } else if ($0 ~ /\}\s*,\s*\[.*\]\s*\)\s*/) {
      # Outro useEffect qualquer: imprime de volta (não era o do tick)
      printf "%s", block
      skip=0
    }
    next
  }
  { print $0 }
' "$FILE" > "$FILE.tmp" && mv "$FILE.tmp" "$FILE"

# 4) Caso tenha sobrado a importação/uso de 'tick' em algum lugar, fazer limpeza leve
echo "��� Limpeza leve de referências residuais ao tick..."
sed -i -E "s/,?\s*tick\s*(,|\})/\1/g" "$FILE"

echo "✅ Patch aplicado em $FILE"
echo "��� Fazendo commit e push..."
git add "$FILE" "$FILE.bak" || true
git commit -m "feat(match): cronômetro em background (elapsed derivado do relógio); remove tick() e useEffect local"
git push origin feature/supabase-setup

echo "��� Pronto! O cronômetro continuará correndo mesmo ao trocar de páginas."
