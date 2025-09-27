-- Migration: Sistema PIX Completo
-- Data: 2025-01-27
-- Descrição: Sistema completo de pagamentos PIX com integração real

-- Tabela para transações PIX
CREATE TABLE IF NOT EXISTS pix_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  external_id VARCHAR(100) UNIQUE NOT NULL,
  wallet_id UUID REFERENCES digital_wallets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('payment', 'deposit', 'withdrawal')),
  amount_brl DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled', 'expired')),
  pix_key TEXT,
  pix_key_type TEXT CHECK (pix_key_type IN ('cpf', 'cnpj', 'email', 'phone', 'random')),
  qr_code TEXT,
  qr_code_image TEXT,
  txid VARCHAR(100),
  end_to_end_id VARCHAR(100),
  description TEXT,
  metadata JSONB DEFAULT '{}',
  provider_response JSONB,
  expires_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela para webhooks PIX
CREATE TABLE IF NOT EXISTS pix_webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider TEXT NOT NULL CHECK (provider IN ('mercadopago', 'pagseguro', 'asaas', 'gerencianet')),
  event_type TEXT NOT NULL,
  transaction_id VARCHAR(100),
  external_id VARCHAR(100),
  payload JSONB NOT NULL,
  signature TEXT,
  processed BOOLEAN DEFAULT FALSE,
  processing_attempts INTEGER DEFAULT 0,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE
);

-- Tabela para configurações PIX
CREATE TABLE IF NOT EXISTS pix_configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider TEXT NOT NULL CHECK (provider IN ('mercadopago', 'pagseguro', 'asaas', 'gerencianet')),
  name VARCHAR(100) NOT NULL,
  config JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  is_sandbox BOOLEAN DEFAULT FALSE,
  webhook_url TEXT,
  webhook_secret TEXT,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(provider, name)
);

-- Tabela para chaves PIX dos usuários
CREATE TABLE IF NOT EXISTS user_pix_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pix_key TEXT NOT NULL,
  pix_key_type TEXT NOT NULL CHECK (pix_key_type IN ('cpf', 'cnpj', 'email', 'phone', 'random')),
  is_verified BOOLEAN DEFAULT FALSE,
  is_primary BOOLEAN DEFAULT FALSE,
  verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, pix_key)
);

-- Tabela para histórico de pagamentos
CREATE TABLE IF NOT EXISTS payment_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  match_id UUID REFERENCES matches(id) ON DELETE SET NULL,
  transaction_id UUID REFERENCES pix_transactions(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('mensalista', 'diarista', 'fine', 'bonus', 'refund')),
  amount_brl DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  description TEXT,
  reference_period TEXT, -- Para mensalistas: "2025-01"
  reference_match_id UUID REFERENCES matches(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_pix_transactions_external_id ON pix_transactions(external_id);
CREATE INDEX IF NOT EXISTS idx_pix_transactions_user_id ON pix_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_pix_transactions_status ON pix_transactions(status);
CREATE INDEX IF NOT EXISTS idx_pix_transactions_type ON pix_transactions(type);
CREATE INDEX IF NOT EXISTS idx_pix_transactions_created_at ON pix_transactions(created_at);

CREATE INDEX IF NOT EXISTS idx_pix_webhooks_provider ON pix_webhooks(provider);
CREATE INDEX IF NOT EXISTS idx_pix_webhooks_transaction_id ON pix_webhooks(transaction_id);
CREATE INDEX IF NOT EXISTS idx_pix_webhooks_processed ON pix_webhooks(processed);
CREATE INDEX IF NOT EXISTS idx_pix_webhooks_created_at ON pix_webhooks(created_at);

CREATE INDEX IF NOT EXISTS idx_pix_configurations_provider ON pix_configurations(provider);
CREATE INDEX IF NOT EXISTS idx_pix_configurations_active ON pix_configurations(is_active);

CREATE INDEX IF NOT EXISTS idx_user_pix_keys_user_id ON user_pix_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_user_pix_keys_verified ON user_pix_keys(is_verified);

CREATE INDEX IF NOT EXISTS idx_payment_history_user_id ON payment_history(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_history_match_id ON payment_history(match_id);
CREATE INDEX IF NOT EXISTS idx_payment_history_type ON payment_history(type);
CREATE INDEX IF NOT EXISTS idx_payment_history_status ON payment_history(status);

-- RLS (Row Level Security)
ALTER TABLE pix_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE pix_webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE pix_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_pix_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_history ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para pix_transactions
CREATE POLICY "Users can view their own pix transactions" ON pix_transactions
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Staff can view all pix transactions" ON pix_transactions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles up 
      WHERE up.user_id = auth.uid() 
      AND up.role IN ('owner', 'admin', 'aux')
    )
  );

