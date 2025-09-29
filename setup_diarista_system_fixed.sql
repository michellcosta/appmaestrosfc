-- ============================================
-- Nexus Play - CONFIGURAR SISTEMA DIARISTA (CORRIGIDO)
-- Executar este código no Supabase SQL Editor
-- ============================================

-- 1. Verificar estrutura das tabelas existentes
SELECT 
  table_name,
  column_name,
  data_type
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name IN ('users', 'memberships', 'groups')
ORDER BY table_name, ordinal_position;

-- 2. Verificar usuários existentes no auth.users
SELECT 
  id,
  email,
  created_at
FROM auth.users
ORDER BY created_at;

-- 3. Verificar memberships existentes
SELECT 
  m.role as membership_role,
  u.email,
  g.name as grupo
FROM public.memberships m
LEFT JOIN auth.users u ON u.id = m.user_id
LEFT JOIN public.groups g ON g.id = m.group_id
ORDER BY u.created_at;

-- 4. Atualizar memberships - todos que NÃO são o Michell para 'diarista'
UPDATE public.memberships 
SET role = 'diarista'
WHERE user_id != (
  SELECT id FROM auth.users 
  WHERE email = 'michellcosta1269@gmail.com' 
  LIMIT 1
);

-- 5. Garantir que o Michell seja owner nas memberships
UPDATE public.memberships 
SET role = 'owner'
WHERE user_id = (
  SELECT id FROM auth.users 
  WHERE email = 'michellcosta1269@gmail.com' 
  LIMIT 1
);

-- 6. Verificar se o grupo tem owner correto
UPDATE public.groups 
SET owner_id = (
  SELECT id FROM auth.users 
  WHERE email = 'michellcosta1269@gmail.com' 
  LIMIT 1
)
WHERE name = 'Grupo Padrão';

-- 7. Verificar resultado final
SELECT 
  u.email,
  m.role as membership_role,
  g.name as grupo,
  g.owner_id,
  CASE 
    WHEN u.email = 'michellcosta1269@gmail.com' THEN '👑 OWNER'
    ELSE '👤 DIARISTA'
  END as status
FROM auth.users u
LEFT JOIN public.memberships m ON m.user_id = u.id
LEFT JOIN public.groups g ON g.id = m.group_id
ORDER BY u.created_at;

-- 8. Verificar se o grupo tem owner correto
SELECT 
  g.name as grupo,
  g.owner_id,
  u.email as owner_email,
  CASE 
    WHEN u.email = 'michellcosta1269@gmail.com' THEN '✅ CORRETO'
    ELSE '❌ INCORRETO'
  END as status_owner
FROM public.groups g
LEFT JOIN auth.users u ON u.id = g.owner_id
WHERE g.name = 'Grupo Padrão';

-- ============================================
-- FIM - Sistema configurado: Michell = Owner, Outros = Diarista
-- ============================================
