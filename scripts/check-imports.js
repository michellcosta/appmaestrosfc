#!/usr/bin/env node

/**
 * Script para verificar imports problemáticos
 * Identifica arquivos que podem estar causando erros de import dinâmico
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

console.log('🔍 Verificando imports problemáticos...\n');

// Verificar OwnerDashboard.tsx
const ownerDashboardFile = join(process.cwd(), 'src', 'pages', 'OwnerDashboard.tsx');
console.log('📄 Verificando OwnerDashboard.tsx:');
console.log(`  - Arquivo existe: ${existsSync(ownerDashboardFile) ? '✅' : '❌'}`);

if (existsSync(ownerDashboardFile)) {
  try {
    const content = readFileSync(ownerDashboardFile, 'utf8');
    console.log(`  - Tamanho: ${content.length} caracteres`);
    
    // Verificar imports problemáticos
    const problematicImports = [
      '@/components/AnalyticsDashboard',
      '@/components/CompleteInviteModal',
      '@/store/donationStore',
      '@/store/gamesStore'
    ];
    
    console.log('\n🔍 Verificando imports problemáticos:');
    problematicImports.forEach(importPath => {
      const hasImport = content.includes(importPath);
      console.log(`  - ${importPath}: ${hasImport ? '❌' : '✅'}`);
    });
    
    // Verificar se há erros de sintaxe básicos
    const hasUnclosedBrackets = (content.match(/\{/g) || []).length !== (content.match(/\}/g) || []).length;
    const hasUnclosedParens = (content.match(/\(/g) || []).length !== (content.match(/\)/g) || []).length;
    
    console.log('\n🔍 Verificando sintaxe básica:');
    console.log(`  - Chaves balanceadas: ${!hasUnclosedBrackets ? '✅' : '❌'}`);
    console.log(`  - Parênteses balanceados: ${!hasUnclosedParens ? '✅' : '❌'}`);
    
  } catch (error) {
    console.log('  ❌ Erro ao ler arquivo:', error.message);
  }
}

// Verificar se arquivos de store existem
const storeFiles = [
  'src/store/donationStore.ts',
  'src/store/gamesStore.ts'
];

console.log('\n📁 Verificando arquivos de store:');
storeFiles.forEach(file => {
  const filePath = join(process.cwd(), file);
  console.log(`  - ${file}: ${existsSync(filePath) ? '✅' : '❌'}`);
});

// Verificar se componentes existem
const componentFiles = [
  'src/components/AnalyticsDashboard.tsx',
  'src/components/CompleteInviteModal.tsx'
];

console.log('\n📁 Verificando componentes:');
componentFiles.forEach(file => {
  const filePath = join(process.cwd(), file);
  console.log(`  - ${file}: ${existsSync(filePath) ? '✅' : '❌'}`);
});

console.log('\n🎯 PRÓXIMOS PASSOS:');
console.log('1. Verificar se todos os imports existem');
console.log('2. Corrigir imports problemáticos');
console.log('3. Reiniciar servidor de desenvolvimento');

console.log('\n✅ Verificação concluída!');
