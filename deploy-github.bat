@echo off
echo 🚀 Iniciando deploy para GitHub Pages...

echo 📦 Fazendo build...
call npm run build

if %errorlevel% neq 0 (
    echo ❌ Erro no build!
    pause
    exit /b 1
)

echo ✅ Build concluído com sucesso!

echo 🌿 Configurando branch gh-pages...
git checkout -b gh-pages 2>nul || git checkout gh-pages

echo 📁 Copiando arquivos...
xcopy /E /Y dist\* .

echo 💾 Commitando mudanças...
git add .
git commit -m "Deploy: %date% %time%"

echo 🚀 Fazendo push para GitHub...
git push origin gh-pages

echo ✅ Deploy concluído! 
echo 🌐 Acesse: https://michell-oliveira.github.io/appmaestrosfc
pause
