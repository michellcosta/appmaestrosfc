-- Migration: Sistema de Estatísticas de Jogadores
-- Data: 2025-01-27
-- Descrição: Criar tabelas para estatísticas completas de jogadores

-- Tabela para eventos de gol (autor, assistência, tempo, partida)
CREATE TABLE IF NOT EXISTS goal_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  assist_player_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  team_color TEXT NOT NULL CHECK (team_color IN ('Preto', 'Verde', 'Cinza', 'Vermelho')),
  minute INTEGER NOT NULL DEFAULT 0,
  round_number INTEGER NOT NULL DEFAULT 1,
  is_own_goal BOOLEAN DEFAULT FALSE,
  is_penalty BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID NOT NULL REFERENCES auth.users(id)
);

-- Tabela para participação de jogadores em partidas
CREATE TABLE IF NOT EXISTS player_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  team_color TEXT NOT NULL CHECK (team_color IN ('Preto', 'Verde', 'Cinza', 'Vermelho')),
  position TEXT DEFAULT 'field' CHECK (position IN ('field', 'substitute', 'goalkeeper')),
  minutes_played INTEGER DEFAULT 0,
  goals_scored INTEGER DEFAULT 0,
  assists INTEGER DEFAULT 0,
  yellow_cards INTEGER DEFAULT 0,
  red_cards INTEGER DEFAULT 0,
  rating DECIMAL(3,1) DEFAULT 0.0 CHECK (rating >= 0.0 AND rating <= 10.0),
  is_man_of_match BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(player_id, match_id)
);

-- Tabela para estatísticas agregadas de jogadores (cache para performance)
CREATE TABLE IF NOT EXISTS player_statistics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  total_matches INTEGER DEFAULT 0,
  total_minutes_played INTEGER DEFAULT 0,
  total_goals INTEGER DEFAULT 0,
  total_assists INTEGER DEFAULT 0,
  total_yellow_cards INTEGER DEFAULT 0,
  total_red_cards INTEGER DEFAULT 0,
  wins INTEGER DEFAULT 0,
  draws INTEGER DEFAULT 0,
  losses INTEGER DEFAULT 0,
  average_rating DECIMAL(3,1) DEFAULT 0.0,
  goals_per_match DECIMAL(4,2) DEFAULT 0.0,
  assists_per_match DECIMAL(4,2) DEFAULT 0.0,
  man_of_match_count INTEGER DEFAULT 0,
  last_match_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(player_id)
);

-- Tabela para eventos de cartões
CREATE TABLE IF NOT EXISTS card_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  team_color TEXT NOT NULL CHECK (team_color IN ('Preto', 'Verde', 'Cinza', 'Vermelho')),
  card_type TEXT NOT NULL CHECK (card_type IN ('yellow', 'red')),
  minute INTEGER NOT NULL DEFAULT 0,
  round_number INTEGER NOT NULL DEFAULT 1,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID NOT NULL REFERENCES auth.users(id)
);

-- Tabela para substituições
CREATE TABLE IF NOT EXISTS substitution_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  player_out_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  player_in_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  team_color TEXT NOT NULL CHECK (team_color IN ('Preto', 'Verde', 'Cinza', 'Vermelho')),
  minute INTEGER NOT NULL DEFAULT 0,
  round_number INTEGER NOT NULL DEFAULT 1,
  reason TEXT DEFAULT 'tactical',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID NOT NULL REFERENCES auth.users(id)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_goal_events_player_id ON goal_events(player_id);
CREATE INDEX IF NOT EXISTS idx_goal_events_match_id ON goal_events(match_id);
CREATE INDEX IF NOT EXISTS idx_goal_events_created_at ON goal_events(created_at);

CREATE INDEX IF NOT EXISTS idx_player_matches_player_id ON player_matches(player_id);
CREATE INDEX IF NOT EXISTS idx_player_matches_match_id ON player_matches(match_id);
CREATE INDEX IF NOT EXISTS idx_player_matches_created_at ON player_matches(created_at);

