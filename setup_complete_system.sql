-- ============================================
-- Nexus Play - SETUP COMPLETO AUTOMÁTICO
-- Executar este código no Supabase SQL Editor
-- ============================================

-- 1. Verificar estrutura inicial
SELECT 'INICIANDO SETUP COMPLETO...' as status;

-- 2. Criar grupos se não existirem
INSERT INTO public.groups (id, name, owner_id, settings, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'Grupo Padrão',
  (SELECT id FROM auth.users WHERE email = 'michellcosta1269@gmail.com' LIMIT 1),
  '{}'::jsonb,
  now(),
  now()
WHERE NOT EXISTS (SELECT 1 FROM public.groups WHERE name = 'Grupo Padrão');

-- 3. Atualizar owner_id do grupo para o Michell
UPDATE public.groups 
SET owner_id = (SELECT id FROM auth.users WHERE email = 'michellcosta1269@gmail.com' LIMIT 1)
WHERE name = 'Grupo Padrão';

-- 4. Criar memberships para todos os usuários
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

-- 5. Garantir que o Michell seja owner
UPDATE public.memberships 
SET role = 'owner'
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'michellcosta1269@gmail.com' LIMIT 1);

-- 6. Garantir que v4.linhares seja diarista
UPDATE public.memberships 
SET role = 'diarista'
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'v4.linhares@gmail.com' LIMIT 1);

-- 7. Garantir que todos os outros sejam diarista
UPDATE public.memberships 
SET role = 'diarista'
WHERE user_id != (SELECT id FROM auth.users WHERE email = 'michellcosta1269@gmail.com' LIMIT 1);

-- 8. Criar carteiras para grupos
INSERT INTO public.wallets (group_id, balance_cents, updated_at)
SELECT id, 0, now()
FROM public.groups
WHERE NOT EXISTS (SELECT 1 FROM public.wallets WHERE group_id = public.groups.id);

-- 9. Verificar resultado final
SELECT 
  'RESULTADO FINAL:' as status,
  u.email,
  m.role as membership_role,
  g.name as grupo,
  CASE 
    WHEN u.email = 'michellcosta1269@gmail.com' THEN '👑 OWNER'
    WHEN u.email = 'v4.linhares@gmail.com' THEN '👤 DIARISTA (V4)'
    ELSE '👤 DIARISTA'
  END as status_final
FROM auth.users u
LEFT JOIN public.memberships m ON m.user_id = u.id
LEFT JOIN public.groups g ON g.id = m.group_id
ORDER BY u.created_at;

-- 10. Verificar se o sistema está funcionando
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM public.memberships m
      JOIN auth.users u ON u.id = m.user_id
      WHERE u.email = 'michellcosta1269@gmail.com' 
      AND m.role = 'owner'
    ) THEN '✅ SISTEMA CONFIGURADO CORRETAMENTE'
    ELSE '❌ ERRO NA CONFIGURAÇÃO'
  END as status_sistema;

-- ============================================
-- FIM - Sistema configurado automaticamente
-- ============================================
