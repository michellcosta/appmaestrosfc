-- ========================================
-- SCHEMA COMPLETO - MAESTROS FC
-- ========================================
-- Execute este SQL completo no Supabase SQL Editor

-- 0) Extensões
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1) Helpers de papel/usuário (ligam auth.uid() ao perfil em 'users')
CREATE OR REPLACE FUNCTION public.me() RETURNS uuid
LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.my_role() RETURNS text
LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT role FROM public.users WHERE auth_id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.is_owner() RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT COALESCE((SELECT role='owner' FROM public.users WHERE auth_id = auth.uid()), false);
$$;

CREATE OR REPLACE FUNCTION public.is_admin_or_owner() RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT COALESCE((SELECT role IN ('owner','admin') FROM public.users WHERE auth_id = auth.uid()), false);
$$;

CREATE OR REPLACE FUNCTION public.is_aux_admin_owner() RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT COALESCE((SELECT role IN ('owner','admin','aux') FROM public.users WHERE auth_id = auth.uid()), false);
$$;

-- 2) Tabelas principais
CREATE TABLE IF NOT EXISTS app_settings_venue (
  id text PRIMARY KEY DEFAULT 'venue',
  name text,
  address text,
  lat double precision,
  lng double precision,
  radius_m integer DEFAULT 30,
  updated_by uuid,
  updated_at timestamptz DEFAULT now()
);

INSERT INTO app_settings_venue(id, name, address, lat, lng)
VALUES ('venue','Arena Maestros','Edite aqui', -23.0000, -46.0000)
ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id uuid UNIQUE, -- referencia auth.users.id
  name text,
  role text CHECK (role IN ('owner','admin','aux','mensalista','diarista')) DEFAULT 'mensalista',
  status text, -- redundante/categorização
  posicao text, -- 'Gol'|'Def'|'Mei'|'Ata' (opcional)
  estrelas int CHECK (estrelas BETWEEN 0 AND 10) DEFAULT 0,
  tamanho_camisa text CHECK (tamanho_camisa IN ('G','GG')),
  aprovado boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  data_hora timestamptz NOT NULL,
  max_jogadores int NOT NULL,
  status text CHECK (status IN ('draft','open','live','closed')) DEFAULT 'open',
  gk_mode text CHECK (gk_mode IN ('two_fixed','one_fixed','by_team','auto')) DEFAULT 'two_fixed',
  notes text,
  created_by uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Estado/cronômetro controlado no servidor (rev incrementa a cada mudança)
CREATE TABLE IF NOT EXISTS match_state (
  match_id uuid PRIMARY KEY REFERENCES matches(id) ON DELETE CASCADE,
  rev bigint DEFAULT 0,
  status text CHECK (status IN ('idle','running','paused','ended')) DEFAULT 'idle',
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS checkins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id uuid REFERENCES matches(id),
  user_id uuid REFERENCES users(id),
  ts timestamptz DEFAULT now(),
  lat double precision,
  lng double precision,
  accuracy double precision,
  mock_location boolean DEFAULT false,
  selfie_url text
);

CREATE TABLE IF NOT EXISTS team_draw (
  match_id uuid PRIMARY KEY REFERENCES matches(id) ON DELETE CASCADE,
  seed text,
  criterios jsonb,     -- {ordemChegada:true,posicao:true,estrelas:true}
  teams jsonb          -- {Preto:[ids],Verde:[ids],Cinza:[ids],Coletes:[ids]}
);

CREATE TABLE IF NOT EXISTS team_appearance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id uuid REFERENCES matches(id),
  rodada int,
  user_id uuid REFERENCES users(id),
  team_color text CHECK (team_color IN ('Preto','Verde','Cinza','Coletes')),
  role text CHECK (role IN ('GK','FIELD')) DEFAULT 'FIELD',
  enter_ts timestamptz,
  exit_ts timestamptz
);

CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id uuid REFERENCES matches(id),
  rodada int,
  type text CHECK (type IN ('START','PAUSE','GOAL','SUB','END')),
  team_color text,
  player_id uuid,
  assist_id uuid,
  server_ts timestamptz DEFAULT now(),
  client_ts timestamptz,
  by_user_id uuid,
  meta jsonb
);
CREATE INDEX IF NOT EXISTS events_match_order_idx ON events (match_id, rodada, server_ts);

CREATE TABLE IF NOT EXISTS tiebreaker_event (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id uuid REFERENCES matches(id),
  rodada int,
  method text CHECK (method IN ('coin','wheel')),
  result_team text,
  detail text,
  ts timestamptz DEFAULT now(),
  by_user_id uuid
);

CREATE TABLE IF NOT EXISTS diarist_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id uuid REFERENCES matches(id),
  user_id uuid REFERENCES users(id),
  status text CHECK (status IN ('requested','accepted','payment_in_progress','paid','declined','full_blocked')) DEFAULT 'requested',
  accepted_by uuid REFERENCES users(id),
  accepted_at timestamptz,
  payment_id uuid
);

CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id),
  tipo text CHECK (tipo IN ('mensal','diaria')) NOT NULL,
  mes_ref text,         -- 'YYYY-MM' (mensal)
  match_id uuid,        -- (diaria)
  valor numeric(10,2),
  status text CHECK (status IN ('pendente','confirmado','cancelado','revisar')) DEFAULT 'pendente',
  provider text DEFAULT 'mercadopago',
  reference_text text,  -- Mensal: "Pagamento Mensalista Maestros FC - MM/AAAA"
                        -- Diaria: "Pagamento Diarista Maestros FC - DD/MM/AAAA"
  txid text,
  charge_id text,
  expires_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Créditos gerados quando partida enche após iniciar pagamento
CREATE TABLE IF NOT EXISTS credits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id),
  origin_payment_id uuid REFERENCES payments(id),
  amount numeric(10,2) NOT NULL,
  consumed boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS notice (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo text, corpo text, anexos jsonb,
  fixado boolean DEFAULT false,
  critico boolean DEFAULT false,
  expiracao timestamptz,
  created_by uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS notification_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scope text CHECK (scope IN ('mensal','diaria')),
  "when" text CHECK ("when" IN ('pre','due','post','paid')),
  canal text CHECK (canal IN ('push','inapp','both')) DEFAULT 'push',
  template_text text,
  version int DEFAULT 1,
  updated_by uuid,
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  action text,
  by_user_id uuid,
  before jsonb,
  after jsonb,
  ts timestamptz DEFAULT now()
);

-- 3) RLS (Row Level Security) + Policies
ALTER TABLE app_settings_venue ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_draw ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_appearance ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE tiebreaker_event ENABLE ROW LEVEL SECURITY;
ALTER TABLE diarist_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE notice ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Drop existing policies first (to avoid conflicts)
DROP POLICY IF EXISTS "venue_read_all" ON app_settings_venue;
DROP POLICY IF EXISTS "venue_write_owner" ON app_settings_venue;
DROP POLICY IF EXISTS "venue_insert_owner" ON app_settings_venue;
DROP POLICY IF EXISTS "users_select_self_or_admin" ON users;
DROP POLICY IF EXISTS "users_update_self" ON users;
DROP POLICY IF EXISTS "matches_select_all" ON matches;
DROP POLICY IF EXISTS "matches_cud_admin" ON matches;
DROP POLICY IF EXISTS "match_state_select_all" ON match_state;
DROP POLICY IF EXISTS "match_state_cud_ops" ON match_state;
DROP POLICY IF EXISTS "checkins_select_same_match" ON checkins;
DROP POLICY IF EXISTS "checkins_insert_self" ON checkins;
DROP POLICY IF EXISTS "checkins_update_admin" ON checkins;
DROP POLICY IF EXISTS "team_draw_select_all" ON team_draw;
DROP POLICY IF EXISTS "team_draw_cud_ops" ON team_draw;
DROP POLICY IF EXISTS "team_app_select_all" ON team_appearance;
DROP POLICY IF EXISTS "team_app_cud_ops" ON team_appearance;
DROP POLICY IF EXISTS "events_select_all" ON events;
DROP POLICY IF EXISTS "events_cud_ops" ON events;
DROP POLICY IF EXISTS "tb_select_all" ON tiebreaker_event;
DROP POLICY IF EXISTS "tb_cud_ops" ON tiebreaker_event;
DROP POLICY IF EXISTS "dr_select_self_or_admin" ON diarist_requests;
DROP POLICY IF EXISTS "dr_insert_self" ON diarist_requests;
DROP POLICY IF EXISTS "dr_update_admin" ON diarist_requests;
DROP POLICY IF EXISTS "pay_select_self_or_admin" ON payments;
DROP POLICY IF EXISTS "pay_block_cud_client" ON payments;
DROP POLICY IF EXISTS "credits_select_self_or_admin" ON credits;
DROP POLICY IF EXISTS "credits_block_cud_client" ON credits;
DROP POLICY IF EXISTS "notice_select_all" ON notice;
DROP POLICY IF EXISTS "notice_cud_admin" ON notice;
DROP POLICY IF EXISTS "tmpl_select_admin" ON notification_templates;
DROP POLICY IF EXISTS "tmpl_cud_owner" ON notification_templates;
DROP POLICY IF EXISTS "audit_select_admin" ON audit_log;
DROP POLICY IF EXISTS "audit_block_cud_client" ON audit_log;

-- Now create all policies
-- app_settings_venue: Owner lê/escreve; demais somente leitura
CREATE POLICY venue_read_all ON app_settings_venue
FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY venue_write_owner ON app_settings_venue
FOR UPDATE USING (public.is_owner());
CREATE POLICY venue_insert_owner ON app_settings_venue
FOR INSERT WITH CHECK (public.is_owner());

