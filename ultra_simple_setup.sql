-- ============================================
-- Nexus Play - SETUP ULTRA SIMPLES
-- Copie e cole TUDO no Supabase SQL Editor
-- ============================================

-- 1. Criar grupo se não existir
INSERT INTO public.groups (id, name, owner_id, settings, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'Grupo Padrão',
  (SELECT id FROM auth.users LIMIT 1),
  '{}'::jsonb,
  now(),
  now()
WHERE NOT EXISTS (SELECT 1 FROM public.groups WHERE name = 'Grupo Padrão');

-- 2. Atualizar owner_id
UPDATE public.groups 
SET owner_id = (SELECT id FROM auth.users LIMIT 1)
WHERE name = 'Grupo Padrão';

-- 3. Criar memberships para todos os usuários
INSERT INTO public.memberships (group_id, user_id, role, status, created_at)
SELECT 
  g.id,
  u.id,
  CASE 
    WHEN u.email = 'michellcosta1269@gmail.com' THEN 'owner'
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

-- 4. Criar carteira
INSERT INTO public.wallets (group_id, balance_cents, updated_at)
SELECT id, 0, now()
FROM public.groups
WHERE NOT EXISTS (SELECT 1 FROM public.wallets WHERE group_id = public.groups.id);

-- 5. Mostrar resultado
SELECT 
  '✅ SISTEMA CONFIGURADO!' as status,
  u.email,
  m.role,
  'Usuários aparecem no app agora!' as mensagem
FROM auth.users u
LEFT JOIN public.memberships m ON m.user_id = u.id
ORDER BY u.created_at;

-- ============================================
-- FIM - Execute este script e pronto!
-- ============================================
