-- Criar tabela para gerenciar conflitos de pagamento
CREATE TABLE payment_conflicts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    match_id TEXT NOT NULL, -- Referência à partida (mock data por enquanto)
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    payment_method TEXT NOT NULL,
    payment_id TEXT NOT NULL, -- ID do pagamento no gateway
    conflict_reason TEXT NOT NULL CHECK (conflict_reason IN ('match_full', 'duplicate_payment', 'cancelled_match')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'refunded', 'failed', 'resolved')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE,
    refund_id TEXT, -- ID do estorno no gateway
    notes TEXT,
    
    -- Constraints
    CONSTRAINT unique_payment_conflict UNIQUE (payment_id, match_id, user_id)
);

-- Comentários para documentação
COMMENT ON TABLE payment_conflicts IS 'Gerencia conflitos de pagamento quando partidas ficam cheias ou há problemas';
COMMENT ON COLUMN payment_conflicts.match_id IS 'ID da partida onde ocorreu o conflito';
COMMENT ON COLUMN payment_conflicts.user_id IS 'Usuário que teve o conflito de pagamento';
COMMENT ON COLUMN payment_conflicts.amount IS 'Valor do pagamento em conflito';
COMMENT ON COLUMN payment_conflicts.payment_method IS 'Método de pagamento usado (pix, cartao, etc)';
COMMENT ON COLUMN payment_conflicts.payment_id IS 'ID único do pagamento no gateway';
COMMENT ON COLUMN payment_conflicts.conflict_reason IS 'Motivo do conflito: partida cheia, pagamento duplicado, etc';
COMMENT ON COLUMN payment_conflicts.status IS 'Status do conflito: pendente, estornado, falhou, resolvido';
COMMENT ON COLUMN payment_conflicts.refund_id IS 'ID do estorno quando processado';
COMMENT ON COLUMN payment_conflicts.notes IS 'Observações sobre a resolução do conflito';

-- Índices para performance
CREATE INDEX idx_payment_conflicts_match_id ON payment_conflicts(match_id);
CREATE INDEX idx_payment_conflicts_user_id ON payment_conflicts(user_id);
CREATE INDEX idx_payment_conflicts_status ON payment_conflicts(status);
CREATE INDEX idx_payment_conflicts_created_at ON payment_conflicts(created_at DESC);
CREATE INDEX idx_payment_conflicts_payment_id ON payment_conflicts(payment_id);

-- Habilitar RLS (Row Level Security)
ALTER TABLE payment_conflicts ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança
-- Staff pode ver todos os conflitos
CREATE POLICY "Staff can view all payment conflicts" ON payment_conflicts
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('owner', 'admin', 'aux')
        )
    );

-- Staff pode inserir conflitos
CREATE POLICY "Staff can insert payment conflicts" ON payment_conflicts
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('owner', 'admin', 'aux')
        )
    );

-- Staff pode atualizar conflitos
CREATE POLICY "Staff can update payment conflicts" ON payment_conflicts
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('owner', 'admin', 'aux')
        )
    );

-- Usuários podem ver apenas seus próprios conflitos
CREATE POLICY "Users can view own payment conflicts" ON payment_conflicts
    FOR SELECT USING (user_id = auth.uid());

-- Criar tabela para participantes de partidas (para controle de capacidade)
CREATE TABLE IF NOT EXISTS match_participants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    match_id TEXT NOT NULL,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled', 'pending')),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    payment_confirmed_at TIMESTAMP WITH TIME ZONE,
    payment_amount DECIMAL(10,2),
    
    -- Constraints
    CONSTRAINT unique_match_participant UNIQUE (match_id, user_id)
);

-- Comentários para match_participants
COMMENT ON TABLE match_participants IS 'Controla participantes confirmados em cada partida';
COMMENT ON COLUMN match_participants.match_id IS 'ID da partida';
COMMENT ON COLUMN match_participants.user_id IS 'Usuário participante';
COMMENT ON COLUMN match_participants.status IS 'Status da participação';
COMMENT ON COLUMN match_participants.payment_confirmed_at IS 'Quando o pagamento foi confirmado';

-- Índices para match_participants
CREATE INDEX idx_match_participants_match_id ON match_participants(match_id);
CREATE INDEX idx_match_participants_user_id ON match_participants(user_id);
CREATE INDEX idx_match_participants_status ON match_participants(status);

-- RLS para match_participants
ALTER TABLE match_participants ENABLE ROW LEVEL SECURITY;

-- Políticas para match_participants
CREATE POLICY "Staff can manage match participants" ON match_participants
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('owner', 'admin', 'aux')
        )
    );

CREATE POLICY "Users can view match participants" ON match_participants
    FOR SELECT USING (true); -- Todos podem ver participantes

CREATE POLICY "Users can view own participation" ON match_participants
    FOR SELECT USING (user_id = auth.uid());