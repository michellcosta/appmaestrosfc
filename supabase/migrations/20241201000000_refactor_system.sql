-- Refatoração completa do sistema Maestros FC
-- Migração para sistema multi-grupo com RLS e server authoritative

-- 1. Tabela de grupos (multi-tenancy)
CREATE TABLE IF NOT EXISTS groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  settings jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 2. Membros dos grupos (roles)
CREATE TABLE IF NOT EXISTS memberships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('owner','admin','aux','mensalista','diarista')),
  status text DEFAULT 'active' CHECK (status IN ('active','inactive','banned')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(group_id, user_id)
);

-- 3. Partidas com grupo
ALTER TABLE matches ADD COLUMN IF NOT EXISTS group_id uuid REFERENCES groups(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_matches_group ON matches(group_id);

-- 4. Eventos de partida (server authoritative)
CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id uuid NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('START','PAUSE','RESET','END','GOAL','CARD','SUB')),
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_valid boolean NOT NULL DEFAULT true,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_events_match ON events(match_id);
CREATE INDEX IF NOT EXISTS idx_events_valid ON events(match_id, is_valid);

-- 5. Pagamentos com PIX
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id),
  match_id uuid REFERENCES matches(id) ON DELETE SET NULL,
  provider text NOT NULL,
  external_ref text NOT NULL,
  status text NOT NULL CHECK (status IN ('pending','paid','expired','failed')),
  amount_cents integer NOT NULL CHECK (amount_cents>=0),
  raw jsonb,
  created_at timestamptz DEFAULT now(),
  UNIQUE(provider, external_ref)
);

-- 6. Carteiras por grupo
CREATE TABLE IF NOT EXISTS wallets (
  group_id uuid PRIMARY KEY REFERENCES groups(id) ON DELETE CASCADE,
  balance_cents bigint NOT NULL DEFAULT 0,
  updated_at timestamptz DEFAULT now()
);

-- 7. Ledger de carteira
CREATE TABLE IF NOT EXISTS wallet_ledger (
  id bigserial PRIMARY KEY,
  group_id uuid NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  delta_cents bigint NOT NULL,
  reason text NOT NULL,
  ref_id uuid,
  created_at timestamptz DEFAULT now()
);

-- 8. Check-ins com geofence
CREATE TABLE IF NOT EXISTS checkins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id uuid NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lat double precision,
  lng double precision,
  accuracy double precision,
  device_id text,
  method text NOT NULL CHECK (method IN ('geo','pin')),
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_checkins_match_user ON checkins(match_id, user_id);

-- 9. View materializada de placar
CREATE MATERIALIZED VIEW IF NOT EXISTS match_score AS
SELECT e.match_id,
  COALESCE(SUM(CASE WHEN e.type='GOAL' AND (e.payload->>'team')='home' AND e.is_valid THEN 1 ELSE 0 END),0) AS home_goals,
  COALESCE(SUM(CASE WHEN e.type='GOAL' AND (e.payload->>'team')='away' AND e.is_valid THEN 1 ELSE 0 END),0) AS away_goals,
  MAX(e.created_at) AS last_event_at
FROM events e
GROUP BY e.match_id;

-- 10. Habilitar RLS
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE checkins ENABLE ROW LEVEL SECURITY;

-- 11. Policies de RLS

-- Groups
CREATE POLICY grp_select ON groups
  FOR SELECT USING (auth.uid() = owner_id OR EXISTS (
    SELECT 1 FROM memberships m WHERE m.group_id = id AND m.user_id = auth.uid()
  ));
CREATE POLICY grp_update_owner ON groups
  FOR UPDATE USING (auth.uid() = owner_id);

-- Memberships
CREATE POLICY memb_rw ON memberships
  FOR ALL USING (EXISTS(
    SELECT 1 FROM memberships m
    WHERE m.group_id = memberships.group_id AND m.user_id = auth.uid() AND m.role IN ('owner','admin')
  ))
  WITH CHECK (EXISTS(
    SELECT 1 FROM memberships m
    WHERE m.group_id = memberships.group_id AND m.user_id = auth.uid() AND m.role IN ('owner','admin')
  ));

