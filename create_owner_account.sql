-- ============================================
-- Nexus Play - CRIAR CONTA OWNER
-- Execute este código no Supabase SQL Editor
-- ============================================

-- 1. Verificar se você está logado
SELECT 
  auth.uid() as seu_user_id,
  CASE 
    WHEN auth.uid() IS NULL THEN 'ERRO: Não está logado'
    ELSE 'SUCESSO: Usuário logado'
  END as login_status;

-- 2. Verificar se há usuários no sistema
SELECT COUNT(*) as total_users FROM auth.users;

-- 3. Verificar o estado atual do grupo
SELECT 
  name,
  owner_id,
  CASE 
    WHEN owner_id IS NULL THEN 'ERRO: owner_id é NULL'
    ELSE 'OK: owner_id definido'
  END as status
FROM public.groups 
WHERE name = 'Grupo Padrão';

-- 4. SOLUÇÃO: Tornar você o owner do grupo
UPDATE public.groups 
SET owner_id = auth.uid()
WHERE name = 'Grupo Padrão';

-- 5. Criar membership como owner para você
INSERT INTO public.memberships (group_id, user_id, role, status)
SELECT 
  g.id,
  auth.uid(),
  'owner',
  'active'
FROM public.groups g
WHERE g.name = 'Grupo Padrão'
ON CONFLICT (group_id, user_id) 
DO UPDATE SET 
  role = 'owner',
  status = 'active';

-- 6. Verificar se funcionou
SELECT 
  g.name as grupo_nome,
  g.owner_id as owner_id,
  auth.uid() as seu_user_id,
  CASE 
    WHEN g.owner_id = auth.uid() THEN 'SUCESSO: VOCÊ É O OWNER'
    ELSE 'ERRO: Ainda não é owner'
  END as status
FROM public.groups g
WHERE g.name = 'Grupo Padrão';

-- 7. Verificar sua membership
SELECT 
  m.role as sua_funcao,
  m.status as seu_status,
  CASE 
    WHEN m.role = 'owner' THEN 'VOCÊ É OWNER'
    WHEN m.role = 'admin' THEN 'VOCÊ É ADMIN'
    WHEN m.role = 'aux' THEN 'VOCÊ É AUXILIAR'
    ELSE 'VOCÊ É MEMBRO COMUM'
  END as sua_posicao
FROM public.memberships m
WHERE m.user_id = auth.uid()
AND m.group_id = (SELECT id FROM public.groups WHERE name = 'Grupo Padrão' LIMIT 1);

-- 8. Verificar carteira do grupo
SELECT 
  w.group_id,
  w.balance_cents,
  CASE 
    WHEN w.balance_cents IS NULL THEN 'ERRO: Carteira não existe'
    ELSE 'OK: Carteira existe'
  END as carteira_status
FROM public.wallets w
WHERE w.group_id = (SELECT id FROM public.groups WHERE name = 'Grupo Padrão' LIMIT 1);

-- ============================================
-- FIM - Sua conta owner foi criada
-- ============================================
