-- ============================================
-- Nexus Play - Verificar status do usuário atual
-- Execute este código no Supabase SQL Editor
-- ============================================

-- 1. Verificar se você está logado
SELECT 
  auth.uid() as seu_user_id,
  CASE 
    WHEN auth.uid() IS NULL THEN 'ERRO: Não está logado'
    ELSE 'SUCESSO: Usuário logado'
  END as login_status;

-- 2. Verificar se você é owner do grupo padrão
SELECT 
  g.name as grupo_nome,
  g.owner_id as owner_id,
  auth.uid() as seu_user_id,
  CASE 
    WHEN g.owner_id = auth.uid() THEN 'VOCÊ É O OWNER'
    ELSE 'VOCÊ NÃO É O OWNER'
  END as seu_status
FROM public.groups g
WHERE g.name = 'Grupo Padrão';

-- 3. Verificar se você tem membership no grupo
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

-- 4. Verificar todos os usuários no sistema
SELECT 
  id,
  email,
  created_at
FROM auth.users
ORDER BY created_at;

-- ============================================
-- FIM - Verificação completa
-- ============================================
