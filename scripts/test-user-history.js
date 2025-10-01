#!/usr/bin/env node

/**
 * Script para testar o histórico de usuários
 */

console.log('🧪 TESTANDO HISTÓRICO DE USUÁRIOS...');
console.log('=====================================');

console.log('📋 INSTRUÇÕES PARA TESTAR:');
console.log('');
console.log('1. 🌐 Abra http://localhost:5174');
console.log('');
console.log('2. 🔧 Abra o Console do navegador (F12)');
console.log('');
console.log('3. 📋 Cole e execute este comando para ver o histórico:');
console.log('');
console.log('// Ver histórico de usuários');
console.log('const allUsers = localStorage.getItem("all_users");');
console.log('if (allUsers) {');
console.log('  const users = JSON.parse(allUsers);');
console.log('  console.log("👥 Histórico de usuários:", users);');
console.log('  users.forEach((user, index) => {');
console.log('    console.log(`${index + 1}. ${user.name} (${user.email})`);');
console.log('    console.log(`   Role: ${user.role}`);');
console.log('    console.log(`   Login: ${new Date(user.loginDate).toLocaleString("pt-BR")}`);');
console.log('    console.log(`   Último acesso: ${new Date(user.lastSeen).toLocaleString("pt-BR")}`);');
console.log('    console.log("");');
console.log('  });');
console.log('} else {');
console.log('  console.log("📭 Nenhum usuário no histórico");');
console.log('}');
console.log('');
console.log('4. 📋 Para limpar o histórico (se necessário):');
console.log('');
console.log('localStorage.removeItem("all_users");');
console.log('localStorage.removeItem("offline_user");');
console.log('console.log("🧹 Histórico limpo");');
console.log('');
console.log('5. 🔄 Para testar:');
console.log('   - Faça login com uma conta Google');
console.log('   - Faça logout');
console.log('   - Faça login com outra conta Google');
console.log('   - Execute o comando acima para ver ambas as contas');
console.log('');
console.log('✅ Teste concluído!');

