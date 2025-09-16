-- Monthly Awards - schema + RLS + view
create table if not exists monthly_awards (
  id         uuid primary key default gen_random_uuid(),
  month_key  date not null,
  category   text not null check (category in ('Goleiro','Zagueiro','Meia','Atacante')),
  winner_id  uuid not null references profiles(id) on delete restrict,
  votes      int  not null,
  decided_at timestamptz not null default now(),
  basis      text not null default 'sumVotes',
  unique (month_key, category)
);

create index if not exists idx_monthly_awards_month_key on monthly_awards(month_key);
create index if not exists idx_monthly_awards_winner on monthly_awards(winner_id);

alter table monthly_awards enable row level security;

drop policy if exists "awards: all read" on monthly_awards;
create policy "awards: all read" on monthly_awards for select using (true);

drop policy if exists "awards: no write" on monthly_awards;
create policy "awards: no write" on monthly_awards for all using (false) with check (false);

create or replace view v_monthly_awards_with_names as
select
  ma.month_key,
  ma.category,
  ma.winner_id,
  p.name as winner_name,
  ma.votes,
  ma.decided_at,
  ma.basis
from monthly_awards ma
left join profiles p on p.id = ma.winner_id;