CREATE INDEX IF NOT EXISTS idx_player_statistics_player_id ON player_statistics(player_id);
CREATE INDEX IF NOT EXISTS idx_player_statistics_total_goals ON player_statistics(total_goals DESC);
CREATE INDEX IF NOT EXISTS idx_player_statistics_total_assists ON player_statistics(total_assists DESC);

CREATE INDEX IF NOT EXISTS idx_card_events_player_id ON card_events(player_id);
CREATE INDEX IF NOT EXISTS idx_card_events_match_id ON card_events(match_id);

CREATE INDEX IF NOT EXISTS idx_substitution_events_match_id ON substitution_events(match_id);
CREATE INDEX IF NOT EXISTS idx_substitution_events_player_out ON substitution_events(player_out_id);
CREATE INDEX IF NOT EXISTS idx_substitution_events_player_in ON substitution_events(player_in_id);

-- RLS (Row Level Security)
ALTER TABLE goal_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_statistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE card_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE substitution_events ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para goal_events
CREATE POLICY "Users can view goal events for their matches" ON goal_events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM matches m 
      WHERE m.id = goal_events.match_id 
      AND (
        m.created_by = auth.uid() OR
        EXISTS (
          SELECT 1 FROM player_matches pm 
          WHERE pm.match_id = m.id AND pm.player_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Staff can insert goal events" ON goal_events
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles up 
      WHERE up.user_id = auth.uid() 
      AND up.role IN ('owner', 'admin', 'aux')
    )
  );

CREATE POLICY "Staff can update goal events" ON goal_events
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_profiles up 
      WHERE up.user_id = auth.uid() 
      AND up.role IN ('owner', 'admin', 'aux')
    )
  );

CREATE POLICY "Staff can delete goal events" ON goal_events
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM user_profiles up 
      WHERE up.user_id = auth.uid() 
      AND up.role IN ('owner', 'admin', 'aux')
    )
  );

-- Políticas RLS para player_matches
CREATE POLICY "Users can view their own match participation" ON player_matches
  FOR SELECT USING (player_id = auth.uid());

CREATE POLICY "Staff can manage player matches" ON player_matches
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles up 
      WHERE up.user_id = auth.uid() 
      AND up.role IN ('owner', 'admin', 'aux')
    )
  );

-- Políticas RLS para player_statistics
CREATE POLICY "Users can view all player statistics" ON player_statistics
  FOR SELECT USING (true);

CREATE POLICY "System can update player statistics" ON player_statistics
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles up 
      WHERE up.user_id = auth.uid() 
      AND up.role IN ('owner', 'admin', 'aux')
    )
  );

-- Políticas RLS para card_events
CREATE POLICY "Users can view card events for their matches" ON card_events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM matches m 
      WHERE m.id = card_events.match_id 
      AND (
        m.created_by = auth.uid() OR
        EXISTS (
          SELECT 1 FROM player_matches pm 
          WHERE pm.match_id = m.id AND pm.player_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Staff can manage card events" ON card_events
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles up 
      WHERE up.user_id = auth.uid() 
      AND up.role IN ('owner', 'admin', 'aux')
    )
  );

-- Políticas RLS para substitution_events
CREATE POLICY "Users can view substitution events for their matches" ON substitution_events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM matches m 
      WHERE m.id = substitution_events.match_id 
      AND (
        m.created_by = auth.uid() OR
        EXISTS (
          SELECT 1 FROM player_matches pm 
          WHERE pm.match_id = m.id AND pm.player_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Staff can manage substitution events" ON substitution_events
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles up 
      WHERE up.user_id = auth.uid() 
      AND up.role IN ('owner', 'admin', 'aux')
    )
  );

