#!/usr/bin/env node

/**
 * Script para verificar e corrigir .env
 */

import fs from 'fs';

console.log('🔍 VERIFICANDO CONFIGURAÇÃO .env...');
console.log('=====================================');

// Verificar se .env existe
if (fs.existsSync('.env')) {
    console.log('✅ Arquivo .env existe');
    const envContent = fs.readFileSync('.env', 'utf8');
    console.log('📄 Conteúdo do .env:');
    console.log(envContent);

    if (envContent.includes('VITE_CONVEX_URL=https://expert-eagle-519.convex.cloud')) {
        console.log('✅ VITE_CONVEX_URL configurada corretamente');
    } else {
        console.log('❌ VITE_CONVEX_URL não configurada corretamente');
    }
} else {
    console.log('❌ Arquivo .env não existe');
}

console.log('');
console.log('🔧 SOLUÇÕES:');
console.log('');
console.log('1. Verificar se o arquivo .env está na raiz do projeto');
console.log('2. Verificar se a URL está correta');
console.log('3. Reiniciar o servidor após mudanças no .env');
console.log('');
console.log('📋 CONTEÚDO CORRETO DO .env:');
console.log('VITE_CONVEX_URL=https://expert-eagle-519.convex.cloud');
console.log('VITE_SUPABASE_URL=https://autxxmhtadimwvprfsov.supabase.co');
console.log('VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...');
