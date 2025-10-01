-- Migrar dados existentes para a nova estrutura
-- Execute este script no Supabase SQL Editor

-- 1. Criar perfis para jogadores existentes que não têm perfil
INSERT INTO player_profiles (user_id, name, position_text, shirt_size, stars, approved)
SELECT 
  m.user_id,
  COALESCE(au.email::text, 'Usuário') as name,
  'Meia' as position_text,
  'G' as shirt_size,
  5 as stars,
  true as approved
FROM memberships m
LEFT JOIN auth.users au ON m.user_id = au.id
LEFT JOIN player_profiles pp ON m.user_id = pp.user_id
WHERE m.status = 'active' 
  AND pp.user_id IS NULL;

-- 2. Verificar quantos perfis foram criados
SELECT 
  'Perfis criados' as info,
  COUNT(*) as total_perfis
FROM player_profiles;

-- 3. Testar a função atualizada
SELECT 
  'Testando função atualizada' as info,
  COUNT(*) as total_jogadores
FROM get_all_memberships();

-- 4. Verificar dados de um jogador específico
SELECT 
  'Dados de exemplo' as info,
  *
FROM get_all_memberships()
LIMIT 3;
