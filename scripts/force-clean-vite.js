#!/usr/bin/env node

/**
 * Script para limpeza FORÇADA do cache do Vite
 * Resolve problemas persistentes de "Outdated Optimize Dep"
 */

import { existsSync, rmSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';

console.log('🧹 LIMPEZA FORÇADA DO CACHE DO VITE...\n');

const projectRoot = process.cwd();

// 1. Limpar cache do Vite
const viteCache = join(projectRoot, 'node_modules', '.vite');
if (existsSync(viteCache)) {
  rmSync(viteCache, { recursive: true, force: true });
  console.log('✅ Cache do Vite limpo');
}

// 2. Limpar .vite
const dotVite = join(projectRoot, '.vite');
if (existsSync(dotVite)) {
  rmSync(dotVite, { recursive: true, force: true });
  console.log('✅ Diretório .vite limpo');
}

// 3. Limpar dist
const distDir = join(projectRoot, 'dist');
if (existsSync(distDir)) {
  rmSync(distDir, { recursive: true, force: true });
  console.log('✅ Diretório dist limpo');
}

// 4. Limpar node_modules/.cache
const nodeCache = join(projectRoot, 'node_modules', '.cache');
if (existsSync(nodeCache)) {
  rmSync(nodeCache, { recursive: true, force: true });
  console.log('✅ Cache do node_modules limpo');
}

// 5. Limpar tsconfig.tsbuildinfo
const tsbuildinfo = join(projectRoot, 'tsconfig.tsbuildinfo');
if (existsSync(tsbuildinfo)) {
  rmSync(tsbuildinfo, { force: true });
  console.log('✅ tsconfig.tsbuildinfo limpo');
}

// 6. Limpar cache do npm
try {
  execSync('npm cache clean --force', { stdio: 'inherit' });
  console.log('✅ Cache do npm limpo');
} catch (error) {
  console.log('⚠️ Erro ao limpar cache do npm:', error.message);
}

// 7. Verificar se há arquivos Convex restantes
const convexDir = join(projectRoot, 'convex');
if (existsSync(convexDir)) {
  console.log('⚠️ Diretório convex ainda existe - removendo...');
  rmSync(convexDir, { recursive: true, force: true });
  console.log('✅ Diretório convex removido');
}

console.log('\n🎯 PRÓXIMOS PASSOS:');
console.log('1. Pare o servidor atual (Ctrl+C)');
console.log('2. Execute: npm run dev');
console.log('3. Acesse: http://localhost:5173/owner-dashboard');

console.log('\n✅ LIMPEZA FORÇADA CONCLUÍDA!');
console.log('🚀 Sistema deve funcionar sem erros de cache agora!');
