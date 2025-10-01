#!/usr/bin/env node

/**
 * Script para listar usuários do localStorage (usuários offline)
 */

console.log('👥 LISTANDO USUÁRIOS DO LOCALSTORAGE...');
console.log('========================================');

// Simular acesso ao localStorage (que só existe no browser)
console.log('📋 INSTRUÇÕES PARA VER USUÁRIOS OFFLINE:');
console.log('');
console.log('1. 🌐 Abra http://localhost:5174 ou a URL de produção');
console.log('');
console.log('2. 🔧 Abra o Console do navegador (F12)');
console.log('');
console.log('3. 📋 Cole e execute este comando:');
console.log('');
console.log('// Listar usuário offline atual');
console.log('const offlineUser = localStorage.getItem("offline_user");');
console.log('if (offlineUser) {');
console.log('  const user = JSON.parse(offlineUser);');
console.log('  console.log("👤 Usuário Offline:", user);');
console.log('} else {');
console.log('  console.log("📭 Nenhum usuário offline encontrado");');
console.log('}');
console.log('');
console.log('4. 📋 Para listar todos os dados do localStorage:');
console.log('');
console.log('// Listar todos os dados do localStorage');
console.log('console.log("🗄️ Todos os dados do localStorage:");');
console.log('for (let i = 0; i < localStorage.length; i++) {');
console.log('  const key = localStorage.key(i);');
console.log('  const value = localStorage.getItem(key);');
console.log('  console.log(`${key}:`, value);');
console.log('}');
console.log('');
console.log('5. 📋 Para verificar se você está como owner:');
console.log('');
console.log('// Verificar status do owner');
console.log('const offlineUser = localStorage.getItem("offline_user");');
console.log('if (offlineUser) {');
console.log('  const user = JSON.parse(offlineUser);');
console.log('  console.log("👑 Email:", user.email);');
console.log('  console.log("🔑 Role:", user.role);');
console.log('  console.log("👤 Nome:", user.name);');
console.log('  console.log("🆔 ID:", user.id);');
console.log('  console.log("🏠 Group ID:", user.group_id);');
console.log('}');
console.log('');
console.log('✅ Execute esses comandos no console do navegador para ver os usuários!');

