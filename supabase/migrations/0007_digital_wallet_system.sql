-- Sistema de Carteira Digital com Saldo Real em Reais
-- Migração do sistema de créditos para valores reais
-- Criado em: 2024

-- Carteiras digitais por grupo (substitui credit_wallets)
CREATE TABLE digital_wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL, -- referência ao grupo/time
  responsible_user_id UUID REFERENCES profiles(id),
  group_name VARCHAR(100) NOT NULL,
  balance_brl DECIMAL(10,2) DEFAULT 0 CHECK (balance_brl >= 0), -- Saldo em reais
  total_received_brl DECIMAL(10,2) DEFAULT 0, -- total já recebido historicamente
  total_paid_brl DECIMAL(10,2) DEFAULT 0, -- total já pago
  pix_key VARCHAR(100), -- Chave PIX do grupo (opcional)
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Transações financeiras reais (substitui credit_transactions)
CREATE TABLE wallet_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id UUID REFERENCES digital_wallets(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL CHECK (type IN ('deposit', 'withdrawal', 'payment', 'refund', 'transfer_in', 'transfer_out')),
  amount_brl DECIMAL(10,2) NOT NULL,
  description TEXT NOT NULL,
  reference_type VARCHAR(50), -- 'pix_payment', 'monthly_fee', 'game_fee', 'prize', 'manual'
  reference_id VARCHAR(100), -- ID da transação PIX ou referência externa
  pix_transaction_id VARCHAR(100), -- ID específico da transação PIX
  status VARCHAR(20) DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
  created_by UUID REFERENCES profiles(id),
  processed_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Opções de pagamento/serviços (substitui credit_usage_options)
CREATE TABLE payment_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  price_brl DECIMAL(10,2) NOT NULL, -- Preço em reais
  category VARCHAR(50) NOT NULL, -- 'monthly_fee', 'game_fee', 'prize', 'service'
  is_active BOOLEAN DEFAULT true,
  group_id UUID, -- NULL = opção global, UUID = específica do grupo
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Histórico de pagamentos realizados (substitui credit_usage_history)
CREATE TABLE payment_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id UUID REFERENCES digital_wallets(id),
  payment_option_id UUID REFERENCES payment_options(id),
  quantity INTEGER DEFAULT 1,
  total_amount_brl DECIMAL(10,2) NOT NULL,
  description TEXT,
  payment_method VARCHAR(20) DEFAULT 'wallet_balance' CHECK (payment_method IN ('wallet_balance', 'pix_direct', 'transfer')),
  paid_at TIMESTAMP DEFAULT NOW(),
  paid_by UUID REFERENCES profiles(id)
);

-- Solicitações de saque via PIX
CREATE TABLE withdrawal_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id UUID REFERENCES digital_wallets(id),
  amount_brl DECIMAL(10,2) NOT NULL,
  pix_key VARCHAR(100) NOT NULL, -- Chave PIX de destino
  pix_key_type VARCHAR(20) CHECK (pix_key_type IN ('cpf', 'cnpj', 'email', 'phone', 'random')),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'processing', 'completed', 'rejected')),
  rejection_reason TEXT,
  requested_by UUID REFERENCES profiles(id),
  approved_by UUID REFERENCES profiles(id),
  processed_by UUID REFERENCES profiles(id),
  pix_transaction_id VARCHAR(100), -- ID da transação PIX quando processada
  requested_at TIMESTAMP DEFAULT NOW(),
  approved_at TIMESTAMP,
  processed_at TIMESTAMP
);

-- Índices para performance
CREATE INDEX idx_digital_wallets_group_id ON digital_wallets(group_id);
CREATE INDEX idx_digital_wallets_responsible ON digital_wallets(responsible_user_id);
CREATE INDEX idx_wallet_transactions_wallet ON wallet_transactions(wallet_id);
CREATE INDEX idx_wallet_transactions_type ON wallet_transactions(type);
CREATE INDEX idx_wallet_transactions_status ON wallet_transactions(status);
CREATE INDEX idx_wallet_transactions_created_at ON wallet_transactions(created_at DESC);
CREATE INDEX idx_payment_history_wallet ON payment_history(wallet_id);
CREATE INDEX idx_withdrawal_requests_wallet ON withdrawal_requests(wallet_id);
CREATE INDEX idx_withdrawal_requests_status ON withdrawal_requests(status);