CREATE POLICY "Users can create their own pix transactions" ON pix_transactions
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "System can update pix transactions" ON pix_transactions
  FOR UPDATE USING (true);

-- Políticas RLS para pix_webhooks
CREATE POLICY "Staff can view pix webhooks" ON pix_webhooks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles up 
      WHERE up.user_id = auth.uid() 
      AND up.role IN ('owner', 'admin', 'aux')
    )
  );

CREATE POLICY "System can manage pix webhooks" ON pix_webhooks
  FOR ALL USING (true);

-- Políticas RLS para pix_configurations
CREATE POLICY "Staff can manage pix configurations" ON pix_configurations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles up 
      WHERE up.user_id = auth.uid() 
      AND up.role IN ('owner', 'admin', 'aux')
    )
  );

-- Políticas RLS para user_pix_keys
CREATE POLICY "Users can manage their own pix keys" ON user_pix_keys
  FOR ALL USING (user_id = auth.uid());

-- Políticas RLS para payment_history
CREATE POLICY "Users can view their own payment history" ON payment_history
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Staff can view all payment history" ON payment_history
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles up 
      WHERE up.user_id = auth.uid() 
      AND up.role IN ('owner', 'admin', 'aux')
    )
  );

CREATE POLICY "System can manage payment history" ON payment_history
  FOR ALL USING (true);

-- Função para criar transação PIX
CREATE OR REPLACE FUNCTION create_pix_transaction(
  p_user_id UUID,
  p_type TEXT,
  p_amount_brl DECIMAL,
  p_pix_key TEXT DEFAULT NULL,
  p_pix_key_type TEXT DEFAULT NULL,
  p_description TEXT DEFAULT NULL,
  p_expires_in_hours INTEGER DEFAULT 24
)
RETURNS UUID AS $$
DECLARE
  transaction_id UUID;
  external_id TEXT;
  expires_at TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Gerar ID externo único
  external_id := 'PIX_' || EXTRACT(EPOCH FROM NOW())::TEXT || '_' || SUBSTR(MD5(RANDOM()::TEXT), 1, 8);
  
  -- Calcular expiração
  expires_at := NOW() + (p_expires_in_hours || ' hours')::INTERVAL;
  
  -- Criar transação
  INSERT INTO pix_transactions (
    external_id,
    user_id,
    type,
    amount_brl,
    pix_key,
    pix_key_type,
    description,
    expires_at
  ) VALUES (
    external_id,
    p_user_id,
    p_type,
    p_amount_brl,
    p_pix_key,
    p_pix_key_type,
    p_description,
    expires_at
  ) RETURNING id INTO transaction_id;
  
  RETURN transaction_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para processar webhook PIX
