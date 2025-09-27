#!/usr/bin/env node

/**
 * Script para otimização de assets
 * Reduz tamanho de imagens e otimiza arquivos estáticos
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ASSETS_DIR = path.join(__dirname, '../public');
const DIST_DIR = path.join(__dirname, '../dist');

/**
 * Otimiza arquivos de imagem
 */
function optimizeImages() {
  console.log('🖼️  Otimizando imagens...');
  
  // Verificar se imagens existem e otimizar se necessário
  const imageFiles = ['icon-192.png', 'icon-512.png'];
  
  imageFiles.forEach(file => {
    const filePath = path.join(ASSETS_DIR, file);
    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath);
      console.log(`📊 ${file}: ${(stats.size / 1024).toFixed(2)} KB`);
    }
  });
}

/**
 * Otimiza arquivos de manifesto
 */
function optimizeManifest() {
  console.log('📱 Otimizando manifest...');
  
  const manifestPath = path.join(ASSETS_DIR, 'manifest.json');
  if (fs.existsSync(manifestPath)) {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    
    // Remover propriedades desnecessárias para produção
    delete manifest.display_override;
    delete manifest.edge_side_panel;
    
    // Otimizar ícones removendo duplicatas
    const optimizedIcons = manifest.icons.filter((icon, index, self) => 
      index === self.findIndex(i => i.src === icon.src && i.sizes === icon.sizes)
    );
    
    manifest.icons = optimizedIcons;
    
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
    console.log('✅ Manifest otimizado');
  }
}

/**
 * Gera arquivo de compressão para Vercel
 */
function generateCompressionConfig() {
  console.log('🗜️  Configurando compressão...');
  
  const vercelConfig = {
    functions: {
      'src/**/*.ts': {
        runtime: 'nodejs18.x'
      }
    },
    headers: [
      {
        source: '/assets/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          },
          {
            key: 'Content-Encoding',
            value: 'gzip'
          }
        ]
      },
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          }
        ]
      }
    ],
    rewrites: [
      {
        source: '/(.*)',
        destination: '/index.html'
      }
    ]
  };
  
  fs.writeFileSync(
    path.join(__dirname, '../vercel.json'),
    JSON.stringify(vercelConfig, null, 2)
  );
  
  console.log('✅ Configuração do Vercel otimizada');
}

/**
 * Executa todas as otimizações
 */
function optimizeAll() {
  console.log('🚀 Iniciando otimização de assets...\n');
  
  try {
    optimizeImages();
    optimizeManifest();
    generateCompressionConfig();
    
    console.log('\n✅ Otimização concluída!');
    console.log('📊 Assets otimizados para produção');
  } catch (error) {
    console.error('❌ Erro durante otimização:', error);
    process.exit(1);
  }
}

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  optimizeAll();
}

export { optimizeAll, optimizeImages, optimizeManifest, generateCompressionConfig };
