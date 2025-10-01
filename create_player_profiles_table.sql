-- Criar tabela para armazenar dados adicionais dos jogadores
-- Execute este script no Supabase SQL Editor

-- 1. Criar tabela player_profiles
CREATE TABLE IF NOT EXISTS player_profiles (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  position_text text NOT NULL DEFAULT 'Meia',
  shirt_size text NOT NULL DEFAULT 'G',
  stars integer NOT NULL DEFAULT 5,
  approved boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- 2. Habilitar RLS
ALTER TABLE player_profiles ENABLE ROW LEVEL SECURITY;

-- 3. Criar políticas RLS
CREATE POLICY "Users can view all player profiles" ON player_profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON player_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON player_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Owners can manage all profiles" ON player_profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM memberships m 
      WHERE m.user_id = auth.uid() 
      AND m.role IN ('owner', 'admin')
    )
  );

-- 4. Criar função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 5. Criar trigger para updated_at
CREATE TRIGGER update_player_profiles_updated_at 
  BEFORE UPDATE ON player_profiles 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- 6. Atualizar função get_all_memberships para incluir dados do perfil
CREATE OR REPLACE FUNCTION get_all_memberships()
RETURNS TABLE (
  id uuid,
  name text,
  email text,
  role text,
  position text,
  stars integer,
  shirt_size text,
  approved boolean,
  created_at timestamptz
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    m.user_id as id,
    COALESCE(pp.name, COALESCE(au.email::text, 'Usuário')) as name,
    COALESCE(au.email::text, 'email@exemplo.com') as email,
    m.role::text,
    COALESCE(pp.position_text, 'Meia')::text as position,
    COALESCE(pp.stars, 5) as stars,
    COALESCE(pp.shirt_size, 'G')::text as shirt_size,
    COALESCE(pp.approved, true) as approved,
    m.created_at
  FROM memberships m
  LEFT JOIN auth.users au ON m.user_id = au.id
  LEFT JOIN player_profiles pp ON m.user_id = pp.user_id
  WHERE m.status = 'active'
  ORDER BY m.created_at DESC;
$$;
