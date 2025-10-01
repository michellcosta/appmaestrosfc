#!/usr/bin/env node

/**
 * Script para limpar cache do Vite completamente
 * Resolve problemas de "Outdated Optimize Dep"
 */

import { existsSync, rmSync } from 'fs';
import { join } from 'path';

console.log('🧹 Limpando cache do Vite completamente...\n');

// Limpar cache do Vite
const viteCache = join(process.cwd(), 'node_modules', '.vite');
if (existsSync(viteCache)) {
    rmSync(viteCache, { recursive: true, force: true });
    console.log('✅ Cache do Vite limpo');
} else {
    console.log('⚠️ Cache do Vite não encontrado');
}

// Limpar dist
const distDir = join(process.cwd(), 'dist');
if (existsSync(distDir)) {
    rmSync(distDir, { recursive: true, force: true });
    console.log('✅ Diretório dist limpo');
}

// Limpar .vite
const dotVite = join(process.cwd(), '.vite');
if (existsSync(dotVite)) {
    rmSync(dotVite, { recursive: true, force: true });
    console.log('✅ Diretório .vite limpo');
}

console.log('\n🎯 PRÓXIMOS PASSOS:');
console.log('1. Pare o servidor atual (Ctrl+C)');
console.log('2. Execute: npm run dev');
console.log('3. Acesse: http://localhost:5173/owner-dashboard');

console.log('\n✅ Cache do Vite limpo completamente!');
