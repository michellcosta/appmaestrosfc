-- ============================================
-- Nexus Play - VERIFICAR STATUS DO APP
-- Executar este código no Supabase SQL Editor
-- ============================================

-- 1. Verificar estrutura completa do banco
SELECT 
  'ESTRUTURA DO BANCO:' as status,
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- 2. Verificar se RLS está habilitado
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- 3. Verificar políticas RLS
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 4. Verificar se há dados nas tabelas
SELECT 
  'public.groups' as tabela,
  COUNT(*) as registros
FROM public.groups
UNION ALL
SELECT 
  'public.memberships' as tabela,
  COUNT(*) as registros
FROM public.memberships
UNION ALL
SELECT 
  'public.wallets' as tabela,
  COUNT(*) as registros
FROM public.wallets
UNION ALL
SELECT 
  'auth.users' as tabela,
  COUNT(*) as registros
FROM auth.users;

-- 5. Verificar se o sistema está funcionando
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM public.groups) 
    AND EXISTS (SELECT 1 FROM public.memberships)
    AND EXISTS (SELECT 1 FROM auth.users)
    THEN '✅ SISTEMA FUNCIONANDO'
    ELSE '❌ SISTEMA COM PROBLEMAS'
  END as status_sistema;

-- ============================================
-- FIM - Diagnóstico completo do sistema
-- ============================================
