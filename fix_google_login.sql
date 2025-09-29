-- ============================================
-- Nexus Play - CORREÇÃO DEFINITIVA DO LOGIN GOOGLE
-- Execute este código no Supabase SQL Editor
-- ============================================

-- 1. Verificar estrutura atual
SELECT 'Verificando estrutura...' as status;

-- 2. Verificar se auth.uid() está funcionando
SELECT 
  (auth.uid()) IS NULL AS uid_is_null, 
  auth.uid() AS uid;

-- 3. Verificar se há usuários no auth.users
SELECT COUNT(*) as total_users FROM auth.users;

-- 4. Verificar se há grupos
SELECT COUNT(*) as total_groups FROM public.groups;

-- 5. Verificar se há carteiras
SELECT COUNT(*) as total_wallets FROM public.wallets;

-- 6. SOLUÇÃO DEFINITIVA: Remover constraint temporariamente
ALTER TABLE public.groups ALTER COLUMN owner_id DROP NOT NULL;

-- 7. Inserir grupo padrão com owner_id NULL
INSERT INTO public.groups(name, owner_id) 
VALUES ('Grupo Padrão', NULL)
ON CONFLICT DO NOTHING;

-- 8. Atualizar o grupo com um owner_id válido (primeiro usuário)
UPDATE public.groups 
SET owner_id = (SELECT id FROM auth.users LIMIT 1)
WHERE name = 'Grupo Padrão' AND owner_id IS NULL;

-- 9. Restaurar constraint NOT NULL
ALTER TABLE public.groups ALTER COLUMN owner_id SET NOT NULL;

-- 10. Criar carteira para o grupo
INSERT INTO public.wallets(group_id) 
SELECT id FROM public.groups WHERE name = 'Grupo Padrão'
ON CONFLICT DO NOTHING;

-- 11. Verificar resultado final
SELECT 'Após correções:' as status;
SELECT COUNT(*) as total_groups FROM public.groups;
SELECT COUNT(*) as total_wallets FROM public.wallets;
SELECT name, owner_id FROM public.groups WHERE name = 'Grupo Padrão';

-- 12. Verificar se o owner_id não é mais NULL
SELECT 
  CASE 
    WHEN owner_id IS NULL THEN 'ERRO: owner_id ainda é NULL'
    ELSE 'SUCESSO: owner_id definido corretamente'
  END as status
FROM public.groups 
WHERE name = 'Grupo Padrão';

-- ============================================
-- FIM - Sistema corrigido e pronto para uso
-- ============================================
