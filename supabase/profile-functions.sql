
-- Função para criar perfil de usuário
CREATE OR REPLACE FUNCTION create_user_profile(
    user_id UUID,
    user_email TEXT,
    user_name TEXT DEFAULT NULL,
    user_role TEXT DEFAULT 'diarista'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    profile_id UUID;
BEGIN
    -- Gerar ID único para o perfil
    profile_id := gen_random_uuid();
    
    -- Inserir perfil na tabela profiles
    INSERT INTO profiles (
        id,
        email,
        role,
        membership,
        position,
        stars,
        notifications_enabled,
        updated_at
    ) VALUES (
        profile_id,
        user_email,
        user_role,
        CASE WHEN user_role = 'mensalista' THEN 'mensalista' ELSE 'diarista' END,
        'Meio',
        5,
        true,
        NOW()
    );
    
    RETURN profile_id;
END;
$$;


-- Função para obter perfil do usuário
CREATE OR REPLACE FUNCTION get_user_profile(user_email TEXT)
RETURNS TABLE (
    id UUID,
    email TEXT,
    role TEXT,
    membership TEXT,
    position TEXT,
    stars INTEGER,
    notifications_enabled BOOLEAN,
    updated_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.email,
        p.role,
        p.membership,
        p.position,
        p.stars,
        p.notifications_enabled,
        p.updated_at
    FROM profiles p
    WHERE p.email = user_email;
END;
$$;
