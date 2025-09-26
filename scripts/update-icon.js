#!/usr/bin/env node
/**
 * Script para atualizar ícones do app automaticamente
 * Uso: node scripts/update-icon.js
 */

const fs = require('fs');
const path = require('path');

console.log('🎨 Atualizando ícones do app...\n');

// Verificar se arquivos existem
const iconFiles = [
  'public/icon.svg',
  'public/icon-192.png', 
  'public/icon-512.png',
  'public/favicon.ico'
];

iconFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file} - Encontrado`);
  } else {
    console.log(`❌ ${file} - Não encontrado`);
  }
});

console.log('\n📝 Para personalizar seus ícones:');
console.log('1. Substitua os arquivos na pasta public/');
console.log('2. Nomes devem ser: icon.svg, icon-192.png, icon-512.png, favicon.ico');
console.log('3. Para resultado imediato: reload do navegador');
console.log('4. Clear cache do navegador se necessário');

// Atualizar manifest.json
const manifestPath = path.join(process.cwd(), 'public/manifest.json');
if (fs.existsSync(manifestPath)) {
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  manifest.name = 'Maestros FC';
  manifest.short_name = 'Maestros FC';
  manifest.description = 'Aplicativo para organizar partidas de futebol';
  
  // Atualizar paths de ícones
  manifest.icons = [
    {
      src: '/icon.svg',
      sizes: 'any',
      type: 'image/svg+xml',
      purpose: 'any maskable'
    },
    {
      src: '/icon-192.png', 
      sizes: '192x192',
      type: 'image/png',
      purpose: 'any maskable'
    },
    {
      src: '/icon-512.png',
      sizes: '512x512', 
      type: 'image/png',
      purpose: 'any maskable'
    }
  ];
  
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log('\n✅ Manifest.json atualizado!');
} else {
  console.log('\n❌ Manifest.json não encontrado');
}

console.log('\n🎉 Configuração de ícones concluída!');
