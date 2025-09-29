-- ============================================
-- Nexus Play - VERIFICAR ESTRUTURA DO BANCO
-- Executar este código no Supabase SQL Editor
-- ============================================

-- 1. Verificar todas as tabelas públicas
SELECT 
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- 2. Verificar se existe tabela users
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'users'
    ) THEN '✅ Tabela users EXISTE'
    ELSE '❌ Tabela users NÃO EXISTE'
  END as status_users;

-- 3. Verificar colunas da tabela memberships
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'memberships'
ORDER BY ordinal_position;

-- 4. Verificar colunas da tabela groups
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'groups'
ORDER BY ordinal_position;

-- 5. Verificar dados atuais
SELECT 
  'auth.users' as tabela,
  COUNT(*) as total_registros
FROM auth.users
UNION ALL
SELECT 
  'public.memberships' as tabela,
  COUNT(*) as total_registros
FROM public.memberships
UNION ALL
SELECT 
  'public.groups' as tabela,
  COUNT(*) as total_registros
FROM public.groups;

-- ============================================
-- FIM - Diagnóstico da estrutura do banco
-- ============================================
