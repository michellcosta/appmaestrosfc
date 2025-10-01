#!/usr/bin/env node

/**
 * Script para debugar login Google e histórico de usuários
 */

console.log('🐛 DEBUG: LOGIN GOOGLE E HISTÓRICO DE USUÁRIOS');
console.log('================================================');

console.log('📋 INSTRUÇÕES PARA DEBUG:');
console.log('');
console.log('1. 🌐 Abra http://localhost:5174');
console.log('');
console.log('2. 🔧 Abra o Console do navegador (F12)');
console.log('');
console.log('3. 📋 Cole e execute este comando para ver o estado atual:');
console.log('');
console.log('// Ver estado atual do localStorage');
console.log('console.log("🔍 Estado atual do localStorage:");');
console.log('console.log("offline_user:", localStorage.getItem("offline_user"));');
console.log('console.log("all_users:", localStorage.getItem("all_users"));');
console.log('');
console.log('4. 📋 Para ver logs detalhados do login:');
console.log('');
console.log('// Interceptar logs do console');
console.log('const originalLog = console.log;');
console.log('console.log = function(...args) {');
console.log('  if (args[0] && typeof args[0] === "string" && args[0].includes("Google")) {');
console.log('    originalLog("🔍 LOG GOOGLE:", ...args);');
console.log('  } else if (args[0] && typeof args[0] === "string" && args[0].includes("User")) {');
console.log('    originalLog("👤 LOG USER:", ...args);');
console.log('  } else {');
console.log('    originalLog(...args);');
console.log('  }');
console.log('};');
console.log('');
console.log('5. 📋 Para forçar salvamento de usuário no histórico:');
console.log('');
console.log('// Forçar salvamento de usuário atual');
console.log('const currentUser = localStorage.getItem("offline_user");');
console.log('if (currentUser) {');
console.log('  const user = JSON.parse(currentUser);');
console.log('  const existingUsers = JSON.parse(localStorage.getItem("all_users") || "[]");');
console.log('  const userExists = existingUsers.some(u => u.id === user.id);');
console.log('  ');
console.log('  if (!userExists) {');
console.log('    existingUsers.push({');
console.log('      ...user,');
console.log('      loginDate: new Date().toISOString(),');
console.log('      lastSeen: new Date().toISOString()');
console.log('    });');
console.log('    localStorage.setItem("all_users", JSON.stringify(existingUsers));');
console.log('    console.log("✅ Usuário adicionado ao histórico:", user.email);');
console.log('  } else {');
console.log('    console.log("ℹ️ Usuário já existe no histórico");');
console.log('  }');
console.log('} else {');
console.log('  console.log("❌ Nenhum usuário logado");');
console.log('}');
console.log('');
console.log('6. 📋 Para testar a página de usuários:');
console.log('');
console.log('// Simular dados para teste');
console.log('const testUsers = [');
console.log('  {');
console.log('    id: "test-1",');
console.log('    email: "teste1@gmail.com",');
console.log('    name: "Usuário Teste 1",');
console.log('    role: "diarista",');
console.log('    loginDate: new Date().toISOString(),');
console.log('    lastSeen: new Date().toISOString()');
console.log('  },');
console.log('  {');
console.log('    id: "test-2",');
console.log('    email: "teste2@gmail.com",');
console.log('    name: "Usuário Teste 2",');
console.log('    role: "owner",');
console.log('    loginDate: new Date().toISOString(),');
console.log('    lastSeen: new Date().toISOString()');
console.log('  }');
console.log('];');
console.log('localStorage.setItem("all_users", JSON.stringify(testUsers));');
console.log('console.log("✅ Usuários de teste adicionados");');
console.log('');
console.log('✅ Execute esses comandos para debugar o problema!');

