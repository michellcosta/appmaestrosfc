# Script para configurar acesso de rede ao Vite Dev Server
# Execute como Administrador

Write-Host "🔥 Configurando acesso de rede para Vite Dev Server..." -ForegroundColor Green
Write-Host ""

# Liberar porta 5173 no Firewall
Write-Host "📡 Liberando porta 5173 no Firewall do Windows..." -ForegroundColor Yellow

try {
    # Verificar se a regra já existe
    $existingRule = Get-NetFirewallRule -DisplayName "Vite Dev Server" -ErrorAction SilentlyContinue
    
    if ($existingRule) {
        Write-Host "⚠️  Regra já existe. Removendo regra antiga..." -ForegroundColor Yellow
        Remove-NetFirewallRule -DisplayName "Vite Dev Server"
    }
    
    # Criar nova regra
    New-NetFirewallRule -DisplayName "Vite Dev Server" -Direction Inbound -LocalPort 5173 -Protocol TCP -Action Allow
    Write-Host "✅ Porta 5173 liberada no Firewall!" -ForegroundColor Green
}
catch {
    Write-Host "❌ Erro ao configurar Firewall: $_" -ForegroundColor Red
    Write-Host "⚠️  Execute este script como Administrador!" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🌐 Seu IP local:" -ForegroundColor Cyan
Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.InterfaceAlias -like "*Wi-Fi*" } | Select-Object -ExpandProperty IPAddress

Write-Host ""
Write-Host "📱 Para acessar no celular:" -ForegroundColor Green
Write-Host "   1. Conecte o celular na mesma rede Wi-Fi" -ForegroundColor White
Write-Host "   2. Abra o navegador do celular" -ForegroundColor White
Write-Host "   3. Digite: http://SEU_IP:5173" -ForegroundColor White
Write-Host ""
Write-Host "✨ Configuração concluída! Agora execute: npm run dev" -ForegroundColor Green

