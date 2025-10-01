#!/usr/bin/env node

/**
 * Script para configurar Convex automaticamente
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔧 Configurando Convex...');

// Criar arquivo .env se não existir
const envPath = path.join(process.cwd(), '.env');
const envContent = `# Convex Configuration
VITE_CONVEX_URL=https://placeholder.convex.cloud

# Supabase Configuration (existing)
VITE_SUPABASE_URL=https://autxxmhtadimwvprfsov.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF1dHh4bWh0YWRpbXd2cHJmc292Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY2MDQ1NDcsImV4cCI6MjA3MjE4MDU0N30.LwjIbMib_pPKpiXAZ3bu1tSVyTjhDzLPI6E59NdG3Ig
`;

if (!fs.existsSync(envPath)) {
    fs.writeFileSync(envPath, envContent);
    console.log('✅ Arquivo .env criado');
} else {
    console.log('⚠️  Arquivo .env já existe');
}

console.log('📋 Instruções:');
console.log('1. Execute: npx convex dev (em terminal interativo)');
console.log('2. Copie a URL gerada');
console.log('3. Substitua "https://placeholder.convex.cloud" no .env');
console.log('4. Reinicie o servidor: npm run dev');
console.log('');
console.log('🎯 Resultado: Tela branca resolvida!');
