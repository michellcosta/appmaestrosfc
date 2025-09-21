-- Script de Migração: Créditos para Carteira Digital
-- Converte dados do sistema de créditos para o novo sistema de carteira digital
-- IMPORTANTE: Execute este script APÓS aplicar a migração 0007_digital_wallet_system.sql

-- Função para migrar dados de créditos para carteira digital
CREATE OR REPLACE FUNCTION migrate_credits_to_digital_wallet()
RETURNS JSON AS $$
DECLARE
  v_migrated_wallets INTEGER := 0;
  v_migrated_transactions INTEGER := 0;
  v_migrated_payments INTEGER := 0;
  v_credit_to_brl_rate DECIMAL(10,2) := 1.00; -- Taxa de conversão: 1 crédito = R$ 1,00
BEGIN
  -- 1. Migrar carteiras de créditos para carteiras digitais
  INSERT INTO digital_wallets (
    id,
    group_id,
    responsible_user_id,
    group_name,
    balance_brl,
    total_received_brl,
    total_paid_brl,
    created_at,
    updated_at
  )
  SELECT 
    id,
    group_id,
    responsible_user_id,
    group_name,
    balance * v_credit_to_brl_rate, -- Converter créditos para reais
    total_earned * v_credit_to_brl_rate,
    total_spent * v_credit_to_brl_rate,
    created_at,
    updated_at
  FROM credit_wallets
  WHERE NOT EXISTS (
    SELECT 1 FROM digital_wallets WHERE digital_wallets.id = credit_wallets.id
  );

  GET DIAGNOSTICS v_migrated_wallets = ROW_COUNT;

  -- 2. Migrar transações de créditos para transações de carteira
  INSERT INTO wallet_transactions (
    id,
    wallet_id,
    type,
    amount_brl,
    description,
    reference_type,
    reference_id,
    created_by,
    status,
    processed_at,
    created_at
  )
  SELECT 
    id,
    wallet_id,
    CASE 
      WHEN type = 'earned' THEN 'deposit'
      WHEN type = 'spent' THEN 'payment'
      WHEN type = 'bonus' THEN 'deposit'
      WHEN type = 'penalty' THEN 'withdrawal'
      ELSE 'payment'
    END,
    amount * v_credit_to_brl_rate, -- Converter créditos para reais
    description,
    COALESCE(reference_type, 'migrated_credit'),
    reference_id,
    created_by,
    'completed', -- Todas as transações antigas são consideradas completas
    created_at,
    created_at
  FROM credit_transactions
  WHERE NOT EXISTS (
    SELECT 1 FROM wallet_transactions WHERE wallet_transactions.id = credit_transactions.id
  );

  GET DIAGNOSTICS v_migrated_transactions = ROW_COUNT;

  -- 3. Migrar opções de uso de créditos para opções de pagamento
  INSERT INTO payment_options (
    id,
    name,
    description,
    price_brl,
    category,
    is_active,
    created_at
  )
  SELECT 
    id,
    name,
    description,
    cost_per_unit * v_credit_to_brl_rate, -- Converter créditos para reais
    CASE 
      WHEN category = 'monthly_fee' THEN 'monthly_fee'
      WHEN category = 'event' THEN 'game_fee'
      WHEN category = 'prize' THEN 'prize'
      WHEN category = 'discount' THEN 'service'
      ELSE 'service'
    END,
    is_active,
    created_at
  FROM credit_usage_options
  WHERE NOT EXISTS (
    SELECT 1 FROM payment_options WHERE payment_options.id = credit_usage_options.id
  );

  -- 4. Migrar histórico de uso de créditos para histórico de pagamentos
  INSERT INTO payment_history (
    id,
    wallet_id,
    payment_option_id,
    quantity,
    total_amount_brl,
    description,
    payment_method,
    paid_at,
    paid_by
  )
  SELECT 
    id,
    wallet_id,
    usage_option_id,
    quantity,
    total_cost * v_credit_to_brl_rate, -- Converter créditos para reais
    description,
    'wallet_balance',
    used_at,
    used_by
  FROM credit_usage_history
  WHERE NOT EXISTS (
    SELECT 1 FROM payment_history WHERE payment_history.id = credit_usage_history.id
  );

  GET DIAGNOSTICS v_migrated_payments = ROW_COUNT;

  -- Retornar estatísticas da migração
  RETURN json_build_object(
    'success', true,
    'migration_summary', json_build_object(
      'wallets_migrated', v_migrated_wallets,
      'transactions_migrated', v_migrated_transactions,
      'payments_migrated', v_migrated_payments,
      'conversion_rate', v_credit_to_brl_rate,
      'migrated_at', NOW()
    )
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM,
      'migration_summary', json_build_object(
        'wallets_migrated', v_migrated_wallets,
        'transactions_migrated', v_migrated_transactions,
        'payments_migrated', v_migrated_payments
      )
    );
