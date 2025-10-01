
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
