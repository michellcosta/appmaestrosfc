-- ============================================
-- Nexus Play - DEBUG: VERIFICAR USUÁRIOS
-- Executar este código no Supabase SQL Editor
-- ============================================

-- 1. Verificar se há usuários no auth.users
SELECT 
  'auth.users' as tabela,
  COUNT(*) as total_usuarios
FROM auth.users;

-- 2. Listar todos os usuários do auth.users
SELECT 
  id,
  email,
  created_at
FROM auth.users
ORDER BY created_at;

-- 3. Verificar se há memberships
SELECT 
  'public.memberships' as tabela,
  COUNT(*) as total_memberships
FROM public.memberships;

-- 4. Listar memberships com detalhes
SELECT 
  m.role as membership_role,
  u.email,
  g.name as grupo,
  m.created_at
FROM public.memberships m
LEFT JOIN auth.users u ON u.id = m.user_id
LEFT JOIN public.groups g ON g.id = m.group_id
ORDER BY m.created_at;

-- 5. Verificar se há grupos
SELECT 
  'public.groups' as tabela,
  COUNT(*) as total_grupos
FROM public.groups;

-- 6. Listar grupos
SELECT 
  id,
  name,
  owner_id,
  created_at
FROM public.groups;

-- 7. Verificar se o Michell está como owner
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM public.memberships m
      JOIN auth.users u ON u.id = m.user_id
      WHERE u.email = 'michellcosta1269@gmail.com' 
      AND m.role = 'owner'
    ) THEN '✅ MICHELL É OWNER'
    ELSE '❌ MICHELL NÃO É OWNER'
  END as status_michell;

-- 8. Verificar se v4.linhares está como diarista
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM public.memberships m
      JOIN auth.users u ON u.id = m.user_id
      WHERE u.email = 'v4.linhares@gmail.com' 
      AND m.role = 'diarista'
    ) THEN '✅ V4.LINHARES É DIARISTA'
    ELSE '❌ V4.LINHARES NÃO É DIARISTA'
  END as status_v4;

-- ============================================
-- FIM - Diagnóstico completo dos usuários
-- ============================================
