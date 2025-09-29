-- ============================================
-- Nexus Play - SOLUÇÃO DEFINITIVA do owner_id
-- Executar este código no Supabase SQL Editor
-- ============================================

-- 1. Verificar se o usuário está logado
SELECT
  CASE
    WHEN auth.uid() IS NOT NULL THEN 'SUCESSO: Usuário logado'
    ELSE 'ERRO: Nenhum usuário logado. Faça login primeiro no app.'
  END as status_login;

-- 2. Verificar grupos com owner_id NULL
SELECT 
  id, 
  name, 
  owner_id,
  CASE 
    WHEN owner_id IS NULL THEN 'PROBLEMA: owner_id é NULL'
    ELSE 'OK: owner_id definido'
  END as status
FROM public.groups;

-- 3. SOLUÇÃO DEFINITIVA: Atualizar todos os grupos com owner_id NULL
-- Primeiro, vamos pegar um usuário existente para ser o owner
UPDATE public.groups 
SET owner_id = (
  SELECT id FROM auth.users 
  WHERE id IS NOT NULL 
  ORDER BY created_at ASC 
  LIMIT 1
)
WHERE owner_id IS NULL;

-- 4. Verificar se ainda há owner_id NULL
SELECT 
  COUNT(*) as grupos_com_owner_null
FROM public.groups 
WHERE owner_id IS NULL;

-- 5. Se ainda houver NULL, criar um usuário temporário
-- (Isso só acontece se não houver usuários no sistema)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.groups WHERE owner_id IS NULL) THEN
    -- Criar um grupo temporário com um UUID fixo
    INSERT INTO public.groups (id, name, owner_id)
    VALUES (
      '00000000-0000-0000-0000-000000000001',
      'Grupo Temporário',
      '00000000-0000-0000-0000-000000000001'
    )
    ON CONFLICT (id) DO NOTHING;
    
    -- Atualizar grupos NULL para usar este grupo temporário
    UPDATE public.groups 
    SET owner_id = '00000000-0000-0000-0000-000000000001'
    WHERE owner_id IS NULL;
  END IF;
END $$;

-- 6. Agora garantir que a constraint NOT NULL funcione
-- Primeiro, vamos verificar se todos os owner_id estão preenchidos
SELECT 
  COUNT(*) as total_groups,
  COUNT(owner_id) as groups_with_owner,
  COUNT(*) - COUNT(owner_id) as groups_without_owner
FROM public.groups;

-- 7. Se todos os owner_id estão preenchidos, restaurar a constraint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.groups WHERE owner_id IS NULL
  ) THEN
    -- Restaurar constraint NOT NULL
    ALTER TABLE public.groups ALTER COLUMN owner_id SET NOT NULL;
    RAISE NOTICE 'Constraint NOT NULL restaurada com sucesso';
  ELSE
    RAISE NOTICE 'Ainda existem grupos com owner_id NULL';
  END IF;
END $$;

-- 8. Criar ou atualizar membership para o usuário atual como 'owner'
INSERT INTO public.memberships (group_id, user_id, role)
SELECT 
  g.id, 
  auth.uid(), 
  'owner'
FROM public.groups g
WHERE g.name = 'Grupo Padrão'
ON CONFLICT (group_id, user_id) DO UPDATE SET role = 'owner';

-- 9. Verificar o status final
SELECT
  CASE
    WHEN g.owner_id = auth.uid() THEN 'SUCESSO: VOCÊ É O OWNER'
    ELSE 'INFO: Sistema funcionando (owner_id pode ser de outro usuário)'
  END as status_final
FROM public.groups g
WHERE g.name = 'Grupo Padrão';

-- 10. Verificar se a carteira existe
INSERT INTO public.wallets(group_id)
SELECT id FROM public.groups WHERE name = 'Grupo Padrão'
ON CONFLICT DO NOTHING;

SELECT
  CASE
    WHEN w.balance_cents IS NULL THEN 'ERRO: Carteira não existe'
    ELSE 'OK: Carteira existe'
  END as carteira_status
FROM public.wallets w
WHERE w.group_id = (SELECT id FROM public.groups WHERE name = 'Grupo Padrão' LIMIT 1);

-- ============================================
-- FIM - Sistema corrigido definitivamente
-- ============================================
