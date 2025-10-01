-- Script SQL simples para criar função add_player
-- Execute este script no Supabase SQL Editor

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
  "position" text,
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
  
  -- Obter o ID do grupo atual (usando subquery para evitar ambiguidade)
  SELECT id INTO group_id 
  FROM (
    SELECT id, created_at 
    FROM groups 
    ORDER BY created_at DESC 
    LIMIT 1
  ) latest_group;
  
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
    p_position as "position",
    5 as stars,
    p_shirt_size as shirt_size,
    true as approved,
    now() as created_at;
END;
$$;

-- Verificar se a função foi criada
SELECT 
  'Função add_player criada com sucesso!' as status,
  routine_name,
  routine_type
FROM information_schema.routines 
WHERE routine_name = 'add_player' 
  AND routine_schema = 'public';



