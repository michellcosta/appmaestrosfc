#!/usr/bin/env node

/**
 * Script para recriar conta de Owner
 * Gera comando para executar no browser
 */

console.log('🔧 RECRIANDO CONTA OWNER...');
console.log('=====================================');

// Criar novo usuário owner com seu email
const newOwner = {
    id: crypto.randomUUID(),
    email: 'michellcosta1269@gmail.com',
    name: 'Michell Costa - Owner',
    role: 'owner',
    group_id: `group_${Date.now()}`,
    avatar: null,
    created_at: new Date().toISOString()
};

console.log('✅ Novo owner criado:', newOwner);
console.log('');
console.log('🎯 INSTRUÇÕES PARA RECRIAR SUA CONTA OWNER:');
console.log('=============================================');
console.log('');
console.log('1. 🌐 Abra http://localhost:5173');
console.log('2. 🔧 Abra o Console do navegador (F12)');
console.log('3. 📋 Cole e execute este comando:');
console.log('');
console.log('// Limpar usuário existente');
console.log('localStorage.removeItem("offline_user");');
console.log('');
console.log('// Criar novo owner');
console.log(`localStorage.setItem("offline_user", '${JSON.stringify(newOwner)}');`);
console.log('');
console.log('4. 🔄 Recarregue a página (F5)');
console.log('');
console.log('✅ Sua conta owner será recriada com acesso total!');
console.log('');
console.log('🎉 Você terá acesso a:');
console.log('- 👥 Gerenciar jogadores');
console.log('- ⚽ Criar partidas');
console.log('- 💰 Sistema financeiro');
console.log('- 🏆 Dashboard completo');
console.log('- ⚙️ Configurações do sistema');