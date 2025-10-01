#!/usr/bin/env node

/**
 * Script para configurar URL do Convex no .env
 */

import fs from 'fs';

const convexUrl = 'https://expert-eagle-519.convex.cloud';

console.log('🔧 Configurando URL do Convex...');
console.log('URL:', convexUrl);

const envContent = `# Convex Configuration
VITE_CONVEX_URL=${convexUrl}

# Supabase Configuration (existing)
VITE_SUPABASE_URL=https://autxxmhtadimwvprfsov.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF1dHh4bWh0YWRpbXd2cHJmc292Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY2MDQ1NDcsImV4cCI6MjA3MjE4MDU0N30.LwjIbMib_pPKpiXAZ3bu1tSVyTjhDzLPI6E59NdG3Ig
`;

try {
    fs.writeFileSync('.env', envContent);
    console.log('✅ Arquivo .env configurado com sucesso!');
    console.log('');
    console.log('🚀 PRÓXIMOS PASSOS:');
    console.log('1. Reinicie o servidor: npm run dev');
    console.log('2. Acesse: http://localhost:5173/jogo');
    console.log('3. Teste o sistema completo!');
    console.log('');
    console.log('🎯 FUNCIONALIDADES DISPONÍVEIS:');
    console.log('✅ Adicionar jogadores');
    console.log('✅ Sortear times automaticamente');
    console.log('✅ Partida ao vivo com placar');
    console.log('✅ Marcar gols em tempo real');
    console.log('✅ Ranking automático');
} catch (error) {
    console.error('❌ Erro ao configurar .env:', error.message);
    console.log('');
    console.log('📝 CONFIGURAÇÃO MANUAL:');
    console.log('Crie um arquivo .env na raiz com:');
    console.log(`VITE_CONVEX_URL=${convexUrl}`);
}
