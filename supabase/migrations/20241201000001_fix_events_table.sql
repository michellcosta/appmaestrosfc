-- Correção da tabela events para adicionar coluna is_valid
-- Se a tabela events já existe, adicionar a coluna is_valid

-- Verificar se a coluna is_valid existe na tabela events
DO $$ 
BEGIN
    -- Adicionar coluna is_valid se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'events' AND column_name = 'is_valid'
    ) THEN
        ALTER TABLE events ADD COLUMN is_valid boolean NOT NULL DEFAULT true;
    END IF;
END $$;

-- Criar índice se não existir
CREATE INDEX IF NOT EXISTS idx_events_valid ON events(match_id, is_valid);

-- Verificar se a tabela groups existe, se não, criar
CREATE TABLE IF NOT EXISTS groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  settings jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Verificar se a tabela memberships existe, se não, criar
CREATE TABLE IF NOT EXISTS memberships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('owner','admin','aux','mensalista','diarista')),
  status text DEFAULT 'active' CHECK (status IN ('active','inactive','banned')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(group_id, user_id)
);

-- Adicionar coluna group_id na tabela matches se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'matches' AND column_name = 'group_id'
    ) THEN
        ALTER TABLE matches ADD COLUMN group_id uuid REFERENCES groups(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Criar outras tabelas se não existirem
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id),
  match_id uuid REFERENCES matches(id) ON DELETE SET NULL,
  provider text NOT NULL,
  external_ref text NOT NULL,
  status text NOT NULL CHECK (status IN ('pending','paid','expired','failed')),
  amount_cents bigint NOT NULL,
  raw jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(provider, external_ref)
);

CREATE TABLE IF NOT EXISTS wallets (
  group_id uuid PRIMARY KEY REFERENCES groups(id) ON DELETE CASCADE,
  balance_cents bigint NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS wallet_ledger (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  delta_cents bigint NOT NULL,
  reason text NOT NULL,
  ref_id uuid,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS checkins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id uuid NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id),
  method text NOT NULL CHECK (method IN ('geo','pin')),
  lat numeric,
  lng numeric,
  accuracy numeric,
  device_id text,
  created_at timestamptz DEFAULT now()
);

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_matches_group ON matches(group_id);
CREATE INDEX IF NOT EXISTS idx_events_match ON events(match_id);
CREATE INDEX IF NOT EXISTS idx_events_valid ON events(match_id, is_valid);
CREATE INDEX IF NOT EXISTS idx_payments_group ON payments(group_id);
CREATE INDEX IF NOT EXISTS idx_payments_user ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_checkins_match ON checkins(match_id);
CREATE INDEX IF NOT EXISTS idx_checkins_user ON checkins(user_id);

-- Habilitar RLS
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE checkins ENABLE ROW LEVEL SECURITY;

-- Policies básicas para permitir inserção de usuários
CREATE POLICY IF NOT EXISTS groups_select ON groups
  FOR SELECT USING (auth.uid() = owner_id OR EXISTS (
    SELECT 1 FROM memberships m WHERE m.group_id = id AND m.user_id = auth.uid()
  ));

CREATE POLICY IF NOT EXISTS groups_update_owner ON groups
  FOR UPDATE USING (auth.uid() = owner_id);

-- Permitir que usuários se inscrevam em grupos
CREATE POLICY IF NOT EXISTS memberships_insert_self ON memberships
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS memberships_select ON memberships
  FOR SELECT USING (auth.uid() = user_id OR EXISTS(
    SELECT 1 FROM memberships m
    WHERE m.group_id = memberships.group_id AND m.user_id = auth.uid() AND m.role IN ('owner','admin')
  ));

-- Policies para matches
CREATE POLICY IF NOT EXISTS match_select ON matches
  FOR SELECT USING (EXISTS(SELECT 1 FROM memberships m WHERE m.group_id = matches.group_id AND m.user_id = auth.uid()));

-- Policies para events
CREATE POLICY IF NOT EXISTS events_select ON events
  FOR SELECT USING (EXISTS(SELECT 1 FROM matches mt JOIN memberships m ON m.group_id=mt.group_id WHERE mt.id=events.match_id AND m.user_id=auth.uid()));

-- Policies para payments
CREATE POLICY IF NOT EXISTS pay_select_own ON payments
  FOR SELECT USING (payments.user_id = auth.uid());

-- Policies para wallets
CREATE POLICY IF NOT EXISTS wallet_select ON wallets
  FOR SELECT USING (EXISTS(SELECT 1 FROM memberships m WHERE m.group_id=wallets.group_id AND m.user_id=auth.uid()));

-- Policies para checkins
CREATE POLICY IF NOT EXISTS checkins_select_member ON checkins
  FOR SELECT USING (EXISTS(SELECT 1 FROM matches mt JOIN memberships m ON m.group_id=mt.group_id WHERE mt.id=checkins.match_id AND m.user_id=auth.uid()));

CREATE POLICY IF NOT EXISTS checkins_insert_self ON checkins
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Inserir carteira para grupos existentes
INSERT INTO wallets (group_id) 
SELECT id FROM groups g 
ON CONFLICT DO NOTHING;
