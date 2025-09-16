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