END;
$$ LANGUAGE plpgsql;

-- Função para verificar integridade após migração
CREATE OR REPLACE FUNCTION verify_migration_integrity()
RETURNS JSON AS $$
DECLARE
  v_credit_wallets_count INTEGER;
  v_digital_wallets_count INTEGER;
  v_credit_transactions_count INTEGER;
  v_wallet_transactions_count INTEGER;
  v_balance_differences JSON;
BEGIN
  -- Contar registros
  SELECT COUNT(*) INTO v_credit_wallets_count FROM credit_wallets;
  SELECT COUNT(*) INTO v_digital_wallets_count FROM digital_wallets;
  SELECT COUNT(*) INTO v_credit_transactions_count FROM credit_transactions;
  SELECT COUNT(*) INTO v_wallet_transactions_count FROM wallet_transactions;

  -- Verificar diferenças de saldo (deve ser zero após migração)
  SELECT json_agg(
    json_build_object(
      'wallet_id', cw.id,
      'group_name', cw.group_name,
      'credit_balance', cw.balance,
      'digital_balance', dw.balance_brl,
      'difference', ABS(cw.balance - dw.balance_brl)
    )
  ) INTO v_balance_differences
  FROM credit_wallets cw
  JOIN digital_wallets dw ON cw.id = dw.id
  WHERE ABS(cw.balance - dw.balance_brl) > 0.01; -- Tolerância de 1 centavo

  RETURN json_build_object(
    'verification_summary', json_build_object(
      'credit_wallets_count', v_credit_wallets_count,
      'digital_wallets_count', v_digital_wallets_count,
      'credit_transactions_count', v_credit_transactions_count,
      'wallet_transactions_count', v_wallet_transactions_count,
      'balance_differences', COALESCE(v_balance_differences, '[]'::json),
      'migration_complete', (v_credit_wallets_count = v_digital_wallets_count),
      'verified_at', NOW()
    )
  );
END;
$$ LANGUAGE plpgsql;

-- Executar migração automaticamente
-- DESCOMENTE as linhas abaixo para executar a migração automaticamente
-- SELECT migrate_credits_to_digital_wallet();
-- SELECT verify_migration_integrity();

-- Comentários e instruções
COMMENT ON FUNCTION migrate_credits_to_digital_wallet() IS 'Migra dados do sistema de créditos para carteira digital com taxa 1:1';
COMMENT ON FUNCTION verify_migration_integrity() IS 'Verifica a integridade dos dados após a migração';

-- Instruções para execução manual:
-- 1. Execute: SELECT migrate_credits_to_digital_wallet();
-- 2. Verifique: SELECT verify_migration_integrity();
-- 3. Se tudo estiver correto, você pode desabilitar as tabelas antigas (opcional)

-- Script para desabilitar tabelas antigas (EXECUTE APENAS APÓS CONFIRMAR QUE TUDO ESTÁ FUNCIONANDO)
/*
-- Renomear tabelas antigas para backup
ALTER TABLE credit_wallets RENAME TO credit_wallets_backup;
ALTER TABLE credit_transactions RENAME TO credit_transactions_backup;
ALTER TABLE credit_usage_options RENAME TO credit_usage_options_backup;
ALTER TABLE credit_usage_history RENAME TO credit_usage_history_backup;

-- Ou, se preferir, remover completamente (CUIDADO!)
-- DROP TABLE credit_usage_history CASCADE;
-- DROP TABLE credit_transactions CASCADE;
-- DROP TABLE credit_usage_options CASCADE;
-- DROP TABLE credit_wallets CASCADE;
*/