-- Matches
CREATE POLICY match_select ON matches
  FOR SELECT USING (EXISTS(SELECT 1 FROM memberships m WHERE m.group_id = matches.group_id AND m.user_id = auth.uid()));
CREATE POLICY match_admin_insert ON matches
  FOR INSERT WITH CHECK (EXISTS(SELECT 1 FROM memberships m WHERE m.group_id = matches.group_id AND m.user_id = auth.uid() AND m.role IN ('owner','admin','aux')));
CREATE POLICY match_admin_update ON matches
  FOR UPDATE USING (EXISTS(SELECT 1 FROM memberships m WHERE m.group_id = matches.group_id AND m.user_id = auth.uid() AND m.role IN ('owner','admin','aux')));

-- Events
CREATE POLICY events_select ON events
  FOR SELECT USING (EXISTS(SELECT 1 FROM matches mt JOIN memberships m ON m.group_id=mt.group_id WHERE mt.id=events.match_id AND m.user_id=auth.uid()));
CREATE POLICY events_insert_admin ON events
  FOR INSERT WITH CHECK (EXISTS(SELECT 1 FROM matches mt JOIN memberships m ON m.group_id=mt.group_id WHERE mt.id = events.match_id AND m.user_id=auth.uid() AND m.role IN ('owner','admin','aux')));
CREATE POLICY events_update_admin ON events
  FOR UPDATE USING (EXISTS(SELECT 1 FROM matches mt JOIN memberships m ON m.group_id=mt.group_id WHERE mt.id = events.match_id AND m.user_id=auth.uid() AND m.role IN ('owner','admin','aux')));

-- Payments
CREATE POLICY pay_select_admin ON payments
  FOR SELECT USING (EXISTS(SELECT 1 FROM memberships m WHERE m.group_id=payments.group_id AND m.user_id=auth.uid() AND m.role IN ('owner','admin')) OR payments.user_id = auth.uid());
CREATE POLICY pay_insert_admin ON payments
  FOR INSERT WITH CHECK (EXISTS(SELECT 1 FROM memberships m WHERE m.group_id=payments.group_id AND m.user_id=auth.uid() AND m.role IN ('owner','admin')));

-- Wallets / Ledger
CREATE POLICY wallet_select_member ON wallets
  FOR SELECT USING (EXISTS(SELECT 1 FROM memberships m WHERE m.group_id=wallets.group_id AND m.user_id=auth.uid()));
CREATE POLICY wallet_ledger_select_admin ON wallet_ledger
  FOR SELECT USING (EXISTS(SELECT 1 FROM memberships m WHERE m.group_id=wallet_ledger.group_id AND m.user_id=auth.uid() AND m.role IN ('owner','admin')));
CREATE POLICY wallet_ledger_insert_admin ON wallet_ledger
  FOR INSERT WITH CHECK (EXISTS(SELECT 1 FROM memberships m WHERE m.group_id=wallet_ledger.group_id AND m.user_id=auth.uid() AND m.role IN ('owner','admin')));

-- Checkins
CREATE POLICY checkins_select_member ON checkins
  FOR SELECT USING (EXISTS(SELECT 1 FROM matches mt JOIN memberships m ON m.group_id=mt.group_id WHERE mt.id=checkins.match_id AND m.user_id=auth.uid()));
CREATE POLICY checkins_insert_self ON checkins
  FOR INSERT WITH CHECK (auth.uid() = user_id AND EXISTS(SELECT 1 FROM matches mt JOIN memberships m ON m.group_id=mt.group_id WHERE mt.id=checkins.match_id AND m.user_id=auth.uid()));

-- 12. Inserir carteiras para grupos existentes
INSERT INTO wallets(group_id)
  SELECT id FROM groups g ON CONFLICT DO NOTHING;
