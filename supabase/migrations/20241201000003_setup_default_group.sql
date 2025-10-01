-- Configurar grupo padrão e dados de teste
-- Esta migração cria um grupo padrão e adiciona alguns membros de teste

-- 1. Criar grupo padrão se não existir
INSERT INTO groups (id, name, owner_id, settings)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Maestros FC',
  (SELECT id FROM auth.users LIMIT 1),
  '{"venue": {"name": "Campo do Maestros", "address": "Rua do Futebol, 123"}}'::jsonb
) ON CONFLICT (id) DO NOTHING;

-- 2. Criar carteira para o grupo padrão
INSERT INTO wallets (group_id, balance_cents)
VALUES ('00000000-0000-0000-0000-000000000001', 0)
ON CONFLICT (group_id) DO NOTHING;

-- 3. Adicionar o primeiro usuário como owner se não existir membership
INSERT INTO memberships (group_id, user_id, role, status)
SELECT 
  '00000000-0000-0000-0000-000000000001',
  id,
  'owner',
  'active'
FROM auth.users 
WHERE id NOT IN (
  SELECT user_id FROM memberships 
  WHERE group_id = '00000000-0000-0000-0000-000000000001'
)
LIMIT 1
ON CONFLICT (group_id, user_id) DO NOTHING;

-- 4. Adicionar alguns membros de teste se não existirem
INSERT INTO memberships (group_id, user_id, role, status)
SELECT 
  '00000000-0000-0000-0000-000000000001',
  gen_random_uuid(),
  'diarista',
  'active'
FROM generate_series(1, 3)
WHERE NOT EXISTS (
  SELECT 1 FROM memberships 
  WHERE group_id = '00000000-0000-0000-0000-000000000001'
)
ON CONFLICT (group_id, user_id) DO NOTHING;
