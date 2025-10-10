@echo off
echo 🚀 Iniciando ngrok para Maestros FC...
echo.

REM Verificar se ngrok está instalado
where ngrok >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ ngrok não encontrado!
    echo.
    echo 📥 Para instalar:
    echo 1. Acesse: https://ngrok.com/download
    echo 2. Baixe e extraia ngrok.exe
    echo 3. Adicione ao PATH ou coloque nesta pasta
    echo.
    pause
    exit /b 1
)

echo ✅ ngrok encontrado!
echo.
echo 🔧 Iniciando túnel para porta 5173...
echo.
echo 📱 Use a URL que aparecerá abaixo no celular
echo 🌐 Adicione essa URL nas credenciais do Google Cloud Console
echo.

ngrok http 5173

pause
