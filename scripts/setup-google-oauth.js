#!/usr/bin/env node

/**
 * Script para configurar Google OAuth automaticamente
 * Gera instruções detalhadas e verifica configurações
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Verifica se as variáveis de ambiente estão configuradas
 */
function checkEnvironmentVariables() {
  console.log('🔍 Verificando variáveis de ambiente...\n');
  
  const requiredVars = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY',
    'VITE_GOOGLE_CLIENT_ID',
    'VITE_GOOGLE_CLIENT_SECRET'
  ];
  
  const missingVars = [];
  
  // Verificar se arquivo .env existe
  const envPath = path.join(__dirname, '../.env');
  if (!fs.existsSync(envPath)) {
    console.log('❌ Arquivo .env não encontrado');
    console.log('📝 Criando arquivo .env.example...\n');
    
    const envExample = `# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Google OAuth Configuration
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_GOOGLE_CLIENT_SECRET=your_google_client_secret

# Optional: Supabase Functions
VITE_SUPABASE_FUNCTIONS_URL=https://your-project-ref.functions.supabase.co
`;
    
    fs.writeFileSync(path.join(__dirname, '../.env.example'), envExample);
    console.log('✅ Arquivo .env.example criado');
    console.log('📋 Copie para .env e preencha com seus dados\n');
    
    return false;
  }
  
  // Ler arquivo .env
  const envContent = fs.readFileSync(envPath, 'utf8');
  
  requiredVars.forEach(varName => {
    if (!envContent.includes(varName) || envContent.includes(`${varName}=your_`)) {
      missingVars.push(varName);
    }
  });
  
  if (missingVars.length > 0) {
    console.log('❌ Variáveis de ambiente faltando:');
    missingVars.forEach(varName => {
      console.log(`   - ${varName}`);
    });
    console.log('');
    return false;
  }
  
  console.log('✅ Todas as variáveis de ambiente estão configuradas\n');
  return true;
}

/**
 * Gera instruções para configurar Google OAuth
 */
function generateGoogleOAuthInstructions() {
  console.log('🔧 INSTRUÇÕES PARA CONFIGURAR GOOGLE OAUTH:\n');
  
  console.log('1️⃣ Acesse o Google Cloud Console:');
  console.log('   https://console.cloud.google.com/\n');
  
  console.log('2️⃣ Crie um novo projeto ou selecione um existente\n');
  
  console.log('3️⃣ Ative a Google+ API:');
  console.log('   - Vá para "APIs & Services" > "Library"');
  console.log('   - Procure por "Google+ API"');
  console.log('   - Clique em "Enable"\n');
  
  console.log('4️⃣ Configure OAuth 2.0:');
  console.log('   - Vá para "APIs & Services" > "Credentials"');
  console.log('   - Clique em "Create Credentials" > "OAuth 2.0 Client IDs"');
  console.log('   - Selecione "Web application"\n');
  
  console.log('5️⃣ Configure as URLs autorizadas:');
  console.log('   - Authorized JavaScript origins:');
  console.log('     * http://localhost:5173');
  console.log('     * https://your-app.vercel.app');
  console.log('     * https://your-project-ref.supabase.co');
  console.log('');
  console.log('   - Authorized redirect URIs:');
  console.log('     * http://localhost:5173/auth/callback');
  console.log('     * https://your-project-ref.supabase.co/auth/v1/callback\n');
  
  console.log('6️⃣ Copie Client ID e Client Secret para o arquivo .env\n');
}

/**
 * Gera instruções para configurar Supabase
 */
