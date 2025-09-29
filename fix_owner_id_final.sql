-- ============================================
-- Nexus Play - CORREÇÃO FINAL DO OWNER_ID
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

-- 4. SOLUÇÃO: Atualizar o grupo com um owner_id válido
UPDATE public.groups 
SET owner_id = (SELECT id FROM auth.users LIMIT 1)
WHERE name = 'Grupo Padrão' AND owner_id IS NULL;

-- 5. Verificar se funcionou
SELECT 
  name,
  owner_id,
  CASE 
    WHEN owner_id IS NULL THEN 'ERRO: Ainda é NULL'
    ELSE 'SUCESSO: owner_id definido'
  END as status
FROM public.groups 
WHERE name = 'Grupo Padrão';

-- 6. Criar membership como owner para o usuário atual
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

-- 7. Verificar se você é owner
SELECT 
  g.name as grupo_nome,
  g.owner_id as owner_id,
  auth.uid() as seu_user_id,
  CASE 
    WHEN g.owner_id = auth.uid() THEN 'SUCESSO: VOCÊ É O OWNER'
    ELSE 'INFO: Você não é o owner, mas o sistema está funcionando'
  END as status
FROM public.groups g
WHERE g.name = 'Grupo Padrão';

-- ============================================
-- FIM - Sistema corrigido e pronto
-- ============================================
