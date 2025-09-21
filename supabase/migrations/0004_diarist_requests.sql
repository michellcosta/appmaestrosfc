-- Cria tabela para solicitações de participação de diaristas
-- Migração: 0004_diarist_requests.sql

-- Criar tabela de solicitações de diaristas
CREATE TABLE IF NOT EXISTS diarist_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  match_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
  requested_at timestamptz DEFAULT now(),
  reviewed_at timestamptz,
  reviewed_by uuid REFERENCES profiles(id),
  payment_id uuid,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Comentários sobre a tabela
COMMENT ON TABLE diarist_requests IS 'Solicitações de participação de diaristas em partidas';
COMMENT ON COLUMN diarist_requests.status IS 'Status da solicitação: pending, approved, rejected, cancelled';
COMMENT ON COLUMN diarist_requests.match_id IS 'ID da partida (referência externa)';
COMMENT ON COLUMN diarist_requests.payment_id IS 'ID do pagamento quando aprovado';

-- Índices para otimização
CREATE INDEX idx_diarist_requests_user_id ON diarist_requests(user_id);
CREATE INDEX idx_diarist_requests_match_id ON diarist_requests(match_id);
CREATE INDEX idx_diarist_requests_status ON diarist_requests(status);
CREATE INDEX idx_diarist_requests_pending ON diarist_requests(status, requested_at) WHERE status = 'pending';

-- Constraint para evitar solicitações duplicadas
CREATE UNIQUE INDEX idx_diarist_requests_unique ON diarist_requests(user_id, match_id) 
WHERE status IN ('pending', 'approved');

-- Políticas de segurança (RLS)
ALTER TABLE diarist_requests ENABLE ROW LEVEL SECURITY;

-- Usuários podem ver suas próprias solicitações
CREATE POLICY "diarist_requests: users can view own" ON diarist_requests 
FOR SELECT USING (auth.uid() = user_id);

-- Usuários podem criar suas próprias solicitações
CREATE POLICY "diarist_requests: users can create own" ON diarist_requests 
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Usuários podem cancelar suas próprias solicitações pendentes
CREATE POLICY "diarist_requests: users can cancel own pending" ON diarist_requests 
FOR UPDATE USING (auth.uid() = user_id AND status = 'pending') 
WITH CHECK (status = 'cancelled');

-- Staff pode ver todas as solicitações
CREATE POLICY "diarist_requests: staff can view all" ON diarist_requests 
FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('owner','admin','aux'))
);

-- Staff pode aprovar/rejeitar solicitações
CREATE POLICY "diarist_requests: staff can review" ON diarist_requests 
FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('owner','admin','aux'))
);