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
