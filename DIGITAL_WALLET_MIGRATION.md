# Migração para Sistema de Carteira Digital

## Visão Geral

Este documento descreve a migração do sistema de créditos para um sistema de carteira digital com valores em reais brasileiros (BRL), incluindo integração com PIX para recarga e saque.

## Principais Mudanças

### 1. Estrutura do Banco de Dados

#### Nova Tabela: `digital_wallets`
```sql
CREATE TABLE digital_wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  balance_brl DECIMAL(10,2) DEFAULT 0.00,
  total_received_brl DECIMAL(10,2) DEFAULT 0.00,
  total_spent_brl DECIMAL(10,2) DEFAULT 0.00,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'blocked')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Nova Tabela: `wallet_transactions`
```sql
CREATE TABLE wallet_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id UUID NOT NULL REFERENCES digital_wallets(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('deposit', 'withdrawal', 'payment', 'refund', 'transfer')),
  amount_brl DECIMAL(10,2) NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Nova Tabela: `payment_options`
```sql
CREATE TABLE payment_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  amount_brl DECIMAL(10,2) NOT NULL,
  category TEXT DEFAULT 'service',
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Nova Tabela: `withdrawal_requests`
```sql
CREATE TABLE withdrawal_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id UUID NOT NULL REFERENCES digital_wallets(id) ON DELETE CASCADE,
  amount_brl DECIMAL(10,2) NOT NULL,
  pix_key TEXT NOT NULL,
  pix_key_type TEXT NOT NULL CHECK (pix_key_type IN ('cpf', 'cnpj', 'email', 'phone', 'random')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 2. Funções Supabase

#### Nova Função: `manageDigitalWallet`
- **Localização**: `supabase/functions/manageDigitalWallet/index.ts`
- **Funcionalidades**:
  - Criar carteira digital
  - Buscar dados da carteira
  - Processar transações
  - Adicionar dinheiro via PIX
  - Solicitar saques
  - Transferir dinheiro entre carteiras

### 3. Componentes React Atualizados

#### Hook: `useDigitalWallet`
- **Localização**: `src/hooks/useDigitalWallet.ts`
- **Funcionalidades**:
  - Gerenciamento de estado da carteira
  - Integração com a função Supabase
  - Formatação de valores em BRL
  - Operações de transação

#### Componente: `WalletWithdrawal`
- **Localização**: `src/components/WalletWithdrawal.tsx`
- **Mudanças**:
  - Interface atualizada para valores em reais
  - Integração com PIX
  - Exibição de transações e saques

#### Componente: `PixIntegration`
- **Localização**: `src/components/PixIntegration.tsx`
- **Funcionalidades**:
  - Interface para recarga via PIX
  - Solicitação de saques
  - Validação de chaves PIX
  - Polling de status de transações

#### Componente: `PaymentButton`
- **Localização**: `src/components/PaymentButton.tsx`
- **Mudanças**:
  - Opção de pagamento via carteira digital
  - Fallback para PIX quando saldo insuficiente
  - Interface atualizada

#### Página: `Finance`
- **Localização**: `src/pages/Finance.tsx`
- **Mudanças**:
  - Nova aba "Carteira Digital"
  - Integração com o novo sistema
  - Exibição de transações recentes

### 4. Script de Migração

#### Arquivo: `0008_migrate_credits_to_wallet.sql`
- **Localização**: `supabase/migrations/`
- **Funcionalidades**:
  - Migração de créditos existentes para saldo em reais
  - Conversão de taxa: 1 crédito = R$ 1,00
  - Preservação do histórico de transações

## Como Usar o Novo Sistema

### 1. Carteira Digital
- Acesse a página Finance
- Clique na aba "Carteira Digital"
- Visualize seu saldo em reais

### 2. Adicionar Dinheiro
- Clique em "Adicionar Dinheiro"
- Digite o valor desejado
- Será gerado um QR Code PIX para pagamento
- O saldo será atualizado automaticamente após confirmação

### 3. Solicitar Saque
- Clique em "Solicitar Saque"
- Digite o valor e sua chave PIX
- A solicitação será processada em até 24h

### 4. Realizar Pagamentos
- Use o PaymentButton em qualquer lugar do sistema
- Escolha entre pagamento via carteira ou PIX
- Se o saldo for insuficiente, será oferecida a opção PIX

## Configurações Necessárias

### 1. Variáveis de Ambiente
```env
# PIX Integration (exemplo com provedor)
PIX_PROVIDER_API_KEY=your_api_key
PIX_PROVIDER_BASE_URL=https://api.provider.com
PIX_WEBHOOK_SECRET=your_webhook_secret
```

### 2. Políticas RLS (Row Level Security)
As tabelas incluem políticas RLS para garantir que usuários só acessem seus próprios dados.

### 3. Triggers e Funções
- Trigger para atualizar `updated_at` automaticamente
- Função para calcular totais da carteira
- Validações de saldo antes de transações

## Testes Recomendados

### 1. Testes de Unidade
- [ ] Validação de valores monetários
- [ ] Formatação de moeda
- [ ] Validação de chaves PIX

### 2. Testes de Integração
- [ ] Criação de carteira
- [ ] Processamento de transações
- [ ] Integração PIX
- [ ] Atualização de saldos

### 3. Testes de Interface
- [ ] Navegação entre abas
- [ ] Formulários de recarga e saque
- [ ] Exibição de valores
- [ ] Responsividade

## Rollback

Em caso de necessidade de rollback:

1. Execute o script de rollback (a ser criado)
2. Restaure os componentes anteriores
3. Reverta as migrações do banco

## Suporte

Para dúvidas ou problemas:
- Verifique os logs do Supabase
- Consulte a documentação da API PIX
- Teste em ambiente de desenvolvimento primeiro

---

**Data da Migração**: Janeiro 2025
**Versão**: 2.0.0
**Status**: Implementado