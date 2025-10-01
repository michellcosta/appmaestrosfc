-- Script para corrigir a função get_all_memberships
-- A função deve filtrar apenas jogadores aprovados e ativos

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
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pp.user_id as id,
    pp.name,
    COALESCE(au.email, '') as email,
    COALESCE(m.role, 'diarista') as role,
    pp.position_text as position,
    COALESCE(pp.stars, 5) as stars,
    COALESCE(pp.shirt_size, 'G') as shirt_size,
    COALESCE(pp.approved, true) as approved,
    COALESCE(pp.created_at, now()) as created_at
  FROM player_profiles pp
  LEFT JOIN memberships m ON pp.user_id = m.user_id
  LEFT JOIN auth.users au ON pp.user_id = au.id
  WHERE pp.approved = true  -- FILTRO CRÍTICO: apenas jogadores aprovados
  ORDER BY pp.created_at DESC;
END;
$$;



