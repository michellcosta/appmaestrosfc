
-- Migração para corrigir problemas RLS
-- Execute este arquivo no Supabase SQL Editor

-- 1. Aplicar políticas RLS

-- Habilitar RLS na tabela profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Política para permitir leitura para todos os usuários autenticados
CREATE POLICY "Allow authenticated users to read profiles" ON profiles
    FOR SELECT
    TO authenticated
    USING (true);

-- Política para permitir inserção para usuários autenticados
CREATE POLICY "Allow authenticated users to insert profiles" ON profiles
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Política para permitir atualização para usuários autenticados
CREATE POLICY "Allow authenticated users to update profiles" ON profiles
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Política para permitir exclusão para usuários autenticados
CREATE POLICY "Allow authenticated users to delete profiles" ON profiles
    FOR DELETE
    TO authenticated
    USING (true);


-- 2. Criar funções auxiliares

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


-- 3. Verificar se as políticas foram aplicadas
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename = 'profiles';
