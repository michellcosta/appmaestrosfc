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
