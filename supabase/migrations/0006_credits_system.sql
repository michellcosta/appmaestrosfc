-- Sistema de Créditos Internos (SEM taxas de transferência)
-- Criado em: 2024

-- Carteiras de créditos por grupo
CREATE TABLE credit_wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL, -- referência ao grupo/time
  responsible_user_id UUID REFERENCES profiles(id),
  group_name VARCHAR(100) NOT NULL,
  balance DECIMAL(10,2) DEFAULT 0 CHECK (balance >= 0),
  total_earned DECIMAL(10,2) DEFAULT 0, -- total já ganho historicamente
  total_spent DECIMAL(10,2) DEFAULT 0, -- total já gasto
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Transações de créditos
CREATE TABLE credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id UUID REFERENCES credit_wallets(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL CHECK (type IN ('earned', 'spent', 'bonus', 'penalty')),
  amount DECIMAL(10,2) NOT NULL,
  description TEXT NOT NULL,
  reference_type VARCHAR(50), -- 'payment', 'monthly_fee', 'event', 'prize'
  reference_id UUID, -- ID do pagamento/evento que originou
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Usos dos créditos (onde podem ser gastos)
CREATE TABLE credit_usage_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  cost_per_unit DECIMAL(10,2) NOT NULL,
  category VARCHAR(50) NOT NULL, -- 'monthly_fee', 'event', 'prize', 'discount'
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Histórico de uso de créditos
CREATE TABLE credit_usage_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id UUID REFERENCES credit_wallets(id),
  usage_option_id UUID REFERENCES credit_usage_options(id),
  quantity INTEGER DEFAULT 1,
  total_cost DECIMAL(10,2) NOT NULL,
  description TEXT,
  used_at TIMESTAMP DEFAULT NOW(),
  used_by UUID REFERENCES profiles(id)
);

-- Índices para performance
CREATE INDEX idx_credit_wallets_group_id ON credit_wallets(group_id);
CREATE INDEX idx_credit_wallets_responsible ON credit_wallets(responsible_user_id);
CREATE INDEX idx_credit_transactions_wallet ON credit_transactions(wallet_id);
CREATE INDEX idx_credit_transactions_type ON credit_transactions(type);
CREATE INDEX idx_credit_transactions_created_at ON credit_transactions(created_at DESC);
CREATE INDEX idx_credit_usage_history_wallet ON credit_usage_history(wallet_id);

-- Triggers para atualizar saldo automaticamente
CREATE OR REPLACE FUNCTION update_credit_wallet_balance()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.type IN ('earned', 'bonus') THEN
      UPDATE credit_wallets 
      SET 
        balance = balance + NEW.amount,
        total_earned = total_earned + NEW.amount,
        updated_at = NOW()
      WHERE id = NEW.wallet_id;
    ELSIF NEW.type IN ('spent', 'penalty') THEN
      UPDATE credit_wallets 
      SET 
        balance = balance - NEW.amount,
        total_spent = total_spent + NEW.amount,
        updated_at = NOW()
      WHERE id = NEW.wallet_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_credit_balance
  AFTER INSERT ON credit_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_credit_wallet_balance();

-- Função para usar créditos
CREATE OR REPLACE FUNCTION use_credits(
  p_wallet_id UUID,
  p_usage_option_id UUID,
  p_quantity INTEGER DEFAULT 1,
  p_used_by UUID DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  v_wallet credit_wallets%ROWTYPE;
  v_option credit_usage_options%ROWTYPE;
  v_total_cost DECIMAL(10,2);
  v_usage_id UUID;
BEGIN
  -- Buscar carteira
  SELECT * INTO v_wallet FROM credit_wallets WHERE id = p_wallet_id;
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Carteira não encontrada');
  END IF;

  -- Buscar opção de uso
  SELECT * INTO v_option FROM credit_usage_options WHERE id = p_usage_option_id AND is_active = true;
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Opção de uso não encontrada');
  END IF;

  -- Calcular custo total
  v_total_cost := v_option.cost_per_unit * p_quantity;

  -- Verificar saldo
  IF v_wallet.balance < v_total_cost THEN
    RETURN json_build_object('success', false, 'error', 'Saldo insuficiente');
  END IF;

  -- Registrar uso
  INSERT INTO credit_usage_history (wallet_id, usage_option_id, quantity, total_cost, used_by)
  VALUES (p_wallet_id, p_usage_option_id, p_quantity, v_total_cost, p_used_by)
  RETURNING id INTO v_usage_id;

  -- Debitar créditos
  INSERT INTO credit_transactions (wallet_id, type, amount, description, reference_type, reference_id, created_by)
  VALUES (p_wallet_id, 'spent', v_total_cost, 
          format('Uso: %s (x%s)', v_option.name, p_quantity), 
          'credit_usage', v_usage_id, p_used_by);

  RETURN json_build_object(
    'success', true, 
    'usage_id', v_usage_id,
    'amount_spent', v_total_cost,
    'new_balance', v_wallet.balance - v_total_cost
  );
END;
$$ LANGUAGE plpgsql;

-- Inserir opções padrão de uso de créditos
INSERT INTO credit_usage_options (name, description, cost_per_unit, category) VALUES
('Mensalidade', 'Pagamento da mensalidade do grupo', 50.00, 'monthly_fee'),
('Taxa de Jogo', 'Pagamento da taxa de participação em jogo', 15.00, 'event'),
('Desconto 10%', 'Desconto de 10% em qualquer pagamento', 5.00, 'discount'),
('Prêmio Pequeno', 'Prêmio para sorteios e eventos', 25.00, 'prize'),
('Prêmio Grande', 'Prêmio especial para campeões', 100.00, 'prize');

-- Habilitar RLS
ALTER TABLE credit_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_usage_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_usage_history ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança
-- Staff pode ver tudo
CREATE POLICY "Staff can manage credit wallets" ON credit_wallets
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('owner', 'admin')
    )
  );

-- Responsáveis podem ver apenas sua carteira
CREATE POLICY "Responsible can view own wallet" ON credit_wallets
  FOR SELECT USING (responsible_user_id = auth.uid());

-- Políticas similares para outras tabelas
CREATE POLICY "Staff can manage credit transactions" ON credit_transactions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Users can view credit usage options" ON credit_usage_options
  FOR SELECT USING (is_active = true);

COMMENT ON TABLE credit_wallets IS 'Carteiras de créditos virtuais por grupo - SEM taxas de transferência';
COMMENT ON TABLE credit_transactions IS 'Histórico de todas as transações de créditos';
COMMENT ON TABLE credit_usage_options IS 'Opções disponíveis para gastar créditos';
COMMENT ON TABLE credit_usage_history IS 'Histórico de uso dos créditos pelos responsáveis';