-- ============================================
-- Nexus Play - MUDAR USUÁRIO PARA DIARISTA
-- Executar este código no Supabase SQL Editor
-- ============================================

-- 1. Verificar se o usuário existe
SELECT 
  id,
  email,
  created_at
FROM auth.users 
WHERE email = 'v4.linhares@gmail.com';

-- 2. Verificar role atual nas memberships
SELECT 
  m.role as membership_role,
  u.email,
  g.name as grupo
FROM public.memberships m
LEFT JOIN auth.users u ON u.id = m.user_id
LEFT JOIN public.groups g ON g.id = m.group_id
WHERE u.email = 'v4.linhares@gmail.com';

-- 3. MUDAR PARA DIARISTA - Atualizar membership
UPDATE public.memberships 
SET role = 'diarista'
WHERE user_id = (
  SELECT id FROM auth.users 
  WHERE email = 'v4.linhares@gmail.com' 
  LIMIT 1
);

-- 4. Verificar se a mudança foi feita
SELECT 
  m.role as membership_role,
  u.email,
  g.name as grupo,
  '👤 DIARISTA' as status
FROM public.memberships m
LEFT JOIN auth.users u ON u.id = m.user_id
LEFT JOIN public.groups g ON g.id = m.group_id
WHERE u.email = 'v4.linhares@gmail.com';

-- 5. Verificar todos os usuários e seus roles
SELECT 
  u.email,
  m.role as membership_role,
  g.name as grupo,
  CASE 
    WHEN u.email = 'michellcosta1269@gmail.com' THEN '👑 OWNER'
    WHEN u.email = 'v4.linhares@gmail.com' THEN '👤 DIARISTA (ATUALIZADO)'
    ELSE '👤 DIARISTA'
  END as status
FROM auth.users u
LEFT JOIN public.memberships m ON m.user_id = u.id
LEFT JOIN public.groups g ON g.id = m.group_id
ORDER BY u.created_at;

-- ============================================
-- FIM - v4.linhares@gmail.com mudado para DIARISTA
-- ============================================
