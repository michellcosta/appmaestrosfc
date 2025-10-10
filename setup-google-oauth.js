#!/usr/bin/env node

console.log('��� CONFIGURAÇÃO GOOGLE OAUTH - MAESTROS FC');
console.log('==========================================');

console.log('\n��� INSTRUÇÕES PASSO A PASSO:');
console.log('');

console.log('1️⃣ GOOGLE CLOUD CONSOLE:');
console.log('   • Acesse: https://console.cloud.google.com');
console.log('   • Crie um projeto ou selecione um existente');
console.log('   • Vá para: APIs & Services → Credentials');
console.log('   • Clique: "Create Credentials" → "OAuth 2.0 Client ID"');
console.log('   • Tipo: "Web Application"');
console.log('   • Nome: "Maestros FC App"');
console.log('');

console.log('2️⃣ CONFIGURAR URLs:');
console.log('   Authorized JavaScript origins:');
console.log('   • http://localhost:5173');
console.log('   • https://seu-dominio.com (produção)');
console.log('');
console.log('   Authorized redirect URIs:');
console.log('   • https://expert-eagle-519.convex.site/api/auth/callback/google');
console.log('');

console.log('3️⃣ COPIAR CREDENCIAIS:');
console.log('   • Copie o Client ID');
console.log('   • Copie o Client Secret');
console.log('');

console.log('4️⃣ CONFIGURAR CONVEX:');
console.log('   • npx convex login (se não estiver logado)');
console.log('   • npx convex env set AUTH_GOOGLE_ID <seu_client_id>');
console.log('   • npx convex env set AUTH_GOOGLE_SECRET <seu_client_secret>');
console.log('   • npx convex deploy');
console.log('');

console.log('5️⃣ TESTAR:');
console.log('   • npm run dev');
console.log('   • Acesse: http://localhost:5173');
console.log('   • Clique: "Continuar com Google"');
console.log('');

console.log('✅ PRONTO! O Google OAuth estará funcionando!');
console.log('');
console.log('��� COMANDOS RÁPIDOS:');
console.log('   npm run dev          # Iniciar desenvolvimento');
console.log('   npx convex dev       # Iniciar Convex em modo dev');
console.log('   npx convex deploy    # Deploy para produção');
console.log('');

