-- ============================================
-- Nexus Play - DEFINIR MICHELL COMO OWNER PRINCIPAL
-- Executar este código no Supabase SQL Editor
-- ============================================

-- 1. Verificar se o usuário Michell existe
SELECT 
  id,
  email,
  created_at
FROM auth.users 
WHERE email = 'michellcosta1269@gmail.com';

-- 2. Definir Michell como owner principal
-- Substitua 'USER_ID_DO_MICHELL' pelo ID real do usuário
UPDATE public.groups 
SET owner_id = (
  SELECT id FROM auth.users 
  WHERE email = 'michellcosta1269@gmail.com' 
  LIMIT 1
)
WHERE name = 'Grupo Padrão';

-- 3. Criar membership para Michell como owner
INSERT INTO public.memberships (group_id, user_id, role)
SELECT 
  g.id,
  u.id,
  'owner'
FROM public.groups g
CROSS JOIN auth.users u
WHERE g.name = 'Grupo Padrão' 
AND u.email = 'michellcosta1269@gmail.com'
ON CONFLICT (group_id, user_id) DO UPDATE SET role = 'owner';

-- 4. Verificar se Michell é o owner
SELECT 
  g.name as grupo,
  g.owner_id,
  u.email as owner_email,
  m.role as membership_role
FROM public.groups g
LEFT JOIN auth.users u ON u.id = g.owner_id
LEFT JOIN public.memberships m ON m.group_id = g.id AND m.user_id = g.owner_id
WHERE g.name = 'Grupo Padrão';

-- 5. Listar todos os usuários e seus roles
SELECT 
  u.email,
  m.role,
  g.name as grupo
FROM auth.users u
LEFT JOIN public.memberships m ON m.user_id = u.id
LEFT JOIN public.groups g ON g.id = m.group_id
ORDER BY u.created_at;

-- ============================================
-- FIM - Michell definido como owner principal
-- ============================================
