-- =====================================================
-- MIGRATION: Sorteio de Times → Partida → Gols
-- Objetivo: Integrar jogadores cadastrados ao sistema
-- de sorteio e partidas com persistência no Supabase
-- =====================================================

-- 1. TABELA: matches (partidas)
-- Armazena informações de partidas criadas a partir do sorteio
CREATE TABLE IF NOT EXISTS matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES groups(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'ongoing', 'finished')),
  started_at TIMESTAMPTZ,
  finished_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. TABELA: teams (times da partida)
-- Cada partida tem 2-4 times (Preto, Verde, Cinza, Vermelho)
CREATE TABLE IF NOT EXISTS teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  name TEXT NOT NULL, -- Preto, Verde, Cinza, Vermelho
  color TEXT, -- hex color ou nome da cor
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. TABELA: match_players (jogadores em cada partida/time)
-- Relaciona jogadores aos times de uma partida específica
CREATE TABLE IF NOT EXISTS match_players (
  match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE RESTRICT,
  starter BOOLEAN NOT NULL DEFAULT TRUE,
  substituted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (match_id, player_id)
);

-- 4. TABELA: goals (gols marcados)
-- Registra todos os gols de uma partida
CREATE TABLE IF NOT EXISTS goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
  player_id UUID REFERENCES players(id) ON DELETE SET NULL,
  assist_player_id UUID REFERENCES players(id) ON DELETE SET NULL,
  minute INT,
  round INT, -- rodada da partida (1, 2, 3...)
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_matches_group_id ON matches(group_id);
CREATE INDEX IF NOT EXISTS idx_matches_status ON matches(status);
CREATE INDEX IF NOT EXISTS idx_teams_match_id ON teams(match_id);
CREATE INDEX IF NOT EXISTS idx_match_players_match_id ON match_players(match_id);
CREATE INDEX IF NOT EXISTS idx_match_players_team_id ON match_players(team_id);
CREATE INDEX IF NOT EXISTS idx_match_players_player_id ON match_players(player_id);
CREATE INDEX IF NOT EXISTS idx_goals_match_id ON goals(match_id);
CREATE INDEX IF NOT EXISTS idx_goals_team_id ON goals(team_id);
CREATE INDEX IF NOT EXISTS idx_goals_player_id ON goals(player_id);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_matches_updated_at
    BEFORE UPDATE ON matches
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Habilitar RLS nas tabelas
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;

-- Políticas básicas (todos autenticados podem ler/escrever por enquanto)
-- NOTA: Em produção, ajuste para filtrar por group_id do usuário

-- Matches: todos autenticados podem ler e criar
CREATE POLICY "matches_select_policy" ON matches
  FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "matches_insert_policy" ON matches
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "matches_update_policy" ON matches
  FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Teams: todos autenticados podem ler e criar
CREATE POLICY "teams_select_policy" ON teams
  FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "teams_insert_policy" ON teams
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Match Players: todos autenticados podem ler e criar
CREATE POLICY "match_players_select_policy" ON match_players
  FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "match_players_insert_policy" ON match_players
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "match_players_update_policy" ON match_players
  FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Goals: todos autenticados podem ler e criar
CREATE POLICY "goals_select_policy" ON goals
  FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "goals_insert_policy" ON goals
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "goals_delete_policy" ON goals
  FOR DELETE
  USING (auth.role() = 'authenticated');

-- =====================================================
-- VIEWS ÚTEIS
-- =====================================================

-- View para ver partidas com times e jogadores
CREATE OR REPLACE VIEW match_summary AS
SELECT
  m.id AS match_id,
  m.status,
  m.started_at,
  m.finished_at,
  t.id AS team_id,
  t.name AS team_name,
  t.color AS team_color,
  COUNT(DISTINCT mp.player_id) AS player_count,
  COUNT(DISTINCT g.id) AS goal_count
FROM matches m
LEFT JOIN teams t ON t.match_id = m.id
LEFT JOIN match_players mp ON mp.team_id = t.id
LEFT JOIN goals g ON g.team_id = t.id
GROUP BY m.id, m.status, m.started_at, m.finished_at, t.id, t.name, t.color
ORDER BY m.created_at DESC;

-- =====================================================
-- COMENTÁRIOS
-- =====================================================

COMMENT ON TABLE matches IS 'Partidas criadas a partir do sorteio de times';
COMMENT ON TABLE teams IS 'Times de uma partida (Preto, Verde, Cinza, Vermelho)';
COMMENT ON TABLE match_players IS 'Jogadores alocados em times para cada partida';
COMMENT ON TABLE goals IS 'Gols marcados durante as partidas';
COMMENT ON VIEW match_summary IS 'Resumo de partidas com contagem de jogadores e gols por time';