-- Função para atualizar estatísticas do jogador
CREATE OR REPLACE FUNCTION update_player_statistics(player_uuid UUID)
RETURNS VOID AS $$
BEGIN
  INSERT INTO player_statistics (
    player_id,
    total_matches,
    total_minutes_played,
    total_goals,
    total_assists,
    total_yellow_cards,
    total_red_cards,
    wins,
    draws,
    losses,
    average_rating,
    goals_per_match,
    assists_per_match,
    man_of_match_count,
    last_match_date,
    updated_at
  )
  SELECT 
    player_uuid,
    COUNT(DISTINCT pm.match_id) as total_matches,
    COALESCE(SUM(pm.minutes_played), 0) as total_minutes_played,
    COALESCE(SUM(pm.goals_scored), 0) as total_goals,
    COALESCE(SUM(pm.assists), 0) as total_assists,
    COALESCE(SUM(pm.yellow_cards), 0) as total_yellow_cards,
    COALESCE(SUM(pm.red_cards), 0) as total_red_cards,
    COUNT(CASE WHEN pm.rating >= 7.0 THEN 1 END) as wins,
    COUNT(CASE WHEN pm.rating >= 5.0 AND pm.rating < 7.0 THEN 1 END) as draws,
    COUNT(CASE WHEN pm.rating < 5.0 THEN 1 END) as losses,
    COALESCE(AVG(pm.rating), 0.0) as average_rating,
    CASE 
      WHEN COUNT(DISTINCT pm.match_id) > 0 
      THEN ROUND(COALESCE(SUM(pm.goals_scored), 0)::DECIMAL / COUNT(DISTINCT pm.match_id), 2)
      ELSE 0.0 
    END as goals_per_match,
    CASE 
      WHEN COUNT(DISTINCT pm.match_id) > 0 
      THEN ROUND(COALESCE(SUM(pm.assists), 0)::DECIMAL / COUNT(DISTINCT pm.match_id), 2)
      ELSE 0.0 
    END as assists_per_match,
    COALESCE(SUM(CASE WHEN pm.is_man_of_match THEN 1 ELSE 0 END), 0) as man_of_match_count,
    MAX(m.created_at) as last_match_date,
    NOW() as updated_at
  FROM player_matches pm
  JOIN matches m ON m.id = pm.match_id
  WHERE pm.player_id = player_uuid
  ON CONFLICT (player_id) DO UPDATE SET
    total_matches = EXCLUDED.total_matches,
    total_minutes_played = EXCLUDED.total_minutes_played,
    total_goals = EXCLUDED.total_goals,
    total_assists = EXCLUDED.total_assists,
    total_yellow_cards = EXCLUDED.total_yellow_cards,
    total_red_cards = EXCLUDED.total_red_cards,
    wins = EXCLUDED.wins,
    draws = EXCLUDED.draws,
    losses = EXCLUDED.losses,
    average_rating = EXCLUDED.average_rating,
    goals_per_match = EXCLUDED.goals_per_match,
    assists_per_match = EXCLUDED.assists_per_match,
    man_of_match_count = EXCLUDED.man_of_match_count,
    last_match_date = EXCLUDED.last_match_date,
    updated_at = EXCLUDED.updated_at;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para atualizar estatísticas quando player_matches é modificado
CREATE OR REPLACE FUNCTION trigger_update_player_statistics()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    PERFORM update_player_statistics(OLD.player_id);
    RETURN OLD;
  ELSE
    PERFORM update_player_statistics(NEW.player_id);
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_player_statistics_trigger
  AFTER INSERT OR UPDATE OR DELETE ON player_matches
  FOR EACH ROW EXECUTE FUNCTION trigger_update_player_statistics();

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_player_matches_updated_at
  BEFORE UPDATE ON player_matches
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_player_statistics_updated_at
  BEFORE UPDATE ON player_statistics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Comentários nas tabelas
COMMENT ON TABLE goal_events IS 'Registra todos os gols marcados nas partidas com autor, assistência e detalhes';
COMMENT ON TABLE player_matches IS 'Registra a participação e performance de cada jogador em cada partida';
COMMENT ON TABLE player_statistics IS 'Estatísticas agregadas dos jogadores (cache para performance)';
COMMENT ON TABLE card_events IS 'Registra cartões amarelos e vermelhos aplicados';
COMMENT ON TABLE substitution_events IS 'Registra todas as substituições realizadas nas partidas';
