-- ============================================
-- Nexus Play - CONFIGURAR SISTEMA DIARISTA
-- Executar este código no Supabase SQL Editor
-- ============================================

-- 1. Verificar usuários existentes
SELECT 
  u.email,
  u.role,
  m.role as membership_role,
  g.name as grupo
FROM auth.users u
LEFT JOIN public.memberships m ON m.user_id = u.id
LEFT JOIN public.groups g ON g.id = m.group_id
ORDER BY u.created_at;

-- 2. Atualizar todos os usuários que NÃO são o Michell para 'diarista'
UPDATE public.memberships 
SET role = 'diarista'
WHERE user_id != (
  SELECT id FROM auth.users 
  WHERE email = 'michellcosta1269@gmail.com' 
  LIMIT 1
);

-- 3. Garantir que o Michell seja owner
UPDATE public.memberships 
SET role = 'owner'
WHERE user_id = (
  SELECT id FROM auth.users 
  WHERE email = 'michellcosta1269@gmail.com' 
  LIMIT 1
);

-- 4. Atualizar a tabela users também
UPDATE public.users 
SET role = 'diarista'
WHERE email != 'michellcosta1269@gmail.com';

UPDATE public.users 
SET role = 'owner'
WHERE email = 'michellcosta1269@gmail.com';

-- 5. Verificar resultado final
SELECT 
  u.email,
  u.role as user_role,
  m.role as membership_role,
  g.name as grupo,
  CASE 
    WHEN u.email = 'michellcosta1269@gmail.com' THEN '👑 OWNER'
    ELSE '👤 DIARISTA'
  END as status
FROM auth.users u
LEFT JOIN public.memberships m ON m.user_id = u.id
LEFT JOIN public.groups g ON g.id = m.group_id
ORDER BY u.created_at;

-- 6. Verificar se o grupo tem owner correto
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
