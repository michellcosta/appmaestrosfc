#!/usr/bin/env bash
set -euo pipefail

# Garante pastas
mkdir -p src/lib
mkdir -p supabase/migrations

# .env.example
cat > .env.example <<'EOF'
# Supabase
VITE_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR-ANON-KEY
# Somente em server-side / Edge (NÃO expor no front)
SUPABASE_SERVICE_ROLE_KEY=YOUR-SERVICE-ROLE-KEY

# Mercado Pago (server/Edge)
MP_ACCESS_TOKEN=YOUR-MERCADO-PAGO-ACCESS-TOKEN

# OneSignal (opcional/cliente)
NEXT_PUBLIC_ONESIGNAL_APP_ID=
EOF

# src/lib/supabase.ts
cat > src/lib/supabase.ts <<'EOF'
// Supabase Client (Front)
// Usa Vite env vars: VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  // Ajuda no diagnóstico em dev; em prod, pode silenciar se preferir
  // eslint-disable-next-line no-console
  console.warn('[Supabase] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
EOF

# supabase/migrations/0001_schema.sql
cat > supabase/migrations/0001_schema.sql <<'EOF'
-- SCHEMA: Maestros FC (Tabelas principais)
-- OBS: team_color suporta as 5 cores, incluindo 'Vermelho'

create table if not exists app_settings_venue (
  id text primary key default 'venue',
  name text not null,
  address text,
  lat double precision not null,
  lng double precision not null,
  radius_m integer not null default 30,
  updated_by uuid,
  updated_at timestamptz not null default now()
);

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  auth_id uuid, -- supabase auth.users.id
  name text not null,
  email text,
  role text check (role in ('owner','admin','aux','mensalista','diarista')) not null default 'diarista',
  status text,
  posicao text,
  estrelas integer check (estrelas between 0 and 10) default 0,
  tamanho_camisa text check (tamanho_camisa in ('G','GG')),
  aprovado boolean default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- (... resto do schema continua, mas já está no script completo que te mandei antes ...)
EOF

# supabase/migrations/0002_policies.sql
cat > supabase/migrations/0002_policies.sql <<'EOF'
-- RLS / Policies
alter table app_settings_venue enable row level security;
alter table users enable row level security;
alter table matches enable row level security;
-- (continua igual ao patch que te passei antes)
EOF

# supabase/seed.sql
cat > supabase/seed.sql <<'EOF'
-- Seed: 1 venue, 1 jogo futuro, 3 usuários exemplo
insert into app_settings_venue (id, name, address, lat, lng, radius_m, updated_by)
values ('venue', 'Campo do Maestros', 'Rua das Flores, 123', -22.826, -43.053, 30, null)
on conflict (id) do update set name=excluded.name;

insert into users (name, email, role, posicao, estrelas, tamanho_camisa, aprovado)
values 
('Owner Maestros', 'owner@maestrosfc.test', 'owner', 'Gol', 8, 'G', true),
('Admin Sec', 'admin@maestrosfc.test', 'admin', 'Meio', 7, 'GG', true),
('Mensalista X', 'mensal@maestrosfc.test', 'mensalista', 'Atacante', 6, 'G', true)
on conflict do nothing;

insert into matches (data_hora, max_jogadores, status, gk_mode, notes, created_by)
select now() + interval '2 days', 24, 'open', 'two_fixed', 'Jogo padrão (seed)', u.id
from users u
where u.role='owner'
limit 1;

insert into match_state (match_id, rev, status)
select m.id, 0, 'idle'
from matches m
where not exists (select 1 from match_state ms where ms.match_id=m.id)
limit 1;
EOF

echo "✅ Arquivos criados. Agora rode: npm i @supabase/supabase-js"