-- Trigger para atualizar saldo da carteira automaticamente
CREATE OR REPLACE FUNCTION update_wallet_balance()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.status = 'completed' THEN
    IF NEW.type IN ('deposit', 'refund', 'transfer_in') THEN
      UPDATE digital_wallets 
      SET 
        balance_brl = balance_brl + NEW.amount_brl,
        total_received_brl = total_received_brl + NEW.amount_brl,
        updated_at = NOW()
      WHERE id = NEW.wallet_id;
    ELSIF NEW.type IN ('withdrawal', 'payment', 'transfer_out') THEN
      UPDATE digital_wallets 
      SET 
        balance_brl = balance_brl - NEW.amount_brl,
        total_paid_brl = total_paid_brl + NEW.amount_brl,
        updated_at = NOW()
      WHERE id = NEW.wallet_id;
    END IF;
  ELSIF TG_OP = 'UPDATE' AND OLD.status != 'completed' AND NEW.status = 'completed' THEN
    -- Transação foi confirmada
    IF NEW.type IN ('deposit', 'refund', 'transfer_in') THEN
      UPDATE digital_wallets 
      SET 
        balance_brl = balance_brl + NEW.amount_brl,
        total_received_brl = total_received_brl + NEW.amount_brl,
        updated_at = NOW()
      WHERE id = NEW.wallet_id;
    ELSIF NEW.type IN ('withdrawal', 'payment', 'transfer_out') THEN
      UPDATE digital_wallets 
      SET 
        balance_brl = balance_brl - NEW.amount_brl,
        total_paid_brl = total_paid_brl + NEW.amount_brl,
        updated_at = NOW()
      WHERE id = NEW.wallet_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_wallet_balance
  AFTER INSERT OR UPDATE ON wallet_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_wallet_balance();

