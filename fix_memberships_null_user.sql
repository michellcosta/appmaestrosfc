-- ============================================
-- Nexus Play - CORREÇÃO do user_id NULL em memberships
-- Executar este código no Supabase SQL Editor
-- ============================================

-- 1. Verificar se o usuário está logado
SELECT
  CASE
    WHEN auth.uid() IS NOT NULL THEN 'SUCESSO: Usuário logado'
    ELSE 'ERRO: Nenhum usuário logado. Faça login primeiro no app.'
  END as status_login;

-- 2. Verificar se há usuários no sistema
SELECT 
  COUNT(*) as total_users,
  MIN(created_at) as primeiro_usuario,
  MAX(created_at) as ultimo_usuario
FROM auth.users;

-- 3. Listar usuários existentes
SELECT 
  id,
  email,
  created_at
FROM auth.users
ORDER BY created_at ASC
LIMIT 5;

-- 4. Verificar grupos existentes
SELECT 
  id,
  name,
  owner_id,
  CASE 
    WHEN owner_id IS NULL THEN 'PROBLEMA: owner_id é NULL'
    ELSE 'OK: owner_id definido'
  END as status
FROM public.groups;

-- 5. CORREÇÃO: Atualizar grupos com owner_id NULL usando um usuário existente
UPDATE public.groups 
SET owner_id = (
  SELECT id FROM auth.users 
  WHERE id IS NOT NULL 
  ORDER BY created_at ASC 
  LIMIT 1
)
WHERE owner_id IS NULL;

-- 6. Verificar se ainda há owner_id NULL
SELECT 
  COUNT(*) as grupos_com_owner_null
FROM public.groups 
WHERE owner_id IS NULL;

-- 7. Se ainda houver NULL, criar um grupo com owner_id fixo
DO $$
DECLARE
  first_user_id uuid;
BEGIN
  -- Pegar o primeiro usuário disponível
  SELECT id INTO first_user_id FROM auth.users LIMIT 1;
  
  IF first_user_id IS NOT NULL THEN
    -- Atualizar grupos NULL para usar este usuário
    UPDATE public.groups 
    SET owner_id = first_user_id
    WHERE owner_id IS NULL;
    
    RAISE NOTICE 'Grupos atualizados com usuário: %', first_user_id;
  ELSE
    RAISE NOTICE 'Nenhum usuário encontrado no sistema';
  END IF;
END $$;

-- 8. Agora restaurar a constraint NOT NULL se todos os owner_id estão preenchidos
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

-- 9. CORREÇÃO: Criar membership apenas se o usuário estiver logado
-- Se não estiver logado, vamos criar uma membership temporária
DO $$
DECLARE
  current_user_id uuid;
  default_group_id uuid;
BEGIN
  -- Verificar se há usuário logado
  current_user_id := auth.uid();
  
  -- Pegar o ID do grupo padrão
  SELECT id INTO default_group_id FROM public.groups WHERE name = 'Grupo Padrão' LIMIT 1;
  
  IF current_user_id IS NOT NULL AND default_group_id IS NOT NULL THEN
    -- Usuário logado: criar membership normal
    INSERT INTO public.memberships (group_id, user_id, role)
    VALUES (default_group_id, current_user_id, 'owner')
    ON CONFLICT (group_id, user_id) DO UPDATE SET role = 'owner';
    
    RAISE NOTICE 'Membership criada para usuário logado: %', current_user_id;
  ELSE
    -- Usuário não logado: criar membership com primeiro usuário disponível
    SELECT id INTO current_user_id FROM auth.users ORDER BY created_at ASC LIMIT 1;
    
    IF current_user_id IS NOT NULL AND default_group_id IS NOT NULL THEN
      INSERT INTO public.memberships (group_id, user_id, role)
      VALUES (default_group_id, current_user_id, 'owner')
      ON CONFLICT (group_id, user_id) DO UPDATE SET role = 'owner';
      
      RAISE NOTICE 'Membership criada para primeiro usuário: %', current_user_id;
    ELSE
      RAISE NOTICE 'Não foi possível criar membership: usuário ou grupo não encontrado';
    END IF;
  END IF;
END $$;

-- 10. Verificar o status final
SELECT
  CASE
    WHEN g.owner_id = auth.uid() THEN 'SUCESSO: VOCÊ É O OWNER'
    ELSE 'INFO: Sistema funcionando (owner_id pode ser de outro usuário)'
  END as status_final
FROM public.groups g
WHERE g.name = 'Grupo Padrão';

-- 11. Verificar memberships criadas
SELECT 
  m.role,
  m.status,
  u.email,
  g.name as group_name
FROM public.memberships m
JOIN public.groups g ON g.id = m.group_id
LEFT JOIN auth.users u ON u.id = m.user_id
WHERE g.name = 'Grupo Padrão';

-- 12. Verificar se a carteira existe
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
-- FIM - Sistema corrigido sem erros de NULL
-- ============================================
