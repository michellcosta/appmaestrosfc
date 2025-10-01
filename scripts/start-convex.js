#!/usr/bin/env node

/**
 * Script para iniciar Convex dev
 */

const { spawn } = require('child_process');

console.log('🚀 Iniciando Convex dev...');
console.log('=====================================');

const convex = spawn('npx', ['convex', 'dev'], {
    stdio: 'inherit',
    shell: true
});

convex.on('error', (error) => {
    console.error('❌ Erro ao iniciar Convex:', error);
});

convex.on('close', (code) => {
    console.log(`Convex dev finalizado com código: ${code}`);
});

// Manter o processo rodando
process.on('SIGINT', () => {
    console.log('\n🛑 Parando Convex dev...');
    convex.kill('SIGINT');
    process.exit(0);
});

console.log('✅ Convex dev iniciado!');
console.log('📋 Instruções:');
console.log('1. Aguarde a URL do Convex aparecer');
console.log('2. Copie a URL e adicione ao .env como VITE_CONVEX_URL');
console.log('3. Execute npm run build novamente');
console.log('');
console.log('⚠️  Mantenha este terminal aberto durante o desenvolvimento');