-- users
CREATE POLICY users_select_self_or_admin ON users
FOR SELECT USING (public.is_admin_or_owner() OR auth.uid() = auth_id);

CREATE POLICY users_update_self ON users
FOR UPDATE USING (auth.uid() = auth_id)
WITH CHECK (auth.uid() = auth_id);

-- Matches
CREATE POLICY matches_select_all ON matches
FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY matches_cud_admin ON matches
FOR ALL USING (public.is_admin_or_owner())
WITH CHECK (public.is_admin_or_owner());

-- match_state (só admin/aux/owner mexe; todos leem)
CREATE POLICY match_state_select_all ON match_state
FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY match_state_cud_ops ON match_state
FOR ALL USING (public.is_aux_admin_owner())
WITH CHECK (public.is_aux_admin_owner());

-- checkins
CREATE POLICY checkins_select_same_match ON checkins
FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY checkins_insert_self ON checkins
FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM users u WHERE u.auth_id = auth.uid() AND u.id = user_id)
);

CREATE POLICY checkins_update_admin ON checkins
FOR UPDATE USING (public.is_admin_or_owner());

-- team_draw
CREATE POLICY team_draw_select_all ON team_draw
FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY team_draw_cud_ops ON team_draw
FOR ALL USING (public.is_aux_admin_owner())
WITH CHECK (public.is_aux_admin_owner());

-- team_appearance
CREATE POLICY team_app_select_all ON team_appearance
FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY team_app_cud_ops ON team_appearance
FOR ALL USING (public.is_aux_admin_owner())
WITH CHECK (public.is_aux_admin_owner());

-- events
CREATE POLICY events_select_all ON events
FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY events_cud_ops ON events
FOR ALL USING (public.is_aux_admin_owner())
WITH CHECK (public.is_aux_admin_owner());

-- tiebreaker_event
CREATE POLICY tb_select_all ON tiebreaker_event
FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY tb_cud_ops ON tiebreaker_event
FOR ALL USING (public.is_aux_admin_owner())
WITH CHECK (public.is_aux_admin_owner());

-- diarist_requests
CREATE POLICY dr_select_self_or_admin ON diarist_requests
FOR SELECT USING (
  public.is_aux_admin_owner() OR
  EXISTS (SELECT 1 FROM users u WHERE u.auth_id = auth.uid() AND u.id = user_id)
);

CREATE POLICY dr_insert_self ON diarist_requests
FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM users u WHERE u.auth_id = auth.uid() AND u.id = user_id)
);

CREATE POLICY dr_update_admin ON diarist_requests
FOR UPDATE USING (public.is_admin_or_owner())
WITH CHECK (public.is_admin_or_owner());

-- payments (somente service role atualiza status; cliente só lê o que é seu)
CREATE POLICY pay_select_self_or_admin ON payments
FOR SELECT USING (
  public.is_admin_or_owner() OR
  EXISTS (SELECT 1 FROM users u WHERE u.auth_id = auth.uid() AND u.id = user_id)
);

-- Não permitir insert/update/delete pelo cliente; apenas via Edge Functions (service role)
CREATE POLICY pay_block_cud_client ON payments
FOR ALL USING (false) WITH CHECK (false);

-- credits (somente leitura para o dono; escrita via functions)
CREATE POLICY credits_select_self_or_admin ON credits
FOR SELECT USING (
  public.is_admin_or_owner() OR
  EXISTS (SELECT 1 FROM users u WHERE u.auth_id = auth.uid() AND u.id = user_id)
);
CREATE POLICY credits_block_cud_client ON credits
FOR ALL USING (false) WITH CHECK (false);

-- notice
CREATE POLICY notice_select_all ON notice
FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY notice_cud_admin ON notice
FOR ALL USING (public.is_admin_or_owner())
WITH CHECK (public.is_admin_or_owner());

-- notification_templates
CREATE POLICY tmpl_select_admin ON notification_templates
FOR SELECT USING (public.is_admin_or_owner());

CREATE POLICY tmpl_cud_owner ON notification_templates
FOR ALL USING (public.is_owner())
WITH CHECK (public.is_owner());

-- audit_log (somente admin/owner lê; escrita via service role)
CREATE POLICY audit_select_admin ON audit_log
FOR SELECT USING (public.is_admin_or_owner());

CREATE POLICY audit_block_cud_client ON audit_log
FOR ALL USING (false) WITH CHECK (false);

-- ========================================
-- FIM DO SCHEMA
-- ========================================
-- Execute este SQL completo no Supabase SQL Editor
-- Depois teste o login com Google em: https://appmaestrosfc.vercel.app/perfil
