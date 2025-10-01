#!/usr/bin/env node

console.log('🧹 LIMPANDO AUTENTICAÇÃO E PREPARANDO TESTE...');
console.log('===============================================');

console.log('📋 INSTRUÇÕES PARA TESTAR LOGIN COMO OWNER:');
console.log('');
console.log('1. 🌐 Abra http://localhost:5174');
console.log('');
console.log('2. 🔧 Abra o Console do navegador (F12)');
console.log('');
console.log('3. 📋 Cole e execute este comando para limpar:');
console.log('');
console.log('localStorage.clear();');
console.log('location.reload();');
console.log('');
console.log('4. 🔐 Faça login com Google usando: michellcosta1269@gmail.com');
console.log('');
console.log('5. ✅ Verifique no console se aparece:');
console.log('   "🔍 Google User criado: { email: "michellcosta1269@gmail.com", role: "owner", isMainOwner: true }"');
console.log('');
console.log('6. 🎯 Verifique se na interface aparece "Owner" em vez de "Diarista"');
console.log('');
console.log('✅ Se tudo estiver correto, você verá:');
console.log('- 👑 Nome: "Michell Costa - Owner"');
console.log('- 🔑 Role: "owner"');
console.log('- 📊 Acesso ao Dashboard Owner');
console.log('');
console.log('❌ Se ainda aparecer "Diarista":');
console.log('- Verifique o console para erros');
console.log('- Verifique se o email está correto: michellcosta1269@gmail.com');
console.log('');
console.log('🎉 Teste agora em http://localhost:5174!');
