-- role_permissions (Owner gerencia toggles para Admin/Aux)
create table if not exists role_permissions (
  id uuid primary key default gen_random_uuid(),
  role text not null check (role in ('admin','aux')),
  key text not null,
  allowed boolean not null default false,
  unique(role,key)
);

-- invites (uso único; depois amarre ao email e expiração)
create table if not exists invites (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  membership text not null check (membership in ('mensalista','diarista')),
  token text not null unique,
  invited_by uuid,
  status text not null check (status in ('sent','accepted','revoked','expired')) default 'sent',
  max_uses int not null default 1,
  used_count int not null default 0,
  consumed_by uuid,
  consumed_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz default now()
);

-- attendance_requests (pedidos de vaga de diarista)
create table if not exists attendance_requests (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null,
  user_id uuid not null,
  status text not null check (status in ('pending','approved','rejected')) default 'pending',
  requested_at timestamptz default now(),
  reviewed_at timestamptz,
  reviewed_by uuid
);

-- charges (Pix copia e cola; webhook marca pago)
create table if not exists charges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  type text not null check (type in ('mensalista','diarista')),
  amount numeric not null,
  txid text unique,
  brcode text,
  status text not null check (status in ('pendente','pago','cancelado')) default 'pendente',
  period text,
  match_id uuid,
  created_at timestamptz default now(),
  paid_at timestamptz
);

-- poll semanal (parciais públicas, voto anônimo)
create table if not exists poll_weeks (
  id uuid primary key default gen_random_uuid(),
  opens_at timestamptz not null,
  closes_at timestamptz not null,
  created_by uuid
);

create table if not exists ballot_choices (
  id uuid primary key default gen_random_uuid(),
  poll_id uuid references poll_weeks(id),
  voter_id uuid,
  player_id uuid,
  category text not null check (category in ('Goleiro','Zagueiro','Meia','Atacante')),
  created_at timestamptz default now(),
  unique(poll_id,voter_id,category)
);

-- premiacao mensal (1 por categoria)
create table if not exists monthly_awards (
  id uuid primary key default gen_random_uuid(),
  month_key date not null,
  category text not null check (category in ('Goleiro','Zagueiro','Meia','Atacante')),
  winner_id uuid,
  votes int not null,
  decided_at timestamptz default now(),
  basis text not null default 'sumVotes',
  unique(month_key, category)
);

-- push subscriptions
create table if not exists push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  endpoint text not null,
  p256dh text not null,
  auth text not null,
  created_at timestamptz default now()
);
create table if not exists profiles (
  id uuid primary key,
  email text not null unique,
  role text not null default 'player' check (role in ('owner','admin','aux','player')),
  membership text check (membership in ('mensalista','diarista')),
  position text check (position in ('Goleiro','Zagueiro','Meia','Atacante')),
  stars int2 check (stars between 0 and 10),
  notifications_enabled boolean not null default true,
  approved boolean not null default true,
  updated_at timestamptz default now()
);
alter table profiles enable row level security;

create policy "profiles: read self" on profiles for select using ( auth.uid() = id );
create policy "profiles: staff read" on profiles for select using (
  exists (select 1 from profiles p where p.id = auth.uid() and p.role in ('owner','admin','aux'))
);
create policy "profiles: update self" on profiles for update using (auth.uid() = id) with check (auth.uid() = id);
create policy "profiles: owner update all" on profiles for update using (
  exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'owner')
);

-- Tabela de solicitações de participação de diaristas
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

-- Comentários sobre a tabela diarist_requests
COMMENT ON TABLE diarist_requests IS 'Solicitações de participação de diaristas em partidas';
COMMENT ON COLUMN diarist_requests.status IS 'Status da solicitação: pending, approved, rejected, cancelled';
COMMENT ON COLUMN diarist_requests.match_id IS 'ID da partida (referência externa)';
COMMENT ON COLUMN diarist_requests.payment_id IS 'ID do pagamento quando aprovado';

-- Índices para diarist_requests
CREATE INDEX idx_diarist_requests_user_id ON diarist_requests(user_id);
CREATE INDEX idx_diarist_requests_match_id ON diarist_requests(match_id);
CREATE INDEX idx_diarist_requests_status ON diarist_requests(status);
CREATE INDEX idx_diarist_requests_pending ON diarist_requests(status, requested_at) WHERE status = 'pending';
CREATE UNIQUE INDEX idx_diarist_requests_unique ON diarist_requests(user_id, match_id) WHERE status IN ('pending', 'approved');

-- Políticas de segurança para diarist_requests
ALTER TABLE diarist_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "diarist_requests: users can view own" ON diarist_requests 
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "diarist_requests: users can create own" ON diarist_requests 
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "diarist_requests: users can cancel own pending" ON diarist_requests 
FOR UPDATE USING (auth.uid() = user_id AND status = 'pending') 
WITH CHECK (status = 'cancelled');

CREATE POLICY "diarist_requests: staff can view all" ON diarist_requests 
FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('owner','admin','aux'))
);

CREATE POLICY "diarist_requests: staff can review" ON diarist_requests 
FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('owner','admin','aux'))
);

-- Tabela para gerenciar conflitos de pagamento
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

-- Comentários para payment_conflicts
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

-- Índices para payment_conflicts
CREATE INDEX idx_payment_conflicts_match_id ON payment_conflicts(match_id);
CREATE INDEX idx_payment_conflicts_user_id ON payment_conflicts(user_id);
CREATE INDEX idx_payment_conflicts_status ON payment_conflicts(status);
CREATE INDEX idx_payment_conflicts_created_at ON payment_conflicts(created_at DESC);
CREATE INDEX idx_payment_conflicts_payment_id ON payment_conflicts(payment_id);

-- RLS para payment_conflicts
ALTER TABLE payment_conflicts ENABLE ROW LEVEL SECURITY;

-- Políticas para payment_conflicts
CREATE POLICY "Staff can view all payment conflicts" ON payment_conflicts
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('owner', 'admin', 'aux')
        )
    );

CREATE POLICY "Staff can insert payment conflicts" ON payment_conflicts
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('owner', 'admin', 'aux')
        )
    );

CREATE POLICY "Staff can update payment conflicts" ON payment_conflicts
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('owner', 'admin', 'aux')
        )
    );

CREATE POLICY "Users can view own payment conflicts" ON payment_conflicts
    FOR SELECT USING (user_id = auth.uid());

-- Tabela para participantes de partidas (controle de capacidade)
CREATE TABLE match_participants (
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
    FOR SELECT USING (true);

CREATE POLICY "Users can view own participation" ON match_participants
    FOR SELECT USING (user_id = auth.uid());}]}
