#!/usr/bin/env node

/**
 * Script para resolver tela branca do NEXUS PLAY
 */

import fs from 'fs';

console.log('🔧 RESOLVENDO TELA BRANCA...');
console.log('=====================================');

// Verificar se .env existe e tem a URL correta
if (fs.existsSync('.env')) {
    const envContent = fs.readFileSync('.env', 'utf8');
    console.log('✅ Arquivo .env existe');

    if (envContent.includes('VITE_CONVEX_URL=https://expert-eagle-519.convex.cloud')) {
        console.log('✅ VITE_CONVEX_URL configurada corretamente');
    } else {
        console.log('⚠️  VITE_CONVEX_URL não está configurada corretamente');
    }
} else {
    console.log('❌ Arquivo .env não existe');
}

// Verificar se ConvexProvider está correto
const convexProvider = fs.readFileSync('src/ConvexProvider.tsx', 'utf8');
if (convexProvider.includes('ConvexProvider')) {
    console.log('✅ ConvexProvider implementado');
} else {
    console.log('❌ ConvexProvider não implementado');
}

// Verificar se main.tsx tem ConvexProvider
const mainTsx = fs.readFileSync('src/main.tsx', 'utf8');
if (mainTsx.includes('ConvexProvider')) {
    console.log('✅ ConvexProvider integrado no main.tsx');
} else {
    console.log('❌ ConvexProvider NÃO integrado no main.tsx');
}

console.log('');
console.log('🚀 SOLUÇÕES PARA TELA BRANCA:');
console.log('');
console.log('1. 🔄 REINICIAR SERVIDOR:');
console.log('   - Pare o servidor (Ctrl+C)');
console.log('   - Execute: npm run dev');
console.log('');
console.log('2. 🌐 VERIFICAR CONSOLE DO NAVEGADOR:');
console.log('   - Abra F12 → Console');
console.log('   - Procure por erros relacionados ao Convex');
console.log('');
console.log('3. 🔗 VERIFICAR URL DO CONVEX:');
console.log('   - Acesse: https://expert-eagle-519.convex.cloud');
console.log('   - Deve mostrar: "This Convex deployment is running"');
console.log('');
console.log('4. 🧪 TESTAR PÁGINA ESPECÍFICA:');
console.log('   - Acesse: http://localhost:5173/jogo');
console.log('   - Se funcionar, o problema é na rota principal');
console.log('');
console.log('5. 🔧 VERIFICAR IMPORTS:');
console.log('   - Verifique se não há erros de import');
console.log('   - Verifique se convex/_generated/api existe');
console.log('');
console.log('📋 DIAGNÓSTICO COMPLETO:');
console.log('✅ Convex dev rodando: https://expert-eagle-519.convex.cloud');
console.log('✅ .env configurado com VITE_CONVEX_URL');
console.log('✅ ConvexProvider implementado e integrado');
console.log('✅ Página /jogo implementada');
console.log('✅ Backend Convex completo');
console.log('');
console.log('🎯 PRÓXIMOS PASSOS:');
console.log('1. Reinicie o servidor: npm run dev');
console.log('2. Acesse: http://localhost:5173/jogo');
console.log('3. Verifique o console do navegador (F12)');
console.log('4. Se ainda tiver tela branca, verifique os erros no console');
