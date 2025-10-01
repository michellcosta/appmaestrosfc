#!/usr/bin/env node

/**
 * Script para reiniciar o ambiente de desenvolvimento
 * Limpa cache e reinicia servidores
 */

import { execSync } from 'child_process';
import { existsSync, rmSync } from 'fs';
import { join } from 'path';

console.log('🔄 Reiniciando ambiente de desenvolvimento...\n');

// Limpar cache do Vite
const viteCache = join(process.cwd(), 'node_modules', '.vite');
if (existsSync(viteCache)) {
  try {
    rmSync(viteCache, { recursive: true, force: true });
    console.log('✅ Cache do Vite limpo');
  } catch (error) {
    console.log('⚠️  Erro ao limpar cache do Vite:', error.message);
  }
}

// Limpar cache do npm
try {
  execSync('npm cache clean --force', { stdio: 'inherit' });
  console.log('✅ Cache do npm limpo');
} catch (error) {
  console.log('⚠️  Erro ao limpar cache do npm:', error.message);
}

console.log('\n🎯 PRÓXIMOS PASSOS:');
console.log('1. Pare o servidor atual (Ctrl+C)');
console.log('2. Execute: npm run dev');
console.log('3. Acesse: http://localhost:5173/jogo');

console.log('\n✅ Ambiente reiniciado!');
