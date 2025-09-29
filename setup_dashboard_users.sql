-- ============================================
-- Nexus Play - CONFIGURAR USUÁRIOS NO DASHBOARD
-- Executar este código no Supabase SQL Editor
-- ============================================

-- 1. Verificar usuários existentes
SELECT 
  'Usuários no sistema:' as status,
  COUNT(*) as total
FROM auth.users;

-- 2. Listar usuários
SELECT 
  id,
  email,
  created_at
FROM auth.users
ORDER BY created_at;

-- 3. Criar grupo se não existir
INSERT INTO public.groups (id, name, owner_id, settings, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'Grupo Padrão',
  (SELECT id FROM auth.users LIMIT 1),
  '{}'::jsonb,
  now(),
  now()
WHERE NOT EXISTS (SELECT 1 FROM public.groups WHERE name = 'Grupo Padrão');

-- 4. Atualizar owner_id do grupo
UPDATE public.groups 
SET owner_id = (SELECT id FROM auth.users LIMIT 1)
WHERE name = 'Grupo Padrão';

-- 5. Criar memberships para todos os usuários
INSERT INTO public.memberships (group_id, user_id, role, status, created_at)
SELECT 
  g.id,
  u.id,
  CASE 
    WHEN u.email = 'michellcosta1269@gmail.com' THEN 'owner'
    WHEN u.email = 'v4.linhares@gmail.com' THEN 'diarista'
    ELSE 'diarista'
  END,
  'active',
  now()
FROM auth.users u
CROSS JOIN public.groups g
WHERE g.name = 'Grupo Padrão'
AND NOT EXISTS (
  SELECT 1 FROM public.memberships m 
  WHERE m.group_id = g.id AND m.user_id = u.id
);

-- 6. Garantir que o Michell seja owner
UPDATE public.memberships 
SET role = 'owner'
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'michellcosta1269@gmail.com' LIMIT 1);

-- 7. Garantir que v4.linhares seja diarista
UPDATE public.memberships 
SET role = 'diarista'
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'v4.linhares@gmail.com' LIMIT 1);

-- 8. Garantir que todos os outros sejam diarista
UPDATE public.memberships 
SET role = 'diarista'
WHERE user_id != (SELECT id FROM auth.users WHERE email = 'michellcosta1269@gmail.com' LIMIT 1);

-- 9. Criar carteira para o grupo
INSERT INTO public.wallets (group_id, balance_cents, updated_at)
SELECT id, 0, now()
FROM public.groups
WHERE NOT EXISTS (SELECT 1 FROM public.wallets WHERE group_id = public.groups.id);

-- 10. Verificar resultado final
SELECT 
  '✅ USUÁRIOS CONFIGURADOS PARA O DASHBOARD:' as status,
  u.email,
  m.role as membership_role,
  g.name as grupo,
  CASE 
    WHEN u.email = 'michellcosta1269@gmail.com' THEN '👑 OWNER - Pode alterar cargos'
    WHEN u.email = 'v4.linhares@gmail.com' THEN '👤 DIARISTA - Cargo alterável'
    ELSE '👤 DIARISTA - Cargo alterável'
  END as status_final
FROM auth.users u
LEFT JOIN public.memberships m ON m.user_id = u.id
LEFT JOIN public.groups g ON g.id = m.group_id
ORDER BY u.created_at;

-- 11. Verificar se o sistema está funcionando
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM public.memberships m
      JOIN auth.users u ON u.id = m.user_id
      WHERE u.email = 'michellcosta1269@gmail.com' 
      AND m.role = 'owner'
    ) THEN '✅ SISTEMA PRONTO - Usuários aparecem no dashboard!'
    ELSE '❌ ERRO - Verifique as configurações'
  END as status_sistema;

-- ============================================
-- FIM - Usuários configurados para o dashboard
-- ============================================
