/**
 * Tabela para rate limiting usando PostgreSQL
 * Criar esta tabela no Supabase se não existir
 */

export const createRateLimitTable = `
CREATE TABLE IF NOT EXISTS rate_limit_counters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_rate_limit_key ON rate_limit_counters(key);
CREATE INDEX IF NOT EXISTS idx_rate_limit_created ON rate_limit_counters(created_at);

-- Limpar contadores antigos automaticamente
CREATE OR REPLACE FUNCTION cleanup_old_counters()
RETURNS void AS $$
BEGIN
  DELETE FROM rate_limit_counters 
  WHERE created_at < now() - interval '1 hour';
END;
$$ LANGUAGE plpgsql;

-- Executar limpeza a cada hora
SELECT cron.schedule('cleanup-rate-limit', '0 * * * *', 'SELECT cleanup_old_counters();');
`;
