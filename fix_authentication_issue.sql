-- Verificar e corrigir problema de autenticação
-- Execute este script no Supabase SQL Editor

-- 1. Verificar usuários existentes
SELECT 
  'Usuários existentes' as info,
  id,
  email,
  created_at
FROM auth.users 
ORDER BY created_at DESC 
LIMIT 5;

-- 2. Verificar grupos existentes
SELECT 
  'Grupos existentes' as info,
  id,
  name,
  owner_id,
  created_at
FROM groups 
ORDER BY created_at DESC;

-- 3. Verificar memberships existentes
SELECT 
  'Memberships existentes' as info,
  user_id,
  group_id,
  role,
  status,
  created_at
FROM memberships 
ORDER BY created_at DESC;

-- 4. Verificar se existe um owner principal
SELECT 
  'Owner principal' as info,
  m.user_id,
  m.role,
  au.email,
  m.created_at
FROM memberships m
LEFT JOIN auth.users au ON m.user_id = au.id
WHERE m.role = 'owner'
ORDER BY m.created_at ASC
LIMIT 1;

-- 5. Se não houver owner, criar um
DO $$
DECLARE
  owner_count integer;
  first_user_id uuid;
BEGIN
  -- Verificar se existe algum owner
  SELECT COUNT(*) INTO owner_count FROM memberships WHERE role = 'owner';
  
  IF owner_count = 0 THEN
    -- Pegar o primeiro usuário disponível
    SELECT id INTO first_user_id FROM auth.users ORDER BY created_at ASC LIMIT 1;
    
    IF first_user_id IS NOT NULL THEN
      -- Criar um grupo se não existir
      IF NOT EXISTS (SELECT 1 FROM groups LIMIT 1) THEN
        INSERT INTO groups (id, name, owner_id, created_at)
        VALUES (gen_random_uuid(), 'Grupo Padrão', first_user_id, now());
      END IF;
      
      -- Tornar o primeiro usuário owner
      INSERT INTO memberships (user_id, group_id, role, status, created_at)
      SELECT 
        first_user_id,
        g.id,
        'owner',
        'active',
        now()
      FROM groups g
      ORDER BY g.created_at DESC
      LIMIT 1
      ON CONFLICT (user_id, group_id) DO UPDATE SET
        role = 'owner',
        status = 'active';
      
      RAISE NOTICE 'Owner criado para usuário: %', first_user_id;
    ELSE
      RAISE NOTICE 'Nenhum usuário encontrado para tornar owner';
    END IF;
  ELSE
    RAISE NOTICE 'Owner já existe';
  END IF;
END $$;

-- 6. Verificar resultado final
SELECT 
  'Status final' as info,
  COUNT(*) as total_memberships,
  COUNT(CASE WHEN role = 'owner' THEN 1 END) as owners,
  COUNT(CASE WHEN role = 'admin' THEN 1 END) as admins,
  COUNT(CASE WHEN role = 'auxiliar' THEN 1 END) as auxiliares,
  COUNT(CASE WHEN role = 'diarista' THEN 1 END) as diaristas
FROM memberships 
WHERE status = 'active';
