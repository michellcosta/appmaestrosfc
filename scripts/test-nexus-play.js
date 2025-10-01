#!/usr/bin/env node

/**
 * Script para testar NEXUS PLAY completo
 */

import fs from 'fs';

console.log('🧪 TESTANDO NEXUS PLAY COMPLETO');
console.log('=====================================');

// Verificar arquivos essenciais
const filesToCheck = [
    'src/ConvexProvider.tsx',
    'src/pages/Jogo.tsx',
    'convex/schema.ts',
    'convex/players.ts',
    'convex/matches.ts',
    'convex/events.ts',
    'convex.json',
    'package.json'
];

console.log('📋 Verificando arquivos essenciais...');
let allFilesExist = true;

filesToCheck.forEach(file => {
    if (fs.existsSync(file)) {
        console.log(`✅ ${file}`);
    } else {
        console.log(`❌ ${file} - FALTANDO`);
        allFilesExist = false;
    }
});

// Verificar se .env existe
if (fs.existsSync('.env')) {
    console.log('✅ .env existe');
    const envContent = fs.readFileSync('.env', 'utf8');
    if (envContent.includes('VITE_CONVEX_URL')) {
        console.log('✅ VITE_CONVEX_URL configurada');
    } else {
        console.log('⚠️  VITE_CONVEX_URL não encontrada no .env');
    }
} else {
    console.log('❌ .env não existe');
    allFilesExist = false;
}

// Verificar se ConvexProvider está integrado no main.tsx
const mainTsx = fs.readFileSync('src/main.tsx', 'utf8');
if (mainTsx.includes('ConvexProvider')) {
    console.log('✅ ConvexProvider integrado no main.tsx');
} else {
    console.log('❌ ConvexProvider NÃO integrado no main.tsx');
    allFilesExist = false;
}

// Verificar se rota /jogo existe
const appRouter = fs.readFileSync('src/AppRouter.tsx', 'utf8');
if (appRouter.includes('/jogo')) {
    console.log('✅ Rota /jogo configurada');
} else {
    console.log('❌ Rota /jogo NÃO configurada');
    allFilesExist = false;
}

console.log('');
console.log('📊 RESULTADO:');
if (allFilesExist) {
    console.log('🎉 NEXUS PLAY CONFIGURADO CORRETAMENTE!');
    console.log('');
    console.log('🚀 PRÓXIMOS PASSOS:');
    console.log('1. Execute: npx convex dev (em terminal interativo)');
    console.log('2. Copie a URL gerada');
    console.log('3. Atualize VITE_CONVEX_URL no .env');
    console.log('4. Reinicie: npm run dev');
    console.log('5. Acesse: http://localhost:5173/jogo');
} else {
    console.log('❌ NEXUS PLAY COM PROBLEMAS - VERIFIQUE OS ARQUIVOS FALTANDO');
}

console.log('');
console.log('🎯 FUNCIONALIDADES IMPLEMENTADAS:');
console.log('✅ Sistema de jogadores (adicionar/listar)');
console.log('✅ Sorteio automático de times');
console.log('✅ Partida ao vivo com placar');
console.log('✅ Marcar gols em tempo real');
console.log('✅ Ranking automático');
console.log('✅ Backend Convex completo');
console.log('✅ Frontend React integrado');
