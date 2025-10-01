-- Testar autenticação e permissões
-- Execute este script no Supabase SQL Editor

-- 1. Verificar usuário atual
SELECT 
  'Usuário atual' as info,
  auth.uid() as current_user_id,
  auth.email() as current_email,
  auth.role() as current_role;

-- 2. Verificar se o usuário atual tem permissões
SELECT 
  'Permissões do usuário atual' as info,
  m.user_id,
  m.role,
  m.status,
  g.name as group_name
FROM memberships m
LEFT JOIN groups g ON m.group_id = g.id
WHERE m.user_id = auth.uid()
  AND m.status = 'active';

-- 3. Verificar se pode gerenciar jogadores
SELECT 
  'Pode gerenciar jogadores' as info,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM memberships 
      WHERE user_id = auth.uid() 
        AND role IN ('owner', 'admin', 'auxiliar')
        AND status = 'active'
    ) THEN 'SIM'
    ELSE 'NÃO'
  END as can_manage_players;

-- 4. Listar todos os membros (se tiver permissão)
SELECT 
  'Todos os membros' as info,
  m.user_id,
  m.role,
  m.status,
  au.email,
  pp.name,
  pp.position_text,
  pp.shirt_size
FROM memberships m
LEFT JOIN auth.users au ON m.user_id = au.id
LEFT JOIN player_profiles pp ON m.user_id = pp.user_id
WHERE m.status = 'active'
ORDER BY m.created_at DESC;
