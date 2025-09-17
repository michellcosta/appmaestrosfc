-- ===========================
-- Views p/ Ranking (Supabase)
-- ===========================

-- Premissas de tabelas:
--   profiles(id uuid, name text, position text?)
--   goal_events(id uuid, author_id uuid, assist_id uuid null, ts timestamptz)
--   ballot_choices(id uuid, poll_id uuid, category text, player_id uuid, voter_id uuid, created_at timestamptz)
--   poll_weeks(id uuid, opens_at timestamptz, closes_at timestamptz)

create or replace view v_player_stats as
with g as (
  select author_id as player_id,
         count(*)::int as goals,
         max(ts) as last_goal_at
  from goal_events
  group by author_id
),
a as (
  select assist_id as player_id,
         count(*)::int as assists,
         max(ts) as last_assist_at
  from goal_events
  where assist_id is not null
  group by assist_id
)
select
  p.id as player_id,
  p.name,
  coalesce(g.goals, 0) as goals,
  coalesce(a.assists, 0) as assists,
  greatest(coalesce(g.last_goal_at, '1970-01-01'::timestamptz),
           coalesce(a.last_assist_at, '1970-01-01'::timestamptz)) as last_event_at
from profiles p
left join g on g.player_id = p.id
left join a on a.player_id = p.id;

-- alternativa simples com os mesmos campos
create or replace view v_goals_assists as
select * from v_player_stats;

-- votação atual da semana (apenas 1 ativa)
create or replace view v_current_polls as
select id as poll_id, opens_at, closes_at
from poll_weeks
where now() between opens_at and closes_at
order by opens_at desc
limit 1;

-- votos do mês corrente agregados por jogador
create or replace view v_monthly_votes_current as
select
  bc.player_id,
  p.name,
  count(*)::int as votes
from ballot_choices bc
left join profiles p on p.id = bc.player_id
where date_trunc('month', bc.created_at) = date_trunc('month', now())
group by bc.player_id, p.name;