function generateSupabaseInstructions() {
  console.log('🔧 INSTRUÇÕES PARA CONFIGURAR SUPABASE:\n');
  
  console.log('1️⃣ Acesse o Supabase Dashboard:');
  console.log('   https://supabase.com/dashboard\n');
  
  console.log('2️⃣ Selecione seu projeto\n');
  
  console.log('3️⃣ Configure Google OAuth:');
  console.log('   - Vá para "Authentication" > "Providers"');
  console.log('   - Encontre "Google" e clique em "Enable"');
  console.log('   - Cole o Client ID e Client Secret do Google');
  console.log('   - Salve as configurações\n');
  
  console.log('4️⃣ Configure Site URL:');
  console.log('   - Vá para "Authentication" > "URL Configuration"');
  console.log('   - Site URL: https://your-app.vercel.app');
  console.log('   - Redirect URLs:');
  console.log('     * http://localhost:5173/**');
  console.log('     * https://your-app.vercel.app/**\n');
}

/**
 * Verifica configurações do Supabase
 */
async function checkSupabaseConfig() {
  console.log('🔍 Verificando configuração do Supabase...\n');
  
  try {
    // Verificar se as variáveis estão definidas
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      console.log('❌ Variáveis do Supabase não configuradas');
      return false;
    }
    
    console.log('✅ Variáveis do Supabase configuradas');
    console.log(`   URL: ${supabaseUrl}`);
    console.log(`   Key: ${supabaseKey.substring(0, 20)}...\n`);
    
    return true;
  } catch (error) {
    console.error('❌ Erro ao verificar Supabase:', error);
    return false;
  }
}

/**
 * Gera arquivo de configuração para deploy
 */
function generateDeployConfig() {
  console.log('📝 Gerando configuração para deploy...\n');
  
  const deployConfig = {
    vercel: {
      env: {
        VITE_SUPABASE_URL: 'your_supabase_project_url',
        VITE_SUPABASE_ANON_KEY: 'your_supabase_anon_key',
        VITE_GOOGLE_CLIENT_ID: 'your_google_client_id',
        VITE_GOOGLE_CLIENT_SECRET: 'your_google_client_secret'
      }
    },
    netlify: {
      env: {
        VITE_SUPABASE_URL: 'your_supabase_project_url',
        VITE_SUPABASE_ANON_KEY: 'your_supabase_anon_key',
        VITE_GOOGLE_CLIENT_ID: 'your_google_client_id',
        VITE_GOOGLE_CLIENT_SECRET: 'your_google_client_secret'
      }
    }
  };
  
  const configPath = path.join(__dirname, '../deploy-config.json');
  fs.writeFileSync(configPath, JSON.stringify(deployConfig, null, 2));
  
  console.log('✅ Arquivo deploy-config.json criado');
  console.log('📋 Use este arquivo para configurar variáveis de ambiente no deploy\n');
}

/**
 * Executa todas as verificações
 */
async function runSetup() {
  console.log('🚀 CONFIGURAÇÃO GOOGLE OAUTH - MAESTROS FC\n');
  console.log('=' .repeat(50));
  
  const envOk = checkEnvironmentVariables();
  const supabaseOk = await checkSupabaseConfig();
  
  if (!envOk || !supabaseOk) {
    console.log('❌ Configuração incompleta detectada\n');
    generateGoogleOAuthInstructions();
    generateSupabaseInstructions();
    generateDeployConfig();
    
    console.log('📋 PRÓXIMOS PASSOS:');
    console.log('1. Configure o Google OAuth seguindo as instruções acima');
    console.log('2. Configure o Supabase seguindo as instruções acima');
    console.log('3. Execute este script novamente para verificar');
    console.log('4. Teste o login com Google localmente');
    console.log('5. Faça deploy com as variáveis configuradas\n');
    
    return;
  }
  
  console.log('✅ Configuração completa!');
  console.log('🎉 Google OAuth está pronto para uso\n');
  
  console.log('🧪 TESTE RECOMENDADO:');
  console.log('1. Execute: npm run dev');
  console.log('2. Acesse: http://localhost:5173');
  console.log('3. Teste o login com Google');
  console.log('4. Verifique se o usuário é criado no Supabase\n');
}

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  runSetup().catch(console.error);
}

export { runSetup, checkEnvironmentVariables, generateGoogleOAuthInstructions };
