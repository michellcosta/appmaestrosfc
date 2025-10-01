-- Execute no editor SQL do Supabase
-- Verificar políticas RLS atuais
SELECT * FROM pg_policies WHERE tablename = 'profiles';

-- Remover políticas existentes se necessário
DROP POLICY IF EXISTS "profiles: read self" ON profiles;
DROP POLICY IF EXISTS "profiles: staff read" ON profiles;
DROP POLICY IF EXISTS "profiles: update self" ON profiles;
DROP POLICY IF EXISTS "profiles: owner update all" ON profiles;
DROP POLICY IF EXISTS "profiles: insert self" ON profiles;
DROP POLICY IF EXISTS "profiles: owner insert all" ON profiles;

-- Criar políticas mais permissivas para desenvolvimento
CREATE POLICY "profiles: enable all for authenticated users" ON profiles
    FOR ALL USING (auth.uid() IS NOT NULL);

-- OU criar políticas específicas para owner/admin
CREATE POLICY "profiles: owner can do everything" ON profiles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles p 
            WHERE p.id = auth.uid() 
            AND p.role IN ('owner', 'admin')
        )
    );

-- Permitir inserção para usuários autenticados
CREATE POLICY "profiles: allow insert for authenticated" ON profiles
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Permitir leitura para todos os usuários autenticados
CREATE POLICY "profiles: allow read for authenticated" ON profiles
    FOR SELECT USING (auth.uid() IS NOT NULL);

-- Permitir atualização para owner/admin
CREATE POLICY "profiles: allow update for staff" ON profiles
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles p 
            WHERE p.id = auth.uid() 
            AND p.role IN ('owner', 'admin')
        )
    );
