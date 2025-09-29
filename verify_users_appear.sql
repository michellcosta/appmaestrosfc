-- ============================================
-- Nexus Play - VERIFICAR SE USUÁRIOS APARECEM
-- Executar este código no Supabase SQL Editor
-- ============================================

-- 1. Verificar se há usuários
SELECT 
  'Total de usuários:' as info,
  COUNT(*) as total
FROM auth.users;

-- 2. Listar todos os usuários
SELECT 
  'Usuários encontrados:' as info,
  u.email,
  u.created_at
FROM auth.users u
ORDER BY u.created_at;

-- 3. Verificar se há grupos
SELECT 
  'Grupos encontrados:' as info,
  COUNT(*) as total
FROM public.groups;

-- 4. Listar grupos
SELECT 
  'Grupos:' as info,
  g.name,
  g.owner_id,
  u.email as owner_email
FROM public.groups g
LEFT JOIN auth.users u ON u.id = g.owner_id;

-- 5. Verificar memberships
SELECT 
  'Memberships encontradas:' as info,
  COUNT(*) as total
FROM public.memberships;

-- 6. Listar memberships com detalhes
SELECT 
  'Memberships:' as info,
  u.email,
  m.role,
  g.name as grupo
FROM public.memberships m
LEFT JOIN auth.users u ON u.id = m.user_id
LEFT JOIN public.groups g ON g.id = m.group_id
ORDER BY u.created_at;

-- 7. Verificar se o Michell é owner
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

-- 8. Verificar se v4.linhares é diarista
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

-- 9. Status final do sistema
SELECT 
  CASE 
    WHEN (SELECT COUNT(*) FROM auth.users) > 0 
    AND (SELECT COUNT(*) FROM public.groups) > 0 
    AND (SELECT COUNT(*) FROM public.memberships) > 0
    THEN '✅ SISTEMA CONFIGURADO - Usuários devem aparecer no app!'
    ELSE '❌ SISTEMA INCOMPLETO - Execute setup_dashboard_users.sql primeiro!'
  END as status_final;

-- ============================================
-- FIM - Verificação completa do sistema
-- ============================================
