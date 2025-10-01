/**
 * Script de Configuração de Keys
 * Configura as keys automaticamente no .env.local
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔧 CONFIGURANDO KEYS DO NEXUS PLAY\n');

// Função para atualizar .env.local
function updateEnvFile(key, value) {
  const envPath = path.join(process.cwd(), '.env.local');
  let envContent = '';
  
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');
  }
  
  // Verificar se a key já existe
  const keyRegex = new RegExp(`^${key}=.*$`, 'm');
  if (keyRegex.test(envContent)) {
    // Atualizar key existente
    envContent = envContent.replace(keyRegex, `${key}="${value}"`);
  } else {
    // Adicionar nova key
    envContent += `\n${key}="${value}"`;
  }
  
  fs.writeFileSync(envPath, envContent);
  console.log(`✅ ${key} configurado!`);
}

// Função para testar conexão
async function testConnection() {
  console.log('\n🧪 TESTANDO CONEXÕES...');
  console.log('======================');
  
  // Testar Supabase
  try {
    const { createClient } = await import('@supabase/supabase-js');
    const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://autxxmhtadimwvprfsov.supabase.co';
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF1dHh4bWh0YWRpbXd2cHJmc292Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY2MDQ1NDcsImV4cCI6MjA3MjE4MDU0N30.LwjIbMib_pPKpiXAZ3bu1tSVyTjhDzLPI6E59NdG3Ig';
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data, error } = await supabase.from('profiles').select('count').limit(1);
    
    if (error) {
      console.log('❌ Erro na conexão Supabase:', error.message);
    } else {
      console.log('✅ Supabase conectado com sucesso!');
    }
  } catch (error) {
    console.log('❌ Erro ao testar Supabase:', error.message);
  }
  
  // Testar Google OAuth
  const googleClientId = process.env.VITE_GOOGLE_CLIENT_ID;
  if (googleClientId && googleClientId !== 'your_google_client_id_here') {
    console.log('✅ Google OAuth configurado!');
  } else {
    console.log('❌ Google OAuth não configurado!');
  }
}

// Função principal
async function main() {
  console.log('📝 CONFIGURANDO KEYS...');
  console.log('========================');
  
  // Aguardar input do usuário
  console.log('\n🔑 Cole suas keys aqui:');
  console.log('======================');
  console.log('1. VITE_GOOGLE_CLIENT_ID (Client ID do Google OAuth)');
  console.log('2. VITE_GA_MEASUREMENT_ID (Opcional - Google Analytics)');
  console.log('3. VITE_SENTRY_DSN (Opcional - Error tracking)');
  
  console.log('\n💡 COMO USAR:');
  console.log('=============');
  console.log('1. Cole cada key quando eu pedir');
  console.log('2. Vou configurar automaticamente');
  console.log('3. Testaremos as conexões');
  
  console.log('\n🚀 VAMOS COMEÇAR!');
  console.log('================');
  console.log('Cole a primeira key: VITE_GOOGLE_CLIENT_ID');
}

// Executar
main().catch(console.error);



