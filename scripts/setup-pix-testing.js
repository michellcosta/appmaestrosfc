#!/usr/bin/env node

import readline from 'readline';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.join(__dirname, '../.env');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(query) {
  return new Promise(resolve => rl.question(query, ans => resolve(ans)));
}

async function setupPixTesting() {
  console.log('\n--- 💳 Configuração PIX para Teste ---');
  console.log('Este script irá configurar o ambiente de teste para o sistema PIX.');
  console.log('Você pode usar provedores como Mercado Pago (sandbox) ou PagSeguro (sandbox) para testes.');

  console.log('\n📋 Passos para testar o PIX:');
  console.log('1. Aplicar migração no Supabase');
  console.log('2. Configurar provedor PIX (sandbox)');
  console.log('3. Testar no app');

  console.log('\n--- Passo 1: Aplicar Migração ---');
  console.log('Execute no Supabase SQL Editor:');
  console.log('📁 Arquivo: supabase/migrations/0011_pix_payment_system.sql');
  console.log('⚠️  IMPORTANTE: Execute este arquivo no Supabase antes de continuar!');

  const migrationApplied = await askQuestion('\n✅ Migração foi aplicada no Supabase? (s/n): ');
  
  if (migrationApplied.toLowerCase() !== 's') {
    console.log('\n❌ Por favor, aplique a migração primeiro!');
    rl.close();
    return;
  }

  console.log('\n--- Passo 2: Configurar Provedor PIX ---');
  console.log('Escolha um provedor para teste:');
  console.log('1. Mercado Pago (Sandbox) - Recomendado');
  console.log('2. PagSeguro (Sandbox)');
  console.log('3. Pular configuração (teste offline)');

  const providerChoice = await askQuestion('\nEscolha uma opção (1-3): ');

  let providerConfig = {};

  switch (providerChoice) {
    case '1':
      console.log('\n--- 🏦 Configuração Mercado Pago Sandbox ---');
      console.log('\n📋 ANTES DE CONTINUAR:');
      console.log('1. Acesse: https://www.mercadopago.com.br/developers');
      console.log('2. Faça login ou crie uma conta');
      console.log('3. Vá para "Suas integrações" → "Criar aplicação"');
      console.log('4. Preencha os dados da aplicação');
      console.log('5. Copie suas credenciais de TESTE (não produção!)');
      console.log('\n🔑 CREDENCIAIS NECESSÁRIAS:');
      console.log('- Access Token (TEST-xxxxx-xxxxx-xxxxx)');
      console.log('- Public Key (TEST_xxxxx-xxxxx-xxxxx)');
      
      const continueMP = await askQuestion('\n✅ Você já tem as credenciais do Mercado Pago? (s/n): ');
      
      if (continueMP.toLowerCase() !== 's') {
        console.log('\n📖 Guia completo: docs/MERCADO_PAGO_SETUP.md');
        console.log('⏳ Configure suas credenciais e execute o script novamente.');
        rl.close();
        return;
      }
      
      const mpAccessToken = await askQuestion('\n🔑 Mercado Pago Access Token (TEST-...): ');
      const mpPublicKey = await askQuestion('🔑 Mercado Pago Public Key (TEST-...): ');
      
      if (!mpAccessToken.startsWith('TEST-') || !mpPublicKey.startsWith('TEST_')) {
        console.log('\n⚠️  ATENÇÃO: Use apenas credenciais de TESTE (que começam com TEST-)');
        console.log('❌ Credenciais de produção podem gerar cobranças reais!');
      }
      
      providerConfig = {
        provider: 'mercadopago',
        access_token: mpAccessToken,
        public_key: mpPublicKey,
        base_url: 'https://api.mercadopago.com',
        webhook_secret: 'test_webhook_secret_' + Date.now()
      };
      break;

    case '2':
      console.log('\n--- Configuração PagSeguro Sandbox ---');
      console.log('1. Acesse: https://sandbox.pagseguro.uol.com.br/');
      console.log('2. Crie uma conta de sandbox');
      console.log('3. Obtenha Email e Token de teste');
      
      const psEmail = await askQuestion('\nPagSeguro Email: ');
      const psToken = await askQuestion('PagSeguro Token: ');
      
      providerConfig = {
        provider: 'pagseguro',
        email: psEmail,
        token: psToken,
        base_url: 'https://ws.pagseguro.uol.com.br',
        app_id: 'test_app_id',
        app_key: 'test_app_key'
      };
      break;

    default:
      console.log('\n⚠️  Configuração de provedor pulada. Sistema funcionará em modo offline.');
      providerConfig = {
        provider: 'offline',
        mode: 'test'
      };
  }

  console.log('\n--- Passo 3: Configurar Variáveis de Ambiente ---');
  
  let envContent = '';
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');
  }

  // Adicionar configurações PIX
  const pixConfig = `
# PIX Configuration
PIX_PROVIDER=${providerConfig.provider}
PIX_ACCESS_TOKEN=${providerConfig.access_token || ''}
PIX_PUBLIC_KEY=${providerConfig.public_key || ''}
PIX_EMAIL=${providerConfig.email || ''}
PIX_TOKEN=${providerConfig.token || ''}
PIX_BASE_URL=${providerConfig.base_url || ''}
PIX_WEBHOOK_SECRET=${providerConfig.webhook_secret || ''}
PIX_MODE=${providerConfig.provider === 'offline' ? 'test' : 'sandbox'}
`;

  // Remover configurações PIX existentes
  const lines = envContent.split('\n');
  const filteredLines = lines.filter(line => !line.startsWith('# PIX') && !line.startsWith('PIX_'));
  
  // Adicionar novas configurações
  const newEnvContent = filteredLines.join('\n') + pixConfig;

  fs.writeFileSync(envPath, newEnvContent);
  console.log('✅ Variáveis de ambiente PIX configuradas no .env');

  console.log('\n--- Passo 4: Instruções de Teste ---');
  console.log('\n🧪 Como testar o PIX:');
  console.log('1. Inicie o servidor: npm run dev');
  console.log('2. Acesse: http://localhost:5173');
  console.log('3. Faça login no app');
  console.log('4. Vá para a página Finance (/finance)');
  console.log('5. Clique em "Testar PIX Avançado"');
  console.log('6. Teste as funcionalidades:');
  console.log('   - Criar pagamento PIX');
  console.log('   - Gerar QR Code');
  console.log('   - Fazer depósito');
  console.log('   - Solicitar saque');
  console.log('   - Gerenciar chaves PIX');

  console.log('\n📱 Funcionalidades disponíveis:');
  console.log('✅ Criação de transações PIX');
  console.log('✅ Geração de QR Codes');
  console.log('✅ Cópia de códigos PIX');
  console.log('✅ Gerenciamento de chaves PIX');
  console.log('✅ Histórico de transações');
  console.log('✅ Sistema de depósito/saque');

  if (providerConfig.provider !== 'offline') {
    console.log('\n🔗 Para integração real:');
    console.log('1. Configure webhooks no provedor');
    console.log('2. Teste pagamentos reais (sandbox)');
    console.log('3. Configure produção quando estiver pronto');
  }

  console.log('\n--- 🎉 Configuração PIX Concluída! ---');
  console.log('Reinicie o servidor (npm run dev) para aplicar as configurações.');
  
  rl.close();
}

setupPixTesting().catch(console.error);
