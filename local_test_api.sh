#!/usr/bin/env bash
set -euo pipefail

APP_PORT="${APP_PORT:-3000}"
TEST_URL="http://localhost:${APP_PORT}/api/test-openai"

echo "==> 1) Conferindo .env.local..."
if [ ! -f ".env.local" ]; then
  echo "⚠  .env.local não encontrado. Crie um e adicione: OPENAI_API_KEY=sk-xxxx"
  exit 1
fi
if ! grep -q '^OPENAI_API_KEY=' .env.local; then
  echo "⚠  .env.local não contém OPENAI_API_KEY"
  exit 1
fi
echo "OK: .env.local presente com OPENAI_API_KEY."

echo "==> 2) Conferindo vercel-cli..."
if ! command -v vercel >/dev/null 2>&1; then
  echo "❌ vercel-cli não encontrado."
  echo "Instale com: npm i -g vercel"
  exit 1
fi
echo "OK: vercel-cli encontrado ($(vercel --version))"

echo "==> 3) Tentando iniciar 'vercel dev' na porta ${APP_PORT}..."
# Mata possíveis processos antigos nessa porta (Windows Git Bash compatível)
if command -v lsof >/dev/null 2>&1; then
  if lsof -i tcp:${APP_PORT} >/dev/null 2>&1; then
    echo "ℹ  Porta ${APP_PORT} ocupada. Tentando liberar..."
    lsof -ti tcp:${APP_PORT} | xargs -r kill || true
    sleep 1
  fi
fi

# Inicia vercel dev em background silencioso
# --yes/--confirm evita perguntas; se precisar login, o comando falha e pediremos pra logar.
set +e
vercel dev --yes --confirm --port ${APP_PORT} > .vercel-dev.log 2>&1 &
VC_PID=$!
set -e

# Espera o servidor subir (máx ~25s)
echo -n "Aguardando vercel dev subir"
for i in $(seq 1 25); do
  echo -n "."
  if curl -sS "http://localhost:${APP_PORT}/" >/dev/null 2>&1; then
    echo " ok!"
    break
  fi
  sleep 1
  if ! kill -0 ${VC_PID} >/dev/null 2>&1; then
    echo
    echo "❌ 'vercel dev' terminou antes de subir. Veja o log:"
    echo "--------------------------------------------------"
    sed -n '1,120p' .vercel-dev.log
    echo "--------------------------------------------------"
    echo "Se aparecer algo como 'Log in to Vercel', rode:"
    echo "  vercel login"
    echo "e depois rode este script novamente: ./local_test_api.sh"
    exit 1
  fi
done

if ! curl -sS "http://localhost:${APP_PORT}/" >/dev/null 2>&1; then
  echo
  echo "❌ Não consegui acessar http://localhost:${APP_PORT}/. Veja o log:"
  sed -n '1,200p' .vercel-dev.log
  exit 1
fi

echo "==> 4) Testando ${TEST_URL}"
if command -v jq >/dev/null 2>&1; then
  curl -sS "${TEST_URL}" | jq .
else
  curl -sS "${TEST_URL}"
  echo
  echo "ℹ Dica: instale 'jq' para saída formatada."
fi

echo
echo "✅ Pronto! Se o retorno foi { ok: true, ... } sua função e a OPENAI_API_KEY estão OK."
echo "   Para parar o vercel dev local, finalize o processo na aba/terminal ou:"
echo "   kill ${VC_PID} 2>/dev/null || true"
