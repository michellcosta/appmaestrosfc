-- Função para atualizar saldo da carteira
CREATE OR REPLACE FUNCTION update_wallet_balance(
  group_id_param uuid,
  delta_cents_param bigint
)
RETURNS void AS $$
BEGIN
  UPDATE wallets 
  SET 
    balance_cents = balance_cents + delta_cents_param,
    updated_at = now()
  WHERE wallets.group_id = group_id_param;
END;
$$ LANGUAGE plpgsql;

-- Função para refresh da view de placar
CREATE OR REPLACE FUNCTION refresh_match_score()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW match_score;
END;
$$ LANGUAGE plpgsql;