-- Função para processar pagamento
CREATE OR REPLACE FUNCTION process_payment(
  p_wallet_id UUID,
  p_payment_option_id UUID,
  p_quantity INTEGER DEFAULT 1,
  p_paid_by UUID DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  v_wallet digital_wallets%ROWTYPE;
  v_option payment_options%ROWTYPE;
  v_total_amount DECIMAL(10,2);
  v_payment_id UUID;
  v_transaction_id UUID;
BEGIN
  -- Buscar carteira
  SELECT * INTO v_wallet FROM digital_wallets WHERE id = p_wallet_id AND is_active = true;
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Carteira não encontrada ou inativa');
  END IF;

  -- Buscar opção de pagamento
  SELECT * INTO v_option FROM payment_options WHERE id = p_payment_option_id AND is_active = true;
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Opção de pagamento não encontrada');
  END IF;

  -- Calcular valor total
  v_total_amount := v_option.price_brl * p_quantity;

  -- Verificar saldo
  IF v_wallet.balance_brl < v_total_amount THEN
    RETURN json_build_object('success', false, 'error', 'Saldo insuficiente', 'required', v_total_amount, 'available', v_wallet.balance_brl);
  END IF;

  -- Registrar pagamento
  INSERT INTO payment_history (wallet_id, payment_option_id, quantity, total_amount_brl, paid_by, description)
  VALUES (p_wallet_id, p_payment_option_id, p_quantity, v_total_amount, p_paid_by, 
          format('Pagamento: %s (x%s)', v_option.name, p_quantity))
  RETURNING id INTO v_payment_id;

  -- Debitar da carteira
  INSERT INTO wallet_transactions (wallet_id, type, amount_brl, description, reference_type, reference_id, created_by, status)
  VALUES (p_wallet_id, 'payment', v_total_amount, 
          format('Pagamento: %s (x%s)', v_option.name, p_quantity), 
          'payment', v_payment_id, p_paid_by, 'completed')
  RETURNING id INTO v_transaction_id;

  RETURN json_build_object(
    'success', true, 
    'payment_id', v_payment_id,
    'transaction_id', v_transaction_id,
    'amount_paid', v_total_amount,
    'new_balance', v_wallet.balance_brl - v_total_amount
  );
END;
$$ LANGUAGE plpgsql;

-- Função para solicitar saque
CREATE OR REPLACE FUNCTION request_withdrawal(
  p_wallet_id UUID,
  p_amount_brl DECIMAL(10,2),
  p_pix_key VARCHAR(100),
  p_pix_key_type VARCHAR(20),
  p_requested_by UUID
)
RETURNS JSON AS $$
DECLARE
  v_wallet digital_wallets%ROWTYPE;
  v_withdrawal_id UUID;
BEGIN
  -- Buscar carteira
  SELECT * INTO v_wallet FROM digital_wallets WHERE id = p_wallet_id AND is_active = true;
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Carteira não encontrada ou inativa');
  END IF;

  -- Verificar saldo
  IF v_wallet.balance_brl < p_amount_brl THEN
    RETURN json_build_object('success', false, 'error', 'Saldo insuficiente para saque');
  END IF;

  -- Criar solicitação de saque
  INSERT INTO withdrawal_requests (wallet_id, amount_brl, pix_key, pix_key_type, requested_by)
  VALUES (p_wallet_id, p_amount_brl, p_pix_key, p_pix_key_type, p_requested_by)
  RETURNING id INTO v_withdrawal_id;

  RETURN json_build_object(
    'success', true, 
    'withdrawal_id', v_withdrawal_id,
    'amount', p_amount_brl,
    'status', 'pending'
  );
END;
$$ LANGUAGE plpgsql;

-- Inserir opções padrão de pagamento (convertendo de créditos para reais)
INSERT INTO payment_options (name, description, price_brl, category) VALUES
('Mensalidade', 'Pagamento da mensalidade do grupo', 50.00, 'monthly_fee'),
('Taxa de Jogo', 'Pagamento da taxa de participação em jogo', 15.00, 'game_fee'),
('Taxa de Evento', 'Pagamento para participação em eventos especiais', 25.00, 'game_fee'),
('Prêmio Pequeno', 'Prêmio para sorteios e eventos', 25.00, 'prize'),
('Prêmio Grande', 'Prêmio especial para campeões', 100.00, 'prize');

-- Habilitar RLS
ALTER TABLE digital_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE withdrawal_requests ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança
-- Staff pode gerenciar tudo
CREATE POLICY "Staff can manage digital wallets" ON digital_wallets
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('owner', 'admin')
    )
  );

-- Responsáveis podem ver apenas sua carteira
CREATE POLICY "Responsible can view own wallet" ON digital_wallets
  FOR SELECT USING (responsible_user_id = auth.uid());

-- Políticas para transações
CREATE POLICY "Staff can manage wallet transactions" ON wallet_transactions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Users can view own wallet transactions" ON wallet_transactions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM digital_wallets 
      WHERE digital_wallets.id = wallet_transactions.wallet_id 
      AND digital_wallets.responsible_user_id = auth.uid()
    )
  );

-- Políticas para opções de pagamento
CREATE POLICY "Users can view payment options" ON payment_options
  FOR SELECT USING (is_active = true);

-- Políticas para histórico de pagamentos
CREATE POLICY "Staff can manage payment history" ON payment_history
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Users can view own payment history" ON payment_history
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM digital_wallets 
      WHERE digital_wallets.id = payment_history.wallet_id 
      AND digital_wallets.responsible_user_id = auth.uid()
    )
  );

-- Políticas para solicitações de saque
CREATE POLICY "Staff can manage withdrawal requests" ON withdrawal_requests
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Users can manage own withdrawal requests" ON withdrawal_requests
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM digital_wallets 
      WHERE digital_wallets.id = withdrawal_requests.wallet_id 
      AND digital_wallets.responsible_user_id = auth.uid()
    )
  );

COMMENT ON TABLE digital_wallets IS 'Carteiras digitais com saldo real em reais por grupo';
COMMENT ON TABLE wallet_transactions IS 'Histórico de todas as transações financeiras reais';
COMMENT ON TABLE payment_options IS 'Opções disponíveis para pagamento com valores em reais';
COMMENT ON TABLE payment_history IS 'Histórico de pagamentos realizados pelos responsáveis';
COMMENT ON TABLE withdrawal_requests IS 'Solicitações de saque via PIX';