CREATE OR REPLACE FUNCTION process_pix_webhook(
  p_provider TEXT,
  p_event_type TEXT,
  p_payload JSONB,
  p_signature TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  webhook_id UUID;
  transaction_external_id TEXT;
  transaction_id UUID;
BEGIN
  -- Criar registro do webhook
  INSERT INTO pix_webhooks (
    provider,
    event_type,
    payload,
    signature
  ) VALUES (
    p_provider,
    p_event_type,
    p_payload,
    p_signature
  ) RETURNING id INTO webhook_id;
  
  -- Extrair external_id do payload
  transaction_external_id := p_payload->>'external_id';
  
  IF transaction_external_id IS NOT NULL THEN
    -- Buscar transação relacionada
    SELECT id INTO transaction_id 
    FROM pix_transactions 
    WHERE external_id = transaction_external_id;
    
    -- Atualizar webhook com transaction_id
    UPDATE pix_webhooks 
    SET transaction_id = transaction_id
    WHERE id = webhook_id;
  END IF;
  
  RETURN webhook_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para atualizar status da transação
CREATE OR REPLACE FUNCTION update_pix_transaction_status(
  p_transaction_id UUID,
  p_status TEXT,
  p_provider_data JSONB DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  UPDATE pix_transactions 
  SET 
    status = p_status,
    provider_response = COALESCE(p_provider_data, provider_response),
    updated_at = NOW(),
    completed_at = CASE WHEN p_status = 'completed' THEN NOW() ELSE completed_at END
  WHERE id = p_transaction_id;
  
  -- Se transação foi completada, atualizar carteira
  IF p_status = 'completed' THEN
    PERFORM update_wallet_balance(p_transaction_id);
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para atualizar saldo da carteira
CREATE OR REPLACE FUNCTION update_wallet_balance(p_transaction_id UUID)
RETURNS VOID AS $$
DECLARE
  txn RECORD;
  wallet_id UUID;
BEGIN
  -- Buscar dados da transação
  SELECT * INTO txn FROM pix_transactions WHERE id = p_transaction_id;
  
  IF txn.wallet_id IS NULL THEN
    -- Buscar carteira do usuário
    SELECT id INTO wallet_id 
    FROM digital_wallets 
    WHERE responsible_user_id = txn.user_id AND is_active = true;
    
    -- Atualizar transação com wallet_id
    UPDATE pix_transactions 
    SET wallet_id = wallet_id 
    WHERE id = p_transaction_id;
  ELSE
    wallet_id := txn.wallet_id;
  END IF;
  
  -- Atualizar saldo baseado no tipo de transação
  IF txn.type = 'deposit' THEN
    UPDATE digital_wallets 
    SET 
      balance_brl = balance_brl + txn.amount_brl,
      total_received_brl = total_received_brl + txn.amount_brl,
      updated_at = NOW()
    WHERE id = wallet_id;
    
  ELSIF txn.type = 'withdrawal' THEN
    UPDATE digital_wallets 
    SET 
      balance_brl = balance_brl - txn.amount_brl,
      total_spent_brl = total_spent_brl + txn.amount_brl,
      updated_at = NOW()
    WHERE id = wallet_id;
    
  ELSIF txn.type = 'payment' THEN
    UPDATE digital_wallets 
    SET 
      balance_brl = balance_brl - txn.amount_brl,
      total_spent_brl = total_spent_brl + txn.amount_brl,
      updated_at = NOW()
    WHERE id = wallet_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para validar chave PIX
CREATE OR REPLACE FUNCTION validate_pix_key(p_pix_key TEXT, p_pix_key_type TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  CASE p_pix_key_type
    WHEN 'cpf' THEN
      RETURN LENGTH(p_pix_key) = 11 AND p_pix_key ~ '^[0-9]+$';
    WHEN 'cnpj' THEN
      RETURN LENGTH(p_pix_key) = 14 AND p_pix_key ~ '^[0-9]+$';
    WHEN 'email' THEN
      RETURN p_pix_key ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$';
    WHEN 'phone' THEN
      RETURN LENGTH(p_pix_key) >= 10 AND LENGTH(p_pix_key) <= 13 AND p_pix_key ~ '^[0-9]+$';
    WHEN 'random' THEN
      RETURN LENGTH(p_pix_key) = 32 AND p_pix_key ~ '^[a-f0-9-]+$';
    ELSE
      RETURN FALSE;
  END CASE;
END;
$$ LANGUAGE plpgsql;

-- Triggers para atualizar updated_at
CREATE TRIGGER update_pix_transactions_updated_at
  BEFORE UPDATE ON pix_transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pix_configurations_updated_at
  BEFORE UPDATE ON pix_configurations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_pix_keys_updated_at
  BEFORE UPDATE ON user_pix_keys
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Inserir configurações padrão
INSERT INTO pix_configurations (provider, name, config, is_active, is_sandbox, created_by) VALUES
(
  'mercadopago',
  'production',
  '{
    "access_token": "",
    "public_key": "",
    "webhook_secret": "",
    "base_url": "https://api.mercadopago.com"
  }',
  false,
  false,
  (SELECT id FROM auth.users LIMIT 1)
),
(
  'mercadopago',
  'sandbox',
  '{
    "access_token": "",
    "public_key": "",
    "webhook_secret": "",
    "base_url": "https://api.mercadopago.com"
  }',
  false,
  true,
  (SELECT id FROM auth.users LIMIT 1)
),
(
  'pagseguro',
  'production',
  '{
    "email": "",
    "token": "",
    "app_id": "",
    "app_key": "",
    "base_url": "https://ws.pagseguro.uol.com.br"
  }',
  false,
  false,
  (SELECT id FROM auth.users LIMIT 1)
);

-- Comentários nas tabelas
COMMENT ON TABLE pix_transactions IS 'Transações PIX com integração real de provedores';
COMMENT ON TABLE pix_webhooks IS 'Webhooks recebidos dos provedores PIX';
COMMENT ON TABLE pix_configurations IS 'Configurações dos provedores PIX';
COMMENT ON TABLE user_pix_keys IS 'Chaves PIX cadastradas pelos usuários';
COMMENT ON TABLE payment_history IS 'Histórico de pagamentos do sistema';
