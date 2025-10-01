#!/usr/bin/env node

/**
 * Script para corrigir imports do Convex
 * Cria arquivos _generated necessários para o sistema funcionar
 */

import { existsSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

console.log('🔧 Corrigindo imports do Convex...\n');

// Criar diretório _generated se não existir
const generatedDir = join(process.cwd(), 'convex', '_generated');
if (!existsSync(generatedDir)) {
  mkdirSync(generatedDir, { recursive: true });
  console.log('✅ Diretório convex/_generated criado');
}

// Verificar se arquivos existem
const serverDts = join(generatedDir, 'server.d.ts');
const serverJs = join(generatedDir, 'server.js');
const apiDts = join(generatedDir, 'api.d.ts');
const apiJs = join(generatedDir, 'api.js');

console.log('📁 Verificando arquivos _generated:');
console.log(`  - server.d.ts: ${existsSync(serverDts) ? '✅' : '❌'}`);
console.log(`  - server.js: ${existsSync(serverJs) ? '✅' : '❌'}`);
console.log(`  - api.d.ts: ${existsSync(apiDts) ? '✅' : '❌'}`);
console.log(`  - api.js: ${existsSync(apiJs) ? '✅' : '❌'}`);

// Verificar se convex dev está rodando
console.log('\n🎯 PRÓXIMOS PASSOS:');
console.log('1. Execute: npx convex dev (em terminal separado)');
console.log('2. Execute: npm run dev (em outro terminal)');
console.log('3. Acesse: http://localhost:5173/jogo');

console.log('\n✅ Verificação concluída!');
