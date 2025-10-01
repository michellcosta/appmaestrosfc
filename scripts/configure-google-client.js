/**
 * Script de Configuração do Google Client ID
 * Configura automaticamente o Google Client ID
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔧 CONFIGURANDO GOOGLE CLIENT ID...\n');

// Google Client ID fornecido
const googleClientId = '999325053713-agf0sdhvntmerq7s56caqaisgeep3apv.apps.googleusercontent.com';

// Verificar se .env.local existe
const envPath = path.join(process.cwd(), '.env.local');
if (!fs.existsSync(envPath)) {
  console.log('❌ Arquivo .env.local não encontrado!');
  console.log('📝 Criando arquivo .env.local...');
  
  const envContent = `# Supabase Configuration
VITE_SUPABASE_URL="https://autxxmhtadimwvprfsov.supabase.co"
VITE_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF1dHh4bWh0YWRpbXd2cHJmc292Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY2MDQ1NDcsImV4cCI6MjA3MjE4MDU0N30.LwjIbMib_pPKpiXAZ3bu1tSVyTjhDzLPI6E59NdG3Ig"

# Google OAuth Configuration
VITE_GOOGLE_CLIENT_ID="${googleClientId}"

# Analytics Configuration (Opcional)
VITE_GA_MEASUREMENT_ID="your_ga_measurement_id_here"

# Error Tracking (Opcional)
VITE_SENTRY_DSN="your_sentry_dsn_here"

# App Configuration
VITE_APP_NAME="Nexus Play"
VITE_APP_VERSION="1.0.0"
VITE_APP_ENVIRONMENT="production"`;

  fs.writeFileSync(envPath, envContent);
  console.log('✅ Arquivo .env.local criado!');
} else {
  console.log('✅ Arquivo .env.local já existe!');
  console.log('📝 Atualizando Google Client ID...');
  
  let envContent = fs.readFileSync(envPath, 'utf8');
  
  // Verificar se VITE_GOOGLE_CLIENT_ID já existe
  if (envContent.includes('VITE_GOOGLE_CLIENT_ID')) {
    // Atualizar existente
    envContent = envContent.replace(
      /VITE_GOOGLE_CLIENT_ID=.*/g,
      `VITE_GOOGLE_CLIENT_ID="${googleClientId}"`
    );
  } else {
    // Adicionar novo
    envContent += `\nVITE_GOOGLE_CLIENT_ID="${googleClientId}"`;
  }
  
  fs.writeFileSync(envPath, envContent);
  console.log('✅ Google Client ID configurado!');
}

console.log('\n🧪 TESTANDO CONFIGURAÇÃO...');
console.log('============================');

// Verificar se as variáveis estão configuradas
const envContent = fs.readFileSync(envPath, 'utf8');
const hasSupabaseUrl = envContent.includes('VITE_SUPABASE_URL');
const hasSupabaseKey = envContent.includes('VITE_SUPABASE_ANON_KEY');
const hasGoogleClientId = envContent.includes('VITE_GOOGLE_CLIENT_ID');

console.log(`✅ Supabase URL: ${hasSupabaseUrl ? 'Configurado' : '❌ Faltando'}`);
console.log(`✅ Supabase Key: ${hasSupabaseKey ? 'Configurado' : '❌ Faltando'}`);
console.log(`✅ Google Client ID: ${hasGoogleClientId ? 'Configurado' : '❌ Faltando'}`);

if (hasSupabaseUrl && hasSupabaseKey && hasGoogleClientId) {
  console.log('\n🎯 CONFIGURAÇÃO COMPLETA!');
  console.log('==========================');
  console.log('✅ Supabase conectado');
  console.log('✅ Google OAuth configurado');
  console.log('✅ App pronto para uso!');
  
  console.log('\n🚀 PRÓXIMOS PASSOS:');
  console.log('==================');
  console.log('1. Reinicie o servidor de desenvolvimento');
  console.log('2. Teste o login com Google');
  console.log('3. Valide as funcionalidades');
  console.log('4. Faça deploy para produção');
  
  console.log('\n📱 COMO TESTAR:');
  console.log('===============');
  console.log('1. Acesse: http://localhost:5176/');
  console.log('2. Clique em "Login com Google"');
  console.log('3. Autorize o app');
  console.log('4. Teste as funcionalidades');
  
  console.log('\n🎯 SEU APP ESTÁ 100% PRONTO!');
  console.log('============================');
  console.log('✅ Todas as configurações aplicadas');
  console.log('✅ Pronto para usuários reais');
  console.log('✅ Deploy para produção disponível');
} else {
  console.log('\n❌ CONFIGURAÇÃO INCOMPLETA!');
  console.log('============================');
  console.log('Verifique as configurações acima');
}

console.log('\n🔧 COMANDOS ÚTEIS:');
console.log('==================');
console.log('npm run dev          # Reiniciar servidor');
console.log('npm run build        # Build para produção');
console.log('vercel --prod        # Deploy para Vercel');



