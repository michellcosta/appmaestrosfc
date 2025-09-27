# 🏦 Configuração PagSeguro PIX

## 📋 Passo 1: Criar Conta no PagSeguro

### 1.1 Acessar o Portal
- Vá para: https://sandbox.pagseguro.uol.com.br/
- Clique em "Criar conta" ou faça login

### 1.2 Configurar Aplicação
1. No dashboard, vá para "Integrações"
2. Clique em "Criar aplicação"
3. Preencha os dados:
   - **Nome:** Maestros FC
   - **Descrição:** Sistema PIX para futebol amador
   - **URL de retorno:** https://maestrosfc.com.br/return
   - **URL de notificação:** https://maestrosfc.com.br/webhook

### 1.3 Obter Credenciais
Após criar a aplicação:
- **Email:** seu-email@exemplo.com
- **Token:** xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
- **App ID:** xxxxxxxxxx
- **App Key:** xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

## 📋 Passo 2: Configurar PIX

### 2.1 Habilitar PIX
1. Vá para "Configurações" → "PIX"
2. Clique em "Ativar PIX"
3. Complete a verificação de identidade
4. Configure suas chaves PIX

### 2.2 Configurar Chaves
1. Adicione chaves PIX:
   - CPF/CNPJ
   - E-mail
   - Telefone
   - Chave aleatória

## 📋 Passo 3: Configurar Webhooks

### 3.1 Configurar Notificações
1. Vá para "Integrações" → Sua aplicação
2. Configure a URL de notificação:
   - **URL:** https://seu-dominio.com/api/pix/webhook/pagseguro
   - **Eventos:** PIX, PIX_REFUND

### 3.2 Configurar Segurança
1. Gere uma chave de segurança
2. Configure validação de assinatura

## 📋 Passo 4: Configurar no App

### 4.1 Variáveis de Ambiente
```env
# PagSeguro Configuration
PIX_PROVIDER=pagseguro
PIX_EMAIL=seu-email@exemplo.com
PIX_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
PIX_APP_ID=xxxxxxxxxx
PIX_APP_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
PIX_BASE_URL=https://ws.pagseguro.uol.com.br
PIX_WEBHOOK_SECRET=sua_chave_secreta
PIX_MODE=sandbox
```

### 4.2 Configurar no Supabase
```sql
INSERT INTO pix_configurations (provider, name, config, is_active, is_sandbox, created_by)
VALUES (
  'pagseguro',
  'sandbox',
  '{
    "email": "seu-email@exemplo.com",
    "token": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    "app_id": "xxxxxxxxxx",
    "app_key": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    "base_url": "https://ws.pagseguro.uol.com.br"
  }',
  true,
  true,
  (SELECT id FROM auth.users LIMIT 1)
);
```

## 🧪 Testando

### 1. Testar Transações
1. Use as credenciais de sandbox
2. Crie transações de teste
3. Verifique se os QR Codes são gerados

### 2. Simular Pagamentos
1. Use o app PagSeguro (modo sandbox)
2. Escaneie os QR Codes
3. Complete os pagamentos de teste

## 🚀 Migrando para Produção

### 1. Configurar Produção
- Troque sandbox por produção
- Atualize URLs e credenciais
- Configure SSL obrigatório

### 2. Testar em Produção
- Faça testes com valores baixos
- Verifique todos os fluxos
