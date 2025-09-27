# 🏦 Configuração Mercado Pago PIX

## 📋 Passo 1: Criar Conta de Desenvolvedor

### 1.1 Acessar o Portal
- Vá para: https://www.mercadopago.com.br/developers
- Clique em "Criar conta" ou faça login

### 1.2 Criar Aplicação
1. No dashboard, clique em "Suas integrações"
2. Clique em "Criar aplicação"
3. Preencha os dados:
   - **Nome da aplicação:** Maestros FC
   - **Descrição:** Sistema de pagamentos PIX para futebol amador
   - **Categoria:** Serviços
   - **Site:** https://maestrosfc.com.br (ou seu domínio)

### 1.3 Obter Credenciais
Após criar a aplicação, você terá acesso a:
- **Access Token (Produção):** APP-USR-xxxxx-xxxxx-xxxxx
- **Public Key (Produção):** APP_USR_xxxxx-xxxxx-xxxxx
- **Access Token (Teste):** TEST-xxxxx-xxxxx-xxxxx
- **Public Key (Teste):** TEST_xxxxx-xxxxx-xxxxx

## 📋 Passo 2: Configurar PIX

### 2.1 Habilitar PIX
1. No dashboard, vá para "Suas integrações"
2. Selecione sua aplicação
3. Vá para "Configurações" → "PIX"
4. Clique em "Ativar PIX"
5. Siga o processo de verificação

### 2.2 Configurar Chaves PIX
1. Vá para "Configurações" → "PIX"
2. Clique em "Gerenciar chaves PIX"
3. Adicione suas chaves PIX:
   - CPF/CNPJ
   - E-mail
   - Telefone
   - Chave aleatória

## 📋 Passo 3: Configurar Webhooks

### 3.1 Criar Webhook
1. Vá para "Suas integrações" → Sua aplicação
2. Clique em "Webhooks"
3. Clique em "Adicionar webhook"
4. Configure:
   - **URL:** https://seu-dominio.com/api/pix/webhook/mercadopago
   - **Eventos:** payment, payment.updated
   - **Versão da API:** v1

### 3.2 Configurar Segurança
1. Gere uma chave secreta para o webhook
2. Salve a chave para usar na validação

## 📋 Passo 4: Testar em Sandbox

### 4.1 Usar Credenciais de Teste
- Use o **Access Token de teste** (TEST-xxxxx)
- Use a **Public Key de teste** (TEST_xxxxx)

### 4.2 Testar Pagamentos
1. Crie transações PIX de teste
2. Use os dados de teste do Mercado Pago
3. Verifique se os webhooks estão funcionando

## 📋 Passo 5: Configurar no App

### 5.1 Variáveis de Ambiente
Adicione ao arquivo `.env`:
```env
# Mercado Pago Configuration
PIX_PROVIDER=mercadopago
PIX_ACCESS_TOKEN=TEST-xxxxx-xxxxx-xxxxx
PIX_PUBLIC_KEY=TEST_xxxxx-xxxxx-xxxxx
PIX_BASE_URL=https://api.mercadopago.com
PIX_WEBHOOK_SECRET=sua_chave_secreta
PIX_MODE=sandbox
```

### 5.2 Configurar no Supabase
Execute no SQL Editor do Supabase:
```sql
INSERT INTO pix_configurations (provider, name, config, is_active, is_sandbox, created_by)
VALUES (
  'mercadopago',
  'sandbox',
  '{
    "access_token": "TEST-xxxxx-xxxxx-xxxxx",
    "public_key": "TEST_xxxxx-xxxxx-xxxxx",
    "webhook_secret": "sua_chave_secreta",
    "base_url": "https://api.mercadopago.com"
  }',
  true,
  true,
  (SELECT id FROM auth.users LIMIT 1)
);
```

## 🧪 Testando o Sistema

### 1. Criar Transação de Teste
```bash
# Use o script de configuração
npm run setup:pix
```

### 2. Testar no App
1. Acesse: http://localhost:5173
2. Vá para: Finance → Testar PIX Avançado
3. Crie um pagamento de teste
4. Verifique se o QR Code é gerado

### 3. Simular Pagamento
1. Use o app do Mercado Pago (modo teste)
2. Escaneie o QR Code gerado
3. Complete o pagamento
4. Verifique se o webhook é recebido

## 🚀 Migrando para Produção

### 1. Substituir Credenciais
- Troque as credenciais de teste pelas de produção
- Atualize as variáveis de ambiente

### 2. Configurar Webhook de Produção
- Atualize a URL do webhook para o domínio de produção
- Configure SSL/HTTPS obrigatório

### 3. Testar em Produção
- Faça testes com valores baixos
- Verifique todos os fluxos de pagamento

## 📞 Suporte

- **Documentação:** https://www.mercadopago.com.br/developers/pt/docs
- **Suporte:** https://www.mercadopago.com.br/developers/pt/support
- **Status:** https://status.mercadopago.com.br/
