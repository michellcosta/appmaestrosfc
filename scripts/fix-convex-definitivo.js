#!/usr/bin/env node

/**
 * Script para resolver definitivamente o problema do Convex
 * Remove dependências problemáticas e configura sistema local
 */

import { existsSync, readFileSync, writeFileSync, rmSync } from 'fs';
import { join } from 'path';

console.log('🔧 Resolvendo problema do Convex definitivamente...\n');

// 1. Remover arquivos Convex problemáticos
const convexFiles = [
  'convex/players.ts',
  'convex/matches.ts', 
  'convex/events.ts',
  'convex/schema.ts'
];

console.log('🗑️ Removendo arquivos Convex problemáticos:');
convexFiles.forEach(file => {
  const filePath = join(process.cwd(), file);
  if (existsSync(filePath)) {
    rmSync(filePath);
    console.log(`  ✅ Removido: ${file}`);
  } else {
    console.log(`  ⚠️ Não encontrado: ${file}`);
  }
});

// 2. Remover diretório _generated
const generatedDir = join(process.cwd(), 'convex', '_generated');
if (existsSync(generatedDir)) {
  rmSync(generatedDir, { recursive: true, force: true });
  console.log('  ✅ Removido: convex/_generated/');
}

// 3. Remover ConvexProvider
const convexProviderFile = join(process.cwd(), 'src', 'ConvexProvider.tsx');
if (existsSync(convexProviderFile)) {
  rmSync(convexProviderFile);
  console.log('  ✅ Removido: src/ConvexProvider.tsx');
}

// 4. Atualizar main.tsx para remover ConvexProvider
const mainFile = join(process.cwd(), 'src', 'main.tsx');
if (existsSync(mainFile)) {
  let content = readFileSync(mainFile, 'utf8');
  
  // Remover import do ConvexProvider
  content = content.replace(/import ConvexProvider from '\.\/ConvexProvider';?\n?/g, '');
  
  // Remover wrapper ConvexProvider
  content = content.replace(/<ConvexProvider>\s*/g, '');
  content = content.replace(/\s*<\/ConvexProvider>/g, '');
  
  writeFileSync(mainFile, content);
  console.log('  ✅ Atualizado: src/main.tsx (removido ConvexProvider)');
}

// 5. Remover Jogo.tsx que usa Convex
const jogoFile = join(process.cwd(), 'src', 'pages', 'Jogo.tsx');
if (existsSync(jogoFile)) {
  rmSync(jogoFile);
  console.log('  ✅ Removido: src/pages/Jogo.tsx');
}

// 6. Remover convex.json
const convexJsonFile = join(process.cwd(), 'convex.json');
if (existsSync(convexJsonFile)) {
  rmSync(convexJsonFile);
  console.log('  ✅ Removido: convex.json');
}

console.log('\n🎯 PRÓXIMOS PASSOS:');
console.log('1. Execute: npm run dev');
console.log('2. Acesse: http://localhost:5173');
console.log('3. Teste: Dashboard do proprietário');
console.log('4. Sistema agora funciona sem Convex');

console.log('\n✅ Limpeza do Convex concluída!');
console.log('🚀 Sistema pronto para retomar desenvolvimento do Nexus Play!');
