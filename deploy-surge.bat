@echo off
echo 🚀 Iniciando deploy para Surge.sh...

echo 📦 Fazendo build...
call npm run build

if %errorlevel% neq 0 (
    echo ❌ Erro no build!
    pause
    exit /b 1
)

echo ✅ Build concluído com sucesso!

echo 🌐 Fazendo deploy para Surge...
cd dist
surge . appmaestrosfc.surge.sh

echo ✅ Deploy concluído!
echo 🌐 Acesse: https://appmaestrosfc.surge.sh
pause
