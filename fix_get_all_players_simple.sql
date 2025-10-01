-- Script simples para corrigir a função get_all_memberships
-- Execute este script no Supabase SQL Editor

CREATE OR REPLACE FUNCTION get_all_memberships()
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
BEGIN
  -- Buscar apenas jogadores da tabela memberships (dados existentes)
  RETURN QUERY
  SELECT 
    m.user_id as id,
    COALESCE(pp.name, au.email) as name,
    au.email,
    m.role,
    COALESCE(pp.position_text, 'Meio') as "position",
    COALESCE(pp.stars, 5) as stars,
    COALESCE(pp.shirt_size, 'G') as shirt_size,
    COALESCE(pp.approved, true) as approved,
    m.created_at
  FROM memberships m
  LEFT JOIN auth.users au ON au.id = m.user_id
  LEFT JOIN player_profiles pp ON pp.user_id = m.user_id
  WHERE m.status = 'active'
  
  ORDER BY m.created_at DESC;
END;
$$;

-- Verificar se a função foi criada
SELECT 
  'Função get_all_memberships corrigida!' as status,
  routine_name,
  routine_type
FROM information_schema.routines 
WHERE routine_name = 'get_all_memberships'
  AND routine_schema = 'public';



