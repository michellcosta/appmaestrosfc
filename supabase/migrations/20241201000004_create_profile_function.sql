-- Função para criar profiles contornando RLS
-- Esta função permite que usuários autenticados criem seus próprios profiles

CREATE OR REPLACE FUNCTION create_profile(
  profile_id uuid,
  profile_email text,
  profile_role text DEFAULT 'player'
)
RETURNS TABLE (
  id uuid,
  email text,
  role text,
  updated_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verificar se o usuário está autenticado
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Usuário não autenticado';
  END IF;
  
  -- Verificar se o profile_id corresponde ao usuário autenticado
  IF profile_id != auth.uid() THEN
    RAISE EXCEPTION 'Você só pode criar seu próprio perfil';
  END IF;
  
  -- Inserir ou atualizar o profile
  INSERT INTO profiles (id, email, role, updated_at)
  VALUES (profile_id, profile_email, profile_role, now())
  ON CONFLICT (id) 
  DO UPDATE SET 
    email = EXCLUDED.email,
    role = EXCLUDED.role,
    updated_at = now()
  RETURNING profiles.id, profiles.email, profiles.role, profiles.updated_at;
END;
$$;

-- Comentário explicativo
COMMENT ON FUNCTION create_profile IS 'Permite que usuários autenticados criem ou atualizem seus próprios profiles, contornando RLS';


