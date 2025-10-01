-- Forçar login de um usuário existente
-- Execute este script no Supabase SQL Editor

-- 1. Listar usuários disponíveis
SELECT 
  'Usuários disponíveis' as info,
  id,
  email,
  created_at
FROM auth.users 
ORDER BY created_at ASC;

-- 2. Verificar se existe o usuário michellcosta1269@gmail.com
SELECT 
  'Verificando usuário principal' as info,
  id,
  email,
  created_at
FROM auth.users 
WHERE email = 'michellcosta1269@gmail.com';

-- 3. Se não existir, criar um usuário de teste
DO $$
DECLARE
  test_user_id uuid;
  group_id uuid;
BEGIN
  -- Verificar se existe algum usuário
  IF NOT EXISTS (SELECT 1 FROM auth.users LIMIT 1) THEN
    -- Criar um usuário de teste
    INSERT INTO auth.users (id, email, created_at, updated_at)
    VALUES (
      gen_random_uuid(),
      'teste@maestros.com',
      now(),
      now()
    )
    RETURNING id INTO test_user_id;
    
    RAISE NOTICE 'Usuário de teste criado: %', test_user_id;
  ELSE
    -- Pegar o primeiro usuário existente
    SELECT id INTO test_user_id FROM auth.users ORDER BY created_at ASC LIMIT 1;
    RAISE NOTICE 'Usando usuário existente: %', test_user_id;
  END IF;
  
  -- Criar grupo se não existir
  IF NOT EXISTS (SELECT 1 FROM groups LIMIT 1) THEN
    INSERT INTO groups (id, name, owner_id, created_at)
    VALUES (gen_random_uuid(), 'Grupo Padrão', test_user_id, now())
    RETURNING id INTO group_id;
    
    RAISE NOTICE 'Grupo criado: %', group_id;
  ELSE
    SELECT id INTO group_id FROM groups ORDER BY created_at DESC LIMIT 1;
    RAISE NOTICE 'Usando grupo existente: %', group_id;
  END IF;
  
  -- Tornar o usuário owner
  INSERT INTO memberships (user_id, group_id, role, status, created_at)
  VALUES (test_user_id, group_id, 'owner', 'active', now())
  ON CONFLICT (user_id, group_id) DO UPDATE SET
    role = 'owner',
    status = 'active';
    
  RAISE NOTICE 'Usuário % tornado owner', test_user_id;
END $$;

-- 4. Verificar resultado
SELECT 
  'Status final' as info,
  m.user_id,
  m.role,
  m.status,
  au.email,
  g.name as group_name
FROM memberships m
LEFT JOIN auth.users au ON m.user_id = au.id
LEFT JOIN groups g ON m.group_id = g.id
WHERE m.status = 'active'
ORDER BY m.created_at DESC;
