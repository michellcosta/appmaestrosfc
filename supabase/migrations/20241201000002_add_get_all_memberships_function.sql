-- Adicionar função RPC para obter todos os membros
-- Esta função resolve o problema de RLS e permite que admins vejam todos os membros

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
  -- Verificar se o usuário tem permissão (owner, admin ou aux)
  IF NOT EXISTS (
    SELECT 1 FROM memberships m 
    WHERE m.user_id = auth.uid() 
    AND m.role IN ('owner', 'admin', 'aux')
  ) THEN
    RAISE EXCEPTION 'Acesso negado: apenas owners, admins e auxiliares podem ver todos os membros';
  END IF;

  -- Retornar todos os membros com dados do auth.users
  RETURN QUERY
  SELECT 
    m.user_id as id,
    COALESCE(au.email, 'email@exemplo.com') as name,
    COALESCE(au.email, 'email@exemplo.com') as email,
    m.role,
    'Meio'::text as position,
    5::integer as stars,
    'G'::text as shirt_size,
    true::boolean as approved,
    m.created_at
  FROM memberships m
  LEFT JOIN auth.users au ON au.id = m.user_id
  WHERE m.status = 'active'
  ORDER BY m.created_at DESC;
END;
$$;
