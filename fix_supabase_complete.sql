-- Script SQL completo para corrigir o Supabase
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
DROP POLICY IF EXISTS "Users can view all player profiles" ON player_profiles;
CREATE POLICY "Users can view all player profiles" ON player_profiles
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert their own profile" ON player_profiles;
CREATE POLICY "Users can insert their own profile" ON player_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own profile" ON player_profiles;
CREATE POLICY "Users can update their own profile" ON player_profiles
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Owners can manage all profiles" ON player_profiles;
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
DROP TRIGGER IF EXISTS update_player_profiles_updated_at ON player_profiles;
CREATE TRIGGER update_player_profiles_updated_at 
  BEFORE UPDATE ON player_profiles 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- 6. Atualizar função get_all_memberships
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

-- 7. Criar função add_player
CREATE OR REPLACE FUNCTION add_player(
  p_name text,
  p_email text,
  p_role text,
  p_position text,
  p_shirt_size text
)
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
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_user_id uuid;
  group_id uuid;
BEGIN
  -- Gerar um UUID para o usuário
  new_user_id := gen_random_uuid();
  
  -- Obter o ID do grupo atual
  SELECT id INTO group_id 
  FROM groups 
  ORDER BY created_at DESC 
  LIMIT 1;
  
  -- Se não houver grupo, criar um
  IF group_id IS NULL THEN
    INSERT INTO groups (id, name, owner_id, created_at)
    VALUES (
      gen_random_uuid(),
      'Grupo Padrão',
      COALESCE(auth.uid(), (SELECT id FROM auth.users LIMIT 1)),
      now()
    )
    RETURNING id INTO group_id;
  END IF;
  
  -- Criar o membership
  INSERT INTO memberships (user_id, group_id, role, status, created_at)
  VALUES (
    new_user_id,
    group_id,
    p_role,
    'active',
    now()
  )
  ON CONFLICT (user_id, group_id) DO UPDATE SET
    role = EXCLUDED.role,
    status = 'active',
    created_at = now();
  
  -- Criar perfil do jogador
  INSERT INTO player_profiles (user_id, name, position_text, shirt_size, stars, approved)
  VALUES (
    new_user_id,
    p_name,
    p_position,
    p_shirt_size,
    5,
    true
  )
  ON CONFLICT (user_id) DO UPDATE SET
    name = EXCLUDED.name,
    position_text = EXCLUDED.position_text,
    shirt_size = EXCLUDED.shirt_size,
    stars = EXCLUDED.stars,
    approved = EXCLUDED.approved;
  
  -- Retornar os dados do jogador
  RETURN QUERY
  SELECT 
    new_user_id as id,
    p_name as name,
    p_email as email,
    p_role as role,
    p_position as position,
    5 as stars,
    p_shirt_size as shirt_size,
    true as approved,
    now() as created_at;
END;
$$;

-- 8. Migrar dados existentes
INSERT INTO player_profiles (user_id, name, position_text, shirt_size, stars, approved)
SELECT 
  m.user_id,
  COALESCE(au.email::text, 'Usuário') as name,
  'Meia' as position_text,
  'G' as shirt_size,
  5 as stars,
  true as approved
FROM memberships m
LEFT JOIN auth.users au ON m.user_id = au.id
LEFT JOIN player_profiles pp ON m.user_id = pp.user_id
WHERE m.status = 'active' 
  AND pp.user_id IS NULL;

-- 9. Verificar resultado
SELECT 
  'Configuração concluída' as status,
  (SELECT COUNT(*) FROM player_profiles) as total_profiles,
  (SELECT COUNT(*) FROM memberships WHERE status = 'active') as total_memberships;



