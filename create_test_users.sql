-- ============================================
-- Nexus Play - CRIAR USUÁRIOS DE TESTE
-- Executar este código no Supabase SQL Editor
-- ============================================

-- 1. Verificar se há usuários no auth.users
SELECT 
  'Usuários existentes:' as status,
  COUNT(*) as total
FROM auth.users;

-- 2. Listar usuários existentes
SELECT 
  id,
  email,
  created_at
FROM auth.users
ORDER BY created_at;

-- 3. Se não há usuários, vamos criar alguns de teste
-- NOTA: Não podemos criar usuários no auth.users diretamente
-- Mas podemos criar memberships para usuários que já existem

-- 4. Verificar se há grupos
SELECT 
  'Grupos existentes:' as status,
  COUNT(*) as total
FROM public.groups;

-- 5. Criar grupo se não existir
INSERT INTO public.groups (id, name, owner_id, settings, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'Grupo Padrão',
  (SELECT id FROM auth.users LIMIT 1),
  '{}'::jsonb,
  now(),
  now()
WHERE NOT EXISTS (SELECT 1 FROM public.groups WHERE name = 'Grupo Padrão');

-- 6. Atualizar owner_id do grupo
UPDATE public.groups 
SET owner_id = (SELECT id FROM auth.users LIMIT 1)
WHERE name = 'Grupo Padrão';

-- 7. Criar memberships para todos os usuários existentes
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

-- 8. Verificar resultado
SELECT 
  'RESULTADO FINAL:' as status,
  u.email,
  m.role as membership_role,
  g.name as grupo
FROM auth.users u
LEFT JOIN public.memberships m ON m.user_id = u.id
LEFT JOIN public.groups g ON g.id = m.group_id
ORDER BY u.created_at;

-- 9. Se não há usuários, mostrar instruções
SELECT 
  CASE 
    WHEN (SELECT COUNT(*) FROM auth.users) = 0 
    THEN '❌ NENHUM USUÁRIO ENCONTRADO - Faça login com Google primeiro!'
    ELSE '✅ USUÁRIOS ENCONTRADOS - Sistema configurado!'
  END as status_final;

-- ============================================
-- FIM - Sistema configurado ou instruções
-- ============================================
