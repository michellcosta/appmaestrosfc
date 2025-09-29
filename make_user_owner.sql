-- ============================================
-- Nexus Play - Tornar usuário atual como owner
-- Execute este código no Supabase SQL Editor
-- ============================================

-- 1. Atualizar o grupo padrão para você ser o owner
UPDATE public.groups 
SET owner_id = auth.uid()
WHERE name = 'Grupo Padrão';

-- 2. Criar membership como owner
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

-- 3. Verificar se funcionou
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

-- ============================================
-- FIM - Usuário agora é owner
-- ============================================
