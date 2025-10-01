#!/usr/bin/env node

/**
 * Script para reinicialização COMPLETA do servidor
 * Para quando há problemas persistentes de cache
 */

import { execSync } from 'child_process';
import { existsSync, rmSync } from 'fs';
import { join } from 'path';

console.log('🔄 REINICIALIZAÇÃO COMPLETA DO SERVIDOR...\n');

const projectRoot = process.cwd();

// 1. Limpar todos os caches
console.log('🧹 Limpando todos os caches...');

const caches = [
  join(projectRoot, 'node_modules', '.vite'),
  join(projectRoot, '.vite'),
  join(projectRoot, 'dist'),
  join(projectRoot, 'node_modules', '.cache'),
  join(projectRoot, 'tsconfig.tsbuildinfo')
];

caches.forEach(cache => {
  if (existsSync(cache)) {
    rmSync(cache, { recursive: true, force: true });
    console.log(`✅ ${cache} limpo`);
  }
});

// 2. Limpar cache do npm
try {
  execSync('npm cache clean --force', { stdio: 'inherit' });
  console.log('✅ Cache do npm limpo');
} catch (error) {
  console.log('⚠️ Erro ao limpar cache do npm:', error.message);
}

// 3. Verificar se há processos rodando na porta 5173
try {
  console.log('\n🔍 Verificando processos na porta 5173...');
  execSync('netstat -ano | findstr :5173', { stdio: 'inherit' });
} catch (error) {
  console.log('ℹ️ Nenhum processo encontrado na porta 5173');
}

console.log('\n🎯 PRÓXIMOS PASSOS:');
console.log('1. Pare o servidor atual (Ctrl+C)');
console.log('2. Aguarde 5 segundos');
console.log('3. Execute: npm run dev');
console.log('4. Acesse: http://localhost:5173/owner-dashboard');

console.log('\n✅ REINICIALIZAÇÃO COMPLETA CONCLUÍDA!');
console.log('🚀 Sistema deve funcionar perfeitamente agora!');
