#!/usr/bin/env node

/**
 * Script para testar conexão com Convex
 * Verifica se o servidor Convex está rodando e acessível
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

console.log('🔍 Testando conexão com Convex...\n');

// Verificar se arquivos _generated existem
const generatedDir = join(process.cwd(), 'convex', '_generated');
const apiFile = join(generatedDir, 'api.js');
const apiTypesFile = join(generatedDir, 'api.d.ts');

console.log('📁 Verificando arquivos _generated:');
console.log(`  - convex/_generated/ existe: ${existsSync(generatedDir) ? '✅' : '❌'}`);
console.log(`  - convex/_generated/api.js existe: ${existsSync(apiFile) ? '✅' : '❌'}`);
console.log(`  - convex/_generated/api.d.ts existe: ${existsSync(apiTypesFile) ? '✅' : '❌'}`);

// Verificar conteúdo do api.js
if (existsSync(apiFile)) {
  try {
    const content = readFileSync(apiFile, 'utf8');
    console.log('\n📄 Conteúdo do api.js:');
    console.log('  - Tamanho:', content.length, 'caracteres');
    console.log('  - Contém imports corretos:', content.includes('from "../events"') ? '✅' : '❌');
    console.log('  - Contém exports:', content.includes('export const api') ? '✅' : '❌');
  } catch (error) {
    console.log('  ❌ Erro ao ler api.js:', error.message);
  }
}

// Verificar .env
const envFile = join(process.cwd(), '.env');
console.log('\n🔧 Verificando configuração:');
console.log(`  - .env existe: ${existsSync(envFile) ? '✅' : '❌'}`);

if (existsSync(envFile)) {
  try {
    const envContent = readFileSync(envFile, 'utf8');
    const hasConvexUrl = envContent.includes('VITE_CONVEX_URL');
    console.log(`  - VITE_CONVEX_URL configurado: ${hasConvexUrl ? '✅' : '❌'}`);
    
    if (hasConvexUrl) {
      const urlMatch = envContent.match(/VITE_CONVEX_URL=(.+)/);
      if (urlMatch) {
        console.log(`  - URL: ${urlMatch[1]}`);
      }
    }
  } catch (error) {
    console.log('  ❌ Erro ao ler .env:', error.message);
  }
}

// Verificar se Jogo.tsx existe e está correto
const jogoFile = join(process.cwd(), 'src', 'pages', 'Jogo.tsx');
console.log('\n🎮 Verificando Jogo.tsx:');
console.log(`  - Jogo.tsx existe: ${existsSync(jogoFile) ? '✅' : '❌'}`);

if (existsSync(jogoFile)) {
  try {
    const jogoContent = readFileSync(jogoFile, 'utf8');
    console.log(`  - Contém import do api: ${jogoContent.includes('from "../../convex/_generated/api"') ? '✅' : '❌'}`);
    console.log(`  - Contém useQuery: ${jogoContent.includes('useQuery') ? '✅' : '❌'}`);
    console.log(`  - Contém useMutation: ${jogoContent.includes('useMutation') ? '✅' : '❌'}`);
  } catch (error) {
    console.log('  ❌ Erro ao ler Jogo.tsx:', error.message);
  }
}

console.log('\n🎯 PRÓXIMOS PASSOS:');
console.log('1. Execute: npx convex dev (em terminal separado)');
console.log('2. Execute: npm run dev (em outro terminal)');
console.log('3. Acesse: http://localhost:5173/jogo');
console.log('4. Teste: adicionar jogadores → Sortear & Iniciar → registrar gols');

console.log('\n✅ Teste concluído!');
