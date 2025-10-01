#!/usr/bin/env node

/**
 * Script para corrigir problemas de RLS no Supabase
 * Implementa políticas corretas para permitir operações CRUD
 */

import fs from 'fs';

console.log('🔧 CORRIGINDO PROBLEMAS DE RLS - MAESTROS FC');
console.log('=============================================\n');

// Políticas RLS para a tabela profiles
const rlsPolicies = `
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
`;

// Função para criar perfil de usuário
const createProfileFunction = `
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
`;

// Função para obter perfil do usuário
const getProfileFunction = `
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
`;

console.log('📝 Gerando arquivos SQL para correção...');

// Salvar políticas RLS
fs.writeFileSync('supabase/rls-policies.sql', rlsPolicies);
console.log('✅ Arquivo RLS policies criado: supabase/rls-policies.sql');

// Salvar funções SQL
fs.writeFileSync('supabase/profile-functions.sql', createProfileFunction + '\n' + getProfileFunction);
console.log('✅ Arquivo profile functions criado: supabase/profile-functions.sql');

// Criar arquivo de migração
const migrationContent = `
-- Migração para corrigir problemas RLS
-- Execute este arquivo no Supabase SQL Editor

-- 1. Aplicar políticas RLS
${rlsPolicies}

-- 2. Criar funções auxiliares
${createProfileFunction}

${getProfileFunction}

-- 3. Verificar se as políticas foram aplicadas
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename = 'profiles';
`;

fs.writeFileSync('supabase/migrations/20241201000005_fix_rls_policies.sql', migrationContent);
console.log('✅ Migração criada: supabase/migrations/20241201000005_fix_rls_policies.sql');

console.log('\n🎯 PRÓXIMOS PASSOS:');
console.log('1. Acesse o Supabase Dashboard');
console.log('2. Vá para SQL Editor');
console.log('3. Execute o arquivo: supabase/migrations/20241201000005_fix_rls_policies.sql');
console.log('4. Verifique se as políticas foram aplicadas');
console.log('5. Teste o sistema de jogadores');

console.log('\n💡 ALTERNATIVA (se não tiver acesso ao Supabase):');
console.log('1. Use o cliente Supabase local');
console.log('2. Execute: npx supabase db push');
console.log('3. Ou execute as queries manualmente no dashboard');

console.log('\n🔍 Para verificar se funcionou:');
console.log('1. npm run dev');
console.log('2. Login como Owner');
console.log('3. Ir para /manage-players');
console.log('4. Tentar adicionar um jogador');
console.log('5. Verificar se persiste no banco');

