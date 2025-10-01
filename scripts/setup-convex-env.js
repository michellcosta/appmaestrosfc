#!/usr/bin/env node

import { writeFileSync, existsSync } from 'fs';
import { join } from 'path';

console.log('🔧 Configurando Convex...\n');

const projectRoot = process.cwd();
const envPath = join(projectRoot, '.env');

// Verificar se .env já existe
let envContent = '';
if (existsSync(envPath)) {
  const fs = await import('fs');
  envContent = fs.readFileSync(envPath, 'utf8');
  console.log('✅ Arquivo .env encontrado, adicionando configuração do Convex...');
} else {
  console.log('📝 Criando arquivo .env...');
}

// Adicionar configuração do Convex se não existir
if (!envContent.includes('VITE_CONVEX_URL')) {
  envContent += '\n# Convex Configuration\n';
  envContent += 'VITE_CONVEX_URL=https://expert-eagle-519.convex.cloud\n';
}

// Manter configurações existentes do Supabase se existirem
if (!envContent.includes('VITE_SUPABASE_URL')) {
  envContent += '\n# Supabase Configuration\n';
  envContent += 'VITE_SUPABASE_URL=https://autxxmhtadimwvprfsov.supabase.co\n';
  envContent += 'VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF1dHh4bWh0YWRpbXd2cHJmc292Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI4NjY4NDcsImV4cCI6MjA0ODQ0Mjg0N30.v0ZQ9LfQ6J6Q6J6Q6J6Q6J6Q6J6Q6J6Q6J6Q6J6Q6\n';
}

// Escrever arquivo .env
writeFileSync(envPath, envContent);

console.log('✅ Configuração do Convex adicionada ao .env');
console.log('🔗 URL do Convex: https://expert-eagle-519.convex.cloud');

console.log('\n🎯 PRÓXIMOS PASSOS:');
console.log('1. Execute: npm run dev');
console.log('2. Acesse: http://localhost:5173/owner-dashboard');
console.log('3. O dashboard Convex deve funcionar perfeitamente!');

console.log('\n✅ Convex configurado com sucesso!');
